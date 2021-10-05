
/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { addLayer, updateNode } from '@mapstore/framework/actions/layers';
import { zoomToExtent } from '@mapstore/framework/actions/map';
import axios from '@mapstore/framework/libs/ajax';
import {
    ADD_FGJSON_LAYER_FROM_URL,
    UPDATE_FGJSON_LAYER
} from '@js/actions/fgjson';
import turfBbox from '@turf/bbox';
import chroma from 'chroma-js';
import { getAvailableCRS, reprojectGeoJson } from '@mapstore/framework/utils/CoordinatesUtils';
import { setControlProperty, SET_CONTROL_PROPERTY } from '@mapstore/framework/actions/controls';
import { getTimelineRange } from '@js/selectors/timelinefilter';
import moment from 'moment';
import * as momentRange from 'moment-range';
import { layersSelector } from '@mapstore/framework/selectors/layers';
momentRange.extendMoment(moment);

function isCRSAvailable(crs) {
    const availableCRS = getAvailableCRS();
    return availableCRS[crs || 'CRS84'];
}

function parseCRSString(crsString) {
    if (!crsString) return '';
    const cleanString = crsString.replace(/\<|\>/g, '').split('/');
    const code = cleanString[cleanString.length - 1];
    // const version = cleanString[cleanString.length - 2];
    const name = cleanString[cleanString.length - 3];
    return `${name === 'EPSG' ? 'EPSG:' : ''}${code}`;
}

function isSupportedWhere(geometry) {
    return [
        'Point',
        'LineString',
        'Polygon',
        'MultiPoint',
        'MultiLineString',
        'MultiPolygon',
        'GeometryCollection'
    ].includes(geometry?.type);
}

function fgJSONToGeoJSON(collection, crs) {

    const features = collection.features.map((feature) => ({
        ...feature,
        geometry: feature.where && isSupportedWhere(feature.where) ? feature.where : feature.geometry,
        type: 'Feature'
    }));

    const parsedCollection = {
        ...collection,
        type: 'FeatureCollection',
        features
    };

    if (crs !== 'CRS84' && crs !== 'EPSG:4326') {
        return reprojectGeoJson(JSON.parse(JSON.stringify(parsedCollection)), crs, 'CRS84');
    }

    // we need to handle the axis order with a special ref system
    // EPSG:4326 is used internally similarly to CRS84 (need fix)
    if (crs === 'EPSG:4326') {
        return reprojectGeoJson(JSON.parse(JSON.stringify(parsedCollection)), 'EPSG:4326_neu', 'CRS84');
    }

    return parsedCollection;
}

function parseCollection(collection, headerCRS) {
    const crs = headerCRS || 'CRS84';

    let reprojectedCollection;
    if (collection?.features?.find((feature) => feature['coord-ref-sys'])) {
        reprojectedCollection = {
            ...collection,
            features: collection?.features?.map((feature) => {
                const featureCrs = parseCRSString(feature['coord-ref-sys']) || crs;
                if (!isCRSAvailable(featureCrs)) {
                    return null;
                }
                try {
                    const tmpCollection = fgJSONToGeoJSON({ type: 'FeatureCollection', features: [ feature ] }, featureCrs);
                    return tmpCollection.features[0];
                } catch (e) {
                    return null;
                }
            }).filter(feature => feature)
        };
    } else {
        reprojectedCollection = fgJSONToGeoJSON(collection, crs);
    }
    const bbox = turfBbox(reprojectedCollection);
    return {
        bbox,
        collection,
        features: reprojectedCollection?.features || []
    };
}

function getFJGSONRefSystem(collection) {
    if (collection['coord-ref-sys']) {
        return parseCRSString(collection['coord-ref-sys']);
    }
    return null;
}

function getFilteredFeatures(state, features) {
    const timelineRange = getTimelineRange(state);
    if (timelineRange) {
        const range = moment().range(timelineRange.start, timelineRange.end);
        return features.filter(({ when }) => {
            const interval = when?.interval;

            if (interval) {
                const iRange = moment().range(interval[0], interval[1]);
                return (
                    range.contains(moment(interval[0]))
                    || range.contains(moment(interval[1]))
                    || iRange.contains(moment(timelineRange.start))
                    || iRange.contains(moment(timelineRange.end))
                );
            }
            const instant = when?.instant;
            if (instant) {
                return range.contains(moment(instant));
            }
            return true;
        });
    }
    return features;
}

function requestFallback(href) {
    return href ? axios.get(href).then((res) => res.data).catch(() => null) : new Promise(resolve => resolve(href));
}

const addFGJSONLayerEpic = (action$, store) =>
    action$.ofType(ADD_FGJSON_LAYER_FROM_URL)
        .switchMap((action) => {
            const collectionUrl = (action?.properties?.links?.find((link) => link.rel === 'self') || {}).href;
            const DEFAULT_LIMIT = 50;
            return Observable.defer(() => axios.all([
                axios.get(action.layerUrl, { params: { limit: DEFAULT_LIMIT }}),
                axios.get(collectionUrl)
                    .then(({ data }) => {
                        const queryablesHref = (data.links?.find((link) => link.rel.indexOf('queryables') !== -1) || {}).href;
                        const schemaItemHref = (data.links?.find((link) => link.rel.indexOf('schema-item') !== -1) || {}).href;
                        const schemaCollectionHref = (data.links?.find((link) => link.rel.indexOf('schema-collection') !== -1) || {}).href;
                        return axios.all([
                            requestFallback(queryablesHref),
                            requestFallback(schemaItemHref),
                            requestFallback(schemaCollectionHref)
                        ]);
                    })
                    .catch(() => null)
            ]))
                .switchMap(([{ data, headers }, info]) => {
                    const [ queryables, schemaItem, schemaCollection ] = info || [];
                    const crs = getFJGSONRefSystem(data) || parseCRSString(headers['content-crs']);
                    if (!isCRSAvailable(crs)) {
                        return Observable.of(
                            setControlProperty('viewer', 'loading', false)
                        );
                    }
                    const { collection, features, bbox } = parseCollection(data, crs);
                    return Observable.of(
                        addLayer({
                            type: 'fgJson',
                            originalFeatures: features,
                            features: getFilteredFeatures(store.getState(), features),
                            url: action.layerUrl,
                            name: action?.properties?.title || action?.properties?.id || '',
                            title: action?.properties?.title || action?.properties?.id || '',
                            availableCrs: action?.properties?.crs,
                            visibility: true,
                            isVector: true,
                            collection,
                            queryables,
                            schemaItem,
                            schemaCollection,
                            style: {
                                fillColor: chroma.random().hex(),
                                fillOpacity: 0.8,
                                color: chroma.random().hex(),
                                opacity: 0.8,
                                weight: 2
                            },
                            ogcProperties: action?.properties || {},
                            params: {
                                limit: DEFAULT_LIMIT
                            },
                            bbox: {
                                bounds: {
                                    minx: bbox[0],
                                    miny: bbox[1],
                                    maxx: bbox[2],
                                    maxy: bbox[3]
                                },
                                crs: 'CRS84'
                            }
                        }),
                        zoomToExtent(bbox, 'CRS84'),
                        setControlProperty('toc', 'enabled', true),
                        setControlProperty('viewer', 'loading', false)
                    );
                })
                .catch(() => {
                    return Observable.of(
                        setControlProperty('viewer', 'loading', false)
                    );
                })
                .startWith(setControlProperty('viewer', 'loading', true));
        });

const updateFGJSONLayerEpic = (action$, store) =>
    action$.ofType(UPDATE_FGJSON_LAYER)
        .switchMap((action) => {
            const layer = action.layer;
            return Observable.defer(() => axios.get(layer.url, { params: layer.params }))
                .switchMap(({ data, headers }) => {
                    const crs = parseCRSString(headers['content-crs'] || layer.params.crs);
                    if (!isCRSAvailable(crs)) {
                        return Observable.of(
                            setControlProperty('viewer', 'loading', false)
                        );
                    }
                    const { collection, features, bbox } = parseCollection(data, crs);
                    return Observable.of(
                        updateNode(layer.id, 'layers', {
                            originalFeatures: features,
                            features: getFilteredFeatures(store.getState(), features),
                            collection,
                            bbox: {
                                bounds: {
                                    minx: bbox[0],
                                    miny: bbox[1],
                                    maxx: bbox[2],
                                    maxy: bbox[3]
                                },
                                crs: 'CRS84'
                            }
                        }),
                        setControlProperty('viewer', 'loading', false)
                    );
                })
                .catch(() => {
                    return Observable.of(
                        setControlProperty('viewer', 'loading', false)
                    );
                })
                .startWith(setControlProperty('viewer', 'loading', true));
        });


const filterFGJSONLayerEpic = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY)
        .filter(({ control, property }) => {
            return control === 'timelineFilter' && property === 'customTimes';
        })
        .switchMap(() => {
            const state = store.getState();
            const layers = layersSelector(state);
            const fgJsonLayersActions = layers.filter(layer => layer.type === 'fgJson')
                .map((layer) => updateNode(layer.id, 'layers', {
                    features: getFilteredFeatures(store.getState(), layer.originalFeatures)
                }));
            return fgJsonLayersActions.length > 0
                ? Observable.of(...fgJsonLayersActions)
                : Observable.empty();
        });

export default {
    addFGJSONLayerEpic,
    updateFGJSONLayerEpic,
    filterFGJSONLayerEpic
};

/*
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { Observable } from 'rxjs';
import { MAP_CONFIG_LOADED } from '@mapstore/framework/actions/config';
import { setControlProperty } from '@mapstore/framework/actions/controls';
import url from 'url';
import axios from '@mapstore/framework/libs/ajax';
import { getCapabilities } from '@mapstore/framework/api/ThreeDTiles';
import { addLayer } from '@mapstore/framework/actions/layers';
import uniqBy from 'lodash/uniqBy';
import uuid from 'uuid';
import { ENERGY_LAYER_ID } from '@js/utils/EnergyUtils';

const parseHref = (href, collectionHref) => {
    if (!href || href.indexOf('http') === 0) {
        return href;
    }
    const { protocol, host } = url.parse(collectionHref);
    return `${protocol}//${host}${href}`;
};

const scanFeatures = (features, update = coords => coords) => {
    features.forEach((feature, idx) => {
        const geometryType = feature.geometry && feature.geometry.type;
        geometryType === 'Point' && update([feature.geometry.coordinates], idx, feature || {})
        || geometryType === 'MultiPoint' && update(feature.geometry.coordinates, idx, feature || {})
        || geometryType === 'LineString' && update(feature.geometry.coordinates, idx, feature || {})
        || geometryType === 'MultiLineString' && feature.geometry.coordinates.map((coords) => update(coords, idx, feature || {}))
        || geometryType === 'Polygon' && feature.geometry.coordinates.map((coords) => update(coords, idx, feature || {}))
        || geometryType === 'MultiPolygon' && feature.geometry.coordinates
            .map((group) =>
                group.map(coords => update(coords, idx, feature || {})));
    });
};

const cleanFeatures = features => {
    return features;
};

export const energyInitEnergyMap = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() => {
            const params = url.parse(window.location.href, true).query || {};
            const { collection, bbox } = params;
            if (!collection) {
                return Observable.empty();
            }
            return Observable.defer(() =>
                axios.get(collection)
                    .then(({ data }) => {
                        const { links = [], title, id, itemCount } = data || {};
                        const geoJSON = links.find(({ type, rel }) =>
                            rel === 'items'
                            && ['application/geo+json'].includes(type)
                        );
                        const threeDTiles = links.find(({ rel, type }) =>
                            ['http://www.opengis.net/def/rel/ogc/0.0/tileset-3dtiles',
                                'http://www.opengis.net/def/rel/ogc/1.0/bvh'].includes(rel)
                            && ['application/json+3dtiles',
                                'application/json+3dtiles'].includes(type)
                        );
                        const queryables = links.find(({ rel, type }) =>
                            [
                                'http://www.opengis.net/def/rel/ogc/1.0/queryables',
                                'queryables'
                            ].includes(rel)
                            && (type === undefined || ['application/json'].includes(type))
                        );
                        const geoJSONHref = parseHref(geoJSON?.href, collection);
                        const queryablesHref = parseHref(queryables?.href, collection);
                        const threeDTilesHref = parseHref(threeDTiles?.href, collection);
                        return axios.all([
                            geoJSONHref ? axios.get(geoJSONHref, { params: { limit: itemCount ?? 10000, ...(bbox && { bbox }) } }).then(response => response.data) : Promise.resolve(null),
                            queryablesHref ? axios.get(queryablesHref).then(response => response.data) : Promise.resolve(null),
                            threeDTilesHref ? getCapabilities(threeDTilesHref) : Promise.resolve(null)
                        ])
                            .then((responses) => {
                                return {
                                    id,
                                    title,
                                    responses,
                                    threeDTilesHref: threeDTilesHref ? threeDTilesHref.split('?')[0] : threeDTilesHref
                                };
                            });
                    })
            )
                .switchMap(({ id, title, responses, threeDTilesHref }) => {
                    const features = cleanFeatures(responses?.[0]?.features || []);
                    let filteredIndexes = [];
                    scanFeatures(features, (coordinates, idx, feature) => {
                        if (!['Point', 'MultiPoint'].includes(feature.geometry.type)) {
                            const uniqueCoordinates = uniqBy(coordinates, ([x, y, z]) => `${x}:${y}:${z}`);
                            if (uniqueCoordinates.length === 1) {
                                filteredIndexes.push(idx);
                            }
                        }
                    });
                    filteredIndexes = uniqBy(filteredIndexes);
                    return Observable.of(
                        ...(threeDTilesHref ? [addLayer({
                            id: uuid(),
                            type: '3dtiles',
                            url: threeDTilesHref,
                            title: `3D Tiles - ${title}`,
                            visibility: true,
                            ...responses[3]
                        })] : []),
                        addLayer({
                            id: ENERGY_LAYER_ID,
                            name: id,
                            title: `Items - ${title}`,
                            type: 'vector',
                            features: features.filter((feature, idx) => !filteredIndexes.includes(idx)),
                            visibility: true
                        }),
                        setControlProperty('classificationVectorLayer', 'loading', false)
                    );
                })
                .catch(() => Observable.of(setControlProperty('classificationVectorLayer', 'loading', false)))
                .startWith(setControlProperty('classificationVectorLayer', 'loading', true));
        });


export default {
    energyInitEnergyMap
};

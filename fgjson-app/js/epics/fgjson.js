
/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { addLayer } from '@mapstore/framework/actions/layers';
import { zoomToExtent } from '@mapstore/framework/actions/map';
import axios from '@mapstore/framework/libs/ajax';
import { ADD_FGJSON_LAYER_FROM_URL } from '@js/actions/fgjson';
import turfBbox from '@turf/bbox';

const addFGJSONLayerEpic = (action$) =>
    action$.ofType(ADD_FGJSON_LAYER_FROM_URL)
        .switchMap((action) => {
            return Observable.defer(() => axios.get(action.layerUrl))
                .switchMap(({ data: collection }) => {
                    // TODO: parse CRS from request
                    const bbox = turfBbox(collection);
                    const features = collection.features;
                    return Observable.of(
                        addLayer({
                            type: 'vector',
                            features,
                            style: {
                                fillColor: '#ffaa33',
                                fillOpacity: 0.8,
                                color: '#444444',
                                opacity: 0.8,
                                weight: 2
                            }
                        }),
                        zoomToExtent(bbox, 'EPSG:4326')
                    );
                });
        });


export default {
    addFGJSONLayerEpic
};

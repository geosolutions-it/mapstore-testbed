/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const ADD_FGJSON_LAYER_FROM_URL = 'FGJSON:ADD_FGJSON_LAYER_FROM_URL';
export const UPDATE_FGJSON_LAYER = 'FGJSON:UPDATE_FGJSON_LAYER';

export const addFGJSONLayerFromUrl = (layerUrl, properties) => ({
    type: ADD_FGJSON_LAYER_FROM_URL,
    layerUrl,
    properties
});

export const updateFGJSONLayer = (layer) => ({
    type: UPDATE_FGJSON_LAYER,
    layer
});

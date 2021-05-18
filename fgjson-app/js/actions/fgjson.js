
export const ADD_FGJSON_LAYER_FROM_URL = 'FGJSON:ADD_FGJSON_LAYER_FROM_URL';

export const addFGJSONLayerFromUrl = (layerUrl) => ({
    type: ADD_FGJSON_LAYER_FROM_URL,
    layerUrl
});

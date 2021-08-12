
import Layers from '@mapstore/framework/utils/cesium/Layers';
import Cesium from '@mapstore/framework/libs/cesium';
import chroma from 'chroma-js';
import isEqual from 'lodash/isEqual';

function getCesiumColor(color, opacity) {
    const [r, g, b, a] = chroma(color).gl();
    if (opacity !== undefined) {
        return new Cesium.Color(r, g, b, opacity);
    }
    return new Cesium.Color(r, g, b, a);
}

function getStyle({ style } = {}) {
    const fillParam = style.fillColor && { fill: getCesiumColor(style.fillColor, style.fillOpacity) };
    const strokeParam = style.color && { stroke: getCesiumColor(style.color, style.opacity) };
    const strokeWidthParam = style.weight !== undefined && { strokeWidth: style.weight };
    return {
        ...fillParam,
        ...strokeParam,
        ...strokeWidthParam
    };
}

const createLayer = (options, viewer) => {
    let _dataSource;
    Cesium.GeoJsonDataSource.load({ type: 'FeatureCollection', features: options.features }, {
        ...getStyle(options)
    })
        .then((dataSource) => {
            if (options.upperLimit !== undefined) {
                let entities = dataSource.entities.values;
                for (let i = 0; i < entities.length; i++) {
                    let entity = entities[i];
                    let properties = entity.properties || {};
                    let lower = options.lowerLimit && properties[options.lowerLimit] || 0;
                    let upper = properties[options.upperLimit] || 0;
                    entity.polygon.height = lower;
                    entity.polygon.extrudedHeight = upper;
                }
            }
            viewer.dataSources.add(dataSource);
            _dataSource = dataSource;
        });
    return {
        detached: true,
        remove: () => {
            if (_dataSource && viewer) {
                viewer.dataSources.remove(_dataSource);
                _dataSource = undefined;
            }
        }
    };
};

Layers.registerType('fgJson', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, viewer) => {
        if (newOptions.upperLimit !== oldOptions.upperLimit
        || newOptions.lowerLimit !== oldOptions.lowerLimit
        || !isEqual(newOptions.style, oldOptions.style)
        || !isEqual(newOptions.features, oldOptions.features)) {
            return createLayer(newOptions, viewer);
        }
        return null;
    }
});

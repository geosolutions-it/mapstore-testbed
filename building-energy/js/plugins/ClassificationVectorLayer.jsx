/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { ENERGY_LAYER_ID } from '@js/utils/EnergyUtils';
import { updateNode } from '@mapstore/framework/actions/layers';
import { layersSelector } from '@mapstore/framework/selectors/layers';
import Select from 'react-select';
import { isNumber, isString, isNil, isArray, min, max } from 'lodash';
import SLDService from '@mapstore/framework/api/SLDService';
import ColorRamp from '@mapstore/framework/components/styleeditor/ColorRamp';
import chroma from 'chroma-js';
import StyleBasedLegend from '@mapstore/framework/components/TOC/fragments/StyleBasedLegend';
import moment from 'moment';
const { getColors } = SLDService;

// processing map function utils
const map = (val, v1, v2, v3, v4) => v3 + (v4 - v3) * ((val - v1) / (v2 - v1));

const computeJenksStyle = ({
    data,
    classes,
    colors
}) => {
    return import('simple-statistics')
        .then(mod => {
            const { jenks } = mod;
            const breakpoints = jenks(data, classes);
            const updatedColors = chroma.scale(colors).colors(classes);
            let count = 0;
            return breakpoints.reduce((acc, current, idx) => {
                const next = breakpoints[idx + 1];
                if (next !== undefined) {
                    const color = updatedColors[count];
                    count++;
                    return [
                        ...acc,
                        idx !== breakpoints.length - 2
                            ? [[['>=', current], ['<', next]], color]
                            : [[['>=', current], ['<=', next]], color]
                    ];
                }
                return acc;
            }, []);
        });
};

function EnergyChart({ layer, onSelect }) {
    if (!layer?.selectedEnergyOption) {
        return null;
    }
    const { features, selectedEnergyOption, selectedEnergyOptionTimeIndex = 0, selectedProperty } = layer;
    const filteredFeatures = features.filter(({ properties }) => properties[selectedProperty?.value]);
    const average = filteredFeatures.reduce((acc, { properties }) => {
        const energyOptions = properties[selectedProperty.value];
        const values = energyOptions[parseFloat(selectedEnergyOption.value) - 1]?.energyAmount?.values || [];
        values.forEach((value, idx) => {
            if (!acc[idx]) {
                acc[idx] = [];
            }
            acc[idx].push(value);
        });
        return acc;
    }, []).map((value) => value.reduce((sum, val) => sum + val, 0) / filteredFeatures.length);

    const width = 512;
    const height = 100;
    const { options } = selectedEnergyOption;
    const { energyAmount } = options || {};
    const { values = [] } = energyAmount || {};
    const base = width / values.length;
    const minValue = min(average);
    const maxValue = max(average);
    return (
        <>
            <div>From {moment(energyAmount?.temporalExtent?.begin).format('MMMM Do YYYY')}</div>
            <div>To {moment(energyAmount?.temporalExtent?.begin).format('MMMM Do YYYY')}</div>
            {average.length > 1 && <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', aspectRatio: width / height }}>
                {average.map((value, idx) => {
                    const margin = 10;
                    const selected = selectedEnergyOptionTimeIndex === idx;
                    const h = map(value, minValue, maxValue, margin, height - margin);
                    return (
                        <rect
                            key={idx}
                            x={idx * base}
                            y={height - h}
                            width={base - 4}
                            height={h}
                            fill={!selected ? '#5dbacb' : '#078aa3'}
                            onClick={() => onSelect(idx)}
                            style={{ cursor: 'pointer' }}
                        />);
                })}
            </svg>}
        </>
    );
}

const getSymbolizersStyle = (layer, color) => {
    return [
        {
            kind: 'Fill',
            color,
            opacity: 1,
            fillOpacity: 1,
            outlineColor: '#000000',
            outlineOpacity: 1,
            outlineWidth: 0
        },
        {
            kind: 'Line',
            color,
            opacity: 1,
            width: 1
        },
        {
            kind: 'Mark',
            color,
            fillOpacity: 1,
            strokeColor: '#000000',
            strokeOpacity: 1,
            strokeWidth: 0,
            radius: 4,
            wellKnownName: 'Circle',
            msHeightReference: 'none',
            msBringToFront: true
        }
    ];
};

function ClassificationVectorLayer({
    layer,
    onChange,
    defaultColorRamp = 'viridis',
    classes = 7
}) {
    if (!layer) {
        return null;
    }

    const rampColors = getColors(undefined, undefined, classes);

    const accumulatedProperties = layer?.features?.reduce((acc, feature) => ({ ...acc,  ...feature?.properties }), {}) || {};
    const propertyKeys = Object.keys(accumulatedProperties);
    const propertiesOptions = propertyKeys
        .filter((key) => isNumber(accumulatedProperties[key]) || isString(accumulatedProperties[key]) || isArray(accumulatedProperties[key]))
        .map((key) => ({ value: key, label: key, type: isNumber(accumulatedProperties[key]) ? 'number' : isArray(accumulatedProperties[key]) ? 'array' : 'string' }))
        .map((option) => ({ ...option, disabled: option.type === 'string' }));

    const energyOptions = isArray(accumulatedProperties[layer?.selectedProperty?.value])
        ? accumulatedProperties[layer.selectedProperty.value]
            .filter(({ endUse, energyAmount }) => endUse && energyAmount)
            .map((options, idx) => {
                return {
                    value: `${idx + 1}`,
                    label: `${options.endUse} (${options.energyAmount.unit} - ${options.energyAmount.timeInterval.unit})`,
                    options
                };
            })
        : [];

    function handleChangeProperty({
        property,
        colorRamp,
        energyOption,
        energyOptionTimeIndex
    }) {
        const ramp = colorRamp ?? defaultColorRamp;
        onChange({
            selectedColorRamp: ramp,
            selectedProperty: property,
            selectedEnergyOption: energyOption,
            selectedEnergyOptionTimeIndex: energyOptionTimeIndex,
            style: undefined
        });
        if (property?.type === 'number') {
            const data = layer.features.map(feature => feature.properties[property.value]).filter(value => !isNil(value));
            const { colors } = rampColors.find((rampColor) => rampColor.name === ramp) || {};
            computeJenksStyle({
                data,
                classes,
                colors
            }).then((breakpoints) => {
                onChange({
                    style: {
                        format: 'geostyler',
                        body: {
                            rules: breakpoints.map(([filter, filterColor]) => ({
                                filter: ['&&', ...filter.map(([operator, value]) => [operator, property.value, value])],
                                name: filter.map((value) => value.join(' ')).join(' '),
                                symbolizers: getSymbolizersStyle(layer, filterColor)
                            }))
                        }
                    }
                });
            });
            return;
        }
        if (property?.type === 'array' && energyOption) {
            const timeIndex = energyOptionTimeIndex ?? 0;
            const tmpPropertyKey = 'msTmpEnergyProperty';
            const newFeatures = layer.features
                .map((feature) => {
                    const _energyOptions = feature.properties[property.value];
                    if (_energyOptions) {
                        const values = _energyOptions[parseFloat(energyOption.value) - 1]?.energyAmount?.values || [];
                        return {
                            ...feature,
                            properties: {
                                ...feature.properties,
                                [tmpPropertyKey]: values[timeIndex]
                            }
                        };
                    }
                    return feature;
                });

            const data = newFeatures.map(feature => feature.properties[tmpPropertyKey]).filter(value => !isNil(value));
            const { colors } = rampColors.find((rampColor) => rampColor.name === ramp) || {};
            computeJenksStyle({
                data,
                classes,
                colors
            }).then((breakpoints) => {
                onChange({
                    features: newFeatures,
                    style: {
                        format: 'geostyler',
                        body: {
                            rules: breakpoints.map(([filter, filterColor]) => ({
                                filter: ['&&', ...filter.map(([operator, value]) => [operator, tmpPropertyKey, value])],
                                name: filter.map((value) => value.join(' ')).join(' '),
                                symbolizers: getSymbolizersStyle(layer, filterColor)
                            }))
                        }
                    }
                });
            });
            return;
        }
        return;
    }
    return (
        <div
            style={{ position: 'absolute', top: 100, right: 46, background: '#ffffff', zIndex: 10, width: 300, padding: 8 }}
            className="shadow"
        >
            <h1 style={{ marginTop: 0 }}>Classification</h1>
            <p>Classification tool for OGC features API collection containing energy data and 3D Tiles</p>
            <FormGroup>
                <ControlLabel>Property</ControlLabel>
                <Select
                    value={layer.selectedProperty}
                    options={propertiesOptions}
                    onChange={(option) => handleChangeProperty({
                        property: option
                    })}
                />
            </FormGroup>
            {energyOptions?.length > 0 && (
                <FormGroup>
                    <ControlLabel>Energy property</ControlLabel>
                    <Select
                        value={layer.selectedEnergyOption}
                        options={energyOptions}
                        onChange={(option) => handleChangeProperty({
                            property: layer.selectedProperty,
                            colorRamp: layer.selectedColorRamp,
                            energyOption: option,
                            energyOptionTimeIndex: layer.selectedEnergyOptionTimeIndex
                        })}
                    />
                </FormGroup>
            )}
            <FormGroup>
                <ControlLabel>Colors ramp</ControlLabel>
                <ColorRamp
                    items={rampColors}
                    rampFunction={({ colors }) => colors}
                    samples={5}
                    value={{ name: layer.selectedColorRamp || defaultColorRamp }}
                    onChange={ramp => handleChangeProperty({
                        property: layer.selectedProperty,
                        colorRamp: ramp.name,
                        energyOption: layer.selectedEnergyOption,
                        energyOptionTimeIndex: layer.selectedEnergyOptionTimeIndex
                    })}
                />
            </FormGroup>
            <FormGroup>
                <EnergyChart
                    layer={layer}
                    onSelect={(index) => handleChangeProperty({
                        property: layer.selectedProperty,
                        colorRamp: layer.selectedColorRamp,
                        energyOption: layer.selectedEnergyOption,
                        energyOptionTimeIndex: index
                    })}
                />
            </FormGroup>
            {layer.style && <StyleBasedLegend
                style={layer.style}
            />}
        </div>
    );
}

const ConnectedClassificationVectorLayer = connect(
    createSelector([layersSelector], (layers) => ({
        layer: layers?.find(layer => layer.id === ENERGY_LAYER_ID)
    })),
    {
        onChange: updateNode.bind(null, ENERGY_LAYER_ID, 'layers')
    }
)(ClassificationVectorLayer);

export default createPlugin('ClassificationVectorLayer', {
    component: ConnectedClassificationVectorLayer,
    reducers: {},
    epics: {},
    options: {},
    containers: {}
});

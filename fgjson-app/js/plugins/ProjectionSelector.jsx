/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { projectionSelector } from '@mapstore/framework/selectors/map';
import { changeMapCrs } from '@mapstore/framework/actions/map';
import { getAvailableCRS } from '@mapstore/framework/utils/CoordinatesUtils';
import Select from 'react-select';

function ProjectionSelector({
    selected,
    options,
    onChange
}) {
    const availableCRS = getAvailableCRS();
    const availableOptions = options
        .filter(({ value }) => availableCRS[value])
        .map(({ label, value }) => ({
            value,
            label: label || availableCRS[value]?.label
        }));
    return (
        <div className="ms-projection-selector">
            <Select
                clearable={false}
                value={selected}
                options={availableOptions}
                menuPlacement="top"
                onChange={(option) => onChange(option?.value)}
            />
        </div>
    );
}

ProjectionSelector.defaultProps = {};

const ConnectedProjectionSelector = connect(
    createSelector([
        projectionSelector
    ], (selected) => ({
        selected: selected === 'EPSG:900913' ? 'EPSG:3857' : selected
    })),
    {
        onChange: changeMapCrs
    }
)(ProjectionSelector);

export default createPlugin('ProjectionSelector', {
    component: ConnectedProjectionSelector,
    reducers: {},
    epics: {},
    options: {
        disablePluginIf: "{state('mapType') !== 'openlayers'}"
    },
    containers: {
        ViewerLayout: {
            priority: 1,
            target: 'center'
        }
    }
});

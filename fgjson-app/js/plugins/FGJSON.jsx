/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { InputGroup, Glyphicon, FormControl } from 'react-bootstrap';
import { addFGJSONLayerFromUrl } from '@js/actions/fgjson';
import fgjsonEpics from '@js/epics/fgjson';

function FGJSONPlugin({
    onAdd
}) {
    const [value, setValue] = useState('');
    return (
        <div
            style={{
                height: '100%',
                width: 300,
                position: 'relative'
            }}
        >
            <div
                className="shadow"
                style={{
                    position: 'absolute',
                    width: 'calc(100% - 16px)',
                    height: 'calc(100% - 16px)',
                    margin: 8,
                    padding: 4
                }}
            >
                <InputGroup>
                    <FormControl
                        value={value}
                        onChange={(event) => setValue(event?.target?.value || '')}
                        placeholder="Enter FGJSON url..."
                    />
                    <InputGroup.Addon
                        className="btn"
                        onClick={() => onAdd(value)}
                    >
                        <Glyphicon glyph="plus" />
                    </InputGroup.Addon>
                </InputGroup>
            </div>
        </div>
    );
}

FGJSONPlugin.defaultProps = {};

const ConnectedFGJSONPlugin = connect(
    createSelector([], () => ({})),
    {
        onAdd: addFGJSONLayerFromUrl
    }
)(FGJSONPlugin);

export default createPlugin('FGJSON', {
    component: ConnectedFGJSONPlugin,
    reducers: {},
    epics: fgjsonEpics
});

/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { Button, Glyphicon } from 'react-bootstrap';
import MSTOC from '@mapstore/framework/plugins/TOC';
import BorderLayout from '@mapstore/framework/components/layout/BorderLayout';
import GroupNode from '@js/components/GroupNode';
import LayerNode from '@js/components/LayerNode';
import PropTypes from 'prop-types';
import { setControlProperty } from '@mapstore/framework/actions/controls';
import { layerSelectorWithMarkers } from '@mapstore/framework/selectors/layers';

const { TOCPlugin, reducers, epics } = MSTOC;
const TOCPluginPanel = TOCPlugin;

function TOCContainer({
    items = [],
    enabled,
    onEnable,
    isTreeEmpty,
    ...props
}) {
    const nodeButtons = items
        .filter(({ target }) => target === 'nodeButton')
        .map(({ Component }) => ({ Element: Component }));
    return enabled ? (
        <BorderLayout
            className="ms-toc"
            header={
                <div style={{ marginBottom: 4, padding: 4, display: 'flex', flexDirection: 'row-reverse' }}>
                    <Button
                        bsSize="xs"
                        onClick={() => onEnable(false)}
                        className="square-button-md no-border"
                    >
                        <Glyphicon glyph="1-close"/>
                    </Button>
                </div>
            }
        >
            {isTreeEmpty
                ? <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ padding: 32}}>
                        <Glyphicon glyph="add-layer" style={{ fontSize: 64 }}/>
                        <p>There are not layer available in the layers tree. Add a new layer from an OGC API endpoint.</p>
                    </div>
                </div>
                : <TOCPluginPanel
                    { ...props }
                    items={items
                        .filter(({ target }) => target !== 'nodeButton')}
                    layerNodeComponent={(layerProps) => <LayerNode {...layerProps} buttons={nodeButtons} />}
                    groupNodeComponent={GroupNode}/>}
        </BorderLayout>
    ) : (
        <div style={{ margin: '8px 0 0 4px' }}>
            <Button
                bsSize="xs"
                onClick={() => onEnable(true)}
                className="square-button-md no-border"
            >
                <Glyphicon glyph="1-layer"/>
            </Button>
        </div>
    );
}

TOCContainer.contextTypes = {
    loadedPlugins: PropTypes.object
};

export default createPlugin('TOC', {
    component: connect(
        createSelector([
            state => state?.controls?.toc?.enabled,
            layerSelectorWithMarkers
        ], (enabled, layers) => ({
            enabled,
            isTreeEmpty: (layers || []).filter(({ group }) => group !== 'background').length === 0
        })),
        {
            onEnable: setControlProperty.bind(null, 'toc', 'enabled')
        }
    )(TOCContainer),
    reducers,
    epics,
    containers: {
        ViewerLayout: {
            target: 'leftColumn',
            priority: 1
        }
    }
});

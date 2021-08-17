/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setControlProperty } from '@mapstore/framework/actions/controls';
import { updateNode } from '@mapstore/framework/actions/layers';
import { getSelectedLayer } from '@mapstore/framework/selectors/layers';
import { Button as ButtonRB, Glyphicon, Form, FormGroup, ControlLabel, FormControl, Nav, NavItem } from 'react-bootstrap';
import Select from 'react-select';
import tooltip from '@mapstore/framework/components/misc/enhancers/tooltip';
import RulesEditor from '@mapstore/framework/components/styleeditor/RulesEditor';
import { updateFGJSONLayer } from '@js/actions/fgjson';
import JSONTree from 'react-json-tree';

const Button = tooltip(ButtonRB);

const theme = {
    scheme: 'bright',
    author: 'chris kempson (http://chriskempson.com)',
    base00: '#000000',
    base01: '#303030',
    base02: '#505050',
    base03: '#b0b0b0',
    base04: '#d0d0d0',
    base05: '#e0e0e0',
    base06: '#f5f5f5',
    base07: '#ffffff',
    base08: '#fb0120',
    base09: '#fc6d24',
    base0A: '#fda331',
    base0B: '#a1c659',
    base0C: '#76c7b7',
    base0D: '#6fb3d2',
    base0E: '#d381c3',
    base0F: '#be643c'
};

const tabContent = {
    settings: ({
        selectedLayer,
        onChange,
        onUpdate
    }) => {
        const featureProperties = Object.keys(selectedLayer?.features?.[0]?.properties || {});
        function handleUpdateParam(key, value) {
            const newLayer = {
                ...selectedLayer,
                params: {
                    ...selectedLayer?.params,
                    [key]: value
                }
            };
            onChange(selectedLayer.id, 'layers',
                {
                    params: newLayer?.params
                });
            onUpdate(newLayer);
        }
        return (
            <Form style={{ padding: 8 }}>
                <FormGroup
                    controlId="title"
                    key="title">
                    <ControlLabel>Title</ControlLabel>
                    <FormControl
                        value={selectedLayer.title}
                        type="text"
                        placeholder="Enter title..."
                        onChange={(event) => onChange(selectedLayer.id, 'layers', { title: event.target.value })} />
                </FormGroup>
                <FormGroup
                    controlId="lowerLimit"
                    key="lowerLimit">
                    <ControlLabel>Elevation property</ControlLabel>
                    <Select
                        value={selectedLayer.lowerLimit}
                        options={featureProperties.map((value) => ({ value, label: value }))}
                        onChange={(selected) => {
                            onChange(selectedLayer.id, 'layers',
                                {
                                    lowerLimit: selected?.value || null
                                });
                        }} />
                </FormGroup>
                <FormGroup
                    controlId="upperLimit"
                    key="upperLimit">
                    <ControlLabel>Height property</ControlLabel>
                    <Select
                        value={selectedLayer.upperLimit}
                        options={featureProperties.map((value) => ({ value, label: value }))}
                        onChange={(selected) => {
                            onChange(selectedLayer.id, 'layers',
                                {
                                    upperLimit: selected?.value || null
                                });
                        }} />
                </FormGroup>
                <FormGroup
                    controlId="availableCrs"
                    key="availableCrs">
                    <ControlLabel>Available CRS</ControlLabel>
                    <Select
                        value={selectedLayer?.params?.crs}
                        options={selectedLayer?.availableCrs?.map((value) => ({ value, label: value }))}
                        onChange={(selected) => {
                            handleUpdateParam('crs', selected?.value);
                        }} />
                </FormGroup>
                <FormGroup
                    controlId="limit"
                    key="limit">
                    <ControlLabel>Max features count</ControlLabel>
                    <Select
                        value={selectedLayer?.params?.limit}
                        options={[
                            {
                                value: 10,
                                label: '10'
                            },
                            {
                                value: 50,
                                label: '50'
                            },
                            {
                                value: 100,
                                label: '100'
                            },
                            {
                                value: 500,
                                label: '500'
                            }
                        ]}
                        onChange={(selected) => {
                            handleUpdateParam('limit', selected?.value);
                        }} />
                </FormGroup>
            </Form>
        );
    },
    style: ({
        selectedLayer,
        onChange
    }) => {
        const selectedLayerStyle = selectedLayer?.style || {};
        return (
            <RulesEditor
                rules={[{
                    name: 'Polygon',
                    symbolizers: [{
                        kind: "Fill",
                        color: selectedLayerStyle.fillColor,
                        fillOpacity: selectedLayerStyle.fillOpacity !== undefined ? selectedLayerStyle.fillOpacity : 1,
                        outlineColor: selectedLayerStyle.color,
                        outlineOpacity: selectedLayerStyle.opacity !== undefined ? selectedLayerStyle.opacity : 1,
                        outlineWidth: selectedLayerStyle.weight !== undefined ? selectedLayerStyle.weight : 1
                    }]
                }]}
                onChange={(newRules) => {
                    const properties = newRules?.[0]?.symbolizers?.[0] || {};
                    onChange(selectedLayer.id, 'layers',
                        {
                            style: {
                                ...selectedLayer.style,
                                ...(properties.color && { fillColor: properties.color }),
                                ...(properties.fillOpacity !== undefined && { fillOpacity: properties.fillOpacity }),
                                ...(properties.outlineColor && { color: properties.outlineColor }),
                                ...(properties.outlineOpacity !== undefined && { opacity: properties.outlineOpacity }),
                                ...(properties.outlineWidth !== undefined && { weight: properties.outlineWidth })
                            }
                        });
                }}
            />
        );
    },
    json: ({ selectedLayer }) => {
        return selectedLayer?.collection
            ? (
                <JSONTree
                    data={selectedLayer.collection}
                    shouldExpandNode={() => true}
                    theme={theme}
                    hideRoot
                />
            )
            : null;
    }
};

const LayerSettings = (props) => {

    const {
        selectedLayer,
        enabled,
        onClose
    } = props;

    const [activeTab, setActiveTab] = useState('settings');
    const selectedLayerStyle = selectedLayer?.style || {};
    const Content = tabContent[activeTab];
    return enabled && selectedLayer
        ? (
            <div
                key={selectedLayerStyle.id}
                style={{ position: 'relative', width: 316, height: '100%', overflow: 'auto' }} className="ms-layer-settings">
                <div
                    className="shadow"
                    style={{
                        position: 'absolute',
                        width: 'calc(100% - 16px)',
                        height: 'calc(100% - 16px)',
                        margin: 8,
                        padding: 4,
                        overflow: 'auto',
                        backgroundColor: '#ffffff'
                    }}>
                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <div style={{ marginBottom: 4, display: 'flex', flexDirection: 'row-reverse' }}>
                            <Button
                                bsSize="xs"
                                onClick={() => onClose()}
                                className="square-button-md no-border"
                            >
                                <Glyphicon glyph="1-close"/>
                            </Button>
                        </div>
                        <Nav bsStyle="tabs" activeKey={activeTab}>
                            <NavItem
                                key="settings"
                                eventKey="settings"
                                onClick={() => setActiveTab('settings')}
                            >
                                Settings
                            </NavItem>
                            <NavItem
                                key="json"
                                eventKey="json"
                                onClick={() => setActiveTab('json')}
                            >
                                JSON
                            </NavItem>
                            <NavItem
                                key="style"
                                eventKey="style"
                                onClick={() => setActiveTab('style')}
                            >
                                Style
                            </NavItem>
                        </Nav>
                        <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
                            {Content && <Content {...props} />}
                        </div>
                    </div>
                </div>
            </div>
        )
        : null;
};

const TOCButton = connect(createSelector([
    state => get(state, 'controls.toc.activeSettings')
], (enabled) => ({
    enabled
})), {
    onClick: setControlProperty.bind(null, 'toc', 'activeSettings', true)
})(({ status, enabled, onClick }) => {
    return !enabled && (status === 'LAYER' || status === 'LAYER_LOAD_ERROR')
        ? <Button
            tooltip="Layer settings"
            className="square-button-md"
            bsStyle="primary"
            onClick={() => onClick()}>
            <Glyphicon glyph="wrench" />
        </Button>
        : null;
});

export default createPlugin('LayerSettings', {
    component: connect(
        createSelector([
            state => get(state, 'controls.toc.activeSettings'),
            getSelectedLayer
        ], (enabled, selectedLayer) => ({
            enabled,
            selectedLayer: selectedLayer || {}
        })),
        {
            onClose: setControlProperty.bind(null, 'toc', 'activeSettings', false),
            onChange: updateNode,
            onUpdate: updateFGJSONLayer
        }
    )(LayerSettings),
    containers: {
        TOC: {
            priority: 1,
            Component: TOCButton,
            target: 'toolbar'
        },
        ViewerLayout: {
            priority: 1,
            target: 'leftColumnInner'
        }
    }
});

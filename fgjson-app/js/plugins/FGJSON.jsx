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
import { InputGroup, Glyphicon, Nav, NavItem, FormGroup, Alert, Button as ButtonRB } from 'react-bootstrap';
import { addFGJSONLayerFromUrl } from '@js/actions/fgjson';
import isEmpty from 'lodash/isEmpty';
import fgjsonEpics from '@js/epics/fgjson';
import JSONTree from 'react-json-tree';
import axios from '@mapstore/framework/libs/ajax';
import Loader from '@mapstore/framework/components/misc/Loader';
import tooltip from '@mapstore/framework/components/misc/enhancers/tooltip';
import Select from 'react-select';
import { setControlProperty } from '@mapstore/framework/actions/controls';

const InputGroupAddon = tooltip(InputGroup.Addon);
const Button = tooltip(ButtonRB);

const ReactSelectCreatable = Select.Creatable;

let responses = {};
function getEndpointData(endpointUrl) {
    return new Promise((resolve, reject) => {
        if (responses[endpointUrl]) {
            resolve(responses[endpointUrl]);
        } else {
            axios.get(endpointUrl)
                .then((response) => {
                    responses[endpointUrl] = response.data;
                    resolve(responses[endpointUrl]);
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
}

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

function Response({
    description,
    links = [],
    collections = [],
    onConnect,
    onAdd
}) {

    const dataLinks = (links || []).filter((link) => link.rel === 'data' && (
        link?.type === 'application/json'
        || !link?.type
    ));

    const featureCollections = (collections || [])
        .reduce((acc, collection) => {
            const linksWithFGeoJSON = collection?.links?.find((link) => link.rel === 'items' && link.type === 'application/vnd.ogc.fg+json');
            if (linksWithFGeoJSON) {
                acc.push({ ...collection, collectionType: 'FGJSON', linkWithHref: linksWithFGeoJSON.href });
            }
            const linksWithGeoJSON = collection?.links?.find((link) => link.rel === 'items' && (link.type === 'application/geo+json' || !link.type));
            if (linksWithGeoJSON) {
                acc.push({ ...collection, collectionType: 'GeoJSON', linkWithHref: linksWithGeoJSON.href });
            }
            return acc;
        }, []);

    return (
        <>
            <div style={{ padding: 8 }}>
                <label>Description:</label>
                <p style={{ wordBreak: 'break-word' }}>{description || '...'}</p>
            </div>
            <ul style={{ margin: 0, padding: 0  }}>
                {dataLinks.map((link, idx) => {
                    return (
                        <li
                            key={idx}
                            className="shadow-soft"
                            style={{ padding: 8, margin: 8, paddingLeft: 0, display: 'flex', cursor: 'pointer' }}
                            onClick={onConnect.bind(null, link.href)}
                        >
                            <Button onClick={onConnect.bind(null, link.href)} className="square-button no-border" style={{ margin: 8 }} >
                                <Glyphicon glyph="link"/>
                            </Button>
                            <div style={{ flex: 1 }}>
                                <div><strong>{link?.title || 'Data'}</strong></div>
                                <p>{link?.description}</p>
                                <small>rel: {link?.rel}</small>
                            </div>
                        </li>
                    );
                })}
                {featureCollections.map((collection, idx) => {
                    return (
                        <li
                            key={idx}
                            className="shadow-soft"
                            style={{ padding: 8, margin: 8, paddingLeft: 0, display: 'flex', cursor: 'pointer' }}
                            onClick={onAdd.bind(null, collection.linkWithHref, collection)}
                        >
                            <Button  onClick={onAdd.bind(null, collection.linkWithHref, collection)} className="square-button no-border" style={{ margin: 8 }} >
                                <Glyphicon glyph="add-layer"/>
                            </Button>
                            <div style={{ flex: 1 }}>
                                <div><strong>{collection?.title || 'Data'}</strong></div>
                                <p>{collection?.description}</p>
                                <small>type: <strong>{collection?.collectionType}</strong></small>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
function FGJSONPlugin({
    onAddGeoJSON,
    defaultOptions,
    enabled,
    onEnable
}) {
    const [ogcUrl, setOgcUrl] = useState('');
    const [json, setJSON] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('response');
    const [options] = useState(defaultOptions.map(({ value }) => ({ value, label: value })));

    function handleConnectToOGCApi(endpointUrl, event) {
        event.stopPropagation();
        setError('');
        setLoading(true);
        getEndpointData(endpointUrl)
            .then((response) => {
                setJSON(response);
                setLoading(false);
            })
            .catch((e) => {
                setError('Error: ' + e.statusText);
                setLoading(false);
            });
    }

    function handleAddGeoJSONLayer(geoJsonUrl, properties, event) {
        event.stopPropagation();
        const hashCrs = json.crs || [];
        const crs = (properties?.crs || []).reduce((acc, value) => {
            if (value === '#/crs') {
                return [...acc, ...hashCrs];
            }
            return [...acc, value];
        }, []);
        onAddGeoJSON(geoJsonUrl, { ...properties, crs });
    }

    const isNotConnected = isEmpty(json);

    return (<>
        <div
            className="fg-json-panel-container"
            style={{
                height: '100%',
                position: 'relative',
                display: enabled ? 'block' : 'none'
            }}
        >
            <div
                className="shadow"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    padding: 4,
                    paddingTop: 0,
                    overflow: 'auto',
                    backgroundColor: '#ffffff'
                }}
            >
                <FormGroup
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        backgroundColor: '#fff'
                    }}
                >
                    <InputGroup className="shadow-soft" style={{ margin: '4px 0' }}>
                        <ReactSelectCreatable
                            value={ogcUrl ? {
                                value: ogcUrl,
                                label: ogcUrl
                            } : ''}
                            options={options}
                            placeholder="Select or add a url..."
                            onChange={(event) => {
                                setOgcUrl(event?.value || '');
                                setJSON({});
                                setError('');
                            }}
                        />
                        <InputGroupAddon
                            tooltip={isNotConnected ? 'Connect' : ''}
                            disabled={!ogcUrl}
                            className={`btn ${!isNotConnected ? 'btn-success active' : ''}`}
                            onClick={!ogcUrl ? () => null : handleConnectToOGCApi.bind(null, ogcUrl)}
                        >
                            <Glyphicon glyph={isNotConnected ? 'unplug' : 'plug'} />
                        </InputGroupAddon>
                        <InputGroupAddon
                            className="btn"
                            tooltip="Close panel"
                            onClick={() => onEnable(false)}
                        >
                            <Glyphicon glyph="1-close" />
                        </InputGroupAddon>
                    </InputGroup>
                    {error && <Alert bsStyle="danger">
                        {error}
                    </Alert>}
                    <Nav bsStyle="tabs" activeKey={activeTab}>
                        <NavItem
                            key="response"
                            eventKey="response"
                            onClick={() => setActiveTab('response')}
                        >
                            Response
                        </NavItem>
                        <NavItem
                            key="json"
                            eventKey="json"
                            onClick={() => setActiveTab('json')}
                        >
                            JSON
                        </NavItem>
                    </Nav>
                </FormGroup>
                {!isNotConnected && (activeTab === 'json'
                    ? <JSONTree
                        data={json}
                        theme={theme}
                        shouldExpandNode={() => true}
                        getItemString={(type, data, itemType, itemString) => {
                            if (type === 'Object' && data.rel === 'data' && (
                                data?.type === 'application/json'
                                || !data?.type
                            )) {
                                return <span>{itemType} {itemString} <Button bsStyle="primary" bsSize="xs" onClick={handleConnectToOGCApi.bind(null, data.href)}>Explore data</Button></span>;
                            }
                            const linksWithFGeoJSON = data?.links?.find((link) => link.rel === 'items' && link.type === 'application/vnd.ogc.fg+json');
                            const linksWithGeoJSON = data?.links?.find((link) => link.rel === 'items' && (link.type === 'application/geo+json' || !link.type));
                            if (linksWithGeoJSON || linksWithFGeoJSON) {
                                return (
                                    <span>
                                        {itemType}
                                        {' '}
                                        {itemString}
                                        {' '}
                                        {linksWithGeoJSON && <Button bsStyle="primary" bsSize="xs" onClick={handleAddGeoJSONLayer.bind(null, linksWithGeoJSON.href, data)}>GeoJSON</Button>}
                                        {' '}
                                        {linksWithFGeoJSON && <Button bsStyle="primary" bsSize="xs" onClick={handleAddGeoJSONLayer.bind(null, linksWithFGeoJSON.href, data)}>FGJSON</Button>}
                                    </span>
                                );
                            }
                            return <span>{itemType} {itemString}</span>;
                        }}
                    />
                    : <Response {...json} onConnect={handleConnectToOGCApi} onAdd={handleAddGeoJSONLayer}/>)}
            </div>
            {loading && <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 20
                }}
            >
                <Loader size={64} />
            </div>}
            {(isNotConnected && !loading)
                && <div
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
                        <Glyphicon glyph="unplug" style={{ fontSize: 64 }}/>
                        <p>Select or add a valid OGC API url endpoint and connect to the service to navigate available items collections.</p>
                    </div>
                </div>}
        </div>
        {!enabled && <div style={{ margin: 12, position: 'absolute', right: 0, top: 0, zIndex: 2000 }}>
            <Button
                bsSize="xs"
                tooltip="Connect to an OGC API endpoint"
                onClick={() => onEnable(true)}
                className="square-button-md no-border shadow-soft"
            >
                <Glyphicon glyph="folder-open"/>
            </Button>
        </div>}
    </>);
}

FGJSONPlugin.defaultProps = {
    defaultOptions: []
};

const ConnectedFGJSONPlugin = connect(
    createSelector([
        state => state?.controls?.fgJsonCatalog?.enabled
    ], (enabled) => ({
        enabled
    })),
    {
        onAddGeoJSON: addFGJSONLayerFromUrl,
        onEnable: setControlProperty.bind(null, 'fgJsonCatalog', 'enabled')
    }
)(FGJSONPlugin);

export default createPlugin('FGJSON', {
    component: ConnectedFGJSONPlugin,
    reducers: {},
    epics: fgjsonEpics,
    containers: {
        ViewerLayout: {
            target: 'rightOverlay',
            priority: 1
        }
    }
});

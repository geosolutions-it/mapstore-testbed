/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import isEqual from 'lodash/isEqual';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { resizeMap } from '@mapstore/framework/actions/map';
import { mapTypeSelector } from '@mapstore/framework/selectors/maptype';
import usePluginItems from '@js/hooks/usePluginItems';
import { withResizeDetector } from 'react-resize-detector';

function Center({
    configuredItems,
    width,
    height,
    onResize
}) {
    useEffect(() => {
        onResize();
    }, [width, height]);
    return (
        <div
            className="shadow"
            style={{
                position: 'absolute',
                width: 'calc(100% - 16px)',
                height: 'calc(100% - 16px)',
                margin: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {configuredItems
                .filter(({ target }) => target === 'center')
                .map(({ Component, name }) => <Component key={name} />)}
        </div>
    );
}

const ConnectedCenter = connect(
    createSelector([], () => ({})),
    {
        onResize: resizeMap
    }
)(withResizeDetector(Center));

function ViewerLayout({
    items,
    mapType
}, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins }, [mapType]);
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
            <header>
                {configuredItems
                    .filter(({ target }) => target === 'header')
                    .map(({ Component, name }) => <Component key={name} />)}
            </header>
            <div
                style={{
                    position: 'relative',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flex: 1
                }}>
                {configuredItems
                    .filter(({ target }) => target === 'leftColumn')
                    .map(({ Component, name }) => <Component key={name} />)}
                {configuredItems
                    .filter(({ target }) => target === 'leftColumnInner')
                    .map(({ Component, name }) => <Component key={name} />)}
                <div
                    style={{
                        flex: 1,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            position: 'relative',
                            width: '100%'
                        }}
                    >
                        <ConnectedCenter configuredItems={configuredItems}/>
                    </div>
                    {configuredItems
                        .filter(({ target }) => !target)
                        .map(({ Component, name }) => <Component key={name} />)}
                </div>
                {configuredItems
                    .filter(({ target }) => target === 'rightColumn')
                    .map(({ Component, name }) => <Component key={name} />)}

                <div
                    style={{
                        position: 'absolute',
                        zIndex: 1000,
                        right: 0,
                        top: 0,
                        height: '100%'
                    }}>
                    {configuredItems
                        .filter(({ target }) => target === 'rightOverlay')
                        .map(({ Component, name }) => <Component key={name} />)}
                </div>
            </div>
            <footer>
                {configuredItems
                    .filter(({ target }) => target === 'footer')
                    .map(({ Component, name }) => <Component key={name} />)}
            </footer>
        </div>
    );
}

ViewerLayout.contextTypes = {
    loadedPlugins: PropTypes.object
};

function arePropsEqual(prevProps, nextProps) {
    return isEqual(prevProps, nextProps);
}

const MemoizeDashboardLayout = memo(ViewerLayout, arePropsEqual);

const DashboardLayoutPlugin = connect(
    createSelector([mapTypeSelector], (mapType) => ({mapType})),
    {}
)(MemoizeDashboardLayout);

export default createPlugin('ViewerLayout', {
    component: DashboardLayoutPlugin,
    containers: {},
    epics: {},
    reducers: {}
});

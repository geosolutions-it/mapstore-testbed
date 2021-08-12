/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import usePluginItems from '@js/hooks/usePluginItems';
function Header({
    logo,
    items
}, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins }, []);
    return (
        <div
            className="ms-viewer-header"
        >
            <div className="ms-viewer-header-left">
                {logo.map((entry) => {
                    return (
                        <a href={entry.href}>
                            <img src={entry.src}/>
                        </a>
                    );
                })}
            </div>
            <div className="ms-viewer-header-right">
                {configuredItems
                    .filter(({ target }) => target === 'button')
                    .map(({ Component, name }) => <Component key={name} />)}
            </div>
        </div>
    );
}

Header.defaultProps = {
    logo: [{
        href: '',
        src: 'assets/img/ogc-logo.png'
    }, {
        href: '',
        src: 'assets/img/geosolutions-logo.png'
    }]
};

Header.contextTypes = {
    loadedPlugins: PropTypes.object
};

export default createPlugin('Header', {
    component: Header,
    reducers: {},
    epics: {}
});

/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';

function Header() {
    return (<div style={{
        height: 50,
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #ddd'
    }}>
        <strong>HEADER</strong>
    </div>);
}

Header.defaultProps = {};

export default createPlugin('Header', {
    component: Header,
    reducers: {},
    epics: {}
});

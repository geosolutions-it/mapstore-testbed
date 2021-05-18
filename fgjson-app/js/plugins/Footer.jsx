/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';

function Footer() {
    return (<div style={{
        height: 28,
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid #ddd'
    }}>
    </div>);
}

Footer.defaultProps = {};

export default createPlugin('Footer', {
    component: Footer,
    reducers: {},
    epics: {}
});

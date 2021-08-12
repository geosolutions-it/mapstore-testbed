/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import Message from '@mapstore/framework/components/I18N/Message';
function Footer({
    msLogo
}) {
    return (
        <div className="ms-viewer-footer">
            <div className="ms-viewer-footer-left">
            </div>
            <div className="ms-viewer-footer-right">
                <a href={msLogo.href}>
                    <div className="ms-logo">
                        <div>{msLogo.label || <Message msgId={msLogo.msgId} />}</div>
                        <div><img src={msLogo.src}/></div>
                    </div>
                </a>
            </div>
        </div>
    );
}

Footer.defaultProps = {
    msLogo: {
        label: 'Built with',
        href: 'https://mapstore.geosolutionsgroup.com/mapstore',
        src: 'assets/img/mapstore-logo.png'
    }
};

export default createPlugin('Footer', {
    component: Footer,
    reducers: {},
    epics: {}
});

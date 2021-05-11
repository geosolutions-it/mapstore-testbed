/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import url from 'url';
import Page from '@mapstore/framework/containers/Page';

const urlQuery = url.parse(window.location.href, true).query;

/**
  * @name Viewer
  * @memberof pages
  * @class
  * @classdesc
  * This is the main container page for the App.
  *
  */
function Viewer({
    plugins,
    match
}) {
    return (
        <Page
            id="viewer"
            includeCommon={false}
            plugins={plugins}
            params={match.params}
        />
    );
}

Viewer.propTypes = {
    mode: PropTypes.string,
    match: PropTypes.object,
    plugins: PropTypes.object
};

Viewer.defaultProps = {
    mode: 'dashboard',
    match: {}
};

const ConnectedViewer = connect(
    createSelector([
        state => urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
    ], (mode) => ({
        mode
    }))
)(Viewer);

export default ConnectedViewer;

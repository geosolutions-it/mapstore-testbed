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
import { withResizeDetector } from 'react-resize-detector';
import Loader from '@mapstore/framework/components/misc/Loader';

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
    match,
    isMobile,
    loading
}) {
    const mode = (isMobile || window.innerWidth < 769)
        ? 'viewer-simple'
        : 'viewer';
    return (
        <>
            <Page
                id={mode}
                includeCommon={false}
                plugins={plugins}
                params={match.params}
            />
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
        </>
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
        state => urlQuery.mobile || state.browser && state.browser.mobile,
        state => state?.controls?.viewer?.loading
    ], (isMobile, loading) => ({
        isMobile,
        loading
    }))
)(withResizeDetector(Viewer));

export default ConnectedViewer;

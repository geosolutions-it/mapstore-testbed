/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// framework plugins
import MapPlugin from '@mapstore/framework/plugins/Map';

// custom plugins
import ViewerLayoutPlugin from '@js/plugins/ViewerLayout';
import FooterPlugin from '@js/plugins/Footer';
import HeaderPlugin from '@js/plugins/Header';
import FGJSONPlugin from '@js/plugins/FGJSON';

// list of all the plugins and requires available for the application
export const plugins = {
    ViewerLayoutPlugin,
    FooterPlugin,
    HeaderPlugin,
    MapPlugin,
    FGJSONPlugin
};

// the requires are javascript functions, component or object
// that could be used inside the localConfig cfg object within an expression
// with the structure {context.myKeyFunction} or {context.MyKeyComponent}
export const requires = {};

export default {
    plugins,
    requires
};

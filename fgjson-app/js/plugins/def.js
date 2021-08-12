/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// framework plugins
import TOCPlugin from '@js/plugins/TOC';
import MapPlugin from '@mapstore/framework/plugins/Map';
import GlobeViewSwitcherPlugin from '@mapstore/framework/plugins/GlobeViewSwitcher';
import ToolbarPlugin from '@mapstore/framework/plugins/Toolbar';
import ZoomInPlugin from '@mapstore/framework/plugins/ZoomIn';
import ZoomOutPlugin from '@mapstore/framework/plugins/ZoomOut';

// custom plugins
import ViewerLayoutPlugin from '@js/plugins/ViewerLayout';
import FooterPlugin from '@js/plugins/Footer';
import HeaderPlugin from '@js/plugins/Header';
import LayerSettingsPlugin from '@js/plugins/LayerSettings';
import ProjectionSelectorPlugin from '@js/plugins/ProjectionSelector';
import FGJSONPlugin from '@js/plugins/FGJSON';
import TimelineFilterPlugin from '@js/plugins/TimelineFilter';

// list of all the plugins and requires available for the application
export const plugins = {
    ViewerLayoutPlugin,
    FooterPlugin,
    HeaderPlugin,
    MapPlugin,
    FGJSONPlugin,
    TOCPlugin,
    GlobeViewSwitcherPlugin,
    ToolbarPlugin,
    ZoomInPlugin,
    ZoomOutPlugin,
    LayerSettingsPlugin,
    ProjectionSelectorPlugin,
    TimelineFilterPlugin
};


import GroupNode from '@js/components/GroupNode';
import LayerNode from '@js/components/LayerNode';

// the requires are javascript functions, component or object
// that could be used inside the localConfig cfg object within an expression
// with the structure {context.myKeyFunction} or {context.MyKeyComponent}
export const requires = {
    GroupNode,
    LayerNode
};

export default {
    plugins,
    requires
};

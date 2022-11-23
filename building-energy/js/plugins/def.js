
/**
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import AboutPlugin from '@mapstore/framework/product/plugins/About';
import AddGroupPlugin from '@mapstore/framework/plugins/AddGroup';
import AnnotationsPlugin from '@mapstore/framework/plugins/Annotations';
import BackgroundSelectorPlugin from '@mapstore/framework/plugins/BackgroundSelector';
import CookiePlugin from '@mapstore/framework/plugins/Cookie';
import DrawerMenuPlugin from '@mapstore/framework/plugins/DrawerMenu';
import FeatureEditorPlugin from '@mapstore/framework/plugins/FeatureEditor';
import FilterLayerPlugin from '@mapstore/framework/plugins/FilterLayer';
import FullScreenPlugin from '@mapstore/framework/plugins/FullScreen';
import IdentifyPlugin from '@mapstore/framework/plugins/Identify';
import LayerDownloadPlugin from '@mapstore/framework/plugins/LayerDownload';
import LocatePlugin from '@mapstore/framework/plugins/Locate';
import MapPlugin from '@mapstore/framework/plugins/Map';
import MapExportPlugin from '@mapstore/framework/plugins/MapExport';
import MapFooterPlugin from '@mapstore/framework/plugins/MapFooter';
import MapImportPlugin from '@mapstore/framework/plugins/MapImport';
import MapViewsPlugin from '@mapstore/framework/plugins/MapViews';
import MeasurePlugin from '@mapstore/framework/plugins/Measure';
import MetadataExplorerPlugin from '@mapstore/framework/plugins/MetadataExplorer';
import MousePositionPlugin from '@mapstore/framework/plugins/MousePosition';
import NotificationsPlugin from '@mapstore/framework/plugins/Notifications';
import OmniBarPlugin from '@mapstore/framework/plugins/OmniBar';
import QueryPanelPlugin from '@mapstore/framework/plugins/QueryPanel';
import SearchPlugin from '@mapstore/framework/plugins/Search';
import SearchByBookmarkPlugin from '@mapstore/framework/plugins/SearchByBookmark';
import SearchServicesConfigPlugin from '@mapstore/framework/plugins/SearchServicesConfig';
import SettingsPlugin from '@mapstore/framework/plugins/Settings';
import SharePlugin from '@mapstore/framework/plugins/Share';
import SidebarMenuPlugin from '@mapstore/framework/plugins/SidebarMenu';
import SwipePlugin from '@mapstore/framework/plugins/Swipe';
import TOCPlugin from '@mapstore/framework/plugins/TOC';
import TOCItemsSettingsPlugin from '@mapstore/framework/plugins/TOCItemsSettings';
import TimelinePlugin from '@mapstore/framework/plugins/Timeline';
import ToolbarPlugin from '@mapstore/framework/plugins/Toolbar';
import WidgetsPlugin from '@mapstore/framework/plugins/Widgets';
import WidgetsBuilderPlugin from '@mapstore/framework/plugins/WidgetsBuilder';
import WidgetsTrayPlugin from '@mapstore/framework/plugins/WidgetsTray';
import ZoomAllPlugin from '@mapstore/framework/plugins/ZoomAll';

import ClassificationVectorLayerPlugin from '@js/plugins/ClassificationVectorLayer';

export default {
    plugins: {
        // custom plugins
        ClassificationVectorLayerPlugin,
        // framework plugins
        AboutPlugin,
        AddGroupPlugin,
        AnnotationsPlugin,
        BackgroundSelectorPlugin,
        CookiePlugin,
        DrawerMenuPlugin,
        FeatureEditorPlugin,
        FilterLayerPlugin,
        FullScreenPlugin,
        IdentifyPlugin,
        LayerDownloadPlugin,
        LocatePlugin,
        MapPlugin,
        MapExportPlugin,
        MapFooterPlugin,
        MapImportPlugin,
        MapViewsPlugin,
        MeasurePlugin,
        MetadataExplorerPlugin,
        MousePositionPlugin,
        NotificationsPlugin,
        OmniBarPlugin,
        QueryPanelPlugin,
        SearchPlugin,
        SearchByBookmarkPlugin,
        SearchServicesConfigPlugin,
        SettingsPlugin,
        SharePlugin,
        SidebarMenuPlugin,
        SwipePlugin,
        TOCPlugin,
        TOCItemsSettingsPlugin,
        TimelinePlugin,
        ToolbarPlugin,
        WidgetsPlugin,
        WidgetsBuilderPlugin,
        WidgetsTrayPlugin,
        ZoomAllPlugin
    },
    requires: {}
};

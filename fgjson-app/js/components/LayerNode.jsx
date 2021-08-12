/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Highlighter from 'react-highlight-words';
import castArray from 'lodash/castArray';
import find from 'lodash/find';
import { Glyphicon as GlyphiconRB } from 'react-bootstrap';
import tooltip from '@mapstore/framework/components/misc/enhancers/tooltip';
import SideCard from '@mapstore/framework/components/misc/cardgrids/SideCard';
import Toolbar from '@mapstore/framework/components/misc/toolbar/Toolbar';
import WMSLegend from '@mapstore/framework/components/TOC/fragments/WMSLegend';
import OpacitySlider from '@mapstore/framework/components/TOC/fragments/OpacitySlider';
import draggableComponent from '@mapstore/framework/components/TOC/enhancers/draggableComponent';
import { getTitleAndTooltip } from '@mapstore/framework/utils/TOCUtils';

const Glyphicon = tooltip(GlyphiconRB);

function LayerNode({
    node = {},
    filter = () => true,
    connectDragSource = (cmp) => cmp,
    connectDropTarget = (cmp) => cmp,
    currentZoomLvl,
    scales,
    legendOptions,
    onUpdateNode = () => {},
    propertiesChangeHandler = () => {},
    isDraggable,
    isDragging,
    isOver,
    filterText,
    selectedNodes = [],
    onSelect = () => {},
    currentLocale,
    tooltipOptions,
    buttons = [],
    indicators = []
}) {

    const visibility = node.visibility;
    const selected = selectedNodes.find((s) => s === node.id) ? true : false;
    const layerType = node.type;

    const errorClass = visibility && node.loadingError === 'Error' ? ' ms-node-error' : '';
    const warningClass = visibility && node.loadingError === 'Warning' ? ' ms-node-warning' : '';
    const draggableClass = isDraggable && ' ms-draggable' || '';
    const draggingClass = isDragging && ' ms-dragging' || '';
    const overClass = isOver && ' ms-over' || '';
    const selectedClass = selected ? ' ms-toc-node-selected' : '';

    const { title } = getTitleAndTooltip({ node, currentLocale, tooltipOptions });

    const nodeIndicators = [ ...castArray(indicators),  ...(node.indicators || []) ]
        .map((indicator, idx) => {
            if (indicator.type === 'dimension') {
                return find(node && node.dimensions || [], indicator.condition);
            }
            if (indicator.glyph) {
                return (
                    <div key={idx} className="ms-toc-node-indicator">
                        <Glyphicon key={indicator.key} glyph={indicator.glyph} { ...indicator.props } />
                    </div>);
            }
            return null;
        });

    const indicatorsComponents = [
        ...nodeIndicators,
        (errorClass || warningClass)
            && visibility &&
                <div
                    key="error-indicator"
                    className={`ms-toc-node-indicator${warningClass && ' ms-warning-indicator'
                        || errorClass && ' ms-danger-indicator'
                        || ''}`}>
                    <Glyphicon
                        tooltipId={
                            warningClass && 'toc.layerWarning'
                            || errorClass && 'toc.loadingerror'}
                        glyph="exclamation-mark"/>
                </div>

    ].filter(val => val);

    const indicatorClass = indicatorsComponents.length > 0 ? ' with-indicators' : '';

    const card = node.dummy
        ? <div style={{ height: 2 }} />
        : <div
            style={{ position: 'relative' }}>
            <SideCard
                preview={node.loading
                    ? <div className="ms-toc-loader">
                        <div className="mapstore-small-size-loader"/>
                    </div>
                    : <Glyphicon glyph="1-layer"/>}
                style={{ opacity: visibility ? 1.0 : 0.4 }}
                className={`ms-toc-layer${draggableClass}${draggingClass}${overClass}${warningClass}${errorClass}${indicatorClass}${selectedClass}`}
                size="sm"
                title={filterText
                    ? <Highlighter
                        highlightClassName="ms-mark"
                        searchWords={[ filterText ]}
                        autoEscape
                        textToHighlight={title}
                    />
                    : title
                }
                onClick={(properties, event) => {
                    event.stopPropagation();
                    if (onSelect) { onSelect(node.id, 'layer', event.ctrlKey); }
                }}
                headTools={layerType === 'wms' &&
                    <Toolbar
                        btnDefaultProps={selected
                            ? {
                                className: 'square-button-md',
                                bsStyle: 'primary'
                            }
                            : {
                                className: 'square-button-md no-border',
                                bsStyle: 'default'
                            }}
                        buttons={[
                            {
                                glyph: node.expanded ? 'collapse-down' : 'expand',
                                tooltip: 'Display legend',
                                onClick: (event) => {
                                    event.stopPropagation();
                                    onUpdateNode(node.id, 'layers', { expanded: !node.expanded });
                                }
                            }
                        ]}/>
                }
                tools={
                    <Toolbar
                        btnDefaultProps={selected
                            ? {
                                className: 'square-button-md',
                                bsStyle: 'primary'
                            }
                            : {
                                className: 'square-button-md no-border',
                                bsStyle: 'default'
                            }}
                        buttons={[
                            ...buttons
                                .map((button) => ({
                                    ...button,
                                    node,
                                    onChange: propertiesChangeHandler
                                })),
                            {
                                glyph: visibility ? 'eye-open' : 'eye-close',
                                tooltipId: 'toc.toggleLayerVisibility',
                                onClick: (event) => {
                                    event.stopPropagation();
                                    propertiesChangeHandler(node.id, { visibility: !visibility });
                                }
                            }
                        ]}/>
                }
                body={
                    <>
                        {indicatorsComponents.length > 0
                        && <div className="ms-toc-node-indicators">
                            {indicatorsComponents}
                        </div>}
                        {node.expanded && <div className="ms-layer-node-body">
                            <WMSLegend
                                node={node}
                                currentZoomLvl={currentZoomLvl}
                                scales={scales}
                                { ...legendOptions } />
                        </div>}
                        <OpacitySlider
                            opacity={node.opacity}
                            disabled={!visibility}
                            onChange={opacity => onUpdateNode(node.id, 'layers', { opacity })}/>
                    </>
                }/>
        </div>;
    if (node.showComponent !== false
    && !node.hide
    && filter(node)
    && (!filterText || node.title && node.title.toLowerCase().indexOf(filterText.toLowerCase()) !== -1)) {
        return connectDropTarget(isDraggable ? connectDragSource(card) : card);
    }
    return null;
}
LayerNode.propTypes = {
    node: PropTypes.object,
    filter: PropTypes.func,
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    currentZoomLvl: PropTypes.number,
    scales: PropTypes.array,
    legendOptions: PropTypes.object,
    onUpdateNode: PropTypes.func,
    onZoomTo: PropTypes.func,
    isDraggable: PropTypes.bool,
    isDragging: PropTypes.bool,
    isOver: PropTypes.bool,
    filterText: PropTypes.string,
    additionalLayers: PropTypes.array,
    parentCategoryName: PropTypes.string,
    buttons: PropTypes.array
};
export default draggableComponent('LayerOrGroup', class extends Component { render() { return <LayerNode {...this.props}/>; }});

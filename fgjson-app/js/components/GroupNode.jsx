/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import draggableComponent from '@mapstore/framework/components/TOC/enhancers/draggableComponent';
import GroupChildren from '@mapstore/framework/components/TOC/fragments/GroupChildren';
import SideCard from '@mapstore/framework/components/misc/cardgrids/SideCard';
import { getTitleAndTooltip } from '@mapstore/framework/utils/TOCUtils';
import Toolbar from '@mapstore/framework/components/misc/toolbar/Toolbar';
import { Glyphicon as GlyphiconRB } from 'react-bootstrap';
import tooltip from '@mapstore/framework/components/misc/enhancers/tooltip';

const Glyphicon = tooltip(GlyphiconRB);

function GroupNode({
    node = {},
    level,
    filter,
    onSort = () => {},
    onError = () => {},
    setDndState = () => {},
    onSelect = () => {},
    currentLocale,
    tooltipOptions,
    selectedNodes = [],
    onToggle = () => {},
    propertiesChangeHandler = () => {},
    isDraggable,
    isDragging,
    isOver,
    children,
    connectDragPreview = cmp => cmp,
    connectDropTarget = cmp => cmp,
    connectDragSource = cmp => cmp,
    filterText
}) {

    const { title } = getTitleAndTooltip({  node, currentLocale, tooltipOptions });
    const selected = selectedNodes.find((s) => s === node.id) ? true : false;
    const expanded = node.expanded !== undefined ? node.expanded : true;
    const visibility = node.visibility;

    const selectedClass = selected ? ' ms-toc-node-selected' : '';
    const draggableClass = isDraggable && ' ms-draggable' || '';
    const draggingClass = isDragging && ' ms-dragging' || '';
    const overClass = isOver && ' ms-over' || '';

    const error = visibility && node.loadingError ? true : false;

    const nodeIndicators = (node.indicators || [])
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
        (error)
            && visibility &&
                <div
                    key="error-indicator"
                    className="ms-toc-node-indicator ms-danger-indicator">
                    <Glyphicon
                        tooltipId="toc.loadingerror"
                        glyph="exclamation-mark"/>
                </div>
    ].filter(val => val);

    const indicatorClass = indicatorsComponents.length > 0 ? ' with-indicators' : '';

    const card = (<div style={{ position: 'relative' }}>
        <SideCard
            size="sm"
            preview={<Glyphicon glyph={expanded ? 'folder-open' : 'folder-close'}/>}
            className={`ms-toc-group${draggableClass}${draggingClass}${overClass}${selectedClass}${indicatorClass}`}
            title={title}
            onClick={(properties, event) => {
                event.stopPropagation();
                if (onSelect) { onSelect(node.id, 'layer', event.ctrlKey); }
            }}
            headTools={
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
                            glyph: expanded ? 'collapse-down' : 'expand',
                            visible: !filterText,
                            // tooltipId: 'toc.toggleLayerVisibility',
                            onClick: (event) => {
                                event.stopPropagation();
                                onToggle(node.id, expanded);
                            }
                        }
                    ]}/>
            }
            body={indicatorsComponents.length > 0
                && <div className="ms-toc-node-indicators">
                    {indicatorsComponents}
                </div>}
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
                        {
                            glyph: visibility ? 'eye-open' : 'eye-close',
                            tooltipId: 'toc.toggleLayerVisibility',
                            onClick: (event) => {
                                event.stopPropagation();
                                propertiesChangeHandler(node.id, { visibility: !visibility });
                            }
                        }
                    ]}/>
            }/></div>);
    return (
        <>
            {connectDragPreview(connectDropTarget(isDraggable ? connectDragSource(card) : card))}
            {expanded && !isDragging
                ? <div className="ms-toc-children-container">
                    <GroupChildren
                        node={node}
                        filter={filter}
                        onSort={onSort}
                        level={level + 1}
                        onError={onError}
                        setDndState={setDndState}
                        position="collapsible">
                        {children}
                    </GroupChildren>
                </div>
                : null}
        </>
    );
}

export default draggableComponent('LayerOrGroup', class extends Component { render() { return <GroupNode {...this.props}/>; }});

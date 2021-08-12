/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import Timeline from '@mapstore/framework/components/time/TimelineComponent';
import moment from 'moment';
import { setControlProperty } from '@mapstore/framework/actions/controls';
import { Glyphicon } from 'react-bootstrap';
import {
    getLayerTimeItems,
    getTimelineRange
} from '@js/selectors/timelinefilter';

function TimelineFilter({
    timelineItems,
    readOnly,
    customTimes,
    rangeItems,
    onChangeCustomTimes
}) {

    function validateRange(range) {
        if (moment(range.start).isAfter(range.end)) {
            return {
                start: moment(range.end).toISOString(),
                end: moment(range.start).toISOString()
            };
        }
        return {
            start: moment(range.start).toISOString(),
            end: moment(range.end).toISOString()
        };
    }

    const onTimeChanged = useRef();
    onTimeChanged.current = (newCustomTimes) => {
        onChangeCustomTimes(validateRange({
            ...customTimes,
            ...newCustomTimes
        }));
    };

    return (
        <>
            <div
                className="timeline-plugin"
                style={{
                    position: 'relative',
                    display: readOnly ? 'none' : 'block',
                    width: 'calc(100% - 16px)',
                    margin: 8
                }}
            >
                {(customTimes.start && customTimes.end) && <div style={{ padding: 8 }}>
                    <Glyphicon glyph="filter"/> {' '}
                    From <strong>{moment(customTimes.start).format('MMMM Do YYYY')}</strong>
                    {' - '}
                    To <strong>{moment(customTimes.end).format('MMMM Do YYYY')}</strong>
                </div>}
                <Timeline
                    items={timelineItems.ranges}
                    readOnly={readOnly}
                    rangeItems={rangeItems}
                    customTimes={customTimes}
                    animate={false}
                    timechangedHandler={({ id, time }) => {
                        onTimeChanged.current({
                            [id]: time
                        });
                    }}
                    options={{
                        showCurrentTime: false,
                        snap: null,
                        editable: {
                            add: false,
                            updateTime: false,
                            updateGroup: false,
                            remove: false,
                            overrideItems: false
                        },
                        onMove: (item, callback) => {
                            onTimeChanged.current({
                                end: item.end,
                                start: item.start
                            });
                            callback(item);
                        }
                    }}
                />
            </div>
        </>
    );
}

const ConnectedTimelineFilter = connect(
    createSelector([
        getLayerTimeItems,
        getTimelineRange
    ], (timelineItems, timelineRange) => ({
        timelineItems,
        readOnly: timelineItems.ranges.length === 0,
        customTimes: timelineItems.ranges.length === 0
            ? {}
            : timelineRange,
        rangeItems: timelineRange
            ? [
                {
                    id: 'timeline-range',
                    start: timelineRange.start,
                    end: timelineRange.end,
                    type: 'background',
                    className: 'ms-timeline-range',
                    editable: { updateTime: true, updateGroup: false, remove: false }
                }
            ]
            : []
    })),
    {
        onChangeCustomTimes: setControlProperty.bind(null, 'timelineFilter', 'customTimes')
    }
)(TimelineFilter);

export default createPlugin('TimelineFilter', {
    component: ConnectedTimelineFilter,
    reducers: {},
    epics: {},
    options: {},
    containers: {
        ViewerLayout: {
            priority: 1
        }
    }
});

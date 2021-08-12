/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { layersSelector } from '@mapstore/framework/selectors/layers';
import moment from 'moment';
import { uniqBy } from 'lodash';

export const getLayerTimeItems = (state) => {
    const layers = layersSelector(state);
    const fgJsonLayers = layers.filter(layer => layer.type === 'fgJson');
    const groups = fgJsonLayers.map(({ id, title }) => ({
        id,
        content: title
    }));
    const items = fgJsonLayers.reduce((acc, { collection, id }) => {
        return [
            ...acc,
            ...uniqBy(
                collection.features.filter((feature) => feature?.when?.interval),
                (feature) => feature.when.interval[0] + '_' + feature.when.interval[1])
                .map((feature, idx) => ({
                    id: `${id}-${idx}`,
                    start: moment(feature.when.interval[0]),
                    end: moment(feature.when.interval[0]),
                    group: id
                }))
        ];
    }, []);
    const ranges = fgJsonLayers.map(({ collection, title, id }) => {
        const when = collection?.features?.reduce((acc, feature) => feature?.when?.interval ? [...acc, ...feature.when.interval.map(date => moment(date))] : [], []) || [];
        if (when.length === 0) {
            return null;
        }
        const start = moment.min(when);
        const end = moment.max(when);
        return {
            id,
            content: title + ': ' + start.format('MMM Do YY') + ' - ' + end.format('MMM Do YY'),
            start,
            end
        };
    })
        .filter((item) => item);
    return {
        groups,
        items,
        ranges
    };
};

export const getTimelineRange = (state) => {
    const currentRange = state?.controls?.timelineFilter?.customTimes;
    if (currentRange) {
        return currentRange;
    }
    const timelineItems = getLayerTimeItems(state);
    const allIntervals = (timelineItems.ranges || []).reduce((acc, item) => [...acc, item.start, item.end], []);
    if (allIntervals.length === 0) {
        return null;
    }
    const start = moment.min(allIntervals);
    const end = moment.max(allIntervals);
    return {
        start,
        end
    };
};

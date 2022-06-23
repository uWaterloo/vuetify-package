// Styles
import './calendar-with-events.sass';
// Directives
import ripple from '../../../directives/ripple';
// Mixins
import CalendarBase from './calendar-base';
// Helpers
import { escapeHTML } from '../../../util/helpers';
// Util
import props from '../util/props';
import { CalendarEventOverlapModes, } from '../modes';
import { getDayIdentifier, diffMinutes, } from '../util/timestamp';
import { parseEvent, isEventStart, isEventOn, isEventOverlapping, isEventHiddenOn, } from '../util/events';
const WIDTH_FULL = 100;
const WIDTH_START = 95;
const MINUTES_IN_DAY = 1440;
/* @vue/component */
export default CalendarBase.extend({
    name: 'calendar-with-events',
    directives: {
        ripple,
    },
    props: {
        ...props.events,
        ...props.calendar,
        ...props.category,
    },
    computed: {
        noEvents() {
            return this.events.length === 0;
        },
        parsedEvents() {
            return this.events.map(this.parseEvent);
        },
        parsedEventOverlapThreshold() {
            return parseInt(this.eventOverlapThreshold);
        },
        eventTimedFunction() {
            return typeof this.eventTimed === 'function'
                ? this.eventTimed
                : event => !!event[this.eventTimed];
        },
        eventCategoryFunction() {
            return typeof this.eventCategory === 'function'
                ? this.eventCategory
                : event => event[this.eventCategory];
        },
        eventTextColorFunction() {
            return typeof this.eventTextColor === 'function'
                ? this.eventTextColor
                : () => this.eventTextColor;
        },
        eventNameFunction() {
            return typeof this.eventName === 'function'
                ? this.eventName
                : (event, timedEvent) => escapeHTML(event.input[this.eventName] || '');
        },
        eventModeFunction() {
            return typeof this.eventOverlapMode === 'function'
                ? this.eventOverlapMode
                : CalendarEventOverlapModes[this.eventOverlapMode];
        },
        eventWeekdays() {
            return this.parsedWeekdays;
        },
        categoryMode() {
            return this.type === 'category';
        },
    },
    methods: {
        eventColorFunction(e) {
            return typeof this.eventColor === 'function'
                ? this.eventColor(e)
                : e.color || this.eventColor;
        },
        parseEvent(input, index = 0) {
            return parseEvent(input, index, this.eventStart, this.eventEnd, this.eventTimedFunction(input), this.categoryMode ? this.eventCategoryFunction(input) : false);
        },
        formatTime(withTime, ampm) {
            const formatter = this.getFormatter({
                timeZone: 'UTC',
                hour: 'numeric',
                minute: withTime.minute > 0 ? 'numeric' : undefined,
            });
            return formatter(withTime, true);
        },
        updateEventVisibility() {
            if (this.noEvents || !this.eventMore) {
                return;
            }
            const eventHeight = this.eventHeight;
            const eventsMap = this.getEventsMap();
            for (const date in eventsMap) {
                const { parent, events, more } = eventsMap[date];
                if (!more) {
                    break;
                }
                const parentBounds = parent.getBoundingClientRect();
                const last = events.length - 1;
                const eventsSorted = events.map(event => ({
                    event,
                    bottom: event.getBoundingClientRect().bottom,
                })).sort((a, b) => a.bottom - b.bottom);
                let hidden = 0;
                for (let i = 0; i <= last; i++) {
                    const bottom = eventsSorted[i].bottom;
                    const hide = i === last
                        ? (bottom > parentBounds.bottom)
                        : (bottom + eventHeight > parentBounds.bottom);
                    if (hide) {
                        eventsSorted[i].event.style.display = 'none';
                        hidden++;
                    }
                }
                if (hidden) {
                    more.style.display = '';
                    more.innerHTML = this.$vuetify.lang.t(this.eventMoreText, hidden);
                }
                else {
                    more.style.display = 'none';
                }
            }
        },
        getEventsMap() {
            const eventsMap = {};
            const elements = this.$refs.events;
            if (!elements || !elements.forEach) {
                return eventsMap;
            }
            elements.forEach(el => {
                const date = el.getAttribute('data-date');
                if (el.parentElement && date) {
                    if (!(date in eventsMap)) {
                        eventsMap[date] = {
                            parent: el.parentElement,
                            more: null,
                            events: [],
                        };
                    }
                    if (el.getAttribute('data-more')) {
                        eventsMap[date].more = el;
                    }
                    else {
                        eventsMap[date].events.push(el);
                        el.style.display = '';
                    }
                }
            });
            return eventsMap;
        },
        genDayEvent({ event }, day) {
            const eventHeight = this.eventHeight;
            const eventMarginBottom = this.eventMarginBottom;
            const dayIdentifier = getDayIdentifier(day);
            const week = day.week;
            const start = dayIdentifier === event.startIdentifier;
            let end = dayIdentifier === event.endIdentifier;
            let width = WIDTH_START;
            if (!this.categoryMode) {
                for (let i = day.index + 1; i < week.length; i++) {
                    const weekdayIdentifier = getDayIdentifier(week[i]);
                    if (event.endIdentifier >= weekdayIdentifier) {
                        width += WIDTH_FULL;
                        end = end || weekdayIdentifier === event.endIdentifier;
                    }
                    else {
                        end = true;
                        break;
                    }
                }
            }
            const scope = { eventParsed: event, day, start, end, timed: false };
            return this.genEvent(event, scope, false, {
                staticClass: 'v-event',
                class: {
                    'v-event-start': start,
                    'v-event-end': end,
                },
                style: {
                    height: `${eventHeight}px`,
                    width: `${width}%`,
                    'margin-bottom': `${eventMarginBottom}px`,
                },
                attrs: {
                    'data-date': day.date,
                },
                key: event.index,
                ref: 'events',
                refInFor: true,
            });
        },
        genTimedEvent({ event, left, width }, day) {
            if (day.timeDelta(event.end) < 0 || day.timeDelta(event.start) >= 1 || isEventHiddenOn(event, day)) {
                return false;
            }
            const dayIdentifier = getDayIdentifier(day);
            const start = event.startIdentifier >= dayIdentifier;
            const end = event.endIdentifier > dayIdentifier;
            const top = start ? day.timeToY(event.start) : 0;
            const bottom = end ? day.timeToY(MINUTES_IN_DAY) : day.timeToY(event.end);
            const height = Math.max(this.eventHeight, bottom - top);
            const scope = { eventParsed: event, day, start, end, timed: true };
            return this.genEvent(event, scope, true, {
                staticClass: 'v-event-timed',
                style: {
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${left}%`,
                    width: `${width}%`,
                },
            });
        },
        genEvent(event, scopeInput, timedEvent, data) {
            const slot = this.$scopedSlots.event;
            const text = this.eventTextColorFunction(event.input);
            const background = this.eventColorFunction(event.input);
            const overlapsNoon = event.start.hour < 12 && event.end.hour >= 12;
            const singline = diffMinutes(event.start, event.end) <= this.parsedEventOverlapThreshold;
            const formatTime = this.formatTime;
            const timeSummary = () => formatTime(event.start, overlapsNoon) + ' - ' + formatTime(event.end, true);
            const eventSummary = () => {
                const name = this.eventNameFunction(event, timedEvent);
                if (event.start.hasTime) {
                    const eventSummaryClass = 'v-event-summary';
                    if (timedEvent) {
                        const time = timeSummary();
                        const delimiter = singline ? ', ' : '<br>';
                        return `<span class="${eventSummaryClass}"><strong>${name}</strong>${delimiter}${time}</span>`;
                    }
                    else {
                        const time = formatTime(event.start, true);
                        return `<span class="${eventSummaryClass}"><strong>${time}</strong> ${name}</span>`;
                    }
                }
                return name;
            };
            const scope = {
                ...scopeInput,
                event: event.input,
                outside: scopeInput.day.outside,
                singline,
                overlapsNoon,
                formatTime,
                timeSummary,
                eventSummary,
            };
            return this.$createElement('div', this.setTextColor(text, this.setBackgroundColor(background, {
                on: this.getDefaultMouseEventHandlers(':event', nativeEvent => ({ ...scope, nativeEvent })),
                directives: [{
                        name: 'ripple',
                        value: this.eventRipple ?? true,
                    }],
                ...data,
            })), slot
                ? slot(scope)
                : [this.genName(eventSummary)]);
        },
        genName(eventSummary) {
            return this.$createElement('div', {
                staticClass: 'pl-1',
                domProps: {
                    innerHTML: eventSummary(),
                },
            });
        },
        genPlaceholder(day) {
            const height = this.eventHeight + this.eventMarginBottom;
            return this.$createElement('div', {
                style: {
                    height: `${height}px`,
                },
                attrs: {
                    'data-date': day.date,
                },
                ref: 'events',
                refInFor: true,
            });
        },
        genMore(day) {
            const eventHeight = this.eventHeight;
            const eventMarginBottom = this.eventMarginBottom;
            return this.$createElement('div', {
                staticClass: 'v-event-more pl-1',
                class: {
                    'v-outside': day.outside,
                },
                attrs: {
                    'data-date': day.date,
                    'data-more': 1,
                },
                directives: [{
                        name: 'ripple',
                        value: this.eventRipple ?? true,
                    }],
                on: this.getDefaultMouseEventHandlers(':more', nativeEvent => {
                    return { nativeEvent, ...day };
                }),
                style: {
                    display: 'none',
                    height: `${eventHeight}px`,
                    'margin-bottom': `${eventMarginBottom}px`,
                },
                ref: 'events',
                refInFor: true,
            });
        },
        getVisibleEvents() {
            const start = getDayIdentifier(this.days[0]);
            const end = getDayIdentifier(this.days[this.days.length - 1]);
            return this.parsedEvents.filter(event => isEventOverlapping(event, start, end));
        },
        isEventForCategory(event, category) {
            return !this.categoryMode ||
                (typeof category === 'object' && category.categoryName &&
                    category.categoryName === event.category) ||
                (typeof event.category === 'string' && category === event.category) ||
                (typeof event.category !== 'string' && category === null);
        },
        getEventsForDay(day) {
            const identifier = getDayIdentifier(day);
            const firstWeekday = this.eventWeekdays[0];
            return this.parsedEvents.filter(event => isEventStart(event, day, identifier, firstWeekday));
        },
        getEventsForDayAll(day) {
            const identifier = getDayIdentifier(day);
            const firstWeekday = this.eventWeekdays[0];
            return this.parsedEvents.filter(event => event.allDay &&
                (this.categoryMode ? isEventOn(event, identifier) : isEventStart(event, day, identifier, firstWeekday)) &&
                this.isEventForCategory(event, day.category));
        },
        getEventsForDayTimed(day) {
            const identifier = getDayIdentifier(day);
            return this.parsedEvents.filter(event => !event.allDay &&
                isEventOn(event, identifier) &&
                this.isEventForCategory(event, day.category));
        },
        getScopedSlots() {
            if (this.noEvents) {
                return { ...this.$scopedSlots };
            }
            const mode = this.eventModeFunction(this.parsedEvents, this.eventWeekdays[0], this.parsedEventOverlapThreshold);
            const isNode = (input) => !!input;
            const getSlotChildren = (day, getter, mapper, timed) => {
                const events = getter(day);
                const visuals = mode(day, events, timed, this.categoryMode);
                if (timed) {
                    return visuals.map(visual => mapper(visual, day)).filter(isNode);
                }
                const children = [];
                visuals.forEach((visual, index) => {
                    while (children.length < visual.column) {
                        children.push(this.genPlaceholder(day));
                    }
                    const mapped = mapper(visual, day);
                    if (mapped) {
                        children.push(mapped);
                    }
                });
                return children;
            };
            const slots = this.$scopedSlots;
            const slotDay = slots.day;
            const slotDayHeader = slots['day-header'];
            const slotDayBody = slots['day-body'];
            return {
                ...slots,
                day: (day) => {
                    let children = getSlotChildren(day, this.getEventsForDay, this.genDayEvent, false);
                    if (children && children.length > 0 && this.eventMore) {
                        children.push(this.genMore(day));
                    }
                    if (slotDay) {
                        const slot = slotDay(day);
                        if (slot) {
                            children = children ? children.concat(slot) : slot;
                        }
                    }
                    return children;
                },
                'day-header': (day) => {
                    let children = getSlotChildren(day, this.getEventsForDayAll, this.genDayEvent, false);
                    if (slotDayHeader) {
                        const slot = slotDayHeader(day);
                        if (slot) {
                            children = children ? children.concat(slot) : slot;
                        }
                    }
                    return children;
                },
                'day-body': (day) => {
                    const events = getSlotChildren(day, this.getEventsForDayTimed, this.genTimedEvent, true);
                    let children = [
                        this.$createElement('div', {
                            staticClass: 'v-event-timed-container',
                        }, events),
                    ];
                    if (slotDayBody) {
                        const slot = slotDayBody(day);
                        if (slot) {
                            children = children.concat(slot);
                        }
                    }
                    return children;
                },
            };
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItd2l0aC1ldmVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ2FsZW5kYXIvbWl4aW5zL2NhbGVuZGFyLXdpdGgtZXZlbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLDZCQUE2QixDQUFBO0FBS3BDLGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUUvQyxTQUFTO0FBQ1QsT0FBTyxZQUFZLE1BQU0saUJBQWlCLENBQUE7QUFFMUMsVUFBVTtBQUNWLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUVsRCxPQUFPO0FBQ1AsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFBO0FBQ2pDLE9BQU8sRUFDTCx5QkFBeUIsR0FDMUIsTUFBTSxVQUFVLENBQUE7QUFDakIsT0FBTyxFQUNMLGdCQUFnQixFQUFFLFdBQVcsR0FDOUIsTUFBTSxtQkFBbUIsQ0FBQTtBQUMxQixPQUFPLEVBQ0wsVUFBVSxFQUNWLFlBQVksRUFDWixTQUFTLEVBQ1Qsa0JBQWtCLEVBQ2xCLGVBQWUsR0FDaEIsTUFBTSxnQkFBZ0IsQ0FBQTtBQTJDdkIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFBO0FBQ3RCLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUN0QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUE7QUFFM0Isb0JBQW9CO0FBQ3BCLGVBQWUsWUFBWSxDQUFDLE1BQU0sQ0FBQztJQUNqQyxJQUFJLEVBQUUsc0JBQXNCO0lBRTVCLFVBQVUsRUFBRTtRQUNWLE1BQU07S0FDUDtJQUVELEtBQUssRUFBRTtRQUNMLEdBQUcsS0FBSyxDQUFDLE1BQU07UUFDZixHQUFHLEtBQUssQ0FBQyxRQUFRO1FBQ2pCLEdBQUcsS0FBSyxDQUFDLFFBQVE7S0FDbEI7SUFFRCxRQUFRLEVBQUU7UUFDUixRQUFRO1lBQ04sT0FBTyxJQUFJLENBQUMs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QzthQUNGLENBQUE7UUFDSCxDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9jYWxlbmRhci13aXRoLWV2ZW50cy5zYXNzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUsIFZOb2RlRGF0YSB9IGZyb20gJ3Z1ZSdcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IHJpcHBsZSBmcm9tICcuLi8uLi8uLi9kaXJlY3RpdmVzL3JpcHBsZSdcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ2FsZW5kYXJCYXNlIGZyb20gJy4vY2FsZW5kYXItYmFzZSdcblxuLy8gSGVscGVyc1xuaW1wb3J0IHsgZXNjYXBlSFRNTCB9IGZyb20gJy4uLy4uLy4uL3V0aWwvaGVscGVycydcblxuLy8gVXRpbFxuaW1wb3J0IHByb3BzIGZyb20gJy4uL3V0aWwvcHJvcHMnXG5pbXBvcnQge1xuICBDYWxlbmRhckV2ZW50T3ZlcmxhcE1vZGVzLFxufSBmcm9tICcuLi9tb2RlcydcbmltcG9ydCB7XG4gIGdldERheUlkZW50aWZpZXIsIGRpZmZNaW51dGVzLFxufSBmcm9tICcuLi91dGlsL3RpbWVzdGFtcCdcbmltcG9ydCB7XG4gIHBhcnNlRXZlbnQsXG4gIGlzRXZlbnRTdGFydCxcbiAgaXNFdmVudE9uLFxuICBpc0V2ZW50T3ZlcmxhcHBpbmcsXG4gIGlzRXZlbnRIaWRkZW5Pbixcbn0gZnJvbSAnLi4vdXRpbC9ldmVudHMnXG5pbXBvcnQge1xuICBDYWxlbmRhclRpbWVzdGFtcCxcbiAgQ2FsZW5kYXJFdmVudFBhcnNlZCxcbiAgQ2FsZW5kYXJFdmVudFZpc3VhbCxcbiAgQ2FsZW5kYXJFdmVudENvbG9yRnVuY3Rpb24sXG4gIENhbGVuZGFyRXZlbnROYW1lRnVuY3Rpb24sXG4gIENhbGVuZGFyRXZlbnRUaW1lZEZ1bmN0aW9uLFxuICBDYWxlbmRhckRheVNsb3RTY29wZSxcbiAgQ2FsZW5kYXJEYXlCb2R5U2xvdFNjb3BlLFxuICBDYWxlbmRhckV2ZW50T3ZlcmxhcE1vZGUsXG4gIENhbGVuZGFyRXZlbnQsXG4gIENhbGVuZGFyRXZlbnRDYXRlZ29yeUZ1bmN0aW9uLFxuICBDYWxlbmRhckNhdGVnb3J5LFxufSBmcm9tICd2dWV0aWZ5L3R5cGVzJ1xuXG4vLyBUeXBlc1xudHlwZSBWRXZlbnRHZXR0ZXI8RD4gPSAoZGF5OiBEKSA9PiBDYWxlbmRhckV2ZW50UGFyc2VkW11cblxudHlwZSBWRXZlbnRWaXN1YWxUb05vZGU8RD4gPSAodmlzdWFsOiBDYWxlbmRhckV2ZW50VmlzdWFsLCBkYXk6IEQpID0+IFZOb2RlIHwgZmFsc2VcblxudHlwZSBWRXZlbnRzVG9Ob2RlcyA9IDxEIGV4dGVuZHMgQ2FsZW5kYXJEYXlTbG90U2NvcGU+KFxuICBkYXk6IEQsXG4gIGdldHRlcjogVkV2ZW50R2V0dGVyPEQ+LFxuICBtYXBwZXI6IFZFdmVudFZpc3VhbFRvTm9kZTxEPixcbiAgdGltZWQ6IGJvb2xlYW4pID0+IFZOb2RlW10gfCB1bmRlZmluZWRcblxudHlwZSBWRGFpbHlFdmVudHNNYXAgPSB7XG4gIFtkYXRlOiBzdHJpbmddOiB7XG4gICAgcGFyZW50OiBIVE1MRWxlbWVudFxuICAgIG1vcmU6IEhUTUxFbGVtZW50IHwgbnVsbFxuICAgIGV2ZW50czogSFRNTEVsZW1lbnRbXVxuICB9XG59XG5cbmludGVyZmFjZSBWRXZlbnRTY29wZUlucHV0IHtcbiAgZXZlbnRQYXJzZWQ6IENhbGVuZGFyRXZlbnRQYXJzZWRcbiAgZGF5OiBDYWxlbmRhckRheVNsb3RTY29wZVxuICBzdGFydDogYm9vbGVhblxuICBlbmQ6IGJvb2xlYW5cbiAgdGltZWQ6IGJvb2xlYW5cbn1cblxuY29uc3QgV0lEVEhfRlVMTCA9IDEwMFxuY29uc3QgV0lEVEhfU1RBUlQgPSA5NVxuY29uc3QgTUlOVVRFU19JTl9EQVkgPSAxNDQwXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBDYWxlbmRhckJhc2UuZXh0ZW5kKHtcbiAgbmFtZTogJ2NhbGVuZGFyLXdpdGgtZXZlbnRzJyxcblxuICBkaXJlY3RpdmVzOiB7XG4gICAgcmlwcGxlLFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgLi4ucHJvcHMuZXZlbnRzLFxuICAgIC4uLnByb3BzLmNhbGVuZGFyLFxuICAgIC4uLnByb3BzLmNhdGVnb3J5LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgbm9FdmVudHMgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLmxlbmd0aCA9PT0gMFxuICAgIH0sXG4gICAgcGFyc2VkRXZlbnRzICgpOiBDYWxlbmRhckV2ZW50UGFyc2VkW10ge1xuICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm1hcCh0aGlzLnBhcnNlRXZlbnQpXG4gICAgfSxcbiAgICBwYXJzZWRFdmVudE92ZXJsYXBUaHJlc2hvbGQgKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy5ldmVudE92ZXJsYXBUaHJlc2hvbGQpXG4gICAgfSxcbiAgICBldmVudFRpbWVkRnVuY3Rpb24gKCk6IENhbGVuZGFyRXZlbnRUaW1lZEZ1bmN0aW9uIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5ldmVudFRpbWVkID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gdGhpcy5ldmVudFRpbWVkXG4gICAgICAgIDogZXZlbnQgPT4gISFldmVudFt0aGlzLmV2ZW50VGltZWQgYXMgc3RyaW5nXVxuICAgIH0sXG4gICAgZXZlbnRDYXRlZ29yeUZ1bmN0aW9uICgpOiBDYWxlbmRhckV2ZW50Q2F0ZWdvcnlGdW5jdGlvbiB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRoaXMuZXZlbnRDYXRlZ29yeSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHRoaXMuZXZlbnRDYXRlZ29yeVxuICAgICAgICA6IGV2ZW50ID0+IGV2ZW50W3RoaXMuZXZlbnRDYXRlZ29yeSBhcyBzdHJpbmddXG4gICAgfSxcbiAgICBldmVudFRleHRDb2xvckZ1bmN0aW9uICgpOiBDYWxlbmRhckV2ZW50Q29sb3JGdW5jdGlvbiB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRoaXMuZXZlbnRUZXh0Q29sb3IgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB0aGlzLmV2ZW50VGV4dENvbG9yXG4gICAgICAgIDogKCkgPT4gdGhpcy5ldmVudFRleHRDb2xvciBhcyBzdHJpbmdcbiAgICB9LFxuICAgIGV2ZW50TmFtZUZ1bmN0aW9uICgpOiBDYWxlbmRhckV2ZW50TmFtZUZ1bmN0aW9uIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5ldmVudE5hbWUgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB0aGlzLmV2ZW50TmFtZVxuICAgICAgICA6IChldmVudCwgdGltZWRFdmVudCkgPT4gZXNjYXBlSFRNTChldmVudC5pbnB1dFt0aGlzLmV2ZW50TmFtZSBhcyBzdHJpbmddIGFzIHN0cmluZyB8fCAnJylcbiAgICB9LFxuICAgIGV2ZW50TW9kZUZ1bmN0aW9uICgpOiBDYWxlbmRhckV2ZW50T3ZlcmxhcE1vZGUge1xuICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLmV2ZW50T3ZlcmxhcE1vZGUgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB0aGlzLmV2ZW50T3ZlcmxhcE1vZGVcbiAgICAgICAgOiBDYWxlbmRhckV2ZW50T3ZlcmxhcE1vZGVzW3RoaXMuZXZlbnRPdmVybGFwTW9kZV1cbiAgICB9LFxuICAgIGV2ZW50V2Vla2RheXMgKCk6IG51bWJlcltdIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlZFdlZWtkYXlzXG4gICAgfSxcbiAgICBjYXRlZ29yeU1vZGUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gJ2NhdGVnb3J5J1xuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGV2ZW50Q29sb3JGdW5jdGlvbiAoZTogQ2FsZW5kYXJFdmVudCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gdHlwZW9mIHRoaXMuZXZlbnRDb2xvciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHRoaXMuZXZlbnRDb2xvcihlKVxuICAgICAgICA6IGUuY29sb3IgfHwgdGhpcy5ldmVudENvbG9yXG4gICAgfSxcbiAgICBwYXJzZUV2ZW50IChpbnB1dDogQ2FsZW5kYXJFdmVudCwgaW5kZXggPSAwKTogQ2FsZW5kYXJFdmVudFBhcnNlZCB7XG4gICAgICByZXR1cm4gcGFyc2VFdmVudChcbiAgICAgICAgaW5wdXQsXG4gICAgICAgIGluZGV4LFxuICAgICAgICB0aGlzLmV2ZW50U3RhcnQsXG4gICAgICAgIHRoaXMuZXZlbnRFbmQsXG4gICAgICAgIHRoaXMuZXZlbnRUaW1lZEZ1bmN0aW9uKGlucHV0KSxcbiAgICAgICAgdGhpcy5jYXRlZ29yeU1vZGUgPyB0aGlzLmV2ZW50Q2F0ZWdvcnlGdW5jdGlvbihpbnB1dCkgOiBmYWxzZSxcbiAgICAgIClcbiAgICB9LFxuICAgIGZvcm1hdFRpbWUgKHdpdGhUaW1lOiBDYWxlbmRhclRpbWVzdGFtcCwgYW1wbTogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgICBjb25zdCBmb3JtYXR0ZXIgPSB0aGlzLmdldEZvcm1hdHRlcih7XG4gICAgICAgIHRpbWVab25lOiAnVVRDJyxcbiAgICAgICAgaG91cjogJ251bWVyaWMnLFxuICAgICAgICBtaW51dGU6IHdpdGhUaW1lLm1pbnV0ZSA+IDAgPyAnbnVtZXJpYycgOiB1bmRlZmluZWQsXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gZm9ybWF0dGVyKHdpdGhUaW1lLCB0cnVlKVxuICAgIH0sXG4gICAgdXBkYXRlRXZlbnRWaXNpYmlsaXR5ICgpIHtcbiAgICAgIGlmICh0aGlzLm5vRXZlbnRzIHx8ICF0aGlzLmV2ZW50TW9yZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgZXZlbnRIZWlnaHQgPSB0aGlzLmV2ZW50SGVpZ2h0XG4gICAgICBjb25zdCBldmVudHNNYXAgPSB0aGlzLmdldEV2ZW50c01hcCgpXG5cbiAgICAgIGZvciAoY29uc3QgZGF0ZSBpbiBldmVudHNNYXApIHtcbiAgICAgICAgY29uc3QgeyBwYXJlbnQsIGV2ZW50cywgbW9yZSB9ID0gZXZlbnRzTWFwW2RhdGVdXG4gICAgICAgIGlmICghbW9yZSkge1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJlbnRCb3VuZHMgPSBwYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgbGFzdCA9IGV2ZW50cy5sZW5ndGggLSAxXG4gICAgICAgIGNvbnN0IGV2ZW50c1NvcnRlZCA9IGV2ZW50cy5tYXAoZXZlbnQgPT4gKHtcbiAgICAgICAgICBldmVudCxcbiAgICAgICAgICBib3R0b206IGV2ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSxcbiAgICAgICAgfSkpLnNvcnQoKGEsIGIpID0+IGEuYm90dG9tIC0gYi5ib3R0b20pXG4gICAgICAgIGxldCBoaWRkZW4gPSAwXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGFzdDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgYm90dG9tID0gZXZlbnRzU29ydGVkW2ldLmJvdHRvbVxuICAgICAgICAgIGNvbnN0IGhpZGUgPSBpID09PSBsYXN0XG4gICAgICAgICAgICA/IChib3R0b20gPiBwYXJlbnRCb3VuZHMuYm90dG9tKVxuICAgICAgICAgICAgOiAoYm90dG9tICsgZXZlbnRIZWlnaHQgPiBwYXJlbnRCb3VuZHMuYm90dG9tKVxuXG4gICAgICAgICAgaWYgKGhpZGUpIHtcbiAgICAgICAgICAgIGV2ZW50c1NvcnRlZFtpXS5ldmVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgICBoaWRkZW4rK1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoaWRkZW4pIHtcbiAgICAgICAgICBtb3JlLnN0eWxlLmRpc3BsYXkgPSAnJ1xuICAgICAgICAgIG1vcmUuaW5uZXJIVE1MID0gdGhpcy4kdnVldGlmeS5sYW5nLnQodGhpcy5ldmVudE1vcmVUZXh0LCBoaWRkZW4pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9yZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGdldEV2ZW50c01hcCAoKTogVkRhaWx5RXZlbnRzTWFwIHtcbiAgICAgIGNvbnN0IGV2ZW50c01hcDogVkRhaWx5RXZlbnRzTWFwID0ge31cbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy4kcmVmcy5ldmVudHMgYXMgSFRNTEVsZW1lbnRbXVxuXG4gICAgICBpZiAoIWVsZW1lbnRzIHx8ICFlbGVtZW50cy5mb3JFYWNoKSB7XG4gICAgICAgIHJldHVybiBldmVudHNNYXBcbiAgICAgIH1cblxuICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZGF0ZScpXG4gICAgICAgIGlmIChlbC5wYXJlbnRFbGVtZW50ICYmIGRhdGUpIHtcbiAgICAgICAgICBpZiAoIShkYXRlIGluIGV2ZW50c01hcCkpIHtcbiAgICAgICAgICAgIGV2ZW50c01hcFtkYXRlXSA9IHtcbiAgICAgICAgICAgICAgcGFyZW50OiBlbC5wYXJlbnRFbGVtZW50LFxuICAgICAgICAgICAgICBtb3JlOiBudWxsLFxuICAgICAgICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW1vcmUnKSkge1xuICAgICAgICAgICAgZXZlbnRzTWFwW2RhdGVdLm1vcmUgPSBlbFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmVudHNNYXBbZGF0ZV0uZXZlbnRzLnB1c2goZWwpXG4gICAgICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBldmVudHNNYXBcbiAgICB9LFxuICAgIGdlbkRheUV2ZW50ICh7IGV2ZW50IH06IENhbGVuZGFyRXZlbnRWaXN1YWwsIGRheTogQ2FsZW5kYXJEYXlTbG90U2NvcGUpOiBWTm9kZSB7XG4gICAgICBjb25zdCBldmVudEhlaWdodCA9IHRoaXMuZXZlbnRIZWlnaHRcbiAgICAgIGNvbnN0IGV2ZW50TWFyZ2luQm90dG9tID0gdGhpcy5ldmVudE1hcmdpbkJvdHRvbVxuICAgICAgY29uc3QgZGF5SWRlbnRpZmllciA9IGdldERheUlkZW50aWZpZXIoZGF5KVxuICAgICAgY29uc3Qgd2VlayA9IGRheS53ZWVrXG4gICAgICBjb25zdCBzdGFydCA9IGRheUlkZW50aWZpZXIgPT09IGV2ZW50LnN0YXJ0SWRlbnRpZmllclxuICAgICAgbGV0IGVuZCA9IGRheUlkZW50aWZpZXIgPT09IGV2ZW50LmVuZElkZW50aWZpZXJcbiAgICAgIGxldCB3aWR0aCA9IFdJRFRIX1NUQVJUXG5cbiAgICAgIGlmICghdGhpcy5jYXRlZ29yeU1vZGUpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IGRheS5pbmRleCArIDE7IGkgPCB3ZWVrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3Qgd2Vla2RheUlkZW50aWZpZXIgPSBnZXREYXlJZGVudGlmaWVyKHdlZWtbaV0pXG4gICAgICAgICAgaWYgKGV2ZW50LmVuZElkZW50aWZpZXIgPj0gd2Vla2RheUlkZW50aWZpZXIpIHtcbiAgICAgICAgICAgIHdpZHRoICs9IFdJRFRIX0ZVTExcbiAgICAgICAgICAgIGVuZCA9IGVuZCB8fCB3ZWVrZGF5SWRlbnRpZmllciA9PT0gZXZlbnQuZW5kSWRlbnRpZmllclxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbmQgPSB0cnVlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3Qgc2NvcGUgPSB7IGV2ZW50UGFyc2VkOiBldmVudCwgZGF5LCBzdGFydCwgZW5kLCB0aW1lZDogZmFsc2UgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZW5FdmVudChldmVudCwgc2NvcGUsIGZhbHNlLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1ldmVudCcsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3YtZXZlbnQtc3RhcnQnOiBzdGFydCxcbiAgICAgICAgICAndi1ldmVudC1lbmQnOiBlbmQsXG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgaGVpZ2h0OiBgJHtldmVudEhlaWdodH1weGAsXG4gICAgICAgICAgd2lkdGg6IGAke3dpZHRofSVgLFxuICAgICAgICAgICdtYXJnaW4tYm90dG9tJzogYCR7ZXZlbnRNYXJnaW5Cb3R0b219cHhgLFxuICAgICAgICB9LFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgICdkYXRhLWRhdGUnOiBkYXkuZGF0ZSxcbiAgICAgICAgfSxcbiAgICAgICAga2V5OiBldmVudC5pbmRleCxcbiAgICAgICAgcmVmOiAnZXZlbnRzJyxcbiAgICAgICAgcmVmSW5Gb3I6IHRydWUsXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuVGltZWRFdmVudCAoeyBldmVudCwgbGVmdCwgd2lkdGggfTogQ2FsZW5kYXJFdmVudFZpc3VhbCwgZGF5OiBDYWxlbmRhckRheUJvZHlTbG90U2NvcGUpOiBWTm9kZSB8IGZhbHNlIHtcbiAgICAgIGlmIChkYXkudGltZURlbHRhKGV2ZW50LmVuZCkgPCAwIHx8IGRheS50aW1lRGVsdGEoZXZlbnQuc3RhcnQpID49IDEgfHwgaXNFdmVudEhpZGRlbk9uKGV2ZW50LCBkYXkpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBkYXlJZGVudGlmaWVyID0gZ2V0RGF5SWRlbnRpZmllcihkYXkpXG4gICAgICBjb25zdCBzdGFydCA9IGV2ZW50LnN0YXJ0SWRlbnRpZmllciA+PSBkYXlJZGVudGlmaWVyXG4gICAgICBjb25zdCBlbmQgPSBldmVudC5lbmRJZGVudGlmaWVyID4gZGF5SWRlbnRpZmllclxuICAgICAgY29uc3QgdG9wID0gc3RhcnQgPyBkYXkudGltZVRvWShldmVudC5zdGFydCkgOiAwXG4gICAgICBjb25zdCBib3R0b20gPSBlbmQgPyBkYXkudGltZVRvWShNSU5VVEVTX0lOX0RBWSkgOiBkYXkudGltZVRvWShldmVudC5lbmQpXG4gICAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1heCh0aGlzLmV2ZW50SGVpZ2h0LCBib3R0b20gLSB0b3ApXG4gICAgICBjb25zdCBzY29wZSA9IHsgZXZlbnRQYXJzZWQ6IGV2ZW50LCBkYXksIHN0YXJ0LCBlbmQsIHRpbWVkOiB0cnVlIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZ2VuRXZlbnQoZXZlbnQsIHNjb3BlLCB0cnVlLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1ldmVudC10aW1lZCcsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgdG9wOiBgJHt0b3B9cHhgLFxuICAgICAgICAgIGhlaWdodDogYCR7aGVpZ2h0fXB4YCxcbiAgICAgICAgICBsZWZ0OiBgJHtsZWZ0fSVgLFxuICAgICAgICAgIHdpZHRoOiBgJHt3aWR0aH0lYCxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5FdmVudCAoZXZlbnQ6IENhbGVuZGFyRXZlbnRQYXJzZWQsIHNjb3BlSW5wdXQ6IFZFdmVudFNjb3BlSW5wdXQsIHRpbWVkRXZlbnQ6IGJvb2xlYW4sIGRhdGE6IFZOb2RlRGF0YSk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLiRzY29wZWRTbG90cy5ldmVudFxuICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZXZlbnRUZXh0Q29sb3JGdW5jdGlvbihldmVudC5pbnB1dClcbiAgICAgIGNvbnN0IGJhY2tncm91bmQgPSB0aGlzLmV2ZW50Q29sb3JGdW5jdGlvbihldmVudC5pbnB1dClcbiAgICAgIGNvbnN0IG92ZXJsYXBzTm9vbiA9IGV2ZW50LnN0YXJ0LmhvdXIgPCAxMiAmJiBldmVudC5lbmQuaG91ciA+PSAxMlxuICAgICAgY29uc3Qgc2luZ2xpbmUgPSBkaWZmTWludXRlcyhldmVudC5zdGFydCwgZXZlbnQuZW5kKSA8PSB0aGlzLnBhcnNlZEV2ZW50T3ZlcmxhcFRocmVzaG9sZFxuICAgICAgY29uc3QgZm9ybWF0VGltZSA9IHRoaXMuZm9ybWF0VGltZVxuICAgICAgY29uc3QgdGltZVN1bW1hcnkgPSAoKSA9PiBmb3JtYXRUaW1lKGV2ZW50LnN0YXJ0LCBvdmVybGFwc05vb24pICsgJyAtICcgKyBmb3JtYXRUaW1lKGV2ZW50LmVuZCwgdHJ1ZSlcbiAgICAgIGNvbnN0IGV2ZW50U3VtbWFyeSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZXZlbnROYW1lRnVuY3Rpb24oZXZlbnQsIHRpbWVkRXZlbnQpXG4gICAgICAgIGlmIChldmVudC5zdGFydC5oYXNUaW1lKSB7XG4gICAgICAgICAgY29uc3QgZXZlbnRTdW1tYXJ5Q2xhc3MgPSAndi1ldmVudC1zdW1tYXJ5J1xuICAgICAgICAgIGlmICh0aW1lZEV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lID0gdGltZVN1bW1hcnkoKVxuICAgICAgICAgICAgY29uc3QgZGVsaW1pdGVyID0gc2luZ2xpbmUgPyAnLCAnIDogJzxicj4nXG5cbiAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCIke2V2ZW50U3VtbWFyeUNsYXNzfVwiPjxzdHJvbmc+JHtuYW1lfTwvc3Ryb25nPiR7ZGVsaW1pdGVyfSR7dGltZX08L3NwYW4+YFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lID0gZm9ybWF0VGltZShldmVudC5zdGFydCwgdHJ1ZSlcblxuICAgICAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cIiR7ZXZlbnRTdW1tYXJ5Q2xhc3N9XCI+PHN0cm9uZz4ke3RpbWV9PC9zdHJvbmc+ICR7bmFtZX08L3NwYW4+YFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuYW1lXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNjb3BlID0ge1xuICAgICAgICAuLi5zY29wZUlucHV0LFxuICAgICAgICBldmVudDogZXZlbnQuaW5wdXQsXG4gICAgICAgIG91dHNpZGU6IHNjb3BlSW5wdXQuZGF5Lm91dHNpZGUsXG4gICAgICAgIHNpbmdsaW5lLFxuICAgICAgICBvdmVybGFwc05vb24sXG4gICAgICAgIGZvcm1hdFRpbWUsXG4gICAgICAgIHRpbWVTdW1tYXJ5LFxuICAgICAgICBldmVudFN1bW1hcnksXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLFxuICAgICAgICB0aGlzLnNldFRleHRDb2xvcih0ZXh0LFxuICAgICAgICAgIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKGJhY2tncm91bmQsIHtcbiAgICAgICAgICAgIG9uOiB0aGlzLmdldERlZmF1bHRNb3VzZUV2ZW50SGFuZGxlcnMoJzpldmVudCcsIG5hdGl2ZUV2ZW50ID0+ICh7IC4uLnNjb3BlLCBuYXRpdmVFdmVudCB9KSksXG4gICAgICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgICAgICBuYW1lOiAncmlwcGxlJyxcbiAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuZXZlbnRSaXBwbGUgPz8gdHJ1ZSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgICB9KVxuICAgICAgICApLCBzbG90XG4gICAgICAgICAgPyBzbG90KHNjb3BlKVxuICAgICAgICAgIDogW3RoaXMuZ2VuTmFtZShldmVudFN1bW1hcnkpXVxuICAgICAgKVxuICAgIH0sXG4gICAgZ2VuTmFtZSAoZXZlbnRTdW1tYXJ5OiAoKSA9PiBzdHJpbmcpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3BsLTEnLFxuICAgICAgICBkb21Qcm9wczoge1xuICAgICAgICAgIGlubmVySFRNTDogZXZlbnRTdW1tYXJ5KCksXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuUGxhY2Vob2xkZXIgKGRheTogQ2FsZW5kYXJUaW1lc3RhbXApOiBWTm9kZSB7XG4gICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmV2ZW50SGVpZ2h0ICsgdGhpcy5ldmVudE1hcmdpbkJvdHRvbVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGhlaWdodDogYCR7aGVpZ2h0fXB4YCxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAnZGF0YS1kYXRlJzogZGF5LmRhdGUsXG4gICAgICAgIH0sXG4gICAgICAgIHJlZjogJ2V2ZW50cycsXG4gICAgICAgIHJlZkluRm9yOiB0cnVlLFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlbk1vcmUgKGRheTogQ2FsZW5kYXJEYXlTbG90U2NvcGUpOiBWTm9kZSB7XG4gICAgICBjb25zdCBldmVudEhlaWdodCA9IHRoaXMuZXZlbnRIZWlnaHRcbiAgICAgIGNvbnN0IGV2ZW50TWFyZ2luQm90dG9tID0gdGhpcy5ldmVudE1hcmdpbkJvdHRvbVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtZXZlbnQtbW9yZSBwbC0xJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1vdXRzaWRlJzogZGF5Lm91dHNpZGUsXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgJ2RhdGEtZGF0ZSc6IGRheS5kYXRlLFxuICAgICAgICAgICdkYXRhLW1vcmUnOiAxLFxuICAgICAgICB9LFxuICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgIG5hbWU6ICdyaXBwbGUnLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLmV2ZW50UmlwcGxlID8/IHRydWUsXG4gICAgICAgIH1dLFxuICAgICAgICBvbjogdGhpcy5nZXREZWZhdWx0TW91c2VFdmVudEhhbmRsZXJzKCc6bW9yZScsIG5hdGl2ZUV2ZW50ID0+IHtcbiAgICAgICAgICByZXR1cm4geyBuYXRpdmVFdmVudCwgLi4uZGF5IH1cbiAgICAgICAgfSksXG5cbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBkaXNwbGF5OiAnbm9uZScsXG4gICAgICAgICAgaGVpZ2h0OiBgJHtldmVudEhlaWdodH1weGAsXG4gICAgICAgICAgJ21hcmdpbi1ib3R0b20nOiBgJHtldmVudE1hcmdpbkJvdHRvbX1weGAsXG4gICAgICAgIH0sXG4gICAgICAgIHJlZjogJ2V2ZW50cycsXG4gICAgICAgIHJlZkluRm9yOiB0cnVlLFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdldFZpc2libGVFdmVudHMgKCk6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSB7XG4gICAgICBjb25zdCBzdGFydCA9IGdldERheUlkZW50aWZpZXIodGhpcy5kYXlzWzBdKVxuICAgICAgY29uc3QgZW5kID0gZ2V0RGF5SWRlbnRpZmllcih0aGlzLmRheXNbdGhpcy5kYXlzLmxlbmd0aCAtIDFdKVxuXG4gICAgICByZXR1cm4gdGhpcy5wYXJzZWRFdmVudHMuZmlsdGVyKFxuICAgICAgICBldmVudCA9PiBpc0V2ZW50T3ZlcmxhcHBpbmcoZXZlbnQsIHN0YXJ0LCBlbmQpXG4gICAgICApXG4gICAgfSxcbiAgICBpc0V2ZW50Rm9yQ2F0ZWdvcnkgKGV2ZW50OiBDYWxlbmRhckV2ZW50UGFyc2VkLCBjYXRlZ29yeTogQ2FsZW5kYXJDYXRlZ29yeSk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuICF0aGlzLmNhdGVnb3J5TW9kZSB8fFxuICAgICAgICAodHlwZW9mIGNhdGVnb3J5ID09PSAnb2JqZWN0JyAmJiBjYXRlZ29yeS5jYXRlZ29yeU5hbWUgJiZcbiAgICAgICAgY2F0ZWdvcnkuY2F0ZWdvcnlOYW1lID09PSBldmVudC5jYXRlZ29yeSkgfHxcbiAgICAgICAgKHR5cGVvZiBldmVudC5jYXRlZ29yeSA9PT0gJ3N0cmluZycgJiYgY2F0ZWdvcnkgPT09IGV2ZW50LmNhdGVnb3J5KSB8fFxuICAgICAgICAodHlwZW9mIGV2ZW50LmNhdGVnb3J5ICE9PSAnc3RyaW5nJyAmJiBjYXRlZ29yeSA9PT0gbnVsbClcbiAgICB9LFxuICAgIGdldEV2ZW50c0ZvckRheSAoZGF5OiBDYWxlbmRhckRheVNsb3RTY29wZSk6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gZ2V0RGF5SWRlbnRpZmllcihkYXkpXG4gICAgICBjb25zdCBmaXJzdFdlZWtkYXkgPSB0aGlzLmV2ZW50V2Vla2RheXNbMF1cblxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VkRXZlbnRzLmZpbHRlcihcbiAgICAgICAgZXZlbnQgPT4gaXNFdmVudFN0YXJ0KGV2ZW50LCBkYXksIGlkZW50aWZpZXIsIGZpcnN0V2Vla2RheSlcbiAgICAgIClcbiAgICB9LFxuICAgIGdldEV2ZW50c0ZvckRheUFsbCAoZGF5OiBDYWxlbmRhckRheVNsb3RTY29wZSk6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gZ2V0RGF5SWRlbnRpZmllcihkYXkpXG4gICAgICBjb25zdCBmaXJzdFdlZWtkYXkgPSB0aGlzLmV2ZW50V2Vla2RheXNbMF1cblxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VkRXZlbnRzLmZpbHRlcihcbiAgICAgICAgZXZlbnQgPT4gZXZlbnQuYWxsRGF5ICYmXG4gICAgICAgICAgKHRoaXMuY2F0ZWdvcnlNb2RlID8gaXNFdmVudE9uKGV2ZW50LCBpZGVudGlmaWVyKSA6IGlzRXZlbnRTdGFydChldmVudCwgZGF5LCBpZGVudGlmaWVyLCBmaXJzdFdlZWtkYXkpKSAmJlxuICAgICAgICAgIHRoaXMuaXNFdmVudEZvckNhdGVnb3J5KGV2ZW50LCBkYXkuY2F0ZWdvcnkpXG4gICAgICApXG4gICAgfSxcbiAgICBnZXRFdmVudHNGb3JEYXlUaW1lZCAoZGF5OiBDYWxlbmRhckRheVNsb3RTY29wZSk6IENhbGVuZGFyRXZlbnRQYXJzZWRbXSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gZ2V0RGF5SWRlbnRpZmllcihkYXkpXG4gICAgICByZXR1cm4gdGhpcy5wYXJzZWRFdmVudHMuZmlsdGVyKFxuICAgICAgICBldmVudCA9PiAhZXZlbnQuYWxsRGF5ICYmXG4gICAgICAgICAgaXNFdmVudE9uKGV2ZW50LCBpZGVudGlmaWVyKSAmJlxuICAgICAgICAgIHRoaXMuaXNFdmVudEZvckNhdGVnb3J5KGV2ZW50LCBkYXkuY2F0ZWdvcnkpXG4gICAgICApXG4gICAgfSxcbiAgICBnZXRTY29wZWRTbG90cyAoKSB7XG4gICAgICBpZiAodGhpcy5ub0V2ZW50cykge1xuICAgICAgICByZXR1cm4geyAuLi50aGlzLiRzY29wZWRTbG90cyB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1vZGUgPSB0aGlzLmV2ZW50TW9kZUZ1bmN0aW9uKFxuICAgICAgICB0aGlzLnBhcnNlZEV2ZW50cyxcbiAgICAgICAgdGhpcy5ldmVudFdlZWtkYXlzWzBdLFxuICAgICAgICB0aGlzLnBhcnNlZEV2ZW50T3ZlcmxhcFRocmVzaG9sZFxuICAgICAgKVxuXG4gICAgICBjb25zdCBpc05vZGUgPSAoaW5wdXQ6IFZOb2RlIHwgZmFsc2UpOiBpbnB1dCBpcyBWTm9kZSA9PiAhIWlucHV0XG4gICAgICBjb25zdCBnZXRTbG90Q2hpbGRyZW46IFZFdmVudHNUb05vZGVzID0gKGRheSwgZ2V0dGVyLCBtYXBwZXIsIHRpbWVkKSA9PiB7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IGdldHRlcihkYXkpXG4gICAgICAgIGNvbnN0IHZpc3VhbHMgPSBtb2RlKGRheSwgZXZlbnRzLCB0aW1lZCwgdGhpcy5jYXRlZ29yeU1vZGUpXG5cbiAgICAgICAgaWYgKHRpbWVkKSB7XG4gICAgICAgICAgcmV0dXJuIHZpc3VhbHMubWFwKHZpc3VhbCA9PiBtYXBwZXIodmlzdWFsLCBkYXkpKS5maWx0ZXIoaXNOb2RlKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hpbGRyZW46IFZOb2RlW10gPSBbXVxuXG4gICAgICAgIHZpc3VhbHMuZm9yRWFjaCgodmlzdWFsLCBpbmRleCkgPT4ge1xuICAgICAgICAgIHdoaWxlIChjaGlsZHJlbi5sZW5ndGggPCB2aXN1YWwuY29sdW1uKSB7XG4gICAgICAgICAgICBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuUGxhY2Vob2xkZXIoZGF5KSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBtYXBwZWQgPSBtYXBwZXIodmlzdWFsLCBkYXkpXG4gICAgICAgICAgaWYgKG1hcHBlZCkge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChtYXBwZWQpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHJldHVybiBjaGlsZHJlblxuICAgICAgfVxuXG4gICAgICBjb25zdCBzbG90cyA9IHRoaXMuJHNjb3BlZFNsb3RzXG4gICAgICBjb25zdCBzbG90RGF5ID0gc2xvdHMuZGF5XG4gICAgICBjb25zdCBzbG90RGF5SGVhZGVyID0gc2xvdHNbJ2RheS1oZWFkZXInXVxuICAgICAgY29uc3Qgc2xvdERheUJvZHkgPSBzbG90c1snZGF5LWJvZHknXVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5zbG90cyxcbiAgICAgICAgZGF5OiAoZGF5OiBDYWxlbmRhckRheVNsb3RTY29wZSkgPT4ge1xuICAgICAgICAgIGxldCBjaGlsZHJlbiA9IGdldFNsb3RDaGlsZHJlbihkYXksIHRoaXMuZ2V0RXZlbnRzRm9yRGF5LCB0aGlzLmdlbkRheUV2ZW50LCBmYWxzZSlcbiAgICAgICAgICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoID4gMCAmJiB0aGlzLmV2ZW50TW9yZSkge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaCh0aGlzLmdlbk1vcmUoZGF5KSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNsb3REYXkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSBzbG90RGF5KGRheSlcbiAgICAgICAgICAgIGlmIChzbG90KSB7XG4gICAgICAgICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4gPyBjaGlsZHJlbi5jb25jYXQoc2xvdCkgOiBzbG90XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjaGlsZHJlblxuICAgICAgICB9LFxuICAgICAgICAnZGF5LWhlYWRlcic6IChkYXk6IENhbGVuZGFyRGF5U2xvdFNjb3BlKSA9PiB7XG4gICAgICAgICAgbGV0IGNoaWxkcmVuID0gZ2V0U2xvdENoaWxkcmVuKGRheSwgdGhpcy5nZXRFdmVudHNGb3JEYXlBbGwsIHRoaXMuZ2VuRGF5RXZlbnQsIGZhbHNlKVxuXG4gICAgICAgICAgaWYgKHNsb3REYXlIZWFkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNsb3QgPSBzbG90RGF5SGVhZGVyKGRheSlcbiAgICAgICAgICAgIGlmIChzbG90KSB7XG4gICAgICAgICAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4gPyBjaGlsZHJlbi5jb25jYXQoc2xvdCkgOiBzbG90XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjaGlsZHJlblxuICAgICAgICB9LFxuICAgICAgICAnZGF5LWJvZHknOiAoZGF5OiBDYWxlbmRhckRheUJvZHlTbG90U2NvcGUpID0+IHtcbiAgICAgICAgICBjb25zdCBldmVudHMgPSBnZXRTbG90Q2hpbGRyZW4oZGF5LCB0aGlzLmdldEV2ZW50c0ZvckRheVRpbWVkLCB0aGlzLmdlblRpbWVkRXZlbnQsIHRydWUpXG4gICAgICAgICAgbGV0IGNoaWxkcmVuOiBWTm9kZVtdID0gW1xuICAgICAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtZXZlbnQtdGltZWQtY29udGFpbmVyJyxcbiAgICAgICAgICAgIH0sIGV2ZW50cyksXG4gICAgICAgICAgXVxuXG4gICAgICAgICAgaWYgKHNsb3REYXlCb2R5KSB7XG4gICAgICAgICAgICBjb25zdCBzbG90ID0gc2xvdERheUJvZHkoZGF5KVxuICAgICAgICAgICAgaWYgKHNsb3QpIHtcbiAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5jb25jYXQoc2xvdClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSxcbiAgfSxcbn0pXG4iXX0=
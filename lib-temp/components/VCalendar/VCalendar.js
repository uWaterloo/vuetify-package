// Styles
// import '../../stylus/components/_calendar-daily.styl'
// Mixins
import CalendarWithEvents from './mixins/calendar-with-events';
// Util
import props from './util/props';
import { DAYS_IN_MONTH_MAX, DAY_MIN, DAYS_IN_WEEK, parseTimestamp, validateTimestamp, relativeDays, nextDay, prevDay, copyTimestamp, updateFormatted, updateWeekday, updateRelative, getStartOfMonth, getEndOfMonth, timestampToDate, } from './util/timestamp';
// Calendars
import VCalendarMonthly from './VCalendarMonthly';
import VCalendarDaily from './VCalendarDaily';
import VCalendarWeekly from './VCalendarWeekly';
import VCalendarCategory from './VCalendarCategory';
import { getParsedCategories } from './util/parser';
/* @vue/component */
export default CalendarWithEvents.extend({
    name: 'v-calendar',
    props: {
        ...props.calendar,
        ...props.weeks,
        ...props.intervals,
        ...props.category,
    },
    data: () => ({
        lastStart: null,
        lastEnd: null,
    }),
    computed: {
        parsedValue() {
            return (validateTimestamp(this.value)
                ? parseTimestamp(this.value, true)
                : (this.parsedStart || this.times.today));
        },
        parsedCategoryDays() {
            return parseInt(this.categoryDays) || 1;
        },
        renderProps() {
            const around = this.parsedValue;
            let component = null;
            let maxDays = this.maxDays;
            let weekdays = this.parsedWeekdays;
            let categories = this.parsedCategories;
            let start = around;
            let end = around;
            switch (this.type) {
                case 'month':
                    component = VCalendarMonthly;
                    start = getStartOfMonth(around);
                    end = getEndOfMonth(around);
                    break;
                case 'week':
                    component = VCalendarDaily;
                    start = this.getStartOfWeek(around);
                    end = this.getEndOfWeek(around);
                    maxDays = 7;
                    break;
                case 'day':
                    component = VCalendarDaily;
                    maxDays = 1;
                    weekdays = [start.weekday];
                    break;
                case '4day':
                    component = VCalendarDaily;
                    end = relativeDays(copyTimestamp(end), nextDay, 3);
                    updateFormatted(end);
                    maxDays = 4;
                    weekdays = [
                        start.weekday,
                        (start.weekday + 1) % 7,
                        (start.weekday + 2) % 7,
                        (start.weekday + 3) % 7,
                    ];
                    break;
                case 'custom-weekly':
                    component = VCalendarWeekly;
                    start = this.parsedStart || around;
                    end = this.parsedEnd;
                    break;
                case 'custom-daily':
                    component = VCalendarDaily;
                    start = this.parsedStart || around;
                    end = this.parsedEnd;
                    break;
                case 'category':
                    const days = this.parsedCategoryDays;
                    component = VCalendarCategory;
                    end = relativeDays(copyTimestamp(end), nextDay, days);
                    updateFormatted(end);
                    maxDays = days;
                    weekdays = [];
                    for (let i = 0; i < days; i++) {
                        weekdays.push((start.weekday + i) % 7);
                    }
                    categories = this.getCategoryList(categories);
                    break;
                default:
                    throw new Error(this.type + ' is not a valid Calendar type');
            }
            return { component, start, end, maxDays, weekdays, categories };
        },
        eventWeekdays() {
            return this.renderProps.weekdays;
        },
        categoryMode() {
            return this.type === 'category';
        },
        title() {
            const { start, end } = this.renderProps;
            const spanYears = start.year !== end.year;
            const spanMonths = spanYears || start.month !== end.month;
            if (spanYears) {
                return this.monthShortFormatter(start, true) + ' ' + start.year + ' - ' + this.monthShortFormatter(end, true) + ' ' + end.year;
            }
            if (spanMonths) {
                return this.monthShortFormatter(start, true) + ' - ' + this.monthShortFormatter(end, true) + ' ' + end.year;
            }
            else {
                return this.monthLongFormatter(start, false) + ' ' + start.year;
            }
        },
        monthLongFormatter() {
            return this.getFormatter({
                timeZone: 'UTC', month: 'long',
            });
        },
        monthShortFormatter() {
            return this.getFormatter({
                timeZone: 'UTC', month: 'short',
            });
        },
        parsedCategories() {
            return getParsedCategories(this.categories, this.categoryText);
        },
    },
    watch: {
        renderProps: 'checkChange',
    },
    mounted() {
        this.updateEventVisibility();
        this.checkChange();
    },
    updated() {
        window.requestAnimationFrame(this.updateEventVisibility);
    },
    methods: {
        checkChange() {
            const { lastStart, lastEnd } = this;
            const { start, end } = this.renderProps;
            if (!lastStart || !lastEnd ||
                start.date !== lastStart.date ||
                end.date !== lastEnd.date) {
                this.lastStart = start;
                this.lastEnd = end;
                this.$emit('change', { start, end });
            }
        },
        move(amount = 1) {
            const moved = copyTimestamp(this.parsedValue);
            const forward = amount > 0;
            const mover = forward ? nextDay : prevDay;
            const limit = forward ? DAYS_IN_MONTH_MAX : DAY_MIN;
            let times = forward ? amount : -amount;
            while (--times >= 0) {
                switch (this.type) {
                    case 'month':
                        moved.day = limit;
                        mover(moved);
                        break;
                    case 'week':
                        relativeDays(moved, mover, DAYS_IN_WEEK);
                        break;
                    case 'day':
                        relativeDays(moved, mover, 1);
                        break;
                    case '4day':
                        relativeDays(moved, mover, 4);
                        break;
                    case 'category':
                        relativeDays(moved, mover, this.parsedCategoryDays);
                        break;
                }
            }
            updateWeekday(moved);
            updateFormatted(moved);
            updateRelative(moved, this.times.now);
            if (this.value instanceof Date) {
                this.$emit('input', timestampToDate(moved));
            }
            else if (typeof this.value === 'number') {
                this.$emit('input', timestampToDate(moved).getTime());
            }
            else {
                this.$emit('input', moved.date);
            }
            this.$emit('moved', moved);
        },
        next(amount = 1) {
            this.move(amount);
        },
        prev(amount = 1) {
            this.move(-amount);
        },
        timeToY(time, clamp = true) {
            const c = this.$children[0];
            if (c && c.timeToY) {
                return c.timeToY(time, clamp);
            }
            else {
                return false;
            }
        },
        timeDelta(time) {
            const c = this.$children[0];
            if (c && c.timeDelta) {
                return c.timeDelta(time);
            }
            else {
                return false;
            }
        },
        minutesToPixels(minutes) {
            const c = this.$children[0];
            if (c && c.minutesToPixels) {
                return c.minutesToPixels(minutes);
            }
            else {
                return -1;
            }
        },
        scrollToTime(time) {
            const c = this.$children[0];
            if (c && c.scrollToTime) {
                return c.scrollToTime(time);
            }
            else {
                return false;
            }
        },
        parseTimestamp(input, required) {
            return parseTimestamp(input, required, this.times.now);
        },
        timestampToDate(timestamp) {
            return timestampToDate(timestamp);
        },
        getCategoryList(categories) {
            if (!this.noEvents) {
                const categoryMap = categories.reduce((map, category, index) => {
                    if (typeof category === 'object' && category.categoryName)
                        map[category.categoryName] = { index, count: 0 };
                    else if (typeof category === 'string')
                        map[category] = { index, count: 0 };
                    return map;
                }, {});
                if (!this.categoryHideDynamic || !this.categoryShowAll) {
                    let categoryLength = categories.length;
                    this.parsedEvents.forEach(ev => {
                        let category = ev.category;
                        if (typeof category !== 'string') {
                            category = this.categoryForInvalid;
                        }
                        if (!category) {
                            return;
                        }
                        if (category in categoryMap) {
                            categoryMap[category].count++;
                        }
                        else if (!this.categoryHideDynamic) {
                            categoryMap[category] = {
                                index: categoryLength++,
                                count: 1,
                            };
                        }
                    });
                }
                if (!this.categoryShowAll) {
                    for (const category in categoryMap) {
                        if (categoryMap[category].count === 0) {
                            delete categoryMap[category];
                        }
                    }
                }
                categories = categories.filter((category) => {
                    if (typeof category === 'object' && category.categoryName) {
                        return categoryMap.hasOwnProperty(category.categoryName);
                    }
                    else if (typeof category === 'string') {
                        return categoryMap.hasOwnProperty(category);
                    }
                    return false;
                });
            }
            return categories;
        },
    },
    render(h) {
        const { start, end, maxDays, component, weekdays, categories } = this.renderProps;
        return h(component, {
            staticClass: 'v-calendar',
            class: {
                'v-calendar-events': !this.noEvents,
            },
            props: {
                ...this.$props,
                start: start.date,
                end: end.date,
                maxDays,
                weekdays,
                categories,
            },
            directives: [{
                    modifiers: { quiet: true },
                    name: 'resize',
                    value: this.updateEventVisibility,
                }],
            on: {
                ...this.$listeners,
                'click:date': (day, e) => {
                    if (this.$listeners.input) {
                        this.$emit('input', day.date);
                    }
                    if (this.$listeners['click:date']) {
                        this.$emit('click:date', day, e);
                    }
                },
            },
            scopedSlots: this.getScopedSlots(),
        });
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNhbGVuZGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkNhbGVuZGFyL1ZDYWxlbmRhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1Qsd0RBQXdEO0FBS3hELFNBQVM7QUFDVCxPQUFPLGtCQUFrQixNQUFNLCtCQUErQixDQUFBO0FBRTlELE9BQU87QUFDUCxPQUFPLEtBQUssTUFBTSxjQUFjLENBQUE7QUFDaEMsT0FBTyxFQUNMLGlCQUFpQixFQUNqQixPQUFPLEVBQ1AsWUFBWSxFQUNaLGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsWUFBWSxFQUNaLE9BQU8sRUFDUCxPQUFPLEVBQ1AsYUFBYSxFQUNiLGVBQWUsRUFDZixhQUFhLEVBQ2IsY0FBYyxFQUNkLGVBQWUsRUFDZixhQUFhLEVBR2IsZUFBZSxHQUNoQixNQUFNLGtCQUFrQixDQUFBO0FBRXpCLFlBQVk7QUFDWixPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFBO0FBQ2pELE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFBO0FBQzdDLE9BQU8sZUFBZSxNQUFNLG1CQUFtQixDQUFBO0FBQy9DLE9BQU8saUJBQWlCLE1BQU0scUJBQXFCLENBQUE7QUFFbkQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZUFBZSxDQUFBO0FBWW5ELG9CQUFvQjtBQUNwQixlQUFlLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztJQUN2QyxJQUFJLEVBQUUsWUFBWTtJQUVsQixLQUFLLEVBQUU7UUFDTCxHQUFHLEtBQUssQ0FBQyxRQUFRO1FBQ2pCLEdBQUcsS0FBSyxDQUFDLEtBQUs7UUFDZCxHQUFHLEtBQUssQ0FBQyxTQUFTO1FBQ2xCLEdBQUcsS0FBSyxDQUFDLFFBQVE7S0FDbEI7SUFFRCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNYLFNBQVMsRUFBRSxJQUFnQztRQUMzQyxPQUFPLEVBQUUsSUFBZ0M7S0FDMUMsQ0FB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QUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO3FCQUNqQztnQkFDSCxDQUFDO2FBQ0Y7WUFDRCxXQUFXLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtTQUNuQyxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG4vLyBpbXBvcnQgJy4uLy4uL3N0eWx1cy9jb21wb25lbnRzL19jYWxlbmRhci1kYWlseS5zdHlsJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUsIENvbXBvbmVudCB9IGZyb20gJ3Z1ZSdcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ2FsZW5kYXJXaXRoRXZlbnRzIGZyb20gJy4vbWl4aW5zL2NhbGVuZGFyLXdpdGgtZXZlbnRzJ1xuXG4vLyBVdGlsXG5pbXBvcnQgcHJvcHMgZnJvbSAnLi91dGlsL3Byb3BzJ1xuaW1wb3J0IHtcbiAgREFZU19JTl9NT05USF9NQVgsXG4gIERBWV9NSU4sXG4gIERBWVNfSU5fV0VFSyxcbiAgcGFyc2VUaW1lc3RhbXAsXG4gIHZhbGlkYXRlVGltZXN0YW1wLFxuICByZWxhdGl2ZURheXMsXG4gIG5leHREYXksXG4gIHByZXZEYXksXG4gIGNvcHlUaW1lc3RhbXAsXG4gIHVwZGF0ZUZvcm1hdHRlZCxcbiAgdXBkYXRlV2Vla2RheSxcbiAgdXBkYXRlUmVsYXRpdmUsXG4gIGdldFN0YXJ0T2ZNb250aCxcbiAgZ2V0RW5kT2ZNb250aCxcbiAgVlRpbWUsXG4gIFZUaW1lc3RhbXBJbnB1dCxcbiAgdGltZXN0YW1wVG9EYXRlLFxufSBmcm9tICcuL3V0aWwvdGltZXN0YW1wJ1xuXG4vLyBDYWxlbmRhcnNcbmltcG9ydCBWQ2FsZW5kYXJNb250aGx5IGZyb20gJy4vVkNhbGVuZGFyTW9udGhseSdcbmltcG9ydCBWQ2FsZW5kYXJEYWlseSBmcm9tICcuL1ZDYWxlbmRhckRhaWx5J1xuaW1wb3J0IFZDYWxlbmRhcldlZWtseSBmcm9tICcuL1ZDYWxlbmRhcldlZWtseSdcbmltcG9ydCBWQ2FsZW5kYXJDYXRlZ29yeSBmcm9tICcuL1ZDYWxlbmRhckNhdGVnb3J5J1xuaW1wb3J0IHsgQ2FsZW5kYXJUaW1lc3RhbXAsIENhbGVuZGFyRm9ybWF0dGVyLCBDYWxlbmRhckNhdGVnb3J5IH0gZnJvbSAndnVldGlmeS90eXBlcydcbmltcG9ydCB7IGdldFBhcnNlZENhdGVnb3JpZXMgfSBmcm9tICcuL3V0aWwvcGFyc2VyJ1xuXG4vLyBUeXBlc1xuaW50ZXJmYWNlIFZDYWxlbmRhclJlbmRlclByb3BzIHtcbiAgc3RhcnQ6IENhbGVuZGFyVGltZXN0YW1wXG4gIGVuZDogQ2FsZW5kYXJUaW1lc3RhbXBcbiAgY29tcG9uZW50OiBzdHJpbmcgfCBDb21wb25lbnRcbiAgbWF4RGF5czogbnVtYmVyXG4gIHdlZWtkYXlzOiBudW1iZXJbXVxuICBjYXRlZ29yaWVzOiBDYWxlbmRhckNhdGVnb3J5W11cbn1cblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IENhbGVuZGFyV2l0aEV2ZW50cy5leHRlbmQoe1xuICBuYW1lOiAndi1jYWxlbmRhcicsXG5cbiAgcHJvcHM6IHtcbiAgICAuLi5wcm9wcy5jYWxlbmRhcixcbiAgICAuLi5wcm9wcy53ZWVrcyxcbiAgICAuLi5wcm9wcy5pbnRlcnZhbHMsXG4gICAgLi4ucHJvcHMuY2F0ZWdvcnksXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBsYXN0U3RhcnQ6IG51bGwgYXMgQ2FsZW5kYXJUaW1lc3RhbXAgfCBudWxsLFxuICAgIGxhc3RFbmQ6IG51bGwgYXMgQ2FsZW5kYXJUaW1lc3RhbXAgfCBudWxsLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIHBhcnNlZFZhbHVlICgpOiBDYWxlbmRhclRpbWVzdGFtcCB7XG4gICAgICByZXR1cm4gKHZhbGlkYXRlVGltZXN0YW1wKHRoaXMudmFsdWUpXG4gICAgICAgID8gcGFyc2VUaW1lc3RhbXAodGhpcy52YWx1ZSwgdHJ1ZSlcbiAgICAgICAgOiAodGhpcy5wYXJzZWRTdGFydCB8fCB0aGlzLnRpbWVzLnRvZGF5KSlcbiAgICB9LFxuICAgIHBhcnNlZENhdGVnb3J5RGF5cyAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLmNhdGVnb3J5RGF5cykgfHwgMVxuICAgIH0sXG4gICAgcmVuZGVyUHJvcHMgKCk6IFZDYWxlbmRhclJlbmRlclByb3BzIHtcbiAgICAgIGNvbnN0IGFyb3VuZCA9IHRoaXMucGFyc2VkVmFsdWVcbiAgICAgIGxldCBjb21wb25lbnQ6IGFueSA9IG51bGxcbiAgICAgIGxldCBtYXhEYXlzID0gdGhpcy5tYXhEYXlzXG4gICAgICBsZXQgd2Vla2RheXMgPSB0aGlzLnBhcnNlZFdlZWtkYXlzXG4gICAgICBsZXQgY2F0ZWdvcmllcyA9IHRoaXMucGFyc2VkQ2F0ZWdvcmllc1xuICAgICAgbGV0IHN0YXJ0ID0gYXJvdW5kXG4gICAgICBsZXQgZW5kID0gYXJvdW5kXG4gICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgY29tcG9uZW50ID0gVkNhbGVuZGFyTW9udGhseVxuICAgICAgICAgIHN0YXJ0ID0gZ2V0U3RhcnRPZk1vbnRoKGFyb3VuZClcbiAgICAgICAgICBlbmQgPSBnZXRFbmRPZk1vbnRoKGFyb3VuZClcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgICBjb21wb25lbnQgPSBWQ2FsZW5kYXJEYWlseVxuICAgICAgICAgIHN0YXJ0ID0gdGhpcy5nZXRTdGFydE9mV2Vlayhhcm91bmQpXG4gICAgICAgICAgZW5kID0gdGhpcy5nZXRFbmRPZldlZWsoYXJvdW5kKVxuICAgICAgICAgIG1heERheXMgPSA3XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgICBjb21wb25lbnQgPSBWQ2FsZW5kYXJEYWlseVxuICAgICAgICAgIG1heERheXMgPSAxXG4gICAgICAgICAgd2Vla2RheXMgPSBbc3RhcnQud2Vla2RheV1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICc0ZGF5JzpcbiAgICAgICAgICBjb21wb25lbnQgPSBWQ2FsZW5kYXJEYWlseVxuICAgICAgICAgIGVuZCA9IHJlbGF0aXZlRGF5cyhjb3B5VGltZXN0YW1wKGVuZCksIG5leHREYXksIDMpXG4gICAgICAgICAgdXBkYXRlRm9ybWF0dGVkKGVuZClcbiAgICAgICAgICBtYXhEYXlzID0gNFxuICAgICAgICAgIHdlZWtkYXlzID0gW1xuICAgICAgICAgICAgc3RhcnQud2Vla2RheSxcbiAgICAgICAgICAgIChzdGFydC53ZWVrZGF5ICsgMSkgJSA3LFxuICAgICAgICAgICAgKHN0YXJ0LndlZWtkYXkgKyAyKSAlIDcsXG4gICAgICAgICAgICAoc3RhcnQud2Vla2RheSArIDMpICUgNyxcbiAgICAgICAgICBdXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnY3VzdG9tLXdlZWtseSc6XG4gICAgICAgICAgY29tcG9uZW50ID0gVkNhbGVuZGFyV2Vla2x5XG4gICAgICAgICAgc3RhcnQgPSB0aGlzLnBhcnNlZFN0YXJ0IHx8IGFyb3VuZFxuICAgICAgICAgIGVuZCA9IHRoaXMucGFyc2VkRW5kXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnY3VzdG9tLWRhaWx5JzpcbiAgICAgICAgICBjb21wb25lbnQgPSBWQ2FsZW5kYXJEYWlseVxuICAgICAgICAgIHN0YXJ0ID0gdGhpcy5wYXJzZWRTdGFydCB8fCBhcm91bmRcbiAgICAgICAgICBlbmQgPSB0aGlzLnBhcnNlZEVuZFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ2NhdGVnb3J5JzpcbiAgICAgICAgICBjb25zdCBkYXlzID0gdGhpcy5wYXJzZWRDYXRlZ29yeURheXNcblxuICAgICAgICAgIGNvbXBvbmVudCA9IFZDYWxlbmRhckNhdGVnb3J5XG4gICAgICAgICAgZW5kID0gcmVsYXRpdmVEYXlzKGNvcHlUaW1lc3RhbXAoZW5kKSwgbmV4dERheSwgZGF5cylcbiAgICAgICAgICB1cGRhdGVGb3JtYXR0ZWQoZW5kKVxuICAgICAgICAgIG1heERheXMgPSBkYXlzXG4gICAgICAgICAgd2Vla2RheXMgPSBbXVxuXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXlzOyBpKyspIHtcbiAgICAgICAgICAgIHdlZWtkYXlzLnB1c2goKHN0YXJ0LndlZWtkYXkgKyBpKSAlIDcpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY2F0ZWdvcmllcyA9IHRoaXMuZ2V0Q2F0ZWdvcnlMaXN0KGNhdGVnb3JpZXMpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50eXBlICsgJyBpcyBub3QgYSB2YWxpZCBDYWxlbmRhciB0eXBlJylcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgY29tcG9uZW50LCBzdGFydCwgZW5kLCBtYXhEYXlzLCB3ZWVrZGF5cywgY2F0ZWdvcmllcyB9XG4gICAgfSxcbiAgICBldmVudFdlZWtkYXlzICgpOiBudW1iZXJbXSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJQcm9wcy53ZWVrZGF5c1xuICAgIH0sXG4gICAgY2F0ZWdvcnlNb2RlICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09ICdjYXRlZ29yeSdcbiAgICB9LFxuICAgIHRpdGxlICgpOiBzdHJpbmcge1xuICAgICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSB0aGlzLnJlbmRlclByb3BzXG4gICAgICBjb25zdCBzcGFuWWVhcnMgPSBzdGFydC55ZWFyICE9PSBlbmQueWVhclxuICAgICAgY29uc3Qgc3Bhbk1vbnRocyA9IHNwYW5ZZWFycyB8fCBzdGFydC5tb250aCAhPT0gZW5kLm1vbnRoXG5cbiAgICAgIGlmIChzcGFuWWVhcnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9udGhTaG9ydEZvcm1hdHRlcihzdGFydCwgdHJ1ZSkgKyAnICcgKyBzdGFydC55ZWFyICsgJyAtICcgKyB0aGlzLm1vbnRoU2hvcnRGb3JtYXR0ZXIoZW5kLCB0cnVlKSArICcgJyArIGVuZC55ZWFyXG4gICAgICB9XG5cbiAgICAgIGlmIChzcGFuTW9udGhzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vbnRoU2hvcnRGb3JtYXR0ZXIoc3RhcnQsIHRydWUpICsgJyAtICcgKyB0aGlzLm1vbnRoU2hvcnRGb3JtYXR0ZXIoZW5kLCB0cnVlKSArICcgJyArIGVuZC55ZWFyXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5tb250aExvbmdGb3JtYXR0ZXIoc3RhcnQsIGZhbHNlKSArICcgJyArIHN0YXJ0LnllYXJcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vbnRoTG9uZ0Zvcm1hdHRlciAoKTogQ2FsZW5kYXJGb3JtYXR0ZXIge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Rm9ybWF0dGVyKHtcbiAgICAgICAgdGltZVpvbmU6ICdVVEMnLCBtb250aDogJ2xvbmcnLFxuICAgICAgfSlcbiAgICB9LFxuICAgIG1vbnRoU2hvcnRGb3JtYXR0ZXIgKCk6IENhbGVuZGFyRm9ybWF0dGVyIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZvcm1hdHRlcih7XG4gICAgICAgIHRpbWVab25lOiAnVVRDJywgbW9udGg6ICdzaG9ydCcsXG4gICAgICB9KVxuICAgIH0sXG4gICAgcGFyc2VkQ2F0ZWdvcmllcyAoKTogQ2FsZW5kYXJDYXRlZ29yeVtdIHtcbiAgICAgIHJldHVybiBnZXRQYXJzZWRDYXRlZ29yaWVzKHRoaXMuY2F0ZWdvcmllcywgdGhpcy5jYXRlZ29yeVRleHQpXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIHJlbmRlclByb3BzOiAnY2hlY2tDaGFuZ2UnLFxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIHRoaXMudXBkYXRlRXZlbnRWaXNpYmlsaXR5KClcbiAgICB0aGlzLmNoZWNrQ2hhbmdlKClcbiAgfSxcblxuICB1cGRhdGVkICgpIHtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlRXZlbnRWaXNpYmlsaXR5KVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBjaGVja0NoYW5nZSAoKTogdm9pZCB7XG4gICAgICBjb25zdCB7IGxhc3RTdGFydCwgbGFzdEVuZCB9ID0gdGhpc1xuICAgICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSB0aGlzLnJlbmRlclByb3BzXG4gICAgICBpZiAoIWxhc3RTdGFydCB8fCAhbGFzdEVuZCB8fFxuICAgICAgICBzdGFydC5kYXRlICE9PSBsYXN0U3RhcnQuZGF0ZSB8fFxuICAgICAgICBlbmQuZGF0ZSAhPT0gbGFzdEVuZC5kYXRlKSB7XG4gICAgICAgIHRoaXMubGFzdFN0YXJ0ID0gc3RhcnRcbiAgICAgICAgdGhpcy5sYXN0RW5kID0gZW5kXG4gICAgICAgIHRoaXMuJGVtaXQoJ2NoYW5nZScsIHsgc3RhcnQsIGVuZCB9KVxuICAgICAgfVxuICAgIH0sXG4gICAgbW92ZSAoYW1vdW50ID0gMSk6IHZvaWQge1xuICAgICAgY29uc3QgbW92ZWQgPSBjb3B5VGltZXN0YW1wKHRoaXMucGFyc2VkVmFsdWUpXG4gICAgICBjb25zdCBmb3J3YXJkID0gYW1vdW50ID4gMFxuICAgICAgY29uc3QgbW92ZXIgPSBmb3J3YXJkID8gbmV4dERheSA6IHByZXZEYXlcbiAgICAgIGNvbnN0IGxpbWl0ID0gZm9yd2FyZCA/IERBWVNfSU5fTU9OVEhfTUFYIDogREFZX01JTlxuICAgICAgbGV0IHRpbWVzID0gZm9yd2FyZCA/IGFtb3VudCA6IC1hbW91bnRcblxuICAgICAgd2hpbGUgKC0tdGltZXMgPj0gMCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgICAgIG1vdmVkLmRheSA9IGxpbWl0XG4gICAgICAgICAgICBtb3Zlcihtb3ZlZClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnd2Vlayc6XG4gICAgICAgICAgICByZWxhdGl2ZURheXMobW92ZWQsIG1vdmVyLCBEQVlTX0lOX1dFRUspXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgICAgICByZWxhdGl2ZURheXMobW92ZWQsIG1vdmVyLCAxKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICc0ZGF5JzpcbiAgICAgICAgICAgIHJlbGF0aXZlRGF5cyhtb3ZlZCwgbW92ZXIsIDQpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ2NhdGVnb3J5JzpcbiAgICAgICAgICAgIHJlbGF0aXZlRGF5cyhtb3ZlZCwgbW92ZXIsIHRoaXMucGFyc2VkQ2F0ZWdvcnlEYXlzKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB1cGRhdGVXZWVrZGF5KG1vdmVkKVxuICAgICAgdXBkYXRlRm9ybWF0dGVkKG1vdmVkKVxuICAgICAgdXBkYXRlUmVsYXRpdmUobW92ZWQsIHRoaXMudGltZXMubm93KVxuXG4gICAgICBpZiAodGhpcy52YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCB0aW1lc3RhbXBUb0RhdGUobW92ZWQpKVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy52YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCB0aW1lc3RhbXBUb0RhdGUobW92ZWQpLmdldFRpbWUoKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgbW92ZWQuZGF0ZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy4kZW1pdCgnbW92ZWQnLCBtb3ZlZClcbiAgICB9LFxuICAgIG5leHQgKGFtb3VudCA9IDEpOiB2b2lkIHtcbiAgICAgIHRoaXMubW92ZShhbW91bnQpXG4gICAgfSxcbiAgICBwcmV2IChhbW91bnQgPSAxKTogdm9pZCB7XG4gICAgICB0aGlzLm1vdmUoLWFtb3VudClcbiAgICB9LFxuICAgIHRpbWVUb1kgKHRpbWU6IFZUaW1lLCBjbGFtcCA9IHRydWUpOiBudW1iZXIgfCBmYWxzZSB7XG4gICAgICBjb25zdCBjID0gdGhpcy4kY2hpbGRyZW5bMF0gYXMgYW55XG5cbiAgICAgIGlmIChjICYmIGMudGltZVRvWSkge1xuICAgICAgICByZXR1cm4gYy50aW1lVG9ZKHRpbWUsIGNsYW1wKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICB0aW1lRGVsdGEgKHRpbWU6IFZUaW1lKTogbnVtYmVyIHwgZmFsc2Uge1xuICAgICAgY29uc3QgYyA9IHRoaXMuJGNoaWxkcmVuWzBdIGFzIGFueVxuXG4gICAgICBpZiAoYyAmJiBjLnRpbWVEZWx0YSkge1xuICAgICAgICByZXR1cm4gYy50aW1lRGVsdGEodGltZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgbWludXRlc1RvUGl4ZWxzIChtaW51dGVzOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgY29uc3QgYyA9IHRoaXMuJGNoaWxkcmVuWzBdIGFzIGFueVxuXG4gICAgICBpZiAoYyAmJiBjLm1pbnV0ZXNUb1BpeGVscykge1xuICAgICAgICByZXR1cm4gYy5taW51dGVzVG9QaXhlbHMobWludXRlcylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgIH0sXG4gICAgc2Nyb2xsVG9UaW1lICh0aW1lOiBWVGltZSk6IGJvb2xlYW4ge1xuICAgICAgY29uc3QgYyA9IHRoaXMuJGNoaWxkcmVuWzBdIGFzIGFueVxuXG4gICAgICBpZiAoYyAmJiBjLnNjcm9sbFRvVGltZSkge1xuICAgICAgICByZXR1cm4gYy5zY3JvbGxUb1RpbWUodGltZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgcGFyc2VUaW1lc3RhbXAgKGlucHV0OiBWVGltZXN0YW1wSW5wdXQsIHJlcXVpcmVkPzogZmFsc2UpOiBDYWxlbmRhclRpbWVzdGFtcCB8IG51bGwge1xuICAgICAgcmV0dXJuIHBhcnNlVGltZXN0YW1wKGlucHV0LCByZXF1aXJlZCwgdGhpcy50aW1lcy5ub3cpXG4gICAgfSxcbiAgICB0aW1lc3RhbXBUb0RhdGUgKHRpbWVzdGFtcDogQ2FsZW5kYXJUaW1lc3RhbXApOiBEYXRlIHtcbiAgICAgIHJldHVybiB0aW1lc3RhbXBUb0RhdGUodGltZXN0YW1wKVxuICAgIH0sXG4gICAgZ2V0Q2F0ZWdvcnlMaXN0IChjYXRlZ29yaWVzOiBDYWxlbmRhckNhdGVnb3J5W10pOiBDYWxlbmRhckNhdGVnb3J5W10ge1xuICAgICAgaWYgKCF0aGlzLm5vRXZlbnRzKSB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5TWFwOiBhbnkgPSBjYXRlZ29yaWVzLnJlZHVjZSgobWFwOiBhbnksIGNhdGVnb3J5LCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgY2F0ZWdvcnkgPT09ICdvYmplY3QnICYmIGNhdGVnb3J5LmNhdGVnb3J5TmFtZSkgbWFwW2NhdGVnb3J5LmNhdGVnb3J5TmFtZV0gPSB7IGluZGV4LCBjb3VudDogMCB9XG4gICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGNhdGVnb3J5ID09PSAnc3RyaW5nJykgbWFwW2NhdGVnb3J5XSA9IHsgaW5kZXgsIGNvdW50OiAwIH1cbiAgICAgICAgICByZXR1cm4gbWFwXG4gICAgICAgIH0sIHt9KVxuXG4gICAgICAgIGlmICghdGhpcy5jYXRlZ29yeUhpZGVEeW5hbWljIHx8ICF0aGlzLmNhdGVnb3J5U2hvd0FsbCkge1xuICAgICAgICAgIGxldCBjYXRlZ29yeUxlbmd0aCA9IGNhdGVnb3JpZXMubGVuZ3RoXG5cbiAgICAgICAgICB0aGlzLnBhcnNlZEV2ZW50cy5mb3JFYWNoKGV2ID0+IHtcbiAgICAgICAgICAgIGxldCBjYXRlZ29yeSA9IGV2LmNhdGVnb3J5XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2F0ZWdvcnkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGNhdGVnb3J5ID0gdGhpcy5jYXRlZ29yeUZvckludmFsaWRcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFjYXRlZ29yeSkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNhdGVnb3J5IGluIGNhdGVnb3J5TWFwKSB7XG4gICAgICAgICAgICAgIGNhdGVnb3J5TWFwW2NhdGVnb3J5XS5jb3VudCsrXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmNhdGVnb3J5SGlkZUR5bmFtaWMpIHtcbiAgICAgICAgICAgICAgY2F0ZWdvcnlNYXBbY2F0ZWdvcnldID0ge1xuICAgICAgICAgICAgICAgIGluZGV4OiBjYXRlZ29yeUxlbmd0aCsrLFxuICAgICAgICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5jYXRlZ29yeVNob3dBbGwpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGNhdGVnb3J5IGluIGNhdGVnb3J5TWFwKSB7XG4gICAgICAgICAgICBpZiAoY2F0ZWdvcnlNYXBbY2F0ZWdvcnldLmNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgIGRlbGV0ZSBjYXRlZ29yeU1hcFtjYXRlZ29yeV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYXRlZ29yaWVzID0gY2F0ZWdvcmllcy5maWx0ZXIoKGNhdGVnb3J5OiBDYWxlbmRhckNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjYXRlZ29yeSA9PT0gJ29iamVjdCcgJiYgY2F0ZWdvcnkuY2F0ZWdvcnlOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gY2F0ZWdvcnlNYXAuaGFzT3duUHJvcGVydHkoY2F0ZWdvcnkuY2F0ZWdvcnlOYW1lKVxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNhdGVnb3J5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIGNhdGVnb3J5TWFwLmhhc093blByb3BlcnR5KGNhdGVnb3J5KVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYXRlZ29yaWVzXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgeyBzdGFydCwgZW5kLCBtYXhEYXlzLCBjb21wb25lbnQsIHdlZWtkYXlzLCBjYXRlZ29yaWVzIH0gPSB0aGlzLnJlbmRlclByb3BzXG5cbiAgICByZXR1cm4gaChjb21wb25lbnQsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhcicsXG4gICAgICBjbGFzczoge1xuICAgICAgICAndi1jYWxlbmRhci1ldmVudHMnOiAhdGhpcy5ub0V2ZW50cyxcbiAgICAgIH0sXG4gICAgICBwcm9wczoge1xuICAgICAgICAuLi50aGlzLiRwcm9wcyxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0LmRhdGUsXG4gICAgICAgIGVuZDogZW5kLmRhdGUsXG4gICAgICAgIG1heERheXMsXG4gICAgICAgIHdlZWtkYXlzLFxuICAgICAgICBjYXRlZ29yaWVzLFxuICAgICAgfSxcbiAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgIG1vZGlmaWVyczogeyBxdWlldDogdHJ1ZSB9LFxuICAgICAgICBuYW1lOiAncmVzaXplJyxcbiAgICAgICAgdmFsdWU6IHRoaXMudXBkYXRlRXZlbnRWaXNpYmlsaXR5LFxuICAgICAgfV0sXG4gICAgICBvbjoge1xuICAgICAgICAuLi50aGlzLiRsaXN0ZW5lcnMsXG5cbiAgICAgICAgJ2NsaWNrOmRhdGUnOiAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCwgZT86IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy4kbGlzdGVuZXJzLmlucHV0KSB7XG4gICAgICAgICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIGRheS5kYXRlKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy4kbGlzdGVuZXJzWydjbGljazpkYXRlJ10pIHtcbiAgICAgICAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrOmRhdGUnLCBkYXksIGUpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHNjb3BlZFNsb3RzOiB0aGlzLmdldFNjb3BlZFNsb3RzKCksXG4gICAgfSlcbiAgfSxcbn0pXG4iXX0=
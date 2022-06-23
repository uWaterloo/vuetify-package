// Styles
import './VCalendarDaily.sass';
// Directives
import Resize from '../../directives/resize';
// Components
import VBtn from '../VBtn';
// Mixins
import CalendarWithIntervals from './mixins/calendar-with-intervals';
// Util
import { convertToUnit, getSlot } from '../../util/helpers';
/* @vue/component */
export default CalendarWithIntervals.extend({
    name: 'v-calendar-daily',
    directives: { Resize },
    data: () => ({
        scrollPush: 0,
    }),
    computed: {
        classes() {
            return {
                'v-calendar-daily': true,
                ...this.themeClasses,
            };
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.$nextTick(this.onResize);
        },
        onResize() {
            this.scrollPush = this.getScrollPush();
        },
        getScrollPush() {
            const area = this.$refs.scrollArea;
            const pane = this.$refs.pane;
            return area && pane ? (area.offsetWidth - pane.offsetWidth) : 0;
        },
        genHead() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__head',
                style: {
                    marginRight: this.scrollPush + 'px',
                },
            }, [
                this.genHeadIntervals(),
                ...this.genHeadDays(),
            ]);
        },
        genHeadIntervals() {
            const width = convertToUnit(this.intervalWidth);
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__intervals-head',
                style: {
                    width,
                },
            }, getSlot(this, 'interval-header'));
        },
        genHeadDays() {
            return this.days.map(this.genHeadDay);
        },
        genHeadDay(day, index) {
            return this.$createElement('div', {
                key: day.date,
                staticClass: 'v-calendar-daily_head-day',
                class: this.getRelativeClasses(day),
                on: this.getDefaultMouseEventHandlers(':day', nativeEvent => {
                    return { nativeEvent, ...this.getSlotScope(day) };
                }),
            }, [
                this.genHeadWeekday(day),
                this.genHeadDayLabel(day),
                ...this.genDayHeader(day, index),
            ]);
        },
        genDayHeader(day, index) {
            return getSlot(this, 'day-header', () => ({
                week: this.days, ...day, index,
            })) || [];
        },
        genHeadWeekday(day) {
            const color = day.present ? this.color : undefined;
            return this.$createElement('div', this.setTextColor(color, {
                staticClass: 'v-calendar-daily_head-weekday',
            }), this.weekdayFormatter(day, this.shortWeekdays));
        },
        genHeadDayLabel(day) {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily_head-day-label',
            }, getSlot(this, 'day-label-header', day) || [this.genHeadDayButton(day)]);
        },
        genHeadDayButton(day) {
            const color = day.present ? this.color : 'transparent';
            return this.$createElement(VBtn, {
                props: {
                    color,
                    fab: true,
                    depressed: true,
                },
                on: this.getMouseEventHandlers({
                    'click:date': { event: 'click', stop: true },
                    'contextmenu:date': { event: 'contextmenu', stop: true, prevent: true, result: false },
                }, nativeEvent => {
                    return { nativeEvent, ...day };
                }),
            }, this.dayFormatter(day, false));
        },
        genBody() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__body',
            }, [
                this.genScrollArea(),
            ]);
        },
        genScrollArea() {
            return this.$createElement('div', {
                ref: 'scrollArea',
                staticClass: 'v-calendar-daily__scroll-area',
            }, [
                this.genPane(),
            ]);
        },
        genPane() {
            return this.$createElement('div', {
                ref: 'pane',
                staticClass: 'v-calendar-daily__pane',
                style: {
                    height: convertToUnit(this.bodyHeight + 50),
                },
            }, [
                this.genDayContainer(),
            ]);
        },
        genDayContainer() {
            return this.$createElement('div', {
                staticClass: 'v-calendar-daily__day-container',
            }, [
                this.genBodyIntervals(),
                ...this.genDays(),
            ]);
        },
        genDays() {
            return this.days.map(this.genDay);
        },
        genDay(day, index) {
            return this.$createElement('div', {
                key: day.date,
                staticClass: 'v-calendar-daily__day',
                class: this.getRelativeClasses(day),
                on: this.getDefaultMouseEventHandlers(':time', nativeEvent => {
                    return { nativeEvent, ...this.getSlotScope(this.getTimestampAtEvent(nativeEvent, day)) };
                }),
            }, [
                ...this.genDayIntervals(index),
                ...this.genDayBody(day),
            ]);
        },
        genDayBody(day) {
            return getSlot(this, 'day-body', () => this.getSlotScope(day)) || [];
        },
        genDayIntervals(index) {
            return this.intervals[index].map(this.genDayInterval);
        },
        genDayInterval(interval) {
            const height = convertToUnit(this.intervalHeight);
            const styler = this.intervalStyle || this.intervalStyleDefault;
            const data = {
                key: interval.time,
                staticClass: 'v-calendar-daily__day-interval',
                style: {
                    height,
                    ...styler(interval),
                },
            };
            const children = getSlot(this, 'interval', () => this.getSlotScope(interval));
            return this.$createElement('div', data, children);
        },
        genBodyIntervals() {
            const width = convertToUnit(this.intervalWidth);
            const data = {
                staticClass: 'v-calendar-daily__intervals-body',
                style: {
                    width,
                },
                on: this.getDefaultMouseEventHandlers(':interval', nativeEvent => {
                    return { nativeEvent, ...this.getTimestampAtEvent(nativeEvent, this.parsedStart) };
                }),
            };
            return this.$createElement('div', data, this.genIntervalLabels());
        },
        genIntervalLabels() {
            if (!this.intervals.length)
                return null;
            return this.intervals[0].map(this.genIntervalLabel);
        },
        genIntervalLabel(interval) {
            const height = convertToUnit(this.intervalHeight);
            const short = this.shortIntervals;
            const shower = this.showIntervalLabel || this.showIntervalLabelDefault;
            const show = shower(interval);
            const label = show ? this.intervalFormatter(interval, short) : undefined;
            return this.$createElement('div', {
                key: interval.time,
                staticClass: 'v-calendar-daily__interval',
                style: {
                    height,
                },
            }, [
                this.$createElement('div', {
                    staticClass: 'v-calendar-daily__interval-text',
                }, label),
            ]);
        },
    },
    render(h) {
        return h('div', {
            class: this.classes,
            on: {
                dragstart: (e) => {
                    e.preventDefault();
                },
            },
            directives: [{
                    modifiers: { quiet: true },
                    name: 'resize',
                    value: this.onResize,
                }],
        }, [
            !this.hideHeader ? this.genHead() : '',
            this.genBody(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNhbGVuZGFyRGFpbHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ2FsZW5kYXIvVkNhbGVuZGFyRGFpbHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sdUJBQXVCLENBQUE7QUFLOUIsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLGFBQWE7QUFDYixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFFMUIsU0FBUztBQUNULE9BQU8scUJBQXFCLE1BQU0sa0NBQWtDLENBQUE7QUFFcEUsT0FBTztBQUNQLE9BQU8sRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFHM0Qsb0JBQW9CO0FBQ3BCLGVBQWUscUJBQXFCLENBQUMsTUFBTSxDQUFDO0lBQzFDLElBQUksRUFBRSxrQkFBa0I7SUFFeEIsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFO0lBRXRCLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsVUFBVSxFQUFFLENBQUM7S0FDZCxDQUFDO0lBRUYsUUFBUSxFQUFFO1FBQ1IsT0FBTztZQUNMLE9BQU87Z0JBQ0wsa0JBQWtCLEVBQUUsSUFBSTtnQkFDeEIsR0FBRyxJQUFJLENBQUMsWUFBWTthQUNyQixDQUFBO1FBQ0gsQ0FBQztLQUNGO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNiLENBQUM7SUFFRCxPQUFPLEVBQUU7UUFDUCxJQUFJO1lBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDL0IsQ0FBQztRQUNELFFBQVE7WUFDTixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUN4QyxDQUFDO1FBQ0QsYUFBYTtZQUNYLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENB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QUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUE7WUFFeEUsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtnQkFDaEMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxJQUFJO2dCQUNsQixXQUFXLEVBQUUsNEJBQTRCO2dCQUN6QyxLQUFLLEVBQUU7b0JBQ0wsTUFBTTtpQkFDUDthQUNGLEVBQUU7Z0JBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7b0JBQ3pCLFdBQVcsRUFBRSxpQ0FBaUM7aUJBQy9DLEVBQUUsS0FBSyxDQUFDO2FBQ1YsQ0FBQyxDQUFBO1FBQ0osQ0FBQztLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsRUFBRSxFQUFFO2dCQUNGLFNBQVMsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO29CQUMzQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUE7Z0JBQ3BCLENBQUM7YUFDRjtZQUNELFVBQVUsRUFBRSxDQUFDO29CQUNYLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7b0JBQzFCLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUTtpQkFDckIsQ0FBQztTQUNILEVBQUU7WUFDRCxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN0QyxJQUFJLENBQUMsT0FBTyxFQUFFO1NBQ2YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZDYWxlbmRhckRhaWx5LnNhc3MnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IFJlc2l6ZSBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL3Jlc2l6ZSdcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZCdG4gZnJvbSAnLi4vVkJ0bidcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ2FsZW5kYXJXaXRoSW50ZXJ2YWxzIGZyb20gJy4vbWl4aW5zL2NhbGVuZGFyLXdpdGgtaW50ZXJ2YWxzJ1xuXG4vLyBVdGlsXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0LCBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgQ2FsZW5kYXJUaW1lc3RhbXAgfSBmcm9tICd2dWV0aWZ5L3R5cGVzJ1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgQ2FsZW5kYXJXaXRoSW50ZXJ2YWxzLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWNhbGVuZGFyLWRhaWx5JyxcblxuICBkaXJlY3RpdmVzOiB7IFJlc2l6ZSB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgc2Nyb2xsUHVzaDogMCxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3YtY2FsZW5kYXItZGFpbHknOiB0cnVlLFxuICAgICAgICAuLi50aGlzLnRoZW1lQ2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIHRoaXMuaW5pdCgpXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGluaXQgKCkge1xuICAgICAgdGhpcy4kbmV4dFRpY2sodGhpcy5vblJlc2l6ZSlcbiAgICB9LFxuICAgIG9uUmVzaXplICgpIHtcbiAgICAgIHRoaXMuc2Nyb2xsUHVzaCA9IHRoaXMuZ2V0U2Nyb2xsUHVzaCgpXG4gICAgfSxcbiAgICBnZXRTY3JvbGxQdXNoICgpOiBudW1iZXIge1xuICAgICAgY29uc3QgYXJlYSA9IHRoaXMuJHJlZnMuc2Nyb2xsQXJlYSBhcyBIVE1MRWxlbWVudFxuICAgICAgY29uc3QgcGFuZSA9IHRoaXMuJHJlZnMucGFuZSBhcyBIVE1MRWxlbWVudFxuXG4gICAgICByZXR1cm4gYXJlYSAmJiBwYW5lID8gKGFyZWEub2Zmc2V0V2lkdGggLSBwYW5lLm9mZnNldFdpZHRoKSA6IDBcbiAgICB9LFxuICAgIGdlbkhlYWQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9faGVhZCcsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgbWFyZ2luUmlnaHQ6IHRoaXMuc2Nyb2xsUHVzaCArICdweCcsXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuSGVhZEludGVydmFscygpLFxuICAgICAgICAuLi50aGlzLmdlbkhlYWREYXlzKCksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuSGVhZEludGVydmFscyAoKTogVk5vZGUge1xuICAgICAgY29uc3Qgd2lkdGg6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGNvbnZlcnRUb1VuaXQodGhpcy5pbnRlcnZhbFdpZHRoKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFscy1oZWFkJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgfSxcbiAgICAgIH0sIGdldFNsb3QodGhpcywgJ2ludGVydmFsLWhlYWRlcicpKVxuICAgIH0sXG4gICAgZ2VuSGVhZERheXMgKCk6IFZOb2RlW10ge1xuICAgICAgcmV0dXJuIHRoaXMuZGF5cy5tYXAodGhpcy5nZW5IZWFkRGF5KVxuICAgIH0sXG4gICAgZ2VuSGVhZERheSAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCwgaW5kZXg6IG51bWJlcik6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogZGF5LmRhdGUsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9oZWFkLWRheScsXG4gICAgICAgIGNsYXNzOiB0aGlzLmdldFJlbGF0aXZlQ2xhc3NlcyhkYXkpLFxuICAgICAgICBvbjogdGhpcy5nZXREZWZhdWx0TW91c2VFdmVudEhhbmRsZXJzKCc6ZGF5JywgbmF0aXZlRXZlbnQgPT4ge1xuICAgICAgICAgIHJldHVybiB7IG5hdGl2ZUV2ZW50LCAuLi50aGlzLmdldFNsb3RTY29wZShkYXkpIH1cbiAgICAgICAgfSksXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuSGVhZFdlZWtkYXkoZGF5KSxcbiAgICAgICAgdGhpcy5nZW5IZWFkRGF5TGFiZWwoZGF5KSxcbiAgICAgICAgLi4udGhpcy5nZW5EYXlIZWFkZXIoZGF5LCBpbmRleCksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuRGF5SGVhZGVyIChkYXk6IENhbGVuZGFyVGltZXN0YW1wLCBpbmRleDogbnVtYmVyKTogVk5vZGVbXSB7XG4gICAgICByZXR1cm4gZ2V0U2xvdCh0aGlzLCAnZGF5LWhlYWRlcicsICgpID0+ICh7XG4gICAgICAgIHdlZWs6IHRoaXMuZGF5cywgLi4uZGF5LCBpbmRleCxcbiAgICAgIH0pKSB8fCBbXVxuICAgIH0sXG4gICAgZ2VuSGVhZFdlZWtkYXkgKGRheTogQ2FsZW5kYXJUaW1lc3RhbXApOiBWTm9kZSB7XG4gICAgICBjb25zdCBjb2xvciA9IGRheS5wcmVzZW50ID8gdGhpcy5jb2xvciA6IHVuZGVmaW5lZFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgdGhpcy5zZXRUZXh0Q29sb3IoY29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X2hlYWQtd2Vla2RheScsXG4gICAgICB9KSwgdGhpcy53ZWVrZGF5Rm9ybWF0dGVyKGRheSwgdGhpcy5zaG9ydFdlZWtkYXlzKSlcbiAgICB9LFxuICAgIGdlbkhlYWREYXlMYWJlbCAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9oZWFkLWRheS1sYWJlbCcsXG4gICAgICB9LCBnZXRTbG90KHRoaXMsICdkYXktbGFiZWwtaGVhZGVyJywgZGF5KSB8fCBbdGhpcy5nZW5IZWFkRGF5QnV0dG9uKGRheSldKVxuICAgIH0sXG4gICAgZ2VuSGVhZERheUJ1dHRvbiAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZGF5LnByZXNlbnQgPyB0aGlzLmNvbG9yIDogJ3RyYW5zcGFyZW50J1xuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWQnRuLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgY29sb3IsXG4gICAgICAgICAgZmFiOiB0cnVlLFxuICAgICAgICAgIGRlcHJlc3NlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHRoaXMuZ2V0TW91c2VFdmVudEhhbmRsZXJzKHtcbiAgICAgICAgICAnY2xpY2s6ZGF0ZSc6IHsgZXZlbnQ6ICdjbGljaycsIHN0b3A6IHRydWUgfSxcbiAgICAgICAgICAnY29udGV4dG1lbnU6ZGF0ZSc6IHsgZXZlbnQ6ICdjb250ZXh0bWVudScsIHN0b3A6IHRydWUsIHByZXZlbnQ6IHRydWUsIHJlc3VsdDogZmFsc2UgfSxcbiAgICAgICAgfSwgbmF0aXZlRXZlbnQgPT4ge1xuICAgICAgICAgIHJldHVybiB7IG5hdGl2ZUV2ZW50LCAuLi5kYXkgfVxuICAgICAgICB9KSxcbiAgICAgIH0sIHRoaXMuZGF5Rm9ybWF0dGVyKGRheSwgZmFsc2UpKVxuICAgIH0sXG4gICAgZ2VuQm9keSAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19ib2R5JyxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5TY3JvbGxBcmVhKCksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuU2Nyb2xsQXJlYSAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgcmVmOiAnc2Nyb2xsQXJlYScsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9fc2Nyb2xsLWFyZWEnLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmdlblBhbmUoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5QYW5lICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICByZWY6ICdwYW5lJyxcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19wYW5lJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQ6IGNvbnZlcnRUb1VuaXQodGhpcy5ib2R5SGVpZ2h0ICsgNTApLFxuICAgICAgICB9LFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmdlbkRheUNvbnRhaW5lcigpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkRheUNvbnRhaW5lciAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19kYXktY29udGFpbmVyJyxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5Cb2R5SW50ZXJ2YWxzKCksXG4gICAgICAgIC4uLnRoaXMuZ2VuRGF5cygpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkRheXMgKCk6IFZOb2RlW10ge1xuICAgICAgcmV0dXJuIHRoaXMuZGF5cy5tYXAodGhpcy5nZW5EYXkpXG4gICAgfSxcbiAgICBnZW5EYXkgKGRheTogQ2FsZW5kYXJUaW1lc3RhbXAsIGluZGV4OiBudW1iZXIpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBrZXk6IGRheS5kYXRlLFxuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2RheScsXG4gICAgICAgIGNsYXNzOiB0aGlzLmdldFJlbGF0aXZlQ2xhc3NlcyhkYXkpLFxuICAgICAgICBvbjogdGhpcy5nZXREZWZhdWx0TW91c2VFdmVudEhhbmRsZXJzKCc6dGltZScsIG5hdGl2ZUV2ZW50ID0+IHtcbiAgICAgICAgICByZXR1cm4geyBuYXRpdmVFdmVudCwgLi4udGhpcy5nZXRTbG90U2NvcGUodGhpcy5nZXRUaW1lc3RhbXBBdEV2ZW50KG5hdGl2ZUV2ZW50LCBkYXkpKSB9XG4gICAgICAgIH0pLFxuICAgICAgfSwgW1xuICAgICAgICAuLi50aGlzLmdlbkRheUludGVydmFscyhpbmRleCksXG4gICAgICAgIC4uLnRoaXMuZ2VuRGF5Qm9keShkYXkpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkRheUJvZHkgKGRheTogQ2FsZW5kYXJUaW1lc3RhbXApOiBWTm9kZVtdIHtcbiAgICAgIHJldHVybiBnZXRTbG90KHRoaXMsICdkYXktYm9keScsICgpID0+IHRoaXMuZ2V0U2xvdFNjb3BlKGRheSkpIHx8IFtdXG4gICAgfSxcbiAgICBnZW5EYXlJbnRlcnZhbHMgKGluZGV4OiBudW1iZXIpOiBWTm9kZVtdIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVydmFsc1tpbmRleF0ubWFwKHRoaXMuZ2VuRGF5SW50ZXJ2YWwpXG4gICAgfSxcbiAgICBnZW5EYXlJbnRlcnZhbCAoaW50ZXJ2YWw6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgY29uc3QgaGVpZ2h0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBjb252ZXJ0VG9Vbml0KHRoaXMuaW50ZXJ2YWxIZWlnaHQpXG4gICAgICBjb25zdCBzdHlsZXIgPSB0aGlzLmludGVydmFsU3R5bGUgfHwgdGhpcy5pbnRlcnZhbFN0eWxlRGVmYXVsdFxuXG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBrZXk6IGludGVydmFsLnRpbWUsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9fZGF5LWludGVydmFsJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgLi4uc3R5bGVyKGludGVydmFsKSxcbiAgICAgICAgfSxcblxuICAgICAgfVxuXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGdldFNsb3QodGhpcywgJ2ludGVydmFsJywgKCkgPT4gdGhpcy5nZXRTbG90U2NvcGUoaW50ZXJ2YWwpKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgZGF0YSwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBnZW5Cb2R5SW50ZXJ2YWxzICgpOiBWTm9kZSB7XG4gICAgICBjb25zdCB3aWR0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gY29udmVydFRvVW5pdCh0aGlzLmludGVydmFsV2lkdGgpXG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFscy1ib2R5JyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHRoaXMuZ2V0RGVmYXVsdE1vdXNlRXZlbnRIYW5kbGVycygnOmludGVydmFsJywgbmF0aXZlRXZlbnQgPT4ge1xuICAgICAgICAgIHJldHVybiB7IG5hdGl2ZUV2ZW50LCAuLi50aGlzLmdldFRpbWVzdGFtcEF0RXZlbnQobmF0aXZlRXZlbnQsIHRoaXMucGFyc2VkU3RhcnQpIH1cbiAgICAgICAgfSksXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCBkYXRhLCB0aGlzLmdlbkludGVydmFsTGFiZWxzKCkpXG4gICAgfSxcbiAgICBnZW5JbnRlcnZhbExhYmVscyAoKTogVk5vZGVbXSB8IG51bGwge1xuICAgICAgaWYgKCF0aGlzLmludGVydmFscy5sZW5ndGgpIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLmludGVydmFsc1swXS5tYXAodGhpcy5nZW5JbnRlcnZhbExhYmVsKVxuICAgIH0sXG4gICAgZ2VuSW50ZXJ2YWxMYWJlbCAoaW50ZXJ2YWw6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgY29uc3QgaGVpZ2h0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBjb252ZXJ0VG9Vbml0KHRoaXMuaW50ZXJ2YWxIZWlnaHQpXG4gICAgICBjb25zdCBzaG9ydDogYm9vbGVhbiA9IHRoaXMuc2hvcnRJbnRlcnZhbHNcbiAgICAgIGNvbnN0IHNob3dlciA9IHRoaXMuc2hvd0ludGVydmFsTGFiZWwgfHwgdGhpcy5zaG93SW50ZXJ2YWxMYWJlbERlZmF1bHRcbiAgICAgIGNvbnN0IHNob3cgPSBzaG93ZXIoaW50ZXJ2YWwpXG4gICAgICBjb25zdCBsYWJlbCA9IHNob3cgPyB0aGlzLmludGVydmFsRm9ybWF0dGVyKGludGVydmFsLCBzaG9ydCkgOiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiBpbnRlcnZhbC50aW1lLFxuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFsJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFsLXRleHQnLFxuICAgICAgICB9LCBsYWJlbCksXG4gICAgICBdKVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKCdkaXYnLCB7XG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgb246IHtcbiAgICAgICAgZHJhZ3N0YXJ0OiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgIG1vZGlmaWVyczogeyBxdWlldDogdHJ1ZSB9LFxuICAgICAgICBuYW1lOiAncmVzaXplJyxcbiAgICAgICAgdmFsdWU6IHRoaXMub25SZXNpemUsXG4gICAgICB9XSxcbiAgICB9LCBbXG4gICAgICAhdGhpcy5oaWRlSGVhZGVyID8gdGhpcy5nZW5IZWFkKCkgOiAnJyxcbiAgICAgIHRoaXMuZ2VuQm9keSgpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
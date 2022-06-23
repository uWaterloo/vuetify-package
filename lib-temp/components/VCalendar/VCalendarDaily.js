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
                    height: convertToUnit(this.bodyHeight),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNhbGVuZGFyRGFpbHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ2FsZW5kYXIvVkNhbGVuZGFyRGFpbHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sdUJBQXVCLENBQUE7QUFLOUIsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLGFBQWE7QUFDYixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFFMUIsU0FBUztBQUNULE9BQU8scUJBQXFCLE1BQU0sa0NBQWtDLENBQUE7QUFFcEUsT0FBTztBQUNQLE9BQU8sRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFHM0Qsb0JBQW9CO0FBQ3BCLGVBQWUscUJBQXFCLENBQUMsTUFBTSxDQUFDO0lBQzFDLElBQUksRUFBRSxrQkFBa0I7SUFFeEIsVUFBVSxFQUFFLEVBQUUsTUFBTSxFQUFFO0lBRXRCLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsVUFBVSxFQUFFLENBQUM7S0FDZCxDQUFDO0lBRUYsUUFBUSxFQUFFO1FBQ1IsT0FBTztZQUNMLE9BQU87Z0JBQ0wsa0JBQWtCLEVBQUUsSUFBSTtnQkFDeEIsR0FBRyxJQUFJLENBQUMsWUFBWTthQUNyQixDQUFBO1FBQ0gsQ0FBQztLQUNGO0lBRUQsT0FBTztRQUNMLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUNiLENBQUM7SUFFRCxPQUFPLEVBQUU7UUFDUCxJQUFJO1lBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDL0IsQ0FBQztRQUNELFFBQVE7WUFDTixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUN4QyxDQUFDO1FBQ0QsYUFBYTtZQUNYLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENB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QUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtZQUV4RSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO2dCQUNoQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUk7Z0JBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7Z0JBQ3pDLEtBQUssRUFBRTtvQkFDTCxNQUFNO2lCQUNQO2FBQ0YsRUFBRTtnQkFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtvQkFDekIsV0FBVyxFQUFFLGlDQUFpQztpQkFDL0MsRUFBRSxLQUFLLENBQUM7YUFDVixDQUFDLENBQUE7UUFDSixDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTztZQUNuQixFQUFFLEVBQUU7Z0JBQ0YsU0FBUyxFQUFFLENBQUMsQ0FBYSxFQUFFLEVBQUU7b0JBQzNCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtnQkFDcEIsQ0FBQzthQUNGO1lBQ0QsVUFBVSxFQUFFLENBQUM7b0JBQ1gsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtvQkFDMUIsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRO2lCQUNyQixDQUFDO1NBQ0gsRUFBRTtZQUNELENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDZixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVkNhbGVuZGFyRGFpbHkuc2FzcydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAndnVlJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgUmVzaXplIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvcmVzaXplJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVkJ0biBmcm9tICcuLi9WQnRuJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBDYWxlbmRhcldpdGhJbnRlcnZhbHMgZnJvbSAnLi9taXhpbnMvY2FsZW5kYXItd2l0aC1pbnRlcnZhbHMnXG5cbi8vIFV0aWxcbmltcG9ydCB7IGNvbnZlcnRUb1VuaXQsIGdldFNsb3QgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgeyBDYWxlbmRhclRpbWVzdGFtcCB9IGZyb20gJ3Z1ZXRpZnkvdHlwZXMnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBDYWxlbmRhcldpdGhJbnRlcnZhbHMuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtY2FsZW5kYXItZGFpbHknLFxuXG4gIGRpcmVjdGl2ZXM6IHsgUmVzaXplIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBzY3JvbGxQdXNoOiAwLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndi1jYWxlbmRhci1kYWlseSc6IHRydWUsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgbW91bnRlZCAoKSB7XG4gICAgdGhpcy5pbml0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgaW5pdCAoKSB7XG4gICAgICB0aGlzLiRuZXh0VGljayh0aGlzLm9uUmVzaXplKVxuICAgIH0sXG4gICAgb25SZXNpemUgKCkge1xuICAgICAgdGhpcy5zY3JvbGxQdXNoID0gdGhpcy5nZXRTY3JvbGxQdXNoKClcbiAgICB9LFxuICAgIGdldFNjcm9sbFB1c2ggKCk6IG51bWJlciB7XG4gICAgICBjb25zdCBhcmVhID0gdGhpcy4kcmVmcy5zY3JvbGxBcmVhIGFzIEhUTUxFbGVtZW50XG4gICAgICBjb25zdCBwYW5lID0gdGhpcy4kcmVmcy5wYW5lIGFzIEhUTUxFbGVtZW50XG5cbiAgICAgIHJldHVybiBhcmVhICYmIHBhbmUgPyAoYXJlYS5vZmZzZXRXaWR0aCAtIHBhbmUub2Zmc2V0V2lkdGgpIDogMFxuICAgIH0sXG4gICAgZ2VuSGVhZCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19oZWFkJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBtYXJnaW5SaWdodDogdGhpcy5zY3JvbGxQdXNoICsgJ3B4JyxcbiAgICAgICAgfSxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5IZWFkSW50ZXJ2YWxzKCksXG4gICAgICAgIC4uLnRoaXMuZ2VuSGVhZERheXMoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5IZWFkSW50ZXJ2YWxzICgpOiBWTm9kZSB7XG4gICAgICBjb25zdCB3aWR0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gY29udmVydFRvVW5pdCh0aGlzLmludGVydmFsV2lkdGgpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9faW50ZXJ2YWxzLWhlYWQnLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHdpZHRoLFxuICAgICAgICB9LFxuICAgICAgfSwgZ2V0U2xvdCh0aGlzLCAnaW50ZXJ2YWwtaGVhZGVyJykpXG4gICAgfSxcbiAgICBnZW5IZWFkRGF5cyAoKTogVk5vZGVbXSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXlzLm1hcCh0aGlzLmdlbkhlYWREYXkpXG4gICAgfSxcbiAgICBnZW5IZWFkRGF5IChkYXk6IENhbGVuZGFyVGltZXN0YW1wLCBpbmRleDogbnVtYmVyKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiBkYXkuZGF0ZSxcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X2hlYWQtZGF5JyxcbiAgICAgICAgY2xhc3M6IHRoaXMuZ2V0UmVsYXRpdmVDbGFzc2VzKGRheSksXG4gICAgICAgIG9uOiB0aGlzLmdldERlZmF1bHRNb3VzZUV2ZW50SGFuZGxlcnMoJzpkYXknLCBuYXRpdmVFdmVudCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHsgbmF0aXZlRXZlbnQsIC4uLnRoaXMuZ2V0U2xvdFNjb3BlKGRheSkgfVxuICAgICAgICB9KSxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5IZWFkV2Vla2RheShkYXkpLFxuICAgICAgICB0aGlzLmdlbkhlYWREYXlMYWJlbChkYXkpLFxuICAgICAgICAuLi50aGlzLmdlbkRheUhlYWRlcihkYXksIGluZGV4KSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5EYXlIZWFkZXIgKGRheTogQ2FsZW5kYXJUaW1lc3RhbXAsIGluZGV4OiBudW1iZXIpOiBWTm9kZVtdIHtcbiAgICAgIHJldHVybiBnZXRTbG90KHRoaXMsICdkYXktaGVhZGVyJywgKCkgPT4gKHtcbiAgICAgICAgd2VlazogdGhpcy5kYXlzLCAuLi5kYXksIGluZGV4LFxuICAgICAgfSkpIHx8IFtdXG4gICAgfSxcbiAgICBnZW5IZWFkV2Vla2RheSAoZGF5OiBDYWxlbmRhclRpbWVzdGFtcCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZGF5LnByZXNlbnQgPyB0aGlzLmNvbG9yIDogdW5kZWZpbmVkXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldFRleHRDb2xvcihjb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfaGVhZC13ZWVrZGF5JyxcbiAgICAgIH0pLCB0aGlzLndlZWtkYXlGb3JtYXR0ZXIoZGF5LCB0aGlzLnNob3J0V2Vla2RheXMpKVxuICAgIH0sXG4gICAgZ2VuSGVhZERheUxhYmVsIChkYXk6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X2hlYWQtZGF5LWxhYmVsJyxcbiAgICAgIH0sIGdldFNsb3QodGhpcywgJ2RheS1sYWJlbC1oZWFkZXInLCBkYXkpIHx8IFt0aGlzLmdlbkhlYWREYXlCdXR0b24oZGF5KV0pXG4gICAgfSxcbiAgICBnZW5IZWFkRGF5QnV0dG9uIChkYXk6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgY29uc3QgY29sb3IgPSBkYXkucHJlc2VudCA/IHRoaXMuY29sb3IgOiAndHJhbnNwYXJlbnQnXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZCdG4sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBjb2xvcixcbiAgICAgICAgICBmYWI6IHRydWUsXG4gICAgICAgICAgZGVwcmVzc2VkOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBvbjogdGhpcy5nZXRNb3VzZUV2ZW50SGFuZGxlcnMoe1xuICAgICAgICAgICdjbGljazpkYXRlJzogeyBldmVudDogJ2NsaWNrJywgc3RvcDogdHJ1ZSB9LFxuICAgICAgICAgICdjb250ZXh0bWVudTpkYXRlJzogeyBldmVudDogJ2NvbnRleHRtZW51Jywgc3RvcDogdHJ1ZSwgcHJldmVudDogdHJ1ZSwgcmVzdWx0OiBmYWxzZSB9LFxuICAgICAgICB9LCBuYXRpdmVFdmVudCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHsgbmF0aXZlRXZlbnQsIC4uLmRheSB9XG4gICAgICAgIH0pLFxuICAgICAgfSwgdGhpcy5kYXlGb3JtYXR0ZXIoZGF5LCBmYWxzZSkpXG4gICAgfSxcbiAgICBnZW5Cb2R5ICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2JvZHknLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmdlblNjcm9sbEFyZWEoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5TY3JvbGxBcmVhICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICByZWY6ICdzY3JvbGxBcmVhJyxcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19zY3JvbGwtYXJlYScsXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuUGFuZSgpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlblBhbmUgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHJlZjogJ3BhbmUnLFxuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX3BhbmUnLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGhlaWdodDogY29udmVydFRvVW5pdCh0aGlzLmJvZHlIZWlnaHQpLFxuICAgICAgICB9LFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmdlbkRheUNvbnRhaW5lcigpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkRheUNvbnRhaW5lciAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNhbGVuZGFyLWRhaWx5X19kYXktY29udGFpbmVyJyxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5Cb2R5SW50ZXJ2YWxzKCksXG4gICAgICAgIC4uLnRoaXMuZ2VuRGF5cygpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkRheXMgKCk6IFZOb2RlW10ge1xuICAgICAgcmV0dXJuIHRoaXMuZGF5cy5tYXAodGhpcy5nZW5EYXkpXG4gICAgfSxcbiAgICBnZW5EYXkgKGRheTogQ2FsZW5kYXJUaW1lc3RhbXAsIGluZGV4OiBudW1iZXIpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBrZXk6IGRheS5kYXRlLFxuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2RheScsXG4gICAgICAgIGNsYXNzOiB0aGlzLmdldFJlbGF0aXZlQ2xhc3NlcyhkYXkpLFxuICAgICAgICBvbjogdGhpcy5nZXREZWZhdWx0TW91c2VFdmVudEhhbmRsZXJzKCc6dGltZScsIG5hdGl2ZUV2ZW50ID0+IHtcbiAgICAgICAgICByZXR1cm4geyBuYXRpdmVFdmVudCwgLi4udGhpcy5nZXRTbG90U2NvcGUodGhpcy5nZXRUaW1lc3RhbXBBdEV2ZW50KG5hdGl2ZUV2ZW50LCBkYXkpKSB9XG4gICAgICAgIH0pLFxuICAgICAgfSwgW1xuICAgICAgICAuLi50aGlzLmdlbkRheUludGVydmFscyhpbmRleCksXG4gICAgICAgIC4uLnRoaXMuZ2VuRGF5Qm9keShkYXkpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkRheUJvZHkgKGRheTogQ2FsZW5kYXJUaW1lc3RhbXApOiBWTm9kZVtdIHtcbiAgICAgIHJldHVybiBnZXRTbG90KHRoaXMsICdkYXktYm9keScsICgpID0+IHRoaXMuZ2V0U2xvdFNjb3BlKGRheSkpIHx8IFtdXG4gICAgfSxcbiAgICBnZW5EYXlJbnRlcnZhbHMgKGluZGV4OiBudW1iZXIpOiBWTm9kZVtdIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVydmFsc1tpbmRleF0ubWFwKHRoaXMuZ2VuRGF5SW50ZXJ2YWwpXG4gICAgfSxcbiAgICBnZW5EYXlJbnRlcnZhbCAoaW50ZXJ2YWw6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgY29uc3QgaGVpZ2h0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBjb252ZXJ0VG9Vbml0KHRoaXMuaW50ZXJ2YWxIZWlnaHQpXG4gICAgICBjb25zdCBzdHlsZXIgPSB0aGlzLmludGVydmFsU3R5bGUgfHwgdGhpcy5pbnRlcnZhbFN0eWxlRGVmYXVsdFxuXG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBrZXk6IGludGVydmFsLnRpbWUsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYWxlbmRhci1kYWlseV9fZGF5LWludGVydmFsJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgLi4uc3R5bGVyKGludGVydmFsKSxcbiAgICAgICAgfSxcblxuICAgICAgfVxuXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGdldFNsb3QodGhpcywgJ2ludGVydmFsJywgKCkgPT4gdGhpcy5nZXRTbG90U2NvcGUoaW50ZXJ2YWwpKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgZGF0YSwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBnZW5Cb2R5SW50ZXJ2YWxzICgpOiBWTm9kZSB7XG4gICAgICBjb25zdCB3aWR0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gY29udmVydFRvVW5pdCh0aGlzLmludGVydmFsV2lkdGgpXG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFscy1ib2R5JyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHRoaXMuZ2V0RGVmYXVsdE1vdXNlRXZlbnRIYW5kbGVycygnOmludGVydmFsJywgbmF0aXZlRXZlbnQgPT4ge1xuICAgICAgICAgIHJldHVybiB7IG5hdGl2ZUV2ZW50LCAuLi50aGlzLmdldFRpbWVzdGFtcEF0RXZlbnQobmF0aXZlRXZlbnQsIHRoaXMucGFyc2VkU3RhcnQpIH1cbiAgICAgICAgfSksXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCBkYXRhLCB0aGlzLmdlbkludGVydmFsTGFiZWxzKCkpXG4gICAgfSxcbiAgICBnZW5JbnRlcnZhbExhYmVscyAoKTogVk5vZGVbXSB8IG51bGwge1xuICAgICAgaWYgKCF0aGlzLmludGVydmFscy5sZW5ndGgpIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLmludGVydmFsc1swXS5tYXAodGhpcy5nZW5JbnRlcnZhbExhYmVsKVxuICAgIH0sXG4gICAgZ2VuSW50ZXJ2YWxMYWJlbCAoaW50ZXJ2YWw6IENhbGVuZGFyVGltZXN0YW1wKTogVk5vZGUge1xuICAgICAgY29uc3QgaGVpZ2h0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBjb252ZXJ0VG9Vbml0KHRoaXMuaW50ZXJ2YWxIZWlnaHQpXG4gICAgICBjb25zdCBzaG9ydDogYm9vbGVhbiA9IHRoaXMuc2hvcnRJbnRlcnZhbHNcbiAgICAgIGNvbnN0IHNob3dlciA9IHRoaXMuc2hvd0ludGVydmFsTGFiZWwgfHwgdGhpcy5zaG93SW50ZXJ2YWxMYWJlbERlZmF1bHRcbiAgICAgIGNvbnN0IHNob3cgPSBzaG93ZXIoaW50ZXJ2YWwpXG4gICAgICBjb25zdCBsYWJlbCA9IHNob3cgPyB0aGlzLmludGVydmFsRm9ybWF0dGVyKGludGVydmFsLCBzaG9ydCkgOiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiBpbnRlcnZhbC50aW1lLFxuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFsJyxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2FsZW5kYXItZGFpbHlfX2ludGVydmFsLXRleHQnLFxuICAgICAgICB9LCBsYWJlbCksXG4gICAgICBdKVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKCdkaXYnLCB7XG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgb246IHtcbiAgICAgICAgZHJhZ3N0YXJ0OiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgIG1vZGlmaWVyczogeyBxdWlldDogdHJ1ZSB9LFxuICAgICAgICBuYW1lOiAncmVzaXplJyxcbiAgICAgICAgdmFsdWU6IHRoaXMub25SZXNpemUsXG4gICAgICB9XSxcbiAgICB9LCBbXG4gICAgICAhdGhpcy5oaWRlSGVhZGVyID8gdGhpcy5nZW5IZWFkKCkgOiAnJyxcbiAgICAgIHRoaXMuZ2VuQm9keSgpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
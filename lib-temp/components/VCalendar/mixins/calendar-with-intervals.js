// Mixins
import CalendarBase from './calendar-base';
// Util
import props from '../util/props';
import { parseTime, copyTimestamp, updateMinutes, createDayList, createIntervalList, createNativeLocaleFormatter, MINUTES_IN_DAY, } from '../util/timestamp';
/* @vue/component */
export default CalendarBase.extend({
    name: 'calendar-with-intervals',
    props: props.intervals,
    computed: {
        parsedFirstInterval() {
            return parseInt(this.firstInterval);
        },
        parsedIntervalMinutes() {
            return parseInt(this.intervalMinutes);
        },
        parsedIntervalCount() {
            return parseInt(this.intervalCount);
        },
        parsedIntervalHeight() {
            return parseFloat(this.intervalHeight);
        },
        parsedFirstTime() {
            return parseTime(this.firstTime);
        },
        firstMinute() {
            const time = this.parsedFirstTime;
            return time !== false && time >= 0 && time <= MINUTES_IN_DAY
                ? time
                : this.parsedFirstInterval * this.parsedIntervalMinutes;
        },
        bodyHeight() {
            return this.parsedIntervalCount * this.parsedIntervalHeight;
        },
        days() {
            return createDayList(this.parsedStart, this.parsedEnd, this.times.today, this.weekdaySkips, this.maxDays);
        },
        intervals() {
            const days = this.days;
            const first = this.firstMinute;
            const minutes = this.parsedIntervalMinutes;
            const count = this.parsedIntervalCount;
            const now = this.times.now;
            return days.map(d => createIntervalList(d, first, minutes, count, now));
        },
        intervalFormatter() {
            if (this.intervalFormat) {
                return this.intervalFormat;
            }
            const longOptions = { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' };
            const shortOptions = { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' };
            const shortHourOptions = { timeZone: 'UTC', hour: 'numeric' };
            return createNativeLocaleFormatter(this.currentLocale, (tms, short) => short ? (tms.minute === 0 ? shortHourOptions : shortOptions) : longOptions);
        },
    },
    methods: {
        showIntervalLabelDefault(interval) {
            const first = this.intervals[0][0];
            const isFirst = first.hour === interval.hour && first.minute === interval.minute;
            return !isFirst;
        },
        intervalStyleDefault(_interval) {
            return undefined;
        },
        getTimestampAtEvent(e, day) {
            const timestamp = copyTimestamp(day);
            const bounds = e.currentTarget.getBoundingClientRect();
            const baseMinutes = this.firstMinute;
            const touchEvent = e;
            const mouseEvent = e;
            const touches = touchEvent.changedTouches || touchEvent.touches;
            const clientY = touches && touches[0] ? touches[0].clientY : mouseEvent.clientY;
            const addIntervals = (clientY - bounds.top) / this.parsedIntervalHeight;
            const addMinutes = Math.floor(addIntervals * this.parsedIntervalMinutes);
            const minutes = baseMinutes + addMinutes;
            return updateMinutes(timestamp, minutes, this.times.now);
        },
        getSlotScope(timestamp) {
            const scope = copyTimestamp(timestamp);
            scope.timeToY = this.timeToY;
            scope.timeDelta = this.timeDelta;
            scope.minutesToPixels = this.minutesToPixels;
            scope.week = this.days;
            return scope;
        },
        scrollToTime(time) {
            const y = this.timeToY(time);
            const pane = this.$refs.scrollArea;
            if (y === false || !pane) {
                return false;
            }
            pane.scrollTop = y;
            return true;
        },
        minutesToPixels(minutes) {
            return minutes / this.parsedIntervalMinutes * this.parsedIntervalHeight;
        },
        timeToY(time, clamp = true) {
            let y = this.timeDelta(time);
            if (y !== false) {
                y *= this.bodyHeight;
                if (clamp) {
                    if (y < 0) {
                        y = 0;
                    }
                    if (y > this.bodyHeight) {
                        y = this.bodyHeight;
                    }
                }
            }
            return y;
        },
        timeDelta(time) {
            const minutes = parseTime(time);
            if (minutes === false) {
                return false;
            }
            const min = this.firstMinute;
            const gap = this.parsedIntervalCount * this.parsedIntervalMinutes;
            return (minutes - min) / gap;
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItd2l0aC1pbnRlcnZhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ2FsZW5kYXIvbWl4aW5zL2NhbGVuZGFyLXdpdGgtaW50ZXJ2YWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVM7QUFDVCxPQUFPLFlBQVksTUFBTSxpQkFBaUIsQ0FBQTtBQUUxQyxPQUFPO0FBQ1AsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFBO0FBQ2pDLE9BQU8sRUFDTCxTQUFTLEVBQ1QsYUFBYSxFQUNiLGFBQWEsRUFDYixhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLDJCQUEyQixFQUUzQixjQUFjLEdBQ2YsTUFBTSxtQkFBbUIsQ0FBQTtBQUcxQixvQkFBb0I7QUFDcEIsZUFBZSxZQUFZLENBQUMsTUFBTSxDQUFDO0lBQ2pDLElBQUksRUFBRSx5QkFBeUI7SUFFL0IsS0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTO0lBRXRCLFFBQVEsRUFBRTtRQUNSLG1CQUFtQjtZQUNqQixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDckMsQ0FBQztRQUNELHFCQUFxQjtZQUNuQixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDdkMsQ0FBQztRQUNELG1CQUFtQjtZQUNqQixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDckMsQ0FBQztRQUNELG9CQUFvQjtZQUNsQixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDeEMsQ0FBQztRQUNELGVBQWU7WUFDYixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDbEMsQ0FBQztRQUNELFdBQVc7WUFDVCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFBO1lBRWpDLE9BQU8sSUFBSSxLQUFLLEtBQUssSUFB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RyxHQUFHLENBQUE7UUFDOUIsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBNaXhpbnNcbmltcG9ydCBDYWxlbmRhckJhc2UgZnJvbSAnLi9jYWxlbmRhci1iYXNlJ1xuXG4vLyBVdGlsXG5pbXBvcnQgcHJvcHMgZnJvbSAnLi4vdXRpbC9wcm9wcydcbmltcG9ydCB7XG4gIHBhcnNlVGltZSxcbiAgY29weVRpbWVzdGFtcCxcbiAgdXBkYXRlTWludXRlcyxcbiAgY3JlYXRlRGF5TGlzdCxcbiAgY3JlYXRlSW50ZXJ2YWxMaXN0LFxuICBjcmVhdGVOYXRpdmVMb2NhbGVGb3JtYXR0ZXIsXG4gIFZUaW1lLFxuICBNSU5VVEVTX0lOX0RBWSxcbn0gZnJvbSAnLi4vdXRpbC90aW1lc3RhbXAnXG5pbXBvcnQgeyBDYWxlbmRhclRpbWVzdGFtcCwgQ2FsZW5kYXJGb3JtYXR0ZXIsIENhbGVuZGFyRGF5Qm9keVNsb3RTY29wZSB9IGZyb20gJ3Z1ZXRpZnkvdHlwZXMnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBDYWxlbmRhckJhc2UuZXh0ZW5kKHtcbiAgbmFtZTogJ2NhbGVuZGFyLXdpdGgtaW50ZXJ2YWxzJyxcblxuICBwcm9wczogcHJvcHMuaW50ZXJ2YWxzLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgcGFyc2VkRmlyc3RJbnRlcnZhbCAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLmZpcnN0SW50ZXJ2YWwpXG4gICAgfSxcbiAgICBwYXJzZWRJbnRlcnZhbE1pbnV0ZXMgKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy5pbnRlcnZhbE1pbnV0ZXMpXG4gICAgfSxcbiAgICBwYXJzZWRJbnRlcnZhbENvdW50ICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMuaW50ZXJ2YWxDb3VudClcbiAgICB9LFxuICAgIHBhcnNlZEludGVydmFsSGVpZ2h0ICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5pbnRlcnZhbEhlaWdodClcbiAgICB9LFxuICAgIHBhcnNlZEZpcnN0VGltZSAoKTogbnVtYmVyIHwgZmFsc2Uge1xuICAgICAgcmV0dXJuIHBhcnNlVGltZSh0aGlzLmZpcnN0VGltZSlcbiAgICB9LFxuICAgIGZpcnN0TWludXRlICgpOiBudW1iZXIge1xuICAgICAgY29uc3QgdGltZSA9IHRoaXMucGFyc2VkRmlyc3RUaW1lXG5cbiAgICAgIHJldHVybiB0aW1lICE9PSBmYWxzZSAmJiB0aW1lID49IDAgJiYgdGltZSA8PSBNSU5VVEVTX0lOX0RBWVxuICAgICAgICA/IHRpbWVcbiAgICAgICAgOiB0aGlzLnBhcnNlZEZpcnN0SW50ZXJ2YWwgKiB0aGlzLnBhcnNlZEludGVydmFsTWludXRlc1xuICAgIH0sXG4gICAgYm9keUhlaWdodCAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlZEludGVydmFsQ291bnQgKiB0aGlzLnBhcnNlZEludGVydmFsSGVpZ2h0XG4gICAgfSxcbiAgICBkYXlzICgpOiBDYWxlbmRhclRpbWVzdGFtcFtdIHtcbiAgICAgIHJldHVybiBjcmVhdGVEYXlMaXN0KFxuICAgICAgICB0aGlzLnBhcnNlZFN0YXJ0LFxuICAgICAgICB0aGlzLnBhcnNlZEVuZCxcbiAgICAgICAgdGhpcy50aW1lcy50b2RheSxcbiAgICAgICAgdGhpcy53ZWVrZGF5U2tpcHMsXG4gICAgICAgIHRoaXMubWF4RGF5c1xuICAgICAgKVxuICAgIH0sXG4gICAgaW50ZXJ2YWxzICgpOiBDYWxlbmRhclRpbWVzdGFtcFtdW10ge1xuICAgICAgY29uc3QgZGF5czogQ2FsZW5kYXJUaW1lc3RhbXBbXSA9IHRoaXMuZGF5c1xuICAgICAgY29uc3QgZmlyc3Q6IG51bWJlciA9IHRoaXMuZmlyc3RNaW51dGVcbiAgICAgIGNvbnN0IG1pbnV0ZXM6IG51bWJlciA9IHRoaXMucGFyc2VkSW50ZXJ2YWxNaW51dGVzXG4gICAgICBjb25zdCBjb3VudDogbnVtYmVyID0gdGhpcy5wYXJzZWRJbnRlcnZhbENvdW50XG4gICAgICBjb25zdCBub3c6IENhbGVuZGFyVGltZXN0YW1wID0gdGhpcy50aW1lcy5ub3dcblxuICAgICAgcmV0dXJuIGRheXMubWFwKGQgPT4gY3JlYXRlSW50ZXJ2YWxMaXN0KGQsIGZpcnN0LCBtaW51dGVzLCBjb3VudCwgbm93KSlcbiAgICB9LFxuICAgIGludGVydmFsRm9ybWF0dGVyICgpOiBDYWxlbmRhckZvcm1hdHRlciB7XG4gICAgICBpZiAodGhpcy5pbnRlcnZhbEZvcm1hdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnZhbEZvcm1hdCBhcyBDYWxlbmRhckZvcm1hdHRlclxuICAgICAgfVxuXG4gICAgICBjb25zdCBsb25nT3B0aW9ucyA9IHsgdGltZVpvbmU6ICdVVEMnLCBob3VyOiAnMi1kaWdpdCcsIG1pbnV0ZTogJzItZGlnaXQnIH1cbiAgICAgIGNvbnN0IHNob3J0T3B0aW9ucyA9IHsgdGltZVpvbmU6ICdVVEMnLCBob3VyOiAnbnVtZXJpYycsIG1pbnV0ZTogJzItZGlnaXQnIH1cbiAgICAgIGNvbnN0IHNob3J0SG91ck9wdGlvbnMgPSB7IHRpbWVab25lOiAnVVRDJywgaG91cjogJ251bWVyaWMnIH1cblxuICAgICAgcmV0dXJuIGNyZWF0ZU5hdGl2ZUxvY2FsZUZvcm1hdHRlcihcbiAgICAgICAgdGhpcy5jdXJyZW50TG9jYWxlLFxuICAgICAgICAodG1zLCBzaG9ydCkgPT4gc2hvcnQgPyAodG1zLm1pbnV0ZSA9PT0gMCA/IHNob3J0SG91ck9wdGlvbnMgOiBzaG9ydE9wdGlvbnMpIDogbG9uZ09wdGlvbnNcbiAgICAgIClcbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBzaG93SW50ZXJ2YWxMYWJlbERlZmF1bHQgKGludGVydmFsOiBDYWxlbmRhclRpbWVzdGFtcCk6IGJvb2xlYW4ge1xuICAgICAgY29uc3QgZmlyc3Q6IENhbGVuZGFyVGltZXN0YW1wID0gdGhpcy5pbnRlcnZhbHNbMF1bMF1cbiAgICAgIGNvbnN0IGlzRmlyc3Q6IGJvb2xlYW4gPSBmaXJzdC5ob3VyID09PSBpbnRlcnZhbC5ob3VyICYmIGZpcnN0Lm1pbnV0ZSA9PT0gaW50ZXJ2YWwubWludXRlXG4gICAgICByZXR1cm4gIWlzRmlyc3RcbiAgICB9LFxuICAgIGludGVydmFsU3R5bGVEZWZhdWx0IChfaW50ZXJ2YWw6IENhbGVuZGFyVGltZXN0YW1wKTogb2JqZWN0IHwgdW5kZWZpbmVkIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGdldFRpbWVzdGFtcEF0RXZlbnQgKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50LCBkYXk6IENhbGVuZGFyVGltZXN0YW1wKTogQ2FsZW5kYXJUaW1lc3RhbXAge1xuICAgICAgY29uc3QgdGltZXN0YW1wOiBDYWxlbmRhclRpbWVzdGFtcCA9IGNvcHlUaW1lc3RhbXAoZGF5KVxuICAgICAgY29uc3QgYm91bmRzID0gKGUuY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IGJhc2VNaW51dGVzOiBudW1iZXIgPSB0aGlzLmZpcnN0TWludXRlXG4gICAgICBjb25zdCB0b3VjaEV2ZW50OiBUb3VjaEV2ZW50ID0gZSBhcyBUb3VjaEV2ZW50XG4gICAgICBjb25zdCBtb3VzZUV2ZW50OiBNb3VzZUV2ZW50ID0gZSBhcyBNb3VzZUV2ZW50XG4gICAgICBjb25zdCB0b3VjaGVzOiBUb3VjaExpc3QgPSB0b3VjaEV2ZW50LmNoYW5nZWRUb3VjaGVzIHx8IHRvdWNoRXZlbnQudG91Y2hlc1xuICAgICAgY29uc3QgY2xpZW50WTogbnVtYmVyID0gdG91Y2hlcyAmJiB0b3VjaGVzWzBdID8gdG91Y2hlc1swXS5jbGllbnRZIDogbW91c2VFdmVudC5jbGllbnRZXG4gICAgICBjb25zdCBhZGRJbnRlcnZhbHM6IG51bWJlciA9IChjbGllbnRZIC0gYm91bmRzLnRvcCkgLyB0aGlzLnBhcnNlZEludGVydmFsSGVpZ2h0XG4gICAgICBjb25zdCBhZGRNaW51dGVzOiBudW1iZXIgPSBNYXRoLmZsb29yKGFkZEludGVydmFscyAqIHRoaXMucGFyc2VkSW50ZXJ2YWxNaW51dGVzKVxuICAgICAgY29uc3QgbWludXRlczogbnVtYmVyID0gYmFzZU1pbnV0ZXMgKyBhZGRNaW51dGVzXG5cbiAgICAgIHJldHVybiB1cGRhdGVNaW51dGVzKHRpbWVzdGFtcCwgbWludXRlcywgdGhpcy50aW1lcy5ub3cpXG4gICAgfSxcbiAgICBnZXRTbG90U2NvcGUgKHRpbWVzdGFtcDogQ2FsZW5kYXJUaW1lc3RhbXApOiBDYWxlbmRhckRheUJvZHlTbG90U2NvcGUge1xuICAgICAgY29uc3Qgc2NvcGUgPSBjb3B5VGltZXN0YW1wKHRpbWVzdGFtcCkgYXMgYW55XG4gICAgICBzY29wZS50aW1lVG9ZID0gdGhpcy50aW1lVG9ZXG4gICAgICBzY29wZS50aW1lRGVsdGEgPSB0aGlzLnRpbWVEZWx0YVxuICAgICAgc2NvcGUubWludXRlc1RvUGl4ZWxzID0gdGhpcy5taW51dGVzVG9QaXhlbHNcbiAgICAgIHNjb3BlLndlZWsgPSB0aGlzLmRheXNcbiAgICAgIHJldHVybiBzY29wZVxuICAgIH0sXG4gICAgc2Nyb2xsVG9UaW1lICh0aW1lOiBWVGltZSk6IGJvb2xlYW4ge1xuICAgICAgY29uc3QgeSA9IHRoaXMudGltZVRvWSh0aW1lKVxuICAgICAgY29uc3QgcGFuZSA9IHRoaXMuJHJlZnMuc2Nyb2xsQXJlYSBhcyBIVE1MRWxlbWVudFxuXG4gICAgICBpZiAoeSA9PT0gZmFsc2UgfHwgIXBhbmUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIHBhbmUuc2Nyb2xsVG9wID0geVxuXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG4gICAgbWludXRlc1RvUGl4ZWxzIChtaW51dGVzOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIG1pbnV0ZXMgLyB0aGlzLnBhcnNlZEludGVydmFsTWludXRlcyAqIHRoaXMucGFyc2VkSW50ZXJ2YWxIZWlnaHRcbiAgICB9LFxuICAgIHRpbWVUb1kgKHRpbWU6IFZUaW1lLCBjbGFtcCA9IHRydWUpOiBudW1iZXIgfCBmYWxzZSB7XG4gICAgICBsZXQgeSA9IHRoaXMudGltZURlbHRhKHRpbWUpXG5cbiAgICAgIGlmICh5ICE9PSBmYWxzZSkge1xuICAgICAgICB5ICo9IHRoaXMuYm9keUhlaWdodFxuXG4gICAgICAgIGlmIChjbGFtcCkge1xuICAgICAgICAgIGlmICh5IDwgMCkge1xuICAgICAgICAgICAgeSA9IDBcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHkgPiB0aGlzLmJvZHlIZWlnaHQpIHtcbiAgICAgICAgICAgIHkgPSB0aGlzLmJvZHlIZWlnaHRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHlcbiAgICB9LFxuICAgIHRpbWVEZWx0YSAodGltZTogVlRpbWUpOiBudW1iZXIgfCBmYWxzZSB7XG4gICAgICBjb25zdCBtaW51dGVzID0gcGFyc2VUaW1lKHRpbWUpXG5cbiAgICAgIGlmIChtaW51dGVzID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWluOiBudW1iZXIgPSB0aGlzLmZpcnN0TWludXRlXG4gICAgICBjb25zdCBnYXA6IG51bWJlciA9IHRoaXMucGFyc2VkSW50ZXJ2YWxDb3VudCAqIHRoaXMucGFyc2VkSW50ZXJ2YWxNaW51dGVzXG5cbiAgICAgIHJldHVybiAobWludXRlcyAtIG1pbikgLyBnYXBcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==
// Components
import VDatePickerTitle from './VDatePickerTitle';
import VDatePickerHeader from './VDatePickerHeader';
import VDatePickerDateTable from './VDatePickerDateTable';
import VDatePickerMonthTable from './VDatePickerMonthTable';
import VDatePickerYears from './VDatePickerYears';
// Mixins
import Localable from '../../mixins/localable';
import Picker from '../../mixins/picker';
// Utils
import isDateAllowed from './util/isDateAllowed';
import mixins from '../../util/mixins';
import { wrapInArray } from '../../util/helpers';
import { daysInMonth } from '../VCalendar/util/timestamp';
import { consoleWarn } from '../../util/console';
import { createItemTypeListeners, createNativeLocaleFormatter, pad, sanitizeDateString, } from './util';
export default mixins(Localable, Picker).extend({
    name: 'v-date-picker',
    props: {
        activePicker: String,
        allowedDates: Function,
        // Function formatting the day in date picker table
        dayFormat: Function,
        disabled: Boolean,
        events: {
            type: [Array, Function, Object],
            default: () => null,
        },
        eventColor: {
            type: [Array, Function, Object, String],
            default: () => 'warning',
        },
        firstDayOfWeek: {
            type: [String, Number],
            default: 0,
        },
        // Function formatting the tableDate in the day/month table header
        headerDateFormat: Function,
        localeFirstDayOfYear: {
            type: [String, Number],
            default: 0,
        },
        max: String,
        min: String,
        // Function formatting month in the months table
        monthFormat: Function,
        multiple: Boolean,
        nextIcon: {
            type: String,
            default: '$next',
        },
        nextMonthAriaLabel: {
            type: String,
            default: '$vuetify.datePicker.nextMonthAriaLabel',
        },
        nextYearAriaLabel: {
            type: String,
            default: '$vuetify.datePicker.nextYearAriaLabel',
        },
        pickerDate: String,
        prevIcon: {
            type: String,
            default: '$prev',
        },
        prevMonthAriaLabel: {
            type: String,
            default: '$vuetify.datePicker.prevMonthAriaLabel',
        },
        prevYearAriaLabel: {
            type: String,
            default: '$vuetify.datePicker.prevYearAriaLabel',
        },
        range: Boolean,
        reactive: Boolean,
        readonly: Boolean,
        scrollable: Boolean,
        showCurrent: {
            type: [Boolean, String],
            default: true,
        },
        selectedItemsText: {
            type: String,
            default: '$vuetify.datePicker.itemsSelected',
        },
        showAdjacentMonths: Boolean,
        showWeek: Boolean,
        // Function formatting currently selected date in the picker title
        titleDateFormat: Function,
        type: {
            type: String,
            default: 'date',
            validator: (type) => ['date', 'month'].includes(type),
        },
        value: [Array, String],
        weekdayFormat: Function,
        // Function formatting the year in table header and pickup title
        yearFormat: Function,
        yearIcon: String,
    },
    data() {
        const now = new Date();
        return {
            internalActivePicker: this.type.toUpperCase(),
            inputDay: null,
            inputMonth: null,
            inputYear: null,
            isReversing: false,
            now,
            // tableDate is a string in 'YYYY' / 'YYYY-M' format (leading zero for month is not required)
            tableDate: (() => {
                if (this.pickerDate) {
                    return this.pickerDate;
                }
                const multipleValue = wrapInArray(this.value);
                const date = multipleValue[multipleValue.length - 1] ||
                    (typeof this.showCurrent === 'string' ? this.showCurrent : `${now.getFullYear()}-${now.getMonth() + 1}`);
                return sanitizeDateString(date, this.type === 'date' ? 'month' : 'year');
            })(),
        };
    },
    computed: {
        multipleValue() {
            return wrapInArray(this.value);
        },
        isMultiple() {
            return this.multiple || this.range;
        },
        lastValue() {
            return this.isMultiple ? this.multipleValue[this.multipleValue.length - 1] : this.value;
        },
        selectedMonths() {
            if (!this.value || this.type === 'month') {
                return this.value;
            }
            else if (this.isMultiple) {
                return this.multipleValue.map(val => val.substr(0, 7));
            }
            else {
                return this.value.substr(0, 7);
            }
        },
        current() {
            if (this.showCurrent === true) {
                return sanitizeDateString(`${this.now.getFullYear()}-${this.now.getMonth() + 1}-${this.now.getDate()}`, this.type);
            }
            return this.showCurrent || null;
        },
        inputDate() {
            return this.type === 'date'
                ? `${this.inputYear}-${pad(this.inputMonth + 1)}-${pad(this.inputDay)}`
                : `${this.inputYear}-${pad(this.inputMonth + 1)}`;
        },
        tableMonth() {
            return Number((this.pickerDate || this.tableDate).split('-')[1]) - 1;
        },
        tableYear() {
            return Number((this.pickerDate || this.tableDate).split('-')[0]);
        },
        minMonth() {
            return this.min ? sanitizeDateString(this.min, 'month') : null;
        },
        maxMonth() {
            return this.max ? sanitizeDateString(this.max, 'month') : null;
        },
        minYear() {
            return this.min ? sanitizeDateString(this.min, 'year') : null;
        },
        maxYear() {
            return this.max ? sanitizeDateString(this.max, 'year') : null;
        },
        formatters() {
            return {
                year: this.yearFormat || createNativeLocaleFormatter(this.currentLocale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 }),
                titleDate: this.titleDateFormat ||
                    (this.isMultiple ? this.defaultTitleMultipleDateFormatter : this.defaultTitleDateFormatter),
            };
        },
        defaultTitleMultipleDateFormatter() {
            return dates => {
                if (!dates.length) {
                    return '-';
                }
                if (dates.length === 1) {
                    return this.defaultTitleDateFormatter(dates[0]);
                }
                return this.$vuetify.lang.t(this.selectedItemsText, dates.length);
            };
        },
        defaultTitleDateFormatter() {
            const titleFormats = {
                year: { year: 'numeric', timeZone: 'UTC' },
                month: { month: 'long', timeZone: 'UTC' },
                date: { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' },
            };
            const titleDateFormatter = createNativeLocaleFormatter(this.currentLocale, titleFormats[this.type], {
                start: 0,
                length: { date: 10, month: 7, year: 4 }[this.type],
            });
            const landscapeFormatter = (date) => titleDateFormatter(date)
                .replace(/([^\d\s])([\d])/g, (match, nonDigit, digit) => `${nonDigit} ${digit}`)
                .replace(', ', ',<br>');
            return this.landscape ? landscapeFormatter : titleDateFormatter;
        },
    },
    watch: {
        internalActivePicker: {
            immediate: true,
            handler(val) {
                this.$emit('update:active-picker', val);
            },
        },
        activePicker(val) {
            this.internalActivePicker = val;
        },
        tableDate(val, prev) {
            // Make a ISO 8601 strings from val and prev for comparision, otherwise it will incorrectly
            // compare for example '2000-9' and '2000-10'
            const sanitizeType = this.type === 'month' ? 'year' : 'month';
            this.isReversing = sanitizeDateString(val, sanitizeType) < sanitizeDateString(prev, sanitizeType);
            this.$emit('update:picker-date', val);
        },
        pickerDate(val) {
            if (val) {
                this.tableDate = val;
            }
            else if (this.lastValue && this.type === 'date') {
                this.tableDate = sanitizeDateString(this.lastValue, 'month');
            }
            else if (this.lastValue && this.type === 'month') {
                this.tableDate = sanitizeDateString(this.lastValue, 'year');
            }
        },
        value(newValue, oldValue) {
            this.checkMultipleProp();
            this.setInputDate();
            if ((!this.isMultiple && this.value && !this.pickerDate) ||
                (this.isMultiple && this.multipleValue.length && (!oldValue || !oldValue.length) && !this.pickerDate)) {
                this.tableDate = sanitizeDateString(this.inputDate, this.type === 'month' ? 'year' : 'month');
            }
        },
        type(type) {
            this.internalActivePicker = type.toUpperCase();
            if (this.value && this.value.length) {
                const output = this.multipleValue
                    .map((val) => sanitizeDateString(val, type))
                    .filter(this.isDateAllowed);
                this.$emit('input', this.isMultiple ? output : output[0]);
            }
        },
    },
    created() {
        this.checkMultipleProp();
        if (this.pickerDate !== this.tableDate) {
            this.$emit('update:picker-date', this.tableDate);
        }
        this.setInputDate();
    },
    methods: {
        emitInput(newInput) {
            if (this.range) {
                if (this.multipleValue.length !== 1) {
                    this.$emit('input', [newInput]);
                }
                else {
                    const output = [this.multipleValue[0], newInput];
                    this.$emit('input', output);
                    this.$emit('change', output);
                }
                return;
            }
            const output = this.multiple
                ? (this.multipleValue.indexOf(newInput) === -1
                    ? this.multipleValue.concat([newInput])
                    : this.multipleValue.filter(x => x !== newInput))
                : newInput;
            this.$emit('input', output);
            this.multiple || this.$emit('change', newInput);
        },
        checkMultipleProp() {
            if (this.value == null)
                return;
            const valueType = this.value.constructor.name;
            const expected = this.isMultiple ? 'Array' : 'String';
            if (valueType !== expected) {
                consoleWarn(`Value must be ${this.isMultiple ? 'an' : 'a'} ${expected}, got ${valueType}`, this);
            }
        },
        isDateAllowed(value) {
            return isDateAllowed(value, this.min, this.max, this.allowedDates);
        },
        yearClick(value) {
            this.inputYear = value;
            if (this.type === 'month') {
                this.tableDate = `${value}`;
            }
            else {
                this.tableDate = `${value}-${pad((this.tableMonth || 0) + 1)}`;
            }
            this.internalActivePicker = 'MONTH';
            if (this.reactive && !this.readonly && !this.isMultiple && this.isDateAllowed(this.inputDate)) {
                this.$emit('input', this.inputDate);
            }
        },
        monthClick(value) {
            const [year, month] = value.split('-');
            this.inputYear = parseInt(year, 10);
            this.inputMonth = parseInt(month, 10) - 1;
            if (this.type === 'date') {
                if (this.inputDay) {
                    this.inputDay = Math.min(this.inputDay, daysInMonth(this.inputYear, this.inputMonth + 1));
                }
                this.tableDate = value;
                this.internalActivePicker = 'DATE';
                if (this.reactive && !this.readonly && !this.isMultiple && this.isDateAllowed(this.inputDate)) {
                    this.$emit('input', this.inputDate);
                }
            }
            else {
                this.emitInput(this.inputDate);
            }
        },
        dateClick(value) {
            const [year, month, day] = value.split('-');
            this.inputYear = parseInt(year, 10);
            this.inputMonth = parseInt(month, 10) - 1;
            this.inputDay = parseInt(day, 10);
            this.emitInput(this.inputDate);
        },
        genPickerTitle() {
            return this.$createElement(VDatePickerTitle, {
                props: {
                    date: this.value ? this.formatters.titleDate(this.isMultiple ? this.multipleValue : this.value) : '',
                    disabled: this.disabled,
                    readonly: this.readonly,
                    selectingYear: this.internalActivePicker === 'YEAR',
                    year: this.formatters.year(this.multipleValue.length ? `${this.inputYear}` : this.tableDate),
                    yearIcon: this.yearIcon,
                    value: this.multipleValue[0],
                },
                slot: 'title',
                on: {
                    'update:selecting-year': (value) => this.internalActivePicker = value ? 'YEAR' : this.type.toUpperCase(),
                },
            });
        },
        genTableHeader() {
            return this.$createElement(VDatePickerHeader, {
                props: {
                    nextIcon: this.nextIcon,
                    color: this.color,
                    dark: this.dark,
                    disabled: this.disabled,
                    format: this.headerDateFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.internalActivePicker === 'DATE' ? this.minMonth : this.minYear,
                    max: this.internalActivePicker === 'DATE' ? this.maxMonth : this.maxYear,
                    nextAriaLabel: this.internalActivePicker === 'DATE' ? this.nextMonthAriaLabel : this.nextYearAriaLabel,
                    prevAriaLabel: this.internalActivePicker === 'DATE' ? this.prevMonthAriaLabel : this.prevYearAriaLabel,
                    prevIcon: this.prevIcon,
                    readonly: this.readonly,
                    value: this.internalActivePicker === 'DATE' ? `${pad(this.tableYear, 4)}-${pad(this.tableMonth + 1)}` : `${pad(this.tableYear, 4)}`,
                },
                on: {
                    toggle: () => this.internalActivePicker = (this.internalActivePicker === 'DATE' ? 'MONTH' : 'YEAR'),
                    input: (value) => this.tableDate = value,
                },
            });
        },
        genDateTable() {
            return this.$createElement(VDatePickerDateTable, {
                props: {
                    allowedDates: this.allowedDates,
                    color: this.color,
                    current: this.current,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.events,
                    eventColor: this.eventColor,
                    firstDayOfWeek: this.firstDayOfWeek,
                    format: this.dayFormat,
                    light: this.light,
                    locale: this.locale,
                    localeFirstDayOfYear: this.localeFirstDayOfYear,
                    min: this.min,
                    max: this.max,
                    range: this.range,
                    readonly: this.readonly,
                    scrollable: this.scrollable,
                    showAdjacentMonths: this.showAdjacentMonths,
                    showWeek: this.showWeek,
                    tableDate: `${pad(this.tableYear, 4)}-${pad(this.tableMonth + 1)}`,
                    value: this.value,
                    weekdayFormat: this.weekdayFormat,
                },
                ref: 'table',
                on: {
                    input: this.dateClick,
                    'update:table-date': (value) => this.tableDate = value,
                    ...createItemTypeListeners(this, ':date'),
                },
            });
        },
        genMonthTable() {
            return this.$createElement(VDatePickerMonthTable, {
                props: {
                    allowedDates: this.type === 'month' ? this.allowedDates : null,
                    color: this.color,
                    current: this.current ? sanitizeDateString(this.current, 'month') : null,
                    dark: this.dark,
                    disabled: this.disabled,
                    events: this.type === 'month' ? this.events : null,
                    eventColor: this.type === 'month' ? this.eventColor : null,
                    format: this.monthFormat,
                    light: this.light,
                    locale: this.locale,
                    min: this.minMonth,
                    max: this.maxMonth,
                    range: this.range,
                    readonly: this.readonly && this.type === 'month',
                    scrollable: this.scrollable,
                    value: this.selectedMonths,
                    tableDate: `${pad(this.tableYear, 4)}`,
                },
                ref: 'table',
                on: {
                    input: this.monthClick,
                    'update:table-date': (value) => this.tableDate = value,
                    ...createItemTypeListeners(this, ':month'),
                },
            });
        },
        genYears() {
            return this.$createElement(VDatePickerYears, {
                props: {
                    color: this.color,
                    format: this.yearFormat,
                    locale: this.locale,
                    min: this.minYear,
                    max: this.maxYear,
                    value: this.tableYear,
                },
                on: {
                    input: this.yearClick,
                    ...createItemTypeListeners(this, ':year'),
                },
            });
        },
        genPickerBody() {
            const children = this.internalActivePicker === 'YEAR' ? [
                this.genYears(),
            ] : [
                this.genTableHeader(),
                this.internalActivePicker === 'DATE' ? this.genDateTable() : this.genMonthTable(),
            ];
            return this.$createElement('div', {
                key: this.internalActivePicker,
            }, children);
        },
        setInputDate() {
            if (this.lastValue) {
                const array = this.lastValue.split('-');
                this.inputYear = parseInt(array[0], 10);
                this.inputMonth = parseInt(array[1], 10) - 1;
                if (this.type === 'date') {
                    this.inputDay = parseInt(array[2], 10);
                }
            }
            else {
                this.inputYear = this.inputYear || this.now.getFullYear();
                this.inputMonth = this.inputMonth == null ? this.inputMonth : this.now.getMonth();
                this.inputDay = this.inputDay || this.now.getDate();
            }
        },
    },
    render() {
        return this.genPicker('v-picker--date');
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRhdGVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WRGF0ZVBpY2tlci9WRGF0ZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxhQUFhO0FBQ2IsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQTtBQUNqRCxPQUFPLGlCQUFpQixNQUFNLHFCQUFxQixDQUFBO0FBQ25ELE9BQU8sb0JBQW9CLE1BQU0sd0JBQXdCLENBQUE7QUFDekQsT0FBTyxxQkFBcUIsTUFBTSx5QkFBeUIsQ0FBQTtBQUMzRCxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFBO0FBRWpELFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLE1BQU0sTUFBTSxxQkFBcUIsQ0FBQTtBQUV4QyxRQUFRO0FBQ1IsT0FBTyxhQUFhLE1BQU0sc0JBQXNCLENBQUE7QUFDaEQsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ2hELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUN6RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDaEQsT0FBTyxFQUNMLHVCQUF1QixFQUN2QiwyQkFBMkIsRUFDM0IsR0FBRyxFQUNILGtCQUFrQixHQUNuQixNQUFNLFFBQVEsQ0FBQTtBQXlCZixlQUFlLE1BQU0sQ0FDbkIsU0FBUyxFQUNULE1BQU0sQ0FFUCxDQUFDLE1BQU0sQ0FBQztJQUNQLElBQUksRUFBRSxlQUFlO0lBRXJCLEtBQUssRUFBRTtRQUNMLFlBQVksRUFBRSxNQUFnQztRQUM5QyxZQUFZLEVBQUUsUUFBZ0U7UUFDOUUsbURBQW1EO1FBQ25ELFNBQVMsRUFBRSxRQUFnRTtRQUMzRSxRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVBQUU7WUFDTixJ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QUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtnQkFDekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtnQkFDakYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7YUFDcEQ7UUFDSCxDQUFDO0tBQ0Y7SUFFRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDekMsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvbXBvbmVudHNcbmltcG9ydCBWRGF0ZVBpY2tlclRpdGxlIGZyb20gJy4vVkRhdGVQaWNrZXJUaXRsZSdcbmltcG9ydCBWRGF0ZVBpY2tlckhlYWRlciBmcm9tICcuL1ZEYXRlUGlja2VySGVhZGVyJ1xuaW1wb3J0IFZEYXRlUGlja2VyRGF0ZVRhYmxlIGZyb20gJy4vVkRhdGVQaWNrZXJEYXRlVGFibGUnXG5pbXBvcnQgVkRhdGVQaWNrZXJNb250aFRhYmxlIGZyb20gJy4vVkRhdGVQaWNrZXJNb250aFRhYmxlJ1xuaW1wb3J0IFZEYXRlUGlja2VyWWVhcnMgZnJvbSAnLi9WRGF0ZVBpY2tlclllYXJzJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBMb2NhbGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2xvY2FsYWJsZSdcbmltcG9ydCBQaWNrZXIgZnJvbSAnLi4vLi4vbWl4aW5zL3BpY2tlcidcblxuLy8gVXRpbHNcbmltcG9ydCBpc0RhdGVBbGxvd2VkIGZyb20gJy4vdXRpbC9pc0RhdGVBbGxvd2VkJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IHdyYXBJbkFycmF5IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgZGF5c0luTW9udGggfSBmcm9tICcuLi9WQ2FsZW5kYXIvdXRpbC90aW1lc3RhbXAnXG5pbXBvcnQgeyBjb25zb2xlV2FybiB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcbmltcG9ydCB7XG4gIGNyZWF0ZUl0ZW1UeXBlTGlzdGVuZXJzLFxuICBjcmVhdGVOYXRpdmVMb2NhbGVGb3JtYXR0ZXIsXG4gIHBhZCxcbiAgc2FuaXRpemVEYXRlU3RyaW5nLFxufSBmcm9tICcuL3V0aWwnXG5cbi8vIFR5cGVzXG5pbXBvcnQge1xuICBQcm9wVHlwZSxcbiAgUHJvcFZhbGlkYXRvcixcbn0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7XG4gIERhdGVQaWNrZXJGb3JtYXR0ZXIsXG4gIERhdGVQaWNrZXJNdWx0aXBsZUZvcm1hdHRlcixcbiAgRGF0ZVBpY2tlckFsbG93ZWREYXRlc0Z1bmN0aW9uLFxuICBEYXRlUGlja2VyRXZlbnRDb2xvcnMsXG4gIERhdGVQaWNrZXJFdmVudHMsXG4gIERhdGVQaWNrZXJUeXBlLFxufSBmcm9tICd2dWV0aWZ5L3R5cGVzJ1xuXG50eXBlIERhdGVQaWNrZXJWYWx1ZSA9IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkXG5pbnRlcmZhY2UgRm9ybWF0dGVycyB7XG4gIHllYXI6IERhdGVQaWNrZXJGb3JtYXR0ZXJcbiAgdGl0bGVEYXRlOiBEYXRlUGlja2VyRm9ybWF0dGVyIHwgRGF0ZVBpY2tlck11bHRpcGxlRm9ybWF0dGVyXG59XG5cbnR5cGUgQWN0aXZlUGlja2VyID0gJ0RBVEUnIHwgJ01PTlRIJyB8ICdZRUFSJztcblxuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBMb2NhbGFibGUsXG4gIFBpY2tlcixcbi8qIEB2dWUvY29tcG9uZW50ICovXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWRhdGUtcGlja2VyJyxcblxuICBwcm9wczoge1xuICAgIGFjdGl2ZVBpY2tlcjogU3RyaW5nIGFzIFByb3BUeXBlPEFjdGl2ZVBpY2tlcj4sXG4gICAgYWxsb3dlZERhdGVzOiBGdW5jdGlvbiBhcyBQcm9wVHlwZTxEYXRlUGlja2VyQWxsb3dlZERhdGVzRnVuY3Rpb24gfCB1bmRlZmluZWQ+LFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgdGhlIGRheSBpbiBkYXRlIHBpY2tlciB0YWJsZVxuICAgIGRheUZvcm1hdDogRnVuY3Rpb24gYXMgUHJvcFR5cGU8RGF0ZVBpY2tlckFsbG93ZWREYXRlc0Z1bmN0aW9uIHwgdW5kZWZpbmVkPixcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBldmVudHM6IHtcbiAgICAgIHR5cGU6IFtBcnJheSwgRnVuY3Rpb24sIE9iamVjdF0sXG4gICAgICBkZWZhdWx0OiAoKSA9PiBudWxsLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxEYXRlUGlja2VyRXZlbnRzIHwgbnVsbD4sXG4gICAgZXZlbnRDb2xvcjoge1xuICAgICAgdHlwZTogW0FycmF5LCBGdW5jdGlvbiwgT2JqZWN0LCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogKCkgPT4gJ3dhcm5pbmcnLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxEYXRlUGlja2VyRXZlbnRDb2xvcnM+LFxuICAgIGZpcnN0RGF5T2ZXZWVrOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBOdW1iZXJdLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgdGhlIHRhYmxlRGF0ZSBpbiB0aGUgZGF5L21vbnRoIHRhYmxlIGhlYWRlclxuICAgIGhlYWRlckRhdGVGb3JtYXQ6IEZ1bmN0aW9uIGFzIFByb3BUeXBlPERhdGVQaWNrZXJGb3JtYXR0ZXIgfCB1bmRlZmluZWQ+LFxuICAgIGxvY2FsZUZpcnN0RGF5T2ZZZWFyOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBOdW1iZXJdLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIG1heDogU3RyaW5nLFxuICAgIG1pbjogU3RyaW5nLFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgbW9udGggaW4gdGhlIG1vbnRocyB0YWJsZVxuICAgIG1vbnRoRm9ybWF0OiBGdW5jdGlvbiBhcyBQcm9wVHlwZTxEYXRlUGlja2VyRm9ybWF0dGVyIHwgdW5kZWZpbmVkPixcbiAgICBtdWx0aXBsZTogQm9vbGVhbixcbiAgICBuZXh0SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRuZXh0JyxcbiAgICB9LFxuICAgIG5leHRNb250aEFyaWFMYWJlbDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyR2dWV0aWZ5LmRhdGVQaWNrZXIubmV4dE1vbnRoQXJpYUxhYmVsJyxcbiAgICB9LFxuICAgIG5leHRZZWFyQXJpYUxhYmVsOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkuZGF0ZVBpY2tlci5uZXh0WWVhckFyaWFMYWJlbCcsXG4gICAgfSxcbiAgICBwaWNrZXJEYXRlOiBTdHJpbmcsXG4gICAgcHJldkljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckcHJldicsXG4gICAgfSxcbiAgICBwcmV2TW9udGhBcmlhTGFiZWw6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5kYXRlUGlja2VyLnByZXZNb250aEFyaWFMYWJlbCcsXG4gICAgfSxcbiAgICBwcmV2WWVhckFyaWFMYWJlbDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyR2dWV0aWZ5LmRhdGVQaWNrZXIucHJldlllYXJBcmlhTGFiZWwnLFxuICAgIH0sXG4gICAgcmFuZ2U6IEJvb2xlYW4sXG4gICAgcmVhY3RpdmU6IEJvb2xlYW4sXG4gICAgcmVhZG9ubHk6IEJvb2xlYW4sXG4gICAgc2Nyb2xsYWJsZTogQm9vbGVhbixcbiAgICBzaG93Q3VycmVudDoge1xuICAgICAgdHlwZTogW0Jvb2xlYW4sIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgc2VsZWN0ZWRJdGVtc1RleHQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5kYXRlUGlja2VyLml0ZW1zU2VsZWN0ZWQnLFxuICAgIH0sXG4gICAgc2hvd0FkamFjZW50TW9udGhzOiBCb29sZWFuLFxuICAgIHNob3dXZWVrOiBCb29sZWFuLFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgY3VycmVudGx5IHNlbGVjdGVkIGRhdGUgaW4gdGhlIHBpY2tlciB0aXRsZVxuICAgIHRpdGxlRGF0ZUZvcm1hdDogRnVuY3Rpb24gYXMgUHJvcFR5cGU8RGF0ZVBpY2tlckZvcm1hdHRlciB8IERhdGVQaWNrZXJNdWx0aXBsZUZvcm1hdHRlciB8IHVuZGVmaW5lZD4sXG4gICAgdHlwZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2RhdGUnLFxuICAgICAgdmFsaWRhdG9yOiAodHlwZTogYW55KSA9PiBbJ2RhdGUnLCAnbW9udGgnXS5pbmNsdWRlcyh0eXBlKSwgLy8gVE9ETzogeWVhclxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxEYXRlUGlja2VyVHlwZT4sXG4gICAgdmFsdWU6IFtBcnJheSwgU3RyaW5nXSBhcyBQcm9wVHlwZTxEYXRlUGlja2VyVmFsdWU+LFxuICAgIHdlZWtkYXlGb3JtYXQ6IEZ1bmN0aW9uIGFzIFByb3BUeXBlPERhdGVQaWNrZXJGb3JtYXR0ZXIgfCB1bmRlZmluZWQ+LFxuICAgIC8vIEZ1bmN0aW9uIGZvcm1hdHRpbmcgdGhlIHllYXIgaW4gdGFibGUgaGVhZGVyIGFuZCBwaWNrdXAgdGl0bGVcbiAgICB5ZWFyRm9ybWF0OiBGdW5jdGlvbiBhcyBQcm9wVHlwZTxEYXRlUGlja2VyRm9ybWF0dGVyIHwgdW5kZWZpbmVkPixcbiAgICB5ZWFySWNvbjogU3RyaW5nLFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICByZXR1cm4ge1xuICAgICAgaW50ZXJuYWxBY3RpdmVQaWNrZXI6IHRoaXMudHlwZS50b1VwcGVyQ2FzZSgpLFxuICAgICAgaW5wdXREYXk6IG51bGwgYXMgbnVtYmVyIHwgbnVsbCxcbiAgICAgIGlucHV0TW9udGg6IG51bGwgYXMgbnVtYmVyIHwgbnVsbCxcbiAgICAgIGlucHV0WWVhcjogbnVsbCBhcyBudW1iZXIgfCBudWxsLFxuICAgICAgaXNSZXZlcnNpbmc6IGZhbHNlLFxuICAgICAgbm93LFxuICAgICAgLy8gdGFibGVEYXRlIGlzIGEgc3RyaW5nIGluICdZWVlZJyAvICdZWVlZLU0nIGZvcm1hdCAobGVhZGluZyB6ZXJvIGZvciBtb250aCBpcyBub3QgcmVxdWlyZWQpXG4gICAgICB0YWJsZURhdGU6ICgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBpY2tlckRhdGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5waWNrZXJEYXRlXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtdWx0aXBsZVZhbHVlID0gd3JhcEluQXJyYXkodGhpcy52YWx1ZSlcbiAgICAgICAgY29uc3QgZGF0ZSA9IG11bHRpcGxlVmFsdWVbbXVsdGlwbGVWYWx1ZS5sZW5ndGggLSAxXSB8fFxuICAgICAgICAgICh0eXBlb2YgdGhpcy5zaG93Q3VycmVudCA9PT0gJ3N0cmluZycgPyB0aGlzLnNob3dDdXJyZW50IDogYCR7bm93LmdldEZ1bGxZZWFyKCl9LSR7bm93LmdldE1vbnRoKCkgKyAxfWApXG4gICAgICAgIHJldHVybiBzYW5pdGl6ZURhdGVTdHJpbmcoZGF0ZSBhcyBzdHJpbmcsIHRoaXMudHlwZSA9PT0gJ2RhdGUnID8gJ21vbnRoJyA6ICd5ZWFyJylcbiAgICAgIH0pKCksXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgbXVsdGlwbGVWYWx1ZSAoKTogc3RyaW5nW10ge1xuICAgICAgcmV0dXJuIHdyYXBJbkFycmF5KHRoaXMudmFsdWUpXG4gICAgfSxcbiAgICBpc011bHRpcGxlICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGxlIHx8IHRoaXMucmFuZ2VcbiAgICB9LFxuICAgIGxhc3RWYWx1ZSAoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5pc011bHRpcGxlID8gdGhpcy5tdWx0aXBsZVZhbHVlW3RoaXMubXVsdGlwbGVWYWx1ZS5sZW5ndGggLSAxXSA6ICh0aGlzLnZhbHVlIGFzIHN0cmluZyB8IG51bGwpXG4gICAgfSxcbiAgICBzZWxlY3RlZE1vbnRocyAoKTogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQge1xuICAgICAgaWYgKCF0aGlzLnZhbHVlIHx8IHRoaXMudHlwZSA9PT0gJ21vbnRoJykge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTXVsdGlwbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbGVWYWx1ZS5tYXAodmFsID0+IHZhbC5zdWJzdHIoMCwgNykpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKHRoaXMudmFsdWUgYXMgc3RyaW5nKS5zdWJzdHIoMCwgNylcbiAgICAgIH1cbiAgICB9LFxuICAgIGN1cnJlbnQgKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgaWYgKHRoaXMuc2hvd0N1cnJlbnQgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuIHNhbml0aXplRGF0ZVN0cmluZyhgJHt0aGlzLm5vdy5nZXRGdWxsWWVhcigpfS0ke3RoaXMubm93LmdldE1vbnRoKCkgKyAxfS0ke3RoaXMubm93LmdldERhdGUoKX1gLCB0aGlzLnR5cGUpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnNob3dDdXJyZW50IHx8IG51bGxcbiAgICB9LFxuICAgIGlucHV0RGF0ZSAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09ICdkYXRlJ1xuICAgICAgICA/IGAke3RoaXMuaW5wdXRZZWFyfS0ke3BhZCh0aGlzLmlucHV0TW9udGghICsgMSl9LSR7cGFkKHRoaXMuaW5wdXREYXkhKX1gXG4gICAgICAgIDogYCR7dGhpcy5pbnB1dFllYXJ9LSR7cGFkKHRoaXMuaW5wdXRNb250aCEgKyAxKX1gXG4gICAgfSxcbiAgICB0YWJsZU1vbnRoICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIE51bWJlcigodGhpcy5waWNrZXJEYXRlIHx8IHRoaXMudGFibGVEYXRlKS5zcGxpdCgnLScpWzFdKSAtIDFcbiAgICB9LFxuICAgIHRhYmxlWWVhciAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBOdW1iZXIoKHRoaXMucGlja2VyRGF0ZSB8fCB0aGlzLnRhYmxlRGF0ZSkuc3BsaXQoJy0nKVswXSlcbiAgICB9LFxuICAgIG1pbk1vbnRoICgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLm1pbiA/IHNhbml0aXplRGF0ZVN0cmluZyh0aGlzLm1pbiwgJ21vbnRoJykgOiBudWxsXG4gICAgfSxcbiAgICBtYXhNb250aCAoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5tYXggPyBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5tYXgsICdtb250aCcpIDogbnVsbFxuICAgIH0sXG4gICAgbWluWWVhciAoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICByZXR1cm4gdGhpcy5taW4gPyBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5taW4sICd5ZWFyJykgOiBudWxsXG4gICAgfSxcbiAgICBtYXhZZWFyICgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLm1heCA/IHNhbml0aXplRGF0ZVN0cmluZyh0aGlzLm1heCwgJ3llYXInKSA6IG51bGxcbiAgICB9LFxuICAgIGZvcm1hdHRlcnMgKCk6IEZvcm1hdHRlcnMge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeWVhcjogdGhpcy55ZWFyRm9ybWF0IHx8IGNyZWF0ZU5hdGl2ZUxvY2FsZUZvcm1hdHRlcih0aGlzLmN1cnJlbnRMb2NhbGUsIHsgeWVhcjogJ251bWVyaWMnLCB0aW1lWm9uZTogJ1VUQycgfSwgeyBsZW5ndGg6IDQgfSksXG4gICAgICAgIHRpdGxlRGF0ZTogdGhpcy50aXRsZURhdGVGb3JtYXQgfHxcbiAgICAgICAgICAodGhpcy5pc011bHRpcGxlID8gdGhpcy5kZWZhdWx0VGl0bGVNdWx0aXBsZURhdGVGb3JtYXR0ZXIgOiB0aGlzLmRlZmF1bHRUaXRsZURhdGVGb3JtYXR0ZXIpLFxuICAgICAgfVxuICAgIH0sXG4gICAgZGVmYXVsdFRpdGxlTXVsdGlwbGVEYXRlRm9ybWF0dGVyICgpOiBEYXRlUGlja2VyTXVsdGlwbGVGb3JtYXR0ZXIge1xuICAgICAgcmV0dXJuIGRhdGVzID0+IHtcbiAgICAgICAgaWYgKCFkYXRlcy5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gJy0nXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFRpdGxlRGF0ZUZvcm1hdHRlcihkYXRlc1swXSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLiR2dWV0aWZ5LmxhbmcudCh0aGlzLnNlbGVjdGVkSXRlbXNUZXh0LCBkYXRlcy5sZW5ndGgpXG4gICAgICB9XG4gICAgfSxcbiAgICBkZWZhdWx0VGl0bGVEYXRlRm9ybWF0dGVyICgpOiBEYXRlUGlja2VyRm9ybWF0dGVyIHtcbiAgICAgIGNvbnN0IHRpdGxlRm9ybWF0cyA9IHtcbiAgICAgICAgeWVhcjogeyB5ZWFyOiAnbnVtZXJpYycsIHRpbWVab25lOiAnVVRDJyB9LFxuICAgICAgICBtb250aDogeyBtb250aDogJ2xvbmcnLCB0aW1lWm9uZTogJ1VUQycgfSxcbiAgICAgICAgZGF0ZTogeyB3ZWVrZGF5OiAnc2hvcnQnLCBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycsIHRpbWVab25lOiAnVVRDJyB9LFxuICAgICAgfVxuXG4gICAgICBjb25zdCB0aXRsZURhdGVGb3JtYXR0ZXIgPSBjcmVhdGVOYXRpdmVMb2NhbGVGb3JtYXR0ZXIodGhpcy5jdXJyZW50TG9jYWxlLCB0aXRsZUZvcm1hdHNbdGhpcy50eXBlXSwge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgbGVuZ3RoOiB7IGRhdGU6IDEwLCBtb250aDogNywgeWVhcjogNCB9W3RoaXMudHlwZV0sXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsYW5kc2NhcGVGb3JtYXR0ZXIgPSAoZGF0ZTogc3RyaW5nKSA9PiB0aXRsZURhdGVGb3JtYXR0ZXIoZGF0ZSlcbiAgICAgICAgLnJlcGxhY2UoLyhbXlxcZFxcc10pKFtcXGRdKS9nLCAobWF0Y2gsIG5vbkRpZ2l0LCBkaWdpdCkgPT4gYCR7bm9uRGlnaXR9ICR7ZGlnaXR9YClcbiAgICAgICAgLnJlcGxhY2UoJywgJywgJyw8YnI+JylcblxuICAgICAgcmV0dXJuIHRoaXMubGFuZHNjYXBlID8gbGFuZHNjYXBlRm9ybWF0dGVyIDogdGl0bGVEYXRlRm9ybWF0dGVyXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIGludGVybmFsQWN0aXZlUGlja2VyOiB7XG4gICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICBoYW5kbGVyICh2YWw6IEFjdGl2ZVBpY2tlcikge1xuICAgICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6YWN0aXZlLXBpY2tlcicsIHZhbClcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhY3RpdmVQaWNrZXIgKHZhbDogQWN0aXZlUGlja2VyKSB7XG4gICAgICB0aGlzLmludGVybmFsQWN0aXZlUGlja2VyID0gdmFsXG4gICAgfSxcbiAgICB0YWJsZURhdGUgKHZhbDogc3RyaW5nLCBwcmV2OiBzdHJpbmcpIHtcbiAgICAgIC8vIE1ha2UgYSBJU08gODYwMSBzdHJpbmdzIGZyb20gdmFsIGFuZCBwcmV2IGZvciBjb21wYXJpc2lvbiwgb3RoZXJ3aXNlIGl0IHdpbGwgaW5jb3JyZWN0bHlcbiAgICAgIC8vIGNvbXBhcmUgZm9yIGV4YW1wbGUgJzIwMDAtOScgYW5kICcyMDAwLTEwJ1xuICAgICAgY29uc3Qgc2FuaXRpemVUeXBlID0gdGhpcy50eXBlID09PSAnbW9udGgnID8gJ3llYXInIDogJ21vbnRoJ1xuICAgICAgdGhpcy5pc1JldmVyc2luZyA9IHNhbml0aXplRGF0ZVN0cmluZyh2YWwsIHNhbml0aXplVHlwZSkgPCBzYW5pdGl6ZURhdGVTdHJpbmcocHJldiwgc2FuaXRpemVUeXBlKVxuICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOnBpY2tlci1kYXRlJywgdmFsKVxuICAgIH0sXG4gICAgcGlja2VyRGF0ZSAodmFsOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIHRoaXMudGFibGVEYXRlID0gdmFsXG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGFzdFZhbHVlICYmIHRoaXMudHlwZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgIHRoaXMudGFibGVEYXRlID0gc2FuaXRpemVEYXRlU3RyaW5nKHRoaXMubGFzdFZhbHVlLCAnbW9udGgnKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmxhc3RWYWx1ZSAmJiB0aGlzLnR5cGUgPT09ICdtb250aCcpIHtcbiAgICAgICAgdGhpcy50YWJsZURhdGUgPSBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5sYXN0VmFsdWUsICd5ZWFyJylcbiAgICAgIH1cbiAgICB9LFxuICAgIHZhbHVlIChuZXdWYWx1ZTogRGF0ZVBpY2tlclZhbHVlLCBvbGRWYWx1ZTogRGF0ZVBpY2tlclZhbHVlKSB7XG4gICAgICB0aGlzLmNoZWNrTXVsdGlwbGVQcm9wKClcbiAgICAgIHRoaXMuc2V0SW5wdXREYXRlKClcblxuICAgICAgaWYgKFxuICAgICAgICAoIXRoaXMuaXNNdWx0aXBsZSAmJiB0aGlzLnZhbHVlICYmICF0aGlzLnBpY2tlckRhdGUpIHx8XG4gICAgICAgICh0aGlzLmlzTXVsdGlwbGUgJiYgdGhpcy5tdWx0aXBsZVZhbHVlLmxlbmd0aCAmJiAoIW9sZFZhbHVlIHx8ICFvbGRWYWx1ZS5sZW5ndGgpICYmICF0aGlzLnBpY2tlckRhdGUpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy50YWJsZURhdGUgPSBzYW5pdGl6ZURhdGVTdHJpbmcodGhpcy5pbnB1dERhdGUsIHRoaXMudHlwZSA9PT0gJ21vbnRoJyA/ICd5ZWFyJyA6ICdtb250aCcpXG4gICAgICB9XG4gICAgfSxcbiAgICB0eXBlICh0eXBlOiBEYXRlUGlja2VyVHlwZSkge1xuICAgICAgdGhpcy5pbnRlcm5hbEFjdGl2ZVBpY2tlciA9IHR5cGUudG9VcHBlckNhc2UoKVxuXG4gICAgICBpZiAodGhpcy52YWx1ZSAmJiB0aGlzLnZhbHVlLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBvdXRwdXQgPSB0aGlzLm11bHRpcGxlVmFsdWVcbiAgICAgICAgICAubWFwKCh2YWw6IHN0cmluZykgPT4gc2FuaXRpemVEYXRlU3RyaW5nKHZhbCwgdHlwZSkpXG4gICAgICAgICAgLmZpbHRlcih0aGlzLmlzRGF0ZUFsbG93ZWQpXG4gICAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgdGhpcy5pc011bHRpcGxlID8gb3V0cHV0IDogb3V0cHV0WzBdKVxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgY3JlYXRlZCAoKSB7XG4gICAgdGhpcy5jaGVja011bHRpcGxlUHJvcCgpXG5cbiAgICBpZiAodGhpcy5waWNrZXJEYXRlICE9PSB0aGlzLnRhYmxlRGF0ZSkge1xuICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOnBpY2tlci1kYXRlJywgdGhpcy50YWJsZURhdGUpXG4gICAgfVxuICAgIHRoaXMuc2V0SW5wdXREYXRlKClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZW1pdElucHV0IChuZXdJbnB1dDogc3RyaW5nKSB7XG4gICAgICBpZiAodGhpcy5yYW5nZSkge1xuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZVZhbHVlLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgW25ld0lucHV0XSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBvdXRwdXQgPSBbdGhpcy5tdWx0aXBsZVZhbHVlWzBdLCBuZXdJbnB1dF1cbiAgICAgICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIG91dHB1dClcbiAgICAgICAgICB0aGlzLiRlbWl0KCdjaGFuZ2UnLCBvdXRwdXQpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG91dHB1dCA9IHRoaXMubXVsdGlwbGVcbiAgICAgICAgPyAoXG4gICAgICAgICAgdGhpcy5tdWx0aXBsZVZhbHVlLmluZGV4T2YobmV3SW5wdXQpID09PSAtMVxuICAgICAgICAgICAgPyB0aGlzLm11bHRpcGxlVmFsdWUuY29uY2F0KFtuZXdJbnB1dF0pXG4gICAgICAgICAgICA6IHRoaXMubXVsdGlwbGVWYWx1ZS5maWx0ZXIoeCA9PiB4ICE9PSBuZXdJbnB1dClcbiAgICAgICAgKVxuICAgICAgICA6IG5ld0lucHV0XG5cbiAgICAgIHRoaXMuJGVtaXQoJ2lucHV0Jywgb3V0cHV0KVxuICAgICAgdGhpcy5tdWx0aXBsZSB8fCB0aGlzLiRlbWl0KCdjaGFuZ2UnLCBuZXdJbnB1dClcbiAgICB9LFxuICAgIGNoZWNrTXVsdGlwbGVQcm9wICgpIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlID09IG51bGwpIHJldHVyblxuICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy52YWx1ZS5jb25zdHJ1Y3Rvci5uYW1lXG4gICAgICBjb25zdCBleHBlY3RlZCA9IHRoaXMuaXNNdWx0aXBsZSA/ICdBcnJheScgOiAnU3RyaW5nJ1xuICAgICAgaWYgKHZhbHVlVHlwZSAhPT0gZXhwZWN0ZWQpIHtcbiAgICAgICAgY29uc29sZVdhcm4oYFZhbHVlIG11c3QgYmUgJHt0aGlzLmlzTXVsdGlwbGUgPyAnYW4nIDogJ2EnfSAke2V4cGVjdGVkfSwgZ290ICR7dmFsdWVUeXBlfWAsIHRoaXMpXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0RhdGVBbGxvd2VkICh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gaXNEYXRlQWxsb3dlZCh2YWx1ZSwgdGhpcy5taW4sIHRoaXMubWF4LCB0aGlzLmFsbG93ZWREYXRlcylcbiAgICB9LFxuICAgIHllYXJDbGljayAodmFsdWU6IG51bWJlcikge1xuICAgICAgdGhpcy5pbnB1dFllYXIgPSB2YWx1ZVxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ21vbnRoJykge1xuICAgICAgICB0aGlzLnRhYmxlRGF0ZSA9IGAke3ZhbHVlfWBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGFibGVEYXRlID0gYCR7dmFsdWV9LSR7cGFkKCh0aGlzLnRhYmxlTW9udGggfHwgMCkgKyAxKX1gXG4gICAgICB9XG4gICAgICB0aGlzLmludGVybmFsQWN0aXZlUGlja2VyID0gJ01PTlRIJ1xuICAgICAgaWYgKHRoaXMucmVhY3RpdmUgJiYgIXRoaXMucmVhZG9ubHkgJiYgIXRoaXMuaXNNdWx0aXBsZSAmJiB0aGlzLmlzRGF0ZUFsbG93ZWQodGhpcy5pbnB1dERhdGUpKSB7XG4gICAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgdGhpcy5pbnB1dERhdGUpXG4gICAgICB9XG4gICAgfSxcbiAgICBtb250aENsaWNrICh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICBjb25zdCBbeWVhciwgbW9udGhdID0gdmFsdWUuc3BsaXQoJy0nKVxuXG4gICAgICB0aGlzLmlucHV0WWVhciA9IHBhcnNlSW50KHllYXIsIDEwKVxuICAgICAgdGhpcy5pbnB1dE1vbnRoID0gcGFyc2VJbnQobW9udGgsIDEwKSAtIDFcblxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgIGlmICh0aGlzLmlucHV0RGF5KSB7XG4gICAgICAgICAgdGhpcy5pbnB1dERheSA9IE1hdGgubWluKHRoaXMuaW5wdXREYXksIGRheXNJbk1vbnRoKHRoaXMuaW5wdXRZZWFyLCB0aGlzLmlucHV0TW9udGggKyAxKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGFibGVEYXRlID0gdmFsdWVcbiAgICAgICAgdGhpcy5pbnRlcm5hbEFjdGl2ZVBpY2tlciA9ICdEQVRFJ1xuICAgICAgICBpZiAodGhpcy5yZWFjdGl2ZSAmJiAhdGhpcy5yZWFkb25seSAmJiAhdGhpcy5pc011bHRpcGxlICYmIHRoaXMuaXNEYXRlQWxsb3dlZCh0aGlzLmlucHV0RGF0ZSkpIHtcbiAgICAgICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIHRoaXMuaW5wdXREYXRlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVtaXRJbnB1dCh0aGlzLmlucHV0RGF0ZSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGRhdGVDbGljayAodmFsdWU6IHN0cmluZykge1xuICAgICAgY29uc3QgW3llYXIsIG1vbnRoLCBkYXldID0gdmFsdWUuc3BsaXQoJy0nKVxuXG4gICAgICB0aGlzLmlucHV0WWVhciA9IHBhcnNlSW50KHllYXIsIDEwKVxuICAgICAgdGhpcy5pbnB1dE1vbnRoID0gcGFyc2VJbnQobW9udGgsIDEwKSAtIDFcbiAgICAgIHRoaXMuaW5wdXREYXkgPSBwYXJzZUludChkYXksIDEwKVxuXG4gICAgICB0aGlzLmVtaXRJbnB1dCh0aGlzLmlucHV0RGF0ZSlcbiAgICB9LFxuICAgIGdlblBpY2tlclRpdGxlICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRGF0ZVBpY2tlclRpdGxlLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgZGF0ZTogdGhpcy52YWx1ZSA/ICh0aGlzLmZvcm1hdHRlcnMudGl0bGVEYXRlIGFzICh2YWx1ZTogYW55KSA9PiBzdHJpbmcpKHRoaXMuaXNNdWx0aXBsZSA/IHRoaXMubXVsdGlwbGVWYWx1ZSA6IHRoaXMudmFsdWUpIDogJycsXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgcmVhZG9ubHk6IHRoaXMucmVhZG9ubHksXG4gICAgICAgICAgc2VsZWN0aW5nWWVhcjogdGhpcy5pbnRlcm5hbEFjdGl2ZVBpY2tlciA9PT0gJ1lFQVInLFxuICAgICAgICAgIHllYXI6IHRoaXMuZm9ybWF0dGVycy55ZWFyKHRoaXMubXVsdGlwbGVWYWx1ZS5sZW5ndGggPyBgJHt0aGlzLmlucHV0WWVhcn1gIDogdGhpcy50YWJsZURhdGUpLFxuICAgICAgICAgIHllYXJJY29uOiB0aGlzLnllYXJJY29uLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLm11bHRpcGxlVmFsdWVbMF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNsb3Q6ICd0aXRsZScsXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgJ3VwZGF0ZTpzZWxlY3RpbmcteWVhcic6ICh2YWx1ZTogYm9vbGVhbikgPT4gdGhpcy5pbnRlcm5hbEFjdGl2ZVBpY2tlciA9IHZhbHVlID8gJ1lFQVInIDogdGhpcy50eXBlLnRvVXBwZXJDYXNlKCksXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuVGFibGVIZWFkZXIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZEYXRlUGlja2VySGVhZGVyLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgbmV4dEljb246IHRoaXMubmV4dEljb24sXG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXG4gICAgICAgICAgZGFyazogdGhpcy5kYXJrLFxuICAgICAgICAgIGRpc2FibGVkOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAgIGZvcm1hdDogdGhpcy5oZWFkZXJEYXRlRm9ybWF0LFxuICAgICAgICAgIGxpZ2h0OiB0aGlzLmxpZ2h0LFxuICAgICAgICAgIGxvY2FsZTogdGhpcy5sb2NhbGUsXG4gICAgICAgICAgbWluOiB0aGlzLmludGVybmFsQWN0aXZlUGlja2VyID09PSAnREFURScgPyB0aGlzLm1pbk1vbnRoIDogdGhpcy5taW5ZZWFyLFxuICAgICAgICAgIG1heDogdGhpcy5pbnRlcm5hbEFjdGl2ZVBpY2tlciA9PT0gJ0RBVEUnID8gdGhpcy5tYXhNb250aCA6IHRoaXMubWF4WWVhcixcbiAgICAgICAgICBuZXh0QXJpYUxhYmVsOiB0aGlzLmludGVybmFsQWN0aXZlUGlja2VyID09PSAnREFURScgPyB0aGlzLm5leHRNb250aEFyaWFMYWJlbCA6IHRoaXMubmV4dFllYXJBcmlhTGFiZWwsXG4gICAgICAgICAgcHJldkFyaWFMYWJlbDogdGhpcy5pbnRlcm5hbEFjdGl2ZVBpY2tlciA9PT0gJ0RBVEUnID8gdGhpcy5wcmV2TW9udGhBcmlhTGFiZWwgOiB0aGlzLnByZXZZZWFyQXJpYUxhYmVsLFxuICAgICAgICAgIHByZXZJY29uOiB0aGlzLnByZXZJY29uLFxuICAgICAgICAgIHJlYWRvbmx5OiB0aGlzLnJlYWRvbmx5LFxuICAgICAgICAgIHZhbHVlOiB0aGlzLmludGVybmFsQWN0aXZlUGlja2VyID09PSAnREFURScgPyBgJHtwYWQodGhpcy50YWJsZVllYXIsIDQpfS0ke3BhZCh0aGlzLnRhYmxlTW9udGggKyAxKX1gIDogYCR7cGFkKHRoaXMudGFibGVZZWFyLCA0KX1gLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIHRvZ2dsZTogKCkgPT4gdGhpcy5pbnRlcm5hbEFjdGl2ZVBpY2tlciA9ICh0aGlzLmludGVybmFsQWN0aXZlUGlja2VyID09PSAnREFURScgPyAnTU9OVEgnIDogJ1lFQVInKSxcbiAgICAgICAgICBpbnB1dDogKHZhbHVlOiBzdHJpbmcpID0+IHRoaXMudGFibGVEYXRlID0gdmFsdWUsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuRGF0ZVRhYmxlICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRGF0ZVBpY2tlckRhdGVUYWJsZSwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGFsbG93ZWREYXRlczogdGhpcy5hbGxvd2VkRGF0ZXMsXG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXG4gICAgICAgICAgY3VycmVudDogdGhpcy5jdXJyZW50LFxuICAgICAgICAgIGRhcms6IHRoaXMuZGFyayxcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgICBldmVudHM6IHRoaXMuZXZlbnRzLFxuICAgICAgICAgIGV2ZW50Q29sb3I6IHRoaXMuZXZlbnRDb2xvcixcbiAgICAgICAgICBmaXJzdERheU9mV2VlazogdGhpcy5maXJzdERheU9mV2VlayxcbiAgICAgICAgICBmb3JtYXQ6IHRoaXMuZGF5Rm9ybWF0LFxuICAgICAgICAgIGxpZ2h0OiB0aGlzLmxpZ2h0LFxuICAgICAgICAgIGxvY2FsZTogdGhpcy5sb2NhbGUsXG4gICAgICAgICAgbG9jYWxlRmlyc3REYXlPZlllYXI6IHRoaXMubG9jYWxlRmlyc3REYXlPZlllYXIsXG4gICAgICAgICAgbWluOiB0aGlzLm1pbixcbiAgICAgICAgICBtYXg6IHRoaXMubWF4LFxuICAgICAgICAgIHJhbmdlOiB0aGlzLnJhbmdlLFxuICAgICAgICAgIHJlYWRvbmx5OiB0aGlzLnJlYWRvbmx5LFxuICAgICAgICAgIHNjcm9sbGFibGU6IHRoaXMuc2Nyb2xsYWJsZSxcbiAgICAgICAgICBzaG93QWRqYWNlbnRNb250aHM6IHRoaXMuc2hvd0FkamFjZW50TW9udGhzLFxuICAgICAgICAgIHNob3dXZWVrOiB0aGlzLnNob3dXZWVrLFxuICAgICAgICAgIHRhYmxlRGF0ZTogYCR7cGFkKHRoaXMudGFibGVZZWFyLCA0KX0tJHtwYWQodGhpcy50YWJsZU1vbnRoICsgMSl9YCxcbiAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZSxcbiAgICAgICAgICB3ZWVrZGF5Rm9ybWF0OiB0aGlzLndlZWtkYXlGb3JtYXQsXG4gICAgICAgIH0sXG4gICAgICAgIHJlZjogJ3RhYmxlJyxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBpbnB1dDogdGhpcy5kYXRlQ2xpY2ssXG4gICAgICAgICAgJ3VwZGF0ZTp0YWJsZS1kYXRlJzogKHZhbHVlOiBzdHJpbmcpID0+IHRoaXMudGFibGVEYXRlID0gdmFsdWUsXG4gICAgICAgICAgLi4uY3JlYXRlSXRlbVR5cGVMaXN0ZW5lcnModGhpcywgJzpkYXRlJyksXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuTW9udGhUYWJsZSAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkRhdGVQaWNrZXJNb250aFRhYmxlLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgYWxsb3dlZERhdGVzOiB0aGlzLnR5cGUgPT09ICdtb250aCcgPyB0aGlzLmFsbG93ZWREYXRlcyA6IG51bGwsXG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXG4gICAgICAgICAgY3VycmVudDogdGhpcy5jdXJyZW50ID8gc2FuaXRpemVEYXRlU3RyaW5nKHRoaXMuY3VycmVudCwgJ21vbnRoJykgOiBudWxsLFxuICAgICAgICAgIGRhcms6IHRoaXMuZGFyayxcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgICBldmVudHM6IHRoaXMudHlwZSA9PT0gJ21vbnRoJyA/IHRoaXMuZXZlbnRzIDogbnVsbCxcbiAgICAgICAgICBldmVudENvbG9yOiB0aGlzLnR5cGUgPT09ICdtb250aCcgPyB0aGlzLmV2ZW50Q29sb3IgOiBudWxsLFxuICAgICAgICAgIGZvcm1hdDogdGhpcy5tb250aEZvcm1hdCxcbiAgICAgICAgICBsaWdodDogdGhpcy5saWdodCxcbiAgICAgICAgICBsb2NhbGU6IHRoaXMubG9jYWxlLFxuICAgICAgICAgIG1pbjogdGhpcy5taW5Nb250aCxcbiAgICAgICAgICBtYXg6IHRoaXMubWF4TW9udGgsXG4gICAgICAgICAgcmFuZ2U6IHRoaXMucmFuZ2UsXG4gICAgICAgICAgcmVhZG9ubHk6IHRoaXMucmVhZG9ubHkgJiYgdGhpcy50eXBlID09PSAnbW9udGgnLFxuICAgICAgICAgIHNjcm9sbGFibGU6IHRoaXMuc2Nyb2xsYWJsZSxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5zZWxlY3RlZE1vbnRocyxcbiAgICAgICAgICB0YWJsZURhdGU6IGAke3BhZCh0aGlzLnRhYmxlWWVhciwgNCl9YCxcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAndGFibGUnLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGlucHV0OiB0aGlzLm1vbnRoQ2xpY2ssXG4gICAgICAgICAgJ3VwZGF0ZTp0YWJsZS1kYXRlJzogKHZhbHVlOiBzdHJpbmcpID0+IHRoaXMudGFibGVEYXRlID0gdmFsdWUsXG4gICAgICAgICAgLi4uY3JlYXRlSXRlbVR5cGVMaXN0ZW5lcnModGhpcywgJzptb250aCcpLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlblllYXJzICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRGF0ZVBpY2tlclllYXJzLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXG4gICAgICAgICAgZm9ybWF0OiB0aGlzLnllYXJGb3JtYXQsXG4gICAgICAgICAgbG9jYWxlOiB0aGlzLmxvY2FsZSxcbiAgICAgICAgICBtaW46IHRoaXMubWluWWVhcixcbiAgICAgICAgICBtYXg6IHRoaXMubWF4WWVhcixcbiAgICAgICAgICB2YWx1ZTogdGhpcy50YWJsZVllYXIsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgaW5wdXQ6IHRoaXMueWVhckNsaWNrLFxuICAgICAgICAgIC4uLmNyZWF0ZUl0ZW1UeXBlTGlzdGVuZXJzKHRoaXMsICc6eWVhcicpLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlblBpY2tlckJvZHkgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5pbnRlcm5hbEFjdGl2ZVBpY2tlciA9PT0gJ1lFQVInID8gW1xuICAgICAgICB0aGlzLmdlblllYXJzKCksXG4gICAgICBdIDogW1xuICAgICAgICB0aGlzLmdlblRhYmxlSGVhZGVyKCksXG4gICAgICAgIHRoaXMuaW50ZXJuYWxBY3RpdmVQaWNrZXIgPT09ICdEQVRFJyA/IHRoaXMuZ2VuRGF0ZVRhYmxlKCkgOiB0aGlzLmdlbk1vbnRoVGFibGUoKSxcbiAgICAgIF1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiB0aGlzLmludGVybmFsQWN0aXZlUGlja2VyLFxuICAgICAgfSwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBzZXRJbnB1dERhdGUgKCkge1xuICAgICAgaWYgKHRoaXMubGFzdFZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGFycmF5ID0gdGhpcy5sYXN0VmFsdWUuc3BsaXQoJy0nKVxuICAgICAgICB0aGlzLmlucHV0WWVhciA9IHBhcnNlSW50KGFycmF5WzBdLCAxMClcbiAgICAgICAgdGhpcy5pbnB1dE1vbnRoID0gcGFyc2VJbnQoYXJyYXlbMV0sIDEwKSAtIDFcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RhdGUnKSB7XG4gICAgICAgICAgdGhpcy5pbnB1dERheSA9IHBhcnNlSW50KGFycmF5WzJdLCAxMClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pbnB1dFllYXIgPSB0aGlzLmlucHV0WWVhciB8fCB0aGlzLm5vdy5nZXRGdWxsWWVhcigpXG4gICAgICAgIHRoaXMuaW5wdXRNb250aCA9IHRoaXMuaW5wdXRNb250aCA9PSBudWxsID8gdGhpcy5pbnB1dE1vbnRoIDogdGhpcy5ub3cuZ2V0TW9udGgoKVxuICAgICAgICB0aGlzLmlucHV0RGF5ID0gdGhpcy5pbnB1dERheSB8fCB0aGlzLm5vdy5nZXREYXRlKClcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoKTogVk5vZGUge1xuICAgIHJldHVybiB0aGlzLmdlblBpY2tlcigndi1waWNrZXItLWRhdGUnKVxuICB9LFxufSlcbiJdfQ==
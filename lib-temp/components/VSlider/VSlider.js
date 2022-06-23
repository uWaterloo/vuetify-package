import './VSlider.sass';
// Components
import VInput from '../VInput';
import { VScaleTransition } from '../transitions';
// Mixins
import mixins from '../../util/mixins';
import Loadable from '../../mixins/loadable';
// Directives
import ClickOutside from '../../directives/click-outside';
// Helpers
import { addOnceEventListener, deepEqual, keyCodes, createRange, convertToUnit, passiveSupported } from '../../util/helpers';
import { consoleWarn } from '../../util/console';
export default mixins(VInput, Loadable
/* @vue/component */
).extend({
    name: 'v-slider',
    directives: {
        ClickOutside,
    },
    mixins: [Loadable],
    props: {
        disabled: Boolean,
        inverseLabel: Boolean,
        max: {
            type: [Number, String],
            default: 100,
        },
        min: {
            type: [Number, String],
            default: 0,
        },
        step: {
            type: [Number, String],
            default: 1,
        },
        thumbColor: String,
        thumbLabel: {
            type: [Boolean, String],
            default: undefined,
            validator: v => typeof v === 'boolean' || v === 'always',
        },
        thumbSize: {
            type: [Number, String],
            default: 32,
        },
        tickLabels: {
            type: Array,
            default: () => ([]),
        },
        ticks: {
            type: [Boolean, String],
            default: false,
            validator: v => typeof v === 'boolean' || v === 'always',
        },
        tickSize: {
            type: [Number, String],
            default: 2,
        },
        trackColor: String,
        trackFillColor: String,
        value: [Number, String],
        vertical: Boolean,
    },
    data: () => ({
        app: null,
        oldValue: null,
        thumbPressed: false,
        mouseTimeout: -1,
        isFocused: false,
        isActive: false,
        noClick: false,
        startOffset: 0,
    }),
    computed: {
        classes() {
            return {
                ...VInput.options.computed.classes.call(this),
                'v-input__slider': true,
                'v-input__slider--vertical': this.vertical,
                'v-input__slider--inverse-label': this.inverseLabel,
            };
        },
        internalValue: {
            get() {
                return this.lazyValue;
            },
            set(val) {
                val = isNaN(val) ? this.minValue : val;
                // Round value to ensure the
                // entire slider range can
                // be selected with step
                const value = this.roundValue(Math.min(Math.max(val, this.minValue), this.maxValue));
                if (value === this.lazyValue)
                    return;
                this.lazyValue = value;
                this.$emit('input', value);
            },
        },
        trackTransition() {
            return this.thumbPressed
                ? this.showTicks || this.stepNumeric
                    ? '0.1s cubic-bezier(0.25, 0.8, 0.5, 1)'
                    : 'none'
                : '';
        },
        minValue() {
            return parseFloat(this.min);
        },
        maxValue() {
            return parseFloat(this.max);
        },
        stepNumeric() {
            return this.step > 0 ? parseFloat(this.step) : 0;
        },
        inputWidth() {
            const inputWidth = (this.roundValue(this.internalValue) - this.minValue) / (this.maxValue - this.minValue) * 100;
            return isNaN(inputWidth) ? 0 : inputWidth;
        },
        trackFillStyles() {
            const startDir = this.vertical ? 'bottom' : 'left';
            const endDir = this.vertical ? 'top' : 'right';
            const valueDir = this.vertical ? 'height' : 'width';
            const start = this.$vuetify.rtl ? 'auto' : '0';
            const end = this.$vuetify.rtl ? '0' : 'auto';
            const value = this.isDisabled ? `calc(${this.inputWidth}% - 10px)` : `${this.inputWidth}%`;
            return {
                transition: this.trackTransition,
                [startDir]: start,
                [endDir]: end,
                [valueDir]: value,
            };
        },
        trackStyles() {
            const startDir = this.vertical ? this.$vuetify.rtl ? 'bottom' : 'top' : this.$vuetify.rtl ? 'left' : 'right';
            const endDir = this.vertical ? 'height' : 'width';
            const start = '0px';
            const end = this.isDisabled ? `calc(${100 - this.inputWidth}% - 10px)` : `calc(${100 - this.inputWidth}%)`;
            return {
                transition: this.trackTransition,
                [startDir]: start,
                [endDir]: end,
            };
        },
        showTicks() {
            return this.tickLabels.length > 0 ||
                !!(!this.isDisabled && this.stepNumeric && this.ticks);
        },
        numTicks() {
            return Math.ceil((this.maxValue - this.minValue) / this.stepNumeric);
        },
        showThumbLabel() {
            return !this.isDisabled && !!(this.thumbLabel ||
                this.$scopedSlots['thumb-label']);
        },
        computedTrackColor() {
            if (this.isDisabled)
                return undefined;
            if (this.trackColor)
                return this.trackColor;
            if (this.isDark)
                return this.validationState;
            return this.validationState || 'primary lighten-3';
        },
        computedTrackFillColor() {
            if (this.isDisabled)
                return undefined;
            if (this.trackFillColor)
                return this.trackFillColor;
            return this.validationState || this.computedColor;
        },
        computedThumbColor() {
            if (this.thumbColor)
                return this.thumbColor;
            return this.validationState || this.computedColor;
        },
    },
    watch: {
        min(val) {
            const parsed = parseFloat(val);
            parsed > this.internalValue && this.$emit('input', parsed);
        },
        max(val) {
            const parsed = parseFloat(val);
            parsed < this.internalValue && this.$emit('input', parsed);
        },
        value: {
            handler(v) {
                this.internalValue = v;
            },
        },
    },
    // If done in as immediate in
    // value watcher, causes issues
    // with vue-test-utils
    beforeMount() {
        this.internalValue = this.value;
    },
    mounted() {
        // Without a v-app, iOS does not work with body selectors
        this.app = document.querySelector('[data-app]') ||
            consoleWarn('Missing v-app or a non-body wrapping element with the [data-app] attribute', this);
    },
    methods: {
        genDefaultSlot() {
            const children = [this.genLabel()];
            const slider = this.genSlider();
            this.inverseLabel
                ? children.unshift(slider)
                : children.push(slider);
            children.push(this.genProgress());
            return children;
        },
        genSlider() {
            return this.$createElement('div', {
                class: {
                    'v-slider': true,
                    'v-slider--horizontal': !this.vertical,
                    'v-slider--vertical': this.vertical,
                    'v-slider--focused': this.isFocused,
                    'v-slider--active': this.isActive,
                    'v-slider--disabled': this.isDisabled,
                    'v-slider--readonly': this.isReadonly,
                    ...this.themeClasses,
                },
                directives: [{
                        name: 'click-outside',
                        value: this.onBlur,
                    }],
                on: {
                    click: this.onSliderClick,
                    mousedown: this.onSliderMouseDown,
                    touchstart: this.onSliderMouseDown,
                },
            }, this.genChildren());
        },
        genChildren() {
            return [
                this.genInput(),
                this.genTrackContainer(),
                this.genSteps(),
                this.genThumbContainer(this.internalValue, this.inputWidth, this.isActive, this.isFocused, this.onFocus, this.onBlur),
            ];
        },
        genInput() {
            return this.$createElement('input', {
                attrs: {
                    value: this.internalValue,
                    id: this.computedId,
                    disabled: true,
                    readonly: true,
                    tabindex: -1,
                    ...this.$attrs,
                },
            });
        },
        genTrackContainer() {
            const children = [
                this.$createElement('div', this.setBackgroundColor(this.computedTrackColor, {
                    staticClass: 'v-slider__track-background',
                    style: this.trackStyles,
                })),
                this.$createElement('div', this.setBackgroundColor(this.computedTrackFillColor, {
                    staticClass: 'v-slider__track-fill',
                    style: this.trackFillStyles,
                })),
            ];
            return this.$createElement('div', {
                staticClass: 'v-slider__track-container',
                ref: 'track',
            }, children);
        },
        genSteps() {
            if (!this.step || !this.showTicks)
                return null;
            const tickSize = parseFloat(this.tickSize);
            const range = createRange(this.numTicks + 1);
            const direction = this.vertical ? 'bottom' : (this.$vuetify.rtl ? 'right' : 'left');
            const offsetDirection = this.vertical ? (this.$vuetify.rtl ? 'left' : 'right') : 'top';
            if (this.vertical)
                range.reverse();
            const ticks = range.map(index => {
                const children = [];
                if (this.tickLabels[index]) {
                    children.push(this.$createElement('div', {
                        staticClass: 'v-slider__tick-label',
                    }, this.tickLabels[index]));
                }
                const width = index * (100 / this.numTicks);
                const filled = this.$vuetify.rtl ? (100 - this.inputWidth) < width : width < this.inputWidth;
                return this.$createElement('span', {
                    key: index,
                    staticClass: 'v-slider__tick',
                    class: {
                        'v-slider__tick--filled': filled,
                    },
                    style: {
                        width: `${tickSize}px`,
                        height: `${tickSize}px`,
                        [direction]: `calc(${width}% - ${tickSize / 2}px)`,
                        [offsetDirection]: `calc(50% - ${tickSize / 2}px)`,
                    },
                }, children);
            });
            return this.$createElement('div', {
                staticClass: 'v-slider__ticks-container',
                class: {
                    'v-slider__ticks-container--always-show': this.ticks === 'always' || this.tickLabels.length > 0,
                },
            }, ticks);
        },
        genThumbContainer(value, valueWidth, isActive, isFocused, onFocus, onBlur, ref = 'thumb') {
            const children = [this.genThumb()];
            const thumbLabelContent = this.genThumbLabelContent(value);
            this.showThumbLabel && children.push(this.genThumbLabel(thumbLabelContent));
            return this.$createElement('div', this.setTextColor(this.computedThumbColor, {
                ref,
                key: ref,
                staticClass: 'v-slider__thumb-container',
                class: {
                    'v-slider__thumb-container--active': isActive,
                    'v-slider__thumb-container--focused': isFocused,
                    'v-slider__thumb-container--show-label': this.showThumbLabel,
                },
                style: this.getThumbContainerStyles(valueWidth),
                attrs: {
                    role: 'slider',
                    tabindex: this.isDisabled ? -1 : this.$attrs.tabindex ? this.$attrs.tabindex : 0,
                    'aria-label': this.$attrs['aria-label'] || this.label,
                    'aria-valuemin': this.min,
                    'aria-valuemax': this.max,
                    'aria-valuenow': this.internalValue,
                    'aria-readonly': String(this.isReadonly),
                    'aria-orientation': this.vertical ? 'vertical' : 'horizontal',
                },
                on: {
                    focus: onFocus,
                    blur: onBlur,
                    keydown: this.onKeyDown,
                },
            }), children);
        },
        genThumbLabelContent(value) {
            return this.$scopedSlots['thumb-label']
                ? this.$scopedSlots['thumb-label']({ value })
                : [this.$createElement('span', [String(value)])];
        },
        genThumbLabel(content) {
            const size = convertToUnit(this.thumbSize);
            const transform = this.vertical
                ? `translateY(20%) translateY(${(Number(this.thumbSize) / 3) - 1}px) translateX(55%) rotate(135deg)`
                : `translateY(-20%) translateY(-12px) translateX(-50%) rotate(45deg)`;
            return this.$createElement(VScaleTransition, {
                props: { origin: 'bottom center' },
            }, [
                this.$createElement('div', {
                    staticClass: 'v-slider__thumb-label-container',
                    directives: [{
                            name: 'show',
                            value: this.isFocused || this.isActive || this.thumbLabel === 'always',
                        }],
                }, [
                    this.$createElement('div', this.setBackgroundColor(this.computedThumbColor, {
                        staticClass: 'v-slider__thumb-label',
                        style: {
                            height: size,
                            width: size,
                            transform,
                        },
                    }), [this.$createElement('div', content)]),
                ]),
            ]);
        },
        genThumb() {
            return this.$createElement('div', this.setBackgroundColor(this.computedThumbColor, {
                staticClass: 'v-slider__thumb',
            }));
        },
        getThumbContainerStyles(width) {
            const direction = this.vertical ? 'top' : 'left';
            let value = this.$vuetify.rtl ? 100 - width : width;
            value = this.vertical ? 100 - value : value;
            return {
                transition: this.trackTransition,
                [direction]: `${value}%`,
            };
        },
        onSliderMouseDown(e) {
            e.preventDefault();
            this.oldValue = this.internalValue;
            this.isActive = true;
            if (e.target?.matches('.v-slider__thumb-container, .v-slider__thumb-container *')) {
                this.thumbPressed = true;
                const domRect = e.target.getBoundingClientRect();
                const touch = 'touches' in e ? e.touches[0] : e;
                this.startOffset = this.vertical
                    ? touch.clientY - (domRect.top + domRect.height / 2)
                    : touch.clientX - (domRect.left + domRect.width / 2);
            }
            else {
                this.startOffset = 0;
                window.clearTimeout(this.mouseTimeout);
                this.mouseTimeout = window.setTimeout(() => {
                    this.thumbPressed = true;
                }, 300);
            }
            const mouseUpOptions = passiveSupported ? { passive: true, capture: true } : true;
            const mouseMoveOptions = passiveSupported ? { passive: true } : false;
            const isTouchEvent = 'touches' in e;
            this.onMouseMove(e);
            this.app.addEventListener(isTouchEvent ? 'touchmove' : 'mousemove', this.onMouseMove, mouseMoveOptions);
            addOnceEventListener(this.app, isTouchEvent ? 'touchend' : 'mouseup', this.onSliderMouseUp, mouseUpOptions);
            this.$emit('start', this.internalValue);
        },
        onSliderMouseUp(e) {
            e.stopPropagation();
            window.clearTimeout(this.mouseTimeout);
            this.thumbPressed = false;
            const mouseMoveOptions = passiveSupported ? { passive: true } : false;
            this.app.removeEventListener('touchmove', this.onMouseMove, mouseMoveOptions);
            this.app.removeEventListener('mousemove', this.onMouseMove, mouseMoveOptions);
            this.$emit('mouseup', e);
            this.$emit('end', this.internalValue);
            if (!deepEqual(this.oldValue, this.internalValue)) {
                this.$emit('change', this.internalValue);
                this.noClick = true;
            }
            this.isActive = false;
        },
        onMouseMove(e) {
            if (e.type === 'mousemove') {
                this.thumbPressed = true;
            }
            this.internalValue = this.parseMouseMove(e);
        },
        onKeyDown(e) {
            if (!this.isInteractive)
                return;
            const value = this.parseKeyDown(e, this.internalValue);
            if (value == null ||
                value < this.minValue ||
                value > this.maxValue)
                return;
            this.internalValue = value;
            this.$emit('change', value);
        },
        onSliderClick(e) {
            if (this.noClick) {
                this.noClick = false;
                return;
            }
            const thumb = this.$refs.thumb;
            thumb.focus();
            this.onMouseMove(e);
            this.$emit('change', this.internalValue);
        },
        onBlur(e) {
            this.isFocused = false;
            this.$emit('blur', e);
        },
        onFocus(e) {
            this.isFocused = true;
            this.$emit('focus', e);
        },
        parseMouseMove(e) {
            const start = this.vertical ? 'top' : 'left';
            const length = this.vertical ? 'height' : 'width';
            const click = this.vertical ? 'clientY' : 'clientX';
            const { [start]: trackStart, [length]: trackLength, } = this.$refs.track.getBoundingClientRect();
            const clickOffset = 'touches' in e ? e.touches[0][click] : e[click];
            // It is possible for left to be NaN, force to number
            let clickPos = Math.min(Math.max((clickOffset - trackStart - this.startOffset) / trackLength, 0), 1) || 0;
            if (this.vertical)
                clickPos = 1 - clickPos;
            if (this.$vuetify.rtl)
                clickPos = 1 - clickPos;
            return parseFloat(this.min) + clickPos * (this.maxValue - this.minValue);
        },
        parseKeyDown(e, value) {
            if (!this.isInteractive)
                return;
            const { pageup, pagedown, end, home, left, right, down, up } = keyCodes;
            if (![pageup, pagedown, end, home, left, right, down, up].includes(e.keyCode))
                return;
            e.preventDefault();
            const step = this.stepNumeric || 1;
            const steps = (this.maxValue - this.minValue) / step;
            if ([left, right, down, up].includes(e.keyCode)) {
                const increase = this.$vuetify.rtl ? [left, up] : [right, up];
                const direction = increase.includes(e.keyCode) ? 1 : -1;
                const multiplier = e.shiftKey ? 3 : (e.ctrlKey ? 2 : 1);
                value = value + (direction * step * multiplier);
            }
            else if (e.keyCode === home) {
                value = this.minValue;
            }
            else if (e.keyCode === end) {
                value = this.maxValue;
            }
            else {
                const direction = e.keyCode === pagedown ? 1 : -1;
                value = value - (direction * step * (steps > 100 ? steps / 10 : 10));
            }
            return value;
        },
        roundValue(value) {
            if (!this.stepNumeric)
                return value;
            // Format input value using the same number
            // of decimals places as in the step prop
            const trimmedStep = this.step.toString().trim();
            const decimals = trimmedStep.indexOf('.') > -1
                ? (trimmedStep.length - trimmedStep.indexOf('.') - 1)
                : 0;
            const offset = this.minValue % this.stepNumeric;
            const newValue = Math.round((value - offset) / this.stepNumeric) * this.stepNumeric + offset;
            return parseFloat(Math.min(newValue, this.maxValue).toFixed(decimals));
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNsaWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZTbGlkZXIvVlNsaWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGdCQUFnQixDQUFBO0FBRXZCLGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUE7QUFDOUIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFakQsU0FBUztBQUNULE9BQU8sTUFBc0IsTUFBTSxtQkFBbUIsQ0FBQTtBQUN0RCxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUU1QyxhQUFhO0FBQ2IsT0FBTyxZQUFZLE1BQU0sZ0NBQWdDLENBQUE7QUFFekQsVUFBVTtBQUNWLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUM1SCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFhaEQsZUFBZSxNQUFNLENBUW5CLE1BQU0sRUFDTixRQUFRO0FBQ1Ysb0JBQW9CO0NBQ25CLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLFVBQVU7SUFFaEIsVUFBVSxFQUFFO1FBQ1YsWUFBWTtLQUNiO0lBRUQsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDO0lBRWxCLEtBQUssRUFBRTtRQUNMLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFlBQVksRUFBRSxPQUFPO1FBQ3JCLEdBQUcsRUFBRTtZQUNILElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLEdBQUc7U0FDYjtRQUNELEdBQUcsRUFBRTtZQUNILElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELElBQUksRUFBRTtZQUNKLElB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QUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtRQUN4RSxDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vVlNsaWRlci5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVklucHV0IGZyb20gJy4uL1ZJbnB1dCdcbmltcG9ydCB7IFZTY2FsZVRyYW5zaXRpb24gfSBmcm9tICcuLi90cmFuc2l0aW9ucydcblxuLy8gTWl4aW5zXG5pbXBvcnQgbWl4aW5zLCB7IEV4dHJhY3RWdWUgfSBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCBMb2FkYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvbG9hZGFibGUnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBDbGlja091dHNpZGUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9jbGljay1vdXRzaWRlJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQgeyBhZGRPbmNlRXZlbnRMaXN0ZW5lciwgZGVlcEVxdWFsLCBrZXlDb2RlcywgY3JlYXRlUmFuZ2UsIGNvbnZlcnRUb1VuaXQsIHBhc3NpdmVTdXBwb3J0ZWQgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgeyBjb25zb2xlV2FybiB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCBWdWUsIHsgVk5vZGUsIFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzLCBQcm9wVHlwZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFNjb3BlZFNsb3RDaGlsZHJlbiB9IGZyb20gJ3Z1ZS90eXBlcy92bm9kZSdcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IgfSBmcm9tICd2dWUvdHlwZXMvb3B0aW9ucydcblxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBWdWUge1xuICAkcmVmczoge1xuICAgIHRyYWNrOiBIVE1MRWxlbWVudFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1peGluczxvcHRpb25zICZcbi8qIGVzbGludC1kaXNhYmxlIGluZGVudCAqL1xuICBFeHRyYWN0VnVlPFtcbiAgICB0eXBlb2YgVklucHV0LFxuICAgIHR5cGVvZiBMb2FkYWJsZVxuICBdPlxuLyogZXNsaW50LWVuYWJsZSBpbmRlbnQgKi9cbj4oXG4gIFZJbnB1dCxcbiAgTG9hZGFibGVcbi8qIEB2dWUvY29tcG9uZW50ICovXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LXNsaWRlcicsXG5cbiAgZGlyZWN0aXZlczoge1xuICAgIENsaWNrT3V0c2lkZSxcbiAgfSxcblxuICBtaXhpbnM6IFtMb2FkYWJsZV0sXG5cbiAgcHJvcHM6IHtcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBpbnZlcnNlTGFiZWw6IEJvb2xlYW4sXG4gICAgbWF4OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMTAwLFxuICAgIH0sXG4gICAgbWluOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIHN0ZXA6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAxLFxuICAgIH0sXG4gICAgdGh1bWJDb2xvcjogU3RyaW5nLFxuICAgIHRodW1iTGFiZWw6IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddIGFzIFByb3BUeXBlPGJvb2xlYW4gfCAnYWx3YXlzJyB8IHVuZGVmaW5lZD4sXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWQsXG4gICAgICB2YWxpZGF0b3I6IHYgPT4gdHlwZW9mIHYgPT09ICdib29sZWFuJyB8fCB2ID09PSAnYWx3YXlzJyxcbiAgICB9LFxuICAgIHRodW1iU2l6ZToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDMyLFxuICAgIH0sXG4gICAgdGlja0xhYmVsczoge1xuICAgICAgdHlwZTogQXJyYXksXG4gICAgICBkZWZhdWx0OiAoKSA9PiAoW10pLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxzdHJpbmdbXT4sXG4gICAgdGlja3M6IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddIGFzIFByb3BUeXBlPGJvb2xlYW4gfCAnYWx3YXlzJz4sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHZhbGlkYXRvcjogdiA9PiB0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nIHx8IHYgPT09ICdhbHdheXMnLFxuICAgIH0sXG4gICAgdGlja1NpemU6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAyLFxuICAgIH0sXG4gICAgdHJhY2tDb2xvcjogU3RyaW5nLFxuICAgIHRyYWNrRmlsbENvbG9yOiBTdHJpbmcsXG4gICAgdmFsdWU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgdmVydGljYWw6IEJvb2xlYW4sXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBhcHA6IG51bGwgYXMgYW55LFxuICAgIG9sZFZhbHVlOiBudWxsIGFzIGFueSxcbiAgICB0aHVtYlByZXNzZWQ6IGZhbHNlLFxuICAgIG1vdXNlVGltZW91dDogLTEsXG4gICAgaXNGb2N1c2VkOiBmYWxzZSxcbiAgICBpc0FjdGl2ZTogZmFsc2UsXG4gICAgbm9DbGljazogZmFsc2UsIC8vIFByZXZlbnQgY2xpY2sgZXZlbnQgaWYgZHJhZ2dpbmcgdG9vayBwbGFjZSwgaGFjayBmb3IgIzc5MTVcbiAgICBzdGFydE9mZnNldDogMCxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uVklucHV0Lm9wdGlvbnMuY29tcHV0ZWQuY2xhc3Nlcy5jYWxsKHRoaXMpLFxuICAgICAgICAndi1pbnB1dF9fc2xpZGVyJzogdHJ1ZSxcbiAgICAgICAgJ3YtaW5wdXRfX3NsaWRlci0tdmVydGljYWwnOiB0aGlzLnZlcnRpY2FsLFxuICAgICAgICAndi1pbnB1dF9fc2xpZGVyLS1pbnZlcnNlLWxhYmVsJzogdGhpcy5pbnZlcnNlTGFiZWwsXG4gICAgICB9XG4gICAgfSxcbiAgICBpbnRlcm5hbFZhbHVlOiB7XG4gICAgICBnZXQgKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhenlWYWx1ZVxuICAgICAgfSxcbiAgICAgIHNldCAodmFsOiBudW1iZXIpIHtcbiAgICAgICAgdmFsID0gaXNOYU4odmFsKSA/IHRoaXMubWluVmFsdWUgOiB2YWxcbiAgICAgICAgLy8gUm91bmQgdmFsdWUgdG8gZW5zdXJlIHRoZVxuICAgICAgICAvLyBlbnRpcmUgc2xpZGVyIHJhbmdlIGNhblxuICAgICAgICAvLyBiZSBzZWxlY3RlZCB3aXRoIHN0ZXBcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnJvdW5kVmFsdWUoTWF0aC5taW4oTWF0aC5tYXgodmFsLCB0aGlzLm1pblZhbHVlKSwgdGhpcy5tYXhWYWx1ZSkpXG5cbiAgICAgICAgaWYgKHZhbHVlID09PSB0aGlzLmxhenlWYWx1ZSkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5sYXp5VmFsdWUgPSB2YWx1ZVxuXG4gICAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgdmFsdWUpXG4gICAgICB9LFxuICAgIH0sXG4gICAgdHJhY2tUcmFuc2l0aW9uICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMudGh1bWJQcmVzc2VkXG4gICAgICAgID8gdGhpcy5zaG93VGlja3MgfHwgdGhpcy5zdGVwTnVtZXJpY1xuICAgICAgICAgID8gJzAuMXMgY3ViaWMtYmV6aWVyKDAuMjUsIDAuOCwgMC41LCAxKSdcbiAgICAgICAgICA6ICdub25lJ1xuICAgICAgICA6ICcnXG4gICAgfSxcbiAgICBtaW5WYWx1ZSAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMubWluKVxuICAgIH0sXG4gICAgbWF4VmFsdWUgKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdCh0aGlzLm1heClcbiAgICB9LFxuICAgIHN0ZXBOdW1lcmljICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuc3RlcCA+IDAgPyBwYXJzZUZsb2F0KHRoaXMuc3RlcCkgOiAwXG4gICAgfSxcbiAgICBpbnB1dFdpZHRoICgpOiBudW1iZXIge1xuICAgICAgY29uc3QgaW5wdXRXaWR0aCA9ICh0aGlzLnJvdW5kVmFsdWUodGhpcy5pbnRlcm5hbFZhbHVlKSAtIHRoaXMubWluVmFsdWUpIC8gKHRoaXMubWF4VmFsdWUgLSB0aGlzLm1pblZhbHVlKSAqIDEwMFxuXG4gICAgICByZXR1cm4gaXNOYU4oaW5wdXRXaWR0aCkgPyAwIDogaW5wdXRXaWR0aFxuICAgIH0sXG4gICAgdHJhY2tGaWxsU3R5bGVzICgpOiBQYXJ0aWFsPENTU1N0eWxlRGVjbGFyYXRpb24+IHtcbiAgICAgIGNvbnN0IHN0YXJ0RGlyID0gdGhpcy52ZXJ0aWNhbCA/ICdib3R0b20nIDogJ2xlZnQnXG4gICAgICBjb25zdCBlbmREaXIgPSB0aGlzLnZlcnRpY2FsID8gJ3RvcCcgOiAncmlnaHQnXG4gICAgICBjb25zdCB2YWx1ZURpciA9IHRoaXMudmVydGljYWwgPyAnaGVpZ2h0JyA6ICd3aWR0aCdcblxuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLiR2dWV0aWZ5LnJ0bCA/ICdhdXRvJyA6ICcwJ1xuICAgICAgY29uc3QgZW5kID0gdGhpcy4kdnVldGlmeS5ydGwgPyAnMCcgOiAnYXV0bydcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pc0Rpc2FibGVkID8gYGNhbGMoJHt0aGlzLmlucHV0V2lkdGh9JSAtIDEwcHgpYCA6IGAke3RoaXMuaW5wdXRXaWR0aH0lYFxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLnRyYWNrVHJhbnNpdGlvbixcbiAgICAgICAgW3N0YXJ0RGlyXTogc3RhcnQsXG4gICAgICAgIFtlbmREaXJdOiBlbmQsXG4gICAgICAgIFt2YWx1ZURpcl06IHZhbHVlLFxuICAgICAgfVxuICAgIH0sXG4gICAgdHJhY2tTdHlsZXMgKCk6IFBhcnRpYWw8Q1NTU3R5bGVEZWNsYXJhdGlvbj4ge1xuICAgICAgY29uc3Qgc3RhcnREaXIgPSB0aGlzLnZlcnRpY2FsID8gdGhpcy4kdnVldGlmeS5ydGwgPyAnYm90dG9tJyA6ICd0b3AnIDogdGhpcy4kdnVldGlmeS5ydGwgPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgICBjb25zdCBlbmREaXIgPSB0aGlzLnZlcnRpY2FsID8gJ2hlaWdodCcgOiAnd2lkdGgnXG5cbiAgICAgIGNvbnN0IHN0YXJ0ID0gJzBweCdcbiAgICAgIGNvbnN0IGVuZCA9IHRoaXMuaXNEaXNhYmxlZCA/IGBjYWxjKCR7MTAwIC0gdGhpcy5pbnB1dFdpZHRofSUgLSAxMHB4KWAgOiBgY2FsYygkezEwMCAtIHRoaXMuaW5wdXRXaWR0aH0lKWBcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNpdGlvbjogdGhpcy50cmFja1RyYW5zaXRpb24sXG4gICAgICAgIFtzdGFydERpcl06IHN0YXJ0LFxuICAgICAgICBbZW5kRGlyXTogZW5kLFxuICAgICAgfVxuICAgIH0sXG4gICAgc2hvd1RpY2tzICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLnRpY2tMYWJlbHMubGVuZ3RoID4gMCB8fFxuICAgICAgICAhISghdGhpcy5pc0Rpc2FibGVkICYmIHRoaXMuc3RlcE51bWVyaWMgJiYgdGhpcy50aWNrcylcbiAgICB9LFxuICAgIG51bVRpY2tzICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIE1hdGguY2VpbCgodGhpcy5tYXhWYWx1ZSAtIHRoaXMubWluVmFsdWUpIC8gdGhpcy5zdGVwTnVtZXJpYylcbiAgICB9LFxuICAgIHNob3dUaHVtYkxhYmVsICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAhdGhpcy5pc0Rpc2FibGVkICYmICEhKFxuICAgICAgICB0aGlzLnRodW1iTGFiZWwgfHxcbiAgICAgICAgdGhpcy4kc2NvcGVkU2xvdHNbJ3RodW1iLWxhYmVsJ11cbiAgICAgIClcbiAgICB9LFxuICAgIGNvbXB1dGVkVHJhY2tDb2xvciAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICh0aGlzLmlzRGlzYWJsZWQpIHJldHVybiB1bmRlZmluZWRcbiAgICAgIGlmICh0aGlzLnRyYWNrQ29sb3IpIHJldHVybiB0aGlzLnRyYWNrQ29sb3JcbiAgICAgIGlmICh0aGlzLmlzRGFyaykgcmV0dXJuIHRoaXMudmFsaWRhdGlvblN0YXRlXG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0aW9uU3RhdGUgfHwgJ3ByaW1hcnkgbGlnaHRlbi0zJ1xuICAgIH0sXG4gICAgY29tcHV0ZWRUcmFja0ZpbGxDb2xvciAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICh0aGlzLmlzRGlzYWJsZWQpIHJldHVybiB1bmRlZmluZWRcbiAgICAgIGlmICh0aGlzLnRyYWNrRmlsbENvbG9yKSByZXR1cm4gdGhpcy50cmFja0ZpbGxDb2xvclxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvblN0YXRlIHx8IHRoaXMuY29tcHV0ZWRDb2xvclxuICAgIH0sXG4gICAgY29tcHV0ZWRUaHVtYkNvbG9yICgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgaWYgKHRoaXMudGh1bWJDb2xvcikgcmV0dXJuIHRoaXMudGh1bWJDb2xvclxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvblN0YXRlIHx8IHRoaXMuY29tcHV0ZWRDb2xvclxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBtaW4gKHZhbCkge1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VGbG9hdCh2YWwpXG4gICAgICBwYXJzZWQgPiB0aGlzLmludGVybmFsVmFsdWUgJiYgdGhpcy4kZW1pdCgnaW5wdXQnLCBwYXJzZWQpXG4gICAgfSxcbiAgICBtYXggKHZhbCkge1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VGbG9hdCh2YWwpXG4gICAgICBwYXJzZWQgPCB0aGlzLmludGVybmFsVmFsdWUgJiYgdGhpcy4kZW1pdCgnaW5wdXQnLCBwYXJzZWQpXG4gICAgfSxcbiAgICB2YWx1ZToge1xuICAgICAgaGFuZGxlciAodjogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHZcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICAvLyBJZiBkb25lIGluIGFzIGltbWVkaWF0ZSBpblxuICAvLyB2YWx1ZSB3YXRjaGVyLCBjYXVzZXMgaXNzdWVzXG4gIC8vIHdpdGggdnVlLXRlc3QtdXRpbHNcbiAgYmVmb3JlTW91bnQgKCkge1xuICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHRoaXMudmFsdWVcbiAgfSxcblxuICBtb3VudGVkICgpIHtcbiAgICAvLyBXaXRob3V0IGEgdi1hcHAsIGlPUyBkb2VzIG5vdCB3b3JrIHdpdGggYm9keSBzZWxlY3RvcnNcbiAgICB0aGlzLmFwcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWFwcF0nKSB8fFxuICAgICAgY29uc29sZVdhcm4oJ01pc3Npbmcgdi1hcHAgb3IgYSBub24tYm9keSB3cmFwcGluZyBlbGVtZW50IHdpdGggdGhlIFtkYXRhLWFwcF0gYXR0cmlidXRlJywgdGhpcylcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuRGVmYXVsdFNsb3QgKCk6IFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuOiBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cyA9IFt0aGlzLmdlbkxhYmVsKCldXG4gICAgICBjb25zdCBzbGlkZXIgPSB0aGlzLmdlblNsaWRlcigpXG4gICAgICB0aGlzLmludmVyc2VMYWJlbFxuICAgICAgICA/IGNoaWxkcmVuLnVuc2hpZnQoc2xpZGVyKVxuICAgICAgICA6IGNoaWxkcmVuLnB1c2goc2xpZGVyKVxuXG4gICAgICBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuUHJvZ3Jlc3MoKSlcblxuICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgfSxcbiAgICBnZW5TbGlkZXIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3Ytc2xpZGVyJzogdHJ1ZSxcbiAgICAgICAgICAndi1zbGlkZXItLWhvcml6b250YWwnOiAhdGhpcy52ZXJ0aWNhbCxcbiAgICAgICAgICAndi1zbGlkZXItLXZlcnRpY2FsJzogdGhpcy52ZXJ0aWNhbCxcbiAgICAgICAgICAndi1zbGlkZXItLWZvY3VzZWQnOiB0aGlzLmlzRm9jdXNlZCxcbiAgICAgICAgICAndi1zbGlkZXItLWFjdGl2ZSc6IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgICAgJ3Ytc2xpZGVyLS1kaXNhYmxlZCc6IHRoaXMuaXNEaXNhYmxlZCxcbiAgICAgICAgICAndi1zbGlkZXItLXJlYWRvbmx5JzogdGhpcy5pc1JlYWRvbmx5LFxuICAgICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgICB9LFxuICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgIG5hbWU6ICdjbGljay1vdXRzaWRlJyxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5vbkJsdXIsXG4gICAgICAgIH1dLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiB0aGlzLm9uU2xpZGVyQ2xpY2ssXG4gICAgICAgICAgbW91c2Vkb3duOiB0aGlzLm9uU2xpZGVyTW91c2VEb3duLFxuICAgICAgICAgIHRvdWNoc3RhcnQ6IHRoaXMub25TbGlkZXJNb3VzZURvd24sXG4gICAgICAgIH0sXG4gICAgICB9LCB0aGlzLmdlbkNoaWxkcmVuKCkpXG4gICAgfSxcbiAgICBnZW5DaGlsZHJlbiAoKTogVk5vZGVDaGlsZHJlbkFycmF5Q29udGVudHMge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgdGhpcy5nZW5JbnB1dCgpLFxuICAgICAgICB0aGlzLmdlblRyYWNrQ29udGFpbmVyKCksXG4gICAgICAgIHRoaXMuZ2VuU3RlcHMoKSxcbiAgICAgICAgdGhpcy5nZW5UaHVtYkNvbnRhaW5lcihcbiAgICAgICAgICB0aGlzLmludGVybmFsVmFsdWUsXG4gICAgICAgICAgdGhpcy5pbnB1dFdpZHRoLFxuICAgICAgICAgIHRoaXMuaXNBY3RpdmUsXG4gICAgICAgICAgdGhpcy5pc0ZvY3VzZWQsXG4gICAgICAgICAgdGhpcy5vbkZvY3VzLFxuICAgICAgICAgIHRoaXMub25CbHVyLFxuICAgICAgICApLFxuICAgICAgXVxuICAgIH0sXG4gICAgZ2VuSW5wdXQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdpbnB1dCcsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5pbnRlcm5hbFZhbHVlLFxuICAgICAgICAgIGlkOiB0aGlzLmNvbXB1dGVkSWQsXG4gICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgcmVhZG9ubHk6IHRydWUsXG4gICAgICAgICAgdGFiaW5kZXg6IC0xLFxuICAgICAgICAgIC4uLnRoaXMuJGF0dHJzLFxuICAgICAgICB9LFxuICAgICAgICAvLyBvbjogdGhpcy5nZW5MaXN0ZW5lcnMoKSwgLy8gVE9ETzogZG8gd2UgbmVlZCB0byBhdHRhY2ggdGhlIGxpc3RlbmVycyB0byBpbnB1dD9cbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5UcmFja0NvbnRhaW5lciAoKTogVk5vZGUge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29tcHV0ZWRUcmFja0NvbG9yLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlcl9fdHJhY2stYmFja2dyb3VuZCcsXG4gICAgICAgICAgc3R5bGU6IHRoaXMudHJhY2tTdHlsZXMsXG4gICAgICAgIH0pKSxcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IodGhpcy5jb21wdXRlZFRyYWNrRmlsbENvbG9yLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlcl9fdHJhY2stZmlsbCcsXG4gICAgICAgICAgc3R5bGU6IHRoaXMudHJhY2tGaWxsU3R5bGVzLFxuICAgICAgICB9KSksXG4gICAgICBdXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZXJfX3RyYWNrLWNvbnRhaW5lcicsXG4gICAgICAgIHJlZjogJ3RyYWNrJyxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuU3RlcHMgKCk6IFZOb2RlIHwgbnVsbCB7XG4gICAgICBpZiAoIXRoaXMuc3RlcCB8fCAhdGhpcy5zaG93VGlja3MpIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IHRpY2tTaXplID0gcGFyc2VGbG9hdCh0aGlzLnRpY2tTaXplKVxuICAgICAgY29uc3QgcmFuZ2UgPSBjcmVhdGVSYW5nZSh0aGlzLm51bVRpY2tzICsgMSlcbiAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMudmVydGljYWwgPyAnYm90dG9tJyA6ICh0aGlzLiR2dWV0aWZ5LnJ0bCA/ICdyaWdodCcgOiAnbGVmdCcpXG4gICAgICBjb25zdCBvZmZzZXREaXJlY3Rpb24gPSB0aGlzLnZlcnRpY2FsID8gKHRoaXMuJHZ1ZXRpZnkucnRsID8gJ2xlZnQnIDogJ3JpZ2h0JykgOiAndG9wJ1xuXG4gICAgICBpZiAodGhpcy52ZXJ0aWNhbCkgcmFuZ2UucmV2ZXJzZSgpXG5cbiAgICAgIGNvbnN0IHRpY2tzID0gcmFuZ2UubWFwKGluZGV4ID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBbXVxuXG4gICAgICAgIGlmICh0aGlzLnRpY2tMYWJlbHNbaW5kZXhdKSB7XG4gICAgICAgICAgY2hpbGRyZW4ucHVzaCh0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2xpZGVyX190aWNrLWxhYmVsJyxcbiAgICAgICAgICB9LCB0aGlzLnRpY2tMYWJlbHNbaW5kZXhdKSlcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdpZHRoID0gaW5kZXggKiAoMTAwIC8gdGhpcy5udW1UaWNrcylcbiAgICAgICAgY29uc3QgZmlsbGVkID0gdGhpcy4kdnVldGlmeS5ydGwgPyAoMTAwIC0gdGhpcy5pbnB1dFdpZHRoKSA8IHdpZHRoIDogd2lkdGggPCB0aGlzLmlucHV0V2lkdGhcblxuICAgICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnc3BhbicsIHtcbiAgICAgICAgICBrZXk6IGluZGV4LFxuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZXJfX3RpY2snLFxuICAgICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgICAndi1zbGlkZXJfX3RpY2stLWZpbGxlZCc6IGZpbGxlZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICB3aWR0aDogYCR7dGlja1NpemV9cHhgLFxuICAgICAgICAgICAgaGVpZ2h0OiBgJHt0aWNrU2l6ZX1weGAsXG4gICAgICAgICAgICBbZGlyZWN0aW9uXTogYGNhbGMoJHt3aWR0aH0lIC0gJHt0aWNrU2l6ZSAvIDJ9cHgpYCxcbiAgICAgICAgICAgIFtvZmZzZXREaXJlY3Rpb25dOiBgY2FsYyg1MCUgLSAke3RpY2tTaXplIC8gMn1weClgLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sIGNoaWxkcmVuKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNsaWRlcl9fdGlja3MtY29udGFpbmVyJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1zbGlkZXJfX3RpY2tzLWNvbnRhaW5lci0tYWx3YXlzLXNob3cnOiB0aGlzLnRpY2tzID09PSAnYWx3YXlzJyB8fCB0aGlzLnRpY2tMYWJlbHMubGVuZ3RoID4gMCxcbiAgICAgICAgfSxcbiAgICAgIH0sIHRpY2tzKVxuICAgIH0sXG4gICAgZ2VuVGh1bWJDb250YWluZXIgKFxuICAgICAgdmFsdWU6IG51bWJlcixcbiAgICAgIHZhbHVlV2lkdGg6IG51bWJlcixcbiAgICAgIGlzQWN0aXZlOiBib29sZWFuLFxuICAgICAgaXNGb2N1c2VkOiBib29sZWFuLFxuICAgICAgb25Gb2N1czogRnVuY3Rpb24sXG4gICAgICBvbkJsdXI6IEZ1bmN0aW9uLFxuICAgICAgcmVmID0gJ3RodW1iJ1xuICAgICk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW3RoaXMuZ2VuVGh1bWIoKV1cblxuICAgICAgY29uc3QgdGh1bWJMYWJlbENvbnRlbnQgPSB0aGlzLmdlblRodW1iTGFiZWxDb250ZW50KHZhbHVlKVxuICAgICAgdGhpcy5zaG93VGh1bWJMYWJlbCAmJiBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuVGh1bWJMYWJlbCh0aHVtYkxhYmVsQ29udGVudCkpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldFRleHRDb2xvcih0aGlzLmNvbXB1dGVkVGh1bWJDb2xvciwge1xuICAgICAgICByZWYsXG4gICAgICAgIGtleTogcmVmLFxuICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2xpZGVyX190aHVtYi1jb250YWluZXInLFxuICAgICAgICBjbGFzczoge1xuICAgICAgICAgICd2LXNsaWRlcl9fdGh1bWItY29udGFpbmVyLS1hY3RpdmUnOiBpc0FjdGl2ZSxcbiAgICAgICAgICAndi1zbGlkZXJfX3RodW1iLWNvbnRhaW5lci0tZm9jdXNlZCc6IGlzRm9jdXNlZCxcbiAgICAgICAgICAndi1zbGlkZXJfX3RodW1iLWNvbnRhaW5lci0tc2hvdy1sYWJlbCc6IHRoaXMuc2hvd1RodW1iTGFiZWwsXG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlOiB0aGlzLmdldFRodW1iQ29udGFpbmVyU3R5bGVzKHZhbHVlV2lkdGgpLFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIHJvbGU6ICdzbGlkZXInLFxuICAgICAgICAgIHRhYmluZGV4OiB0aGlzLmlzRGlzYWJsZWQgPyAtMSA6IHRoaXMuJGF0dHJzLnRhYmluZGV4ID8gdGhpcy4kYXR0cnMudGFiaW5kZXggOiAwLFxuICAgICAgICAgICdhcmlhLWxhYmVsJzogdGhpcy4kYXR0cnNbJ2FyaWEtbGFiZWwnXSB8fCB0aGlzLmxhYmVsLFxuICAgICAgICAgICdhcmlhLXZhbHVlbWluJzogdGhpcy5taW4sXG4gICAgICAgICAgJ2FyaWEtdmFsdWVtYXgnOiB0aGlzLm1heCxcbiAgICAgICAgICAnYXJpYS12YWx1ZW5vdyc6IHRoaXMuaW50ZXJuYWxWYWx1ZSxcbiAgICAgICAgICAnYXJpYS1yZWFkb25seSc6IFN0cmluZyh0aGlzLmlzUmVhZG9ubHkpLFxuICAgICAgICAgICdhcmlhLW9yaWVudGF0aW9uJzogdGhpcy52ZXJ0aWNhbCA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCcsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgZm9jdXM6IG9uRm9jdXMsXG4gICAgICAgICAgYmx1cjogb25CbHVyLFxuICAgICAgICAgIGtleWRvd246IHRoaXMub25LZXlEb3duLFxuICAgICAgICB9LFxuICAgICAgfSksIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuVGh1bWJMYWJlbENvbnRlbnQgKHZhbHVlOiBudW1iZXIgfCBzdHJpbmcpOiBTY29wZWRTbG90Q2hpbGRyZW4ge1xuICAgICAgcmV0dXJuIHRoaXMuJHNjb3BlZFNsb3RzWyd0aHVtYi1sYWJlbCddXG4gICAgICAgID8gdGhpcy4kc2NvcGVkU2xvdHNbJ3RodW1iLWxhYmVsJ10hKHsgdmFsdWUgfSlcbiAgICAgICAgOiBbdGhpcy4kY3JlYXRlRWxlbWVudCgnc3BhbicsIFtTdHJpbmcodmFsdWUpXSldXG4gICAgfSxcbiAgICBnZW5UaHVtYkxhYmVsIChjb250ZW50OiBTY29wZWRTbG90Q2hpbGRyZW4pOiBWTm9kZSB7XG4gICAgICBjb25zdCBzaXplID0gY29udmVydFRvVW5pdCh0aGlzLnRodW1iU2l6ZSlcblxuICAgICAgY29uc3QgdHJhbnNmb3JtID0gdGhpcy52ZXJ0aWNhbFxuICAgICAgICA/IGB0cmFuc2xhdGVZKDIwJSkgdHJhbnNsYXRlWSgkeyhOdW1iZXIodGhpcy50aHVtYlNpemUpIC8gMykgLSAxfXB4KSB0cmFuc2xhdGVYKDU1JSkgcm90YXRlKDEzNWRlZylgXG4gICAgICAgIDogYHRyYW5zbGF0ZVkoLTIwJSkgdHJhbnNsYXRlWSgtMTJweCkgdHJhbnNsYXRlWCgtNTAlKSByb3RhdGUoNDVkZWcpYFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWU2NhbGVUcmFuc2l0aW9uLCB7XG4gICAgICAgIHByb3BzOiB7IG9yaWdpbjogJ2JvdHRvbSBjZW50ZXInIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2xpZGVyX190aHVtYi1sYWJlbC1jb250YWluZXInLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgICBuYW1lOiAnc2hvdycsXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5pc0ZvY3VzZWQgfHwgdGhpcy5pc0FjdGl2ZSB8fCB0aGlzLnRodW1iTGFiZWwgPT09ICdhbHdheXMnLFxuICAgICAgICAgIH1dLFxuICAgICAgICB9LCBbXG4gICAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IodGhpcy5jb21wdXRlZFRodW1iQ29sb3IsIHtcbiAgICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZXJfX3RodW1iLWxhYmVsJyxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgICAgICAgIHRyYW5zZm9ybSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksIFt0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCBjb250ZW50KV0pLFxuICAgICAgICBdKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5UaHVtYiAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29tcHV0ZWRUaHVtYkNvbG9yLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZXJfX3RodW1iJyxcbiAgICAgIH0pKVxuICAgIH0sXG4gICAgZ2V0VGh1bWJDb250YWluZXJTdHlsZXMgKHdpZHRoOiBudW1iZXIpOiBvYmplY3Qge1xuICAgICAgY29uc3QgZGlyZWN0aW9uID0gdGhpcy52ZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnXG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLiR2dWV0aWZ5LnJ0bCA/IDEwMCAtIHdpZHRoIDogd2lkdGhcbiAgICAgIHZhbHVlID0gdGhpcy52ZXJ0aWNhbCA/IDEwMCAtIHZhbHVlIDogdmFsdWVcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNpdGlvbjogdGhpcy50cmFja1RyYW5zaXRpb24sXG4gICAgICAgIFtkaXJlY3Rpb25dOiBgJHt2YWx1ZX0lYCxcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uU2xpZGVyTW91c2VEb3duIChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHRoaXMub2xkVmFsdWUgPSB0aGlzLmludGVybmFsVmFsdWVcbiAgICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlXG5cbiAgICAgIGlmICgoZS50YXJnZXQgYXMgRWxlbWVudCk/Lm1hdGNoZXMoJy52LXNsaWRlcl9fdGh1bWItY29udGFpbmVyLCAudi1zbGlkZXJfX3RodW1iLWNvbnRhaW5lciAqJykpIHtcbiAgICAgICAgdGhpcy50aHVtYlByZXNzZWQgPSB0cnVlXG4gICAgICAgIGNvbnN0IGRvbVJlY3QgPSAoZS50YXJnZXQgYXMgRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgY29uc3QgdG91Y2ggPSAndG91Y2hlcycgaW4gZSA/IGUudG91Y2hlc1swXSA6IGVcbiAgICAgICAgdGhpcy5zdGFydE9mZnNldCA9IHRoaXMudmVydGljYWxcbiAgICAgICAgICA/IHRvdWNoLmNsaWVudFkgLSAoZG9tUmVjdC50b3AgKyBkb21SZWN0LmhlaWdodCAvIDIpXG4gICAgICAgICAgOiB0b3VjaC5jbGllbnRYIC0gKGRvbVJlY3QubGVmdCArIGRvbVJlY3Qud2lkdGggLyAyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zdGFydE9mZnNldCA9IDBcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLm1vdXNlVGltZW91dClcbiAgICAgICAgdGhpcy5tb3VzZVRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy50aHVtYlByZXNzZWQgPSB0cnVlXG4gICAgICAgIH0sIDMwMClcbiAgICAgIH1cblxuICAgICAgY29uc3QgbW91c2VVcE9wdGlvbnMgPSBwYXNzaXZlU3VwcG9ydGVkID8geyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0gOiB0cnVlXG4gICAgICBjb25zdCBtb3VzZU1vdmVPcHRpb25zID0gcGFzc2l2ZVN1cHBvcnRlZCA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2VcblxuICAgICAgY29uc3QgaXNUb3VjaEV2ZW50ID0gJ3RvdWNoZXMnIGluIGVcblxuICAgICAgdGhpcy5vbk1vdXNlTW92ZShlKVxuICAgICAgdGhpcy5hcHAuYWRkRXZlbnRMaXN0ZW5lcihpc1RvdWNoRXZlbnQgPyAndG91Y2htb3ZlJyA6ICdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlLCBtb3VzZU1vdmVPcHRpb25zKVxuICAgICAgYWRkT25jZUV2ZW50TGlzdGVuZXIodGhpcy5hcHAsIGlzVG91Y2hFdmVudCA/ICd0b3VjaGVuZCcgOiAnbW91c2V1cCcsIHRoaXMub25TbGlkZXJNb3VzZVVwLCBtb3VzZVVwT3B0aW9ucylcblxuICAgICAgdGhpcy4kZW1pdCgnc3RhcnQnLCB0aGlzLmludGVybmFsVmFsdWUpXG4gICAgfSxcbiAgICBvblNsaWRlck1vdXNlVXAgKGU6IEV2ZW50KSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMubW91c2VUaW1lb3V0KVxuICAgICAgdGhpcy50aHVtYlByZXNzZWQgPSBmYWxzZVxuICAgICAgY29uc3QgbW91c2VNb3ZlT3B0aW9ucyA9IHBhc3NpdmVTdXBwb3J0ZWQgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlXG4gICAgICB0aGlzLmFwcC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlLCBtb3VzZU1vdmVPcHRpb25zKVxuICAgICAgdGhpcy5hcHAucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSwgbW91c2VNb3ZlT3B0aW9ucylcblxuICAgICAgdGhpcy4kZW1pdCgnbW91c2V1cCcsIGUpXG4gICAgICB0aGlzLiRlbWl0KCdlbmQnLCB0aGlzLmludGVybmFsVmFsdWUpXG4gICAgICBpZiAoIWRlZXBFcXVhbCh0aGlzLm9sZFZhbHVlLCB0aGlzLmludGVybmFsVmFsdWUpKSB7XG4gICAgICAgIHRoaXMuJGVtaXQoJ2NoYW5nZScsIHRoaXMuaW50ZXJuYWxWYWx1ZSlcbiAgICAgICAgdGhpcy5ub0NsaWNrID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgICB9LFxuICAgIG9uTW91c2VNb3ZlIChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuICAgICAgaWYgKGUudHlwZSA9PT0gJ21vdXNlbW92ZScpIHtcbiAgICAgICAgdGhpcy50aHVtYlByZXNzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgICB0aGlzLmludGVybmFsVmFsdWUgPSB0aGlzLnBhcnNlTW91c2VNb3ZlKGUpXG4gICAgfSxcbiAgICBvbktleURvd24gKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0ludGVyYWN0aXZlKSByZXR1cm5cblxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBhcnNlS2V5RG93bihlLCB0aGlzLmludGVybmFsVmFsdWUpXG5cbiAgICAgIGlmIChcbiAgICAgICAgdmFsdWUgPT0gbnVsbCB8fFxuICAgICAgICB2YWx1ZSA8IHRoaXMubWluVmFsdWUgfHxcbiAgICAgICAgdmFsdWUgPiB0aGlzLm1heFZhbHVlXG4gICAgICApIHJldHVyblxuXG4gICAgICB0aGlzLmludGVybmFsVmFsdWUgPSB2YWx1ZVxuICAgICAgdGhpcy4kZW1pdCgnY2hhbmdlJywgdmFsdWUpXG4gICAgfSxcbiAgICBvblNsaWRlckNsaWNrIChlOiBNb3VzZUV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5ub0NsaWNrKSB7XG4gICAgICAgIHRoaXMubm9DbGljayA9IGZhbHNlXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgdGh1bWIgPSB0aGlzLiRyZWZzLnRodW1iIGFzIEhUTUxFbGVtZW50XG4gICAgICB0aHVtYi5mb2N1cygpXG5cbiAgICAgIHRoaXMub25Nb3VzZU1vdmUoZSlcbiAgICAgIHRoaXMuJGVtaXQoJ2NoYW5nZScsIHRoaXMuaW50ZXJuYWxWYWx1ZSlcbiAgICB9LFxuICAgIG9uQmx1ciAoZTogRXZlbnQpIHtcbiAgICAgIHRoaXMuaXNGb2N1c2VkID0gZmFsc2VcblxuICAgICAgdGhpcy4kZW1pdCgnYmx1cicsIGUpXG4gICAgfSxcbiAgICBvbkZvY3VzIChlOiBFdmVudCkge1xuICAgICAgdGhpcy5pc0ZvY3VzZWQgPSB0cnVlXG5cbiAgICAgIHRoaXMuJGVtaXQoJ2ZvY3VzJywgZSlcbiAgICB9LFxuICAgIHBhcnNlTW91c2VNb3ZlIChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLnZlcnRpY2FsID8gJ3RvcCcgOiAnbGVmdCdcbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMudmVydGljYWwgPyAnaGVpZ2h0JyA6ICd3aWR0aCdcbiAgICAgIGNvbnN0IGNsaWNrID0gdGhpcy52ZXJ0aWNhbCA/ICdjbGllbnRZJyA6ICdjbGllbnRYJ1xuXG4gICAgICBjb25zdCB7XG4gICAgICAgIFtzdGFydF06IHRyYWNrU3RhcnQsXG4gICAgICAgIFtsZW5ndGhdOiB0cmFja0xlbmd0aCxcbiAgICAgIH0gPSB0aGlzLiRyZWZzLnRyYWNrLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBjbGlja09mZnNldCA9ICd0b3VjaGVzJyBpbiBlID8gZS50b3VjaGVzWzBdW2NsaWNrXSA6IGVbY2xpY2tdXG5cbiAgICAgIC8vIEl0IGlzIHBvc3NpYmxlIGZvciBsZWZ0IHRvIGJlIE5hTiwgZm9yY2UgdG8gbnVtYmVyXG4gICAgICBsZXQgY2xpY2tQb3MgPSBNYXRoLm1pbihNYXRoLm1heCgoY2xpY2tPZmZzZXQgLSB0cmFja1N0YXJ0IC0gdGhpcy5zdGFydE9mZnNldCkgLyB0cmFja0xlbmd0aCwgMCksIDEpIHx8IDBcblxuICAgICAgaWYgKHRoaXMudmVydGljYWwpIGNsaWNrUG9zID0gMSAtIGNsaWNrUG9zXG4gICAgICBpZiAodGhpcy4kdnVldGlmeS5ydGwpIGNsaWNrUG9zID0gMSAtIGNsaWNrUG9zXG5cbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMubWluKSArIGNsaWNrUG9zICogKHRoaXMubWF4VmFsdWUgLSB0aGlzLm1pblZhbHVlKVxuICAgIH0sXG4gICAgcGFyc2VLZXlEb3duIChlOiBLZXlib2FyZEV2ZW50LCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgICBpZiAoIXRoaXMuaXNJbnRlcmFjdGl2ZSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHsgcGFnZXVwLCBwYWdlZG93biwgZW5kLCBob21lLCBsZWZ0LCByaWdodCwgZG93biwgdXAgfSA9IGtleUNvZGVzXG5cbiAgICAgIGlmICghW3BhZ2V1cCwgcGFnZWRvd24sIGVuZCwgaG9tZSwgbGVmdCwgcmlnaHQsIGRvd24sIHVwXS5pbmNsdWRlcyhlLmtleUNvZGUpKSByZXR1cm5cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjb25zdCBzdGVwID0gdGhpcy5zdGVwTnVtZXJpYyB8fCAxXG4gICAgICBjb25zdCBzdGVwcyA9ICh0aGlzLm1heFZhbHVlIC0gdGhpcy5taW5WYWx1ZSkgLyBzdGVwXG4gICAgICBpZiAoW2xlZnQsIHJpZ2h0LCBkb3duLCB1cF0uaW5jbHVkZXMoZS5rZXlDb2RlKSkge1xuICAgICAgICBjb25zdCBpbmNyZWFzZSA9IHRoaXMuJHZ1ZXRpZnkucnRsID8gW2xlZnQsIHVwXSA6IFtyaWdodCwgdXBdXG4gICAgICAgIGNvbnN0IGRpcmVjdGlvbiA9IGluY3JlYXNlLmluY2x1ZGVzKGUua2V5Q29kZSkgPyAxIDogLTFcbiAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IGUuc2hpZnRLZXkgPyAzIDogKGUuY3RybEtleSA/IDIgOiAxKVxuXG4gICAgICAgIHZhbHVlID0gdmFsdWUgKyAoZGlyZWN0aW9uICogc3RlcCAqIG11bHRpcGxpZXIpXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gaG9tZSkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMubWluVmFsdWVcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBlbmQpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLm1heFZhbHVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBlLmtleUNvZGUgPT09IHBhZ2Vkb3duID8gMSA6IC0xXG4gICAgICAgIHZhbHVlID0gdmFsdWUgLSAoZGlyZWN0aW9uICogc3RlcCAqIChzdGVwcyA+IDEwMCA/IHN0ZXBzIC8gMTAgOiAxMCkpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0sXG4gICAgcm91bmRWYWx1ZSAodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgICBpZiAoIXRoaXMuc3RlcE51bWVyaWMpIHJldHVybiB2YWx1ZVxuICAgICAgLy8gRm9ybWF0IGlucHV0IHZhbHVlIHVzaW5nIHRoZSBzYW1lIG51bWJlclxuICAgICAgLy8gb2YgZGVjaW1hbHMgcGxhY2VzIGFzIGluIHRoZSBzdGVwIHByb3BcbiAgICAgIGNvbnN0IHRyaW1tZWRTdGVwID0gdGhpcy5zdGVwLnRvU3RyaW5nKCkudHJpbSgpXG4gICAgICBjb25zdCBkZWNpbWFscyA9IHRyaW1tZWRTdGVwLmluZGV4T2YoJy4nKSA+IC0xXG4gICAgICAgID8gKHRyaW1tZWRTdGVwLmxlbmd0aCAtIHRyaW1tZWRTdGVwLmluZGV4T2YoJy4nKSAtIDEpXG4gICAgICAgIDogMFxuICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5taW5WYWx1ZSAlIHRoaXMuc3RlcE51bWVyaWNcblxuICAgICAgY29uc3QgbmV3VmFsdWUgPSBNYXRoLnJvdW5kKCh2YWx1ZSAtIG9mZnNldCkgLyB0aGlzLnN0ZXBOdW1lcmljKSAqIHRoaXMuc3RlcE51bWVyaWMgKyBvZmZzZXRcblxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoTWF0aC5taW4obmV3VmFsdWUsIHRoaXMubWF4VmFsdWUpLnRvRml4ZWQoZGVjaW1hbHMpKVxuICAgIH0sXG4gIH0sXG59KVxuIl19
// Styles
import './VTextField.sass';
// Extensions
import VInput from '../VInput';
// Components
import VCounter from '../VCounter';
import VLabel from '../VLabel';
// Mixins
import Intersectable from '../../mixins/intersectable';
import Loadable from '../../mixins/loadable';
import Validatable from '../../mixins/validatable';
// Directives
import resize from '../../directives/resize';
import ripple from '../../directives/ripple';
// Utilities
import { attachedRoot } from '../../util/dom';
import { convertToUnit, keyCodes } from '../../util/helpers';
import { breaking, consoleWarn } from '../../util/console';
// Types
import mixins from '../../util/mixins';
const baseMixins = mixins(VInput, Intersectable({
    onVisible: [
        'onResize',
        'tryAutofocus',
    ],
}), Loadable);
const dirtyTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month'];
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'v-text-field',
    directives: {
        resize,
        ripple,
    },
    inheritAttrs: false,
    props: {
        appendOuterIcon: String,
        autofocus: Boolean,
        clearable: Boolean,
        clearIcon: {
            type: String,
            default: '$clear',
        },
        counter: [Boolean, Number, String],
        counterValue: Function,
        filled: Boolean,
        flat: Boolean,
        fullWidth: Boolean,
        label: String,
        outlined: Boolean,
        placeholder: String,
        prefix: String,
        prependInnerIcon: String,
        persistentPlaceholder: Boolean,
        reverse: Boolean,
        rounded: Boolean,
        shaped: Boolean,
        singleLine: Boolean,
        solo: Boolean,
        soloInverted: Boolean,
        suffix: String,
        type: {
            type: String,
            default: 'text',
        },
    },
    data: () => ({
        badInput: false,
        labelWidth: 0,
        prefixWidth: 0,
        prependWidth: 0,
        initialValue: null,
        isBooted: false,
        isClearing: false,
    }),
    computed: {
        classes() {
            return {
                ...VInput.options.computed.classes.call(this),
                'v-text-field': true,
                'v-text-field--full-width': this.fullWidth,
                'v-text-field--prefix': this.prefix,
                'v-text-field--single-line': this.isSingle,
                'v-text-field--solo': this.isSolo,
                'v-text-field--solo-inverted': this.soloInverted,
                'v-text-field--solo-flat': this.flat,
                'v-text-field--filled': this.filled,
                'v-text-field--is-booted': this.isBooted,
                'v-text-field--enclosed': this.isEnclosed,
                'v-text-field--reverse': this.reverse,
                'v-text-field--outlined': this.outlined,
                'v-text-field--placeholder': this.placeholder,
                'v-text-field--rounded': this.rounded,
                'v-text-field--shaped': this.shaped,
            };
        },
        computedColor() {
            const computedColor = Validatable.options.computed.computedColor.call(this);
            if (!this.soloInverted || !this.isFocused)
                return computedColor;
            return this.color || 'primary';
        },
        computedCounterValue() {
            if (typeof this.counterValue === 'function') {
                return this.counterValue(this.internalValue);
            }
            return [...(this.internalValue || '').toString()].length;
        },
        hasCounter() {
            return this.counter !== false && this.counter != null;
        },
        hasDetails() {
            return VInput.options.computed.hasDetails.call(this) || this.hasCounter;
        },
        internalValue: {
            get() {
                return this.lazyValue;
            },
            set(val) {
                this.lazyValue = val;
                this.$emit('input', this.lazyValue);
            },
        },
        isDirty() {
            return this.lazyValue?.toString().length > 0 || this.badInput;
        },
        isEnclosed() {
            return (this.filled ||
                this.isSolo ||
                this.outlined);
        },
        isLabelActive() {
            return this.isDirty || dirtyTypes.includes(this.type);
        },
        isSingle() {
            return (this.isSolo ||
                this.singleLine ||
                this.fullWidth ||
                // https://material.io/components/text-fields/#filled-text-field
                (this.filled && !this.hasLabel));
        },
        isSolo() {
            return this.solo || this.soloInverted;
        },
        labelPosition() {
            let offset = (this.prefix && !this.labelValue) ? this.prefixWidth : 0;
            if (this.labelValue && this.prependWidth)
                offset -= this.prependWidth;
            return (this.$vuetify.rtl === this.reverse) ? {
                left: offset,
                right: 'auto',
            } : {
                left: 'auto',
                right: offset,
            };
        },
        showLabel() {
            return this.hasLabel && !(this.isSingle && this.labelValue);
        },
        labelValue() {
            return this.isFocused || this.isLabelActive || this.persistentPlaceholder;
        },
    },
    watch: {
        // labelValue: 'setLabelWidth', // moved to mounted, see #11533
        outlined: 'setLabelWidth',
        label() {
            this.$nextTick(this.setLabelWidth);
        },
        prefix() {
            this.$nextTick(this.setPrefixWidth);
        },
        isFocused: 'updateValue',
        value(val) {
            this.lazyValue = val;
        },
    },
    created() {
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('box')) {
            breaking('box', 'filled', this);
        }
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('browser-autocomplete')) {
            breaking('browser-autocomplete', 'autocomplete', this);
        }
        /* istanbul ignore if */
        if (this.shaped && !(this.filled || this.outlined || this.isSolo)) {
            consoleWarn('shaped should be used with either filled or outlined', this);
        }
    },
    mounted() {
        // #11533
        this.$watch(() => this.labelValue, this.setLabelWidth);
        this.autofocus && this.tryAutofocus();
        requestAnimationFrame(() => {
            this.isBooted = true;
            requestAnimationFrame(() => {
                if (!this.isIntersecting) {
                    this.onResize();
                }
            });
        });
    },
    methods: {
        /** @public */
        focus() {
            this.onFocus();
        },
        /** @public */
        blur(e) {
            // https://github.com/vuetifyjs/vuetify/issues/5913
            // Safari tab order gets broken if called synchronous
            window.requestAnimationFrame(() => {
                this.$refs.input && this.$refs.input.blur();
            });
        },
        clearableCallback() {
            this.$refs.input && this.$refs.input.focus();
            this.$nextTick(() => this.internalValue = null);
        },
        genAppendSlot() {
            const slot = [];
            if (this.$slots['append-outer']) {
                slot.push(this.$slots['append-outer']);
            }
            else if (this.appendOuterIcon) {
                slot.push(this.genIcon('appendOuter'));
            }
            return this.genSlot('append', 'outer', slot);
        },
        genPrependInnerSlot() {
            const slot = [];
            if (this.$slots['prepend-inner']) {
                slot.push(this.$slots['prepend-inner']);
            }
            else if (this.prependInnerIcon) {
                slot.push(this.genIcon('prependInner'));
            }
            return this.genSlot('prepend', 'inner', slot);
        },
        genIconSlot() {
            const slot = [];
            if (this.$slots.append) {
                slot.push(this.$slots.append);
            }
            else if (this.appendIcon) {
                slot.push(this.genIcon('append'));
            }
            return this.genSlot('append', 'inner', slot);
        },
        genInputSlot() {
            const input = VInput.options.methods.genInputSlot.call(this);
            const prepend = this.genPrependInnerSlot();
            if (prepend) {
                input.children = input.children || [];
                input.children.unshift(prepend);
            }
            return input;
        },
        genClearIcon() {
            if (!this.clearable)
                return null;
            // if the text field has no content then don't display the clear icon.
            // We add an empty div because other controls depend on a ref to append inner
            if (!this.isDirty) {
                return this.genSlot('append', 'inner', [
                    this.$createElement('div'),
                ]);
            }
            return this.genSlot('append', 'inner', [
                this.genIcon('clear', this.clearableCallback),
            ]);
        },
        genCounter() {
            if (!this.hasCounter)
                return null;
            const max = this.counter === true ? this.attrs$.maxlength : this.counter;
            const props = {
                dark: this.dark,
                light: this.light,
                max,
                value: this.computedCounterValue,
            };
            return this.$scopedSlots.counter?.({ props }) ?? this.$createElement(VCounter, { props });
        },
        genControl() {
            return VInput.options.methods.genControl.call(this);
        },
        genDefaultSlot() {
            return [
                this.genFieldset(),
                this.genTextFieldSlot(),
                this.genClearIcon(),
                this.genIconSlot(),
                this.genProgress(),
            ];
        },
        genFieldset() {
            if (!this.outlined)
                return null;
            return this.$createElement('fieldset', {
                attrs: {
                    'aria-hidden': true,
                },
            }, [this.genLegend()]);
        },
        genLabel() {
            if (!this.showLabel)
                return null;
            const data = {
                props: {
                    absolute: true,
                    color: this.validationState,
                    dark: this.dark,
                    disabled: this.isDisabled,
                    focused: !this.isSingle && (this.isFocused || !!this.validationState),
                    for: this.computedId,
                    left: this.labelPosition.left,
                    light: this.light,
                    right: this.labelPosition.right,
                    value: this.labelValue,
                },
            };
            return this.$createElement(VLabel, data, this.$slots.label || this.label);
        },
        genLegend() {
            const width = !this.singleLine && (this.labelValue || this.isDirty) ? this.labelWidth : 0;
            const span = this.$createElement('span', {
                domProps: { innerHTML: '&#8203;' },
                staticClass: 'notranslate',
            });
            return this.$createElement('legend', {
                style: {
                    width: !this.isSingle ? convertToUnit(width) : undefined,
                },
            }, [span]);
        },
        genInput() {
            const listeners = Object.assign({}, this.listeners$);
            delete listeners.change; // Change should not be bound externally
            const { title, ...inputAttrs } = this.attrs$;
            return this.$createElement('input', {
                style: {},
                domProps: {
                    value: (this.type === 'number' && Object.is(this.lazyValue, -0)) ? '-0' : this.lazyValue,
                },
                attrs: {
                    ...inputAttrs,
                    autofocus: this.autofocus,
                    disabled: this.isDisabled,
                    id: this.computedId,
                    placeholder: this.persistentPlaceholder || this.isFocused || !this.hasLabel ? this.placeholder : undefined,
                    readonly: this.isReadonly,
                    type: this.type,
                },
                on: Object.assign(listeners, {
                    blur: this.onBlur,
                    input: this.onInput,
                    focus: this.onFocus,
                    keydown: this.onKeyDown,
                }),
                ref: 'input',
                directives: [{
                        name: 'resize',
                        modifiers: { quiet: true },
                        value: this.onResize,
                    }],
            });
        },
        genMessages() {
            if (!this.showDetails)
                return null;
            const messagesNode = VInput.options.methods.genMessages.call(this);
            const counterNode = this.genCounter();
            return this.$createElement('div', {
                staticClass: 'v-text-field__details',
            }, [
                messagesNode,
                counterNode,
            ]);
        },
        genTextFieldSlot() {
            return this.$createElement('div', {
                staticClass: 'v-text-field__slot',
            }, [
                this.genLabel(),
                this.prefix ? this.genAffix('prefix') : null,
                this.genInput(),
                this.suffix ? this.genAffix('suffix') : null,
            ]);
        },
        genAffix(type) {
            return this.$createElement('div', {
                class: `v-text-field__${type}`,
                ref: type,
            }, this[type]);
        },
        onBlur(e) {
            this.isFocused = false;
            e && this.$nextTick(() => this.$emit('blur', e));
        },
        onClick() {
            if (this.isFocused || this.isDisabled || !this.$refs.input)
                return;
            this.$refs.input.focus();
        },
        onFocus(e) {
            if (!this.$refs.input)
                return;
            const root = attachedRoot(this.$el);
            if (!root)
                return;
            if (root.activeElement !== this.$refs.input) {
                return this.$refs.input.focus();
            }
            if (!this.isFocused) {
                this.isFocused = true;
                e && this.$emit('focus', e);
            }
        },
        onInput(e) {
            const target = e.target;
            this.internalValue = target.value;
            this.badInput = target.validity && target.validity.badInput;
        },
        onKeyDown(e) {
            if (e.keyCode === keyCodes.enter &&
                this.lazyValue !== this.initialValue) {
                this.initialValue = this.lazyValue;
                this.$emit('change', this.initialValue);
            }
            this.$emit('keydown', e);
        },
        onMouseDown(e) {
            // Prevent input from being blurred
            if (e.target !== this.$refs.input) {
                e.preventDefault();
                e.stopPropagation();
            }
            VInput.options.methods.onMouseDown.call(this, e);
        },
        onMouseUp(e) {
            if (this.hasMouseDown)
                this.focus();
            VInput.options.methods.onMouseUp.call(this, e);
        },
        setLabelWidth() {
            if (!this.outlined)
                return;
            this.labelWidth = this.$refs.label
                ? Math.min(this.$refs.label.scrollWidth * 0.75 + 6, this.$el.offsetWidth - 24)
                : 0;
        },
        setPrefixWidth() {
            if (!this.$refs.prefix)
                return;
            this.prefixWidth = this.$refs.prefix.offsetWidth;
        },
        setPrependWidth() {
            if (!this.outlined || !this.$refs['prepend-inner'])
                return;
            this.prependWidth = this.$refs['prepend-inner'].offsetWidth;
        },
        tryAutofocus() {
            if (!this.autofocus ||
                typeof document === 'undefined' ||
                !this.$refs.input)
                return false;
            const root = attachedRoot(this.$el);
            if (!root || root.activeElement === this.$refs.input)
                return false;
            this.$refs.input.focus();
            return true;
        },
        updateValue(val) {
            // Sets validationState from validatable
            this.hasColor = val;
            if (val) {
                this.initialValue = this.lazyValue;
            }
            else if (this.initialValue !== this.lazyValue) {
                this.$emit('change', this.lazyValue);
            }
        },
        onResize() {
            this.setLabelWidth();
            this.setPrefixWidth();
            this.setPrependWidth();
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRleHRGaWVsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZUZXh0RmllbGQvVlRleHRGaWVsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxtQkFBbUIsQ0FBQTtBQUUxQixhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFBO0FBRTlCLGFBQWE7QUFDYixPQUFPLFFBQVEsTUFBTSxhQUFhLENBQUE7QUFDbEMsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFBO0FBRTlCLFNBQVM7QUFDVCxPQUFPLGFBQWEsTUFBTSw0QkFBNEIsQ0FBQTtBQUN0RCxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUM1QyxPQUFPLFdBQVcsTUFBTSwwQkFBMEIsQ0FBQTtBQUVsRCxhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0seUJBQXlCLENBQUE7QUFDNUMsT0FBTyxNQUFNLE1BQU0seUJBQXlCLENBQUE7QUFFNUMsWUFBWTtBQUNaLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzVELE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFMUQsUUFBUTtBQUNSLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBR3RDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsTUFBTSxFQUNOLGFBQWEsQ0FBQztJQUNaLFNBQVMsRUFBRTtRQUNULFVBQVU7UUFDVixjQUFjO0tBQ2Y7Q0FDRixDQUFDLEVBQ0YsUUFBUSxDQUNULENBQUE7QUFXRCxNQUFNLFVBQVUsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7QUFFdkYs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QUFHLEdBQUcsQ0FBQTtZQUVuQixJQUFJLEdBQUcsRUFBRTtnQkFDUCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUE7YUFDbkM7aUJBQU0sSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQy9DLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTthQUNyQztRQUNILENBQUM7UUFDRCxRQUFRO1lBQ04sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1lBQ3BCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUNyQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDeEIsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVlRleHRGaWVsZC5zYXNzJ1xuXG4vLyBFeHRlbnNpb25zXG5pbXBvcnQgVklucHV0IGZyb20gJy4uL1ZJbnB1dCdcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZDb3VudGVyIGZyb20gJy4uL1ZDb3VudGVyJ1xuaW1wb3J0IFZMYWJlbCBmcm9tICcuLi9WTGFiZWwnXG5cbi8vIE1peGluc1xuaW1wb3J0IEludGVyc2VjdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2ludGVyc2VjdGFibGUnXG5pbXBvcnQgTG9hZGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2xvYWRhYmxlJ1xuaW1wb3J0IFZhbGlkYXRhYmxlIGZyb20gJy4uLy4uL21peGlucy92YWxpZGF0YWJsZSdcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IHJlc2l6ZSBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL3Jlc2l6ZSdcbmltcG9ydCByaXBwbGUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yaXBwbGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHsgYXR0YWNoZWRSb290IH0gZnJvbSAnLi4vLi4vdXRpbC9kb20nXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0LCBrZXlDb2RlcyB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCB7IGJyZWFraW5nLCBjb25zb2xlV2FybiB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBWTm9kZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUvdHlwZXMnXG5cbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIFZJbnB1dCxcbiAgSW50ZXJzZWN0YWJsZSh7XG4gICAgb25WaXNpYmxlOiBbXG4gICAgICAnb25SZXNpemUnLFxuICAgICAgJ3RyeUF1dG9mb2N1cycsXG4gICAgXSxcbiAgfSksXG4gIExvYWRhYmxlLFxuKVxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBJbnN0YW5jZVR5cGU8dHlwZW9mIGJhc2VNaXhpbnM+IHtcbiAgJHJlZnM6IHtcbiAgICBsYWJlbDogSFRNTEVsZW1lbnRcbiAgICBpbnB1dDogSFRNTElucHV0RWxlbWVudFxuICAgICdwcmVwZW5kLWlubmVyJzogSFRNTEVsZW1lbnRcbiAgICBwcmVmaXg6IEhUTUxFbGVtZW50XG4gICAgc3VmZml4OiBIVE1MRWxlbWVudFxuICB9XG59XG5cbmNvbnN0IGRpcnR5VHlwZXMgPSBbJ2NvbG9yJywgJ2ZpbGUnLCAndGltZScsICdkYXRlJywgJ2RhdGV0aW1lLWxvY2FsJywgJ3dlZWsnLCAnbW9udGgnXVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQ8b3B0aW9ucz4oKS5leHRlbmQoe1xuICBuYW1lOiAndi10ZXh0LWZpZWxkJyxcblxuICBkaXJlY3RpdmVzOiB7XG4gICAgcmVzaXplLFxuICAgIHJpcHBsZSxcbiAgfSxcblxuICBpbmhlcml0QXR0cnM6IGZhbHNlLFxuXG4gIHByb3BzOiB7XG4gICAgYXBwZW5kT3V0ZXJJY29uOiBTdHJpbmcsXG4gICAgYXV0b2ZvY3VzOiBCb29sZWFuLFxuICAgIGNsZWFyYWJsZTogQm9vbGVhbixcbiAgICBjbGVhckljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckY2xlYXInLFxuICAgIH0sXG4gICAgY291bnRlcjogW0Jvb2xlYW4sIE51bWJlciwgU3RyaW5nXSxcbiAgICBjb3VudGVyVmFsdWU6IEZ1bmN0aW9uIGFzIFByb3BUeXBlPCh2YWx1ZTogYW55KSA9PiBudW1iZXI+LFxuICAgIGZpbGxlZDogQm9vbGVhbixcbiAgICBmbGF0OiBCb29sZWFuLFxuICAgIGZ1bGxXaWR0aDogQm9vbGVhbixcbiAgICBsYWJlbDogU3RyaW5nLFxuICAgIG91dGxpbmVkOiBCb29sZWFuLFxuICAgIHBsYWNlaG9sZGVyOiBTdHJpbmcsXG4gICAgcHJlZml4OiBTdHJpbmcsXG4gICAgcHJlcGVuZElubmVySWNvbjogU3RyaW5nLFxuICAgIHBlcnNpc3RlbnRQbGFjZWhvbGRlcjogQm9vbGVhbixcbiAgICByZXZlcnNlOiBCb29sZWFuLFxuICAgIHJvdW5kZWQ6IEJvb2xlYW4sXG4gICAgc2hhcGVkOiBCb29sZWFuLFxuICAgIHNpbmdsZUxpbmU6IEJvb2xlYW4sXG4gICAgc29sbzogQm9vbGVhbixcbiAgICBzb2xvSW52ZXJ0ZWQ6IEJvb2xlYW4sXG4gICAgc3VmZml4OiBTdHJpbmcsXG4gICAgdHlwZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ3RleHQnLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBiYWRJbnB1dDogZmFsc2UsXG4gICAgbGFiZWxXaWR0aDogMCxcbiAgICBwcmVmaXhXaWR0aDogMCxcbiAgICBwcmVwZW5kV2lkdGg6IDAsXG4gICAgaW5pdGlhbFZhbHVlOiBudWxsLFxuICAgIGlzQm9vdGVkOiBmYWxzZSxcbiAgICBpc0NsZWFyaW5nOiBmYWxzZSxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uVklucHV0Lm9wdGlvbnMuY29tcHV0ZWQuY2xhc3Nlcy5jYWxsKHRoaXMpLFxuICAgICAgICAndi10ZXh0LWZpZWxkJzogdHJ1ZSxcbiAgICAgICAgJ3YtdGV4dC1maWVsZC0tZnVsbC13aWR0aCc6IHRoaXMuZnVsbFdpZHRoLFxuICAgICAgICAndi10ZXh0LWZpZWxkLS1wcmVmaXgnOiB0aGlzLnByZWZpeCxcbiAgICAgICAgJ3YtdGV4dC1maWVsZC0tc2luZ2xlLWxpbmUnOiB0aGlzLmlzU2luZ2xlLFxuICAgICAgICAndi10ZXh0LWZpZWxkLS1zb2xvJzogdGhpcy5pc1NvbG8sXG4gICAgICAgICd2LXRleHQtZmllbGQtLXNvbG8taW52ZXJ0ZWQnOiB0aGlzLnNvbG9JbnZlcnRlZCxcbiAgICAgICAgJ3YtdGV4dC1maWVsZC0tc29sby1mbGF0JzogdGhpcy5mbGF0LFxuICAgICAgICAndi10ZXh0LWZpZWxkLS1maWxsZWQnOiB0aGlzLmZpbGxlZCxcbiAgICAgICAgJ3YtdGV4dC1maWVsZC0taXMtYm9vdGVkJzogdGhpcy5pc0Jvb3RlZCxcbiAgICAgICAgJ3YtdGV4dC1maWVsZC0tZW5jbG9zZWQnOiB0aGlzLmlzRW5jbG9zZWQsXG4gICAgICAgICd2LXRleHQtZmllbGQtLXJldmVyc2UnOiB0aGlzLnJldmVyc2UsXG4gICAgICAgICd2LXRleHQtZmllbGQtLW91dGxpbmVkJzogdGhpcy5vdXRsaW5lZCxcbiAgICAgICAgJ3YtdGV4dC1maWVsZC0tcGxhY2Vob2xkZXInOiB0aGlzLnBsYWNlaG9sZGVyLFxuICAgICAgICAndi10ZXh0LWZpZWxkLS1yb3VuZGVkJzogdGhpcy5yb3VuZGVkLFxuICAgICAgICAndi10ZXh0LWZpZWxkLS1zaGFwZWQnOiB0aGlzLnNoYXBlZCxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkQ29sb3IgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICBjb25zdCBjb21wdXRlZENvbG9yID0gVmFsaWRhdGFibGUub3B0aW9ucy5jb21wdXRlZC5jb21wdXRlZENvbG9yLmNhbGwodGhpcylcblxuICAgICAgaWYgKCF0aGlzLnNvbG9JbnZlcnRlZCB8fCAhdGhpcy5pc0ZvY3VzZWQpIHJldHVybiBjb21wdXRlZENvbG9yXG5cbiAgICAgIHJldHVybiB0aGlzLmNvbG9yIHx8ICdwcmltYXJ5J1xuICAgIH0sXG4gICAgY29tcHV0ZWRDb3VudGVyVmFsdWUgKCk6IG51bWJlciB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuY291bnRlclZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50ZXJWYWx1ZSh0aGlzLmludGVybmFsVmFsdWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gWy4uLih0aGlzLmludGVybmFsVmFsdWUgfHwgJycpLnRvU3RyaW5nKCldLmxlbmd0aFxuICAgIH0sXG4gICAgaGFzQ291bnRlciAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5jb3VudGVyICE9PSBmYWxzZSAmJiB0aGlzLmNvdW50ZXIgIT0gbnVsbFxuICAgIH0sXG4gICAgaGFzRGV0YWlscyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gVklucHV0Lm9wdGlvbnMuY29tcHV0ZWQuaGFzRGV0YWlscy5jYWxsKHRoaXMpIHx8IHRoaXMuaGFzQ291bnRlclxuICAgIH0sXG4gICAgaW50ZXJuYWxWYWx1ZToge1xuICAgICAgZ2V0ICgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXp5VmFsdWVcbiAgICAgIH0sXG4gICAgICBzZXQgKHZhbDogYW55KSB7XG4gICAgICAgIHRoaXMubGF6eVZhbHVlID0gdmFsXG4gICAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgdGhpcy5sYXp5VmFsdWUpXG4gICAgICB9LFxuICAgIH0sXG4gICAgaXNEaXJ0eSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5sYXp5VmFsdWU/LnRvU3RyaW5nKCkubGVuZ3RoID4gMCB8fCB0aGlzLmJhZElucHV0XG4gICAgfSxcbiAgICBpc0VuY2xvc2VkICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuZmlsbGVkIHx8XG4gICAgICAgIHRoaXMuaXNTb2xvIHx8XG4gICAgICAgIHRoaXMub3V0bGluZWRcbiAgICAgIClcbiAgICB9LFxuICAgIGlzTGFiZWxBY3RpdmUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaXNEaXJ0eSB8fCBkaXJ0eVR5cGVzLmluY2x1ZGVzKHRoaXMudHlwZSlcbiAgICB9LFxuICAgIGlzU2luZ2xlICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuaXNTb2xvIHx8XG4gICAgICAgIHRoaXMuc2luZ2xlTGluZSB8fFxuICAgICAgICB0aGlzLmZ1bGxXaWR0aCB8fFxuICAgICAgICAvLyBodHRwczovL21hdGVyaWFsLmlvL2NvbXBvbmVudHMvdGV4dC1maWVsZHMvI2ZpbGxlZC10ZXh0LWZpZWxkXG4gICAgICAgICh0aGlzLmZpbGxlZCAmJiAhdGhpcy5oYXNMYWJlbClcbiAgICAgIClcbiAgICB9LFxuICAgIGlzU29sbyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5zb2xvIHx8IHRoaXMuc29sb0ludmVydGVkXG4gICAgfSxcbiAgICBsYWJlbFBvc2l0aW9uICgpOiBSZWNvcmQ8J2xlZnQnIHwgJ3JpZ2h0Jywgc3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkPiB7XG4gICAgICBsZXQgb2Zmc2V0ID0gKHRoaXMucHJlZml4ICYmICF0aGlzLmxhYmVsVmFsdWUpID8gdGhpcy5wcmVmaXhXaWR0aCA6IDBcblxuICAgICAgaWYgKHRoaXMubGFiZWxWYWx1ZSAmJiB0aGlzLnByZXBlbmRXaWR0aCkgb2Zmc2V0IC09IHRoaXMucHJlcGVuZFdpZHRoXG5cbiAgICAgIHJldHVybiAodGhpcy4kdnVldGlmeS5ydGwgPT09IHRoaXMucmV2ZXJzZSkgPyB7XG4gICAgICAgIGxlZnQ6IG9mZnNldCxcbiAgICAgICAgcmlnaHQ6ICdhdXRvJyxcbiAgICAgIH0gOiB7XG4gICAgICAgIGxlZnQ6ICdhdXRvJyxcbiAgICAgICAgcmlnaHQ6IG9mZnNldCxcbiAgICAgIH1cbiAgICB9LFxuICAgIHNob3dMYWJlbCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5oYXNMYWJlbCAmJiAhKHRoaXMuaXNTaW5nbGUgJiYgdGhpcy5sYWJlbFZhbHVlKVxuICAgIH0sXG4gICAgbGFiZWxWYWx1ZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5pc0ZvY3VzZWQgfHwgdGhpcy5pc0xhYmVsQWN0aXZlIHx8IHRoaXMucGVyc2lzdGVudFBsYWNlaG9sZGVyXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIC8vIGxhYmVsVmFsdWU6ICdzZXRMYWJlbFdpZHRoJywgLy8gbW92ZWQgdG8gbW91bnRlZCwgc2VlICMxMTUzM1xuICAgIG91dGxpbmVkOiAnc2V0TGFiZWxXaWR0aCcsXG4gICAgbGFiZWwgKCkge1xuICAgICAgdGhpcy4kbmV4dFRpY2sodGhpcy5zZXRMYWJlbFdpZHRoKVxuICAgIH0sXG4gICAgcHJlZml4ICgpIHtcbiAgICAgIHRoaXMuJG5leHRUaWNrKHRoaXMuc2V0UHJlZml4V2lkdGgpXG4gICAgfSxcbiAgICBpc0ZvY3VzZWQ6ICd1cGRhdGVWYWx1ZScsXG4gICAgdmFsdWUgKHZhbCkge1xuICAgICAgdGhpcy5sYXp5VmFsdWUgPSB2YWxcbiAgICB9LFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHRoaXMuJGF0dHJzLmhhc093blByb3BlcnR5KCdib3gnKSkge1xuICAgICAgYnJlYWtpbmcoJ2JveCcsICdmaWxsZWQnLCB0aGlzKVxuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHRoaXMuJGF0dHJzLmhhc093blByb3BlcnR5KCdicm93c2VyLWF1dG9jb21wbGV0ZScpKSB7XG4gICAgICBicmVha2luZygnYnJvd3Nlci1hdXRvY29tcGxldGUnLCAnYXV0b2NvbXBsZXRlJywgdGhpcylcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAodGhpcy5zaGFwZWQgJiYgISh0aGlzLmZpbGxlZCB8fCB0aGlzLm91dGxpbmVkIHx8IHRoaXMuaXNTb2xvKSkge1xuICAgICAgY29uc29sZVdhcm4oJ3NoYXBlZCBzaG91bGQgYmUgdXNlZCB3aXRoIGVpdGhlciBmaWxsZWQgb3Igb3V0bGluZWQnLCB0aGlzKVxuICAgIH1cbiAgfSxcblxuICBtb3VudGVkICgpIHtcbiAgICAvLyAjMTE1MzNcbiAgICB0aGlzLiR3YXRjaCgoKSA9PiB0aGlzLmxhYmVsVmFsdWUsIHRoaXMuc2V0TGFiZWxXaWR0aClcbiAgICB0aGlzLmF1dG9mb2N1cyAmJiB0aGlzLnRyeUF1dG9mb2N1cygpXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIHRoaXMuaXNCb290ZWQgPSB0cnVlXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgICB0aGlzLm9uUmVzaXplKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICAvKiogQHB1YmxpYyAqL1xuICAgIGZvY3VzICgpIHtcbiAgICAgIHRoaXMub25Gb2N1cygpXG4gICAgfSxcbiAgICAvKiogQHB1YmxpYyAqL1xuICAgIGJsdXIgKGU/OiBFdmVudCkge1xuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZXRpZnlqcy92dWV0aWZ5L2lzc3Vlcy81OTEzXG4gICAgICAvLyBTYWZhcmkgdGFiIG9yZGVyIGdldHMgYnJva2VuIGlmIGNhbGxlZCBzeW5jaHJvbm91c1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuJHJlZnMuaW5wdXQgJiYgdGhpcy4kcmVmcy5pbnB1dC5ibHVyKClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbGVhcmFibGVDYWxsYmFjayAoKSB7XG4gICAgICB0aGlzLiRyZWZzLmlucHV0ICYmIHRoaXMuJHJlZnMuaW5wdXQuZm9jdXMoKVxuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gdGhpcy5pbnRlcm5hbFZhbHVlID0gbnVsbClcbiAgICB9LFxuICAgIGdlbkFwcGVuZFNsb3QgKCkge1xuICAgICAgY29uc3Qgc2xvdCA9IFtdXG5cbiAgICAgIGlmICh0aGlzLiRzbG90c1snYXBwZW5kLW91dGVyJ10pIHtcbiAgICAgICAgc2xvdC5wdXNoKHRoaXMuJHNsb3RzWydhcHBlbmQtb3V0ZXInXSBhcyBWTm9kZVtdKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmFwcGVuZE91dGVySWNvbikge1xuICAgICAgICBzbG90LnB1c2godGhpcy5nZW5JY29uKCdhcHBlbmRPdXRlcicpKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZW5TbG90KCdhcHBlbmQnLCAnb3V0ZXInLCBzbG90KVxuICAgIH0sXG4gICAgZ2VuUHJlcGVuZElubmVyU2xvdCAoKSB7XG4gICAgICBjb25zdCBzbG90ID0gW11cblxuICAgICAgaWYgKHRoaXMuJHNsb3RzWydwcmVwZW5kLWlubmVyJ10pIHtcbiAgICAgICAgc2xvdC5wdXNoKHRoaXMuJHNsb3RzWydwcmVwZW5kLWlubmVyJ10gYXMgVk5vZGVbXSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmVwZW5kSW5uZXJJY29uKSB7XG4gICAgICAgIHNsb3QucHVzaCh0aGlzLmdlbkljb24oJ3ByZXBlbmRJbm5lcicpKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZW5TbG90KCdwcmVwZW5kJywgJ2lubmVyJywgc2xvdClcbiAgICB9LFxuICAgIGdlbkljb25TbG90ICgpIHtcbiAgICAgIGNvbnN0IHNsb3QgPSBbXVxuXG4gICAgICBpZiAodGhpcy4kc2xvdHMuYXBwZW5kKSB7XG4gICAgICAgIHNsb3QucHVzaCh0aGlzLiRzbG90cy5hcHBlbmQgYXMgVk5vZGVbXSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5hcHBlbmRJY29uKSB7XG4gICAgICAgIHNsb3QucHVzaCh0aGlzLmdlbkljb24oJ2FwcGVuZCcpKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZW5TbG90KCdhcHBlbmQnLCAnaW5uZXInLCBzbG90KVxuICAgIH0sXG4gICAgZ2VuSW5wdXRTbG90ICgpIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gVklucHV0Lm9wdGlvbnMubWV0aG9kcy5nZW5JbnB1dFNsb3QuY2FsbCh0aGlzKVxuXG4gICAgICBjb25zdCBwcmVwZW5kID0gdGhpcy5nZW5QcmVwZW5kSW5uZXJTbG90KClcblxuICAgICAgaWYgKHByZXBlbmQpIHtcbiAgICAgICAgaW5wdXQuY2hpbGRyZW4gPSBpbnB1dC5jaGlsZHJlbiB8fCBbXVxuICAgICAgICBpbnB1dC5jaGlsZHJlbi51bnNoaWZ0KHByZXBlbmQpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpbnB1dFxuICAgIH0sXG4gICAgZ2VuQ2xlYXJJY29uICgpIHtcbiAgICAgIGlmICghdGhpcy5jbGVhcmFibGUpIHJldHVybiBudWxsXG5cbiAgICAgIC8vIGlmIHRoZSB0ZXh0IGZpZWxkIGhhcyBubyBjb250ZW50IHRoZW4gZG9uJ3QgZGlzcGxheSB0aGUgY2xlYXIgaWNvbi5cbiAgICAgIC8vIFdlIGFkZCBhbiBlbXB0eSBkaXYgYmVjYXVzZSBvdGhlciBjb250cm9scyBkZXBlbmQgb24gYSByZWYgdG8gYXBwZW5kIGlubmVyXG4gICAgICBpZiAoIXRoaXMuaXNEaXJ0eSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZW5TbG90KCdhcHBlbmQnLCAnaW5uZXInLCBbXG4gICAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIF0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmdlblNsb3QoJ2FwcGVuZCcsICdpbm5lcicsIFtcbiAgICAgICAgdGhpcy5nZW5JY29uKCdjbGVhcicsIHRoaXMuY2xlYXJhYmxlQ2FsbGJhY2spLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkNvdW50ZXIgKCkge1xuICAgICAgaWYgKCF0aGlzLmhhc0NvdW50ZXIpIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IG1heCA9IHRoaXMuY291bnRlciA9PT0gdHJ1ZSA/IHRoaXMuYXR0cnMkLm1heGxlbmd0aCA6IHRoaXMuY291bnRlclxuXG4gICAgICBjb25zdCBwcm9wcyA9IHtcbiAgICAgICAgZGFyazogdGhpcy5kYXJrLFxuICAgICAgICBsaWdodDogdGhpcy5saWdodCxcbiAgICAgICAgbWF4LFxuICAgICAgICB2YWx1ZTogdGhpcy5jb21wdXRlZENvdW50ZXJWYWx1ZSxcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJHNjb3BlZFNsb3RzLmNvdW50ZXI/Lih7IHByb3BzIH0pID8/IHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkNvdW50ZXIsIHsgcHJvcHMgfSlcbiAgICB9LFxuICAgIGdlbkNvbnRyb2wgKCkge1xuICAgICAgcmV0dXJuIFZJbnB1dC5vcHRpb25zLm1ldGhvZHMuZ2VuQ29udHJvbC5jYWxsKHRoaXMpXG4gICAgfSxcbiAgICBnZW5EZWZhdWx0U2xvdCAoKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB0aGlzLmdlbkZpZWxkc2V0KCksXG4gICAgICAgIHRoaXMuZ2VuVGV4dEZpZWxkU2xvdCgpLFxuICAgICAgICB0aGlzLmdlbkNsZWFySWNvbigpLFxuICAgICAgICB0aGlzLmdlbkljb25TbG90KCksXG4gICAgICAgIHRoaXMuZ2VuUHJvZ3Jlc3MoKSxcbiAgICAgIF1cbiAgICB9LFxuICAgIGdlbkZpZWxkc2V0ICgpIHtcbiAgICAgIGlmICghdGhpcy5vdXRsaW5lZCkgcmV0dXJuIG51bGxcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2ZpZWxkc2V0Jywge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LCBbdGhpcy5nZW5MZWdlbmQoKV0pXG4gICAgfSxcbiAgICBnZW5MYWJlbCAoKSB7XG4gICAgICBpZiAoIXRoaXMuc2hvd0xhYmVsKSByZXR1cm4gbnVsbFxuXG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGFic29sdXRlOiB0cnVlLFxuICAgICAgICAgIGNvbG9yOiB0aGlzLnZhbGlkYXRpb25TdGF0ZSxcbiAgICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuaXNEaXNhYmxlZCxcbiAgICAgICAgICBmb2N1c2VkOiAhdGhpcy5pc1NpbmdsZSAmJiAodGhpcy5pc0ZvY3VzZWQgfHwgISF0aGlzLnZhbGlkYXRpb25TdGF0ZSksXG4gICAgICAgICAgZm9yOiB0aGlzLmNvbXB1dGVkSWQsXG4gICAgICAgICAgbGVmdDogdGhpcy5sYWJlbFBvc2l0aW9uLmxlZnQsXG4gICAgICAgICAgbGlnaHQ6IHRoaXMubGlnaHQsXG4gICAgICAgICAgcmlnaHQ6IHRoaXMubGFiZWxQb3NpdGlvbi5yaWdodCxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5sYWJlbFZhbHVlLFxuICAgICAgICB9LFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWTGFiZWwsIGRhdGEsIHRoaXMuJHNsb3RzLmxhYmVsIHx8IHRoaXMubGFiZWwpXG4gICAgfSxcbiAgICBnZW5MZWdlbmQgKCkge1xuICAgICAgY29uc3Qgd2lkdGggPSAhdGhpcy5zaW5nbGVMaW5lICYmICh0aGlzLmxhYmVsVmFsdWUgfHwgdGhpcy5pc0RpcnR5KSA/IHRoaXMubGFiZWxXaWR0aCA6IDBcbiAgICAgIGNvbnN0IHNwYW4gPSB0aGlzLiRjcmVhdGVFbGVtZW50KCdzcGFuJywge1xuICAgICAgICBkb21Qcm9wczogeyBpbm5lckhUTUw6ICcmIzgyMDM7JyB9LFxuICAgICAgICBzdGF0aWNDbGFzczogJ25vdHJhbnNsYXRlJyxcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdsZWdlbmQnLCB7XG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgd2lkdGg6ICF0aGlzLmlzU2luZ2xlID8gY29udmVydFRvVW5pdCh3aWR0aCkgOiB1bmRlZmluZWQsXG4gICAgICAgIH0sXG4gICAgICB9LCBbc3Bhbl0pXG4gICAgfSxcbiAgICBnZW5JbnB1dCAoKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lcnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmxpc3RlbmVycyQpXG4gICAgICBkZWxldGUgbGlzdGVuZXJzLmNoYW5nZSAvLyBDaGFuZ2Ugc2hvdWxkIG5vdCBiZSBib3VuZCBleHRlcm5hbGx5XG4gICAgICBjb25zdCB7IHRpdGxlLCAuLi5pbnB1dEF0dHJzIH0gPSB0aGlzLmF0dHJzJFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XG4gICAgICAgIHN0eWxlOiB7fSxcbiAgICAgICAgZG9tUHJvcHM6IHtcbiAgICAgICAgICB2YWx1ZTogKHRoaXMudHlwZSA9PT0gJ251bWJlcicgJiYgT2JqZWN0LmlzKHRoaXMubGF6eVZhbHVlLCAtMCkpID8gJy0wJyA6IHRoaXMubGF6eVZhbHVlLFxuICAgICAgICB9LFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIC4uLmlucHV0QXR0cnMsXG4gICAgICAgICAgYXV0b2ZvY3VzOiB0aGlzLmF1dG9mb2N1cyxcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5pc0Rpc2FibGVkLFxuICAgICAgICAgIGlkOiB0aGlzLmNvbXB1dGVkSWQsXG4gICAgICAgICAgcGxhY2Vob2xkZXI6IHRoaXMucGVyc2lzdGVudFBsYWNlaG9sZGVyIHx8IHRoaXMuaXNGb2N1c2VkIHx8ICF0aGlzLmhhc0xhYmVsID8gdGhpcy5wbGFjZWhvbGRlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgICByZWFkb25seTogdGhpcy5pc1JlYWRvbmx5LFxuICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IE9iamVjdC5hc3NpZ24obGlzdGVuZXJzLCB7XG4gICAgICAgICAgYmx1cjogdGhpcy5vbkJsdXIsXG4gICAgICAgICAgaW5wdXQ6IHRoaXMub25JbnB1dCxcbiAgICAgICAgICBmb2N1czogdGhpcy5vbkZvY3VzLFxuICAgICAgICAgIGtleWRvd246IHRoaXMub25LZXlEb3duLFxuICAgICAgICB9KSxcbiAgICAgICAgcmVmOiAnaW5wdXQnLFxuICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgIG5hbWU6ICdyZXNpemUnLFxuICAgICAgICAgIG1vZGlmaWVyczogeyBxdWlldDogdHJ1ZSB9LFxuICAgICAgICAgIHZhbHVlOiB0aGlzLm9uUmVzaXplLFxuICAgICAgICB9XSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5NZXNzYWdlcyAoKSB7XG4gICAgICBpZiAoIXRoaXMuc2hvd0RldGFpbHMpIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IG1lc3NhZ2VzTm9kZSA9IFZJbnB1dC5vcHRpb25zLm1ldGhvZHMuZ2VuTWVzc2FnZXMuY2FsbCh0aGlzKVxuICAgICAgY29uc3QgY291bnRlck5vZGUgPSB0aGlzLmdlbkNvdW50ZXIoKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtdGV4dC1maWVsZF9fZGV0YWlscycsXG4gICAgICB9LCBbXG4gICAgICAgIG1lc3NhZ2VzTm9kZSxcbiAgICAgICAgY291bnRlck5vZGUsXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuVGV4dEZpZWxkU2xvdCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtdGV4dC1maWVsZF9fc2xvdCcsXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuTGFiZWwoKSxcbiAgICAgICAgdGhpcy5wcmVmaXggPyB0aGlzLmdlbkFmZml4KCdwcmVmaXgnKSA6IG51bGwsXG4gICAgICAgIHRoaXMuZ2VuSW5wdXQoKSxcbiAgICAgICAgdGhpcy5zdWZmaXggPyB0aGlzLmdlbkFmZml4KCdzdWZmaXgnKSA6IG51bGwsXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuQWZmaXggKHR5cGU6ICdwcmVmaXgnIHwgJ3N1ZmZpeCcpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGNsYXNzOiBgdi10ZXh0LWZpZWxkX18ke3R5cGV9YCxcbiAgICAgICAgcmVmOiB0eXBlLFxuICAgICAgfSwgdGhpc1t0eXBlXSlcbiAgICB9LFxuICAgIG9uQmx1ciAoZT86IEV2ZW50KSB7XG4gICAgICB0aGlzLmlzRm9jdXNlZCA9IGZhbHNlXG4gICAgICBlICYmIHRoaXMuJG5leHRUaWNrKCgpID0+IHRoaXMuJGVtaXQoJ2JsdXInLCBlKSlcbiAgICB9LFxuICAgIG9uQ2xpY2sgKCkge1xuICAgICAgaWYgKHRoaXMuaXNGb2N1c2VkIHx8IHRoaXMuaXNEaXNhYmxlZCB8fCAhdGhpcy4kcmVmcy5pbnB1dCkgcmV0dXJuXG5cbiAgICAgIHRoaXMuJHJlZnMuaW5wdXQuZm9jdXMoKVxuICAgIH0sXG4gICAgb25Gb2N1cyAoZT86IEV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuJHJlZnMuaW5wdXQpIHJldHVyblxuXG4gICAgICBjb25zdCByb290ID0gYXR0YWNoZWRSb290KHRoaXMuJGVsKVxuICAgICAgaWYgKCFyb290KSByZXR1cm5cblxuICAgICAgaWYgKHJvb3QuYWN0aXZlRWxlbWVudCAhPT0gdGhpcy4kcmVmcy5pbnB1dCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kcmVmcy5pbnB1dC5mb2N1cygpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc0ZvY3VzZWQpIHtcbiAgICAgICAgdGhpcy5pc0ZvY3VzZWQgPSB0cnVlXG4gICAgICAgIGUgJiYgdGhpcy4kZW1pdCgnZm9jdXMnLCBlKVxuICAgICAgfVxuICAgIH0sXG4gICAgb25JbnB1dCAoZTogRXZlbnQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHRhcmdldC52YWx1ZVxuICAgICAgdGhpcy5iYWRJbnB1dCA9IHRhcmdldC52YWxpZGl0eSAmJiB0YXJnZXQudmFsaWRpdHkuYmFkSW5wdXRcbiAgICB9LFxuICAgIG9uS2V5RG93biAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgaWYgKFxuICAgICAgICBlLmtleUNvZGUgPT09IGtleUNvZGVzLmVudGVyICYmXG4gICAgICAgIHRoaXMubGF6eVZhbHVlICE9PSB0aGlzLmluaXRpYWxWYWx1ZVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbFZhbHVlID0gdGhpcy5sYXp5VmFsdWVcbiAgICAgICAgdGhpcy4kZW1pdCgnY2hhbmdlJywgdGhpcy5pbml0aWFsVmFsdWUpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGVtaXQoJ2tleWRvd24nLCBlKVxuICAgIH0sXG4gICAgb25Nb3VzZURvd24gKGU6IEV2ZW50KSB7XG4gICAgICAvLyBQcmV2ZW50IGlucHV0IGZyb20gYmVpbmcgYmx1cnJlZFxuICAgICAgaWYgKGUudGFyZ2V0ICE9PSB0aGlzLiRyZWZzLmlucHV0KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9XG5cbiAgICAgIFZJbnB1dC5vcHRpb25zLm1ldGhvZHMub25Nb3VzZURvd24uY2FsbCh0aGlzLCBlKVxuICAgIH0sXG4gICAgb25Nb3VzZVVwIChlOiBFdmVudCkge1xuICAgICAgaWYgKHRoaXMuaGFzTW91c2VEb3duKSB0aGlzLmZvY3VzKClcblxuICAgICAgVklucHV0Lm9wdGlvbnMubWV0aG9kcy5vbk1vdXNlVXAuY2FsbCh0aGlzLCBlKVxuICAgIH0sXG4gICAgc2V0TGFiZWxXaWR0aCAoKSB7XG4gICAgICBpZiAoIXRoaXMub3V0bGluZWQpIHJldHVyblxuXG4gICAgICB0aGlzLmxhYmVsV2lkdGggPSB0aGlzLiRyZWZzLmxhYmVsXG4gICAgICAgID8gTWF0aC5taW4odGhpcy4kcmVmcy5sYWJlbC5zY3JvbGxXaWR0aCAqIDAuNzUgKyA2LCAodGhpcy4kZWwgYXMgSFRNTEVsZW1lbnQpLm9mZnNldFdpZHRoIC0gMjQpXG4gICAgICAgIDogMFxuICAgIH0sXG4gICAgc2V0UHJlZml4V2lkdGggKCkge1xuICAgICAgaWYgKCF0aGlzLiRyZWZzLnByZWZpeCkgcmV0dXJuXG5cbiAgICAgIHRoaXMucHJlZml4V2lkdGggPSB0aGlzLiRyZWZzLnByZWZpeC5vZmZzZXRXaWR0aFxuICAgIH0sXG4gICAgc2V0UHJlcGVuZFdpZHRoICgpIHtcbiAgICAgIGlmICghdGhpcy5vdXRsaW5lZCB8fCAhdGhpcy4kcmVmc1sncHJlcGVuZC1pbm5lciddKSByZXR1cm5cblxuICAgICAgdGhpcy5wcmVwZW5kV2lkdGggPSB0aGlzLiRyZWZzWydwcmVwZW5kLWlubmVyJ10ub2Zmc2V0V2lkdGhcbiAgICB9LFxuICAgIHRyeUF1dG9mb2N1cyAoKSB7XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLmF1dG9mb2N1cyB8fFxuICAgICAgICB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgICF0aGlzLiRyZWZzLmlucHV0KSByZXR1cm4gZmFsc2VcblxuICAgICAgY29uc3Qgcm9vdCA9IGF0dGFjaGVkUm9vdCh0aGlzLiRlbClcbiAgICAgIGlmICghcm9vdCB8fCByb290LmFjdGl2ZUVsZW1lbnQgPT09IHRoaXMuJHJlZnMuaW5wdXQpIHJldHVybiBmYWxzZVxuXG4gICAgICB0aGlzLiRyZWZzLmlucHV0LmZvY3VzKClcblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICAgIHVwZGF0ZVZhbHVlICh2YWw6IGJvb2xlYW4pIHtcbiAgICAgIC8vIFNldHMgdmFsaWRhdGlvblN0YXRlIGZyb20gdmFsaWRhdGFibGVcbiAgICAgIHRoaXMuaGFzQ29sb3IgPSB2YWxcblxuICAgICAgaWYgKHZhbCkge1xuICAgICAgICB0aGlzLmluaXRpYWxWYWx1ZSA9IHRoaXMubGF6eVZhbHVlXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5pdGlhbFZhbHVlICE9PSB0aGlzLmxhenlWYWx1ZSkge1xuICAgICAgICB0aGlzLiRlbWl0KCdjaGFuZ2UnLCB0aGlzLmxhenlWYWx1ZSlcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uUmVzaXplICgpIHtcbiAgICAgIHRoaXMuc2V0TGFiZWxXaWR0aCgpXG4gICAgICB0aGlzLnNldFByZWZpeFdpZHRoKClcbiAgICAgIHRoaXMuc2V0UHJlcGVuZFdpZHRoKClcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==
// Components
import VInput from '../../components/VInput';
// Mixins
import Rippleable from '../rippleable';
import Comparable from '../comparable';
// Utilities
import mixins from '../../util/mixins';
export function prevent(e) {
    e.preventDefault();
}
/* @vue/component */
export default mixins(VInput, Rippleable, Comparable).extend({
    name: 'selectable',
    model: {
        prop: 'inputValue',
        event: 'change',
    },
    props: {
        id: String,
        inputValue: null,
        falseValue: null,
        trueValue: null,
        multiple: {
            type: Boolean,
            default: null,
        },
        label: String,
    },
    data() {
        return {
            hasColor: this.inputValue,
            lazyValue: this.inputValue,
        };
    },
    computed: {
        computedColor() {
            if (!this.isActive)
                return undefined;
            if (this.color)
                return this.color;
            if (this.isDark && !this.appIsDark)
                return 'white';
            return 'primary';
        },
        isMultiple() {
            return this.multiple === true || (this.multiple === null && Array.isArray(this.internalValue));
        },
        isActive() {
            const value = this.value;
            const input = this.internalValue;
            if (this.isMultiple) {
                if (!Array.isArray(input))
                    return false;
                return input.some(item => this.valueComparator(item, value));
            }
            if (this.trueValue === undefined || this.falseValue === undefined) {
                return value
                    ? this.valueComparator(value, input)
                    : Boolean(input);
            }
            return this.valueComparator(input, this.trueValue);
        },
        isDirty() {
            return this.isActive;
        },
        rippleState() {
            return !this.isDisabled && !this.validationState
                ? undefined
                : this.validationState;
        },
    },
    watch: {
        inputValue(val) {
            this.lazyValue = val;
            this.hasColor = val;
        },
    },
    methods: {
        genLabel() {
            const label = VInput.options.methods.genLabel.call(this);
            if (!label)
                return label;
            label.data.on = {
                // Label shouldn't cause the input to focus
                click: prevent,
            };
            return label;
        },
        genInput(type, attrs) {
            return this.$createElement('input', {
                attrs: Object.assign({
                    'aria-checked': this.isActive.toString(),
                    disabled: this.isDisabled,
                    id: this.computedId,
                    role: type,
                    type,
                }, attrs),
                domProps: {
                    value: this.value,
                    checked: this.isActive,
                },
                on: {
                    blur: this.onBlur,
                    change: this.onChange,
                    focus: this.onFocus,
                    keydown: this.onKeydown,
                    click: prevent,
                },
                ref: 'input',
            });
        },
        onClick(e) {
            this.onChange();
            this.$emit('click', e);
        },
        onChange() {
            if (!this.isInteractive)
                return;
            const value = this.value;
            let input = this.internalValue;
            if (this.isMultiple) {
                if (!Array.isArray(input)) {
                    input = [];
                }
                const length = input.length;
                input = input.filter((item) => !this.valueComparator(item, value));
                if (input.length === length) {
                    input.push(value);
                }
            }
            else if (this.trueValue !== undefined && this.falseValue !== undefined) {
                input = this.valueComparator(input, this.trueValue) ? this.falseValue : this.trueValue;
            }
            else if (value) {
                input = this.valueComparator(input, value) ? null : value;
            }
            else {
                input = !input;
            }
            this.validate(true, input);
            this.internalValue = input;
            this.hasColor = input;
        },
        onFocus(e) {
            this.isFocused = true;
            this.$emit('focus', e);
        },
        onBlur(e) {
            this.isFocused = false;
            this.$emit('blur', e);
        },
        /** @abstract */
        onKeydown(e) { },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL3NlbGVjdGFibGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLFNBQVM7QUFDVCxPQUFPLFVBQVUsTUFBTSxlQUFlLENBQUE7QUFDdEMsT0FBTyxVQUFVLE1BQU0sZUFBZSxDQUFBO0FBRXRDLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUV0QyxNQUFNLFVBQVUsT0FBTyxDQUFFLENBQVE7SUFDL0IsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO0FBQ3BCLENBQUM7QUFFRCxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLE1BQU0sRUFDTixVQUFVLEVBQ1YsVUFBVSxDQUNYLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLFlBQVk7SUFFbEIsS0FBSyxFQUFFO1FBQ0wsSUFBSSxFQUFFLFlBQVk7UUFDbEIsS0FBSyxFQUFFLFFBQVE7S0FDaEI7SUFFRCxLQUFLLEVBQUU7UUFDTCxFQUFFLEVBQUUsTUFBTTtRQUNWLFVBQVUsRUFBRSxJQUFXO1FBQ3ZCLFVBQVUsRUFBRSxJQUFXO1FBQ3ZCLFNBQVMsRUFBRSxJQUFXO1FBQ3RCLFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUk7U0FDZDtRQUNELEtBQUssRUFBRSxNQUFNO0tBQ2Q7SUFFRCxJQUFJO1FBQ0YsT0FBTztZQUNMLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUN6QixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDM0IsQ0FBQTtJQUNILENBQUM7SUFFRCxRQUFRLEVBQUU7UUFDUixhQUFhO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU8sU0FBUyxDQUFBO1lBQ3BDLElBQUksSUFBSSxDQUFDLEtB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QUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFBO2FBQ3ZGO2lCQUFNLElBQUksS0FBSyxFQUFFO2dCQUNoQixLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO2FBQzFEO2lCQUFNO2dCQUNMLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQTthQUNmO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUE7WUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7UUFDdkIsQ0FBQztRQUNELE9BQU8sQ0FBRSxDQUFhO1lBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO1lBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLENBQUM7UUFDRCxNQUFNLENBQUUsQ0FBYTtZQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtZQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUN2QixDQUFDO1FBQ0QsZ0JBQWdCO1FBQ2hCLFNBQVMsQ0FBRSxDQUFRLElBQUcsQ0FBQztLQUN4QjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvbXBvbmVudHNcbmltcG9ydCBWSW5wdXQgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9WSW5wdXQnXG5cbi8vIE1peGluc1xuaW1wb3J0IFJpcHBsZWFibGUgZnJvbSAnLi4vcmlwcGxlYWJsZSdcbmltcG9ydCBDb21wYXJhYmxlIGZyb20gJy4uL2NvbXBhcmFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXZlbnQgKGU6IEV2ZW50KSB7XG4gIGUucHJldmVudERlZmF1bHQoKVxufVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBWSW5wdXQsXG4gIFJpcHBsZWFibGUsXG4gIENvbXBhcmFibGVcbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3NlbGVjdGFibGUnLFxuXG4gIG1vZGVsOiB7XG4gICAgcHJvcDogJ2lucHV0VmFsdWUnLFxuICAgIGV2ZW50OiAnY2hhbmdlJyxcbiAgfSxcblxuICBwcm9wczoge1xuICAgIGlkOiBTdHJpbmcsXG4gICAgaW5wdXRWYWx1ZTogbnVsbCBhcyBhbnksXG4gICAgZmFsc2VWYWx1ZTogbnVsbCBhcyBhbnksXG4gICAgdHJ1ZVZhbHVlOiBudWxsIGFzIGFueSxcbiAgICBtdWx0aXBsZToge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBsYWJlbDogU3RyaW5nLFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYXNDb2xvcjogdGhpcy5pbnB1dFZhbHVlLFxuICAgICAgbGF6eVZhbHVlOiB0aGlzLmlucHV0VmFsdWUsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY29tcHV0ZWRDb2xvciAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgaWYgKHRoaXMuY29sb3IpIHJldHVybiB0aGlzLmNvbG9yXG4gICAgICBpZiAodGhpcy5pc0RhcmsgJiYgIXRoaXMuYXBwSXNEYXJrKSByZXR1cm4gJ3doaXRlJ1xuICAgICAgcmV0dXJuICdwcmltYXJ5J1xuICAgIH0sXG4gICAgaXNNdWx0aXBsZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBsZSA9PT0gdHJ1ZSB8fCAodGhpcy5tdWx0aXBsZSA9PT0gbnVsbCAmJiBBcnJheS5pc0FycmF5KHRoaXMuaW50ZXJuYWxWYWx1ZSkpXG4gICAgfSxcbiAgICBpc0FjdGl2ZSAoKTogYm9vbGVhbiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmFsdWVcbiAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy5pbnRlcm5hbFZhbHVlXG5cbiAgICAgIGlmICh0aGlzLmlzTXVsdGlwbGUpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgcmV0dXJuIGlucHV0LnNvbWUoaXRlbSA9PiB0aGlzLnZhbHVlQ29tcGFyYXRvcihpdGVtLCB2YWx1ZSkpXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnRydWVWYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuZmFsc2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgID8gdGhpcy52YWx1ZUNvbXBhcmF0b3IodmFsdWUsIGlucHV0KVxuICAgICAgICAgIDogQm9vbGVhbihpbnB1dClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMudmFsdWVDb21wYXJhdG9yKGlucHV0LCB0aGlzLnRydWVWYWx1ZSlcbiAgICB9LFxuICAgIGlzRGlydHkgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaXNBY3RpdmVcbiAgICB9LFxuICAgIHJpcHBsZVN0YXRlICgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgcmV0dXJuICF0aGlzLmlzRGlzYWJsZWQgJiYgIXRoaXMudmFsaWRhdGlvblN0YXRlXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogdGhpcy52YWxpZGF0aW9uU3RhdGVcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgaW5wdXRWYWx1ZSAodmFsKSB7XG4gICAgICB0aGlzLmxhenlWYWx1ZSA9IHZhbFxuICAgICAgdGhpcy5oYXNDb2xvciA9IHZhbFxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkxhYmVsICgpIHtcbiAgICAgIGNvbnN0IGxhYmVsID0gVklucHV0Lm9wdGlvbnMubWV0aG9kcy5nZW5MYWJlbC5jYWxsKHRoaXMpXG5cbiAgICAgIGlmICghbGFiZWwpIHJldHVybiBsYWJlbFxuXG4gICAgICBsYWJlbCEuZGF0YSEub24gPSB7XG4gICAgICAgIC8vIExhYmVsIHNob3VsZG4ndCBjYXVzZSB0aGUgaW5wdXQgdG8gZm9jdXNcbiAgICAgICAgY2xpY2s6IHByZXZlbnQsXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsYWJlbFxuICAgIH0sXG4gICAgZ2VuSW5wdXQgKHR5cGU6IHN0cmluZywgYXR0cnM6IG9iamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuICAgICAgICBhdHRyczogT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgJ2FyaWEtY2hlY2tlZCc6IHRoaXMuaXNBY3RpdmUudG9TdHJpbmcoKSxcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5pc0Rpc2FibGVkLFxuICAgICAgICAgIGlkOiB0aGlzLmNvbXB1dGVkSWQsXG4gICAgICAgICAgcm9sZTogdHlwZSxcbiAgICAgICAgICB0eXBlLFxuICAgICAgICB9LCBhdHRycyksXG4gICAgICAgIGRvbVByb3BzOiB7XG4gICAgICAgICAgdmFsdWU6IHRoaXMudmFsdWUsXG4gICAgICAgICAgY2hlY2tlZDogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBibHVyOiB0aGlzLm9uQmx1cixcbiAgICAgICAgICBjaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgZm9jdXM6IHRoaXMub25Gb2N1cyxcbiAgICAgICAgICBrZXlkb3duOiB0aGlzLm9uS2V5ZG93bixcbiAgICAgICAgICBjbGljazogcHJldmVudCxcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAnaW5wdXQnLFxuICAgICAgfSlcbiAgICB9LFxuICAgIG9uQ2xpY2sgKGU6IEV2ZW50KSB7XG4gICAgICB0aGlzLm9uQ2hhbmdlKClcbiAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgZSlcbiAgICB9LFxuICAgIG9uQ2hhbmdlICgpIHtcbiAgICAgIGlmICghdGhpcy5pc0ludGVyYWN0aXZlKSByZXR1cm5cblxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnZhbHVlXG4gICAgICBsZXQgaW5wdXQgPSB0aGlzLmludGVybmFsVmFsdWVcblxuICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgICAgaW5wdXQgPSBbXVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaW5wdXQubGVuZ3RoXG5cbiAgICAgICAgaW5wdXQgPSBpbnB1dC5maWx0ZXIoKGl0ZW06IGFueSkgPT4gIXRoaXMudmFsdWVDb21wYXJhdG9yKGl0ZW0sIHZhbHVlKSlcblxuICAgICAgICBpZiAoaW5wdXQubGVuZ3RoID09PSBsZW5ndGgpIHtcbiAgICAgICAgICBpbnB1dC5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHJ1ZVZhbHVlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5mYWxzZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaW5wdXQgPSB0aGlzLnZhbHVlQ29tcGFyYXRvcihpbnB1dCwgdGhpcy50cnVlVmFsdWUpID8gdGhpcy5mYWxzZVZhbHVlIDogdGhpcy50cnVlVmFsdWVcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgaW5wdXQgPSB0aGlzLnZhbHVlQ29tcGFyYXRvcihpbnB1dCwgdmFsdWUpID8gbnVsbCA6IHZhbHVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnB1dCA9ICFpbnB1dFxuICAgICAgfVxuXG4gICAgICB0aGlzLnZhbGlkYXRlKHRydWUsIGlucHV0KVxuICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlID0gaW5wdXRcbiAgICAgIHRoaXMuaGFzQ29sb3IgPSBpbnB1dFxuICAgIH0sXG4gICAgb25Gb2N1cyAoZTogRm9jdXNFdmVudCkge1xuICAgICAgdGhpcy5pc0ZvY3VzZWQgPSB0cnVlXG4gICAgICB0aGlzLiRlbWl0KCdmb2N1cycsIGUpXG4gICAgfSxcbiAgICBvbkJsdXIgKGU6IEZvY3VzRXZlbnQpIHtcbiAgICAgIHRoaXMuaXNGb2N1c2VkID0gZmFsc2VcbiAgICAgIHRoaXMuJGVtaXQoJ2JsdXInLCBlKVxuICAgIH0sXG4gICAgLyoqIEBhYnN0cmFjdCAqL1xuICAgIG9uS2V5ZG93biAoZTogRXZlbnQpIHt9LFxuICB9LFxufSlcbiJdfQ==
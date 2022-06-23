// Mixins
import Colorable from '../colorable';
import Themeable from '../themeable';
import { inject as RegistrableInject } from '../registrable';
// Utilities
import { deepEqual } from '../../util/helpers';
import { consoleError } from '../../util/console';
import mixins from '../../util/mixins';
const baseMixins = mixins(Colorable, RegistrableInject('form'), Themeable);
/* @vue/component */
export default baseMixins.extend({
    name: 'validatable',
    props: {
        disabled: Boolean,
        error: Boolean,
        errorCount: {
            type: [Number, String],
            default: 1,
        },
        errorMessages: {
            type: [String, Array],
            default: () => [],
        },
        messages: {
            type: [String, Array],
            default: () => [],
        },
        readonly: Boolean,
        rules: {
            type: Array,
            default: () => [],
        },
        success: Boolean,
        successMessages: {
            type: [String, Array],
            default: () => [],
        },
        validateOnBlur: Boolean,
        value: { required: false },
    },
    data() {
        return {
            errorBucket: [],
            hasColor: false,
            hasFocused: false,
            hasInput: false,
            isFocused: false,
            isResetting: false,
            lazyValue: this.value,
            valid: false,
        };
    },
    computed: {
        computedColor() {
            if (this.isDisabled)
                return undefined;
            if (this.color)
                return this.color;
            // It's assumed that if the input is on a
            // dark background, the user will want to
            // have a white color. If the entire app
            // is setup to be dark, then they will
            // like want to use their primary color
            if (this.isDark && !this.appIsDark)
                return 'white';
            else
                return 'primary';
        },
        hasError() {
            return (this.internalErrorMessages.length > 0 ||
                this.errorBucket.length > 0 ||
                this.error);
        },
        // TODO: Add logic that allows the user to enable based
        // upon a good validation
        hasSuccess() {
            return (this.internalSuccessMessages.length > 0 ||
                this.success);
        },
        externalError() {
            return this.internalErrorMessages.length > 0 || this.error;
        },
        hasMessages() {
            return this.validationTarget.length > 0;
        },
        hasState() {
            if (this.isDisabled)
                return false;
            return (this.hasSuccess ||
                (this.shouldValidate && this.hasError));
        },
        internalErrorMessages() {
            return this.genInternalMessages(this.errorMessages);
        },
        internalMessages() {
            return this.genInternalMessages(this.messages);
        },
        internalSuccessMessages() {
            return this.genInternalMessages(this.successMessages);
        },
        internalValue: {
            get() {
                return this.lazyValue;
            },
            set(val) {
                this.lazyValue = val;
                this.$emit('input', val);
            },
        },
        isDisabled() {
            return this.disabled || (!!this.form &&
                this.form.disabled);
        },
        isInteractive() {
            return !this.isDisabled && !this.isReadonly;
        },
        isReadonly() {
            return this.readonly || (!!this.form &&
                this.form.readonly);
        },
        shouldValidate() {
            if (this.externalError)
                return true;
            if (this.isResetting)
                return false;
            return this.validateOnBlur
                ? this.hasFocused && !this.isFocused
                : (this.hasInput || this.hasFocused);
        },
        validations() {
            return this.validationTarget.slice(0, Number(this.errorCount));
        },
        validationState() {
            if (this.isDisabled)
                return undefined;
            if (this.hasError && this.shouldValidate)
                return 'error';
            if (this.hasSuccess)
                return 'success';
            if (this.hasColor)
                return this.computedColor;
            return undefined;
        },
        validationTarget() {
            if (this.internalErrorMessages.length > 0) {
                return this.internalErrorMessages;
            }
            else if (this.successMessages && this.successMessages.length > 0) {
                return this.internalSuccessMessages;
            }
            else if (this.messages && this.messages.length > 0) {
                return this.internalMessages;
            }
            else if (this.shouldValidate) {
                return this.errorBucket;
            }
            else
                return [];
        },
    },
    watch: {
        rules: {
            handler(newVal, oldVal) {
                if (deepEqual(newVal, oldVal))
                    return;
                this.validate();
            },
            deep: true,
        },
        internalValue() {
            // If it's the first time we're setting input,
            // mark it with hasInput
            this.hasInput = true;
            this.validateOnBlur || this.$nextTick(this.validate);
        },
        isFocused(val) {
            // Should not check validation
            // if disabled
            if (!val &&
                !this.isDisabled) {
                this.hasFocused = true;
                this.validateOnBlur && this.$nextTick(this.validate);
            }
        },
        isResetting() {
            setTimeout(() => {
                this.hasInput = false;
                this.hasFocused = false;
                this.isResetting = false;
                this.validate();
            }, 0);
        },
        hasError(val) {
            if (this.shouldValidate) {
                this.$emit('update:error', val);
            }
        },
        value(val) {
            this.lazyValue = val;
        },
    },
    beforeMount() {
        this.validate();
    },
    created() {
        this.form && this.form.register(this);
    },
    beforeDestroy() {
        this.form && this.form.unregister(this);
    },
    methods: {
        genInternalMessages(messages) {
            if (!messages)
                return [];
            else if (Array.isArray(messages))
                return messages;
            else
                return [messages];
        },
        /** @public */
        reset() {
            this.isResetting = true;
            this.internalValue = Array.isArray(this.internalValue)
                ? []
                : null;
        },
        /** @public */
        resetValidation() {
            this.isResetting = true;
        },
        /** @public */
        validate(force = false, value) {
            const errorBucket = [];
            value = value || this.internalValue;
            if (force)
                this.hasInput = this.hasFocused = true;
            for (let index = 0; index < this.rules.length; index++) {
                const rule = this.rules[index];
                const valid = typeof rule === 'function' ? rule(value) : rule;
                if (valid === false || typeof valid === 'string') {
                    errorBucket.push(valid || '');
                }
                else if (typeof valid !== 'boolean') {
                    consoleError(`Rules should return a string or boolean, received '${typeof valid}' instead`, this);
                }
            }
            this.errorBucket = errorBucket;
            this.valid = errorBucket.length === 0;
            return this.valid;
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL3ZhbGlkYXRhYmxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSxjQUFjLENBQUE7QUFDcEMsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFBO0FBQ3BDLE9BQU8sRUFBRSxNQUFNLElBQUksaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUU1RCxZQUFZO0FBQ1osT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNqRCxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQU10QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLFNBQVMsRUFDVCxpQkFBaUIsQ0FBYyxNQUFNLENBQUMsRUFDdEMsU0FBUyxDQUNWLENBQUE7QUFFRCxvQkFBb0I7QUFDcEIsZUFBZSxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQy9CLElBQUksRUFBRSxhQUFhO0lBRW5CLEtBQUssRUFBRTtRQUNMLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLEtBQUssRUFBRSxPQUFPO1FBQ2QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsYUFBYSxFQUFFO1lBQ2IsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztZQUNyQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtTQUNvQjtRQUN2QyxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO1lBQ3JCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO1NBQ29CO1FBQ3ZDLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLEtBQUssRUFBRTtZ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SyxLQUFLLFNBQVMsRUFBRTtvQkFDckMsWUFBWSxDQUFDLHNEQUFzRCxPQUFPLEtBQUssV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFBO2lCQUNsRzthQUNGO1lBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7WUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQTtZQUVyQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7UUFDbkIsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTWl4aW5zXG5pbXBvcnQgQ29sb3JhYmxlIGZyb20gJy4uL2NvbG9yYWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vdGhlbWVhYmxlJ1xuaW1wb3J0IHsgaW5qZWN0IGFzIFJlZ2lzdHJhYmxlSW5qZWN0IH0gZnJvbSAnLi4vcmVnaXN0cmFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHsgZGVlcEVxdWFsIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgY29uc29sZUVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IgfSBmcm9tICd2dWUvdHlwZXMvb3B0aW9ucydcbmltcG9ydCB7IElucHV0TWVzc2FnZSwgSW5wdXRWYWxpZGF0aW9uUnVsZXMgfSBmcm9tICd2dWV0aWZ5L3R5cGVzJ1xuXG5jb25zdCBiYXNlTWl4aW5zID0gbWl4aW5zKFxuICBDb2xvcmFibGUsXG4gIFJlZ2lzdHJhYmxlSW5qZWN0PCdmb3JtJywgYW55PignZm9ybScpLFxuICBUaGVtZWFibGUsXG4pXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZCh7XG4gIG5hbWU6ICd2YWxpZGF0YWJsZScsXG5cbiAgcHJvcHM6IHtcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBlcnJvcjogQm9vbGVhbixcbiAgICBlcnJvckNvdW50OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMSxcbiAgICB9LFxuICAgIGVycm9yTWVzc2FnZXM6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEFycmF5XSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+IFtdLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxJbnB1dE1lc3NhZ2UgfCBudWxsPixcbiAgICBtZXNzYWdlczoge1xuICAgICAgdHlwZTogW1N0cmluZywgQXJyYXldLFxuICAgICAgZGVmYXVsdDogKCkgPT4gW10sXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPElucHV0TWVzc2FnZSB8IG51bGw+LFxuICAgIHJlYWRvbmx5OiBCb29sZWFuLFxuICAgIHJ1bGVzOiB7XG4gICAgICB0eXBlOiBBcnJheSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+IFtdLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxJbnB1dFZhbGlkYXRpb25SdWxlcz4sXG4gICAgc3VjY2VzczogQm9vbGVhbixcbiAgICBzdWNjZXNzTWVzc2FnZXM6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEFycmF5XSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+IFtdLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxJbnB1dE1lc3NhZ2UgfCBudWxsPixcbiAgICB2YWxpZGF0ZU9uQmx1cjogQm9vbGVhbixcbiAgICB2YWx1ZTogeyByZXF1aXJlZDogZmFsc2UgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3JCdWNrZXQ6IFtdIGFzIHN0cmluZ1tdLFxuICAgICAgaGFzQ29sb3I6IGZhbHNlLFxuICAgICAgaGFzRm9jdXNlZDogZmFsc2UsXG4gICAgICBoYXNJbnB1dDogZmFsc2UsXG4gICAgICBpc0ZvY3VzZWQ6IGZhbHNlLFxuICAgICAgaXNSZXNldHRpbmc6IGZhbHNlLFxuICAgICAgbGF6eVZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgIH1cbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGNvbXB1dGVkQ29sb3IgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAodGhpcy5pc0Rpc2FibGVkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgICBpZiAodGhpcy5jb2xvcikgcmV0dXJuIHRoaXMuY29sb3JcbiAgICAgIC8vIEl0J3MgYXNzdW1lZCB0aGF0IGlmIHRoZSBpbnB1dCBpcyBvbiBhXG4gICAgICAvLyBkYXJrIGJhY2tncm91bmQsIHRoZSB1c2VyIHdpbGwgd2FudCB0b1xuICAgICAgLy8gaGF2ZSBhIHdoaXRlIGNvbG9yLiBJZiB0aGUgZW50aXJlIGFwcFxuICAgICAgLy8gaXMgc2V0dXAgdG8gYmUgZGFyaywgdGhlbiB0aGV5IHdpbGxcbiAgICAgIC8vIGxpa2Ugd2FudCB0byB1c2UgdGhlaXIgcHJpbWFyeSBjb2xvclxuICAgICAgaWYgKHRoaXMuaXNEYXJrICYmICF0aGlzLmFwcElzRGFyaykgcmV0dXJuICd3aGl0ZSdcbiAgICAgIGVsc2UgcmV0dXJuICdwcmltYXJ5J1xuICAgIH0sXG4gICAgaGFzRXJyb3IgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5pbnRlcm5hbEVycm9yTWVzc2FnZXMubGVuZ3RoID4gMCB8fFxuICAgICAgICB0aGlzLmVycm9yQnVja2V0Lmxlbmd0aCA+IDAgfHxcbiAgICAgICAgdGhpcy5lcnJvclxuICAgICAgKVxuICAgIH0sXG4gICAgLy8gVE9ETzogQWRkIGxvZ2ljIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIGVuYWJsZSBiYXNlZFxuICAgIC8vIHVwb24gYSBnb29kIHZhbGlkYXRpb25cbiAgICBoYXNTdWNjZXNzICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuaW50ZXJuYWxTdWNjZXNzTWVzc2FnZXMubGVuZ3RoID4gMCB8fFxuICAgICAgICB0aGlzLnN1Y2Nlc3NcbiAgICAgIClcbiAgICB9LFxuICAgIGV4dGVybmFsRXJyb3IgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxFcnJvck1lc3NhZ2VzLmxlbmd0aCA+IDAgfHwgdGhpcy5lcnJvclxuICAgIH0sXG4gICAgaGFzTWVzc2FnZXMgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvblRhcmdldC5sZW5ndGggPiAwXG4gICAgfSxcbiAgICBoYXNTdGF0ZSAoKTogYm9vbGVhbiB7XG4gICAgICBpZiAodGhpcy5pc0Rpc2FibGVkKSByZXR1cm4gZmFsc2VcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5oYXNTdWNjZXNzIHx8XG4gICAgICAgICh0aGlzLnNob3VsZFZhbGlkYXRlICYmIHRoaXMuaGFzRXJyb3IpXG4gICAgICApXG4gICAgfSxcbiAgICBpbnRlcm5hbEVycm9yTWVzc2FnZXMgKCk6IElucHV0VmFsaWRhdGlvblJ1bGVzIHtcbiAgICAgIHJldHVybiB0aGlzLmdlbkludGVybmFsTWVzc2FnZXModGhpcy5lcnJvck1lc3NhZ2VzKVxuICAgIH0sXG4gICAgaW50ZXJuYWxNZXNzYWdlcyAoKTogSW5wdXRWYWxpZGF0aW9uUnVsZXMge1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuSW50ZXJuYWxNZXNzYWdlcyh0aGlzLm1lc3NhZ2VzKVxuICAgIH0sXG4gICAgaW50ZXJuYWxTdWNjZXNzTWVzc2FnZXMgKCk6IElucHV0VmFsaWRhdGlvblJ1bGVzIHtcbiAgICAgIHJldHVybiB0aGlzLmdlbkludGVybmFsTWVzc2FnZXModGhpcy5zdWNjZXNzTWVzc2FnZXMpXG4gICAgfSxcbiAgICBpbnRlcm5hbFZhbHVlOiB7XG4gICAgICBnZXQgKCk6IHVua25vd24ge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXp5VmFsdWVcbiAgICAgIH0sXG4gICAgICBzZXQgKHZhbDogYW55KSB7XG4gICAgICAgIHRoaXMubGF6eVZhbHVlID0gdmFsXG5cbiAgICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCB2YWwpXG4gICAgICB9LFxuICAgIH0sXG4gICAgaXNEaXNhYmxlZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCB8fCAoXG4gICAgICAgICEhdGhpcy5mb3JtICYmXG4gICAgICAgIHRoaXMuZm9ybS5kaXNhYmxlZFxuICAgICAgKVxuICAgIH0sXG4gICAgaXNJbnRlcmFjdGl2ZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gIXRoaXMuaXNEaXNhYmxlZCAmJiAhdGhpcy5pc1JlYWRvbmx5XG4gICAgfSxcbiAgICBpc1JlYWRvbmx5ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLnJlYWRvbmx5IHx8IChcbiAgICAgICAgISF0aGlzLmZvcm0gJiZcbiAgICAgICAgdGhpcy5mb3JtLnJlYWRvbmx5XG4gICAgICApXG4gICAgfSxcbiAgICBzaG91bGRWYWxpZGF0ZSAoKTogYm9vbGVhbiB7XG4gICAgICBpZiAodGhpcy5leHRlcm5hbEVycm9yKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKHRoaXMuaXNSZXNldHRpbmcpIHJldHVybiBmYWxzZVxuXG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZU9uQmx1clxuICAgICAgICA/IHRoaXMuaGFzRm9jdXNlZCAmJiAhdGhpcy5pc0ZvY3VzZWRcbiAgICAgICAgOiAodGhpcy5oYXNJbnB1dCB8fCB0aGlzLmhhc0ZvY3VzZWQpXG4gICAgfSxcbiAgICB2YWxpZGF0aW9ucyAoKTogSW5wdXRWYWxpZGF0aW9uUnVsZXMge1xuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvblRhcmdldC5zbGljZSgwLCBOdW1iZXIodGhpcy5lcnJvckNvdW50KSlcbiAgICB9LFxuICAgIHZhbGlkYXRpb25TdGF0ZSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICh0aGlzLmlzRGlzYWJsZWQpIHJldHVybiB1bmRlZmluZWRcbiAgICAgIGlmICh0aGlzLmhhc0Vycm9yICYmIHRoaXMuc2hvdWxkVmFsaWRhdGUpIHJldHVybiAnZXJyb3InXG4gICAgICBpZiAodGhpcy5oYXNTdWNjZXNzKSByZXR1cm4gJ3N1Y2Nlc3MnXG4gICAgICBpZiAodGhpcy5oYXNDb2xvcikgcmV0dXJuIHRoaXMuY29tcHV0ZWRDb2xvclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH0sXG4gICAgdmFsaWRhdGlvblRhcmdldCAoKTogSW5wdXRWYWxpZGF0aW9uUnVsZXMge1xuICAgICAgaWYgKHRoaXMuaW50ZXJuYWxFcnJvck1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxFcnJvck1lc3NhZ2VzXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3VjY2Vzc01lc3NhZ2VzICYmIHRoaXMuc3VjY2Vzc01lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxTdWNjZXNzTWVzc2FnZXNcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5tZXNzYWdlcyAmJiB0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNZXNzYWdlc1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnNob3VsZFZhbGlkYXRlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVycm9yQnVja2V0XG4gICAgICB9IGVsc2UgcmV0dXJuIFtdXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIHJ1bGVzOiB7XG4gICAgICBoYW5kbGVyIChuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICBpZiAoZGVlcEVxdWFsKG5ld1ZhbCwgb2xkVmFsKSkgcmV0dXJuXG4gICAgICAgIHRoaXMudmFsaWRhdGUoKVxuICAgICAgfSxcbiAgICAgIGRlZXA6IHRydWUsXG4gICAgfSxcbiAgICBpbnRlcm5hbFZhbHVlICgpIHtcbiAgICAgIC8vIElmIGl0J3MgdGhlIGZpcnN0IHRpbWUgd2UncmUgc2V0dGluZyBpbnB1dCxcbiAgICAgIC8vIG1hcmsgaXQgd2l0aCBoYXNJbnB1dFxuICAgICAgdGhpcy5oYXNJbnB1dCA9IHRydWVcbiAgICAgIHRoaXMudmFsaWRhdGVPbkJsdXIgfHwgdGhpcy4kbmV4dFRpY2sodGhpcy52YWxpZGF0ZSlcbiAgICB9LFxuICAgIGlzRm9jdXNlZCAodmFsKSB7XG4gICAgICAvLyBTaG91bGQgbm90IGNoZWNrIHZhbGlkYXRpb25cbiAgICAgIC8vIGlmIGRpc2FibGVkXG4gICAgICBpZiAoXG4gICAgICAgICF2YWwgJiZcbiAgICAgICAgIXRoaXMuaXNEaXNhYmxlZFxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuaGFzRm9jdXNlZCA9IHRydWVcbiAgICAgICAgdGhpcy52YWxpZGF0ZU9uQmx1ciAmJiB0aGlzLiRuZXh0VGljayh0aGlzLnZhbGlkYXRlKVxuICAgICAgfVxuICAgIH0sXG4gICAgaXNSZXNldHRpbmcgKCkge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuaGFzSW5wdXQgPSBmYWxzZVxuICAgICAgICB0aGlzLmhhc0ZvY3VzZWQgPSBmYWxzZVxuICAgICAgICB0aGlzLmlzUmVzZXR0aW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy52YWxpZGF0ZSgpXG4gICAgICB9LCAwKVxuICAgIH0sXG4gICAgaGFzRXJyb3IgKHZhbCkge1xuICAgICAgaWYgKHRoaXMuc2hvdWxkVmFsaWRhdGUpIHtcbiAgICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOmVycm9yJywgdmFsKVxuICAgICAgfVxuICAgIH0sXG4gICAgdmFsdWUgKHZhbCkge1xuICAgICAgdGhpcy5sYXp5VmFsdWUgPSB2YWxcbiAgICB9LFxuICB9LFxuXG4gIGJlZm9yZU1vdW50ICgpIHtcbiAgICB0aGlzLnZhbGlkYXRlKClcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICB0aGlzLmZvcm0gJiYgdGhpcy5mb3JtLnJlZ2lzdGVyKHRoaXMpXG4gIH0sXG5cbiAgYmVmb3JlRGVzdHJveSAoKSB7XG4gICAgdGhpcy5mb3JtICYmIHRoaXMuZm9ybS51bnJlZ2lzdGVyKHRoaXMpXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkludGVybmFsTWVzc2FnZXMgKG1lc3NhZ2VzOiBJbnB1dE1lc3NhZ2UgfCBudWxsKTogSW5wdXRWYWxpZGF0aW9uUnVsZXMge1xuICAgICAgaWYgKCFtZXNzYWdlcykgcmV0dXJuIFtdXG4gICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2VzKSkgcmV0dXJuIG1lc3NhZ2VzXG4gICAgICBlbHNlIHJldHVybiBbbWVzc2FnZXNdXG4gICAgfSxcbiAgICAvKiogQHB1YmxpYyAqL1xuICAgIHJlc2V0ICgpIHtcbiAgICAgIHRoaXMuaXNSZXNldHRpbmcgPSB0cnVlXG4gICAgICB0aGlzLmludGVybmFsVmFsdWUgPSBBcnJheS5pc0FycmF5KHRoaXMuaW50ZXJuYWxWYWx1ZSlcbiAgICAgICAgPyBbXVxuICAgICAgICA6IG51bGxcbiAgICB9LFxuICAgIC8qKiBAcHVibGljICovXG4gICAgcmVzZXRWYWxpZGF0aW9uICgpIHtcbiAgICAgIHRoaXMuaXNSZXNldHRpbmcgPSB0cnVlXG4gICAgfSxcbiAgICAvKiogQHB1YmxpYyAqL1xuICAgIHZhbGlkYXRlIChmb3JjZSA9IGZhbHNlLCB2YWx1ZT86IGFueSk6IGJvb2xlYW4ge1xuICAgICAgY29uc3QgZXJyb3JCdWNrZXQgPSBbXVxuICAgICAgdmFsdWUgPSB2YWx1ZSB8fCB0aGlzLmludGVybmFsVmFsdWVcblxuICAgICAgaWYgKGZvcmNlKSB0aGlzLmhhc0lucHV0ID0gdGhpcy5oYXNGb2N1c2VkID0gdHJ1ZVxuXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5ydWxlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgcnVsZSA9IHRoaXMucnVsZXNbaW5kZXhdXG4gICAgICAgIGNvbnN0IHZhbGlkID0gdHlwZW9mIHJ1bGUgPT09ICdmdW5jdGlvbicgPyBydWxlKHZhbHVlKSA6IHJ1bGVcblxuICAgICAgICBpZiAodmFsaWQgPT09IGZhbHNlIHx8IHR5cGVvZiB2YWxpZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBlcnJvckJ1Y2tldC5wdXNoKHZhbGlkIHx8ICcnKVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWxpZCAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgY29uc29sZUVycm9yKGBSdWxlcyBzaG91bGQgcmV0dXJuIGEgc3RyaW5nIG9yIGJvb2xlYW4sIHJlY2VpdmVkICcke3R5cGVvZiB2YWxpZH0nIGluc3RlYWRgLCB0aGlzKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZXJyb3JCdWNrZXQgPSBlcnJvckJ1Y2tldFxuICAgICAgdGhpcy52YWxpZCA9IGVycm9yQnVja2V0Lmxlbmd0aCA9PT0gMFxuXG4gICAgICByZXR1cm4gdGhpcy52YWxpZFxuICAgIH0sXG4gIH0sXG59KVxuIl19
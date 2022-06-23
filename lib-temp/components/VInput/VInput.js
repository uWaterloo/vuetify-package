// Styles
import './VInput.sass';
// Components
import VIcon from '../VIcon';
import VLabel from '../VLabel';
import VMessages from '../VMessages';
// Mixins
import BindsAttrs from '../../mixins/binds-attrs';
import Validatable from '../../mixins/validatable';
// Utilities
import { convertToUnit, getSlot, kebabCase, } from '../../util/helpers';
import mergeData from '../../util/mergeData';
import mixins from '../../util/mixins';
const baseMixins = mixins(BindsAttrs, Validatable);
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'v-input',
    inheritAttrs: false,
    props: {
        appendIcon: String,
        backgroundColor: {
            type: String,
            default: '',
        },
        dense: Boolean,
        height: [Number, String],
        hideDetails: [Boolean, String],
        hideSpinButtons: Boolean,
        hint: String,
        id: String,
        label: String,
        loading: Boolean,
        persistentHint: Boolean,
        prependIcon: String,
        value: null,
    },
    data() {
        return {
            lazyValue: this.value,
            hasMouseDown: false,
        };
    },
    computed: {
        classes() {
            return {
                'v-input--has-state': this.hasState,
                'v-input--hide-details': !this.showDetails,
                'v-input--is-label-active': this.isLabelActive,
                'v-input--is-dirty': this.isDirty,
                'v-input--is-disabled': this.isDisabled,
                'v-input--is-focused': this.isFocused,
                // <v-switch loading>.loading === '' so we can't just cast to boolean
                'v-input--is-loading': this.loading !== false && this.loading != null,
                'v-input--is-readonly': this.isReadonly,
                'v-input--dense': this.dense,
                'v-input--hide-spin-buttons': this.hideSpinButtons,
                ...this.themeClasses,
            };
        },
        computedId() {
            return this.id || `input-${this._uid}`;
        },
        hasDetails() {
            return this.messagesToDisplay.length > 0;
        },
        hasHint() {
            return !this.hasMessages &&
                !!this.hint &&
                (this.persistentHint || this.isFocused);
        },
        hasLabel() {
            return !!(this.$slots.label || this.label);
        },
        // Proxy for `lazyValue`
        // This allows an input
        // to function without
        // a provided model
        internalValue: {
            get() {
                return this.lazyValue;
            },
            set(val) {
                this.lazyValue = val;
                this.$emit(this.$_modelEvent, val);
            },
        },
        isDirty() {
            return !!this.lazyValue;
        },
        isLabelActive() {
            return this.isDirty;
        },
        messagesToDisplay() {
            if (this.hasHint)
                return [this.hint];
            if (!this.hasMessages)
                return [];
            return this.validations.map((validation) => {
                if (typeof validation === 'string')
                    return validation;
                const validationResult = validation(this.internalValue);
                return typeof validationResult === 'string' ? validationResult : '';
            }).filter(message => message !== '');
        },
        showDetails() {
            return this.hideDetails === false || (this.hideDetails === 'auto' && this.hasDetails);
        },
    },
    watch: {
        value(val) {
            this.lazyValue = val;
        },
    },
    beforeCreate() {
        // v-radio-group needs to emit a different event
        // https://github.com/vuetifyjs/vuetify/issues/4752
        this.$_modelEvent = (this.$options.model && this.$options.model.event) || 'input';
    },
    methods: {
        genContent() {
            return [
                this.genPrependSlot(),
                this.genControl(),
                this.genAppendSlot(),
            ];
        },
        genControl() {
            return this.$createElement('div', {
                staticClass: 'v-input__control',
                attrs: { title: this.attrs$.title },
            }, [
                this.genInputSlot(),
                this.genMessages(),
            ]);
        },
        genDefaultSlot() {
            return [
                this.genLabel(),
                this.$slots.default,
            ];
        },
        genIcon(type, cb, extraData = {}) {
            const icon = this[`${type}Icon`];
            const eventName = `click:${kebabCase(type)}`;
            const hasListener = !!(this.listeners$[eventName] || cb);
            const data = mergeData({
                attrs: {
                    'aria-label': hasListener ? kebabCase(type).split('-')[0] + ' icon' : undefined,
                    color: this.validationState,
                    dark: this.dark,
                    disabled: this.isDisabled,
                    light: this.light,
                },
                on: !hasListener
                    ? undefined
                    : {
                        click: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.$emit(eventName, e);
                            cb && cb(e);
                        },
                        // Container has g event that will
                        // trigger menu open if enclosed
                        mouseup: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        },
                    },
            }, extraData);
            return this.$createElement('div', {
                staticClass: `v-input__icon`,
                class: type ? `v-input__icon--${kebabCase(type)}` : undefined,
            }, [
                this.$createElement(VIcon, data, icon),
            ]);
        },
        genInputSlot() {
            return this.$createElement('div', this.setBackgroundColor(this.backgroundColor, {
                staticClass: 'v-input__slot',
                style: { height: convertToUnit(this.height) },
                on: {
                    click: this.onClick,
                    mousedown: this.onMouseDown,
                    mouseup: this.onMouseUp,
                },
                ref: 'input-slot',
            }), [this.genDefaultSlot()]);
        },
        genLabel() {
            if (!this.hasLabel)
                return null;
            return this.$createElement(VLabel, {
                props: {
                    color: this.validationState,
                    dark: this.dark,
                    disabled: this.isDisabled,
                    focused: this.hasState,
                    for: this.computedId,
                    light: this.light,
                },
            }, this.$slots.label || this.label);
        },
        genMessages() {
            if (!this.showDetails)
                return null;
            return this.$createElement(VMessages, {
                props: {
                    color: this.hasHint ? '' : this.validationState,
                    dark: this.dark,
                    light: this.light,
                    value: this.messagesToDisplay,
                },
                attrs: {
                    role: this.hasMessages ? 'alert' : null,
                },
                scopedSlots: {
                    default: props => getSlot(this, 'message', props),
                },
            });
        },
        genSlot(type, location, slot) {
            if (!slot.length)
                return null;
            const ref = `${type}-${location}`;
            return this.$createElement('div', {
                staticClass: `v-input__${ref}`,
                ref,
            }, slot);
        },
        genPrependSlot() {
            const slot = [];
            if (this.$slots.prepend) {
                slot.push(this.$slots.prepend);
            }
            else if (this.prependIcon) {
                slot.push(this.genIcon('prepend'));
            }
            return this.genSlot('prepend', 'outer', slot);
        },
        genAppendSlot() {
            const slot = [];
            // Append icon for text field was really
            // an appended inner icon, v-text-field
            // will overwrite this method in order to obtain
            // backwards compat
            if (this.$slots.append) {
                slot.push(this.$slots.append);
            }
            else if (this.appendIcon) {
                slot.push(this.genIcon('append'));
            }
            return this.genSlot('append', 'outer', slot);
        },
        onClick(e) {
            this.$emit('click', e);
        },
        onMouseDown(e) {
            this.hasMouseDown = true;
            this.$emit('mousedown', e);
        },
        onMouseUp(e) {
            this.hasMouseDown = false;
            this.$emit('mouseup', e);
        },
    },
    render(h) {
        return h('div', this.setTextColor(this.validationState, {
            staticClass: 'v-input',
            class: this.classes,
        }), this.genContent());
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVklucHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVklucHV0L1ZJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxlQUFlLENBQUE7QUFFdEIsYUFBYTtBQUNiLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUM1QixPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUE7QUFDOUIsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFBO0FBRXBDLFNBQVM7QUFDVCxPQUFPLFVBQVUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNqRCxPQUFPLFdBQVcsTUFBTSwwQkFBMEIsQ0FBQTtBQUVsRCxZQUFZO0FBQ1osT0FBTyxFQUNMLGFBQWEsRUFDYixPQUFPLEVBQ1AsU0FBUyxHQUNWLE1BQU0sb0JBQW9CLENBQUE7QUFDM0IsT0FBTyxTQUFTLE1BQU0sc0JBQXNCLENBQUE7QUFJNUMsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFHdEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixVQUFVLEVBQ1YsV0FBVyxDQUNaLENBQUE7QUFPRCxvQkFBb0I7QUFDcEIsZUFBZSxVQUFVLENBQUMsTUFBTSxFQUFXLENBQUMsTUFBTSxDQUFDO0lBQ2pELElBQUksRUFBRSxTQUFTO0lBRWYsWUFBWSxFQUFFLEtBQUs7SUFFbkIsS0FBSyxFQUFFO1FBQ0wsVUFBVSxFQUFFLE1BQU07UUFDbEIsZUFBZSxFQUFFO1lBQ2YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsRUFBRTtTQUNaO1FBQ0QsS0FBSyxFQUFFLE9BQU87UUFDZCxNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ3hCLFdBQVcsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQStCO1FBQzVELGVBQWUsRUFBRSxPQUFPO1FBQ3hCLElBQUksRUFBRSxNQUFNO1FBQ1osRUFBRSxFQUFFLE1BQU07UUFDVixLQUFL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TyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3hCLENBQUM7UUFDRCxXQUFXLENBQUUsQ0FBUTtZQUNuQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtZQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM1QixDQUFDO1FBQ0QsU0FBUyxDQUFFLENBQVE7WUFDakIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7WUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDMUIsQ0FBQztLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RELFdBQVcsRUFBRSxTQUFTO1lBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTztTQUNwQixDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUE7SUFDeEIsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZJbnB1dC5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVkljb24gZnJvbSAnLi4vVkljb24nXG5pbXBvcnQgVkxhYmVsIGZyb20gJy4uL1ZMYWJlbCdcbmltcG9ydCBWTWVzc2FnZXMgZnJvbSAnLi4vVk1lc3NhZ2VzJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBCaW5kc0F0dHJzIGZyb20gJy4uLy4uL21peGlucy9iaW5kcy1hdHRycydcbmltcG9ydCBWYWxpZGF0YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdmFsaWRhdGFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHtcbiAgY29udmVydFRvVW5pdCxcbiAgZ2V0U2xvdCxcbiAga2ViYWJDYXNlLFxufSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgbWVyZ2VEYXRhIGZyb20gJy4uLy4uL3V0aWwvbWVyZ2VEYXRhJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUsIFZOb2RlRGF0YSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgSW5wdXRWYWxpZGF0aW9uUnVsZSB9IGZyb20gJ3Z1ZXRpZnkvdHlwZXMnXG5cbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIEJpbmRzQXR0cnMsXG4gIFZhbGlkYXRhYmxlLFxuKVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEluc3RhbmNlVHlwZTx0eXBlb2YgYmFzZU1peGlucz4ge1xuICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlICovXG4gICRfbW9kZWxFdmVudDogc3RyaW5nXG59XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZDxvcHRpb25zPigpLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWlucHV0JyxcblxuICBpbmhlcml0QXR0cnM6IGZhbHNlLFxuXG4gIHByb3BzOiB7XG4gICAgYXBwZW5kSWNvbjogU3RyaW5nLFxuICAgIGJhY2tncm91bmRDb2xvcjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJycsXG4gICAgfSxcbiAgICBkZW5zZTogQm9vbGVhbixcbiAgICBoZWlnaHQ6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgaGlkZURldGFpbHM6IFtCb29sZWFuLCBTdHJpbmddIGFzIFByb3BUeXBlPGJvb2xlYW4gfCAnYXV0byc+LFxuICAgIGhpZGVTcGluQnV0dG9uczogQm9vbGVhbixcbiAgICBoaW50OiBTdHJpbmcsXG4gICAgaWQ6IFN0cmluZyxcbiAgICBsYWJlbDogU3RyaW5nLFxuICAgIGxvYWRpbmc6IEJvb2xlYW4sXG4gICAgcGVyc2lzdGVudEhpbnQ6IEJvb2xlYW4sXG4gICAgcHJlcGVuZEljb246IFN0cmluZyxcbiAgICB2YWx1ZTogbnVsbCBhcyBhbnkgYXMgUHJvcFR5cGU8YW55PixcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGF6eVZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgaGFzTW91c2VEb3duOiBmYWxzZSxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3YtaW5wdXQtLWhhcy1zdGF0ZSc6IHRoaXMuaGFzU3RhdGUsXG4gICAgICAgICd2LWlucHV0LS1oaWRlLWRldGFpbHMnOiAhdGhpcy5zaG93RGV0YWlscyxcbiAgICAgICAgJ3YtaW5wdXQtLWlzLWxhYmVsLWFjdGl2ZSc6IHRoaXMuaXNMYWJlbEFjdGl2ZSxcbiAgICAgICAgJ3YtaW5wdXQtLWlzLWRpcnR5JzogdGhpcy5pc0RpcnR5LFxuICAgICAgICAndi1pbnB1dC0taXMtZGlzYWJsZWQnOiB0aGlzLmlzRGlzYWJsZWQsXG4gICAgICAgICd2LWlucHV0LS1pcy1mb2N1c2VkJzogdGhpcy5pc0ZvY3VzZWQsXG4gICAgICAgIC8vIDx2LXN3aXRjaCBsb2FkaW5nPi5sb2FkaW5nID09PSAnJyBzbyB3ZSBjYW4ndCBqdXN0IGNhc3QgdG8gYm9vbGVhblxuICAgICAgICAndi1pbnB1dC0taXMtbG9hZGluZyc6IHRoaXMubG9hZGluZyAhPT0gZmFsc2UgJiYgdGhpcy5sb2FkaW5nICE9IG51bGwsXG4gICAgICAgICd2LWlucHV0LS1pcy1yZWFkb25seSc6IHRoaXMuaXNSZWFkb25seSxcbiAgICAgICAgJ3YtaW5wdXQtLWRlbnNlJzogdGhpcy5kZW5zZSxcbiAgICAgICAgJ3YtaW5wdXQtLWhpZGUtc3Bpbi1idXR0b25zJzogdGhpcy5oaWRlU3BpbkJ1dHRvbnMsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfVxuICAgIH0sXG4gICAgY29tcHV0ZWRJZCAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiB0aGlzLmlkIHx8IGBpbnB1dC0ke3RoaXMuX3VpZH1gXG4gICAgfSxcbiAgICBoYXNEZXRhaWxzICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzVG9EaXNwbGF5Lmxlbmd0aCA+IDBcbiAgICB9LFxuICAgIGhhc0hpbnQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuICF0aGlzLmhhc01lc3NhZ2VzICYmXG4gICAgICAgICEhdGhpcy5oaW50ICYmXG4gICAgICAgICh0aGlzLnBlcnNpc3RlbnRIaW50IHx8IHRoaXMuaXNGb2N1c2VkKVxuICAgIH0sXG4gICAgaGFzTGFiZWwgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuICEhKHRoaXMuJHNsb3RzLmxhYmVsIHx8IHRoaXMubGFiZWwpXG4gICAgfSxcbiAgICAvLyBQcm94eSBmb3IgYGxhenlWYWx1ZWBcbiAgICAvLyBUaGlzIGFsbG93cyBhbiBpbnB1dFxuICAgIC8vIHRvIGZ1bmN0aW9uIHdpdGhvdXRcbiAgICAvLyBhIHByb3ZpZGVkIG1vZGVsXG4gICAgaW50ZXJuYWxWYWx1ZToge1xuICAgICAgZ2V0ICgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXp5VmFsdWVcbiAgICAgIH0sXG4gICAgICBzZXQgKHZhbDogYW55KSB7XG4gICAgICAgIHRoaXMubGF6eVZhbHVlID0gdmFsXG4gICAgICAgIHRoaXMuJGVtaXQodGhpcy4kX21vZGVsRXZlbnQsIHZhbClcbiAgICAgIH0sXG4gICAgfSxcbiAgICBpc0RpcnR5ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAhIXRoaXMubGF6eVZhbHVlXG4gICAgfSxcbiAgICBpc0xhYmVsQWN0aXZlICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmlzRGlydHlcbiAgICB9LFxuICAgIG1lc3NhZ2VzVG9EaXNwbGF5ICgpOiBzdHJpbmdbXSB7XG4gICAgICBpZiAodGhpcy5oYXNIaW50KSByZXR1cm4gW3RoaXMuaGludF1cblxuICAgICAgaWYgKCF0aGlzLmhhc01lc3NhZ2VzKSByZXR1cm4gW11cblxuICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvbnMubWFwKCh2YWxpZGF0aW9uOiBzdHJpbmcgfCBJbnB1dFZhbGlkYXRpb25SdWxlKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsaWRhdGlvbiA9PT0gJ3N0cmluZycpIHJldHVybiB2YWxpZGF0aW9uXG5cbiAgICAgICAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRpb24odGhpcy5pbnRlcm5hbFZhbHVlKVxuXG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsaWRhdGlvblJlc3VsdCA9PT0gJ3N0cmluZycgPyB2YWxpZGF0aW9uUmVzdWx0IDogJydcbiAgICAgIH0pLmZpbHRlcihtZXNzYWdlID0+IG1lc3NhZ2UgIT09ICcnKVxuICAgIH0sXG4gICAgc2hvd0RldGFpbHMgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuaGlkZURldGFpbHMgPT09IGZhbHNlIHx8ICh0aGlzLmhpZGVEZXRhaWxzID09PSAnYXV0bycgJiYgdGhpcy5oYXNEZXRhaWxzKVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICB2YWx1ZSAodmFsKSB7XG4gICAgICB0aGlzLmxhenlWYWx1ZSA9IHZhbFxuICAgIH0sXG4gIH0sXG5cbiAgYmVmb3JlQ3JlYXRlICgpIHtcbiAgICAvLyB2LXJhZGlvLWdyb3VwIG5lZWRzIHRvIGVtaXQgYSBkaWZmZXJlbnQgZXZlbnRcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVldGlmeWpzL3Z1ZXRpZnkvaXNzdWVzLzQ3NTJcbiAgICB0aGlzLiRfbW9kZWxFdmVudCA9ICh0aGlzLiRvcHRpb25zLm1vZGVsICYmIHRoaXMuJG9wdGlvbnMubW9kZWwuZXZlbnQpIHx8ICdpbnB1dCdcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB0aGlzLmdlblByZXBlbmRTbG90KCksXG4gICAgICAgIHRoaXMuZ2VuQ29udHJvbCgpLFxuICAgICAgICB0aGlzLmdlbkFwcGVuZFNsb3QoKSxcbiAgICAgIF1cbiAgICB9LFxuICAgIGdlbkNvbnRyb2wgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWlucHV0X19jb250cm9sJyxcbiAgICAgICAgYXR0cnM6IHsgdGl0bGU6IHRoaXMuYXR0cnMkLnRpdGxlIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuSW5wdXRTbG90KCksXG4gICAgICAgIHRoaXMuZ2VuTWVzc2FnZXMoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5EZWZhdWx0U2xvdCAoKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB0aGlzLmdlbkxhYmVsKCksXG4gICAgICAgIHRoaXMuJHNsb3RzLmRlZmF1bHQsXG4gICAgICBdXG4gICAgfSxcbiAgICBnZW5JY29uIChcbiAgICAgIHR5cGU6IHN0cmluZyxcbiAgICAgIGNiPzogKGU6IEV2ZW50KSA9PiB2b2lkLFxuICAgICAgZXh0cmFEYXRhOiBWTm9kZURhdGEgPSB7fVxuICAgICkge1xuICAgICAgY29uc3QgaWNvbiA9ICh0aGlzIGFzIGFueSlbYCR7dHlwZX1JY29uYF1cbiAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGBjbGljazoke2tlYmFiQ2FzZSh0eXBlKX1gXG4gICAgICBjb25zdCBoYXNMaXN0ZW5lciA9ICEhKHRoaXMubGlzdGVuZXJzJFtldmVudE5hbWVdIHx8IGNiKVxuXG4gICAgICBjb25zdCBkYXRhID0gbWVyZ2VEYXRhKHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IGhhc0xpc3RlbmVyID8ga2ViYWJDYXNlKHR5cGUpLnNwbGl0KCctJylbMF0gKyAnIGljb24nIDogdW5kZWZpbmVkLFxuICAgICAgICAgIGNvbG9yOiB0aGlzLnZhbGlkYXRpb25TdGF0ZSxcbiAgICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuaXNEaXNhYmxlZCxcbiAgICAgICAgICBsaWdodDogdGhpcy5saWdodCxcbiAgICAgICAgfSxcbiAgICAgICAgb246ICFoYXNMaXN0ZW5lclxuICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICBjbGljazogKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgICAgICAgICAgdGhpcy4kZW1pdChldmVudE5hbWUsIGUpXG4gICAgICAgICAgICAgIGNiICYmIGNiKGUpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gQ29udGFpbmVyIGhhcyBnIGV2ZW50IHRoYXQgd2lsbFxuICAgICAgICAgICAgLy8gdHJpZ2dlciBtZW51IG9wZW4gaWYgZW5jbG9zZWRcbiAgICAgICAgICAgIG1vdXNldXA6IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgfSwgZXh0cmFEYXRhKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogYHYtaW5wdXRfX2ljb25gLFxuICAgICAgICBjbGFzczogdHlwZSA/IGB2LWlucHV0X19pY29uLS0ke2tlYmFiQ2FzZSh0eXBlKX1gIDogdW5kZWZpbmVkLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFZJY29uLFxuICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgaWNvblxuICAgICAgICApLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbklucHV0U2xvdCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IodGhpcy5iYWNrZ3JvdW5kQ29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWlucHV0X19zbG90JyxcbiAgICAgICAgc3R5bGU6IHsgaGVpZ2h0OiBjb252ZXJ0VG9Vbml0KHRoaXMuaGVpZ2h0KSB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiB0aGlzLm9uQ2xpY2ssXG4gICAgICAgICAgbW91c2Vkb3duOiB0aGlzLm9uTW91c2VEb3duLFxuICAgICAgICAgIG1vdXNldXA6IHRoaXMub25Nb3VzZVVwLFxuICAgICAgICB9LFxuICAgICAgICByZWY6ICdpbnB1dC1zbG90JyxcbiAgICAgIH0pLCBbdGhpcy5nZW5EZWZhdWx0U2xvdCgpXSlcbiAgICB9LFxuICAgIGdlbkxhYmVsICgpIHtcbiAgICAgIGlmICghdGhpcy5oYXNMYWJlbCkgcmV0dXJuIG51bGxcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkxhYmVsLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgY29sb3I6IHRoaXMudmFsaWRhdGlvblN0YXRlLFxuICAgICAgICAgIGRhcms6IHRoaXMuZGFyayxcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5pc0Rpc2FibGVkLFxuICAgICAgICAgIGZvY3VzZWQ6IHRoaXMuaGFzU3RhdGUsXG4gICAgICAgICAgZm9yOiB0aGlzLmNvbXB1dGVkSWQsXG4gICAgICAgICAgbGlnaHQ6IHRoaXMubGlnaHQsXG4gICAgICAgIH0sXG4gICAgICB9LCB0aGlzLiRzbG90cy5sYWJlbCB8fCB0aGlzLmxhYmVsKVxuICAgIH0sXG4gICAgZ2VuTWVzc2FnZXMgKCkge1xuICAgICAgaWYgKCF0aGlzLnNob3dEZXRhaWxzKSByZXR1cm4gbnVsbFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWTWVzc2FnZXMsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBjb2xvcjogdGhpcy5oYXNIaW50ID8gJycgOiB0aGlzLnZhbGlkYXRpb25TdGF0ZSxcbiAgICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICAgICAgbGlnaHQ6IHRoaXMubGlnaHQsXG4gICAgICAgICAgdmFsdWU6IHRoaXMubWVzc2FnZXNUb0Rpc3BsYXksXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgcm9sZTogdGhpcy5oYXNNZXNzYWdlcyA/ICdhbGVydCcgOiBudWxsLFxuICAgICAgICB9LFxuICAgICAgICBzY29wZWRTbG90czoge1xuICAgICAgICAgIGRlZmF1bHQ6IHByb3BzID0+IGdldFNsb3QodGhpcywgJ21lc3NhZ2UnLCBwcm9wcyksXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuU2xvdCAoXG4gICAgICB0eXBlOiBzdHJpbmcsXG4gICAgICBsb2NhdGlvbjogc3RyaW5nLFxuICAgICAgc2xvdDogKFZOb2RlIHwgVk5vZGVbXSlbXVxuICAgICkge1xuICAgICAgaWYgKCFzbG90Lmxlbmd0aCkgcmV0dXJuIG51bGxcblxuICAgICAgY29uc3QgcmVmID0gYCR7dHlwZX0tJHtsb2NhdGlvbn1gXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiBgdi1pbnB1dF9fJHtyZWZ9YCxcbiAgICAgICAgcmVmLFxuICAgICAgfSwgc2xvdClcbiAgICB9LFxuICAgIGdlblByZXBlbmRTbG90ICgpIHtcbiAgICAgIGNvbnN0IHNsb3QgPSBbXVxuXG4gICAgICBpZiAodGhpcy4kc2xvdHMucHJlcGVuZCkge1xuICAgICAgICBzbG90LnB1c2godGhpcy4kc2xvdHMucHJlcGVuZClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmVwZW5kSWNvbikge1xuICAgICAgICBzbG90LnB1c2godGhpcy5nZW5JY29uKCdwcmVwZW5kJykpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmdlblNsb3QoJ3ByZXBlbmQnLCAnb3V0ZXInLCBzbG90KVxuICAgIH0sXG4gICAgZ2VuQXBwZW5kU2xvdCAoKSB7XG4gICAgICBjb25zdCBzbG90ID0gW11cblxuICAgICAgLy8gQXBwZW5kIGljb24gZm9yIHRleHQgZmllbGQgd2FzIHJlYWxseVxuICAgICAgLy8gYW4gYXBwZW5kZWQgaW5uZXIgaWNvbiwgdi10ZXh0LWZpZWxkXG4gICAgICAvLyB3aWxsIG92ZXJ3cml0ZSB0aGlzIG1ldGhvZCBpbiBvcmRlciB0byBvYnRhaW5cbiAgICAgIC8vIGJhY2t3YXJkcyBjb21wYXRcbiAgICAgIGlmICh0aGlzLiRzbG90cy5hcHBlbmQpIHtcbiAgICAgICAgc2xvdC5wdXNoKHRoaXMuJHNsb3RzLmFwcGVuZClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5hcHBlbmRJY29uKSB7XG4gICAgICAgIHNsb3QucHVzaCh0aGlzLmdlbkljb24oJ2FwcGVuZCcpKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZW5TbG90KCdhcHBlbmQnLCAnb3V0ZXInLCBzbG90KVxuICAgIH0sXG4gICAgb25DbGljayAoZTogRXZlbnQpIHtcbiAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgZSlcbiAgICB9LFxuICAgIG9uTW91c2VEb3duIChlOiBFdmVudCkge1xuICAgICAgdGhpcy5oYXNNb3VzZURvd24gPSB0cnVlXG4gICAgICB0aGlzLiRlbWl0KCdtb3VzZWRvd24nLCBlKVxuICAgIH0sXG4gICAgb25Nb3VzZVVwIChlOiBFdmVudCkge1xuICAgICAgdGhpcy5oYXNNb3VzZURvd24gPSBmYWxzZVxuICAgICAgdGhpcy4kZW1pdCgnbW91c2V1cCcsIGUpXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2RpdicsIHRoaXMuc2V0VGV4dENvbG9yKHRoaXMudmFsaWRhdGlvblN0YXRlLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtaW5wdXQnLFxuICAgICAgY2xhc3M6IHRoaXMuY2xhc3NlcyxcbiAgICB9KSwgdGhpcy5nZW5Db250ZW50KCkpXG4gIH0sXG59KVxuIl19
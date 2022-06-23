// Styles
import '../../styles/components/_selection-controls.sass';
import './VSwitch.sass';
// Mixins
import Selectable from '../../mixins/selectable';
import VInput from '../VInput';
// Directives
import Touch from '../../directives/touch';
// Components
import { VFabTransition } from '../transitions';
import VProgressCircular from '../VProgressCircular/VProgressCircular';
// Helpers
import { keyCodes } from '../../util/helpers';
/* @vue/component */
export default Selectable.extend({
    name: 'v-switch',
    directives: { Touch },
    props: {
        inset: Boolean,
        loading: {
            type: [Boolean, String],
            default: false,
        },
        flat: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        classes() {
            return {
                ...VInput.options.computed.classes.call(this),
                'v-input--selection-controls v-input--switch': true,
                'v-input--switch--flat': this.flat,
                'v-input--switch--inset': this.inset,
            };
        },
        attrs() {
            return {
                'aria-checked': String(this.isActive),
                'aria-disabled': String(this.isDisabled),
                role: 'switch',
            };
        },
        // Do not return undefined if disabled,
        // according to spec, should still show
        // a color when disabled and active
        validationState() {
            if (this.hasError && this.shouldValidate)
                return 'error';
            if (this.hasSuccess)
                return 'success';
            if (this.hasColor !== null)
                return this.computedColor;
            return undefined;
        },
        switchData() {
            return this.setTextColor(this.loading ? undefined : this.validationState, {
                class: this.themeClasses,
            });
        },
    },
    methods: {
        genDefaultSlot() {
            return [
                this.genSwitch(),
                this.genLabel(),
            ];
        },
        genSwitch() {
            const { title, ...switchAttrs } = this.attrs$;
            return this.$createElement('div', {
                staticClass: 'v-input--selection-controls__input',
            }, [
                this.genInput('checkbox', {
                    ...this.attrs,
                    ...switchAttrs,
                }),
                this.genRipple(this.setTextColor(this.validationState, {
                    directives: [{
                            name: 'touch',
                            value: {
                                left: this.onSwipeLeft,
                                right: this.onSwipeRight,
                            },
                        }],
                })),
                this.$createElement('div', {
                    staticClass: 'v-input--switch__track',
                    ...this.switchData,
                }),
                this.$createElement('div', {
                    staticClass: 'v-input--switch__thumb',
                    ...this.switchData,
                }, [this.genProgress()]),
            ]);
        },
        genProgress() {
            return this.$createElement(VFabTransition, {}, [
                this.loading === false
                    ? null
                    : this.$slots.progress || this.$createElement(VProgressCircular, {
                        props: {
                            color: (this.loading === true || this.loading === '')
                                ? (this.color || 'primary')
                                : this.loading,
                            size: 16,
                            width: 2,
                            indeterminate: true,
                        },
                    }),
            ]);
        },
        onSwipeLeft() {
            if (this.isActive)
                this.onChange();
        },
        onSwipeRight() {
            if (!this.isActive)
                this.onChange();
        },
        onKeydown(e) {
            if ((e.keyCode === keyCodes.left && this.isActive) ||
                (e.keyCode === keyCodes.right && !this.isActive))
                this.onChange();
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlN3aXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZTd2l0Y2gvVlN3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxrREFBa0QsQ0FBQTtBQUN6RCxPQUFPLGdCQUFnQixDQUFBO0FBRXZCLFNBQVM7QUFDVCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUE7QUFFOUIsYUFBYTtBQUNiLE9BQU8sS0FBSyxNQUFNLHdCQUF3QixDQUFBO0FBRTFDLGFBQWE7QUFDYixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDL0MsT0FBTyxpQkFBaUIsTUFBTSx3Q0FBd0MsQ0FBQTtBQUV0RSxVQUFVO0FBQ1YsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBSzdDLG9CQUFvQjtBQUNwQixlQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDL0IsSUFBSSxFQUFFLFVBQVU7SUFFaEIsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFO0lBRXJCLEtBQUssRUFBRTtRQUNMLEtBQUssRUFBRSxPQUFPO1FBQ2QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztZQUN2QixPQUFPLEVBQUUsS0FBSztTQUNmO1FBQ0QsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsS0FBSztTQUNmO0tBQ0Y7SUFFRCxRQUFRLEVBQUU7UUFDUixPQUFPO1lBQ0wsT0FBTztnQkFDTCxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUM3Qyw2Q0FBNkMsRUFBRSxJQUFJO2dCQUNuRCx1QkFBdUIsRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDbEMsd0JBQXdCLEVB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O2dDQUMzQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU87NEJBQ2hCLElBQUksRUFBRSxFQUFFOzRCQUNSLEtBQUssRUFBRSxDQUFDOzRCQUNSLGFBQWEsRUFBRSxJQUFJO3lCQUNwQjtxQkFDRixDQUFDO2FBQ0wsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELFdBQVc7WUFDVCxJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNwQyxDQUFDO1FBQ0QsWUFBWTtZQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtnQkFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDckMsQ0FBQztRQUNELFNBQVMsQ0FBRSxDQUFnQjtZQUN6QixJQUNFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ25CLENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuLi8uLi9zdHlsZXMvY29tcG9uZW50cy9fc2VsZWN0aW9uLWNvbnRyb2xzLnNhc3MnXG5pbXBvcnQgJy4vVlN3aXRjaC5zYXNzJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBTZWxlY3RhYmxlIGZyb20gJy4uLy4uL21peGlucy9zZWxlY3RhYmxlJ1xuaW1wb3J0IFZJbnB1dCBmcm9tICcuLi9WSW5wdXQnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBUb3VjaCBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL3RvdWNoJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgeyBWRmFiVHJhbnNpdGlvbiB9IGZyb20gJy4uL3RyYW5zaXRpb25zJ1xuaW1wb3J0IFZQcm9ncmVzc0NpcmN1bGFyIGZyb20gJy4uL1ZQcm9ncmVzc0NpcmN1bGFyL1ZQcm9ncmVzc0NpcmN1bGFyJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQgeyBrZXlDb2RlcyB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURhdGEgfSBmcm9tICd2dWUnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBTZWxlY3RhYmxlLmV4dGVuZCh7XG4gIG5hbWU6ICd2LXN3aXRjaCcsXG5cbiAgZGlyZWN0aXZlczogeyBUb3VjaCB9LFxuXG4gIHByb3BzOiB7XG4gICAgaW5zZXQ6IEJvb2xlYW4sXG4gICAgbG9hZGluZzoge1xuICAgICAgdHlwZTogW0Jvb2xlYW4sIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIGZsYXQ6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLlZJbnB1dC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtaW5wdXQtLXNlbGVjdGlvbi1jb250cm9scyB2LWlucHV0LS1zd2l0Y2gnOiB0cnVlLFxuICAgICAgICAndi1pbnB1dC0tc3dpdGNoLS1mbGF0JzogdGhpcy5mbGF0LFxuICAgICAgICAndi1pbnB1dC0tc3dpdGNoLS1pbnNldCc6IHRoaXMuaW5zZXQsXG4gICAgICB9XG4gICAgfSxcbiAgICBhdHRycyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICdhcmlhLWNoZWNrZWQnOiBTdHJpbmcodGhpcy5pc0FjdGl2ZSksXG4gICAgICAgICdhcmlhLWRpc2FibGVkJzogU3RyaW5nKHRoaXMuaXNEaXNhYmxlZCksXG4gICAgICAgIHJvbGU6ICdzd2l0Y2gnLFxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gRG8gbm90IHJldHVybiB1bmRlZmluZWQgaWYgZGlzYWJsZWQsXG4gICAgLy8gYWNjb3JkaW5nIHRvIHNwZWMsIHNob3VsZCBzdGlsbCBzaG93XG4gICAgLy8gYSBjb2xvciB3aGVuIGRpc2FibGVkIGFuZCBhY3RpdmVcbiAgICB2YWxpZGF0aW9uU3RhdGUgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAodGhpcy5oYXNFcnJvciAmJiB0aGlzLnNob3VsZFZhbGlkYXRlKSByZXR1cm4gJ2Vycm9yJ1xuICAgICAgaWYgKHRoaXMuaGFzU3VjY2VzcykgcmV0dXJuICdzdWNjZXNzJ1xuICAgICAgaWYgKHRoaXMuaGFzQ29sb3IgIT09IG51bGwpIHJldHVybiB0aGlzLmNvbXB1dGVkQ29sb3JcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHN3aXRjaERhdGEgKCk6IFZOb2RlRGF0YSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRUZXh0Q29sb3IodGhpcy5sb2FkaW5nID8gdW5kZWZpbmVkIDogdGhpcy52YWxpZGF0aW9uU3RhdGUsIHtcbiAgICAgICAgY2xhc3M6IHRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfSlcbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZW5EZWZhdWx0U2xvdCAoKTogKFZOb2RlIHwgbnVsbClbXSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB0aGlzLmdlblN3aXRjaCgpLFxuICAgICAgICB0aGlzLmdlbkxhYmVsKCksXG4gICAgICBdXG4gICAgfSxcbiAgICBnZW5Td2l0Y2ggKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHsgdGl0bGUsIC4uLnN3aXRjaEF0dHJzIH0gPSB0aGlzLmF0dHJzJFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtaW5wdXQtLXNlbGVjdGlvbi1jb250cm9sc19faW5wdXQnLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmdlbklucHV0KCdjaGVja2JveCcsIHtcbiAgICAgICAgICAuLi50aGlzLmF0dHJzLFxuICAgICAgICAgIC4uLnN3aXRjaEF0dHJzLFxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5nZW5SaXBwbGUodGhpcy5zZXRUZXh0Q29sb3IodGhpcy52YWxpZGF0aW9uU3RhdGUsIHtcbiAgICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgICAgbmFtZTogJ3RvdWNoJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGxlZnQ6IHRoaXMub25Td2lwZUxlZnQsXG4gICAgICAgICAgICAgIHJpZ2h0OiB0aGlzLm9uU3dpcGVSaWdodCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfV0sXG4gICAgICAgIH0pKSxcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1pbnB1dC0tc3dpdGNoX190cmFjaycsXG4gICAgICAgICAgLi4udGhpcy5zd2l0Y2hEYXRhLFxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1pbnB1dC0tc3dpdGNoX190aHVtYicsXG4gICAgICAgICAgLi4udGhpcy5zd2l0Y2hEYXRhLFxuICAgICAgICB9LCBbdGhpcy5nZW5Qcm9ncmVzcygpXSksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuUHJvZ3Jlc3MgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZGYWJUcmFuc2l0aW9uLCB7fSwgW1xuICAgICAgICB0aGlzLmxvYWRpbmcgPT09IGZhbHNlXG4gICAgICAgICAgPyBudWxsXG4gICAgICAgICAgOiB0aGlzLiRzbG90cy5wcm9ncmVzcyB8fCB0aGlzLiRjcmVhdGVFbGVtZW50KFZQcm9ncmVzc0NpcmN1bGFyLCB7XG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICBjb2xvcjogKHRoaXMubG9hZGluZyA9PT0gdHJ1ZSB8fCB0aGlzLmxvYWRpbmcgPT09ICcnKVxuICAgICAgICAgICAgICAgID8gKHRoaXMuY29sb3IgfHwgJ3ByaW1hcnknKVxuICAgICAgICAgICAgICAgIDogdGhpcy5sb2FkaW5nLFxuICAgICAgICAgICAgICBzaXplOiAxNixcbiAgICAgICAgICAgICAgd2lkdGg6IDIsXG4gICAgICAgICAgICAgIGluZGV0ZXJtaW5hdGU6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgXSlcbiAgICB9LFxuICAgIG9uU3dpcGVMZWZ0ICgpIHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSB0aGlzLm9uQ2hhbmdlKClcbiAgICB9LFxuICAgIG9uU3dpcGVSaWdodCAoKSB7XG4gICAgICBpZiAoIXRoaXMuaXNBY3RpdmUpIHRoaXMub25DaGFuZ2UoKVxuICAgIH0sXG4gICAgb25LZXlkb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICBpZiAoXG4gICAgICAgIChlLmtleUNvZGUgPT09IGtleUNvZGVzLmxlZnQgJiYgdGhpcy5pc0FjdGl2ZSkgfHxcbiAgICAgICAgKGUua2V5Q29kZSA9PT0ga2V5Q29kZXMucmlnaHQgJiYgIXRoaXMuaXNBY3RpdmUpXG4gICAgICApIHRoaXMub25DaGFuZ2UoKVxuICAgIH0sXG4gIH0sXG59KVxuIl19
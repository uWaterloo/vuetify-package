// Mixins
import { factory as GroupableFactory } from '../../mixins/groupable';
import { provide as RegistrableProvide } from '../../mixins/registrable';
// Utilities
import { getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
export default mixins(GroupableFactory('expansionPanels', 'v-expansion-panel', 'v-expansion-panels'), RegistrableProvide('expansionPanel', true)
/* @vue/component */
).extend({
    name: 'v-expansion-panel',
    props: {
        disabled: Boolean,
        readonly: Boolean,
    },
    data() {
        return {
            content: null,
            header: null,
            nextIsActive: false,
        };
    },
    computed: {
        classes() {
            return {
                'v-expansion-panel--active': this.isActive,
                'v-expansion-panel--next-active': this.nextIsActive,
                'v-expansion-panel--disabled': this.isDisabled,
                ...this.groupClasses,
            };
        },
        isDisabled() {
            return this.expansionPanels.disabled || this.disabled;
        },
        isReadonly() {
            return this.expansionPanels.readonly || this.readonly;
        },
    },
    methods: {
        registerContent(vm) {
            this.content = vm;
        },
        unregisterContent() {
            this.content = null;
        },
        registerHeader(vm) {
            this.header = vm;
            vm.$on('click', this.onClick);
        },
        unregisterHeader() {
            this.header = null;
        },
        onClick(e) {
            if (e.detail)
                this.header.$el.blur();
            this.$emit('click', e);
            this.isReadonly || this.isDisabled || this.toggle();
        },
        toggle() {
            this.$nextTick(() => this.$emit('change'));
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-expansion-panel',
            class: this.classes,
            attrs: {
                'aria-expanded': String(this.isActive),
            },
        }, getSlot(this));
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkV4cGFuc2lvblBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkV4cGFuc2lvblBhbmVsL1ZFeHBhbnNpb25QYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxTQUFTO0FBQ1QsT0FBTyxFQUFFLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3BFLE9BQU8sRUFBRSxPQUFPLElBQUksa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUV4RSxZQUFZO0FBQ1osT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzVDLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBUXRDLGVBQWUsTUFBTSxDQUNuQixnQkFBZ0IsQ0FBNkMsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsRUFDMUgsa0JBQWtCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDO0FBQzFDLG9CQUFvQjtDQUNyQixDQUFDLE1BQU0sQ0FBQztJQUNQLElBQUksRUFBRSxtQkFBbUI7SUFFekIsS0FBSyxFQUFFO1FBQ0wsUUFBUSxFQUFFLE9BQU87UUFDakIsUUFBUSxFQUFFLE9BQU87S0FDbEI7SUFFRCxJQUFJO1FBQ0YsT0FBTztZQUNMLE9BQU8sRUFBRSxJQUE2QztZQUN0RCxNQUFNLEVBQUUsSUFBNEM7WUFDcEQsWUFBWSxFQUFFLEtBQUs7U0FDcEIsQ0FBQTtJQUNILENBQUM7SUFFRCxRQUFRLEVBQUU7UUFDUixPQUFPO1lBQ0wsT0FBTztnQkFDTCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDMUMsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLFlBQVk7Z0JBQ25ELDZCQUE2QixFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUM5QyxHQUFHLElBQUksQ0FBQyxZQUFZO2FBQ3JCLENBQUE7UUFDSCxDQUFDO1FBQ0QsVUFBVTtZQUNSLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUN2RCxDQUFDO1FBQ0QsVUFBVTtZQUNSLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUN2RCxDQUFDO0tBQ0Y7SUFFRCxPQUFPLEVBQUU7UUFDUCxlQUFlLENBQUUsRUFBa0M7WUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUE7UUFDbkIsQ0FBQztRQUNELGlCQUFpQjtZQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO1FBQ3JCLENBQUM7UUFDRCxjQUFjLENBQUUsRUFBaUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7WUFDaEIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQy9CLENBQUM7UUFDRCxnQkFBZ0I7WUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtRQUNwQixDQUFDO1FBQ0QsT0FBTyxDQUFFLENBQWE7WUFDcEIsSUFBSSxDQUFDLENBQUMsTUFBTTtnQkFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUVyQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUV0QixJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQ3JELENBQUM7UUFDRCxNQUFNO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7UUFDNUMsQ0FBQztLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZCxXQUFXLEVBQUUsbUJBQW1CO1lBQ2hDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTztZQUNuQixLQUFLLEVBQUU7Z0JBQ0wsZUFBZSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ3ZDO1NBQ0YsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUNuQixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZFeHBhbnNpb25QYW5lbHMgZnJvbSAnLi9WRXhwYW5zaW9uUGFuZWxzJ1xuaW1wb3J0IFZFeHBhbnNpb25QYW5lbEhlYWRlciBmcm9tICcuL1ZFeHBhbnNpb25QYW5lbEhlYWRlcidcbmltcG9ydCBWRXhwYW5zaW9uUGFuZWxDb250ZW50IGZyb20gJy4vVkV4cGFuc2lvblBhbmVsQ29udGVudCdcblxuLy8gTWl4aW5zXG5pbXBvcnQgeyBmYWN0b3J5IGFzIEdyb3VwYWJsZUZhY3RvcnkgfSBmcm9tICcuLi8uLi9taXhpbnMvZ3JvdXBhYmxlJ1xuaW1wb3J0IHsgcHJvdmlkZSBhcyBSZWdpc3RyYWJsZVByb3ZpZGUgfSBmcm9tICcuLi8uLi9taXhpbnMvcmVnaXN0cmFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHsgZ2V0U2xvdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxudHlwZSBWRXhwYW5zaW9uUGFuZWxIZWFkZXJJbnN0YW5jZSA9IEluc3RhbmNlVHlwZTx0eXBlb2YgVkV4cGFuc2lvblBhbmVsSGVhZGVyPlxudHlwZSBWRXhwYW5zaW9uUGFuZWxDb250ZW50SW5zdGFuY2UgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIFZFeHBhbnNpb25QYW5lbENvbnRlbnQ+XG5cbmV4cG9ydCBkZWZhdWx0IG1peGlucyhcbiAgR3JvdXBhYmxlRmFjdG9yeTwnZXhwYW5zaW9uUGFuZWxzJywgdHlwZW9mIFZFeHBhbnNpb25QYW5lbHM+KCdleHBhbnNpb25QYW5lbHMnLCAndi1leHBhbnNpb24tcGFuZWwnLCAndi1leHBhbnNpb24tcGFuZWxzJyksXG4gIFJlZ2lzdHJhYmxlUHJvdmlkZSgnZXhwYW5zaW9uUGFuZWwnLCB0cnVlKVxuICAvKiBAdnVlL2NvbXBvbmVudCAqL1xuKS5leHRlbmQoe1xuICBuYW1lOiAndi1leHBhbnNpb24tcGFuZWwnLFxuXG4gIHByb3BzOiB7XG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgcmVhZG9ubHk6IEJvb2xlYW4sXG4gIH0sXG5cbiAgZGF0YSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnQ6IG51bGwgYXMgVkV4cGFuc2lvblBhbmVsQ29udGVudEluc3RhbmNlIHwgbnVsbCxcbiAgICAgIGhlYWRlcjogbnVsbCBhcyBWRXhwYW5zaW9uUGFuZWxIZWFkZXJJbnN0YW5jZSB8IG51bGwsXG4gICAgICBuZXh0SXNBY3RpdmU6IGZhbHNlLFxuICAgIH1cbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndi1leHBhbnNpb24tcGFuZWwtLWFjdGl2ZSc6IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgICd2LWV4cGFuc2lvbi1wYW5lbC0tbmV4dC1hY3RpdmUnOiB0aGlzLm5leHRJc0FjdGl2ZSxcbiAgICAgICAgJ3YtZXhwYW5zaW9uLXBhbmVsLS1kaXNhYmxlZCc6IHRoaXMuaXNEaXNhYmxlZCxcbiAgICAgICAgLi4udGhpcy5ncm91cENsYXNzZXMsXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0Rpc2FibGVkICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuc2lvblBhbmVscy5kaXNhYmxlZCB8fCB0aGlzLmRpc2FibGVkXG4gICAgfSxcbiAgICBpc1JlYWRvbmx5ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuc2lvblBhbmVscy5yZWFkb25seSB8fCB0aGlzLnJlYWRvbmx5XG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgcmVnaXN0ZXJDb250ZW50ICh2bTogVkV4cGFuc2lvblBhbmVsQ29udGVudEluc3RhbmNlKSB7XG4gICAgICB0aGlzLmNvbnRlbnQgPSB2bVxuICAgIH0sXG4gICAgdW5yZWdpc3RlckNvbnRlbnQgKCkge1xuICAgICAgdGhpcy5jb250ZW50ID0gbnVsbFxuICAgIH0sXG4gICAgcmVnaXN0ZXJIZWFkZXIgKHZtOiBWRXhwYW5zaW9uUGFuZWxIZWFkZXJJbnN0YW5jZSkge1xuICAgICAgdGhpcy5oZWFkZXIgPSB2bVxuICAgICAgdm0uJG9uKCdjbGljaycsIHRoaXMub25DbGljaylcbiAgICB9LFxuICAgIHVucmVnaXN0ZXJIZWFkZXIgKCkge1xuICAgICAgdGhpcy5oZWFkZXIgPSBudWxsXG4gICAgfSxcbiAgICBvbkNsaWNrIChlOiBNb3VzZUV2ZW50KSB7XG4gICAgICBpZiAoZS5kZXRhaWwpIHRoaXMuaGVhZGVyIS4kZWwuYmx1cigpXG5cbiAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgZSlcblxuICAgICAgdGhpcy5pc1JlYWRvbmx5IHx8IHRoaXMuaXNEaXNhYmxlZCB8fCB0aGlzLnRvZ2dsZSgpXG4gICAgfSxcbiAgICB0b2dnbGUgKCkge1xuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gdGhpcy4kZW1pdCgnY2hhbmdlJykpXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1leHBhbnNpb24tcGFuZWwnLFxuICAgICAgY2xhc3M6IHRoaXMuY2xhc3NlcyxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogU3RyaW5nKHRoaXMuaXNBY3RpdmUpLFxuICAgICAgfSxcbiAgICB9LCBnZXRTbG90KHRoaXMpKVxuICB9LFxufSlcbiJdfQ==
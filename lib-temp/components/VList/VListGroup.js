// Styles
import './VListGroup.sass';
// Components
import VIcon from '../VIcon';
import VListItem from './VListItem';
import VListItemIcon from './VListItemIcon';
// Mixins
import BindsAttrs from '../../mixins/binds-attrs';
import Bootable from '../../mixins/bootable';
import Colorable from '../../mixins/colorable';
import Toggleable from '../../mixins/toggleable';
import { inject as RegistrableInject } from '../../mixins/registrable';
// Directives
import ripple from '../../directives/ripple';
// Transitions
import { VExpandTransition } from '../transitions';
// Utils
import mixins from '../../util/mixins';
import { getSlot } from '../../util/helpers';
const baseMixins = mixins(BindsAttrs, Bootable, Colorable, RegistrableInject('list'), Toggleable);
export default baseMixins.extend().extend({
    name: 'v-list-group',
    directives: { ripple },
    props: {
        activeClass: {
            type: String,
            default: '',
        },
        appendIcon: {
            type: String,
            default: '$expand',
        },
        color: {
            type: String,
            default: 'primary',
        },
        disabled: Boolean,
        group: [String, RegExp],
        noAction: Boolean,
        prependIcon: String,
        ripple: {
            type: [Boolean, Object],
            default: true,
        },
        subGroup: Boolean,
    },
    computed: {
        classes() {
            return {
                'v-list-group--active': this.isActive,
                'v-list-group--disabled': this.disabled,
                'v-list-group--no-action': this.noAction,
                'v-list-group--sub-group': this.subGroup,
            };
        },
    },
    watch: {
        isActive(val) {
            /* istanbul ignore else */
            if (!this.subGroup && val) {
                this.list && this.list.listClick(this._uid);
            }
        },
        $route: 'onRouteChange',
    },
    created() {
        this.list && this.list.register(this);
        if (this.group &&
            this.$route &&
            this.value == null) {
            this.isActive = this.matchRoute(this.$route.path);
        }
    },
    beforeDestroy() {
        this.list && this.list.unregister(this);
    },
    methods: {
        click(e) {
            if (this.disabled)
                return;
            this.isBooted = true;
            this.$emit('click', e);
            this.$nextTick(() => (this.isActive = !this.isActive));
        },
        genIcon(icon) {
            return this.$createElement(VIcon, icon);
        },
        genAppendIcon() {
            const icon = !this.subGroup ? this.appendIcon : false;
            if (!icon && !this.$slots.appendIcon)
                return null;
            return this.$createElement(VListItemIcon, {
                staticClass: 'v-list-group__header__append-icon',
            }, [
                this.$slots.appendIcon || this.genIcon(icon),
            ]);
        },
        genHeader() {
            return this.$createElement(VListItem, {
                staticClass: 'v-list-group__header',
                attrs: {
                    'aria-expanded': String(this.isActive),
                    role: 'button',
                },
                class: {
                    [this.activeClass]: this.isActive,
                },
                props: {
                    inputValue: this.isActive,
                },
                directives: [{
                        name: 'ripple',
                        value: this.ripple,
                    }],
                on: {
                    ...this.listeners$,
                    click: this.click,
                },
            }, [
                this.genPrependIcon(),
                this.$slots.activator,
                this.genAppendIcon(),
            ]);
        },
        genItems() {
            return this.showLazyContent(() => [
                this.$createElement('div', {
                    staticClass: 'v-list-group__items',
                    directives: [{
                            name: 'show',
                            value: this.isActive,
                        }],
                }, getSlot(this)),
            ]);
        },
        genPrependIcon() {
            const icon = this.subGroup && this.prependIcon == null
                ? '$subgroup'
                : this.prependIcon;
            if (!icon && !this.$slots.prependIcon)
                return null;
            return this.$createElement(VListItemIcon, {
                staticClass: 'v-list-group__header__prepend-icon',
            }, [
                this.$slots.prependIcon || this.genIcon(icon),
            ]);
        },
        onRouteChange(to) {
            /* istanbul ignore if */
            if (!this.group)
                return;
            const isActive = this.matchRoute(to.path);
            /* istanbul ignore else */
            if (isActive && this.isActive !== isActive) {
                this.list && this.list.listClick(this._uid);
            }
            this.isActive = isActive;
        },
        toggle(uid) {
            const isActive = this._uid === uid;
            if (isActive)
                this.isBooted = true;
            this.$nextTick(() => (this.isActive = isActive));
        },
        matchRoute(to) {
            return to.match(this.group) !== null;
        },
    },
    render(h) {
        return h('div', this.setTextColor(this.isActive && this.color, {
            staticClass: 'v-list-group',
            class: this.classes,
        }), [
            this.genHeader(),
            h(VExpandTransition, this.genItems()),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxpc3RHcm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZMaXN0L1ZMaXN0R3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sbUJBQW1CLENBQUE7QUFFMUIsYUFBYTtBQUNiLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUE7QUFDbkMsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUE7QUFFM0MsU0FBUztBQUNULE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sUUFBUSxNQUFNLHVCQUF1QixDQUFBO0FBQzVDLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sVUFBVSxNQUFNLHlCQUF5QixDQUFBO0FBQ2hELE9BQU8sRUFBRSxNQUFNLElBQUksaUJBQWlCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUV0RSxhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0seUJBQXlCLENBQUE7QUFFNUMsY0FBYztBQUNkLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRWxELFFBQVE7QUFDUixPQUFPLE1BQXNCLE1BQU0sbUJBQW1CLENBQUE7QUFDdEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBTTVDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsVUFBVSxFQUNWLFFBQVEsRUFDUixTQUFTLEVBQ1QsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQ3pCLFVBQVUsQ0FDWCxDQUFBO0FBWUQsZUFBZSxVQUFVLENBQUMsTUFBTSxFQUFXLENBQUMsTUFBTSxDQUFDO0lBQ2pELElBQUksRUFBRSxjQUFjO0lBRXBCLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRTtJQUV0QixLQUFLLEVBQUU7UUFDTCxXQUFXLEVBQUU7WUFDWCxJQUFJLEVBQUUs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QUFBO1FBQ2xELENBQUM7UUFDRCxVQUFVLENBQUUsRUFBVTtZQUNwQixPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQTtRQUN0QyxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUM3RCxXQUFXLEVBQUUsY0FBYztZQUMzQixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDcEIsQ0FBQyxFQUFFO1lBQ0YsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixDQUFDLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3RDLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WTGlzdEdyb3VwLnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWSWNvbiBmcm9tICcuLi9WSWNvbidcbmltcG9ydCBWTGlzdCBmcm9tICcuL1ZMaXN0J1xuaW1wb3J0IFZMaXN0SXRlbSBmcm9tICcuL1ZMaXN0SXRlbSdcbmltcG9ydCBWTGlzdEl0ZW1JY29uIGZyb20gJy4vVkxpc3RJdGVtSWNvbidcblxuLy8gTWl4aW5zXG5pbXBvcnQgQmluZHNBdHRycyBmcm9tICcuLi8uLi9taXhpbnMvYmluZHMtYXR0cnMnXG5pbXBvcnQgQm9vdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2Jvb3RhYmxlJ1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IFRvZ2dsZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RvZ2dsZWFibGUnXG5pbXBvcnQgeyBpbmplY3QgYXMgUmVnaXN0cmFibGVJbmplY3QgfSBmcm9tICcuLi8uLi9taXhpbnMvcmVnaXN0cmFibGUnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCByaXBwbGUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yaXBwbGUnXG5cbi8vIFRyYW5zaXRpb25zXG5pbXBvcnQgeyBWRXhwYW5kVHJhbnNpdGlvbiB9IGZyb20gJy4uL3RyYW5zaXRpb25zJ1xuXG4vLyBVdGlsc1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBSb3V0ZSB9IGZyb20gJ3Z1ZS1yb3V0ZXInXG5cbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIEJpbmRzQXR0cnMsXG4gIEJvb3RhYmxlLFxuICBDb2xvcmFibGUsXG4gIFJlZ2lzdHJhYmxlSW5qZWN0KCdsaXN0JyksXG4gIFRvZ2dsZWFibGVcbilcblxudHlwZSBWTGlzdEluc3RhbmNlID0gSW5zdGFuY2VUeXBlPHR5cGVvZiBWTGlzdD5cblxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBFeHRyYWN0VnVlPHR5cGVvZiBiYXNlTWl4aW5zPiB7XG4gIGxpc3Q6IFZMaXN0SW5zdGFuY2VcbiAgJHJlZnM6IHtcbiAgICBncm91cDogSFRNTEVsZW1lbnRcbiAgfVxuICAkcm91dGU6IFJvdXRlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VNaXhpbnMuZXh0ZW5kPG9wdGlvbnM+KCkuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtbGlzdC1ncm91cCcsXG5cbiAgZGlyZWN0aXZlczogeyByaXBwbGUgfSxcblxuICBwcm9wczoge1xuICAgIGFjdGl2ZUNsYXNzOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJyxcbiAgICB9LFxuICAgIGFwcGVuZEljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckZXhwYW5kJyxcbiAgICB9LFxuICAgIGNvbG9yOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAncHJpbWFyeScsXG4gICAgfSxcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBncm91cDogW1N0cmluZywgUmVnRXhwXSxcbiAgICBub0FjdGlvbjogQm9vbGVhbixcbiAgICBwcmVwZW5kSWNvbjogU3RyaW5nLFxuICAgIHJpcHBsZToge1xuICAgICAgdHlwZTogW0Jvb2xlYW4sIE9iamVjdF0sXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgc3ViR3JvdXA6IEJvb2xlYW4sXG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3YtbGlzdC1ncm91cC0tYWN0aXZlJzogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgJ3YtbGlzdC1ncm91cC0tZGlzYWJsZWQnOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAndi1saXN0LWdyb3VwLS1uby1hY3Rpb24nOiB0aGlzLm5vQWN0aW9uLFxuICAgICAgICAndi1saXN0LWdyb3VwLS1zdWItZ3JvdXAnOiB0aGlzLnN1Ykdyb3VwLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBpc0FjdGl2ZSAodmFsOiBib29sZWFuKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKCF0aGlzLnN1Ykdyb3VwICYmIHZhbCkge1xuICAgICAgICB0aGlzLmxpc3QgJiYgdGhpcy5saXN0Lmxpc3RDbGljayh0aGlzLl91aWQpXG4gICAgICB9XG4gICAgfSxcbiAgICAkcm91dGU6ICdvblJvdXRlQ2hhbmdlJyxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICB0aGlzLmxpc3QgJiYgdGhpcy5saXN0LnJlZ2lzdGVyKHRoaXMpXG5cbiAgICBpZiAodGhpcy5ncm91cCAmJlxuICAgICAgdGhpcy4kcm91dGUgJiZcbiAgICAgIHRoaXMudmFsdWUgPT0gbnVsbFxuICAgICkge1xuICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRoaXMubWF0Y2hSb3V0ZSh0aGlzLiRyb3V0ZS5wYXRoKVxuICAgIH1cbiAgfSxcblxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICB0aGlzLmxpc3QgJiYgdGhpcy5saXN0LnVucmVnaXN0ZXIodGhpcylcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgY2xpY2sgKGU6IEV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMuaXNCb290ZWQgPSB0cnVlXG5cbiAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgZSlcbiAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+ICh0aGlzLmlzQWN0aXZlID0gIXRoaXMuaXNBY3RpdmUpKVxuICAgIH0sXG4gICAgZ2VuSWNvbiAoaWNvbjogc3RyaW5nIHwgZmFsc2UpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWSWNvbiwgaWNvbilcbiAgICB9LFxuICAgIGdlbkFwcGVuZEljb24gKCk6IFZOb2RlIHwgbnVsbCB7XG4gICAgICBjb25zdCBpY29uID0gIXRoaXMuc3ViR3JvdXAgPyB0aGlzLmFwcGVuZEljb24gOiBmYWxzZVxuXG4gICAgICBpZiAoIWljb24gJiYgIXRoaXMuJHNsb3RzLmFwcGVuZEljb24pIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZMaXN0SXRlbUljb24sIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWxpc3QtZ3JvdXBfX2hlYWRlcl9fYXBwZW5kLWljb24nLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLiRzbG90cy5hcHBlbmRJY29uIHx8IHRoaXMuZ2VuSWNvbihpY29uKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5IZWFkZXIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZMaXN0SXRlbSwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtbGlzdC1ncm91cF9faGVhZGVyJyxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAnYXJpYS1leHBhbmRlZCc6IFN0cmluZyh0aGlzLmlzQWN0aXZlKSxcbiAgICAgICAgICByb2xlOiAnYnV0dG9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICBbdGhpcy5hY3RpdmVDbGFzc106IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgaW5wdXRWYWx1ZTogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgfSxcbiAgICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgICBuYW1lOiAncmlwcGxlJyxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5yaXBwbGUsXG4gICAgICAgIH1dLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIC4uLnRoaXMubGlzdGVuZXJzJCxcbiAgICAgICAgICBjbGljazogdGhpcy5jbGljayxcbiAgICAgICAgfSxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5QcmVwZW5kSWNvbigpLFxuICAgICAgICB0aGlzLiRzbG90cy5hY3RpdmF0b3IsXG4gICAgICAgIHRoaXMuZ2VuQXBwZW5kSWNvbigpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkl0ZW1zICgpOiBWTm9kZVtdIHtcbiAgICAgIHJldHVybiB0aGlzLnNob3dMYXp5Q29udGVudCgoKSA9PiBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtbGlzdC1ncm91cF9faXRlbXMnLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgICBuYW1lOiAnc2hvdycsXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgICB9XSxcbiAgICAgICAgfSwgZ2V0U2xvdCh0aGlzKSksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuUHJlcGVuZEljb24gKCk6IFZOb2RlIHwgbnVsbCB7XG4gICAgICBjb25zdCBpY29uID0gdGhpcy5zdWJHcm91cCAmJiB0aGlzLnByZXBlbmRJY29uID09IG51bGxcbiAgICAgICAgPyAnJHN1Ymdyb3VwJ1xuICAgICAgICA6IHRoaXMucHJlcGVuZEljb25cblxuICAgICAgaWYgKCFpY29uICYmICF0aGlzLiRzbG90cy5wcmVwZW5kSWNvbikgcmV0dXJuIG51bGxcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkxpc3RJdGVtSWNvbiwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtbGlzdC1ncm91cF9faGVhZGVyX19wcmVwZW5kLWljb24nLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLiRzbG90cy5wcmVwZW5kSWNvbiB8fCB0aGlzLmdlbkljb24oaWNvbiksXG4gICAgICBdKVxuICAgIH0sXG4gICAgb25Sb3V0ZUNoYW5nZSAodG86IFJvdXRlKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghdGhpcy5ncm91cCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGlzQWN0aXZlID0gdGhpcy5tYXRjaFJvdXRlKHRvLnBhdGgpXG5cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAoaXNBY3RpdmUgJiYgdGhpcy5pc0FjdGl2ZSAhPT0gaXNBY3RpdmUpIHtcbiAgICAgICAgdGhpcy5saXN0ICYmIHRoaXMubGlzdC5saXN0Q2xpY2sodGhpcy5fdWlkKVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlzQWN0aXZlID0gaXNBY3RpdmVcbiAgICB9LFxuICAgIHRvZ2dsZSAodWlkOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IGlzQWN0aXZlID0gdGhpcy5fdWlkID09PSB1aWRcblxuICAgICAgaWYgKGlzQWN0aXZlKSB0aGlzLmlzQm9vdGVkID0gdHJ1ZVxuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gKHRoaXMuaXNBY3RpdmUgPSBpc0FjdGl2ZSkpXG4gICAgfSxcbiAgICBtYXRjaFJvdXRlICh0bzogc3RyaW5nKSB7XG4gICAgICByZXR1cm4gdG8ubWF0Y2godGhpcy5ncm91cCkgIT09IG51bGxcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICByZXR1cm4gaCgnZGl2JywgdGhpcy5zZXRUZXh0Q29sb3IodGhpcy5pc0FjdGl2ZSAmJiB0aGlzLmNvbG9yLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtbGlzdC1ncm91cCcsXG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgIH0pLCBbXG4gICAgICB0aGlzLmdlbkhlYWRlcigpLFxuICAgICAgaChWRXhwYW5kVHJhbnNpdGlvbiwgdGhpcy5nZW5JdGVtcygpKSxcbiAgICBdKVxuICB9LFxufSlcbiJdfQ==
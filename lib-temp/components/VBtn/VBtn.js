// Styles
import './VBtn.sass';
// Extensions
import VSheet from '../VSheet';
// Components
import VProgressCircular from '../VProgressCircular';
// Mixins
import { factory as GroupableFactory } from '../../mixins/groupable';
import { factory as ToggleableFactory } from '../../mixins/toggleable';
import Elevatable from '../../mixins/elevatable';
import Positionable from '../../mixins/positionable';
import Routable from '../../mixins/routable';
import Sizeable from '../../mixins/sizeable';
// Utilities
import mixins from '../../util/mixins';
import { breaking } from '../../util/console';
const baseMixins = mixins(VSheet, Routable, Positionable, Sizeable, GroupableFactory('btnToggle'), ToggleableFactory('inputValue')
/* @vue/component */
);
export default baseMixins.extend().extend({
    name: 'v-btn',
    props: {
        activeClass: {
            type: String,
            default() {
                if (!this.btnToggle)
                    return '';
                return this.btnToggle.activeClass;
            },
        },
        block: Boolean,
        depressed: Boolean,
        fab: Boolean,
        icon: Boolean,
        loading: Boolean,
        outlined: Boolean,
        plain: Boolean,
        retainFocusOnClick: Boolean,
        rounded: Boolean,
        tag: {
            type: String,
            default: 'button',
        },
        text: Boolean,
        tile: Boolean,
        type: {
            type: String,
            default: 'button',
        },
        value: null,
    },
    data: () => ({
        proxyClass: 'v-btn--active',
    }),
    computed: {
        classes() {
            return {
                'v-btn': true,
                ...Routable.options.computed.classes.call(this),
                'v-btn--absolute': this.absolute,
                'v-btn--block': this.block,
                'v-btn--bottom': this.bottom,
                'v-btn--disabled': this.disabled,
                'v-btn--is-elevated': this.isElevated,
                'v-btn--fab': this.fab,
                'v-btn--fixed': this.fixed,
                'v-btn--has-bg': this.hasBg,
                'v-btn--icon': this.icon,
                'v-btn--left': this.left,
                'v-btn--loading': this.loading,
                'v-btn--outlined': this.outlined,
                'v-btn--plain': this.plain,
                'v-btn--right': this.right,
                'v-btn--round': this.isRound,
                'v-btn--rounded': this.rounded,
                'v-btn--router': this.to,
                'v-btn--text': this.text,
                'v-btn--tile': this.tile,
                'v-btn--top': this.top,
                ...this.themeClasses,
                ...this.groupClasses,
                ...this.elevationClasses,
                ...this.sizeableClasses,
            };
        },
        computedElevation() {
            if (this.disabled)
                return undefined;
            return Elevatable.options.computed.computedElevation.call(this);
        },
        computedRipple() {
            const defaultRipple = this.icon || this.fab ? { circle: true } : true;
            if (this.disabled)
                return false;
            else
                return this.ripple ?? defaultRipple;
        },
        hasBg() {
            return !this.text && !this.plain && !this.outlined && !this.icon;
        },
        isElevated() {
            return Boolean(!this.icon &&
                !this.text &&
                !this.outlined &&
                !this.depressed &&
                !this.disabled &&
                !this.plain &&
                (this.elevation == null || Number(this.elevation) > 0));
        },
        isRound() {
            return Boolean(this.icon ||
                this.fab);
        },
        styles() {
            return {
                ...this.measurableStyles,
            };
        },
    },
    created() {
        const breakingProps = [
            ['flat', 'text'],
            ['outline', 'outlined'],
            ['round', 'rounded'],
        ];
        /* istanbul ignore next */
        breakingProps.forEach(([original, replacement]) => {
            if (this.$attrs.hasOwnProperty(original))
                breaking(original, replacement, this);
        });
    },
    methods: {
        click(e) {
            // TODO: Remove this in v3
            !this.retainFocusOnClick && !this.fab && e.detail && this.$el.blur();
            this.$emit('click', e);
            this.btnToggle && this.toggle();
        },
        genContent() {
            return this.$createElement('span', {
                staticClass: 'v-btn__content',
            }, this.$slots.default);
        },
        genLoader() {
            return this.$createElement('span', {
                class: 'v-btn__loader',
            }, this.$slots.loader || [this.$createElement(VProgressCircular, {
                    props: {
                        indeterminate: true,
                        size: 23,
                        width: 2,
                    },
                })]);
        },
    },
    render(h) {
        const children = [
            this.genContent(),
            this.loading && this.genLoader(),
        ];
        const { tag, data } = this.generateRouteLink();
        const setColor = this.hasBg
            ? this.setBackgroundColor
            : this.setTextColor;
        if (tag === 'button') {
            data.attrs.type = this.type;
            data.attrs.disabled = this.disabled;
        }
        data.attrs.value = ['string', 'number'].includes(typeof this.value)
            ? this.value
            : JSON.stringify(this.value);
        return h(tag, this.disabled ? data : setColor(this.color, data), children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkJ0bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZCdG4vVkJ0bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxhQUFhLENBQUE7QUFFcEIsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLFdBQVcsQ0FBQTtBQUU5QixhQUFhO0FBQ2IsT0FBTyxpQkFBaUIsTUFBTSxzQkFBc0IsQ0FBQTtBQUVwRCxTQUFTO0FBQ1QsT0FBTyxFQUFFLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3BFLE9BQU8sRUFBRSxPQUFPLElBQUksaUJBQWlCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUN0RSxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFlBQVksTUFBTSwyQkFBMkIsQ0FBQTtBQUNwRCxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUM1QyxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUU1QyxZQUFZO0FBQ1osT0FBTyxNQUFzQixNQUFNLG1CQUFtQixDQUFBO0FBQ3RELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQU83QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLE1BQU0sRUFDTixRQUFRLEVBQ1IsWUFBWSxFQUNaLFFBQVEsRUFDUixnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFDN0IsaUJBQWlCLENBQUMsWUFBWSxDQUFDO0FBQy9CLG9CQUFvQjtDQUNyQixDQUFBO0FBS0QsZUFBZSxVQUFVLENBQUMsTUFBTSxFQUFXLENBQUMsTUFBTSxDQUFDO0lBQ2pELElBQUksRUFBRSxPQUFPO0lBRWIsS0FBSyxFQUFFO1FBQ0wsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPO2dCQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztvQkFBRSxPQUFPLEVBQUUsQ0FBQTtn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R0FBRyxJQUFJLENBQUMsS0FBSztZQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQjtZQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQTtRQUVyQixJQUFJLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDcEIsSUFBSSxDQUFDLEtBQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQTtZQUM1QixJQUFJLENBQUMsS0FBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO1NBQ3JDO1FBQ0QsSUFBSSxDQUFDLEtBQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNsRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFDWixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFFOUIsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDNUUsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZCdG4uc2FzcydcblxuLy8gRXh0ZW5zaW9uc1xuaW1wb3J0IFZTaGVldCBmcm9tICcuLi9WU2hlZXQnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWUHJvZ3Jlc3NDaXJjdWxhciBmcm9tICcuLi9WUHJvZ3Jlc3NDaXJjdWxhcidcblxuLy8gTWl4aW5zXG5pbXBvcnQgeyBmYWN0b3J5IGFzIEdyb3VwYWJsZUZhY3RvcnkgfSBmcm9tICcuLi8uLi9taXhpbnMvZ3JvdXBhYmxlJ1xuaW1wb3J0IHsgZmFjdG9yeSBhcyBUb2dnbGVhYmxlRmFjdG9yeSB9IGZyb20gJy4uLy4uL21peGlucy90b2dnbGVhYmxlJ1xuaW1wb3J0IEVsZXZhdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2VsZXZhdGFibGUnXG5pbXBvcnQgUG9zaXRpb25hYmxlIGZyb20gJy4uLy4uL21peGlucy9wb3NpdGlvbmFibGUnXG5pbXBvcnQgUm91dGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3JvdXRhYmxlJ1xuaW1wb3J0IFNpemVhYmxlIGZyb20gJy4uLy4uL21peGlucy9zaXplYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zLCB7IEV4dHJhY3RWdWUgfSBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGJyZWFraW5nIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yLCBQcm9wVHlwZSB9IGZyb20gJ3Z1ZS90eXBlcy9vcHRpb25zJ1xuaW1wb3J0IHsgUmlwcGxlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvcmlwcGxlJ1xuXG5jb25zdCBiYXNlTWl4aW5zID0gbWl4aW5zKFxuICBWU2hlZXQsXG4gIFJvdXRhYmxlLFxuICBQb3NpdGlvbmFibGUsXG4gIFNpemVhYmxlLFxuICBHcm91cGFibGVGYWN0b3J5KCdidG5Ub2dnbGUnKSxcbiAgVG9nZ2xlYWJsZUZhY3RvcnkoJ2lucHV0VmFsdWUnKVxuICAvKiBAdnVlL2NvbXBvbmVudCAqL1xuKVxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBFeHRyYWN0VnVlPHR5cGVvZiBiYXNlTWl4aW5zPiB7XG4gICRlbDogSFRNTEVsZW1lbnRcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQ8b3B0aW9ucz4oKS5leHRlbmQoe1xuICBuYW1lOiAndi1idG4nLFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aXZlQ2xhc3M6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICAgIGlmICghdGhpcy5idG5Ub2dnbGUpIHJldHVybiAnJ1xuXG4gICAgICAgIHJldHVybiB0aGlzLmJ0blRvZ2dsZS5hY3RpdmVDbGFzc1xuICAgICAgfSxcbiAgICB9IGFzIGFueSBhcyBQcm9wVmFsaWRhdG9yPHN0cmluZz4sXG4gICAgYmxvY2s6IEJvb2xlYW4sXG4gICAgZGVwcmVzc2VkOiBCb29sZWFuLFxuICAgIGZhYjogQm9vbGVhbixcbiAgICBpY29uOiBCb29sZWFuLFxuICAgIGxvYWRpbmc6IEJvb2xlYW4sXG4gICAgb3V0bGluZWQ6IEJvb2xlYW4sXG4gICAgcGxhaW46IEJvb2xlYW4sXG4gICAgcmV0YWluRm9jdXNPbkNsaWNrOiBCb29sZWFuLFxuICAgIHJvdW5kZWQ6IEJvb2xlYW4sXG4gICAgdGFnOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnYnV0dG9uJyxcbiAgICB9LFxuICAgIHRleHQ6IEJvb2xlYW4sXG4gICAgdGlsZTogQm9vbGVhbixcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnYnV0dG9uJyxcbiAgICB9LFxuICAgIHZhbHVlOiBudWxsIGFzIGFueSBhcyBQcm9wVHlwZTxhbnk+LFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgcHJveHlDbGFzczogJ3YtYnRuLS1hY3RpdmUnLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IGFueSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndi1idG4nOiB0cnVlLFxuICAgICAgICAuLi5Sb3V0YWJsZS5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtYnRuLS1hYnNvbHV0ZSc6IHRoaXMuYWJzb2x1dGUsXG4gICAgICAgICd2LWJ0bi0tYmxvY2snOiB0aGlzLmJsb2NrLFxuICAgICAgICAndi1idG4tLWJvdHRvbSc6IHRoaXMuYm90dG9tLFxuICAgICAgICAndi1idG4tLWRpc2FibGVkJzogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgJ3YtYnRuLS1pcy1lbGV2YXRlZCc6IHRoaXMuaXNFbGV2YXRlZCxcbiAgICAgICAgJ3YtYnRuLS1mYWInOiB0aGlzLmZhYixcbiAgICAgICAgJ3YtYnRuLS1maXhlZCc6IHRoaXMuZml4ZWQsXG4gICAgICAgICd2LWJ0bi0taGFzLWJnJzogdGhpcy5oYXNCZyxcbiAgICAgICAgJ3YtYnRuLS1pY29uJzogdGhpcy5pY29uLFxuICAgICAgICAndi1idG4tLWxlZnQnOiB0aGlzLmxlZnQsXG4gICAgICAgICd2LWJ0bi0tbG9hZGluZyc6IHRoaXMubG9hZGluZyxcbiAgICAgICAgJ3YtYnRuLS1vdXRsaW5lZCc6IHRoaXMub3V0bGluZWQsXG4gICAgICAgICd2LWJ0bi0tcGxhaW4nOiB0aGlzLnBsYWluLFxuICAgICAgICAndi1idG4tLXJpZ2h0JzogdGhpcy5yaWdodCxcbiAgICAgICAgJ3YtYnRuLS1yb3VuZCc6IHRoaXMuaXNSb3VuZCxcbiAgICAgICAgJ3YtYnRuLS1yb3VuZGVkJzogdGhpcy5yb3VuZGVkLFxuICAgICAgICAndi1idG4tLXJvdXRlcic6IHRoaXMudG8sXG4gICAgICAgICd2LWJ0bi0tdGV4dCc6IHRoaXMudGV4dCxcbiAgICAgICAgJ3YtYnRuLS10aWxlJzogdGhpcy50aWxlLFxuICAgICAgICAndi1idG4tLXRvcCc6IHRoaXMudG9wLFxuICAgICAgICAuLi50aGlzLnRoZW1lQ2xhc3NlcyxcbiAgICAgICAgLi4udGhpcy5ncm91cENsYXNzZXMsXG4gICAgICAgIC4uLnRoaXMuZWxldmF0aW9uQ2xhc3NlcyxcbiAgICAgICAgLi4udGhpcy5zaXplYWJsZUNsYXNzZXMsXG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZEVsZXZhdGlvbiAoKTogc3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICAgIHJldHVybiBFbGV2YXRhYmxlLm9wdGlvbnMuY29tcHV0ZWQuY29tcHV0ZWRFbGV2YXRpb24uY2FsbCh0aGlzKVxuICAgIH0sXG4gICAgY29tcHV0ZWRSaXBwbGUgKCk6IFJpcHBsZU9wdGlvbnMgfCBib29sZWFuIHtcbiAgICAgIGNvbnN0IGRlZmF1bHRSaXBwbGUgPSB0aGlzLmljb24gfHwgdGhpcy5mYWIgPyB7IGNpcmNsZTogdHJ1ZSB9IDogdHJ1ZVxuICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybiBmYWxzZVxuICAgICAgZWxzZSByZXR1cm4gdGhpcy5yaXBwbGUgPz8gZGVmYXVsdFJpcHBsZVxuICAgIH0sXG4gICAgaGFzQmcgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuICF0aGlzLnRleHQgJiYgIXRoaXMucGxhaW4gJiYgIXRoaXMub3V0bGluZWQgJiYgIXRoaXMuaWNvblxuICAgIH0sXG4gICAgaXNFbGV2YXRlZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gQm9vbGVhbihcbiAgICAgICAgIXRoaXMuaWNvbiAmJlxuICAgICAgICAhdGhpcy50ZXh0ICYmXG4gICAgICAgICF0aGlzLm91dGxpbmVkICYmXG4gICAgICAgICF0aGlzLmRlcHJlc3NlZCAmJlxuICAgICAgICAhdGhpcy5kaXNhYmxlZCAmJlxuICAgICAgICAhdGhpcy5wbGFpbiAmJlxuICAgICAgICAodGhpcy5lbGV2YXRpb24gPT0gbnVsbCB8fCBOdW1iZXIodGhpcy5lbGV2YXRpb24pID4gMClcbiAgICAgIClcbiAgICB9LFxuICAgIGlzUm91bmQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIEJvb2xlYW4oXG4gICAgICAgIHRoaXMuaWNvbiB8fFxuICAgICAgICB0aGlzLmZhYlxuICAgICAgKVxuICAgIH0sXG4gICAgc3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udGhpcy5tZWFzdXJhYmxlU3R5bGVzLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgY3JlYXRlZCAoKSB7XG4gICAgY29uc3QgYnJlYWtpbmdQcm9wcyA9IFtcbiAgICAgIFsnZmxhdCcsICd0ZXh0J10sXG4gICAgICBbJ291dGxpbmUnLCAnb3V0bGluZWQnXSxcbiAgICAgIFsncm91bmQnLCAncm91bmRlZCddLFxuICAgIF1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYnJlYWtpbmdQcm9wcy5mb3JFYWNoKChbb3JpZ2luYWwsIHJlcGxhY2VtZW50XSkgPT4ge1xuICAgICAgaWYgKHRoaXMuJGF0dHJzLmhhc093blByb3BlcnR5KG9yaWdpbmFsKSkgYnJlYWtpbmcob3JpZ2luYWwsIHJlcGxhY2VtZW50LCB0aGlzKVxuICAgIH0pXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGNsaWNrIChlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyBpbiB2M1xuICAgICAgIXRoaXMucmV0YWluRm9jdXNPbkNsaWNrICYmICF0aGlzLmZhYiAmJiBlLmRldGFpbCAmJiB0aGlzLiRlbC5ibHVyKClcbiAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgZSlcblxuICAgICAgdGhpcy5idG5Ub2dnbGUgJiYgdGhpcy50b2dnbGUoKVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1idG5fX2NvbnRlbnQnLFxuICAgICAgfSwgdGhpcy4kc2xvdHMuZGVmYXVsdClcbiAgICB9LFxuICAgIGdlbkxvYWRlciAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7XG4gICAgICAgIGNsYXNzOiAndi1idG5fX2xvYWRlcicsXG4gICAgICB9LCB0aGlzLiRzbG90cy5sb2FkZXIgfHwgW3RoaXMuJGNyZWF0ZUVsZW1lbnQoVlByb2dyZXNzQ2lyY3VsYXIsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBpbmRldGVybWluYXRlOiB0cnVlLFxuICAgICAgICAgIHNpemU6IDIzLFxuICAgICAgICAgIHdpZHRoOiAyLFxuICAgICAgICB9LFxuICAgICAgfSldKVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gW1xuICAgICAgdGhpcy5nZW5Db250ZW50KCksXG4gICAgICB0aGlzLmxvYWRpbmcgJiYgdGhpcy5nZW5Mb2FkZXIoKSxcbiAgICBdXG4gICAgY29uc3QgeyB0YWcsIGRhdGEgfSA9IHRoaXMuZ2VuZXJhdGVSb3V0ZUxpbmsoKVxuICAgIGNvbnN0IHNldENvbG9yID0gdGhpcy5oYXNCZ1xuICAgICAgPyB0aGlzLnNldEJhY2tncm91bmRDb2xvclxuICAgICAgOiB0aGlzLnNldFRleHRDb2xvclxuXG4gICAgaWYgKHRhZyA9PT0gJ2J1dHRvbicpIHtcbiAgICAgIGRhdGEuYXR0cnMhLnR5cGUgPSB0aGlzLnR5cGVcbiAgICAgIGRhdGEuYXR0cnMhLmRpc2FibGVkID0gdGhpcy5kaXNhYmxlZFxuICAgIH1cbiAgICBkYXRhLmF0dHJzIS52YWx1ZSA9IFsnc3RyaW5nJywgJ251bWJlciddLmluY2x1ZGVzKHR5cGVvZiB0aGlzLnZhbHVlKVxuICAgICAgPyB0aGlzLnZhbHVlXG4gICAgICA6IEpTT04uc3RyaW5naWZ5KHRoaXMudmFsdWUpXG5cbiAgICByZXR1cm4gaCh0YWcsIHRoaXMuZGlzYWJsZWQgPyBkYXRhIDogc2V0Q29sb3IodGhpcy5jb2xvciwgZGF0YSksIGNoaWxkcmVuKVxuICB9LFxufSlcbiJdfQ==
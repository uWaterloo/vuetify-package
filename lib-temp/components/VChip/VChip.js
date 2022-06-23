// Styles
import './VChip.sass';
import mixins from '../../util/mixins';
// Components
import { VExpandXTransition } from '../transitions';
import VIcon from '../VIcon';
// Mixins
import Colorable from '../../mixins/colorable';
import { factory as GroupableFactory } from '../../mixins/groupable';
import Themeable from '../../mixins/themeable';
import { factory as ToggleableFactory } from '../../mixins/toggleable';
import Routable from '../../mixins/routable';
import Sizeable from '../../mixins/sizeable';
// Utilities
import { breaking } from '../../util/console';
/* @vue/component */
export default mixins(Colorable, Sizeable, Routable, Themeable, GroupableFactory('chipGroup'), ToggleableFactory('inputValue')).extend({
    name: 'v-chip',
    props: {
        active: {
            type: Boolean,
            default: true,
        },
        activeClass: {
            type: String,
            default() {
                if (!this.chipGroup)
                    return '';
                return this.chipGroup.activeClass;
            },
        },
        close: Boolean,
        closeIcon: {
            type: String,
            default: '$delete',
        },
        closeLabel: {
            type: String,
            default: '$vuetify.close',
        },
        disabled: Boolean,
        draggable: Boolean,
        filter: Boolean,
        filterIcon: {
            type: String,
            default: '$complete',
        },
        label: Boolean,
        link: Boolean,
        outlined: Boolean,
        pill: Boolean,
        tag: {
            type: String,
            default: 'span',
        },
        textColor: String,
        value: null,
    },
    data: () => ({
        proxyClass: 'v-chip--active',
    }),
    computed: {
        classes() {
            return {
                'v-chip': true,
                ...Routable.options.computed.classes.call(this),
                'v-chip--clickable': this.isClickable,
                'v-chip--disabled': this.disabled,
                'v-chip--draggable': this.draggable,
                'v-chip--label': this.label,
                'v-chip--link': this.isLink,
                'v-chip--no-color': !this.color,
                'v-chip--outlined': this.outlined,
                'v-chip--pill': this.pill,
                'v-chip--removable': this.hasClose,
                ...this.themeClasses,
                ...this.sizeableClasses,
                ...this.groupClasses,
            };
        },
        hasClose() {
            return Boolean(this.close);
        },
        isClickable() {
            return Boolean(Routable.options.computed.isClickable.call(this) ||
                this.chipGroup);
        },
    },
    created() {
        const breakingProps = [
            ['outline', 'outlined'],
            ['selected', 'input-value'],
            ['value', 'active'],
            ['@input', '@active.sync'],
        ];
        /* istanbul ignore next */
        breakingProps.forEach(([original, replacement]) => {
            if (this.$attrs.hasOwnProperty(original))
                breaking(original, replacement, this);
        });
    },
    methods: {
        click(e) {
            this.$emit('click', e);
            this.chipGroup && this.toggle();
        },
        genFilter() {
            const children = [];
            if (this.isActive) {
                children.push(this.$createElement(VIcon, {
                    staticClass: 'v-chip__filter',
                    props: { left: true },
                }, this.filterIcon));
            }
            return this.$createElement(VExpandXTransition, children);
        },
        genClose() {
            return this.$createElement(VIcon, {
                staticClass: 'v-chip__close',
                props: {
                    right: true,
                    size: 18,
                },
                attrs: {
                    'aria-label': this.$vuetify.lang.t(this.closeLabel),
                },
                on: {
                    click: (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.$emit('click:close');
                        this.$emit('update:active', false);
                    },
                },
            }, this.closeIcon);
        },
        genContent() {
            return this.$createElement('span', {
                staticClass: 'v-chip__content',
            }, [
                this.filter && this.genFilter(),
                this.$slots.default,
                this.hasClose && this.genClose(),
            ]);
        },
    },
    render(h) {
        const children = [this.genContent()];
        let { tag, data } = this.generateRouteLink();
        data.attrs = {
            ...data.attrs,
            draggable: this.draggable ? 'true' : undefined,
            tabindex: this.chipGroup && !this.disabled ? 0 : data.attrs.tabindex,
        };
        data.directives.push({
            name: 'show',
            value: this.active,
        });
        data = this.setBackgroundColor(this.color, data);
        const color = this.textColor || (this.outlined && this.color);
        return h(tag, this.setTextColor(color, data), children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNoaXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ2hpcC9WQ2hpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxjQUFjLENBQUE7QUFJckIsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFFdEMsYUFBYTtBQUNiLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ25ELE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3BFLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sRUFBRSxPQUFPLElBQUksaUJBQWlCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUN0RSxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUM1QyxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUU1QyxZQUFZO0FBQ1osT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBSzdDLG9CQUFvQjtBQUNwQixlQUFlLE1BQU0sQ0FDbkIsU0FBUyxFQUNULFFBQVEsRUFDUixRQUFRLEVBQ1IsU0FBUyxFQUNULGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxFQUM3QixpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FDaEMsQ0FBQyxNQUFNLENBQUM7SUFDUCxJQUFJLEVBQUUsUUFBUTtJQUVkLEtBQUssRUFBRTtRQUNMLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUk7U0FDZDtRQUNELFdBQVcsRUFBRTtZQUNYLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTztnQkFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7b0JBQUUs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QUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDekQsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZDaGlwLnNhc3MnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCB7IFZFeHBhbmRYVHJhbnNpdGlvbiB9IGZyb20gJy4uL3RyYW5zaXRpb25zJ1xuaW1wb3J0IFZJY29uIGZyb20gJy4uL1ZJY29uJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcbmltcG9ydCB7IGZhY3RvcnkgYXMgR3JvdXBhYmxlRmFjdG9yeSB9IGZyb20gJy4uLy4uL21peGlucy9ncm91cGFibGUnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5pbXBvcnQgeyBmYWN0b3J5IGFzIFRvZ2dsZWFibGVGYWN0b3J5IH0gZnJvbSAnLi4vLi4vbWl4aW5zL3RvZ2dsZWFibGUnXG5pbXBvcnQgUm91dGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3JvdXRhYmxlJ1xuaW1wb3J0IFNpemVhYmxlIGZyb20gJy4uLy4uL21peGlucy9zaXplYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBicmVha2luZyB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IsIFByb3BUeXBlIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIENvbG9yYWJsZSxcbiAgU2l6ZWFibGUsXG4gIFJvdXRhYmxlLFxuICBUaGVtZWFibGUsXG4gIEdyb3VwYWJsZUZhY3RvcnkoJ2NoaXBHcm91cCcpLFxuICBUb2dnbGVhYmxlRmFjdG9yeSgnaW5wdXRWYWx1ZScpXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWNoaXAnLFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aXZlOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGFjdGl2ZUNsYXNzOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0ICgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgICBpZiAoIXRoaXMuY2hpcEdyb3VwKSByZXR1cm4gJydcblxuICAgICAgICByZXR1cm4gdGhpcy5jaGlwR3JvdXAuYWN0aXZlQ2xhc3NcbiAgICAgIH0sXG4gICAgfSBhcyBhbnkgYXMgUHJvcFZhbGlkYXRvcjxzdHJpbmc+LFxuICAgIGNsb3NlOiBCb29sZWFuLFxuICAgIGNsb3NlSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRkZWxldGUnLFxuICAgIH0sXG4gICAgY2xvc2VMYWJlbDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyR2dWV0aWZ5LmNsb3NlJyxcbiAgICB9LFxuICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIGRyYWdnYWJsZTogQm9vbGVhbixcbiAgICBmaWx0ZXI6IEJvb2xlYW4sXG4gICAgZmlsdGVySWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRjb21wbGV0ZScsXG4gICAgfSxcbiAgICBsYWJlbDogQm9vbGVhbixcbiAgICBsaW5rOiBCb29sZWFuLFxuICAgIG91dGxpbmVkOiBCb29sZWFuLFxuICAgIHBpbGw6IEJvb2xlYW4sXG4gICAgdGFnOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnc3BhbicsXG4gICAgfSxcbiAgICB0ZXh0Q29sb3I6IFN0cmluZyxcbiAgICB2YWx1ZTogbnVsbCBhcyBhbnkgYXMgUHJvcFR5cGU8YW55PixcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIHByb3h5Q2xhc3M6ICd2LWNoaXAtLWFjdGl2ZScsXG4gIH0pLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LWNoaXAnOiB0cnVlLFxuICAgICAgICAuLi5Sb3V0YWJsZS5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtY2hpcC0tY2xpY2thYmxlJzogdGhpcy5pc0NsaWNrYWJsZSxcbiAgICAgICAgJ3YtY2hpcC0tZGlzYWJsZWQnOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAndi1jaGlwLS1kcmFnZ2FibGUnOiB0aGlzLmRyYWdnYWJsZSxcbiAgICAgICAgJ3YtY2hpcC0tbGFiZWwnOiB0aGlzLmxhYmVsLFxuICAgICAgICAndi1jaGlwLS1saW5rJzogdGhpcy5pc0xpbmssXG4gICAgICAgICd2LWNoaXAtLW5vLWNvbG9yJzogIXRoaXMuY29sb3IsXG4gICAgICAgICd2LWNoaXAtLW91dGxpbmVkJzogdGhpcy5vdXRsaW5lZCxcbiAgICAgICAgJ3YtY2hpcC0tcGlsbCc6IHRoaXMucGlsbCxcbiAgICAgICAgJ3YtY2hpcC0tcmVtb3ZhYmxlJzogdGhpcy5oYXNDbG9zZSxcbiAgICAgICAgLi4udGhpcy50aGVtZUNsYXNzZXMsXG4gICAgICAgIC4uLnRoaXMuc2l6ZWFibGVDbGFzc2VzLFxuICAgICAgICAuLi50aGlzLmdyb3VwQ2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuICAgIGhhc0Nsb3NlICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuY2xvc2UpXG4gICAgfSxcbiAgICBpc0NsaWNrYWJsZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gQm9vbGVhbihcbiAgICAgICAgUm91dGFibGUub3B0aW9ucy5jb21wdXRlZC5pc0NsaWNrYWJsZS5jYWxsKHRoaXMpIHx8XG4gICAgICAgIHRoaXMuY2hpcEdyb3VwXG4gICAgICApXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICBjb25zdCBicmVha2luZ1Byb3BzID0gW1xuICAgICAgWydvdXRsaW5lJywgJ291dGxpbmVkJ10sXG4gICAgICBbJ3NlbGVjdGVkJywgJ2lucHV0LXZhbHVlJ10sXG4gICAgICBbJ3ZhbHVlJywgJ2FjdGl2ZSddLFxuICAgICAgWydAaW5wdXQnLCAnQGFjdGl2ZS5zeW5jJ10sXG4gICAgXVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBicmVha2luZ1Byb3BzLmZvckVhY2goKFtvcmlnaW5hbCwgcmVwbGFjZW1lbnRdKSA9PiB7XG4gICAgICBpZiAodGhpcy4kYXR0cnMuaGFzT3duUHJvcGVydHkob3JpZ2luYWwpKSBicmVha2luZyhvcmlnaW5hbCwgcmVwbGFjZW1lbnQsIHRoaXMpXG4gICAgfSlcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgY2xpY2sgKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgZSlcblxuICAgICAgdGhpcy5jaGlwR3JvdXAgJiYgdGhpcy50b2dnbGUoKVxuICAgIH0sXG4gICAgZ2VuRmlsdGVyICgpOiBWTm9kZSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtdXG5cbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goXG4gICAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudChWSWNvbiwge1xuICAgICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNoaXBfX2ZpbHRlcicsXG4gICAgICAgICAgICBwcm9wczogeyBsZWZ0OiB0cnVlIH0sXG4gICAgICAgICAgfSwgdGhpcy5maWx0ZXJJY29uKVxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZFeHBhbmRYVHJhbnNpdGlvbiwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBnZW5DbG9zZSAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNoaXBfX2Nsb3NlJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICByaWdodDogdHJ1ZSxcbiAgICAgICAgICBzaXplOiAxOCxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMuY2xvc2VMYWJlbCksXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgICAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrOmNsb3NlJylcbiAgICAgICAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTphY3RpdmUnLCBmYWxzZSlcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSwgdGhpcy5jbG9zZUljb24pXG4gICAgfSxcbiAgICBnZW5Db250ZW50ICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnc3BhbicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWNoaXBfX2NvbnRlbnQnLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmZpbHRlciAmJiB0aGlzLmdlbkZpbHRlcigpLFxuICAgICAgICB0aGlzLiRzbG90cy5kZWZhdWx0LFxuICAgICAgICB0aGlzLmhhc0Nsb3NlICYmIHRoaXMuZ2VuQ2xvc2UoKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBbdGhpcy5nZW5Db250ZW50KCldXG4gICAgbGV0IHsgdGFnLCBkYXRhIH0gPSB0aGlzLmdlbmVyYXRlUm91dGVMaW5rKClcblxuICAgIGRhdGEuYXR0cnMgPSB7XG4gICAgICAuLi5kYXRhLmF0dHJzLFxuICAgICAgZHJhZ2dhYmxlOiB0aGlzLmRyYWdnYWJsZSA/ICd0cnVlJyA6IHVuZGVmaW5lZCxcbiAgICAgIHRhYmluZGV4OiB0aGlzLmNoaXBHcm91cCAmJiAhdGhpcy5kaXNhYmxlZCA/IDAgOiBkYXRhLmF0dHJzIS50YWJpbmRleCxcbiAgICB9XG4gICAgZGF0YS5kaXJlY3RpdmVzIS5wdXNoKHtcbiAgICAgIG5hbWU6ICdzaG93JyxcbiAgICAgIHZhbHVlOiB0aGlzLmFjdGl2ZSxcbiAgICB9KVxuICAgIGRhdGEgPSB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmNvbG9yLCBkYXRhKVxuXG4gICAgY29uc3QgY29sb3IgPSB0aGlzLnRleHRDb2xvciB8fCAodGhpcy5vdXRsaW5lZCAmJiB0aGlzLmNvbG9yKVxuXG4gICAgcmV0dXJuIGgodGFnLCB0aGlzLnNldFRleHRDb2xvcihjb2xvciwgZGF0YSksIGNoaWxkcmVuKVxuICB9LFxufSlcbiJdfQ==
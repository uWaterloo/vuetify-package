// Styles
import './VBottomNavigation.sass';
// Mixins
import Applicationable from '../../mixins/applicationable';
import ButtonGroup from '../../mixins/button-group';
import Colorable from '../../mixins/colorable';
import Measurable from '../../mixins/measurable';
import Proxyable from '../../mixins/proxyable';
import Scrollable from '../../mixins/scrollable';
import Themeable from '../../mixins/themeable';
import { factory as ToggleableFactory } from '../../mixins/toggleable';
// Utilities
import mixins from '../../util/mixins';
import { breaking } from '../../util/console';
export default mixins(Applicationable('bottom', [
    'height',
    'inputValue',
]), Colorable, Measurable, ToggleableFactory('inputValue'), Proxyable, Scrollable, Themeable
/* @vue/component */
).extend({
    name: 'v-bottom-navigation',
    props: {
        activeClass: {
            type: String,
            default: 'v-btn--active',
        },
        backgroundColor: String,
        grow: Boolean,
        height: {
            type: [Number, String],
            default: 56,
        },
        hideOnScroll: Boolean,
        horizontal: Boolean,
        inputValue: {
            type: Boolean,
            default: true,
        },
        mandatory: Boolean,
        shift: Boolean,
        tag: {
            type: String,
            default: 'div',
        },
    },
    data() {
        return {
            isActive: this.inputValue,
        };
    },
    computed: {
        canScroll() {
            return (Scrollable.options.computed.canScroll.call(this) &&
                (this.hideOnScroll ||
                    !this.inputValue));
        },
        classes() {
            return {
                'v-bottom-navigation--absolute': this.absolute,
                'v-bottom-navigation--grow': this.grow,
                'v-bottom-navigation--fixed': !this.absolute && (this.app || this.fixed),
                'v-bottom-navigation--horizontal': this.horizontal,
                'v-bottom-navigation--shift': this.shift,
            };
        },
        styles() {
            return {
                ...this.measurableStyles,
                transform: this.isActive ? 'none' : 'translateY(100%)',
            };
        },
    },
    watch: {
        canScroll: 'onScroll',
    },
    created() {
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('active')) {
            breaking('active.sync', 'value or v-model', this);
        }
    },
    methods: {
        thresholdMet() {
            if (this.hideOnScroll) {
                this.isActive = !this.isScrollingUp ||
                    this.currentScroll > this.computedScrollThreshold;
                this.$emit('update:input-value', this.isActive);
            }
            if (this.currentThreshold < this.computedScrollThreshold)
                return;
            this.savedScroll = this.currentScroll;
        },
        updateApplication() {
            return this.$el
                ? this.$el.clientHeight
                : 0;
        },
        updateValue(val) {
            this.$emit('change', val);
        },
    },
    render(h) {
        const data = this.setBackgroundColor(this.backgroundColor, {
            staticClass: 'v-bottom-navigation',
            class: this.classes,
            style: this.styles,
            props: {
                activeClass: this.activeClass,
                mandatory: Boolean(this.mandatory ||
                    this.value !== undefined),
                tag: this.tag,
                value: this.internalValue,
            },
            on: { change: this.updateValue },
        });
        if (this.canScroll) {
            data.directives = data.directives || [];
            data.directives.push({
                arg: this.scrollTarget,
                name: 'scroll',
                value: this.onScroll,
            });
        }
        return h(ButtonGroup, this.setTextColor(this.color, data), this.$slots.default);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkJvdHRvbU5hdmlnYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQm90dG9tTmF2aWdhdGlvbi9WQm90dG9tTmF2aWdhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTywwQkFBMEIsQ0FBQTtBQUVqQyxTQUFTO0FBQ1QsT0FBTyxlQUFlLE1BQU0sOEJBQThCLENBQUE7QUFDMUQsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFDbkQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBRXRFLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFLN0MsZUFBZSxNQUFNLENBQ25CLGVBQWUsQ0FBQyxRQUFRLEVBQUU7SUFDeEIsUUFBUTtJQUNSLFlBQVk7Q0FDYixDQUFDLEVBQ0YsU0FBUyxFQUNULFVBQVUsRUFDVixpQkFBaUIsQ0FBQyxZQUFZLENBQUMsRUFDL0IsU0FBUyxFQUNULFVBQVUsRUFDVixTQUFTO0FBQ1Qsb0JBQW9CO0NBQ3JCLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLHFCQUFxQjtJQUUzQixLQUFLLEVBQUU7UUFDTCxXQUFXLEVBQUU7WUFDWCxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxlQUFlO1NBQ3pCO1FBQ0QsZUFBZSxFQUFFLE1BQU07UUFDdkIsSUFBSSxFQUFFLE9BQU87UUFD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QUFJLENBQUMsT0FBTztZQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbEIsS0FBSyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsU0FBUyxFQUFFLE9BQU8sQ0FDaEIsSUFBSSxDQUFDLFNBQVM7b0JBQ2QsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQ3pCO2dCQUNELEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztnQkFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7YUFDMUI7WUFDRCxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtTQUNqQyxDQUFDLENBQUE7UUFFRixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQTtZQUV2QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztnQkFDbkIsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUN0QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVE7YUFDckIsQ0FBQyxDQUFBO1NBQ0g7UUFFRCxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDakYsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZCb3R0b21OYXZpZ2F0aW9uLnNhc3MnXG5cbi8vIE1peGluc1xuaW1wb3J0IEFwcGxpY2F0aW9uYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvYXBwbGljYXRpb25hYmxlJ1xuaW1wb3J0IEJ1dHRvbkdyb3VwIGZyb20gJy4uLy4uL21peGlucy9idXR0b24tZ3JvdXAnXG5pbXBvcnQgQ29sb3JhYmxlIGZyb20gJy4uLy4uL21peGlucy9jb2xvcmFibGUnXG5pbXBvcnQgTWVhc3VyYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvbWVhc3VyYWJsZSdcbmltcG9ydCBQcm94eWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3Byb3h5YWJsZSdcbmltcG9ydCBTY3JvbGxhYmxlIGZyb20gJy4uLy4uL21peGlucy9zY3JvbGxhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuaW1wb3J0IHsgZmFjdG9yeSBhcyBUb2dnbGVhYmxlRmFjdG9yeSB9IGZyb20gJy4uLy4uL21peGlucy90b2dnbGVhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBicmVha2luZyB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAndnVlJ1xuXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIEFwcGxpY2F0aW9uYWJsZSgnYm90dG9tJywgW1xuICAgICdoZWlnaHQnLFxuICAgICdpbnB1dFZhbHVlJyxcbiAgXSksXG4gIENvbG9yYWJsZSxcbiAgTWVhc3VyYWJsZSxcbiAgVG9nZ2xlYWJsZUZhY3RvcnkoJ2lucHV0VmFsdWUnKSxcbiAgUHJveHlhYmxlLFxuICBTY3JvbGxhYmxlLFxuICBUaGVtZWFibGVcbiAgLyogQHZ1ZS9jb21wb25lbnQgKi9cbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtYm90dG9tLW5hdmlnYXRpb24nLFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aXZlQ2xhc3M6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICd2LWJ0bi0tYWN0aXZlJyxcbiAgICB9LFxuICAgIGJhY2tncm91bmRDb2xvcjogU3RyaW5nLFxuICAgIGdyb3c6IEJvb2xlYW4sXG4gICAgaGVpZ2h0OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogNTYsXG4gICAgfSxcbiAgICBoaWRlT25TY3JvbGw6IEJvb2xlYW4sXG4gICAgaG9yaXpvbnRhbDogQm9vbGVhbixcbiAgICBpbnB1dFZhbHVlOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIG1hbmRhdG9yeTogQm9vbGVhbixcbiAgICBzaGlmdDogQm9vbGVhbixcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdkaXYnLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzQWN0aXZlOiB0aGlzLmlucHV0VmFsdWUsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2FuU2Nyb2xsICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFNjcm9sbGFibGUub3B0aW9ucy5jb21wdXRlZC5jYW5TY3JvbGwuY2FsbCh0aGlzKSAmJlxuICAgICAgICAoXG4gICAgICAgICAgdGhpcy5oaWRlT25TY3JvbGwgfHxcbiAgICAgICAgICAhdGhpcy5pbnB1dFZhbHVlXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9LFxuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndi1ib3R0b20tbmF2aWdhdGlvbi0tYWJzb2x1dGUnOiB0aGlzLmFic29sdXRlLFxuICAgICAgICAndi1ib3R0b20tbmF2aWdhdGlvbi0tZ3Jvdyc6IHRoaXMuZ3JvdyxcbiAgICAgICAgJ3YtYm90dG9tLW5hdmlnYXRpb24tLWZpeGVkJzogIXRoaXMuYWJzb2x1dGUgJiYgKHRoaXMuYXBwIHx8IHRoaXMuZml4ZWQpLFxuICAgICAgICAndi1ib3R0b20tbmF2aWdhdGlvbi0taG9yaXpvbnRhbCc6IHRoaXMuaG9yaXpvbnRhbCxcbiAgICAgICAgJ3YtYm90dG9tLW5hdmlnYXRpb24tLXNoaWZ0JzogdGhpcy5zaGlmdCxcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0eWxlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnRoaXMubWVhc3VyYWJsZVN0eWxlcyxcbiAgICAgICAgdHJhbnNmb3JtOiB0aGlzLmlzQWN0aXZlID8gJ25vbmUnIDogJ3RyYW5zbGF0ZVkoMTAwJSknLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBjYW5TY3JvbGw6ICdvblNjcm9sbCcsXG4gIH0sXG5cbiAgY3JlYXRlZCAoKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAodGhpcy4kYXR0cnMuaGFzT3duUHJvcGVydHkoJ2FjdGl2ZScpKSB7XG4gICAgICBicmVha2luZygnYWN0aXZlLnN5bmMnLCAndmFsdWUgb3Igdi1tb2RlbCcsIHRoaXMpXG4gICAgfVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICB0aHJlc2hvbGRNZXQgKCkge1xuICAgICAgaWYgKHRoaXMuaGlkZU9uU2Nyb2xsKSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSAhdGhpcy5pc1Njcm9sbGluZ1VwIHx8XG4gICAgICAgICAgdGhpcy5jdXJyZW50U2Nyb2xsID4gdGhpcy5jb21wdXRlZFNjcm9sbFRocmVzaG9sZFxuXG4gICAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTppbnB1dC12YWx1ZScsIHRoaXMuaXNBY3RpdmUpXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaHJlc2hvbGQgPCB0aGlzLmNvbXB1dGVkU2Nyb2xsVGhyZXNob2xkKSByZXR1cm5cblxuICAgICAgdGhpcy5zYXZlZFNjcm9sbCA9IHRoaXMuY3VycmVudFNjcm9sbFxuICAgIH0sXG4gICAgdXBkYXRlQXBwbGljYXRpb24gKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gdGhpcy4kZWxcbiAgICAgICAgPyB0aGlzLiRlbC5jbGllbnRIZWlnaHRcbiAgICAgICAgOiAwXG4gICAgfSxcbiAgICB1cGRhdGVWYWx1ZSAodmFsOiBhbnkpIHtcbiAgICAgIHRoaXMuJGVtaXQoJ2NoYW5nZScsIHZhbClcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IodGhpcy5iYWNrZ3JvdW5kQ29sb3IsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1ib3R0b20tbmF2aWdhdGlvbicsXG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGVzLFxuICAgICAgcHJvcHM6IHtcbiAgICAgICAgYWN0aXZlQ2xhc3M6IHRoaXMuYWN0aXZlQ2xhc3MsXG4gICAgICAgIG1hbmRhdG9yeTogQm9vbGVhbihcbiAgICAgICAgICB0aGlzLm1hbmRhdG9yeSB8fFxuICAgICAgICAgIHRoaXMudmFsdWUgIT09IHVuZGVmaW5lZFxuICAgICAgICApLFxuICAgICAgICB0YWc6IHRoaXMudGFnLFxuICAgICAgICB2YWx1ZTogdGhpcy5pbnRlcm5hbFZhbHVlLFxuICAgICAgfSxcbiAgICAgIG9uOiB7IGNoYW5nZTogdGhpcy51cGRhdGVWYWx1ZSB9LFxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5jYW5TY3JvbGwpIHtcbiAgICAgIGRhdGEuZGlyZWN0aXZlcyA9IGRhdGEuZGlyZWN0aXZlcyB8fCBbXVxuXG4gICAgICBkYXRhLmRpcmVjdGl2ZXMucHVzaCh7XG4gICAgICAgIGFyZzogdGhpcy5zY3JvbGxUYXJnZXQsXG4gICAgICAgIG5hbWU6ICdzY3JvbGwnLFxuICAgICAgICB2YWx1ZTogdGhpcy5vblNjcm9sbCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGgoQnV0dG9uR3JvdXAsIHRoaXMuc2V0VGV4dENvbG9yKHRoaXMuY29sb3IsIGRhdGEpLCB0aGlzLiRzbG90cy5kZWZhdWx0KVxuICB9LFxufSlcbiJdfQ==
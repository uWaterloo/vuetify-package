import './VDatePickerHeader.sass';
// Components
import VBtn from '../VBtn';
import VIcon from '../VIcon';
// Mixins
import Colorable from '../../mixins/colorable';
import Localable from '../../mixins/localable';
import Themeable from '../../mixins/themeable';
// Utils
import { createNativeLocaleFormatter, monthChange } from './util';
import mixins from '../../util/mixins';
export default mixins(Colorable, Localable, Themeable
/* @vue/component */
).extend({
    name: 'v-date-picker-header',
    props: {
        disabled: Boolean,
        format: Function,
        min: String,
        max: String,
        nextAriaLabel: String,
        nextIcon: {
            type: String,
            default: '$next',
        },
        prevAriaLabel: String,
        prevIcon: {
            type: String,
            default: '$prev',
        },
        readonly: Boolean,
        value: {
            type: [Number, String],
            required: true,
        },
    },
    data() {
        return {
            isReversing: false,
        };
    },
    computed: {
        formatter() {
            if (this.format) {
                return this.format;
            }
            else if (String(this.value).split('-')[1]) {
                return createNativeLocaleFormatter(this.currentLocale, { month: 'long', year: 'numeric', timeZone: 'UTC' }, { length: 7 });
            }
            else {
                return createNativeLocaleFormatter(this.currentLocale, { year: 'numeric', timeZone: 'UTC' }, { length: 4 });
            }
        },
    },
    watch: {
        value(newVal, oldVal) {
            this.isReversing = newVal < oldVal;
        },
    },
    methods: {
        genBtn(change) {
            const ariaLabelId = change > 0 ? this.nextAriaLabel : this.prevAriaLabel;
            const ariaLabel = ariaLabelId ? this.$vuetify.lang.t(ariaLabelId) : undefined;
            const disabled = this.disabled ||
                (change < 0 && this.min && this.calculateChange(change) < this.min) ||
                (change > 0 && this.max && this.calculateChange(change) > this.max);
            return this.$createElement(VBtn, {
                attrs: { 'aria-label': ariaLabel },
                props: {
                    dark: this.dark,
                    disabled,
                    icon: true,
                    light: this.light,
                },
                on: {
                    click: (e) => {
                        e.stopPropagation();
                        this.$emit('input', this.calculateChange(change));
                    },
                },
            }, [
                this.$createElement(VIcon, ((change < 0) === !this.$vuetify.rtl) ? this.prevIcon : this.nextIcon),
            ]);
        },
        calculateChange(sign) {
            const [year, month] = String(this.value).split('-').map(Number);
            if (month == null) {
                return `${year + sign}`;
            }
            else {
                return monthChange(String(this.value), sign);
            }
        },
        genHeader() {
            const color = !this.disabled && (this.color || 'accent');
            const header = this.$createElement('div', this.setTextColor(color, {
                key: String(this.value),
            }), [this.$createElement('button', {
                    attrs: {
                        type: 'button',
                    },
                    on: {
                        click: () => this.$emit('toggle'),
                    },
                }, [this.$slots.default || this.formatter(String(this.value))])]);
            const transition = this.$createElement('transition', {
                props: {
                    name: (this.isReversing === !this.$vuetify.rtl) ? 'tab-reverse-transition' : 'tab-transition',
                },
            }, [header]);
            return this.$createElement('div', {
                staticClass: 'v-date-picker-header__value',
                class: {
                    'v-date-picker-header__value--disabled': this.disabled,
                },
            }, [transition]);
        },
    },
    render() {
        return this.$createElement('div', {
            staticClass: 'v-date-picker-header',
            class: {
                'v-date-picker-header--disabled': this.disabled,
                ...this.themeClasses,
            },
        }, [
            this.genBtn(-1),
            this.genHeader(),
            this.genBtn(+1),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRhdGVQaWNrZXJIZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WRGF0ZVBpY2tlci9WRGF0ZVBpY2tlckhlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLDBCQUEwQixDQUFBO0FBRWpDLGFBQWE7QUFDYixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFDMUIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBRTVCLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUU5QyxRQUFRO0FBQ1IsT0FBTyxFQUFFLDJCQUEyQixFQUFFLFdBQVcsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUNqRSxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQU10QyxlQUFlLE1BQU0sQ0FDbkIsU0FBUyxFQUNULFNBQVMsRUFDVCxTQUFTO0FBQ1gsb0JBQW9CO0NBQ25CLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLHNCQUFzQjtJQUU1QixLQUFLLEVBQUU7UUFDTCxRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVBQUUsUUFBcUQ7UUFDN0QsR0FBRyxFQUFFLE1BQU07UUFDWCxHQUFHLEVBQUUsTUFBTTtRQUNYLGFBQWEsRUFBRSxNQUFNO1FBQ3JCLFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLE9BQU87U0FDakI7UUFDRCxhQUFhLEVBQUUsTUFBTTtRQUNyQixRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxPQUFPO1NBQ2pCO1FBQ0QsUUFBUSxFQUFFLE9BQU87UUFDakIsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixR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QUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7aUJBQzlGO2FBQ0YsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFFWixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO2dCQUNoQyxXQUFXLEVBQUUsNkJBQTZCO2dCQUMxQyxLQUFLLEVBQUU7b0JBQ0wsdUNBQXVDLEVBQUUsSUFBSSxDQUFDLFFBQVE7aUJBQ3ZEO2FBQ0YsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7UUFDbEIsQ0FBQztLQUNGO0lBRUQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7WUFDaEMsV0FBVyxFQUFFLHNCQUFzQjtZQUNuQyxLQUFLLEVBQUU7Z0JBQ0wsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQy9DLEdBQUcsSUFBSSxDQUFDLFlBQVk7YUFDckI7U0FDRixFQUFFO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL1ZEYXRlUGlja2VySGVhZGVyLnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWQnRuIGZyb20gJy4uL1ZCdG4nXG5pbXBvcnQgVkljb24gZnJvbSAnLi4vVkljb24nXG5cbi8vIE1peGluc1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IExvY2FsYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvbG9jYWxhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBVdGlsc1xuaW1wb3J0IHsgY3JlYXRlTmF0aXZlTG9jYWxlRm9ybWF0dGVyLCBtb250aENoYW5nZSB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBEYXRlUGlja2VyRm9ybWF0dGVyIH0gZnJvbSAndnVldGlmeS90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBDb2xvcmFibGUsXG4gIExvY2FsYWJsZSxcbiAgVGhlbWVhYmxlXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuKS5leHRlbmQoe1xuICBuYW1lOiAndi1kYXRlLXBpY2tlci1oZWFkZXInLFxuXG4gIHByb3BzOiB7XG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgZm9ybWF0OiBGdW5jdGlvbiBhcyBQcm9wVHlwZTxEYXRlUGlja2VyRm9ybWF0dGVyIHwgdW5kZWZpbmVkPixcbiAgICBtaW46IFN0cmluZyxcbiAgICBtYXg6IFN0cmluZyxcbiAgICBuZXh0QXJpYUxhYmVsOiBTdHJpbmcsXG4gICAgbmV4dEljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckbmV4dCcsXG4gICAgfSxcbiAgICBwcmV2QXJpYUxhYmVsOiBTdHJpbmcsXG4gICAgcHJldkljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckcHJldicsXG4gICAgfSxcbiAgICByZWFkb25seTogQm9vbGVhbixcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzUmV2ZXJzaW5nOiBmYWxzZSxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBmb3JtYXR0ZXIgKCk6IERhdGVQaWNrZXJGb3JtYXR0ZXIge1xuICAgICAgaWYgKHRoaXMuZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdFxuICAgICAgfSBlbHNlIGlmIChTdHJpbmcodGhpcy52YWx1ZSkuc3BsaXQoJy0nKVsxXSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlTmF0aXZlTG9jYWxlRm9ybWF0dGVyKHRoaXMuY3VycmVudExvY2FsZSwgeyBtb250aDogJ2xvbmcnLCB5ZWFyOiAnbnVtZXJpYycsIHRpbWVab25lOiAnVVRDJyB9LCB7IGxlbmd0aDogNyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZU5hdGl2ZUxvY2FsZUZvcm1hdHRlcih0aGlzLmN1cnJlbnRMb2NhbGUsIHsgeWVhcjogJ251bWVyaWMnLCB0aW1lWm9uZTogJ1VUQycgfSwgeyBsZW5ndGg6IDQgfSlcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgdmFsdWUgKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICB0aGlzLmlzUmV2ZXJzaW5nID0gbmV3VmFsIDwgb2xkVmFsXG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuQnRuIChjaGFuZ2U6IG51bWJlcikge1xuICAgICAgY29uc3QgYXJpYUxhYmVsSWQgPSBjaGFuZ2UgPiAwID8gdGhpcy5uZXh0QXJpYUxhYmVsIDogdGhpcy5wcmV2QXJpYUxhYmVsXG4gICAgICBjb25zdCBhcmlhTGFiZWwgPSBhcmlhTGFiZWxJZCA/IHRoaXMuJHZ1ZXRpZnkubGFuZy50KGFyaWFMYWJlbElkKSA6IHVuZGVmaW5lZFxuICAgICAgY29uc3QgZGlzYWJsZWQgPSB0aGlzLmRpc2FibGVkIHx8XG4gICAgICAgIChjaGFuZ2UgPCAwICYmIHRoaXMubWluICYmIHRoaXMuY2FsY3VsYXRlQ2hhbmdlKGNoYW5nZSkgPCB0aGlzLm1pbikgfHxcbiAgICAgICAgKGNoYW5nZSA+IDAgJiYgdGhpcy5tYXggJiYgdGhpcy5jYWxjdWxhdGVDaGFuZ2UoY2hhbmdlKSA+IHRoaXMubWF4KVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWQnRuLCB7XG4gICAgICAgIGF0dHJzOiB7ICdhcmlhLWxhYmVsJzogYXJpYUxhYmVsIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgZGFyazogdGhpcy5kYXJrLFxuICAgICAgICAgIGRpc2FibGVkLFxuICAgICAgICAgIGljb246IHRydWUsXG4gICAgICAgICAgbGlnaHQ6IHRoaXMubGlnaHQsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCB0aGlzLmNhbGN1bGF0ZUNoYW5nZShjaGFuZ2UpKVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sICgoY2hhbmdlIDwgMCkgPT09ICF0aGlzLiR2dWV0aWZ5LnJ0bCkgPyB0aGlzLnByZXZJY29uIDogdGhpcy5uZXh0SWNvbiksXG4gICAgICBdKVxuICAgIH0sXG4gICAgY2FsY3VsYXRlQ2hhbmdlIChzaWduOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IFt5ZWFyLCBtb250aF0gPSBTdHJpbmcodGhpcy52YWx1ZSkuc3BsaXQoJy0nKS5tYXAoTnVtYmVyKVxuXG4gICAgICBpZiAobW9udGggPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYCR7eWVhciArIHNpZ259YFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG1vbnRoQ2hhbmdlKFN0cmluZyh0aGlzLnZhbHVlKSwgc2lnbilcbiAgICAgIH1cbiAgICB9LFxuICAgIGdlbkhlYWRlciAoKSB7XG4gICAgICBjb25zdCBjb2xvciA9ICF0aGlzLmRpc2FibGVkICYmICh0aGlzLmNvbG9yIHx8ICdhY2NlbnQnKVxuICAgICAgY29uc3QgaGVhZGVyID0gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgdGhpcy5zZXRUZXh0Q29sb3IoY29sb3IsIHtcbiAgICAgICAga2V5OiBTdHJpbmcodGhpcy52YWx1ZSksXG4gICAgICB9KSwgW3RoaXMuJGNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljazogKCkgPT4gdGhpcy4kZW1pdCgndG9nZ2xlJyksXG4gICAgICAgIH0sXG4gICAgICB9LCBbdGhpcy4kc2xvdHMuZGVmYXVsdCB8fCB0aGlzLmZvcm1hdHRlcihTdHJpbmcodGhpcy52YWx1ZSkpXSldKVxuXG4gICAgICBjb25zdCB0cmFuc2l0aW9uID0gdGhpcy4kY3JlYXRlRWxlbWVudCgndHJhbnNpdGlvbicsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBuYW1lOiAodGhpcy5pc1JldmVyc2luZyA9PT0gIXRoaXMuJHZ1ZXRpZnkucnRsKSA/ICd0YWItcmV2ZXJzZS10cmFuc2l0aW9uJyA6ICd0YWItdHJhbnNpdGlvbicsXG4gICAgICAgIH0sXG4gICAgICB9LCBbaGVhZGVyXSlcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWRhdGUtcGlja2VyLWhlYWRlcl9fdmFsdWUnLFxuICAgICAgICBjbGFzczoge1xuICAgICAgICAgICd2LWRhdGUtcGlja2VyLWhlYWRlcl9fdmFsdWUtLWRpc2FibGVkJzogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgfSxcbiAgICAgIH0sIFt0cmFuc2l0aW9uXSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoKTogVk5vZGUge1xuICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtZGF0ZS1waWNrZXItaGVhZGVyJyxcbiAgICAgIGNsYXNzOiB7XG4gICAgICAgICd2LWRhdGUtcGlja2VyLWhlYWRlci0tZGlzYWJsZWQnOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAuLi50aGlzLnRoZW1lQ2xhc3NlcyxcbiAgICAgIH0sXG4gICAgfSwgW1xuICAgICAgdGhpcy5nZW5CdG4oLTEpLFxuICAgICAgdGhpcy5nZW5IZWFkZXIoKSxcbiAgICAgIHRoaXMuZ2VuQnRuKCsxKSxcbiAgICBdKVxuICB9LFxufSlcbiJdfQ==
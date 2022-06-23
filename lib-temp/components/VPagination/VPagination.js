import './VPagination.sass';
import VIcon from '../VIcon';
// Directives
import Resize from '../../directives/resize';
// Mixins
import Colorable from '../../mixins/colorable';
import Intersectable from '../../mixins/intersectable';
import Themeable from '../../mixins/themeable';
// Utilities
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(Colorable, Intersectable({ onVisible: ['init'] }), Themeable).extend({
    name: 'v-pagination',
    directives: { Resize },
    props: {
        circle: Boolean,
        disabled: Boolean,
        length: {
            type: Number,
            default: 0,
            validator: (val) => val % 1 === 0,
        },
        nextIcon: {
            type: String,
            default: '$next',
        },
        prevIcon: {
            type: String,
            default: '$prev',
        },
        totalVisible: [Number, String],
        value: {
            type: Number,
            default: 0,
        },
        pageAriaLabel: {
            type: String,
            default: '$vuetify.pagination.ariaLabel.page',
        },
        currentPageAriaLabel: {
            type: String,
            default: '$vuetify.pagination.ariaLabel.currentPage',
        },
        previousAriaLabel: {
            type: String,
            default: '$vuetify.pagination.ariaLabel.previous',
        },
        nextAriaLabel: {
            type: String,
            default: '$vuetify.pagination.ariaLabel.next',
        },
        wrapperAriaLabel: {
            type: String,
            default: '$vuetify.pagination.ariaLabel.wrapper',
        },
    },
    data() {
        return {
            maxButtons: 0,
            selected: null,
        };
    },
    computed: {
        classes() {
            return {
                'v-pagination': true,
                'v-pagination--circle': this.circle,
                'v-pagination--disabled': this.disabled,
                ...this.themeClasses,
            };
        },
        items() {
            const totalVisible = parseInt(this.totalVisible, 10);
            if (totalVisible === 0) {
                return [];
            }
            const maxLength = Math.min(Math.max(0, totalVisible) || this.length, Math.max(0, this.maxButtons) || this.length, this.length);
            if (this.length <= maxLength) {
                return this.range(1, this.length);
            }
            const even = maxLength % 2 === 0 ? 1 : 0;
            const left = Math.floor(maxLength / 2);
            const right = this.length - left + 1 + even;
            if (this.value > left && this.value < right) {
                const firstItem = 1;
                const lastItem = this.length;
                const start = this.value - left + 2;
                const end = this.value + left - 2 - even;
                const secondItem = start - 1 === firstItem + 1 ? 2 : '...';
                const beforeLastItem = end + 1 === lastItem - 1 ? end + 1 : '...';
                return [1, secondItem, ...this.range(start, end), beforeLastItem, this.length];
            }
            else if (this.value === left) {
                const end = this.value + left - 1 - even;
                return [...this.range(1, end), '...', this.length];
            }
            else if (this.value === right) {
                const start = this.value - left + 1;
                return [1, '...', ...this.range(start, this.length)];
            }
            else {
                return [
                    ...this.range(1, left),
                    '...',
                    ...this.range(right, this.length),
                ];
            }
        },
    },
    watch: {
        value() {
            this.init();
        },
    },
    beforeMount() {
        this.init();
    },
    methods: {
        init() {
            this.selected = null;
            this.onResize();
            this.$nextTick(this.onResize);
            // TODO: Change this (f75dee3a, cbdf7caa)
            setTimeout(() => (this.selected = this.value), 100);
        },
        onResize() {
            const width = this.$el && this.$el.parentElement
                ? this.$el.parentElement.clientWidth
                : window.innerWidth;
            this.maxButtons = Math.floor((width - 96) / 42);
        },
        next(e) {
            e.preventDefault();
            this.$emit('input', this.value + 1);
            this.$emit('next');
        },
        previous(e) {
            e.preventDefault();
            this.$emit('input', this.value - 1);
            this.$emit('previous');
        },
        range(from, to) {
            const range = [];
            from = from > 0 ? from : 1;
            for (let i = from; i <= to; i++) {
                range.push(i);
            }
            return range;
        },
        genIcon(h, icon, disabled, fn, label) {
            return h('li', [
                h('button', {
                    staticClass: 'v-pagination__navigation',
                    class: {
                        'v-pagination__navigation--disabled': disabled,
                    },
                    attrs: {
                        disabled,
                        type: 'button',
                        'aria-label': label,
                    },
                    on: disabled ? {} : { click: fn },
                }, [h(VIcon, [icon])]),
            ]);
        },
        genItem(h, i) {
            const color = (i === this.value) && (this.color || 'primary');
            const isCurrentPage = i === this.value;
            const ariaLabel = isCurrentPage ? this.currentPageAriaLabel : this.pageAriaLabel;
            return h('button', this.setBackgroundColor(color, {
                staticClass: 'v-pagination__item',
                class: {
                    'v-pagination__item--active': i === this.value,
                },
                attrs: {
                    type: 'button',
                    'aria-current': isCurrentPage,
                    'aria-label': this.$vuetify.lang.t(ariaLabel, i),
                },
                on: {
                    click: () => this.$emit('input', i),
                },
            }), [i.toString()]);
        },
        genItems(h) {
            return this.items.map((i, index) => {
                return h('li', { key: index }, [
                    isNaN(Number(i)) ? h('span', { class: 'v-pagination__more' }, [i.toString()]) : this.genItem(h, i),
                ]);
            });
        },
        genList(h, children) {
            return h('ul', {
                directives: [{
                        modifiers: { quiet: true },
                        name: 'resize',
                        value: this.onResize,
                    }],
                class: this.classes,
            }, children);
        },
    },
    render(h) {
        const children = [
            this.genIcon(h, this.$vuetify.rtl ? this.nextIcon : this.prevIcon, this.value <= 1, this.previous, this.$vuetify.lang.t(this.previousAriaLabel)),
            this.genItems(h),
            this.genIcon(h, this.$vuetify.rtl ? this.prevIcon : this.nextIcon, this.value >= this.length, this.next, this.$vuetify.lang.t(this.nextAriaLabel)),
        ];
        return h('nav', {
            attrs: {
                role: 'navigation',
                'aria-label': this.$vuetify.lang.t(this.wrapperAriaLabel),
            },
        }, [this.genList(h, children)]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBhZ2luYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WUGFnaW5hdGlvbi9WUGFnaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLG9CQUFvQixDQUFBO0FBRTNCLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0seUJBQXlCLENBQUE7QUFFNUMsU0FBUztBQUNULE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sYUFBYSxNQUFNLDRCQUE0QixDQUFBO0FBQ3RELE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBRTlDLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUt0QyxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLFNBQVMsRUFDVCxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQ3RDLFNBQVMsQ0FDVixDQUFDLE1BQU0sQ0FBQztJQUNQLElBQUksRUFBRSxjQUFjO0lBRXBCLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRTtJQUV0QixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUUsT0FBTztRQUNmLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLENBQUM7WUFDVixTQUFTLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztTQUMxQztRQUNELFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLE9BQU87U0FDakI7UUFDRCxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxPQUFPO1NBQ2pCO1FBQ0QsWUFBWSxFQUFFLENBQUMsTUFBTSxFQUFF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RUFBRTtnQkFDTCxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7YUFDMUQ7U0FDRixFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vVlBhZ2luYXRpb24uc2FzcydcblxuaW1wb3J0IFZJY29uIGZyb20gJy4uL1ZJY29uJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgUmVzaXplIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvcmVzaXplJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcbmltcG9ydCBJbnRlcnNlY3RhYmxlIGZyb20gJy4uLy4uL21peGlucy9pbnRlcnNlY3RhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgQ3JlYXRlRWxlbWVudCwgVk5vZGVDaGlsZHJlbkFycmF5Q29udGVudHMgfSBmcm9tICd2dWUnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIENvbG9yYWJsZSxcbiAgSW50ZXJzZWN0YWJsZSh7IG9uVmlzaWJsZTogWydpbml0J10gfSksXG4gIFRoZW1lYWJsZVxuKS5leHRlbmQoe1xuICBuYW1lOiAndi1wYWdpbmF0aW9uJyxcblxuICBkaXJlY3RpdmVzOiB7IFJlc2l6ZSB9LFxuXG4gIHByb3BzOiB7XG4gICAgY2lyY2xlOiBCb29sZWFuLFxuICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIGxlbmd0aDoge1xuICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICAgIHZhbGlkYXRvcjogKHZhbDogbnVtYmVyKSA9PiB2YWwgJSAxID09PSAwLFxuICAgIH0sXG4gICAgbmV4dEljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckbmV4dCcsXG4gICAgfSxcbiAgICBwcmV2SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRwcmV2JyxcbiAgICB9LFxuICAgIHRvdGFsVmlzaWJsZTogW051bWJlciwgU3RyaW5nXSxcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIHBhZ2VBcmlhTGFiZWw6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5wYWdpbmF0aW9uLmFyaWFMYWJlbC5wYWdlJyxcbiAgICB9LFxuICAgIGN1cnJlbnRQYWdlQXJpYUxhYmVsOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkucGFnaW5hdGlvbi5hcmlhTGFiZWwuY3VycmVudFBhZ2UnLFxuICAgIH0sXG4gICAgcHJldmlvdXNBcmlhTGFiZWw6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5wYWdpbmF0aW9uLmFyaWFMYWJlbC5wcmV2aW91cycsXG4gICAgfSxcbiAgICBuZXh0QXJpYUxhYmVsOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkucGFnaW5hdGlvbi5hcmlhTGFiZWwubmV4dCcsXG4gICAgfSxcbiAgICB3cmFwcGVyQXJpYUxhYmVsOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkucGFnaW5hdGlvbi5hcmlhTGFiZWwud3JhcHBlcicsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF4QnV0dG9uczogMCxcbiAgICAgIHNlbGVjdGVkOiBudWxsIGFzIG51bWJlciB8IG51bGwsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXBhZ2luYXRpb24nOiB0cnVlLFxuICAgICAgICAndi1wYWdpbmF0aW9uLS1jaXJjbGUnOiB0aGlzLmNpcmNsZSxcbiAgICAgICAgJ3YtcGFnaW5hdGlvbi0tZGlzYWJsZWQnOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAuLi50aGlzLnRoZW1lQ2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaXRlbXMgKCk6IChzdHJpbmcgfCBudW1iZXIpW10ge1xuICAgICAgY29uc3QgdG90YWxWaXNpYmxlID0gcGFyc2VJbnQodGhpcy50b3RhbFZpc2libGUsIDEwKVxuXG4gICAgICBpZiAodG90YWxWaXNpYmxlID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXhMZW5ndGggPSBNYXRoLm1pbihcbiAgICAgICAgTWF0aC5tYXgoMCwgdG90YWxWaXNpYmxlKSB8fCB0aGlzLmxlbmd0aCxcbiAgICAgICAgTWF0aC5tYXgoMCwgdGhpcy5tYXhCdXR0b25zKSB8fCB0aGlzLmxlbmd0aCxcbiAgICAgICAgdGhpcy5sZW5ndGhcbiAgICAgIClcblxuICAgICAgaWYgKHRoaXMubGVuZ3RoIDw9IG1heExlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yYW5nZSgxLCB0aGlzLmxlbmd0aClcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXZlbiA9IG1heExlbmd0aCAlIDIgPT09IDAgPyAxIDogMFxuICAgICAgY29uc3QgbGVmdCA9IE1hdGguZmxvb3IobWF4TGVuZ3RoIC8gMilcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5sZW5ndGggLSBsZWZ0ICsgMSArIGV2ZW5cblxuICAgICAgaWYgKHRoaXMudmFsdWUgPiBsZWZ0ICYmIHRoaXMudmFsdWUgPCByaWdodCkge1xuICAgICAgICBjb25zdCBmaXJzdEl0ZW0gPSAxXG4gICAgICAgIGNvbnN0IGxhc3RJdGVtID0gdGhpcy5sZW5ndGhcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLnZhbHVlIC0gbGVmdCArIDJcbiAgICAgICAgY29uc3QgZW5kID0gdGhpcy52YWx1ZSArIGxlZnQgLSAyIC0gZXZlblxuICAgICAgICBjb25zdCBzZWNvbmRJdGVtID0gc3RhcnQgLSAxID09PSBmaXJzdEl0ZW0gKyAxID8gMiA6ICcuLi4nXG4gICAgICAgIGNvbnN0IGJlZm9yZUxhc3RJdGVtID0gZW5kICsgMSA9PT0gbGFzdEl0ZW0gLSAxID8gZW5kICsgMSA6ICcuLi4nXG5cbiAgICAgICAgcmV0dXJuIFsxLCBzZWNvbmRJdGVtLCAuLi50aGlzLnJhbmdlKHN0YXJ0LCBlbmQpLCBiZWZvcmVMYXN0SXRlbSwgdGhpcy5sZW5ndGhdXG4gICAgICB9IGVsc2UgaWYgKHRoaXMudmFsdWUgPT09IGxlZnQpIHtcbiAgICAgICAgY29uc3QgZW5kID0gdGhpcy52YWx1ZSArIGxlZnQgLSAxIC0gZXZlblxuICAgICAgICByZXR1cm4gWy4uLnRoaXMucmFuZ2UoMSwgZW5kKSwgJy4uLicsIHRoaXMubGVuZ3RoXVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnZhbHVlID09PSByaWdodCkge1xuICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMudmFsdWUgLSBsZWZ0ICsgMVxuICAgICAgICByZXR1cm4gWzEsICcuLi4nLCAuLi50aGlzLnJhbmdlKHN0YXJ0LCB0aGlzLmxlbmd0aCldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIC4uLnRoaXMucmFuZ2UoMSwgbGVmdCksXG4gICAgICAgICAgJy4uLicsXG4gICAgICAgICAgLi4udGhpcy5yYW5nZShyaWdodCwgdGhpcy5sZW5ndGgpLFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIHZhbHVlICgpIHtcbiAgICAgIHRoaXMuaW5pdCgpXG4gICAgfSxcbiAgfSxcblxuICBiZWZvcmVNb3VudCAoKSB7XG4gICAgdGhpcy5pbml0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgaW5pdCAoKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbFxuXG4gICAgICB0aGlzLm9uUmVzaXplKClcbiAgICAgIHRoaXMuJG5leHRUaWNrKHRoaXMub25SZXNpemUpXG4gICAgICAvLyBUT0RPOiBDaGFuZ2UgdGhpcyAoZjc1ZGVlM2EsIGNiZGY3Y2FhKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiAodGhpcy5zZWxlY3RlZCA9IHRoaXMudmFsdWUpLCAxMDApXG4gICAgfSxcbiAgICBvblJlc2l6ZSAoKSB7XG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMuJGVsICYmIHRoaXMuJGVsLnBhcmVudEVsZW1lbnRcbiAgICAgICAgPyB0aGlzLiRlbC5wYXJlbnRFbGVtZW50LmNsaWVudFdpZHRoXG4gICAgICAgIDogd2luZG93LmlubmVyV2lkdGhcblxuICAgICAgdGhpcy5tYXhCdXR0b25zID0gTWF0aC5mbG9vcigod2lkdGggLSA5NikgLyA0MilcbiAgICB9LFxuICAgIG5leHQgKGU6IEV2ZW50KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgdGhpcy52YWx1ZSArIDEpXG4gICAgICB0aGlzLiRlbWl0KCduZXh0JylcbiAgICB9LFxuICAgIHByZXZpb3VzIChlOiBFdmVudCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIHRoaXMudmFsdWUgLSAxKVxuICAgICAgdGhpcy4kZW1pdCgncHJldmlvdXMnKVxuICAgIH0sXG4gICAgcmFuZ2UgKGZyb206IG51bWJlciwgdG86IG51bWJlcikge1xuICAgICAgY29uc3QgcmFuZ2UgPSBbXVxuXG4gICAgICBmcm9tID0gZnJvbSA+IDAgPyBmcm9tIDogMVxuXG4gICAgICBmb3IgKGxldCBpID0gZnJvbTsgaSA8PSB0bzsgaSsrKSB7XG4gICAgICAgIHJhbmdlLnB1c2goaSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJhbmdlXG4gICAgfSxcbiAgICBnZW5JY29uIChoOiBDcmVhdGVFbGVtZW50LCBpY29uOiBzdHJpbmcsIGRpc2FibGVkOiBib29sZWFuLCBmbjogRXZlbnRMaXN0ZW5lciwgbGFiZWw6IFN0cmluZyk6IFZOb2RlIHtcbiAgICAgIHJldHVybiBoKCdsaScsIFtcbiAgICAgICAgaCgnYnV0dG9uJywge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1wYWdpbmF0aW9uX19uYXZpZ2F0aW9uJyxcbiAgICAgICAgICBjbGFzczoge1xuICAgICAgICAgICAgJ3YtcGFnaW5hdGlvbl9fbmF2aWdhdGlvbi0tZGlzYWJsZWQnOiBkaXNhYmxlZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICBkaXNhYmxlZCxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24nLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiBsYWJlbCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uOiBkaXNhYmxlZCA/IHt9IDogeyBjbGljazogZm4gfSxcbiAgICAgICAgfSwgW2goVkljb24sIFtpY29uXSldKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5JdGVtIChoOiBDcmVhdGVFbGVtZW50LCBpOiBzdHJpbmcgfCBudW1iZXIpOiBWTm9kZSB7XG4gICAgICBjb25zdCBjb2xvcjogc3RyaW5nIHwgZmFsc2UgPSAoaSA9PT0gdGhpcy52YWx1ZSkgJiYgKHRoaXMuY29sb3IgfHwgJ3ByaW1hcnknKVxuICAgICAgY29uc3QgaXNDdXJyZW50UGFnZSA9IGkgPT09IHRoaXMudmFsdWVcbiAgICAgIGNvbnN0IGFyaWFMYWJlbCA9IGlzQ3VycmVudFBhZ2UgPyB0aGlzLmN1cnJlbnRQYWdlQXJpYUxhYmVsIDogdGhpcy5wYWdlQXJpYUxhYmVsXG5cbiAgICAgIHJldHVybiBoKCdidXR0b24nLCB0aGlzLnNldEJhY2tncm91bmRDb2xvcihjb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcGFnaW5hdGlvbl9faXRlbScsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3YtcGFnaW5hdGlvbl9faXRlbS0tYWN0aXZlJzogaSA9PT0gdGhpcy52YWx1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uJyxcbiAgICAgICAgICAnYXJpYS1jdXJyZW50JzogaXNDdXJyZW50UGFnZSxcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IHRoaXMuJHZ1ZXRpZnkubGFuZy50KGFyaWFMYWJlbCwgaSksXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6ICgpID0+IHRoaXMuJGVtaXQoJ2lucHV0JywgaSksXG4gICAgICAgIH0sXG4gICAgICB9KSwgW2kudG9TdHJpbmcoKV0pXG4gICAgfSxcbiAgICBnZW5JdGVtcyAoaDogQ3JlYXRlRWxlbWVudCk6IFZOb2RlW10ge1xuICAgICAgcmV0dXJuIHRoaXMuaXRlbXMubWFwKChpLCBpbmRleCkgPT4ge1xuICAgICAgICByZXR1cm4gaCgnbGknLCB7IGtleTogaW5kZXggfSwgW1xuICAgICAgICAgIGlzTmFOKE51bWJlcihpKSkgPyBoKCdzcGFuJywgeyBjbGFzczogJ3YtcGFnaW5hdGlvbl9fbW9yZScgfSwgW2kudG9TdHJpbmcoKV0pIDogdGhpcy5nZW5JdGVtKGgsIGkpLFxuICAgICAgICBdKVxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlbkxpc3QgKGg6IENyZWF0ZUVsZW1lbnQsIGNoaWxkcmVuOiBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cyk6IFZOb2RlIHtcbiAgICAgIHJldHVybiBoKCd1bCcsIHtcbiAgICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgICBtb2RpZmllcnM6IHsgcXVpZXQ6IHRydWUgfSxcbiAgICAgICAgICBuYW1lOiAncmVzaXplJyxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5vblJlc2l6ZSxcbiAgICAgICAgfV0sXG4gICAgICAgIGNsYXNzOiB0aGlzLmNsYXNzZXMsXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IFtcbiAgICAgIHRoaXMuZ2VuSWNvbihoLFxuICAgICAgICB0aGlzLiR2dWV0aWZ5LnJ0bCA/IHRoaXMubmV4dEljb24gOiB0aGlzLnByZXZJY29uLFxuICAgICAgICB0aGlzLnZhbHVlIDw9IDEsXG4gICAgICAgIHRoaXMucHJldmlvdXMsXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMucHJldmlvdXNBcmlhTGFiZWwpKSxcbiAgICAgIHRoaXMuZ2VuSXRlbXMoaCksXG4gICAgICB0aGlzLmdlbkljb24oaCxcbiAgICAgICAgdGhpcy4kdnVldGlmeS5ydGwgPyB0aGlzLnByZXZJY29uIDogdGhpcy5uZXh0SWNvbixcbiAgICAgICAgdGhpcy52YWx1ZSA+PSB0aGlzLmxlbmd0aCxcbiAgICAgICAgdGhpcy5uZXh0LFxuICAgICAgICB0aGlzLiR2dWV0aWZ5LmxhbmcudCh0aGlzLm5leHRBcmlhTGFiZWwpKSxcbiAgICBdXG5cbiAgICByZXR1cm4gaCgnbmF2Jywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcm9sZTogJ25hdmlnYXRpb24nLFxuICAgICAgICAnYXJpYS1sYWJlbCc6IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMud3JhcHBlckFyaWFMYWJlbCksXG4gICAgICB9LFxuICAgIH0sIFt0aGlzLmdlbkxpc3QoaCwgY2hpbGRyZW4pXSlcbiAgfSxcbn0pXG4iXX0=
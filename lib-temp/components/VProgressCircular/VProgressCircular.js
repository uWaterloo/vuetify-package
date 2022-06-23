// Styles
import './VProgressCircular.sass';
// Directives
import intersect from '../../directives/intersect';
// Mixins
import Colorable from '../../mixins/colorable';
// Utils
import { convertToUnit } from '../../util/helpers';
/* @vue/component */
export default Colorable.extend({
    name: 'v-progress-circular',
    directives: { intersect },
    props: {
        button: Boolean,
        indeterminate: Boolean,
        rotate: {
            type: [Number, String],
            default: 0,
        },
        size: {
            type: [Number, String],
            default: 32,
        },
        width: {
            type: [Number, String],
            default: 4,
        },
        value: {
            type: [Number, String],
            default: 0,
        },
    },
    data: () => ({
        radius: 20,
        isVisible: true,
    }),
    computed: {
        calculatedSize() {
            return Number(this.size) + (this.button ? 8 : 0);
        },
        circumference() {
            return 2 * Math.PI * this.radius;
        },
        classes() {
            return {
                'v-progress-circular--visible': this.isVisible,
                'v-progress-circular--indeterminate': this.indeterminate,
                'v-progress-circular--button': this.button,
            };
        },
        normalizedValue() {
            if (this.value < 0) {
                return 0;
            }
            if (this.value > 100) {
                return 100;
            }
            return parseFloat(this.value);
        },
        strokeDashArray() {
            return Math.round(this.circumference * 1000) / 1000;
        },
        strokeDashOffset() {
            return ((100 - this.normalizedValue) / 100) * this.circumference + 'px';
        },
        strokeWidth() {
            return Number(this.width) / +this.size * this.viewBoxSize * 2;
        },
        styles() {
            return {
                height: convertToUnit(this.calculatedSize),
                width: convertToUnit(this.calculatedSize),
            };
        },
        svgStyles() {
            return {
                transform: `rotate(${Number(this.rotate)}deg)`,
            };
        },
        viewBoxSize() {
            return this.radius / (1 - Number(this.width) / +this.size);
        },
    },
    methods: {
        genCircle(name, offset) {
            return this.$createElement('circle', {
                class: `v-progress-circular__${name}`,
                attrs: {
                    fill: 'transparent',
                    cx: 2 * this.viewBoxSize,
                    cy: 2 * this.viewBoxSize,
                    r: this.radius,
                    'stroke-width': this.strokeWidth,
                    'stroke-dasharray': this.strokeDashArray,
                    'stroke-dashoffset': offset,
                },
            });
        },
        genSvg() {
            const children = [
                this.indeterminate || this.genCircle('underlay', 0),
                this.genCircle('overlay', this.strokeDashOffset),
            ];
            return this.$createElement('svg', {
                style: this.svgStyles,
                attrs: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: `${this.viewBoxSize} ${this.viewBoxSize} ${2 * this.viewBoxSize} ${2 * this.viewBoxSize}`,
                },
            }, children);
        },
        genInfo() {
            return this.$createElement('div', {
                staticClass: 'v-progress-circular__info',
            }, this.$slots.default);
        },
        onObserve(entries, observer, isIntersecting) {
            this.isVisible = isIntersecting;
        },
    },
    render(h) {
        return h('div', this.setTextColor(this.color, {
            staticClass: 'v-progress-circular',
            attrs: {
                role: 'progressbar',
                'aria-valuemin': 0,
                'aria-valuemax': 100,
                'aria-valuenow': this.indeterminate ? undefined : this.normalizedValue,
            },
            class: this.classes,
            directives: [{
                    name: 'intersect',
                    value: this.onObserve,
                }],
            style: this.styles,
            on: this.$listeners,
        }), [
            this.genSvg(),
            this.genInfo(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlByb2dyZXNzQ2lyY3VsYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WUHJvZ3Jlc3NDaXJjdWxhci9WUHJvZ3Jlc3NDaXJjdWxhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTywwQkFBMEIsQ0FBQTtBQUVqQyxhQUFhO0FBQ2IsT0FBTyxTQUFTLE1BQU0sNEJBQTRCLENBQUE7QUFFbEQsU0FBUztBQUNULE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBRTlDLFFBQVE7QUFDUixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFLbEQsb0JBQW9CO0FBQ3BCLGVBQWUsU0FBUyxDQUFDLE1BQU0sQ0FBQztJQUM5QixJQUFJLEVBQUUscUJBQXFCO0lBRTNCLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRTtJQUV6QixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUUsT0FBTztRQUNmLGFBQWEsRUFBRSxPQUFPO1FBQ3RCLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLEVBQUU7U0FDWjtRQUNELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLENBQUM7U0FDWDtLQUNGO0lBRUQsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDWCxNQUFNLEVBQUUsRUFBRTtRQUNWLFNBQVMsRUFBRSxJQUFJO0tBQ2hCLENBQUM7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b0JBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUztpQkFDdEIsQ0FBQztZQUNGLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNsQixFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDcEIsQ0FBQyxFQUFFO1lBQ0YsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDZixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVlByb2dyZXNzQ2lyY3VsYXIuc2FzcydcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IGludGVyc2VjdCBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL2ludGVyc2VjdCdcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ29sb3JhYmxlIGZyb20gJy4uLy4uL21peGlucy9jb2xvcmFibGUnXG5cbi8vIFV0aWxzXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUsIFZOb2RlQ2hpbGRyZW4gfSBmcm9tICd2dWUnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBDb2xvcmFibGUuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtcHJvZ3Jlc3MtY2lyY3VsYXInLFxuXG4gIGRpcmVjdGl2ZXM6IHsgaW50ZXJzZWN0IH0sXG5cbiAgcHJvcHM6IHtcbiAgICBidXR0b246IEJvb2xlYW4sXG4gICAgaW5kZXRlcm1pbmF0ZTogQm9vbGVhbixcbiAgICByb3RhdGU6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAwLFxuICAgIH0sXG4gICAgc2l6ZToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDMyLFxuICAgIH0sXG4gICAgd2lkdGg6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiA0LFxuICAgIH0sXG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAwLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICByYWRpdXM6IDIwLFxuICAgIGlzVmlzaWJsZTogdHJ1ZSxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjYWxjdWxhdGVkU2l6ZSAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBOdW1iZXIodGhpcy5zaXplKSArICh0aGlzLmJ1dHRvbiA/IDggOiAwKVxuICAgIH0sXG5cbiAgICBjaXJjdW1mZXJlbmNlICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIDIgKiBNYXRoLlBJICogdGhpcy5yYWRpdXNcbiAgICB9LFxuXG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXByb2dyZXNzLWNpcmN1bGFyLS12aXNpYmxlJzogdGhpcy5pc1Zpc2libGUsXG4gICAgICAgICd2LXByb2dyZXNzLWNpcmN1bGFyLS1pbmRldGVybWluYXRlJzogdGhpcy5pbmRldGVybWluYXRlLFxuICAgICAgICAndi1wcm9ncmVzcy1jaXJjdWxhci0tYnV0dG9uJzogdGhpcy5idXR0b24sXG4gICAgICB9XG4gICAgfSxcblxuICAgIG5vcm1hbGl6ZWRWYWx1ZSAoKTogbnVtYmVyIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlIDwgMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy52YWx1ZSA+IDEwMCkge1xuICAgICAgICByZXR1cm4gMTAwXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMudmFsdWUpXG4gICAgfSxcblxuICAgIHN0cm9rZURhc2hBcnJheSAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKHRoaXMuY2lyY3VtZmVyZW5jZSAqIDEwMDApIC8gMTAwMFxuICAgIH0sXG5cbiAgICBzdHJva2VEYXNoT2Zmc2V0ICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICgoMTAwIC0gdGhpcy5ub3JtYWxpemVkVmFsdWUpIC8gMTAwKSAqIHRoaXMuY2lyY3VtZmVyZW5jZSArICdweCdcbiAgICB9LFxuXG4gICAgc3Ryb2tlV2lkdGggKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gTnVtYmVyKHRoaXMud2lkdGgpIC8gK3RoaXMuc2l6ZSAqIHRoaXMudmlld0JveFNpemUgKiAyXG4gICAgfSxcblxuICAgIHN0eWxlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhlaWdodDogY29udmVydFRvVW5pdCh0aGlzLmNhbGN1bGF0ZWRTaXplKSxcbiAgICAgICAgd2lkdGg6IGNvbnZlcnRUb1VuaXQodGhpcy5jYWxjdWxhdGVkU2l6ZSksXG4gICAgICB9XG4gICAgfSxcblxuICAgIHN2Z1N0eWxlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRyYW5zZm9ybTogYHJvdGF0ZSgke051bWJlcih0aGlzLnJvdGF0ZSl9ZGVnKWAsXG4gICAgICB9XG4gICAgfSxcblxuICAgIHZpZXdCb3hTaXplICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMucmFkaXVzIC8gKDEgLSBOdW1iZXIodGhpcy53aWR0aCkgLyArdGhpcy5zaXplKVxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkNpcmNsZSAobmFtZTogc3RyaW5nLCBvZmZzZXQ6IHN0cmluZyB8IG51bWJlcik6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdjaXJjbGUnLCB7XG4gICAgICAgIGNsYXNzOiBgdi1wcm9ncmVzcy1jaXJjdWxhcl9fJHtuYW1lfWAsXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICBjeDogMiAqIHRoaXMudmlld0JveFNpemUsXG4gICAgICAgICAgY3k6IDIgKiB0aGlzLnZpZXdCb3hTaXplLFxuICAgICAgICAgIHI6IHRoaXMucmFkaXVzLFxuICAgICAgICAgICdzdHJva2Utd2lkdGgnOiB0aGlzLnN0cm9rZVdpZHRoLFxuICAgICAgICAgICdzdHJva2UtZGFzaGFycmF5JzogdGhpcy5zdHJva2VEYXNoQXJyYXksXG4gICAgICAgICAgJ3N0cm9rZS1kYXNob2Zmc2V0Jzogb2Zmc2V0LFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlblN2ZyAoKTogVk5vZGUge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbXG4gICAgICAgIHRoaXMuaW5kZXRlcm1pbmF0ZSB8fCB0aGlzLmdlbkNpcmNsZSgndW5kZXJsYXknLCAwKSxcbiAgICAgICAgdGhpcy5nZW5DaXJjbGUoJ292ZXJsYXknLCB0aGlzLnN0cm9rZURhc2hPZmZzZXQpLFxuICAgICAgXSBhcyBWTm9kZUNoaWxkcmVuXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdzdmcnLCB7XG4gICAgICAgIHN0eWxlOiB0aGlzLnN2Z1N0eWxlcyxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICB4bWxuczogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyxcbiAgICAgICAgICB2aWV3Qm94OiBgJHt0aGlzLnZpZXdCb3hTaXplfSAke3RoaXMudmlld0JveFNpemV9ICR7MiAqIHRoaXMudmlld0JveFNpemV9ICR7MiAqIHRoaXMudmlld0JveFNpemV9YCxcbiAgICAgICAgfSxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuSW5mbyAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXByb2dyZXNzLWNpcmN1bGFyX19pbmZvJyxcbiAgICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gICAgfSxcbiAgICBvbk9ic2VydmUgKGVudHJpZXM6IEludGVyc2VjdGlvbk9ic2VydmVyRW50cnlbXSwgb2JzZXJ2ZXI6IEludGVyc2VjdGlvbk9ic2VydmVyLCBpc0ludGVyc2VjdGluZzogYm9vbGVhbikge1xuICAgICAgdGhpcy5pc1Zpc2libGUgPSBpc0ludGVyc2VjdGluZ1xuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKCdkaXYnLCB0aGlzLnNldFRleHRDb2xvcih0aGlzLmNvbG9yLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtcHJvZ3Jlc3MtY2lyY3VsYXInLFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcm9sZTogJ3Byb2dyZXNzYmFyJyxcbiAgICAgICAgJ2FyaWEtdmFsdWVtaW4nOiAwLFxuICAgICAgICAnYXJpYS12YWx1ZW1heCc6IDEwMCxcbiAgICAgICAgJ2FyaWEtdmFsdWVub3cnOiB0aGlzLmluZGV0ZXJtaW5hdGUgPyB1bmRlZmluZWQgOiB0aGlzLm5vcm1hbGl6ZWRWYWx1ZSxcbiAgICAgIH0sXG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgbmFtZTogJ2ludGVyc2VjdCcsXG4gICAgICAgIHZhbHVlOiB0aGlzLm9uT2JzZXJ2ZSxcbiAgICAgIH1dLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGVzLFxuICAgICAgb246IHRoaXMuJGxpc3RlbmVycyxcbiAgICB9KSwgW1xuICAgICAgdGhpcy5nZW5TdmcoKSxcbiAgICAgIHRoaXMuZ2VuSW5mbygpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
// Styles
import './VColorPickerSwatches.sass';
// Components
import VIcon from '../VIcon';
// Helpers
import colors from '../../util/colors';
import { fromHex, parseColor } from './util';
import { convertToUnit, deepEqual } from '../../util/helpers';
import mixins from '../../util/mixins';
import Themeable from '../../mixins/themeable';
import { contrastRatio } from '../../util/colorUtils';
function parseDefaultColors(colors) {
    return Object.keys(colors).map(key => {
        const color = colors[key];
        return color.base ? [
            color.base,
            color.darken4,
            color.darken3,
            color.darken2,
            color.darken1,
            color.lighten1,
            color.lighten2,
            color.lighten3,
            color.lighten4,
            color.lighten5,
        ] : [
            color.black,
            color.white,
            color.transparent,
        ];
    });
}
const white = fromHex('#FFFFFF').rgba;
const black = fromHex('#000000').rgba;
export default mixins(Themeable).extend({
    name: 'v-color-picker-swatches',
    props: {
        swatches: {
            type: Array,
            default: () => parseDefaultColors(colors),
        },
        disabled: Boolean,
        color: Object,
        maxWidth: [Number, String],
        maxHeight: [Number, String],
    },
    methods: {
        genColor(color) {
            const content = this.$createElement('div', {
                style: {
                    background: color,
                },
            }, [
                deepEqual(this.color, parseColor(color, null)) && this.$createElement(VIcon, {
                    props: {
                        small: true,
                        dark: contrastRatio(this.color.rgba, white) > 2 && this.color.alpha > 0.5,
                        light: contrastRatio(this.color.rgba, black) > 2 && this.color.alpha > 0.5,
                    },
                }, '$success'),
            ]);
            return this.$createElement('div', {
                staticClass: 'v-color-picker__color',
                on: {
                    // TODO: Less hacky way of catching transparent
                    click: () => this.disabled || this.$emit('update:color', fromHex(color === 'transparent' ? '#00000000' : color)),
                },
            }, [content]);
        },
        genSwatches() {
            return this.swatches.map(swatch => {
                const colors = swatch.map(this.genColor);
                return this.$createElement('div', {
                    staticClass: 'v-color-picker__swatch',
                }, colors);
            });
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-color-picker__swatches',
            style: {
                maxWidth: convertToUnit(this.maxWidth),
                maxHeight: convertToUnit(this.maxHeight),
            },
        }, [
            this.$createElement('div', this.genSwatches()),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNvbG9yUGlja2VyU3dhdGNoZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ29sb3JQaWNrZXIvVkNvbG9yUGlja2VyU3dhdGNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sNkJBQTZCLENBQUE7QUFFcEMsYUFBYTtBQUNiLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixVQUFVO0FBQ1YsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFxQixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDN0QsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFJOUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRXJELFNBQVMsa0JBQWtCLENBQUUsTUFBOEM7SUFDekUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNuQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDekIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQixLQUFLLENBQUMsSUFBSTtZQUNWLEtBQUssQ0FBQyxPQUFPO1lBQ2IsS0FBSyxDQUFDLE9BQU87WUFDYixLQUFLLENBQUMsT0FBTztZQUNiLEtBQUssQ0FBQyxPQUFPO1lBQ2IsS0FBSyxDQUFDLFFBQVE7WUFDZCxLQUFLLENBQUMsUUFBUTtZQUNkLEtBQUssQ0FBQyxRQUFRO1lBQ2QsS0FBSyxDQUFDLFFBQVE7WUFDZCxLQUFLLENBQUMsUUFBUTtTQUNmLENBQUMsQ0FBQyxDQUFDO1lB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Q0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2FBQ3pDO1NBQ0YsRUFBRTtZQUNELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUMvQyxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVkNvbG9yUGlja2VyU3dhdGNoZXMuc2FzcydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZJY29uIGZyb20gJy4uL1ZJY29uJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQgY29sb3JzIGZyb20gJy4uLy4uL3V0aWwvY29sb3JzJ1xuaW1wb3J0IHsgVkNvbG9yUGlja2VyQ29sb3IsIGZyb21IZXgsIHBhcnNlQ29sb3IgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0LCBkZWVwRXF1YWwgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUsIFByb3BUeXBlIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgY29udHJhc3RSYXRpbyB9IGZyb20gJy4uLy4uL3V0aWwvY29sb3JVdGlscydcblxuZnVuY3Rpb24gcGFyc2VEZWZhdWx0Q29sb3JzIChjb2xvcnM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+KSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhjb2xvcnMpLm1hcChrZXkgPT4ge1xuICAgIGNvbnN0IGNvbG9yID0gY29sb3JzW2tleV1cbiAgICByZXR1cm4gY29sb3IuYmFzZSA/IFtcbiAgICAgIGNvbG9yLmJhc2UsXG4gICAgICBjb2xvci5kYXJrZW40LFxuICAgICAgY29sb3IuZGFya2VuMyxcbiAgICAgIGNvbG9yLmRhcmtlbjIsXG4gICAgICBjb2xvci5kYXJrZW4xLFxuICAgICAgY29sb3IubGlnaHRlbjEsXG4gICAgICBjb2xvci5saWdodGVuMixcbiAgICAgIGNvbG9yLmxpZ2h0ZW4zLFxuICAgICAgY29sb3IubGlnaHRlbjQsXG4gICAgICBjb2xvci5saWdodGVuNSxcbiAgICBdIDogW1xuICAgICAgY29sb3IuYmxhY2ssXG4gICAgICBjb2xvci53aGl0ZSxcbiAgICAgIGNvbG9yLnRyYW5zcGFyZW50LFxuICAgIF1cbiAgfSlcbn1cblxuY29uc3Qgd2hpdGUgPSBmcm9tSGV4KCcjRkZGRkZGJykucmdiYVxuY29uc3QgYmxhY2sgPSBmcm9tSGV4KCcjMDAwMDAwJykucmdiYVxuXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoVGhlbWVhYmxlKS5leHRlbmQoe1xuICBuYW1lOiAndi1jb2xvci1waWNrZXItc3dhdGNoZXMnLFxuXG4gIHByb3BzOiB7XG4gICAgc3dhdGNoZXM6IHtcbiAgICAgIHR5cGU6IEFycmF5IGFzIFByb3BUeXBlPHN0cmluZ1tdW10+LFxuICAgICAgZGVmYXVsdDogKCkgPT4gcGFyc2VEZWZhdWx0Q29sb3JzKGNvbG9ycyksXG4gICAgfSxcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBjb2xvcjogT2JqZWN0IGFzIFByb3BUeXBlPFZDb2xvclBpY2tlckNvbG9yPixcbiAgICBtYXhXaWR0aDogW051bWJlciwgU3RyaW5nXSxcbiAgICBtYXhIZWlnaHQ6IFtOdW1iZXIsIFN0cmluZ10sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkNvbG9yIChjb2xvcjogc3RyaW5nKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIGJhY2tncm91bmQ6IGNvbG9yLFxuICAgICAgICB9LFxuICAgICAgfSwgW1xuICAgICAgICBkZWVwRXF1YWwodGhpcy5jb2xvciwgcGFyc2VDb2xvcihjb2xvciwgbnVsbCkpICYmIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sIHtcbiAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc21hbGw6IHRydWUsXG4gICAgICAgICAgICBkYXJrOiBjb250cmFzdFJhdGlvKHRoaXMuY29sb3IucmdiYSwgd2hpdGUpID4gMiAmJiB0aGlzLmNvbG9yLmFscGhhID4gMC41LFxuICAgICAgICAgICAgbGlnaHQ6IGNvbnRyYXN0UmF0aW8odGhpcy5jb2xvci5yZ2JhLCBibGFjaykgPiAyICYmIHRoaXMuY29sb3IuYWxwaGEgPiAwLjUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSwgJyRzdWNjZXNzJyksXG4gICAgICBdKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY29sb3ItcGlja2VyX19jb2xvcicsXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgLy8gVE9ETzogTGVzcyBoYWNreSB3YXkgb2YgY2F0Y2hpbmcgdHJhbnNwYXJlbnRcbiAgICAgICAgICBjbGljazogKCkgPT4gdGhpcy5kaXNhYmxlZCB8fCB0aGlzLiRlbWl0KCd1cGRhdGU6Y29sb3InLCBmcm9tSGV4KGNvbG9yID09PSAndHJhbnNwYXJlbnQnID8gJyMwMDAwMDAwMCcgOiBjb2xvcikpLFxuICAgICAgICB9LFxuICAgICAgfSwgW2NvbnRlbnRdKVxuICAgIH0sXG4gICAgZ2VuU3dhdGNoZXMgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3dhdGNoZXMubWFwKHN3YXRjaCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbG9ycyA9IHN3YXRjaC5tYXAodGhpcy5nZW5Db2xvcilcblxuICAgICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1jb2xvci1waWNrZXJfX3N3YXRjaCcsXG4gICAgICAgIH0sIGNvbG9ycylcbiAgICAgIH0pXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1jb2xvci1waWNrZXJfX3N3YXRjaGVzJyxcbiAgICAgIHN0eWxlOiB7XG4gICAgICAgIG1heFdpZHRoOiBjb252ZXJ0VG9Vbml0KHRoaXMubWF4V2lkdGgpLFxuICAgICAgICBtYXhIZWlnaHQ6IGNvbnZlcnRUb1VuaXQodGhpcy5tYXhIZWlnaHQpLFxuICAgICAgfSxcbiAgICB9LCBbXG4gICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLmdlblN3YXRjaGVzKCkpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
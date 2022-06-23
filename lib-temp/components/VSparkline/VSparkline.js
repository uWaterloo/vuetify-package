// Mixins
import Colorable from '../../mixins/colorable';
// Utilities
import mixins from '../../util/mixins';
import { genPoints, genBars } from './helpers/core';
import { genPath } from './helpers/path';
export default mixins(Colorable).extend({
    name: 'VSparkline',
    inheritAttrs: false,
    props: {
        autoDraw: Boolean,
        autoDrawDuration: {
            type: Number,
            default: 2000,
        },
        autoDrawEasing: {
            type: String,
            default: 'ease',
        },
        autoLineWidth: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: 'primary',
        },
        fill: {
            type: Boolean,
            default: false,
        },
        gradient: {
            type: Array,
            default: () => ([]),
        },
        gradientDirection: {
            type: String,
            validator: (val) => ['top', 'bottom', 'left', 'right'].includes(val),
            default: 'top',
        },
        height: {
            type: [String, Number],
            default: 75,
        },
        labels: {
            type: Array,
            default: () => ([]),
        },
        labelSize: {
            type: [Number, String],
            default: 7,
        },
        lineWidth: {
            type: [String, Number],
            default: 4,
        },
        padding: {
            type: [String, Number],
            default: 8,
        },
        showLabels: Boolean,
        smooth: {
            type: [Boolean, Number, String],
            default: false,
        },
        type: {
            type: String,
            default: 'trend',
            validator: (val) => ['trend', 'bar'].includes(val),
        },
        value: {
            type: Array,
            default: () => ([]),
        },
        width: {
            type: [Number, String],
            default: 300,
        },
    },
    data: () => ({
        lastLength: 0,
    }),
    computed: {
        parsedPadding() {
            return Number(this.padding);
        },
        parsedWidth() {
            return Number(this.width);
        },
        parsedHeight() {
            return parseInt(this.height, 10);
        },
        parsedLabelSize() {
            return parseInt(this.labelSize, 10) || 7;
        },
        totalHeight() {
            let height = this.parsedHeight;
            if (this.hasLabels)
                height += parseInt(this.labelSize, 10) * 1.5;
            return height;
        },
        totalWidth() {
            let width = this.parsedWidth;
            if (this.type === 'bar')
                width = Math.max(this.value.length * this._lineWidth, width);
            return width;
        },
        totalValues() {
            return this.value.length;
        },
        _lineWidth() {
            if (this.autoLineWidth && this.type !== 'trend') {
                const totalPadding = this.parsedPadding * (this.totalValues + 1);
                return (this.parsedWidth - totalPadding) / this.totalValues;
            }
            else {
                return parseFloat(this.lineWidth) || 4;
            }
        },
        boundary() {
            if (this.type === 'bar')
                return { minX: 0, maxX: this.totalWidth, minY: 0, maxY: this.parsedHeight };
            const padding = this.parsedPadding;
            return {
                minX: padding,
                maxX: this.totalWidth - padding,
                minY: padding,
                maxY: this.parsedHeight - padding,
            };
        },
        hasLabels() {
            return Boolean(this.showLabels ||
                this.labels.length > 0 ||
                this.$scopedSlots.label);
        },
        parsedLabels() {
            const labels = [];
            const points = this._values;
            const len = points.length;
            for (let i = 0; labels.length < len; i++) {
                const item = points[i];
                let value = this.labels[i];
                if (!value) {
                    value = typeof item === 'object'
                        ? item.value
                        : item;
                }
                labels.push({
                    x: item.x,
                    value: String(value),
                });
            }
            return labels;
        },
        normalizedValues() {
            return this.value.map(item => (typeof item === 'number' ? item : item.value));
        },
        _values() {
            return this.type === 'trend' ? genPoints(this.normalizedValues, this.boundary) : genBars(this.normalizedValues, this.boundary);
        },
        textY() {
            let y = this.parsedHeight;
            if (this.type === 'trend')
                y -= 4;
            return y;
        },
        _radius() {
            return this.smooth === true ? 8 : Number(this.smooth);
        },
    },
    watch: {
        value: {
            immediate: true,
            handler() {
                this.$nextTick(() => {
                    if (!this.autoDraw ||
                        this.type === 'bar' ||
                        !this.$refs.path)
                        return;
                    const path = this.$refs.path;
                    const length = path.getTotalLength();
                    if (!this.fill) {
                        path.style.transition = 'none';
                        path.style.strokeDasharray = length + ' ' + length;
                        path.style.strokeDashoffset = Math.abs(length - (this.lastLength || 0)).toString();
                        path.getBoundingClientRect();
                        path.style.transition = `stroke-dashoffset ${this.autoDrawDuration}ms ${this.autoDrawEasing}`;
                        path.style.strokeDashoffset = '0';
                    }
                    else {
                        path.style.transformOrigin = 'bottom center';
                        path.style.transition = 'none';
                        path.style.transform = `scaleY(0)`;
                        path.getBoundingClientRect();
                        path.style.transition = `transform ${this.autoDrawDuration}ms ${this.autoDrawEasing}`;
                        path.style.transform = `scaleY(1)`;
                    }
                    this.lastLength = length;
                });
            },
        },
    },
    methods: {
        genGradient() {
            const gradientDirection = this.gradientDirection;
            const gradient = this.gradient.slice();
            // Pushes empty string to force
            // a fallback to currentColor
            if (!gradient.length)
                gradient.push('');
            const len = Math.max(gradient.length - 1, 1);
            const stops = gradient.reverse().map((color, index) => this.$createElement('stop', {
                attrs: {
                    offset: index / len,
                    'stop-color': color || 'currentColor',
                },
            }));
            return this.$createElement('defs', [
                this.$createElement('linearGradient', {
                    attrs: {
                        id: this._uid,
                        gradientUnits: 'userSpaceOnUse',
                        x1: gradientDirection === 'left' ? '100%' : '0',
                        y1: gradientDirection === 'top' ? '100%' : '0',
                        x2: gradientDirection === 'right' ? '100%' : '0',
                        y2: gradientDirection === 'bottom' ? '100%' : '0',
                    },
                }, stops),
            ]);
        },
        genG(children) {
            return this.$createElement('g', {
                style: {
                    fontSize: '8',
                    textAnchor: 'middle',
                    dominantBaseline: 'mathematical',
                    fill: 'currentColor',
                },
            }, children);
        },
        genPath() {
            const points = genPoints(this.normalizedValues, this.boundary);
            return this.$createElement('path', {
                attrs: {
                    d: genPath(points, this._radius, this.fill, this.parsedHeight),
                    fill: this.fill ? `url(#${this._uid})` : 'none',
                    stroke: this.fill ? 'none' : `url(#${this._uid})`,
                },
                ref: 'path',
            });
        },
        genLabels(offsetX) {
            const children = this.parsedLabels.map((item, i) => (this.$createElement('text', {
                attrs: {
                    x: item.x + offsetX + this._lineWidth / 2,
                    y: this.textY + (this.parsedLabelSize * 0.75),
                    'font-size': Number(this.labelSize) || 7,
                },
            }, [this.genLabel(item, i)])));
            return this.genG(children);
        },
        genLabel(item, index) {
            return this.$scopedSlots.label
                ? this.$scopedSlots.label({ index, value: item.value })
                : item.value;
        },
        genBars() {
            if (!this.value || this.totalValues < 2)
                return undefined;
            const bars = genBars(this.normalizedValues, this.boundary);
            const offsetX = (Math.abs(bars[0].x - bars[1].x) - this._lineWidth) / 2;
            return this.$createElement('svg', {
                attrs: {
                    display: 'block',
                    viewBox: `0 0 ${this.totalWidth} ${this.totalHeight}`,
                },
            }, [
                this.genGradient(),
                this.genClipPath(bars, offsetX, this._lineWidth, 'sparkline-bar-' + this._uid),
                this.hasLabels ? this.genLabels(offsetX) : undefined,
                this.$createElement('g', {
                    attrs: {
                        'clip-path': `url(#sparkline-bar-${this._uid}-clip)`,
                        fill: `url(#${this._uid})`,
                    },
                }, [
                    this.$createElement('rect', {
                        attrs: {
                            x: 0,
                            y: 0,
                            width: this.totalWidth,
                            height: this.height,
                        },
                    }),
                ]),
            ]);
        },
        genClipPath(bars, offsetX, lineWidth, id) {
            const rounding = typeof this.smooth === 'number'
                ? this.smooth
                : this.smooth ? 2 : 0;
            return this.$createElement('clipPath', {
                attrs: {
                    id: `${id}-clip`,
                },
            }, bars.map(item => {
                return this.$createElement('rect', {
                    attrs: {
                        x: item.x + offsetX,
                        y: item.y,
                        width: lineWidth,
                        height: item.height,
                        rx: rounding,
                        ry: rounding,
                    },
                }, [
                    this.autoDraw ? this.$createElement('animate', {
                        attrs: {
                            attributeName: 'height',
                            from: 0,
                            to: item.height,
                            dur: `${this.autoDrawDuration}ms`,
                            fill: 'freeze',
                        },
                    }) : undefined,
                ]);
            }));
        },
        genTrend() {
            return this.$createElement('svg', this.setTextColor(this.color, {
                attrs: {
                    ...this.$attrs,
                    display: 'block',
                    'stroke-width': this._lineWidth || 1,
                    viewBox: `0 0 ${this.width} ${this.totalHeight}`,
                },
            }), [
                this.genGradient(),
                this.hasLabels && this.genLabels(-(this._lineWidth / 2)),
                this.genPath(),
            ]);
        },
    },
    render(h) {
        if (this.totalValues < 2)
            return undefined;
        return this.type === 'trend' ? this.genTrend() : this.genBars();
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNwYXJrbGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZTcGFya2xpbmUvVlNwYXJrbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsWUFBWTtBQUNaLE9BQU8sTUFBc0IsTUFBTSxtQkFBbUIsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ25ELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQXVDeEMsZUFBZSxNQUFNLENBT25CLFNBQVMsQ0FDVixDQUFDLE1BQU0sQ0FBQztJQUNQLElBQUksRUFBRSxZQUFZO0lBRWxCLFlBQVksRUFBRSxLQUFLO0lBRW5CLEtBQUssRUFBRTtRQUNMLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLGdCQUFnQixFQUFFO1lBQ2hCLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLElBQUk7U0FDZDtRQUNELGNBQWMsRUFBRTtZQUNkLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLE1BQU07U0FDaEI7UUFDRCxhQUFhLEVBQUU7WUFDYixJQUFJLEVBQUUsT0FBTztZQUNiLE9BQU8sRUFBRSxLQUFLO1NBQ2Y7UUFDRCxLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxTQUFTO1NBQ25CO1FBQ0QsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsS0FBSztTQUNmO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsSUFBSSxFQUFFLEtBQUs7WUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDTztRQUM1QixpQkFBaUIsRUFBRTtZQUNqQixJQUFJLEVBQUUsTUFBbUQ7WUFDekQsU0FBUyxFQUFFLENBQUMsR0FB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QVcsR0FBRyxDQUFDO1lBQUUsT0FBTyxTQUFrQixDQUFBO1FBRW5ELE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQ2pFLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBNaXhpbnNcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zLCB7IEV4dHJhY3RWdWUgfSBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGdlblBvaW50cywgZ2VuQmFycyB9IGZyb20gJy4vaGVscGVycy9jb3JlJ1xuaW1wb3J0IHsgZ2VuUGF0aCB9IGZyb20gJy4vaGVscGVycy9wYXRoJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IFZ1ZSwgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFByb3AsIFByb3BWYWxpZGF0b3IgfSBmcm9tICd2dWUvdHlwZXMvb3B0aW9ucydcblxuZXhwb3J0IHR5cGUgU3BhcmtsaW5lSXRlbSA9IG51bWJlciB8IHsgdmFsdWU6IG51bWJlciB9XG5cbmV4cG9ydCB0eXBlIFNwYXJrbGluZVRleHQgPSB7XG4gIHg6IG51bWJlclxuICB2YWx1ZTogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQm91bmRhcnkge1xuICBtaW5YOiBudW1iZXJcbiAgbWluWTogbnVtYmVyXG4gIG1heFg6IG51bWJlclxuICBtYXhZOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb2ludCB7XG4gIHg6IG51bWJlclxuICB5OiBudW1iZXJcbiAgdmFsdWU6IG51bWJlclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJhciB7XG4gIHg6IG51bWJlclxuICB5OiBudW1iZXJcbiAgaGVpZ2h0OiBudW1iZXJcbiAgdmFsdWU6IG51bWJlclxufVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIFZ1ZSB7XG4gICRyZWZzOiB7XG4gICAgcGF0aDogU1ZHUGF0aEVsZW1lbnRcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBtaXhpbnM8b3B0aW9ucyAmXG4vKiBlc2xpbnQtZGlzYWJsZSBpbmRlbnQgKi9cbiAgRXh0cmFjdFZ1ZTxbXG4gICAgdHlwZW9mIENvbG9yYWJsZVxuICBdPlxuLyogZXNsaW50LWVuYWJsZSBpbmRlbnQgKi9cbj4oXG4gIENvbG9yYWJsZVxuKS5leHRlbmQoe1xuICBuYW1lOiAnVlNwYXJrbGluZScsXG5cbiAgaW5oZXJpdEF0dHJzOiBmYWxzZSxcblxuICBwcm9wczoge1xuICAgIGF1dG9EcmF3OiBCb29sZWFuLFxuICAgIGF1dG9EcmF3RHVyYXRpb246IHtcbiAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDIwMDAsXG4gICAgfSxcbiAgICBhdXRvRHJhd0Vhc2luZzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2Vhc2UnLFxuICAgIH0sXG4gICAgYXV0b0xpbmVXaWR0aDoge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgY29sb3I6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdwcmltYXJ5JyxcbiAgICB9LFxuICAgIGZpbGw6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIGdyYWRpZW50OiB7XG4gICAgICB0eXBlOiBBcnJheSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+IChbXSksXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPHN0cmluZ1tdPixcbiAgICBncmFkaWVudERpcmVjdGlvbjoge1xuICAgICAgdHlwZTogU3RyaW5nIGFzIFByb3A8J3RvcCcgfCAnYm90dG9tJyB8ICdsZWZ0JyB8ICdyaWdodCc+LFxuICAgICAgdmFsaWRhdG9yOiAodmFsOiBzdHJpbmcpID0+IFsndG9wJywgJ2JvdHRvbScsICdsZWZ0JywgJ3JpZ2h0J10uaW5jbHVkZXModmFsKSxcbiAgICAgIGRlZmF1bHQ6ICd0b3AnLFxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBOdW1iZXJdLFxuICAgICAgZGVmYXVsdDogNzUsXG4gICAgfSxcbiAgICBsYWJlbHM6IHtcbiAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKFtdKSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8U3BhcmtsaW5lSXRlbVtdPixcbiAgICBsYWJlbFNpemU6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiA3LFxuICAgIH0sXG4gICAgbGluZVdpZHRoOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBOdW1iZXJdLFxuICAgICAgZGVmYXVsdDogNCxcbiAgICB9LFxuICAgIHBhZGRpbmc6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIE51bWJlcl0sXG4gICAgICBkZWZhdWx0OiA4LFxuICAgIH0sXG4gICAgc2hvd0xhYmVsczogQm9vbGVhbixcbiAgICBzbW9vdGg6IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIHR5cGU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyBhcyBQcm9wPCd0cmVuZCcgfCAnYmFyJz4sXG4gICAgICBkZWZhdWx0OiAndHJlbmQnLFxuICAgICAgdmFsaWRhdG9yOiAodmFsOiBzdHJpbmcpID0+IFsndHJlbmQnLCAnYmFyJ10uaW5jbHVkZXModmFsKSxcbiAgICB9LFxuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiBBcnJheSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+IChbXSksXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPFNwYXJrbGluZUl0ZW1bXT4sXG4gICAgd2lkdGg6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAzMDAsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGxhc3RMZW5ndGg6IDAsXG4gIH0pLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgcGFyc2VkUGFkZGluZyAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBOdW1iZXIodGhpcy5wYWRkaW5nKVxuICAgIH0sXG4gICAgcGFyc2VkV2lkdGggKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gTnVtYmVyKHRoaXMud2lkdGgpXG4gICAgfSxcbiAgICBwYXJzZWRIZWlnaHQgKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy5oZWlnaHQsIDEwKVxuICAgIH0sXG4gICAgcGFyc2VkTGFiZWxTaXplICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMubGFiZWxTaXplLCAxMCkgfHwgN1xuICAgIH0sXG4gICAgdG90YWxIZWlnaHQgKCk6IG51bWJlciB7XG4gICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5wYXJzZWRIZWlnaHRcblxuICAgICAgaWYgKHRoaXMuaGFzTGFiZWxzKSBoZWlnaHQgKz0gcGFyc2VJbnQodGhpcy5sYWJlbFNpemUsIDEwKSAqIDEuNVxuXG4gICAgICByZXR1cm4gaGVpZ2h0XG4gICAgfSxcbiAgICB0b3RhbFdpZHRoICgpOiBudW1iZXIge1xuICAgICAgbGV0IHdpZHRoID0gdGhpcy5wYXJzZWRXaWR0aFxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2JhcicpIHdpZHRoID0gTWF0aC5tYXgodGhpcy52YWx1ZS5sZW5ndGggKiB0aGlzLl9saW5lV2lkdGgsIHdpZHRoKVxuXG4gICAgICByZXR1cm4gd2lkdGhcbiAgICB9LFxuICAgIHRvdGFsVmFsdWVzICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUubGVuZ3RoXG4gICAgfSxcbiAgICBfbGluZVdpZHRoICgpOiBudW1iZXIge1xuICAgICAgaWYgKHRoaXMuYXV0b0xpbmVXaWR0aCAmJiB0aGlzLnR5cGUgIT09ICd0cmVuZCcpIHtcbiAgICAgICAgY29uc3QgdG90YWxQYWRkaW5nID0gdGhpcy5wYXJzZWRQYWRkaW5nICogKHRoaXMudG90YWxWYWx1ZXMgKyAxKVxuICAgICAgICByZXR1cm4gKHRoaXMucGFyc2VkV2lkdGggLSB0b3RhbFBhZGRpbmcpIC8gdGhpcy50b3RhbFZhbHVlc1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5saW5lV2lkdGgpIHx8IDRcbiAgICAgIH1cbiAgICB9LFxuICAgIGJvdW5kYXJ5ICgpOiBCb3VuZGFyeSB7XG4gICAgICBpZiAodGhpcy50eXBlID09PSAnYmFyJykgcmV0dXJuIHsgbWluWDogMCwgbWF4WDogdGhpcy50b3RhbFdpZHRoLCBtaW5ZOiAwLCBtYXhZOiB0aGlzLnBhcnNlZEhlaWdodCB9XG5cbiAgICAgIGNvbnN0IHBhZGRpbmcgPSB0aGlzLnBhcnNlZFBhZGRpbmdcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWluWDogcGFkZGluZyxcbiAgICAgICAgbWF4WDogdGhpcy50b3RhbFdpZHRoIC0gcGFkZGluZyxcbiAgICAgICAgbWluWTogcGFkZGluZyxcbiAgICAgICAgbWF4WTogdGhpcy5wYXJzZWRIZWlnaHQgLSBwYWRkaW5nLFxuICAgICAgfVxuICAgIH0sXG4gICAgaGFzTGFiZWxzICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBCb29sZWFuKFxuICAgICAgICB0aGlzLnNob3dMYWJlbHMgfHxcbiAgICAgICAgdGhpcy5sYWJlbHMubGVuZ3RoID4gMCB8fFxuICAgICAgICB0aGlzLiRzY29wZWRTbG90cy5sYWJlbFxuICAgICAgKVxuICAgIH0sXG4gICAgcGFyc2VkTGFiZWxzICgpOiBTcGFya2xpbmVUZXh0W10ge1xuICAgICAgY29uc3QgbGFiZWxzID0gW11cbiAgICAgIGNvbnN0IHBvaW50cyA9IHRoaXMuX3ZhbHVlc1xuICAgICAgY29uc3QgbGVuID0gcG9pbnRzLmxlbmd0aFxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgbGFiZWxzLmxlbmd0aCA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwb2ludHNbaV1cbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5sYWJlbHNbaV1cblxuICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgdmFsdWUgPSB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCdcbiAgICAgICAgICAgID8gaXRlbS52YWx1ZVxuICAgICAgICAgICAgOiBpdGVtXG4gICAgICAgIH1cblxuICAgICAgICBsYWJlbHMucHVzaCh7XG4gICAgICAgICAgeDogaXRlbS54LFxuICAgICAgICAgIHZhbHVlOiBTdHJpbmcodmFsdWUpLFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGFiZWxzXG4gICAgfSxcbiAgICBub3JtYWxpemVkVmFsdWVzICgpOiBudW1iZXJbXSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5tYXAoaXRlbSA9PiAodHlwZW9mIGl0ZW0gPT09ICdudW1iZXInID8gaXRlbSA6IGl0ZW0udmFsdWUpKVxuICAgIH0sXG4gICAgX3ZhbHVlcyAoKTogUG9pbnRbXSB8IEJhcltdIHtcbiAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09ICd0cmVuZCcgPyBnZW5Qb2ludHModGhpcy5ub3JtYWxpemVkVmFsdWVzLCB0aGlzLmJvdW5kYXJ5KSA6IGdlbkJhcnModGhpcy5ub3JtYWxpemVkVmFsdWVzLCB0aGlzLmJvdW5kYXJ5KVxuICAgIH0sXG4gICAgdGV4dFkgKCk6IG51bWJlciB7XG4gICAgICBsZXQgeSA9IHRoaXMucGFyc2VkSGVpZ2h0XG4gICAgICBpZiAodGhpcy50eXBlID09PSAndHJlbmQnKSB5IC09IDRcbiAgICAgIHJldHVybiB5XG4gICAgfSxcbiAgICBfcmFkaXVzICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuc21vb3RoID09PSB0cnVlID8gOCA6IE51bWJlcih0aGlzLnNtb290aClcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgIGhhbmRsZXIgKCkge1xuICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIXRoaXMuYXV0b0RyYXcgfHxcbiAgICAgICAgICAgIHRoaXMudHlwZSA9PT0gJ2JhcicgfHxcbiAgICAgICAgICAgICF0aGlzLiRyZWZzLnBhdGhcbiAgICAgICAgICApIHJldHVyblxuXG4gICAgICAgICAgY29uc3QgcGF0aCA9IHRoaXMuJHJlZnMucGF0aFxuICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHBhdGguZ2V0VG90YWxMZW5ndGgoKVxuXG4gICAgICAgICAgaWYgKCF0aGlzLmZpbGwpIHtcbiAgICAgICAgICAgIHBhdGguc3R5bGUudHJhbnNpdGlvbiA9ICdub25lJ1xuICAgICAgICAgICAgcGF0aC5zdHlsZS5zdHJva2VEYXNoYXJyYXkgPSBsZW5ndGggKyAnICcgKyBsZW5ndGhcbiAgICAgICAgICAgIHBhdGguc3R5bGUuc3Ryb2tlRGFzaG9mZnNldCA9IE1hdGguYWJzKGxlbmd0aCAtICh0aGlzLmxhc3RMZW5ndGggfHwgMCkpLnRvU3RyaW5nKClcbiAgICAgICAgICAgIHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIHBhdGguc3R5bGUudHJhbnNpdGlvbiA9IGBzdHJva2UtZGFzaG9mZnNldCAke3RoaXMuYXV0b0RyYXdEdXJhdGlvbn1tcyAke3RoaXMuYXV0b0RyYXdFYXNpbmd9YFxuICAgICAgICAgICAgcGF0aC5zdHlsZS5zdHJva2VEYXNob2Zmc2V0ID0gJzAnXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGguc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ2JvdHRvbSBjZW50ZXInXG4gICAgICAgICAgICBwYXRoLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSdcbiAgICAgICAgICAgIHBhdGguc3R5bGUudHJhbnNmb3JtID0gYHNjYWxlWSgwKWBcbiAgICAgICAgICAgIHBhdGguZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIHBhdGguc3R5bGUudHJhbnNpdGlvbiA9IGB0cmFuc2Zvcm0gJHt0aGlzLmF1dG9EcmF3RHVyYXRpb259bXMgJHt0aGlzLmF1dG9EcmF3RWFzaW5nfWBcbiAgICAgICAgICAgIHBhdGguc3R5bGUudHJhbnNmb3JtID0gYHNjYWxlWSgxKWBcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sYXN0TGVuZ3RoID0gbGVuZ3RoXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkdyYWRpZW50ICgpIHtcbiAgICAgIGNvbnN0IGdyYWRpZW50RGlyZWN0aW9uID0gdGhpcy5ncmFkaWVudERpcmVjdGlvblxuICAgICAgY29uc3QgZ3JhZGllbnQgPSB0aGlzLmdyYWRpZW50LnNsaWNlKClcblxuICAgICAgLy8gUHVzaGVzIGVtcHR5IHN0cmluZyB0byBmb3JjZVxuICAgICAgLy8gYSBmYWxsYmFjayB0byBjdXJyZW50Q29sb3JcbiAgICAgIGlmICghZ3JhZGllbnQubGVuZ3RoKSBncmFkaWVudC5wdXNoKCcnKVxuXG4gICAgICBjb25zdCBsZW4gPSBNYXRoLm1heChncmFkaWVudC5sZW5ndGggLSAxLCAxKVxuICAgICAgY29uc3Qgc3RvcHMgPSBncmFkaWVudC5yZXZlcnNlKCkubWFwKChjb2xvciwgaW5kZXgpID0+XG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3N0b3AnLCB7XG4gICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgIG9mZnNldDogaW5kZXggLyBsZW4sXG4gICAgICAgICAgICAnc3RvcC1jb2xvcic6IGNvbG9yIHx8ICdjdXJyZW50Q29sb3InLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkZWZzJywgW1xuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCdsaW5lYXJHcmFkaWVudCcsIHtcbiAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgaWQ6IHRoaXMuX3VpZCxcbiAgICAgICAgICAgIGdyYWRpZW50VW5pdHM6ICd1c2VyU3BhY2VPblVzZScsXG4gICAgICAgICAgICB4MTogZ3JhZGllbnREaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICcxMDAlJyA6ICcwJyxcbiAgICAgICAgICAgIHkxOiBncmFkaWVudERpcmVjdGlvbiA9PT0gJ3RvcCcgPyAnMTAwJScgOiAnMCcsXG4gICAgICAgICAgICB4MjogZ3JhZGllbnREaXJlY3Rpb24gPT09ICdyaWdodCcgPyAnMTAwJScgOiAnMCcsXG4gICAgICAgICAgICB5MjogZ3JhZGllbnREaXJlY3Rpb24gPT09ICdib3R0b20nID8gJzEwMCUnIDogJzAnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sIHN0b3BzKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5HIChjaGlsZHJlbjogVk5vZGVbXSkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2cnLCB7XG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgZm9udFNpemU6ICc4JyxcbiAgICAgICAgICB0ZXh0QW5jaG9yOiAnbWlkZGxlJyxcbiAgICAgICAgICBkb21pbmFudEJhc2VsaW5lOiAnbWF0aGVtYXRpY2FsJyxcbiAgICAgICAgICBmaWxsOiAnY3VycmVudENvbG9yJyxcbiAgICAgICAgfSBhcyBvYmplY3QsIC8vIFRPRE86IFRTIDMuNSBpcyB0b28gZWFnZXIgd2l0aCB0aGUgYXJyYXkgdHlwZSBoZXJlXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlblBhdGggKCkge1xuICAgICAgY29uc3QgcG9pbnRzID0gZ2VuUG9pbnRzKHRoaXMubm9ybWFsaXplZFZhbHVlcywgdGhpcy5ib3VuZGFyeSlcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3BhdGgnLCB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgZDogZ2VuUGF0aChwb2ludHMsIHRoaXMuX3JhZGl1cywgdGhpcy5maWxsLCB0aGlzLnBhcnNlZEhlaWdodCksXG4gICAgICAgICAgZmlsbDogdGhpcy5maWxsID8gYHVybCgjJHt0aGlzLl91aWR9KWAgOiAnbm9uZScsXG4gICAgICAgICAgc3Ryb2tlOiB0aGlzLmZpbGwgPyAnbm9uZScgOiBgdXJsKCMke3RoaXMuX3VpZH0pYCxcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAncGF0aCcsXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuTGFiZWxzIChvZmZzZXRYOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5wYXJzZWRMYWJlbHMubWFwKChpdGVtLCBpKSA9PiAoXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RleHQnLCB7XG4gICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgIHg6IGl0ZW0ueCArIG9mZnNldFggKyB0aGlzLl9saW5lV2lkdGggLyAyLFxuICAgICAgICAgICAgeTogdGhpcy50ZXh0WSArICh0aGlzLnBhcnNlZExhYmVsU2l6ZSAqIDAuNzUpLFxuICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6IE51bWJlcih0aGlzLmxhYmVsU2l6ZSkgfHwgNyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LCBbdGhpcy5nZW5MYWJlbChpdGVtLCBpKV0pXG4gICAgICApKVxuXG4gICAgICByZXR1cm4gdGhpcy5nZW5HKGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuTGFiZWwgKGl0ZW06IFNwYXJrbGluZVRleHQsIGluZGV4OiBudW1iZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLiRzY29wZWRTbG90cy5sYWJlbFxuICAgICAgICA/IHRoaXMuJHNjb3BlZFNsb3RzLmxhYmVsKHsgaW5kZXgsIHZhbHVlOiBpdGVtLnZhbHVlIH0pXG4gICAgICAgIDogaXRlbS52YWx1ZVxuICAgIH0sXG4gICAgZ2VuQmFycyAoKSB7XG4gICAgICBpZiAoIXRoaXMudmFsdWUgfHwgdGhpcy50b3RhbFZhbHVlcyA8IDIpIHJldHVybiB1bmRlZmluZWQgYXMgbmV2ZXJcblxuICAgICAgY29uc3QgYmFycyA9IGdlbkJhcnModGhpcy5ub3JtYWxpemVkVmFsdWVzLCB0aGlzLmJvdW5kYXJ5KVxuICAgICAgY29uc3Qgb2Zmc2V0WCA9IChNYXRoLmFicyhiYXJzWzBdLnggLSBiYXJzWzFdLngpIC0gdGhpcy5fbGluZVdpZHRoKSAvIDJcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3N2ZycsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgICAgICAgIHZpZXdCb3g6IGAwIDAgJHt0aGlzLnRvdGFsV2lkdGh9ICR7dGhpcy50b3RhbEhlaWdodH1gLFxuICAgICAgICB9LFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmdlbkdyYWRpZW50KCksXG4gICAgICAgIHRoaXMuZ2VuQ2xpcFBhdGgoYmFycywgb2Zmc2V0WCwgdGhpcy5fbGluZVdpZHRoLCAnc3BhcmtsaW5lLWJhci0nICsgdGhpcy5fdWlkKSxcbiAgICAgICAgdGhpcy5oYXNMYWJlbHMgPyB0aGlzLmdlbkxhYmVscyhvZmZzZXRYKSA6IHVuZGVmaW5lZCBhcyBuZXZlcixcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZycsIHtcbiAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgJ2NsaXAtcGF0aCc6IGB1cmwoI3NwYXJrbGluZS1iYXItJHt0aGlzLl91aWR9LWNsaXApYCxcbiAgICAgICAgICAgIGZpbGw6IGB1cmwoIyR7dGhpcy5fdWlkfSlgLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sIFtcbiAgICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCdyZWN0Jywge1xuICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgICAgd2lkdGg6IHRoaXMudG90YWxXaWR0aCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0pLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkNsaXBQYXRoIChiYXJzOiBCYXJbXSwgb2Zmc2V0WDogbnVtYmVyLCBsaW5lV2lkdGg6IG51bWJlciwgaWQ6IHN0cmluZykge1xuICAgICAgY29uc3Qgcm91bmRpbmcgPSB0eXBlb2YgdGhpcy5zbW9vdGggPT09ICdudW1iZXInXG4gICAgICAgID8gdGhpcy5zbW9vdGhcbiAgICAgICAgOiB0aGlzLnNtb290aCA/IDIgOiAwXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdjbGlwUGF0aCcsIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBpZDogYCR7aWR9LWNsaXBgLFxuICAgICAgICB9LFxuICAgICAgfSwgYmFycy5tYXAoaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdyZWN0Jywge1xuICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICB4OiBpdGVtLnggKyBvZmZzZXRYLFxuICAgICAgICAgICAgeTogaXRlbS55LFxuICAgICAgICAgICAgd2lkdGg6IGxpbmVXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaXRlbS5oZWlnaHQsXG4gICAgICAgICAgICByeDogcm91bmRpbmcsXG4gICAgICAgICAgICByeTogcm91bmRpbmcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSwgW1xuICAgICAgICAgIHRoaXMuYXV0b0RyYXcgPyB0aGlzLiRjcmVhdGVFbGVtZW50KCdhbmltYXRlJywge1xuICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgYXR0cmlidXRlTmFtZTogJ2hlaWdodCcsXG4gICAgICAgICAgICAgIGZyb206IDAsXG4gICAgICAgICAgICAgIHRvOiBpdGVtLmhlaWdodCxcbiAgICAgICAgICAgICAgZHVyOiBgJHt0aGlzLmF1dG9EcmF3RHVyYXRpb259bXNgLFxuICAgICAgICAgICAgICBmaWxsOiAnZnJlZXplJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSkgOiB1bmRlZmluZWQgYXMgbmV2ZXIsXG4gICAgICAgIF0pXG4gICAgICB9KSlcbiAgICB9LFxuICAgIGdlblRyZW5kICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdzdmcnLCB0aGlzLnNldFRleHRDb2xvcih0aGlzLmNvbG9yLCB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgLi4udGhpcy4kYXR0cnMsXG4gICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgICAnc3Ryb2tlLXdpZHRoJzogdGhpcy5fbGluZVdpZHRoIHx8IDEsXG4gICAgICAgICAgdmlld0JveDogYDAgMCAke3RoaXMud2lkdGh9ICR7dGhpcy50b3RhbEhlaWdodH1gLFxuICAgICAgICB9LFxuICAgICAgfSksIFtcbiAgICAgICAgdGhpcy5nZW5HcmFkaWVudCgpLFxuICAgICAgICB0aGlzLmhhc0xhYmVscyAmJiB0aGlzLmdlbkxhYmVscygtKHRoaXMuX2xpbmVXaWR0aCAvIDIpKSxcbiAgICAgICAgdGhpcy5nZW5QYXRoKCksXG4gICAgICBdKVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGlmICh0aGlzLnRvdGFsVmFsdWVzIDwgMikgcmV0dXJuIHVuZGVmaW5lZCBhcyBuZXZlclxuXG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gJ3RyZW5kJyA/IHRoaXMuZ2VuVHJlbmQoKSA6IHRoaXMuZ2VuQmFycygpXG4gIH0sXG59KVxuIl19
// Styles
import './VColorPickerCanvas.sass';
// Helpers
import { clamp, convertToUnit } from '../../util/helpers';
import { fromHSVA, fromRGBA } from './util';
// Types
import Vue from 'vue';
export default Vue.extend({
    name: 'v-color-picker-canvas',
    props: {
        color: {
            type: Object,
            default: () => fromRGBA({ r: 255, g: 0, b: 0, a: 1 }),
        },
        disabled: Boolean,
        dotSize: {
            type: [Number, String],
            default: 10,
        },
        height: {
            type: [Number, String],
            default: 150,
        },
        width: {
            type: [Number, String],
            default: 300,
        },
    },
    data() {
        return {
            boundingRect: {
                width: 0,
                height: 0,
                left: 0,
                top: 0,
            },
        };
    },
    computed: {
        dot() {
            if (!this.color)
                return { x: 0, y: 0 };
            return {
                x: this.color.hsva.s * parseInt(this.width, 10),
                y: (1 - this.color.hsva.v) * parseInt(this.height, 10),
            };
        },
    },
    watch: {
        'color.hue': 'updateCanvas',
    },
    mounted() {
        this.updateCanvas();
    },
    methods: {
        emitColor(x, y) {
            const { left, top, width, height } = this.boundingRect;
            this.$emit('update:color', fromHSVA({
                h: this.color.hue,
                s: clamp(x - left, 0, width) / width,
                v: 1 - clamp(y - top, 0, height) / height,
                a: this.color.alpha,
            }));
        },
        updateCanvas() {
            if (!this.color)
                return;
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            const saturationGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            saturationGradient.addColorStop(0, 'hsla(0, 0%, 100%, 1)'); // white
            saturationGradient.addColorStop(1, `hsla(${this.color.hue}, 100%, 50%, 1)`);
            ctx.fillStyle = saturationGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const valueGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            valueGradient.addColorStop(0, 'hsla(0, 0%, 100%, 0)'); // transparent
            valueGradient.addColorStop(1, 'hsla(0, 0%, 0%, 1)'); // black
            ctx.fillStyle = valueGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        },
        handleClick(e) {
            if (this.disabled)
                return;
            this.boundingRect = this.$el.getBoundingClientRect();
            this.emitColor(e.clientX, e.clientY);
        },
        handleMouseDown(e) {
            // To prevent selection while moving cursor
            e.preventDefault();
            if (this.disabled)
                return;
            this.boundingRect = this.$el.getBoundingClientRect();
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        },
        handleMouseMove(e) {
            if (this.disabled)
                return;
            this.emitColor(e.clientX, e.clientY);
        },
        handleMouseUp() {
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseup', this.handleMouseUp);
        },
        genCanvas() {
            return this.$createElement('canvas', {
                ref: 'canvas',
                attrs: {
                    width: this.width,
                    height: this.height,
                },
            });
        },
        genDot() {
            const radius = parseInt(this.dotSize, 10) / 2;
            const x = convertToUnit(this.dot.x - radius);
            const y = convertToUnit(this.dot.y - radius);
            return this.$createElement('div', {
                staticClass: 'v-color-picker__canvas-dot',
                class: {
                    'v-color-picker__canvas-dot--disabled': this.disabled,
                },
                style: {
                    width: convertToUnit(this.dotSize),
                    height: convertToUnit(this.dotSize),
                    transform: `translate(${x}, ${y})`,
                },
            });
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-color-picker__canvas',
            style: {
                width: convertToUnit(this.width),
                height: convertToUnit(this.height),
            },
            on: {
                click: this.handleClick,
                mousedown: this.handleMouseDown,
            },
        }, [
            this.genCanvas(),
            this.genDot(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNvbG9yUGlja2VyQ2FudmFzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkNvbG9yUGlja2VyL1ZDb2xvclBpY2tlckNhbnZhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTywyQkFBMkIsQ0FBQTtBQUVsQyxVQUFVO0FBQ1YsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFxQixRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFFOUQsUUFBUTtBQUNSLE9BQU8sR0FBd0IsTUFBTSxLQUFLLENBQUE7QUFFMUMsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSx1QkFBdUI7SUFFN0IsS0FBSyxFQUFFO1FBQ0wsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLE1BQXFDO1lBQzNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDdEQ7UUFDRCxRQUFRLEVBQUUsT0FBTztRQUNqQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxFQUFFO1NBQ1o7UUFDRCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxHQUFHO1NBQ2I7UUFDRCxLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxHQUFHO1NBQ2I7S0FDRjtJQUVELElBQUk7UUFDRixPQUFPO1lBQ0wsWUFBWSxFQUFFO2dCQUNaLEtB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QyxNQUFNLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDbkM7WUFDRCxFQUFFLEVBQUU7Z0JBQ0YsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUN2QixTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWU7YUFDaEM7U0FDRixFQUFFO1lBQ0QsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsTUFBTSxFQUFFO1NBQ2QsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZDb2xvclBpY2tlckNhbnZhcy5zYXNzJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQgeyBjbGFtcCwgY29udmVydFRvVW5pdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCB7IGZyb21IU1ZBLCBWQ29sb3JQaWNrZXJDb2xvciwgZnJvbVJHQkEgfSBmcm9tICcuL3V0aWwnXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlLCB7IFZOb2RlLCBQcm9wVHlwZSB9IGZyb20gJ3Z1ZSdcblxuZXhwb3J0IGRlZmF1bHQgVnVlLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWNvbG9yLXBpY2tlci1jYW52YXMnLFxuXG4gIHByb3BzOiB7XG4gICAgY29sb3I6IHtcbiAgICAgIHR5cGU6IE9iamVjdCBhcyBQcm9wVHlwZTxWQ29sb3JQaWNrZXJDb2xvcj4sXG4gICAgICBkZWZhdWx0OiAoKSA9PiBmcm9tUkdCQSh7IHI6IDI1NSwgZzogMCwgYjogMCwgYTogMSB9KSxcbiAgICB9LFxuICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIGRvdFNpemU6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAxMCxcbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDE1MCxcbiAgICB9LFxuICAgIHdpZHRoOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMzAwLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJvdW5kaW5nUmVjdDoge1xuICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICB9IGFzIENsaWVudFJlY3QsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgZG90ICgpOiB7IHg6IG51bWJlciwgeTogbnVtYmVyfSB7XG4gICAgICBpZiAoIXRoaXMuY29sb3IpIHJldHVybiB7IHg6IDAsIHk6IDAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aGlzLmNvbG9yLmhzdmEucyAqIHBhcnNlSW50KHRoaXMud2lkdGgsIDEwKSxcbiAgICAgICAgeTogKDEgLSB0aGlzLmNvbG9yLmhzdmEudikgKiBwYXJzZUludCh0aGlzLmhlaWdodCwgMTApLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICAnY29sb3IuaHVlJzogJ3VwZGF0ZUNhbnZhcycsXG4gIH0sXG5cbiAgbW91bnRlZCAoKSB7XG4gICAgdGhpcy51cGRhdGVDYW52YXMoKVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBlbWl0Q29sb3IgKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICBjb25zdCB7IGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5ib3VuZGluZ1JlY3RcblxuICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOmNvbG9yJywgZnJvbUhTVkEoe1xuICAgICAgICBoOiB0aGlzLmNvbG9yLmh1ZSxcbiAgICAgICAgczogY2xhbXAoeCAtIGxlZnQsIDAsIHdpZHRoKSAvIHdpZHRoLFxuICAgICAgICB2OiAxIC0gY2xhbXAoeSAtIHRvcCwgMCwgaGVpZ2h0KSAvIGhlaWdodCxcbiAgICAgICAgYTogdGhpcy5jb2xvci5hbHBoYSxcbiAgICAgIH0pKVxuICAgIH0sXG4gICAgdXBkYXRlQ2FudmFzICgpIHtcbiAgICAgIGlmICghdGhpcy5jb2xvcikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuJHJlZnMuY2FudmFzIGFzIEhUTUxDYW52YXNFbGVtZW50XG4gICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG4gICAgICBpZiAoIWN0eCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHNhdHVyYXRpb25HcmFkaWVudCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCBjYW52YXMud2lkdGgsIDApXG4gICAgICBzYXR1cmF0aW9uR3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICdoc2xhKDAsIDAlLCAxMDAlLCAxKScpIC8vIHdoaXRlXG4gICAgICBzYXR1cmF0aW9uR3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsIGBoc2xhKCR7dGhpcy5jb2xvci5odWV9LCAxMDAlLCA1MCUsIDEpYClcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBzYXR1cmF0aW9uR3JhZGllbnRcbiAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG5cbiAgICAgIGNvbnN0IHZhbHVlR3JhZGllbnQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgMCwgY2FudmFzLmhlaWdodClcbiAgICAgIHZhbHVlR3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICdoc2xhKDAsIDAlLCAxMDAlLCAwKScpIC8vIHRyYW5zcGFyZW50XG4gICAgICB2YWx1ZUdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAnaHNsYSgwLCAwJSwgMCUsIDEpJykgLy8gYmxhY2tcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB2YWx1ZUdyYWRpZW50XG4gICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuICAgIH0sXG4gICAgaGFuZGxlQ2xpY2sgKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm5cblxuICAgICAgdGhpcy5ib3VuZGluZ1JlY3QgPSB0aGlzLiRlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgdGhpcy5lbWl0Q29sb3IoZS5jbGllbnRYLCBlLmNsaWVudFkpXG4gICAgfSxcbiAgICBoYW5kbGVNb3VzZURvd24gKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgIC8vIFRvIHByZXZlbnQgc2VsZWN0aW9uIHdoaWxlIG1vdmluZyBjdXJzb3JcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMuYm91bmRpbmdSZWN0ID0gdGhpcy4kZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuaGFuZGxlTW91c2VNb3ZlKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmhhbmRsZU1vdXNlVXApXG4gICAgfSxcbiAgICBoYW5kbGVNb3VzZU1vdmUgKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm5cblxuICAgICAgdGhpcy5lbWl0Q29sb3IoZS5jbGllbnRYLCBlLmNsaWVudFkpXG4gICAgfSxcbiAgICBoYW5kbGVNb3VzZVVwICgpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZU1vdXNlTW92ZSlcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVNb3VzZVVwKVxuICAgIH0sXG4gICAgZ2VuQ2FudmFzICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnY2FudmFzJywge1xuICAgICAgICByZWY6ICdjYW52YXMnLFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuRG90ICgpOiBWTm9kZSB7XG4gICAgICBjb25zdCByYWRpdXMgPSBwYXJzZUludCh0aGlzLmRvdFNpemUsIDEwKSAvIDJcbiAgICAgIGNvbnN0IHggPSBjb252ZXJ0VG9Vbml0KHRoaXMuZG90LnggLSByYWRpdXMpXG4gICAgICBjb25zdCB5ID0gY29udmVydFRvVW5pdCh0aGlzLmRvdC55IC0gcmFkaXVzKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY29sb3ItcGlja2VyX19jYW52YXMtZG90JyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1jb2xvci1waWNrZXJfX2NhbnZhcy1kb3QtLWRpc2FibGVkJzogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB3aWR0aDogY29udmVydFRvVW5pdCh0aGlzLmRvdFNpemUpLFxuICAgICAgICAgIGhlaWdodDogY29udmVydFRvVW5pdCh0aGlzLmRvdFNpemUpLFxuICAgICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3h9LCAke3l9KWAsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKCdkaXYnLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtY29sb3ItcGlja2VyX19jYW52YXMnLFxuICAgICAgc3R5bGU6IHtcbiAgICAgICAgd2lkdGg6IGNvbnZlcnRUb1VuaXQodGhpcy53aWR0aCksXG4gICAgICAgIGhlaWdodDogY29udmVydFRvVW5pdCh0aGlzLmhlaWdodCksXG4gICAgICB9LFxuICAgICAgb246IHtcbiAgICAgICAgY2xpY2s6IHRoaXMuaGFuZGxlQ2xpY2ssXG4gICAgICAgIG1vdXNlZG93bjogdGhpcy5oYW5kbGVNb3VzZURvd24sXG4gICAgICB9LFxuICAgIH0sIFtcbiAgICAgIHRoaXMuZ2VuQ2FudmFzKCksXG4gICAgICB0aGlzLmdlbkRvdCgpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
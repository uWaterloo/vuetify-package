import './VTimePickerClock.sass';
// Mixins
import Colorable from '../../mixins/colorable';
import Themeable from '../../mixins/themeable';
// Types
import mixins from '../../util/mixins';
export default mixins(Colorable, Themeable
/* @vue/component */
).extend({
    name: 'v-time-picker-clock',
    props: {
        allowedValues: Function,
        ampm: Boolean,
        disabled: Boolean,
        double: Boolean,
        format: {
            type: Function,
            default: (val) => val,
        },
        max: {
            type: Number,
            required: true,
        },
        min: {
            type: Number,
            required: true,
        },
        scrollable: Boolean,
        readonly: Boolean,
        rotate: {
            type: Number,
            default: 0,
        },
        step: {
            type: Number,
            default: 1,
        },
        value: Number,
    },
    data() {
        return {
            inputValue: this.value,
            isDragging: false,
            valueOnMouseDown: null,
            valueOnMouseUp: null,
        };
    },
    computed: {
        count() {
            return this.max - this.min + 1;
        },
        degreesPerUnit() {
            return 360 / this.roundCount;
        },
        degrees() {
            return this.degreesPerUnit * Math.PI / 180;
        },
        displayedValue() {
            return this.value == null ? this.min : this.value;
        },
        innerRadiusScale() {
            return 0.62;
        },
        roundCount() {
            return this.double ? (this.count / 2) : this.count;
        },
    },
    watch: {
        value(value) {
            this.inputValue = value;
        },
    },
    methods: {
        wheel(e) {
            e.preventDefault();
            const delta = Math.sign(-e.deltaY || 1);
            let value = this.displayedValue;
            do {
                value = value + delta;
                value = (value - this.min + this.count) % this.count + this.min;
            } while (!this.isAllowed(value) && value !== this.displayedValue);
            if (value !== this.displayedValue) {
                this.update(value);
            }
        },
        isInner(value) {
            return this.double && (value - this.min >= this.roundCount);
        },
        handScale(value) {
            return this.isInner(value) ? this.innerRadiusScale : 1;
        },
        isAllowed(value) {
            return !this.allowedValues || this.allowedValues(value);
        },
        genValues() {
            const children = [];
            for (let value = this.min; value <= this.max; value = value + this.step) {
                const color = value === this.value && (this.color || 'accent');
                children.push(this.$createElement('span', this.setBackgroundColor(color, {
                    staticClass: 'v-time-picker-clock__item',
                    class: {
                        'v-time-picker-clock__item--active': value === this.displayedValue,
                        'v-time-picker-clock__item--disabled': this.disabled || !this.isAllowed(value),
                    },
                    style: this.getTransform(value),
                    domProps: { innerHTML: `<span>${this.format(value)}</span>` },
                })));
            }
            return children;
        },
        genHand() {
            const scale = `scaleY(${this.handScale(this.displayedValue)})`;
            const angle = this.rotate + this.degreesPerUnit * (this.displayedValue - this.min);
            const color = (this.value != null) && (this.color || 'accent');
            return this.$createElement('div', this.setBackgroundColor(color, {
                staticClass: 'v-time-picker-clock__hand',
                class: {
                    'v-time-picker-clock__hand--inner': this.isInner(this.value),
                },
                style: {
                    transform: `rotate(${angle}deg) ${scale}`,
                },
            }));
        },
        getTransform(i) {
            const { x, y } = this.getPosition(i);
            return {
                left: `${50 + x * 50}%`,
                top: `${50 + y * 50}%`,
            };
        },
        getPosition(value) {
            const rotateRadians = this.rotate * Math.PI / 180;
            return {
                x: Math.sin((value - this.min) * this.degrees + rotateRadians) * this.handScale(value),
                y: -Math.cos((value - this.min) * this.degrees + rotateRadians) * this.handScale(value),
            };
        },
        onMouseDown(e) {
            e.preventDefault();
            this.valueOnMouseDown = null;
            this.valueOnMouseUp = null;
            this.isDragging = true;
            this.onDragMove(e);
        },
        onMouseUp(e) {
            e.stopPropagation();
            this.isDragging = false;
            if (this.valueOnMouseUp !== null && this.isAllowed(this.valueOnMouseUp)) {
                this.$emit('change', this.valueOnMouseUp);
            }
        },
        onDragMove(e) {
            e.preventDefault();
            if ((!this.isDragging && e.type !== 'click') || !this.$refs.clock)
                return;
            const { width, top, left } = this.$refs.clock.getBoundingClientRect();
            const { width: innerWidth } = this.$refs.innerClock.getBoundingClientRect();
            const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
            const center = { x: width / 2, y: -width / 2 };
            const coords = { x: clientX - left, y: top - clientY };
            const handAngle = Math.round(this.angle(center, coords) - this.rotate + 360) % 360;
            const insideClick = this.double && this.euclidean(center, coords) < (innerWidth + innerWidth * this.innerRadiusScale) / 4;
            const checksCount = Math.ceil(15 / this.degreesPerUnit);
            let value;
            for (let i = 0; i < checksCount; i++) {
                value = this.angleToValue(handAngle + i * this.degreesPerUnit, insideClick);
                if (this.isAllowed(value))
                    return this.setMouseDownValue(value);
                value = this.angleToValue(handAngle - i * this.degreesPerUnit, insideClick);
                if (this.isAllowed(value))
                    return this.setMouseDownValue(value);
            }
        },
        angleToValue(angle, insideClick) {
            const value = (Math.round(angle / this.degreesPerUnit) +
                (insideClick ? this.roundCount : 0)) % this.count + this.min;
            // Necessary to fix edge case when selecting left part of the value(s) at 12 o'clock
            if (angle < (360 - this.degreesPerUnit / 2))
                return value;
            return insideClick ? this.max - this.roundCount + 1 : this.min;
        },
        setMouseDownValue(value) {
            if (this.valueOnMouseDown === null) {
                this.valueOnMouseDown = value;
            }
            this.valueOnMouseUp = value;
            this.update(value);
        },
        update(value) {
            if (this.inputValue !== value) {
                this.inputValue = value;
                this.$emit('input', value);
            }
        },
        euclidean(p0, p1) {
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            return Math.sqrt(dx * dx + dy * dy);
        },
        angle(center, p1) {
            const value = 2 * Math.atan2(p1.y - center.y - this.euclidean(center, p1), p1.x - center.x);
            return Math.abs(value * 180 / Math.PI);
        },
    },
    render(h) {
        const data = {
            staticClass: 'v-time-picker-clock',
            class: {
                'v-time-picker-clock--indeterminate': this.value == null,
                ...this.themeClasses,
            },
            on: (this.readonly || this.disabled) ? undefined : {
                mousedown: this.onMouseDown,
                mouseup: this.onMouseUp,
                mouseleave: (e) => (this.isDragging && this.onMouseUp(e)),
                touchstart: this.onMouseDown,
                touchend: this.onMouseUp,
                mousemove: this.onDragMove,
                touchmove: this.onDragMove,
            },
            ref: 'clock',
        };
        if (this.scrollable && data.on) {
            data.on.wheel = this.wheel;
        }
        return h('div', data, [
            h('div', {
                staticClass: 'v-time-picker-clock__inner',
                ref: 'innerClock',
            }, [
                this.genHand(),
                this.genValues(),
            ]),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRpbWVQaWNrZXJDbG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZUaW1lUGlja2VyL1ZUaW1lUGlja2VyQ2xvY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyx5QkFBeUIsQ0FBQTtBQUVoQyxTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsUUFBUTtBQUNSLE9BQU8sTUFBc0IsTUFBTSxtQkFBbUIsQ0FBQTtBQWdCdEQsZUFBZSxNQUFNLENBUW5CLFNBQVMsRUFDVCxTQUFTO0FBQ1gsb0JBQW9CO0NBQ25CLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLHFCQUFxQjtJQUUzQixLQUFLLEVBQUU7UUFDTCxhQUFhLEVBQUUsUUFBZ0Q7UUFDL0QsSUFBSSxFQUFFLE9BQU87UUFDYixRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVBQUUsT0FBTztRQUNmLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLENBQUMsR0FBb0IsRUFBRSxFQUFFLENBQUMsR0FBRztTQUNxQjtRQUM3RCxHQUFHLEVBQUU7WUFDSCxJQUFJLEVBQUUsTUFBTTtZQUNaLFFBQVEsRUFBRSxJQUFJO1NBQ2Y7UUFDRCxHQUFHLEVBQUU7WUFDSCxJQUFJLEVBQUUsTUFBTTtZQUNaLFFBQVEsRUFBRSxJQUFJO1NBQ2Y7UUFDRCxVQUFVLEVBQUUsT0FBTztRQUNuQixRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxLQUFLLEVBQUUsTUFBTTtLQUNkO0lBRUQsSUFBSTtRQUNGLE9BQU87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QUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckUsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM1QixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3hCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO2FBQzNCO1lBQ0QsR0FBRyxFQUFFLE9BQU87U0FDYixDQUFBO1FBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtTQUMzQjtRQUVELE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7WUFDcEIsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDUCxXQUFXLEVBQUUsNEJBQTRCO2dCQUN6QyxHQUFHLEVBQUUsWUFBWTthQUNsQixFQUFFO2dCQUNELElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFNBQVMsRUFBRTthQUNqQixDQUFDO1NBQ0gsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9WVGltZVBpY2tlckNsb2NrLnNhc3MnXG5cbi8vIE1peGluc1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgVnVlLCB7IFZOb2RlLCBQcm9wVHlwZSwgVk5vZGVEYXRhIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgUHJvcFZhbGlkYXRvciB9IGZyb20gJ3Z1ZS90eXBlcy9vcHRpb25zJ1xuXG5pbnRlcmZhY2UgUG9pbnQge1xuICB4OiBudW1iZXJcbiAgeTogbnVtYmVyXG59XG5cbmludGVyZmFjZSBvcHRpb25zIGV4dGVuZHMgVnVlIHtcbiAgJHJlZnM6IHtcbiAgICBjbG9jazogSFRNTEVsZW1lbnRcbiAgICBpbm5lckNsb2NrOiBIVE1MRWxlbWVudFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG1peGluczxvcHRpb25zICZcbi8qIGVzbGludC1kaXNhYmxlIGluZGVudCAqL1xuICBFeHRyYWN0VnVlPFtcbiAgICB0eXBlb2YgQ29sb3JhYmxlLFxuICAgIHR5cGVvZiBUaGVtZWFibGVcbiAgXT5cbi8qIGVzbGludC1lbmFibGUgaW5kZW50ICovXG4+KFxuICBDb2xvcmFibGUsXG4gIFRoZW1lYWJsZVxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtdGltZS1waWNrZXItY2xvY2snLFxuXG4gIHByb3BzOiB7XG4gICAgYWxsb3dlZFZhbHVlczogRnVuY3Rpb24gYXMgUHJvcFR5cGU8KHZhbHVlOiBudW1iZXIpID0+IGJvb2xlYW4+LFxuICAgIGFtcG06IEJvb2xlYW4sXG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgZG91YmxlOiBCb29sZWFuLFxuICAgIGZvcm1hdDoge1xuICAgICAgdHlwZTogRnVuY3Rpb24sXG4gICAgICBkZWZhdWx0OiAodmFsOiBzdHJpbmcgfCBudW1iZXIpID0+IHZhbCxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8KHZhbDogc3RyaW5nIHwgbnVtYmVyKSA9PiBzdHJpbmcgfCBudW1iZXI+LFxuICAgIG1heDoge1xuICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICBtaW46IHtcbiAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAgc2Nyb2xsYWJsZTogQm9vbGVhbixcbiAgICByZWFkb25seTogQm9vbGVhbixcbiAgICByb3RhdGU6IHtcbiAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgfSxcbiAgICBzdGVwOiB7XG4gICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICBkZWZhdWx0OiAxLFxuICAgIH0sXG4gICAgdmFsdWU6IE51bWJlcixcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW5wdXRWYWx1ZTogdGhpcy52YWx1ZSxcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgdmFsdWVPbk1vdXNlRG93bjogbnVsbCBhcyBudW1iZXIgfCBudWxsLFxuICAgICAgdmFsdWVPbk1vdXNlVXA6IG51bGwgYXMgbnVtYmVyIHwgbnVsbCxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjb3VudCAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLm1heCAtIHRoaXMubWluICsgMVxuICAgIH0sXG4gICAgZGVncmVlc1BlclVuaXQgKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gMzYwIC8gdGhpcy5yb3VuZENvdW50XG4gICAgfSxcbiAgICBkZWdyZWVzICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuZGVncmVlc1BlclVuaXQgKiBNYXRoLlBJIC8gMTgwXG4gICAgfSxcbiAgICBkaXNwbGF5ZWRWYWx1ZSAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlID09IG51bGwgPyB0aGlzLm1pbiA6IHRoaXMudmFsdWVcbiAgICB9LFxuICAgIGlubmVyUmFkaXVzU2NhbGUgKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gMC42MlxuICAgIH0sXG4gICAgcm91bmRDb3VudCAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLmRvdWJsZSA/ICh0aGlzLmNvdW50IC8gMikgOiB0aGlzLmNvdW50XG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIHZhbHVlICh2YWx1ZSkge1xuICAgICAgdGhpcy5pbnB1dFZhbHVlID0gdmFsdWVcbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICB3aGVlbCAoZTogV2hlZWxFdmVudCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbnN0IGRlbHRhID0gTWF0aC5zaWduKC1lLmRlbHRhWSB8fCAxKVxuICAgICAgbGV0IHZhbHVlID0gdGhpcy5kaXNwbGF5ZWRWYWx1ZVxuICAgICAgZG8ge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlICsgZGVsdGFcbiAgICAgICAgdmFsdWUgPSAodmFsdWUgLSB0aGlzLm1pbiArIHRoaXMuY291bnQpICUgdGhpcy5jb3VudCArIHRoaXMubWluXG4gICAgICB9IHdoaWxlICghdGhpcy5pc0FsbG93ZWQodmFsdWUpICYmIHZhbHVlICE9PSB0aGlzLmRpc3BsYXllZFZhbHVlKVxuXG4gICAgICBpZiAodmFsdWUgIT09IHRoaXMuZGlzcGxheWVkVmFsdWUpIHtcbiAgICAgICAgdGhpcy51cGRhdGUodmFsdWUpXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0lubmVyICh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5kb3VibGUgJiYgKHZhbHVlIC0gdGhpcy5taW4gPj0gdGhpcy5yb3VuZENvdW50KVxuICAgIH0sXG4gICAgaGFuZFNjYWxlICh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5pc0lubmVyKHZhbHVlKSA/IHRoaXMuaW5uZXJSYWRpdXNTY2FsZSA6IDFcbiAgICB9LFxuICAgIGlzQWxsb3dlZCAodmFsdWU6IG51bWJlcikge1xuICAgICAgcmV0dXJuICF0aGlzLmFsbG93ZWRWYWx1ZXMgfHwgdGhpcy5hbGxvd2VkVmFsdWVzKHZhbHVlKVxuICAgIH0sXG4gICAgZ2VuVmFsdWVzICgpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuOiBWTm9kZVtdID0gW11cblxuICAgICAgZm9yIChsZXQgdmFsdWUgPSB0aGlzLm1pbjsgdmFsdWUgPD0gdGhpcy5tYXg7IHZhbHVlID0gdmFsdWUgKyB0aGlzLnN0ZXApIHtcbiAgICAgICAgY29uc3QgY29sb3IgPSB2YWx1ZSA9PT0gdGhpcy52YWx1ZSAmJiAodGhpcy5jb2xvciB8fCAnYWNjZW50JylcbiAgICAgICAgY2hpbGRyZW4ucHVzaCh0aGlzLiRjcmVhdGVFbGVtZW50KCdzcGFuJywgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IoY29sb3IsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtdGltZS1waWNrZXItY2xvY2tfX2l0ZW0nLFxuICAgICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgICAndi10aW1lLXBpY2tlci1jbG9ja19faXRlbS0tYWN0aXZlJzogdmFsdWUgPT09IHRoaXMuZGlzcGxheWVkVmFsdWUsXG4gICAgICAgICAgICAndi10aW1lLXBpY2tlci1jbG9ja19faXRlbS0tZGlzYWJsZWQnOiB0aGlzLmRpc2FibGVkIHx8ICF0aGlzLmlzQWxsb3dlZCh2YWx1ZSksXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdHlsZTogdGhpcy5nZXRUcmFuc2Zvcm0odmFsdWUpLFxuICAgICAgICAgIGRvbVByb3BzOiB7IGlubmVySFRNTDogYDxzcGFuPiR7dGhpcy5mb3JtYXQodmFsdWUpfTwvc3Bhbj5gIH0sXG4gICAgICAgIH0pKSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgfSxcbiAgICBnZW5IYW5kICgpIHtcbiAgICAgIGNvbnN0IHNjYWxlID0gYHNjYWxlWSgke3RoaXMuaGFuZFNjYWxlKHRoaXMuZGlzcGxheWVkVmFsdWUpfSlgXG4gICAgICBjb25zdCBhbmdsZSA9IHRoaXMucm90YXRlICsgdGhpcy5kZWdyZWVzUGVyVW5pdCAqICh0aGlzLmRpc3BsYXllZFZhbHVlIC0gdGhpcy5taW4pXG4gICAgICBjb25zdCBjb2xvciA9ICh0aGlzLnZhbHVlICE9IG51bGwpICYmICh0aGlzLmNvbG9yIHx8ICdhY2NlbnQnKVxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKGNvbG9yLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10aW1lLXBpY2tlci1jbG9ja19faGFuZCcsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3YtdGltZS1waWNrZXItY2xvY2tfX2hhbmQtLWlubmVyJzogdGhpcy5pc0lubmVyKHRoaXMudmFsdWUpLFxuICAgICAgICB9LFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHRyYW5zZm9ybTogYHJvdGF0ZSgke2FuZ2xlfWRlZykgJHtzY2FsZX1gLFxuICAgICAgICB9LFxuICAgICAgfSkpXG4gICAgfSxcbiAgICBnZXRUcmFuc2Zvcm0gKGk6IG51bWJlcikge1xuICAgICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzLmdldFBvc2l0aW9uKGkpXG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBgJHs1MCArIHggKiA1MH0lYCxcbiAgICAgICAgdG9wOiBgJHs1MCArIHkgKiA1MH0lYCxcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldFBvc2l0aW9uICh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICBjb25zdCByb3RhdGVSYWRpYW5zID0gdGhpcy5yb3RhdGUgKiBNYXRoLlBJIC8gMTgwXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBNYXRoLnNpbigodmFsdWUgLSB0aGlzLm1pbikgKiB0aGlzLmRlZ3JlZXMgKyByb3RhdGVSYWRpYW5zKSAqIHRoaXMuaGFuZFNjYWxlKHZhbHVlKSxcbiAgICAgICAgeTogLU1hdGguY29zKCh2YWx1ZSAtIHRoaXMubWluKSAqIHRoaXMuZGVncmVlcyArIHJvdGF0ZVJhZGlhbnMpICogdGhpcy5oYW5kU2NhbGUodmFsdWUpLFxuICAgICAgfVxuICAgIH0sXG4gICAgb25Nb3VzZURvd24gKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgdGhpcy52YWx1ZU9uTW91c2VEb3duID0gbnVsbFxuICAgICAgdGhpcy52YWx1ZU9uTW91c2VVcCA9IG51bGxcbiAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IHRydWVcbiAgICAgIHRoaXMub25EcmFnTW92ZShlKVxuICAgIH0sXG4gICAgb25Nb3VzZVVwIChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZVxuICAgICAgaWYgKHRoaXMudmFsdWVPbk1vdXNlVXAgIT09IG51bGwgJiYgdGhpcy5pc0FsbG93ZWQodGhpcy52YWx1ZU9uTW91c2VVcCkpIHtcbiAgICAgICAgdGhpcy4kZW1pdCgnY2hhbmdlJywgdGhpcy52YWx1ZU9uTW91c2VVcClcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uRHJhZ01vdmUgKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmICgoIXRoaXMuaXNEcmFnZ2luZyAmJiBlLnR5cGUgIT09ICdjbGljaycpIHx8ICF0aGlzLiRyZWZzLmNsb2NrKSByZXR1cm5cblxuICAgICAgY29uc3QgeyB3aWR0aCwgdG9wLCBsZWZ0IH0gPSB0aGlzLiRyZWZzLmNsb2NrLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCB7IHdpZHRoOiBpbm5lcldpZHRoIH0gPSB0aGlzLiRyZWZzLmlubmVyQ2xvY2suZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gJ3RvdWNoZXMnIGluIGUgPyBlLnRvdWNoZXNbMF0gOiBlXG4gICAgICBjb25zdCBjZW50ZXIgPSB7IHg6IHdpZHRoIC8gMiwgeTogLXdpZHRoIC8gMiB9XG4gICAgICBjb25zdCBjb29yZHMgPSB7IHg6IGNsaWVudFggLSBsZWZ0LCB5OiB0b3AgLSBjbGllbnRZIH1cbiAgICAgIGNvbnN0IGhhbmRBbmdsZSA9IE1hdGgucm91bmQodGhpcy5hbmdsZShjZW50ZXIsIGNvb3JkcykgLSB0aGlzLnJvdGF0ZSArIDM2MCkgJSAzNjBcbiAgICAgIGNvbnN0IGluc2lkZUNsaWNrID0gdGhpcy5kb3VibGUgJiYgdGhpcy5ldWNsaWRlYW4oY2VudGVyLCBjb29yZHMpIDwgKGlubmVyV2lkdGggKyBpbm5lcldpZHRoICogdGhpcy5pbm5lclJhZGl1c1NjYWxlKSAvIDRcbiAgICAgIGNvbnN0IGNoZWNrc0NvdW50ID0gTWF0aC5jZWlsKDE1IC8gdGhpcy5kZWdyZWVzUGVyVW5pdClcbiAgICAgIGxldCB2YWx1ZVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoZWNrc0NvdW50OyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLmFuZ2xlVG9WYWx1ZShoYW5kQW5nbGUgKyBpICogdGhpcy5kZWdyZWVzUGVyVW5pdCwgaW5zaWRlQ2xpY2spXG4gICAgICAgIGlmICh0aGlzLmlzQWxsb3dlZCh2YWx1ZSkpIHJldHVybiB0aGlzLnNldE1vdXNlRG93blZhbHVlKHZhbHVlKVxuXG4gICAgICAgIHZhbHVlID0gdGhpcy5hbmdsZVRvVmFsdWUoaGFuZEFuZ2xlIC0gaSAqIHRoaXMuZGVncmVlc1BlclVuaXQsIGluc2lkZUNsaWNrKVxuICAgICAgICBpZiAodGhpcy5pc0FsbG93ZWQodmFsdWUpKSByZXR1cm4gdGhpcy5zZXRNb3VzZURvd25WYWx1ZSh2YWx1ZSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGFuZ2xlVG9WYWx1ZSAoYW5nbGU6IG51bWJlciwgaW5zaWRlQ2xpY2s6IGJvb2xlYW4pOiBudW1iZXIge1xuICAgICAgY29uc3QgdmFsdWUgPSAoXG4gICAgICAgIE1hdGgucm91bmQoYW5nbGUgLyB0aGlzLmRlZ3JlZXNQZXJVbml0KSArXG4gICAgICAgIChpbnNpZGVDbGljayA/IHRoaXMucm91bmRDb3VudCA6IDApXG4gICAgICApICUgdGhpcy5jb3VudCArIHRoaXMubWluXG5cbiAgICAgIC8vIE5lY2Vzc2FyeSB0byBmaXggZWRnZSBjYXNlIHdoZW4gc2VsZWN0aW5nIGxlZnQgcGFydCBvZiB0aGUgdmFsdWUocykgYXQgMTIgbydjbG9ja1xuICAgICAgaWYgKGFuZ2xlIDwgKDM2MCAtIHRoaXMuZGVncmVlc1BlclVuaXQgLyAyKSkgcmV0dXJuIHZhbHVlXG5cbiAgICAgIHJldHVybiBpbnNpZGVDbGljayA/IHRoaXMubWF4IC0gdGhpcy5yb3VuZENvdW50ICsgMSA6IHRoaXMubWluXG4gICAgfSxcbiAgICBzZXRNb3VzZURvd25WYWx1ZSAodmFsdWU6IG51bWJlcikge1xuICAgICAgaWYgKHRoaXMudmFsdWVPbk1vdXNlRG93biA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLnZhbHVlT25Nb3VzZURvd24gPSB2YWx1ZVxuICAgICAgfVxuXG4gICAgICB0aGlzLnZhbHVlT25Nb3VzZVVwID0gdmFsdWVcbiAgICAgIHRoaXMudXBkYXRlKHZhbHVlKVxuICAgIH0sXG4gICAgdXBkYXRlICh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICBpZiAodGhpcy5pbnB1dFZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSB2YWx1ZVxuICAgICAgICB0aGlzLiRlbWl0KCdpbnB1dCcsIHZhbHVlKVxuICAgICAgfVxuICAgIH0sXG4gICAgZXVjbGlkZWFuIChwMDogUG9pbnQsIHAxOiBQb2ludCkge1xuICAgICAgY29uc3QgZHggPSBwMS54IC0gcDAueFxuICAgICAgY29uc3QgZHkgPSBwMS55IC0gcDAueVxuXG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KVxuICAgIH0sXG4gICAgYW5nbGUgKGNlbnRlcjogUG9pbnQsIHAxOiBQb2ludCkge1xuICAgICAgY29uc3QgdmFsdWUgPSAyICogTWF0aC5hdGFuMihwMS55IC0gY2VudGVyLnkgLSB0aGlzLmV1Y2xpZGVhbihjZW50ZXIsIHAxKSwgcDEueCAtIGNlbnRlci54KVxuICAgICAgcmV0dXJuIE1hdGguYWJzKHZhbHVlICogMTgwIC8gTWF0aC5QSSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBkYXRhOiBWTm9kZURhdGEgPSB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtdGltZS1waWNrZXItY2xvY2snLFxuICAgICAgY2xhc3M6IHtcbiAgICAgICAgJ3YtdGltZS1waWNrZXItY2xvY2stLWluZGV0ZXJtaW5hdGUnOiB0aGlzLnZhbHVlID09IG51bGwsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfSxcbiAgICAgIG9uOiAodGhpcy5yZWFkb25seSB8fCB0aGlzLmRpc2FibGVkKSA/IHVuZGVmaW5lZCA6IHtcbiAgICAgICAgbW91c2Vkb3duOiB0aGlzLm9uTW91c2VEb3duLFxuICAgICAgICBtb3VzZXVwOiB0aGlzLm9uTW91c2VVcCxcbiAgICAgICAgbW91c2VsZWF2ZTogKGU6IE1vdXNlRXZlbnQpID0+ICh0aGlzLmlzRHJhZ2dpbmcgJiYgdGhpcy5vbk1vdXNlVXAoZSkpLFxuICAgICAgICB0b3VjaHN0YXJ0OiB0aGlzLm9uTW91c2VEb3duLFxuICAgICAgICB0b3VjaGVuZDogdGhpcy5vbk1vdXNlVXAsXG4gICAgICAgIG1vdXNlbW92ZTogdGhpcy5vbkRyYWdNb3ZlLFxuICAgICAgICB0b3VjaG1vdmU6IHRoaXMub25EcmFnTW92ZSxcbiAgICAgIH0sXG4gICAgICByZWY6ICdjbG9jaycsXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsYWJsZSAmJiBkYXRhLm9uKSB7XG4gICAgICBkYXRhLm9uLndoZWVsID0gdGhpcy53aGVlbFxuICAgIH1cblxuICAgIHJldHVybiBoKCdkaXYnLCBkYXRhLCBbXG4gICAgICBoKCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10aW1lLXBpY2tlci1jbG9ja19faW5uZXInLFxuICAgICAgICByZWY6ICdpbm5lckNsb2NrJyxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5nZW5IYW5kKCksXG4gICAgICAgIHRoaXMuZ2VuVmFsdWVzKCksXG4gICAgICBdKSxcbiAgICBdKVxuICB9LFxufSlcbiJdfQ==
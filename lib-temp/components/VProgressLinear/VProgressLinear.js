import './VProgressLinear.sass';
// Components
import { VFadeTransition, VSlideXTransition, } from '../transitions';
// Directives
import intersect from '../../directives/intersect';
// Mixins
import Colorable from '../../mixins/colorable';
import { factory as PositionableFactory } from '../../mixins/positionable';
import Proxyable from '../../mixins/proxyable';
import Themeable from '../../mixins/themeable';
// Utilities
import { convertToUnit, getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Colorable, PositionableFactory(['absolute', 'fixed', 'top', 'bottom']), Proxyable, Themeable);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-progress-linear',
    directives: { intersect },
    props: {
        active: {
            type: Boolean,
            default: true,
        },
        backgroundColor: {
            type: String,
            default: null,
        },
        backgroundOpacity: {
            type: [Number, String],
            default: null,
        },
        bufferValue: {
            type: [Number, String],
            default: 100,
        },
        color: {
            type: String,
            default: 'primary',
        },
        height: {
            type: [Number, String],
            default: 4,
        },
        indeterminate: Boolean,
        query: Boolean,
        reverse: Boolean,
        rounded: Boolean,
        stream: Boolean,
        striped: Boolean,
        value: {
            type: [Number, String],
            default: 0,
        },
    },
    data() {
        return {
            internalLazyValue: this.value || 0,
            isVisible: true,
        };
    },
    computed: {
        __cachedBackground() {
            return this.$createElement('div', this.setBackgroundColor(this.backgroundColor || this.color, {
                staticClass: 'v-progress-linear__background',
                style: this.backgroundStyle,
            }));
        },
        __cachedBar() {
            return this.$createElement(this.computedTransition, [this.__cachedBarType]);
        },
        __cachedBarType() {
            return this.indeterminate ? this.__cachedIndeterminate : this.__cachedDeterminate;
        },
        __cachedBuffer() {
            return this.$createElement('div', {
                staticClass: 'v-progress-linear__buffer',
                style: this.styles,
            });
        },
        __cachedDeterminate() {
            return this.$createElement('div', this.setBackgroundColor(this.color, {
                staticClass: `v-progress-linear__determinate`,
                style: {
                    width: convertToUnit(this.normalizedValue, '%'),
                },
            }));
        },
        __cachedIndeterminate() {
            return this.$createElement('div', {
                staticClass: 'v-progress-linear__indeterminate',
                class: {
                    'v-progress-linear__indeterminate--active': this.active,
                },
            }, [
                this.genProgressBar('long'),
                this.genProgressBar('short'),
            ]);
        },
        __cachedStream() {
            if (!this.stream)
                return null;
            return this.$createElement('div', this.setTextColor(this.color, {
                staticClass: 'v-progress-linear__stream',
                style: {
                    width: convertToUnit(100 - this.normalizedBuffer, '%'),
                },
            }));
        },
        backgroundStyle() {
            const backgroundOpacity = this.backgroundOpacity == null
                ? (this.backgroundColor ? 1 : 0.3)
                : parseFloat(this.backgroundOpacity);
            return {
                opacity: backgroundOpacity,
                [this.isReversed ? 'right' : 'left']: convertToUnit(this.normalizedValue, '%'),
                width: convertToUnit(Math.max(0, this.normalizedBuffer - this.normalizedValue), '%'),
            };
        },
        classes() {
            return {
                'v-progress-linear--absolute': this.absolute,
                'v-progress-linear--fixed': this.fixed,
                'v-progress-linear--query': this.query,
                'v-progress-linear--reactive': this.reactive,
                'v-progress-linear--reverse': this.isReversed,
                'v-progress-linear--rounded': this.rounded,
                'v-progress-linear--striped': this.striped,
                'v-progress-linear--visible': this.isVisible,
                ...this.themeClasses,
            };
        },
        computedTransition() {
            return this.indeterminate ? VFadeTransition : VSlideXTransition;
        },
        isReversed() {
            return this.$vuetify.rtl !== this.reverse;
        },
        normalizedBuffer() {
            return this.normalize(this.bufferValue);
        },
        normalizedValue() {
            return this.normalize(this.internalLazyValue);
        },
        reactive() {
            return Boolean(this.$listeners.change);
        },
        styles() {
            const styles = {};
            if (!this.active) {
                styles.height = 0;
            }
            if (!this.indeterminate && parseFloat(this.normalizedBuffer) !== 100) {
                styles.width = convertToUnit(this.normalizedBuffer, '%');
            }
            return styles;
        },
    },
    methods: {
        genContent() {
            const slot = getSlot(this, 'default', { value: this.internalLazyValue });
            if (!slot)
                return null;
            return this.$createElement('div', {
                staticClass: 'v-progress-linear__content',
            }, slot);
        },
        genListeners() {
            const listeners = this.$listeners;
            if (this.reactive) {
                listeners.click = this.onClick;
            }
            return listeners;
        },
        genProgressBar(name) {
            return this.$createElement('div', this.setBackgroundColor(this.color, {
                staticClass: 'v-progress-linear__indeterminate',
                class: {
                    [name]: true,
                },
            }));
        },
        onClick(e) {
            if (!this.reactive)
                return;
            const { width } = this.$el.getBoundingClientRect();
            this.internalValue = e.offsetX / width * 100;
        },
        onObserve(entries, observer, isIntersecting) {
            this.isVisible = isIntersecting;
        },
        normalize(value) {
            if (value < 0)
                return 0;
            if (value > 100)
                return 100;
            return parseFloat(value);
        },
    },
    render(h) {
        const data = {
            staticClass: 'v-progress-linear',
            attrs: {
                role: 'progressbar',
                'aria-valuemin': 0,
                'aria-valuemax': this.normalizedBuffer,
                'aria-valuenow': this.indeterminate ? undefined : this.normalizedValue,
            },
            class: this.classes,
            directives: [{
                    name: 'intersect',
                    value: this.onObserve,
                }],
            style: {
                bottom: this.bottom ? 0 : undefined,
                height: this.active ? convertToUnit(this.height) : 0,
                top: this.top ? 0 : undefined,
            },
            on: this.genListeners(),
        };
        return h('div', data, [
            this.__cachedStream,
            this.__cachedBackground,
            this.__cachedBuffer,
            this.__cachedBar,
            this.genContent(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlByb2dyZXNzTGluZWFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVlByb2dyZXNzTGluZWFyL1ZQcm9ncmVzc0xpbmVhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLHdCQUF3QixDQUFBO0FBRS9CLGFBQWE7QUFDYixPQUFPLEVBQ0wsZUFBZSxFQUNmLGlCQUFpQixHQUNsQixNQUFNLGdCQUFnQixDQUFBO0FBRXZCLGFBQWE7QUFDYixPQUFPLFNBQVMsTUFBTSw0QkFBNEIsQ0FBQTtBQUVsRCxTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxtQkFBbUIsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQzFFLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBRTlDLFlBQVk7QUFDWixPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzNELE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBTXRDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsU0FBUyxFQUNULG1CQUFtQixDQUFDLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFDM0QsU0FBUyxFQUNULFNBQVMsQ0FDVixDQUFBO0FBRUQsb0JBQW9CO0FBQ3BCLGVBQWUsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUMvQixJQUFJLEVBQUUsbUJBQW1CO0lBRXpCLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRTtJQUV6QixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsT0FBTztZQUNiLE9BQU8sRUFBRSxJQUFJO1NBQ2Q7UUFDRCxlQUFlLEVBQUU7WUFDZixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFB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QUFDLFdBQVc7WUFDaEIsSUFBSSxDQUFDLFVBQVUsRUFBRTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL1ZQcm9ncmVzc0xpbmVhci5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQge1xuICBWRmFkZVRyYW5zaXRpb24sXG4gIFZTbGlkZVhUcmFuc2l0aW9uLFxufSBmcm9tICcuLi90cmFuc2l0aW9ucydcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IGludGVyc2VjdCBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL2ludGVyc2VjdCdcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ29sb3JhYmxlIGZyb20gJy4uLy4uL21peGlucy9jb2xvcmFibGUnXG5pbXBvcnQgeyBmYWN0b3J5IGFzIFBvc2l0aW9uYWJsZUZhY3RvcnkgfSBmcm9tICcuLi8uLi9taXhpbnMvcG9zaXRpb25hYmxlJ1xuaW1wb3J0IFByb3h5YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvcHJveHlhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGNvbnZlcnRUb1VuaXQsIGdldFNsb3QgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgRnVuY3Rpb25hbENvbXBvbmVudE9wdGlvbnMgfSBmcm9tICd2dWUvdHlwZXMnXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgQ29sb3JhYmxlLFxuICBQb3NpdGlvbmFibGVGYWN0b3J5KFsnYWJzb2x1dGUnLCAnZml4ZWQnLCAndG9wJywgJ2JvdHRvbSddKSxcbiAgUHJveHlhYmxlLFxuICBUaGVtZWFibGVcbilcblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IGJhc2VNaXhpbnMuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtcHJvZ3Jlc3MtbGluZWFyJyxcblxuICBkaXJlY3RpdmVzOiB7IGludGVyc2VjdCB9LFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aXZlOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGJhY2tncm91bmRDb2xvcjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIGJhY2tncm91bmRPcGFjaXR5OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIGJ1ZmZlclZhbHVlOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMTAwLFxuICAgIH0sXG4gICAgY29sb3I6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdwcmltYXJ5JyxcbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDQsXG4gICAgfSxcbiAgICBpbmRldGVybWluYXRlOiBCb29sZWFuLFxuICAgIHF1ZXJ5OiBCb29sZWFuLFxuICAgIHJldmVyc2U6IEJvb2xlYW4sXG4gICAgcm91bmRlZDogQm9vbGVhbixcbiAgICBzdHJlYW06IEJvb2xlYW4sXG4gICAgc3RyaXBlZDogQm9vbGVhbixcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW50ZXJuYWxMYXp5VmFsdWU6IHRoaXMudmFsdWUgfHwgMCxcbiAgICAgIGlzVmlzaWJsZTogdHJ1ZSxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBfX2NhY2hlZEJhY2tncm91bmQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmJhY2tncm91bmRDb2xvciB8fCB0aGlzLmNvbG9yLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1wcm9ncmVzcy1saW5lYXJfX2JhY2tncm91bmQnLFxuICAgICAgICBzdHlsZTogdGhpcy5iYWNrZ3JvdW5kU3R5bGUsXG4gICAgICB9KSlcbiAgICB9LFxuICAgIF9fY2FjaGVkQmFyICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCh0aGlzLmNvbXB1dGVkVHJhbnNpdGlvbiwgW3RoaXMuX19jYWNoZWRCYXJUeXBlXSlcbiAgICB9LFxuICAgIF9fY2FjaGVkQmFyVHlwZSAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuaW5kZXRlcm1pbmF0ZSA/IHRoaXMuX19jYWNoZWRJbmRldGVybWluYXRlIDogdGhpcy5fX2NhY2hlZERldGVybWluYXRlXG4gICAgfSxcbiAgICBfX2NhY2hlZEJ1ZmZlciAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXByb2dyZXNzLWxpbmVhcl9fYnVmZmVyJyxcbiAgICAgICAgc3R5bGU6IHRoaXMuc3R5bGVzLFxuICAgICAgfSlcbiAgICB9LFxuICAgIF9fY2FjaGVkRGV0ZXJtaW5hdGUgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmNvbG9yLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiBgdi1wcm9ncmVzcy1saW5lYXJfX2RldGVybWluYXRlYCxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB3aWR0aDogY29udmVydFRvVW5pdCh0aGlzLm5vcm1hbGl6ZWRWYWx1ZSwgJyUnKSxcbiAgICAgICAgfSxcbiAgICAgIH0pKVxuICAgIH0sXG4gICAgX19jYWNoZWRJbmRldGVybWluYXRlICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcHJvZ3Jlc3MtbGluZWFyX19pbmRldGVybWluYXRlJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1wcm9ncmVzcy1saW5lYXJfX2luZGV0ZXJtaW5hdGUtLWFjdGl2ZSc6IHRoaXMuYWN0aXZlLFxuICAgICAgICB9LFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLmdlblByb2dyZXNzQmFyKCdsb25nJyksXG4gICAgICAgIHRoaXMuZ2VuUHJvZ3Jlc3NCYXIoJ3Nob3J0JyksXG4gICAgICBdKVxuICAgIH0sXG4gICAgX19jYWNoZWRTdHJlYW0gKCk6IFZOb2RlIHwgbnVsbCB7XG4gICAgICBpZiAoIXRoaXMuc3RyZWFtKSByZXR1cm4gbnVsbFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgdGhpcy5zZXRUZXh0Q29sb3IodGhpcy5jb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcHJvZ3Jlc3MtbGluZWFyX19zdHJlYW0nLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHdpZHRoOiBjb252ZXJ0VG9Vbml0KDEwMCAtIHRoaXMubm9ybWFsaXplZEJ1ZmZlciwgJyUnKSxcbiAgICAgICAgfSxcbiAgICAgIH0pKVxuICAgIH0sXG4gICAgYmFja2dyb3VuZFN0eWxlICgpOiBvYmplY3Qge1xuICAgICAgY29uc3QgYmFja2dyb3VuZE9wYWNpdHkgPSB0aGlzLmJhY2tncm91bmRPcGFjaXR5ID09IG51bGxcbiAgICAgICAgPyAodGhpcy5iYWNrZ3JvdW5kQ29sb3IgPyAxIDogMC4zKVxuICAgICAgICA6IHBhcnNlRmxvYXQodGhpcy5iYWNrZ3JvdW5kT3BhY2l0eSlcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3BhY2l0eTogYmFja2dyb3VuZE9wYWNpdHksXG4gICAgICAgIFt0aGlzLmlzUmV2ZXJzZWQgPyAncmlnaHQnIDogJ2xlZnQnXTogY29udmVydFRvVW5pdCh0aGlzLm5vcm1hbGl6ZWRWYWx1ZSwgJyUnKSxcbiAgICAgICAgd2lkdGg6IGNvbnZlcnRUb1VuaXQoTWF0aC5tYXgoMCwgdGhpcy5ub3JtYWxpemVkQnVmZmVyIC0gdGhpcy5ub3JtYWxpemVkVmFsdWUpLCAnJScpLFxuICAgICAgfVxuICAgIH0sXG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXByb2dyZXNzLWxpbmVhci0tYWJzb2x1dGUnOiB0aGlzLmFic29sdXRlLFxuICAgICAgICAndi1wcm9ncmVzcy1saW5lYXItLWZpeGVkJzogdGhpcy5maXhlZCxcbiAgICAgICAgJ3YtcHJvZ3Jlc3MtbGluZWFyLS1xdWVyeSc6IHRoaXMucXVlcnksXG4gICAgICAgICd2LXByb2dyZXNzLWxpbmVhci0tcmVhY3RpdmUnOiB0aGlzLnJlYWN0aXZlLFxuICAgICAgICAndi1wcm9ncmVzcy1saW5lYXItLXJldmVyc2UnOiB0aGlzLmlzUmV2ZXJzZWQsXG4gICAgICAgICd2LXByb2dyZXNzLWxpbmVhci0tcm91bmRlZCc6IHRoaXMucm91bmRlZCxcbiAgICAgICAgJ3YtcHJvZ3Jlc3MtbGluZWFyLS1zdHJpcGVkJzogdGhpcy5zdHJpcGVkLFxuICAgICAgICAndi1wcm9ncmVzcy1saW5lYXItLXZpc2libGUnOiB0aGlzLmlzVmlzaWJsZSxcbiAgICAgICAgLi4udGhpcy50aGVtZUNsYXNzZXMsXG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZFRyYW5zaXRpb24gKCk6IEZ1bmN0aW9uYWxDb21wb25lbnRPcHRpb25zIHtcbiAgICAgIHJldHVybiB0aGlzLmluZGV0ZXJtaW5hdGUgPyBWRmFkZVRyYW5zaXRpb24gOiBWU2xpZGVYVHJhbnNpdGlvblxuICAgIH0sXG4gICAgaXNSZXZlcnNlZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy4kdnVldGlmeS5ydGwgIT09IHRoaXMucmV2ZXJzZVxuICAgIH0sXG4gICAgbm9ybWFsaXplZEJ1ZmZlciAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZSh0aGlzLmJ1ZmZlclZhbHVlKVxuICAgIH0sXG4gICAgbm9ybWFsaXplZFZhbHVlICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHRoaXMuaW50ZXJuYWxMYXp5VmFsdWUpXG4gICAgfSxcbiAgICByZWFjdGl2ZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gQm9vbGVhbih0aGlzLiRsaXN0ZW5lcnMuY2hhbmdlKVxuICAgIH0sXG4gICAgc3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgY29uc3Qgc3R5bGVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblxuICAgICAgaWYgKCF0aGlzLmFjdGl2ZSkge1xuICAgICAgICBzdHlsZXMuaGVpZ2h0ID0gMFxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaW5kZXRlcm1pbmF0ZSAmJiBwYXJzZUZsb2F0KHRoaXMubm9ybWFsaXplZEJ1ZmZlcikgIT09IDEwMCkge1xuICAgICAgICBzdHlsZXMud2lkdGggPSBjb252ZXJ0VG9Vbml0KHRoaXMubm9ybWFsaXplZEJ1ZmZlciwgJyUnKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3R5bGVzXG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICBjb25zdCBzbG90ID0gZ2V0U2xvdCh0aGlzLCAnZGVmYXVsdCcsIHsgdmFsdWU6IHRoaXMuaW50ZXJuYWxMYXp5VmFsdWUgfSlcblxuICAgICAgaWYgKCFzbG90KSByZXR1cm4gbnVsbFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtcHJvZ3Jlc3MtbGluZWFyX19jb250ZW50JyxcbiAgICAgIH0sIHNsb3QpXG4gICAgfSxcbiAgICBnZW5MaXN0ZW5lcnMgKCkge1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy4kbGlzdGVuZXJzXG5cbiAgICAgIGlmICh0aGlzLnJlYWN0aXZlKSB7XG4gICAgICAgIGxpc3RlbmVycy5jbGljayA9IHRoaXMub25DbGlja1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGlzdGVuZXJzXG4gICAgfSxcbiAgICBnZW5Qcm9ncmVzc0JhciAobmFtZTogJ2xvbmcnIHwgJ3Nob3J0Jykge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXByb2dyZXNzLWxpbmVhcl9faW5kZXRlcm1pbmF0ZScsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgW25hbWVdOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSkpXG4gICAgfSxcbiAgICBvbkNsaWNrIChlOiBNb3VzZUV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMucmVhY3RpdmUpIHJldHVyblxuXG4gICAgICBjb25zdCB7IHdpZHRoIH0gPSB0aGlzLiRlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICB0aGlzLmludGVybmFsVmFsdWUgPSBlLm9mZnNldFggLyB3aWR0aCAqIDEwMFxuICAgIH0sXG4gICAgb25PYnNlcnZlIChlbnRyaWVzOiBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5W10sIG9ic2VydmVyOiBJbnRlcnNlY3Rpb25PYnNlcnZlciwgaXNJbnRlcnNlY3Rpbmc6IGJvb2xlYW4pIHtcbiAgICAgIHRoaXMuaXNWaXNpYmxlID0gaXNJbnRlcnNlY3RpbmdcbiAgICB9LFxuICAgIG5vcm1hbGl6ZSAodmFsdWU6IHN0cmluZyB8IG51bWJlcikge1xuICAgICAgaWYgKHZhbHVlIDwgMCkgcmV0dXJuIDBcbiAgICAgIGlmICh2YWx1ZSA+IDEwMCkgcmV0dXJuIDEwMFxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1wcm9ncmVzcy1saW5lYXInLFxuICAgICAgYXR0cnM6IHtcbiAgICAgICAgcm9sZTogJ3Byb2dyZXNzYmFyJyxcbiAgICAgICAgJ2FyaWEtdmFsdWVtaW4nOiAwLFxuICAgICAgICAnYXJpYS12YWx1ZW1heCc6IHRoaXMubm9ybWFsaXplZEJ1ZmZlcixcbiAgICAgICAgJ2FyaWEtdmFsdWVub3cnOiB0aGlzLmluZGV0ZXJtaW5hdGUgPyB1bmRlZmluZWQgOiB0aGlzLm5vcm1hbGl6ZWRWYWx1ZSxcbiAgICAgIH0sXG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgbmFtZTogJ2ludGVyc2VjdCcsXG4gICAgICAgIHZhbHVlOiB0aGlzLm9uT2JzZXJ2ZSxcbiAgICAgIH1dLFxuICAgICAgc3R5bGU6IHtcbiAgICAgICAgYm90dG9tOiB0aGlzLmJvdHRvbSA/IDAgOiB1bmRlZmluZWQsXG4gICAgICAgIGhlaWdodDogdGhpcy5hY3RpdmUgPyBjb252ZXJ0VG9Vbml0KHRoaXMuaGVpZ2h0KSA6IDAsXG4gICAgICAgIHRvcDogdGhpcy50b3AgPyAwIDogdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICAgIG9uOiB0aGlzLmdlbkxpc3RlbmVycygpLFxuICAgIH1cblxuICAgIHJldHVybiBoKCdkaXYnLCBkYXRhLCBbXG4gICAgICB0aGlzLl9fY2FjaGVkU3RyZWFtLFxuICAgICAgdGhpcy5fX2NhY2hlZEJhY2tncm91bmQsXG4gICAgICB0aGlzLl9fY2FjaGVkQnVmZmVyLFxuICAgICAgdGhpcy5fX2NhY2hlZEJhcixcbiAgICAgIHRoaXMuZ2VuQ29udGVudCgpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
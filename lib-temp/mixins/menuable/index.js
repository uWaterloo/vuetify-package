// Mixins
import Stackable from '../stackable';
import { factory as positionableFactory } from '../positionable';
import Activatable from '../activatable';
import Detachable from '../detachable';
// Utilities
import mixins from '../../util/mixins';
import { convertToUnit } from '../../util/helpers';
const baseMixins = mixins(Stackable, positionableFactory(['top', 'right', 'bottom', 'left', 'absolute']), Activatable, Detachable);
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'menuable',
    props: {
        allowOverflow: Boolean,
        light: Boolean,
        dark: Boolean,
        maxWidth: {
            type: [Number, String],
            default: 'auto',
        },
        minWidth: [Number, String],
        nudgeBottom: {
            type: [Number, String],
            default: 0,
        },
        nudgeLeft: {
            type: [Number, String],
            default: 0,
        },
        nudgeRight: {
            type: [Number, String],
            default: 0,
        },
        nudgeTop: {
            type: [Number, String],
            default: 0,
        },
        nudgeWidth: {
            type: [Number, String],
            default: 0,
        },
        offsetOverflow: Boolean,
        positionX: {
            type: Number,
            default: null,
        },
        positionY: {
            type: Number,
            default: null,
        },
        zIndex: {
            type: [Number, String],
            default: null,
        },
    },
    data: () => ({
        activatorNode: [],
        absoluteX: 0,
        absoluteY: 0,
        activatedBy: null,
        activatorFixed: false,
        dimensions: {
            activator: {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: 0,
                height: 0,
                offsetTop: 0,
                scrollHeight: 0,
                offsetLeft: 0,
            },
            content: {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: 0,
                height: 0,
                offsetTop: 0,
                scrollHeight: 0,
            },
        },
        relativeYOffset: 0,
        hasJustFocused: false,
        hasWindow: false,
        inputActivator: false,
        isContentActive: false,
        pageWidth: 0,
        pageYOffset: 0,
        stackClass: 'v-menu__content--active',
        stackMinZIndex: 6,
    }),
    computed: {
        computedLeft() {
            const a = this.dimensions.activator;
            const c = this.dimensions.content;
            const activatorLeft = (this.attach !== false ? a.offsetLeft : a.left) || 0;
            const minWidth = Math.max(a.width, c.width);
            let left = 0;
            left += activatorLeft;
            if (this.left || (this.$vuetify.rtl && !this.right))
                left -= (minWidth - a.width);
            if (this.offsetX) {
                const maxWidth = isNaN(Number(this.maxWidth))
                    ? a.width
                    : Math.min(a.width, Number(this.maxWidth));
                left += this.left ? -maxWidth : a.width;
            }
            if (this.nudgeLeft)
                left -= parseInt(this.nudgeLeft);
            if (this.nudgeRight)
                left += parseInt(this.nudgeRight);
            return left;
        },
        computedTop() {
            const a = this.dimensions.activator;
            const c = this.dimensions.content;
            let top = 0;
            if (this.top)
                top += a.height - c.height;
            if (this.attach !== false)
                top += a.offsetTop;
            else
                top += a.top + this.pageYOffset;
            if (this.offsetY)
                top += this.top ? -a.height : a.height;
            if (this.nudgeTop)
                top -= parseInt(this.nudgeTop);
            if (this.nudgeBottom)
                top += parseInt(this.nudgeBottom);
            return top;
        },
        hasActivator() {
            return !!this.$slots.activator || !!this.$scopedSlots.activator || !!this.activator || !!this.inputActivator;
        },
        absoluteYOffset() {
            return this.pageYOffset - this.relativeYOffset;
        },
    },
    watch: {
        disabled(val) {
            val && this.callDeactivate();
        },
        isActive(val) {
            if (this.disabled)
                return;
            val ? this.callActivate() : this.callDeactivate();
        },
        positionX: 'updateDimensions',
        positionY: 'updateDimensions',
    },
    beforeMount() {
        this.hasWindow = typeof window !== 'undefined';
        if (this.hasWindow) {
            window.addEventListener('resize', this.updateDimensions, false);
        }
    },
    beforeDestroy() {
        if (this.hasWindow) {
            window.removeEventListener('resize', this.updateDimensions, false);
        }
    },
    methods: {
        absolutePosition() {
            return {
                offsetTop: this.positionY || this.absoluteY,
                offsetLeft: this.positionX || this.absoluteX,
                scrollHeight: 0,
                top: this.positionY || this.absoluteY,
                bottom: this.positionY || this.absoluteY,
                left: this.positionX || this.absoluteX,
                right: this.positionX || this.absoluteX,
                height: 0,
                width: 0,
            };
        },
        activate() { },
        calcLeft(menuWidth) {
            return convertToUnit(this.attach !== false
                ? this.computedLeft
                : this.calcXOverflow(this.computedLeft, menuWidth));
        },
        calcTop() {
            return convertToUnit(this.attach !== false
                ? this.computedTop
                : this.calcYOverflow(this.computedTop));
        },
        calcXOverflow(left, menuWidth) {
            const xOverflow = left + menuWidth - this.pageWidth + 12;
            if ((!this.left || this.right) && xOverflow > 0) {
                left = Math.max(left - xOverflow, 0);
            }
            else {
                left = Math.max(left, 12);
            }
            return left + this.getOffsetLeft();
        },
        calcYOverflow(top) {
            const documentHeight = this.getInnerHeight();
            const toTop = this.absoluteYOffset + documentHeight;
            const activator = this.dimensions.activator;
            const contentHeight = this.dimensions.content.height;
            const totalHeight = top + contentHeight;
            const isOverflowing = toTop < totalHeight;
            // If overflowing bottom and offset
            // TODO: set 'bottom' position instead of 'top'
            if (isOverflowing &&
                this.offsetOverflow &&
                // If we don't have enough room to offset
                // the overflow, don't offset
                activator.top > contentHeight) {
                top = this.pageYOffset + (activator.top - contentHeight);
                // If overflowing bottom
            }
            else if (isOverflowing && !this.allowOverflow) {
                top = toTop - contentHeight - 12;
                // If overflowing top
            }
            else if (top < this.absoluteYOffset && !this.allowOverflow) {
                top = this.absoluteYOffset + 12;
            }
            return top < 12 ? 12 : top;
        },
        callActivate() {
            if (!this.hasWindow)
                return;
            this.activate();
        },
        callDeactivate() {
            this.isContentActive = false;
            this.deactivate();
        },
        checkForPageYOffset() {
            if (this.hasWindow) {
                this.pageYOffset = this.activatorFixed ? 0 : this.getOffsetTop();
            }
        },
        checkActivatorFixed() {
            if (this.attach !== false)
                return;
            let el = this.getActivator();
            while (el) {
                if (window.getComputedStyle(el).position === 'fixed') {
                    this.activatorFixed = true;
                    return;
                }
                el = el.offsetParent;
            }
            this.activatorFixed = false;
        },
        deactivate() { },
        genActivatorListeners() {
            const listeners = Activatable.options.methods.genActivatorListeners.call(this);
            const onClick = listeners.click;
            if (onClick) {
                listeners.click = (e) => {
                    if (this.openOnClick) {
                        onClick && onClick(e);
                    }
                    this.absoluteX = e.clientX;
                    this.absoluteY = e.clientY;
                };
            }
            return listeners;
        },
        getInnerHeight() {
            if (!this.hasWindow)
                return 0;
            return window.innerHeight ||
                document.documentElement.clientHeight;
        },
        getOffsetLeft() {
            if (!this.hasWindow)
                return 0;
            return window.pageXOffset ||
                document.documentElement.scrollLeft;
        },
        getOffsetTop() {
            if (!this.hasWindow)
                return 0;
            return window.pageYOffset ||
                document.documentElement.scrollTop;
        },
        getRoundedBoundedClientRect(el) {
            const rect = el.getBoundingClientRect();
            return {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                bottom: Math.round(rect.bottom),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
            };
        },
        measure(el) {
            if (!el || !this.hasWindow)
                return null;
            const rect = this.getRoundedBoundedClientRect(el);
            // Account for activator margin
            if (this.attach !== false) {
                const style = window.getComputedStyle(el);
                rect.left = parseInt(style.marginLeft);
                rect.top = parseInt(style.marginTop);
            }
            return rect;
        },
        sneakPeek(cb) {
            requestAnimationFrame(() => {
                const el = this.$refs.content;
                if (!el || el.style.display !== 'none') {
                    cb();
                    return;
                }
                el.style.display = 'inline-block';
                cb();
                el.style.display = 'none';
            });
        },
        startTransition() {
            return new Promise(resolve => requestAnimationFrame(() => {
                this.isContentActive = this.hasJustFocused = this.isActive;
                resolve();
            }));
        },
        updateDimensions() {
            this.hasWindow = typeof window !== 'undefined';
            this.checkActivatorFixed();
            this.checkForPageYOffset();
            this.pageWidth = document.documentElement.clientWidth;
            const dimensions = {
                activator: { ...this.dimensions.activator },
                content: { ...this.dimensions.content },
            };
            // Activator should already be shown
            if (!this.hasActivator || this.absolute) {
                dimensions.activator = this.absolutePosition();
            }
            else {
                const activator = this.getActivator();
                if (!activator)
                    return;
                dimensions.activator = this.measure(activator);
                dimensions.activator.offsetLeft = activator.offsetLeft;
                if (this.attach !== false) {
                    // account for css padding causing things to not line up
                    // this is mostly for v-autocomplete, hopefully it won't break anything
                    dimensions.activator.offsetTop = activator.offsetTop;
                }
                else {
                    dimensions.activator.offsetTop = 0;
                }
            }
            // Display and hide to get dimensions
            this.sneakPeek(() => {
                if (this.$refs.content) {
                    if (this.$refs.content.offsetParent) {
                        const offsetRect = this.getRoundedBoundedClientRect(this.$refs.content.offsetParent);
                        this.relativeYOffset = window.pageYOffset + offsetRect.top;
                        dimensions.activator.top -= this.relativeYOffset;
                        dimensions.activator.left -= window.pageXOffset + offsetRect.left;
                    }
                    dimensions.content = this.measure(this.$refs.content);
                }
                this.dimensions = dimensions;
            });
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL21lbnVhYmxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSxjQUFjLENBQUE7QUFDcEMsT0FBTyxFQUFFLE9BQU8sSUFBSSxtQkFBbUIsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ2hFLE9BQU8sV0FBVyxNQUFNLGdCQUFnQixDQUFBO0FBQ3hDLE9BQU8sVUFBVSxNQUFNLGVBQWUsQ0FBQTtBQUV0QyxZQUFZO0FBQ1osT0FBTyxNQUFzQixNQUFNLG1CQUFtQixDQUFBO0FBQ3RELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUtsRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLFNBQVMsRUFDVCxtQkFBbUIsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUNuRSxXQUFXLEVBQ1gsVUFBVSxDQUNYLENBQUE7QUE0QkQsb0JBQW9CO0FBQ3BCLGVBQWUsVUFBVSxDQUFDLE1BQU0sRUFBVyxDQUFDLE1BQU0sQ0FBQztJQUNqRCxJQUFJLEVBQUUsVUFBVTtJQUVoQixLQUFLLEVBQUU7UUFDTCxhQUFhLEVBQUUsT0FBTztRQUN0QixLQUFLLEVBQUUsT0FBTztRQUNkLElBQUksRUFBRSxPQUFPO1FBQ2IsUUFBUSxFQUFFO1lBQ1IsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsTUFBTTtTQUNoQjtRQUNELFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDMUIsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsY0FBYyxFQUFFLE9BQU87UUFDdkIsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsSUFBSTtTQUNkO0tBQ0Y7SUFFRCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNYLGFBQWEsRUFBRSxFQUFhO1FBQzVCLFNBQVMsRUFBRSxDQUFDO1FBQ1osU0FBUyxFQUFFLENBQUM7UUFDWixXQUFXLEVBQUUsSUFBMEI7UUFDdkMsY0FBYyxFQUFFLEtBQUs7UUFDckIsVUFBVSxFQUFFO1lBQ1YsU0FBUyxFQUFFO2dCQUNULEdBQUcsRUFBRSxDQUFDO2dCQUNOLElBQUksRUFBRSxDQUFDO2dCQUNQLE1BQU0sRUFBRSxDQUFDO2dCQUNULEtBQUssRUFBRSxDQUFDO2dCQUNSLEtBQUssRUFBRSxDQUFDO2dCQUNSLE1BQU0sRUFBRSxDQUFDO2dCQUNULFNBQVMsRUFBRSxDQUFDO2dCQUNaLFlBQVksRUFBRSxDQUFDO2dCQUNmLFVBQVUsRUFBRSxDQUFDO2FBQ2Q7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7Z0JBQ04sSUFBSSxFQUFFLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsU0FBUyxFQUFFLENBQUM7Z0JBQ1osWUFBWSxFQUFFLENBQUM7YUFDaEI7U0FDRjtRQUNELGVBQWUsRUFBRSxDQUFDO1FBQ2xCLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLFNBQVMsRUFBRSxLQUFLO1FBQ2hCLGNBQWMsRUFBRSxLQUFLO1FBQ3JCLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLFNBQVMsRUFBRSxDQUFDO1FBQ1osV0FBVyxFQUFFLENBQUM7UUFDZCxVQUFVLEVBQUUseUJBQXlCO1FBQ3JDLGNBQWMsRUFBRSxDQUFDO0tBQ2xCLENBQUM7SUFFRixRQUFRLEVBQUU7UUFDUixZQUFZO1lBQ1YsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUE7WUFDbkMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUE7WUFDakMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUMxRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzNDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQTtZQUNaLElBQUksSUFBSSxhQUFhLENBQUE7WUFDckIsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDakYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNoQixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO29CQUNULENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO2dCQUU1QyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7YUFDeEM7WUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTO2dCQUFFLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ3BELElBQUksSUFBSSxDQUFDLFVBQVU7Z0JBQUUsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7WUFFdEQsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO1FBQ0QsV0FBVztZQUNULE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFBO1lBQ25DLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFBO1lBQ2pDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQTtZQUVYLElBQUksSUFBSSxDQUFDLEdBQUc7Z0JBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQTtZQUN4QyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSztnQkFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQTs7Z0JBQ3hDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUE7WUFDcEMsSUFBSSxJQUFJLENBQUMsT0FBTztnQkFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFBO1lBQ3hELElBQUksSUFBSSxDQUFDLFFBQVE7Z0JBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDakQsSUFBSSxJQUFJLENBQUMsV0FBVztnQkFBRSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUV2RCxPQUFPLEdBQUcsQ0FBQTtRQUNaLENBQUM7UUFDRCxZQUFZO1lBQ1YsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFBO1FBQzlHLENBQUM7UUFDRCxlQUFlO1lBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUE7UUFDaEQsQ0FBQztLQUNGO0lBRUQsS0FBSyxFQUFFO1FBQ0wsUUFBUSxDQUFFLEdBQUc7WUFDWCxHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQzlCLENBQUM7UUFDRCxRQUFRLENBQUUsR0FBRztZQUNYLElBQUksSUFBSSxDQUFDLFFBQVE7Z0JBQUUsT0FBTTtZQUV6QixHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ25ELENBQUM7UUFDRCxTQUFTLEVBQUUsa0JBQWtCO1FBQzdCLFNBQVMsRUFBRSxrQkFBa0I7S0FDOUI7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUE7UUFFOUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFBO1NBQ2hFO0lBQ0gsQ0FBQztJQUVELGFBQWE7UUFDWCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUE7U0FDbkU7SUFDSCxDQUFDO0lBRUQsT0FBTyxFQUFFO1FBQ1AsZ0JBQWdCO1lBQ2QsT0FBTztnQkFDTCxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUztnQkFDM0MsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVM7Z0JBQzVDLFlBQVksRUFBRSxDQUFDO2dCQUNmLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTO2dCQUNyQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUztnQkFDeEMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVM7Z0JBQ3RDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTO2dCQUN2QyxNQUFNLEVBQUUsQ0FBQztnQkFDVCxLQUFLLEVBQUUsQ0FBQzthQUNULENBQUE7UUFDSCxDQUFDO1FBQ0QsUUFBUSxLQUFLLENBQUM7UUFDZCxRQUFRLENBQUUsU0FBaUI7WUFDekIsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLO2dCQUN4QyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVk7Z0JBQ25CLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQTtRQUN2RCxDQUFDO1FBQ0QsT0FBTztZQUNMLE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSztnQkFDeEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXO2dCQUNsQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtRQUMzQyxDQUFDO1FBQ0QsYUFBYSxDQUFFLElBQVksRUFBRSxTQUFpQjtZQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBO1lBRXhELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7Z0JBQy9DLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUE7YUFDckM7aUJBQU07Z0JBQ0wsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO2FBQzFCO1lBRUQsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ3BDLENBQUM7UUFDRCxhQUFhLENBQUUsR0FBVztZQUN4QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7WUFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUE7WUFDbkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUE7WUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFBO1lBQ3BELE1BQU0sV0FBVyxHQUFHLEdBQUcsR0FBRyxhQUFhLENBQUE7WUFDdkMsTUFBTSxhQUFhLEdBQUcsS0FBSyxHQUFHLFdBQVcsQ0FBQTtZQUV6QyxtQ0FBbUM7WUFDbkMsK0NBQStDO1lBQy9DLElBQUksYUFBYTtnQkFDZixJQUFJLENBQUMsY0FBYztnQkFDbkIseUNBQXlDO2dCQUN6Qyw2QkFBNkI7Z0JBQzdCLFNBQVMsQ0FBQyxHQUFHLEdBQUcsYUFBYSxFQUM3QjtnQkFDQSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDLENBQUE7Z0JBQzFELHdCQUF3QjthQUN2QjtpQkFBTSxJQUFJLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQy9DLEdBQUcsR0FBRyxLQUFLLEdBQUcsYUFBYSxHQUFHLEVBQUUsQ0FBQTtnQkFDbEMscUJBQXFCO2FBQ3BCO2lCQUFNLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUM1RCxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUE7YUFDaEM7WUFFRCxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFBO1FBQzVCLENBQUM7UUFDRCxZQUFZO1lBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU07WUFFM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ2pCLENBQUM7UUFDRCxjQUFjO1lBQ1osSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUE7WUFFNUIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ25CLENBQUM7UUFDRCxtQkFBbUI7WUFDakIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO2FBQ2pFO1FBQ0gsQ0FBQztRQUNELG1CQUFtQjtZQUNqQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSztnQkFBRSxPQUFNO1lBQ2pDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtZQUM1QixPQUFPLEVBQUUsRUFBRTtnQkFDVCxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO29CQUNwRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTtvQkFDMUIsT0FBTTtpQkFDUDtnQkFDRCxFQUFFLEdBQUcsRUFBRSxDQUFDLFlBQTJCLENBQUE7YUFDcEM7WUFDRCxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQTtRQUM3QixDQUFDO1FBQ0QsVUFBVSxLQUFLLENBQUM7UUFDaEIscUJBQXFCO1lBQ25CLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUU5RSxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFBO1lBRS9CLElBQUksT0FBTyxFQUFFO2dCQUNYLFNBQVMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUEwQyxFQUFFLEVBQUU7b0JBQy9ELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDcEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtxQkFDdEI7b0JBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFBO29CQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUE7Z0JBQzVCLENBQUMsQ0FBQTthQUNGO1lBRUQsT0FBTyxTQUFTLENBQUE7UUFDbEIsQ0FBQztRQUNELGNBQWM7WUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTyxDQUFDLENBQUE7WUFFN0IsT0FBTyxNQUFNLENBQUMsV0FBVztnQkFDdkIsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUE7UUFDekMsQ0FBQztRQUNELGFBQWE7WUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTyxDQUFDLENBQUE7WUFFN0IsT0FBTyxNQUFNLENBQUMsV0FBVztnQkFDdkIsUUFBUSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUE7UUFDdkMsQ0FBQztRQUNELFlBQVk7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTyxDQUFDLENBQUE7WUFFN0IsT0FBTyxNQUFNLENBQUMsV0FBVztnQkFDdkIsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUE7UUFDdEMsQ0FBQztRQUNELDJCQUEyQixDQUFFLEVBQVc7WUFDdEMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUE7WUFDdkMsT0FBTztnQkFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUN6QixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUMzQixNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUMvQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUM3QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUM3QixNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ2hDLENBQUE7UUFDSCxDQUFDO1FBQ0QsT0FBTyxDQUFFLEVBQWU7WUFDdEIsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU8sSUFBSSxDQUFBO1lBRXZDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUVqRCwrQkFBK0I7WUFDL0IsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtnQkFDekIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUV6QyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVyxDQUFDLENBQUE7Z0JBQ3ZDLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFVLENBQUMsQ0FBQTthQUN0QztZQUVELE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQztRQUNELFNBQVMsQ0FBRSxFQUFjO1lBQ3ZCLHFCQUFxQixDQUFDLEdBQUcsRUFBRTtnQkFDekIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUE7Z0JBRTdCLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssTUFBTSxFQUFFO29CQUN0QyxFQUFFLEVBQUUsQ0FBQTtvQkFDSixPQUFNO2lCQUNQO2dCQUVELEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQTtnQkFDakMsRUFBRSxFQUFFLENBQUE7Z0JBQ0osRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBO1lBQzNCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELGVBQWU7WUFDYixPQUFPLElBQUksT0FBTyxDQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFO2dCQUM3RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQTtnQkFDMUQsT0FBTyxFQUFFLENBQUE7WUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ0wsQ0FBQztRQUNELGdCQUFnQjtZQUNkLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFBO1lBQzlDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO1lBQzFCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO1lBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUE7WUFFckQsTUFBTSxVQUFVLEdBQVE7Z0JBQ3RCLFNBQVMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7Z0JBQzNDLE9BQU8sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7YUFDeEMsQ0FBQTtZQUVELG9DQUFvQztZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUN2QyxVQUFVLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO2FBQy9DO2lCQUFNO2dCQUNMLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtnQkFDckMsSUFBSSxDQUFDLFNBQVM7b0JBQUUsT0FBTTtnQkFFdEIsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO2dCQUM5QyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFBO2dCQUN0RCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO29CQUN6Qix3REFBd0Q7b0JBQ3hELHVFQUF1RTtvQkFDdkUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQTtpQkFDckQ7cUJBQU07b0JBQ0wsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFBO2lCQUNuQzthQUNGO1lBRUQscUNBQXFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNsQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO29CQUN0QixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRTt3QkFDbkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO3dCQUVwRixJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQTt3QkFDMUQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQTt3QkFDaEQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFBO3FCQUNsRTtvQkFFRCxVQUFVLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtpQkFDdEQ7Z0JBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7WUFDOUIsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBNaXhpbnNcbmltcG9ydCBTdGFja2FibGUgZnJvbSAnLi4vc3RhY2thYmxlJ1xuaW1wb3J0IHsgZmFjdG9yeSBhcyBwb3NpdGlvbmFibGVGYWN0b3J5IH0gZnJvbSAnLi4vcG9zaXRpb25hYmxlJ1xuaW1wb3J0IEFjdGl2YXRhYmxlIGZyb20gJy4uL2FjdGl2YXRhYmxlJ1xuaW1wb3J0IERldGFjaGFibGUgZnJvbSAnLi4vZGV0YWNoYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zLCB7IEV4dHJhY3RWdWUgfSBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGNvbnZlcnRUb1VuaXQgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgU3RhY2thYmxlLFxuICBwb3NpdGlvbmFibGVGYWN0b3J5KFsndG9wJywgJ3JpZ2h0JywgJ2JvdHRvbScsICdsZWZ0JywgJ2Fic29sdXRlJ10pLFxuICBBY3RpdmF0YWJsZSxcbiAgRGV0YWNoYWJsZSxcbilcblxuaW50ZXJmYWNlIGRpbWVuc2lvbnMge1xuICB0b3A6IG51bWJlclxuICBsZWZ0OiBudW1iZXJcbiAgYm90dG9tOiBudW1iZXJcbiAgcmlnaHQ6IG51bWJlclxuICB3aWR0aDogbnVtYmVyXG4gIGhlaWdodDogbnVtYmVyXG4gIG9mZnNldFRvcDogbnVtYmVyXG4gIHNjcm9sbEhlaWdodDogbnVtYmVyXG4gIG9mZnNldExlZnQ6IG51bWJlclxufVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEV4dHJhY3RWdWU8dHlwZW9mIGJhc2VNaXhpbnM+IHtcbiAgYXR0YWNoOiBib29sZWFuIHwgc3RyaW5nIHwgRWxlbWVudFxuICBvZmZzZXRZOiBib29sZWFuXG4gIG9mZnNldFg6IGJvb2xlYW5cbiAgZGltZW5zaW9uczoge1xuICAgIGFjdGl2YXRvcjogZGltZW5zaW9uc1xuICAgIGNvbnRlbnQ6IGRpbWVuc2lvbnNcbiAgfVxuICAkcmVmczoge1xuICAgIGNvbnRlbnQ6IEhUTUxFbGVtZW50XG4gICAgYWN0aXZhdG9yOiBIVE1MRWxlbWVudFxuICB9XG59XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZDxvcHRpb25zPigpLmV4dGVuZCh7XG4gIG5hbWU6ICdtZW51YWJsZScsXG5cbiAgcHJvcHM6IHtcbiAgICBhbGxvd092ZXJmbG93OiBCb29sZWFuLFxuICAgIGxpZ2h0OiBCb29sZWFuLFxuICAgIGRhcms6IEJvb2xlYW4sXG4gICAgbWF4V2lkdGg6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAnYXV0bycsXG4gICAgfSxcbiAgICBtaW5XaWR0aDogW051bWJlciwgU3RyaW5nXSxcbiAgICBudWRnZUJvdHRvbToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgfSxcbiAgICBudWRnZUxlZnQ6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAwLFxuICAgIH0sXG4gICAgbnVkZ2VSaWdodDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgfSxcbiAgICBudWRnZVRvcDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgfSxcbiAgICBudWRnZVdpZHRoOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIG9mZnNldE92ZXJmbG93OiBCb29sZWFuLFxuICAgIHBvc2l0aW9uWDoge1xuICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIHBvc2l0aW9uWToge1xuICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIHpJbmRleDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGFjdGl2YXRvck5vZGU6IFtdIGFzIFZOb2RlW10sXG4gICAgYWJzb2x1dGVYOiAwLFxuICAgIGFic29sdXRlWTogMCxcbiAgICBhY3RpdmF0ZWRCeTogbnVsbCBhcyBFdmVudFRhcmdldCB8IG51bGwsXG4gICAgYWN0aXZhdG9yRml4ZWQ6IGZhbHNlLFxuICAgIGRpbWVuc2lvbnM6IHtcbiAgICAgIGFjdGl2YXRvcjoge1xuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIHdpZHRoOiAwLFxuICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgIG9mZnNldFRvcDogMCxcbiAgICAgICAgc2Nyb2xsSGVpZ2h0OiAwLFxuICAgICAgICBvZmZzZXRMZWZ0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICBvZmZzZXRUb3A6IDAsXG4gICAgICAgIHNjcm9sbEhlaWdodDogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZWxhdGl2ZVlPZmZzZXQ6IDAsXG4gICAgaGFzSnVzdEZvY3VzZWQ6IGZhbHNlLFxuICAgIGhhc1dpbmRvdzogZmFsc2UsXG4gICAgaW5wdXRBY3RpdmF0b3I6IGZhbHNlLFxuICAgIGlzQ29udGVudEFjdGl2ZTogZmFsc2UsXG4gICAgcGFnZVdpZHRoOiAwLFxuICAgIHBhZ2VZT2Zmc2V0OiAwLFxuICAgIHN0YWNrQ2xhc3M6ICd2LW1lbnVfX2NvbnRlbnQtLWFjdGl2ZScsXG4gICAgc3RhY2tNaW5aSW5kZXg6IDYsXG4gIH0pLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY29tcHV0ZWRMZWZ0ICgpIHtcbiAgICAgIGNvbnN0IGEgPSB0aGlzLmRpbWVuc2lvbnMuYWN0aXZhdG9yXG4gICAgICBjb25zdCBjID0gdGhpcy5kaW1lbnNpb25zLmNvbnRlbnRcbiAgICAgIGNvbnN0IGFjdGl2YXRvckxlZnQgPSAodGhpcy5hdHRhY2ggIT09IGZhbHNlID8gYS5vZmZzZXRMZWZ0IDogYS5sZWZ0KSB8fCAwXG4gICAgICBjb25zdCBtaW5XaWR0aCA9IE1hdGgubWF4KGEud2lkdGgsIGMud2lkdGgpXG4gICAgICBsZXQgbGVmdCA9IDBcbiAgICAgIGxlZnQgKz0gYWN0aXZhdG9yTGVmdFxuICAgICAgaWYgKHRoaXMubGVmdCB8fCAodGhpcy4kdnVldGlmeS5ydGwgJiYgIXRoaXMucmlnaHQpKSBsZWZ0IC09IChtaW5XaWR0aCAtIGEud2lkdGgpXG4gICAgICBpZiAodGhpcy5vZmZzZXRYKSB7XG4gICAgICAgIGNvbnN0IG1heFdpZHRoID0gaXNOYU4oTnVtYmVyKHRoaXMubWF4V2lkdGgpKVxuICAgICAgICAgID8gYS53aWR0aFxuICAgICAgICAgIDogTWF0aC5taW4oYS53aWR0aCwgTnVtYmVyKHRoaXMubWF4V2lkdGgpKVxuXG4gICAgICAgIGxlZnQgKz0gdGhpcy5sZWZ0ID8gLW1heFdpZHRoIDogYS53aWR0aFxuICAgICAgfVxuICAgICAgaWYgKHRoaXMubnVkZ2VMZWZ0KSBsZWZ0IC09IHBhcnNlSW50KHRoaXMubnVkZ2VMZWZ0KVxuICAgICAgaWYgKHRoaXMubnVkZ2VSaWdodCkgbGVmdCArPSBwYXJzZUludCh0aGlzLm51ZGdlUmlnaHQpXG5cbiAgICAgIHJldHVybiBsZWZ0XG4gICAgfSxcbiAgICBjb21wdXRlZFRvcCAoKSB7XG4gICAgICBjb25zdCBhID0gdGhpcy5kaW1lbnNpb25zLmFjdGl2YXRvclxuICAgICAgY29uc3QgYyA9IHRoaXMuZGltZW5zaW9ucy5jb250ZW50XG4gICAgICBsZXQgdG9wID0gMFxuXG4gICAgICBpZiAodGhpcy50b3ApIHRvcCArPSBhLmhlaWdodCAtIGMuaGVpZ2h0XG4gICAgICBpZiAodGhpcy5hdHRhY2ggIT09IGZhbHNlKSB0b3AgKz0gYS5vZmZzZXRUb3BcbiAgICAgIGVsc2UgdG9wICs9IGEudG9wICsgdGhpcy5wYWdlWU9mZnNldFxuICAgICAgaWYgKHRoaXMub2Zmc2V0WSkgdG9wICs9IHRoaXMudG9wID8gLWEuaGVpZ2h0IDogYS5oZWlnaHRcbiAgICAgIGlmICh0aGlzLm51ZGdlVG9wKSB0b3AgLT0gcGFyc2VJbnQodGhpcy5udWRnZVRvcClcbiAgICAgIGlmICh0aGlzLm51ZGdlQm90dG9tKSB0b3AgKz0gcGFyc2VJbnQodGhpcy5udWRnZUJvdHRvbSlcblxuICAgICAgcmV0dXJuIHRvcFxuICAgIH0sXG4gICAgaGFzQWN0aXZhdG9yICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAhIXRoaXMuJHNsb3RzLmFjdGl2YXRvciB8fCAhIXRoaXMuJHNjb3BlZFNsb3RzLmFjdGl2YXRvciB8fCAhIXRoaXMuYWN0aXZhdG9yIHx8ICEhdGhpcy5pbnB1dEFjdGl2YXRvclxuICAgIH0sXG4gICAgYWJzb2x1dGVZT2Zmc2V0ICgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMucGFnZVlPZmZzZXQgLSB0aGlzLnJlbGF0aXZlWU9mZnNldFxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBkaXNhYmxlZCAodmFsKSB7XG4gICAgICB2YWwgJiYgdGhpcy5jYWxsRGVhY3RpdmF0ZSgpXG4gICAgfSxcbiAgICBpc0FjdGl2ZSAodmFsKSB7XG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuXG5cbiAgICAgIHZhbCA/IHRoaXMuY2FsbEFjdGl2YXRlKCkgOiB0aGlzLmNhbGxEZWFjdGl2YXRlKClcbiAgICB9LFxuICAgIHBvc2l0aW9uWDogJ3VwZGF0ZURpbWVuc2lvbnMnLFxuICAgIHBvc2l0aW9uWTogJ3VwZGF0ZURpbWVuc2lvbnMnLFxuICB9LFxuXG4gIGJlZm9yZU1vdW50ICgpIHtcbiAgICB0aGlzLmhhc1dpbmRvdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG5cbiAgICBpZiAodGhpcy5oYXNXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZURpbWVuc2lvbnMsIGZhbHNlKVxuICAgIH1cbiAgfSxcblxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5oYXNXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnVwZGF0ZURpbWVuc2lvbnMsIGZhbHNlKVxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgYWJzb2x1dGVQb3NpdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvZmZzZXRUb3A6IHRoaXMucG9zaXRpb25ZIHx8IHRoaXMuYWJzb2x1dGVZLFxuICAgICAgICBvZmZzZXRMZWZ0OiB0aGlzLnBvc2l0aW9uWCB8fCB0aGlzLmFic29sdXRlWCxcbiAgICAgICAgc2Nyb2xsSGVpZ2h0OiAwLFxuICAgICAgICB0b3A6IHRoaXMucG9zaXRpb25ZIHx8IHRoaXMuYWJzb2x1dGVZLFxuICAgICAgICBib3R0b206IHRoaXMucG9zaXRpb25ZIHx8IHRoaXMuYWJzb2x1dGVZLFxuICAgICAgICBsZWZ0OiB0aGlzLnBvc2l0aW9uWCB8fCB0aGlzLmFic29sdXRlWCxcbiAgICAgICAgcmlnaHQ6IHRoaXMucG9zaXRpb25YIHx8IHRoaXMuYWJzb2x1dGVYLFxuICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgIHdpZHRoOiAwLFxuICAgICAgfVxuICAgIH0sXG4gICAgYWN0aXZhdGUgKCkge30sXG4gICAgY2FsY0xlZnQgKG1lbnVXaWR0aDogbnVtYmVyKSB7XG4gICAgICByZXR1cm4gY29udmVydFRvVW5pdCh0aGlzLmF0dGFjaCAhPT0gZmFsc2VcbiAgICAgICAgPyB0aGlzLmNvbXB1dGVkTGVmdFxuICAgICAgICA6IHRoaXMuY2FsY1hPdmVyZmxvdyh0aGlzLmNvbXB1dGVkTGVmdCwgbWVudVdpZHRoKSlcbiAgICB9LFxuICAgIGNhbGNUb3AgKCkge1xuICAgICAgcmV0dXJuIGNvbnZlcnRUb1VuaXQodGhpcy5hdHRhY2ggIT09IGZhbHNlXG4gICAgICAgID8gdGhpcy5jb21wdXRlZFRvcFxuICAgICAgICA6IHRoaXMuY2FsY1lPdmVyZmxvdyh0aGlzLmNvbXB1dGVkVG9wKSlcbiAgICB9LFxuICAgIGNhbGNYT3ZlcmZsb3cgKGxlZnQ6IG51bWJlciwgbWVudVdpZHRoOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IHhPdmVyZmxvdyA9IGxlZnQgKyBtZW51V2lkdGggLSB0aGlzLnBhZ2VXaWR0aCArIDEyXG5cbiAgICAgIGlmICgoIXRoaXMubGVmdCB8fCB0aGlzLnJpZ2h0KSAmJiB4T3ZlcmZsb3cgPiAwKSB7XG4gICAgICAgIGxlZnQgPSBNYXRoLm1heChsZWZ0IC0geE92ZXJmbG93LCAwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVmdCA9IE1hdGgubWF4KGxlZnQsIDEyKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGVmdCArIHRoaXMuZ2V0T2Zmc2V0TGVmdCgpXG4gICAgfSxcbiAgICBjYWxjWU92ZXJmbG93ICh0b3A6IG51bWJlcikge1xuICAgICAgY29uc3QgZG9jdW1lbnRIZWlnaHQgPSB0aGlzLmdldElubmVySGVpZ2h0KClcbiAgICAgIGNvbnN0IHRvVG9wID0gdGhpcy5hYnNvbHV0ZVlPZmZzZXQgKyBkb2N1bWVudEhlaWdodFxuICAgICAgY29uc3QgYWN0aXZhdG9yID0gdGhpcy5kaW1lbnNpb25zLmFjdGl2YXRvclxuICAgICAgY29uc3QgY29udGVudEhlaWdodCA9IHRoaXMuZGltZW5zaW9ucy5jb250ZW50LmhlaWdodFxuICAgICAgY29uc3QgdG90YWxIZWlnaHQgPSB0b3AgKyBjb250ZW50SGVpZ2h0XG4gICAgICBjb25zdCBpc092ZXJmbG93aW5nID0gdG9Ub3AgPCB0b3RhbEhlaWdodFxuXG4gICAgICAvLyBJZiBvdmVyZmxvd2luZyBib3R0b20gYW5kIG9mZnNldFxuICAgICAgLy8gVE9ETzogc2V0ICdib3R0b20nIHBvc2l0aW9uIGluc3RlYWQgb2YgJ3RvcCdcbiAgICAgIGlmIChpc092ZXJmbG93aW5nICYmXG4gICAgICAgIHRoaXMub2Zmc2V0T3ZlcmZsb3cgJiZcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBlbm91Z2ggcm9vbSB0byBvZmZzZXRcbiAgICAgICAgLy8gdGhlIG92ZXJmbG93LCBkb24ndCBvZmZzZXRcbiAgICAgICAgYWN0aXZhdG9yLnRvcCA+IGNvbnRlbnRIZWlnaHRcbiAgICAgICkge1xuICAgICAgICB0b3AgPSB0aGlzLnBhZ2VZT2Zmc2V0ICsgKGFjdGl2YXRvci50b3AgLSBjb250ZW50SGVpZ2h0KVxuICAgICAgLy8gSWYgb3ZlcmZsb3dpbmcgYm90dG9tXG4gICAgICB9IGVsc2UgaWYgKGlzT3ZlcmZsb3dpbmcgJiYgIXRoaXMuYWxsb3dPdmVyZmxvdykge1xuICAgICAgICB0b3AgPSB0b1RvcCAtIGNvbnRlbnRIZWlnaHQgLSAxMlxuICAgICAgLy8gSWYgb3ZlcmZsb3dpbmcgdG9wXG4gICAgICB9IGVsc2UgaWYgKHRvcCA8IHRoaXMuYWJzb2x1dGVZT2Zmc2V0ICYmICF0aGlzLmFsbG93T3ZlcmZsb3cpIHtcbiAgICAgICAgdG9wID0gdGhpcy5hYnNvbHV0ZVlPZmZzZXQgKyAxMlxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdG9wIDwgMTIgPyAxMiA6IHRvcFxuICAgIH0sXG4gICAgY2FsbEFjdGl2YXRlICgpIHtcbiAgICAgIGlmICghdGhpcy5oYXNXaW5kb3cpIHJldHVyblxuXG4gICAgICB0aGlzLmFjdGl2YXRlKClcbiAgICB9LFxuICAgIGNhbGxEZWFjdGl2YXRlICgpIHtcbiAgICAgIHRoaXMuaXNDb250ZW50QWN0aXZlID0gZmFsc2VcblxuICAgICAgdGhpcy5kZWFjdGl2YXRlKClcbiAgICB9LFxuICAgIGNoZWNrRm9yUGFnZVlPZmZzZXQgKCkge1xuICAgICAgaWYgKHRoaXMuaGFzV2luZG93KSB7XG4gICAgICAgIHRoaXMucGFnZVlPZmZzZXQgPSB0aGlzLmFjdGl2YXRvckZpeGVkID8gMCA6IHRoaXMuZ2V0T2Zmc2V0VG9wKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGNoZWNrQWN0aXZhdG9yRml4ZWQgKCkge1xuICAgICAgaWYgKHRoaXMuYXR0YWNoICE9PSBmYWxzZSkgcmV0dXJuXG4gICAgICBsZXQgZWwgPSB0aGlzLmdldEFjdGl2YXRvcigpXG4gICAgICB3aGlsZSAoZWwpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5wb3NpdGlvbiA9PT0gJ2ZpeGVkJykge1xuICAgICAgICAgIHRoaXMuYWN0aXZhdG9yRml4ZWQgPSB0cnVlXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgZWwgPSBlbC5vZmZzZXRQYXJlbnQgYXMgSFRNTEVsZW1lbnRcbiAgICAgIH1cbiAgICAgIHRoaXMuYWN0aXZhdG9yRml4ZWQgPSBmYWxzZVxuICAgIH0sXG4gICAgZGVhY3RpdmF0ZSAoKSB7fSxcbiAgICBnZW5BY3RpdmF0b3JMaXN0ZW5lcnMgKCkge1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gQWN0aXZhdGFibGUub3B0aW9ucy5tZXRob2RzLmdlbkFjdGl2YXRvckxpc3RlbmVycy5jYWxsKHRoaXMpXG5cbiAgICAgIGNvbnN0IG9uQ2xpY2sgPSBsaXN0ZW5lcnMuY2xpY2tcblxuICAgICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgICAgbGlzdGVuZXJzLmNsaWNrID0gKGU6IE1vdXNlRXZlbnQgJiBLZXlib2FyZEV2ZW50ICYgRm9jdXNFdmVudCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLm9wZW5PbkNsaWNrKSB7XG4gICAgICAgICAgICBvbkNsaWNrICYmIG9uQ2xpY2soZSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmFic29sdXRlWCA9IGUuY2xpZW50WFxuICAgICAgICAgIHRoaXMuYWJzb2x1dGVZID0gZS5jbGllbnRZXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxpc3RlbmVyc1xuICAgIH0sXG4gICAgZ2V0SW5uZXJIZWlnaHQgKCkge1xuICAgICAgaWYgKCF0aGlzLmhhc1dpbmRvdykgcmV0dXJuIDBcblxuICAgICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodCB8fFxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgfSxcbiAgICBnZXRPZmZzZXRMZWZ0ICgpIHtcbiAgICAgIGlmICghdGhpcy5oYXNXaW5kb3cpIHJldHVybiAwXG5cbiAgICAgIHJldHVybiB3aW5kb3cucGFnZVhPZmZzZXQgfHxcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnRcbiAgICB9LFxuICAgIGdldE9mZnNldFRvcCAoKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzV2luZG93KSByZXR1cm4gMFxuXG4gICAgICByZXR1cm4gd2luZG93LnBhZ2VZT2Zmc2V0IHx8XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3BcbiAgICB9LFxuICAgIGdldFJvdW5kZWRCb3VuZGVkQ2xpZW50UmVjdCAoZWw6IEVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiBNYXRoLnJvdW5kKHJlY3QudG9wKSxcbiAgICAgICAgbGVmdDogTWF0aC5yb3VuZChyZWN0LmxlZnQpLFxuICAgICAgICBib3R0b206IE1hdGgucm91bmQocmVjdC5ib3R0b20pLFxuICAgICAgICByaWdodDogTWF0aC5yb3VuZChyZWN0LnJpZ2h0KSxcbiAgICAgICAgd2lkdGg6IE1hdGgucm91bmQocmVjdC53aWR0aCksXG4gICAgICAgIGhlaWdodDogTWF0aC5yb3VuZChyZWN0LmhlaWdodCksXG4gICAgICB9XG4gICAgfSxcbiAgICBtZWFzdXJlIChlbDogSFRNTEVsZW1lbnQpIHtcbiAgICAgIGlmICghZWwgfHwgIXRoaXMuaGFzV2luZG93KSByZXR1cm4gbnVsbFxuXG4gICAgICBjb25zdCByZWN0ID0gdGhpcy5nZXRSb3VuZGVkQm91bmRlZENsaWVudFJlY3QoZWwpXG5cbiAgICAgIC8vIEFjY291bnQgZm9yIGFjdGl2YXRvciBtYXJnaW5cbiAgICAgIGlmICh0aGlzLmF0dGFjaCAhPT0gZmFsc2UpIHtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcblxuICAgICAgICByZWN0LmxlZnQgPSBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0ISlcbiAgICAgICAgcmVjdC50b3AgPSBwYXJzZUludChzdHlsZS5tYXJnaW5Ub3AhKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVjdFxuICAgIH0sXG4gICAgc25lYWtQZWVrIChjYjogKCkgPT4gdm9pZCkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLiRyZWZzLmNvbnRlbnRcblxuICAgICAgICBpZiAoIWVsIHx8IGVsLnN0eWxlLmRpc3BsYXkgIT09ICdub25lJykge1xuICAgICAgICAgIGNiKClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJ1xuICAgICAgICBjYigpXG4gICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgIH0pXG4gICAgfSxcbiAgICBzdGFydFRyYW5zaXRpb24gKCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0NvbnRlbnRBY3RpdmUgPSB0aGlzLmhhc0p1c3RGb2N1c2VkID0gdGhpcy5pc0FjdGl2ZVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0pKVxuICAgIH0sXG4gICAgdXBkYXRlRGltZW5zaW9ucyAoKSB7XG4gICAgICB0aGlzLmhhc1dpbmRvdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLmNoZWNrQWN0aXZhdG9yRml4ZWQoKVxuICAgICAgdGhpcy5jaGVja0ZvclBhZ2VZT2Zmc2V0KClcbiAgICAgIHRoaXMucGFnZVdpZHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoXG5cbiAgICAgIGNvbnN0IGRpbWVuc2lvbnM6IGFueSA9IHtcbiAgICAgICAgYWN0aXZhdG9yOiB7IC4uLnRoaXMuZGltZW5zaW9ucy5hY3RpdmF0b3IgfSxcbiAgICAgICAgY29udGVudDogeyAuLi50aGlzLmRpbWVuc2lvbnMuY29udGVudCB9LFxuICAgICAgfVxuXG4gICAgICAvLyBBY3RpdmF0b3Igc2hvdWxkIGFscmVhZHkgYmUgc2hvd25cbiAgICAgIGlmICghdGhpcy5oYXNBY3RpdmF0b3IgfHwgdGhpcy5hYnNvbHV0ZSkge1xuICAgICAgICBkaW1lbnNpb25zLmFjdGl2YXRvciA9IHRoaXMuYWJzb2x1dGVQb3NpdGlvbigpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSB0aGlzLmdldEFjdGl2YXRvcigpXG4gICAgICAgIGlmICghYWN0aXZhdG9yKSByZXR1cm5cblxuICAgICAgICBkaW1lbnNpb25zLmFjdGl2YXRvciA9IHRoaXMubWVhc3VyZShhY3RpdmF0b3IpXG4gICAgICAgIGRpbWVuc2lvbnMuYWN0aXZhdG9yLm9mZnNldExlZnQgPSBhY3RpdmF0b3Iub2Zmc2V0TGVmdFxuICAgICAgICBpZiAodGhpcy5hdHRhY2ggIT09IGZhbHNlKSB7XG4gICAgICAgICAgLy8gYWNjb3VudCBmb3IgY3NzIHBhZGRpbmcgY2F1c2luZyB0aGluZ3MgdG8gbm90IGxpbmUgdXBcbiAgICAgICAgICAvLyB0aGlzIGlzIG1vc3RseSBmb3Igdi1hdXRvY29tcGxldGUsIGhvcGVmdWxseSBpdCB3b24ndCBicmVhayBhbnl0aGluZ1xuICAgICAgICAgIGRpbWVuc2lvbnMuYWN0aXZhdG9yLm9mZnNldFRvcCA9IGFjdGl2YXRvci5vZmZzZXRUb3BcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaW1lbnNpb25zLmFjdGl2YXRvci5vZmZzZXRUb3AgPSAwXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRGlzcGxheSBhbmQgaGlkZSB0byBnZXQgZGltZW5zaW9uc1xuICAgICAgdGhpcy5zbmVha1BlZWsoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy4kcmVmcy5jb250ZW50KSB7XG4gICAgICAgICAgaWYgKHRoaXMuJHJlZnMuY29udGVudC5vZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldFJlY3QgPSB0aGlzLmdldFJvdW5kZWRCb3VuZGVkQ2xpZW50UmVjdCh0aGlzLiRyZWZzLmNvbnRlbnQub2Zmc2V0UGFyZW50KVxuXG4gICAgICAgICAgICB0aGlzLnJlbGF0aXZlWU9mZnNldCA9IHdpbmRvdy5wYWdlWU9mZnNldCArIG9mZnNldFJlY3QudG9wXG4gICAgICAgICAgICBkaW1lbnNpb25zLmFjdGl2YXRvci50b3AgLT0gdGhpcy5yZWxhdGl2ZVlPZmZzZXRcbiAgICAgICAgICAgIGRpbWVuc2lvbnMuYWN0aXZhdG9yLmxlZnQgLT0gd2luZG93LnBhZ2VYT2Zmc2V0ICsgb2Zmc2V0UmVjdC5sZWZ0XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGltZW5zaW9ucy5jb250ZW50ID0gdGhpcy5tZWFzdXJlKHRoaXMuJHJlZnMuY29udGVudClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZGltZW5zaW9ucyA9IGRpbWVuc2lvbnNcbiAgICAgIH0pXG4gICAgfSxcbiAgfSxcbn0pXG4iXX0=
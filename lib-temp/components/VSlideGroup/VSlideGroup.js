// Styles
import './VSlideGroup.sass';
// Components
import VIcon from '../VIcon';
import { VFadeTransition } from '../transitions';
// Extensions
import { BaseItemGroup } from '../VItemGroup/VItemGroup';
// Mixins
import Mobile from '../../mixins/mobile';
// Directives
import Resize from '../../directives/resize';
import Touch from '../../directives/touch';
// Utilities
import mixins from '../../util/mixins';
import { composedPath } from '../../util/helpers';
function bias(val) {
    const c = 0.501;
    const x = Math.abs(val);
    return Math.sign(val) * (x / ((1 / c - 2) * (1 - x) + 1));
}
export function calculateUpdatedOffset(selectedElement, widths, rtl, currentScrollOffset) {
    const clientWidth = selectedElement.clientWidth;
    const offsetLeft = rtl
        ? (widths.content - selectedElement.offsetLeft - clientWidth)
        : selectedElement.offsetLeft;
    if (rtl) {
        currentScrollOffset = -currentScrollOffset;
    }
    const totalWidth = widths.wrapper + currentScrollOffset;
    const itemOffset = clientWidth + offsetLeft;
    const additionalOffset = clientWidth * 0.4;
    if (offsetLeft <= currentScrollOffset) {
        currentScrollOffset = Math.max(offsetLeft - additionalOffset, 0);
    }
    else if (totalWidth <= itemOffset) {
        currentScrollOffset = Math.min(currentScrollOffset - (totalWidth - itemOffset - additionalOffset), widths.content - widths.wrapper);
    }
    return rtl ? -currentScrollOffset : currentScrollOffset;
}
export function calculateCenteredOffset(selectedElement, widths, rtl) {
    const { offsetLeft, clientWidth } = selectedElement;
    if (rtl) {
        const offsetCentered = widths.content - offsetLeft - clientWidth / 2 - widths.wrapper / 2;
        return -Math.min(widths.content - widths.wrapper, Math.max(0, offsetCentered));
    }
    else {
        const offsetCentered = offsetLeft + clientWidth / 2 - widths.wrapper / 2;
        return Math.min(widths.content - widths.wrapper, Math.max(0, offsetCentered));
    }
}
export const BaseSlideGroup = mixins(BaseItemGroup, Mobile).extend({
    name: 'base-slide-group',
    directives: {
        Resize,
        Touch,
    },
    props: {
        activeClass: {
            type: String,
            default: 'v-slide-item--active',
        },
        centerActive: Boolean,
        nextIcon: {
            type: String,
            default: '$next',
        },
        prevIcon: {
            type: String,
            default: '$prev',
        },
        showArrows: {
            type: [Boolean, String],
            validator: v => (typeof v === 'boolean' || [
                'always',
                'desktop',
                'mobile',
            ].includes(v)),
        },
    },
    data: () => ({
        isOverflowing: false,
        resizeTimeout: 0,
        startX: 0,
        isSwipingHorizontal: false,
        isSwiping: false,
        scrollOffset: 0,
        widths: {
            content: 0,
            wrapper: 0,
        },
    }),
    computed: {
        canTouch() {
            return typeof window !== 'undefined';
        },
        __cachedNext() {
            return this.genTransition('next');
        },
        __cachedPrev() {
            return this.genTransition('prev');
        },
        classes() {
            return {
                ...BaseItemGroup.options.computed.classes.call(this),
                'v-slide-group': true,
                'v-slide-group--has-affixes': this.hasAffixes,
                'v-slide-group--is-overflowing': this.isOverflowing,
            };
        },
        hasAffixes() {
            switch (this.showArrows) {
                // Always show arrows on desktop & mobile
                case 'always': return true;
                // Always show arrows on desktop
                case 'desktop': return !this.isMobile;
                // Show arrows on mobile when overflowing.
                // This matches the default 2.2 behavior
                case true: return this.isOverflowing || Math.abs(this.scrollOffset) > 0;
                // Always show on mobile
                case 'mobile': return (this.isMobile ||
                    (this.isOverflowing || Math.abs(this.scrollOffset) > 0));
                // https://material.io/components/tabs#scrollable-tabs
                // Always show arrows when
                // overflowed on desktop
                default: return (!this.isMobile &&
                    (this.isOverflowing || Math.abs(this.scrollOffset) > 0));
            }
        },
        hasNext() {
            if (!this.hasAffixes)
                return false;
            const { content, wrapper } = this.widths;
            // Check one scroll ahead to know the width of right-most item
            return content > Math.abs(this.scrollOffset) + wrapper;
        },
        hasPrev() {
            return this.hasAffixes && this.scrollOffset !== 0;
        },
    },
    watch: {
        internalValue: 'setWidths',
        // When overflow changes, the arrows alter
        // the widths of the content and wrapper
        // and need to be recalculated
        isOverflowing: 'setWidths',
        scrollOffset(val) {
            if (this.$vuetify.rtl)
                val = -val;
            let scroll = val <= 0
                ? bias(-val)
                : val > this.widths.content - this.widths.wrapper
                    ? -(this.widths.content - this.widths.wrapper) + bias(this.widths.content - this.widths.wrapper - val)
                    : -val;
            if (this.$vuetify.rtl)
                scroll = -scroll;
            this.$refs.content.style.transform = `translateX(${scroll}px)`;
        },
    },
    mounted() {
        if (typeof ResizeObserver !== 'undefined') {
            const obs = new ResizeObserver(() => {
                this.onResize();
            });
            obs.observe(this.$el);
            obs.observe(this.$refs.content);
            this.$on('hook:destroyed', () => {
                obs.disconnect();
            });
        }
        else {
            let itemsLength = 0;
            this.$on('hook:beforeUpdate', () => {
                itemsLength = (this.$refs.content?.children || []).length;
            });
            this.$on('hook:updated', () => {
                if (itemsLength === (this.$refs.content?.children || []).length)
                    return;
                this.setWidths();
            });
        }
    },
    methods: {
        onScroll() {
            this.$refs.wrapper.scrollLeft = 0;
        },
        onFocusin(e) {
            if (!this.isOverflowing)
                return;
            // Focused element is likely to be the root of an item, so a
            // breadth-first search will probably find it in the first iteration
            for (const el of composedPath(e)) {
                for (const vm of this.items) {
                    if (vm.$el === el) {
                        this.scrollOffset = calculateUpdatedOffset(vm.$el, this.widths, this.$vuetify.rtl, this.scrollOffset);
                        return;
                    }
                }
            }
        },
        // Always generate next for scrollable hint
        genNext() {
            const slot = this.$scopedSlots.next
                ? this.$scopedSlots.next({})
                : this.$slots.next || this.__cachedNext;
            return this.$createElement('div', {
                staticClass: 'v-slide-group__next',
                class: {
                    'v-slide-group__next--disabled': !this.hasNext,
                },
                on: {
                    click: () => this.onAffixClick('next'),
                },
                key: 'next',
            }, [slot]);
        },
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-slide-group__content',
                ref: 'content',
                on: {
                    focusin: this.onFocusin,
                },
            }, this.$slots.default);
        },
        genData() {
            return {
                class: this.classes,
                directives: [{
                        name: 'resize',
                        value: this.onResize,
                    }],
            };
        },
        genIcon(location) {
            let icon = location;
            if (this.$vuetify.rtl && location === 'prev') {
                icon = 'next';
            }
            else if (this.$vuetify.rtl && location === 'next') {
                icon = 'prev';
            }
            const upperLocation = `${location[0].toUpperCase()}${location.slice(1)}`;
            const hasAffix = this[`has${upperLocation}`];
            if (!this.showArrows &&
                !hasAffix)
                return null;
            return this.$createElement(VIcon, {
                props: {
                    disabled: !hasAffix,
                },
            }, this[`${icon}Icon`]);
        },
        // Always generate prev for scrollable hint
        genPrev() {
            const slot = this.$scopedSlots.prev
                ? this.$scopedSlots.prev({})
                : this.$slots.prev || this.__cachedPrev;
            return this.$createElement('div', {
                staticClass: 'v-slide-group__prev',
                class: {
                    'v-slide-group__prev--disabled': !this.hasPrev,
                },
                on: {
                    click: () => this.onAffixClick('prev'),
                },
                key: 'prev',
            }, [slot]);
        },
        genTransition(location) {
            return this.$createElement(VFadeTransition, [this.genIcon(location)]);
        },
        genWrapper() {
            return this.$createElement('div', {
                staticClass: 'v-slide-group__wrapper',
                directives: [{
                        name: 'touch',
                        value: {
                            start: (e) => this.overflowCheck(e, this.onTouchStart),
                            move: (e) => this.overflowCheck(e, this.onTouchMove),
                            end: (e) => this.overflowCheck(e, this.onTouchEnd),
                        },
                    }],
                ref: 'wrapper',
                on: {
                    scroll: this.onScroll,
                },
            }, [this.genContent()]);
        },
        calculateNewOffset(direction, widths, rtl, currentScrollOffset) {
            const sign = rtl ? -1 : 1;
            const newAbosluteOffset = sign * currentScrollOffset +
                (direction === 'prev' ? -1 : 1) * widths.wrapper;
            return sign * Math.max(Math.min(newAbosluteOffset, widths.content - widths.wrapper), 0);
        },
        onAffixClick(location) {
            this.$emit(`click:${location}`);
            this.scrollTo(location);
        },
        onResize() {
            /* istanbul ignore next */
            if (this._isDestroyed)
                return;
            this.setWidths();
        },
        onTouchStart(e) {
            const { content } = this.$refs;
            this.startX = this.scrollOffset + e.touchstartX;
            content.style.setProperty('transition', 'none');
            content.style.setProperty('willChange', 'transform');
        },
        onTouchMove(e) {
            if (!this.canTouch)
                return;
            if (!this.isSwiping) {
                // only calculate disableSwipeHorizontal during the first onTouchMove invoke
                // in order to ensure disableSwipeHorizontal value is consistent between onTouchStart and onTouchEnd
                const diffX = e.touchmoveX - e.touchstartX;
                const diffY = e.touchmoveY - e.touchstartY;
                this.isSwipingHorizontal = Math.abs(diffX) > Math.abs(diffY);
                this.isSwiping = true;
            }
            if (this.isSwipingHorizontal) {
                // sliding horizontally
                this.scrollOffset = this.startX - e.touchmoveX;
                // temporarily disable window vertical scrolling
                document.documentElement.style.overflowY = 'hidden';
            }
        },
        onTouchEnd() {
            if (!this.canTouch)
                return;
            const { content, wrapper } = this.$refs;
            const maxScrollOffset = content.clientWidth - wrapper.clientWidth;
            content.style.setProperty('transition', null);
            content.style.setProperty('willChange', null);
            if (this.$vuetify.rtl) {
                /* istanbul ignore else */
                if (this.scrollOffset > 0 || !this.isOverflowing) {
                    this.scrollOffset = 0;
                }
                else if (this.scrollOffset <= -maxScrollOffset) {
                    this.scrollOffset = -maxScrollOffset;
                }
            }
            else {
                /* istanbul ignore else */
                if (this.scrollOffset < 0 || !this.isOverflowing) {
                    this.scrollOffset = 0;
                }
                else if (this.scrollOffset >= maxScrollOffset) {
                    this.scrollOffset = maxScrollOffset;
                }
            }
            this.isSwiping = false;
            // rollback whole page scrolling to default
            document.documentElement.style.removeProperty('overflow-y');
        },
        overflowCheck(e, fn) {
            e.stopPropagation();
            this.isOverflowing && fn(e);
        },
        scrollIntoView /* istanbul ignore next */() {
            if (!this.selectedItem && this.items.length) {
                const lastItemPosition = this.items[this.items.length - 1].$el.getBoundingClientRect();
                const wrapperPosition = this.$refs.wrapper.getBoundingClientRect();
                if ((this.$vuetify.rtl && wrapperPosition.right < lastItemPosition.right) ||
                    (!this.$vuetify.rtl && wrapperPosition.left > lastItemPosition.left)) {
                    this.scrollTo('prev');
                }
            }
            if (!this.selectedItem) {
                return;
            }
            if (this.selectedIndex === 0 ||
                (!this.centerActive && !this.isOverflowing)) {
                this.scrollOffset = 0;
            }
            else if (this.centerActive) {
                this.scrollOffset = calculateCenteredOffset(this.selectedItem.$el, this.widths, this.$vuetify.rtl);
            }
            else if (this.isOverflowing) {
                this.scrollOffset = calculateUpdatedOffset(this.selectedItem.$el, this.widths, this.$vuetify.rtl, this.scrollOffset);
            }
        },
        scrollTo /* istanbul ignore next */(location) {
            this.scrollOffset = this.calculateNewOffset(location, {
                // Force reflow
                content: this.$refs.content ? this.$refs.content.clientWidth : 0,
                wrapper: this.$refs.wrapper ? this.$refs.wrapper.clientWidth : 0,
            }, this.$vuetify.rtl, this.scrollOffset);
        },
        setWidths() {
            window.requestAnimationFrame(() => {
                if (this._isDestroyed)
                    return;
                const { content, wrapper } = this.$refs;
                this.widths = {
                    content: content ? content.clientWidth : 0,
                    wrapper: wrapper ? wrapper.clientWidth : 0,
                };
                // https://github.com/vuetifyjs/vuetify/issues/13212
                // We add +1 to the wrappers width to prevent an issue where the `clientWidth`
                // gets calculated wrongly by the browser if using a different zoom-level.
                this.isOverflowing = this.widths.wrapper + 1 < this.widths.content;
                this.scrollIntoView();
            });
        },
    },
    render(h) {
        return h('div', this.genData(), [
            this.genPrev(),
            this.genWrapper(),
            this.genNext(),
        ]);
    },
});
export default BaseSlideGroup.extend({
    name: 'v-slide-group',
    provide() {
        return {
            slideGroup: this,
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNsaWRlR3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WU2xpZGVHcm91cC9WU2xpZGVHcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxvQkFBb0IsQ0FBQTtBQUUzQixhQUFhO0FBQ2IsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUVoRCxhQUFhO0FBQ2IsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBRXhELFNBQVM7QUFDVCxPQUFPLE1BQU0sTUFBTSxxQkFBcUIsQ0FBQTtBQUV4QyxhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0seUJBQXlCLENBQUE7QUFDNUMsT0FBTyxLQUFLLE1BQU0sd0JBQXdCLENBQUE7QUFFMUMsWUFBWTtBQUNaLE9BQU8sTUFBc0IsTUFBTSxtQkFBbUIsQ0FBQTtBQUl0RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFzQmpELFNBQVMsSUFBSSxDQUFFLEdBQVc7SUFDeEIsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFBO0lBQ2YsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN2QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMzRCxDQUFDO0FBRUQsTUFBTSxVQUFVLHNCQUFzQixDQUNwQyxlQUE0QixFQUM1QixNQUFjLEVBQ2QsR0FBWSxFQUNaLG1CQUEyQjtJQUUzQixNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsV0FBVyxD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LEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDZixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBO0FBRUYsZUFBZSxjQUFjLENBQUMsTUFBTSxDQUFDO0lBQ25DLElBQUksRUFBRSxlQUFlO0lBRXJCLE9BQU87UUFDTCxPQUFPO1lBQ0wsVUFBVSxFQUFFLElBQUk7U0FDakIsQ0FBQTtJQUNILENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WU2xpZGVHcm91cC5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVkljb24gZnJvbSAnLi4vVkljb24nXG5pbXBvcnQgeyBWRmFkZVRyYW5zaXRpb24gfSBmcm9tICcuLi90cmFuc2l0aW9ucydcblxuLy8gRXh0ZW5zaW9uc1xuaW1wb3J0IHsgQmFzZUl0ZW1Hcm91cCB9IGZyb20gJy4uL1ZJdGVtR3JvdXAvVkl0ZW1Hcm91cCdcblxuLy8gTWl4aW5zXG5pbXBvcnQgTW9iaWxlIGZyb20gJy4uLy4uL21peGlucy9tb2JpbGUnXG5cbi8vIERpcmVjdGl2ZXNcbmltcG9ydCBSZXNpemUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yZXNpemUnXG5pbXBvcnQgVG91Y2ggZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy90b3VjaCdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zLCB7IEV4dHJhY3RWdWUgfSBmcm9tICcuLi8uLi91dGlsL21peGlucydcblxuLy8gVHlwZXNcbmltcG9ydCBWdWUsIHsgVk5vZGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBjb21wb3NlZFBhdGggfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbmludGVyZmFjZSBUb3VjaEV2ZW50IHtcbiAgdG91Y2hzdGFydFg6IG51bWJlclxuICB0b3VjaHN0YXJ0WTogbnVtYmVyXG4gIHRvdWNobW92ZVg6IG51bWJlclxuICB0b3VjaG1vdmVZOiBudW1iZXJcbiAgc3RvcFByb3BhZ2F0aW9uOiBGdW5jdGlvblxufVxuXG5pbnRlcmZhY2UgV2lkdGhzIHtcbiAgY29udGVudDogbnVtYmVyXG4gIHdyYXBwZXI6IG51bWJlclxufVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIFZ1ZSB7XG4gICRyZWZzOiB7XG4gICAgY29udGVudDogSFRNTEVsZW1lbnRcbiAgICB3cmFwcGVyOiBIVE1MRWxlbWVudFxuICB9XG59XG5cbmZ1bmN0aW9uIGJpYXMgKHZhbDogbnVtYmVyKSB7XG4gIGNvbnN0IGMgPSAwLjUwMVxuICBjb25zdCB4ID0gTWF0aC5hYnModmFsKVxuICByZXR1cm4gTWF0aC5zaWduKHZhbCkgKiAoeCAvICgoMSAvIGMgLSAyKSAqICgxIC0geCkgKyAxKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVVwZGF0ZWRPZmZzZXQgKFxuICBzZWxlY3RlZEVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICB3aWR0aHM6IFdpZHRocyxcbiAgcnRsOiBib29sZWFuLFxuICBjdXJyZW50U2Nyb2xsT2Zmc2V0OiBudW1iZXJcbik6IG51bWJlciB7XG4gIGNvbnN0IGNsaWVudFdpZHRoID0gc2VsZWN0ZWRFbGVtZW50LmNsaWVudFdpZHRoXG4gIGNvbnN0IG9mZnNldExlZnQgPSBydGxcbiAgICA/ICh3aWR0aHMuY29udGVudCAtIHNlbGVjdGVkRWxlbWVudC5vZmZzZXRMZWZ0IC0gY2xpZW50V2lkdGgpXG4gICAgOiBzZWxlY3RlZEVsZW1lbnQub2Zmc2V0TGVmdFxuXG4gIGlmIChydGwpIHtcbiAgICBjdXJyZW50U2Nyb2xsT2Zmc2V0ID0gLWN1cnJlbnRTY3JvbGxPZmZzZXRcbiAgfVxuXG4gIGNvbnN0IHRvdGFsV2lkdGggPSB3aWR0aHMud3JhcHBlciArIGN1cnJlbnRTY3JvbGxPZmZzZXRcbiAgY29uc3QgaXRlbU9mZnNldCA9IGNsaWVudFdpZHRoICsgb2Zmc2V0TGVmdFxuICBjb25zdCBhZGRpdGlvbmFsT2Zmc2V0ID0gY2xpZW50V2lkdGggKiAwLjRcblxuICBpZiAob2Zmc2V0TGVmdCA8PSBjdXJyZW50U2Nyb2xsT2Zmc2V0KSB7XG4gICAgY3VycmVudFNjcm9sbE9mZnNldCA9IE1hdGgubWF4KG9mZnNldExlZnQgLSBhZGRpdGlvbmFsT2Zmc2V0LCAwKVxuICB9IGVsc2UgaWYgKHRvdGFsV2lkdGggPD0gaXRlbU9mZnNldCkge1xuICAgIGN1cnJlbnRTY3JvbGxPZmZzZXQgPSBNYXRoLm1pbihjdXJyZW50U2Nyb2xsT2Zmc2V0IC0gKHRvdGFsV2lkdGggLSBpdGVtT2Zmc2V0IC0gYWRkaXRpb25hbE9mZnNldCksIHdpZHRocy5jb250ZW50IC0gd2lkdGhzLndyYXBwZXIpXG4gIH1cblxuICByZXR1cm4gcnRsID8gLWN1cnJlbnRTY3JvbGxPZmZzZXQgOiBjdXJyZW50U2Nyb2xsT2Zmc2V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVDZW50ZXJlZE9mZnNldCAoXG4gIHNlbGVjdGVkRWxlbWVudDogSFRNTEVsZW1lbnQsXG4gIHdpZHRoczogV2lkdGhzLFxuICBydGw6IGJvb2xlYW5cbik6IG51bWJlciB7XG4gIGNvbnN0IHsgb2Zmc2V0TGVmdCwgY2xpZW50V2lkdGggfSA9IHNlbGVjdGVkRWxlbWVudFxuXG4gIGlmIChydGwpIHtcbiAgICBjb25zdCBvZmZzZXRDZW50ZXJlZCA9IHdpZHRocy5jb250ZW50IC0gb2Zmc2V0TGVmdCAtIGNsaWVudFdpZHRoIC8gMiAtIHdpZHRocy53cmFwcGVyIC8gMlxuICAgIHJldHVybiAtTWF0aC5taW4od2lkdGhzLmNvbnRlbnQgLSB3aWR0aHMud3JhcHBlciwgTWF0aC5tYXgoMCwgb2Zmc2V0Q2VudGVyZWQpKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IG9mZnNldENlbnRlcmVkID0gb2Zmc2V0TGVmdCArIGNsaWVudFdpZHRoIC8gMiAtIHdpZHRocy53cmFwcGVyIC8gMlxuICAgIHJldHVybiBNYXRoLm1pbih3aWR0aHMuY29udGVudCAtIHdpZHRocy53cmFwcGVyLCBNYXRoLm1heCgwLCBvZmZzZXRDZW50ZXJlZCkpXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEJhc2VTbGlkZUdyb3VwID0gbWl4aW5zPG9wdGlvbnMgJlxuLyogZXNsaW50LWRpc2FibGUgaW5kZW50ICovXG4gIEV4dHJhY3RWdWU8W1xuICAgIHR5cGVvZiBCYXNlSXRlbUdyb3VwLFxuICAgIHR5cGVvZiBNb2JpbGUsXG4gIF0+XG4vKiBlc2xpbnQtZW5hYmxlIGluZGVudCAqL1xuPihcbiAgQmFzZUl0ZW1Hcm91cCxcbiAgTW9iaWxlLFxuICAvKiBAdnVlL2NvbXBvbmVudCAqL1xuKS5leHRlbmQoe1xuICBuYW1lOiAnYmFzZS1zbGlkZS1ncm91cCcsXG5cbiAgZGlyZWN0aXZlczoge1xuICAgIFJlc2l6ZSxcbiAgICBUb3VjaCxcbiAgfSxcblxuICBwcm9wczoge1xuICAgIGFjdGl2ZUNsYXNzOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAndi1zbGlkZS1pdGVtLS1hY3RpdmUnLFxuICAgIH0sXG4gICAgY2VudGVyQWN0aXZlOiBCb29sZWFuLFxuICAgIG5leHRJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJG5leHQnLFxuICAgIH0sXG4gICAgcHJldkljb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckcHJldicsXG4gICAgfSxcbiAgICBzaG93QXJyb3dzOiB7XG4gICAgICB0eXBlOiBbQm9vbGVhbiwgU3RyaW5nXSxcbiAgICAgIHZhbGlkYXRvcjogdiA9PiAoXG4gICAgICAgIHR5cGVvZiB2ID09PSAnYm9vbGVhbicgfHwgW1xuICAgICAgICAgICdhbHdheXMnLFxuICAgICAgICAgICdkZXNrdG9wJyxcbiAgICAgICAgICAnbW9iaWxlJyxcbiAgICAgICAgXS5pbmNsdWRlcyh2KVxuICAgICAgKSxcbiAgICB9LFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgaXNPdmVyZmxvd2luZzogZmFsc2UsXG4gICAgcmVzaXplVGltZW91dDogMCxcbiAgICBzdGFydFg6IDAsXG4gICAgaXNTd2lwaW5nSG9yaXpvbnRhbDogZmFsc2UsXG4gICAgaXNTd2lwaW5nOiBmYWxzZSxcbiAgICBzY3JvbGxPZmZzZXQ6IDAsXG4gICAgd2lkdGhzOiB7XG4gICAgICBjb250ZW50OiAwLFxuICAgICAgd3JhcHBlcjogMCxcbiAgICB9LFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNhblRvdWNoICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgIH0sXG4gICAgX19jYWNoZWROZXh0ICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5UcmFuc2l0aW9uKCduZXh0JylcbiAgICB9LFxuICAgIF9fY2FjaGVkUHJldiAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuVHJhbnNpdGlvbigncHJldicpXG4gICAgfSxcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uQmFzZUl0ZW1Hcm91cC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3Ytc2xpZGUtZ3JvdXAnOiB0cnVlLFxuICAgICAgICAndi1zbGlkZS1ncm91cC0taGFzLWFmZml4ZXMnOiB0aGlzLmhhc0FmZml4ZXMsXG4gICAgICAgICd2LXNsaWRlLWdyb3VwLS1pcy1vdmVyZmxvd2luZyc6IHRoaXMuaXNPdmVyZmxvd2luZyxcbiAgICAgIH1cbiAgICB9LFxuICAgIGhhc0FmZml4ZXMgKCk6IEJvb2xlYW4ge1xuICAgICAgc3dpdGNoICh0aGlzLnNob3dBcnJvd3MpIHtcbiAgICAgICAgLy8gQWx3YXlzIHNob3cgYXJyb3dzIG9uIGRlc2t0b3AgJiBtb2JpbGVcbiAgICAgICAgY2FzZSAnYWx3YXlzJzogcmV0dXJuIHRydWVcblxuICAgICAgICAvLyBBbHdheXMgc2hvdyBhcnJvd3Mgb24gZGVza3RvcFxuICAgICAgICBjYXNlICdkZXNrdG9wJzogcmV0dXJuICF0aGlzLmlzTW9iaWxlXG5cbiAgICAgICAgLy8gU2hvdyBhcnJvd3Mgb24gbW9iaWxlIHdoZW4gb3ZlcmZsb3dpbmcuXG4gICAgICAgIC8vIFRoaXMgbWF0Y2hlcyB0aGUgZGVmYXVsdCAyLjIgYmVoYXZpb3JcbiAgICAgICAgY2FzZSB0cnVlOiByZXR1cm4gdGhpcy5pc092ZXJmbG93aW5nIHx8IE1hdGguYWJzKHRoaXMuc2Nyb2xsT2Zmc2V0KSA+IDBcblxuICAgICAgICAvLyBBbHdheXMgc2hvdyBvbiBtb2JpbGVcbiAgICAgICAgY2FzZSAnbW9iaWxlJzogcmV0dXJuIChcbiAgICAgICAgICB0aGlzLmlzTW9iaWxlIHx8XG4gICAgICAgICAgKHRoaXMuaXNPdmVyZmxvd2luZyB8fCBNYXRoLmFicyh0aGlzLnNjcm9sbE9mZnNldCkgPiAwKVxuICAgICAgICApXG5cbiAgICAgICAgLy8gaHR0cHM6Ly9tYXRlcmlhbC5pby9jb21wb25lbnRzL3RhYnMjc2Nyb2xsYWJsZS10YWJzXG4gICAgICAgIC8vIEFsd2F5cyBzaG93IGFycm93cyB3aGVuXG4gICAgICAgIC8vIG92ZXJmbG93ZWQgb24gZGVza3RvcFxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gKFxuICAgICAgICAgICF0aGlzLmlzTW9iaWxlICYmXG4gICAgICAgICAgKHRoaXMuaXNPdmVyZmxvd2luZyB8fCBNYXRoLmFicyh0aGlzLnNjcm9sbE9mZnNldCkgPiAwKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSxcbiAgICBoYXNOZXh0ICgpOiBib29sZWFuIHtcbiAgICAgIGlmICghdGhpcy5oYXNBZmZpeGVzKSByZXR1cm4gZmFsc2VcblxuICAgICAgY29uc3QgeyBjb250ZW50LCB3cmFwcGVyIH0gPSB0aGlzLndpZHRoc1xuXG4gICAgICAvLyBDaGVjayBvbmUgc2Nyb2xsIGFoZWFkIHRvIGtub3cgdGhlIHdpZHRoIG9mIHJpZ2h0LW1vc3QgaXRlbVxuICAgICAgcmV0dXJuIGNvbnRlbnQgPiBNYXRoLmFicyh0aGlzLnNjcm9sbE9mZnNldCkgKyB3cmFwcGVyXG4gICAgfSxcbiAgICBoYXNQcmV2ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmhhc0FmZml4ZXMgJiYgdGhpcy5zY3JvbGxPZmZzZXQgIT09IDBcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgaW50ZXJuYWxWYWx1ZTogJ3NldFdpZHRocycsXG4gICAgLy8gV2hlbiBvdmVyZmxvdyBjaGFuZ2VzLCB0aGUgYXJyb3dzIGFsdGVyXG4gICAgLy8gdGhlIHdpZHRocyBvZiB0aGUgY29udGVudCBhbmQgd3JhcHBlclxuICAgIC8vIGFuZCBuZWVkIHRvIGJlIHJlY2FsY3VsYXRlZFxuICAgIGlzT3ZlcmZsb3dpbmc6ICdzZXRXaWR0aHMnLFxuICAgIHNjcm9sbE9mZnNldCAodmFsKSB7XG4gICAgICBpZiAodGhpcy4kdnVldGlmeS5ydGwpIHZhbCA9IC12YWxcblxuICAgICAgbGV0IHNjcm9sbCA9XG4gICAgICAgIHZhbCA8PSAwXG4gICAgICAgICAgPyBiaWFzKC12YWwpXG4gICAgICAgICAgOiB2YWwgPiB0aGlzLndpZHRocy5jb250ZW50IC0gdGhpcy53aWR0aHMud3JhcHBlclxuICAgICAgICAgICAgPyAtKHRoaXMud2lkdGhzLmNvbnRlbnQgLSB0aGlzLndpZHRocy53cmFwcGVyKSArIGJpYXModGhpcy53aWR0aHMuY29udGVudCAtIHRoaXMud2lkdGhzLndyYXBwZXIgLSB2YWwpXG4gICAgICAgICAgICA6IC12YWxcblxuICAgICAgaWYgKHRoaXMuJHZ1ZXRpZnkucnRsKSBzY3JvbGwgPSAtc2Nyb2xsXG5cbiAgICAgIHRoaXMuJHJlZnMuY29udGVudC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCgke3Njcm9sbH1weClgXG4gICAgfSxcbiAgfSxcblxuICBtb3VudGVkICgpIHtcbiAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3Qgb2JzID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSgpXG4gICAgICB9KVxuICAgICAgb2JzLm9ic2VydmUodGhpcy4kZWwpXG4gICAgICBvYnMub2JzZXJ2ZSh0aGlzLiRyZWZzLmNvbnRlbnQpXG4gICAgICB0aGlzLiRvbignaG9vazpkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICAgIG9icy5kaXNjb25uZWN0KClcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBpdGVtc0xlbmd0aCA9IDBcbiAgICAgIHRoaXMuJG9uKCdob29rOmJlZm9yZVVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgaXRlbXNMZW5ndGggPSAodGhpcy4kcmVmcy5jb250ZW50Py5jaGlsZHJlbiB8fCBbXSkubGVuZ3RoXG4gICAgICB9KVxuICAgICAgdGhpcy4kb24oJ2hvb2s6dXBkYXRlZCcsICgpID0+IHtcbiAgICAgICAgaWYgKGl0ZW1zTGVuZ3RoID09PSAodGhpcy4kcmVmcy5jb250ZW50Py5jaGlsZHJlbiB8fCBbXSkubGVuZ3RoKSByZXR1cm5cbiAgICAgICAgdGhpcy5zZXRXaWR0aHMoKVxuICAgICAgfSlcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIG9uU2Nyb2xsICgpIHtcbiAgICAgIHRoaXMuJHJlZnMud3JhcHBlci5zY3JvbGxMZWZ0ID0gMFxuICAgIH0sXG4gICAgb25Gb2N1c2luIChlOiBGb2N1c0V2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNPdmVyZmxvd2luZykgcmV0dXJuXG5cbiAgICAgIC8vIEZvY3VzZWQgZWxlbWVudCBpcyBsaWtlbHkgdG8gYmUgdGhlIHJvb3Qgb2YgYW4gaXRlbSwgc28gYVxuICAgICAgLy8gYnJlYWR0aC1maXJzdCBzZWFyY2ggd2lsbCBwcm9iYWJseSBmaW5kIGl0IGluIHRoZSBmaXJzdCBpdGVyYXRpb25cbiAgICAgIGZvciAoY29uc3QgZWwgb2YgY29tcG9zZWRQYXRoKGUpKSB7XG4gICAgICAgIGZvciAoY29uc3Qgdm0gb2YgdGhpcy5pdGVtcykge1xuICAgICAgICAgIGlmICh2bS4kZWwgPT09IGVsKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbE9mZnNldCA9IGNhbGN1bGF0ZVVwZGF0ZWRPZmZzZXQoXG4gICAgICAgICAgICAgIHZtLiRlbCBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgICAgdGhpcy53aWR0aHMsXG4gICAgICAgICAgICAgIHRoaXMuJHZ1ZXRpZnkucnRsLFxuICAgICAgICAgICAgICB0aGlzLnNjcm9sbE9mZnNldFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBBbHdheXMgZ2VuZXJhdGUgbmV4dCBmb3Igc2Nyb2xsYWJsZSBoaW50XG4gICAgZ2VuTmV4dCAoKTogVk5vZGUgfCBudWxsIHtcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLiRzY29wZWRTbG90cy5uZXh0XG4gICAgICAgID8gdGhpcy4kc2NvcGVkU2xvdHMubmV4dCh7fSlcbiAgICAgICAgOiB0aGlzLiRzbG90cy5uZXh0IHx8IHRoaXMuX19jYWNoZWROZXh0XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZS1ncm91cF9fbmV4dCcsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3Ytc2xpZGUtZ3JvdXBfX25leHQtLWRpc2FibGVkJzogIXRoaXMuaGFzTmV4dCxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljazogKCkgPT4gdGhpcy5vbkFmZml4Q2xpY2soJ25leHQnKSxcbiAgICAgICAgfSxcbiAgICAgICAga2V5OiAnbmV4dCcsXG4gICAgICB9LCBbc2xvdF0pXG4gICAgfSxcbiAgICBnZW5Db250ZW50ICgpOiBWTm9kZSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2xpZGUtZ3JvdXBfX2NvbnRlbnQnLFxuICAgICAgICByZWY6ICdjb250ZW50JyxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBmb2N1c2luOiB0aGlzLm9uRm9jdXNpbixcbiAgICAgICAgfSxcbiAgICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gICAgfSxcbiAgICBnZW5EYXRhICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3M6IHRoaXMuY2xhc3NlcyxcbiAgICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgICBuYW1lOiAncmVzaXplJyxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5vblJlc2l6ZSxcbiAgICAgICAgfV0sXG4gICAgICB9XG4gICAgfSxcbiAgICBnZW5JY29uIChsb2NhdGlvbjogJ3ByZXYnIHwgJ25leHQnKTogVk5vZGUgfCBudWxsIHtcbiAgICAgIGxldCBpY29uID0gbG9jYXRpb25cblxuICAgICAgaWYgKHRoaXMuJHZ1ZXRpZnkucnRsICYmIGxvY2F0aW9uID09PSAncHJldicpIHtcbiAgICAgICAgaWNvbiA9ICduZXh0J1xuICAgICAgfSBlbHNlIGlmICh0aGlzLiR2dWV0aWZ5LnJ0bCAmJiBsb2NhdGlvbiA9PT0gJ25leHQnKSB7XG4gICAgICAgIGljb24gPSAncHJldidcbiAgICAgIH1cblxuICAgICAgY29uc3QgdXBwZXJMb2NhdGlvbiA9IGAke2xvY2F0aW9uWzBdLnRvVXBwZXJDYXNlKCl9JHtsb2NhdGlvbi5zbGljZSgxKX1gXG4gICAgICBjb25zdCBoYXNBZmZpeCA9ICh0aGlzIGFzIGFueSlbYGhhcyR7dXBwZXJMb2NhdGlvbn1gXVxuXG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLnNob3dBcnJvd3MgJiZcbiAgICAgICAgIWhhc0FmZml4XG4gICAgICApIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgZGlzYWJsZWQ6ICFoYXNBZmZpeCxcbiAgICAgICAgfSxcbiAgICAgIH0sICh0aGlzIGFzIGFueSlbYCR7aWNvbn1JY29uYF0pXG4gICAgfSxcbiAgICAvLyBBbHdheXMgZ2VuZXJhdGUgcHJldiBmb3Igc2Nyb2xsYWJsZSBoaW50XG4gICAgZ2VuUHJldiAoKTogVk5vZGUgfCBudWxsIHtcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLiRzY29wZWRTbG90cy5wcmV2XG4gICAgICAgID8gdGhpcy4kc2NvcGVkU2xvdHMucHJldih7fSlcbiAgICAgICAgOiB0aGlzLiRzbG90cy5wcmV2IHx8IHRoaXMuX19jYWNoZWRQcmV2XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZS1ncm91cF9fcHJldicsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3Ytc2xpZGUtZ3JvdXBfX3ByZXYtLWRpc2FibGVkJzogIXRoaXMuaGFzUHJldixcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljazogKCkgPT4gdGhpcy5vbkFmZml4Q2xpY2soJ3ByZXYnKSxcbiAgICAgICAgfSxcbiAgICAgICAga2V5OiAncHJldicsXG4gICAgICB9LCBbc2xvdF0pXG4gICAgfSxcbiAgICBnZW5UcmFuc2l0aW9uIChsb2NhdGlvbjogJ3ByZXYnIHwgJ25leHQnKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRmFkZVRyYW5zaXRpb24sIFt0aGlzLmdlbkljb24obG9jYXRpb24pXSlcbiAgICB9LFxuICAgIGdlbldyYXBwZXIgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbGlkZS1ncm91cF9fd3JhcHBlcicsXG4gICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgbmFtZTogJ3RvdWNoJyxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgc3RhcnQ6IChlOiBUb3VjaEV2ZW50KSA9PiB0aGlzLm92ZXJmbG93Q2hlY2soZSwgdGhpcy5vblRvdWNoU3RhcnQpLFxuICAgICAgICAgICAgbW92ZTogKGU6IFRvdWNoRXZlbnQpID0+IHRoaXMub3ZlcmZsb3dDaGVjayhlLCB0aGlzLm9uVG91Y2hNb3ZlKSxcbiAgICAgICAgICAgIGVuZDogKGU6IFRvdWNoRXZlbnQpID0+IHRoaXMub3ZlcmZsb3dDaGVjayhlLCB0aGlzLm9uVG91Y2hFbmQpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH1dLFxuICAgICAgICByZWY6ICd3cmFwcGVyJyxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBzY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgIH0sXG4gICAgICB9LCBbdGhpcy5nZW5Db250ZW50KCldKVxuICAgIH0sXG4gICAgY2FsY3VsYXRlTmV3T2Zmc2V0IChkaXJlY3Rpb246ICdwcmV2JyB8ICduZXh0Jywgd2lkdGhzOiBXaWR0aHMsIHJ0bDogYm9vbGVhbiwgY3VycmVudFNjcm9sbE9mZnNldDogbnVtYmVyKSB7XG4gICAgICBjb25zdCBzaWduID0gcnRsID8gLTEgOiAxXG4gICAgICBjb25zdCBuZXdBYm9zbHV0ZU9mZnNldCA9IHNpZ24gKiBjdXJyZW50U2Nyb2xsT2Zmc2V0ICtcbiAgICAgICAgKGRpcmVjdGlvbiA9PT0gJ3ByZXYnID8gLTEgOiAxKSAqIHdpZHRocy53cmFwcGVyXG5cbiAgICAgIHJldHVybiBzaWduICogTWF0aC5tYXgoTWF0aC5taW4obmV3QWJvc2x1dGVPZmZzZXQsIHdpZHRocy5jb250ZW50IC0gd2lkdGhzLndyYXBwZXIpLCAwKVxuICAgIH0sXG4gICAgb25BZmZpeENsaWNrIChsb2NhdGlvbjogJ3ByZXYnIHwgJ25leHQnKSB7XG4gICAgICB0aGlzLiRlbWl0KGBjbGljazoke2xvY2F0aW9ufWApXG4gICAgICB0aGlzLnNjcm9sbFRvKGxvY2F0aW9uKVxuICAgIH0sXG4gICAgb25SZXNpemUgKCkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMuc2V0V2lkdGhzKClcbiAgICB9LFxuICAgIG9uVG91Y2hTdGFydCAoZTogVG91Y2hFdmVudCkge1xuICAgICAgY29uc3QgeyBjb250ZW50IH0gPSB0aGlzLiRyZWZzXG5cbiAgICAgIHRoaXMuc3RhcnRYID0gdGhpcy5zY3JvbGxPZmZzZXQgKyBlLnRvdWNoc3RhcnRYIGFzIG51bWJlclxuXG4gICAgICBjb250ZW50LnN0eWxlLnNldFByb3BlcnR5KCd0cmFuc2l0aW9uJywgJ25vbmUnKVxuICAgICAgY29udGVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnd2lsbENoYW5nZScsICd0cmFuc2Zvcm0nKVxuICAgIH0sXG4gICAgb25Ub3VjaE1vdmUgKGU6IFRvdWNoRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5jYW5Ub3VjaCkgcmV0dXJuXG5cbiAgICAgIGlmICghdGhpcy5pc1N3aXBpbmcpIHtcbiAgICAgICAgLy8gb25seSBjYWxjdWxhdGUgZGlzYWJsZVN3aXBlSG9yaXpvbnRhbCBkdXJpbmcgdGhlIGZpcnN0IG9uVG91Y2hNb3ZlIGludm9rZVxuICAgICAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgZGlzYWJsZVN3aXBlSG9yaXpvbnRhbCB2YWx1ZSBpcyBjb25zaXN0ZW50IGJldHdlZW4gb25Ub3VjaFN0YXJ0IGFuZCBvblRvdWNoRW5kXG4gICAgICAgIGNvbnN0IGRpZmZYID0gZS50b3VjaG1vdmVYIC0gZS50b3VjaHN0YXJ0WFxuICAgICAgICBjb25zdCBkaWZmWSA9IGUudG91Y2htb3ZlWSAtIGUudG91Y2hzdGFydFlcbiAgICAgICAgdGhpcy5pc1N3aXBpbmdIb3Jpem9udGFsID0gTWF0aC5hYnMoZGlmZlgpID4gTWF0aC5hYnMoZGlmZlkpXG4gICAgICAgIHRoaXMuaXNTd2lwaW5nID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc1N3aXBpbmdIb3Jpem9udGFsKSB7XG4gICAgICAgIC8vIHNsaWRpbmcgaG9yaXpvbnRhbGx5XG4gICAgICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gdGhpcy5zdGFydFggLSBlLnRvdWNobW92ZVhcbiAgICAgICAgLy8gdGVtcG9yYXJpbHkgZGlzYWJsZSB3aW5kb3cgdmVydGljYWwgc2Nyb2xsaW5nXG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJ1xuICAgICAgfVxuICAgIH0sXG4gICAgb25Ub3VjaEVuZCAoKSB7XG4gICAgICBpZiAoIXRoaXMuY2FuVG91Y2gpIHJldHVyblxuXG4gICAgICBjb25zdCB7IGNvbnRlbnQsIHdyYXBwZXIgfSA9IHRoaXMuJHJlZnNcbiAgICAgIGNvbnN0IG1heFNjcm9sbE9mZnNldCA9IGNvbnRlbnQuY2xpZW50V2lkdGggLSB3cmFwcGVyLmNsaWVudFdpZHRoXG5cbiAgICAgIGNvbnRlbnQuc3R5bGUuc2V0UHJvcGVydHkoJ3RyYW5zaXRpb24nLCBudWxsKVxuICAgICAgY29udGVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnd2lsbENoYW5nZScsIG51bGwpXG5cbiAgICAgIGlmICh0aGlzLiR2dWV0aWZ5LnJ0bCkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxPZmZzZXQgPiAwIHx8ICF0aGlzLmlzT3ZlcmZsb3dpbmcpIHtcbiAgICAgICAgICB0aGlzLnNjcm9sbE9mZnNldCA9IDBcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNjcm9sbE9mZnNldCA8PSAtbWF4U2Nyb2xsT2Zmc2V0KSB7XG4gICAgICAgICAgdGhpcy5zY3JvbGxPZmZzZXQgPSAtbWF4U2Nyb2xsT2Zmc2V0XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgIGlmICh0aGlzLnNjcm9sbE9mZnNldCA8IDAgfHwgIXRoaXMuaXNPdmVyZmxvd2luZykge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gMFxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2Nyb2xsT2Zmc2V0ID49IG1heFNjcm9sbE9mZnNldCkge1xuICAgICAgICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gbWF4U2Nyb2xsT2Zmc2V0XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5pc1N3aXBpbmcgPSBmYWxzZVxuICAgICAgLy8gcm9sbGJhY2sgd2hvbGUgcGFnZSBzY3JvbGxpbmcgdG8gZGVmYXVsdFxuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KCdvdmVyZmxvdy15JylcbiAgICB9LFxuICAgIG92ZXJmbG93Q2hlY2sgKGU6IFRvdWNoRXZlbnQsIGZuOiAoZTogVG91Y2hFdmVudCkgPT4gdm9pZCkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgdGhpcy5pc092ZXJmbG93aW5nICYmIGZuKGUpXG4gICAgfSxcbiAgICBzY3JvbGxJbnRvVmlldyAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyAoKSB7XG4gICAgICBpZiAoIXRoaXMuc2VsZWN0ZWRJdGVtICYmIHRoaXMuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGxhc3RJdGVtUG9zaXRpb24gPSB0aGlzLml0ZW1zW3RoaXMuaXRlbXMubGVuZ3RoIC0gMV0uJGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGNvbnN0IHdyYXBwZXJQb3NpdGlvbiA9IHRoaXMuJHJlZnMud3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAodGhpcy4kdnVldGlmeS5ydGwgJiYgd3JhcHBlclBvc2l0aW9uLnJpZ2h0IDwgbGFzdEl0ZW1Qb3NpdGlvbi5yaWdodCkgfHxcbiAgICAgICAgICAoIXRoaXMuJHZ1ZXRpZnkucnRsICYmIHdyYXBwZXJQb3NpdGlvbi5sZWZ0ID4gbGFzdEl0ZW1Qb3NpdGlvbi5sZWZ0KVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLnNjcm9sbFRvKCdwcmV2JylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0ZWRJdGVtKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9PT0gMCB8fFxuICAgICAgICAoIXRoaXMuY2VudGVyQWN0aXZlICYmICF0aGlzLmlzT3ZlcmZsb3dpbmcpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zY3JvbGxPZmZzZXQgPSAwXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY2VudGVyQWN0aXZlKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gY2FsY3VsYXRlQ2VudGVyZWRPZmZzZXQoXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0uJGVsIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgIHRoaXMud2lkdGhzLFxuICAgICAgICAgIHRoaXMuJHZ1ZXRpZnkucnRsXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc092ZXJmbG93aW5nKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gY2FsY3VsYXRlVXBkYXRlZE9mZnNldChcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbS4kZWwgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgdGhpcy53aWR0aHMsXG4gICAgICAgICAgdGhpcy4kdnVldGlmeS5ydGwsXG4gICAgICAgICAgdGhpcy5zY3JvbGxPZmZzZXRcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0sXG4gICAgc2Nyb2xsVG8gLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gKGxvY2F0aW9uOiAncHJldicgfCAnbmV4dCcpIHtcbiAgICAgIHRoaXMuc2Nyb2xsT2Zmc2V0ID0gdGhpcy5jYWxjdWxhdGVOZXdPZmZzZXQobG9jYXRpb24sIHtcbiAgICAgICAgLy8gRm9yY2UgcmVmbG93XG4gICAgICAgIGNvbnRlbnQ6IHRoaXMuJHJlZnMuY29udGVudCA/IHRoaXMuJHJlZnMuY29udGVudC5jbGllbnRXaWR0aCA6IDAsXG4gICAgICAgIHdyYXBwZXI6IHRoaXMuJHJlZnMud3JhcHBlciA/IHRoaXMuJHJlZnMud3JhcHBlci5jbGllbnRXaWR0aCA6IDAsXG4gICAgICB9LCB0aGlzLiR2dWV0aWZ5LnJ0bCwgdGhpcy5zY3JvbGxPZmZzZXQpXG4gICAgfSxcbiAgICBzZXRXaWR0aHMgKCkge1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuXG5cbiAgICAgICAgY29uc3QgeyBjb250ZW50LCB3cmFwcGVyIH0gPSB0aGlzLiRyZWZzXG5cbiAgICAgICAgdGhpcy53aWR0aHMgPSB7XG4gICAgICAgICAgY29udGVudDogY29udGVudCA/IGNvbnRlbnQuY2xpZW50V2lkdGggOiAwLFxuICAgICAgICAgIHdyYXBwZXI6IHdyYXBwZXIgPyB3cmFwcGVyLmNsaWVudFdpZHRoIDogMCxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWV0aWZ5anMvdnVldGlmeS9pc3N1ZXMvMTMyMTJcbiAgICAgICAgLy8gV2UgYWRkICsxIHRvIHRoZSB3cmFwcGVycyB3aWR0aCB0byBwcmV2ZW50IGFuIGlzc3VlIHdoZXJlIHRoZSBgY2xpZW50V2lkdGhgXG4gICAgICAgIC8vIGdldHMgY2FsY3VsYXRlZCB3cm9uZ2x5IGJ5IHRoZSBicm93c2VyIGlmIHVzaW5nIGEgZGlmZmVyZW50IHpvb20tbGV2ZWwuXG4gICAgICAgIHRoaXMuaXNPdmVyZmxvd2luZyA9IHRoaXMud2lkdGhzLndyYXBwZXIgKyAxIDwgdGhpcy53aWR0aHMuY29udGVudFxuXG4gICAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKVxuICAgICAgfSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICByZXR1cm4gaCgnZGl2JywgdGhpcy5nZW5EYXRhKCksIFtcbiAgICAgIHRoaXMuZ2VuUHJldigpLFxuICAgICAgdGhpcy5nZW5XcmFwcGVyKCksXG4gICAgICB0aGlzLmdlbk5leHQoKSxcbiAgICBdKVxuICB9LFxufSlcblxuZXhwb3J0IGRlZmF1bHQgQmFzZVNsaWRlR3JvdXAuZXh0ZW5kKHtcbiAgbmFtZTogJ3Ytc2xpZGUtZ3JvdXAnLFxuXG4gIHByb3ZpZGUgKCk6IG9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNsaWRlR3JvdXA6IHRoaXMsXG4gICAgfVxuICB9LFxufSlcbiJdfQ==
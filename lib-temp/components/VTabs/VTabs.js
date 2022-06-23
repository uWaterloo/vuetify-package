// Styles
import './VTabs.sass';
// Components
import VTabsBar from './VTabsBar';
import VTabsItems from './VTabsItems';
import VTabsSlider from './VTabsSlider';
// Mixins
import Colorable from '../../mixins/colorable';
import Proxyable from '../../mixins/proxyable';
import Themeable from '../../mixins/themeable';
// Directives
import Resize from '../../directives/resize';
// Utilities
import { convertToUnit } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Colorable, Proxyable, Themeable);
export default baseMixins.extend().extend({
    name: 'v-tabs',
    directives: {
        Resize,
    },
    props: {
        activeClass: {
            type: String,
            default: '',
        },
        alignWithTitle: Boolean,
        backgroundColor: String,
        centerActive: Boolean,
        centered: Boolean,
        fixedTabs: Boolean,
        grow: Boolean,
        height: {
            type: [Number, String],
            default: undefined,
        },
        hideSlider: Boolean,
        iconsAndText: Boolean,
        mobileBreakpoint: [String, Number],
        nextIcon: {
            type: String,
            default: '$next',
        },
        optional: Boolean,
        prevIcon: {
            type: String,
            default: '$prev',
        },
        right: Boolean,
        showArrows: [Boolean, String],
        sliderColor: String,
        sliderSize: {
            type: [Number, String],
            default: 2,
        },
        vertical: Boolean,
    },
    data() {
        return {
            resizeTimeout: 0,
            slider: {
                height: null,
                left: null,
                right: null,
                top: null,
                width: null,
            },
            transitionTime: 300,
        };
    },
    computed: {
        classes() {
            return {
                'v-tabs--align-with-title': this.alignWithTitle,
                'v-tabs--centered': this.centered,
                'v-tabs--fixed-tabs': this.fixedTabs,
                'v-tabs--grow': this.grow,
                'v-tabs--icons-and-text': this.iconsAndText,
                'v-tabs--right': this.right,
                'v-tabs--vertical': this.vertical,
                ...this.themeClasses,
            };
        },
        isReversed() {
            return this.$vuetify.rtl && this.vertical;
        },
        sliderStyles() {
            return {
                height: convertToUnit(this.slider.height),
                left: this.isReversed ? undefined : convertToUnit(this.slider.left),
                right: this.isReversed ? convertToUnit(this.slider.right) : undefined,
                top: this.vertical ? convertToUnit(this.slider.top) : undefined,
                transition: this.slider.left != null ? null : 'none',
                width: convertToUnit(this.slider.width),
            };
        },
        computedColor() {
            if (this.color)
                return this.color;
            else if (this.isDark && !this.appIsDark)
                return 'white';
            else
                return 'primary';
        },
    },
    watch: {
        alignWithTitle: 'callSlider',
        centered: 'callSlider',
        centerActive: 'callSlider',
        fixedTabs: 'callSlider',
        grow: 'callSlider',
        iconsAndText: 'callSlider',
        right: 'callSlider',
        showArrows: 'callSlider',
        vertical: 'callSlider',
        '$vuetify.application.left': 'onResize',
        '$vuetify.application.right': 'onResize',
        '$vuetify.rtl': 'onResize',
    },
    mounted() {
        if (typeof ResizeObserver !== 'undefined') {
            const obs = new ResizeObserver(() => {
                this.onResize();
            });
            obs.observe(this.$el);
            this.$on('hook:destroyed', () => {
                obs.disconnect();
            });
        }
        this.$nextTick(() => {
            window.setTimeout(this.callSlider, 30);
        });
    },
    methods: {
        callSlider() {
            if (this.hideSlider ||
                !this.$refs.items ||
                !this.$refs.items.selectedItems.length) {
                this.slider.width = 0;
                return false;
            }
            this.$nextTick(() => {
                // Give screen time to paint
                const activeTab = this.$refs.items.selectedItems[0];
                /* istanbul ignore if */
                if (!activeTab || !activeTab.$el) {
                    this.slider.width = 0;
                    this.slider.left = 0;
                    return;
                }
                const el = activeTab.$el;
                this.slider = {
                    height: !this.vertical ? Number(this.sliderSize) : el.scrollHeight,
                    left: this.vertical ? 0 : el.offsetLeft,
                    right: this.vertical ? 0 : el.offsetLeft + el.offsetWidth,
                    top: el.offsetTop,
                    width: this.vertical ? Number(this.sliderSize) : el.scrollWidth,
                };
            });
            return true;
        },
        genBar(items, slider) {
            const data = {
                style: {
                    height: convertToUnit(this.height),
                },
                props: {
                    activeClass: this.activeClass,
                    centerActive: this.centerActive,
                    dark: this.dark,
                    light: this.light,
                    mandatory: !this.optional,
                    mobileBreakpoint: this.mobileBreakpoint,
                    nextIcon: this.nextIcon,
                    prevIcon: this.prevIcon,
                    showArrows: this.showArrows,
                    value: this.internalValue,
                },
                on: {
                    'call:slider': this.callSlider,
                    change: (val) => {
                        this.internalValue = val;
                    },
                },
                ref: 'items',
            };
            this.setTextColor(this.computedColor, data);
            this.setBackgroundColor(this.backgroundColor, data);
            return this.$createElement(VTabsBar, data, [
                this.genSlider(slider),
                items,
            ]);
        },
        genItems(items, item) {
            // If user provides items
            // opt to use theirs
            if (items)
                return items;
            // If no tabs are provided
            // render nothing
            if (!item.length)
                return null;
            return this.$createElement(VTabsItems, {
                props: {
                    value: this.internalValue,
                },
                on: {
                    change: (val) => {
                        this.internalValue = val;
                    },
                },
            }, item);
        },
        genSlider(slider) {
            if (this.hideSlider)
                return null;
            if (!slider) {
                slider = this.$createElement(VTabsSlider, {
                    props: { color: this.sliderColor },
                });
            }
            return this.$createElement('div', {
                staticClass: 'v-tabs-slider-wrapper',
                style: this.sliderStyles,
            }, [slider]);
        },
        onResize() {
            if (this._isDestroyed)
                return;
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = window.setTimeout(this.callSlider, 0);
        },
        parseNodes() {
            let items = null;
            let slider = null;
            const item = [];
            const tab = [];
            const slot = this.$slots.default || [];
            const length = slot.length;
            for (let i = 0; i < length; i++) {
                const vnode = slot[i];
                if (vnode.componentOptions) {
                    switch (vnode.componentOptions.Ctor.options.name) {
                        case 'v-tabs-slider':
                            slider = vnode;
                            break;
                        case 'v-tabs-items':
                            items = vnode;
                            break;
                        case 'v-tab-item':
                            item.push(vnode);
                            break;
                        // case 'v-tab' - intentionally omitted
                        default: tab.push(vnode);
                    }
                }
                else {
                    tab.push(vnode);
                }
            }
            /**
             * tab: array of `v-tab`
             * slider: single `v-tabs-slider`
             * items: single `v-tabs-items`
             * item: array of `v-tab-item`
             */
            return { tab, slider, items, item };
        },
    },
    render(h) {
        const { tab, slider, items, item } = this.parseNodes();
        return h('div', {
            staticClass: 'v-tabs',
            class: this.classes,
            directives: [{
                    name: 'resize',
                    modifiers: { quiet: true },
                    value: this.onResize,
                }],
        }, [
            this.genBar(tab, slider),
            this.genItems(items, item),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRhYnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WVGFicy9WVGFicy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxjQUFjLENBQUE7QUFFckIsYUFBYTtBQUNiLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQTtBQUNqQyxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUE7QUFDckMsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFBO0FBRXZDLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUU5QyxhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0seUJBQXlCLENBQUE7QUFFNUMsWUFBWTtBQUNaLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUVsRCxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUt0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLFNBQVMsRUFDVCxTQUFTLEVBQ1QsU0FBUyxDQUNWLENBQUE7QUFRRCxlQUFlLFVBQVUsQ0FBQyxNQUFNLEVBQVcsQ0FBQyxNQUFNLENBQUM7SUFDakQsSUFBSSxFQUFFLFFBQVE7SUFFZCxVQUFVLEVBQUU7UUFDVixNQUFNO0tBQ1A7SUFFRCxLQUFLLEVBQUU7UUFDTCxXQUFXLEVBQUU7WUFDWCxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxFQUFFO1NBQ1o7UUFDRCxjQUFjLEVBQUUsT0FBTztRQUN2QixlQUFlLEVBQUUsTUFBTTtRQUN2QixZQUFZLEVBQUUsT0FBTztRQUNyQixRQUFRLEVBQUUsT0FBTztRQUNqQixTQUFTLEVBQUUsT0FBTztRQUNsQixJQUFJLEVBQUUsT0FBTztRQUNiLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxDQUFDLE1BQU0sRUFB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RjtJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUV0RCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZCxXQUFXLEVBQUUsUUFBUTtZQUNyQixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsVUFBVSxFQUFFLENBQUM7b0JBQ1gsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtvQkFDMUIsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRO2lCQUNyQixDQUFDO1NBQ0gsRUFBRTtZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQztZQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7U0FDM0IsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZUYWJzLnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWVGFic0JhciBmcm9tICcuL1ZUYWJzQmFyJ1xuaW1wb3J0IFZUYWJzSXRlbXMgZnJvbSAnLi9WVGFic0l0ZW1zJ1xuaW1wb3J0IFZUYWJzU2xpZGVyIGZyb20gJy4vVlRhYnNTbGlkZXInXG5cbi8vIE1peGluc1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IFByb3h5YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvcHJveHlhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgUmVzaXplIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvcmVzaXplJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGNvbnZlcnRUb1VuaXQgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5pbXBvcnQgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi8uLi8uLi91dGlsL21peGlucydcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZS90eXBlcydcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgQ29sb3JhYmxlLFxuICBQcm94eWFibGUsXG4gIFRoZW1lYWJsZVxuKVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEV4dHJhY3RWdWU8dHlwZW9mIGJhc2VNaXhpbnM+IHtcbiAgJHJlZnM6IHtcbiAgICBpdGVtczogSW5zdGFuY2VUeXBlPHR5cGVvZiBWVGFic0Jhcj5cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZDxvcHRpb25zPigpLmV4dGVuZCh7XG4gIG5hbWU6ICd2LXRhYnMnLFxuXG4gIGRpcmVjdGl2ZXM6IHtcbiAgICBSZXNpemUsXG4gIH0sXG5cbiAgcHJvcHM6IHtcbiAgICBhY3RpdmVDbGFzczoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJycsXG4gICAgfSxcbiAgICBhbGlnbldpdGhUaXRsZTogQm9vbGVhbixcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IFN0cmluZyxcbiAgICBjZW50ZXJBY3RpdmU6IEJvb2xlYW4sXG4gICAgY2VudGVyZWQ6IEJvb2xlYW4sXG4gICAgZml4ZWRUYWJzOiBCb29sZWFuLFxuICAgIGdyb3c6IEJvb2xlYW4sXG4gICAgaGVpZ2h0OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgaGlkZVNsaWRlcjogQm9vbGVhbixcbiAgICBpY29uc0FuZFRleHQ6IEJvb2xlYW4sXG4gICAgbW9iaWxlQnJlYWtwb2ludDogW1N0cmluZywgTnVtYmVyXSxcbiAgICBuZXh0SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRuZXh0JyxcbiAgICB9LFxuICAgIG9wdGlvbmFsOiBCb29sZWFuLFxuICAgIHByZXZJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHByZXYnLFxuICAgIH0sXG4gICAgcmlnaHQ6IEJvb2xlYW4sXG4gICAgc2hvd0Fycm93czogW0Jvb2xlYW4sIFN0cmluZ10sXG4gICAgc2xpZGVyQ29sb3I6IFN0cmluZyxcbiAgICBzbGlkZXJTaXplOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMixcbiAgICB9LFxuICAgIHZlcnRpY2FsOiBCb29sZWFuLFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXNpemVUaW1lb3V0OiAwLFxuICAgICAgc2xpZGVyOiB7XG4gICAgICAgIGhlaWdodDogbnVsbCBhcyBudWxsIHwgbnVtYmVyLFxuICAgICAgICBsZWZ0OiBudWxsIGFzIG51bGwgfCBudW1iZXIsXG4gICAgICAgIHJpZ2h0OiBudWxsIGFzIG51bGwgfCBudW1iZXIsXG4gICAgICAgIHRvcDogbnVsbCBhcyBudWxsIHwgbnVtYmVyLFxuICAgICAgICB3aWR0aDogbnVsbCBhcyBudWxsIHwgbnVtYmVyLFxuICAgICAgfSxcbiAgICAgIHRyYW5zaXRpb25UaW1lOiAzMDAsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXRhYnMtLWFsaWduLXdpdGgtdGl0bGUnOiB0aGlzLmFsaWduV2l0aFRpdGxlLFxuICAgICAgICAndi10YWJzLS1jZW50ZXJlZCc6IHRoaXMuY2VudGVyZWQsXG4gICAgICAgICd2LXRhYnMtLWZpeGVkLXRhYnMnOiB0aGlzLmZpeGVkVGFicyxcbiAgICAgICAgJ3YtdGFicy0tZ3Jvdyc6IHRoaXMuZ3JvdyxcbiAgICAgICAgJ3YtdGFicy0taWNvbnMtYW5kLXRleHQnOiB0aGlzLmljb25zQW5kVGV4dCxcbiAgICAgICAgJ3YtdGFicy0tcmlnaHQnOiB0aGlzLnJpZ2h0LFxuICAgICAgICAndi10YWJzLS12ZXJ0aWNhbCc6IHRoaXMudmVydGljYWwsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfVxuICAgIH0sXG4gICAgaXNSZXZlcnNlZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy4kdnVldGlmeS5ydGwgJiYgdGhpcy52ZXJ0aWNhbFxuICAgIH0sXG4gICAgc2xpZGVyU3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaGVpZ2h0OiBjb252ZXJ0VG9Vbml0KHRoaXMuc2xpZGVyLmhlaWdodCksXG4gICAgICAgIGxlZnQ6IHRoaXMuaXNSZXZlcnNlZCA/IHVuZGVmaW5lZCA6IGNvbnZlcnRUb1VuaXQodGhpcy5zbGlkZXIubGVmdCksXG4gICAgICAgIHJpZ2h0OiB0aGlzLmlzUmV2ZXJzZWQgPyBjb252ZXJ0VG9Vbml0KHRoaXMuc2xpZGVyLnJpZ2h0KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdG9wOiB0aGlzLnZlcnRpY2FsID8gY29udmVydFRvVW5pdCh0aGlzLnNsaWRlci50b3ApIDogdW5kZWZpbmVkLFxuICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLnNsaWRlci5sZWZ0ICE9IG51bGwgPyBudWxsIDogJ25vbmUnLFxuICAgICAgICB3aWR0aDogY29udmVydFRvVW5pdCh0aGlzLnNsaWRlci53aWR0aCksXG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZENvbG9yICgpOiBzdHJpbmcge1xuICAgICAgaWYgKHRoaXMuY29sb3IpIHJldHVybiB0aGlzLmNvbG9yXG4gICAgICBlbHNlIGlmICh0aGlzLmlzRGFyayAmJiAhdGhpcy5hcHBJc0RhcmspIHJldHVybiAnd2hpdGUnXG4gICAgICBlbHNlIHJldHVybiAncHJpbWFyeSdcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgYWxpZ25XaXRoVGl0bGU6ICdjYWxsU2xpZGVyJyxcbiAgICBjZW50ZXJlZDogJ2NhbGxTbGlkZXInLFxuICAgIGNlbnRlckFjdGl2ZTogJ2NhbGxTbGlkZXInLFxuICAgIGZpeGVkVGFiczogJ2NhbGxTbGlkZXInLFxuICAgIGdyb3c6ICdjYWxsU2xpZGVyJyxcbiAgICBpY29uc0FuZFRleHQ6ICdjYWxsU2xpZGVyJyxcbiAgICByaWdodDogJ2NhbGxTbGlkZXInLFxuICAgIHNob3dBcnJvd3M6ICdjYWxsU2xpZGVyJyxcbiAgICB2ZXJ0aWNhbDogJ2NhbGxTbGlkZXInLFxuICAgICckdnVldGlmeS5hcHBsaWNhdGlvbi5sZWZ0JzogJ29uUmVzaXplJyxcbiAgICAnJHZ1ZXRpZnkuYXBwbGljYXRpb24ucmlnaHQnOiAnb25SZXNpemUnLFxuICAgICckdnVldGlmeS5ydGwnOiAnb25SZXNpemUnLFxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCBvYnMgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICB0aGlzLm9uUmVzaXplKClcbiAgICAgIH0pXG4gICAgICBvYnMub2JzZXJ2ZSh0aGlzLiRlbClcbiAgICAgIHRoaXMuJG9uKCdob29rOmRlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgICAgb2JzLmRpc2Nvbm5lY3QoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLmNhbGxTbGlkZXIsIDMwKVxuICAgIH0pXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGNhbGxTbGlkZXIgKCkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmhpZGVTbGlkZXIgfHxcbiAgICAgICAgIXRoaXMuJHJlZnMuaXRlbXMgfHxcbiAgICAgICAgIXRoaXMuJHJlZnMuaXRlbXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGhcbiAgICAgICkge1xuICAgICAgICB0aGlzLnNsaWRlci53aWR0aCA9IDBcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgLy8gR2l2ZSBzY3JlZW4gdGltZSB0byBwYWludFxuICAgICAgICBjb25zdCBhY3RpdmVUYWIgPSB0aGlzLiRyZWZzLml0ZW1zLnNlbGVjdGVkSXRlbXNbMF1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICghYWN0aXZlVGFiIHx8ICFhY3RpdmVUYWIuJGVsKSB7XG4gICAgICAgICAgdGhpcy5zbGlkZXIud2lkdGggPSAwXG4gICAgICAgICAgdGhpcy5zbGlkZXIubGVmdCA9IDBcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbCA9IGFjdGl2ZVRhYi4kZWwgYXMgSFRNTEVsZW1lbnRcblxuICAgICAgICB0aGlzLnNsaWRlciA9IHtcbiAgICAgICAgICBoZWlnaHQ6ICF0aGlzLnZlcnRpY2FsID8gTnVtYmVyKHRoaXMuc2xpZGVyU2l6ZSkgOiBlbC5zY3JvbGxIZWlnaHQsXG4gICAgICAgICAgbGVmdDogdGhpcy52ZXJ0aWNhbCA/IDAgOiBlbC5vZmZzZXRMZWZ0LFxuICAgICAgICAgIHJpZ2h0OiB0aGlzLnZlcnRpY2FsID8gMCA6IGVsLm9mZnNldExlZnQgKyBlbC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICB0b3A6IGVsLm9mZnNldFRvcCxcbiAgICAgICAgICB3aWR0aDogdGhpcy52ZXJ0aWNhbCA/IE51bWJlcih0aGlzLnNsaWRlclNpemUpIDogZWwuc2Nyb2xsV2lkdGgsXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgICBnZW5CYXIgKGl0ZW1zOiBWTm9kZVtdLCBzbGlkZXI6IFZOb2RlIHwgbnVsbCkge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBoZWlnaHQ6IGNvbnZlcnRUb1VuaXQodGhpcy5oZWlnaHQpLFxuICAgICAgICB9LFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGFjdGl2ZUNsYXNzOiB0aGlzLmFjdGl2ZUNsYXNzLFxuICAgICAgICAgIGNlbnRlckFjdGl2ZTogdGhpcy5jZW50ZXJBY3RpdmUsXG4gICAgICAgICAgZGFyazogdGhpcy5kYXJrLFxuICAgICAgICAgIGxpZ2h0OiB0aGlzLmxpZ2h0LFxuICAgICAgICAgIG1hbmRhdG9yeTogIXRoaXMub3B0aW9uYWwsXG4gICAgICAgICAgbW9iaWxlQnJlYWtwb2ludDogdGhpcy5tb2JpbGVCcmVha3BvaW50LFxuICAgICAgICAgIG5leHRJY29uOiB0aGlzLm5leHRJY29uLFxuICAgICAgICAgIHByZXZJY29uOiB0aGlzLnByZXZJY29uLFxuICAgICAgICAgIHNob3dBcnJvd3M6IHRoaXMuc2hvd0Fycm93cyxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5pbnRlcm5hbFZhbHVlLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgICdjYWxsOnNsaWRlcic6IHRoaXMuY2FsbFNsaWRlcixcbiAgICAgICAgICBjaGFuZ2U6ICh2YWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlID0gdmFsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAnaXRlbXMnLFxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFRleHRDb2xvcih0aGlzLmNvbXB1dGVkQ29sb3IsIGRhdGEpXG4gICAgICB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmJhY2tncm91bmRDb2xvciwgZGF0YSlcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVlRhYnNCYXIsIGRhdGEsIFtcbiAgICAgICAgdGhpcy5nZW5TbGlkZXIoc2xpZGVyKSxcbiAgICAgICAgaXRlbXMsXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuSXRlbXMgKGl0ZW1zOiBWTm9kZSB8IG51bGwsIGl0ZW06IFZOb2RlW10pIHtcbiAgICAgIC8vIElmIHVzZXIgcHJvdmlkZXMgaXRlbXNcbiAgICAgIC8vIG9wdCB0byB1c2UgdGhlaXJzXG4gICAgICBpZiAoaXRlbXMpIHJldHVybiBpdGVtc1xuXG4gICAgICAvLyBJZiBubyB0YWJzIGFyZSBwcm92aWRlZFxuICAgICAgLy8gcmVuZGVyIG5vdGhpbmdcbiAgICAgIGlmICghaXRlbS5sZW5ndGgpIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZUYWJzSXRlbXMsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5pbnRlcm5hbFZhbHVlLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNoYW5nZTogKHZhbDogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsVmFsdWUgPSB2YWxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSwgaXRlbSlcbiAgICB9LFxuICAgIGdlblNsaWRlciAoc2xpZGVyOiBWTm9kZSB8IG51bGwpIHtcbiAgICAgIGlmICh0aGlzLmhpZGVTbGlkZXIpIHJldHVybiBudWxsXG5cbiAgICAgIGlmICghc2xpZGVyKSB7XG4gICAgICAgIHNsaWRlciA9IHRoaXMuJGNyZWF0ZUVsZW1lbnQoVlRhYnNTbGlkZXIsIHtcbiAgICAgICAgICBwcm9wczogeyBjb2xvcjogdGhpcy5zbGlkZXJDb2xvciB9LFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtdGFicy1zbGlkZXItd3JhcHBlcicsXG4gICAgICAgIHN0eWxlOiB0aGlzLnNsaWRlclN0eWxlcyxcbiAgICAgIH0sIFtzbGlkZXJdKVxuICAgIH0sXG4gICAgb25SZXNpemUgKCkge1xuICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm5cblxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVzaXplVGltZW91dClcbiAgICAgIHRoaXMucmVzaXplVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuY2FsbFNsaWRlciwgMClcbiAgICB9LFxuICAgIHBhcnNlTm9kZXMgKCkge1xuICAgICAgbGV0IGl0ZW1zID0gbnVsbFxuICAgICAgbGV0IHNsaWRlciA9IG51bGxcbiAgICAgIGNvbnN0IGl0ZW0gPSBbXVxuICAgICAgY29uc3QgdGFiID0gW11cbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLiRzbG90cy5kZWZhdWx0IHx8IFtdXG4gICAgICBjb25zdCBsZW5ndGggPSBzbG90Lmxlbmd0aFxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHZub2RlID0gc2xvdFtpXVxuXG4gICAgICAgIGlmICh2bm9kZS5jb21wb25lbnRPcHRpb25zKSB7XG4gICAgICAgICAgc3dpdGNoICh2bm9kZS5jb21wb25lbnRPcHRpb25zLkN0b3Iub3B0aW9ucy5uYW1lKSB7XG4gICAgICAgICAgICBjYXNlICd2LXRhYnMtc2xpZGVyJzogc2xpZGVyID0gdm5vZGVcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgJ3YtdGFicy1pdGVtcyc6IGl0ZW1zID0gdm5vZGVcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgJ3YtdGFiLWl0ZW0nOiBpdGVtLnB1c2godm5vZGUpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAvLyBjYXNlICd2LXRhYicgLSBpbnRlbnRpb25hbGx5IG9taXR0ZWRcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRhYi5wdXNoKHZub2RlKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YWIucHVzaCh2bm9kZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIHRhYjogYXJyYXkgb2YgYHYtdGFiYFxuICAgICAgICogc2xpZGVyOiBzaW5nbGUgYHYtdGFicy1zbGlkZXJgXG4gICAgICAgKiBpdGVtczogc2luZ2xlIGB2LXRhYnMtaXRlbXNgXG4gICAgICAgKiBpdGVtOiBhcnJheSBvZiBgdi10YWItaXRlbWBcbiAgICAgICAqL1xuICAgICAgcmV0dXJuIHsgdGFiLCBzbGlkZXIsIGl0ZW1zLCBpdGVtIH1cbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCB7IHRhYiwgc2xpZGVyLCBpdGVtcywgaXRlbSB9ID0gdGhpcy5wYXJzZU5vZGVzKClcblxuICAgIHJldHVybiBoKCdkaXYnLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtdGFicycsXG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgbmFtZTogJ3Jlc2l6ZScsXG4gICAgICAgIG1vZGlmaWVyczogeyBxdWlldDogdHJ1ZSB9LFxuICAgICAgICB2YWx1ZTogdGhpcy5vblJlc2l6ZSxcbiAgICAgIH1dLFxuICAgIH0sIFtcbiAgICAgIHRoaXMuZ2VuQmFyKHRhYiwgc2xpZGVyKSxcbiAgICAgIHRoaXMuZ2VuSXRlbXMoaXRlbXMsIGl0ZW0pLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
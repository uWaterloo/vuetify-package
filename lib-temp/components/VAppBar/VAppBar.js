// Styles
import './VAppBar.sass';
// Extensions
import VToolbar from '../VToolbar/VToolbar';
// Directives
import Scroll from '../../directives/scroll';
// Mixins
import Applicationable from '../../mixins/applicationable';
import Scrollable from '../../mixins/scrollable';
import SSRBootable from '../../mixins/ssr-bootable';
import Toggleable from '../../mixins/toggleable';
// Utilities
import { convertToUnit } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(VToolbar, Scrollable, SSRBootable, Toggleable, Applicationable('top', [
    'clippedLeft',
    'clippedRight',
    'computedHeight',
    'invertedScroll',
    'isExtended',
    'isProminent',
    'value',
]));
/* @vue/component */
export default baseMixins.extend({
    name: 'v-app-bar',
    directives: { Scroll },
    provide() {
        return { VAppBar: this };
    },
    props: {
        clippedLeft: Boolean,
        clippedRight: Boolean,
        collapseOnScroll: Boolean,
        elevateOnScroll: Boolean,
        fadeImgOnScroll: Boolean,
        hideOnScroll: Boolean,
        invertedScroll: Boolean,
        scrollOffScreen: Boolean,
        shrinkOnScroll: Boolean,
        value: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isActive: this.value,
        };
    },
    computed: {
        applicationProperty() {
            return !this.bottom ? 'top' : 'bottom';
        },
        canScroll() {
            return (Scrollable.options.computed.canScroll.call(this) &&
                (this.invertedScroll ||
                    this.elevateOnScroll ||
                    this.hideOnScroll ||
                    this.collapseOnScroll ||
                    this.isBooted ||
                    // If falsy, user has provided an
                    // explicit value which should
                    // overwrite anything we do
                    !this.value));
        },
        classes() {
            return {
                ...VToolbar.options.computed.classes.call(this),
                'v-toolbar--collapse': this.collapse || this.collapseOnScroll,
                'v-app-bar': true,
                'v-app-bar--clipped': this.clippedLeft || this.clippedRight,
                'v-app-bar--fade-img-on-scroll': this.fadeImgOnScroll,
                'v-app-bar--elevate-on-scroll': this.elevateOnScroll,
                'v-app-bar--fixed': !this.absolute && (this.app || this.fixed),
                'v-app-bar--hide-shadow': this.hideShadow,
                'v-app-bar--is-scrolled': this.currentScroll > 0,
                'v-app-bar--shrink-on-scroll': this.shrinkOnScroll,
            };
        },
        scrollRatio() {
            const threshold = this.computedScrollThreshold;
            return Math.max((threshold - this.currentScroll) / threshold, 0);
        },
        computedContentHeight() {
            if (!this.shrinkOnScroll)
                return VToolbar.options.computed.computedContentHeight.call(this);
            const min = this.dense ? 48 : 56;
            const max = this.computedOriginalHeight;
            return min + (max - min) * this.scrollRatio;
        },
        computedFontSize() {
            if (!this.isProminent)
                return undefined;
            const min = 1.25;
            const max = 1.5;
            return min + (max - min) * this.scrollRatio;
        },
        computedLeft() {
            if (!this.app || this.clippedLeft)
                return 0;
            return this.$vuetify.application.left;
        },
        computedMarginTop() {
            if (!this.app)
                return 0;
            return this.$vuetify.application.bar;
        },
        computedOpacity() {
            if (!this.fadeImgOnScroll)
                return undefined;
            return this.scrollRatio;
        },
        computedOriginalHeight() {
            let height = VToolbar.options.computed.computedContentHeight.call(this);
            if (this.isExtended)
                height += parseInt(this.extensionHeight);
            return height;
        },
        computedRight() {
            if (!this.app || this.clippedRight)
                return 0;
            return this.$vuetify.application.right;
        },
        computedScrollThreshold() {
            if (this.scrollThreshold)
                return Number(this.scrollThreshold);
            return this.computedOriginalHeight - (this.dense ? 48 : 56);
        },
        computedTransform() {
            if (!this.canScroll ||
                (this.elevateOnScroll && this.currentScroll === 0 && this.isActive))
                return 0;
            if (this.isActive)
                return 0;
            const scrollOffScreen = this.scrollOffScreen
                ? this.computedHeight
                : this.computedContentHeight;
            return this.bottom ? scrollOffScreen : -scrollOffScreen;
        },
        hideShadow() {
            if (this.elevateOnScroll && this.isExtended) {
                return this.currentScroll < this.computedScrollThreshold;
            }
            if (this.elevateOnScroll) {
                return this.currentScroll === 0 ||
                    this.computedTransform < 0;
            }
            return (!this.isExtended ||
                this.scrollOffScreen) && this.computedTransform !== 0;
        },
        isCollapsed() {
            if (!this.collapseOnScroll) {
                return VToolbar.options.computed.isCollapsed.call(this);
            }
            return this.currentScroll > 0;
        },
        isProminent() {
            return (VToolbar.options.computed.isProminent.call(this) ||
                this.shrinkOnScroll);
        },
        styles() {
            return {
                ...VToolbar.options.computed.styles.call(this),
                fontSize: convertToUnit(this.computedFontSize, 'rem'),
                marginTop: convertToUnit(this.computedMarginTop),
                transform: `translateY(${convertToUnit(this.computedTransform)})`,
                left: convertToUnit(this.computedLeft),
                right: convertToUnit(this.computedRight),
            };
        },
    },
    watch: {
        canScroll: 'onScroll',
        computedTransform() {
            // Normally we do not want the v-app-bar
            // to update the application top value
            // to avoid screen jump. However, in
            // this situation, we must so that
            // the clipped drawer can update
            // its top value when scrolled
            if (!this.canScroll ||
                (!this.clippedLeft && !this.clippedRight))
                return;
            this.callUpdate();
        },
        invertedScroll(val) {
            this.isActive = !val || this.currentScroll !== 0;
        },
        hideOnScroll(val) {
            this.isActive = !val || this.currentScroll < this.computedScrollThreshold;
        },
    },
    created() {
        if (this.invertedScroll)
            this.isActive = false;
    },
    methods: {
        genBackground() {
            const render = VToolbar.options.methods.genBackground.call(this);
            render.data = this._b(render.data || {}, render.tag, {
                style: { opacity: this.computedOpacity },
            });
            return render;
        },
        updateApplication() {
            return this.invertedScroll
                ? 0
                : this.computedHeight + this.computedTransform;
        },
        thresholdMet() {
            if (this.invertedScroll) {
                this.isActive = this.currentScroll > this.computedScrollThreshold;
                return;
            }
            if (this.hideOnScroll) {
                this.isActive = this.isScrollingUp ||
                    this.currentScroll < this.computedScrollThreshold;
            }
            if (this.currentThreshold < this.computedScrollThreshold)
                return;
            this.savedScroll = this.currentScroll;
        },
    },
    render(h) {
        const render = VToolbar.options.render.call(this, h);
        render.data = render.data || {};
        if (this.canScroll) {
            render.data.directives = render.data.directives || [];
            render.data.directives.push({
                arg: this.scrollTarget,
                name: 'scroll',
                value: this.onScroll,
            });
        }
        return render;
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFwcEJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZBcHBCYXIvVkFwcEJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxnQkFBZ0IsQ0FBQTtBQUV2QixhQUFhO0FBQ2IsT0FBTyxRQUFRLE1BQU0sc0JBQXNCLENBQUE7QUFFM0MsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLFNBQVM7QUFDVCxPQUFPLGVBQWUsTUFBTSw4QkFBOEIsQ0FBQTtBQUMxRCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFdBQVcsTUFBTSwyQkFBMkIsQ0FBQTtBQUNuRCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUVoRCxZQUFZO0FBQ1osT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ2xELE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBS3RDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsUUFBUSxFQUNSLFVBQVUsRUFDVixXQUFXLEVBQ1gsVUFBVSxFQUNWLGVBQWUsQ0FBQyxLQUFLLEVBQUU7SUFDckIsYUFBYTtJQUNiLGNBQWM7SUFDZCxnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLFlBQVk7SUFDWixhQUFhO0lBQ2IsT0FBTztDQUNSLENBQUMsQ0FDSCxDQUFBO0FBRUQsb0JBQW9CO0FBQ3BCLGVBQWUsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUMvQixJQUFJLEVBQUUsV0FBVztJQUVqQixVQUFVLEVBQUUsRUFBRSxNQUFNLEVBQUU7SUFFdEIsT0FBTztRQUNMLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDMUIsQ0FBQztJQUVELEtBQUssRUFBRTtRQUNMLFdBQVcsRUFBRSxPQUFPO1FBQ3BCLFlBQVksRUFBRSxPQUFPO1FBQ3JCLGdCQUFnQixFQUFFLE9BQU87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QUFJLENBQUMsYUFBYTtvQkFDaEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUE7YUFDcEQ7WUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCO2dCQUFFLE9BQU07WUFFaEUsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFBO1FBQ3ZDLENBQUM7S0FDRjtJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUVwRCxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFBO1FBRS9CLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUE7WUFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUMxQixHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVk7Z0JBQ3RCLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUTthQUNyQixDQUFDLENBQUE7U0FDSDtRQUVELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZBcHBCYXIuc2FzcydcblxuLy8gRXh0ZW5zaW9uc1xuaW1wb3J0IFZUb29sYmFyIGZyb20gJy4uL1ZUb29sYmFyL1ZUb29sYmFyJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgU2Nyb2xsIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvc2Nyb2xsJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBBcHBsaWNhdGlvbmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2FwcGxpY2F0aW9uYWJsZSdcbmltcG9ydCBTY3JvbGxhYmxlIGZyb20gJy4uLy4uL21peGlucy9zY3JvbGxhYmxlJ1xuaW1wb3J0IFNTUkJvb3RhYmxlIGZyb20gJy4uLy4uL21peGlucy9zc3ItYm9vdGFibGUnXG5pbXBvcnQgVG9nZ2xlYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdG9nZ2xlYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAndnVlJ1xuXG5jb25zdCBiYXNlTWl4aW5zID0gbWl4aW5zKFxuICBWVG9vbGJhcixcbiAgU2Nyb2xsYWJsZSxcbiAgU1NSQm9vdGFibGUsXG4gIFRvZ2dsZWFibGUsXG4gIEFwcGxpY2F0aW9uYWJsZSgndG9wJywgW1xuICAgICdjbGlwcGVkTGVmdCcsXG4gICAgJ2NsaXBwZWRSaWdodCcsXG4gICAgJ2NvbXB1dGVkSGVpZ2h0JyxcbiAgICAnaW52ZXJ0ZWRTY3JvbGwnLFxuICAgICdpc0V4dGVuZGVkJyxcbiAgICAnaXNQcm9taW5lbnQnLFxuICAgICd2YWx1ZScsXG4gIF0pXG4pXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWFwcC1iYXInLFxuXG4gIGRpcmVjdGl2ZXM6IHsgU2Nyb2xsIH0sXG5cbiAgcHJvdmlkZSAoKTogb2JqZWN0IHtcbiAgICByZXR1cm4geyBWQXBwQmFyOiB0aGlzIH1cbiAgfSxcblxuICBwcm9wczoge1xuICAgIGNsaXBwZWRMZWZ0OiBCb29sZWFuLFxuICAgIGNsaXBwZWRSaWdodDogQm9vbGVhbixcbiAgICBjb2xsYXBzZU9uU2Nyb2xsOiBCb29sZWFuLFxuICAgIGVsZXZhdGVPblNjcm9sbDogQm9vbGVhbixcbiAgICBmYWRlSW1nT25TY3JvbGw6IEJvb2xlYW4sXG4gICAgaGlkZU9uU2Nyb2xsOiBCb29sZWFuLFxuICAgIGludmVydGVkU2Nyb2xsOiBCb29sZWFuLFxuICAgIHNjcm9sbE9mZlNjcmVlbjogQm9vbGVhbixcbiAgICBzaHJpbmtPblNjcm9sbDogQm9vbGVhbixcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNBY3RpdmU6IHRoaXMudmFsdWUsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgYXBwbGljYXRpb25Qcm9wZXJ0eSAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAhdGhpcy5ib3R0b20gPyAndG9wJyA6ICdib3R0b20nXG4gICAgfSxcbiAgICBjYW5TY3JvbGwgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgU2Nyb2xsYWJsZS5vcHRpb25zLmNvbXB1dGVkLmNhblNjcm9sbC5jYWxsKHRoaXMpICYmXG4gICAgICAgIChcbiAgICAgICAgICB0aGlzLmludmVydGVkU2Nyb2xsIHx8XG4gICAgICAgICAgdGhpcy5lbGV2YXRlT25TY3JvbGwgfHxcbiAgICAgICAgICB0aGlzLmhpZGVPblNjcm9sbCB8fFxuICAgICAgICAgIHRoaXMuY29sbGFwc2VPblNjcm9sbCB8fFxuICAgICAgICAgIHRoaXMuaXNCb290ZWQgfHxcbiAgICAgICAgICAvLyBJZiBmYWxzeSwgdXNlciBoYXMgcHJvdmlkZWQgYW5cbiAgICAgICAgICAvLyBleHBsaWNpdCB2YWx1ZSB3aGljaCBzaG91bGRcbiAgICAgICAgICAvLyBvdmVyd3JpdGUgYW55dGhpbmcgd2UgZG9cbiAgICAgICAgICAhdGhpcy52YWx1ZVxuICAgICAgICApXG4gICAgICApXG4gICAgfSxcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uVlRvb2xiYXIub3B0aW9ucy5jb21wdXRlZC5jbGFzc2VzLmNhbGwodGhpcyksXG4gICAgICAgICd2LXRvb2xiYXItLWNvbGxhcHNlJzogdGhpcy5jb2xsYXBzZSB8fCB0aGlzLmNvbGxhcHNlT25TY3JvbGwsXG4gICAgICAgICd2LWFwcC1iYXInOiB0cnVlLFxuICAgICAgICAndi1hcHAtYmFyLS1jbGlwcGVkJzogdGhpcy5jbGlwcGVkTGVmdCB8fCB0aGlzLmNsaXBwZWRSaWdodCxcbiAgICAgICAgJ3YtYXBwLWJhci0tZmFkZS1pbWctb24tc2Nyb2xsJzogdGhpcy5mYWRlSW1nT25TY3JvbGwsXG4gICAgICAgICd2LWFwcC1iYXItLWVsZXZhdGUtb24tc2Nyb2xsJzogdGhpcy5lbGV2YXRlT25TY3JvbGwsXG4gICAgICAgICd2LWFwcC1iYXItLWZpeGVkJzogIXRoaXMuYWJzb2x1dGUgJiYgKHRoaXMuYXBwIHx8IHRoaXMuZml4ZWQpLFxuICAgICAgICAndi1hcHAtYmFyLS1oaWRlLXNoYWRvdyc6IHRoaXMuaGlkZVNoYWRvdyxcbiAgICAgICAgJ3YtYXBwLWJhci0taXMtc2Nyb2xsZWQnOiB0aGlzLmN1cnJlbnRTY3JvbGwgPiAwLFxuICAgICAgICAndi1hcHAtYmFyLS1zaHJpbmstb24tc2Nyb2xsJzogdGhpcy5zaHJpbmtPblNjcm9sbCxcbiAgICAgIH1cbiAgICB9LFxuICAgIHNjcm9sbFJhdGlvICgpOiBudW1iZXIge1xuICAgICAgY29uc3QgdGhyZXNob2xkID0gdGhpcy5jb21wdXRlZFNjcm9sbFRocmVzaG9sZFxuICAgICAgcmV0dXJuIE1hdGgubWF4KCh0aHJlc2hvbGQgLSB0aGlzLmN1cnJlbnRTY3JvbGwpIC8gdGhyZXNob2xkLCAwKVxuICAgIH0sXG4gICAgY29tcHV0ZWRDb250ZW50SGVpZ2h0ICgpOiBudW1iZXIge1xuICAgICAgaWYgKCF0aGlzLnNocmlua09uU2Nyb2xsKSByZXR1cm4gVlRvb2xiYXIub3B0aW9ucy5jb21wdXRlZC5jb21wdXRlZENvbnRlbnRIZWlnaHQuY2FsbCh0aGlzKVxuXG4gICAgICBjb25zdCBtaW4gPSB0aGlzLmRlbnNlID8gNDggOiA1NlxuICAgICAgY29uc3QgbWF4ID0gdGhpcy5jb21wdXRlZE9yaWdpbmFsSGVpZ2h0XG5cbiAgICAgIHJldHVybiBtaW4gKyAobWF4IC0gbWluKSAqIHRoaXMuc2Nyb2xsUmF0aW9cbiAgICB9LFxuICAgIGNvbXB1dGVkRm9udFNpemUgKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAoIXRoaXMuaXNQcm9taW5lbnQpIHJldHVybiB1bmRlZmluZWRcblxuICAgICAgY29uc3QgbWluID0gMS4yNVxuICAgICAgY29uc3QgbWF4ID0gMS41XG5cbiAgICAgIHJldHVybiBtaW4gKyAobWF4IC0gbWluKSAqIHRoaXMuc2Nyb2xsUmF0aW9cbiAgICB9LFxuICAgIGNvbXB1dGVkTGVmdCAoKTogbnVtYmVyIHtcbiAgICAgIGlmICghdGhpcy5hcHAgfHwgdGhpcy5jbGlwcGVkTGVmdCkgcmV0dXJuIDBcblxuICAgICAgcmV0dXJuIHRoaXMuJHZ1ZXRpZnkuYXBwbGljYXRpb24ubGVmdFxuICAgIH0sXG4gICAgY29tcHV0ZWRNYXJnaW5Ub3AgKCk6IG51bWJlciB7XG4gICAgICBpZiAoIXRoaXMuYXBwKSByZXR1cm4gMFxuXG4gICAgICByZXR1cm4gdGhpcy4kdnVldGlmeS5hcHBsaWNhdGlvbi5iYXJcbiAgICB9LFxuICAgIGNvbXB1dGVkT3BhY2l0eSAoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICghdGhpcy5mYWRlSW1nT25TY3JvbGwpIHJldHVybiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsUmF0aW9cbiAgICB9LFxuICAgIGNvbXB1dGVkT3JpZ2luYWxIZWlnaHQgKCk6IG51bWJlciB7XG4gICAgICBsZXQgaGVpZ2h0ID0gVlRvb2xiYXIub3B0aW9ucy5jb21wdXRlZC5jb21wdXRlZENvbnRlbnRIZWlnaHQuY2FsbCh0aGlzKVxuICAgICAgaWYgKHRoaXMuaXNFeHRlbmRlZCkgaGVpZ2h0ICs9IHBhcnNlSW50KHRoaXMuZXh0ZW5zaW9uSGVpZ2h0KVxuICAgICAgcmV0dXJuIGhlaWdodFxuICAgIH0sXG4gICAgY29tcHV0ZWRSaWdodCAoKTogbnVtYmVyIHtcbiAgICAgIGlmICghdGhpcy5hcHAgfHwgdGhpcy5jbGlwcGVkUmlnaHQpIHJldHVybiAwXG5cbiAgICAgIHJldHVybiB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLnJpZ2h0XG4gICAgfSxcbiAgICBjb21wdXRlZFNjcm9sbFRocmVzaG9sZCAoKTogbnVtYmVyIHtcbiAgICAgIGlmICh0aGlzLnNjcm9sbFRocmVzaG9sZCkgcmV0dXJuIE51bWJlcih0aGlzLnNjcm9sbFRocmVzaG9sZClcblxuICAgICAgcmV0dXJuIHRoaXMuY29tcHV0ZWRPcmlnaW5hbEhlaWdodCAtICh0aGlzLmRlbnNlID8gNDggOiA1NilcbiAgICB9LFxuICAgIGNvbXB1dGVkVHJhbnNmb3JtICgpOiBudW1iZXIge1xuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5jYW5TY3JvbGwgfHxcbiAgICAgICAgKHRoaXMuZWxldmF0ZU9uU2Nyb2xsICYmIHRoaXMuY3VycmVudFNjcm9sbCA9PT0gMCAmJiB0aGlzLmlzQWN0aXZlKVxuICAgICAgKSByZXR1cm4gMFxuXG4gICAgICBpZiAodGhpcy5pc0FjdGl2ZSkgcmV0dXJuIDBcblxuICAgICAgY29uc3Qgc2Nyb2xsT2ZmU2NyZWVuID0gdGhpcy5zY3JvbGxPZmZTY3JlZW5cbiAgICAgICAgPyB0aGlzLmNvbXB1dGVkSGVpZ2h0XG4gICAgICAgIDogdGhpcy5jb21wdXRlZENvbnRlbnRIZWlnaHRcblxuICAgICAgcmV0dXJuIHRoaXMuYm90dG9tID8gc2Nyb2xsT2ZmU2NyZWVuIDogLXNjcm9sbE9mZlNjcmVlblxuICAgIH0sXG4gICAgaGlkZVNoYWRvdyAoKTogYm9vbGVhbiB7XG4gICAgICBpZiAodGhpcy5lbGV2YXRlT25TY3JvbGwgJiYgdGhpcy5pc0V4dGVuZGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTY3JvbGwgPCB0aGlzLmNvbXB1dGVkU2Nyb2xsVGhyZXNob2xkXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmVsZXZhdGVPblNjcm9sbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U2Nyb2xsID09PSAwIHx8XG4gICAgICAgICAgdGhpcy5jb21wdXRlZFRyYW5zZm9ybSA8IDBcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgIXRoaXMuaXNFeHRlbmRlZCB8fFxuICAgICAgICB0aGlzLnNjcm9sbE9mZlNjcmVlblxuICAgICAgKSAmJiB0aGlzLmNvbXB1dGVkVHJhbnNmb3JtICE9PSAwXG4gICAgfSxcbiAgICBpc0NvbGxhcHNlZCAoKTogYm9vbGVhbiB7XG4gICAgICBpZiAoIXRoaXMuY29sbGFwc2VPblNjcm9sbCkge1xuICAgICAgICByZXR1cm4gVlRvb2xiYXIub3B0aW9ucy5jb21wdXRlZC5pc0NvbGxhcHNlZC5jYWxsKHRoaXMpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTY3JvbGwgPiAwXG4gICAgfSxcbiAgICBpc1Byb21pbmVudCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBWVG9vbGJhci5vcHRpb25zLmNvbXB1dGVkLmlzUHJvbWluZW50LmNhbGwodGhpcykgfHxcbiAgICAgICAgdGhpcy5zaHJpbmtPblNjcm9sbFxuICAgICAgKVxuICAgIH0sXG4gICAgc3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uVlRvb2xiYXIub3B0aW9ucy5jb21wdXRlZC5zdHlsZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgZm9udFNpemU6IGNvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZEZvbnRTaXplLCAncmVtJyksXG4gICAgICAgIG1hcmdpblRvcDogY29udmVydFRvVW5pdCh0aGlzLmNvbXB1dGVkTWFyZ2luVG9wKSxcbiAgICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlWSgke2NvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZFRyYW5zZm9ybSl9KWAsXG4gICAgICAgIGxlZnQ6IGNvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZExlZnQpLFxuICAgICAgICByaWdodDogY29udmVydFRvVW5pdCh0aGlzLmNvbXB1dGVkUmlnaHQpLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBjYW5TY3JvbGw6ICdvblNjcm9sbCcsXG4gICAgY29tcHV0ZWRUcmFuc2Zvcm0gKCkge1xuICAgICAgLy8gTm9ybWFsbHkgd2UgZG8gbm90IHdhbnQgdGhlIHYtYXBwLWJhclxuICAgICAgLy8gdG8gdXBkYXRlIHRoZSBhcHBsaWNhdGlvbiB0b3AgdmFsdWVcbiAgICAgIC8vIHRvIGF2b2lkIHNjcmVlbiBqdW1wLiBIb3dldmVyLCBpblxuICAgICAgLy8gdGhpcyBzaXR1YXRpb24sIHdlIG11c3Qgc28gdGhhdFxuICAgICAgLy8gdGhlIGNsaXBwZWQgZHJhd2VyIGNhbiB1cGRhdGVcbiAgICAgIC8vIGl0cyB0b3AgdmFsdWUgd2hlbiBzY3JvbGxlZFxuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5jYW5TY3JvbGwgfHxcbiAgICAgICAgKCF0aGlzLmNsaXBwZWRMZWZ0ICYmICF0aGlzLmNsaXBwZWRSaWdodClcbiAgICAgICkgcmV0dXJuXG5cbiAgICAgIHRoaXMuY2FsbFVwZGF0ZSgpXG4gICAgfSxcbiAgICBpbnZlcnRlZFNjcm9sbCAodmFsOiBib29sZWFuKSB7XG4gICAgICB0aGlzLmlzQWN0aXZlID0gIXZhbCB8fCB0aGlzLmN1cnJlbnRTY3JvbGwgIT09IDBcbiAgICB9LFxuICAgIGhpZGVPblNjcm9sbCAodmFsOiBib29sZWFuKSB7XG4gICAgICB0aGlzLmlzQWN0aXZlID0gIXZhbCB8fCB0aGlzLmN1cnJlbnRTY3JvbGwgPCB0aGlzLmNvbXB1dGVkU2Nyb2xsVGhyZXNob2xkXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICBpZiAodGhpcy5pbnZlcnRlZFNjcm9sbCkgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkJhY2tncm91bmQgKCkge1xuICAgICAgY29uc3QgcmVuZGVyID0gVlRvb2xiYXIub3B0aW9ucy5tZXRob2RzLmdlbkJhY2tncm91bmQuY2FsbCh0aGlzKVxuXG4gICAgICByZW5kZXIuZGF0YSA9IHRoaXMuX2IocmVuZGVyLmRhdGEgfHwge30sIHJlbmRlci50YWchLCB7XG4gICAgICAgIHN0eWxlOiB7IG9wYWNpdHk6IHRoaXMuY29tcHV0ZWRPcGFjaXR5IH0sXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcmVuZGVyXG4gICAgfSxcbiAgICB1cGRhdGVBcHBsaWNhdGlvbiAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLmludmVydGVkU2Nyb2xsXG4gICAgICAgID8gMFxuICAgICAgICA6IHRoaXMuY29tcHV0ZWRIZWlnaHQgKyB0aGlzLmNvbXB1dGVkVHJhbnNmb3JtXG4gICAgfSxcbiAgICB0aHJlc2hvbGRNZXQgKCkge1xuICAgICAgaWYgKHRoaXMuaW52ZXJ0ZWRTY3JvbGwpIHtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRoaXMuY3VycmVudFNjcm9sbCA+IHRoaXMuY29tcHV0ZWRTY3JvbGxUaHJlc2hvbGRcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmhpZGVPblNjcm9sbCkge1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gdGhpcy5pc1Njcm9sbGluZ1VwIHx8XG4gICAgICAgICAgdGhpcy5jdXJyZW50U2Nyb2xsIDwgdGhpcy5jb21wdXRlZFNjcm9sbFRocmVzaG9sZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jdXJyZW50VGhyZXNob2xkIDwgdGhpcy5jb21wdXRlZFNjcm9sbFRocmVzaG9sZCkgcmV0dXJuXG5cbiAgICAgIHRoaXMuc2F2ZWRTY3JvbGwgPSB0aGlzLmN1cnJlbnRTY3JvbGxcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCByZW5kZXIgPSBWVG9vbGJhci5vcHRpb25zLnJlbmRlci5jYWxsKHRoaXMsIGgpXG5cbiAgICByZW5kZXIuZGF0YSA9IHJlbmRlci5kYXRhIHx8IHt9XG5cbiAgICBpZiAodGhpcy5jYW5TY3JvbGwpIHtcbiAgICAgIHJlbmRlci5kYXRhLmRpcmVjdGl2ZXMgPSByZW5kZXIuZGF0YS5kaXJlY3RpdmVzIHx8IFtdXG4gICAgICByZW5kZXIuZGF0YS5kaXJlY3RpdmVzLnB1c2goe1xuICAgICAgICBhcmc6IHRoaXMuc2Nyb2xsVGFyZ2V0LFxuICAgICAgICBuYW1lOiAnc2Nyb2xsJyxcbiAgICAgICAgdmFsdWU6IHRoaXMub25TY3JvbGwsXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiByZW5kZXJcbiAgfSxcbn0pXG4iXX0=
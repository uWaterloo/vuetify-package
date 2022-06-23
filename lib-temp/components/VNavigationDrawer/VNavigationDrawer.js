// Styles
import './VNavigationDrawer.sass';
// Components
import VImg from '../VImg/VImg';
// Mixins
import Applicationable from '../../mixins/applicationable';
import Colorable from '../../mixins/colorable';
import Dependent from '../../mixins/dependent';
import Mobile from '../../mixins/mobile';
import Overlayable from '../../mixins/overlayable';
import SSRBootable from '../../mixins/ssr-bootable';
import Themeable from '../../mixins/themeable';
// Directives
import ClickOutside from '../../directives/click-outside';
import Resize from '../../directives/resize';
import Touch from '../../directives/touch';
// Utilities
import { convertToUnit, getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Applicationable('left', [
    'isActive',
    'isMobile',
    'miniVariant',
    'expandOnHover',
    'permanent',
    'right',
    'temporary',
    'width',
]), Colorable, Dependent, Mobile, Overlayable, SSRBootable, Themeable);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-navigation-drawer',
    directives: {
        ClickOutside,
        Resize,
        Touch,
    },
    provide() {
        return {
            isInNav: this.tag === 'nav',
        };
    },
    props: {
        bottom: Boolean,
        clipped: Boolean,
        disableResizeWatcher: Boolean,
        disableRouteWatcher: Boolean,
        expandOnHover: Boolean,
        floating: Boolean,
        height: {
            type: [Number, String],
            default() {
                return this.app ? '100vh' : '100%';
            },
        },
        miniVariant: Boolean,
        miniVariantWidth: {
            type: [Number, String],
            default: 56,
        },
        permanent: Boolean,
        right: Boolean,
        src: {
            type: [String, Object],
            default: '',
        },
        stateless: Boolean,
        tag: {
            type: String,
            default() {
                return this.app ? 'nav' : 'aside';
            },
        },
        temporary: Boolean,
        touchless: Boolean,
        width: {
            type: [Number, String],
            default: 256,
        },
        value: null,
    },
    data: () => ({
        isMouseover: false,
        touchArea: {
            left: 0,
            right: 0,
        },
        stackMinZIndex: 6,
    }),
    computed: {
        /**
         * Used for setting an app value from a dynamic
         * property. Called from applicationable.js
         */
        applicationProperty() {
            return this.right ? 'right' : 'left';
        },
        classes() {
            return {
                'v-navigation-drawer': true,
                'v-navigation-drawer--absolute': this.absolute,
                'v-navigation-drawer--bottom': this.bottom,
                'v-navigation-drawer--clipped': this.clipped,
                'v-navigation-drawer--close': !this.isActive,
                'v-navigation-drawer--fixed': !this.absolute && (this.app || this.fixed),
                'v-navigation-drawer--floating': this.floating,
                'v-navigation-drawer--is-mobile': this.isMobile,
                'v-navigation-drawer--is-mouseover': this.isMouseover,
                'v-navigation-drawer--mini-variant': this.isMiniVariant,
                'v-navigation-drawer--custom-mini-variant': Number(this.miniVariantWidth) !== 56,
                'v-navigation-drawer--open': this.isActive,
                'v-navigation-drawer--open-on-hover': this.expandOnHover,
                'v-navigation-drawer--right': this.right,
                'v-navigation-drawer--temporary': this.temporary,
                ...this.themeClasses,
            };
        },
        computedMaxHeight() {
            if (!this.hasApp)
                return null;
            const computedMaxHeight = (this.$vuetify.application.bottom +
                this.$vuetify.application.footer +
                this.$vuetify.application.bar);
            if (!this.clipped)
                return computedMaxHeight;
            return computedMaxHeight + this.$vuetify.application.top;
        },
        computedTop() {
            if (!this.hasApp)
                return 0;
            let computedTop = this.$vuetify.application.bar;
            computedTop += this.clipped
                ? this.$vuetify.application.top
                : 0;
            return computedTop;
        },
        computedTransform() {
            if (this.isActive)
                return 0;
            if (this.isBottom)
                return 100;
            return this.right ? 100 : -100;
        },
        computedWidth() {
            return this.isMiniVariant ? this.miniVariantWidth : this.width;
        },
        hasApp() {
            return (this.app &&
                (!this.isMobile && !this.temporary));
        },
        isBottom() {
            return this.bottom && this.isMobile;
        },
        isMiniVariant() {
            return (!this.expandOnHover &&
                this.miniVariant) || (this.expandOnHover &&
                !this.isMouseover);
        },
        isMobile() {
            return (!this.stateless &&
                !this.permanent &&
                Mobile.options.computed.isMobile.call(this));
        },
        reactsToClick() {
            return (!this.stateless &&
                !this.permanent &&
                (this.isMobile || this.temporary));
        },
        reactsToMobile() {
            return (this.app &&
                !this.disableResizeWatcher &&
                !this.permanent &&
                !this.stateless &&
                !this.temporary);
        },
        reactsToResize() {
            return !this.disableResizeWatcher && !this.stateless;
        },
        reactsToRoute() {
            return (!this.disableRouteWatcher &&
                !this.stateless &&
                (this.temporary || this.isMobile));
        },
        showOverlay() {
            return (!this.hideOverlay &&
                this.isActive &&
                (this.isMobile || this.temporary));
        },
        styles() {
            const translate = this.isBottom ? 'translateY' : 'translateX';
            return {
                height: convertToUnit(this.height),
                top: !this.isBottom ? convertToUnit(this.computedTop) : 'auto',
                maxHeight: this.computedMaxHeight != null
                    ? `calc(100% - ${convertToUnit(this.computedMaxHeight)})`
                    : undefined,
                transform: `${translate}(${convertToUnit(this.computedTransform, '%')})`,
                width: convertToUnit(this.computedWidth),
            };
        },
    },
    watch: {
        $route: 'onRouteChange',
        isActive(val) {
            this.$emit('input', val);
        },
        /**
         * When mobile changes, adjust the active state
         * only when there has been a previous value
         */
        isMobile(val, prev) {
            !val &&
                this.isActive &&
                !this.temporary &&
                this.removeOverlay();
            if (prev == null ||
                !this.reactsToResize ||
                !this.reactsToMobile)
                return;
            this.isActive = !val;
        },
        permanent(val) {
            // If enabling prop enable the drawer
            if (val)
                this.isActive = true;
        },
        showOverlay(val) {
            if (val)
                this.genOverlay();
            else
                this.removeOverlay();
        },
        value(val) {
            if (this.permanent)
                return;
            if (val == null) {
                this.init();
                return;
            }
            if (val !== this.isActive)
                this.isActive = val;
        },
        expandOnHover: 'updateMiniVariant',
        isMouseover(val) {
            this.updateMiniVariant(!val);
        },
    },
    beforeMount() {
        this.init();
    },
    methods: {
        calculateTouchArea() {
            const parent = this.$el.parentNode;
            if (!parent)
                return;
            const parentRect = parent.getBoundingClientRect();
            this.touchArea = {
                left: parentRect.left + 50,
                right: parentRect.right - 50,
            };
        },
        closeConditional() {
            return this.isActive && !this._isDestroyed && this.reactsToClick;
        },
        genAppend() {
            return this.genPosition('append');
        },
        genBackground() {
            const props = {
                height: '100%',
                width: '100%',
                src: this.src,
            };
            const image = this.$scopedSlots.img
                ? this.$scopedSlots.img(props)
                : this.$createElement(VImg, { props });
            return this.$createElement('div', {
                staticClass: 'v-navigation-drawer__image',
            }, [image]);
        },
        genDirectives() {
            const directives = [{
                    name: 'click-outside',
                    value: {
                        handler: () => { this.isActive = false; },
                        closeConditional: this.closeConditional,
                        include: this.getOpenDependentElements,
                    },
                }];
            if (!this.touchless && !this.stateless) {
                directives.push({
                    name: 'touch',
                    value: {
                        parent: true,
                        left: this.swipeLeft,
                        right: this.swipeRight,
                    },
                });
            }
            return directives;
        },
        genListeners() {
            const on = {
                mouseenter: () => (this.isMouseover = true),
                mouseleave: () => (this.isMouseover = false),
                transitionend: (e) => {
                    if (e.target !== e.currentTarget)
                        return;
                    this.$emit('transitionend', e);
                    // IE11 does not support new Event('resize')
                    const resizeEvent = document.createEvent('UIEvents');
                    resizeEvent.initUIEvent('resize', true, false, window, 0);
                    window.dispatchEvent(resizeEvent);
                },
            };
            if (this.miniVariant) {
                on.click = () => this.$emit('update:mini-variant', false);
            }
            return on;
        },
        genPosition(name) {
            const slot = getSlot(this, name);
            if (!slot)
                return slot;
            return this.$createElement('div', {
                staticClass: `v-navigation-drawer__${name}`,
            }, slot);
        },
        genPrepend() {
            return this.genPosition('prepend');
        },
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-navigation-drawer__content',
            }, this.$slots.default);
        },
        genBorder() {
            return this.$createElement('div', {
                staticClass: 'v-navigation-drawer__border',
            });
        },
        init() {
            if (this.permanent) {
                this.isActive = true;
            }
            else if (this.stateless ||
                this.value != null) {
                this.isActive = this.value;
            }
            else if (!this.temporary) {
                this.isActive = !this.isMobile;
            }
        },
        onRouteChange() {
            if (this.reactsToRoute && this.closeConditional()) {
                this.isActive = false;
            }
        },
        swipeLeft(e) {
            if (this.isActive && this.right)
                return;
            this.calculateTouchArea();
            if (Math.abs(e.touchendX - e.touchstartX) < 100)
                return;
            if (this.right &&
                e.touchstartX >= this.touchArea.right)
                this.isActive = true;
            else if (!this.right && this.isActive)
                this.isActive = false;
        },
        swipeRight(e) {
            if (this.isActive && !this.right)
                return;
            this.calculateTouchArea();
            if (Math.abs(e.touchendX - e.touchstartX) < 100)
                return;
            if (!this.right &&
                e.touchstartX <= this.touchArea.left)
                this.isActive = true;
            else if (this.right && this.isActive)
                this.isActive = false;
        },
        /**
         * Update the application layout
         */
        updateApplication() {
            if (!this.isActive ||
                this.isMobile ||
                this.temporary ||
                !this.$el)
                return 0;
            const width = Number(this.miniVariant ? this.miniVariantWidth : this.width);
            return isNaN(width) ? this.$el.clientWidth : width;
        },
        updateMiniVariant(val) {
            if (this.expandOnHover && this.miniVariant !== val)
                this.$emit('update:mini-variant', val);
        },
    },
    render(h) {
        const children = [
            this.genPrepend(),
            this.genContent(),
            this.genAppend(),
            this.genBorder(),
        ];
        if (this.src || getSlot(this, 'img'))
            children.unshift(this.genBackground());
        return h(this.tag, this.setBackgroundColor(this.color, {
            class: this.classes,
            style: this.styles,
            directives: this.genDirectives(),
            on: this.genListeners(),
        }), children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVk5hdmlnYXRpb25EcmF3ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WTmF2aWdhdGlvbkRyYXdlci9WTmF2aWdhdGlvbkRyYXdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTywwQkFBMEIsQ0FBQTtBQUVqQyxhQUFhO0FBQ2IsT0FBTyxJQUFtQixNQUFNLGNBQWMsQ0FBQTtBQUU5QyxTQUFTO0FBQ1QsT0FBTyxlQUFlLE1BQU0sOEJBQThCLENBQUE7QUFDMUQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxNQUFNLE1BQU0scUJBQXFCLENBQUE7QUFDeEMsT0FBTyxXQUFXLE1BQU0sMEJBQTBCLENBQUE7QUFDbEQsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFDbkQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsYUFBYTtBQUNiLE9BQU8sWUFBWSxNQUFNLGdDQUFnQyxDQUFBO0FBQ3pELE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBQzVDLE9BQU8sS0FBSyxNQUFNLHdCQUF3QixDQUFBO0FBRTFDLFlBQVk7QUFDWixPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzNELE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBTXRDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsZUFBZSxDQUFDLE1BQU0sRUFBRTtJQUN0QixVQUFVO0lBQ1YsVUFBVTtJQUNWLGFBQWE7SUFDYixlQUFlO0lBQ2YsV0FBVztJQUNYLE9BQU87SUFDUCxXQUFXO0lBQ1gsT0FBTztDQUNSLENBQUMsRUFDRixTQUFTLEVBQ1QsU0FBUyxFQUNULE1BQU0sRUFDTixXQUFXLEVBQ1gsV0FBVyxFQUNYLFNBQVMsQ0FDVixDQUFBO0FBRUQsb0JB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QVEsR0FBRztZQUNmLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakIsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNqQixJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxTQUFTLEVBQUU7U0FDakIsQ0FBQTtRQUVELElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztZQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUE7UUFFNUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNyRCxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ2xCLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hDLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO1NBQ3hCLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNmLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WTmF2aWdhdGlvbkRyYXdlci5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgVkltZywgeyBzcmNPYmplY3QgfSBmcm9tICcuLi9WSW1nL1ZJbWcnXG5cbi8vIE1peGluc1xuaW1wb3J0IEFwcGxpY2F0aW9uYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvYXBwbGljYXRpb25hYmxlJ1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IERlcGVuZGVudCBmcm9tICcuLi8uLi9taXhpbnMvZGVwZW5kZW50J1xuaW1wb3J0IE1vYmlsZSBmcm9tICcuLi8uLi9taXhpbnMvbW9iaWxlJ1xuaW1wb3J0IE92ZXJsYXlhYmxlIGZyb20gJy4uLy4uL21peGlucy9vdmVybGF5YWJsZSdcbmltcG9ydCBTU1JCb290YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvc3NyLWJvb3RhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgQ2xpY2tPdXRzaWRlIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvY2xpY2stb3V0c2lkZSdcbmltcG9ydCBSZXNpemUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yZXNpemUnXG5pbXBvcnQgVG91Y2ggZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy90b3VjaCdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0LCBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURpcmVjdGl2ZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBUb3VjaFdyYXBwZXIgfSBmcm9tICd2dWV0aWZ5L3R5cGVzJ1xuXG5jb25zdCBiYXNlTWl4aW5zID0gbWl4aW5zKFxuICBBcHBsaWNhdGlvbmFibGUoJ2xlZnQnLCBbXG4gICAgJ2lzQWN0aXZlJyxcbiAgICAnaXNNb2JpbGUnLFxuICAgICdtaW5pVmFyaWFudCcsXG4gICAgJ2V4cGFuZE9uSG92ZXInLFxuICAgICdwZXJtYW5lbnQnLFxuICAgICdyaWdodCcsXG4gICAgJ3RlbXBvcmFyeScsXG4gICAgJ3dpZHRoJyxcbiAgXSksXG4gIENvbG9yYWJsZSxcbiAgRGVwZW5kZW50LFxuICBNb2JpbGUsXG4gIE92ZXJsYXlhYmxlLFxuICBTU1JCb290YWJsZSxcbiAgVGhlbWVhYmxlXG4pXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZCh7XG4gIG5hbWU6ICd2LW5hdmlnYXRpb24tZHJhd2VyJyxcblxuICBkaXJlY3RpdmVzOiB7XG4gICAgQ2xpY2tPdXRzaWRlLFxuICAgIFJlc2l6ZSxcbiAgICBUb3VjaCxcbiAgfSxcblxuICBwcm92aWRlICgpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBpc0luTmF2OiB0aGlzLnRhZyA9PT0gJ25hdicsXG4gICAgfVxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgYm90dG9tOiBCb29sZWFuLFxuICAgIGNsaXBwZWQ6IEJvb2xlYW4sXG4gICAgZGlzYWJsZVJlc2l6ZVdhdGNoZXI6IEJvb2xlYW4sXG4gICAgZGlzYWJsZVJvdXRlV2F0Y2hlcjogQm9vbGVhbixcbiAgICBleHBhbmRPbkhvdmVyOiBCb29sZWFuLFxuICAgIGZsb2F0aW5nOiBCb29sZWFuLFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQgKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcCA/ICcxMDB2aCcgOiAnMTAwJSdcbiAgICAgIH0sXG4gICAgfSxcbiAgICBtaW5pVmFyaWFudDogQm9vbGVhbixcbiAgICBtaW5pVmFyaWFudFdpZHRoOiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogNTYsXG4gICAgfSxcbiAgICBwZXJtYW5lbnQ6IEJvb2xlYW4sXG4gICAgcmlnaHQ6IEJvb2xlYW4sXG4gICAgc3JjOiB7XG4gICAgICB0eXBlOiBbU3RyaW5nLCBPYmplY3RdIGFzIFByb3BUeXBlPHN0cmluZyB8IHNyY09iamVjdD4sXG4gICAgICBkZWZhdWx0OiAnJyxcbiAgICB9LFxuICAgIHN0YXRlbGVzczogQm9vbGVhbixcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQgKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcCA/ICduYXYnIDogJ2FzaWRlJ1xuICAgICAgfSxcbiAgICB9LFxuICAgIHRlbXBvcmFyeTogQm9vbGVhbixcbiAgICB0b3VjaGxlc3M6IEJvb2xlYW4sXG4gICAgd2lkdGg6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiAyNTYsXG4gICAgfSxcbiAgICB2YWx1ZTogbnVsbCBhcyB1bmtub3duIGFzIFByb3BUeXBlPGFueT4sXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBpc01vdXNlb3ZlcjogZmFsc2UsXG4gICAgdG91Y2hBcmVhOiB7XG4gICAgICBsZWZ0OiAwLFxuICAgICAgcmlnaHQ6IDAsXG4gICAgfSxcbiAgICBzdGFja01pblpJbmRleDogNixcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICAvKipcbiAgICAgKiBVc2VkIGZvciBzZXR0aW5nIGFuIGFwcCB2YWx1ZSBmcm9tIGEgZHluYW1pY1xuICAgICAqIHByb3BlcnR5LiBDYWxsZWQgZnJvbSBhcHBsaWNhdGlvbmFibGUuanNcbiAgICAgKi9cbiAgICBhcHBsaWNhdGlvblByb3BlcnR5ICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMucmlnaHQgPyAncmlnaHQnIDogJ2xlZnQnXG4gICAgfSxcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXInOiB0cnVlLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tYWJzb2x1dGUnOiB0aGlzLmFic29sdXRlLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tYm90dG9tJzogdGhpcy5ib3R0b20sXG4gICAgICAgICd2LW5hdmlnYXRpb24tZHJhd2VyLS1jbGlwcGVkJzogdGhpcy5jbGlwcGVkLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tY2xvc2UnOiAhdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLWZpeGVkJzogIXRoaXMuYWJzb2x1dGUgJiYgKHRoaXMuYXBwIHx8IHRoaXMuZml4ZWQpLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tZmxvYXRpbmcnOiB0aGlzLmZsb2F0aW5nLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0taXMtbW9iaWxlJzogdGhpcy5pc01vYmlsZSxcbiAgICAgICAgJ3YtbmF2aWdhdGlvbi1kcmF3ZXItLWlzLW1vdXNlb3Zlcic6IHRoaXMuaXNNb3VzZW92ZXIsXG4gICAgICAgICd2LW5hdmlnYXRpb24tZHJhd2VyLS1taW5pLXZhcmlhbnQnOiB0aGlzLmlzTWluaVZhcmlhbnQsXG4gICAgICAgICd2LW5hdmlnYXRpb24tZHJhd2VyLS1jdXN0b20tbWluaS12YXJpYW50JzogTnVtYmVyKHRoaXMubWluaVZhcmlhbnRXaWR0aCkgIT09IDU2LFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tb3Blbic6IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgICd2LW5hdmlnYXRpb24tZHJhd2VyLS1vcGVuLW9uLWhvdmVyJzogdGhpcy5leHBhbmRPbkhvdmVyLFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tcmlnaHQnOiB0aGlzLnJpZ2h0LFxuICAgICAgICAndi1uYXZpZ2F0aW9uLWRyYXdlci0tdGVtcG9yYXJ5JzogdGhpcy50ZW1wb3JhcnksXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfVxuICAgIH0sXG4gICAgY29tcHV0ZWRNYXhIZWlnaHQgKCk6IG51bWJlciB8IG51bGwge1xuICAgICAgaWYgKCF0aGlzLmhhc0FwcCkgcmV0dXJuIG51bGxcblxuICAgICAgY29uc3QgY29tcHV0ZWRNYXhIZWlnaHQgPSAoXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkuYXBwbGljYXRpb24uYm90dG9tICtcbiAgICAgICAgdGhpcy4kdnVldGlmeS5hcHBsaWNhdGlvbi5mb290ZXIgK1xuICAgICAgICB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLmJhclxuICAgICAgKVxuXG4gICAgICBpZiAoIXRoaXMuY2xpcHBlZCkgcmV0dXJuIGNvbXB1dGVkTWF4SGVpZ2h0XG5cbiAgICAgIHJldHVybiBjb21wdXRlZE1heEhlaWdodCArIHRoaXMuJHZ1ZXRpZnkuYXBwbGljYXRpb24udG9wXG4gICAgfSxcbiAgICBjb21wdXRlZFRvcCAoKTogbnVtYmVyIHtcbiAgICAgIGlmICghdGhpcy5oYXNBcHApIHJldHVybiAwXG5cbiAgICAgIGxldCBjb21wdXRlZFRvcCA9IHRoaXMuJHZ1ZXRpZnkuYXBwbGljYXRpb24uYmFyXG5cbiAgICAgIGNvbXB1dGVkVG9wICs9IHRoaXMuY2xpcHBlZFxuICAgICAgICA/IHRoaXMuJHZ1ZXRpZnkuYXBwbGljYXRpb24udG9wXG4gICAgICAgIDogMFxuXG4gICAgICByZXR1cm4gY29tcHV0ZWRUb3BcbiAgICB9LFxuICAgIGNvbXB1dGVkVHJhbnNmb3JtICgpOiBudW1iZXIge1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHJldHVybiAwXG4gICAgICBpZiAodGhpcy5pc0JvdHRvbSkgcmV0dXJuIDEwMFxuICAgICAgcmV0dXJuIHRoaXMucmlnaHQgPyAxMDAgOiAtMTAwXG4gICAgfSxcbiAgICBjb21wdXRlZFdpZHRoICgpOiBzdHJpbmcgfCBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuaXNNaW5pVmFyaWFudCA/IHRoaXMubWluaVZhcmlhbnRXaWR0aCA6IHRoaXMud2lkdGhcbiAgICB9LFxuICAgIGhhc0FwcCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmFwcCAmJlxuICAgICAgICAoIXRoaXMuaXNNb2JpbGUgJiYgIXRoaXMudGVtcG9yYXJ5KVxuICAgICAgKVxuICAgIH0sXG4gICAgaXNCb3R0b20gKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuYm90dG9tICYmIHRoaXMuaXNNb2JpbGVcbiAgICB9LFxuICAgIGlzTWluaVZhcmlhbnQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgIXRoaXMuZXhwYW5kT25Ib3ZlciAmJlxuICAgICAgICB0aGlzLm1pbmlWYXJpYW50XG4gICAgICApIHx8IChcbiAgICAgICAgdGhpcy5leHBhbmRPbkhvdmVyICYmXG4gICAgICAgICF0aGlzLmlzTW91c2VvdmVyXG4gICAgICApXG4gICAgfSxcbiAgICBpc01vYmlsZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAhdGhpcy5zdGF0ZWxlc3MgJiZcbiAgICAgICAgIXRoaXMucGVybWFuZW50ICYmXG4gICAgICAgIE1vYmlsZS5vcHRpb25zLmNvbXB1dGVkLmlzTW9iaWxlLmNhbGwodGhpcylcbiAgICAgIClcbiAgICB9LFxuICAgIHJlYWN0c1RvQ2xpY2sgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgIXRoaXMuc3RhdGVsZXNzICYmXG4gICAgICAgICF0aGlzLnBlcm1hbmVudCAmJlxuICAgICAgICAodGhpcy5pc01vYmlsZSB8fCB0aGlzLnRlbXBvcmFyeSlcbiAgICAgIClcbiAgICB9LFxuICAgIHJlYWN0c1RvTW9iaWxlICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuYXBwICYmXG4gICAgICAgICF0aGlzLmRpc2FibGVSZXNpemVXYXRjaGVyICYmXG4gICAgICAgICF0aGlzLnBlcm1hbmVudCAmJlxuICAgICAgICAhdGhpcy5zdGF0ZWxlc3MgJiZcbiAgICAgICAgIXRoaXMudGVtcG9yYXJ5XG4gICAgICApXG4gICAgfSxcbiAgICByZWFjdHNUb1Jlc2l6ZSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gIXRoaXMuZGlzYWJsZVJlc2l6ZVdhdGNoZXIgJiYgIXRoaXMuc3RhdGVsZXNzXG4gICAgfSxcbiAgICByZWFjdHNUb1JvdXRlICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICF0aGlzLmRpc2FibGVSb3V0ZVdhdGNoZXIgJiZcbiAgICAgICAgIXRoaXMuc3RhdGVsZXNzICYmXG4gICAgICAgICh0aGlzLnRlbXBvcmFyeSB8fCB0aGlzLmlzTW9iaWxlKVxuICAgICAgKVxuICAgIH0sXG4gICAgc2hvd092ZXJsYXkgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgIXRoaXMuaGlkZU92ZXJsYXkgJiZcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSAmJlxuICAgICAgICAodGhpcy5pc01vYmlsZSB8fCB0aGlzLnRlbXBvcmFyeSlcbiAgICAgIClcbiAgICB9LFxuICAgIHN0eWxlcyAoKTogb2JqZWN0IHtcbiAgICAgIGNvbnN0IHRyYW5zbGF0ZSA9IHRoaXMuaXNCb3R0b20gPyAndHJhbnNsYXRlWScgOiAndHJhbnNsYXRlWCdcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhlaWdodDogY29udmVydFRvVW5pdCh0aGlzLmhlaWdodCksXG4gICAgICAgIHRvcDogIXRoaXMuaXNCb3R0b20gPyBjb252ZXJ0VG9Vbml0KHRoaXMuY29tcHV0ZWRUb3ApIDogJ2F1dG8nLFxuICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuY29tcHV0ZWRNYXhIZWlnaHQgIT0gbnVsbFxuICAgICAgICAgID8gYGNhbGMoMTAwJSAtICR7Y29udmVydFRvVW5pdCh0aGlzLmNvbXB1dGVkTWF4SGVpZ2h0KX0pYFxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB0cmFuc2Zvcm06IGAke3RyYW5zbGF0ZX0oJHtjb252ZXJ0VG9Vbml0KHRoaXMuY29tcHV0ZWRUcmFuc2Zvcm0sICclJyl9KWAsXG4gICAgICAgIHdpZHRoOiBjb252ZXJ0VG9Vbml0KHRoaXMuY29tcHV0ZWRXaWR0aCksXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgICRyb3V0ZTogJ29uUm91dGVDaGFuZ2UnLFxuICAgIGlzQWN0aXZlICh2YWwpIHtcbiAgICAgIHRoaXMuJGVtaXQoJ2lucHV0JywgdmFsKVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogV2hlbiBtb2JpbGUgY2hhbmdlcywgYWRqdXN0IHRoZSBhY3RpdmUgc3RhdGVcbiAgICAgKiBvbmx5IHdoZW4gdGhlcmUgaGFzIGJlZW4gYSBwcmV2aW91cyB2YWx1ZVxuICAgICAqL1xuICAgIGlzTW9iaWxlICh2YWwsIHByZXYpIHtcbiAgICAgICF2YWwgJiZcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSAmJlxuICAgICAgICAhdGhpcy50ZW1wb3JhcnkgJiZcbiAgICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KClcblxuICAgICAgaWYgKHByZXYgPT0gbnVsbCB8fFxuICAgICAgICAhdGhpcy5yZWFjdHNUb1Jlc2l6ZSB8fFxuICAgICAgICAhdGhpcy5yZWFjdHNUb01vYmlsZVxuICAgICAgKSByZXR1cm5cblxuICAgICAgdGhpcy5pc0FjdGl2ZSA9ICF2YWxcbiAgICB9LFxuICAgIHBlcm1hbmVudCAodmFsKSB7XG4gICAgICAvLyBJZiBlbmFibGluZyBwcm9wIGVuYWJsZSB0aGUgZHJhd2VyXG4gICAgICBpZiAodmFsKSB0aGlzLmlzQWN0aXZlID0gdHJ1ZVxuICAgIH0sXG4gICAgc2hvd092ZXJsYXkgKHZhbCkge1xuICAgICAgaWYgKHZhbCkgdGhpcy5nZW5PdmVybGF5KClcbiAgICAgIGVsc2UgdGhpcy5yZW1vdmVPdmVybGF5KClcbiAgICB9LFxuICAgIHZhbHVlICh2YWwpIHtcbiAgICAgIGlmICh0aGlzLnBlcm1hbmVudCkgcmV0dXJuXG5cbiAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmluaXQoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHZhbCAhPT0gdGhpcy5pc0FjdGl2ZSkgdGhpcy5pc0FjdGl2ZSA9IHZhbFxuICAgIH0sXG4gICAgZXhwYW5kT25Ib3ZlcjogJ3VwZGF0ZU1pbmlWYXJpYW50JyxcbiAgICBpc01vdXNlb3ZlciAodmFsKSB7XG4gICAgICB0aGlzLnVwZGF0ZU1pbmlWYXJpYW50KCF2YWwpXG4gICAgfSxcbiAgfSxcblxuICBiZWZvcmVNb3VudCAoKSB7XG4gICAgdGhpcy5pbml0KClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgY2FsY3VsYXRlVG91Y2hBcmVhICgpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuJGVsLnBhcmVudE5vZGUgYXMgRWxlbWVudFxuXG4gICAgICBpZiAoIXBhcmVudCkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHBhcmVudFJlY3QgPSBwYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgdGhpcy50b3VjaEFyZWEgPSB7XG4gICAgICAgIGxlZnQ6IHBhcmVudFJlY3QubGVmdCArIDUwLFxuICAgICAgICByaWdodDogcGFyZW50UmVjdC5yaWdodCAtIDUwLFxuICAgICAgfVxuICAgIH0sXG4gICAgY2xvc2VDb25kaXRpb25hbCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5pc0FjdGl2ZSAmJiAhdGhpcy5faXNEZXN0cm95ZWQgJiYgdGhpcy5yZWFjdHNUb0NsaWNrXG4gICAgfSxcbiAgICBnZW5BcHBlbmQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuUG9zaXRpb24oJ2FwcGVuZCcpXG4gICAgfSxcbiAgICBnZW5CYWNrZ3JvdW5kICgpIHtcbiAgICAgIGNvbnN0IHByb3BzID0ge1xuICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgc3JjOiB0aGlzLnNyYyxcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW1hZ2UgPSB0aGlzLiRzY29wZWRTbG90cy5pbWdcbiAgICAgICAgPyB0aGlzLiRzY29wZWRTbG90cy5pbWcocHJvcHMpXG4gICAgICAgIDogdGhpcy4kY3JlYXRlRWxlbWVudChWSW1nLCB7IHByb3BzIH0pXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1uYXZpZ2F0aW9uLWRyYXdlcl9faW1hZ2UnLFxuICAgICAgfSwgW2ltYWdlXSlcbiAgICB9LFxuICAgIGdlbkRpcmVjdGl2ZXMgKCk6IFZOb2RlRGlyZWN0aXZlW10ge1xuICAgICAgY29uc3QgZGlyZWN0aXZlcyA9IFt7XG4gICAgICAgIG5hbWU6ICdjbGljay1vdXRzaWRlJyxcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICBoYW5kbGVyOiAoKSA9PiB7IHRoaXMuaXNBY3RpdmUgPSBmYWxzZSB9LFxuICAgICAgICAgIGNsb3NlQ29uZGl0aW9uYWw6IHRoaXMuY2xvc2VDb25kaXRpb25hbCxcbiAgICAgICAgICBpbmNsdWRlOiB0aGlzLmdldE9wZW5EZXBlbmRlbnRFbGVtZW50cyxcbiAgICAgICAgfSxcbiAgICAgIH1dXG5cbiAgICAgIGlmICghdGhpcy50b3VjaGxlc3MgJiYgIXRoaXMuc3RhdGVsZXNzKSB7XG4gICAgICAgIGRpcmVjdGl2ZXMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ3RvdWNoJyxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgcGFyZW50OiB0cnVlLFxuICAgICAgICAgICAgbGVmdDogdGhpcy5zd2lwZUxlZnQsXG4gICAgICAgICAgICByaWdodDogdGhpcy5zd2lwZVJpZ2h0LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0gYXMgYW55KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGlyZWN0aXZlc1xuICAgIH0sXG4gICAgZ2VuTGlzdGVuZXJzICgpIHtcbiAgICAgIGNvbnN0IG9uOiBSZWNvcmQ8c3RyaW5nLCAoZTogRXZlbnQpID0+IHZvaWQ+ID0ge1xuICAgICAgICBtb3VzZWVudGVyOiAoKSA9PiAodGhpcy5pc01vdXNlb3ZlciA9IHRydWUpLFxuICAgICAgICBtb3VzZWxlYXZlOiAoKSA9PiAodGhpcy5pc01vdXNlb3ZlciA9IGZhbHNlKSxcbiAgICAgICAgdHJhbnNpdGlvbmVuZDogKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKGUudGFyZ2V0ICE9PSBlLmN1cnJlbnRUYXJnZXQpIHJldHVyblxuICAgICAgICAgIHRoaXMuJGVtaXQoJ3RyYW5zaXRpb25lbmQnLCBlKVxuXG4gICAgICAgICAgLy8gSUUxMSBkb2VzIG5vdCBzdXBwb3J0IG5ldyBFdmVudCgncmVzaXplJylcbiAgICAgICAgICBjb25zdCByZXNpemVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdVSUV2ZW50cycpXG4gICAgICAgICAgcmVzaXplRXZlbnQuaW5pdFVJRXZlbnQoJ3Jlc2l6ZScsIHRydWUsIGZhbHNlLCB3aW5kb3csIDApXG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQocmVzaXplRXZlbnQpXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm1pbmlWYXJpYW50KSB7XG4gICAgICAgIG9uLmNsaWNrID0gKCkgPT4gdGhpcy4kZW1pdCgndXBkYXRlOm1pbmktdmFyaWFudCcsIGZhbHNlKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb25cbiAgICB9LFxuICAgIGdlblBvc2l0aW9uIChuYW1lOiAncHJlcGVuZCcgfCAnYXBwZW5kJykge1xuICAgICAgY29uc3Qgc2xvdCA9IGdldFNsb3QodGhpcywgbmFtZSlcblxuICAgICAgaWYgKCFzbG90KSByZXR1cm4gc2xvdFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogYHYtbmF2aWdhdGlvbi1kcmF3ZXJfXyR7bmFtZX1gLFxuICAgICAgfSwgc2xvdClcbiAgICB9LFxuICAgIGdlblByZXBlbmQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuUG9zaXRpb24oJ3ByZXBlbmQnKVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtbmF2aWdhdGlvbi1kcmF3ZXJfX2NvbnRlbnQnLFxuICAgICAgfSwgdGhpcy4kc2xvdHMuZGVmYXVsdClcbiAgICB9LFxuICAgIGdlbkJvcmRlciAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtbmF2aWdhdGlvbi1kcmF3ZXJfX2JvcmRlcicsXG4gICAgICB9KVxuICAgIH0sXG4gICAgaW5pdCAoKSB7XG4gICAgICBpZiAodGhpcy5wZXJtYW5lbnQpIHtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZWxlc3MgfHxcbiAgICAgICAgdGhpcy52YWx1ZSAhPSBudWxsXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRoaXMudmFsdWVcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMudGVtcG9yYXJ5KSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSAhdGhpcy5pc01vYmlsZVxuICAgICAgfVxuICAgIH0sXG4gICAgb25Sb3V0ZUNoYW5nZSAoKSB7XG4gICAgICBpZiAodGhpcy5yZWFjdHNUb1JvdXRlICYmIHRoaXMuY2xvc2VDb25kaXRpb25hbCgpKSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgc3dpcGVMZWZ0IChlOiBUb3VjaFdyYXBwZXIpIHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlICYmIHRoaXMucmlnaHQpIHJldHVyblxuICAgICAgdGhpcy5jYWxjdWxhdGVUb3VjaEFyZWEoKVxuXG4gICAgICBpZiAoTWF0aC5hYnMoZS50b3VjaGVuZFggLSBlLnRvdWNoc3RhcnRYKSA8IDEwMCkgcmV0dXJuXG4gICAgICBpZiAodGhpcy5yaWdodCAmJlxuICAgICAgICBlLnRvdWNoc3RhcnRYID49IHRoaXMudG91Y2hBcmVhLnJpZ2h0XG4gICAgICApIHRoaXMuaXNBY3RpdmUgPSB0cnVlXG4gICAgICBlbHNlIGlmICghdGhpcy5yaWdodCAmJiB0aGlzLmlzQWN0aXZlKSB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgICB9LFxuICAgIHN3aXBlUmlnaHQgKGU6IFRvdWNoV3JhcHBlcikge1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUgJiYgIXRoaXMucmlnaHQpIHJldHVyblxuICAgICAgdGhpcy5jYWxjdWxhdGVUb3VjaEFyZWEoKVxuXG4gICAgICBpZiAoTWF0aC5hYnMoZS50b3VjaGVuZFggLSBlLnRvdWNoc3RhcnRYKSA8IDEwMCkgcmV0dXJuXG4gICAgICBpZiAoIXRoaXMucmlnaHQgJiZcbiAgICAgICAgZS50b3VjaHN0YXJ0WCA8PSB0aGlzLnRvdWNoQXJlYS5sZWZ0XG4gICAgICApIHRoaXMuaXNBY3RpdmUgPSB0cnVlXG4gICAgICBlbHNlIGlmICh0aGlzLnJpZ2h0ICYmIHRoaXMuaXNBY3RpdmUpIHRoaXMuaXNBY3RpdmUgPSBmYWxzZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBhcHBsaWNhdGlvbiBsYXlvdXRcbiAgICAgKi9cbiAgICB1cGRhdGVBcHBsaWNhdGlvbiAoKSB7XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLmlzQWN0aXZlIHx8XG4gICAgICAgIHRoaXMuaXNNb2JpbGUgfHxcbiAgICAgICAgdGhpcy50ZW1wb3JhcnkgfHxcbiAgICAgICAgIXRoaXMuJGVsXG4gICAgICApIHJldHVybiAwXG5cbiAgICAgIGNvbnN0IHdpZHRoID0gTnVtYmVyKHRoaXMubWluaVZhcmlhbnQgPyB0aGlzLm1pbmlWYXJpYW50V2lkdGggOiB0aGlzLndpZHRoKVxuXG4gICAgICByZXR1cm4gaXNOYU4od2lkdGgpID8gdGhpcy4kZWwuY2xpZW50V2lkdGggOiB3aWR0aFxuICAgIH0sXG4gICAgdXBkYXRlTWluaVZhcmlhbnQgKHZhbDogYm9vbGVhbikge1xuICAgICAgaWYgKHRoaXMuZXhwYW5kT25Ib3ZlciAmJiB0aGlzLm1pbmlWYXJpYW50ICE9PSB2YWwpIHRoaXMuJGVtaXQoJ3VwZGF0ZTptaW5pLXZhcmlhbnQnLCB2YWwpXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBbXG4gICAgICB0aGlzLmdlblByZXBlbmQoKSxcbiAgICAgIHRoaXMuZ2VuQ29udGVudCgpLFxuICAgICAgdGhpcy5nZW5BcHBlbmQoKSxcbiAgICAgIHRoaXMuZ2VuQm9yZGVyKCksXG4gICAgXVxuXG4gICAgaWYgKHRoaXMuc3JjIHx8IGdldFNsb3QodGhpcywgJ2ltZycpKSBjaGlsZHJlbi51bnNoaWZ0KHRoaXMuZ2VuQmFja2dyb3VuZCgpKVxuXG4gICAgcmV0dXJuIGgodGhpcy50YWcsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29sb3IsIHtcbiAgICAgIGNsYXNzOiB0aGlzLmNsYXNzZXMsXG4gICAgICBzdHlsZTogdGhpcy5zdHlsZXMsXG4gICAgICBkaXJlY3RpdmVzOiB0aGlzLmdlbkRpcmVjdGl2ZXMoKSxcbiAgICAgIG9uOiB0aGlzLmdlbkxpc3RlbmVycygpLFxuICAgIH0pLCBjaGlsZHJlbilcbiAgfSxcbn0pXG4iXX0=
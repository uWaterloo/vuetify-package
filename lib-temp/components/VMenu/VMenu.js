// Styles
import './VMenu.sass';
// Components
import { VThemeProvider } from '../VThemeProvider';
// Mixins
import Activatable from '../../mixins/activatable';
import Delayable from '../../mixins/delayable';
import Dependent from '../../mixins/dependent';
import Menuable from '../../mixins/menuable';
import Returnable from '../../mixins/returnable';
import Roundable from '../../mixins/roundable';
import Themeable from '../../mixins/themeable';
// Directives
import ClickOutside from '../../directives/click-outside';
import Resize from '../../directives/resize';
// Utilities
import mixins from '../../util/mixins';
import { removed } from '../../util/console';
import { convertToUnit, keyCodes, } from '../../util/helpers';
import goTo from '../../services/goto';
const baseMixins = mixins(Dependent, Delayable, Returnable, Roundable, Themeable, Menuable);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-menu',
    directives: {
        ClickOutside,
        Resize,
    },
    provide() {
        return {
            isInMenu: true,
            // Pass theme through to default slot
            theme: this.theme,
        };
    },
    props: {
        auto: Boolean,
        closeOnClick: {
            type: Boolean,
            default: true,
        },
        closeOnContentClick: {
            type: Boolean,
            default: true,
        },
        disabled: Boolean,
        disableKeys: Boolean,
        maxHeight: {
            type: [Number, String],
            default: 'auto',
        },
        offsetX: Boolean,
        offsetY: Boolean,
        openOnHover: Boolean,
        origin: {
            type: String,
            default: 'top left',
        },
        transition: {
            type: [Boolean, String],
            default: 'v-menu-transition',
        },
    },
    data() {
        return {
            calculatedTopAuto: 0,
            defaultOffset: 8,
            hasJustFocused: false,
            listIndex: -1,
            resizeTimeout: 0,
            selectedIndex: null,
            tiles: [],
        };
    },
    computed: {
        activeTile() {
            return this.tiles[this.listIndex];
        },
        calculatedLeft() {
            const menuWidth = Math.max(this.dimensions.content.width, parseFloat(this.calculatedMinWidth));
            if (!this.auto)
                return this.calcLeft(menuWidth) || '0';
            return convertToUnit(this.calcXOverflow(this.calcLeftAuto(), menuWidth)) || '0';
        },
        calculatedMaxHeight() {
            const height = this.auto
                ? '200px'
                : convertToUnit(this.maxHeight);
            return height || '0';
        },
        calculatedMaxWidth() {
            return convertToUnit(this.maxWidth) || '0';
        },
        calculatedMinWidth() {
            if (this.minWidth) {
                return convertToUnit(this.minWidth) || '0';
            }
            const minWidth = Math.min(this.dimensions.activator.width +
                Number(this.nudgeWidth) +
                (this.auto ? 16 : 0), Math.max(this.pageWidth - 24, 0));
            const calculatedMaxWidth = isNaN(parseInt(this.calculatedMaxWidth))
                ? minWidth
                : parseInt(this.calculatedMaxWidth);
            return convertToUnit(Math.min(calculatedMaxWidth, minWidth)) || '0';
        },
        calculatedTop() {
            const top = !this.auto
                ? this.calcTop()
                : convertToUnit(this.calcYOverflow(this.calculatedTopAuto));
            return top || '0';
        },
        hasClickableTiles() {
            return Boolean(this.tiles.find(tile => tile.tabIndex > -1));
        },
        styles() {
            return {
                maxHeight: this.calculatedMaxHeight,
                minWidth: this.calculatedMinWidth,
                maxWidth: this.calculatedMaxWidth,
                top: this.calculatedTop,
                left: this.calculatedLeft,
                transformOrigin: this.origin,
                zIndex: this.zIndex || this.activeZIndex,
            };
        },
    },
    watch: {
        isActive(val) {
            if (!val)
                this.listIndex = -1;
        },
        isContentActive(val) {
            this.hasJustFocused = val;
        },
        listIndex(next, prev) {
            if (next in this.tiles) {
                const tile = this.tiles[next];
                tile.classList.add('v-list-item--highlighted');
                const scrollTop = this.$refs.content.scrollTop;
                const contentHeight = this.$refs.content.clientHeight;
                if (scrollTop > tile.offsetTop - 8) {
                    goTo(tile.offsetTop - tile.clientHeight, {
                        appOffset: false,
                        duration: 300,
                        container: this.$refs.content,
                    });
                }
                else if (scrollTop + contentHeight < tile.offsetTop + tile.clientHeight + 8) {
                    goTo(tile.offsetTop - contentHeight + tile.clientHeight * 2, {
                        appOffset: false,
                        duration: 300,
                        container: this.$refs.content,
                    });
                }
            }
            prev in this.tiles &&
                this.tiles[prev].classList.remove('v-list-item--highlighted');
        },
    },
    created() {
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('full-width')) {
            removed('full-width', this);
        }
    },
    mounted() {
        this.isActive && this.callActivate();
    },
    methods: {
        activate() {
            // Update coordinates and dimensions of menu
            // and its activator
            this.updateDimensions();
            // Start the transition
            requestAnimationFrame(() => {
                // Once transitioning, calculate scroll and top position
                this.startTransition().then(() => {
                    if (this.$refs.content) {
                        this.calculatedTopAuto = this.calcTopAuto();
                        this.auto && (this.$refs.content.scrollTop = this.calcScrollPosition());
                    }
                });
            });
        },
        calcScrollPosition() {
            const $el = this.$refs.content;
            const activeTile = $el.querySelector('.v-list-item--active');
            const maxScrollTop = $el.scrollHeight - $el.offsetHeight;
            return activeTile
                ? Math.min(maxScrollTop, Math.max(0, activeTile.offsetTop - $el.offsetHeight / 2 + activeTile.offsetHeight / 2))
                : $el.scrollTop;
        },
        calcLeftAuto() {
            return parseInt(this.dimensions.activator.left - this.defaultOffset * 2);
        },
        calcTopAuto() {
            const $el = this.$refs.content;
            const activeTile = $el.querySelector('.v-list-item--active');
            if (!activeTile) {
                this.selectedIndex = null;
            }
            if (this.offsetY || !activeTile) {
                return this.computedTop;
            }
            this.selectedIndex = Array.from(this.tiles).indexOf(activeTile);
            const tileDistanceFromMenuTop = activeTile.offsetTop - this.calcScrollPosition();
            const firstTileOffsetTop = $el.querySelector('.v-list-item').offsetTop;
            return this.computedTop - tileDistanceFromMenuTop - firstTileOffsetTop - 1;
        },
        changeListIndex(e) {
            // For infinite scroll and autocomplete, re-evaluate children
            this.getTiles();
            if (!this.isActive || !this.hasClickableTiles) {
                return;
            }
            else if (e.keyCode === keyCodes.tab) {
                this.isActive = false;
                return;
            }
            else if (e.keyCode === keyCodes.down) {
                this.nextTile();
            }
            else if (e.keyCode === keyCodes.up) {
                this.prevTile();
            }
            else if (e.keyCode === keyCodes.end) {
                this.lastTile();
            }
            else if (e.keyCode === keyCodes.home) {
                this.firstTile();
            }
            else if (e.keyCode === keyCodes.enter && this.listIndex !== -1) {
                this.tiles[this.listIndex].click();
            }
            else {
                return;
            }
            // One of the conditions was met, prevent default action (#2988)
            e.preventDefault();
        },
        closeConditional(e) {
            const target = e.target;
            return this.isActive &&
                !this._isDestroyed &&
                this.closeOnClick &&
                !this.$refs.content.contains(target);
        },
        genActivatorAttributes() {
            const attributes = Activatable.options.methods.genActivatorAttributes.call(this);
            if (this.activeTile && this.activeTile.id) {
                return {
                    ...attributes,
                    'aria-activedescendant': this.activeTile.id,
                };
            }
            return attributes;
        },
        genActivatorListeners() {
            const listeners = Menuable.options.methods.genActivatorListeners.call(this);
            if (!this.disableKeys) {
                listeners.keydown = this.onKeyDown;
            }
            return listeners;
        },
        genTransition() {
            const content = this.genContent();
            if (!this.transition)
                return content;
            return this.$createElement('transition', {
                props: {
                    name: this.transition,
                },
            }, [content]);
        },
        genDirectives() {
            const directives = [{
                    name: 'show',
                    value: this.isContentActive,
                }];
            // Do not add click outside for hover menu
            if (!this.openOnHover && this.closeOnClick) {
                directives.push({
                    name: 'click-outside',
                    value: {
                        handler: () => { this.isActive = false; },
                        closeConditional: this.closeConditional,
                        include: () => [this.$el, ...this.getOpenDependentElements()],
                    },
                });
            }
            return directives;
        },
        genContent() {
            const options = {
                attrs: {
                    ...this.getScopeIdAttrs(),
                    role: 'role' in this.$attrs ? this.$attrs.role : 'menu',
                },
                staticClass: 'v-menu__content',
                class: {
                    ...this.rootThemeClasses,
                    ...this.roundedClasses,
                    'v-menu__content--auto': this.auto,
                    'v-menu__content--fixed': this.activatorFixed,
                    menuable__content__active: this.isActive,
                    [this.contentClass.trim()]: true,
                },
                style: this.styles,
                directives: this.genDirectives(),
                ref: 'content',
                on: {
                    click: (e) => {
                        const target = e.target;
                        if (target.getAttribute('disabled'))
                            return;
                        if (this.closeOnContentClick)
                            this.isActive = false;
                    },
                    keydown: this.onKeyDown,
                },
            };
            if (this.$listeners.scroll) {
                options.on = options.on || {};
                options.on.scroll = this.$listeners.scroll;
            }
            if (!this.disabled && this.openOnHover) {
                options.on = options.on || {};
                options.on.mouseenter = this.mouseEnterHandler;
            }
            if (this.openOnHover) {
                options.on = options.on || {};
                options.on.mouseleave = this.mouseLeaveHandler;
            }
            return this.$createElement('div', options, this.getContentSlot());
        },
        getTiles() {
            if (!this.$refs.content)
                return;
            this.tiles = Array.from(this.$refs.content.querySelectorAll('.v-list-item, .v-divider, .v-subheader'));
        },
        mouseEnterHandler() {
            this.runDelay('open', () => {
                if (this.hasJustFocused)
                    return;
                this.hasJustFocused = true;
            });
        },
        mouseLeaveHandler(e) {
            // Prevent accidental re-activation
            this.runDelay('close', () => {
                if (this.$refs.content?.contains(e.relatedTarget))
                    return;
                requestAnimationFrame(() => {
                    this.isActive = false;
                    this.callDeactivate();
                });
            });
        },
        nextTile() {
            const tile = this.tiles[this.listIndex + 1];
            if (!tile) {
                if (!this.tiles.length)
                    return;
                this.listIndex = -1;
                this.nextTile();
                return;
            }
            this.listIndex++;
            if (tile.tabIndex === -1)
                this.nextTile();
        },
        prevTile() {
            const tile = this.tiles[this.listIndex - 1];
            if (!tile) {
                if (!this.tiles.length)
                    return;
                this.listIndex = this.tiles.length;
                this.prevTile();
                return;
            }
            this.listIndex--;
            if (tile.tabIndex === -1)
                this.prevTile();
        },
        lastTile() {
            const tile = this.tiles[this.tiles.length - 1];
            if (!tile)
                return;
            this.listIndex = this.tiles.length - 1;
            if (tile.tabIndex === -1)
                this.prevTile();
        },
        firstTile() {
            const tile = this.tiles[0];
            if (!tile)
                return;
            this.listIndex = 0;
            if (tile.tabIndex === -1)
                this.nextTile();
        },
        onKeyDown(e) {
            if (e.keyCode === keyCodes.esc) {
                // Wait for dependent elements to close first
                setTimeout(() => { this.isActive = false; });
                const activator = this.getActivator();
                this.$nextTick(() => activator && activator.focus());
            }
            else if (!this.isActive &&
                [keyCodes.up, keyCodes.down].includes(e.keyCode)) {
                this.isActive = true;
            }
            // Allow for isActive watcher to generate tile list
            this.$nextTick(() => this.changeListIndex(e));
        },
        onResize() {
            if (!this.isActive)
                return;
            // Account for screen resize
            // and orientation change
            // eslint-disable-next-line no-unused-expressions
            this.$refs.content.offsetWidth;
            this.updateDimensions();
            // When resizing to a smaller width
            // content width is evaluated before
            // the new activator width has been
            // set, causing it to not size properly
            // hacky but will revisit in the future
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = window.setTimeout(this.updateDimensions, 100);
        },
    },
    render(h) {
        const data = {
            staticClass: 'v-menu',
            class: {
                'v-menu--attached': this.attach === '' ||
                    this.attach === true ||
                    this.attach === 'attach',
            },
            directives: [{
                    arg: '500',
                    name: 'resize',
                    value: this.onResize,
                }],
        };
        return h('div', data, [
            !this.activator && this.genActivator(),
            this.showLazyContent(() => [
                this.$createElement(VThemeProvider, {
                    props: {
                        root: true,
                        light: this.light,
                        dark: this.dark,
                    },
                }, [this.genTransition()]),
            ]),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVk1lbnUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WTWVudS9WTWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxjQUFjLENBQUE7QUFFckIsYUFBYTtBQUNiLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUVsRCxTQUFTO0FBQ1QsT0FBTyxXQUFXLE1BQU0sMEJBQTBCLENBQUE7QUFDbEQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxRQUFRLE1BQU0sdUJBQXVCLENBQUE7QUFDNUMsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsYUFBYTtBQUNiLE9BQU8sWUFBWSxNQUFNLGdDQUFnQyxDQUFBO0FBQ3pELE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDNUMsT0FBTyxFQUNMLGFBQWEsRUFDYixRQUFRLEdBQ1QsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQixPQUFPLElBQUksTUFBTSxxQkFBcUIsQ0FBQTtBQUt0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLFNBQVMsRUFDVCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFNBQVMsRUFDVCxTQUFTLEVBQ1QsUUFBUSxDQUNULENBQUE7QUFFRCxvQkFBb0I7QUFDcEIsZUFBZSxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQy9CLElBQUksRUFBRSxRQUFRO0lBRWQsVUFBVSxFQUFFO1FBQ1YsWUFBWTtRQUNaLE1BQU07S0FDUDtJQUVE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SUFBSTt3QkFDVixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7d0JBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtxQkFDaEI7aUJBQ0YsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2FBQzNCLENBQUM7U0FDSCxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVk1lbnUuc2FzcydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IHsgVlRoZW1lUHJvdmlkZXIgfSBmcm9tICcuLi9WVGhlbWVQcm92aWRlcidcblxuLy8gTWl4aW5zXG5pbXBvcnQgQWN0aXZhdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2FjdGl2YXRhYmxlJ1xuaW1wb3J0IERlbGF5YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvZGVsYXlhYmxlJ1xuaW1wb3J0IERlcGVuZGVudCBmcm9tICcuLi8uLi9taXhpbnMvZGVwZW5kZW50J1xuaW1wb3J0IE1lbnVhYmxlIGZyb20gJy4uLy4uL21peGlucy9tZW51YWJsZSdcbmltcG9ydCBSZXR1cm5hYmxlIGZyb20gJy4uLy4uL21peGlucy9yZXR1cm5hYmxlJ1xuaW1wb3J0IFJvdW5kYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvcm91bmRhYmxlJ1xuaW1wb3J0IFRoZW1lYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdGhlbWVhYmxlJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgQ2xpY2tPdXRzaWRlIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvY2xpY2stb3V0c2lkZSdcbmltcG9ydCBSZXNpemUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yZXNpemUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IHJlbW92ZWQgfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5pbXBvcnQge1xuICBjb252ZXJ0VG9Vbml0LFxuICBrZXlDb2Rlcyxcbn0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IGdvVG8gZnJvbSAnLi4vLi4vc2VydmljZXMvZ290bydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURpcmVjdGl2ZSwgVk5vZGVEYXRhIH0gZnJvbSAndnVlJ1xuXG5jb25zdCBiYXNlTWl4aW5zID0gbWl4aW5zKFxuICBEZXBlbmRlbnQsXG4gIERlbGF5YWJsZSxcbiAgUmV0dXJuYWJsZSxcbiAgUm91bmRhYmxlLFxuICBUaGVtZWFibGUsXG4gIE1lbnVhYmxlLFxuKVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQoe1xuICBuYW1lOiAndi1tZW51JyxcblxuICBkaXJlY3RpdmVzOiB7XG4gICAgQ2xpY2tPdXRzaWRlLFxuICAgIFJlc2l6ZSxcbiAgfSxcblxuICBwcm92aWRlICgpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBpc0luTWVudTogdHJ1ZSxcbiAgICAgIC8vIFBhc3MgdGhlbWUgdGhyb3VnaCB0byBkZWZhdWx0IHNsb3RcbiAgICAgIHRoZW1lOiB0aGlzLnRoZW1lLFxuICAgIH1cbiAgfSxcblxuICBwcm9wczoge1xuICAgIGF1dG86IEJvb2xlYW4sXG4gICAgY2xvc2VPbkNsaWNrOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGNsb3NlT25Db250ZW50Q2xpY2s6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgZGlzYWJsZUtleXM6IEJvb2xlYW4sXG4gICAgbWF4SGVpZ2h0OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogJ2F1dG8nLFxuICAgIH0sXG4gICAgb2Zmc2V0WDogQm9vbGVhbixcbiAgICBvZmZzZXRZOiBCb29sZWFuLFxuICAgIG9wZW5PbkhvdmVyOiBCb29sZWFuLFxuICAgIG9yaWdpbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ3RvcCBsZWZ0JyxcbiAgICB9LFxuICAgIHRyYW5zaXRpb246IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogJ3YtbWVudS10cmFuc2l0aW9uJyxcbiAgICB9LFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjYWxjdWxhdGVkVG9wQXV0bzogMCxcbiAgICAgIGRlZmF1bHRPZmZzZXQ6IDgsXG4gICAgICBoYXNKdXN0Rm9jdXNlZDogZmFsc2UsXG4gICAgICBsaXN0SW5kZXg6IC0xLFxuICAgICAgcmVzaXplVGltZW91dDogMCxcbiAgICAgIHNlbGVjdGVkSW5kZXg6IG51bGwgYXMgbnVsbCB8IG51bWJlcixcbiAgICAgIHRpbGVzOiBbXSBhcyBIVE1MRWxlbWVudFtdLFxuICAgIH1cbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGFjdGl2ZVRpbGUgKCk6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgICAgIHJldHVybiB0aGlzLnRpbGVzW3RoaXMubGlzdEluZGV4XVxuICAgIH0sXG4gICAgY2FsY3VsYXRlZExlZnQgKCk6IHN0cmluZyB7XG4gICAgICBjb25zdCBtZW51V2lkdGggPSBNYXRoLm1heCh0aGlzLmRpbWVuc2lvbnMuY29udGVudC53aWR0aCwgcGFyc2VGbG9hdCh0aGlzLmNhbGN1bGF0ZWRNaW5XaWR0aCkpXG5cbiAgICAgIGlmICghdGhpcy5hdXRvKSByZXR1cm4gdGhpcy5jYWxjTGVmdChtZW51V2lkdGgpIHx8ICcwJ1xuXG4gICAgICByZXR1cm4gY29udmVydFRvVW5pdCh0aGlzLmNhbGNYT3ZlcmZsb3codGhpcy5jYWxjTGVmdEF1dG8oKSwgbWVudVdpZHRoKSkgfHwgJzAnXG4gICAgfSxcbiAgICBjYWxjdWxhdGVkTWF4SGVpZ2h0ICgpOiBzdHJpbmcge1xuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5hdXRvXG4gICAgICAgID8gJzIwMHB4J1xuICAgICAgICA6IGNvbnZlcnRUb1VuaXQodGhpcy5tYXhIZWlnaHQpXG5cbiAgICAgIHJldHVybiBoZWlnaHQgfHwgJzAnXG4gICAgfSxcbiAgICBjYWxjdWxhdGVkTWF4V2lkdGggKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gY29udmVydFRvVW5pdCh0aGlzLm1heFdpZHRoKSB8fCAnMCdcbiAgICB9LFxuICAgIGNhbGN1bGF0ZWRNaW5XaWR0aCAoKTogc3RyaW5nIHtcbiAgICAgIGlmICh0aGlzLm1pbldpZHRoKSB7XG4gICAgICAgIHJldHVybiBjb252ZXJ0VG9Vbml0KHRoaXMubWluV2lkdGgpIHx8ICcwJ1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtaW5XaWR0aCA9IE1hdGgubWluKFxuICAgICAgICB0aGlzLmRpbWVuc2lvbnMuYWN0aXZhdG9yLndpZHRoICtcbiAgICAgICAgTnVtYmVyKHRoaXMubnVkZ2VXaWR0aCkgK1xuICAgICAgICAodGhpcy5hdXRvID8gMTYgOiAwKSxcbiAgICAgICAgTWF0aC5tYXgodGhpcy5wYWdlV2lkdGggLSAyNCwgMClcbiAgICAgIClcblxuICAgICAgY29uc3QgY2FsY3VsYXRlZE1heFdpZHRoID0gaXNOYU4ocGFyc2VJbnQodGhpcy5jYWxjdWxhdGVkTWF4V2lkdGgpKVxuICAgICAgICA/IG1pbldpZHRoXG4gICAgICAgIDogcGFyc2VJbnQodGhpcy5jYWxjdWxhdGVkTWF4V2lkdGgpXG5cbiAgICAgIHJldHVybiBjb252ZXJ0VG9Vbml0KE1hdGgubWluKFxuICAgICAgICBjYWxjdWxhdGVkTWF4V2lkdGgsXG4gICAgICAgIG1pbldpZHRoXG4gICAgICApKSB8fCAnMCdcbiAgICB9LFxuICAgIGNhbGN1bGF0ZWRUb3AgKCk6IHN0cmluZyB7XG4gICAgICBjb25zdCB0b3AgPSAhdGhpcy5hdXRvXG4gICAgICAgID8gdGhpcy5jYWxjVG9wKClcbiAgICAgICAgOiBjb252ZXJ0VG9Vbml0KHRoaXMuY2FsY1lPdmVyZmxvdyh0aGlzLmNhbGN1bGF0ZWRUb3BBdXRvKSlcblxuICAgICAgcmV0dXJuIHRvcCB8fCAnMCdcbiAgICB9LFxuICAgIGhhc0NsaWNrYWJsZVRpbGVzICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBCb29sZWFuKHRoaXMudGlsZXMuZmluZCh0aWxlID0+IHRpbGUudGFiSW5kZXggPiAtMSkpXG4gICAgfSxcbiAgICBzdHlsZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuY2FsY3VsYXRlZE1heEhlaWdodCxcbiAgICAgICAgbWluV2lkdGg6IHRoaXMuY2FsY3VsYXRlZE1pbldpZHRoLFxuICAgICAgICBtYXhXaWR0aDogdGhpcy5jYWxjdWxhdGVkTWF4V2lkdGgsXG4gICAgICAgIHRvcDogdGhpcy5jYWxjdWxhdGVkVG9wLFxuICAgICAgICBsZWZ0OiB0aGlzLmNhbGN1bGF0ZWRMZWZ0LFxuICAgICAgICB0cmFuc2Zvcm1PcmlnaW46IHRoaXMub3JpZ2luLFxuICAgICAgICB6SW5kZXg6IHRoaXMuekluZGV4IHx8IHRoaXMuYWN0aXZlWkluZGV4LFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBpc0FjdGl2ZSAodmFsKSB7XG4gICAgICBpZiAoIXZhbCkgdGhpcy5saXN0SW5kZXggPSAtMVxuICAgIH0sXG4gICAgaXNDb250ZW50QWN0aXZlICh2YWwpIHtcbiAgICAgIHRoaXMuaGFzSnVzdEZvY3VzZWQgPSB2YWxcbiAgICB9LFxuICAgIGxpc3RJbmRleCAobmV4dCwgcHJldikge1xuICAgICAgaWYgKG5leHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBjb25zdCB0aWxlID0gdGhpcy50aWxlc1tuZXh0XVxuICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoJ3YtbGlzdC1pdGVtLS1oaWdobGlnaHRlZCcpXG4gICAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IHRoaXMuJHJlZnMuY29udGVudC5zY3JvbGxUb3BcbiAgICAgICAgY29uc3QgY29udGVudEhlaWdodCA9IHRoaXMuJHJlZnMuY29udGVudC5jbGllbnRIZWlnaHRcblxuICAgICAgICBpZiAoc2Nyb2xsVG9wID4gdGlsZS5vZmZzZXRUb3AgLSA4KSB7XG4gICAgICAgICAgZ29Ubyh0aWxlLm9mZnNldFRvcCAtIHRpbGUuY2xpZW50SGVpZ2h0LCB7XG4gICAgICAgICAgICBhcHBPZmZzZXQ6IGZhbHNlLFxuICAgICAgICAgICAgZHVyYXRpb246IDMwMCxcbiAgICAgICAgICAgIGNvbnRhaW5lcjogdGhpcy4kcmVmcy5jb250ZW50LFxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsVG9wICsgY29udGVudEhlaWdodCA8IHRpbGUub2Zmc2V0VG9wICsgdGlsZS5jbGllbnRIZWlnaHQgKyA4KSB7XG4gICAgICAgICAgZ29Ubyh0aWxlLm9mZnNldFRvcCAtIGNvbnRlbnRIZWlnaHQgKyB0aWxlLmNsaWVudEhlaWdodCAqIDIsIHtcbiAgICAgICAgICAgIGFwcE9mZnNldDogZmFsc2UsXG4gICAgICAgICAgICBkdXJhdGlvbjogMzAwLFxuICAgICAgICAgICAgY29udGFpbmVyOiB0aGlzLiRyZWZzLmNvbnRlbnQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcmV2IGluIHRoaXMudGlsZXMgJiZcbiAgICAgICAgdGhpcy50aWxlc1twcmV2XS5jbGFzc0xpc3QucmVtb3ZlKCd2LWxpc3QtaXRlbS0taGlnaGxpZ2h0ZWQnKVxuICAgIH0sXG4gIH0sXG5cbiAgY3JlYXRlZCAoKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAodGhpcy4kYXR0cnMuaGFzT3duUHJvcGVydHkoJ2Z1bGwtd2lkdGgnKSkge1xuICAgICAgcmVtb3ZlZCgnZnVsbC13aWR0aCcsIHRoaXMpXG4gICAgfVxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIHRoaXMuaXNBY3RpdmUgJiYgdGhpcy5jYWxsQWN0aXZhdGUoKVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBhY3RpdmF0ZSAoKSB7XG4gICAgICAvLyBVcGRhdGUgY29vcmRpbmF0ZXMgYW5kIGRpbWVuc2lvbnMgb2YgbWVudVxuICAgICAgLy8gYW5kIGl0cyBhY3RpdmF0b3JcbiAgICAgIHRoaXMudXBkYXRlRGltZW5zaW9ucygpXG4gICAgICAvLyBTdGFydCB0aGUgdHJhbnNpdGlvblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgLy8gT25jZSB0cmFuc2l0aW9uaW5nLCBjYWxjdWxhdGUgc2Nyb2xsIGFuZCB0b3AgcG9zaXRpb25cbiAgICAgICAgdGhpcy5zdGFydFRyYW5zaXRpb24oKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy4kcmVmcy5jb250ZW50KSB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZWRUb3BBdXRvID0gdGhpcy5jYWxjVG9wQXV0bygpXG4gICAgICAgICAgICB0aGlzLmF1dG8gJiYgKHRoaXMuJHJlZnMuY29udGVudC5zY3JvbGxUb3AgPSB0aGlzLmNhbGNTY3JvbGxQb3NpdGlvbigpKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjYWxjU2Nyb2xsUG9zaXRpb24gKCkge1xuICAgICAgY29uc3QgJGVsID0gdGhpcy4kcmVmcy5jb250ZW50XG4gICAgICBjb25zdCBhY3RpdmVUaWxlID0gJGVsLnF1ZXJ5U2VsZWN0b3IoJy52LWxpc3QtaXRlbS0tYWN0aXZlJykgYXMgSFRNTEVsZW1lbnRcbiAgICAgIGNvbnN0IG1heFNjcm9sbFRvcCA9ICRlbC5zY3JvbGxIZWlnaHQgLSAkZWwub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIHJldHVybiBhY3RpdmVUaWxlXG4gICAgICAgID8gTWF0aC5taW4obWF4U2Nyb2xsVG9wLCBNYXRoLm1heCgwLCBhY3RpdmVUaWxlLm9mZnNldFRvcCAtICRlbC5vZmZzZXRIZWlnaHQgLyAyICsgYWN0aXZlVGlsZS5vZmZzZXRIZWlnaHQgLyAyKSlcbiAgICAgICAgOiAkZWwuc2Nyb2xsVG9wXG4gICAgfSxcbiAgICBjYWxjTGVmdEF1dG8gKCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMuZGltZW5zaW9ucy5hY3RpdmF0b3IubGVmdCAtIHRoaXMuZGVmYXVsdE9mZnNldCAqIDIpXG4gICAgfSxcbiAgICBjYWxjVG9wQXV0byAoKSB7XG4gICAgICBjb25zdCAkZWwgPSB0aGlzLiRyZWZzLmNvbnRlbnRcbiAgICAgIGNvbnN0IGFjdGl2ZVRpbGUgPSAkZWwucXVlcnlTZWxlY3RvcignLnYtbGlzdC1pdGVtLS1hY3RpdmUnKSBhcyBIVE1MRWxlbWVudCB8IG51bGxcblxuICAgICAgaWYgKCFhY3RpdmVUaWxlKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IG51bGxcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub2Zmc2V0WSB8fCAhYWN0aXZlVGlsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wdXRlZFRvcFxuICAgICAgfVxuXG4gICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBBcnJheS5mcm9tKHRoaXMudGlsZXMpLmluZGV4T2YoYWN0aXZlVGlsZSlcblxuICAgICAgY29uc3QgdGlsZURpc3RhbmNlRnJvbU1lbnVUb3AgPSBhY3RpdmVUaWxlLm9mZnNldFRvcCAtIHRoaXMuY2FsY1Njcm9sbFBvc2l0aW9uKClcbiAgICAgIGNvbnN0IGZpcnN0VGlsZU9mZnNldFRvcCA9ICgkZWwucXVlcnlTZWxlY3RvcignLnYtbGlzdC1pdGVtJykgYXMgSFRNTEVsZW1lbnQpLm9mZnNldFRvcFxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wdXRlZFRvcCAtIHRpbGVEaXN0YW5jZUZyb21NZW51VG9wIC0gZmlyc3RUaWxlT2Zmc2V0VG9wIC0gMVxuICAgIH0sXG4gICAgY2hhbmdlTGlzdEluZGV4IChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAvLyBGb3IgaW5maW5pdGUgc2Nyb2xsIGFuZCBhdXRvY29tcGxldGUsIHJlLWV2YWx1YXRlIGNoaWxkcmVuXG4gICAgICB0aGlzLmdldFRpbGVzKClcblxuICAgICAgaWYgKCF0aGlzLmlzQWN0aXZlIHx8ICF0aGlzLmhhc0NsaWNrYWJsZVRpbGVzKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IGtleUNvZGVzLnRhYikge1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgICAgICAgcmV0dXJuXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5Q29kZXMuZG93bikge1xuICAgICAgICB0aGlzLm5leHRUaWxlKClcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy51cCkge1xuICAgICAgICB0aGlzLnByZXZUaWxlKClcbiAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5lbmQpIHtcbiAgICAgICAgdGhpcy5sYXN0VGlsZSgpXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5Q29kZXMuaG9tZSkge1xuICAgICAgICB0aGlzLmZpcnN0VGlsZSgpXG4gICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0ga2V5Q29kZXMuZW50ZXIgJiYgdGhpcy5saXN0SW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMudGlsZXNbdGhpcy5saXN0SW5kZXhdLmNsaWNrKClcbiAgICAgIH0gZWxzZSB7IHJldHVybiB9XG4gICAgICAvLyBPbmUgb2YgdGhlIGNvbmRpdGlvbnMgd2FzIG1ldCwgcHJldmVudCBkZWZhdWx0IGFjdGlvbiAoIzI5ODgpXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB9LFxuICAgIGNsb3NlQ29uZGl0aW9uYWwgKGU6IEV2ZW50KSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudFxuXG4gICAgICByZXR1cm4gdGhpcy5pc0FjdGl2ZSAmJlxuICAgICAgICAhdGhpcy5faXNEZXN0cm95ZWQgJiZcbiAgICAgICAgdGhpcy5jbG9zZU9uQ2xpY2sgJiZcbiAgICAgICAgIXRoaXMuJHJlZnMuY29udGVudC5jb250YWlucyh0YXJnZXQpXG4gICAgfSxcbiAgICBnZW5BY3RpdmF0b3JBdHRyaWJ1dGVzICgpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBBY3RpdmF0YWJsZS5vcHRpb25zLm1ldGhvZHMuZ2VuQWN0aXZhdG9yQXR0cmlidXRlcy5jYWxsKHRoaXMpXG5cbiAgICAgIGlmICh0aGlzLmFjdGl2ZVRpbGUgJiYgdGhpcy5hY3RpdmVUaWxlLmlkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYXR0cmlidXRlcyxcbiAgICAgICAgICAnYXJpYS1hY3RpdmVkZXNjZW5kYW50JzogdGhpcy5hY3RpdmVUaWxlLmlkLFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhdHRyaWJ1dGVzXG4gICAgfSxcbiAgICBnZW5BY3RpdmF0b3JMaXN0ZW5lcnMgKCkge1xuICAgICAgY29uc3QgbGlzdGVuZXJzID0gTWVudWFibGUub3B0aW9ucy5tZXRob2RzLmdlbkFjdGl2YXRvckxpc3RlbmVycy5jYWxsKHRoaXMpXG5cbiAgICAgIGlmICghdGhpcy5kaXNhYmxlS2V5cykge1xuICAgICAgICBsaXN0ZW5lcnMua2V5ZG93biA9IHRoaXMub25LZXlEb3duXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsaXN0ZW5lcnNcbiAgICB9LFxuICAgIGdlblRyYW5zaXRpb24gKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdlbkNvbnRlbnQoKVxuXG4gICAgICBpZiAoIXRoaXMudHJhbnNpdGlvbikgcmV0dXJuIGNvbnRlbnRcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RyYW5zaXRpb24nLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgbmFtZTogdGhpcy50cmFuc2l0aW9uLFxuICAgICAgICB9LFxuICAgICAgfSwgW2NvbnRlbnRdKVxuICAgIH0sXG4gICAgZ2VuRGlyZWN0aXZlcyAoKTogVk5vZGVEaXJlY3RpdmVbXSB7XG4gICAgICBjb25zdCBkaXJlY3RpdmVzOiBWTm9kZURpcmVjdGl2ZVtdID0gW3tcbiAgICAgICAgbmFtZTogJ3Nob3cnLFxuICAgICAgICB2YWx1ZTogdGhpcy5pc0NvbnRlbnRBY3RpdmUsXG4gICAgICB9XVxuXG4gICAgICAvLyBEbyBub3QgYWRkIGNsaWNrIG91dHNpZGUgZm9yIGhvdmVyIG1lbnVcbiAgICAgIGlmICghdGhpcy5vcGVuT25Ib3ZlciAmJiB0aGlzLmNsb3NlT25DbGljaykge1xuICAgICAgICBkaXJlY3RpdmVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6ICdjbGljay1vdXRzaWRlJyxcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgaGFuZGxlcjogKCkgPT4geyB0aGlzLmlzQWN0aXZlID0gZmFsc2UgfSxcbiAgICAgICAgICAgIGNsb3NlQ29uZGl0aW9uYWw6IHRoaXMuY2xvc2VDb25kaXRpb25hbCxcbiAgICAgICAgICAgIGluY2x1ZGU6ICgpID0+IFt0aGlzLiRlbCwgLi4udGhpcy5nZXRPcGVuRGVwZW5kZW50RWxlbWVudHMoKV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRpcmVjdGl2ZXNcbiAgICB9LFxuICAgIGdlbkNvbnRlbnQgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgLi4udGhpcy5nZXRTY29wZUlkQXR0cnMoKSxcbiAgICAgICAgICByb2xlOiAncm9sZScgaW4gdGhpcy4kYXR0cnMgPyB0aGlzLiRhdHRycy5yb2xlIDogJ21lbnUnLFxuICAgICAgICB9LFxuICAgICAgICBzdGF0aWNDbGFzczogJ3YtbWVudV9fY29udGVudCcsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgLi4udGhpcy5yb290VGhlbWVDbGFzc2VzLFxuICAgICAgICAgIC4uLnRoaXMucm91bmRlZENsYXNzZXMsXG4gICAgICAgICAgJ3YtbWVudV9fY29udGVudC0tYXV0byc6IHRoaXMuYXV0byxcbiAgICAgICAgICAndi1tZW51X19jb250ZW50LS1maXhlZCc6IHRoaXMuYWN0aXZhdG9yRml4ZWQsXG4gICAgICAgICAgbWVudWFibGVfX2NvbnRlbnRfX2FjdGl2ZTogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgICBbdGhpcy5jb250ZW50Q2xhc3MudHJpbSgpXTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGU6IHRoaXMuc3R5bGVzLFxuICAgICAgICBkaXJlY3RpdmVzOiB0aGlzLmdlbkRpcmVjdGl2ZXMoKSxcbiAgICAgICAgcmVmOiAnY29udGVudCcsXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnRcblxuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJykpIHJldHVyblxuICAgICAgICAgICAgaWYgKHRoaXMuY2xvc2VPbkNvbnRlbnRDbGljaykgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBrZXlkb3duOiB0aGlzLm9uS2V5RG93bixcbiAgICAgICAgfSxcbiAgICAgIH0gYXMgVk5vZGVEYXRhXG5cbiAgICAgIGlmICh0aGlzLiRsaXN0ZW5lcnMuc2Nyb2xsKSB7XG4gICAgICAgIG9wdGlvbnMub24gPSBvcHRpb25zLm9uIHx8IHt9XG4gICAgICAgIG9wdGlvbnMub24uc2Nyb2xsID0gdGhpcy4kbGlzdGVuZXJzLnNjcm9sbFxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuZGlzYWJsZWQgJiYgdGhpcy5vcGVuT25Ib3Zlcikge1xuICAgICAgICBvcHRpb25zLm9uID0gb3B0aW9ucy5vbiB8fCB7fVxuICAgICAgICBvcHRpb25zLm9uLm1vdXNlZW50ZXIgPSB0aGlzLm1vdXNlRW50ZXJIYW5kbGVyXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wZW5PbkhvdmVyKSB7XG4gICAgICAgIG9wdGlvbnMub24gPSBvcHRpb25zLm9uIHx8IHt9XG4gICAgICAgIG9wdGlvbnMub24ubW91c2VsZWF2ZSA9IHRoaXMubW91c2VMZWF2ZUhhbmRsZXJcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIG9wdGlvbnMsIHRoaXMuZ2V0Q29udGVudFNsb3QoKSlcbiAgICB9LFxuICAgIGdldFRpbGVzICgpIHtcbiAgICAgIGlmICghdGhpcy4kcmVmcy5jb250ZW50KSByZXR1cm5cblxuICAgICAgdGhpcy50aWxlcyA9IEFycmF5LmZyb20odGhpcy4kcmVmcy5jb250ZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy52LWxpc3QtaXRlbSwgLnYtZGl2aWRlciwgLnYtc3ViaGVhZGVyJykpXG4gICAgfSxcbiAgICBtb3VzZUVudGVySGFuZGxlciAoKSB7XG4gICAgICB0aGlzLnJ1bkRlbGF5KCdvcGVuJywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5oYXNKdXN0Rm9jdXNlZCkgcmV0dXJuXG5cbiAgICAgICAgdGhpcy5oYXNKdXN0Rm9jdXNlZCA9IHRydWVcbiAgICAgIH0pXG4gICAgfSxcbiAgICBtb3VzZUxlYXZlSGFuZGxlciAoZTogTW91c2VFdmVudCkge1xuICAgICAgLy8gUHJldmVudCBhY2NpZGVudGFsIHJlLWFjdGl2YXRpb25cbiAgICAgIHRoaXMucnVuRGVsYXkoJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy4kcmVmcy5jb250ZW50Py5jb250YWlucyhlLnJlbGF0ZWRUYXJnZXQgYXMgSFRNTEVsZW1lbnQpKSByZXR1cm5cblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZVxuICAgICAgICAgIHRoaXMuY2FsbERlYWN0aXZhdGUoKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuICAgIG5leHRUaWxlICgpIHtcbiAgICAgIGNvbnN0IHRpbGUgPSB0aGlzLnRpbGVzW3RoaXMubGlzdEluZGV4ICsgMV1cblxuICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgIGlmICghdGhpcy50aWxlcy5sZW5ndGgpIHJldHVyblxuXG4gICAgICAgIHRoaXMubGlzdEluZGV4ID0gLTFcbiAgICAgICAgdGhpcy5uZXh0VGlsZSgpXG5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMubGlzdEluZGV4KytcbiAgICAgIGlmICh0aWxlLnRhYkluZGV4ID09PSAtMSkgdGhpcy5uZXh0VGlsZSgpXG4gICAgfSxcbiAgICBwcmV2VGlsZSAoKSB7XG4gICAgICBjb25zdCB0aWxlID0gdGhpcy50aWxlc1t0aGlzLmxpc3RJbmRleCAtIDFdXG5cbiAgICAgIGlmICghdGlsZSkge1xuICAgICAgICBpZiAoIXRoaXMudGlsZXMubGVuZ3RoKSByZXR1cm5cblxuICAgICAgICB0aGlzLmxpc3RJbmRleCA9IHRoaXMudGlsZXMubGVuZ3RoXG4gICAgICAgIHRoaXMucHJldlRpbGUoKVxuXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RJbmRleC0tXG4gICAgICBpZiAodGlsZS50YWJJbmRleCA9PT0gLTEpIHRoaXMucHJldlRpbGUoKVxuICAgIH0sXG4gICAgbGFzdFRpbGUgKCkge1xuICAgICAgY29uc3QgdGlsZSA9IHRoaXMudGlsZXNbdGhpcy50aWxlcy5sZW5ndGggLSAxXVxuXG4gICAgICBpZiAoIXRpbGUpIHJldHVyblxuXG4gICAgICB0aGlzLmxpc3RJbmRleCA9IHRoaXMudGlsZXMubGVuZ3RoIC0gMVxuXG4gICAgICBpZiAodGlsZS50YWJJbmRleCA9PT0gLTEpIHRoaXMucHJldlRpbGUoKVxuICAgIH0sXG4gICAgZmlyc3RUaWxlICgpIHtcbiAgICAgIGNvbnN0IHRpbGUgPSB0aGlzLnRpbGVzWzBdXG5cbiAgICAgIGlmICghdGlsZSkgcmV0dXJuXG5cbiAgICAgIHRoaXMubGlzdEluZGV4ID0gMFxuXG4gICAgICBpZiAodGlsZS50YWJJbmRleCA9PT0gLTEpIHRoaXMubmV4dFRpbGUoKVxuICAgIH0sXG4gICAgb25LZXlEb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5lc2MpIHtcbiAgICAgICAgLy8gV2FpdCBmb3IgZGVwZW5kZW50IGVsZW1lbnRzIHRvIGNsb3NlIGZpcnN0XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLmlzQWN0aXZlID0gZmFsc2UgfSlcbiAgICAgICAgY29uc3QgYWN0aXZhdG9yID0gdGhpcy5nZXRBY3RpdmF0b3IoKVxuICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiBhY3RpdmF0b3IgJiYgYWN0aXZhdG9yLmZvY3VzKCkpXG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAhdGhpcy5pc0FjdGl2ZSAmJlxuICAgICAgICBba2V5Q29kZXMudXAsIGtleUNvZGVzLmRvd25dLmluY2x1ZGVzKGUua2V5Q29kZSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICAvLyBBbGxvdyBmb3IgaXNBY3RpdmUgd2F0Y2hlciB0byBnZW5lcmF0ZSB0aWxlIGxpc3RcbiAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHRoaXMuY2hhbmdlTGlzdEluZGV4KGUpKVxuICAgIH0sXG4gICAgb25SZXNpemUgKCkge1xuICAgICAgaWYgKCF0aGlzLmlzQWN0aXZlKSByZXR1cm5cblxuICAgICAgLy8gQWNjb3VudCBmb3Igc2NyZWVuIHJlc2l6ZVxuICAgICAgLy8gYW5kIG9yaWVudGF0aW9uIGNoYW5nZVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC1leHByZXNzaW9uc1xuICAgICAgdGhpcy4kcmVmcy5jb250ZW50Lm9mZnNldFdpZHRoXG4gICAgICB0aGlzLnVwZGF0ZURpbWVuc2lvbnMoKVxuXG4gICAgICAvLyBXaGVuIHJlc2l6aW5nIHRvIGEgc21hbGxlciB3aWR0aFxuICAgICAgLy8gY29udGVudCB3aWR0aCBpcyBldmFsdWF0ZWQgYmVmb3JlXG4gICAgICAvLyB0aGUgbmV3IGFjdGl2YXRvciB3aWR0aCBoYXMgYmVlblxuICAgICAgLy8gc2V0LCBjYXVzaW5nIGl0IHRvIG5vdCBzaXplIHByb3Blcmx5XG4gICAgICAvLyBoYWNreSBidXQgd2lsbCByZXZpc2l0IGluIHRoZSBmdXR1cmVcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2l6ZVRpbWVvdXQpXG4gICAgICB0aGlzLnJlc2l6ZVRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnVwZGF0ZURpbWVuc2lvbnMsIDEwMClcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LW1lbnUnLFxuICAgICAgY2xhc3M6IHtcbiAgICAgICAgJ3YtbWVudS0tYXR0YWNoZWQnOlxuICAgICAgICAgIHRoaXMuYXR0YWNoID09PSAnJyB8fFxuICAgICAgICAgIHRoaXMuYXR0YWNoID09PSB0cnVlIHx8XG4gICAgICAgICAgdGhpcy5hdHRhY2ggPT09ICdhdHRhY2gnLFxuICAgICAgfSxcbiAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgIGFyZzogJzUwMCcsXG4gICAgICAgIG5hbWU6ICdyZXNpemUnLFxuICAgICAgICB2YWx1ZTogdGhpcy5vblJlc2l6ZSxcbiAgICAgIH1dLFxuICAgIH1cblxuICAgIHJldHVybiBoKCdkaXYnLCBkYXRhLCBbXG4gICAgICAhdGhpcy5hY3RpdmF0b3IgJiYgdGhpcy5nZW5BY3RpdmF0b3IoKSxcbiAgICAgIHRoaXMuc2hvd0xhenlDb250ZW50KCgpID0+IFtcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudChWVGhlbWVQcm92aWRlciwge1xuICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICByb290OiB0cnVlLFxuICAgICAgICAgICAgbGlnaHQ6IHRoaXMubGlnaHQsXG4gICAgICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICAgICAgfSxcbiAgICAgICAgfSwgW3RoaXMuZ2VuVHJhbnNpdGlvbigpXSksXG4gICAgICBdKSxcbiAgICBdKVxuICB9LFxufSlcbiJdfQ==
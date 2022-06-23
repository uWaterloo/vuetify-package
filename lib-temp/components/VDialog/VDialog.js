// Styles
import './VDialog.sass';
// Components
import { VThemeProvider } from '../VThemeProvider';
// Mixins
import Activatable from '../../mixins/activatable';
import Dependent from '../../mixins/dependent';
import Detachable from '../../mixins/detachable';
import Overlayable from '../../mixins/overlayable';
import Returnable from '../../mixins/returnable';
import Stackable from '../../mixins/stackable';
// Directives
import ClickOutside from '../../directives/click-outside';
// Helpers
import mixins from '../../util/mixins';
import { removed } from '../../util/console';
import { convertToUnit, keyCodes, } from '../../util/helpers';
const baseMixins = mixins(Dependent, Detachable, Overlayable, Returnable, Stackable, Activatable);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-dialog',
    directives: { ClickOutside },
    props: {
        dark: Boolean,
        disabled: Boolean,
        fullscreen: Boolean,
        light: Boolean,
        maxWidth: [String, Number],
        noClickAnimation: Boolean,
        origin: {
            type: String,
            default: 'center center',
        },
        persistent: Boolean,
        retainFocus: {
            type: Boolean,
            default: true,
        },
        scrollable: Boolean,
        transition: {
            type: [String, Boolean],
            default: 'dialog-transition',
        },
        width: [String, Number],
    },
    data() {
        return {
            activatedBy: null,
            animate: false,
            animateTimeout: -1,
            stackMinZIndex: 200,
            previousActiveElement: null,
        };
    },
    computed: {
        classes() {
            return {
                [(`v-dialog ${this.contentClass}`).trim()]: true,
                'v-dialog--active': this.isActive,
                'v-dialog--persistent': this.persistent,
                'v-dialog--fullscreen': this.fullscreen,
                'v-dialog--scrollable': this.scrollable,
                'v-dialog--animated': this.animate,
            };
        },
        contentClasses() {
            return {
                'v-dialog__content': true,
                'v-dialog__content--active': this.isActive,
            };
        },
        hasActivator() {
            return Boolean(!!this.$slots.activator ||
                !!this.$scopedSlots.activator);
        },
    },
    watch: {
        isActive(val) {
            if (val) {
                this.show();
                this.hideScroll();
            }
            else {
                this.removeOverlay();
                this.unbind();
                this.previousActiveElement?.focus();
            }
        },
        fullscreen(val) {
            if (!this.isActive)
                return;
            if (val) {
                this.hideScroll();
                this.removeOverlay(false);
            }
            else {
                this.showScroll();
                this.genOverlay();
            }
        },
    },
    created() {
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('full-width')) {
            removed('full-width', this);
        }
    },
    beforeMount() {
        this.$nextTick(() => {
            this.isBooted = this.isActive;
            this.isActive && this.show();
        });
    },
    beforeDestroy() {
        if (typeof window !== 'undefined')
            this.unbind();
    },
    methods: {
        animateClick() {
            this.animate = false;
            // Needed for when clicking very fast
            // outside of the dialog
            this.$nextTick(() => {
                this.animate = true;
                window.clearTimeout(this.animateTimeout);
                this.animateTimeout = window.setTimeout(() => (this.animate = false), 150);
            });
        },
        closeConditional(e) {
            const target = e.target;
            // Ignore the click if the dialog is closed or destroyed,
            // if it was on an element inside the content,
            // if it was dragged onto the overlay (#6969),
            // or if this isn't the topmost dialog (#9907)
            return !(this._isDestroyed ||
                !this.isActive ||
                this.$refs.content.contains(target) ||
                (this.overlay && target && !this.overlay.$el.contains(target))) && this.activeZIndex >= this.getMaxZIndex();
        },
        hideScroll() {
            if (this.fullscreen) {
                document.documentElement.classList.add('overflow-y-hidden');
            }
            else {
                Overlayable.options.methods.hideScroll.call(this);
            }
        },
        show() {
            !this.fullscreen && !this.hideOverlay && this.genOverlay();
            // Double nextTick to wait for lazy content to be generated
            this.$nextTick(() => {
                this.$nextTick(() => {
                    if (!this.$refs.content.contains(document.activeElement)) {
                        this.previousActiveElement = document.activeElement;
                        this.$refs.content.focus();
                    }
                    this.bind();
                });
            });
        },
        bind() {
            window.addEventListener('focusin', this.onFocusin);
        },
        unbind() {
            window.removeEventListener('focusin', this.onFocusin);
        },
        onClickOutside(e) {
            this.$emit('click:outside', e);
            if (this.persistent) {
                this.noClickAnimation || this.animateClick();
            }
            else {
                this.isActive = false;
            }
        },
        onKeydown(e) {
            if (e.keyCode === keyCodes.esc && !this.getOpenDependents().length) {
                if (!this.persistent) {
                    this.isActive = false;
                    const activator = this.getActivator();
                    this.$nextTick(() => activator && activator.focus());
                }
                else if (!this.noClickAnimation) {
                    this.animateClick();
                }
            }
            this.$emit('keydown', e);
        },
        // On focus change, wrap focus to stay inside the dialog
        // https://github.com/vuetifyjs/vuetify/issues/6892
        onFocusin(e) {
            if (!e || !this.retainFocus)
                return;
            const target = e.target;
            if (!!target &&
                // It isn't the document or the dialog body
                ![document, this.$refs.content].includes(target) &&
                // It isn't inside the dialog body
                !this.$refs.content.contains(target) &&
                // We're the topmost dialog
                this.activeZIndex >= this.getMaxZIndex() &&
                // It isn't inside a dependent element (like a menu)
                !this.getOpenDependentElements().some(el => el.contains(target))
            // So we must have focused something outside the dialog and its children
            ) {
                // Find and focus the first available element inside the dialog
                const focusable = this.$refs.content.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const el = [...focusable].find(el => !el.hasAttribute('disabled'));
                el && el.focus();
            }
        },
        genContent() {
            return this.showLazyContent(() => [
                this.$createElement(VThemeProvider, {
                    props: {
                        root: true,
                        light: this.light,
                        dark: this.dark,
                    },
                }, [
                    this.$createElement('div', {
                        class: this.contentClasses,
                        attrs: {
                            role: 'dialog',
                            tabindex: this.isActive ? 0 : undefined,
                            'aria-modal': this.hideOverlay ? undefined : 'true',
                            ...this.getScopeIdAttrs(),
                        },
                        on: { keydown: this.onKeydown },
                        style: { zIndex: this.activeZIndex },
                        ref: 'content',
                    }, [this.genTransition()]),
                ]),
            ]);
        },
        genTransition() {
            const content = this.genInnerContent();
            if (!this.transition)
                return content;
            return this.$createElement('transition', {
                props: {
                    name: this.transition,
                    origin: this.origin,
                    appear: true,
                },
            }, [content]);
        },
        genInnerContent() {
            const data = {
                class: this.classes,
                ref: 'dialog',
                directives: [
                    {
                        name: 'click-outside',
                        value: {
                            handler: this.onClickOutside,
                            closeConditional: this.closeConditional,
                            include: this.getOpenDependentElements,
                        },
                    },
                    { name: 'show', value: this.isActive },
                ],
                style: {
                    transformOrigin: this.origin,
                },
            };
            if (!this.fullscreen) {
                data.style = {
                    ...data.style,
                    maxWidth: convertToUnit(this.maxWidth),
                    width: convertToUnit(this.width),
                };
            }
            return this.$createElement('div', data, this.getContentSlot());
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-dialog__container',
            class: {
                'v-dialog__container--attached': this.attach === '' ||
                    this.attach === true ||
                    this.attach === 'attach',
            },
        }, [
            this.genActivator(),
            this.genContent(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZEaWFsb2cvVkRpYWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxnQkFBZ0IsQ0FBQTtBQUV2QixhQUFhO0FBQ2IsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBRWxELFNBQVM7QUFDVCxPQUFPLFdBQVcsTUFBTSwwQkFBMEIsQ0FBQTtBQUNsRCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFdBQVcsTUFBTSwwQkFBMEIsQ0FBQTtBQUNsRCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUU5QyxhQUFhO0FBQ2IsT0FBTyxZQUFZLE1BQU0sZ0NBQWdDLENBQUE7QUFFekQsVUFBVTtBQUNWLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUM1QyxPQUFPLEVBQ0wsYUFBYSxFQUNiLFFBQVEsR0FDVCxNQUFNLG9CQUFvQixDQUFBO0FBSzNCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIsU0FBUyxFQUNULFVBQVUsRUFDVixXQUFXLEVBQ1gsVUFBVSxFQUNWLFNBQVMsRUFDVCxXQUFXLENBQ1osQ0FBQTtBQUVELG9CQUFvQjtBQUNwQixlQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDL0IsSUFBSSxFQUFFLFVBQVU7SUFFaEIsVUFBVSxFQUFFLEVBQUUsWUFBWSxFQUFFO0lBRTVCLEtBQUssRUFBRTtRQUNMLElBQUksRUFBRSxPQUFPO1FBQ2IsUUFBUSxFQUFFLE9BQU87UUFDakIsVUFBVSxFQUFFLE9BQU87UUFDbkIsS0FBSyxFQUFFLE9BQU87UUFDZCxR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QUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7aUJBQ3ZDO2dCQUNELEtBQUssRUFBRTtvQkFDTCxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU07aUJBQzdCO2FBQ0YsQ0FBQTtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHO29CQUNYLEdBQUcsSUFBSSxDQUFDLEtBQWU7b0JBQ3ZCLFFBQVEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDdEMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2lCQUNqQyxDQUFBO2FBQ0Y7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtRQUNoRSxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUNkLFdBQVcsRUFBRSxxQkFBcUI7WUFDbEMsS0FBSyxFQUFFO2dCQUNMLCtCQUErQixFQUM3QixJQUFJLENBQUMsTUFBTSxLQUFLLEVBQUU7b0JBQ2xCLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSTtvQkFDcEIsSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRO2FBQzNCO1NBQ0YsRUFBRTtZQUNELElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsRUFBRTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVkRpYWxvZy5zYXNzJ1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgeyBWVGhlbWVQcm92aWRlciB9IGZyb20gJy4uL1ZUaGVtZVByb3ZpZGVyJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBBY3RpdmF0YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvYWN0aXZhdGFibGUnXG5pbXBvcnQgRGVwZW5kZW50IGZyb20gJy4uLy4uL21peGlucy9kZXBlbmRlbnQnXG5pbXBvcnQgRGV0YWNoYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvZGV0YWNoYWJsZSdcbmltcG9ydCBPdmVybGF5YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvb3ZlcmxheWFibGUnXG5pbXBvcnQgUmV0dXJuYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvcmV0dXJuYWJsZSdcbmltcG9ydCBTdGFja2FibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3N0YWNrYWJsZSdcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IENsaWNrT3V0c2lkZSBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL2NsaWNrLW91dHNpZGUnXG5cbi8vIEhlbHBlcnNcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyByZW1vdmVkIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuaW1wb3J0IHtcbiAgY29udmVydFRvVW5pdCxcbiAga2V5Q29kZXMsXG59IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURhdGEgfSBmcm9tICd2dWUnXG5cbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIERlcGVuZGVudCxcbiAgRGV0YWNoYWJsZSxcbiAgT3ZlcmxheWFibGUsXG4gIFJldHVybmFibGUsXG4gIFN0YWNrYWJsZSxcbiAgQWN0aXZhdGFibGUsXG4pXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWRpYWxvZycsXG5cbiAgZGlyZWN0aXZlczogeyBDbGlja091dHNpZGUgfSxcblxuICBwcm9wczoge1xuICAgIGRhcms6IEJvb2xlYW4sXG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgZnVsbHNjcmVlbjogQm9vbGVhbixcbiAgICBsaWdodDogQm9vbGVhbixcbiAgICBtYXhXaWR0aDogW1N0cmluZywgTnVtYmVyXSxcbiAgICBub0NsaWNrQW5pbWF0aW9uOiBCb29sZWFuLFxuICAgIG9yaWdpbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2NlbnRlciBjZW50ZXInLFxuICAgIH0sXG4gICAgcGVyc2lzdGVudDogQm9vbGVhbixcbiAgICByZXRhaW5Gb2N1czoge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBzY3JvbGxhYmxlOiBCb29sZWFuLFxuICAgIHRyYW5zaXRpb246IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEJvb2xlYW5dLFxuICAgICAgZGVmYXVsdDogJ2RpYWxvZy10cmFuc2l0aW9uJyxcbiAgICB9LFxuICAgIHdpZHRoOiBbU3RyaW5nLCBOdW1iZXJdLFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBhY3RpdmF0ZWRCeTogbnVsbCBhcyBFdmVudFRhcmdldCB8IG51bGwsXG4gICAgICBhbmltYXRlOiBmYWxzZSxcbiAgICAgIGFuaW1hdGVUaW1lb3V0OiAtMSxcbiAgICAgIHN0YWNrTWluWkluZGV4OiAyMDAsXG4gICAgICBwcmV2aW91c0FjdGl2ZUVsZW1lbnQ6IG51bGwgYXMgSFRNTEVsZW1lbnQgfCBudWxsLFxuICAgIH1cbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBbKGB2LWRpYWxvZyAke3RoaXMuY29udGVudENsYXNzfWApLnRyaW0oKV06IHRydWUsXG4gICAgICAgICd2LWRpYWxvZy0tYWN0aXZlJzogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgJ3YtZGlhbG9nLS1wZXJzaXN0ZW50JzogdGhpcy5wZXJzaXN0ZW50LFxuICAgICAgICAndi1kaWFsb2ctLWZ1bGxzY3JlZW4nOiB0aGlzLmZ1bGxzY3JlZW4sXG4gICAgICAgICd2LWRpYWxvZy0tc2Nyb2xsYWJsZSc6IHRoaXMuc2Nyb2xsYWJsZSxcbiAgICAgICAgJ3YtZGlhbG9nLS1hbmltYXRlZCc6IHRoaXMuYW5pbWF0ZSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbnRlbnRDbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3YtZGlhbG9nX19jb250ZW50JzogdHJ1ZSxcbiAgICAgICAgJ3YtZGlhbG9nX19jb250ZW50LS1hY3RpdmUnOiB0aGlzLmlzQWN0aXZlLFxuICAgICAgfVxuICAgIH0sXG4gICAgaGFzQWN0aXZhdG9yICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBCb29sZWFuKFxuICAgICAgICAhIXRoaXMuJHNsb3RzLmFjdGl2YXRvciB8fFxuICAgICAgICAhIXRoaXMuJHNjb3BlZFNsb3RzLmFjdGl2YXRvclxuICAgICAgKVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBpc0FjdGl2ZSAodmFsKSB7XG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIHRoaXMuc2hvdygpXG4gICAgICAgIHRoaXMuaGlkZVNjcm9sbCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZU92ZXJsYXkoKVxuICAgICAgICB0aGlzLnVuYmluZCgpXG4gICAgICAgIHRoaXMucHJldmlvdXNBY3RpdmVFbGVtZW50Py5mb2N1cygpXG4gICAgICB9XG4gICAgfSxcbiAgICBmdWxsc2NyZWVuICh2YWwpIHtcbiAgICAgIGlmICghdGhpcy5pc0FjdGl2ZSkgcmV0dXJuXG5cbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgdGhpcy5oaWRlU2Nyb2xsKClcbiAgICAgICAgdGhpcy5yZW1vdmVPdmVybGF5KGZhbHNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaG93U2Nyb2xsKClcbiAgICAgICAgdGhpcy5nZW5PdmVybGF5KClcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHRoaXMuJGF0dHJzLmhhc093blByb3BlcnR5KCdmdWxsLXdpZHRoJykpIHtcbiAgICAgIHJlbW92ZWQoJ2Z1bGwtd2lkdGgnLCB0aGlzKVxuICAgIH1cbiAgfSxcblxuICBiZWZvcmVNb3VudCAoKSB7XG4gICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgdGhpcy5pc0Jvb3RlZCA9IHRoaXMuaXNBY3RpdmVcbiAgICAgIHRoaXMuaXNBY3RpdmUgJiYgdGhpcy5zaG93KClcbiAgICB9KVxuICB9LFxuXG4gIGJlZm9yZURlc3Ryb3kgKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgdGhpcy51bmJpbmQoKVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBhbmltYXRlQ2xpY2sgKCkge1xuICAgICAgdGhpcy5hbmltYXRlID0gZmFsc2VcbiAgICAgIC8vIE5lZWRlZCBmb3Igd2hlbiBjbGlja2luZyB2ZXJ5IGZhc3RcbiAgICAgIC8vIG91dHNpZGUgb2YgdGhlIGRpYWxvZ1xuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICB0aGlzLmFuaW1hdGUgPSB0cnVlXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5hbmltYXRlVGltZW91dClcbiAgICAgICAgdGhpcy5hbmltYXRlVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+ICh0aGlzLmFuaW1hdGUgPSBmYWxzZSksIDE1MClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBjbG9zZUNvbmRpdGlvbmFsIChlOiBFdmVudCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnRcbiAgICAgIC8vIElnbm9yZSB0aGUgY2xpY2sgaWYgdGhlIGRpYWxvZyBpcyBjbG9zZWQgb3IgZGVzdHJveWVkLFxuICAgICAgLy8gaWYgaXQgd2FzIG9uIGFuIGVsZW1lbnQgaW5zaWRlIHRoZSBjb250ZW50LFxuICAgICAgLy8gaWYgaXQgd2FzIGRyYWdnZWQgb250byB0aGUgb3ZlcmxheSAoIzY5NjkpLFxuICAgICAgLy8gb3IgaWYgdGhpcyBpc24ndCB0aGUgdG9wbW9zdCBkaWFsb2cgKCM5OTA3KVxuICAgICAgcmV0dXJuICEoXG4gICAgICAgIHRoaXMuX2lzRGVzdHJveWVkIHx8XG4gICAgICAgICF0aGlzLmlzQWN0aXZlIHx8XG4gICAgICAgIHRoaXMuJHJlZnMuY29udGVudC5jb250YWlucyh0YXJnZXQpIHx8XG4gICAgICAgICh0aGlzLm92ZXJsYXkgJiYgdGFyZ2V0ICYmICF0aGlzLm92ZXJsYXkuJGVsLmNvbnRhaW5zKHRhcmdldCkpXG4gICAgICApICYmIHRoaXMuYWN0aXZlWkluZGV4ID49IHRoaXMuZ2V0TWF4WkluZGV4KClcbiAgICB9LFxuICAgIGhpZGVTY3JvbGwgKCkge1xuICAgICAgaWYgKHRoaXMuZnVsbHNjcmVlbikge1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnb3ZlcmZsb3cteS1oaWRkZW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT3ZlcmxheWFibGUub3B0aW9ucy5tZXRob2RzLmhpZGVTY3JvbGwuY2FsbCh0aGlzKVxuICAgICAgfVxuICAgIH0sXG4gICAgc2hvdyAoKSB7XG4gICAgICAhdGhpcy5mdWxsc2NyZWVuICYmICF0aGlzLmhpZGVPdmVybGF5ICYmIHRoaXMuZ2VuT3ZlcmxheSgpXG4gICAgICAvLyBEb3VibGUgbmV4dFRpY2sgdG8gd2FpdCBmb3IgbGF6eSBjb250ZW50IHRvIGJlIGdlbmVyYXRlZFxuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLiRyZWZzLmNvbnRlbnQuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNBY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudFxuICAgICAgICAgICAgdGhpcy4kcmVmcy5jb250ZW50LmZvY3VzKClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5iaW5kKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBiaW5kICgpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgdGhpcy5vbkZvY3VzaW4pXG4gICAgfSxcbiAgICB1bmJpbmQgKCkge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCB0aGlzLm9uRm9jdXNpbilcbiAgICB9LFxuICAgIG9uQ2xpY2tPdXRzaWRlIChlOiBFdmVudCkge1xuICAgICAgdGhpcy4kZW1pdCgnY2xpY2s6b3V0c2lkZScsIGUpXG5cbiAgICAgIGlmICh0aGlzLnBlcnNpc3RlbnQpIHtcbiAgICAgICAgdGhpcy5ub0NsaWNrQW5pbWF0aW9uIHx8IHRoaXMuYW5pbWF0ZUNsaWNrKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgb25LZXlkb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5lc2MgJiYgIXRoaXMuZ2V0T3BlbkRlcGVuZGVudHMoKS5sZW5ndGgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBlcnNpc3RlbnQpIHtcbiAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSB0aGlzLmdldEFjdGl2YXRvcigpXG4gICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gYWN0aXZhdG9yICYmIChhY3RpdmF0b3IgYXMgSFRNTEVsZW1lbnQpLmZvY3VzKCkpXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMubm9DbGlja0FuaW1hdGlvbikge1xuICAgICAgICAgIHRoaXMuYW5pbWF0ZUNsaWNrKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy4kZW1pdCgna2V5ZG93bicsIGUpXG4gICAgfSxcbiAgICAvLyBPbiBmb2N1cyBjaGFuZ2UsIHdyYXAgZm9jdXMgdG8gc3RheSBpbnNpZGUgdGhlIGRpYWxvZ1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWV0aWZ5anMvdnVldGlmeS9pc3N1ZXMvNjg5MlxuICAgIG9uRm9jdXNpbiAoZTogRXZlbnQpIHtcbiAgICAgIGlmICghZSB8fCAhdGhpcy5yZXRhaW5Gb2N1cykgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50XG5cbiAgICAgIGlmIChcbiAgICAgICAgISF0YXJnZXQgJiZcbiAgICAgICAgLy8gSXQgaXNuJ3QgdGhlIGRvY3VtZW50IG9yIHRoZSBkaWFsb2cgYm9keVxuICAgICAgICAhW2RvY3VtZW50LCB0aGlzLiRyZWZzLmNvbnRlbnRdLmluY2x1ZGVzKHRhcmdldCkgJiZcbiAgICAgICAgLy8gSXQgaXNuJ3QgaW5zaWRlIHRoZSBkaWFsb2cgYm9keVxuICAgICAgICAhdGhpcy4kcmVmcy5jb250ZW50LmNvbnRhaW5zKHRhcmdldCkgJiZcbiAgICAgICAgLy8gV2UncmUgdGhlIHRvcG1vc3QgZGlhbG9nXG4gICAgICAgIHRoaXMuYWN0aXZlWkluZGV4ID49IHRoaXMuZ2V0TWF4WkluZGV4KCkgJiZcbiAgICAgICAgLy8gSXQgaXNuJ3QgaW5zaWRlIGEgZGVwZW5kZW50IGVsZW1lbnQgKGxpa2UgYSBtZW51KVxuICAgICAgICAhdGhpcy5nZXRPcGVuRGVwZW5kZW50RWxlbWVudHMoKS5zb21lKGVsID0+IGVsLmNvbnRhaW5zKHRhcmdldCkpXG4gICAgICAgIC8vIFNvIHdlIG11c3QgaGF2ZSBmb2N1c2VkIHNvbWV0aGluZyBvdXRzaWRlIHRoZSBkaWFsb2cgYW5kIGl0cyBjaGlsZHJlblxuICAgICAgKSB7XG4gICAgICAgIC8vIEZpbmQgYW5kIGZvY3VzIHRoZSBmaXJzdCBhdmFpbGFibGUgZWxlbWVudCBpbnNpZGUgdGhlIGRpYWxvZ1xuICAgICAgICBjb25zdCBmb2N1c2FibGUgPSB0aGlzLiRyZWZzLmNvbnRlbnQucXVlcnlTZWxlY3RvckFsbCgnYnV0dG9uLCBbaHJlZl0sIGlucHV0LCBzZWxlY3QsIHRleHRhcmVhLCBbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXg9XCItMVwiXSknKVxuICAgICAgICBjb25zdCBlbCA9IFsuLi5mb2N1c2FibGVdLmZpbmQoZWwgPT4gIWVsLmhhc0F0dHJpYnV0ZSgnZGlzYWJsZWQnKSkgYXMgSFRNTEVsZW1lbnQgfCB1bmRlZmluZWRcbiAgICAgICAgZWwgJiYgZWwuZm9jdXMoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaG93TGF6eUNvbnRlbnQoKCkgPT4gW1xuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KFZUaGVtZVByb3ZpZGVyLCB7XG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHJvb3Q6IHRydWUsXG4gICAgICAgICAgICBsaWdodDogdGhpcy5saWdodCxcbiAgICAgICAgICAgIGRhcms6IHRoaXMuZGFyayxcbiAgICAgICAgICB9LFxuICAgICAgICB9LCBbXG4gICAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAgY2xhc3M6IHRoaXMuY29udGVudENsYXNzZXMsXG4gICAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgICByb2xlOiAnZGlhbG9nJyxcbiAgICAgICAgICAgICAgdGFiaW5kZXg6IHRoaXMuaXNBY3RpdmUgPyAwIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAnYXJpYS1tb2RhbCc6IHRoaXMuaGlkZU92ZXJsYXkgPyB1bmRlZmluZWQgOiAndHJ1ZScsXG4gICAgICAgICAgICAgIC4uLnRoaXMuZ2V0U2NvcGVJZEF0dHJzKCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb246IHsga2V5ZG93bjogdGhpcy5vbktleWRvd24gfSxcbiAgICAgICAgICAgIHN0eWxlOiB7IHpJbmRleDogdGhpcy5hY3RpdmVaSW5kZXggfSxcbiAgICAgICAgICAgIHJlZjogJ2NvbnRlbnQnLFxuICAgICAgICAgIH0sIFt0aGlzLmdlblRyYW5zaXRpb24oKV0pLFxuICAgICAgICBdKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5UcmFuc2l0aW9uICgpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdlbklubmVyQ29udGVudCgpXG5cbiAgICAgIGlmICghdGhpcy50cmFuc2l0aW9uKSByZXR1cm4gY29udGVudFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgndHJhbnNpdGlvbicsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgICAgb3JpZ2luOiB0aGlzLm9yaWdpbixcbiAgICAgICAgICBhcHBlYXI6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LCBbY29udGVudF0pXG4gICAgfSxcbiAgICBnZW5Jbm5lckNvbnRlbnQgKCkge1xuICAgICAgY29uc3QgZGF0YTogVk5vZGVEYXRhID0ge1xuICAgICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgICByZWY6ICdkaWFsb2cnLFxuICAgICAgICBkaXJlY3RpdmVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2NsaWNrLW91dHNpZGUnLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgaGFuZGxlcjogdGhpcy5vbkNsaWNrT3V0c2lkZSxcbiAgICAgICAgICAgICAgY2xvc2VDb25kaXRpb25hbDogdGhpcy5jbG9zZUNvbmRpdGlvbmFsLFxuICAgICAgICAgICAgICBpbmNsdWRlOiB0aGlzLmdldE9wZW5EZXBlbmRlbnRFbGVtZW50cyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7IG5hbWU6ICdzaG93JywgdmFsdWU6IHRoaXMuaXNBY3RpdmUgfSxcbiAgICAgICAgXSxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB0cmFuc2Zvcm1PcmlnaW46IHRoaXMub3JpZ2luLFxuICAgICAgICB9LFxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuZnVsbHNjcmVlbikge1xuICAgICAgICBkYXRhLnN0eWxlID0ge1xuICAgICAgICAgIC4uLmRhdGEuc3R5bGUgYXMgb2JqZWN0LFxuICAgICAgICAgIG1heFdpZHRoOiBjb252ZXJ0VG9Vbml0KHRoaXMubWF4V2lkdGgpLFxuICAgICAgICAgIHdpZHRoOiBjb252ZXJ0VG9Vbml0KHRoaXMud2lkdGgpLFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCBkYXRhLCB0aGlzLmdldENvbnRlbnRTbG90KCkpXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1kaWFsb2dfX2NvbnRhaW5lcicsXG4gICAgICBjbGFzczoge1xuICAgICAgICAndi1kaWFsb2dfX2NvbnRhaW5lci0tYXR0YWNoZWQnOlxuICAgICAgICAgIHRoaXMuYXR0YWNoID09PSAnJyB8fFxuICAgICAgICAgIHRoaXMuYXR0YWNoID09PSB0cnVlIHx8XG4gICAgICAgICAgdGhpcy5hdHRhY2ggPT09ICdhdHRhY2gnLFxuICAgICAgfSxcbiAgICB9LCBbXG4gICAgICB0aGlzLmdlbkFjdGl2YXRvcigpLFxuICAgICAgdGhpcy5nZW5Db250ZW50KCksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=
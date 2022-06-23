import './VTooltip.sass';
// Mixins
import Activatable from '../../mixins/activatable';
import Colorable from '../../mixins/colorable';
import Delayable from '../../mixins/delayable';
import Dependent from '../../mixins/dependent';
import Menuable from '../../mixins/menuable';
// Helpers
import { convertToUnit, keyCodes, getSlotType } from '../../util/helpers';
import { consoleError } from '../../util/console';
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(Colorable, Delayable, Dependent, Menuable).extend({
    name: 'v-tooltip',
    props: {
        closeDelay: {
            type: [Number, String],
            default: 0,
        },
        disabled: Boolean,
        openDelay: {
            type: [Number, String],
            default: 0,
        },
        openOnHover: {
            type: Boolean,
            default: true,
        },
        openOnFocus: {
            type: Boolean,
            default: true,
        },
        tag: {
            type: String,
            default: 'span',
        },
        transition: String,
    },
    data: () => ({
        calculatedMinWidth: 0,
        closeDependents: false,
    }),
    computed: {
        calculatedLeft() {
            const { activator, content } = this.dimensions;
            const unknown = !this.bottom && !this.left && !this.top && !this.right;
            const activatorLeft = this.attach !== false ? activator.offsetLeft : activator.left;
            let left = 0;
            if (this.top || this.bottom || unknown) {
                left = (activatorLeft +
                    (activator.width / 2) -
                    (content.width / 2));
            }
            else if (this.left || this.right) {
                left = (activatorLeft +
                    (this.right ? activator.width : -content.width) +
                    (this.right ? 10 : -10));
            }
            if (this.nudgeLeft)
                left -= parseInt(this.nudgeLeft);
            if (this.nudgeRight)
                left += parseInt(this.nudgeRight);
            return `${this.calcXOverflow(left, this.dimensions.content.width)}px`;
        },
        calculatedTop() {
            const { activator, content } = this.dimensions;
            const activatorTop = this.attach !== false ? activator.offsetTop : activator.top;
            let top = 0;
            if (this.top || this.bottom) {
                top = (activatorTop +
                    (this.bottom ? activator.height : -content.height) +
                    (this.bottom ? 10 : -10));
            }
            else if (this.left || this.right) {
                top = (activatorTop +
                    (activator.height / 2) -
                    (content.height / 2));
            }
            if (this.nudgeTop)
                top -= parseInt(this.nudgeTop);
            if (this.nudgeBottom)
                top += parseInt(this.nudgeBottom);
            if (this.attach === false)
                top += this.pageYOffset;
            return `${this.calcYOverflow(top)}px`;
        },
        classes() {
            return {
                'v-tooltip--top': this.top,
                'v-tooltip--right': this.right,
                'v-tooltip--bottom': this.bottom,
                'v-tooltip--left': this.left,
                'v-tooltip--attached': this.attach === '' ||
                    this.attach === true ||
                    this.attach === 'attach',
            };
        },
        computedTransition() {
            if (this.transition)
                return this.transition;
            return this.isActive ? 'scale-transition' : 'fade-transition';
        },
        offsetY() {
            return this.top || this.bottom;
        },
        offsetX() {
            return this.left || this.right;
        },
        styles() {
            return {
                left: this.calculatedLeft,
                maxWidth: convertToUnit(this.maxWidth),
                minWidth: convertToUnit(this.minWidth),
                top: this.calculatedTop,
                zIndex: this.zIndex || this.activeZIndex,
            };
        },
    },
    beforeMount() {
        this.$nextTick(() => {
            this.value && this.callActivate();
        });
    },
    mounted() {
        if (getSlotType(this, 'activator', true) === 'v-slot') {
            consoleError(`v-tooltip's activator slot must be bound, try '<template #activator="data"><v-btn v-on="data.on>'`, this);
        }
    },
    methods: {
        activate() {
            // Update coordinates and dimensions of menu
            // and its activator
            this.updateDimensions();
            // Start the transition
            requestAnimationFrame(this.startTransition);
        },
        deactivate() {
            this.runDelay('close');
        },
        genActivatorListeners() {
            const listeners = Activatable.options.methods.genActivatorListeners.call(this);
            if (this.openOnFocus) {
                listeners.focus = (e) => {
                    this.getActivator(e);
                    this.runDelay('open');
                };
                listeners.blur = (e) => {
                    this.getActivator(e);
                    this.runDelay('close');
                };
            }
            listeners.keydown = (e) => {
                if (e.keyCode === keyCodes.esc) {
                    this.getActivator(e);
                    this.runDelay('close');
                }
            };
            return listeners;
        },
        genActivatorAttributes() {
            return {
                'aria-haspopup': true,
                'aria-expanded': String(this.isActive),
            };
        },
        genTransition() {
            const content = this.genContent();
            if (!this.computedTransition)
                return content;
            return this.$createElement('transition', {
                props: {
                    name: this.computedTransition,
                },
            }, [content]);
        },
        genContent() {
            return this.$createElement('div', this.setBackgroundColor(this.color, {
                staticClass: 'v-tooltip__content',
                class: {
                    [this.contentClass]: true,
                    menuable__content__active: this.isActive,
                    'v-tooltip__content--fixed': this.activatorFixed,
                },
                style: this.styles,
                attrs: this.getScopeIdAttrs(),
                directives: [{
                        name: 'show',
                        value: this.isContentActive,
                    }],
                ref: 'content',
            }), this.getContentSlot());
        },
    },
    render(h) {
        return h(this.tag, {
            staticClass: 'v-tooltip',
            class: this.classes,
        }, [
            this.showLazyContent(() => [this.genTransition()]),
            this.genActivator(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRvb2x0aXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WVG9vbHRpcC9WVG9vbHRpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGlCQUFpQixDQUFBO0FBRXhCLFNBQVM7QUFDVCxPQUFPLFdBQVcsTUFBTSwwQkFBMEIsQ0FBQTtBQUNsRCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUU1QyxVQUFVO0FBQ1YsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDekUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBSWpELE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBRXRDLG9CQUFvQjtBQUNwQixlQUFlLE1BQU0sQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDdEUsSUFBSSxFQUFFLFdBQVc7SUFFakIsS0FBSyxFQUFFO1FBQ0wsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsUUFBUSxFQUFFLE9BQU87UUFDakIsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFB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T0FBTyxDQUFDLENBQUMsQ0FBQTtRQUNmLENBQUM7UUFDRCxVQUFVO1lBQ1IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUN4QixLQUFLLEVBQ0wsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2xDLFdBQVcsRUFBRSxvQkFBb0I7Z0JBQ2pDLEtBQUssRUFBRTtvQkFDTCxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJO29CQUN6Qix5QkFBeUIsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDeEMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLGNBQWM7aUJBQ2pEO2dCQUNELEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbEIsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzdCLFVBQVUsRUFBRSxDQUFDO3dCQUNYLElBQUksRUFBRSxNQUFNO3dCQUNaLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZTtxQkFDNUIsQ0FBQztnQkFDRixHQUFHLEVBQUUsU0FBUzthQUNmLENBQUMsRUFDRixJQUFJLENBQUMsY0FBYyxFQUFFLENBQ3RCLENBQUE7UUFDSCxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDakIsV0FBVyxFQUFFLFdBQVc7WUFDeEIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ3BCLEVBQUU7WUFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFlBQVksRUFBRTtTQUNwQixDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL1ZUb29sdGlwLnNhc3MnXG5cbi8vIE1peGluc1xuaW1wb3J0IEFjdGl2YXRhYmxlIGZyb20gJy4uLy4uL21peGlucy9hY3RpdmF0YWJsZSdcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcbmltcG9ydCBEZWxheWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2RlbGF5YWJsZSdcbmltcG9ydCBEZXBlbmRlbnQgZnJvbSAnLi4vLi4vbWl4aW5zL2RlcGVuZGVudCdcbmltcG9ydCBNZW51YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvbWVudWFibGUnXG5cbi8vIEhlbHBlcnNcbmltcG9ydCB7IGNvbnZlcnRUb1VuaXQsIGtleUNvZGVzLCBnZXRTbG90VHlwZSB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCB7IGNvbnNvbGVFcnJvciB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAndnVlJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IG1peGlucyhDb2xvcmFibGUsIERlbGF5YWJsZSwgRGVwZW5kZW50LCBNZW51YWJsZSkuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtdG9vbHRpcCcsXG5cbiAgcHJvcHM6IHtcbiAgICBjbG9zZURlbGF5OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICB9LFxuICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIG9wZW5EZWxheToge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgfSxcbiAgICBvcGVuT25Ib3Zlcjoge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBvcGVuT25Gb2N1czoge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdzcGFuJyxcbiAgICB9LFxuICAgIHRyYW5zaXRpb246IFN0cmluZyxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGNhbGN1bGF0ZWRNaW5XaWR0aDogMCxcbiAgICBjbG9zZURlcGVuZGVudHM6IGZhbHNlLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNhbGN1bGF0ZWRMZWZ0ICgpOiBzdHJpbmcge1xuICAgICAgY29uc3QgeyBhY3RpdmF0b3IsIGNvbnRlbnQgfSA9IHRoaXMuZGltZW5zaW9uc1xuICAgICAgY29uc3QgdW5rbm93biA9ICF0aGlzLmJvdHRvbSAmJiAhdGhpcy5sZWZ0ICYmICF0aGlzLnRvcCAmJiAhdGhpcy5yaWdodFxuICAgICAgY29uc3QgYWN0aXZhdG9yTGVmdCA9IHRoaXMuYXR0YWNoICE9PSBmYWxzZSA/IGFjdGl2YXRvci5vZmZzZXRMZWZ0IDogYWN0aXZhdG9yLmxlZnRcbiAgICAgIGxldCBsZWZ0ID0gMFxuXG4gICAgICBpZiAodGhpcy50b3AgfHwgdGhpcy5ib3R0b20gfHwgdW5rbm93bikge1xuICAgICAgICBsZWZ0ID0gKFxuICAgICAgICAgIGFjdGl2YXRvckxlZnQgK1xuICAgICAgICAgIChhY3RpdmF0b3Iud2lkdGggLyAyKSAtXG4gICAgICAgICAgKGNvbnRlbnQud2lkdGggLyAyKVxuICAgICAgICApXG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGVmdCB8fCB0aGlzLnJpZ2h0KSB7XG4gICAgICAgIGxlZnQgPSAoXG4gICAgICAgICAgYWN0aXZhdG9yTGVmdCArXG4gICAgICAgICAgKHRoaXMucmlnaHQgPyBhY3RpdmF0b3Iud2lkdGggOiAtY29udGVudC53aWR0aCkgK1xuICAgICAgICAgICh0aGlzLnJpZ2h0ID8gMTAgOiAtMTApXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubnVkZ2VMZWZ0KSBsZWZ0IC09IHBhcnNlSW50KHRoaXMubnVkZ2VMZWZ0KVxuICAgICAgaWYgKHRoaXMubnVkZ2VSaWdodCkgbGVmdCArPSBwYXJzZUludCh0aGlzLm51ZGdlUmlnaHQpXG5cbiAgICAgIHJldHVybiBgJHt0aGlzLmNhbGNYT3ZlcmZsb3cobGVmdCwgdGhpcy5kaW1lbnNpb25zLmNvbnRlbnQud2lkdGgpfXB4YFxuICAgIH0sXG4gICAgY2FsY3VsYXRlZFRvcCAoKTogc3RyaW5nIHtcbiAgICAgIGNvbnN0IHsgYWN0aXZhdG9yLCBjb250ZW50IH0gPSB0aGlzLmRpbWVuc2lvbnNcbiAgICAgIGNvbnN0IGFjdGl2YXRvclRvcCA9IHRoaXMuYXR0YWNoICE9PSBmYWxzZSA/IGFjdGl2YXRvci5vZmZzZXRUb3AgOiBhY3RpdmF0b3IudG9wXG4gICAgICBsZXQgdG9wID0gMFxuXG4gICAgICBpZiAodGhpcy50b3AgfHwgdGhpcy5ib3R0b20pIHtcbiAgICAgICAgdG9wID0gKFxuICAgICAgICAgIGFjdGl2YXRvclRvcCArXG4gICAgICAgICAgKHRoaXMuYm90dG9tID8gYWN0aXZhdG9yLmhlaWdodCA6IC1jb250ZW50LmhlaWdodCkgK1xuICAgICAgICAgICh0aGlzLmJvdHRvbSA/IDEwIDogLTEwKVxuICAgICAgICApXG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGVmdCB8fCB0aGlzLnJpZ2h0KSB7XG4gICAgICAgIHRvcCA9IChcbiAgICAgICAgICBhY3RpdmF0b3JUb3AgK1xuICAgICAgICAgIChhY3RpdmF0b3IuaGVpZ2h0IC8gMikgLVxuICAgICAgICAgIChjb250ZW50LmhlaWdodCAvIDIpXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubnVkZ2VUb3ApIHRvcCAtPSBwYXJzZUludCh0aGlzLm51ZGdlVG9wKVxuICAgICAgaWYgKHRoaXMubnVkZ2VCb3R0b20pIHRvcCArPSBwYXJzZUludCh0aGlzLm51ZGdlQm90dG9tKVxuICAgICAgaWYgKHRoaXMuYXR0YWNoID09PSBmYWxzZSkgdG9wICs9IHRoaXMucGFnZVlPZmZzZXRcblxuICAgICAgcmV0dXJuIGAke3RoaXMuY2FsY1lPdmVyZmxvdyh0b3ApfXB4YFxuICAgIH0sXG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LXRvb2x0aXAtLXRvcCc6IHRoaXMudG9wLFxuICAgICAgICAndi10b29sdGlwLS1yaWdodCc6IHRoaXMucmlnaHQsXG4gICAgICAgICd2LXRvb2x0aXAtLWJvdHRvbSc6IHRoaXMuYm90dG9tLFxuICAgICAgICAndi10b29sdGlwLS1sZWZ0JzogdGhpcy5sZWZ0LFxuICAgICAgICAndi10b29sdGlwLS1hdHRhY2hlZCc6XG4gICAgICAgICAgdGhpcy5hdHRhY2ggPT09ICcnIHx8XG4gICAgICAgICAgdGhpcy5hdHRhY2ggPT09IHRydWUgfHxcbiAgICAgICAgICB0aGlzLmF0dGFjaCA9PT0gJ2F0dGFjaCcsXG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZFRyYW5zaXRpb24gKCk6IHN0cmluZyB7XG4gICAgICBpZiAodGhpcy50cmFuc2l0aW9uKSByZXR1cm4gdGhpcy50cmFuc2l0aW9uXG5cbiAgICAgIHJldHVybiB0aGlzLmlzQWN0aXZlID8gJ3NjYWxlLXRyYW5zaXRpb24nIDogJ2ZhZGUtdHJhbnNpdGlvbidcbiAgICB9LFxuICAgIG9mZnNldFkgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMudG9wIHx8IHRoaXMuYm90dG9tXG4gICAgfSxcbiAgICBvZmZzZXRYICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmxlZnQgfHwgdGhpcy5yaWdodFxuICAgIH0sXG4gICAgc3R5bGVzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogdGhpcy5jYWxjdWxhdGVkTGVmdCxcbiAgICAgICAgbWF4V2lkdGg6IGNvbnZlcnRUb1VuaXQodGhpcy5tYXhXaWR0aCksXG4gICAgICAgIG1pbldpZHRoOiBjb252ZXJ0VG9Vbml0KHRoaXMubWluV2lkdGgpLFxuICAgICAgICB0b3A6IHRoaXMuY2FsY3VsYXRlZFRvcCxcbiAgICAgICAgekluZGV4OiB0aGlzLnpJbmRleCB8fCB0aGlzLmFjdGl2ZVpJbmRleCxcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIGJlZm9yZU1vdW50ICgpIHtcbiAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICB0aGlzLnZhbHVlICYmIHRoaXMuY2FsbEFjdGl2YXRlKClcbiAgICB9KVxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIGlmIChnZXRTbG90VHlwZSh0aGlzLCAnYWN0aXZhdG9yJywgdHJ1ZSkgPT09ICd2LXNsb3QnKSB7XG4gICAgICBjb25zb2xlRXJyb3IoYHYtdG9vbHRpcCdzIGFjdGl2YXRvciBzbG90IG11c3QgYmUgYm91bmQsIHRyeSAnPHRlbXBsYXRlICNhY3RpdmF0b3I9XCJkYXRhXCI+PHYtYnRuIHYtb249XCJkYXRhLm9uPidgLCB0aGlzKVxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgYWN0aXZhdGUgKCkge1xuICAgICAgLy8gVXBkYXRlIGNvb3JkaW5hdGVzIGFuZCBkaW1lbnNpb25zIG9mIG1lbnVcbiAgICAgIC8vIGFuZCBpdHMgYWN0aXZhdG9yXG4gICAgICB0aGlzLnVwZGF0ZURpbWVuc2lvbnMoKVxuICAgICAgLy8gU3RhcnQgdGhlIHRyYW5zaXRpb25cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnN0YXJ0VHJhbnNpdGlvbilcbiAgICB9LFxuICAgIGRlYWN0aXZhdGUgKCkge1xuICAgICAgdGhpcy5ydW5EZWxheSgnY2xvc2UnKVxuICAgIH0sXG4gICAgZ2VuQWN0aXZhdG9yTGlzdGVuZXJzICgpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IEFjdGl2YXRhYmxlLm9wdGlvbnMubWV0aG9kcy5nZW5BY3RpdmF0b3JMaXN0ZW5lcnMuY2FsbCh0aGlzKVxuXG4gICAgICBpZiAodGhpcy5vcGVuT25Gb2N1cykge1xuICAgICAgICBsaXN0ZW5lcnMuZm9jdXMgPSAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICB0aGlzLmdldEFjdGl2YXRvcihlKVxuICAgICAgICAgIHRoaXMucnVuRGVsYXkoJ29wZW4nKVxuICAgICAgICB9XG4gICAgICAgIGxpc3RlbmVycy5ibHVyID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5nZXRBY3RpdmF0b3IoZSlcbiAgICAgICAgICB0aGlzLnJ1bkRlbGF5KCdjbG9zZScpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzLmtleWRvd24gPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5lc2MpIHtcbiAgICAgICAgICB0aGlzLmdldEFjdGl2YXRvcihlKVxuICAgICAgICAgIHRoaXMucnVuRGVsYXkoJ2Nsb3NlJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGlzdGVuZXJzXG4gICAgfSxcbiAgICBnZW5BY3RpdmF0b3JBdHRyaWJ1dGVzICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBTdHJpbmcodGhpcy5pc0FjdGl2ZSksXG4gICAgICB9XG4gICAgfSxcbiAgICBnZW5UcmFuc2l0aW9uICgpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdlbkNvbnRlbnQoKVxuXG4gICAgICBpZiAoIXRoaXMuY29tcHV0ZWRUcmFuc2l0aW9uKSByZXR1cm4gY29udGVudFxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgndHJhbnNpdGlvbicsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBuYW1lOiB0aGlzLmNvbXB1dGVkVHJhbnNpdGlvbixcbiAgICAgICAgfSxcbiAgICAgIH0sIFtjb250ZW50XSlcbiAgICB9LFxuICAgIGdlbkNvbnRlbnQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdkaXYnLFxuICAgICAgICB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmNvbG9yLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXRvb2x0aXBfX2NvbnRlbnQnLFxuICAgICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgICBbdGhpcy5jb250ZW50Q2xhc3NdOiB0cnVlLFxuICAgICAgICAgICAgbWVudWFibGVfX2NvbnRlbnRfX2FjdGl2ZTogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgICAgICd2LXRvb2x0aXBfX2NvbnRlbnQtLWZpeGVkJzogdGhpcy5hY3RpdmF0b3JGaXhlZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN0eWxlOiB0aGlzLnN0eWxlcyxcbiAgICAgICAgICBhdHRyczogdGhpcy5nZXRTY29wZUlkQXR0cnMoKSxcbiAgICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgICAgbmFtZTogJ3Nob3cnLFxuICAgICAgICAgICAgdmFsdWU6IHRoaXMuaXNDb250ZW50QWN0aXZlLFxuICAgICAgICAgIH1dLFxuICAgICAgICAgIHJlZjogJ2NvbnRlbnQnLFxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5nZXRDb250ZW50U2xvdCgpXG4gICAgICApXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgodGhpcy50YWcsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi10b29sdGlwJyxcbiAgICAgIGNsYXNzOiB0aGlzLmNsYXNzZXMsXG4gICAgfSwgW1xuICAgICAgdGhpcy5zaG93TGF6eUNvbnRlbnQoKCkgPT4gW3RoaXMuZ2VuVHJhbnNpdGlvbigpXSksXG4gICAgICB0aGlzLmdlbkFjdGl2YXRvcigpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
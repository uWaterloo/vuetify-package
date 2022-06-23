// Mixins
import Delayable from '../delayable';
import Toggleable from '../toggleable';
// Utilities
import mixins from '../../util/mixins';
import { getSlot, getSlotType } from '../../util/helpers';
import { consoleError } from '../../util/console';
const baseMixins = mixins(Delayable, Toggleable);
/* @vue/component */
export default baseMixins.extend({
    name: 'activatable',
    props: {
        activator: {
            default: null,
            validator: (val) => {
                return ['string', 'object'].includes(typeof val);
            },
        },
        disabled: Boolean,
        internalActivator: Boolean,
        openOnClick: {
            type: Boolean,
            default: true,
        },
        openOnHover: Boolean,
        openOnFocus: Boolean,
    },
    data: () => ({
        // Do not use this directly, call getActivator() instead
        activatorElement: null,
        activatorNode: [],
        events: ['click', 'mouseenter', 'mouseleave', 'focus'],
        listeners: {},
    }),
    watch: {
        activator: 'resetActivator',
        openOnFocus: 'resetActivator',
        openOnHover: 'resetActivator',
    },
    mounted() {
        const slotType = getSlotType(this, 'activator', true);
        if (slotType && ['v-slot', 'normal'].includes(slotType)) {
            consoleError(`The activator slot must be bound, try '<template v-slot:activator="{ on }"><v-btn v-on="on">'`, this);
        }
        this.addActivatorEvents();
    },
    beforeDestroy() {
        this.removeActivatorEvents();
    },
    methods: {
        addActivatorEvents() {
            if (!this.activator ||
                this.disabled ||
                !this.getActivator())
                return;
            this.listeners = this.genActivatorListeners();
            const keys = Object.keys(this.listeners);
            for (const key of keys) {
                this.getActivator().addEventListener(key, this.listeners[key]);
            }
        },
        genActivator() {
            const node = getSlot(this, 'activator', Object.assign(this.getValueProxy(), {
                on: this.genActivatorListeners(),
                attrs: this.genActivatorAttributes(),
            })) || [];
            this.activatorNode = node;
            return node;
        },
        genActivatorAttributes() {
            return {
                role: (this.openOnClick && !this.openOnHover) ? 'button' : undefined,
                'aria-haspopup': true,
                'aria-expanded': String(this.isActive),
            };
        },
        genActivatorListeners() {
            if (this.disabled)
                return {};
            const listeners = {};
            if (this.openOnHover) {
                listeners.mouseenter = (e) => {
                    this.getActivator(e);
                    this.runDelay('open');
                };
                listeners.mouseleave = (e) => {
                    this.getActivator(e);
                    this.runDelay('close');
                };
            }
            else if (this.openOnClick) {
                listeners.click = (e) => {
                    const activator = this.getActivator(e);
                    if (activator)
                        activator.focus();
                    e.stopPropagation();
                    this.isActive = !this.isActive;
                };
            }
            if (this.openOnFocus) {
                listeners.focus = (e) => {
                    this.getActivator(e);
                    e.stopPropagation();
                    this.isActive = !this.isActive;
                };
            }
            return listeners;
        },
        getActivator(e) {
            // If we've already fetched the activator, re-use
            if (this.activatorElement)
                return this.activatorElement;
            let activator = null;
            if (this.activator) {
                const target = this.internalActivator ? this.$el : document;
                if (typeof this.activator === 'string') {
                    // Selector
                    activator = target.querySelector(this.activator);
                }
                else if (this.activator.$el) {
                    // Component (ref)
                    activator = this.activator.$el;
                }
                else {
                    // HTMLElement | Element
                    activator = this.activator;
                }
            }
            else if (this.activatorNode.length === 1 || (this.activatorNode.length && !e)) {
                // Use the contents of the activator slot
                // There's either only one element in it or we
                // don't have a click event to use as a last resort
                const vm = this.activatorNode[0].componentInstance;
                if (vm &&
                    vm.$options.mixins && //                         Activatable is indirectly used via Menuable
                    vm.$options.mixins.some((m) => m.options && ['activatable', 'menuable'].includes(m.options.name))) {
                    // Activator is actually another activatible component, use its activator (#8846)
                    activator = vm.getActivator();
                }
                else {
                    activator = this.activatorNode[0].elm;
                }
            }
            else if (e) {
                // Activated by a click or focus event
                activator = (e.currentTarget || e.target);
            }
            // The activator should only be a valid element (Ignore comments and text nodes)
            this.activatorElement = activator?.nodeType === Node.ELEMENT_NODE ? activator : null;
            return this.activatorElement;
        },
        getContentSlot() {
            return getSlot(this, 'default', this.getValueProxy(), true);
        },
        getValueProxy() {
            const self = this;
            return {
                get value() {
                    return self.isActive;
                },
                set value(isActive) {
                    self.isActive = isActive;
                },
            };
        },
        removeActivatorEvents() {
            if (!this.activator ||
                !this.activatorElement)
                return;
            const keys = Object.keys(this.listeners);
            for (const key of keys) {
                this.activatorElement.removeEventListener(key, this.listeners[key]);
            }
            this.listeners = {};
        },
        resetActivator() {
            this.removeActivatorEvents();
            this.activatorElement = null;
            this.getActivator();
            this.addActivatorEvents();
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL2FjdGl2YXRhYmxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSxjQUFjLENBQUE7QUFDcEMsT0FBTyxVQUFVLE1BQU0sZUFBZSxDQUFBO0FBRXRDLFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQU9qRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLFNBQVMsRUFDVCxVQUFVLENBQ1gsQ0FBQTtBQUVELG9CQUFvQjtBQUNwQixlQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDL0IsSUFBSSxFQUFFLGFBQWE7SUFFbkIsS0FBSyxFQUFFO1FBQ0wsU0FBUyxFQUFFO1lBQ1QsT0FBTyxFQUFFLElBQTBFO1lBQ25GLFNBQVMsRUFBRSxDQUFDLEdBQW9CLEVBQUUsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQTtZQUNsRCxDQUFDO1NBQ0Y7UUFDRCxRQUFRLEVBQUUsT0FBTztRQUNqQixpQkFBaUIsRUFBRSxPQUFPO1FBQzFCLFdBQVcsRUFBRTtZQUNYLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUk7U0FDZDtRQUNELFdBQVcsRUFBRSxPQUFPO1FBQ3BCLFdBQVcsRUFBRSxPQUFPO0tBQ3JCO0lBRUQsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDWCx3REFBd0Q7UUFDeEQsZ0JBQWdCLEVBQUUsSUFBMEI7UUFDNUMsYUFBYSxFQUFFLEVBQWE7UUFDNUIsTUFBTSxFQUFFLENBQUMsT0FB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QUE7UUFDM0IsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTWl4aW5zXG5pbXBvcnQgRGVsYXlhYmxlIGZyb20gJy4uL2RlbGF5YWJsZSdcbmltcG9ydCBUb2dnbGVhYmxlIGZyb20gJy4uL3RvZ2dsZWFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGdldFNsb3QsIGdldFNsb3RUeXBlIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgY29uc29sZUVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUsIFByb3BUeXBlIH0gZnJvbSAndnVlJ1xuXG50eXBlIExpc3RlbmVycyA9IERpY3Rpb25hcnk8KGU6IE1vdXNlRXZlbnQgJiBLZXlib2FyZEV2ZW50ICYgRm9jdXNFdmVudCkgPT4gdm9pZD5cblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgRGVsYXlhYmxlLFxuICBUb2dnbGVhYmxlXG4pXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZCh7XG4gIG5hbWU6ICdhY3RpdmF0YWJsZScsXG5cbiAgcHJvcHM6IHtcbiAgICBhY3RpdmF0b3I6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGwgYXMgdW5rbm93biBhcyBQcm9wVHlwZTxzdHJpbmcgfCBIVE1MRWxlbWVudCB8IFZOb2RlIHwgRWxlbWVudCB8IG51bGw+LFxuICAgICAgdmFsaWRhdG9yOiAodmFsOiBzdHJpbmcgfCBvYmplY3QpID0+IHtcbiAgICAgICAgcmV0dXJuIFsnc3RyaW5nJywgJ29iamVjdCddLmluY2x1ZGVzKHR5cGVvZiB2YWwpXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgaW50ZXJuYWxBY3RpdmF0b3I6IEJvb2xlYW4sXG4gICAgb3Blbk9uQ2xpY2s6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgb3Blbk9uSG92ZXI6IEJvb2xlYW4sXG4gICAgb3Blbk9uRm9jdXM6IEJvb2xlYW4sXG4gIH0sXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICAvLyBEbyBub3QgdXNlIHRoaXMgZGlyZWN0bHksIGNhbGwgZ2V0QWN0aXZhdG9yKCkgaW5zdGVhZFxuICAgIGFjdGl2YXRvckVsZW1lbnQ6IG51bGwgYXMgSFRNTEVsZW1lbnQgfCBudWxsLFxuICAgIGFjdGl2YXRvck5vZGU6IFtdIGFzIFZOb2RlW10sXG4gICAgZXZlbnRzOiBbJ2NsaWNrJywgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZScsICdmb2N1cyddLFxuICAgIGxpc3RlbmVyczoge30gYXMgTGlzdGVuZXJzLFxuICB9KSxcblxuICB3YXRjaDoge1xuICAgIGFjdGl2YXRvcjogJ3Jlc2V0QWN0aXZhdG9yJyxcbiAgICBvcGVuT25Gb2N1czogJ3Jlc2V0QWN0aXZhdG9yJyxcbiAgICBvcGVuT25Ib3ZlcjogJ3Jlc2V0QWN0aXZhdG9yJyxcbiAgfSxcblxuICBtb3VudGVkICgpIHtcbiAgICBjb25zdCBzbG90VHlwZSA9IGdldFNsb3RUeXBlKHRoaXMsICdhY3RpdmF0b3InLCB0cnVlKVxuXG4gICAgaWYgKHNsb3RUeXBlICYmIFsndi1zbG90JywgJ25vcm1hbCddLmluY2x1ZGVzKHNsb3RUeXBlKSkge1xuICAgICAgY29uc29sZUVycm9yKGBUaGUgYWN0aXZhdG9yIHNsb3QgbXVzdCBiZSBib3VuZCwgdHJ5ICc8dGVtcGxhdGUgdi1zbG90OmFjdGl2YXRvcj1cInsgb24gfVwiPjx2LWJ0biB2LW9uPVwib25cIj4nYCwgdGhpcylcbiAgICB9XG5cbiAgICB0aGlzLmFkZEFjdGl2YXRvckV2ZW50cygpXG4gIH0sXG5cbiAgYmVmb3JlRGVzdHJveSAoKSB7XG4gICAgdGhpcy5yZW1vdmVBY3RpdmF0b3JFdmVudHMoKVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBhZGRBY3RpdmF0b3JFdmVudHMgKCkge1xuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5hY3RpdmF0b3IgfHxcbiAgICAgICAgdGhpcy5kaXNhYmxlZCB8fFxuICAgICAgICAhdGhpcy5nZXRBY3RpdmF0b3IoKVxuICAgICAgKSByZXR1cm5cblxuICAgICAgdGhpcy5saXN0ZW5lcnMgPSB0aGlzLmdlbkFjdGl2YXRvckxpc3RlbmVycygpXG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5saXN0ZW5lcnMpXG5cbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgdGhpcy5nZXRBY3RpdmF0b3IoKSEuYWRkRXZlbnRMaXN0ZW5lcihrZXksIHRoaXMubGlzdGVuZXJzW2tleV0gYXMgYW55KVxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuQWN0aXZhdG9yICgpIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBnZXRTbG90KHRoaXMsICdhY3RpdmF0b3InLCBPYmplY3QuYXNzaWduKHRoaXMuZ2V0VmFsdWVQcm94eSgpLCB7XG4gICAgICAgIG9uOiB0aGlzLmdlbkFjdGl2YXRvckxpc3RlbmVycygpLFxuICAgICAgICBhdHRyczogdGhpcy5nZW5BY3RpdmF0b3JBdHRyaWJ1dGVzKCksXG4gICAgICB9KSkgfHwgW11cblxuICAgICAgdGhpcy5hY3RpdmF0b3JOb2RlID0gbm9kZVxuXG4gICAgICByZXR1cm4gbm9kZVxuICAgIH0sXG4gICAgZ2VuQWN0aXZhdG9yQXR0cmlidXRlcyAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByb2xlOiAodGhpcy5vcGVuT25DbGljayAmJiAhdGhpcy5vcGVuT25Ib3ZlcikgPyAnYnV0dG9uJyA6IHVuZGVmaW5lZCxcbiAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAnYXJpYS1leHBhbmRlZCc6IFN0cmluZyh0aGlzLmlzQWN0aXZlKSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGdlbkFjdGl2YXRvckxpc3RlbmVycyAoKSB7XG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuIHt9XG5cbiAgICAgIGNvbnN0IGxpc3RlbmVyczogTGlzdGVuZXJzID0ge31cblxuICAgICAgaWYgKHRoaXMub3Blbk9uSG92ZXIpIHtcbiAgICAgICAgbGlzdGVuZXJzLm1vdXNlZW50ZXIgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuZ2V0QWN0aXZhdG9yKGUpXG4gICAgICAgICAgdGhpcy5ydW5EZWxheSgnb3BlbicpXG4gICAgICAgIH1cbiAgICAgICAgbGlzdGVuZXJzLm1vdXNlbGVhdmUgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuZ2V0QWN0aXZhdG9yKGUpXG4gICAgICAgICAgdGhpcy5ydW5EZWxheSgnY2xvc2UnKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3Blbk9uQ2xpY2spIHtcbiAgICAgICAgbGlzdGVuZXJzLmNsaWNrID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSB0aGlzLmdldEFjdGl2YXRvcihlKVxuICAgICAgICAgIGlmIChhY3RpdmF0b3IpIGFjdGl2YXRvci5mb2N1cygpXG5cbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gIXRoaXMuaXNBY3RpdmVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcGVuT25Gb2N1cykge1xuICAgICAgICBsaXN0ZW5lcnMuZm9jdXMgPSAoZTogRm9jdXNFdmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuZ2V0QWN0aXZhdG9yKGUpXG5cbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gIXRoaXMuaXNBY3RpdmVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGlzdGVuZXJzXG4gICAgfSxcbiAgICBnZXRBY3RpdmF0b3IgKGU/OiBFdmVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGZldGNoZWQgdGhlIGFjdGl2YXRvciwgcmUtdXNlXG4gICAgICBpZiAodGhpcy5hY3RpdmF0b3JFbGVtZW50KSByZXR1cm4gdGhpcy5hY3RpdmF0b3JFbGVtZW50XG5cbiAgICAgIGxldCBhY3RpdmF0b3IgPSBudWxsXG5cbiAgICAgIGlmICh0aGlzLmFjdGl2YXRvcikge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmludGVybmFsQWN0aXZhdG9yID8gdGhpcy4kZWwgOiBkb2N1bWVudFxuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5hY3RpdmF0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgLy8gU2VsZWN0b3JcbiAgICAgICAgICBhY3RpdmF0b3IgPSB0YXJnZXQucXVlcnlTZWxlY3Rvcih0aGlzLmFjdGl2YXRvcilcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5hY3RpdmF0b3IgYXMgYW55KS4kZWwpIHtcbiAgICAgICAgICAvLyBDb21wb25lbnQgKHJlZilcbiAgICAgICAgICBhY3RpdmF0b3IgPSAodGhpcy5hY3RpdmF0b3IgYXMgYW55KS4kZWxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBIVE1MRWxlbWVudCB8IEVsZW1lbnRcbiAgICAgICAgICBhY3RpdmF0b3IgPSB0aGlzLmFjdGl2YXRvclxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZhdG9yTm9kZS5sZW5ndGggPT09IDEgfHwgKHRoaXMuYWN0aXZhdG9yTm9kZS5sZW5ndGggJiYgIWUpKSB7XG4gICAgICAgIC8vIFVzZSB0aGUgY29udGVudHMgb2YgdGhlIGFjdGl2YXRvciBzbG90XG4gICAgICAgIC8vIFRoZXJlJ3MgZWl0aGVyIG9ubHkgb25lIGVsZW1lbnQgaW4gaXQgb3Igd2VcbiAgICAgICAgLy8gZG9uJ3QgaGF2ZSBhIGNsaWNrIGV2ZW50IHRvIHVzZSBhcyBhIGxhc3QgcmVzb3J0XG4gICAgICAgIGNvbnN0IHZtID0gdGhpcy5hY3RpdmF0b3JOb2RlWzBdLmNvbXBvbmVudEluc3RhbmNlXG4gICAgICAgIGlmIChcbiAgICAgICAgICB2bSAmJlxuICAgICAgICAgIHZtLiRvcHRpb25zLm1peGlucyAmJiAvLyAgICAgICAgICAgICAgICAgICAgICAgICBBY3RpdmF0YWJsZSBpcyBpbmRpcmVjdGx5IHVzZWQgdmlhIE1lbnVhYmxlXG4gICAgICAgICAgdm0uJG9wdGlvbnMubWl4aW5zLnNvbWUoKG06IGFueSkgPT4gbS5vcHRpb25zICYmIFsnYWN0aXZhdGFibGUnLCAnbWVudWFibGUnXS5pbmNsdWRlcyhtLm9wdGlvbnMubmFtZSkpXG4gICAgICAgICkge1xuICAgICAgICAgIC8vIEFjdGl2YXRvciBpcyBhY3R1YWxseSBhbm90aGVyIGFjdGl2YXRpYmxlIGNvbXBvbmVudCwgdXNlIGl0cyBhY3RpdmF0b3IgKCM4ODQ2KVxuICAgICAgICAgIGFjdGl2YXRvciA9ICh2bSBhcyBhbnkpLmdldEFjdGl2YXRvcigpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWN0aXZhdG9yID0gdGhpcy5hY3RpdmF0b3JOb2RlWzBdLmVsbSBhcyBIVE1MRWxlbWVudFxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGUpIHtcbiAgICAgICAgLy8gQWN0aXZhdGVkIGJ5IGEgY2xpY2sgb3IgZm9jdXMgZXZlbnRcbiAgICAgICAgYWN0aXZhdG9yID0gKGUuY3VycmVudFRhcmdldCB8fCBlLnRhcmdldCkgYXMgSFRNTEVsZW1lbnRcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGFjdGl2YXRvciBzaG91bGQgb25seSBiZSBhIHZhbGlkIGVsZW1lbnQgKElnbm9yZSBjb21tZW50cyBhbmQgdGV4dCBub2RlcylcbiAgICAgIHRoaXMuYWN0aXZhdG9yRWxlbWVudCA9IGFjdGl2YXRvcj8ubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFID8gYWN0aXZhdG9yIDogbnVsbFxuXG4gICAgICByZXR1cm4gdGhpcy5hY3RpdmF0b3JFbGVtZW50XG4gICAgfSxcbiAgICBnZXRDb250ZW50U2xvdCAoKSB7XG4gICAgICByZXR1cm4gZ2V0U2xvdCh0aGlzLCAnZGVmYXVsdCcsIHRoaXMuZ2V0VmFsdWVQcm94eSgpLCB0cnVlKVxuICAgIH0sXG4gICAgZ2V0VmFsdWVQcm94eSAoKTogb2JqZWN0IHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgICByZXR1cm4ge1xuICAgICAgICBnZXQgdmFsdWUgKCkge1xuICAgICAgICAgIHJldHVybiBzZWxmLmlzQWN0aXZlXG4gICAgICAgIH0sXG4gICAgICAgIHNldCB2YWx1ZSAoaXNBY3RpdmU6IGJvb2xlYW4pIHtcbiAgICAgICAgICBzZWxmLmlzQWN0aXZlID0gaXNBY3RpdmVcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlbW92ZUFjdGl2YXRvckV2ZW50cyAoKSB7XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLmFjdGl2YXRvciB8fFxuICAgICAgICAhdGhpcy5hY3RpdmF0b3JFbGVtZW50XG4gICAgICApIHJldHVyblxuXG4gICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5saXN0ZW5lcnMpXG5cbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgKHRoaXMuYWN0aXZhdG9yRWxlbWVudCBhcyBhbnkpLnJlbW92ZUV2ZW50TGlzdGVuZXIoa2V5LCB0aGlzLmxpc3RlbmVyc1trZXldKVxuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RlbmVycyA9IHt9XG4gICAgfSxcbiAgICByZXNldEFjdGl2YXRvciAoKSB7XG4gICAgICB0aGlzLnJlbW92ZUFjdGl2YXRvckV2ZW50cygpXG4gICAgICB0aGlzLmFjdGl2YXRvckVsZW1lbnQgPSBudWxsXG4gICAgICB0aGlzLmdldEFjdGl2YXRvcigpXG4gICAgICB0aGlzLmFkZEFjdGl2YXRvckV2ZW50cygpXG4gICAgfSxcbiAgfSxcbn0pXG4iXX0=
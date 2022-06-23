// Components
import { VExpandTransition } from '../transitions';
import { VIcon } from '../VIcon';
// Mixins
import { inject as RegistrableInject } from '../../mixins/registrable';
import Colorable from '../../mixins/colorable';
// Utils
import mixins from '../../util/mixins';
import { getObjectValueByPath, createRange } from '../../util/helpers';
const baseMixins = mixins(Colorable, RegistrableInject('treeview'));
export const VTreeviewNodeProps = {
    activatable: Boolean,
    activeClass: {
        type: String,
        default: 'v-treeview-node--active',
    },
    color: {
        type: String,
        default: 'primary',
    },
    disablePerNode: Boolean,
    expandIcon: {
        type: String,
        default: '$subgroup',
    },
    indeterminateIcon: {
        type: String,
        default: '$checkboxIndeterminate',
    },
    itemChildren: {
        type: String,
        default: 'children',
    },
    itemDisabled: {
        type: String,
        default: 'disabled',
    },
    itemKey: {
        type: String,
        default: 'id',
    },
    itemText: {
        type: String,
        default: 'name',
    },
    loadChildren: Function,
    loadingIcon: {
        type: String,
        default: '$loading',
    },
    offIcon: {
        type: String,
        default: '$checkboxOff',
    },
    onIcon: {
        type: String,
        default: '$checkboxOn',
    },
    openOnClick: Boolean,
    rounded: Boolean,
    selectable: Boolean,
    selectedColor: {
        type: String,
        default: 'accent',
    },
    shaped: Boolean,
    transition: Boolean,
    selectionType: {
        type: String,
        default: 'leaf',
        validator: (v) => ['leaf', 'independent'].includes(v),
    },
};
/* @vue/component */
const VTreeviewNode = baseMixins.extend().extend({
    name: 'v-treeview-node',
    inject: {
        treeview: {
            default: null,
        },
    },
    props: {
        level: Number,
        item: {
            type: Object,
            default: () => null,
        },
        parentIsDisabled: Boolean,
        ...VTreeviewNodeProps,
    },
    data: () => ({
        hasLoaded: false,
        isActive: false,
        isIndeterminate: false,
        isLoading: false,
        isOpen: false,
        isSelected: false,
    }),
    computed: {
        disabled() {
            return (getObjectValueByPath(this.item, this.itemDisabled) ||
                (!this.disablePerNode && (this.parentIsDisabled && this.selectionType === 'leaf')));
        },
        key() {
            return getObjectValueByPath(this.item, this.itemKey);
        },
        children() {
            const children = getObjectValueByPath(this.item, this.itemChildren);
            return children && children.filter((child) => !this.treeview.isExcluded(getObjectValueByPath(child, this.itemKey)));
        },
        text() {
            return getObjectValueByPath(this.item, this.itemText);
        },
        scopedProps() {
            return {
                item: this.item,
                leaf: !this.children,
                selected: this.isSelected,
                indeterminate: this.isIndeterminate,
                active: this.isActive,
                open: this.isOpen,
            };
        },
        computedIcon() {
            if (this.isIndeterminate)
                return this.indeterminateIcon;
            else if (this.isSelected)
                return this.onIcon;
            else
                return this.offIcon;
        },
        hasChildren() {
            return !!this.children && (!!this.children.length || !!this.loadChildren);
        },
    },
    created() {
        this.treeview.register(this);
    },
    beforeDestroy() {
        this.treeview.unregister(this);
    },
    methods: {
        checkChildren() {
            return new Promise(resolve => {
                // TODO: Potential issue with always trying
                // to load children if response is empty?
                if (!this.children || this.children.length || !this.loadChildren || this.hasLoaded)
                    return resolve();
                this.isLoading = true;
                resolve(this.loadChildren(this.item));
            }).then(() => {
                this.isLoading = false;
                this.hasLoaded = true;
            });
        },
        open() {
            this.isOpen = !this.isOpen;
            this.treeview.updateOpen(this.key, this.isOpen);
            this.treeview.emitOpen();
        },
        genLabel() {
            const children = [];
            if (this.$scopedSlots.label)
                children.push(this.$scopedSlots.label(this.scopedProps));
            else
                children.push(this.text);
            return this.$createElement('div', {
                slot: 'label',
                staticClass: 'v-treeview-node__label',
            }, children);
        },
        genPrependSlot() {
            if (!this.$scopedSlots.prepend)
                return null;
            return this.$createElement('div', {
                staticClass: 'v-treeview-node__prepend',
            }, this.$scopedSlots.prepend(this.scopedProps));
        },
        genAppendSlot() {
            if (!this.$scopedSlots.append)
                return null;
            return this.$createElement('div', {
                staticClass: 'v-treeview-node__append',
            }, this.$scopedSlots.append(this.scopedProps));
        },
        genContent() {
            const children = [
                this.genPrependSlot(),
                this.genLabel(),
                this.genAppendSlot(),
            ];
            return this.$createElement('div', {
                staticClass: 'v-treeview-node__content',
            }, children);
        },
        genToggle() {
            return this.$createElement(VIcon, {
                staticClass: 'v-treeview-node__toggle',
                class: {
                    'v-treeview-node__toggle--open': this.isOpen,
                    'v-treeview-node__toggle--loading': this.isLoading,
                },
                slot: 'prepend',
                on: {
                    click: (e) => {
                        e.stopPropagation();
                        if (this.isLoading)
                            return;
                        this.checkChildren().then(() => this.open());
                    },
                },
            }, [this.isLoading ? this.loadingIcon : this.expandIcon]);
        },
        genCheckbox() {
            return this.$createElement(VIcon, {
                staticClass: 'v-treeview-node__checkbox',
                props: {
                    color: this.isSelected || this.isIndeterminate ? this.selectedColor : undefined,
                    disabled: this.disabled,
                },
                on: {
                    click: (e) => {
                        e.stopPropagation();
                        if (this.isLoading)
                            return;
                        this.checkChildren().then(() => {
                            // We nextTick here so that items watch in VTreeview has a chance to run first
                            this.$nextTick(() => {
                                this.isSelected = !this.isSelected;
                                this.isIndeterminate = false;
                                this.treeview.updateSelected(this.key, this.isSelected);
                                this.treeview.emitSelected();
                            });
                        });
                    },
                },
            }, [this.computedIcon]);
        },
        genLevel(level) {
            return createRange(level).map(() => this.$createElement('div', {
                staticClass: 'v-treeview-node__level',
            }));
        },
        genNode() {
            const children = [this.genContent()];
            if (this.selectable)
                children.unshift(this.genCheckbox());
            if (this.hasChildren) {
                children.unshift(this.genToggle());
            }
            else {
                children.unshift(...this.genLevel(1));
            }
            children.unshift(...this.genLevel(this.level));
            return this.$createElement('div', this.setTextColor(this.isActive && this.color, {
                staticClass: 'v-treeview-node__root',
                class: {
                    [this.activeClass]: this.isActive,
                },
                on: {
                    click: () => {
                        if (this.openOnClick && this.hasChildren) {
                            this.checkChildren().then(this.open);
                        }
                        else if (this.activatable && !this.disabled) {
                            this.isActive = !this.isActive;
                            this.treeview.updateActive(this.key, this.isActive);
                            this.treeview.emitActive();
                        }
                    },
                },
            }), children);
        },
        genChild(item, parentIsDisabled) {
            return this.$createElement(VTreeviewNode, {
                key: getObjectValueByPath(item, this.itemKey),
                props: {
                    activatable: this.activatable,
                    activeClass: this.activeClass,
                    item,
                    selectable: this.selectable,
                    selectedColor: this.selectedColor,
                    color: this.color,
                    disablePerNode: this.disablePerNode,
                    expandIcon: this.expandIcon,
                    indeterminateIcon: this.indeterminateIcon,
                    offIcon: this.offIcon,
                    onIcon: this.onIcon,
                    loadingIcon: this.loadingIcon,
                    itemKey: this.itemKey,
                    itemText: this.itemText,
                    itemDisabled: this.itemDisabled,
                    itemChildren: this.itemChildren,
                    loadChildren: this.loadChildren,
                    transition: this.transition,
                    openOnClick: this.openOnClick,
                    rounded: this.rounded,
                    shaped: this.shaped,
                    level: this.level + 1,
                    selectionType: this.selectionType,
                    parentIsDisabled,
                },
                scopedSlots: this.$scopedSlots,
            });
        },
        genChildrenWrapper() {
            if (!this.isOpen || !this.children)
                return null;
            const children = [this.children.map(c => this.genChild(c, this.disabled))];
            return this.$createElement('div', {
                staticClass: 'v-treeview-node__children',
            }, children);
        },
        genTransition() {
            return this.$createElement(VExpandTransition, [this.genChildrenWrapper()]);
        },
    },
    render(h) {
        const children = [this.genNode()];
        if (this.transition)
            children.push(this.genTransition());
        else
            children.push(this.genChildrenWrapper());
        return h('div', {
            staticClass: 'v-treeview-node',
            class: {
                'v-treeview-node--leaf': !this.hasChildren,
                'v-treeview-node--click': this.openOnClick,
                'v-treeview-node--disabled': this.disabled,
                'v-treeview-node--rounded': this.rounded,
                'v-treeview-node--shaped': this.shaped,
                'v-treeview-node--selected': this.isSelected,
            },
            attrs: {
                'aria-expanded': String(this.isOpen),
            },
        }, children);
    },
});
export default VTreeviewNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRyZWV2aWV3Tm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZUcmVldmlldy9WVHJlZXZpZXdOb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGFBQWE7QUFDYixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBR2hDLFNBQVM7QUFDVCxPQUFPLEVBQUUsTUFBTSxJQUFJLGlCQUFpQixFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDdEUsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsUUFBUTtBQUNSLE9BQU8sTUFBc0IsTUFBTSxtQkFBbUIsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFRdEUsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixTQUFTLEVBQ1QsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQzlCLENBQUE7QUFNRCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRztJQUNoQyxXQUFXLEVBQUUsT0FBTztJQUNwQixXQUFXLEVBQUU7UUFDWCxJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSx5QkFBeUI7S0FDbkM7SUFDRCxLQUFLLEVBQUU7UUFDTCxJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSxTQUFTO0tBQ25CO0lBQ0QsY0FBYyxFQUFFLE9BQU87SUFDdkIsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLE1BQU07UUFDWixPQUFPLEVBQUUsV0FBVztLQUNyQjtJQUNELGlCQUFpQixFQUFFO1FBQ2pCLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLHdCQUF3QjtLQUNsQztJQUNELFlBQVksRUFBRTtRQUNaLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLFVBQVU7S0FDcEI7SUFD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RSxDQUFDLENBQUMsQ0FBQTtRQUM1RSxDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE1BQU0sUUFBUSxHQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBRWhELElBQUksSUFBSSxDQUFDLFVBQVU7WUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFBOztZQUNuRCxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUE7UUFFN0MsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ2QsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixLQUFLLEVBQUU7Z0JBQ0wsdUJBQXVCLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDMUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUMxQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDeEMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ3RDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxVQUFVO2FBQzdDO1lBQ0QsS0FBSyxFQUFFO2dCQUNMLGVBQWUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUNyQztTQUNGLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDZCxDQUFDO0NBQ0YsQ0FBQyxDQUFBO0FBRUYsZUFBZSxhQUFhLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb21wb25lbnRzXG5pbXBvcnQgeyBWRXhwYW5kVHJhbnNpdGlvbiB9IGZyb20gJy4uL3RyYW5zaXRpb25zJ1xuaW1wb3J0IHsgVkljb24gfSBmcm9tICcuLi9WSWNvbidcbmltcG9ydCBWVHJlZXZpZXcgZnJvbSAnLi9WVHJlZXZpZXcnXG5cbi8vIE1peGluc1xuaW1wb3J0IHsgaW5qZWN0IGFzIFJlZ2lzdHJhYmxlSW5qZWN0IH0gZnJvbSAnLi4vLi4vbWl4aW5zL3JlZ2lzdHJhYmxlJ1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuXG4vLyBVdGlsc1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBnZXRPYmplY3RWYWx1ZUJ5UGF0aCwgY3JlYXRlUmFuZ2UgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVDaGlsZHJlbiwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5cbnR5cGUgVlRyZWVWaWV3SW5zdGFuY2UgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIFZUcmVldmlldz5cblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgQ29sb3JhYmxlLFxuICBSZWdpc3RyYWJsZUluamVjdCgndHJlZXZpZXcnKVxuKVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEV4dHJhY3RWdWU8dHlwZW9mIGJhc2VNaXhpbnM+IHtcbiAgdHJlZXZpZXc6IFZUcmVlVmlld0luc3RhbmNlXG59XG5cbmV4cG9ydCBjb25zdCBWVHJlZXZpZXdOb2RlUHJvcHMgPSB7XG4gIGFjdGl2YXRhYmxlOiBCb29sZWFuLFxuICBhY3RpdmVDbGFzczoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAndi10cmVldmlldy1ub2RlLS1hY3RpdmUnLFxuICB9LFxuICBjb2xvcjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAncHJpbWFyeScsXG4gIH0sXG4gIGRpc2FibGVQZXJOb2RlOiBCb29sZWFuLFxuICBleHBhbmRJY29uOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlZmF1bHQ6ICckc3ViZ3JvdXAnLFxuICB9LFxuICBpbmRldGVybWluYXRlSWNvbjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnJGNoZWNrYm94SW5kZXRlcm1pbmF0ZScsXG4gIH0sXG4gIGl0ZW1DaGlsZHJlbjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnY2hpbGRyZW4nLFxuICB9LFxuICBpdGVtRGlzYWJsZWQ6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgZGVmYXVsdDogJ2Rpc2FibGVkJyxcbiAgfSxcbiAgaXRlbUtleToge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnaWQnLFxuICB9LFxuICBpdGVtVGV4dDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnbmFtZScsXG4gIH0sXG4gIGxvYWRDaGlsZHJlbjogRnVuY3Rpb24gYXMgUHJvcFR5cGU8KGl0ZW06IGFueSkgPT4gUHJvbWlzZTx2b2lkPj4sXG4gIGxvYWRpbmdJY29uOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlZmF1bHQ6ICckbG9hZGluZycsXG4gIH0sXG4gIG9mZkljb246IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgZGVmYXVsdDogJyRjaGVja2JveE9mZicsXG4gIH0sXG4gIG9uSWNvbjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnJGNoZWNrYm94T24nLFxuICB9LFxuICBvcGVuT25DbGljazogQm9vbGVhbixcbiAgcm91bmRlZDogQm9vbGVhbixcbiAgc2VsZWN0YWJsZTogQm9vbGVhbixcbiAgc2VsZWN0ZWRDb2xvcjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnYWNjZW50JyxcbiAgfSxcbiAgc2hhcGVkOiBCb29sZWFuLFxuICB0cmFuc2l0aW9uOiBCb29sZWFuLFxuICBzZWxlY3Rpb25UeXBlOiB7XG4gICAgdHlwZTogU3RyaW5nIGFzIFByb3BUeXBlPCdsZWFmJyB8ICdpbmRlcGVuZGVudCc+LFxuICAgIGRlZmF1bHQ6ICdsZWFmJyxcbiAgICB2YWxpZGF0b3I6ICh2OiBzdHJpbmcpID0+IFsnbGVhZicsICdpbmRlcGVuZGVudCddLmluY2x1ZGVzKHYpLFxuICB9LFxufVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuY29uc3QgVlRyZWV2aWV3Tm9kZSA9IGJhc2VNaXhpbnMuZXh0ZW5kPG9wdGlvbnM+KCkuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtdHJlZXZpZXctbm9kZScsXG5cbiAgaW5qZWN0OiB7XG4gICAgdHJlZXZpZXc6IHtcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgfSxcblxuICBwcm9wczoge1xuICAgIGxldmVsOiBOdW1iZXIsXG4gICAgaXRlbToge1xuICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgZGVmYXVsdDogKCkgPT4gbnVsbCxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8UmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsPixcbiAgICBwYXJlbnRJc0Rpc2FibGVkOiBCb29sZWFuLFxuICAgIC4uLlZUcmVldmlld05vZGVQcm9wcyxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGhhc0xvYWRlZDogZmFsc2UsXG4gICAgaXNBY3RpdmU6IGZhbHNlLCAvLyBOb2RlIGlzIHNlbGVjdGVkIChyb3cpXG4gICAgaXNJbmRldGVybWluYXRlOiBmYWxzZSwgLy8gTm9kZSBoYXMgYXQgbGVhc3Qgb25lIHNlbGVjdGVkIGNoaWxkXG4gICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICBpc09wZW46IGZhbHNlLCAvLyBOb2RlIGlzIG9wZW4vZXhwYW5kZWRcbiAgICBpc1NlbGVjdGVkOiBmYWxzZSwgLy8gTm9kZSBpcyBzZWxlY3RlZCAoY2hlY2tib3gpXG4gIH0pLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgZGlzYWJsZWQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZ2V0T2JqZWN0VmFsdWVCeVBhdGgodGhpcy5pdGVtLCB0aGlzLml0ZW1EaXNhYmxlZCkgfHxcbiAgICAgICAgKCF0aGlzLmRpc2FibGVQZXJOb2RlICYmICh0aGlzLnBhcmVudElzRGlzYWJsZWQgJiYgdGhpcy5zZWxlY3Rpb25UeXBlID09PSAnbGVhZicpKVxuICAgICAgKVxuICAgIH0sXG4gICAga2V5ICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIGdldE9iamVjdFZhbHVlQnlQYXRoKHRoaXMuaXRlbSwgdGhpcy5pdGVtS2V5KVxuICAgIH0sXG4gICAgY2hpbGRyZW4gKCk6IGFueVtdIHwgbnVsbCB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGdldE9iamVjdFZhbHVlQnlQYXRoKHRoaXMuaXRlbSwgdGhpcy5pdGVtQ2hpbGRyZW4pXG4gICAgICByZXR1cm4gY2hpbGRyZW4gJiYgY2hpbGRyZW4uZmlsdGVyKChjaGlsZDogYW55KSA9PiAhdGhpcy50cmVldmlldy5pc0V4Y2x1ZGVkKGdldE9iamVjdFZhbHVlQnlQYXRoKGNoaWxkLCB0aGlzLml0ZW1LZXkpKSlcbiAgICB9LFxuICAgIHRleHQgKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gZ2V0T2JqZWN0VmFsdWVCeVBhdGgodGhpcy5pdGVtLCB0aGlzLml0ZW1UZXh0KVxuICAgIH0sXG4gICAgc2NvcGVkUHJvcHMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpdGVtOiB0aGlzLml0ZW0sXG4gICAgICAgIGxlYWY6ICF0aGlzLmNoaWxkcmVuLFxuICAgICAgICBzZWxlY3RlZDogdGhpcy5pc1NlbGVjdGVkLFxuICAgICAgICBpbmRldGVybWluYXRlOiB0aGlzLmlzSW5kZXRlcm1pbmF0ZSxcbiAgICAgICAgYWN0aXZlOiB0aGlzLmlzQWN0aXZlLFxuICAgICAgICBvcGVuOiB0aGlzLmlzT3BlbixcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkSWNvbiAoKTogc3RyaW5nIHtcbiAgICAgIGlmICh0aGlzLmlzSW5kZXRlcm1pbmF0ZSkgcmV0dXJuIHRoaXMuaW5kZXRlcm1pbmF0ZUljb25cbiAgICAgIGVsc2UgaWYgKHRoaXMuaXNTZWxlY3RlZCkgcmV0dXJuIHRoaXMub25JY29uXG4gICAgICBlbHNlIHJldHVybiB0aGlzLm9mZkljb25cbiAgICB9LFxuICAgIGhhc0NoaWxkcmVuICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAhIXRoaXMuY2hpbGRyZW4gJiYgKCEhdGhpcy5jaGlsZHJlbi5sZW5ndGggfHwgISF0aGlzLmxvYWRDaGlsZHJlbilcbiAgICB9LFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIHRoaXMudHJlZXZpZXcucmVnaXN0ZXIodGhpcylcbiAgfSxcblxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICB0aGlzLnRyZWV2aWV3LnVucmVnaXN0ZXIodGhpcylcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgY2hlY2tDaGlsZHJlbiAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB7XG4gICAgICAgIC8vIFRPRE86IFBvdGVudGlhbCBpc3N1ZSB3aXRoIGFsd2F5cyB0cnlpbmdcbiAgICAgICAgLy8gdG8gbG9hZCBjaGlsZHJlbiBpZiByZXNwb25zZSBpcyBlbXB0eT9cbiAgICAgICAgaWYgKCF0aGlzLmNoaWxkcmVuIHx8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIHx8ICF0aGlzLmxvYWRDaGlsZHJlbiB8fCB0aGlzLmhhc0xvYWRlZCkgcmV0dXJuIHJlc29sdmUoKVxuXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZVxuICAgICAgICByZXNvbHZlKHRoaXMubG9hZENoaWxkcmVuKHRoaXMuaXRlbSkpXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLmhhc0xvYWRlZCA9IHRydWVcbiAgICAgIH0pXG4gICAgfSxcbiAgICBvcGVuICgpIHtcbiAgICAgIHRoaXMuaXNPcGVuID0gIXRoaXMuaXNPcGVuXG4gICAgICB0aGlzLnRyZWV2aWV3LnVwZGF0ZU9wZW4odGhpcy5rZXksIHRoaXMuaXNPcGVuKVxuICAgICAgdGhpcy50cmVldmlldy5lbWl0T3BlbigpXG4gICAgfSxcbiAgICBnZW5MYWJlbCAoKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtdXG5cbiAgICAgIGlmICh0aGlzLiRzY29wZWRTbG90cy5sYWJlbCkgY2hpbGRyZW4ucHVzaCh0aGlzLiRzY29wZWRTbG90cy5sYWJlbCh0aGlzLnNjb3BlZFByb3BzKSlcbiAgICAgIGVsc2UgY2hpbGRyZW4ucHVzaCh0aGlzLnRleHQpXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHNsb3Q6ICdsYWJlbCcsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlX19sYWJlbCcsXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlblByZXBlbmRTbG90ICgpIHtcbiAgICAgIGlmICghdGhpcy4kc2NvcGVkU2xvdHMucHJlcGVuZCkgcmV0dXJuIG51bGxcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXRyZWV2aWV3LW5vZGVfX3ByZXBlbmQnLFxuICAgICAgfSwgdGhpcy4kc2NvcGVkU2xvdHMucHJlcGVuZCh0aGlzLnNjb3BlZFByb3BzKSlcbiAgICB9LFxuICAgIGdlbkFwcGVuZFNsb3QgKCkge1xuICAgICAgaWYgKCF0aGlzLiRzY29wZWRTbG90cy5hcHBlbmQpIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlX19hcHBlbmQnLFxuICAgICAgfSwgdGhpcy4kc2NvcGVkU2xvdHMuYXBwZW5kKHRoaXMuc2NvcGVkUHJvcHMpKVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtcbiAgICAgICAgdGhpcy5nZW5QcmVwZW5kU2xvdCgpLFxuICAgICAgICB0aGlzLmdlbkxhYmVsKCksXG4gICAgICAgIHRoaXMuZ2VuQXBwZW5kU2xvdCgpLFxuICAgICAgXVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtdHJlZXZpZXctbm9kZV9fY29udGVudCcsXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlblRvZ2dsZSAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWSWNvbiwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtdHJlZXZpZXctbm9kZV9fdG9nZ2xlJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi10cmVldmlldy1ub2RlX190b2dnbGUtLW9wZW4nOiB0aGlzLmlzT3BlbixcbiAgICAgICAgICAndi10cmVldmlldy1ub2RlX190b2dnbGUtLWxvYWRpbmcnOiB0aGlzLmlzTG9hZGluZyxcbiAgICAgICAgfSxcbiAgICAgICAgc2xvdDogJ3ByZXBlbmQnLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHJldHVyblxuXG4gICAgICAgICAgICB0aGlzLmNoZWNrQ2hpbGRyZW4oKS50aGVuKCgpID0+IHRoaXMub3BlbigpKVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LCBbdGhpcy5pc0xvYWRpbmcgPyB0aGlzLmxvYWRpbmdJY29uIDogdGhpcy5leHBhbmRJY29uXSlcbiAgICB9LFxuICAgIGdlbkNoZWNrYm94ICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlX19jaGVja2JveCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgY29sb3I6IHRoaXMuaXNTZWxlY3RlZCB8fCB0aGlzLmlzSW5kZXRlcm1pbmF0ZSA/IHRoaXMuc2VsZWN0ZWRDb2xvciA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljazogKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSByZXR1cm5cblxuICAgICAgICAgICAgdGhpcy5jaGVja0NoaWxkcmVuKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIFdlIG5leHRUaWNrIGhlcmUgc28gdGhhdCBpdGVtcyB3YXRjaCBpbiBWVHJlZXZpZXcgaGFzIGEgY2hhbmNlIHRvIHJ1biBmaXJzdFxuICAgICAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gIXRoaXMuaXNTZWxlY3RlZFxuICAgICAgICAgICAgICAgIHRoaXMuaXNJbmRldGVybWluYXRlID0gZmFsc2VcblxuICAgICAgICAgICAgICAgIHRoaXMudHJlZXZpZXcudXBkYXRlU2VsZWN0ZWQodGhpcy5rZXksIHRoaXMuaXNTZWxlY3RlZClcbiAgICAgICAgICAgICAgICB0aGlzLnRyZWV2aWV3LmVtaXRTZWxlY3RlZCgpXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LCBbdGhpcy5jb21wdXRlZEljb25dKVxuICAgIH0sXG4gICAgZ2VuTGV2ZWwgKGxldmVsOiBudW1iZXIpIHtcbiAgICAgIHJldHVybiBjcmVhdGVSYW5nZShsZXZlbCkubWFwKCgpID0+IHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXRyZWV2aWV3LW5vZGVfX2xldmVsJyxcbiAgICAgIH0pKVxuICAgIH0sXG4gICAgZ2VuTm9kZSAoKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFt0aGlzLmdlbkNvbnRlbnQoKV1cblxuICAgICAgaWYgKHRoaXMuc2VsZWN0YWJsZSkgY2hpbGRyZW4udW5zaGlmdCh0aGlzLmdlbkNoZWNrYm94KCkpXG5cbiAgICAgIGlmICh0aGlzLmhhc0NoaWxkcmVuKSB7XG4gICAgICAgIGNoaWxkcmVuLnVuc2hpZnQodGhpcy5nZW5Ub2dnbGUoKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoaWxkcmVuLnVuc2hpZnQoLi4udGhpcy5nZW5MZXZlbCgxKSlcbiAgICAgIH1cblxuICAgICAgY2hpbGRyZW4udW5zaGlmdCguLi50aGlzLmdlbkxldmVsKHRoaXMubGV2ZWwpKVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgdGhpcy5zZXRUZXh0Q29sb3IodGhpcy5pc0FjdGl2ZSAmJiB0aGlzLmNvbG9yLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlX19yb290JyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICBbdGhpcy5hY3RpdmVDbGFzc106IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wZW5PbkNsaWNrICYmIHRoaXMuaGFzQ2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgdGhpcy5jaGVja0NoaWxkcmVuKCkudGhlbih0aGlzLm9wZW4pXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZhdGFibGUgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgdGhpcy5pc0FjdGl2ZSA9ICF0aGlzLmlzQWN0aXZlXG4gICAgICAgICAgICAgIHRoaXMudHJlZXZpZXcudXBkYXRlQWN0aXZlKHRoaXMua2V5LCB0aGlzLmlzQWN0aXZlKVxuICAgICAgICAgICAgICB0aGlzLnRyZWV2aWV3LmVtaXRBY3RpdmUoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KSwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBnZW5DaGlsZCAoaXRlbTogYW55LCBwYXJlbnRJc0Rpc2FibGVkOiBib29sZWFuKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWVHJlZXZpZXdOb2RlLCB7XG4gICAgICAgIGtleTogZ2V0T2JqZWN0VmFsdWVCeVBhdGgoaXRlbSwgdGhpcy5pdGVtS2V5KSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBhY3RpdmF0YWJsZTogdGhpcy5hY3RpdmF0YWJsZSxcbiAgICAgICAgICBhY3RpdmVDbGFzczogdGhpcy5hY3RpdmVDbGFzcyxcbiAgICAgICAgICBpdGVtLFxuICAgICAgICAgIHNlbGVjdGFibGU6IHRoaXMuc2VsZWN0YWJsZSxcbiAgICAgICAgICBzZWxlY3RlZENvbG9yOiB0aGlzLnNlbGVjdGVkQ29sb3IsXG4gICAgICAgICAgY29sb3I6IHRoaXMuY29sb3IsXG4gICAgICAgICAgZGlzYWJsZVBlck5vZGU6IHRoaXMuZGlzYWJsZVBlck5vZGUsXG4gICAgICAgICAgZXhwYW5kSWNvbjogdGhpcy5leHBhbmRJY29uLFxuICAgICAgICAgIGluZGV0ZXJtaW5hdGVJY29uOiB0aGlzLmluZGV0ZXJtaW5hdGVJY29uLFxuICAgICAgICAgIG9mZkljb246IHRoaXMub2ZmSWNvbixcbiAgICAgICAgICBvbkljb246IHRoaXMub25JY29uLFxuICAgICAgICAgIGxvYWRpbmdJY29uOiB0aGlzLmxvYWRpbmdJY29uLFxuICAgICAgICAgIGl0ZW1LZXk6IHRoaXMuaXRlbUtleSxcbiAgICAgICAgICBpdGVtVGV4dDogdGhpcy5pdGVtVGV4dCxcbiAgICAgICAgICBpdGVtRGlzYWJsZWQ6IHRoaXMuaXRlbURpc2FibGVkLFxuICAgICAgICAgIGl0ZW1DaGlsZHJlbjogdGhpcy5pdGVtQ2hpbGRyZW4sXG4gICAgICAgICAgbG9hZENoaWxkcmVuOiB0aGlzLmxvYWRDaGlsZHJlbixcbiAgICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgICAgb3Blbk9uQ2xpY2s6IHRoaXMub3Blbk9uQ2xpY2ssXG4gICAgICAgICAgcm91bmRlZDogdGhpcy5yb3VuZGVkLFxuICAgICAgICAgIHNoYXBlZDogdGhpcy5zaGFwZWQsXG4gICAgICAgICAgbGV2ZWw6IHRoaXMubGV2ZWwgKyAxLFxuICAgICAgICAgIHNlbGVjdGlvblR5cGU6IHRoaXMuc2VsZWN0aW9uVHlwZSxcbiAgICAgICAgICBwYXJlbnRJc0Rpc2FibGVkLFxuICAgICAgICB9LFxuICAgICAgICBzY29wZWRTbG90czogdGhpcy4kc2NvcGVkU2xvdHMsXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuQ2hpbGRyZW5XcmFwcGVyICgpIHtcbiAgICAgIGlmICghdGhpcy5pc09wZW4gfHwgIXRoaXMuY2hpbGRyZW4pIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW3RoaXMuY2hpbGRyZW4ubWFwKGMgPT4gdGhpcy5nZW5DaGlsZChjLCB0aGlzLmRpc2FibGVkKSldXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi10cmVldmlldy1ub2RlX19jaGlsZHJlbicsXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlblRyYW5zaXRpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkV4cGFuZFRyYW5zaXRpb24sIFt0aGlzLmdlbkNoaWxkcmVuV3JhcHBlcigpXSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICBjb25zdCBjaGlsZHJlbjogVk5vZGVDaGlsZHJlbiA9IFt0aGlzLmdlbk5vZGUoKV1cblxuICAgIGlmICh0aGlzLnRyYW5zaXRpb24pIGNoaWxkcmVuLnB1c2godGhpcy5nZW5UcmFuc2l0aW9uKCkpXG4gICAgZWxzZSBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuQ2hpbGRyZW5XcmFwcGVyKCkpXG5cbiAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LXRyZWV2aWV3LW5vZGUnLFxuICAgICAgY2xhc3M6IHtcbiAgICAgICAgJ3YtdHJlZXZpZXctbm9kZS0tbGVhZic6ICF0aGlzLmhhc0NoaWxkcmVuLFxuICAgICAgICAndi10cmVldmlldy1ub2RlLS1jbGljayc6IHRoaXMub3Blbk9uQ2xpY2ssXG4gICAgICAgICd2LXRyZWV2aWV3LW5vZGUtLWRpc2FibGVkJzogdGhpcy5kaXNhYmxlZCxcbiAgICAgICAgJ3YtdHJlZXZpZXctbm9kZS0tcm91bmRlZCc6IHRoaXMucm91bmRlZCxcbiAgICAgICAgJ3YtdHJlZXZpZXctbm9kZS0tc2hhcGVkJzogdGhpcy5zaGFwZWQsXG4gICAgICAgICd2LXRyZWV2aWV3LW5vZGUtLXNlbGVjdGVkJzogdGhpcy5pc1NlbGVjdGVkLFxuICAgICAgfSxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogU3RyaW5nKHRoaXMuaXNPcGVuKSxcbiAgICAgIH0sXG4gICAgfSwgY2hpbGRyZW4pXG4gIH0sXG59KVxuXG5leHBvcnQgZGVmYXVsdCBWVHJlZXZpZXdOb2RlXG4iXX0=
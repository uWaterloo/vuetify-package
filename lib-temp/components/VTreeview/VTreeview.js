// Styles
import './VTreeview.sass';
// Components
import VTreeviewNode, { VTreeviewNodeProps } from './VTreeviewNode';
// Mixins
import Themeable from '../../mixins/themeable';
import { provide as RegistrableProvide } from '../../mixins/registrable';
// Utils
import { arrayDiff, deepEqual, getObjectValueByPath, } from '../../util/helpers';
import mixins from '../../util/mixins';
import { consoleWarn } from '../../util/console';
import { filterTreeItems, filterTreeItem, } from './util/filterTreeItems';
export default mixins(RegistrableProvide('treeview'), Themeable
/* @vue/component */
).extend({
    name: 'v-treeview',
    provide() {
        return { treeview: this };
    },
    props: {
        active: {
            type: Array,
            default: () => ([]),
        },
        dense: Boolean,
        disabled: Boolean,
        filter: Function,
        hoverable: Boolean,
        items: {
            type: Array,
            default: () => ([]),
        },
        multipleActive: Boolean,
        open: {
            type: Array,
            default: () => ([]),
        },
        openAll: Boolean,
        returnObject: {
            type: Boolean,
            default: false,
        },
        search: String,
        value: {
            type: Array,
            default: () => ([]),
        },
        ...VTreeviewNodeProps,
    },
    data: () => ({
        level: -1,
        activeCache: new Set(),
        nodes: {},
        openCache: new Set(),
        selectedCache: new Set(),
    }),
    computed: {
        excludedItems() {
            const excluded = new Set();
            if (!this.search)
                return excluded;
            for (let i = 0; i < this.items.length; i++) {
                filterTreeItems(this.filter || filterTreeItem, this.items[i], this.search, this.itemKey, this.itemText, this.itemChildren, excluded);
            }
            return excluded;
        },
    },
    watch: {
        items: {
            handler() {
                const oldKeys = Object.keys(this.nodes).map(k => getObjectValueByPath(this.nodes[k].item, this.itemKey));
                const newKeys = this.getKeys(this.items);
                const diff = arrayDiff(newKeys, oldKeys);
                // We only want to do stuff if items have changed
                if (!diff.length && newKeys.length < oldKeys.length)
                    return;
                // If nodes are removed we need to clear them from this.nodes
                diff.forEach(k => delete this.nodes[k]);
                const oldSelectedCache = [...this.selectedCache];
                this.selectedCache = new Set();
                this.activeCache = new Set();
                this.openCache = new Set();
                this.buildTree(this.items);
                // Only emit selected if selection has changed
                // as a result of items changing. This fixes a
                // potential double emit when selecting a node
                // with dynamic children
                if (!deepEqual(oldSelectedCache, [...this.selectedCache]))
                    this.emitSelected();
            },
            deep: true,
        },
        active(value) {
            this.handleNodeCacheWatcher(value, this.activeCache, this.updateActive, this.emitActive);
        },
        value(value) {
            this.handleNodeCacheWatcher(value, this.selectedCache, this.updateSelected, this.emitSelected);
        },
        open(value) {
            this.handleNodeCacheWatcher(value, this.openCache, this.updateOpen, this.emitOpen);
        },
    },
    created() {
        const getValue = (key) => this.returnObject ? getObjectValueByPath(key, this.itemKey) : key;
        this.buildTree(this.items);
        for (const value of this.value.map(getValue)) {
            this.updateSelected(value, true, true);
        }
        for (const active of this.active.map(getValue)) {
            this.updateActive(active, true);
        }
    },
    mounted() {
        // Save the developer from themselves
        if (this.$slots.prepend || this.$slots.append) {
            consoleWarn('The prepend and append slots require a slot-scope attribute', this);
        }
        if (this.openAll) {
            this.updateAll(true);
        }
        else {
            this.open.forEach(key => this.updateOpen(this.returnObject ? getObjectValueByPath(key, this.itemKey) : key, true));
            this.emitOpen();
        }
    },
    methods: {
        /** @public */
        updateAll(value) {
            Object.keys(this.nodes).forEach(key => this.updateOpen(getObjectValueByPath(this.nodes[key].item, this.itemKey), value));
            this.emitOpen();
        },
        getKeys(items, keys = []) {
            for (let i = 0; i < items.length; i++) {
                const key = getObjectValueByPath(items[i], this.itemKey);
                keys.push(key);
                const children = getObjectValueByPath(items[i], this.itemChildren);
                if (children) {
                    keys.push(...this.getKeys(children));
                }
            }
            return keys;
        },
        buildTree(items, parent = null) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const key = getObjectValueByPath(item, this.itemKey);
                const children = getObjectValueByPath(item, this.itemChildren) ?? [];
                const oldNode = this.nodes.hasOwnProperty(key) ? this.nodes[key] : {
                    isSelected: false, isIndeterminate: false, isActive: false, isOpen: false, vnode: null,
                };
                const node = {
                    vnode: oldNode.vnode,
                    parent,
                    children: children.map((c) => getObjectValueByPath(c, this.itemKey)),
                    item,
                };
                this.buildTree(children, key);
                // This fixed bug with dynamic children resetting selected parent state
                if (this.selectionType !== 'independent' &&
                    parent !== null &&
                    !this.nodes.hasOwnProperty(key) &&
                    this.nodes.hasOwnProperty(parent)) {
                    node.isSelected = this.nodes[parent].isSelected;
                }
                else {
                    node.isSelected = oldNode.isSelected;
                    node.isIndeterminate = oldNode.isIndeterminate;
                }
                node.isActive = oldNode.isActive;
                node.isOpen = oldNode.isOpen;
                this.nodes[key] = node;
                if (children.length && this.selectionType !== 'independent') {
                    const { isSelected, isIndeterminate } = this.calculateState(key, this.nodes);
                    node.isSelected = isSelected;
                    node.isIndeterminate = isIndeterminate;
                }
                // Don't forget to rebuild cache
                if (this.nodes[key].isSelected && (this.selectionType === 'independent' || node.children.length === 0))
                    this.selectedCache.add(key);
                if (this.nodes[key].isActive)
                    this.activeCache.add(key);
                if (this.nodes[key].isOpen)
                    this.openCache.add(key);
                this.updateVnodeState(key);
            }
        },
        calculateState(node, state) {
            const children = state[node].children;
            const counts = children.reduce((counts, child) => {
                counts[0] += +Boolean(state[child].isSelected);
                counts[1] += +Boolean(state[child].isIndeterminate);
                return counts;
            }, [0, 0]);
            const isSelected = !!children.length && counts[0] === children.length;
            const isIndeterminate = !isSelected && (counts[0] > 0 || counts[1] > 0);
            return {
                isSelected,
                isIndeterminate,
            };
        },
        emitOpen() {
            this.emitNodeCache('update:open', this.openCache);
        },
        emitSelected() {
            this.emitNodeCache('input', this.selectedCache);
        },
        emitActive() {
            this.emitNodeCache('update:active', this.activeCache);
        },
        emitNodeCache(event, cache) {
            this.$emit(event, this.returnObject ? [...cache].map(key => this.nodes[key].item) : [...cache]);
        },
        handleNodeCacheWatcher(value, cache, updateFn, emitFn) {
            value = this.returnObject ? value.map(v => getObjectValueByPath(v, this.itemKey)) : value;
            const old = [...cache];
            if (deepEqual(old, value))
                return;
            old.forEach(key => updateFn(key, false));
            value.forEach(key => updateFn(key, true));
            emitFn();
        },
        getDescendants(key, descendants = []) {
            const children = this.nodes[key].children;
            descendants.push(...children);
            for (let i = 0; i < children.length; i++) {
                descendants = this.getDescendants(children[i], descendants);
            }
            return descendants;
        },
        getParents(key) {
            let parent = this.nodes[key].parent;
            const parents = [];
            while (parent !== null) {
                parents.push(parent);
                parent = this.nodes[parent].parent;
            }
            return parents;
        },
        register(node) {
            const key = getObjectValueByPath(node.item, this.itemKey);
            this.nodes[key].vnode = node;
            this.updateVnodeState(key);
        },
        unregister(node) {
            const key = getObjectValueByPath(node.item, this.itemKey);
            if (this.nodes[key])
                this.nodes[key].vnode = null;
        },
        isParent(key) {
            return this.nodes[key].children && this.nodes[key].children.length;
        },
        updateActive(key, isActive) {
            if (!this.nodes.hasOwnProperty(key))
                return;
            if (!this.multipleActive) {
                this.activeCache.forEach(active => {
                    this.nodes[active].isActive = false;
                    this.updateVnodeState(active);
                    this.activeCache.delete(active);
                });
            }
            const node = this.nodes[key];
            if (!node)
                return;
            if (isActive)
                this.activeCache.add(key);
            else
                this.activeCache.delete(key);
            node.isActive = isActive;
            this.updateVnodeState(key);
        },
        updateSelected(key, isSelected, isForced = false) {
            if (!this.nodes.hasOwnProperty(key))
                return;
            const changed = new Map();
            if (this.selectionType !== 'independent') {
                for (const descendant of this.getDescendants(key)) {
                    if (!getObjectValueByPath(this.nodes[descendant].item, this.itemDisabled) || isForced) {
                        this.nodes[descendant].isSelected = isSelected;
                        this.nodes[descendant].isIndeterminate = false;
                        changed.set(descendant, isSelected);
                    }
                }
                const calculated = this.calculateState(key, this.nodes);
                this.nodes[key].isSelected = isSelected;
                this.nodes[key].isIndeterminate = calculated.isIndeterminate;
                changed.set(key, isSelected);
                for (const parent of this.getParents(key)) {
                    const calculated = this.calculateState(parent, this.nodes);
                    this.nodes[parent].isSelected = calculated.isSelected;
                    this.nodes[parent].isIndeterminate = calculated.isIndeterminate;
                    changed.set(parent, calculated.isSelected);
                }
            }
            else {
                this.nodes[key].isSelected = isSelected;
                this.nodes[key].isIndeterminate = false;
                changed.set(key, isSelected);
            }
            for (const [key, value] of changed.entries()) {
                this.updateVnodeState(key);
                if (this.selectionType === 'leaf' && this.isParent(key))
                    continue;
                value === true ? this.selectedCache.add(key) : this.selectedCache.delete(key);
            }
        },
        updateOpen(key, isOpen) {
            if (!this.nodes.hasOwnProperty(key))
                return;
            const node = this.nodes[key];
            const children = getObjectValueByPath(node.item, this.itemChildren);
            if (children && !children.length && node.vnode && !node.vnode.hasLoaded) {
                node.vnode.checkChildren().then(() => this.updateOpen(key, isOpen));
            }
            else if (children && children.length) {
                node.isOpen = isOpen;
                node.isOpen ? this.openCache.add(key) : this.openCache.delete(key);
                this.updateVnodeState(key);
            }
        },
        updateVnodeState(key) {
            const node = this.nodes[key];
            if (node && node.vnode) {
                node.vnode.isSelected = node.isSelected;
                node.vnode.isIndeterminate = node.isIndeterminate;
                node.vnode.isActive = node.isActive;
                node.vnode.isOpen = node.isOpen;
            }
        },
        isExcluded(key) {
            return !!this.search && this.excludedItems.has(key);
        },
    },
    render(h) {
        const children = this.items.length
            ? this.items.filter(item => {
                return !this.isExcluded(getObjectValueByPath(item, this.itemKey));
            }).map(item => {
                const genChild = VTreeviewNode.options.methods.genChild.bind(this);
                return genChild(item, this.disabled || getObjectValueByPath(item, this.itemDisabled));
            })
            /* istanbul ignore next */
            : this.$slots.default; // TODO: remove type annotation with TS 3.2
        return h('div', {
            staticClass: 'v-treeview',
            class: {
                'v-treeview--hoverable': this.hoverable,
                'v-treeview--dense': this.dense,
                ...this.themeClasses,
            },
        }, children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlRyZWV2aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVlRyZWV2aWV3L1ZUcmVldmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxrQkFBa0IsQ0FBQTtBQU96QixhQUFhO0FBQ2IsT0FBTyxhQUFhLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBRW5FLFNBQVM7QUFDVCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsT0FBTyxJQUFJLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFFeEUsUUFBUTtBQUNSLE9BQU8sRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULG9CQUFvQixHQUNyQixNQUFNLG9CQUFvQixDQUFBO0FBQzNCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNoRCxPQUFPLEVBQ0wsZUFBZSxFQUNmLGNBQWMsR0FDZixNQUFNLHdCQUF3QixDQUFBO0FBa0IvQixlQUFlLE1BQU0sQ0FDbkIsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQzlCLFNBQVM7QUFDVCxvQkFBb0I7Q0FDckIsQ0FBQyxNQUFNLENBQUM7SUFDUCxJQUFJLEVBQUUsWUFBWTtJQUVsQixPQUFPO1FBQ0wsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUMzQixDQUFDO0lBRUQsS0FBSyxFQUFFO1FBQ0wsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLEtBQUs7WUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDUTtRQUM3QixLQUFLLEVBQUUsT0FBTztRQUNkLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLE1BQU0sRUFBRSxRQUEwQztRQUNsRCxTQUFTLEVBQUUsT0FBTztRQUNsQixLQUFL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O0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxNQUFNLFFBQVEsR0FBK0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQzVELENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1lBQ25FLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDWixNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUVsRSxPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7WUFDdkYsQ0FBQyxDQUFDO1lBQ0YsMEJBQTBCO1lBQzFCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVEsQ0FBQSxDQUFDLDJDQUEyQztRQUVwRSxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZCxXQUFXLEVBQUUsWUFBWTtZQUN6QixLQUFLLEVBQUU7Z0JBQ0wsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3ZDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUMvQixHQUFHLElBQUksQ0FBQyxZQUFZO2FBQ3JCO1NBQ0YsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNkLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WVHJlZXZpZXcuc2FzcydcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZOb2RlLCBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cywgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5pbXBvcnQgeyBUcmVldmlld0l0ZW1GdW5jdGlvbiB9IGZyb20gJ3Z1ZXRpZnkvdHlwZXMnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWVHJlZXZpZXdOb2RlLCB7IFZUcmVldmlld05vZGVQcm9wcyB9IGZyb20gJy4vVlRyZWV2aWV3Tm9kZSdcblxuLy8gTWl4aW5zXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5pbXBvcnQgeyBwcm92aWRlIGFzIFJlZ2lzdHJhYmxlUHJvdmlkZSB9IGZyb20gJy4uLy4uL21peGlucy9yZWdpc3RyYWJsZSdcblxuLy8gVXRpbHNcbmltcG9ydCB7XG4gIGFycmF5RGlmZixcbiAgZGVlcEVxdWFsLFxuICBnZXRPYmplY3RWYWx1ZUJ5UGF0aCxcbn0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGNvbnNvbGVXYXJuIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuaW1wb3J0IHtcbiAgZmlsdGVyVHJlZUl0ZW1zLFxuICBmaWx0ZXJUcmVlSXRlbSxcbn0gZnJvbSAnLi91dGlsL2ZpbHRlclRyZWVJdGVtcydcblxudHlwZSBWVHJlZXZpZXdOb2RlSW5zdGFuY2UgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIFZUcmVldmlld05vZGU+XG5cbnR5cGUgTm9kZUNhY2hlID0gU2V0PHN0cmluZyB8IG51bWJlcj5cbnR5cGUgTm9kZUFycmF5ID0gKHN0cmluZyB8IG51bWJlcilbXVxuXG50eXBlIE5vZGVTdGF0ZSA9IHtcbiAgcGFyZW50OiBudW1iZXIgfCBzdHJpbmcgfCBudWxsXG4gIGNoaWxkcmVuOiAobnVtYmVyIHwgc3RyaW5nKVtdXG4gIHZub2RlOiBWVHJlZXZpZXdOb2RlSW5zdGFuY2UgfCBudWxsXG4gIGlzQWN0aXZlOiBib29sZWFuXG4gIGlzU2VsZWN0ZWQ6IGJvb2xlYW5cbiAgaXNJbmRldGVybWluYXRlOiBib29sZWFuXG4gIGlzT3BlbjogYm9vbGVhblxuICBpdGVtOiBhbnlcbn1cblxuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBSZWdpc3RyYWJsZVByb3ZpZGUoJ3RyZWV2aWV3JyksXG4gIFRoZW1lYWJsZVxuICAvKiBAdnVlL2NvbXBvbmVudCAqL1xuKS5leHRlbmQoe1xuICBuYW1lOiAndi10cmVldmlldycsXG5cbiAgcHJvdmlkZSAoKTogb2JqZWN0IHtcbiAgICByZXR1cm4geyB0cmVldmlldzogdGhpcyB9XG4gIH0sXG5cbiAgcHJvcHM6IHtcbiAgICBhY3RpdmU6IHtcbiAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKFtdKSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8Tm9kZUFycmF5PixcbiAgICBkZW5zZTogQm9vbGVhbixcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICBmaWx0ZXI6IEZ1bmN0aW9uIGFzIFByb3BUeXBlPFRyZWV2aWV3SXRlbUZ1bmN0aW9uPixcbiAgICBob3ZlcmFibGU6IEJvb2xlYW4sXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKFtdKSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8YW55W10+LFxuICAgIG11bHRpcGxlQWN0aXZlOiBCb29sZWFuLFxuICAgIG9wZW46IHtcbiAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKFtdKSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8Tm9kZUFycmF5PixcbiAgICBvcGVuQWxsOiBCb29sZWFuLFxuICAgIHJldHVybk9iamVjdDoge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLCAvLyBUT0RPOiBTaG91bGQgYmUgdHJ1ZSBpbiBuZXh0IG1ham9yXG4gICAgfSxcbiAgICBzZWFyY2g6IFN0cmluZyxcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogQXJyYXksXG4gICAgICBkZWZhdWx0OiAoKSA9PiAoW10pLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxOb2RlQXJyYXk+LFxuICAgIC4uLlZUcmVldmlld05vZGVQcm9wcyxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGxldmVsOiAtMSxcbiAgICBhY3RpdmVDYWNoZTogbmV3IFNldCgpIGFzIE5vZGVDYWNoZSxcbiAgICBub2Rlczoge30gYXMgUmVjb3JkPHN0cmluZyB8IG51bWJlciwgTm9kZVN0YXRlPixcbiAgICBvcGVuQ2FjaGU6IG5ldyBTZXQoKSBhcyBOb2RlQ2FjaGUsXG4gICAgc2VsZWN0ZWRDYWNoZTogbmV3IFNldCgpIGFzIE5vZGVDYWNoZSxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBleGNsdWRlZEl0ZW1zICgpOiBTZXQ8c3RyaW5nIHwgbnVtYmVyPiB7XG4gICAgICBjb25zdCBleGNsdWRlZCA9IG5ldyBTZXQ8c3RyaW5nfG51bWJlcj4oKVxuXG4gICAgICBpZiAoIXRoaXMuc2VhcmNoKSByZXR1cm4gZXhjbHVkZWRcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZpbHRlclRyZWVJdGVtcyhcbiAgICAgICAgICB0aGlzLmZpbHRlciB8fCBmaWx0ZXJUcmVlSXRlbSxcbiAgICAgICAgICB0aGlzLml0ZW1zW2ldLFxuICAgICAgICAgIHRoaXMuc2VhcmNoLFxuICAgICAgICAgIHRoaXMuaXRlbUtleSxcbiAgICAgICAgICB0aGlzLml0ZW1UZXh0LFxuICAgICAgICAgIHRoaXMuaXRlbUNoaWxkcmVuLFxuICAgICAgICAgIGV4Y2x1ZGVkXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGV4Y2x1ZGVkXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIGl0ZW1zOiB7XG4gICAgICBoYW5kbGVyICgpIHtcbiAgICAgICAgY29uc3Qgb2xkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXMubm9kZXMpLm1hcChrID0+IGdldE9iamVjdFZhbHVlQnlQYXRoKHRoaXMubm9kZXNba10uaXRlbSwgdGhpcy5pdGVtS2V5KSlcbiAgICAgICAgY29uc3QgbmV3S2V5cyA9IHRoaXMuZ2V0S2V5cyh0aGlzLml0ZW1zKVxuICAgICAgICBjb25zdCBkaWZmID0gYXJyYXlEaWZmKG5ld0tleXMsIG9sZEtleXMpXG5cbiAgICAgICAgLy8gV2Ugb25seSB3YW50IHRvIGRvIHN0dWZmIGlmIGl0ZW1zIGhhdmUgY2hhbmdlZFxuICAgICAgICBpZiAoIWRpZmYubGVuZ3RoICYmIG5ld0tleXMubGVuZ3RoIDwgb2xkS2V5cy5sZW5ndGgpIHJldHVyblxuXG4gICAgICAgIC8vIElmIG5vZGVzIGFyZSByZW1vdmVkIHdlIG5lZWQgdG8gY2xlYXIgdGhlbSBmcm9tIHRoaXMubm9kZXNcbiAgICAgICAgZGlmZi5mb3JFYWNoKGsgPT4gZGVsZXRlIHRoaXMubm9kZXNba10pXG5cbiAgICAgICAgY29uc3Qgb2xkU2VsZWN0ZWRDYWNoZSA9IFsuLi50aGlzLnNlbGVjdGVkQ2FjaGVdXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDYWNoZSA9IG5ldyBTZXQoKVxuICAgICAgICB0aGlzLmFjdGl2ZUNhY2hlID0gbmV3IFNldCgpXG4gICAgICAgIHRoaXMub3BlbkNhY2hlID0gbmV3IFNldCgpXG4gICAgICAgIHRoaXMuYnVpbGRUcmVlKHRoaXMuaXRlbXMpXG5cbiAgICAgICAgLy8gT25seSBlbWl0IHNlbGVjdGVkIGlmIHNlbGVjdGlvbiBoYXMgY2hhbmdlZFxuICAgICAgICAvLyBhcyBhIHJlc3VsdCBvZiBpdGVtcyBjaGFuZ2luZy4gVGhpcyBmaXhlcyBhXG4gICAgICAgIC8vIHBvdGVudGlhbCBkb3VibGUgZW1pdCB3aGVuIHNlbGVjdGluZyBhIG5vZGVcbiAgICAgICAgLy8gd2l0aCBkeW5hbWljIGNoaWxkcmVuXG4gICAgICAgIGlmICghZGVlcEVxdWFsKG9sZFNlbGVjdGVkQ2FjaGUsIFsuLi50aGlzLnNlbGVjdGVkQ2FjaGVdKSkgdGhpcy5lbWl0U2VsZWN0ZWQoKVxuICAgICAgfSxcbiAgICAgIGRlZXA6IHRydWUsXG4gICAgfSxcbiAgICBhY3RpdmUgKHZhbHVlOiAoc3RyaW5nIHwgbnVtYmVyIHwgYW55KVtdKSB7XG4gICAgICB0aGlzLmhhbmRsZU5vZGVDYWNoZVdhdGNoZXIodmFsdWUsIHRoaXMuYWN0aXZlQ2FjaGUsIHRoaXMudXBkYXRlQWN0aXZlLCB0aGlzLmVtaXRBY3RpdmUpXG4gICAgfSxcbiAgICB2YWx1ZSAodmFsdWU6IChzdHJpbmcgfCBudW1iZXIgfCBhbnkpW10pIHtcbiAgICAgIHRoaXMuaGFuZGxlTm9kZUNhY2hlV2F0Y2hlcih2YWx1ZSwgdGhpcy5zZWxlY3RlZENhY2hlLCB0aGlzLnVwZGF0ZVNlbGVjdGVkLCB0aGlzLmVtaXRTZWxlY3RlZClcbiAgICB9LFxuICAgIG9wZW4gKHZhbHVlOiAoc3RyaW5nIHwgbnVtYmVyIHwgYW55KVtdKSB7XG4gICAgICB0aGlzLmhhbmRsZU5vZGVDYWNoZVdhdGNoZXIodmFsdWUsIHRoaXMub3BlbkNhY2hlLCB0aGlzLnVwZGF0ZU9wZW4sIHRoaXMuZW1pdE9wZW4pXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICBjb25zdCBnZXRWYWx1ZSA9IChrZXk6IHN0cmluZyB8IG51bWJlcikgPT4gdGhpcy5yZXR1cm5PYmplY3QgPyBnZXRPYmplY3RWYWx1ZUJ5UGF0aChrZXksIHRoaXMuaXRlbUtleSkgOiBrZXlcblxuICAgIHRoaXMuYnVpbGRUcmVlKHRoaXMuaXRlbXMpXG5cbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHRoaXMudmFsdWUubWFwKGdldFZhbHVlKSkge1xuICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZCh2YWx1ZSwgdHJ1ZSwgdHJ1ZSlcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGFjdGl2ZSBvZiB0aGlzLmFjdGl2ZS5tYXAoZ2V0VmFsdWUpKSB7XG4gICAgICB0aGlzLnVwZGF0ZUFjdGl2ZShhY3RpdmUsIHRydWUpXG4gICAgfVxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIC8vIFNhdmUgdGhlIGRldmVsb3BlciBmcm9tIHRoZW1zZWx2ZXNcbiAgICBpZiAodGhpcy4kc2xvdHMucHJlcGVuZCB8fCB0aGlzLiRzbG90cy5hcHBlbmQpIHtcbiAgICAgIGNvbnNvbGVXYXJuKCdUaGUgcHJlcGVuZCBhbmQgYXBwZW5kIHNsb3RzIHJlcXVpcmUgYSBzbG90LXNjb3BlIGF0dHJpYnV0ZScsIHRoaXMpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3BlbkFsbCkge1xuICAgICAgdGhpcy51cGRhdGVBbGwodHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vcGVuLmZvckVhY2goa2V5ID0+IHRoaXMudXBkYXRlT3Blbih0aGlzLnJldHVybk9iamVjdCA/IGdldE9iamVjdFZhbHVlQnlQYXRoKGtleSwgdGhpcy5pdGVtS2V5KSA6IGtleSwgdHJ1ZSkpXG4gICAgICB0aGlzLmVtaXRPcGVuKClcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIC8qKiBAcHVibGljICovXG4gICAgdXBkYXRlQWxsICh2YWx1ZTogYm9vbGVhbikge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5ub2RlcykuZm9yRWFjaChrZXkgPT4gdGhpcy51cGRhdGVPcGVuKGdldE9iamVjdFZhbHVlQnlQYXRoKHRoaXMubm9kZXNba2V5XS5pdGVtLCB0aGlzLml0ZW1LZXkpLCB2YWx1ZSkpXG4gICAgICB0aGlzLmVtaXRPcGVuKClcbiAgICB9LFxuICAgIGdldEtleXMgKGl0ZW1zOiBhbnlbXSwga2V5czogYW55W10gPSBbXSkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRPYmplY3RWYWx1ZUJ5UGF0aChpdGVtc1tpXSwgdGhpcy5pdGVtS2V5KVxuICAgICAgICBrZXlzLnB1c2goa2V5KVxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGdldE9iamVjdFZhbHVlQnlQYXRoKGl0ZW1zW2ldLCB0aGlzLml0ZW1DaGlsZHJlbilcbiAgICAgICAgaWYgKGNoaWxkcmVuKSB7XG4gICAgICAgICAga2V5cy5wdXNoKC4uLnRoaXMuZ2V0S2V5cyhjaGlsZHJlbikpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGtleXNcbiAgICB9LFxuICAgIGJ1aWxkVHJlZSAoaXRlbXM6IGFueVtdLCBwYXJlbnQ6IChzdHJpbmcgfCBudW1iZXIgfCBudWxsKSA9IG51bGwpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2ldXG4gICAgICAgIGNvbnN0IGtleSA9IGdldE9iamVjdFZhbHVlQnlQYXRoKGl0ZW0sIHRoaXMuaXRlbUtleSlcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBnZXRPYmplY3RWYWx1ZUJ5UGF0aChpdGVtLCB0aGlzLml0ZW1DaGlsZHJlbikgPz8gW11cbiAgICAgICAgY29uc3Qgb2xkTm9kZSA9IHRoaXMubm9kZXMuaGFzT3duUHJvcGVydHkoa2V5KSA/IHRoaXMubm9kZXNba2V5XSA6IHtcbiAgICAgICAgICBpc1NlbGVjdGVkOiBmYWxzZSwgaXNJbmRldGVybWluYXRlOiBmYWxzZSwgaXNBY3RpdmU6IGZhbHNlLCBpc09wZW46IGZhbHNlLCB2bm9kZTogbnVsbCxcbiAgICAgICAgfSBhcyBOb2RlU3RhdGVcblxuICAgICAgICBjb25zdCBub2RlOiBhbnkgPSB7XG4gICAgICAgICAgdm5vZGU6IG9sZE5vZGUudm5vZGUsXG4gICAgICAgICAgcGFyZW50LFxuICAgICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbi5tYXAoKGM6IGFueSkgPT4gZ2V0T2JqZWN0VmFsdWVCeVBhdGgoYywgdGhpcy5pdGVtS2V5KSksXG4gICAgICAgICAgaXRlbSxcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYnVpbGRUcmVlKGNoaWxkcmVuLCBrZXkpXG5cbiAgICAgICAgLy8gVGhpcyBmaXhlZCBidWcgd2l0aCBkeW5hbWljIGNoaWxkcmVuIHJlc2V0dGluZyBzZWxlY3RlZCBwYXJlbnQgc3RhdGVcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHRoaXMuc2VsZWN0aW9uVHlwZSAhPT0gJ2luZGVwZW5kZW50JyAmJlxuICAgICAgICAgIHBhcmVudCAhPT0gbnVsbCAmJlxuICAgICAgICAgICF0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KGtleSkgJiZcbiAgICAgICAgICB0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KHBhcmVudClcbiAgICAgICAgKSB7XG4gICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gdGhpcy5ub2Rlc1twYXJlbnRdLmlzU2VsZWN0ZWRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2RlLmlzU2VsZWN0ZWQgPSBvbGROb2RlLmlzU2VsZWN0ZWRcbiAgICAgICAgICBub2RlLmlzSW5kZXRlcm1pbmF0ZSA9IG9sZE5vZGUuaXNJbmRldGVybWluYXRlXG4gICAgICAgIH1cblxuICAgICAgICBub2RlLmlzQWN0aXZlID0gb2xkTm9kZS5pc0FjdGl2ZVxuICAgICAgICBub2RlLmlzT3BlbiA9IG9sZE5vZGUuaXNPcGVuXG5cbiAgICAgICAgdGhpcy5ub2Rlc1trZXldID0gbm9kZVxuXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggJiYgdGhpcy5zZWxlY3Rpb25UeXBlICE9PSAnaW5kZXBlbmRlbnQnKSB7XG4gICAgICAgICAgY29uc3QgeyBpc1NlbGVjdGVkLCBpc0luZGV0ZXJtaW5hdGUgfSA9IHRoaXMuY2FsY3VsYXRlU3RhdGUoa2V5LCB0aGlzLm5vZGVzKVxuXG4gICAgICAgICAgbm9kZS5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZFxuICAgICAgICAgIG5vZGUuaXNJbmRldGVybWluYXRlID0gaXNJbmRldGVybWluYXRlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBEb24ndCBmb3JnZXQgdG8gcmVidWlsZCBjYWNoZVxuICAgICAgICBpZiAodGhpcy5ub2Rlc1trZXldLmlzU2VsZWN0ZWQgJiYgKHRoaXMuc2VsZWN0aW9uVHlwZSA9PT0gJ2luZGVwZW5kZW50JyB8fCBub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkpIHRoaXMuc2VsZWN0ZWRDYWNoZS5hZGQoa2V5KVxuICAgICAgICBpZiAodGhpcy5ub2Rlc1trZXldLmlzQWN0aXZlKSB0aGlzLmFjdGl2ZUNhY2hlLmFkZChrZXkpXG4gICAgICAgIGlmICh0aGlzLm5vZGVzW2tleV0uaXNPcGVuKSB0aGlzLm9wZW5DYWNoZS5hZGQoa2V5KVxuXG4gICAgICAgIHRoaXMudXBkYXRlVm5vZGVTdGF0ZShrZXkpXG4gICAgICB9XG4gICAgfSxcbiAgICBjYWxjdWxhdGVTdGF0ZSAobm9kZTogc3RyaW5nIHwgbnVtYmVyLCBzdGF0ZTogUmVjb3JkPHN0cmluZyB8IG51bWJlciwgTm9kZVN0YXRlPikge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBzdGF0ZVtub2RlXS5jaGlsZHJlblxuICAgICAgY29uc3QgY291bnRzID0gY2hpbGRyZW4ucmVkdWNlKChjb3VudHM6IG51bWJlcltdLCBjaGlsZDogc3RyaW5nIHwgbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvdW50c1swXSArPSArQm9vbGVhbihzdGF0ZVtjaGlsZF0uaXNTZWxlY3RlZClcbiAgICAgICAgY291bnRzWzFdICs9ICtCb29sZWFuKHN0YXRlW2NoaWxkXS5pc0luZGV0ZXJtaW5hdGUpXG5cbiAgICAgICAgcmV0dXJuIGNvdW50c1xuICAgICAgfSwgWzAsIDBdKVxuXG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gISFjaGlsZHJlbi5sZW5ndGggJiYgY291bnRzWzBdID09PSBjaGlsZHJlbi5sZW5ndGhcbiAgICAgIGNvbnN0IGlzSW5kZXRlcm1pbmF0ZSA9ICFpc1NlbGVjdGVkICYmIChjb3VudHNbMF0gPiAwIHx8IGNvdW50c1sxXSA+IDApXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzU2VsZWN0ZWQsXG4gICAgICAgIGlzSW5kZXRlcm1pbmF0ZSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGVtaXRPcGVuICgpIHtcbiAgICAgIHRoaXMuZW1pdE5vZGVDYWNoZSgndXBkYXRlOm9wZW4nLCB0aGlzLm9wZW5DYWNoZSlcbiAgICB9LFxuICAgIGVtaXRTZWxlY3RlZCAoKSB7XG4gICAgICB0aGlzLmVtaXROb2RlQ2FjaGUoJ2lucHV0JywgdGhpcy5zZWxlY3RlZENhY2hlKVxuICAgIH0sXG4gICAgZW1pdEFjdGl2ZSAoKSB7XG4gICAgICB0aGlzLmVtaXROb2RlQ2FjaGUoJ3VwZGF0ZTphY3RpdmUnLCB0aGlzLmFjdGl2ZUNhY2hlKVxuICAgIH0sXG4gICAgZW1pdE5vZGVDYWNoZSAoZXZlbnQ6IHN0cmluZywgY2FjaGU6IE5vZGVDYWNoZSkge1xuICAgICAgdGhpcy4kZW1pdChldmVudCwgdGhpcy5yZXR1cm5PYmplY3QgPyBbLi4uY2FjaGVdLm1hcChrZXkgPT4gdGhpcy5ub2Rlc1trZXldLml0ZW0pIDogWy4uLmNhY2hlXSlcbiAgICB9LFxuICAgIGhhbmRsZU5vZGVDYWNoZVdhdGNoZXIgKHZhbHVlOiBhbnlbXSwgY2FjaGU6IE5vZGVDYWNoZSwgdXBkYXRlRm46IEZ1bmN0aW9uLCBlbWl0Rm46IEZ1bmN0aW9uKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMucmV0dXJuT2JqZWN0ID8gdmFsdWUubWFwKHYgPT4gZ2V0T2JqZWN0VmFsdWVCeVBhdGgodiwgdGhpcy5pdGVtS2V5KSkgOiB2YWx1ZVxuICAgICAgY29uc3Qgb2xkID0gWy4uLmNhY2hlXVxuICAgICAgaWYgKGRlZXBFcXVhbChvbGQsIHZhbHVlKSkgcmV0dXJuXG5cbiAgICAgIG9sZC5mb3JFYWNoKGtleSA9PiB1cGRhdGVGbihrZXksIGZhbHNlKSlcbiAgICAgIHZhbHVlLmZvckVhY2goa2V5ID0+IHVwZGF0ZUZuKGtleSwgdHJ1ZSkpXG5cbiAgICAgIGVtaXRGbigpXG4gICAgfSxcbiAgICBnZXREZXNjZW5kYW50cyAoa2V5OiBzdHJpbmcgfCBudW1iZXIsIGRlc2NlbmRhbnRzOiBOb2RlQXJyYXkgPSBbXSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLm5vZGVzW2tleV0uY2hpbGRyZW5cblxuICAgICAgZGVzY2VuZGFudHMucHVzaCguLi5jaGlsZHJlbilcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZXNjZW5kYW50cyA9IHRoaXMuZ2V0RGVzY2VuZGFudHMoY2hpbGRyZW5baV0sIGRlc2NlbmRhbnRzKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVzY2VuZGFudHNcbiAgICB9LFxuICAgIGdldFBhcmVudHMgKGtleTogc3RyaW5nIHwgbnVtYmVyKSB7XG4gICAgICBsZXQgcGFyZW50ID0gdGhpcy5ub2Rlc1trZXldLnBhcmVudFxuXG4gICAgICBjb25zdCBwYXJlbnRzID0gW11cbiAgICAgIHdoaWxlIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgcGFyZW50cy5wdXNoKHBhcmVudClcbiAgICAgICAgcGFyZW50ID0gdGhpcy5ub2Rlc1twYXJlbnRdLnBhcmVudFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFyZW50c1xuICAgIH0sXG4gICAgcmVnaXN0ZXIgKG5vZGU6IFZUcmVldmlld05vZGVJbnN0YW5jZSkge1xuICAgICAgY29uc3Qga2V5ID0gZ2V0T2JqZWN0VmFsdWVCeVBhdGgobm9kZS5pdGVtLCB0aGlzLml0ZW1LZXkpXG4gICAgICB0aGlzLm5vZGVzW2tleV0udm5vZGUgPSBub2RlXG5cbiAgICAgIHRoaXMudXBkYXRlVm5vZGVTdGF0ZShrZXkpXG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyIChub2RlOiBWVHJlZXZpZXdOb2RlSW5zdGFuY2UpIHtcbiAgICAgIGNvbnN0IGtleSA9IGdldE9iamVjdFZhbHVlQnlQYXRoKG5vZGUuaXRlbSwgdGhpcy5pdGVtS2V5KVxuICAgICAgaWYgKHRoaXMubm9kZXNba2V5XSkgdGhpcy5ub2Rlc1trZXldLnZub2RlID0gbnVsbFxuICAgIH0sXG4gICAgaXNQYXJlbnQgKGtleTogc3RyaW5nIHwgbnVtYmVyKSB7XG4gICAgICByZXR1cm4gdGhpcy5ub2Rlc1trZXldLmNoaWxkcmVuICYmIHRoaXMubm9kZXNba2V5XS5jaGlsZHJlbi5sZW5ndGhcbiAgICB9LFxuICAgIHVwZGF0ZUFjdGl2ZSAoa2V5OiBzdHJpbmcgfCBudW1iZXIsIGlzQWN0aXZlOiBib29sZWFuKSB7XG4gICAgICBpZiAoIXRoaXMubm9kZXMuaGFzT3duUHJvcGVydHkoa2V5KSkgcmV0dXJuXG5cbiAgICAgIGlmICghdGhpcy5tdWx0aXBsZUFjdGl2ZSkge1xuICAgICAgICB0aGlzLmFjdGl2ZUNhY2hlLmZvckVhY2goYWN0aXZlID0+IHtcbiAgICAgICAgICB0aGlzLm5vZGVzW2FjdGl2ZV0uaXNBY3RpdmUgPSBmYWxzZVxuICAgICAgICAgIHRoaXMudXBkYXRlVm5vZGVTdGF0ZShhY3RpdmUpXG4gICAgICAgICAgdGhpcy5hY3RpdmVDYWNoZS5kZWxldGUoYWN0aXZlKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCBub2RlID0gdGhpcy5ub2Rlc1trZXldXG4gICAgICBpZiAoIW5vZGUpIHJldHVyblxuXG4gICAgICBpZiAoaXNBY3RpdmUpIHRoaXMuYWN0aXZlQ2FjaGUuYWRkKGtleSlcbiAgICAgIGVsc2UgdGhpcy5hY3RpdmVDYWNoZS5kZWxldGUoa2V5KVxuXG4gICAgICBub2RlLmlzQWN0aXZlID0gaXNBY3RpdmVcblxuICAgICAgdGhpcy51cGRhdGVWbm9kZVN0YXRlKGtleSlcbiAgICB9LFxuICAgIHVwZGF0ZVNlbGVjdGVkIChrZXk6IHN0cmluZyB8IG51bWJlciwgaXNTZWxlY3RlZDogYm9vbGVhbiwgaXNGb3JjZWQgPSBmYWxzZSkge1xuICAgICAgaWYgKCF0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KGtleSkpIHJldHVyblxuXG4gICAgICBjb25zdCBjaGFuZ2VkID0gbmV3IE1hcCgpXG5cbiAgICAgIGlmICh0aGlzLnNlbGVjdGlvblR5cGUgIT09ICdpbmRlcGVuZGVudCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBkZXNjZW5kYW50IG9mIHRoaXMuZ2V0RGVzY2VuZGFudHMoa2V5KSkge1xuICAgICAgICAgIGlmICghZ2V0T2JqZWN0VmFsdWVCeVBhdGgodGhpcy5ub2Rlc1tkZXNjZW5kYW50XS5pdGVtLCB0aGlzLml0ZW1EaXNhYmxlZCkgfHwgaXNGb3JjZWQpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZXNbZGVzY2VuZGFudF0uaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWRcbiAgICAgICAgICAgIHRoaXMubm9kZXNbZGVzY2VuZGFudF0uaXNJbmRldGVybWluYXRlID0gZmFsc2VcbiAgICAgICAgICAgIGNoYW5nZWQuc2V0KGRlc2NlbmRhbnQsIGlzU2VsZWN0ZWQpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2FsY3VsYXRlZCA9IHRoaXMuY2FsY3VsYXRlU3RhdGUoa2V5LCB0aGlzLm5vZGVzKVxuICAgICAgICB0aGlzLm5vZGVzW2tleV0uaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWRcbiAgICAgICAgdGhpcy5ub2Rlc1trZXldLmlzSW5kZXRlcm1pbmF0ZSA9IGNhbGN1bGF0ZWQuaXNJbmRldGVybWluYXRlXG4gICAgICAgIGNoYW5nZWQuc2V0KGtleSwgaXNTZWxlY3RlZClcblxuICAgICAgICBmb3IgKGNvbnN0IHBhcmVudCBvZiB0aGlzLmdldFBhcmVudHMoa2V5KSkge1xuICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZWQgPSB0aGlzLmNhbGN1bGF0ZVN0YXRlKHBhcmVudCwgdGhpcy5ub2RlcylcbiAgICAgICAgICB0aGlzLm5vZGVzW3BhcmVudF0uaXNTZWxlY3RlZCA9IGNhbGN1bGF0ZWQuaXNTZWxlY3RlZFxuICAgICAgICAgIHRoaXMubm9kZXNbcGFyZW50XS5pc0luZGV0ZXJtaW5hdGUgPSBjYWxjdWxhdGVkLmlzSW5kZXRlcm1pbmF0ZVxuICAgICAgICAgIGNoYW5nZWQuc2V0KHBhcmVudCwgY2FsY3VsYXRlZC5pc1NlbGVjdGVkKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm5vZGVzW2tleV0uaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWRcbiAgICAgICAgdGhpcy5ub2Rlc1trZXldLmlzSW5kZXRlcm1pbmF0ZSA9IGZhbHNlXG4gICAgICAgIGNoYW5nZWQuc2V0KGtleSwgaXNTZWxlY3RlZClcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgY2hhbmdlZC5lbnRyaWVzKCkpIHtcbiAgICAgICAgdGhpcy51cGRhdGVWbm9kZVN0YXRlKGtleSlcblxuICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb25UeXBlID09PSAnbGVhZicgJiYgdGhpcy5pc1BhcmVudChrZXkpKSBjb250aW51ZVxuXG4gICAgICAgIHZhbHVlID09PSB0cnVlID8gdGhpcy5zZWxlY3RlZENhY2hlLmFkZChrZXkpIDogdGhpcy5zZWxlY3RlZENhY2hlLmRlbGV0ZShrZXkpXG4gICAgICB9XG4gICAgfSxcbiAgICB1cGRhdGVPcGVuIChrZXk6IHN0cmluZyB8IG51bWJlciwgaXNPcGVuOiBib29sZWFuKSB7XG4gICAgICBpZiAoIXRoaXMubm9kZXMuaGFzT3duUHJvcGVydHkoa2V5KSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLm5vZGVzW2tleV1cbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gZ2V0T2JqZWN0VmFsdWVCeVBhdGgobm9kZS5pdGVtLCB0aGlzLml0ZW1DaGlsZHJlbilcblxuICAgICAgaWYgKGNoaWxkcmVuICYmICFjaGlsZHJlbi5sZW5ndGggJiYgbm9kZS52bm9kZSAmJiAhbm9kZS52bm9kZS5oYXNMb2FkZWQpIHtcbiAgICAgICAgbm9kZS52bm9kZS5jaGVja0NoaWxkcmVuKCkudGhlbigoKSA9PiB0aGlzLnVwZGF0ZU9wZW4oa2V5LCBpc09wZW4pKVxuICAgICAgfSBlbHNlIGlmIChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgbm9kZS5pc09wZW4gPSBpc09wZW5cblxuICAgICAgICBub2RlLmlzT3BlbiA/IHRoaXMub3BlbkNhY2hlLmFkZChrZXkpIDogdGhpcy5vcGVuQ2FjaGUuZGVsZXRlKGtleSlcblxuICAgICAgICB0aGlzLnVwZGF0ZVZub2RlU3RhdGUoa2V5KVxuICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlVm5vZGVTdGF0ZSAoa2V5OiBzdHJpbmcgfCBudW1iZXIpIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLm5vZGVzW2tleV1cblxuICAgICAgaWYgKG5vZGUgJiYgbm9kZS52bm9kZSkge1xuICAgICAgICBub2RlLnZub2RlLmlzU2VsZWN0ZWQgPSBub2RlLmlzU2VsZWN0ZWRcbiAgICAgICAgbm9kZS52bm9kZS5pc0luZGV0ZXJtaW5hdGUgPSBub2RlLmlzSW5kZXRlcm1pbmF0ZVxuICAgICAgICBub2RlLnZub2RlLmlzQWN0aXZlID0gbm9kZS5pc0FjdGl2ZVxuICAgICAgICBub2RlLnZub2RlLmlzT3BlbiA9IG5vZGUuaXNPcGVuXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0V4Y2x1ZGVkIChrZXk6IHN0cmluZyB8IG51bWJlcikge1xuICAgICAgcmV0dXJuICEhdGhpcy5zZWFyY2ggJiYgdGhpcy5leGNsdWRlZEl0ZW1zLmhhcyhrZXkpXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgY2hpbGRyZW46IFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzID0gdGhpcy5pdGVtcy5sZW5ndGhcbiAgICAgID8gdGhpcy5pdGVtcy5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pc0V4Y2x1ZGVkKGdldE9iamVjdFZhbHVlQnlQYXRoKGl0ZW0sIHRoaXMuaXRlbUtleSkpXG4gICAgICB9KS5tYXAoaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IGdlbkNoaWxkID0gVlRyZWV2aWV3Tm9kZS5vcHRpb25zLm1ldGhvZHMuZ2VuQ2hpbGQuYmluZCh0aGlzKVxuXG4gICAgICAgIHJldHVybiBnZW5DaGlsZChpdGVtLCB0aGlzLmRpc2FibGVkIHx8IGdldE9iamVjdFZhbHVlQnlQYXRoKGl0ZW0sIHRoaXMuaXRlbURpc2FibGVkKSlcbiAgICAgIH0pXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgOiB0aGlzLiRzbG90cy5kZWZhdWx0ISAvLyBUT0RPOiByZW1vdmUgdHlwZSBhbm5vdGF0aW9uIHdpdGggVFMgMy4yXG5cbiAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LXRyZWV2aWV3JyxcbiAgICAgIGNsYXNzOiB7XG4gICAgICAgICd2LXRyZWV2aWV3LS1ob3ZlcmFibGUnOiB0aGlzLmhvdmVyYWJsZSxcbiAgICAgICAgJ3YtdHJlZXZpZXctLWRlbnNlJzogdGhpcy5kZW5zZSxcbiAgICAgICAgLi4udGhpcy50aGVtZUNsYXNzZXMsXG4gICAgICB9LFxuICAgIH0sIGNoaWxkcmVuKVxuICB9LFxufSlcbiJdfQ==
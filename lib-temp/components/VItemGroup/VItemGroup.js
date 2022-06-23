// Styles
import './VItemGroup.sass';
// Mixins
import Comparable from '../../mixins/comparable';
import Proxyable from '../../mixins/proxyable';
import Themeable from '../../mixins/themeable';
// Utilities
import mixins from '../../util/mixins';
import { consoleWarn } from '../../util/console';
export const BaseItemGroup = mixins(Comparable, Proxyable, Themeable).extend({
    name: 'base-item-group',
    props: {
        activeClass: {
            type: String,
            default: 'v-item--active',
        },
        mandatory: Boolean,
        max: {
            type: [Number, String],
            default: null,
        },
        multiple: Boolean,
        tag: {
            type: String,
            default: 'div',
        },
    },
    data() {
        return {
            // As long as a value is defined, show it
            // Otherwise, check if multiple
            // to determine which default to provide
            internalLazyValue: this.value !== undefined
                ? this.value
                : this.multiple ? [] : undefined,
            items: [],
        };
    },
    computed: {
        classes() {
            return {
                'v-item-group': true,
                ...this.themeClasses,
            };
        },
        selectedIndex() {
            return (this.selectedItem && this.items.indexOf(this.selectedItem)) || -1;
        },
        selectedItem() {
            if (this.multiple)
                return undefined;
            return this.selectedItems[0];
        },
        selectedItems() {
            return this.items.filter((item, index) => {
                return this.toggleMethod(this.getValue(item, index));
            });
        },
        selectedValues() {
            if (this.internalValue == null)
                return [];
            return Array.isArray(this.internalValue)
                ? this.internalValue
                : [this.internalValue];
        },
        toggleMethod() {
            if (!this.multiple) {
                return (v) => this.valueComparator(this.internalValue, v);
            }
            const internalValue = this.internalValue;
            if (Array.isArray(internalValue)) {
                return (v) => internalValue.some(intern => this.valueComparator(intern, v));
            }
            return () => false;
        },
    },
    watch: {
        internalValue: 'updateItemsState',
        items: 'updateItemsState',
    },
    created() {
        if (this.multiple && !Array.isArray(this.internalValue)) {
            consoleWarn('Model must be bound to an array if the multiple property is true.', this);
        }
    },
    methods: {
        genData() {
            return {
                class: this.classes,
            };
        },
        getValue(item, i) {
            return item.value === undefined
                ? i
                : item.value;
        },
        onClick(item) {
            this.updateInternalValue(this.getValue(item, this.items.indexOf(item)));
        },
        register(item) {
            const index = this.items.push(item) - 1;
            item.$on('change', () => this.onClick(item));
            // If no value provided and mandatory,
            // assign first registered item
            if (this.mandatory && !this.selectedValues.length) {
                this.updateMandatory();
            }
            this.updateItem(item, index);
        },
        unregister(item) {
            if (this._isDestroyed)
                return;
            const index = this.items.indexOf(item);
            const value = this.getValue(item, index);
            this.items.splice(index, 1);
            const valueIndex = this.selectedValues.indexOf(value);
            // Items is not selected, do nothing
            if (valueIndex < 0)
                return;
            // If not mandatory, use regular update process
            if (!this.mandatory) {
                return this.updateInternalValue(value);
            }
            // Remove the value
            if (this.multiple && Array.isArray(this.internalValue)) {
                this.internalValue = this.internalValue.filter(v => v !== value);
            }
            else {
                this.internalValue = undefined;
            }
            // If mandatory and we have no selection
            // add the last item as value
            /* istanbul ignore else */
            if (!this.selectedItems.length) {
                this.updateMandatory(true);
            }
        },
        updateItem(item, index) {
            const value = this.getValue(item, index);
            item.isActive = this.toggleMethod(value);
        },
        // https://github.com/vuetifyjs/vuetify/issues/5352
        updateItemsState() {
            this.$nextTick(() => {
                if (this.mandatory &&
                    !this.selectedItems.length) {
                    return this.updateMandatory();
                }
                // TODO: Make this smarter so it
                // doesn't have to iterate every
                // child in an update
                this.items.forEach(this.updateItem);
            });
        },
        updateInternalValue(value) {
            this.multiple
                ? this.updateMultiple(value)
                : this.updateSingle(value);
        },
        updateMandatory(last) {
            if (!this.items.length)
                return;
            const items = this.items.slice();
            if (last)
                items.reverse();
            const item = items.find(item => !item.disabled);
            // If no tabs are available
            // aborts mandatory value
            if (!item)
                return;
            const index = this.items.indexOf(item);
            this.updateInternalValue(this.getValue(item, index));
        },
        updateMultiple(value) {
            const defaultValue = Array.isArray(this.internalValue)
                ? this.internalValue
                : [];
            const internalValue = defaultValue.slice();
            const index = internalValue.findIndex(val => val === value);
            if (this.mandatory &&
                // Item already exists
                index > -1 &&
                // value would be reduced below min
                internalValue.length - 1 < 1)
                return;
            if (
            // Max is set
            this.max != null &&
                // Item doesn't exist
                index < 0 &&
                // value would be increased above max
                internalValue.length + 1 > this.max)
                return;
            index > -1
                ? internalValue.splice(index, 1)
                : internalValue.push(value);
            this.internalValue = internalValue;
        },
        updateSingle(value) {
            const isSame = value === this.internalValue;
            if (this.mandatory && isSame)
                return;
            this.internalValue = isSame ? undefined : value;
        },
    },
    render(h) {
        return h(this.tag, this.genData(), this.$slots.default);
    },
});
export default BaseItemGroup.extend({
    name: 'v-item-group',
    provide() {
        return {
            itemGroup: this,
        };
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkl0ZW1Hcm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZJdGVtR3JvdXAvVkl0ZW1Hcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxtQkFBbUIsQ0FBQTtBQUUxQixTQUFTO0FBQ1QsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFFaEQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsWUFBWTtBQUNaLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQVdoRCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUNqQyxVQUFVLEVBQ1YsU0FBUyxFQUNULFNBQVMsQ0FDVixDQUFDLE1BQU0sQ0FBQztJQUNQLElBQUksRUFBRSxpQkFBaUI7SUFFdkIsS0FBSyxFQUFFO1FBQ0wsV0FBVyxFQUFFO1lBQ1gsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsZ0JBQWdCO1NBQzFCO1FBQ0QsU0FBUyxFQUFFLE9BQU87UUFDbEIsR0FBRyxFQUFFO1lBQ0gsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN0QixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsUUFBUSxFQUFFLE9BQU87UUFDakIsR0FBRyxFQUFFO1lBQ0gsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsS0FBSztTQUNmO0tBQ0Y7SUFFRCxJQUFJO1FBQ0YsT0FBTztZQUNMLHlDQUF5QztZQUN6QywrQkFBK0I7WUFDL0Isd0NBQXdDO1lBQ3hDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUztnQkFDekMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLO2dCQUNaLENBQUMsQ0FBQyxJQUFJLENBQUMs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QUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WSXRlbUdyb3VwLnNhc3MnXG5cbi8vIE1peGluc1xuaW1wb3J0IENvbXBhcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbXBhcmFibGUnXG5pbXBvcnQgR3JvdXBhYmxlIGZyb20gJy4uLy4uL21peGlucy9ncm91cGFibGUnXG5pbXBvcnQgUHJveHlhYmxlIGZyb20gJy4uLy4uL21peGlucy9wcm94eWFibGUnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGNvbnNvbGVXYXJuIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUvdHlwZXMnXG5cbmV4cG9ydCB0eXBlIEdyb3VwYWJsZUluc3RhbmNlID0gSW5zdGFuY2VUeXBlPHR5cGVvZiBHcm91cGFibGU+ICYge1xuICBpZD86IHN0cmluZ1xuICB0bz86IGFueVxuICB2YWx1ZT86IGFueVxuIH1cblxuZXhwb3J0IGNvbnN0IEJhc2VJdGVtR3JvdXAgPSBtaXhpbnMoXG4gIENvbXBhcmFibGUsXG4gIFByb3h5YWJsZSxcbiAgVGhlbWVhYmxlXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICdiYXNlLWl0ZW0tZ3JvdXAnLFxuXG4gIHByb3BzOiB7XG4gICAgYWN0aXZlQ2xhc3M6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICd2LWl0ZW0tLWFjdGl2ZScsXG4gICAgfSxcbiAgICBtYW5kYXRvcnk6IEJvb2xlYW4sXG4gICAgbWF4OiB7XG4gICAgICB0eXBlOiBbTnVtYmVyLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICB9LFxuICAgIG11bHRpcGxlOiBCb29sZWFuLFxuICAgIHRhZzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2RpdicsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gQXMgbG9uZyBhcyBhIHZhbHVlIGlzIGRlZmluZWQsIHNob3cgaXRcbiAgICAgIC8vIE90aGVyd2lzZSwgY2hlY2sgaWYgbXVsdGlwbGVcbiAgICAgIC8vIHRvIGRldGVybWluZSB3aGljaCBkZWZhdWx0IHRvIHByb3ZpZGVcbiAgICAgIGludGVybmFsTGF6eVZhbHVlOiB0aGlzLnZhbHVlICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyB0aGlzLnZhbHVlXG4gICAgICAgIDogdGhpcy5tdWx0aXBsZSA/IFtdIDogdW5kZWZpbmVkLFxuICAgICAgaXRlbXM6IFtdIGFzIEdyb3VwYWJsZUluc3RhbmNlW10sXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3YtaXRlbS1ncm91cCc6IHRydWUsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgfVxuICAgIH0sXG4gICAgc2VsZWN0ZWRJbmRleCAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiAodGhpcy5zZWxlY3RlZEl0ZW0gJiYgdGhpcy5pdGVtcy5pbmRleE9mKHRoaXMuc2VsZWN0ZWRJdGVtKSkgfHwgLTFcbiAgICB9LFxuICAgIHNlbGVjdGVkSXRlbSAoKTogR3JvdXBhYmxlSW5zdGFuY2UgfCB1bmRlZmluZWQge1xuICAgICAgaWYgKHRoaXMubXVsdGlwbGUpIHJldHVybiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJdGVtc1swXVxuICAgIH0sXG4gICAgc2VsZWN0ZWRJdGVtcyAoKTogR3JvdXBhYmxlSW5zdGFuY2VbXSB7XG4gICAgICByZXR1cm4gdGhpcy5pdGVtcy5maWx0ZXIoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZU1ldGhvZCh0aGlzLmdldFZhbHVlKGl0ZW0sIGluZGV4KSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBzZWxlY3RlZFZhbHVlcyAoKTogYW55W10ge1xuICAgICAgaWYgKHRoaXMuaW50ZXJuYWxWYWx1ZSA9PSBudWxsKSByZXR1cm4gW11cblxuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodGhpcy5pbnRlcm5hbFZhbHVlKVxuICAgICAgICA/IHRoaXMuaW50ZXJuYWxWYWx1ZVxuICAgICAgICA6IFt0aGlzLmludGVybmFsVmFsdWVdXG4gICAgfSxcbiAgICB0b2dnbGVNZXRob2QgKCk6ICh2OiBhbnkpID0+IGJvb2xlYW4ge1xuICAgICAgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICAgIHJldHVybiAodjogYW55KSA9PiB0aGlzLnZhbHVlQ29tcGFyYXRvcih0aGlzLmludGVybmFsVmFsdWUsIHYpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGludGVybmFsVmFsdWUgPSB0aGlzLmludGVybmFsVmFsdWVcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGludGVybmFsVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiAodjogYW55KSA9PiBpbnRlcm5hbFZhbHVlLnNvbWUoaW50ZXJuID0+IHRoaXMudmFsdWVDb21wYXJhdG9yKGludGVybiwgdikpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoKSA9PiBmYWxzZVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBpbnRlcm5hbFZhbHVlOiAndXBkYXRlSXRlbXNTdGF0ZScsXG4gICAgaXRlbXM6ICd1cGRhdGVJdGVtc1N0YXRlJyxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiAhQXJyYXkuaXNBcnJheSh0aGlzLmludGVybmFsVmFsdWUpKSB7XG4gICAgICBjb25zb2xlV2FybignTW9kZWwgbXVzdCBiZSBib3VuZCB0byBhbiBhcnJheSBpZiB0aGUgbXVsdGlwbGUgcHJvcGVydHkgaXMgdHJ1ZS4nLCB0aGlzKVxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICBnZW5EYXRhICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3M6IHRoaXMuY2xhc3NlcyxcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldFZhbHVlIChpdGVtOiBHcm91cGFibGVJbnN0YW5jZSwgaTogbnVtYmVyKTogdW5rbm93biB7XG4gICAgICByZXR1cm4gaXRlbS52YWx1ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gaVxuICAgICAgICA6IGl0ZW0udmFsdWVcbiAgICB9LFxuICAgIG9uQ2xpY2sgKGl0ZW06IEdyb3VwYWJsZUluc3RhbmNlKSB7XG4gICAgICB0aGlzLnVwZGF0ZUludGVybmFsVmFsdWUoXG4gICAgICAgIHRoaXMuZ2V0VmFsdWUoaXRlbSwgdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pKVxuICAgICAgKVxuICAgIH0sXG4gICAgcmVnaXN0ZXIgKGl0ZW06IEdyb3VwYWJsZUluc3RhbmNlKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuaXRlbXMucHVzaChpdGVtKSAtIDFcblxuICAgICAgaXRlbS4kb24oJ2NoYW5nZScsICgpID0+IHRoaXMub25DbGljayhpdGVtKSlcblxuICAgICAgLy8gSWYgbm8gdmFsdWUgcHJvdmlkZWQgYW5kIG1hbmRhdG9yeSxcbiAgICAgIC8vIGFzc2lnbiBmaXJzdCByZWdpc3RlcmVkIGl0ZW1cbiAgICAgIGlmICh0aGlzLm1hbmRhdG9yeSAmJiAhdGhpcy5zZWxlY3RlZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVNYW5kYXRvcnkoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnVwZGF0ZUl0ZW0oaXRlbSwgaW5kZXgpXG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyIChpdGVtOiBHcm91cGFibGVJbnN0YW5jZSkge1xuICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm5cblxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSlcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZShpdGVtLCBpbmRleClcblxuICAgICAgdGhpcy5pdGVtcy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICAgIGNvbnN0IHZhbHVlSW5kZXggPSB0aGlzLnNlbGVjdGVkVmFsdWVzLmluZGV4T2YodmFsdWUpXG5cbiAgICAgIC8vIEl0ZW1zIGlzIG5vdCBzZWxlY3RlZCwgZG8gbm90aGluZ1xuICAgICAgaWYgKHZhbHVlSW5kZXggPCAwKSByZXR1cm5cblxuICAgICAgLy8gSWYgbm90IG1hbmRhdG9yeSwgdXNlIHJlZ3VsYXIgdXBkYXRlIHByb2Nlc3NcbiAgICAgIGlmICghdGhpcy5tYW5kYXRvcnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlSW50ZXJuYWxWYWx1ZSh2YWx1ZSlcbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIHRoZSB2YWx1ZVxuICAgICAgaWYgKHRoaXMubXVsdGlwbGUgJiYgQXJyYXkuaXNBcnJheSh0aGlzLmludGVybmFsVmFsdWUpKSB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHRoaXMuaW50ZXJuYWxWYWx1ZS5maWx0ZXIodiA9PiB2ICE9PSB2YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHVuZGVmaW5lZFxuICAgICAgfVxuXG4gICAgICAvLyBJZiBtYW5kYXRvcnkgYW5kIHdlIGhhdmUgbm8gc2VsZWN0aW9uXG4gICAgICAvLyBhZGQgdGhlIGxhc3QgaXRlbSBhcyB2YWx1ZVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmICghdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnVwZGF0ZU1hbmRhdG9yeSh0cnVlKVxuICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlSXRlbSAoaXRlbTogR3JvdXBhYmxlSW5zdGFuY2UsIGluZGV4OiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZShpdGVtLCBpbmRleClcblxuICAgICAgaXRlbS5pc0FjdGl2ZSA9IHRoaXMudG9nZ2xlTWV0aG9kKHZhbHVlKVxuICAgIH0sXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZXRpZnlqcy92dWV0aWZ5L2lzc3Vlcy81MzUyXG4gICAgdXBkYXRlSXRlbXNTdGF0ZSAoKSB7XG4gICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLm1hbmRhdG9yeSAmJlxuICAgICAgICAgICF0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZU1hbmRhdG9yeSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBNYWtlIHRoaXMgc21hcnRlciBzbyBpdFxuICAgICAgICAvLyBkb2Vzbid0IGhhdmUgdG8gaXRlcmF0ZSBldmVyeVxuICAgICAgICAvLyBjaGlsZCBpbiBhbiB1cGRhdGVcbiAgICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKHRoaXMudXBkYXRlSXRlbSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICB1cGRhdGVJbnRlcm5hbFZhbHVlICh2YWx1ZTogYW55KSB7XG4gICAgICB0aGlzLm11bHRpcGxlXG4gICAgICAgID8gdGhpcy51cGRhdGVNdWx0aXBsZSh2YWx1ZSlcbiAgICAgICAgOiB0aGlzLnVwZGF0ZVNpbmdsZSh2YWx1ZSlcbiAgICB9LFxuICAgIHVwZGF0ZU1hbmRhdG9yeSAobGFzdD86IGJvb2xlYW4pIHtcbiAgICAgIGlmICghdGhpcy5pdGVtcy5sZW5ndGgpIHJldHVyblxuXG4gICAgICBjb25zdCBpdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoKVxuXG4gICAgICBpZiAobGFzdCkgaXRlbXMucmV2ZXJzZSgpXG5cbiAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtcy5maW5kKGl0ZW0gPT4gIWl0ZW0uZGlzYWJsZWQpXG5cbiAgICAgIC8vIElmIG5vIHRhYnMgYXJlIGF2YWlsYWJsZVxuICAgICAgLy8gYWJvcnRzIG1hbmRhdG9yeSB2YWx1ZVxuICAgICAgaWYgKCFpdGVtKSByZXR1cm5cblxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSlcblxuICAgICAgdGhpcy51cGRhdGVJbnRlcm5hbFZhbHVlKFxuICAgICAgICB0aGlzLmdldFZhbHVlKGl0ZW0sIGluZGV4KVxuICAgICAgKVxuICAgIH0sXG4gICAgdXBkYXRlTXVsdGlwbGUgKHZhbHVlOiBhbnkpIHtcbiAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZSA9IEFycmF5LmlzQXJyYXkodGhpcy5pbnRlcm5hbFZhbHVlKVxuICAgICAgICA/IHRoaXMuaW50ZXJuYWxWYWx1ZVxuICAgICAgICA6IFtdXG4gICAgICBjb25zdCBpbnRlcm5hbFZhbHVlID0gZGVmYXVsdFZhbHVlLnNsaWNlKClcbiAgICAgIGNvbnN0IGluZGV4ID0gaW50ZXJuYWxWYWx1ZS5maW5kSW5kZXgodmFsID0+IHZhbCA9PT0gdmFsdWUpXG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5tYW5kYXRvcnkgJiZcbiAgICAgICAgLy8gSXRlbSBhbHJlYWR5IGV4aXN0c1xuICAgICAgICBpbmRleCA+IC0xICYmXG4gICAgICAgIC8vIHZhbHVlIHdvdWxkIGJlIHJlZHVjZWQgYmVsb3cgbWluXG4gICAgICAgIGludGVybmFsVmFsdWUubGVuZ3RoIC0gMSA8IDFcbiAgICAgICkgcmV0dXJuXG5cbiAgICAgIGlmIChcbiAgICAgICAgLy8gTWF4IGlzIHNldFxuICAgICAgICB0aGlzLm1heCAhPSBudWxsICYmXG4gICAgICAgIC8vIEl0ZW0gZG9lc24ndCBleGlzdFxuICAgICAgICBpbmRleCA8IDAgJiZcbiAgICAgICAgLy8gdmFsdWUgd291bGQgYmUgaW5jcmVhc2VkIGFib3ZlIG1heFxuICAgICAgICBpbnRlcm5hbFZhbHVlLmxlbmd0aCArIDEgPiB0aGlzLm1heFxuICAgICAgKSByZXR1cm5cblxuICAgICAgaW5kZXggPiAtMVxuICAgICAgICA/IGludGVybmFsVmFsdWUuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICA6IGludGVybmFsVmFsdWUucHVzaCh2YWx1ZSlcblxuICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlID0gaW50ZXJuYWxWYWx1ZVxuICAgIH0sXG4gICAgdXBkYXRlU2luZ2xlICh2YWx1ZTogYW55KSB7XG4gICAgICBjb25zdCBpc1NhbWUgPSB2YWx1ZSA9PT0gdGhpcy5pbnRlcm5hbFZhbHVlXG5cbiAgICAgIGlmICh0aGlzLm1hbmRhdG9yeSAmJiBpc1NhbWUpIHJldHVyblxuXG4gICAgICB0aGlzLmludGVybmFsVmFsdWUgPSBpc1NhbWUgPyB1bmRlZmluZWQgOiB2YWx1ZVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKHRoaXMudGFnLCB0aGlzLmdlbkRhdGEoKSwgdGhpcy4kc2xvdHMuZGVmYXVsdClcbiAgfSxcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VJdGVtR3JvdXAuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtaXRlbS1ncm91cCcsXG5cbiAgcHJvdmlkZSAoKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgaXRlbUdyb3VwOiB0aGlzLFxuICAgIH1cbiAgfSxcbn0pXG4iXX0=
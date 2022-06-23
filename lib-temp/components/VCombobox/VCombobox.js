// Styles
import '../VAutocomplete/VAutocomplete.sass';
// Extensions
import VSelect from '../VSelect/VSelect';
import VAutocomplete from '../VAutocomplete/VAutocomplete';
// Utils
import { keyCodes } from '../../util/helpers';
/* @vue/component */
export default VAutocomplete.extend({
    name: 'v-combobox',
    props: {
        delimiters: {
            type: Array,
            default: () => ([]),
        },
        returnObject: {
            type: Boolean,
            default: true,
        },
    },
    data: () => ({
        editingIndex: -1,
    }),
    computed: {
        computedCounterValue() {
            return this.multiple
                ? this.selectedItems.length
                : (this.internalSearch || '').toString().length;
        },
        hasSlot() {
            return VSelect.options.computed.hasSlot.call(this) || this.multiple;
        },
        isAnyValueAllowed() {
            return true;
        },
        menuCanShow() {
            if (!this.isFocused)
                return false;
            return this.hasDisplayedItems ||
                (!!this.$slots['no-data'] && !this.hideNoData);
        },
        searchIsDirty() {
            return this.internalSearch != null;
        },
    },
    methods: {
        onInternalSearchChanged(val) {
            if (val &&
                this.multiple &&
                this.delimiters.length) {
                const delimiter = this.delimiters.find(d => val.endsWith(d));
                if (delimiter != null) {
                    this.internalSearch = val.slice(0, val.length - delimiter.length);
                    this.updateTags();
                }
            }
            this.updateMenuDimensions();
        },
        genInput() {
            const input = VAutocomplete.options.methods.genInput.call(this);
            delete input.data.attrs.name;
            input.data.on.paste = this.onPaste;
            return input;
        },
        genChipSelection(item, index) {
            const chip = VSelect.options.methods.genChipSelection.call(this, item, index);
            // Allow user to update an existing value
            if (this.multiple) {
                chip.componentOptions.listeners = {
                    ...chip.componentOptions.listeners,
                    dblclick: () => {
                        this.editingIndex = index;
                        this.internalSearch = this.getText(item);
                        this.selectedIndex = -1;
                    },
                };
            }
            return chip;
        },
        onChipInput(item) {
            VSelect.options.methods.onChipInput.call(this, item);
            this.editingIndex = -1;
        },
        // Requires a manual definition
        // to overwrite removal in v-autocomplete
        onEnterDown(e) {
            e.preventDefault();
            // If has menu index, let v-select-list handle
            if (this.getMenuIndex() > -1)
                return;
            this.$nextTick(this.updateSelf);
        },
        onKeyDown(e) {
            const keyCode = e.keyCode;
            if (e.ctrlKey ||
                ![keyCodes.home, keyCodes.end].includes(keyCode)) {
                VSelect.options.methods.onKeyDown.call(this, e);
            }
            // If user is at selection index of 0
            // create a new tag
            if (this.multiple &&
                keyCode === keyCodes.left &&
                this.$refs.input.selectionStart === 0) {
                this.updateSelf();
            }
            else if (keyCode === keyCodes.enter) {
                this.onEnterDown(e);
            }
            // The ordering is important here
            // allows new value to be updated
            // and then moves the index to the
            // proper location
            this.changeSelectedIndex(keyCode);
        },
        onTabDown(e) {
            // When adding tags, if searching and
            // there is not a filtered options,
            // add the value to the tags list
            if (this.multiple &&
                this.internalSearch &&
                this.getMenuIndex() === -1) {
                e.preventDefault();
                e.stopPropagation();
                return this.updateTags();
            }
            VAutocomplete.options.methods.onTabDown.call(this, e);
        },
        selectItem(item) {
            // Currently only supports items:<string[]>
            if (this.editingIndex > -1) {
                this.updateEditing();
            }
            else {
                VAutocomplete.options.methods.selectItem.call(this, item);
                // if selected item contains search value,
                // remove the search string
                if (this.internalSearch &&
                    this.multiple &&
                    this.getText(item).toLocaleLowerCase().includes(this.internalSearch.toLocaleLowerCase())) {
                    this.internalSearch = null;
                }
            }
        },
        setSelectedItems() {
            if (this.internalValue == null ||
                this.internalValue === '') {
                this.selectedItems = [];
            }
            else {
                this.selectedItems = this.multiple ? this.internalValue : [this.internalValue];
            }
        },
        setValue(value) {
            VSelect.options.methods.setValue.call(this, value === undefined ? this.internalSearch : value);
        },
        updateEditing() {
            const value = this.internalValue.slice();
            const index = this.selectedItems.findIndex(item => this.getText(item) === this.internalSearch);
            // If user enters a duplicate text on chip edit,
            // don't add it, move it to the end of the list
            if (index > -1) {
                const item = typeof value[index] === 'object'
                    ? Object.assign({}, value[index])
                    : value[index];
                value.splice(index, 1);
                value.push(item);
            }
            else {
                value[this.editingIndex] = this.internalSearch;
            }
            this.setValue(value);
            this.editingIndex = -1;
            this.internalSearch = null;
        },
        updateCombobox() {
            // If search is not dirty, do nothing
            if (!this.searchIsDirty)
                return;
            // The internal search is not matching
            // the internal value, update the input
            if (this.internalSearch !== this.getText(this.internalValue))
                this.setValue();
            // Reset search if using slot to avoid a double input
            const isUsingSlot = Boolean(this.$scopedSlots.selection) || this.hasChips;
            if (isUsingSlot)
                this.internalSearch = null;
        },
        updateSelf() {
            this.multiple ? this.updateTags() : this.updateCombobox();
        },
        updateTags() {
            const menuIndex = this.getMenuIndex();
            // If the user is not searching
            // and no menu item is selected
            // or if the search is empty
            // do nothing
            if ((menuIndex < 0 && !this.searchIsDirty) ||
                !this.internalSearch)
                return;
            if (this.editingIndex > -1) {
                return this.updateEditing();
            }
            const index = this.selectedItems.findIndex(item => this.internalSearch === this.getText(item));
            // If the duplicate item is an object,
            // copy it, so that it can be added again later
            const itemToSelect = index > -1 && typeof this.selectedItems[index] === 'object'
                ? Object.assign({}, this.selectedItems[index])
                : this.internalSearch;
            // If it already exists, do nothing
            // this might need to change to bring
            // the duplicated item to the last entered
            if (index > -1) {
                const internalValue = this.internalValue.slice();
                internalValue.splice(index, 1);
                this.setValue(internalValue);
            }
            // If menu index is greater than 1
            // the selection is handled elsewhere
            // TODO: find out where
            if (menuIndex > -1)
                return (this.internalSearch = null);
            this.selectItem(itemToSelect);
            this.internalSearch = null;
        },
        onPaste(event) {
            if (!this.multiple || this.searchIsDirty)
                return;
            const pastedItemText = event.clipboardData?.getData('text/vnd.vuetify.autocomplete.item+plain');
            if (pastedItemText && this.findExistingIndex(pastedItemText) === -1) {
                event.preventDefault();
                VSelect.options.methods.selectItem.call(this, pastedItemText);
            }
        },
        clearableCallback() {
            this.editingIndex = -1;
            VAutocomplete.options.methods.clearableCallback.call(this);
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNvbWJvYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkNvbWJvYm94L1ZDb21ib2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxxQ0FBcUMsQ0FBQTtBQUU1QyxhQUFhO0FBQ2IsT0FBTyxPQUFPLE1BQU0sb0JBQW9CLENBQUE7QUFDeEMsT0FBTyxhQUFhLE1BQU0sZ0NBQWdDLENBQUE7QUFFMUQsUUFBUTtBQUNSLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUs3QyxvQkFBb0I7QUFDcEIsZUFBZSxhQUFhLENBQUMsTUFBTSxDQUFDO0lBQ2xDLElBQUksRUFBRSxZQUFZO0lBRWxCLEtBQUssRUFBRTtRQUNMLFVBQVUsRUFBRTtZQUNWLElBQUksRUFBRSxLQUFLO1lBQ1gsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ087UUFDNUIsWUFBWSxFQUFFO1lBQ1osSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsSUFBSTtTQUNkO0tBQ0Y7SUFFRCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNYLFlBQVksRUFBRSxDQUFDLENBQUM7S0FDakIsQ0FBQztJQUVGLFFBQVEsRUFBRTtRQUNSLG9CQUFvQjtZQUNsQixPQUFPLElBQUksQ0FBQyxRQUFRO2dCQUNsQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO2dCQUMzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQTtRQUNuRCxDQUFDO1FBQ0QsT0FBTztZQUNMLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFBO1FBQ3JFLENB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VSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBcUIsQ0FBQyxDQUFBO2FBQ3JFO1FBQ0gsQ0FBQztRQUNELGlCQUFpQjtZQUNmLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFFdEIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVELENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuLi9WQXV0b2NvbXBsZXRlL1ZBdXRvY29tcGxldGUuc2FzcydcblxuLy8gRXh0ZW5zaW9uc1xuaW1wb3J0IFZTZWxlY3QgZnJvbSAnLi4vVlNlbGVjdC9WU2VsZWN0J1xuaW1wb3J0IFZBdXRvY29tcGxldGUgZnJvbSAnLi4vVkF1dG9jb21wbGV0ZS9WQXV0b2NvbXBsZXRlJ1xuXG4vLyBVdGlsc1xuaW1wb3J0IHsga2V5Q29kZXMgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBWQXV0b2NvbXBsZXRlLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWNvbWJvYm94JyxcblxuICBwcm9wczoge1xuICAgIGRlbGltaXRlcnM6IHtcbiAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKFtdKSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8c3RyaW5nW10+LFxuICAgIHJldHVybk9iamVjdDoge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGVkaXRpbmdJbmRleDogLTEsXG4gIH0pLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY29tcHV0ZWRDb3VudGVyVmFsdWUgKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBsZVxuICAgICAgICA/IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGhcbiAgICAgICAgOiAodGhpcy5pbnRlcm5hbFNlYXJjaCB8fCAnJykudG9TdHJpbmcoKS5sZW5ndGhcbiAgICB9LFxuICAgIGhhc1Nsb3QgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIFZTZWxlY3Qub3B0aW9ucy5jb21wdXRlZC5oYXNTbG90LmNhbGwodGhpcykgfHwgdGhpcy5tdWx0aXBsZVxuICAgIH0sXG4gICAgaXNBbnlWYWx1ZUFsbG93ZWQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICAgIG1lbnVDYW5TaG93ICgpOiBib29sZWFuIHtcbiAgICAgIGlmICghdGhpcy5pc0ZvY3VzZWQpIHJldHVybiBmYWxzZVxuXG4gICAgICByZXR1cm4gdGhpcy5oYXNEaXNwbGF5ZWRJdGVtcyB8fFxuICAgICAgICAoISF0aGlzLiRzbG90c1snbm8tZGF0YSddICYmICF0aGlzLmhpZGVOb0RhdGEpXG4gICAgfSxcbiAgICBzZWFyY2hJc0RpcnR5ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVybmFsU2VhcmNoICE9IG51bGxcbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBvbkludGVybmFsU2VhcmNoQ2hhbmdlZCAodmFsOiBhbnkpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdmFsICYmXG4gICAgICAgIHRoaXMubXVsdGlwbGUgJiZcbiAgICAgICAgdGhpcy5kZWxpbWl0ZXJzLmxlbmd0aFxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGRlbGltaXRlciA9IHRoaXMuZGVsaW1pdGVycy5maW5kKGQgPT4gdmFsLmVuZHNXaXRoKGQpKVxuICAgICAgICBpZiAoZGVsaW1pdGVyICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmludGVybmFsU2VhcmNoID0gdmFsLnNsaWNlKDAsIHZhbC5sZW5ndGggLSBkZWxpbWl0ZXIubGVuZ3RoKVxuICAgICAgICAgIHRoaXMudXBkYXRlVGFncygpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGVNZW51RGltZW5zaW9ucygpXG4gICAgfSxcbiAgICBnZW5JbnB1dCAoKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IFZBdXRvY29tcGxldGUub3B0aW9ucy5tZXRob2RzLmdlbklucHV0LmNhbGwodGhpcylcblxuICAgICAgZGVsZXRlIGlucHV0LmRhdGEhLmF0dHJzIS5uYW1lXG4gICAgICBpbnB1dC5kYXRhIS5vbiEucGFzdGUgPSB0aGlzLm9uUGFzdGVcblxuICAgICAgcmV0dXJuIGlucHV0XG4gICAgfSxcbiAgICBnZW5DaGlwU2VsZWN0aW9uIChpdGVtOiBvYmplY3QsIGluZGV4OiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IGNoaXAgPSBWU2VsZWN0Lm9wdGlvbnMubWV0aG9kcy5nZW5DaGlwU2VsZWN0aW9uLmNhbGwodGhpcywgaXRlbSwgaW5kZXgpXG5cbiAgICAgIC8vIEFsbG93IHVzZXIgdG8gdXBkYXRlIGFuIGV4aXN0aW5nIHZhbHVlXG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgICBjaGlwLmNvbXBvbmVudE9wdGlvbnMhLmxpc3RlbmVycyEgPSB7XG4gICAgICAgICAgLi4uY2hpcC5jb21wb25lbnRPcHRpb25zIS5saXN0ZW5lcnMhLFxuICAgICAgICAgIGRibGNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVkaXRpbmdJbmRleCA9IGluZGV4XG4gICAgICAgICAgICB0aGlzLmludGVybmFsU2VhcmNoID0gdGhpcy5nZXRUZXh0KGl0ZW0pXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSAtMVxuICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoaXBcbiAgICB9LFxuICAgIG9uQ2hpcElucHV0IChpdGVtOiBvYmplY3QpIHtcbiAgICAgIFZTZWxlY3Qub3B0aW9ucy5tZXRob2RzLm9uQ2hpcElucHV0LmNhbGwodGhpcywgaXRlbSlcblxuICAgICAgdGhpcy5lZGl0aW5nSW5kZXggPSAtMVxuICAgIH0sXG4gICAgLy8gUmVxdWlyZXMgYSBtYW51YWwgZGVmaW5pdGlvblxuICAgIC8vIHRvIG92ZXJ3cml0ZSByZW1vdmFsIGluIHYtYXV0b2NvbXBsZXRlXG4gICAgb25FbnRlckRvd24gKGU6IEV2ZW50KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIC8vIElmIGhhcyBtZW51IGluZGV4LCBsZXQgdi1zZWxlY3QtbGlzdCBoYW5kbGVcbiAgICAgIGlmICh0aGlzLmdldE1lbnVJbmRleCgpID4gLTEpIHJldHVyblxuXG4gICAgICB0aGlzLiRuZXh0VGljayh0aGlzLnVwZGF0ZVNlbGYpXG4gICAgfSxcbiAgICBvbktleURvd24gKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgIGNvbnN0IGtleUNvZGUgPSBlLmtleUNvZGVcblxuICAgICAgaWYgKFxuICAgICAgICBlLmN0cmxLZXkgfHxcbiAgICAgICAgIVtrZXlDb2Rlcy5ob21lLCBrZXlDb2Rlcy5lbmRdLmluY2x1ZGVzKGtleUNvZGUpXG4gICAgICApIHtcbiAgICAgICAgVlNlbGVjdC5vcHRpb25zLm1ldGhvZHMub25LZXlEb3duLmNhbGwodGhpcywgZSlcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdXNlciBpcyBhdCBzZWxlY3Rpb24gaW5kZXggb2YgMFxuICAgICAgLy8gY3JlYXRlIGEgbmV3IHRhZ1xuICAgICAgaWYgKHRoaXMubXVsdGlwbGUgJiZcbiAgICAgICAga2V5Q29kZSA9PT0ga2V5Q29kZXMubGVmdCAmJlxuICAgICAgICB0aGlzLiRyZWZzLmlucHV0LnNlbGVjdGlvblN0YXJ0ID09PSAwXG4gICAgICApIHtcbiAgICAgICAgdGhpcy51cGRhdGVTZWxmKClcbiAgICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0ga2V5Q29kZXMuZW50ZXIpIHtcbiAgICAgICAgdGhpcy5vbkVudGVyRG93bihlKVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgb3JkZXJpbmcgaXMgaW1wb3J0YW50IGhlcmVcbiAgICAgIC8vIGFsbG93cyBuZXcgdmFsdWUgdG8gYmUgdXBkYXRlZFxuICAgICAgLy8gYW5kIHRoZW4gbW92ZXMgdGhlIGluZGV4IHRvIHRoZVxuICAgICAgLy8gcHJvcGVyIGxvY2F0aW9uXG4gICAgICB0aGlzLmNoYW5nZVNlbGVjdGVkSW5kZXgoa2V5Q29kZSlcbiAgICB9LFxuICAgIG9uVGFiRG93biAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgLy8gV2hlbiBhZGRpbmcgdGFncywgaWYgc2VhcmNoaW5nIGFuZFxuICAgICAgLy8gdGhlcmUgaXMgbm90IGEgZmlsdGVyZWQgb3B0aW9ucyxcbiAgICAgIC8vIGFkZCB0aGUgdmFsdWUgdG8gdGhlIHRhZ3MgbGlzdFxuICAgICAgaWYgKHRoaXMubXVsdGlwbGUgJiZcbiAgICAgICAgdGhpcy5pbnRlcm5hbFNlYXJjaCAmJlxuICAgICAgICB0aGlzLmdldE1lbnVJbmRleCgpID09PSAtMVxuICAgICAgKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlVGFncygpXG4gICAgICB9XG5cbiAgICAgIFZBdXRvY29tcGxldGUub3B0aW9ucy5tZXRob2RzLm9uVGFiRG93bi5jYWxsKHRoaXMsIGUpXG4gICAgfSxcbiAgICBzZWxlY3RJdGVtIChpdGVtOiBvYmplY3QpIHtcbiAgICAgIC8vIEN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIGl0ZW1zOjxzdHJpbmdbXT5cbiAgICAgIGlmICh0aGlzLmVkaXRpbmdJbmRleCA+IC0xKSB7XG4gICAgICAgIHRoaXMudXBkYXRlRWRpdGluZygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBWQXV0b2NvbXBsZXRlLm9wdGlvbnMubWV0aG9kcy5zZWxlY3RJdGVtLmNhbGwodGhpcywgaXRlbSlcblxuICAgICAgICAvLyBpZiBzZWxlY3RlZCBpdGVtIGNvbnRhaW5zIHNlYXJjaCB2YWx1ZSxcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBzZWFyY2ggc3RyaW5nXG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmludGVybmFsU2VhcmNoICYmXG4gICAgICAgICAgdGhpcy5tdWx0aXBsZSAmJlxuICAgICAgICAgIHRoaXMuZ2V0VGV4dChpdGVtKS50b0xvY2FsZUxvd2VyQ2FzZSgpLmluY2x1ZGVzKHRoaXMuaW50ZXJuYWxTZWFyY2gudG9Mb2NhbGVMb3dlckNhc2UoKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5pbnRlcm5hbFNlYXJjaCA9IG51bGxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0U2VsZWN0ZWRJdGVtcyAoKSB7XG4gICAgICBpZiAodGhpcy5pbnRlcm5hbFZhbHVlID09IG51bGwgfHxcbiAgICAgICAgdGhpcy5pbnRlcm5hbFZhbHVlID09PSAnJ1xuICAgICAgKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSB0aGlzLm11bHRpcGxlID8gdGhpcy5pbnRlcm5hbFZhbHVlIDogW3RoaXMuaW50ZXJuYWxWYWx1ZV1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldFZhbHVlICh2YWx1ZT86IGFueSkge1xuICAgICAgVlNlbGVjdC5vcHRpb25zLm1ldGhvZHMuc2V0VmFsdWUuY2FsbCh0aGlzLCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdGhpcy5pbnRlcm5hbFNlYXJjaCA6IHZhbHVlKVxuICAgIH0sXG4gICAgdXBkYXRlRWRpdGluZyAoKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaW50ZXJuYWxWYWx1ZS5zbGljZSgpXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc2VsZWN0ZWRJdGVtcy5maW5kSW5kZXgoaXRlbSA9PlxuICAgICAgICB0aGlzLmdldFRleHQoaXRlbSkgPT09IHRoaXMuaW50ZXJuYWxTZWFyY2gpXG5cbiAgICAgIC8vIElmIHVzZXIgZW50ZXJzIGEgZHVwbGljYXRlIHRleHQgb24gY2hpcCBlZGl0LFxuICAgICAgLy8gZG9uJ3QgYWRkIGl0LCBtb3ZlIGl0IHRvIHRoZSBlbmQgb2YgdGhlIGxpc3RcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0eXBlb2YgdmFsdWVbaW5kZXhdID09PSAnb2JqZWN0J1xuICAgICAgICAgID8gT2JqZWN0LmFzc2lnbih7fSwgdmFsdWVbaW5kZXhdKVxuICAgICAgICAgIDogdmFsdWVbaW5kZXhdXG5cbiAgICAgICAgdmFsdWUuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICB2YWx1ZS5wdXNoKGl0ZW0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZVt0aGlzLmVkaXRpbmdJbmRleF0gPSB0aGlzLmludGVybmFsU2VhcmNoXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0VmFsdWUodmFsdWUpXG4gICAgICB0aGlzLmVkaXRpbmdJbmRleCA9IC0xXG4gICAgICB0aGlzLmludGVybmFsU2VhcmNoID0gbnVsbFxuICAgIH0sXG4gICAgdXBkYXRlQ29tYm9ib3ggKCkge1xuICAgICAgLy8gSWYgc2VhcmNoIGlzIG5vdCBkaXJ0eSwgZG8gbm90aGluZ1xuICAgICAgaWYgKCF0aGlzLnNlYXJjaElzRGlydHkpIHJldHVyblxuXG4gICAgICAvLyBUaGUgaW50ZXJuYWwgc2VhcmNoIGlzIG5vdCBtYXRjaGluZ1xuICAgICAgLy8gdGhlIGludGVybmFsIHZhbHVlLCB1cGRhdGUgdGhlIGlucHV0XG4gICAgICBpZiAodGhpcy5pbnRlcm5hbFNlYXJjaCAhPT0gdGhpcy5nZXRUZXh0KHRoaXMuaW50ZXJuYWxWYWx1ZSkpIHRoaXMuc2V0VmFsdWUoKVxuXG4gICAgICAvLyBSZXNldCBzZWFyY2ggaWYgdXNpbmcgc2xvdCB0byBhdm9pZCBhIGRvdWJsZSBpbnB1dFxuICAgICAgY29uc3QgaXNVc2luZ1Nsb3QgPSBCb29sZWFuKHRoaXMuJHNjb3BlZFNsb3RzLnNlbGVjdGlvbikgfHwgdGhpcy5oYXNDaGlwc1xuICAgICAgaWYgKGlzVXNpbmdTbG90KSB0aGlzLmludGVybmFsU2VhcmNoID0gbnVsbFxuICAgIH0sXG4gICAgdXBkYXRlU2VsZiAoKSB7XG4gICAgICB0aGlzLm11bHRpcGxlID8gdGhpcy51cGRhdGVUYWdzKCkgOiB0aGlzLnVwZGF0ZUNvbWJvYm94KClcbiAgICB9LFxuICAgIHVwZGF0ZVRhZ3MgKCkge1xuICAgICAgY29uc3QgbWVudUluZGV4ID0gdGhpcy5nZXRNZW51SW5kZXgoKVxuXG4gICAgICAvLyBJZiB0aGUgdXNlciBpcyBub3Qgc2VhcmNoaW5nXG4gICAgICAvLyBhbmQgbm8gbWVudSBpdGVtIGlzIHNlbGVjdGVkXG4gICAgICAvLyBvciBpZiB0aGUgc2VhcmNoIGlzIGVtcHR5XG4gICAgICAvLyBkbyBub3RoaW5nXG4gICAgICBpZiAoKG1lbnVJbmRleCA8IDAgJiYgIXRoaXMuc2VhcmNoSXNEaXJ0eSkgfHxcbiAgICAgICAgICAhdGhpcy5pbnRlcm5hbFNlYXJjaCkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLmVkaXRpbmdJbmRleCA+IC0xKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUVkaXRpbmcoKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc2VsZWN0ZWRJdGVtcy5maW5kSW5kZXgoaXRlbSA9PlxuICAgICAgICB0aGlzLmludGVybmFsU2VhcmNoID09PSB0aGlzLmdldFRleHQoaXRlbSkpXG5cbiAgICAgIC8vIElmIHRoZSBkdXBsaWNhdGUgaXRlbSBpcyBhbiBvYmplY3QsXG4gICAgICAvLyBjb3B5IGl0LCBzbyB0aGF0IGl0IGNhbiBiZSBhZGRlZCBhZ2FpbiBsYXRlclxuICAgICAgY29uc3QgaXRlbVRvU2VsZWN0ID0gaW5kZXggPiAtMSAmJiB0eXBlb2YgdGhpcy5zZWxlY3RlZEl0ZW1zW2luZGV4XSA9PT0gJ29iamVjdCdcbiAgICAgICAgPyBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnNlbGVjdGVkSXRlbXNbaW5kZXhdKVxuICAgICAgICA6IHRoaXMuaW50ZXJuYWxTZWFyY2hcblxuICAgICAgLy8gSWYgaXQgYWxyZWFkeSBleGlzdHMsIGRvIG5vdGhpbmdcbiAgICAgIC8vIHRoaXMgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdG8gYnJpbmdcbiAgICAgIC8vIHRoZSBkdXBsaWNhdGVkIGl0ZW0gdG8gdGhlIGxhc3QgZW50ZXJlZFxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxWYWx1ZSA9IHRoaXMuaW50ZXJuYWxWYWx1ZS5zbGljZSgpXG4gICAgICAgIGludGVybmFsVmFsdWUuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoaW50ZXJuYWxWYWx1ZSlcbiAgICAgIH1cblxuICAgICAgLy8gSWYgbWVudSBpbmRleCBpcyBncmVhdGVyIHRoYW4gMVxuICAgICAgLy8gdGhlIHNlbGVjdGlvbiBpcyBoYW5kbGVkIGVsc2V3aGVyZVxuICAgICAgLy8gVE9ETzogZmluZCBvdXQgd2hlcmVcbiAgICAgIGlmIChtZW51SW5kZXggPiAtMSkgcmV0dXJuICh0aGlzLmludGVybmFsU2VhcmNoID0gbnVsbClcblxuICAgICAgdGhpcy5zZWxlY3RJdGVtKGl0ZW1Ub1NlbGVjdClcblxuICAgICAgdGhpcy5pbnRlcm5hbFNlYXJjaCA9IG51bGxcbiAgICB9LFxuICAgIG9uUGFzdGUgKGV2ZW50OiBDbGlwYm9hcmRFdmVudCkge1xuICAgICAgaWYgKCF0aGlzLm11bHRpcGxlIHx8IHRoaXMuc2VhcmNoSXNEaXJ0eSkgcmV0dXJuXG5cbiAgICAgIGNvbnN0IHBhc3RlZEl0ZW1UZXh0ID0gZXZlbnQuY2xpcGJvYXJkRGF0YT8uZ2V0RGF0YSgndGV4dC92bmQudnVldGlmeS5hdXRvY29tcGxldGUuaXRlbStwbGFpbicpXG4gICAgICBpZiAocGFzdGVkSXRlbVRleHQgJiYgdGhpcy5maW5kRXhpc3RpbmdJbmRleChwYXN0ZWRJdGVtVGV4dCBhcyBhbnkpID09PSAtMSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIFZTZWxlY3Qub3B0aW9ucy5tZXRob2RzLnNlbGVjdEl0ZW0uY2FsbCh0aGlzLCBwYXN0ZWRJdGVtVGV4dCBhcyBhbnkpXG4gICAgICB9XG4gICAgfSxcbiAgICBjbGVhcmFibGVDYWxsYmFjayAoKSB7XG4gICAgICB0aGlzLmVkaXRpbmdJbmRleCA9IC0xXG5cbiAgICAgIFZBdXRvY29tcGxldGUub3B0aW9ucy5tZXRob2RzLmNsZWFyYWJsZUNhbGxiYWNrLmNhbGwodGhpcylcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==
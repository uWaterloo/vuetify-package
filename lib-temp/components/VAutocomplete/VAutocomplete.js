// Styles
import './VAutocomplete.sass';
// Extensions
import VSelect, { defaultMenuProps as VSelectMenuProps } from '../VSelect/VSelect';
import VTextField from '../VTextField/VTextField';
// Utilities
import mergeData from '../../util/mergeData';
import { getObjectValueByPath, getPropertyFromItem, keyCodes, } from '../../util/helpers';
const defaultMenuProps = {
    ...VSelectMenuProps,
    offsetY: true,
    offsetOverflow: true,
    transition: false,
};
/* @vue/component */
export default VSelect.extend({
    name: 'v-autocomplete',
    props: {
        allowOverflow: {
            type: Boolean,
            default: true,
        },
        autoSelectFirst: {
            type: Boolean,
            default: false,
        },
        filter: {
            type: Function,
            default: (item, queryText, itemText) => {
                return itemText.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1;
            },
        },
        hideNoData: Boolean,
        menuProps: {
            type: VSelect.options.props.menuProps.type,
            default: () => defaultMenuProps,
        },
        noFilter: Boolean,
        searchInput: {
            type: String,
        },
    },
    data() {
        return {
            lazySearch: this.searchInput,
        };
    },
    computed: {
        classes() {
            return {
                ...VSelect.options.computed.classes.call(this),
                'v-autocomplete': true,
                'v-autocomplete--is-selecting-index': this.selectedIndex > -1,
            };
        },
        computedItems() {
            return this.filteredItems;
        },
        selectedValues() {
            return this.selectedItems.map(item => this.getValue(item));
        },
        hasDisplayedItems() {
            return this.hideSelected
                ? this.filteredItems.some(item => !this.hasItem(item))
                : this.filteredItems.length > 0;
        },
        currentRange() {
            if (this.selectedItem == null)
                return 0;
            return String(this.getText(this.selectedItem)).length;
        },
        filteredItems() {
            if (!this.isSearching || this.noFilter || this.internalSearch == null)
                return this.allItems;
            return this.allItems.filter(item => {
                const value = getPropertyFromItem(item, this.itemText);
                const text = value != null ? String(value) : '';
                return this.filter(item, String(this.internalSearch), text);
            });
        },
        internalSearch: {
            get() {
                return this.lazySearch;
            },
            set(val) {
                // emit update event only when the new
                // search value is different from previous
                if (this.lazySearch !== val) {
                    this.lazySearch = val;
                    this.$emit('update:search-input', val);
                }
            },
        },
        isAnyValueAllowed() {
            return false;
        },
        isDirty() {
            return this.searchIsDirty || this.selectedItems.length > 0;
        },
        isSearching() {
            return (this.multiple &&
                this.searchIsDirty) || (this.searchIsDirty &&
                this.internalSearch !== this.getText(this.selectedItem));
        },
        menuCanShow() {
            if (!this.isFocused)
                return false;
            return this.hasDisplayedItems || !this.hideNoData;
        },
        $_menuProps() {
            const props = VSelect.options.computed.$_menuProps.call(this);
            props.contentClass = `v-autocomplete__content ${props.contentClass || ''}`.trim();
            return {
                ...defaultMenuProps,
                ...props,
            };
        },
        searchIsDirty() {
            return this.internalSearch != null &&
                this.internalSearch !== '';
        },
        selectedItem() {
            if (this.multiple)
                return null;
            return this.selectedItems.find(i => {
                return this.valueComparator(this.getValue(i), this.getValue(this.internalValue));
            });
        },
        listData() {
            const data = VSelect.options.computed.listData.call(this);
            data.props = {
                ...data.props,
                items: this.virtualizedItems,
                noFilter: (this.noFilter ||
                    !this.isSearching ||
                    !this.filteredItems.length),
                searchInput: this.internalSearch,
            };
            return data;
        },
    },
    watch: {
        filteredItems: 'onFilteredItemsChanged',
        internalValue: 'setSearch',
        isFocused(val) {
            if (val) {
                document.addEventListener('copy', this.onCopy);
                this.$refs.input && this.$refs.input.select();
            }
            else {
                document.removeEventListener('copy', this.onCopy);
                this.blur();
                this.updateSelf();
            }
        },
        isMenuActive(val) {
            if (val || !this.hasSlot)
                return;
            this.lazySearch = null;
        },
        items(val, oldVal) {
            // If we are focused, the menu
            // is not active, hide no data is enabled,
            // and items change
            // User is probably async loading
            // items, try to activate the menu
            if (!(oldVal && oldVal.length) &&
                this.hideNoData &&
                this.isFocused &&
                !this.isMenuActive &&
                val.length)
                this.activateMenu();
        },
        searchInput(val) {
            this.lazySearch = val;
        },
        internalSearch: 'onInternalSearchChanged',
        itemText: 'updateSelf',
    },
    created() {
        this.setSearch();
    },
    destroyed() {
        document.removeEventListener('copy', this.onCopy);
    },
    methods: {
        onFilteredItemsChanged(val, oldVal) {
            // TODO: How is the watcher triggered
            // for duplicate items? no idea
            if (val === oldVal)
                return;
            if (!this.autoSelectFirst) {
                const preSelectedItem = oldVal[this.$refs.menu.listIndex];
                if (preSelectedItem) {
                    this.setMenuIndex(val.findIndex(i => i === preSelectedItem));
                }
                else {
                    this.setMenuIndex(-1);
                }
                this.$emit('update:list-index', this.$refs.menu.listIndex);
            }
            this.$nextTick(() => {
                if (!this.internalSearch ||
                    (val.length !== 1 &&
                        !this.autoSelectFirst))
                    return;
                this.$refs.menu.getTiles();
                if (this.autoSelectFirst && val.length) {
                    this.setMenuIndex(0);
                    this.$emit('update:list-index', this.$refs.menu.listIndex);
                }
            });
        },
        onInternalSearchChanged() {
            this.updateMenuDimensions();
        },
        updateMenuDimensions() {
            // Type from menuable is not making it through
            this.isMenuActive && this.$refs.menu && this.$refs.menu.updateDimensions();
        },
        changeSelectedIndex(keyCode) {
            // Do not allow changing of selectedIndex
            // when search is dirty
            if (this.searchIsDirty)
                return;
            if (this.multiple && keyCode === keyCodes.left) {
                if (this.selectedIndex === -1) {
                    this.selectedIndex = this.selectedItems.length - 1;
                }
                else {
                    this.selectedIndex--;
                }
            }
            else if (this.multiple && keyCode === keyCodes.right) {
                if (this.selectedIndex >= this.selectedItems.length - 1) {
                    this.selectedIndex = -1;
                }
                else {
                    this.selectedIndex++;
                }
            }
            else if (keyCode === keyCodes.backspace || keyCode === keyCodes.delete) {
                this.deleteCurrentItem();
            }
        },
        deleteCurrentItem() {
            const curIndex = this.selectedIndex;
            const curItem = this.selectedItems[curIndex];
            // Do nothing if input or item is disabled
            if (!this.isInteractive ||
                this.getDisabled(curItem))
                return;
            const lastIndex = this.selectedItems.length - 1;
            // Select the last item if
            // there is no selection
            if (this.selectedIndex === -1 &&
                lastIndex !== 0) {
                this.selectedIndex = lastIndex;
                return;
            }
            const length = this.selectedItems.length;
            const nextIndex = curIndex !== length - 1
                ? curIndex
                : curIndex - 1;
            const nextItem = this.selectedItems[nextIndex];
            if (!nextItem) {
                this.setValue(this.multiple ? [] : null);
            }
            else {
                this.selectItem(curItem);
            }
            this.selectedIndex = nextIndex;
        },
        clearableCallback() {
            this.internalSearch = null;
            VSelect.options.methods.clearableCallback.call(this);
        },
        genInput() {
            const input = VTextField.options.methods.genInput.call(this);
            input.data = mergeData(input.data, {
                attrs: {
                    'aria-activedescendant': getObjectValueByPath(this.$refs.menu, 'activeTile.id'),
                    autocomplete: getObjectValueByPath(input.data, 'attrs.autocomplete', 'off'),
                },
                domProps: { value: this.internalSearch },
            });
            return input;
        },
        genInputSlot() {
            const slot = VSelect.options.methods.genInputSlot.call(this);
            slot.data.attrs.role = 'combobox';
            return slot;
        },
        genSelections() {
            return this.hasSlot || this.multiple
                ? VSelect.options.methods.genSelections.call(this)
                : [];
        },
        onClick(e) {
            if (!this.isInteractive)
                return;
            this.selectedIndex > -1
                ? (this.selectedIndex = -1)
                : this.onFocus();
            if (!this.isAppendInner(e.target))
                this.activateMenu();
        },
        onInput(e) {
            if (this.selectedIndex > -1 ||
                !e.target)
                return;
            const target = e.target;
            const value = target.value;
            // If typing and menu is not currently active
            if (target.value)
                this.activateMenu();
            if (!this.multiple && value === '')
                this.deleteCurrentItem();
            this.internalSearch = value;
            this.badInput = target.validity && target.validity.badInput;
        },
        onKeyDown(e) {
            const keyCode = e.keyCode;
            if (e.ctrlKey ||
                ![keyCodes.home, keyCodes.end].includes(keyCode)) {
                VSelect.options.methods.onKeyDown.call(this, e);
            }
            // The ordering is important here
            // allows new value to be updated
            // and then moves the index to the
            // proper location
            this.changeSelectedIndex(keyCode);
        },
        onSpaceDown(e) { },
        onTabDown(e) {
            VSelect.options.methods.onTabDown.call(this, e);
            this.updateSelf();
        },
        onUpDown(e) {
            // Prevent screen from scrolling
            e.preventDefault();
            // For autocomplete / combobox, cycling
            // interfers with native up/down behavior
            // instead activate the menu
            this.activateMenu();
        },
        selectItem(item) {
            VSelect.options.methods.selectItem.call(this, item);
            this.setSearch();
        },
        setSelectedItems() {
            VSelect.options.methods.setSelectedItems.call(this);
            // #4273 Don't replace if searching
            // #4403 Don't replace if focused
            if (!this.isFocused)
                this.setSearch();
        },
        setSearch() {
            // Wait for nextTick so selectedItem
            // has had time to update
            this.$nextTick(() => {
                if (!this.multiple ||
                    !this.internalSearch ||
                    !this.isMenuActive) {
                    this.internalSearch = (!this.selectedItems.length ||
                        this.multiple ||
                        this.hasSlot)
                        ? null
                        : this.getText(this.selectedItem);
                }
            });
        },
        updateSelf() {
            if (!this.searchIsDirty &&
                !this.internalValue)
                return;
            if (!this.multiple &&
                !this.valueComparator(this.internalSearch, this.getValue(this.internalValue))) {
                this.setSearch();
            }
        },
        hasItem(item) {
            return this.selectedValues.indexOf(this.getValue(item)) > -1;
        },
        onCopy(event) {
            if (this.selectedIndex === -1)
                return;
            const currentItem = this.selectedItems[this.selectedIndex];
            const currentItemText = this.getText(currentItem);
            event.clipboardData?.setData('text/plain', currentItemText);
            event.clipboardData?.setData('text/vnd.vuetify.autocomplete.item+plain', currentItemText);
            event.preventDefault();
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkF1dG9jb21wbGV0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZBdXRvY29tcGxldGUvVkF1dG9jb21wbGV0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxzQkFBc0IsQ0FBQTtBQUU3QixhQUFhO0FBQ2IsT0FBTyxPQUFPLEVBQUUsRUFBRSxnQkFBZ0IsSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQ2xGLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBRWpELFlBQVk7QUFDWixPQUFPLFNBQVMsTUFBTSxzQkFBc0IsQ0FBQTtBQUM1QyxPQUFPLEVBQ0wsb0JBQW9CLEVBQ3BCLG1CQUFtQixFQUNuQixRQUFRLEdBQ1QsTUFBTSxvQkFBb0IsQ0FBQTtBQU0zQixNQUFNLGdCQUFnQixHQUFHO0lBQ3ZCLEdBQUcsZ0JBQWdCO0lBQ25CLE9BQU8sRUFBRSxJQUFJO0lBQ2IsY0FBYyxFQUFFLElBQUk7SUFDcEIsVUFBVSxFQUFFLEtBQUs7Q0FDbEIsQ0FBQTtBQUVELG9CQUFvQjtBQUNwQixlQUFlLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDNUIsSUFBSSxFQUFFLGdCQUFnQjtJQUV0QixLQUFLLEVBQUU7UUFDTCxhQUFhLEVBQUU7WUFDYixJQUFJLEVBQUUsT0FBTztZQUNiLE9BQU8sRUFBRSxJQUFJO1NBQ2Q7UUFDRCxlQUFlLEVBQUU7WUFDZixJQUFJLEVBQUUsT0FBTztZQUNiLE9BQU8sRUFBRSxLQUFLO1NBQ2Y7UUFDRCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxDQUFDLElBQVMsRUFBRSxTQUFpQixFQUFFLFFBQWdCLEVBQUUsRUFBRTtnQkFDMUQsT0FBTyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMs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VTtZQUNSLElBQ0UsQ0FBQyxJQUFJLENBQUMsYUFBYTtnQkFDbkIsQ0FBQyxJQUFJLENBQUMsYUFBYTtnQkFDbkIsT0FBTTtZQUVSLElBQ0UsQ0FBQyxJQUFJLENBQUMsUUFBUTtnQkFDZCxDQUFDLElBQUksQ0FBQyxlQUFlLENBQ25CLElBQUksQ0FBQyxjQUFjLEVBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUNsQyxFQUNEO2dCQUNBLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTthQUNqQjtRQUNILENBQUM7UUFDRCxPQUFPLENBQUUsSUFBUztZQUNoQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUM5RCxDQUFDO1FBQ0QsTUFBTSxDQUFFLEtBQXFCO1lBQzNCLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLENBQUM7Z0JBQUUsT0FBTTtZQUVyQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtZQUMxRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQ2pELEtBQUssQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQTtZQUMzRCxLQUFLLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQywwQ0FBMEMsRUFBRSxlQUFlLENBQUMsQ0FBQTtZQUN6RixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUE7UUFDeEIsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVkF1dG9jb21wbGV0ZS5zYXNzJ1xuXG4vLyBFeHRlbnNpb25zXG5pbXBvcnQgVlNlbGVjdCwgeyBkZWZhdWx0TWVudVByb3BzIGFzIFZTZWxlY3RNZW51UHJvcHMgfSBmcm9tICcuLi9WU2VsZWN0L1ZTZWxlY3QnXG5pbXBvcnQgVlRleHRGaWVsZCBmcm9tICcuLi9WVGV4dEZpZWxkL1ZUZXh0RmllbGQnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1lcmdlRGF0YSBmcm9tICcuLi8uLi91dGlsL21lcmdlRGF0YSdcbmltcG9ydCB7XG4gIGdldE9iamVjdFZhbHVlQnlQYXRoLFxuICBnZXRQcm9wZXJ0eUZyb21JdGVtLFxuICBrZXlDb2Rlcyxcbn0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgUHJvcFR5cGUsIFZOb2RlIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgUHJvcFZhbGlkYXRvciB9IGZyb20gJ3Z1ZS90eXBlcy9vcHRpb25zJ1xuXG5jb25zdCBkZWZhdWx0TWVudVByb3BzID0ge1xuICAuLi5WU2VsZWN0TWVudVByb3BzLFxuICBvZmZzZXRZOiB0cnVlLFxuICBvZmZzZXRPdmVyZmxvdzogdHJ1ZSxcbiAgdHJhbnNpdGlvbjogZmFsc2UsXG59XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBWU2VsZWN0LmV4dGVuZCh7XG4gIG5hbWU6ICd2LWF1dG9jb21wbGV0ZScsXG5cbiAgcHJvcHM6IHtcbiAgICBhbGxvd092ZXJmbG93OiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGF1dG9TZWxlY3RGaXJzdDoge1xuICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgZmlsdGVyOiB7XG4gICAgICB0eXBlOiBGdW5jdGlvbixcbiAgICAgIGRlZmF1bHQ6IChpdGVtOiBhbnksIHF1ZXJ5VGV4dDogc3RyaW5nLCBpdGVtVGV4dDogc3RyaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVtVGV4dC50b0xvY2FsZUxvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnlUZXh0LnRvTG9jYWxlTG93ZXJDYXNlKCkpID4gLTFcbiAgICAgIH0sXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPChpdGVtOiBhbnksIHF1ZXJ5VGV4dDogc3RyaW5nLCBpdGVtVGV4dDogc3RyaW5nKSA9PiBib29sZWFuPixcbiAgICBoaWRlTm9EYXRhOiBCb29sZWFuLFxuICAgIG1lbnVQcm9wczoge1xuICAgICAgdHlwZTogVlNlbGVjdC5vcHRpb25zLnByb3BzLm1lbnVQcm9wcy50eXBlLFxuICAgICAgZGVmYXVsdDogKCkgPT4gZGVmYXVsdE1lbnVQcm9wcyxcbiAgICB9LFxuICAgIG5vRmlsdGVyOiBCb29sZWFuLFxuICAgIHNlYXJjaElucHV0OiB7XG4gICAgICB0eXBlOiBTdHJpbmcgYXMgUHJvcFR5cGU8c3RyaW5nIHwgbnVsbD4sXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGF6eVNlYXJjaDogdGhpcy5zZWFyY2hJbnB1dCxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uVlNlbGVjdC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtYXV0b2NvbXBsZXRlJzogdHJ1ZSxcbiAgICAgICAgJ3YtYXV0b2NvbXBsZXRlLS1pcy1zZWxlY3RpbmctaW5kZXgnOiB0aGlzLnNlbGVjdGVkSW5kZXggPiAtMSxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkSXRlbXMgKCk6IG9iamVjdFtdIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbHRlcmVkSXRlbXNcbiAgICB9LFxuICAgIHNlbGVjdGVkVmFsdWVzICgpOiBvYmplY3RbXSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEl0ZW1zLm1hcChpdGVtID0+IHRoaXMuZ2V0VmFsdWUoaXRlbSkpXG4gICAgfSxcbiAgICBoYXNEaXNwbGF5ZWRJdGVtcyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5oaWRlU2VsZWN0ZWRcbiAgICAgICAgPyB0aGlzLmZpbHRlcmVkSXRlbXMuc29tZShpdGVtID0+ICF0aGlzLmhhc0l0ZW0oaXRlbSkpXG4gICAgICAgIDogdGhpcy5maWx0ZXJlZEl0ZW1zLmxlbmd0aCA+IDBcbiAgICB9LFxuICAgIGN1cnJlbnRSYW5nZSAoKTogbnVtYmVyIHtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbSA9PSBudWxsKSByZXR1cm4gMFxuXG4gICAgICByZXR1cm4gU3RyaW5nKHRoaXMuZ2V0VGV4dCh0aGlzLnNlbGVjdGVkSXRlbSkpLmxlbmd0aFxuICAgIH0sXG4gICAgZmlsdGVyZWRJdGVtcyAoKTogb2JqZWN0W10ge1xuICAgICAgaWYgKCF0aGlzLmlzU2VhcmNoaW5nIHx8IHRoaXMubm9GaWx0ZXIgfHwgdGhpcy5pbnRlcm5hbFNlYXJjaCA9PSBudWxsKSByZXR1cm4gdGhpcy5hbGxJdGVtc1xuXG4gICAgICByZXR1cm4gdGhpcy5hbGxJdGVtcy5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZ2V0UHJvcGVydHlGcm9tSXRlbShpdGVtLCB0aGlzLml0ZW1UZXh0KVxuICAgICAgICBjb25zdCB0ZXh0ID0gdmFsdWUgIT0gbnVsbCA/IFN0cmluZyh2YWx1ZSkgOiAnJ1xuXG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlcihpdGVtLCBTdHJpbmcodGhpcy5pbnRlcm5hbFNlYXJjaCksIHRleHQpXG4gICAgICB9KVxuICAgIH0sXG4gICAgaW50ZXJuYWxTZWFyY2g6IHtcbiAgICAgIGdldCAoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhenlTZWFyY2hcbiAgICAgIH0sXG4gICAgICBzZXQgKHZhbDogYW55KSB7IC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIGBzdHJpbmcgfCBudWxsYCBidXQgaXQgYnJlYWtzIGxvdHMgb2Ygb3RoZXIgdHlwZXNcbiAgICAgICAgLy8gZW1pdCB1cGRhdGUgZXZlbnQgb25seSB3aGVuIHRoZSBuZXdcbiAgICAgICAgLy8gc2VhcmNoIHZhbHVlIGlzIGRpZmZlcmVudCBmcm9tIHByZXZpb3VzXG4gICAgICAgIGlmICh0aGlzLmxhenlTZWFyY2ggIT09IHZhbCkge1xuICAgICAgICAgIHRoaXMubGF6eVNlYXJjaCA9IHZhbFxuICAgICAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTpzZWFyY2gtaW5wdXQnLCB2YWwpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgICBpc0FueVZhbHVlQWxsb3dlZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICAgIGlzRGlydHkgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoSXNEaXJ0eSB8fCB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoID4gMFxuICAgIH0sXG4gICAgaXNTZWFyY2hpbmcgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5tdWx0aXBsZSAmJlxuICAgICAgICB0aGlzLnNlYXJjaElzRGlydHlcbiAgICAgICkgfHwgKFxuICAgICAgICB0aGlzLnNlYXJjaElzRGlydHkgJiZcbiAgICAgICAgdGhpcy5pbnRlcm5hbFNlYXJjaCAhPT0gdGhpcy5nZXRUZXh0KHRoaXMuc2VsZWN0ZWRJdGVtKVxuICAgICAgKVxuICAgIH0sXG4gICAgbWVudUNhblNob3cgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKCF0aGlzLmlzRm9jdXNlZCkgcmV0dXJuIGZhbHNlXG5cbiAgICAgIHJldHVybiB0aGlzLmhhc0Rpc3BsYXllZEl0ZW1zIHx8ICF0aGlzLmhpZGVOb0RhdGFcbiAgICB9LFxuICAgICRfbWVudVByb3BzICgpOiBvYmplY3Qge1xuICAgICAgY29uc3QgcHJvcHMgPSBWU2VsZWN0Lm9wdGlvbnMuY29tcHV0ZWQuJF9tZW51UHJvcHMuY2FsbCh0aGlzKTtcbiAgICAgIChwcm9wcyBhcyBhbnkpLmNvbnRlbnRDbGFzcyA9IGB2LWF1dG9jb21wbGV0ZV9fY29udGVudCAkeyhwcm9wcyBhcyBhbnkpLmNvbnRlbnRDbGFzcyB8fCAnJ31gLnRyaW0oKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZGVmYXVsdE1lbnVQcm9wcyxcbiAgICAgICAgLi4ucHJvcHMsXG4gICAgICB9XG4gICAgfSxcbiAgICBzZWFyY2hJc0RpcnR5ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVybmFsU2VhcmNoICE9IG51bGwgJiZcbiAgICAgICAgdGhpcy5pbnRlcm5hbFNlYXJjaCAhPT0gJydcbiAgICB9LFxuICAgIHNlbGVjdGVkSXRlbSAoKTogYW55IHtcbiAgICAgIGlmICh0aGlzLm11bHRpcGxlKSByZXR1cm4gbnVsbFxuXG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEl0ZW1zLmZpbmQoaSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlQ29tcGFyYXRvcih0aGlzLmdldFZhbHVlKGkpLCB0aGlzLmdldFZhbHVlKHRoaXMuaW50ZXJuYWxWYWx1ZSkpXG4gICAgICB9KVxuICAgIH0sXG4gICAgbGlzdERhdGEgKCkge1xuICAgICAgY29uc3QgZGF0YSA9IFZTZWxlY3Qub3B0aW9ucy5jb21wdXRlZC5saXN0RGF0YS5jYWxsKHRoaXMpIGFzIGFueVxuXG4gICAgICBkYXRhLnByb3BzID0ge1xuICAgICAgICAuLi5kYXRhLnByb3BzLFxuICAgICAgICBpdGVtczogdGhpcy52aXJ0dWFsaXplZEl0ZW1zLFxuICAgICAgICBub0ZpbHRlcjogKFxuICAgICAgICAgIHRoaXMubm9GaWx0ZXIgfHxcbiAgICAgICAgICAhdGhpcy5pc1NlYXJjaGluZyB8fFxuICAgICAgICAgICF0aGlzLmZpbHRlcmVkSXRlbXMubGVuZ3RoXG4gICAgICAgICksXG4gICAgICAgIHNlYXJjaElucHV0OiB0aGlzLmludGVybmFsU2VhcmNoLFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGF0YVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBmaWx0ZXJlZEl0ZW1zOiAnb25GaWx0ZXJlZEl0ZW1zQ2hhbmdlZCcsXG4gICAgaW50ZXJuYWxWYWx1ZTogJ3NldFNlYXJjaCcsXG4gICAgaXNGb2N1c2VkICh2YWwpIHtcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29weScsIHRoaXMub25Db3B5KVxuICAgICAgICB0aGlzLiRyZWZzLmlucHV0ICYmIHRoaXMuJHJlZnMuaW5wdXQuc2VsZWN0KClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvcHknLCB0aGlzLm9uQ29weSlcbiAgICAgICAgdGhpcy5ibHVyKClcbiAgICAgICAgdGhpcy51cGRhdGVTZWxmKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGlzTWVudUFjdGl2ZSAodmFsKSB7XG4gICAgICBpZiAodmFsIHx8ICF0aGlzLmhhc1Nsb3QpIHJldHVyblxuXG4gICAgICB0aGlzLmxhenlTZWFyY2ggPSBudWxsXG4gICAgfSxcbiAgICBpdGVtcyAodmFsLCBvbGRWYWwpIHtcbiAgICAgIC8vIElmIHdlIGFyZSBmb2N1c2VkLCB0aGUgbWVudVxuICAgICAgLy8gaXMgbm90IGFjdGl2ZSwgaGlkZSBubyBkYXRhIGlzIGVuYWJsZWQsXG4gICAgICAvLyBhbmQgaXRlbXMgY2hhbmdlXG4gICAgICAvLyBVc2VyIGlzIHByb2JhYmx5IGFzeW5jIGxvYWRpbmdcbiAgICAgIC8vIGl0ZW1zLCB0cnkgdG8gYWN0aXZhdGUgdGhlIG1lbnVcbiAgICAgIGlmIChcbiAgICAgICAgIShvbGRWYWwgJiYgb2xkVmFsLmxlbmd0aCkgJiZcbiAgICAgICAgdGhpcy5oaWRlTm9EYXRhICYmXG4gICAgICAgIHRoaXMuaXNGb2N1c2VkICYmXG4gICAgICAgICF0aGlzLmlzTWVudUFjdGl2ZSAmJlxuICAgICAgICB2YWwubGVuZ3RoXG4gICAgICApIHRoaXMuYWN0aXZhdGVNZW51KClcbiAgICB9LFxuICAgIHNlYXJjaElucHV0ICh2YWw6IHN0cmluZykge1xuICAgICAgdGhpcy5sYXp5U2VhcmNoID0gdmFsXG4gICAgfSxcbiAgICBpbnRlcm5hbFNlYXJjaDogJ29uSW50ZXJuYWxTZWFyY2hDaGFuZ2VkJyxcbiAgICBpdGVtVGV4dDogJ3VwZGF0ZVNlbGYnLFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIHRoaXMuc2V0U2VhcmNoKClcbiAgfSxcblxuICBkZXN0cm95ZWQgKCkge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvcHknLCB0aGlzLm9uQ29weSlcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgb25GaWx0ZXJlZEl0ZW1zQ2hhbmdlZCAodmFsOiBuZXZlcltdLCBvbGRWYWw6IG5ldmVyW10pIHtcbiAgICAgIC8vIFRPRE86IEhvdyBpcyB0aGUgd2F0Y2hlciB0cmlnZ2VyZWRcbiAgICAgIC8vIGZvciBkdXBsaWNhdGUgaXRlbXM/IG5vIGlkZWFcbiAgICAgIGlmICh2YWwgPT09IG9sZFZhbCkgcmV0dXJuXG5cbiAgICAgIGlmICghdGhpcy5hdXRvU2VsZWN0Rmlyc3QpIHtcbiAgICAgICAgY29uc3QgcHJlU2VsZWN0ZWRJdGVtID0gb2xkVmFsW3RoaXMuJHJlZnMubWVudS5saXN0SW5kZXhdXG5cbiAgICAgICAgaWYgKHByZVNlbGVjdGVkSXRlbSkge1xuICAgICAgICAgIHRoaXMuc2V0TWVudUluZGV4KHZhbC5maW5kSW5kZXgoaSA9PiBpID09PSBwcmVTZWxlY3RlZEl0ZW0pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0TWVudUluZGV4KC0xKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTpsaXN0LWluZGV4JywgdGhpcy4kcmVmcy5tZW51Lmxpc3RJbmRleClcbiAgICAgIH1cblxuICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIXRoaXMuaW50ZXJuYWxTZWFyY2ggfHxcbiAgICAgICAgICAodmFsLmxlbmd0aCAhPT0gMSAmJlxuICAgICAgICAgICAgIXRoaXMuYXV0b1NlbGVjdEZpcnN0KVxuICAgICAgICApIHJldHVyblxuXG4gICAgICAgIHRoaXMuJHJlZnMubWVudS5nZXRUaWxlcygpXG5cbiAgICAgICAgaWYgKHRoaXMuYXV0b1NlbGVjdEZpcnN0ICYmIHZhbC5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLnNldE1lbnVJbmRleCgwKVxuICAgICAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTpsaXN0LWluZGV4JywgdGhpcy4kcmVmcy5tZW51Lmxpc3RJbmRleClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICAgIG9uSW50ZXJuYWxTZWFyY2hDaGFuZ2VkICgpIHtcbiAgICAgIHRoaXMudXBkYXRlTWVudURpbWVuc2lvbnMoKVxuICAgIH0sXG4gICAgdXBkYXRlTWVudURpbWVuc2lvbnMgKCkge1xuICAgICAgLy8gVHlwZSBmcm9tIG1lbnVhYmxlIGlzIG5vdCBtYWtpbmcgaXQgdGhyb3VnaFxuICAgICAgdGhpcy5pc01lbnVBY3RpdmUgJiYgdGhpcy4kcmVmcy5tZW51ICYmIHRoaXMuJHJlZnMubWVudS51cGRhdGVEaW1lbnNpb25zKClcbiAgICB9LFxuICAgIGNoYW5nZVNlbGVjdGVkSW5kZXggKGtleUNvZGU6IG51bWJlcikge1xuICAgICAgLy8gRG8gbm90IGFsbG93IGNoYW5naW5nIG9mIHNlbGVjdGVkSW5kZXhcbiAgICAgIC8vIHdoZW4gc2VhcmNoIGlzIGRpcnR5XG4gICAgICBpZiAodGhpcy5zZWFyY2hJc0RpcnR5KSByZXR1cm5cblxuICAgICAgaWYgKHRoaXMubXVsdGlwbGUgJiYga2V5Q29kZSA9PT0ga2V5Q29kZXMubGVmdCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGggLSAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4LS1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLm11bHRpcGxlICYmIGtleUNvZGUgPT09IGtleUNvZGVzLnJpZ2h0KSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSW5kZXggPj0gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSAtMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCsrXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA9PT0ga2V5Q29kZXMuYmFja3NwYWNlIHx8IGtleUNvZGUgPT09IGtleUNvZGVzLmRlbGV0ZSkge1xuICAgICAgICB0aGlzLmRlbGV0ZUN1cnJlbnRJdGVtKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlbGV0ZUN1cnJlbnRJdGVtICgpIHtcbiAgICAgIGNvbnN0IGN1ckluZGV4ID0gdGhpcy5zZWxlY3RlZEluZGV4XG4gICAgICBjb25zdCBjdXJJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW1zW2N1ckluZGV4XVxuXG4gICAgICAvLyBEbyBub3RoaW5nIGlmIGlucHV0IG9yIGl0ZW0gaXMgZGlzYWJsZWRcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuaXNJbnRlcmFjdGl2ZSB8fFxuICAgICAgICB0aGlzLmdldERpc2FibGVkKGN1ckl0ZW0pXG4gICAgICApIHJldHVyblxuXG4gICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoIC0gMVxuXG4gICAgICAvLyBTZWxlY3QgdGhlIGxhc3QgaXRlbSBpZlxuICAgICAgLy8gdGhlcmUgaXMgbm8gc2VsZWN0aW9uXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9PT0gLTEgJiZcbiAgICAgICAgbGFzdEluZGV4ICE9PSAwXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gbGFzdEluZGV4XG5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGhcbiAgICAgIGNvbnN0IG5leHRJbmRleCA9IGN1ckluZGV4ICE9PSBsZW5ndGggLSAxXG4gICAgICAgID8gY3VySW5kZXhcbiAgICAgICAgOiBjdXJJbmRleCAtIDFcbiAgICAgIGNvbnN0IG5leHRJdGVtID0gdGhpcy5zZWxlY3RlZEl0ZW1zW25leHRJbmRleF1cblxuICAgICAgaWYgKCFuZXh0SXRlbSkge1xuICAgICAgICB0aGlzLnNldFZhbHVlKHRoaXMubXVsdGlwbGUgPyBbXSA6IG51bGwpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNlbGVjdEl0ZW0oY3VySXRlbSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gbmV4dEluZGV4XG4gICAgfSxcbiAgICBjbGVhcmFibGVDYWxsYmFjayAoKSB7XG4gICAgICB0aGlzLmludGVybmFsU2VhcmNoID0gbnVsbFxuXG4gICAgICBWU2VsZWN0Lm9wdGlvbnMubWV0aG9kcy5jbGVhcmFibGVDYWxsYmFjay5jYWxsKHRoaXMpXG4gICAgfSxcbiAgICBnZW5JbnB1dCAoKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IFZUZXh0RmllbGQub3B0aW9ucy5tZXRob2RzLmdlbklucHV0LmNhbGwodGhpcylcblxuICAgICAgaW5wdXQuZGF0YSA9IG1lcmdlRGF0YShpbnB1dC5kYXRhISwge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgICdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnOiBnZXRPYmplY3RWYWx1ZUJ5UGF0aCh0aGlzLiRyZWZzLm1lbnUsICdhY3RpdmVUaWxlLmlkJyksXG4gICAgICAgICAgYXV0b2NvbXBsZXRlOiBnZXRPYmplY3RWYWx1ZUJ5UGF0aChpbnB1dC5kYXRhISwgJ2F0dHJzLmF1dG9jb21wbGV0ZScsICdvZmYnKSxcbiAgICAgICAgfSxcbiAgICAgICAgZG9tUHJvcHM6IHsgdmFsdWU6IHRoaXMuaW50ZXJuYWxTZWFyY2ggfSxcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBpbnB1dFxuICAgIH0sXG4gICAgZ2VuSW5wdXRTbG90ICgpIHtcbiAgICAgIGNvbnN0IHNsb3QgPSBWU2VsZWN0Lm9wdGlvbnMubWV0aG9kcy5nZW5JbnB1dFNsb3QuY2FsbCh0aGlzKVxuXG4gICAgICBzbG90LmRhdGEhLmF0dHJzIS5yb2xlID0gJ2NvbWJvYm94J1xuXG4gICAgICByZXR1cm4gc2xvdFxuICAgIH0sXG4gICAgZ2VuU2VsZWN0aW9ucyAoKTogVk5vZGUgfCBuZXZlcltdIHtcbiAgICAgIHJldHVybiB0aGlzLmhhc1Nsb3QgfHwgdGhpcy5tdWx0aXBsZVxuICAgICAgICA/IFZTZWxlY3Qub3B0aW9ucy5tZXRob2RzLmdlblNlbGVjdGlvbnMuY2FsbCh0aGlzKVxuICAgICAgICA6IFtdXG4gICAgfSxcbiAgICBvbkNsaWNrIChlOiBNb3VzZUV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNJbnRlcmFjdGl2ZSkgcmV0dXJuXG5cbiAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA+IC0xXG4gICAgICAgID8gKHRoaXMuc2VsZWN0ZWRJbmRleCA9IC0xKVxuICAgICAgICA6IHRoaXMub25Gb2N1cygpXG5cbiAgICAgIGlmICghdGhpcy5pc0FwcGVuZElubmVyKGUudGFyZ2V0KSkgdGhpcy5hY3RpdmF0ZU1lbnUoKVxuICAgIH0sXG4gICAgb25JbnB1dCAoZTogRXZlbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID4gLTEgfHxcbiAgICAgICAgIWUudGFyZ2V0XG4gICAgICApIHJldHVyblxuXG4gICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhcmdldC52YWx1ZVxuXG4gICAgICAvLyBJZiB0eXBpbmcgYW5kIG1lbnUgaXMgbm90IGN1cnJlbnRseSBhY3RpdmVcbiAgICAgIGlmICh0YXJnZXQudmFsdWUpIHRoaXMuYWN0aXZhdGVNZW51KClcblxuICAgICAgaWYgKCF0aGlzLm11bHRpcGxlICYmIHZhbHVlID09PSAnJykgdGhpcy5kZWxldGVDdXJyZW50SXRlbSgpXG5cbiAgICAgIHRoaXMuaW50ZXJuYWxTZWFyY2ggPSB2YWx1ZVxuICAgICAgdGhpcy5iYWRJbnB1dCA9IHRhcmdldC52YWxpZGl0eSAmJiB0YXJnZXQudmFsaWRpdHkuYmFkSW5wdXRcbiAgICB9LFxuICAgIG9uS2V5RG93biAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgY29uc3Qga2V5Q29kZSA9IGUua2V5Q29kZVxuXG4gICAgICBpZiAoXG4gICAgICAgIGUuY3RybEtleSB8fFxuICAgICAgICAhW2tleUNvZGVzLmhvbWUsIGtleUNvZGVzLmVuZF0uaW5jbHVkZXMoa2V5Q29kZSlcbiAgICAgICkge1xuICAgICAgICBWU2VsZWN0Lm9wdGlvbnMubWV0aG9kcy5vbktleURvd24uY2FsbCh0aGlzLCBlKVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgb3JkZXJpbmcgaXMgaW1wb3J0YW50IGhlcmVcbiAgICAgIC8vIGFsbG93cyBuZXcgdmFsdWUgdG8gYmUgdXBkYXRlZFxuICAgICAgLy8gYW5kIHRoZW4gbW92ZXMgdGhlIGluZGV4IHRvIHRoZVxuICAgICAgLy8gcHJvcGVyIGxvY2F0aW9uXG4gICAgICB0aGlzLmNoYW5nZVNlbGVjdGVkSW5kZXgoa2V5Q29kZSlcbiAgICB9LFxuICAgIG9uU3BhY2VEb3duIChlOiBLZXlib2FyZEV2ZW50KSB7IC8qIG5vb3AgKi8gfSxcbiAgICBvblRhYkRvd24gKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgIFZTZWxlY3Qub3B0aW9ucy5tZXRob2RzLm9uVGFiRG93bi5jYWxsKHRoaXMsIGUpXG4gICAgICB0aGlzLnVwZGF0ZVNlbGYoKVxuICAgIH0sXG4gICAgb25VcERvd24gKGU6IEV2ZW50KSB7XG4gICAgICAvLyBQcmV2ZW50IHNjcmVlbiBmcm9tIHNjcm9sbGluZ1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIC8vIEZvciBhdXRvY29tcGxldGUgLyBjb21ib2JveCwgY3ljbGluZ1xuICAgICAgLy8gaW50ZXJmZXJzIHdpdGggbmF0aXZlIHVwL2Rvd24gYmVoYXZpb3JcbiAgICAgIC8vIGluc3RlYWQgYWN0aXZhdGUgdGhlIG1lbnVcbiAgICAgIHRoaXMuYWN0aXZhdGVNZW51KClcbiAgICB9LFxuICAgIHNlbGVjdEl0ZW0gKGl0ZW06IG9iamVjdCkge1xuICAgICAgVlNlbGVjdC5vcHRpb25zLm1ldGhvZHMuc2VsZWN0SXRlbS5jYWxsKHRoaXMsIGl0ZW0pXG4gICAgICB0aGlzLnNldFNlYXJjaCgpXG4gICAgfSxcbiAgICBzZXRTZWxlY3RlZEl0ZW1zICgpIHtcbiAgICAgIFZTZWxlY3Qub3B0aW9ucy5tZXRob2RzLnNldFNlbGVjdGVkSXRlbXMuY2FsbCh0aGlzKVxuXG4gICAgICAvLyAjNDI3MyBEb24ndCByZXBsYWNlIGlmIHNlYXJjaGluZ1xuICAgICAgLy8gIzQ0MDMgRG9uJ3QgcmVwbGFjZSBpZiBmb2N1c2VkXG4gICAgICBpZiAoIXRoaXMuaXNGb2N1c2VkKSB0aGlzLnNldFNlYXJjaCgpXG4gICAgfSxcbiAgICBzZXRTZWFyY2ggKCkge1xuICAgICAgLy8gV2FpdCBmb3IgbmV4dFRpY2sgc28gc2VsZWN0ZWRJdGVtXG4gICAgICAvLyBoYXMgaGFkIHRpbWUgdG8gdXBkYXRlXG4gICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhdGhpcy5tdWx0aXBsZSB8fFxuICAgICAgICAgICF0aGlzLmludGVybmFsU2VhcmNoIHx8XG4gICAgICAgICAgIXRoaXMuaXNNZW51QWN0aXZlXG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMuaW50ZXJuYWxTZWFyY2ggPSAoXG4gICAgICAgICAgICAhdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCB8fFxuICAgICAgICAgICAgdGhpcy5tdWx0aXBsZSB8fFxuICAgICAgICAgICAgdGhpcy5oYXNTbG90XG4gICAgICAgICAgKVxuICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICA6IHRoaXMuZ2V0VGV4dCh0aGlzLnNlbGVjdGVkSXRlbSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICAgIHVwZGF0ZVNlbGYgKCkge1xuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5zZWFyY2hJc0RpcnR5ICYmXG4gICAgICAgICF0aGlzLmludGVybmFsVmFsdWVcbiAgICAgICkgcmV0dXJuXG5cbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMubXVsdGlwbGUgJiZcbiAgICAgICAgIXRoaXMudmFsdWVDb21wYXJhdG9yKFxuICAgICAgICAgIHRoaXMuaW50ZXJuYWxTZWFyY2gsXG4gICAgICAgICAgdGhpcy5nZXRWYWx1ZSh0aGlzLmludGVybmFsVmFsdWUpXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICB0aGlzLnNldFNlYXJjaCgpXG4gICAgICB9XG4gICAgfSxcbiAgICBoYXNJdGVtIChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkVmFsdWVzLmluZGV4T2YodGhpcy5nZXRWYWx1ZShpdGVtKSkgPiAtMVxuICAgIH0sXG4gICAgb25Db3B5IChldmVudDogQ2xpcGJvYXJkRXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkSW5kZXggPT09IC0xKSByZXR1cm5cblxuICAgICAgY29uc3QgY3VycmVudEl0ZW0gPSB0aGlzLnNlbGVjdGVkSXRlbXNbdGhpcy5zZWxlY3RlZEluZGV4XVxuICAgICAgY29uc3QgY3VycmVudEl0ZW1UZXh0ID0gdGhpcy5nZXRUZXh0KGN1cnJlbnRJdGVtKVxuICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YT8uc2V0RGF0YSgndGV4dC9wbGFpbicsIGN1cnJlbnRJdGVtVGV4dClcbiAgICAgIGV2ZW50LmNsaXBib2FyZERhdGE/LnNldERhdGEoJ3RleHQvdm5kLnZ1ZXRpZnkuYXV0b2NvbXBsZXRlLml0ZW0rcGxhaW4nLCBjdXJyZW50SXRlbVRleHQpXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfSxcbiAgfSxcbn0pXG4iXX0=
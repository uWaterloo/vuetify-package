// Styles
import '../VTextField/VTextField.sass';
import './VSelect.sass';
// Components
import VChip from '../VChip';
import VMenu from '../VMenu';
import VSelectList from './VSelectList';
// Extensions
import VInput from '../VInput';
import VTextField from '../VTextField/VTextField';
// Mixins
import Comparable from '../../mixins/comparable';
import Dependent from '../../mixins/dependent';
import Filterable from '../../mixins/filterable';
// Directives
import ClickOutside from '../../directives/click-outside';
// Utilities
import mergeData from '../../util/mergeData';
import { getPropertyFromItem, getObjectValueByPath, keyCodes } from '../../util/helpers';
import { consoleError } from '../../util/console';
// Types
import mixins from '../../util/mixins';
export const defaultMenuProps = {
    closeOnClick: false,
    closeOnContentClick: false,
    disableKeys: true,
    openOnClick: false,
    maxHeight: 304,
};
// Types
const baseMixins = mixins(VTextField, Comparable, Dependent, Filterable);
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'v-select',
    directives: {
        ClickOutside,
    },
    props: {
        appendIcon: {
            type: String,
            default: '$dropdown',
        },
        attach: {
            type: null,
            default: false,
        },
        cacheItems: Boolean,
        chips: Boolean,
        clearable: Boolean,
        deletableChips: Boolean,
        disableLookup: Boolean,
        eager: Boolean,
        hideSelected: Boolean,
        items: {
            type: Array,
            default: () => [],
        },
        itemColor: {
            type: String,
            default: 'primary',
        },
        itemDisabled: {
            type: [String, Array, Function],
            default: 'disabled',
        },
        itemText: {
            type: [String, Array, Function],
            default: 'text',
        },
        itemValue: {
            type: [String, Array, Function],
            default: 'value',
        },
        menuProps: {
            type: [String, Array, Object],
            default: () => defaultMenuProps,
        },
        multiple: Boolean,
        openOnClear: Boolean,
        returnObject: Boolean,
        smallChips: Boolean,
    },
    data() {
        return {
            cachedItems: this.cacheItems ? this.items : [],
            menuIsBooted: false,
            isMenuActive: false,
            lastItem: 20,
            // As long as a value is defined, show it
            // Otherwise, check if multiple
            // to determine which default to provide
            lazyValue: this.value !== undefined
                ? this.value
                : this.multiple ? [] : undefined,
            selectedIndex: -1,
            selectedItems: [],
            keyboardLookupPrefix: '',
            keyboardLookupLastTime: 0,
        };
    },
    computed: {
        /* All items that the select has */
        allItems() {
            return this.filterDuplicates(this.cachedItems.concat(this.items));
        },
        classes() {
            return {
                ...VTextField.options.computed.classes.call(this),
                'v-select': true,
                'v-select--chips': this.hasChips,
                'v-select--chips--small': this.smallChips,
                'v-select--is-menu-active': this.isMenuActive,
                'v-select--is-multi': this.multiple,
            };
        },
        /* Used by other components to overwrite */
        computedItems() {
            return this.allItems;
        },
        computedOwns() {
            return `list-${this._uid}`;
        },
        computedCounterValue() {
            const value = this.multiple
                ? this.selectedItems
                : (this.getText(this.selectedItems[0]) || '').toString();
            if (typeof this.counterValue === 'function') {
                return this.counterValue(value);
            }
            return value.length;
        },
        directives() {
            return this.isFocused ? [{
                    name: 'click-outside',
                    value: {
                        handler: this.blur,
                        closeConditional: this.closeConditional,
                        include: () => this.getOpenDependentElements(),
                    },
                }] : undefined;
        },
        dynamicHeight() {
            return 'auto';
        },
        hasChips() {
            return this.chips || this.smallChips;
        },
        hasSlot() {
            return Boolean(this.hasChips || this.$scopedSlots.selection);
        },
        isDirty() {
            return this.selectedItems.length > 0;
        },
        listData() {
            const scopeId = this.$vnode && this.$vnode.context.$options._scopeId;
            const attrs = scopeId ? {
                [scopeId]: true,
            } : {};
            return {
                attrs: {
                    ...attrs,
                    id: this.computedOwns,
                },
                props: {
                    action: this.multiple,
                    color: this.itemColor,
                    dense: this.dense,
                    hideSelected: this.hideSelected,
                    items: this.virtualizedItems,
                    itemDisabled: this.itemDisabled,
                    itemText: this.itemText,
                    itemValue: this.itemValue,
                    noDataText: this.$vuetify.lang.t(this.noDataText),
                    selectedItems: this.selectedItems,
                },
                on: {
                    select: this.selectItem,
                },
                scopedSlots: {
                    item: this.$scopedSlots.item,
                },
            };
        },
        staticList() {
            if (this.$slots['no-data'] || this.$slots['prepend-item'] || this.$slots['append-item']) {
                consoleError('assert: staticList should not be called if slots are used');
            }
            return this.$createElement(VSelectList, this.listData);
        },
        virtualizedItems() {
            return this.$_menuProps.auto
                ? this.computedItems
                : this.computedItems.slice(0, this.lastItem);
        },
        menuCanShow: () => true,
        $_menuProps() {
            let normalisedProps = typeof this.menuProps === 'string'
                ? this.menuProps.split(',')
                : this.menuProps;
            if (Array.isArray(normalisedProps)) {
                normalisedProps = normalisedProps.reduce((acc, p) => {
                    acc[p.trim()] = true;
                    return acc;
                }, {});
            }
            return {
                ...defaultMenuProps,
                eager: this.eager,
                value: this.menuCanShow && this.isMenuActive,
                nudgeBottom: normalisedProps.offsetY ? 1 : 0,
                ...normalisedProps,
            };
        },
    },
    watch: {
        internalValue(val) {
            this.initialValue = val;
            this.setSelectedItems();
            if (this.multiple) {
                this.$nextTick(() => {
                    this.$refs.menu?.updateDimensions();
                });
            }
        },
        isMenuActive(val) {
            window.setTimeout(() => this.onMenuActiveChange(val));
        },
        items: {
            immediate: true,
            handler(val) {
                if (this.cacheItems) {
                    // Breaks vue-test-utils if
                    // this isn't calculated
                    // on the next tick
                    this.$nextTick(() => {
                        this.cachedItems = this.filterDuplicates(this.cachedItems.concat(val));
                    });
                }
                this.setSelectedItems();
            },
        },
    },
    methods: {
        /** @public */
        blur(e) {
            VTextField.options.methods.blur.call(this, e);
            this.isMenuActive = false;
            this.isFocused = false;
            this.selectedIndex = -1;
            this.setMenuIndex(-1);
        },
        /** @public */
        activateMenu() {
            if (!this.isInteractive ||
                this.isMenuActive)
                return;
            this.isMenuActive = true;
        },
        clearableCallback() {
            this.setValue(this.multiple ? [] : null);
            this.setMenuIndex(-1);
            this.$nextTick(() => this.$refs.input && this.$refs.input.focus());
            if (this.openOnClear)
                this.isMenuActive = true;
        },
        closeConditional(e) {
            if (!this.isMenuActive)
                return true;
            return (!this._isDestroyed &&
                // Click originates from outside the menu content
                // Multiple selects don't close when an item is clicked
                (!this.getContent() ||
                    !this.getContent().contains(e.target)) &&
                // Click originates from outside the element
                this.$el &&
                !this.$el.contains(e.target) &&
                e.target !== this.$el);
        },
        filterDuplicates(arr) {
            const uniqueValues = new Map();
            for (let index = 0; index < arr.length; ++index) {
                const item = arr[index];
                // Do not return null values if existant (#14421)
                if (item == null) {
                    continue;
                }
                // Do not deduplicate headers or dividers (#12517)
                if (item.header || item.divider) {
                    uniqueValues.set(item, item);
                    continue;
                }
                const val = this.getValue(item);
                // TODO: comparator
                !uniqueValues.has(val) && uniqueValues.set(val, item);
            }
            return Array.from(uniqueValues.values());
        },
        findExistingIndex(item) {
            const itemValue = this.getValue(item);
            return (this.internalValue || []).findIndex((i) => this.valueComparator(this.getValue(i), itemValue));
        },
        getContent() {
            return this.$refs.menu && this.$refs.menu.$refs.content;
        },
        genChipSelection(item, index) {
            const isDisabled = (this.isDisabled ||
                this.getDisabled(item));
            const isInteractive = !isDisabled && this.isInteractive;
            return this.$createElement(VChip, {
                staticClass: 'v-chip--select',
                attrs: { tabindex: -1 },
                props: {
                    close: this.deletableChips && isInteractive,
                    disabled: isDisabled,
                    inputValue: index === this.selectedIndex,
                    small: this.smallChips,
                },
                on: {
                    click: (e) => {
                        if (!isInteractive)
                            return;
                        e.stopPropagation();
                        this.selectedIndex = index;
                    },
                    'click:close': () => this.onChipInput(item),
                },
                key: JSON.stringify(this.getValue(item)),
            }, this.getText(item));
        },
        genCommaSelection(item, index, last) {
            const color = index === this.selectedIndex && this.computedColor;
            const isDisabled = (this.isDisabled ||
                this.getDisabled(item));
            return this.$createElement('div', this.setTextColor(color, {
                staticClass: 'v-select__selection v-select__selection--comma',
                class: {
                    'v-select__selection--disabled': isDisabled,
                },
                key: JSON.stringify(this.getValue(item)),
            }), `${this.getText(item)}${last ? '' : ', '}`);
        },
        genDefaultSlot() {
            const selections = this.genSelections();
            const input = this.genInput();
            // If the return is an empty array
            // push the input
            if (Array.isArray(selections)) {
                selections.push(input);
                // Otherwise push it into children
            }
            else {
                selections.children = selections.children || [];
                selections.children.push(input);
            }
            return [
                this.genFieldset(),
                this.$createElement('div', {
                    staticClass: 'v-select__slot',
                    directives: this.directives,
                }, [
                    this.genLabel(),
                    this.prefix ? this.genAffix('prefix') : null,
                    selections,
                    this.suffix ? this.genAffix('suffix') : null,
                    this.genClearIcon(),
                    this.genIconSlot(),
                    this.genHiddenInput(),
                ]),
                this.genMenu(),
                this.genProgress(),
            ];
        },
        genIcon(type, cb, extraData) {
            const icon = VInput.options.methods.genIcon.call(this, type, cb, extraData);
            if (type === 'append') {
                // Don't allow the dropdown icon to be focused
                icon.children[0].data = mergeData(icon.children[0].data, {
                    attrs: {
                        tabindex: icon.children[0].componentOptions.listeners && '-1',
                        'aria-hidden': 'true',
                        'aria-label': undefined,
                    },
                });
            }
            return icon;
        },
        genInput() {
            const input = VTextField.options.methods.genInput.call(this);
            delete input.data.attrs.name;
            input.data = mergeData(input.data, {
                domProps: { value: null },
                attrs: {
                    readonly: true,
                    type: 'text',
                    'aria-readonly': String(this.isReadonly),
                    'aria-activedescendant': getObjectValueByPath(this.$refs.menu, 'activeTile.id'),
                    autocomplete: getObjectValueByPath(input.data, 'attrs.autocomplete', 'off'),
                    placeholder: (!this.isDirty && (this.persistentPlaceholder || this.isFocused || !this.hasLabel)) ? this.placeholder : undefined,
                },
                on: { keypress: this.onKeyPress },
            });
            return input;
        },
        genHiddenInput() {
            return this.$createElement('input', {
                domProps: { value: this.lazyValue },
                attrs: {
                    type: 'hidden',
                    name: this.attrs$.name,
                },
            });
        },
        genInputSlot() {
            const render = VTextField.options.methods.genInputSlot.call(this);
            render.data.attrs = {
                ...render.data.attrs,
                role: 'button',
                'aria-haspopup': 'listbox',
                'aria-expanded': String(this.isMenuActive),
                'aria-owns': this.computedOwns,
            };
            return render;
        },
        genList() {
            // If there's no slots, we can use a cached VNode to improve performance
            if (this.$slots['no-data'] || this.$slots['prepend-item'] || this.$slots['append-item']) {
                return this.genListWithSlot();
            }
            else {
                return this.staticList;
            }
        },
        genListWithSlot() {
            const slots = ['prepend-item', 'no-data', 'append-item']
                .filter(slotName => this.$slots[slotName])
                .map(slotName => this.$createElement('template', {
                slot: slotName,
            }, this.$slots[slotName]));
            // Requires destructuring due to Vue
            // modifying the `on` property when passed
            // as a referenced object
            return this.$createElement(VSelectList, {
                ...this.listData,
            }, slots);
        },
        genMenu() {
            const props = this.$_menuProps;
            props.activator = this.$refs['input-slot'];
            // Attach to root el so that
            // menu covers prepend/append icons
            if (
            // TODO: make this a computed property or helper or something
            this.attach === '' || // If used as a boolean prop (<v-menu attach>)
                this.attach === true || // If bound to a boolean (<v-menu :attach="true">)
                this.attach === 'attach' // If bound as boolean prop in pug (v-menu(attach))
            ) {
                props.attach = this.$el;
            }
            else {
                props.attach = this.attach;
            }
            return this.$createElement(VMenu, {
                attrs: { role: undefined },
                props,
                on: {
                    input: (val) => {
                        this.isMenuActive = val;
                        this.isFocused = val;
                    },
                    scroll: this.onScroll,
                },
                ref: 'menu',
            }, [this.genList()]);
        },
        genSelections() {
            let length = this.selectedItems.length;
            const children = new Array(length);
            let genSelection;
            if (this.$scopedSlots.selection) {
                genSelection = this.genSlotSelection;
            }
            else if (this.hasChips) {
                genSelection = this.genChipSelection;
            }
            else {
                genSelection = this.genCommaSelection;
            }
            while (length--) {
                children[length] = genSelection(this.selectedItems[length], length, length === children.length - 1);
            }
            return this.$createElement('div', {
                staticClass: 'v-select__selections',
            }, children);
        },
        genSlotSelection(item, index) {
            return this.$scopedSlots.selection({
                attrs: {
                    class: 'v-chip--select',
                },
                parent: this,
                item,
                index,
                select: (e) => {
                    e.stopPropagation();
                    this.selectedIndex = index;
                },
                selected: index === this.selectedIndex,
                disabled: !this.isInteractive,
            });
        },
        getMenuIndex() {
            return this.$refs.menu ? this.$refs.menu.listIndex : -1;
        },
        getDisabled(item) {
            return getPropertyFromItem(item, this.itemDisabled, false);
        },
        getText(item) {
            return getPropertyFromItem(item, this.itemText, item);
        },
        getValue(item) {
            return getPropertyFromItem(item, this.itemValue, this.getText(item));
        },
        onBlur(e) {
            e && this.$emit('blur', e);
        },
        onChipInput(item) {
            if (this.multiple)
                this.selectItem(item);
            else
                this.setValue(null);
            // If all items have been deleted,
            // open `v-menu`
            if (this.selectedItems.length === 0) {
                this.isMenuActive = true;
            }
            else {
                this.isMenuActive = false;
            }
            this.selectedIndex = -1;
        },
        onClick(e) {
            if (!this.isInteractive)
                return;
            if (!this.isAppendInner(e.target)) {
                this.isMenuActive = true;
            }
            if (!this.isFocused) {
                this.isFocused = true;
                this.$emit('focus');
            }
            this.$emit('click', e);
        },
        onEscDown(e) {
            e.preventDefault();
            if (this.isMenuActive) {
                e.stopPropagation();
                this.isMenuActive = false;
            }
        },
        onKeyPress(e) {
            if (this.multiple ||
                !this.isInteractive ||
                this.disableLookup)
                return;
            const KEYBOARD_LOOKUP_THRESHOLD = 1000; // milliseconds
            const now = performance.now();
            if (now - this.keyboardLookupLastTime > KEYBOARD_LOOKUP_THRESHOLD) {
                this.keyboardLookupPrefix = '';
            }
            this.keyboardLookupPrefix += e.key.toLowerCase();
            this.keyboardLookupLastTime = now;
            const index = this.allItems.findIndex(item => {
                const text = (this.getText(item) || '').toString();
                return text.toLowerCase().startsWith(this.keyboardLookupPrefix);
            });
            const item = this.allItems[index];
            if (index !== -1) {
                this.lastItem = Math.max(this.lastItem, index + 5);
                this.setValue(this.returnObject ? item : this.getValue(item));
                this.$nextTick(() => this.$refs.menu.getTiles());
                setTimeout(() => this.setMenuIndex(index));
            }
        },
        onKeyDown(e) {
            if (this.isReadonly && e.keyCode !== keyCodes.tab)
                return;
            const keyCode = e.keyCode;
            const menu = this.$refs.menu;
            this.$emit('keydown', e);
            if (!menu)
                return;
            // If menu is active, allow default
            // listIndex change from menu
            if (this.isMenuActive && [keyCodes.up, keyCodes.down, keyCodes.home, keyCodes.end, keyCodes.enter].includes(keyCode)) {
                this.$nextTick(() => {
                    menu.changeListIndex(e);
                    this.$emit('update:list-index', menu.listIndex);
                });
            }
            // If enter, space, open menu
            if ([
                keyCodes.enter,
                keyCodes.space,
            ].includes(keyCode))
                this.activateMenu();
            // If menu is not active, up/down/home/end can do
            // one of 2 things. If multiple, opens the
            // menu, if not, will cycle through all
            // available options
            if (!this.isMenuActive &&
                [keyCodes.up, keyCodes.down, keyCodes.home, keyCodes.end].includes(keyCode))
                return this.onUpDown(e);
            // If escape deactivate the menu
            if (keyCode === keyCodes.esc)
                return this.onEscDown(e);
            // If tab - select item or close menu
            if (keyCode === keyCodes.tab)
                return this.onTabDown(e);
            // If space preventDefault
            if (keyCode === keyCodes.space)
                return this.onSpaceDown(e);
        },
        onMenuActiveChange(val) {
            // If menu is closing and mulitple
            // or menuIndex is already set
            // skip menu index recalculation
            if ((this.multiple && !val) ||
                this.getMenuIndex() > -1)
                return;
            const menu = this.$refs.menu;
            if (!menu || !this.isDirty)
                return;
            // When menu opens, set index of first active item
            this.$refs.menu.getTiles();
            for (let i = 0; i < menu.tiles.length; i++) {
                if (menu.tiles[i].getAttribute('aria-selected') === 'true') {
                    this.setMenuIndex(i);
                    break;
                }
            }
        },
        onMouseUp(e) {
            // eslint-disable-next-line sonarjs/no-collapsible-if
            if (this.hasMouseDown &&
                e.which !== 3 &&
                this.isInteractive) {
                // If append inner is present
                // and the target is itself
                // or inside, toggle menu
                if (this.isAppendInner(e.target)) {
                    this.$nextTick(() => (this.isMenuActive = !this.isMenuActive));
                }
            }
            VTextField.options.methods.onMouseUp.call(this, e);
        },
        onScroll() {
            if (!this.isMenuActive) {
                requestAnimationFrame(() => (this.getContent().scrollTop = 0));
            }
            else {
                if (this.lastItem > this.computedItems.length)
                    return;
                const showMoreItems = (this.getContent().scrollHeight -
                    (this.getContent().scrollTop +
                        this.getContent().clientHeight)) < 200;
                if (showMoreItems) {
                    this.lastItem += 20;
                }
            }
        },
        onSpaceDown(e) {
            e.preventDefault();
        },
        onTabDown(e) {
            const menu = this.$refs.menu;
            if (!menu)
                return;
            const activeTile = menu.activeTile;
            // An item that is selected by
            // menu-index should toggled
            if (!this.multiple &&
                activeTile &&
                this.isMenuActive) {
                e.preventDefault();
                e.stopPropagation();
                activeTile.click();
            }
            else {
                // If we make it here,
                // the user has no selected indexes
                // and is probably tabbing out
                this.blur(e);
            }
        },
        onUpDown(e) {
            const menu = this.$refs.menu;
            if (!menu)
                return;
            e.preventDefault();
            // Multiple selects do not cycle their value
            // when pressing up or down, instead activate
            // the menu
            if (this.multiple)
                return this.activateMenu();
            const keyCode = e.keyCode;
            // Cycle through available values to achieve
            // select native behavior
            menu.isBooted = true;
            window.requestAnimationFrame(() => {
                menu.getTiles();
                if (!menu.hasClickableTiles)
                    return this.activateMenu();
                switch (keyCode) {
                    case keyCodes.up:
                        menu.prevTile();
                        break;
                    case keyCodes.down:
                        menu.nextTile();
                        break;
                    case keyCodes.home:
                        menu.firstTile();
                        break;
                    case keyCodes.end:
                        menu.lastTile();
                        break;
                }
                this.selectItem(this.allItems[this.getMenuIndex()]);
            });
        },
        selectItem(item) {
            if (!this.multiple) {
                this.setValue(this.returnObject ? item : this.getValue(item));
                this.isMenuActive = false;
            }
            else {
                const internalValue = (this.internalValue || []).slice();
                const i = this.findExistingIndex(item);
                i !== -1 ? internalValue.splice(i, 1) : internalValue.push(item);
                this.setValue(internalValue.map((i) => {
                    return this.returnObject ? i : this.getValue(i);
                }));
                // There is no item to re-highlight
                // when selections are hidden
                if (this.hideSelected) {
                    this.setMenuIndex(-1);
                }
                else {
                    const index = this.allItems.indexOf(item);
                    if (~index) {
                        this.$nextTick(() => this.$refs.menu.getTiles());
                        setTimeout(() => this.setMenuIndex(index));
                    }
                }
            }
        },
        setMenuIndex(index) {
            this.$refs.menu && (this.$refs.menu.listIndex = index);
        },
        setSelectedItems() {
            const selectedItems = [];
            const values = !this.multiple || !Array.isArray(this.internalValue)
                ? [this.internalValue]
                : this.internalValue;
            for (const value of values) {
                const index = this.allItems.findIndex(v => this.valueComparator(this.getValue(v), this.getValue(value)));
                if (index > -1) {
                    selectedItems.push(this.allItems[index]);
                }
            }
            this.selectedItems = selectedItems;
        },
        setValue(value) {
            if (!this.valueComparator(value, this.internalValue)) {
                this.internalValue = value;
                this.$emit('change', value);
            }
        },
        isAppendInner(target) {
            // return true if append inner is present
            // and the target is itself or inside
            const appendInner = this.$refs['append-inner'];
            return appendInner && (appendInner === target || appendInner.contains(target));
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNlbGVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZTZWxlY3QvVlNlbGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTywrQkFBK0IsQ0FBQTtBQUN0QyxPQUFPLGdCQUFnQixDQUFBO0FBRXZCLGFBQWE7QUFDYixPQUFPLEtBQUssTUFBTSxVQUFVLENBQUE7QUFDNUIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sV0FBVyxNQUFNLGVBQWUsQ0FBQTtBQUV2QyxhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFBO0FBQzlCLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBRWpELFNBQVM7QUFDVCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUVoRCxhQUFhO0FBQ2IsT0FBTyxZQUFZLE1BQU0sZ0NBQWdDLENBQUE7QUFFekQsWUFBWTtBQUNaLE9BQU8sU0FBUyxNQUFNLHNCQUFzQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUN4RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFakQsUUFBUTtBQUNSLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBS3RDLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHO0lBQzlCLFlBQVksRUFBRSxLQUFLO0lBQ25CLG1CQUFtQixFQUFFLEtBQUs7SUFDMUIsV0FBVyxFQUFFLElBQUk7SUFDakIsV0FBVyxFQUFFLEtBQUs7SUFDbEIsU0FBUyxFQUFFLEdBQUc7Q0FDZixDQUFBO0FBRUQsUUFBUTtBQUNSLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FDdkIs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QUcsQ0FBQyxDQUFDLEVBQUU7b0JBQ2QsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7aUJBQ3pDO2FBQ0Y7WUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtRQUNwQyxDQUFDO1FBQ0QsUUFBUSxDQUFFLEtBQVU7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUE7Z0JBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO2FBQzVCO1FBQ0gsQ0FBQztRQUNELGFBQWEsQ0FBRSxNQUFXO1lBQ3hCLHlDQUF5QztZQUN6QyxxQ0FBcUM7WUFDckMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQTtZQUU5QyxPQUFPLFdBQVcsSUFBSSxDQUFDLFdBQVcsS0FBSyxNQUFNLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1FBQ2hGLENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuLi9WVGV4dEZpZWxkL1ZUZXh0RmllbGQuc2FzcydcbmltcG9ydCAnLi9WU2VsZWN0LnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWQ2hpcCBmcm9tICcuLi9WQ2hpcCdcbmltcG9ydCBWTWVudSBmcm9tICcuLi9WTWVudSdcbmltcG9ydCBWU2VsZWN0TGlzdCBmcm9tICcuL1ZTZWxlY3RMaXN0J1xuXG4vLyBFeHRlbnNpb25zXG5pbXBvcnQgVklucHV0IGZyb20gJy4uL1ZJbnB1dCdcbmltcG9ydCBWVGV4dEZpZWxkIGZyb20gJy4uL1ZUZXh0RmllbGQvVlRleHRGaWVsZCdcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ29tcGFyYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29tcGFyYWJsZSdcbmltcG9ydCBEZXBlbmRlbnQgZnJvbSAnLi4vLi4vbWl4aW5zL2RlcGVuZGVudCdcbmltcG9ydCBGaWx0ZXJhYmxlIGZyb20gJy4uLy4uL21peGlucy9maWx0ZXJhYmxlJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgQ2xpY2tPdXRzaWRlIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvY2xpY2stb3V0c2lkZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWVyZ2VEYXRhIGZyb20gJy4uLy4uL3V0aWwvbWVyZ2VEYXRhJ1xuaW1wb3J0IHsgZ2V0UHJvcGVydHlGcm9tSXRlbSwgZ2V0T2JqZWN0VmFsdWVCeVBhdGgsIGtleUNvZGVzIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgY29uc29sZUVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURpcmVjdGl2ZSwgUHJvcFR5cGUsIFZOb2RlRGF0YSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IgfSBmcm9tICd2dWUvdHlwZXMvb3B0aW9ucydcbmltcG9ydCB7IFNlbGVjdEl0ZW1LZXkgfSBmcm9tICd2dWV0aWZ5L3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdE1lbnVQcm9wcyA9IHtcbiAgY2xvc2VPbkNsaWNrOiBmYWxzZSxcbiAgY2xvc2VPbkNvbnRlbnRDbGljazogZmFsc2UsXG4gIGRpc2FibGVLZXlzOiB0cnVlLFxuICBvcGVuT25DbGljazogZmFsc2UsXG4gIG1heEhlaWdodDogMzA0LFxufVxuXG4vLyBUeXBlc1xuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgVlRleHRGaWVsZCxcbiAgQ29tcGFyYWJsZSxcbiAgRGVwZW5kZW50LFxuICBGaWx0ZXJhYmxlXG4pXG5cbmludGVyZmFjZSBvcHRpb25zIGV4dGVuZHMgSW5zdGFuY2VUeXBlPHR5cGVvZiBiYXNlTWl4aW5zPiB7XG4gICRyZWZzOiB7XG4gICAgbWVudTogSW5zdGFuY2VUeXBlPHR5cGVvZiBWTWVudT5cbiAgICBjb250ZW50OiBIVE1MRWxlbWVudFxuICAgIGxhYmVsOiBIVE1MRWxlbWVudFxuICAgIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50XG4gICAgJ3ByZXBlbmQtaW5uZXInOiBIVE1MRWxlbWVudFxuICAgICdhcHBlbmQtaW5uZXInOiBIVE1MRWxlbWVudFxuICAgIHByZWZpeDogSFRNTEVsZW1lbnRcbiAgICBzdWZmaXg6IEhUTUxFbGVtZW50XG4gIH1cbn1cblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IGJhc2VNaXhpbnMuZXh0ZW5kPG9wdGlvbnM+KCkuZXh0ZW5kKHtcbiAgbmFtZTogJ3Ytc2VsZWN0JyxcblxuICBkaXJlY3RpdmVzOiB7XG4gICAgQ2xpY2tPdXRzaWRlLFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgYXBwZW5kSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRkcm9wZG93bicsXG4gICAgfSxcbiAgICBhdHRhY2g6IHtcbiAgICAgIHR5cGU6IG51bGwgYXMgdW5rbm93biBhcyBQcm9wVHlwZTxzdHJpbmcgfCBib29sZWFuIHwgRWxlbWVudCB8IFZOb2RlPixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgY2FjaGVJdGVtczogQm9vbGVhbixcbiAgICBjaGlwczogQm9vbGVhbixcbiAgICBjbGVhcmFibGU6IEJvb2xlYW4sXG4gICAgZGVsZXRhYmxlQ2hpcHM6IEJvb2xlYW4sXG4gICAgZGlzYWJsZUxvb2t1cDogQm9vbGVhbixcbiAgICBlYWdlcjogQm9vbGVhbixcbiAgICBoaWRlU2VsZWN0ZWQ6IEJvb2xlYW4sXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgZGVmYXVsdDogKCkgPT4gW10sXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPGFueVtdPixcbiAgICBpdGVtQ29sb3I6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdwcmltYXJ5JyxcbiAgICB9LFxuICAgIGl0ZW1EaXNhYmxlZDoge1xuICAgICAgdHlwZTogW1N0cmluZywgQXJyYXksIEZ1bmN0aW9uXSBhcyBQcm9wVHlwZTxTZWxlY3RJdGVtS2V5PixcbiAgICAgIGRlZmF1bHQ6ICdkaXNhYmxlZCcsXG4gICAgfSxcbiAgICBpdGVtVGV4dDoge1xuICAgICAgdHlwZTogW1N0cmluZywgQXJyYXksIEZ1bmN0aW9uXSBhcyBQcm9wVHlwZTxTZWxlY3RJdGVtS2V5PixcbiAgICAgIGRlZmF1bHQ6ICd0ZXh0JyxcbiAgICB9LFxuICAgIGl0ZW1WYWx1ZToge1xuICAgICAgdHlwZTogW1N0cmluZywgQXJyYXksIEZ1bmN0aW9uXSBhcyBQcm9wVHlwZTxTZWxlY3RJdGVtS2V5PixcbiAgICAgIGRlZmF1bHQ6ICd2YWx1ZScsXG4gICAgfSxcbiAgICBtZW51UHJvcHM6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEFycmF5LCBPYmplY3RdLFxuICAgICAgZGVmYXVsdDogKCkgPT4gZGVmYXVsdE1lbnVQcm9wcyxcbiAgICB9LFxuICAgIG11bHRpcGxlOiBCb29sZWFuLFxuICAgIG9wZW5PbkNsZWFyOiBCb29sZWFuLFxuICAgIHJldHVybk9iamVjdDogQm9vbGVhbixcbiAgICBzbWFsbENoaXBzOiBCb29sZWFuLFxuICB9LFxuXG4gIGRhdGEgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjYWNoZWRJdGVtczogdGhpcy5jYWNoZUl0ZW1zID8gdGhpcy5pdGVtcyA6IFtdLFxuICAgICAgbWVudUlzQm9vdGVkOiBmYWxzZSxcbiAgICAgIGlzTWVudUFjdGl2ZTogZmFsc2UsXG4gICAgICBsYXN0SXRlbTogMjAsXG4gICAgICAvLyBBcyBsb25nIGFzIGEgdmFsdWUgaXMgZGVmaW5lZCwgc2hvdyBpdFxuICAgICAgLy8gT3RoZXJ3aXNlLCBjaGVjayBpZiBtdWx0aXBsZVxuICAgICAgLy8gdG8gZGV0ZXJtaW5lIHdoaWNoIGRlZmF1bHQgdG8gcHJvdmlkZVxuICAgICAgbGF6eVZhbHVlOiB0aGlzLnZhbHVlICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyB0aGlzLnZhbHVlXG4gICAgICAgIDogdGhpcy5tdWx0aXBsZSA/IFtdIDogdW5kZWZpbmVkLFxuICAgICAgc2VsZWN0ZWRJbmRleDogLTEsXG4gICAgICBzZWxlY3RlZEl0ZW1zOiBbXSBhcyBhbnlbXSxcbiAgICAgIGtleWJvYXJkTG9va3VwUHJlZml4OiAnJyxcbiAgICAgIGtleWJvYXJkTG9va3VwTGFzdFRpbWU6IDAsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgLyogQWxsIGl0ZW1zIHRoYXQgdGhlIHNlbGVjdCBoYXMgKi9cbiAgICBhbGxJdGVtcyAoKTogb2JqZWN0W10ge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyRHVwbGljYXRlcyh0aGlzLmNhY2hlZEl0ZW1zLmNvbmNhdCh0aGlzLml0ZW1zKSlcbiAgICB9LFxuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5WVGV4dEZpZWxkLm9wdGlvbnMuY29tcHV0ZWQuY2xhc3Nlcy5jYWxsKHRoaXMpLFxuICAgICAgICAndi1zZWxlY3QnOiB0cnVlLFxuICAgICAgICAndi1zZWxlY3QtLWNoaXBzJzogdGhpcy5oYXNDaGlwcyxcbiAgICAgICAgJ3Ytc2VsZWN0LS1jaGlwcy0tc21hbGwnOiB0aGlzLnNtYWxsQ2hpcHMsXG4gICAgICAgICd2LXNlbGVjdC0taXMtbWVudS1hY3RpdmUnOiB0aGlzLmlzTWVudUFjdGl2ZSxcbiAgICAgICAgJ3Ytc2VsZWN0LS1pcy1tdWx0aSc6IHRoaXMubXVsdGlwbGUsXG4gICAgICB9XG4gICAgfSxcbiAgICAvKiBVc2VkIGJ5IG90aGVyIGNvbXBvbmVudHMgdG8gb3ZlcndyaXRlICovXG4gICAgY29tcHV0ZWRJdGVtcyAoKTogb2JqZWN0W10ge1xuICAgICAgcmV0dXJuIHRoaXMuYWxsSXRlbXNcbiAgICB9LFxuICAgIGNvbXB1dGVkT3ducyAoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBgbGlzdC0ke3RoaXMuX3VpZH1gXG4gICAgfSxcbiAgICBjb21wdXRlZENvdW50ZXJWYWx1ZSAoKTogbnVtYmVyIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5tdWx0aXBsZVxuICAgICAgICA/IHRoaXMuc2VsZWN0ZWRJdGVtc1xuICAgICAgICA6ICh0aGlzLmdldFRleHQodGhpcy5zZWxlY3RlZEl0ZW1zWzBdKSB8fCAnJykudG9TdHJpbmcoKVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMuY291bnRlclZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50ZXJWYWx1ZSh2YWx1ZSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlLmxlbmd0aFxuICAgIH0sXG4gICAgZGlyZWN0aXZlcyAoKTogVk5vZGVEaXJlY3RpdmVbXSB8IHVuZGVmaW5lZCB7XG4gICAgICByZXR1cm4gdGhpcy5pc0ZvY3VzZWQgPyBbe1xuICAgICAgICBuYW1lOiAnY2xpY2stb3V0c2lkZScsXG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgaGFuZGxlcjogdGhpcy5ibHVyLFxuICAgICAgICAgIGNsb3NlQ29uZGl0aW9uYWw6IHRoaXMuY2xvc2VDb25kaXRpb25hbCxcbiAgICAgICAgICBpbmNsdWRlOiAoKSA9PiB0aGlzLmdldE9wZW5EZXBlbmRlbnRFbGVtZW50cygpLFxuICAgICAgICB9LFxuICAgICAgfV0gOiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGR5bmFtaWNIZWlnaHQgKCkge1xuICAgICAgcmV0dXJuICdhdXRvJ1xuICAgIH0sXG4gICAgaGFzQ2hpcHMgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuY2hpcHMgfHwgdGhpcy5zbWFsbENoaXBzXG4gICAgfSxcbiAgICBoYXNTbG90ICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBCb29sZWFuKHRoaXMuaGFzQ2hpcHMgfHwgdGhpcy4kc2NvcGVkU2xvdHMuc2VsZWN0aW9uKVxuICAgIH0sXG4gICAgaXNEaXJ0eSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA+IDBcbiAgICB9LFxuICAgIGxpc3REYXRhICgpOiBvYmplY3Qge1xuICAgICAgY29uc3Qgc2NvcGVJZCA9IHRoaXMuJHZub2RlICYmICh0aGlzLiR2bm9kZS5jb250ZXh0IS4kb3B0aW9ucyBhcyB7IFtrZXk6IHN0cmluZ106IGFueSB9KS5fc2NvcGVJZFxuICAgICAgY29uc3QgYXR0cnMgPSBzY29wZUlkID8ge1xuICAgICAgICBbc2NvcGVJZF06IHRydWUsXG4gICAgICB9IDoge31cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAuLi5hdHRycyxcbiAgICAgICAgICBpZDogdGhpcy5jb21wdXRlZE93bnMsXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgYWN0aW9uOiB0aGlzLm11bHRpcGxlLFxuICAgICAgICAgIGNvbG9yOiB0aGlzLml0ZW1Db2xvcixcbiAgICAgICAgICBkZW5zZTogdGhpcy5kZW5zZSxcbiAgICAgICAgICBoaWRlU2VsZWN0ZWQ6IHRoaXMuaGlkZVNlbGVjdGVkLFxuICAgICAgICAgIGl0ZW1zOiB0aGlzLnZpcnR1YWxpemVkSXRlbXMsXG4gICAgICAgICAgaXRlbURpc2FibGVkOiB0aGlzLml0ZW1EaXNhYmxlZCxcbiAgICAgICAgICBpdGVtVGV4dDogdGhpcy5pdGVtVGV4dCxcbiAgICAgICAgICBpdGVtVmFsdWU6IHRoaXMuaXRlbVZhbHVlLFxuICAgICAgICAgIG5vRGF0YVRleHQ6IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMubm9EYXRhVGV4dCksXG4gICAgICAgICAgc2VsZWN0ZWRJdGVtczogdGhpcy5zZWxlY3RlZEl0ZW1zLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIHNlbGVjdDogdGhpcy5zZWxlY3RJdGVtLFxuICAgICAgICB9LFxuICAgICAgICBzY29wZWRTbG90czoge1xuICAgICAgICAgIGl0ZW06IHRoaXMuJHNjb3BlZFNsb3RzLml0ZW0sXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSxcbiAgICBzdGF0aWNMaXN0ICgpOiBWTm9kZSB7XG4gICAgICBpZiAodGhpcy4kc2xvdHNbJ25vLWRhdGEnXSB8fCB0aGlzLiRzbG90c1sncHJlcGVuZC1pdGVtJ10gfHwgdGhpcy4kc2xvdHNbJ2FwcGVuZC1pdGVtJ10pIHtcbiAgICAgICAgY29uc29sZUVycm9yKCdhc3NlcnQ6IHN0YXRpY0xpc3Qgc2hvdWxkIG5vdCBiZSBjYWxsZWQgaWYgc2xvdHMgYXJlIHVzZWQnKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWU2VsZWN0TGlzdCwgdGhpcy5saXN0RGF0YSlcbiAgICB9LFxuICAgIHZpcnR1YWxpemVkSXRlbXMgKCk6IG9iamVjdFtdIHtcbiAgICAgIHJldHVybiAodGhpcy4kX21lbnVQcm9wcyBhcyBhbnkpLmF1dG9cbiAgICAgICAgPyB0aGlzLmNvbXB1dGVkSXRlbXNcbiAgICAgICAgOiB0aGlzLmNvbXB1dGVkSXRlbXMuc2xpY2UoMCwgdGhpcy5sYXN0SXRlbSlcbiAgICB9LFxuICAgIG1lbnVDYW5TaG93OiAoKSA9PiB0cnVlLFxuICAgICRfbWVudVByb3BzICgpOiBvYmplY3Qge1xuICAgICAgbGV0IG5vcm1hbGlzZWRQcm9wcyA9IHR5cGVvZiB0aGlzLm1lbnVQcm9wcyA9PT0gJ3N0cmluZydcbiAgICAgICAgPyB0aGlzLm1lbnVQcm9wcy5zcGxpdCgnLCcpXG4gICAgICAgIDogdGhpcy5tZW51UHJvcHNcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkobm9ybWFsaXNlZFByb3BzKSkge1xuICAgICAgICBub3JtYWxpc2VkUHJvcHMgPSBub3JtYWxpc2VkUHJvcHMucmVkdWNlKChhY2MsIHApID0+IHtcbiAgICAgICAgICBhY2NbcC50cmltKCldID0gdHJ1ZVxuICAgICAgICAgIHJldHVybiBhY2NcbiAgICAgICAgfSwge30pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmRlZmF1bHRNZW51UHJvcHMsXG4gICAgICAgIGVhZ2VyOiB0aGlzLmVhZ2VyLFxuICAgICAgICB2YWx1ZTogdGhpcy5tZW51Q2FuU2hvdyAmJiB0aGlzLmlzTWVudUFjdGl2ZSxcbiAgICAgICAgbnVkZ2VCb3R0b206IG5vcm1hbGlzZWRQcm9wcy5vZmZzZXRZID8gMSA6IDAsIC8vIGNvbnZlcnQgdG8gaW50XG4gICAgICAgIC4uLm5vcm1hbGlzZWRQcm9wcyxcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgaW50ZXJuYWxWYWx1ZSAodmFsKSB7XG4gICAgICB0aGlzLmluaXRpYWxWYWx1ZSA9IHZhbFxuICAgICAgdGhpcy5zZXRTZWxlY3RlZEl0ZW1zKClcblxuICAgICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgIHRoaXMuJHJlZnMubWVudT8udXBkYXRlRGltZW5zaW9ucygpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBpc01lbnVBY3RpdmUgKHZhbCkge1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdGhpcy5vbk1lbnVBY3RpdmVDaGFuZ2UodmFsKSlcbiAgICB9LFxuICAgIGl0ZW1zOiB7XG4gICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICBoYW5kbGVyICh2YWwpIHtcbiAgICAgICAgaWYgKHRoaXMuY2FjaGVJdGVtcykge1xuICAgICAgICAgIC8vIEJyZWFrcyB2dWUtdGVzdC11dGlscyBpZlxuICAgICAgICAgIC8vIHRoaXMgaXNuJ3QgY2FsY3VsYXRlZFxuICAgICAgICAgIC8vIG9uIHRoZSBuZXh0IHRpY2tcbiAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZEl0ZW1zID0gdGhpcy5maWx0ZXJEdXBsaWNhdGVzKHRoaXMuY2FjaGVkSXRlbXMuY29uY2F0KHZhbCkpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U2VsZWN0ZWRJdGVtcygpXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIC8qKiBAcHVibGljICovXG4gICAgYmx1ciAoZT86IEV2ZW50KSB7XG4gICAgICBWVGV4dEZpZWxkLm9wdGlvbnMubWV0aG9kcy5ibHVyLmNhbGwodGhpcywgZSlcbiAgICAgIHRoaXMuaXNNZW51QWN0aXZlID0gZmFsc2VcbiAgICAgIHRoaXMuaXNGb2N1c2VkID0gZmFsc2VcbiAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IC0xXG4gICAgICB0aGlzLnNldE1lbnVJbmRleCgtMSlcbiAgICB9LFxuICAgIC8qKiBAcHVibGljICovXG4gICAgYWN0aXZhdGVNZW51ICgpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuaXNJbnRlcmFjdGl2ZSB8fFxuICAgICAgICB0aGlzLmlzTWVudUFjdGl2ZVxuICAgICAgKSByZXR1cm5cblxuICAgICAgdGhpcy5pc01lbnVBY3RpdmUgPSB0cnVlXG4gICAgfSxcbiAgICBjbGVhcmFibGVDYWxsYmFjayAoKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKHRoaXMubXVsdGlwbGUgPyBbXSA6IG51bGwpXG4gICAgICB0aGlzLnNldE1lbnVJbmRleCgtMSlcbiAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHRoaXMuJHJlZnMuaW5wdXQgJiYgdGhpcy4kcmVmcy5pbnB1dC5mb2N1cygpKVxuXG4gICAgICBpZiAodGhpcy5vcGVuT25DbGVhcikgdGhpcy5pc01lbnVBY3RpdmUgPSB0cnVlXG4gICAgfSxcbiAgICBjbG9zZUNvbmRpdGlvbmFsIChlOiBFdmVudCkge1xuICAgICAgaWYgKCF0aGlzLmlzTWVudUFjdGl2ZSkgcmV0dXJuIHRydWVcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgIXRoaXMuX2lzRGVzdHJveWVkICYmXG5cbiAgICAgICAgLy8gQ2xpY2sgb3JpZ2luYXRlcyBmcm9tIG91dHNpZGUgdGhlIG1lbnUgY29udGVudFxuICAgICAgICAvLyBNdWx0aXBsZSBzZWxlY3RzIGRvbid0IGNsb3NlIHdoZW4gYW4gaXRlbSBpcyBjbGlja2VkXG4gICAgICAgICghdGhpcy5nZXRDb250ZW50KCkgfHxcbiAgICAgICAgIXRoaXMuZ2V0Q29udGVudCgpLmNvbnRhaW5zKGUudGFyZ2V0IGFzIE5vZGUpKSAmJlxuXG4gICAgICAgIC8vIENsaWNrIG9yaWdpbmF0ZXMgZnJvbSBvdXRzaWRlIHRoZSBlbGVtZW50XG4gICAgICAgIHRoaXMuJGVsICYmXG4gICAgICAgICF0aGlzLiRlbC5jb250YWlucyhlLnRhcmdldCBhcyBOb2RlKSAmJlxuICAgICAgICBlLnRhcmdldCAhPT0gdGhpcy4kZWxcbiAgICAgIClcbiAgICB9LFxuICAgIGZpbHRlckR1cGxpY2F0ZXMgKGFycjogYW55W10pIHtcbiAgICAgIGNvbnN0IHVuaXF1ZVZhbHVlcyA9IG5ldyBNYXAoKVxuICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFyci5sZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGFycltpbmRleF1cblxuICAgICAgICAvLyBEbyBub3QgcmV0dXJuIG51bGwgdmFsdWVzIGlmIGV4aXN0YW50ICgjMTQ0MjEpXG4gICAgICAgIGlmIChpdGVtID09IG51bGwpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIC8vIERvIG5vdCBkZWR1cGxpY2F0ZSBoZWFkZXJzIG9yIGRpdmlkZXJzICgjMTI1MTcpXG4gICAgICAgIGlmIChpdGVtLmhlYWRlciB8fCBpdGVtLmRpdmlkZXIpIHtcbiAgICAgICAgICB1bmlxdWVWYWx1ZXMuc2V0KGl0ZW0sIGl0ZW0pXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMuZ2V0VmFsdWUoaXRlbSlcblxuICAgICAgICAvLyBUT0RPOiBjb21wYXJhdG9yXG4gICAgICAgICF1bmlxdWVWYWx1ZXMuaGFzKHZhbCkgJiYgdW5pcXVlVmFsdWVzLnNldCh2YWwsIGl0ZW0pXG4gICAgICB9XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh1bmlxdWVWYWx1ZXMudmFsdWVzKCkpXG4gICAgfSxcbiAgICBmaW5kRXhpc3RpbmdJbmRleCAoaXRlbTogb2JqZWN0KSB7XG4gICAgICBjb25zdCBpdGVtVmFsdWUgPSB0aGlzLmdldFZhbHVlKGl0ZW0pXG5cbiAgICAgIHJldHVybiAodGhpcy5pbnRlcm5hbFZhbHVlIHx8IFtdKS5maW5kSW5kZXgoKGk6IG9iamVjdCkgPT4gdGhpcy52YWx1ZUNvbXBhcmF0b3IodGhpcy5nZXRWYWx1ZShpKSwgaXRlbVZhbHVlKSlcbiAgICB9LFxuICAgIGdldENvbnRlbnQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJHJlZnMubWVudSAmJiB0aGlzLiRyZWZzLm1lbnUuJHJlZnMuY29udGVudFxuICAgIH0sXG4gICAgZ2VuQ2hpcFNlbGVjdGlvbiAoaXRlbTogb2JqZWN0LCBpbmRleDogbnVtYmVyKSB7XG4gICAgICBjb25zdCBpc0Rpc2FibGVkID0gKFxuICAgICAgICB0aGlzLmlzRGlzYWJsZWQgfHxcbiAgICAgICAgdGhpcy5nZXREaXNhYmxlZChpdGVtKVxuICAgICAgKVxuICAgICAgY29uc3QgaXNJbnRlcmFjdGl2ZSA9ICFpc0Rpc2FibGVkICYmIHRoaXMuaXNJbnRlcmFjdGl2ZVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWQ2hpcCwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtY2hpcC0tc2VsZWN0JyxcbiAgICAgICAgYXR0cnM6IHsgdGFiaW5kZXg6IC0xIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgY2xvc2U6IHRoaXMuZGVsZXRhYmxlQ2hpcHMgJiYgaXNJbnRlcmFjdGl2ZSxcbiAgICAgICAgICBkaXNhYmxlZDogaXNEaXNhYmxlZCxcbiAgICAgICAgICBpbnB1dFZhbHVlOiBpbmRleCA9PT0gdGhpcy5zZWxlY3RlZEluZGV4LFxuICAgICAgICAgIHNtYWxsOiB0aGlzLnNtYWxsQ2hpcHMsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWlzSW50ZXJhY3RpdmUpIHJldHVyblxuXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGluZGV4XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnY2xpY2s6Y2xvc2UnOiAoKSA9PiB0aGlzLm9uQ2hpcElucHV0KGl0ZW0pLFxuICAgICAgICB9LFxuICAgICAgICBrZXk6IEpTT04uc3RyaW5naWZ5KHRoaXMuZ2V0VmFsdWUoaXRlbSkpLFxuICAgICAgfSwgdGhpcy5nZXRUZXh0KGl0ZW0pKVxuICAgIH0sXG4gICAgZ2VuQ29tbWFTZWxlY3Rpb24gKGl0ZW06IG9iamVjdCwgaW5kZXg6IG51bWJlciwgbGFzdDogYm9vbGVhbikge1xuICAgICAgY29uc3QgY29sb3IgPSBpbmRleCA9PT0gdGhpcy5zZWxlY3RlZEluZGV4ICYmIHRoaXMuY29tcHV0ZWRDb2xvclxuICAgICAgY29uc3QgaXNEaXNhYmxlZCA9IChcbiAgICAgICAgdGhpcy5pc0Rpc2FibGVkIHx8XG4gICAgICAgIHRoaXMuZ2V0RGlzYWJsZWQoaXRlbSlcbiAgICAgIClcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHRoaXMuc2V0VGV4dENvbG9yKGNvbG9yLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zZWxlY3RfX3NlbGVjdGlvbiB2LXNlbGVjdF9fc2VsZWN0aW9uLS1jb21tYScsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3Ytc2VsZWN0X19zZWxlY3Rpb24tLWRpc2FibGVkJzogaXNEaXNhYmxlZCxcbiAgICAgICAgfSxcbiAgICAgICAga2V5OiBKU09OLnN0cmluZ2lmeSh0aGlzLmdldFZhbHVlKGl0ZW0pKSxcbiAgICAgIH0pLCBgJHt0aGlzLmdldFRleHQoaXRlbSl9JHtsYXN0ID8gJycgOiAnLCAnfWApXG4gICAgfSxcbiAgICBnZW5EZWZhdWx0U2xvdCAoKTogKFZOb2RlIHwgVk5vZGVbXSB8IG51bGwpW10ge1xuICAgICAgY29uc3Qgc2VsZWN0aW9ucyA9IHRoaXMuZ2VuU2VsZWN0aW9ucygpXG4gICAgICBjb25zdCBpbnB1dCA9IHRoaXMuZ2VuSW5wdXQoKVxuXG4gICAgICAvLyBJZiB0aGUgcmV0dXJuIGlzIGFuIGVtcHR5IGFycmF5XG4gICAgICAvLyBwdXNoIHRoZSBpbnB1dFxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0aW9ucykpIHtcbiAgICAgICAgc2VsZWN0aW9ucy5wdXNoKGlucHV0KVxuICAgICAgLy8gT3RoZXJ3aXNlIHB1c2ggaXQgaW50byBjaGlsZHJlblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0aW9ucy5jaGlsZHJlbiA9IHNlbGVjdGlvbnMuY2hpbGRyZW4gfHwgW11cbiAgICAgICAgc2VsZWN0aW9ucy5jaGlsZHJlbi5wdXNoKGlucHV0KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gW1xuICAgICAgICB0aGlzLmdlbkZpZWxkc2V0KCksXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc2VsZWN0X19zbG90JyxcbiAgICAgICAgICBkaXJlY3RpdmVzOiB0aGlzLmRpcmVjdGl2ZXMsXG4gICAgICAgIH0sIFtcbiAgICAgICAgICB0aGlzLmdlbkxhYmVsKCksXG4gICAgICAgICAgdGhpcy5wcmVmaXggPyB0aGlzLmdlbkFmZml4KCdwcmVmaXgnKSA6IG51bGwsXG4gICAgICAgICAgc2VsZWN0aW9ucyxcbiAgICAgICAgICB0aGlzLnN1ZmZpeCA/IHRoaXMuZ2VuQWZmaXgoJ3N1ZmZpeCcpIDogbnVsbCxcbiAgICAgICAgICB0aGlzLmdlbkNsZWFySWNvbigpLFxuICAgICAgICAgIHRoaXMuZ2VuSWNvblNsb3QoKSxcbiAgICAgICAgICB0aGlzLmdlbkhpZGRlbklucHV0KCksXG4gICAgICAgIF0pLFxuICAgICAgICB0aGlzLmdlbk1lbnUoKSxcbiAgICAgICAgdGhpcy5nZW5Qcm9ncmVzcygpLFxuICAgICAgXVxuICAgIH0sXG4gICAgZ2VuSWNvbiAoXG4gICAgICB0eXBlOiBzdHJpbmcsXG4gICAgICBjYj86IChlOiBFdmVudCkgPT4gdm9pZCxcbiAgICAgIGV4dHJhRGF0YT86IFZOb2RlRGF0YVxuICAgICkge1xuICAgICAgY29uc3QgaWNvbiA9IFZJbnB1dC5vcHRpb25zLm1ldGhvZHMuZ2VuSWNvbi5jYWxsKHRoaXMsIHR5cGUsIGNiLCBleHRyYURhdGEpXG5cbiAgICAgIGlmICh0eXBlID09PSAnYXBwZW5kJykge1xuICAgICAgICAvLyBEb24ndCBhbGxvdyB0aGUgZHJvcGRvd24gaWNvbiB0byBiZSBmb2N1c2VkXG4gICAgICAgIGljb24uY2hpbGRyZW4hWzBdLmRhdGEgPSBtZXJnZURhdGEoaWNvbi5jaGlsZHJlbiFbMF0uZGF0YSEsIHtcbiAgICAgICAgICBhdHRyczoge1xuICAgICAgICAgICAgdGFiaW5kZXg6IGljb24uY2hpbGRyZW4hWzBdLmNvbXBvbmVudE9wdGlvbnMhLmxpc3RlbmVycyAmJiAnLTEnLFxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGljb25cbiAgICB9LFxuICAgIGdlbklucHV0ICgpOiBWTm9kZSB7XG4gICAgICBjb25zdCBpbnB1dCA9IFZUZXh0RmllbGQub3B0aW9ucy5tZXRob2RzLmdlbklucHV0LmNhbGwodGhpcylcblxuICAgICAgZGVsZXRlIGlucHV0LmRhdGEhLmF0dHJzIS5uYW1lXG5cbiAgICAgIGlucHV0LmRhdGEgPSBtZXJnZURhdGEoaW5wdXQuZGF0YSEsIHtcbiAgICAgICAgZG9tUHJvcHM6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICByZWFkb25seTogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgJ2FyaWEtcmVhZG9ubHknOiBTdHJpbmcodGhpcy5pc1JlYWRvbmx5KSxcbiAgICAgICAgICAnYXJpYS1hY3RpdmVkZXNjZW5kYW50JzogZ2V0T2JqZWN0VmFsdWVCeVBhdGgodGhpcy4kcmVmcy5tZW51LCAnYWN0aXZlVGlsZS5pZCcpLFxuICAgICAgICAgIGF1dG9jb21wbGV0ZTogZ2V0T2JqZWN0VmFsdWVCeVBhdGgoaW5wdXQuZGF0YSEsICdhdHRycy5hdXRvY29tcGxldGUnLCAnb2ZmJyksXG4gICAgICAgICAgcGxhY2Vob2xkZXI6ICghdGhpcy5pc0RpcnR5ICYmICh0aGlzLnBlcnNpc3RlbnRQbGFjZWhvbGRlciB8fCB0aGlzLmlzRm9jdXNlZCB8fCAhdGhpcy5oYXNMYWJlbCkpID8gdGhpcy5wbGFjZWhvbGRlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHsga2V5cHJlc3M6IHRoaXMub25LZXlQcmVzcyB9LFxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGlucHV0XG4gICAgfSxcbiAgICBnZW5IaWRkZW5JbnB1dCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuICAgICAgICBkb21Qcm9wczogeyB2YWx1ZTogdGhpcy5sYXp5VmFsdWUgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICB0eXBlOiAnaGlkZGVuJyxcbiAgICAgICAgICBuYW1lOiB0aGlzLmF0dHJzJC5uYW1lLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlbklucHV0U2xvdCAoKTogVk5vZGUge1xuICAgICAgY29uc3QgcmVuZGVyID0gVlRleHRGaWVsZC5vcHRpb25zLm1ldGhvZHMuZ2VuSW5wdXRTbG90LmNhbGwodGhpcylcblxuICAgICAgcmVuZGVyLmRhdGEhLmF0dHJzID0ge1xuICAgICAgICAuLi5yZW5kZXIuZGF0YSEuYXR0cnMsXG4gICAgICAgIHJvbGU6ICdidXR0b24nLFxuICAgICAgICAnYXJpYS1oYXNwb3B1cCc6ICdsaXN0Ym94JyxcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBTdHJpbmcodGhpcy5pc01lbnVBY3RpdmUpLFxuICAgICAgICAnYXJpYS1vd25zJzogdGhpcy5jb21wdXRlZE93bnMsXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZW5kZXJcbiAgICB9LFxuICAgIGdlbkxpc3QgKCk6IFZOb2RlIHtcbiAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gc2xvdHMsIHdlIGNhbiB1c2UgYSBjYWNoZWQgVk5vZGUgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZVxuICAgICAgaWYgKHRoaXMuJHNsb3RzWyduby1kYXRhJ10gfHwgdGhpcy4kc2xvdHNbJ3ByZXBlbmQtaXRlbSddIHx8IHRoaXMuJHNsb3RzWydhcHBlbmQtaXRlbSddKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlbkxpc3RXaXRoU2xvdCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0aWNMaXN0XG4gICAgICB9XG4gICAgfSxcbiAgICBnZW5MaXN0V2l0aFNsb3QgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHNsb3RzID0gWydwcmVwZW5kLWl0ZW0nLCAnbm8tZGF0YScsICdhcHBlbmQtaXRlbSddXG4gICAgICAgIC5maWx0ZXIoc2xvdE5hbWUgPT4gdGhpcy4kc2xvdHNbc2xvdE5hbWVdKVxuICAgICAgICAubWFwKHNsb3ROYW1lID0+IHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJywge1xuICAgICAgICAgIHNsb3Q6IHNsb3ROYW1lLFxuICAgICAgICB9LCB0aGlzLiRzbG90c1tzbG90TmFtZV0pKVxuICAgICAgLy8gUmVxdWlyZXMgZGVzdHJ1Y3R1cmluZyBkdWUgdG8gVnVlXG4gICAgICAvLyBtb2RpZnlpbmcgdGhlIGBvbmAgcHJvcGVydHkgd2hlbiBwYXNzZWRcbiAgICAgIC8vIGFzIGEgcmVmZXJlbmNlZCBvYmplY3RcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZTZWxlY3RMaXN0LCB7XG4gICAgICAgIC4uLnRoaXMubGlzdERhdGEsXG4gICAgICB9LCBzbG90cylcbiAgICB9LFxuICAgIGdlbk1lbnUgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHByb3BzID0gdGhpcy4kX21lbnVQcm9wcyBhcyBhbnlcbiAgICAgIHByb3BzLmFjdGl2YXRvciA9IHRoaXMuJHJlZnNbJ2lucHV0LXNsb3QnXVxuXG4gICAgICAvLyBBdHRhY2ggdG8gcm9vdCBlbCBzbyB0aGF0XG4gICAgICAvLyBtZW51IGNvdmVycyBwcmVwZW5kL2FwcGVuZCBpY29uc1xuICAgICAgaWYgKFxuICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgYSBjb21wdXRlZCBwcm9wZXJ0eSBvciBoZWxwZXIgb3Igc29tZXRoaW5nXG4gICAgICAgIHRoaXMuYXR0YWNoID09PSAnJyB8fCAvLyBJZiB1c2VkIGFzIGEgYm9vbGVhbiBwcm9wICg8di1tZW51IGF0dGFjaD4pXG4gICAgICAgIHRoaXMuYXR0YWNoID09PSB0cnVlIHx8IC8vIElmIGJvdW5kIHRvIGEgYm9vbGVhbiAoPHYtbWVudSA6YXR0YWNoPVwidHJ1ZVwiPilcbiAgICAgICAgdGhpcy5hdHRhY2ggPT09ICdhdHRhY2gnIC8vIElmIGJvdW5kIGFzIGJvb2xlYW4gcHJvcCBpbiBwdWcgKHYtbWVudShhdHRhY2gpKVxuICAgICAgKSB7XG4gICAgICAgIHByb3BzLmF0dGFjaCA9IHRoaXMuJGVsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wcy5hdHRhY2ggPSB0aGlzLmF0dGFjaFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWTWVudSwge1xuICAgICAgICBhdHRyczogeyByb2xlOiB1bmRlZmluZWQgfSxcbiAgICAgICAgcHJvcHMsXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgaW5wdXQ6ICh2YWw6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNNZW51QWN0aXZlID0gdmFsXG4gICAgICAgICAgICB0aGlzLmlzRm9jdXNlZCA9IHZhbFxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2Nyb2xsOiB0aGlzLm9uU2Nyb2xsLFxuICAgICAgICB9LFxuICAgICAgICByZWY6ICdtZW51JyxcbiAgICAgIH0sIFt0aGlzLmdlbkxpc3QoKV0pXG4gICAgfSxcbiAgICBnZW5TZWxlY3Rpb25zICgpOiBWTm9kZSB7XG4gICAgICBsZXQgbGVuZ3RoID0gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aFxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBuZXcgQXJyYXkobGVuZ3RoKVxuXG4gICAgICBsZXQgZ2VuU2VsZWN0aW9uXG4gICAgICBpZiAodGhpcy4kc2NvcGVkU2xvdHMuc2VsZWN0aW9uKSB7XG4gICAgICAgIGdlblNlbGVjdGlvbiA9IHRoaXMuZ2VuU2xvdFNlbGVjdGlvblxuICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0NoaXBzKSB7XG4gICAgICAgIGdlblNlbGVjdGlvbiA9IHRoaXMuZ2VuQ2hpcFNlbGVjdGlvblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2VuU2VsZWN0aW9uID0gdGhpcy5nZW5Db21tYVNlbGVjdGlvblxuICAgICAgfVxuXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgY2hpbGRyZW5bbGVuZ3RoXSA9IGdlblNlbGVjdGlvbihcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXNbbGVuZ3RoXSxcbiAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgbGVuZ3RoID09PSBjaGlsZHJlbi5sZW5ndGggLSAxXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNlbGVjdF9fc2VsZWN0aW9ucycsXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlblNsb3RTZWxlY3Rpb24gKGl0ZW06IG9iamVjdCwgaW5kZXg6IG51bWJlcik6IFZOb2RlW10gfCB1bmRlZmluZWQge1xuICAgICAgcmV0dXJuIHRoaXMuJHNjb3BlZFNsb3RzLnNlbGVjdGlvbiEoe1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIGNsYXNzOiAndi1jaGlwLS1zZWxlY3QnLFxuICAgICAgICB9LFxuICAgICAgICBwYXJlbnQ6IHRoaXMsXG4gICAgICAgIGl0ZW0sXG4gICAgICAgIGluZGV4LFxuICAgICAgICBzZWxlY3Q6IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBpbmRleFxuICAgICAgICB9LFxuICAgICAgICBzZWxlY3RlZDogaW5kZXggPT09IHRoaXMuc2VsZWN0ZWRJbmRleCxcbiAgICAgICAgZGlzYWJsZWQ6ICF0aGlzLmlzSW50ZXJhY3RpdmUsXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2V0TWVudUluZGV4ICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRyZWZzLm1lbnUgPyAodGhpcy4kcmVmcy5tZW51IGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0pLmxpc3RJbmRleCA6IC0xXG4gICAgfSxcbiAgICBnZXREaXNhYmxlZCAoaXRlbTogb2JqZWN0KSB7XG4gICAgICByZXR1cm4gZ2V0UHJvcGVydHlGcm9tSXRlbShpdGVtLCB0aGlzLml0ZW1EaXNhYmxlZCwgZmFsc2UpXG4gICAgfSxcbiAgICBnZXRUZXh0IChpdGVtOiBvYmplY3QpIHtcbiAgICAgIHJldHVybiBnZXRQcm9wZXJ0eUZyb21JdGVtKGl0ZW0sIHRoaXMuaXRlbVRleHQsIGl0ZW0pXG4gICAgfSxcbiAgICBnZXRWYWx1ZSAoaXRlbTogb2JqZWN0KSB7XG4gICAgICByZXR1cm4gZ2V0UHJvcGVydHlGcm9tSXRlbShpdGVtLCB0aGlzLml0ZW1WYWx1ZSwgdGhpcy5nZXRUZXh0KGl0ZW0pKVxuICAgIH0sXG4gICAgb25CbHVyIChlPzogRXZlbnQpIHtcbiAgICAgIGUgJiYgdGhpcy4kZW1pdCgnYmx1cicsIGUpXG4gICAgfSxcbiAgICBvbkNoaXBJbnB1dCAoaXRlbTogb2JqZWN0KSB7XG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSkgdGhpcy5zZWxlY3RJdGVtKGl0ZW0pXG4gICAgICBlbHNlIHRoaXMuc2V0VmFsdWUobnVsbClcbiAgICAgIC8vIElmIGFsbCBpdGVtcyBoYXZlIGJlZW4gZGVsZXRlZCxcbiAgICAgIC8vIG9wZW4gYHYtbWVudWBcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuaXNNZW51QWN0aXZlID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5pc01lbnVBY3RpdmUgPSBmYWxzZVxuICAgICAgfVxuICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gLTFcbiAgICB9LFxuICAgIG9uQ2xpY2sgKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0ludGVyYWN0aXZlKSByZXR1cm5cblxuICAgICAgaWYgKCF0aGlzLmlzQXBwZW5kSW5uZXIoZS50YXJnZXQpKSB7XG4gICAgICAgIHRoaXMuaXNNZW51QWN0aXZlID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNGb2N1c2VkKSB7XG4gICAgICAgIHRoaXMuaXNGb2N1c2VkID0gdHJ1ZVxuICAgICAgICB0aGlzLiRlbWl0KCdmb2N1cycpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGVtaXQoJ2NsaWNrJywgZSlcbiAgICB9LFxuICAgIG9uRXNjRG93biAoZTogRXZlbnQpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgaWYgKHRoaXMuaXNNZW51QWN0aXZlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgdGhpcy5pc01lbnVBY3RpdmUgPSBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgb25LZXlQcmVzcyAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLm11bHRpcGxlIHx8XG4gICAgICAgICF0aGlzLmlzSW50ZXJhY3RpdmUgfHxcbiAgICAgICAgdGhpcy5kaXNhYmxlTG9va3VwXG4gICAgICApIHJldHVyblxuXG4gICAgICBjb25zdCBLRVlCT0FSRF9MT09LVVBfVEhSRVNIT0xEID0gMTAwMCAvLyBtaWxsaXNlY29uZHNcbiAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpXG4gICAgICBpZiAobm93IC0gdGhpcy5rZXlib2FyZExvb2t1cExhc3RUaW1lID4gS0VZQk9BUkRfTE9PS1VQX1RIUkVTSE9MRCkge1xuICAgICAgICB0aGlzLmtleWJvYXJkTG9va3VwUHJlZml4ID0gJydcbiAgICAgIH1cbiAgICAgIHRoaXMua2V5Ym9hcmRMb29rdXBQcmVmaXggKz0gZS5rZXkudG9Mb3dlckNhc2UoKVxuICAgICAgdGhpcy5rZXlib2FyZExvb2t1cExhc3RUaW1lID0gbm93XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5hbGxJdGVtcy5maW5kSW5kZXgoaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSAodGhpcy5nZXRUZXh0KGl0ZW0pIHx8ICcnKS50b1N0cmluZygpXG5cbiAgICAgICAgcmV0dXJuIHRleHQudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKHRoaXMua2V5Ym9hcmRMb29rdXBQcmVmaXgpXG4gICAgICB9KVxuICAgICAgY29uc3QgaXRlbSA9IHRoaXMuYWxsSXRlbXNbaW5kZXhdXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMubGFzdEl0ZW0gPSBNYXRoLm1heCh0aGlzLmxhc3RJdGVtLCBpbmRleCArIDUpXG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5yZXR1cm5PYmplY3QgPyBpdGVtIDogdGhpcy5nZXRWYWx1ZShpdGVtKSlcbiAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gdGhpcy4kcmVmcy5tZW51LmdldFRpbGVzKCkpXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zZXRNZW51SW5kZXgoaW5kZXgpKVxuICAgICAgfVxuICAgIH0sXG4gICAgb25LZXlEb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5pc1JlYWRvbmx5ICYmIGUua2V5Q29kZSAhPT0ga2V5Q29kZXMudGFiKSByZXR1cm5cblxuICAgICAgY29uc3Qga2V5Q29kZSA9IGUua2V5Q29kZVxuICAgICAgY29uc3QgbWVudSA9IHRoaXMuJHJlZnMubWVudVxuXG4gICAgICB0aGlzLiRlbWl0KCdrZXlkb3duJywgZSlcblxuICAgICAgaWYgKCFtZW51KSByZXR1cm5cblxuICAgICAgLy8gSWYgbWVudSBpcyBhY3RpdmUsIGFsbG93IGRlZmF1bHRcbiAgICAgIC8vIGxpc3RJbmRleCBjaGFuZ2UgZnJvbSBtZW51XG4gICAgICBpZiAodGhpcy5pc01lbnVBY3RpdmUgJiYgW2tleUNvZGVzLnVwLCBrZXlDb2Rlcy5kb3duLCBrZXlDb2Rlcy5ob21lLCBrZXlDb2Rlcy5lbmQsIGtleUNvZGVzLmVudGVyXS5pbmNsdWRlcyhrZXlDb2RlKSkge1xuICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgbWVudS5jaGFuZ2VMaXN0SW5kZXgoZSlcbiAgICAgICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6bGlzdC1pbmRleCcsIG1lbnUubGlzdEluZGV4KVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBlbnRlciwgc3BhY2UsIG9wZW4gbWVudVxuICAgICAgaWYgKFtcbiAgICAgICAga2V5Q29kZXMuZW50ZXIsXG4gICAgICAgIGtleUNvZGVzLnNwYWNlLFxuICAgICAgXS5pbmNsdWRlcyhrZXlDb2RlKSkgdGhpcy5hY3RpdmF0ZU1lbnUoKVxuXG4gICAgICAvLyBJZiBtZW51IGlzIG5vdCBhY3RpdmUsIHVwL2Rvd24vaG9tZS9lbmQgY2FuIGRvXG4gICAgICAvLyBvbmUgb2YgMiB0aGluZ3MuIElmIG11bHRpcGxlLCBvcGVucyB0aGVcbiAgICAgIC8vIG1lbnUsIGlmIG5vdCwgd2lsbCBjeWNsZSB0aHJvdWdoIGFsbFxuICAgICAgLy8gYXZhaWxhYmxlIG9wdGlvbnNcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMuaXNNZW51QWN0aXZlICYmXG4gICAgICAgIFtrZXlDb2Rlcy51cCwga2V5Q29kZXMuZG93biwga2V5Q29kZXMuaG9tZSwga2V5Q29kZXMuZW5kXS5pbmNsdWRlcyhrZXlDb2RlKVxuICAgICAgKSByZXR1cm4gdGhpcy5vblVwRG93bihlKVxuXG4gICAgICAvLyBJZiBlc2NhcGUgZGVhY3RpdmF0ZSB0aGUgbWVudVxuICAgICAgaWYgKGtleUNvZGUgPT09IGtleUNvZGVzLmVzYykgcmV0dXJuIHRoaXMub25Fc2NEb3duKGUpXG5cbiAgICAgIC8vIElmIHRhYiAtIHNlbGVjdCBpdGVtIG9yIGNsb3NlIG1lbnVcbiAgICAgIGlmIChrZXlDb2RlID09PSBrZXlDb2Rlcy50YWIpIHJldHVybiB0aGlzLm9uVGFiRG93bihlKVxuXG4gICAgICAvLyBJZiBzcGFjZSBwcmV2ZW50RGVmYXVsdFxuICAgICAgaWYgKGtleUNvZGUgPT09IGtleUNvZGVzLnNwYWNlKSByZXR1cm4gdGhpcy5vblNwYWNlRG93bihlKVxuICAgIH0sXG4gICAgb25NZW51QWN0aXZlQ2hhbmdlICh2YWw6IGJvb2xlYW4pIHtcbiAgICAgIC8vIElmIG1lbnUgaXMgY2xvc2luZyBhbmQgbXVsaXRwbGVcbiAgICAgIC8vIG9yIG1lbnVJbmRleCBpcyBhbHJlYWR5IHNldFxuICAgICAgLy8gc2tpcCBtZW51IGluZGV4IHJlY2FsY3VsYXRpb25cbiAgICAgIGlmIChcbiAgICAgICAgKHRoaXMubXVsdGlwbGUgJiYgIXZhbCkgfHxcbiAgICAgICAgdGhpcy5nZXRNZW51SW5kZXgoKSA+IC0xXG4gICAgICApIHJldHVyblxuXG4gICAgICBjb25zdCBtZW51ID0gdGhpcy4kcmVmcy5tZW51XG5cbiAgICAgIGlmICghbWVudSB8fCAhdGhpcy5pc0RpcnR5KSByZXR1cm5cblxuICAgICAgLy8gV2hlbiBtZW51IG9wZW5zLCBzZXQgaW5kZXggb2YgZmlyc3QgYWN0aXZlIGl0ZW1cbiAgICAgIHRoaXMuJHJlZnMubWVudS5nZXRUaWxlcygpXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lbnUudGlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG1lbnUudGlsZXNbaV0uZ2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJykgPT09ICd0cnVlJykge1xuICAgICAgICAgIHRoaXMuc2V0TWVudUluZGV4KGkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgb25Nb3VzZVVwIChlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgc29uYXJqcy9uby1jb2xsYXBzaWJsZS1pZlxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmhhc01vdXNlRG93biAmJlxuICAgICAgICBlLndoaWNoICE9PSAzICYmXG4gICAgICAgIHRoaXMuaXNJbnRlcmFjdGl2ZVxuICAgICAgKSB7XG4gICAgICAgIC8vIElmIGFwcGVuZCBpbm5lciBpcyBwcmVzZW50XG4gICAgICAgIC8vIGFuZCB0aGUgdGFyZ2V0IGlzIGl0c2VsZlxuICAgICAgICAvLyBvciBpbnNpZGUsIHRvZ2dsZSBtZW51XG4gICAgICAgIGlmICh0aGlzLmlzQXBwZW5kSW5uZXIoZS50YXJnZXQpKSB7XG4gICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gKHRoaXMuaXNNZW51QWN0aXZlID0gIXRoaXMuaXNNZW51QWN0aXZlKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBWVGV4dEZpZWxkLm9wdGlvbnMubWV0aG9kcy5vbk1vdXNlVXAuY2FsbCh0aGlzLCBlKVxuICAgIH0sXG4gICAgb25TY3JvbGwgKCkge1xuICAgICAgaWYgKCF0aGlzLmlzTWVudUFjdGl2ZSkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gKHRoaXMuZ2V0Q29udGVudCgpLnNjcm9sbFRvcCA9IDApKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdEl0ZW0gPiB0aGlzLmNvbXB1dGVkSXRlbXMubGVuZ3RoKSByZXR1cm5cblxuICAgICAgICBjb25zdCBzaG93TW9yZUl0ZW1zID0gKFxuICAgICAgICAgIHRoaXMuZ2V0Q29udGVudCgpLnNjcm9sbEhlaWdodCAtXG4gICAgICAgICAgKHRoaXMuZ2V0Q29udGVudCgpLnNjcm9sbFRvcCArXG4gICAgICAgICAgdGhpcy5nZXRDb250ZW50KCkuY2xpZW50SGVpZ2h0KVxuICAgICAgICApIDwgMjAwXG5cbiAgICAgICAgaWYgKHNob3dNb3JlSXRlbXMpIHtcbiAgICAgICAgICB0aGlzLmxhc3RJdGVtICs9IDIwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9uU3BhY2VEb3duIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB9LFxuICAgIG9uVGFiRG93biAoZTogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgY29uc3QgbWVudSA9IHRoaXMuJHJlZnMubWVudVxuXG4gICAgICBpZiAoIW1lbnUpIHJldHVyblxuXG4gICAgICBjb25zdCBhY3RpdmVUaWxlID0gbWVudS5hY3RpdmVUaWxlXG5cbiAgICAgIC8vIEFuIGl0ZW0gdGhhdCBpcyBzZWxlY3RlZCBieVxuICAgICAgLy8gbWVudS1pbmRleCBzaG91bGQgdG9nZ2xlZFxuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy5tdWx0aXBsZSAmJlxuICAgICAgICBhY3RpdmVUaWxlICYmXG4gICAgICAgIHRoaXMuaXNNZW51QWN0aXZlXG4gICAgICApIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgICAgICBhY3RpdmVUaWxlLmNsaWNrKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHdlIG1ha2UgaXQgaGVyZSxcbiAgICAgICAgLy8gdGhlIHVzZXIgaGFzIG5vIHNlbGVjdGVkIGluZGV4ZXNcbiAgICAgICAgLy8gYW5kIGlzIHByb2JhYmx5IHRhYmJpbmcgb3V0XG4gICAgICAgIHRoaXMuYmx1cihlKVxuICAgICAgfVxuICAgIH0sXG4gICAgb25VcERvd24gKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgIGNvbnN0IG1lbnUgPSB0aGlzLiRyZWZzLm1lbnVcblxuICAgICAgaWYgKCFtZW51KSByZXR1cm5cblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIC8vIE11bHRpcGxlIHNlbGVjdHMgZG8gbm90IGN5Y2xlIHRoZWlyIHZhbHVlXG4gICAgICAvLyB3aGVuIHByZXNzaW5nIHVwIG9yIGRvd24sIGluc3RlYWQgYWN0aXZhdGVcbiAgICAgIC8vIHRoZSBtZW51XG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSkgcmV0dXJuIHRoaXMuYWN0aXZhdGVNZW51KClcblxuICAgICAgY29uc3Qga2V5Q29kZSA9IGUua2V5Q29kZVxuXG4gICAgICAvLyBDeWNsZSB0aHJvdWdoIGF2YWlsYWJsZSB2YWx1ZXMgdG8gYWNoaWV2ZVxuICAgICAgLy8gc2VsZWN0IG5hdGl2ZSBiZWhhdmlvclxuICAgICAgbWVudS5pc0Jvb3RlZCA9IHRydWVcblxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIG1lbnUuZ2V0VGlsZXMoKVxuXG4gICAgICAgIGlmICghbWVudS5oYXNDbGlja2FibGVUaWxlcykgcmV0dXJuIHRoaXMuYWN0aXZhdGVNZW51KClcblxuICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIGtleUNvZGVzLnVwOlxuICAgICAgICAgICAgbWVudS5wcmV2VGlsZSgpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2Uga2V5Q29kZXMuZG93bjpcbiAgICAgICAgICAgIG1lbnUubmV4dFRpbGUoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIGtleUNvZGVzLmhvbWU6XG4gICAgICAgICAgICBtZW51LmZpcnN0VGlsZSgpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2Uga2V5Q29kZXMuZW5kOlxuICAgICAgICAgICAgbWVudS5sYXN0VGlsZSgpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0SXRlbSh0aGlzLmFsbEl0ZW1zW3RoaXMuZ2V0TWVudUluZGV4KCldKVxuICAgICAgfSlcbiAgICB9LFxuICAgIHNlbGVjdEl0ZW0gKGl0ZW06IG9iamVjdCkge1xuICAgICAgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5yZXR1cm5PYmplY3QgPyBpdGVtIDogdGhpcy5nZXRWYWx1ZShpdGVtKSlcbiAgICAgICAgdGhpcy5pc01lbnVBY3RpdmUgPSBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxWYWx1ZSA9ICh0aGlzLmludGVybmFsVmFsdWUgfHwgW10pLnNsaWNlKClcbiAgICAgICAgY29uc3QgaSA9IHRoaXMuZmluZEV4aXN0aW5nSW5kZXgoaXRlbSlcblxuICAgICAgICBpICE9PSAtMSA/IGludGVybmFsVmFsdWUuc3BsaWNlKGksIDEpIDogaW50ZXJuYWxWYWx1ZS5wdXNoKGl0ZW0pXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoaW50ZXJuYWxWYWx1ZS5tYXAoKGk6IG9iamVjdCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLnJldHVybk9iamVjdCA/IGkgOiB0aGlzLmdldFZhbHVlKGkpXG4gICAgICAgIH0pKVxuXG4gICAgICAgIC8vIFRoZXJlIGlzIG5vIGl0ZW0gdG8gcmUtaGlnaGxpZ2h0XG4gICAgICAgIC8vIHdoZW4gc2VsZWN0aW9ucyBhcmUgaGlkZGVuXG4gICAgICAgIGlmICh0aGlzLmhpZGVTZWxlY3RlZCkge1xuICAgICAgICAgIHRoaXMuc2V0TWVudUluZGV4KC0xKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5hbGxJdGVtcy5pbmRleE9mKGl0ZW0pXG4gICAgICAgICAgaWYgKH5pbmRleCkge1xuICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gdGhpcy4kcmVmcy5tZW51LmdldFRpbGVzKCkpXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2V0TWVudUluZGV4KGluZGV4KSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldE1lbnVJbmRleCAoaW5kZXg6IG51bWJlcikge1xuICAgICAgdGhpcy4kcmVmcy5tZW51ICYmICgodGhpcy4kcmVmcy5tZW51IGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0pLmxpc3RJbmRleCA9IGluZGV4KVxuICAgIH0sXG4gICAgc2V0U2VsZWN0ZWRJdGVtcyAoKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZEl0ZW1zID0gW11cbiAgICAgIGNvbnN0IHZhbHVlcyA9ICF0aGlzLm11bHRpcGxlIHx8ICFBcnJheS5pc0FycmF5KHRoaXMuaW50ZXJuYWxWYWx1ZSlcbiAgICAgICAgPyBbdGhpcy5pbnRlcm5hbFZhbHVlXVxuICAgICAgICA6IHRoaXMuaW50ZXJuYWxWYWx1ZVxuXG4gICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuYWxsSXRlbXMuZmluZEluZGV4KHYgPT4gdGhpcy52YWx1ZUNvbXBhcmF0b3IoXG4gICAgICAgICAgdGhpcy5nZXRWYWx1ZSh2KSxcbiAgICAgICAgICB0aGlzLmdldFZhbHVlKHZhbHVlKVxuICAgICAgICApKVxuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgc2VsZWN0ZWRJdGVtcy5wdXNoKHRoaXMuYWxsSXRlbXNbaW5kZXhdKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHNlbGVjdGVkSXRlbXNcbiAgICB9LFxuICAgIHNldFZhbHVlICh2YWx1ZTogYW55KSB7XG4gICAgICBpZiAoIXRoaXMudmFsdWVDb21wYXJhdG9yKHZhbHVlLCB0aGlzLmludGVybmFsVmFsdWUpKSB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxWYWx1ZSA9IHZhbHVlXG4gICAgICAgIHRoaXMuJGVtaXQoJ2NoYW5nZScsIHZhbHVlKVxuICAgICAgfVxuICAgIH0sXG4gICAgaXNBcHBlbmRJbm5lciAodGFyZ2V0OiBhbnkpIHtcbiAgICAgIC8vIHJldHVybiB0cnVlIGlmIGFwcGVuZCBpbm5lciBpcyBwcmVzZW50XG4gICAgICAvLyBhbmQgdGhlIHRhcmdldCBpcyBpdHNlbGYgb3IgaW5zaWRlXG4gICAgICBjb25zdCBhcHBlbmRJbm5lciA9IHRoaXMuJHJlZnNbJ2FwcGVuZC1pbm5lciddXG5cbiAgICAgIHJldHVybiBhcHBlbmRJbm5lciAmJiAoYXBwZW5kSW5uZXIgPT09IHRhcmdldCB8fCBhcHBlbmRJbm5lci5jb250YWlucyh0YXJnZXQpKVxuICAgIH0sXG4gIH0sXG59KVxuIl19
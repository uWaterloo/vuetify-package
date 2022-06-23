// Components
import { VData } from '../VData';
import VDataFooter from './VDataFooter';
// Mixins
import Mobile from '../../mixins/mobile';
import Themeable from '../../mixins/themeable';
// Helpers
import mixins from '../../util/mixins';
import { deepEqual, getObjectValueByPath, getPrefixedScopedSlots, getSlot, camelizeObjectKeys, keyCodes } from '../../util/helpers';
import { breaking, removed } from '../../util/console';
/* @vue/component */
export default mixins(Mobile, Themeable).extend({
    name: 'v-data-iterator',
    props: {
        ...VData.options.props,
        itemKey: {
            type: String,
            default: 'id',
        },
        value: {
            type: Array,
            default: () => [],
        },
        singleSelect: Boolean,
        expanded: {
            type: Array,
            default: () => [],
        },
        mobileBreakpoint: {
            ...Mobile.options.props.mobileBreakpoint,
            default: 600,
        },
        singleExpand: Boolean,
        loading: [Boolean, String],
        noResultsText: {
            type: String,
            default: '$vuetify.dataIterator.noResultsText',
        },
        noDataText: {
            type: String,
            default: '$vuetify.noDataText',
        },
        loadingText: {
            type: String,
            default: '$vuetify.dataIterator.loadingText',
        },
        hideDefaultFooter: Boolean,
        footerProps: Object,
        selectableKey: {
            type: String,
            default: 'isSelectable',
        },
    },
    data: () => ({
        selection: {},
        expansion: {},
        internalCurrentItems: [],
        shiftKeyDown: false,
        lastEntry: -1,
    }),
    computed: {
        everyItem() {
            return !!this.selectableItems.length && this.selectableItems.every((i) => this.isSelected(i));
        },
        someItems() {
            return this.selectableItems.some((i) => this.isSelected(i));
        },
        sanitizedFooterProps() {
            return camelizeObjectKeys(this.footerProps);
        },
        selectableItems() {
            return this.internalCurrentItems.filter(item => this.isSelectable(item));
        },
    },
    watch: {
        value: {
            handler(value) {
                this.selection = value.reduce((selection, item) => {
                    selection[getObjectValueByPath(item, this.itemKey)] = item;
                    return selection;
                }, {});
            },
            immediate: true,
        },
        selection(value, old) {
            if (deepEqual(Object.keys(value), Object.keys(old)))
                return;
            this.$emit('input', Object.values(value));
        },
        expanded: {
            handler(value) {
                this.expansion = value.reduce((expansion, item) => {
                    expansion[getObjectValueByPath(item, this.itemKey)] = true;
                    return expansion;
                }, {});
            },
            immediate: true,
        },
        expansion(value, old) {
            if (deepEqual(value, old))
                return;
            const keys = Object.keys(value).filter(k => value[k]);
            const expanded = !keys.length ? [] : this.items.filter(i => keys.includes(String(getObjectValueByPath(i, this.itemKey))));
            this.$emit('update:expanded', expanded);
        },
    },
    created() {
        const breakingProps = [
            ['disable-initial-sort', 'sort-by'],
            ['filter', 'custom-filter'],
            ['pagination', 'options'],
            ['total-items', 'server-items-length'],
            ['hide-actions', 'hide-default-footer'],
            ['rows-per-page-items', 'footer-props.items-per-page-options'],
            ['rows-per-page-text', 'footer-props.items-per-page-text'],
            ['prev-icon', 'footer-props.prev-icon'],
            ['next-icon', 'footer-props.next-icon'],
        ];
        /* istanbul ignore next */
        breakingProps.forEach(([original, replacement]) => {
            if (this.$attrs.hasOwnProperty(original))
                breaking(original, replacement, this);
        });
        const removedProps = [
            'expand',
            'content-class',
            'content-props',
            'content-tag',
        ];
        /* istanbul ignore next */
        removedProps.forEach(prop => {
            if (this.$attrs.hasOwnProperty(prop))
                removed(prop);
        });
    },
    mounted() {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    },
    methods: {
        onKeyDown(e) {
            if (e.keyCode !== keyCodes.shift)
                return;
            this.shiftKeyDown = true;
        },
        onKeyUp(e) {
            if (e.keyCode !== keyCodes.shift)
                return;
            this.shiftKeyDown = false;
        },
        toggleSelectAll(value) {
            const selection = Object.assign({}, this.selection);
            for (let i = 0; i < this.selectableItems.length; i++) {
                const item = this.selectableItems[i];
                if (!this.isSelectable(item))
                    continue;
                const key = getObjectValueByPath(item, this.itemKey);
                if (value)
                    selection[key] = item;
                else
                    delete selection[key];
            }
            this.selection = selection;
            this.$emit('toggle-select-all', { items: this.internalCurrentItems, value });
        },
        isSelectable(item) {
            return getObjectValueByPath(item, this.selectableKey) !== false;
        },
        isSelected(item) {
            return !!this.selection[getObjectValueByPath(item, this.itemKey)] || false;
        },
        select(item, value = true, emit = true) {
            if (!this.isSelectable(item))
                return;
            const selection = this.singleSelect ? {} : Object.assign({}, this.selection);
            const key = getObjectValueByPath(item, this.itemKey);
            if (value)
                selection[key] = item;
            else
                delete selection[key];
            const index = this.selectableItems.findIndex(x => getObjectValueByPath(x, this.itemKey) === key);
            if (this.lastEntry === -1)
                this.lastEntry = index;
            else if (this.shiftKeyDown && !this.singleSelect && emit) {
                const lastEntryKey = getObjectValueByPath(this.selectableItems[this.lastEntry], this.itemKey);
                const lastEntryKeySelected = Object.keys(this.selection).includes(String(lastEntryKey));
                this.multipleSelect(lastEntryKeySelected, emit, selection, index);
            }
            this.lastEntry = index;
            if (this.singleSelect && emit) {
                const keys = Object.keys(this.selection);
                const old = keys.length && getObjectValueByPath(this.selection[keys[0]], this.itemKey);
                old && old !== key && this.$emit('item-selected', { item: this.selection[old], value: false });
            }
            this.selection = selection;
            emit && this.$emit('item-selected', { item, value });
        },
        multipleSelect(value = true, emit = true, selection, index) {
            const start = index < this.lastEntry ? index : this.lastEntry;
            const end = index < this.lastEntry ? this.lastEntry : index;
            for (let i = start; i <= end; i++) {
                const currentItem = this.selectableItems[i];
                const key = getObjectValueByPath(currentItem, this.itemKey);
                if (value)
                    selection[key] = currentItem;
                else
                    delete selection[key];
                emit && this.$emit('item-selected', { currentItem, value });
            }
        },
        isExpanded(item) {
            return this.expansion[getObjectValueByPath(item, this.itemKey)] || false;
        },
        expand(item, value = true) {
            const expansion = this.singleExpand ? {} : Object.assign({}, this.expansion);
            const key = getObjectValueByPath(item, this.itemKey);
            if (value)
                expansion[key] = true;
            else
                delete expansion[key];
            this.expansion = expansion;
            this.$emit('item-expanded', { item, value });
        },
        createItemProps(item, index) {
            return {
                item,
                index,
                select: (v) => this.select(item, v),
                isSelected: this.isSelected(item),
                expand: (v) => this.expand(item, v),
                isExpanded: this.isExpanded(item),
                isMobile: this.isMobile,
            };
        },
        genEmptyWrapper(content) {
            return this.$createElement('div', content);
        },
        genEmpty(originalItemsLength, filteredItemsLength) {
            if (originalItemsLength === 0 && this.loading) {
                const loading = this.$slots.loading || this.$vuetify.lang.t(this.loadingText);
                return this.genEmptyWrapper(loading);
            }
            else if (originalItemsLength === 0) {
                const noData = this.$slots['no-data'] || this.$vuetify.lang.t(this.noDataText);
                return this.genEmptyWrapper(noData);
            }
            else if (filteredItemsLength === 0) {
                const noResults = this.$slots['no-results'] || this.$vuetify.lang.t(this.noResultsText);
                return this.genEmptyWrapper(noResults);
            }
            return null;
        },
        genItems(props) {
            const empty = this.genEmpty(props.originalItemsLength, props.pagination.itemsLength);
            if (empty)
                return [empty];
            if (this.$scopedSlots.default) {
                return this.$scopedSlots.default({
                    ...props,
                    isSelected: this.isSelected,
                    select: this.select,
                    isExpanded: this.isExpanded,
                    isMobile: this.isMobile,
                    expand: this.expand,
                });
            }
            if (this.$scopedSlots.item) {
                return props.items.map((item, index) => this.$scopedSlots.item(this.createItemProps(item, index)));
            }
            return [];
        },
        genFooter(props) {
            if (this.hideDefaultFooter)
                return null;
            const data = {
                props: {
                    ...this.sanitizedFooterProps,
                    options: props.options,
                    pagination: props.pagination,
                },
                on: {
                    'update:options': (value) => props.updateOptions(value),
                },
            };
            const scopedSlots = getPrefixedScopedSlots('footer.', this.$scopedSlots);
            return this.$createElement(VDataFooter, {
                scopedSlots,
                ...data,
            });
        },
        genDefaultScopedSlot(props) {
            const outerProps = {
                ...props,
                someItems: this.someItems,
                everyItem: this.everyItem,
                toggleSelectAll: this.toggleSelectAll,
            };
            return this.$createElement('div', {
                staticClass: 'v-data-iterator',
            }, [
                getSlot(this, 'header', outerProps, true),
                this.genItems(props),
                this.genFooter(props),
                getSlot(this, 'footer', outerProps, true),
            ]);
        },
    },
    render() {
        return this.$createElement(VData, {
            props: this.$props,
            on: {
                'update:options': (v, old) => !deepEqual(v, old) && this.$emit('update:options', v),
                'update:page': (v) => this.$emit('update:page', v),
                'update:items-per-page': (v) => this.$emit('update:items-per-page', v),
                'update:sort-by': (v) => this.$emit('update:sort-by', v),
                'update:sort-desc': (v) => this.$emit('update:sort-desc', v),
                'update:group-by': (v) => this.$emit('update:group-by', v),
                'update:group-desc': (v) => this.$emit('update:group-desc', v),
                pagination: (v, old) => !deepEqual(v, old) && this.$emit('pagination', v),
                'current-items': (v) => {
                    this.internalCurrentItems = v;
                    this.$emit('current-items', v);
                },
                'page-count': (v) => this.$emit('page-count', v),
            },
            scopedSlots: {
                default: this.genDefaultScopedSlot,
            },
        });
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRhdGFJdGVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZEYXRhSXRlcmF0b3IvVkRhdGFJdGVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxhQUFhO0FBQ2IsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUNoQyxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUE7QUFFdkMsU0FBUztBQUNULE9BQU8sTUFBTSxNQUFNLHFCQUFxQixDQUFBO0FBQ3hDLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBRTlDLFVBQVU7QUFDVixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLG9CQUFvQixFQUFFLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNuSSxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBT3RELG9CQUFvQjtBQUNwQixlQUFlLE1BQU0sQ0FDbkIsTUFBTSxFQUNOLFNBQVMsQ0FDVixDQUFDLE1BQU0sQ0FBQztJQUNQLElBQUksRUFBRSxpQkFBaUI7SUFFdkIsS0FBSyxFQUFFO1FBQ0wsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUs7UUFDdEIsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLEtBQUs7WUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtTQUNNO1FBQ3pCLFlBQVksRUFBRSxPQUFPO1FBQ3JCLFFBQVEsRUFBRTtZQUNSLElBQUksRUFBRSxLQUFLO1lBQ1gsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7U0FDTTtRQUN6QixnQkFBZ0IsRUFBRTtZQUNoQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQjtZQUN4QyxPQUFPLEVBQUUsR0FBRztTQUNiO1FBQ0QsWUFBWSxFQUFFLE9BQU87UUFDckIsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQztRQUMxQixhQUFhLEVBQUU7WUFDYixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxxQ0FBcUM7U0FDL0M7UUFDRCxVQUFVLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxxQkFBcUI7U0FDL0I7UUFDRCxXQUFXLEVBQUU7WUFDWCxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxtQ0FBbUM7U0FDN0M7UUFDRCxpQkFBaUIsRUFBRSxPQUFPO1FBQzFCLFdBQVcsRUFBRSxNQUFNO1FBQ25CLGFBQWEsRUFBRTtZQUNiLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLGNBQWM7U0FDeEI7S0FDRjtJQUVELElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsU0FBUyxFQUFFLEVBQXlCO1FBQ3BDLFNBQVMsRUFBRSxFQUE2QjtRQUN4QyxvQkFBb0IsRUFBRSxFQUFXO1FBQ2pDLFlBQVksRUFBRSxLQUFLO1FBQ25CLFNBQVMsRUFBRSxDQUFDLENBQUM7S0FDZCxDQUFDO0lBRUYsUUFBUSxFQUFFO1FBQ1IsU0FBUztZQUNQLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEcsQ0FBQztRQUNELFNBQVM7WUFDUCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEUsQ0FBQztRQUNELG9CQUFvQjtZQUNsQixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUM3QyxDQUFDO1FBQ0QsZUFBZTtZQUNiLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtRQUMxRSxDQUFDO0tBQ0Y7SUFFRCxLQUFLLEVBQUU7UUFDTCxLQUFLLEVBQUU7WUFDTCxPQUFPLENBQUUsS0FBWTtnQkFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFO29CQUNoRCxTQUFTLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtvQkFDMUQsT0FBTyxTQUFTLENBQUE7Z0JBQ2xCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUNSLENBQUM7WUFDRCxTQUFTLEVBQUUsSUFBSTtTQUNoQjtRQUNELFNBQVMsQ0FBRSxLQUE4QixFQUFFLEdBQTRCO1lBQ3JFLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFBRSxPQUFNO1lBRTNELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUMzQyxDQUFDO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsT0FBTyxDQUFFLEtBQVk7Z0JBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRTtvQkFDaEQsU0FBUyxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUE7b0JBQzFELE9BQU8sU0FBUyxDQUFBO2dCQUNsQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDUixDQUFDO1lBQ0QsU0FBUyxFQUFFLElBQUk7U0FDaEI7UUFDRCxTQUFTLENBQUUsS0FBOEIsRUFBRSxHQUE0QjtZQUNyRSxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO2dCQUFFLE9BQU07WUFDakMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNyRCxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3pILElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDekMsQ0FBQztLQUNGO0lBRUQsT0FBTztRQUNMLE1BQU0sYUFBYSxHQUFHO1lBQ3BCLENBQUMsc0JBQXNCLEVBQUUsU0FBUyxDQUFDO1lBQ25DLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQztZQUMzQixDQUFDLFlBQVksRUFBRSxTQUFTLENBQUM7WUFDekIsQ0FBQyxhQUFhLEVBQUUscUJBQXFCLENBQUM7WUFDdEMsQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUM7WUFDdkMsQ0FBQyxxQkFBcUIsRUFBRSxxQ0FBcUMsQ0FBQztZQUM5RCxDQUFDLG9CQUFvQixFQUFFLGtDQUFrQyxDQUFDO1lBQzFELENBQUMsV0FBVyxFQUFFLHdCQUF3QixDQUFDO1lBQ3ZDLENBQUMsV0FBVyxFQUFFLHdCQUF3QixDQUFDO1NBQ3hDLENBQUE7UUFFRCwwQkFBMEI7UUFDMUIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUU7WUFDaEQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7Z0JBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDakYsQ0FBQyxDQUFDLENBQUE7UUFFRixNQUFNLFlBQVksR0FBRztZQUNuQixRQUFRO1lBQ1IsZUFBZTtZQUNmLGVBQWU7WUFDZixhQUFhO1NBQ2QsQ0FBQTtRQUVELDBCQUEwQjtRQUMxQixZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO2dCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNyRCxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxPQUFPO1FBQ0wsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDbEQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDaEQsQ0FBQztJQUNELGFBQWE7UUFDWCxNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNyRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBRUQsT0FBTyxFQUFFO1FBQ1AsU0FBUyxDQUFFLENBQWdCO1lBQ3pCLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxRQUFRLENBQUMsS0FBSztnQkFBRSxPQUFNO1lBQ3hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO1FBQzFCLENBQUM7UUFDRCxPQUFPLENBQUUsQ0FBZ0I7WUFDdkIsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxLQUFLO2dCQUFFLE9BQU07WUFDeEMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7UUFDM0IsQ0FBQztRQUNELGVBQWUsQ0FBRSxLQUFjO1lBQzdCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUVuRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBRXBDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztvQkFBRSxTQUFRO2dCQUV0QyxNQUFNLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUNwRCxJQUFJLEtBQUs7b0JBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTs7b0JBQzNCLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQzNCO1lBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7WUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtRQUM5RSxDQUFDO1FBQ0QsWUFBWSxDQUFFLElBQVM7WUFDckIsT0FBTyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEtBQUssQ0FBQTtRQUNqRSxDQUFDO1FBQ0QsVUFBVSxDQUFFLElBQVM7WUFDbkIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFBO1FBQzVFLENBQUM7UUFDRCxNQUFNLENBQUUsSUFBUyxFQUFFLEtBQUssR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUk7WUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO2dCQUFFLE9BQU07WUFFcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDNUUsTUFBTSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUVwRCxJQUFJLEtBQUs7Z0JBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTs7Z0JBQzNCLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBRTFCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQTtZQUNoRyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDO2dCQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFBO2lCQUM1QyxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksRUFBRTtnQkFDeEQsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUM3RixNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQTtnQkFDdkYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFBO2FBQ2xFO1lBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUE7WUFFdEIsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksRUFBRTtnQkFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ3hDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBQ3RGLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7YUFDL0Y7WUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtZQUMxQixJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtRQUN0RCxDQUFDO1FBQ0QsY0FBYyxDQUFFLEtBQUssR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksRUFBRSxTQUFjLEVBQUUsS0FBYTtZQUN0RSxNQUFNLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFBO1lBQzdELE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7WUFDM0QsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDM0MsTUFBTSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFDM0QsSUFBSSxLQUFLO29CQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUE7O29CQUNsQyxPQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDMUIsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7YUFDNUQ7UUFDSCxDQUFDO1FBQ0QsVUFBVSxDQUFFLElBQVM7WUFDbkIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUE7UUFDMUUsQ0FBQztRQUNELE1BQU0sQ0FBRSxJQUFTLEVBQUUsS0FBSyxHQUFHLElBQUk7WUFDN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDNUUsTUFBTSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUVwRCxJQUFJLEtBQUs7Z0JBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTs7Z0JBQzNCLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBRTFCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1lBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDOUMsQ0FBQztRQUNELGVBQWUsQ0FBRSxJQUFTLEVBQUUsS0FBYTtZQUN2QyxPQUFPO2dCQUNMLElBQUk7Z0JBQ0osS0FBSztnQkFDTCxNQUFNLEVBQUUsQ0FBQyxDQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDNUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUNqQyxNQUFNLEVBQUUsQ0FBQyxDQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDNUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUNqQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7YUFDeEIsQ0FBQTtRQUNILENBQUM7UUFDRCxlQUFlLENBQUUsT0FBc0I7WUFDckMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUM1QyxDQUFDO1FBQ0QsUUFBUSxDQUFFLG1CQUEyQixFQUFFLG1CQUEyQjtZQUNoRSxJQUFJLG1CQUFtQixLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO2dCQUM3RSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUE7YUFDckM7aUJBQU0sSUFBSSxtQkFBbUIsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDOUUsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2FBQ3BDO2lCQUFNLElBQUksbUJBQW1CLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7Z0JBQ3ZGLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQTthQUN2QztZQUVELE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQztRQUNELFFBQVEsQ0FBRSxLQUFxQjtZQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQ3BGLElBQUksS0FBSztnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7WUFFekIsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRTtnQkFDN0IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztvQkFDL0IsR0FBRyxLQUFLO29CQUNSLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtvQkFDM0IsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO29CQUNuQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7b0JBQzNCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDdkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2lCQUNwQixDQUFDLENBQUE7YUFDSDtZQUVELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUU7Z0JBQzFCLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUN2RixJQUFJLEVBQ0osS0FBSyxDQUNOLENBQUMsQ0FBQyxDQUFBO2FBQ0o7WUFFRCxPQUFPLEVBQUUsQ0FBQTtRQUNYLENBQUM7UUFDRCxTQUFTLENBQUUsS0FBcUI7WUFDOUIsSUFBSSxJQUFJLENBQUMsaUJBQWlCO2dCQUFFLE9BQU8sSUFBSSxDQUFBO1lBRXZDLE1BQU0sSUFBSSxHQUFHO2dCQUNYLEtBQUssRUFBRTtvQkFDTCxHQUFHLElBQUksQ0FBQyxvQkFBb0I7b0JBQzVCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztvQkFDdEIsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO2lCQUM3QjtnQkFDRCxFQUFFLEVBQUU7b0JBQ0YsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO2lCQUM3RDthQUNGLENBQUE7WUFFRCxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBRXhFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RDLFdBQVc7Z0JBQ1gsR0FBRyxJQUFJO2FBQ1IsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELG9CQUFvQixDQUFFLEtBQVU7WUFDOUIsTUFBTSxVQUFVLEdBQUc7Z0JBQ2pCLEdBQUcsS0FBSztnQkFDUixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7Z0JBQ3pCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDekIsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO2FBQ3RDLENBQUE7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO2dCQUNoQyxXQUFXLEVBQUUsaUJBQWlCO2FBQy9CLEVBQUU7Z0JBQ0QsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQztnQkFDekMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO2dCQUNyQixPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDO2FBQzFDLENBQUMsQ0FBQTtRQUNKLENBQUM7S0FDRjtJQUVELE1BQU07UUFDSixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO1lBQ2hDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNsQixFQUFFLEVBQUU7Z0JBQ0YsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFNLEVBQUUsR0FBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7Z0JBQzdGLGFBQWEsRUFBRSxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RCx1QkFBdUIsRUFBRSxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7Z0JBQzNFLGdCQUFnQixFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztnQkFDN0Qsa0JBQWtCLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRSxpQkFBaUIsRUFBRSxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7Z0JBQy9ELG1CQUFtQixFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztnQkFDbkUsVUFBVSxFQUFFLENBQUMsQ0FBTSxFQUFFLEdBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztnQkFDbkYsZUFBZSxFQUFFLENBQUMsQ0FBUSxFQUFFLEVBQUU7b0JBQzVCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUE7b0JBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFBO2dCQUNoQyxDQUFDO2dCQUNELFlBQVksRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsV0FBVyxFQUFFO2dCQUNYLE9BQU8sRUFBRSxJQUFJLENBQUMsb0JBQW9CO2FBQ25DO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvbXBvbmVudHNcbmltcG9ydCB7IFZEYXRhIH0gZnJvbSAnLi4vVkRhdGEnXG5pbXBvcnQgVkRhdGFGb290ZXIgZnJvbSAnLi9WRGF0YUZvb3RlcidcblxuLy8gTWl4aW5zXG5pbXBvcnQgTW9iaWxlIGZyb20gJy4uLy4uL21peGlucy9tb2JpbGUnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5cbi8vIEhlbHBlcnNcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBkZWVwRXF1YWwsIGdldE9iamVjdFZhbHVlQnlQYXRoLCBnZXRQcmVmaXhlZFNjb3BlZFNsb3RzLCBnZXRTbG90LCBjYW1lbGl6ZU9iamVjdEtleXMsIGtleUNvZGVzIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgYnJlYWtpbmcsIHJlbW92ZWQgfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVDaGlsZHJlbiB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFByb3BWYWxpZGF0b3IgfSBmcm9tICd2dWUvdHlwZXMvb3B0aW9ucydcbmltcG9ydCB7IERhdGFJdGVtUHJvcHMsIERhdGFTY29wZVByb3BzIH0gZnJvbSAndnVldGlmeS90eXBlcydcblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IG1peGlucyhcbiAgTW9iaWxlLFxuICBUaGVtZWFibGVcbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtZGF0YS1pdGVyYXRvcicsXG5cbiAgcHJvcHM6IHtcbiAgICAuLi5WRGF0YS5vcHRpb25zLnByb3BzLCAvLyBUT0RPOiBmaWx0ZXIgb3V0IHByb3BzIG5vdCB1c2VkXG4gICAgaXRlbUtleToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2lkJyxcbiAgICB9LFxuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiBBcnJheSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+IFtdLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxhbnlbXT4sXG4gICAgc2luZ2xlU2VsZWN0OiBCb29sZWFuLFxuICAgIGV4cGFuZGVkOiB7XG4gICAgICB0eXBlOiBBcnJheSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+IFtdLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxhbnlbXT4sXG4gICAgbW9iaWxlQnJlYWtwb2ludDoge1xuICAgICAgLi4uTW9iaWxlLm9wdGlvbnMucHJvcHMubW9iaWxlQnJlYWtwb2ludCxcbiAgICAgIGRlZmF1bHQ6IDYwMCxcbiAgICB9LFxuICAgIHNpbmdsZUV4cGFuZDogQm9vbGVhbixcbiAgICBsb2FkaW5nOiBbQm9vbGVhbiwgU3RyaW5nXSxcbiAgICBub1Jlc3VsdHNUZXh0OiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkuZGF0YUl0ZXJhdG9yLm5vUmVzdWx0c1RleHQnLFxuICAgIH0sXG4gICAgbm9EYXRhVGV4dDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyR2dWV0aWZ5Lm5vRGF0YVRleHQnLFxuICAgIH0sXG4gICAgbG9hZGluZ1RleHQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5kYXRhSXRlcmF0b3IubG9hZGluZ1RleHQnLFxuICAgIH0sXG4gICAgaGlkZURlZmF1bHRGb290ZXI6IEJvb2xlYW4sXG4gICAgZm9vdGVyUHJvcHM6IE9iamVjdCxcbiAgICBzZWxlY3RhYmxlS2V5OiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnaXNTZWxlY3RhYmxlJyxcbiAgICB9LFxuICB9LFxuXG4gIGRhdGE6ICgpID0+ICh7XG4gICAgc2VsZWN0aW9uOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuICAgIGV4cGFuc2lvbjoge30gYXMgUmVjb3JkPHN0cmluZywgYm9vbGVhbj4sXG4gICAgaW50ZXJuYWxDdXJyZW50SXRlbXM6IFtdIGFzIGFueVtdLFxuICAgIHNoaWZ0S2V5RG93bjogZmFsc2UsXG4gICAgbGFzdEVudHJ5OiAtMSxcbiAgfSksXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBldmVyeUl0ZW0gKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuICEhdGhpcy5zZWxlY3RhYmxlSXRlbXMubGVuZ3RoICYmIHRoaXMuc2VsZWN0YWJsZUl0ZW1zLmV2ZXJ5KChpOiBhbnkpID0+IHRoaXMuaXNTZWxlY3RlZChpKSlcbiAgICB9LFxuICAgIHNvbWVJdGVtcyAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RhYmxlSXRlbXMuc29tZSgoaTogYW55KSA9PiB0aGlzLmlzU2VsZWN0ZWQoaSkpXG4gICAgfSxcbiAgICBzYW5pdGl6ZWRGb290ZXJQcm9wcyAoKTogUmVjb3JkPHN0cmluZywgYW55PiB7XG4gICAgICByZXR1cm4gY2FtZWxpemVPYmplY3RLZXlzKHRoaXMuZm9vdGVyUHJvcHMpXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlSXRlbXMgKCk6IGFueVtdIHtcbiAgICAgIHJldHVybiB0aGlzLmludGVybmFsQ3VycmVudEl0ZW1zLmZpbHRlcihpdGVtID0+IHRoaXMuaXNTZWxlY3RhYmxlKGl0ZW0pKVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICB2YWx1ZToge1xuICAgICAgaGFuZGxlciAodmFsdWU6IGFueVtdKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0aW9uID0gdmFsdWUucmVkdWNlKChzZWxlY3Rpb24sIGl0ZW0pID0+IHtcbiAgICAgICAgICBzZWxlY3Rpb25bZ2V0T2JqZWN0VmFsdWVCeVBhdGgoaXRlbSwgdGhpcy5pdGVtS2V5KV0gPSBpdGVtXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblxuICAgICAgICB9LCB7fSlcbiAgICAgIH0sXG4gICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgfSxcbiAgICBzZWxlY3Rpb24gKHZhbHVlOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiwgb2xkOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPikge1xuICAgICAgaWYgKGRlZXBFcXVhbChPYmplY3Qua2V5cyh2YWx1ZSksIE9iamVjdC5rZXlzKG9sZCkpKSByZXR1cm5cblxuICAgICAgdGhpcy4kZW1pdCgnaW5wdXQnLCBPYmplY3QudmFsdWVzKHZhbHVlKSlcbiAgICB9LFxuICAgIGV4cGFuZGVkOiB7XG4gICAgICBoYW5kbGVyICh2YWx1ZTogYW55W10pIHtcbiAgICAgICAgdGhpcy5leHBhbnNpb24gPSB2YWx1ZS5yZWR1Y2UoKGV4cGFuc2lvbiwgaXRlbSkgPT4ge1xuICAgICAgICAgIGV4cGFuc2lvbltnZXRPYmplY3RWYWx1ZUJ5UGF0aChpdGVtLCB0aGlzLml0ZW1LZXkpXSA9IHRydWVcbiAgICAgICAgICByZXR1cm4gZXhwYW5zaW9uXG4gICAgICAgIH0sIHt9KVxuICAgICAgfSxcbiAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICB9LFxuICAgIGV4cGFuc2lvbiAodmFsdWU6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LCBvbGQ6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+KSB7XG4gICAgICBpZiAoZGVlcEVxdWFsKHZhbHVlLCBvbGQpKSByZXR1cm5cbiAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSkuZmlsdGVyKGsgPT4gdmFsdWVba10pXG4gICAgICBjb25zdCBleHBhbmRlZCA9ICFrZXlzLmxlbmd0aCA/IFtdIDogdGhpcy5pdGVtcy5maWx0ZXIoaSA9PiBrZXlzLmluY2x1ZGVzKFN0cmluZyhnZXRPYmplY3RWYWx1ZUJ5UGF0aChpLCB0aGlzLml0ZW1LZXkpKSkpXG4gICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6ZXhwYW5kZWQnLCBleHBhbmRlZClcbiAgICB9LFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIGNvbnN0IGJyZWFraW5nUHJvcHMgPSBbXG4gICAgICBbJ2Rpc2FibGUtaW5pdGlhbC1zb3J0JywgJ3NvcnQtYnknXSxcbiAgICAgIFsnZmlsdGVyJywgJ2N1c3RvbS1maWx0ZXInXSxcbiAgICAgIFsncGFnaW5hdGlvbicsICdvcHRpb25zJ10sXG4gICAgICBbJ3RvdGFsLWl0ZW1zJywgJ3NlcnZlci1pdGVtcy1sZW5ndGgnXSxcbiAgICAgIFsnaGlkZS1hY3Rpb25zJywgJ2hpZGUtZGVmYXVsdC1mb290ZXInXSxcbiAgICAgIFsncm93cy1wZXItcGFnZS1pdGVtcycsICdmb290ZXItcHJvcHMuaXRlbXMtcGVyLXBhZ2Utb3B0aW9ucyddLFxuICAgICAgWydyb3dzLXBlci1wYWdlLXRleHQnLCAnZm9vdGVyLXByb3BzLml0ZW1zLXBlci1wYWdlLXRleHQnXSxcbiAgICAgIFsncHJldi1pY29uJywgJ2Zvb3Rlci1wcm9wcy5wcmV2LWljb24nXSxcbiAgICAgIFsnbmV4dC1pY29uJywgJ2Zvb3Rlci1wcm9wcy5uZXh0LWljb24nXSxcbiAgICBdXG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGJyZWFraW5nUHJvcHMuZm9yRWFjaCgoW29yaWdpbmFsLCByZXBsYWNlbWVudF0pID0+IHtcbiAgICAgIGlmICh0aGlzLiRhdHRycy5oYXNPd25Qcm9wZXJ0eShvcmlnaW5hbCkpIGJyZWFraW5nKG9yaWdpbmFsLCByZXBsYWNlbWVudCwgdGhpcylcbiAgICB9KVxuXG4gICAgY29uc3QgcmVtb3ZlZFByb3BzID0gW1xuICAgICAgJ2V4cGFuZCcsXG4gICAgICAnY29udGVudC1jbGFzcycsXG4gICAgICAnY29udGVudC1wcm9wcycsXG4gICAgICAnY29udGVudC10YWcnLFxuICAgIF1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgcmVtb3ZlZFByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICBpZiAodGhpcy4kYXR0cnMuaGFzT3duUHJvcGVydHkocHJvcCkpIHJlbW92ZWQocHJvcClcbiAgICB9KVxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24pXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwKVxuICB9LFxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duKVxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgb25LZXlEb3duIChlOiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgICBpZiAoZS5rZXlDb2RlICE9PSBrZXlDb2Rlcy5zaGlmdCkgcmV0dXJuXG4gICAgICB0aGlzLnNoaWZ0S2V5RG93biA9IHRydWVcbiAgICB9LFxuICAgIG9uS2V5VXAgKGU6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICAgIGlmIChlLmtleUNvZGUgIT09IGtleUNvZGVzLnNoaWZ0KSByZXR1cm5cbiAgICAgIHRoaXMuc2hpZnRLZXlEb3duID0gZmFsc2VcbiAgICB9LFxuICAgIHRvZ2dsZVNlbGVjdEFsbCAodmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc2VsZWN0aW9uKVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2VsZWN0YWJsZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnNlbGVjdGFibGVJdGVtc1tpXVxuXG4gICAgICAgIGlmICghdGhpcy5pc1NlbGVjdGFibGUoaXRlbSkpIGNvbnRpbnVlXG5cbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0T2JqZWN0VmFsdWVCeVBhdGgoaXRlbSwgdGhpcy5pdGVtS2V5KVxuICAgICAgICBpZiAodmFsdWUpIHNlbGVjdGlvbltrZXldID0gaXRlbVxuICAgICAgICBlbHNlIGRlbGV0ZSBzZWxlY3Rpb25ba2V5XVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNlbGVjdGlvbiA9IHNlbGVjdGlvblxuICAgICAgdGhpcy4kZW1pdCgndG9nZ2xlLXNlbGVjdC1hbGwnLCB7IGl0ZW1zOiB0aGlzLmludGVybmFsQ3VycmVudEl0ZW1zLCB2YWx1ZSB9KVxuICAgIH0sXG4gICAgaXNTZWxlY3RhYmxlIChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBnZXRPYmplY3RWYWx1ZUJ5UGF0aChpdGVtLCB0aGlzLnNlbGVjdGFibGVLZXkpICE9PSBmYWxzZVxuICAgIH0sXG4gICAgaXNTZWxlY3RlZCAoaXRlbTogYW55KTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gISF0aGlzLnNlbGVjdGlvbltnZXRPYmplY3RWYWx1ZUJ5UGF0aChpdGVtLCB0aGlzLml0ZW1LZXkpXSB8fCBmYWxzZVxuICAgIH0sXG4gICAgc2VsZWN0IChpdGVtOiBhbnksIHZhbHVlID0gdHJ1ZSwgZW1pdCA9IHRydWUpOiB2b2lkIHtcbiAgICAgIGlmICghdGhpcy5pc1NlbGVjdGFibGUoaXRlbSkpIHJldHVyblxuXG4gICAgICBjb25zdCBzZWxlY3Rpb24gPSB0aGlzLnNpbmdsZVNlbGVjdCA/IHt9IDogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zZWxlY3Rpb24pXG4gICAgICBjb25zdCBrZXkgPSBnZXRPYmplY3RWYWx1ZUJ5UGF0aChpdGVtLCB0aGlzLml0ZW1LZXkpXG5cbiAgICAgIGlmICh2YWx1ZSkgc2VsZWN0aW9uW2tleV0gPSBpdGVtXG4gICAgICBlbHNlIGRlbGV0ZSBzZWxlY3Rpb25ba2V5XVxuXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc2VsZWN0YWJsZUl0ZW1zLmZpbmRJbmRleCh4ID0+IGdldE9iamVjdFZhbHVlQnlQYXRoKHgsIHRoaXMuaXRlbUtleSkgPT09IGtleSlcbiAgICAgIGlmICh0aGlzLmxhc3RFbnRyeSA9PT0gLTEpIHRoaXMubGFzdEVudHJ5ID0gaW5kZXhcbiAgICAgIGVsc2UgaWYgKHRoaXMuc2hpZnRLZXlEb3duICYmICF0aGlzLnNpbmdsZVNlbGVjdCAmJiBlbWl0KSB7XG4gICAgICAgIGNvbnN0IGxhc3RFbnRyeUtleSA9IGdldE9iamVjdFZhbHVlQnlQYXRoKHRoaXMuc2VsZWN0YWJsZUl0ZW1zW3RoaXMubGFzdEVudHJ5XSwgdGhpcy5pdGVtS2V5KVxuICAgICAgICBjb25zdCBsYXN0RW50cnlLZXlTZWxlY3RlZCA9IE9iamVjdC5rZXlzKHRoaXMuc2VsZWN0aW9uKS5pbmNsdWRlcyhTdHJpbmcobGFzdEVudHJ5S2V5KSlcbiAgICAgICAgdGhpcy5tdWx0aXBsZVNlbGVjdChsYXN0RW50cnlLZXlTZWxlY3RlZCwgZW1pdCwgc2VsZWN0aW9uLCBpbmRleClcbiAgICAgIH1cbiAgICAgIHRoaXMubGFzdEVudHJ5ID0gaW5kZXhcblxuICAgICAgaWYgKHRoaXMuc2luZ2xlU2VsZWN0ICYmIGVtaXQpIHtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuc2VsZWN0aW9uKVxuICAgICAgICBjb25zdCBvbGQgPSBrZXlzLmxlbmd0aCAmJiBnZXRPYmplY3RWYWx1ZUJ5UGF0aCh0aGlzLnNlbGVjdGlvbltrZXlzWzBdXSwgdGhpcy5pdGVtS2V5KVxuICAgICAgICBvbGQgJiYgb2xkICE9PSBrZXkgJiYgdGhpcy4kZW1pdCgnaXRlbS1zZWxlY3RlZCcsIHsgaXRlbTogdGhpcy5zZWxlY3Rpb25bb2xkXSwgdmFsdWU6IGZhbHNlIH0pXG4gICAgICB9XG4gICAgICB0aGlzLnNlbGVjdGlvbiA9IHNlbGVjdGlvblxuICAgICAgZW1pdCAmJiB0aGlzLiRlbWl0KCdpdGVtLXNlbGVjdGVkJywgeyBpdGVtLCB2YWx1ZSB9KVxuICAgIH0sXG4gICAgbXVsdGlwbGVTZWxlY3QgKHZhbHVlID0gdHJ1ZSwgZW1pdCA9IHRydWUsIHNlbGVjdGlvbjogYW55LCBpbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgICBjb25zdCBzdGFydCA9IGluZGV4IDwgdGhpcy5sYXN0RW50cnkgPyBpbmRleCA6IHRoaXMubGFzdEVudHJ5XG4gICAgICBjb25zdCBlbmQgPSBpbmRleCA8IHRoaXMubGFzdEVudHJ5ID8gdGhpcy5sYXN0RW50cnkgOiBpbmRleFxuICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRJdGVtID0gdGhpcy5zZWxlY3RhYmxlSXRlbXNbaV1cbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0T2JqZWN0VmFsdWVCeVBhdGgoY3VycmVudEl0ZW0sIHRoaXMuaXRlbUtleSlcbiAgICAgICAgaWYgKHZhbHVlKSBzZWxlY3Rpb25ba2V5XSA9IGN1cnJlbnRJdGVtXG4gICAgICAgIGVsc2UgZGVsZXRlIHNlbGVjdGlvbltrZXldXG4gICAgICAgIGVtaXQgJiYgdGhpcy4kZW1pdCgnaXRlbS1zZWxlY3RlZCcsIHsgY3VycmVudEl0ZW0sIHZhbHVlIH0pXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0V4cGFuZGVkIChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuc2lvbltnZXRPYmplY3RWYWx1ZUJ5UGF0aChpdGVtLCB0aGlzLml0ZW1LZXkpXSB8fCBmYWxzZVxuICAgIH0sXG4gICAgZXhwYW5kIChpdGVtOiBhbnksIHZhbHVlID0gdHJ1ZSk6IHZvaWQge1xuICAgICAgY29uc3QgZXhwYW5zaW9uID0gdGhpcy5zaW5nbGVFeHBhbmQgPyB7fSA6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZXhwYW5zaW9uKVxuICAgICAgY29uc3Qga2V5ID0gZ2V0T2JqZWN0VmFsdWVCeVBhdGgoaXRlbSwgdGhpcy5pdGVtS2V5KVxuXG4gICAgICBpZiAodmFsdWUpIGV4cGFuc2lvbltrZXldID0gdHJ1ZVxuICAgICAgZWxzZSBkZWxldGUgZXhwYW5zaW9uW2tleV1cblxuICAgICAgdGhpcy5leHBhbnNpb24gPSBleHBhbnNpb25cbiAgICAgIHRoaXMuJGVtaXQoJ2l0ZW0tZXhwYW5kZWQnLCB7IGl0ZW0sIHZhbHVlIH0pXG4gICAgfSxcbiAgICBjcmVhdGVJdGVtUHJvcHMgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcik6IERhdGFJdGVtUHJvcHMge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXRlbSxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIHNlbGVjdDogKHY6IGJvb2xlYW4pID0+IHRoaXMuc2VsZWN0KGl0ZW0sIHYpLFxuICAgICAgICBpc1NlbGVjdGVkOiB0aGlzLmlzU2VsZWN0ZWQoaXRlbSksXG4gICAgICAgIGV4cGFuZDogKHY6IGJvb2xlYW4pID0+IHRoaXMuZXhwYW5kKGl0ZW0sIHYpLFxuICAgICAgICBpc0V4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoaXRlbSksXG4gICAgICAgIGlzTW9iaWxlOiB0aGlzLmlzTW9iaWxlLFxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuRW1wdHlXcmFwcGVyIChjb250ZW50OiBWTm9kZUNoaWxkcmVuKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2JywgY29udGVudClcbiAgICB9LFxuICAgIGdlbkVtcHR5IChvcmlnaW5hbEl0ZW1zTGVuZ3RoOiBudW1iZXIsIGZpbHRlcmVkSXRlbXNMZW5ndGg6IG51bWJlcikge1xuICAgICAgaWYgKG9yaWdpbmFsSXRlbXNMZW5ndGggPT09IDAgJiYgdGhpcy5sb2FkaW5nKSB7XG4gICAgICAgIGNvbnN0IGxvYWRpbmcgPSB0aGlzLiRzbG90cy5sb2FkaW5nIHx8IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMubG9hZGluZ1RleHQpXG4gICAgICAgIHJldHVybiB0aGlzLmdlbkVtcHR5V3JhcHBlcihsb2FkaW5nKVxuICAgICAgfSBlbHNlIGlmIChvcmlnaW5hbEl0ZW1zTGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnN0IG5vRGF0YSA9IHRoaXMuJHNsb3RzWyduby1kYXRhJ10gfHwgdGhpcy4kdnVldGlmeS5sYW5nLnQodGhpcy5ub0RhdGFUZXh0KVxuICAgICAgICByZXR1cm4gdGhpcy5nZW5FbXB0eVdyYXBwZXIobm9EYXRhKVxuICAgICAgfSBlbHNlIGlmIChmaWx0ZXJlZEl0ZW1zTGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnN0IG5vUmVzdWx0cyA9IHRoaXMuJHNsb3RzWyduby1yZXN1bHRzJ10gfHwgdGhpcy4kdnVldGlmeS5sYW5nLnQodGhpcy5ub1Jlc3VsdHNUZXh0KVxuICAgICAgICByZXR1cm4gdGhpcy5nZW5FbXB0eVdyYXBwZXIobm9SZXN1bHRzKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG4gICAgZ2VuSXRlbXMgKHByb3BzOiBEYXRhU2NvcGVQcm9wcykge1xuICAgICAgY29uc3QgZW1wdHkgPSB0aGlzLmdlbkVtcHR5KHByb3BzLm9yaWdpbmFsSXRlbXNMZW5ndGgsIHByb3BzLnBhZ2luYXRpb24uaXRlbXNMZW5ndGgpXG4gICAgICBpZiAoZW1wdHkpIHJldHVybiBbZW1wdHldXG5cbiAgICAgIGlmICh0aGlzLiRzY29wZWRTbG90cy5kZWZhdWx0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRzY29wZWRTbG90cy5kZWZhdWx0KHtcbiAgICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgICBpc1NlbGVjdGVkOiB0aGlzLmlzU2VsZWN0ZWQsXG4gICAgICAgICAgc2VsZWN0OiB0aGlzLnNlbGVjdCxcbiAgICAgICAgICBpc0V4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQsXG4gICAgICAgICAgaXNNb2JpbGU6IHRoaXMuaXNNb2JpbGUsXG4gICAgICAgICAgZXhwYW5kOiB0aGlzLmV4cGFuZCxcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuJHNjb3BlZFNsb3RzLml0ZW0pIHtcbiAgICAgICAgcmV0dXJuIHByb3BzLml0ZW1zLm1hcCgoaXRlbTogYW55LCBpbmRleCkgPT4gdGhpcy4kc2NvcGVkU2xvdHMuaXRlbSEodGhpcy5jcmVhdGVJdGVtUHJvcHMoXG4gICAgICAgICAgaXRlbSxcbiAgICAgICAgICBpbmRleFxuICAgICAgICApKSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtdXG4gICAgfSxcbiAgICBnZW5Gb290ZXIgKHByb3BzOiBEYXRhU2NvcGVQcm9wcykge1xuICAgICAgaWYgKHRoaXMuaGlkZURlZmF1bHRGb290ZXIpIHJldHVybiBudWxsXG5cbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgLi4udGhpcy5zYW5pdGl6ZWRGb290ZXJQcm9wcyxcbiAgICAgICAgICBvcHRpb25zOiBwcm9wcy5vcHRpb25zLFxuICAgICAgICAgIHBhZ2luYXRpb246IHByb3BzLnBhZ2luYXRpb24sXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgJ3VwZGF0ZTpvcHRpb25zJzogKHZhbHVlOiBhbnkpID0+IHByb3BzLnVwZGF0ZU9wdGlvbnModmFsdWUpLFxuICAgICAgICB9LFxuICAgICAgfVxuXG4gICAgICBjb25zdCBzY29wZWRTbG90cyA9IGdldFByZWZpeGVkU2NvcGVkU2xvdHMoJ2Zvb3Rlci4nLCB0aGlzLiRzY29wZWRTbG90cylcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkRhdGFGb290ZXIsIHtcbiAgICAgICAgc2NvcGVkU2xvdHMsXG4gICAgICAgIC4uLmRhdGEsXG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2VuRGVmYXVsdFNjb3BlZFNsb3QgKHByb3BzOiBhbnkpIHtcbiAgICAgIGNvbnN0IG91dGVyUHJvcHMgPSB7XG4gICAgICAgIC4uLnByb3BzLFxuICAgICAgICBzb21lSXRlbXM6IHRoaXMuc29tZUl0ZW1zLFxuICAgICAgICBldmVyeUl0ZW06IHRoaXMuZXZlcnlJdGVtLFxuICAgICAgICB0b2dnbGVTZWxlY3RBbGw6IHRoaXMudG9nZ2xlU2VsZWN0QWxsLFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtZGF0YS1pdGVyYXRvcicsXG4gICAgICB9LCBbXG4gICAgICAgIGdldFNsb3QodGhpcywgJ2hlYWRlcicsIG91dGVyUHJvcHMsIHRydWUpLFxuICAgICAgICB0aGlzLmdlbkl0ZW1zKHByb3BzKSxcbiAgICAgICAgdGhpcy5nZW5Gb290ZXIocHJvcHMpLFxuICAgICAgICBnZXRTbG90KHRoaXMsICdmb290ZXInLCBvdXRlclByb3BzLCB0cnVlKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKCk6IFZOb2RlIHtcbiAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRGF0YSwge1xuICAgICAgcHJvcHM6IHRoaXMuJHByb3BzLFxuICAgICAgb246IHtcbiAgICAgICAgJ3VwZGF0ZTpvcHRpb25zJzogKHY6IGFueSwgb2xkOiBhbnkpID0+ICFkZWVwRXF1YWwodiwgb2xkKSAmJiB0aGlzLiRlbWl0KCd1cGRhdGU6b3B0aW9ucycsIHYpLFxuICAgICAgICAndXBkYXRlOnBhZ2UnOiAodjogYW55KSA9PiB0aGlzLiRlbWl0KCd1cGRhdGU6cGFnZScsIHYpLFxuICAgICAgICAndXBkYXRlOml0ZW1zLXBlci1wYWdlJzogKHY6IGFueSkgPT4gdGhpcy4kZW1pdCgndXBkYXRlOml0ZW1zLXBlci1wYWdlJywgdiksXG4gICAgICAgICd1cGRhdGU6c29ydC1ieSc6ICh2OiBhbnkpID0+IHRoaXMuJGVtaXQoJ3VwZGF0ZTpzb3J0LWJ5JywgdiksXG4gICAgICAgICd1cGRhdGU6c29ydC1kZXNjJzogKHY6IGFueSkgPT4gdGhpcy4kZW1pdCgndXBkYXRlOnNvcnQtZGVzYycsIHYpLFxuICAgICAgICAndXBkYXRlOmdyb3VwLWJ5JzogKHY6IGFueSkgPT4gdGhpcy4kZW1pdCgndXBkYXRlOmdyb3VwLWJ5JywgdiksXG4gICAgICAgICd1cGRhdGU6Z3JvdXAtZGVzYyc6ICh2OiBhbnkpID0+IHRoaXMuJGVtaXQoJ3VwZGF0ZTpncm91cC1kZXNjJywgdiksXG4gICAgICAgIHBhZ2luYXRpb246ICh2OiBhbnksIG9sZDogYW55KSA9PiAhZGVlcEVxdWFsKHYsIG9sZCkgJiYgdGhpcy4kZW1pdCgncGFnaW5hdGlvbicsIHYpLFxuICAgICAgICAnY3VycmVudC1pdGVtcyc6ICh2OiBhbnlbXSkgPT4ge1xuICAgICAgICAgIHRoaXMuaW50ZXJuYWxDdXJyZW50SXRlbXMgPSB2XG4gICAgICAgICAgdGhpcy4kZW1pdCgnY3VycmVudC1pdGVtcycsIHYpXG4gICAgICAgIH0sXG4gICAgICAgICdwYWdlLWNvdW50JzogKHY6IG51bWJlcikgPT4gdGhpcy4kZW1pdCgncGFnZS1jb3VudCcsIHYpLFxuICAgICAgfSxcbiAgICAgIHNjb3BlZFNsb3RzOiB7XG4gICAgICAgIGRlZmF1bHQ6IHRoaXMuZ2VuRGVmYXVsdFNjb3BlZFNsb3QsXG4gICAgICB9LFxuICAgIH0pXG4gIH0sXG59KVxuIl19
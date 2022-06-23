import './VDataTable.sass';
// Components
import { VData } from '../VData';
import { VDataFooter, VDataIterator } from '../VDataIterator';
import VBtn from '../VBtn';
import VDataTableHeader from './VDataTableHeader';
// import VVirtualTable from './VVirtualTable'
import VIcon from '../VIcon';
import Row from './Row';
import RowGroup from './RowGroup';
import VSimpleCheckbox from '../VCheckbox/VSimpleCheckbox';
import VSimpleTable from './VSimpleTable';
import MobileRow from './MobileRow';
// Mixins
import Loadable from '../../mixins/loadable';
// Directives
import ripple from '../../directives/ripple';
// Helpers
import mixins from '../../util/mixins';
import { deepEqual, getObjectValueByPath, getPrefixedScopedSlots, getSlot, defaultFilter, camelizeObjectKeys, getPropertyFromItem } from '../../util/helpers';
import { breaking } from '../../util/console';
import { mergeClasses } from '../../util/mergeData';
function filterFn(item, search, filter) {
    return (header) => {
        const value = getObjectValueByPath(item, header.value);
        return header.filter ? header.filter(value, search, item) : filter(value, search, item);
    };
}
function searchTableItems(items, search, headersWithCustomFilters, headersWithoutCustomFilters, customFilter) {
    search = typeof search === 'string' ? search.trim() : null;
    return items.filter(item => {
        // Headers with custom filters are evaluated whether or not a search term has been provided.
        // We need to match every filter to be included in the results.
        const matchesColumnFilters = headersWithCustomFilters.every(filterFn(item, search, defaultFilter));
        // Headers without custom filters are only filtered by the `search` property if it is defined.
        // We only need a single column to match the search term to be included in the results.
        const matchesSearchTerm = !search || headersWithoutCustomFilters.some(filterFn(item, search, customFilter));
        return matchesColumnFilters && matchesSearchTerm;
    });
}
/* @vue/component */
export default mixins(VDataIterator, Loadable).extend({
    name: 'v-data-table',
    // https://github.com/vuejs/vue/issues/6872
    directives: {
        ripple,
    },
    props: {
        headers: {
            type: Array,
            default: () => [],
        },
        showSelect: Boolean,
        checkboxColor: String,
        showExpand: Boolean,
        showGroupBy: Boolean,
        // TODO: Fix
        // virtualRows: Boolean,
        height: [Number, String],
        hideDefaultHeader: Boolean,
        caption: String,
        dense: Boolean,
        headerProps: Object,
        calculateWidths: Boolean,
        fixedHeader: Boolean,
        headersLength: Number,
        expandIcon: {
            type: String,
            default: '$expand',
        },
        customFilter: {
            type: Function,
            default: defaultFilter,
        },
        itemClass: {
            type: [String, Function],
            default: () => '',
        },
        loaderHeight: {
            type: [Number, String],
            default: 4,
        },
    },
    data() {
        return {
            internalGroupBy: [],
            openCache: {},
            widths: [],
        };
    },
    computed: {
        computedHeaders() {
            if (!this.headers)
                return [];
            const headers = this.headers.filter(h => h.value === undefined || !this.internalGroupBy.find(v => v === h.value));
            const defaultHeader = { text: '', sortable: false, width: '1px' };
            if (this.showSelect) {
                const index = headers.findIndex(h => h.value === 'data-table-select');
                if (index < 0)
                    headers.unshift({ ...defaultHeader, value: 'data-table-select' });
                else
                    headers.splice(index, 1, { ...defaultHeader, ...headers[index] });
            }
            if (this.showExpand) {
                const index = headers.findIndex(h => h.value === 'data-table-expand');
                if (index < 0)
                    headers.unshift({ ...defaultHeader, value: 'data-table-expand' });
                else
                    headers.splice(index, 1, { ...defaultHeader, ...headers[index] });
            }
            return headers;
        },
        colspanAttrs() {
            return this.isMobile ? undefined : {
                colspan: this.headersLength || this.computedHeaders.length,
            };
        },
        columnSorters() {
            return this.computedHeaders.reduce((acc, header) => {
                if (header.sort)
                    acc[header.value] = header.sort;
                return acc;
            }, {});
        },
        headersWithCustomFilters() {
            return this.headers.filter(header => header.filter && (!header.hasOwnProperty('filterable') || header.filterable === true));
        },
        headersWithoutCustomFilters() {
            return this.headers.filter(header => !header.filter && (!header.hasOwnProperty('filterable') || header.filterable === true));
        },
        sanitizedHeaderProps() {
            return camelizeObjectKeys(this.headerProps);
        },
        computedItemsPerPage() {
            const itemsPerPage = this.options && this.options.itemsPerPage ? this.options.itemsPerPage : this.itemsPerPage;
            const itemsPerPageOptions = this.sanitizedFooterProps.itemsPerPageOptions;
            if (itemsPerPageOptions &&
                !itemsPerPageOptions.find(item => typeof item === 'number' ? item === itemsPerPage : item.value === itemsPerPage)) {
                const firstOption = itemsPerPageOptions[0];
                return typeof firstOption === 'object' ? firstOption.value : firstOption;
            }
            return itemsPerPage;
        },
    },
    created() {
        const breakingProps = [
            ['sort-icon', 'header-props.sort-icon'],
            ['hide-headers', 'hide-default-header'],
            ['select-all', 'show-select'],
        ];
        /* istanbul ignore next */
        breakingProps.forEach(([original, replacement]) => {
            if (this.$attrs.hasOwnProperty(original))
                breaking(original, replacement, this);
        });
    },
    mounted() {
        // if ((!this.sortBy || !this.sortBy.length) && (!this.options.sortBy || !this.options.sortBy.length)) {
        //   const firstSortable = this.headers.find(h => !('sortable' in h) || !!h.sortable)
        //   if (firstSortable) this.updateOptions({ sortBy: [firstSortable.value], sortDesc: [false] })
        // }
        if (this.calculateWidths) {
            window.addEventListener('resize', this.calcWidths);
            this.calcWidths();
        }
    },
    beforeDestroy() {
        if (this.calculateWidths) {
            window.removeEventListener('resize', this.calcWidths);
        }
    },
    methods: {
        calcWidths() {
            this.widths = Array.from(this.$el.querySelectorAll('th')).map(e => e.clientWidth);
        },
        customFilterWithColumns(items, search) {
            return searchTableItems(items, search, this.headersWithCustomFilters, this.headersWithoutCustomFilters, this.customFilter);
        },
        customSortWithHeaders(items, sortBy, sortDesc, locale) {
            return this.customSort(items, sortBy, sortDesc, locale, this.columnSorters);
        },
        createItemProps(item, index) {
            const props = VDataIterator.options.methods.createItemProps.call(this, item, index);
            return Object.assign(props, { headers: this.computedHeaders });
        },
        genCaption(props) {
            if (this.caption)
                return [this.$createElement('caption', [this.caption])];
            return getSlot(this, 'caption', props, true);
        },
        genColgroup(props) {
            return this.$createElement('colgroup', this.computedHeaders.map(header => {
                return this.$createElement('col', {
                    class: {
                        divider: header.divider,
                    },
                });
            }));
        },
        genLoading() {
            const th = this.$createElement('th', {
                staticClass: 'column',
                attrs: this.colspanAttrs,
            }, [this.genProgress()]);
            const tr = this.$createElement('tr', {
                staticClass: 'v-data-table__progress',
            }, [th]);
            return this.$createElement('thead', [tr]);
        },
        genHeaders(props) {
            const data = {
                props: {
                    ...this.sanitizedHeaderProps,
                    headers: this.computedHeaders,
                    options: props.options,
                    mobile: this.isMobile,
                    showGroupBy: this.showGroupBy,
                    checkboxColor: this.checkboxColor,
                    someItems: this.someItems,
                    everyItem: this.everyItem,
                    singleSelect: this.singleSelect,
                    disableSort: this.disableSort,
                },
                on: {
                    sort: props.sort,
                    group: props.group,
                    'toggle-select-all': this.toggleSelectAll,
                },
            };
            // TODO: rename to 'head'? (thead, tbody, tfoot)
            const children = [getSlot(this, 'header', {
                    ...data,
                    isMobile: this.isMobile,
                })];
            if (!this.hideDefaultHeader) {
                const scopedSlots = getPrefixedScopedSlots('header.', this.$scopedSlots);
                children.push(this.$createElement(VDataTableHeader, {
                    ...data,
                    scopedSlots,
                }));
            }
            if (this.loading)
                children.push(this.genLoading());
            return children;
        },
        genEmptyWrapper(content) {
            return this.$createElement('tr', {
                staticClass: 'v-data-table__empty-wrapper',
            }, [
                this.$createElement('td', {
                    attrs: this.colspanAttrs,
                }, content),
            ]);
        },
        genItems(items, props) {
            const empty = this.genEmpty(props.originalItemsLength, props.pagination.itemsLength);
            if (empty)
                return [empty];
            return props.groupedItems
                ? this.genGroupedRows(props.groupedItems, props)
                : this.genRows(items, props);
        },
        genGroupedRows(groupedItems, props) {
            return groupedItems.map(group => {
                if (!this.openCache.hasOwnProperty(group.name))
                    this.$set(this.openCache, group.name, true);
                if (this.$scopedSlots.group) {
                    return this.$scopedSlots.group({
                        group: group.name,
                        options: props.options,
                        isMobile: this.isMobile,
                        items: group.items,
                        headers: this.computedHeaders,
                    });
                }
                else {
                    return this.genDefaultGroupedRow(group.name, group.items, props);
                }
            });
        },
        genDefaultGroupedRow(group, items, props) {
            const isOpen = !!this.openCache[group];
            const children = [
                this.$createElement('template', { slot: 'row.content' }, this.genRows(items, props)),
            ];
            const toggleFn = () => this.$set(this.openCache, group, !this.openCache[group]);
            const removeFn = () => props.updateOptions({ groupBy: [], groupDesc: [] });
            if (this.$scopedSlots['group.header']) {
                children.unshift(this.$createElement('template', { slot: 'column.header' }, [
                    this.$scopedSlots['group.header']({
                        group,
                        groupBy: props.options.groupBy,
                        isMobile: this.isMobile,
                        items,
                        headers: this.computedHeaders,
                        isOpen,
                        toggle: toggleFn,
                        remove: removeFn,
                    }),
                ]));
            }
            else {
                const toggle = this.$createElement(VBtn, {
                    staticClass: 'ma-0',
                    props: {
                        icon: true,
                        small: true,
                    },
                    on: {
                        click: toggleFn,
                    },
                }, [this.$createElement(VIcon, [isOpen ? '$minus' : '$plus'])]);
                const remove = this.$createElement(VBtn, {
                    staticClass: 'ma-0',
                    props: {
                        icon: true,
                        small: true,
                    },
                    on: {
                        click: removeFn,
                    },
                }, [this.$createElement(VIcon, ['$close'])]);
                const column = this.$createElement('td', {
                    staticClass: 'text-start',
                    attrs: this.colspanAttrs,
                }, [toggle, `${props.options.groupBy[0]}: ${group}`, remove]);
                children.unshift(this.$createElement('template', { slot: 'column.header' }, [column]));
            }
            if (this.$scopedSlots['group.summary']) {
                children.push(this.$createElement('template', { slot: 'column.summary' }, [
                    this.$scopedSlots['group.summary']({
                        group,
                        groupBy: props.options.groupBy,
                        isMobile: this.isMobile,
                        items,
                        headers: this.computedHeaders,
                        isOpen,
                        toggle: toggleFn,
                    }),
                ]));
            }
            return this.$createElement(RowGroup, {
                key: group,
                props: {
                    value: isOpen,
                },
            }, children);
        },
        genRows(items, props) {
            return this.$scopedSlots.item ? this.genScopedRows(items, props) : this.genDefaultRows(items, props);
        },
        genScopedRows(items, props) {
            const rows = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                rows.push(this.$scopedSlots.item({
                    ...this.createItemProps(item, i),
                    isMobile: this.isMobile,
                }));
                if (this.isExpanded(item)) {
                    rows.push(this.$scopedSlots['expanded-item']({
                        headers: this.computedHeaders,
                        isMobile: this.isMobile,
                        index: i,
                        item,
                    }));
                }
            }
            return rows;
        },
        genDefaultRows(items, props) {
            return this.$scopedSlots['expanded-item']
                ? items.map((item, index) => this.genDefaultExpandedRow(item, index))
                : items.map((item, index) => this.genDefaultSimpleRow(item, index));
        },
        genDefaultExpandedRow(item, index) {
            const isExpanded = this.isExpanded(item);
            const classes = {
                'v-data-table__expanded v-data-table__expanded__row': isExpanded,
            };
            const headerRow = this.genDefaultSimpleRow(item, index, classes);
            const expandedRow = this.$createElement('tr', {
                staticClass: 'v-data-table__expanded v-data-table__expanded__content',
            }, [this.$scopedSlots['expanded-item']({
                    headers: this.computedHeaders,
                    isMobile: this.isMobile,
                    item,
                })]);
            return this.$createElement(RowGroup, {
                props: {
                    value: isExpanded,
                },
            }, [
                this.$createElement('template', { slot: 'row.header' }, [headerRow]),
                this.$createElement('template', { slot: 'row.content' }, [expandedRow]),
            ]);
        },
        genDefaultSimpleRow(item, index, classes = {}) {
            const scopedSlots = getPrefixedScopedSlots('item.', this.$scopedSlots);
            const data = this.createItemProps(item, index);
            if (this.showSelect) {
                const slot = scopedSlots['data-table-select'];
                scopedSlots['data-table-select'] = slot ? () => slot({
                    ...data,
                    isMobile: this.isMobile,
                }) : () => this.$createElement(VSimpleCheckbox, {
                    staticClass: 'v-data-table__checkbox',
                    props: {
                        value: data.isSelected,
                        disabled: !this.isSelectable(item),
                        color: this.checkboxColor ?? '',
                    },
                    on: {
                        input: (val) => data.select(val),
                    },
                });
            }
            if (this.showExpand) {
                const slot = scopedSlots['data-table-expand'];
                scopedSlots['data-table-expand'] = slot ? () => slot(data) : () => this.$createElement(VIcon, {
                    staticClass: 'v-data-table__expand-icon',
                    class: {
                        'v-data-table__expand-icon--active': data.isExpanded,
                    },
                    on: {
                        click: (e) => {
                            e.stopPropagation();
                            data.expand(!data.isExpanded);
                        },
                    },
                }, [this.expandIcon]);
            }
            return this.$createElement(this.isMobile ? MobileRow : Row, {
                key: getObjectValueByPath(item, this.itemKey),
                class: mergeClasses({ ...classes, 'v-data-table__selected': data.isSelected }, getPropertyFromItem(item, this.itemClass)),
                props: {
                    headers: this.computedHeaders,
                    hideDefaultHeader: this.hideDefaultHeader,
                    index,
                    item,
                    rtl: this.$vuetify.rtl,
                },
                scopedSlots,
                on: {
                    // TODO: for click, the first argument should be the event, and the second argument should be data,
                    // but this is a breaking change so it's for v3
                    click: () => this.$emit('click:row', item, data),
                    contextmenu: (event) => this.$emit('contextmenu:row', event, data),
                    dblclick: (event) => this.$emit('dblclick:row', event, data),
                },
            });
        },
        genBody(props) {
            const data = {
                ...props,
                expand: this.expand,
                headers: this.computedHeaders,
                isExpanded: this.isExpanded,
                isMobile: this.isMobile,
                isSelected: this.isSelected,
                select: this.select,
            };
            if (this.$scopedSlots.body) {
                return this.$scopedSlots.body(data);
            }
            return this.$createElement('tbody', [
                getSlot(this, 'body.prepend', data, true),
                this.genItems(props.items, props),
                getSlot(this, 'body.append', data, true),
            ]);
        },
        genFoot(props) {
            return this.$scopedSlots.foot?.(props);
        },
        genFooters(props) {
            const data = {
                props: {
                    options: props.options,
                    pagination: props.pagination,
                    itemsPerPageText: '$vuetify.dataTable.itemsPerPageText',
                    ...this.sanitizedFooterProps,
                },
                on: {
                    'update:options': (value) => props.updateOptions(value),
                },
                widths: this.widths,
                headers: this.computedHeaders,
            };
            const children = [
                getSlot(this, 'footer', data, true),
            ];
            if (!this.hideDefaultFooter) {
                children.push(this.$createElement(VDataFooter, {
                    ...data,
                    scopedSlots: getPrefixedScopedSlots('footer.', this.$scopedSlots),
                }));
            }
            return children;
        },
        genDefaultScopedSlot(props) {
            const simpleProps = {
                height: this.height,
                fixedHeader: this.fixedHeader,
                dense: this.dense,
            };
            // if (this.virtualRows) {
            //   return this.$createElement(VVirtualTable, {
            //     props: Object.assign(simpleProps, {
            //       items: props.items,
            //       height: this.height,
            //       rowHeight: this.dense ? 24 : 48,
            //       headerHeight: this.dense ? 32 : 48,
            //       // TODO: expose rest of props from virtual table?
            //     }),
            //     scopedSlots: {
            //       items: ({ items }) => this.genItems(items, props) as any,
            //     },
            //   }, [
            //     this.proxySlot('body.before', [this.genCaption(props), this.genHeaders(props)]),
            //     this.proxySlot('bottom', this.genFooters(props)),
            //   ])
            // }
            return this.$createElement(VSimpleTable, {
                props: simpleProps,
                class: {
                    'v-data-table--mobile': this.isMobile,
                },
            }, [
                this.proxySlot('top', getSlot(this, 'top', {
                    ...props,
                    isMobile: this.isMobile,
                }, true)),
                this.genCaption(props),
                this.genColgroup(props),
                this.genHeaders(props),
                this.genBody(props),
                this.genFoot(props),
                this.proxySlot('bottom', this.genFooters(props)),
            ]);
        },
        proxySlot(slot, content) {
            return this.$createElement('template', { slot }, content);
        },
    },
    render() {
        return this.$createElement(VData, {
            props: {
                ...this.$props,
                customFilter: this.customFilterWithColumns,
                customSort: this.customSortWithHeaders,
                itemsPerPage: this.computedItemsPerPage,
            },
            on: {
                'update:options': (v, old) => {
                    this.internalGroupBy = v.groupBy || [];
                    !deepEqual(v, old) && this.$emit('update:options', v);
                },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRhdGFUYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZEYXRhVGFibGUvVkRhdGFUYWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLG1CQUFtQixDQUFBO0FBa0IxQixhQUFhO0FBQ2IsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUNoQyxPQUFPLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQzdELE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQTtBQUMxQixPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFBO0FBQ2pELDhDQUE4QztBQUM5QyxPQUFPLEtBQUssTUFBTSxVQUFVLENBQUE7QUFDNUIsT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFBO0FBQ3ZCLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQTtBQUNqQyxPQUFPLGVBQWUsTUFBTSw4QkFBOEIsQ0FBQTtBQUMxRCxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQTtBQUN6QyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUE7QUFFbkMsU0FBUztBQUNULE9BQU8sUUFBUSxNQUFNLHVCQUF1QixDQUFBO0FBRTVDLGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSx5QkFBeUIsQ0FBQTtBQUU1QyxVQUFVO0FBQ1YsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLG1CQUFtQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDN0osT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzdDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUVuRCxTQUFTLFFBQVEsQ0FBRSxJQUFTLEVBQUUsTUFBcUIsRUFB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RUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRixpQkFBaUIsRUFBRSxDQUFDLENBQW9CLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO2dCQUM3RSxtQkFBbUIsRUFBRSxDQUFDLENBQXNCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2dCQUNuRixVQUFVLEVBQUUsQ0FBQyxDQUFpQixFQUFFLEdBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Z0JBQ3pHLGVBQWUsRUFBRSxDQUFDLENBQVEsRUFBRSxFQUFFO29CQUM1QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFBO29CQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFDaEMsQ0FBQztnQkFDRCxZQUFZLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzthQUN6RDtZQUNELFdBQVcsRUFBRTtnQkFDWCxPQUFPLEVBQUUsSUFBSSxDQUFDLG9CQUFvQjthQUNuQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vVkRhdGFUYWJsZS5zYXNzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUsIFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzLCBWTm9kZUNoaWxkcmVuIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgUHJvcFZhbGlkYXRvciB9IGZyb20gJ3Z1ZS90eXBlcy9vcHRpb25zJ1xuaW1wb3J0IHtcbiAgRGF0YVRhYmxlSGVhZGVyLFxuICBEYXRhVGFibGVGaWx0ZXJGdW5jdGlvbixcbiAgRGF0YVNjb3BlUHJvcHMsXG4gIERhdGFPcHRpb25zLFxuICBEYXRhUGFnaW5hdGlvbixcbiAgRGF0YVRhYmxlQ29tcGFyZUZ1bmN0aW9uLFxuICBEYXRhSXRlbXNQZXJQYWdlT3B0aW9uLFxuICBJdGVtR3JvdXAsXG4gIFJvd0NsYXNzRnVuY3Rpb24sXG4gIERhdGFUYWJsZUl0ZW1Qcm9wcyxcbn0gZnJvbSAndnVldGlmeS90eXBlcydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IHsgVkRhdGEgfSBmcm9tICcuLi9WRGF0YSdcbmltcG9ydCB7IFZEYXRhRm9vdGVyLCBWRGF0YUl0ZXJhdG9yIH0gZnJvbSAnLi4vVkRhdGFJdGVyYXRvcidcbmltcG9ydCBWQnRuIGZyb20gJy4uL1ZCdG4nXG5pbXBvcnQgVkRhdGFUYWJsZUhlYWRlciBmcm9tICcuL1ZEYXRhVGFibGVIZWFkZXInXG4vLyBpbXBvcnQgVlZpcnR1YWxUYWJsZSBmcm9tICcuL1ZWaXJ0dWFsVGFibGUnXG5pbXBvcnQgVkljb24gZnJvbSAnLi4vVkljb24nXG5pbXBvcnQgUm93IGZyb20gJy4vUm93J1xuaW1wb3J0IFJvd0dyb3VwIGZyb20gJy4vUm93R3JvdXAnXG5pbXBvcnQgVlNpbXBsZUNoZWNrYm94IGZyb20gJy4uL1ZDaGVja2JveC9WU2ltcGxlQ2hlY2tib3gnXG5pbXBvcnQgVlNpbXBsZVRhYmxlIGZyb20gJy4vVlNpbXBsZVRhYmxlJ1xuaW1wb3J0IE1vYmlsZVJvdyBmcm9tICcuL01vYmlsZVJvdydcblxuLy8gTWl4aW5zXG5pbXBvcnQgTG9hZGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2xvYWRhYmxlJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgcmlwcGxlIGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvcmlwcGxlJ1xuXG4vLyBIZWxwZXJzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgZGVlcEVxdWFsLCBnZXRPYmplY3RWYWx1ZUJ5UGF0aCwgZ2V0UHJlZml4ZWRTY29wZWRTbG90cywgZ2V0U2xvdCwgZGVmYXVsdEZpbHRlciwgY2FtZWxpemVPYmplY3RLZXlzLCBnZXRQcm9wZXJ0eUZyb21JdGVtIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgYnJlYWtpbmcgfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5pbXBvcnQgeyBtZXJnZUNsYXNzZXMgfSBmcm9tICcuLi8uLi91dGlsL21lcmdlRGF0YSdcblxuZnVuY3Rpb24gZmlsdGVyRm4gKGl0ZW06IGFueSwgc2VhcmNoOiBzdHJpbmcgfCBudWxsLCBmaWx0ZXI6IERhdGFUYWJsZUZpbHRlckZ1bmN0aW9uKSB7XG4gIHJldHVybiAoaGVhZGVyOiBEYXRhVGFibGVIZWFkZXIpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGdldE9iamVjdFZhbHVlQnlQYXRoKGl0ZW0sIGhlYWRlci52YWx1ZSlcbiAgICByZXR1cm4gaGVhZGVyLmZpbHRlciA/IGhlYWRlci5maWx0ZXIodmFsdWUsIHNlYXJjaCwgaXRlbSkgOiBmaWx0ZXIodmFsdWUsIHNlYXJjaCwgaXRlbSlcbiAgfVxufVxuXG5mdW5jdGlvbiBzZWFyY2hUYWJsZUl0ZW1zIChcbiAgaXRlbXM6IGFueVtdLFxuICBzZWFyY2g6IHN0cmluZyB8IG51bGwsXG4gIGhlYWRlcnNXaXRoQ3VzdG9tRmlsdGVyczogRGF0YVRhYmxlSGVhZGVyW10sXG4gIGhlYWRlcnNXaXRob3V0Q3VzdG9tRmlsdGVyczogRGF0YVRhYmxlSGVhZGVyW10sXG4gIGN1c3RvbUZpbHRlcjogRGF0YVRhYmxlRmlsdGVyRnVuY3Rpb25cbikge1xuICBzZWFyY2ggPSB0eXBlb2Ygc2VhcmNoID09PSAnc3RyaW5nJyA/IHNlYXJjaC50cmltKCkgOiBudWxsXG5cbiAgcmV0dXJuIGl0ZW1zLmZpbHRlcihpdGVtID0+IHtcbiAgICAvLyBIZWFkZXJzIHdpdGggY3VzdG9tIGZpbHRlcnMgYXJlIGV2YWx1YXRlZCB3aGV0aGVyIG9yIG5vdCBhIHNlYXJjaCB0ZXJtIGhhcyBiZWVuIHByb3ZpZGVkLlxuICAgIC8vIFdlIG5lZWQgdG8gbWF0Y2ggZXZlcnkgZmlsdGVyIHRvIGJlIGluY2x1ZGVkIGluIHRoZSByZXN1bHRzLlxuICAgIGNvbnN0IG1hdGNoZXNDb2x1bW5GaWx0ZXJzID0gaGVhZGVyc1dpdGhDdXN0b21GaWx0ZXJzLmV2ZXJ5KGZpbHRlckZuKGl0ZW0sIHNlYXJjaCwgZGVmYXVsdEZpbHRlcikpXG5cbiAgICAvLyBIZWFkZXJzIHdpdGhvdXQgY3VzdG9tIGZpbHRlcnMgYXJlIG9ubHkgZmlsdGVyZWQgYnkgdGhlIGBzZWFyY2hgIHByb3BlcnR5IGlmIGl0IGlzIGRlZmluZWQuXG4gICAgLy8gV2Ugb25seSBuZWVkIGEgc2luZ2xlIGNvbHVtbiB0byBtYXRjaCB0aGUgc2VhcmNoIHRlcm0gdG8gYmUgaW5jbHVkZWQgaW4gdGhlIHJlc3VsdHMuXG4gICAgY29uc3QgbWF0Y2hlc1NlYXJjaFRlcm0gPSAhc2VhcmNoIHx8IGhlYWRlcnNXaXRob3V0Q3VzdG9tRmlsdGVycy5zb21lKGZpbHRlckZuKGl0ZW0sIHNlYXJjaCwgY3VzdG9tRmlsdGVyKSlcblxuICAgIHJldHVybiBtYXRjaGVzQ29sdW1uRmlsdGVycyAmJiBtYXRjaGVzU2VhcmNoVGVybVxuICB9KVxufVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBWRGF0YUl0ZXJhdG9yLFxuICBMb2FkYWJsZSxcbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtZGF0YS10YWJsZScsXG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS9pc3N1ZXMvNjg3MlxuICBkaXJlY3RpdmVzOiB7XG4gICAgcmlwcGxlLFxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgaGVhZGVyczoge1xuICAgICAgdHlwZTogQXJyYXksXG4gICAgICBkZWZhdWx0OiAoKSA9PiBbXSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8RGF0YVRhYmxlSGVhZGVyW10+LFxuICAgIHNob3dTZWxlY3Q6IEJvb2xlYW4sXG4gICAgY2hlY2tib3hDb2xvcjogU3RyaW5nLFxuICAgIHNob3dFeHBhbmQ6IEJvb2xlYW4sXG4gICAgc2hvd0dyb3VwQnk6IEJvb2xlYW4sXG4gICAgLy8gVE9ETzogRml4XG4gICAgLy8gdmlydHVhbFJvd3M6IEJvb2xlYW4sXG4gICAgaGVpZ2h0OiBbTnVtYmVyLCBTdHJpbmddLFxuICAgIGhpZGVEZWZhdWx0SGVhZGVyOiBCb29sZWFuLFxuICAgIGNhcHRpb246IFN0cmluZyxcbiAgICBkZW5zZTogQm9vbGVhbixcbiAgICBoZWFkZXJQcm9wczogT2JqZWN0LFxuICAgIGNhbGN1bGF0ZVdpZHRoczogQm9vbGVhbixcbiAgICBmaXhlZEhlYWRlcjogQm9vbGVhbixcbiAgICBoZWFkZXJzTGVuZ3RoOiBOdW1iZXIsXG4gICAgZXhwYW5kSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRleHBhbmQnLFxuICAgIH0sXG4gICAgY3VzdG9tRmlsdGVyOiB7XG4gICAgICB0eXBlOiBGdW5jdGlvbixcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHRGaWx0ZXIsXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPHR5cGVvZiBkZWZhdWx0RmlsdGVyPixcbiAgICBpdGVtQ2xhc3M6IHtcbiAgICAgIHR5cGU6IFtTdHJpbmcsIEZ1bmN0aW9uXSxcbiAgICAgIGRlZmF1bHQ6ICgpID0+ICcnLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxSb3dDbGFzc0Z1bmN0aW9uIHwgc3RyaW5nPixcbiAgICBsb2FkZXJIZWlnaHQ6IHtcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgICBkZWZhdWx0OiA0LFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGludGVybmFsR3JvdXBCeTogW10gYXMgc3RyaW5nW10sXG4gICAgICBvcGVuQ2FjaGU6IHt9IGFzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9LFxuICAgICAgd2lkdGhzOiBbXSBhcyBudW1iZXJbXSxcbiAgICB9XG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBjb21wdXRlZEhlYWRlcnMgKCk6IERhdGFUYWJsZUhlYWRlcltdIHtcbiAgICAgIGlmICghdGhpcy5oZWFkZXJzKSByZXR1cm4gW11cbiAgICAgIGNvbnN0IGhlYWRlcnMgPSB0aGlzLmhlYWRlcnMuZmlsdGVyKGggPT4gaC52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8ICF0aGlzLmludGVybmFsR3JvdXBCeS5maW5kKHYgPT4gdiA9PT0gaC52YWx1ZSkpXG4gICAgICBjb25zdCBkZWZhdWx0SGVhZGVyID0geyB0ZXh0OiAnJywgc29ydGFibGU6IGZhbHNlLCB3aWR0aDogJzFweCcgfVxuXG4gICAgICBpZiAodGhpcy5zaG93U2VsZWN0KSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gaGVhZGVycy5maW5kSW5kZXgoaCA9PiBoLnZhbHVlID09PSAnZGF0YS10YWJsZS1zZWxlY3QnKVxuICAgICAgICBpZiAoaW5kZXggPCAwKSBoZWFkZXJzLnVuc2hpZnQoeyAuLi5kZWZhdWx0SGVhZGVyLCB2YWx1ZTogJ2RhdGEtdGFibGUtc2VsZWN0JyB9KVxuICAgICAgICBlbHNlIGhlYWRlcnMuc3BsaWNlKGluZGV4LCAxLCB7IC4uLmRlZmF1bHRIZWFkZXIsIC4uLmhlYWRlcnNbaW5kZXhdIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnNob3dFeHBhbmQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBoZWFkZXJzLmZpbmRJbmRleChoID0+IGgudmFsdWUgPT09ICdkYXRhLXRhYmxlLWV4cGFuZCcpXG4gICAgICAgIGlmIChpbmRleCA8IDApIGhlYWRlcnMudW5zaGlmdCh7IC4uLmRlZmF1bHRIZWFkZXIsIHZhbHVlOiAnZGF0YS10YWJsZS1leHBhbmQnIH0pXG4gICAgICAgIGVsc2UgaGVhZGVycy5zcGxpY2UoaW5kZXgsIDEsIHsgLi4uZGVmYXVsdEhlYWRlciwgLi4uaGVhZGVyc1tpbmRleF0gfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGhlYWRlcnNcbiAgICB9LFxuICAgIGNvbHNwYW5BdHRycyAoKTogb2JqZWN0IHwgdW5kZWZpbmVkIHtcbiAgICAgIHJldHVybiB0aGlzLmlzTW9iaWxlID8gdW5kZWZpbmVkIDoge1xuICAgICAgICBjb2xzcGFuOiB0aGlzLmhlYWRlcnNMZW5ndGggfHwgdGhpcy5jb21wdXRlZEhlYWRlcnMubGVuZ3RoLFxuICAgICAgfVxuICAgIH0sXG4gICAgY29sdW1uU29ydGVycyAoKTogUmVjb3JkPHN0cmluZywgRGF0YVRhYmxlQ29tcGFyZUZ1bmN0aW9uPiB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wdXRlZEhlYWRlcnMucmVkdWNlPFJlY29yZDxzdHJpbmcsIERhdGFUYWJsZUNvbXBhcmVGdW5jdGlvbj4+KChhY2MsIGhlYWRlcikgPT4ge1xuICAgICAgICBpZiAoaGVhZGVyLnNvcnQpIGFjY1toZWFkZXIudmFsdWVdID0gaGVhZGVyLnNvcnRcbiAgICAgICAgcmV0dXJuIGFjY1xuICAgICAgfSwge30pXG4gICAgfSxcbiAgICBoZWFkZXJzV2l0aEN1c3RvbUZpbHRlcnMgKCk6IERhdGFUYWJsZUhlYWRlcltdIHtcbiAgICAgIHJldHVybiB0aGlzLmhlYWRlcnMuZmlsdGVyKGhlYWRlciA9PiBoZWFkZXIuZmlsdGVyICYmICghaGVhZGVyLmhhc093blByb3BlcnR5KCdmaWx0ZXJhYmxlJykgfHwgaGVhZGVyLmZpbHRlcmFibGUgPT09IHRydWUpKVxuICAgIH0sXG4gICAgaGVhZGVyc1dpdGhvdXRDdXN0b21GaWx0ZXJzICgpOiBEYXRhVGFibGVIZWFkZXJbXSB7XG4gICAgICByZXR1cm4gdGhpcy5oZWFkZXJzLmZpbHRlcihoZWFkZXIgPT4gIWhlYWRlci5maWx0ZXIgJiYgKCFoZWFkZXIuaGFzT3duUHJvcGVydHkoJ2ZpbHRlcmFibGUnKSB8fCBoZWFkZXIuZmlsdGVyYWJsZSA9PT0gdHJ1ZSkpXG4gICAgfSxcbiAgICBzYW5pdGl6ZWRIZWFkZXJQcm9wcyAoKTogUmVjb3JkPHN0cmluZywgYW55PiB7XG4gICAgICByZXR1cm4gY2FtZWxpemVPYmplY3RLZXlzKHRoaXMuaGVhZGVyUHJvcHMpXG4gICAgfSxcbiAgICBjb21wdXRlZEl0ZW1zUGVyUGFnZSAoKTogbnVtYmVyIHtcbiAgICAgIGNvbnN0IGl0ZW1zUGVyUGFnZSA9IHRoaXMub3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuaXRlbXNQZXJQYWdlID8gdGhpcy5vcHRpb25zLml0ZW1zUGVyUGFnZSA6IHRoaXMuaXRlbXNQZXJQYWdlXG4gICAgICBjb25zdCBpdGVtc1BlclBhZ2VPcHRpb25zOiBEYXRhSXRlbXNQZXJQYWdlT3B0aW9uW10gfCB1bmRlZmluZWQgPSB0aGlzLnNhbml0aXplZEZvb3RlclByb3BzLml0ZW1zUGVyUGFnZU9wdGlvbnNcblxuICAgICAgaWYgKFxuICAgICAgICBpdGVtc1BlclBhZ2VPcHRpb25zICYmXG4gICAgICAgICFpdGVtc1BlclBhZ2VPcHRpb25zLmZpbmQoaXRlbSA9PiB0eXBlb2YgaXRlbSA9PT0gJ251bWJlcicgPyBpdGVtID09PSBpdGVtc1BlclBhZ2UgOiBpdGVtLnZhbHVlID09PSBpdGVtc1BlclBhZ2UpXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgZmlyc3RPcHRpb24gPSBpdGVtc1BlclBhZ2VPcHRpb25zWzBdXG4gICAgICAgIHJldHVybiB0eXBlb2YgZmlyc3RPcHRpb24gPT09ICdvYmplY3QnID8gZmlyc3RPcHRpb24udmFsdWUgOiBmaXJzdE9wdGlvblxuICAgICAgfVxuXG4gICAgICByZXR1cm4gaXRlbXNQZXJQYWdlXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICBjb25zdCBicmVha2luZ1Byb3BzID0gW1xuICAgICAgWydzb3J0LWljb24nLCAnaGVhZGVyLXByb3BzLnNvcnQtaWNvbiddLFxuICAgICAgWydoaWRlLWhlYWRlcnMnLCAnaGlkZS1kZWZhdWx0LWhlYWRlciddLFxuICAgICAgWydzZWxlY3QtYWxsJywgJ3Nob3ctc2VsZWN0J10sXG4gICAgXVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBicmVha2luZ1Byb3BzLmZvckVhY2goKFtvcmlnaW5hbCwgcmVwbGFjZW1lbnRdKSA9PiB7XG4gICAgICBpZiAodGhpcy4kYXR0cnMuaGFzT3duUHJvcGVydHkob3JpZ2luYWwpKSBicmVha2luZyhvcmlnaW5hbCwgcmVwbGFjZW1lbnQsIHRoaXMpXG4gICAgfSlcbiAgfSxcblxuICBtb3VudGVkICgpIHtcbiAgICAvLyBpZiAoKCF0aGlzLnNvcnRCeSB8fCAhdGhpcy5zb3J0QnkubGVuZ3RoKSAmJiAoIXRoaXMub3B0aW9ucy5zb3J0QnkgfHwgIXRoaXMub3B0aW9ucy5zb3J0QnkubGVuZ3RoKSkge1xuICAgIC8vICAgY29uc3QgZmlyc3RTb3J0YWJsZSA9IHRoaXMuaGVhZGVycy5maW5kKGggPT4gISgnc29ydGFibGUnIGluIGgpIHx8ICEhaC5zb3J0YWJsZSlcbiAgICAvLyAgIGlmIChmaXJzdFNvcnRhYmxlKSB0aGlzLnVwZGF0ZU9wdGlvbnMoeyBzb3J0Qnk6IFtmaXJzdFNvcnRhYmxlLnZhbHVlXSwgc29ydERlc2M6IFtmYWxzZV0gfSlcbiAgICAvLyB9XG5cbiAgICBpZiAodGhpcy5jYWxjdWxhdGVXaWR0aHMpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmNhbGNXaWR0aHMpXG4gICAgICB0aGlzLmNhbGNXaWR0aHMoKVxuICAgIH1cbiAgfSxcblxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICBpZiAodGhpcy5jYWxjdWxhdGVXaWR0aHMpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmNhbGNXaWR0aHMpXG4gICAgfVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBjYWxjV2lkdGhzICgpIHtcbiAgICAgIHRoaXMud2lkdGhzID0gQXJyYXkuZnJvbSh0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCd0aCcpKS5tYXAoZSA9PiBlLmNsaWVudFdpZHRoKVxuICAgIH0sXG4gICAgY3VzdG9tRmlsdGVyV2l0aENvbHVtbnMgKGl0ZW1zOiBhbnlbXSwgc2VhcmNoOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzZWFyY2hUYWJsZUl0ZW1zKGl0ZW1zLCBzZWFyY2gsIHRoaXMuaGVhZGVyc1dpdGhDdXN0b21GaWx0ZXJzLCB0aGlzLmhlYWRlcnNXaXRob3V0Q3VzdG9tRmlsdGVycywgdGhpcy5jdXN0b21GaWx0ZXIpXG4gICAgfSxcbiAgICBjdXN0b21Tb3J0V2l0aEhlYWRlcnMgKGl0ZW1zOiBhbnlbXSwgc29ydEJ5OiBzdHJpbmdbXSwgc29ydERlc2M6IGJvb2xlYW5bXSwgbG9jYWxlOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmN1c3RvbVNvcnQoaXRlbXMsIHNvcnRCeSwgc29ydERlc2MsIGxvY2FsZSwgdGhpcy5jb2x1bW5Tb3J0ZXJzKVxuICAgIH0sXG4gICAgY3JlYXRlSXRlbVByb3BzIChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpOiBEYXRhVGFibGVJdGVtUHJvcHMge1xuICAgICAgY29uc3QgcHJvcHMgPSBWRGF0YUl0ZXJhdG9yLm9wdGlvbnMubWV0aG9kcy5jcmVhdGVJdGVtUHJvcHMuY2FsbCh0aGlzLCBpdGVtLCBpbmRleClcblxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24ocHJvcHMsIHsgaGVhZGVyczogdGhpcy5jb21wdXRlZEhlYWRlcnMgfSlcbiAgICB9LFxuICAgIGdlbkNhcHRpb24gKHByb3BzOiBEYXRhU2NvcGVQcm9wcykge1xuICAgICAgaWYgKHRoaXMuY2FwdGlvbikgcmV0dXJuIFt0aGlzLiRjcmVhdGVFbGVtZW50KCdjYXB0aW9uJywgW3RoaXMuY2FwdGlvbl0pXVxuXG4gICAgICByZXR1cm4gZ2V0U2xvdCh0aGlzLCAnY2FwdGlvbicsIHByb3BzLCB0cnVlKVxuICAgIH0sXG4gICAgZ2VuQ29sZ3JvdXAgKHByb3BzOiBEYXRhU2NvcGVQcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2NvbGdyb3VwJywgdGhpcy5jb21wdXRlZEhlYWRlcnMubWFwKGhlYWRlciA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdjb2wnLCB7XG4gICAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAgIGRpdmlkZXI6IGhlYWRlci5kaXZpZGVyLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICB9KSlcbiAgICB9LFxuICAgIGdlbkxvYWRpbmcgKCkge1xuICAgICAgY29uc3QgdGggPSB0aGlzLiRjcmVhdGVFbGVtZW50KCd0aCcsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICdjb2x1bW4nLFxuICAgICAgICBhdHRyczogdGhpcy5jb2xzcGFuQXR0cnMsXG4gICAgICB9LCBbdGhpcy5nZW5Qcm9ncmVzcygpXSlcblxuICAgICAgY29uc3QgdHIgPSB0aGlzLiRjcmVhdGVFbGVtZW50KCd0cicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWRhdGEtdGFibGVfX3Byb2dyZXNzJyxcbiAgICAgIH0sIFt0aF0pXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCd0aGVhZCcsIFt0cl0pXG4gICAgfSxcbiAgICBnZW5IZWFkZXJzIChwcm9wczogRGF0YVNjb3BlUHJvcHMpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgLi4udGhpcy5zYW5pdGl6ZWRIZWFkZXJQcm9wcyxcbiAgICAgICAgICBoZWFkZXJzOiB0aGlzLmNvbXB1dGVkSGVhZGVycyxcbiAgICAgICAgICBvcHRpb25zOiBwcm9wcy5vcHRpb25zLFxuICAgICAgICAgIG1vYmlsZTogdGhpcy5pc01vYmlsZSxcbiAgICAgICAgICBzaG93R3JvdXBCeTogdGhpcy5zaG93R3JvdXBCeSxcbiAgICAgICAgICBjaGVja2JveENvbG9yOiB0aGlzLmNoZWNrYm94Q29sb3IsXG4gICAgICAgICAgc29tZUl0ZW1zOiB0aGlzLnNvbWVJdGVtcyxcbiAgICAgICAgICBldmVyeUl0ZW06IHRoaXMuZXZlcnlJdGVtLFxuICAgICAgICAgIHNpbmdsZVNlbGVjdDogdGhpcy5zaW5nbGVTZWxlY3QsXG4gICAgICAgICAgZGlzYWJsZVNvcnQ6IHRoaXMuZGlzYWJsZVNvcnQsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgc29ydDogcHJvcHMuc29ydCxcbiAgICAgICAgICBncm91cDogcHJvcHMuZ3JvdXAsXG4gICAgICAgICAgJ3RvZ2dsZS1zZWxlY3QtYWxsJzogdGhpcy50b2dnbGVTZWxlY3RBbGwsXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IHJlbmFtZSB0byAnaGVhZCc/ICh0aGVhZCwgdGJvZHksIHRmb290KVxuICAgICAgY29uc3QgY2hpbGRyZW46IFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzID0gW2dldFNsb3QodGhpcywgJ2hlYWRlcicsIHtcbiAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgaXNNb2JpbGU6IHRoaXMuaXNNb2JpbGUsXG4gICAgICB9KV1cblxuICAgICAgaWYgKCF0aGlzLmhpZGVEZWZhdWx0SGVhZGVyKSB7XG4gICAgICAgIGNvbnN0IHNjb3BlZFNsb3RzID0gZ2V0UHJlZml4ZWRTY29wZWRTbG90cygnaGVhZGVyLicsIHRoaXMuJHNjb3BlZFNsb3RzKVxuICAgICAgICBjaGlsZHJlbi5wdXNoKHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkRhdGFUYWJsZUhlYWRlciwge1xuICAgICAgICAgIC4uLmRhdGEsXG4gICAgICAgICAgc2NvcGVkU2xvdHMsXG4gICAgICAgIH0pKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5sb2FkaW5nKSBjaGlsZHJlbi5wdXNoKHRoaXMuZ2VuTG9hZGluZygpKVxuXG4gICAgICByZXR1cm4gY2hpbGRyZW5cbiAgICB9LFxuICAgIGdlbkVtcHR5V3JhcHBlciAoY29udGVudDogVk5vZGVDaGlsZHJlbkFycmF5Q29udGVudHMpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCd0cicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWRhdGEtdGFibGVfX2VtcHR5LXdyYXBwZXInLFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCd0ZCcsIHtcbiAgICAgICAgICBhdHRyczogdGhpcy5jb2xzcGFuQXR0cnMsXG4gICAgICAgIH0sIGNvbnRlbnQpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkl0ZW1zIChpdGVtczogYW55W10sIHByb3BzOiBEYXRhU2NvcGVQcm9wcykge1xuICAgICAgY29uc3QgZW1wdHkgPSB0aGlzLmdlbkVtcHR5KHByb3BzLm9yaWdpbmFsSXRlbXNMZW5ndGgsIHByb3BzLnBhZ2luYXRpb24uaXRlbXNMZW5ndGgpXG4gICAgICBpZiAoZW1wdHkpIHJldHVybiBbZW1wdHldXG5cbiAgICAgIHJldHVybiBwcm9wcy5ncm91cGVkSXRlbXNcbiAgICAgICAgPyB0aGlzLmdlbkdyb3VwZWRSb3dzKHByb3BzLmdyb3VwZWRJdGVtcywgcHJvcHMpXG4gICAgICAgIDogdGhpcy5nZW5Sb3dzKGl0ZW1zLCBwcm9wcylcbiAgICB9LFxuICAgIGdlbkdyb3VwZWRSb3dzIChncm91cGVkSXRlbXM6IEl0ZW1Hcm91cDxhbnk+W10sIHByb3BzOiBEYXRhU2NvcGVQcm9wcykge1xuICAgICAgcmV0dXJuIGdyb3VwZWRJdGVtcy5tYXAoZ3JvdXAgPT4ge1xuICAgICAgICBpZiAoIXRoaXMub3BlbkNhY2hlLmhhc093blByb3BlcnR5KGdyb3VwLm5hbWUpKSB0aGlzLiRzZXQodGhpcy5vcGVuQ2FjaGUsIGdyb3VwLm5hbWUsIHRydWUpXG5cbiAgICAgICAgaWYgKHRoaXMuJHNjb3BlZFNsb3RzLmdyb3VwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuJHNjb3BlZFNsb3RzLmdyb3VwKHtcbiAgICAgICAgICAgIGdyb3VwOiBncm91cC5uYW1lLFxuICAgICAgICAgICAgb3B0aW9uczogcHJvcHMub3B0aW9ucyxcbiAgICAgICAgICAgIGlzTW9iaWxlOiB0aGlzLmlzTW9iaWxlLFxuICAgICAgICAgICAgaXRlbXM6IGdyb3VwLml0ZW1zLFxuICAgICAgICAgICAgaGVhZGVyczogdGhpcy5jb21wdXRlZEhlYWRlcnMsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZW5EZWZhdWx0R3JvdXBlZFJvdyhncm91cC5uYW1lLCBncm91cC5pdGVtcywgcHJvcHMpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5EZWZhdWx0R3JvdXBlZFJvdyAoZ3JvdXA6IHN0cmluZywgaXRlbXM6IGFueVtdLCBwcm9wczogRGF0YVNjb3BlUHJvcHMpIHtcbiAgICAgIGNvbnN0IGlzT3BlbiA9ICEhdGhpcy5vcGVuQ2FjaGVbZ3JvdXBdXG4gICAgICBjb25zdCBjaGlsZHJlbjogVk5vZGVDaGlsZHJlbiA9IFtcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnLCB7IHNsb3Q6ICdyb3cuY29udGVudCcgfSwgdGhpcy5nZW5Sb3dzKGl0ZW1zLCBwcm9wcykpLFxuICAgICAgXVxuICAgICAgY29uc3QgdG9nZ2xlRm4gPSAoKSA9PiB0aGlzLiRzZXQodGhpcy5vcGVuQ2FjaGUsIGdyb3VwLCAhdGhpcy5vcGVuQ2FjaGVbZ3JvdXBdKVxuICAgICAgY29uc3QgcmVtb3ZlRm4gPSAoKSA9PiBwcm9wcy51cGRhdGVPcHRpb25zKHsgZ3JvdXBCeTogW10sIGdyb3VwRGVzYzogW10gfSlcblxuICAgICAgaWYgKHRoaXMuJHNjb3BlZFNsb3RzWydncm91cC5oZWFkZXInXSkge1xuICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJywgeyBzbG90OiAnY29sdW1uLmhlYWRlcicgfSwgW1xuICAgICAgICAgIHRoaXMuJHNjb3BlZFNsb3RzWydncm91cC5oZWFkZXInXSEoe1xuICAgICAgICAgICAgZ3JvdXAsXG4gICAgICAgICAgICBncm91cEJ5OiBwcm9wcy5vcHRpb25zLmdyb3VwQnksXG4gICAgICAgICAgICBpc01vYmlsZTogdGhpcy5pc01vYmlsZSxcbiAgICAgICAgICAgIGl0ZW1zLFxuICAgICAgICAgICAgaGVhZGVyczogdGhpcy5jb21wdXRlZEhlYWRlcnMsXG4gICAgICAgICAgICBpc09wZW4sXG4gICAgICAgICAgICB0b2dnbGU6IHRvZ2dsZUZuLFxuICAgICAgICAgICAgcmVtb3ZlOiByZW1vdmVGbixcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB0b2dnbGUgPSB0aGlzLiRjcmVhdGVFbGVtZW50KFZCdG4sIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ21hLTAnLFxuICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpY29uOiB0cnVlLFxuICAgICAgICAgICAgc21hbGw6IHRydWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgY2xpY2s6IHRvZ2dsZUZuLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sIFt0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCBbaXNPcGVuID8gJyRtaW51cycgOiAnJHBsdXMnXSldKVxuXG4gICAgICAgIGNvbnN0IHJlbW92ZSA9IHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkJ0biwge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAnbWEtMCcsXG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGljb246IHRydWUsXG4gICAgICAgICAgICBzbWFsbDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uOiB7XG4gICAgICAgICAgICBjbGljazogcmVtb3ZlRm4sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSwgW3RoaXMuJGNyZWF0ZUVsZW1lbnQoVkljb24sIFsnJGNsb3NlJ10pXSlcblxuICAgICAgICBjb25zdCBjb2x1bW4gPSB0aGlzLiRjcmVhdGVFbGVtZW50KCd0ZCcsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3RleHQtc3RhcnQnLFxuICAgICAgICAgIGF0dHJzOiB0aGlzLmNvbHNwYW5BdHRycyxcbiAgICAgICAgfSwgW3RvZ2dsZSwgYCR7cHJvcHMub3B0aW9ucy5ncm91cEJ5WzBdfTogJHtncm91cH1gLCByZW1vdmVdKVxuXG4gICAgICAgIGNoaWxkcmVuLnVuc2hpZnQodGhpcy4kY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnLCB7IHNsb3Q6ICdjb2x1bW4uaGVhZGVyJyB9LCBbY29sdW1uXSkpXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLiRzY29wZWRTbG90c1snZ3JvdXAuc3VtbWFyeSddKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2godGhpcy4kY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnLCB7IHNsb3Q6ICdjb2x1bW4uc3VtbWFyeScgfSwgW1xuICAgICAgICAgIHRoaXMuJHNjb3BlZFNsb3RzWydncm91cC5zdW1tYXJ5J10hKHtcbiAgICAgICAgICAgIGdyb3VwLFxuICAgICAgICAgICAgZ3JvdXBCeTogcHJvcHMub3B0aW9ucy5ncm91cEJ5LFxuICAgICAgICAgICAgaXNNb2JpbGU6IHRoaXMuaXNNb2JpbGUsXG4gICAgICAgICAgICBpdGVtcyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHRoaXMuY29tcHV0ZWRIZWFkZXJzLFxuICAgICAgICAgICAgaXNPcGVuLFxuICAgICAgICAgICAgdG9nZ2xlOiB0b2dnbGVGbixcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSkpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFJvd0dyb3VwLCB7XG4gICAgICAgIGtleTogZ3JvdXAsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgdmFsdWU6IGlzT3BlbixcbiAgICAgICAgfSxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuUm93cyAoaXRlbXM6IGFueVtdLCBwcm9wczogRGF0YVNjb3BlUHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLiRzY29wZWRTbG90cy5pdGVtID8gdGhpcy5nZW5TY29wZWRSb3dzKGl0ZW1zLCBwcm9wcykgOiB0aGlzLmdlbkRlZmF1bHRSb3dzKGl0ZW1zLCBwcm9wcylcbiAgICB9LFxuICAgIGdlblNjb3BlZFJvd3MgKGl0ZW1zOiBhbnlbXSwgcHJvcHM6IERhdGFTY29wZVByb3BzKSB7XG4gICAgICBjb25zdCByb3dzID0gW11cblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaV1cbiAgICAgICAgcm93cy5wdXNoKHRoaXMuJHNjb3BlZFNsb3RzLml0ZW0hKHtcbiAgICAgICAgICAuLi50aGlzLmNyZWF0ZUl0ZW1Qcm9wcyhpdGVtLCBpKSxcbiAgICAgICAgICBpc01vYmlsZTogdGhpcy5pc01vYmlsZSxcbiAgICAgICAgfSkpXG5cbiAgICAgICAgaWYgKHRoaXMuaXNFeHBhbmRlZChpdGVtKSkge1xuICAgICAgICAgIHJvd3MucHVzaCh0aGlzLiRzY29wZWRTbG90c1snZXhwYW5kZWQtaXRlbSddISh7XG4gICAgICAgICAgICBoZWFkZXJzOiB0aGlzLmNvbXB1dGVkSGVhZGVycyxcbiAgICAgICAgICAgIGlzTW9iaWxlOiB0aGlzLmlzTW9iaWxlLFxuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBpdGVtLFxuICAgICAgICAgIH0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByb3dzXG4gICAgfSxcbiAgICBnZW5EZWZhdWx0Um93cyAoaXRlbXM6IGFueVtdLCBwcm9wczogRGF0YVNjb3BlUHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLiRzY29wZWRTbG90c1snZXhwYW5kZWQtaXRlbSddXG4gICAgICAgID8gaXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gdGhpcy5nZW5EZWZhdWx0RXhwYW5kZWRSb3coaXRlbSwgaW5kZXgpKVxuICAgICAgICA6IGl0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IHRoaXMuZ2VuRGVmYXVsdFNpbXBsZVJvdyhpdGVtLCBpbmRleCkpXG4gICAgfSxcbiAgICBnZW5EZWZhdWx0RXhwYW5kZWRSb3cgKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcik6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGlzRXhwYW5kZWQgPSB0aGlzLmlzRXhwYW5kZWQoaXRlbSlcbiAgICAgIGNvbnN0IGNsYXNzZXMgPSB7XG4gICAgICAgICd2LWRhdGEtdGFibGVfX2V4cGFuZGVkIHYtZGF0YS10YWJsZV9fZXhwYW5kZWRfX3Jvdyc6IGlzRXhwYW5kZWQsXG4gICAgICB9XG4gICAgICBjb25zdCBoZWFkZXJSb3cgPSB0aGlzLmdlbkRlZmF1bHRTaW1wbGVSb3coaXRlbSwgaW5kZXgsIGNsYXNzZXMpXG4gICAgICBjb25zdCBleHBhbmRlZFJvdyA9IHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RyJywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtZGF0YS10YWJsZV9fZXhwYW5kZWQgdi1kYXRhLXRhYmxlX19leHBhbmRlZF9fY29udGVudCcsXG4gICAgICB9LCBbdGhpcy4kc2NvcGVkU2xvdHNbJ2V4cGFuZGVkLWl0ZW0nXSEoe1xuICAgICAgICBoZWFkZXJzOiB0aGlzLmNvbXB1dGVkSGVhZGVycyxcbiAgICAgICAgaXNNb2JpbGU6IHRoaXMuaXNNb2JpbGUsXG4gICAgICAgIGl0ZW0sXG4gICAgICB9KV0pXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFJvd0dyb3VwLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgdmFsdWU6IGlzRXhwYW5kZWQsXG4gICAgICAgIH0sXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJywgeyBzbG90OiAncm93LmhlYWRlcicgfSwgW2hlYWRlclJvd10pLFxuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScsIHsgc2xvdDogJ3Jvdy5jb250ZW50JyB9LCBbZXhwYW5kZWRSb3ddKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgICBnZW5EZWZhdWx0U2ltcGxlUm93IChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIsIGNsYXNzZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0ge30pOiBWTm9kZSB7XG4gICAgICBjb25zdCBzY29wZWRTbG90cyA9IGdldFByZWZpeGVkU2NvcGVkU2xvdHMoJ2l0ZW0uJywgdGhpcy4kc2NvcGVkU2xvdHMpXG5cbiAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmNyZWF0ZUl0ZW1Qcm9wcyhpdGVtLCBpbmRleClcblxuICAgICAgaWYgKHRoaXMuc2hvd1NlbGVjdCkge1xuICAgICAgICBjb25zdCBzbG90ID0gc2NvcGVkU2xvdHNbJ2RhdGEtdGFibGUtc2VsZWN0J11cbiAgICAgICAgc2NvcGVkU2xvdHNbJ2RhdGEtdGFibGUtc2VsZWN0J10gPSBzbG90ID8gKCkgPT4gc2xvdCh7XG4gICAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgICBpc01vYmlsZTogdGhpcy5pc01vYmlsZSxcbiAgICAgICAgfSkgOiAoKSA9PiB0aGlzLiRjcmVhdGVFbGVtZW50KFZTaW1wbGVDaGVja2JveCwge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1kYXRhLXRhYmxlX19jaGVja2JveCcsXG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHZhbHVlOiBkYXRhLmlzU2VsZWN0ZWQsXG4gICAgICAgICAgICBkaXNhYmxlZDogIXRoaXMuaXNTZWxlY3RhYmxlKGl0ZW0pLFxuICAgICAgICAgICAgY29sb3I6IHRoaXMuY2hlY2tib3hDb2xvciA/PyAnJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uOiB7XG4gICAgICAgICAgICBpbnB1dDogKHZhbDogYm9vbGVhbikgPT4gZGF0YS5zZWxlY3QodmFsKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zaG93RXhwYW5kKSB7XG4gICAgICAgIGNvbnN0IHNsb3QgPSBzY29wZWRTbG90c1snZGF0YS10YWJsZS1leHBhbmQnXVxuICAgICAgICBzY29wZWRTbG90c1snZGF0YS10YWJsZS1leHBhbmQnXSA9IHNsb3QgPyAoKSA9PiBzbG90KGRhdGEpIDogKCkgPT4gdGhpcy4kY3JlYXRlRWxlbWVudChWSWNvbiwge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1kYXRhLXRhYmxlX19leHBhbmQtaWNvbicsXG4gICAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAgICd2LWRhdGEtdGFibGVfX2V4cGFuZC1pY29uLS1hY3RpdmUnOiBkYXRhLmlzRXhwYW5kZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgZGF0YS5leHBhbmQoIWRhdGEuaXNFeHBhbmRlZClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSwgW3RoaXMuZXhwYW5kSWNvbl0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KHRoaXMuaXNNb2JpbGUgPyBNb2JpbGVSb3cgOiBSb3csIHtcbiAgICAgICAga2V5OiBnZXRPYmplY3RWYWx1ZUJ5UGF0aChpdGVtLCB0aGlzLml0ZW1LZXkpLFxuICAgICAgICBjbGFzczogbWVyZ2VDbGFzc2VzKFxuICAgICAgICAgIHsgLi4uY2xhc3NlcywgJ3YtZGF0YS10YWJsZV9fc2VsZWN0ZWQnOiBkYXRhLmlzU2VsZWN0ZWQgfSxcbiAgICAgICAgICBnZXRQcm9wZXJ0eUZyb21JdGVtKGl0ZW0sIHRoaXMuaXRlbUNsYXNzKVxuICAgICAgICApLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIGhlYWRlcnM6IHRoaXMuY29tcHV0ZWRIZWFkZXJzLFxuICAgICAgICAgIGhpZGVEZWZhdWx0SGVhZGVyOiB0aGlzLmhpZGVEZWZhdWx0SGVhZGVyLFxuICAgICAgICAgIGluZGV4LFxuICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgcnRsOiB0aGlzLiR2dWV0aWZ5LnJ0bCxcbiAgICAgICAgfSxcbiAgICAgICAgc2NvcGVkU2xvdHMsXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgLy8gVE9ETzogZm9yIGNsaWNrLCB0aGUgZmlyc3QgYXJndW1lbnQgc2hvdWxkIGJlIHRoZSBldmVudCwgYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgc2hvdWxkIGJlIGRhdGEsXG4gICAgICAgICAgLy8gYnV0IHRoaXMgaXMgYSBicmVha2luZyBjaGFuZ2Ugc28gaXQncyBmb3IgdjNcbiAgICAgICAgICBjbGljazogKCkgPT4gdGhpcy4kZW1pdCgnY2xpY2s6cm93JywgaXRlbSwgZGF0YSksXG4gICAgICAgICAgY29udGV4dG1lbnU6IChldmVudDogTW91c2VFdmVudCkgPT4gdGhpcy4kZW1pdCgnY29udGV4dG1lbnU6cm93JywgZXZlbnQsIGRhdGEpLFxuICAgICAgICAgIGRibGNsaWNrOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHRoaXMuJGVtaXQoJ2RibGNsaWNrOnJvdycsIGV2ZW50LCBkYXRhKSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBnZW5Cb2R5IChwcm9wczogRGF0YVNjb3BlUHJvcHMpOiBWTm9kZSB8IHN0cmluZyB8IFZOb2RlQ2hpbGRyZW4ge1xuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgLi4ucHJvcHMsXG4gICAgICAgIGV4cGFuZDogdGhpcy5leHBhbmQsXG4gICAgICAgIGhlYWRlcnM6IHRoaXMuY29tcHV0ZWRIZWFkZXJzLFxuICAgICAgICBpc0V4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQsXG4gICAgICAgIGlzTW9iaWxlOiB0aGlzLmlzTW9iaWxlLFxuICAgICAgICBpc1NlbGVjdGVkOiB0aGlzLmlzU2VsZWN0ZWQsXG4gICAgICAgIHNlbGVjdDogdGhpcy5zZWxlY3QsXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLiRzY29wZWRTbG90cy5ib2R5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRzY29wZWRTbG90cy5ib2R5IShkYXRhKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgndGJvZHknLCBbXG4gICAgICAgIGdldFNsb3QodGhpcywgJ2JvZHkucHJlcGVuZCcsIGRhdGEsIHRydWUpLFxuICAgICAgICB0aGlzLmdlbkl0ZW1zKHByb3BzLml0ZW1zLCBwcm9wcyksXG4gICAgICAgIGdldFNsb3QodGhpcywgJ2JvZHkuYXBwZW5kJywgZGF0YSwgdHJ1ZSksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuRm9vdCAocHJvcHM6IERhdGFTY29wZVByb3BzKTogVk5vZGVbXSB8IHVuZGVmaW5lZCB7XG4gICAgICByZXR1cm4gdGhpcy4kc2NvcGVkU2xvdHMuZm9vdD8uKHByb3BzKVxuICAgIH0sXG4gICAgZ2VuRm9vdGVycyAocHJvcHM6IERhdGFTY29wZVByb3BzKSB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIG9wdGlvbnM6IHByb3BzLm9wdGlvbnMsXG4gICAgICAgICAgcGFnaW5hdGlvbjogcHJvcHMucGFnaW5hdGlvbixcbiAgICAgICAgICBpdGVtc1BlclBhZ2VUZXh0OiAnJHZ1ZXRpZnkuZGF0YVRhYmxlLml0ZW1zUGVyUGFnZVRleHQnLFxuICAgICAgICAgIC4uLnRoaXMuc2FuaXRpemVkRm9vdGVyUHJvcHMsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgJ3VwZGF0ZTpvcHRpb25zJzogKHZhbHVlOiBhbnkpID0+IHByb3BzLnVwZGF0ZU9wdGlvbnModmFsdWUpLFxuICAgICAgICB9LFxuICAgICAgICB3aWR0aHM6IHRoaXMud2lkdGhzLFxuICAgICAgICBoZWFkZXJzOiB0aGlzLmNvbXB1dGVkSGVhZGVycyxcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2hpbGRyZW46IFZOb2RlQ2hpbGRyZW4gPSBbXG4gICAgICAgIGdldFNsb3QodGhpcywgJ2Zvb3RlcicsIGRhdGEsIHRydWUpLFxuICAgICAgXVxuXG4gICAgICBpZiAoIXRoaXMuaGlkZURlZmF1bHRGb290ZXIpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCh0aGlzLiRjcmVhdGVFbGVtZW50KFZEYXRhRm9vdGVyLCB7XG4gICAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgICBzY29wZWRTbG90czogZ2V0UHJlZml4ZWRTY29wZWRTbG90cygnZm9vdGVyLicsIHRoaXMuJHNjb3BlZFNsb3RzKSxcbiAgICAgICAgfSkpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaGlsZHJlblxuICAgIH0sXG4gICAgZ2VuRGVmYXVsdFNjb3BlZFNsb3QgKHByb3BzOiBEYXRhU2NvcGVQcm9wcyk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHNpbXBsZVByb3BzID0ge1xuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICBmaXhlZEhlYWRlcjogdGhpcy5maXhlZEhlYWRlcixcbiAgICAgICAgZGVuc2U6IHRoaXMuZGVuc2UsXG4gICAgICB9XG5cbiAgICAgIC8vIGlmICh0aGlzLnZpcnR1YWxSb3dzKSB7XG4gICAgICAvLyAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZWaXJ0dWFsVGFibGUsIHtcbiAgICAgIC8vICAgICBwcm9wczogT2JqZWN0LmFzc2lnbihzaW1wbGVQcm9wcywge1xuICAgICAgLy8gICAgICAgaXRlbXM6IHByb3BzLml0ZW1zLFxuICAgICAgLy8gICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIC8vICAgICAgIHJvd0hlaWdodDogdGhpcy5kZW5zZSA/IDI0IDogNDgsXG4gICAgICAvLyAgICAgICBoZWFkZXJIZWlnaHQ6IHRoaXMuZGVuc2UgPyAzMiA6IDQ4LFxuICAgICAgLy8gICAgICAgLy8gVE9ETzogZXhwb3NlIHJlc3Qgb2YgcHJvcHMgZnJvbSB2aXJ0dWFsIHRhYmxlP1xuICAgICAgLy8gICAgIH0pLFxuICAgICAgLy8gICAgIHNjb3BlZFNsb3RzOiB7XG4gICAgICAvLyAgICAgICBpdGVtczogKHsgaXRlbXMgfSkgPT4gdGhpcy5nZW5JdGVtcyhpdGVtcywgcHJvcHMpIGFzIGFueSxcbiAgICAgIC8vICAgICB9LFxuICAgICAgLy8gICB9LCBbXG4gICAgICAvLyAgICAgdGhpcy5wcm94eVNsb3QoJ2JvZHkuYmVmb3JlJywgW3RoaXMuZ2VuQ2FwdGlvbihwcm9wcyksIHRoaXMuZ2VuSGVhZGVycyhwcm9wcyldKSxcbiAgICAgIC8vICAgICB0aGlzLnByb3h5U2xvdCgnYm90dG9tJywgdGhpcy5nZW5Gb290ZXJzKHByb3BzKSksXG4gICAgICAvLyAgIF0pXG4gICAgICAvLyB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZTaW1wbGVUYWJsZSwge1xuICAgICAgICBwcm9wczogc2ltcGxlUHJvcHMsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgJ3YtZGF0YS10YWJsZS0tbW9iaWxlJzogdGhpcy5pc01vYmlsZSxcbiAgICAgICAgfSxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy5wcm94eVNsb3QoJ3RvcCcsIGdldFNsb3QodGhpcywgJ3RvcCcsIHtcbiAgICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgICBpc01vYmlsZTogdGhpcy5pc01vYmlsZSxcbiAgICAgICAgfSwgdHJ1ZSkpLFxuICAgICAgICB0aGlzLmdlbkNhcHRpb24ocHJvcHMpLFxuICAgICAgICB0aGlzLmdlbkNvbGdyb3VwKHByb3BzKSxcbiAgICAgICAgdGhpcy5nZW5IZWFkZXJzKHByb3BzKSxcbiAgICAgICAgdGhpcy5nZW5Cb2R5KHByb3BzKSxcbiAgICAgICAgdGhpcy5nZW5Gb290KHByb3BzKSxcbiAgICAgICAgdGhpcy5wcm94eVNsb3QoJ2JvdHRvbScsIHRoaXMuZ2VuRm9vdGVycyhwcm9wcykpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIHByb3h5U2xvdCAoc2xvdDogc3RyaW5nLCBjb250ZW50OiBWTm9kZUNoaWxkcmVuKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnLCB7IHNsb3QgfSwgY29udGVudClcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoKTogVk5vZGUge1xuICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZEYXRhLCB7XG4gICAgICBwcm9wczoge1xuICAgICAgICAuLi50aGlzLiRwcm9wcyxcbiAgICAgICAgY3VzdG9tRmlsdGVyOiB0aGlzLmN1c3RvbUZpbHRlcldpdGhDb2x1bW5zLFxuICAgICAgICBjdXN0b21Tb3J0OiB0aGlzLmN1c3RvbVNvcnRXaXRoSGVhZGVycyxcbiAgICAgICAgaXRlbXNQZXJQYWdlOiB0aGlzLmNvbXB1dGVkSXRlbXNQZXJQYWdlLFxuICAgICAgfSxcbiAgICAgIG9uOiB7XG4gICAgICAgICd1cGRhdGU6b3B0aW9ucyc6ICh2OiBEYXRhT3B0aW9ucywgb2xkOiBEYXRhT3B0aW9ucykgPT4ge1xuICAgICAgICAgIHRoaXMuaW50ZXJuYWxHcm91cEJ5ID0gdi5ncm91cEJ5IHx8IFtdXG4gICAgICAgICAgIWRlZXBFcXVhbCh2LCBvbGQpICYmIHRoaXMuJGVtaXQoJ3VwZGF0ZTpvcHRpb25zJywgdilcbiAgICAgICAgfSxcbiAgICAgICAgJ3VwZGF0ZTpwYWdlJzogKHY6IG51bWJlcikgPT4gdGhpcy4kZW1pdCgndXBkYXRlOnBhZ2UnLCB2KSxcbiAgICAgICAgJ3VwZGF0ZTppdGVtcy1wZXItcGFnZSc6ICh2OiBudW1iZXIpID0+IHRoaXMuJGVtaXQoJ3VwZGF0ZTppdGVtcy1wZXItcGFnZScsIHYpLFxuICAgICAgICAndXBkYXRlOnNvcnQtYnknOiAodjogc3RyaW5nIHwgc3RyaW5nW10pID0+IHRoaXMuJGVtaXQoJ3VwZGF0ZTpzb3J0LWJ5JywgdiksXG4gICAgICAgICd1cGRhdGU6c29ydC1kZXNjJzogKHY6IGJvb2xlYW4gfCBib29sZWFuW10pID0+IHRoaXMuJGVtaXQoJ3VwZGF0ZTpzb3J0LWRlc2MnLCB2KSxcbiAgICAgICAgJ3VwZGF0ZTpncm91cC1ieSc6ICh2OiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4gdGhpcy4kZW1pdCgndXBkYXRlOmdyb3VwLWJ5JywgdiksXG4gICAgICAgICd1cGRhdGU6Z3JvdXAtZGVzYyc6ICh2OiBib29sZWFuIHwgYm9vbGVhbltdKSA9PiB0aGlzLiRlbWl0KCd1cGRhdGU6Z3JvdXAtZGVzYycsIHYpLFxuICAgICAgICBwYWdpbmF0aW9uOiAodjogRGF0YVBhZ2luYXRpb24sIG9sZDogRGF0YVBhZ2luYXRpb24pID0+ICFkZWVwRXF1YWwodiwgb2xkKSAmJiB0aGlzLiRlbWl0KCdwYWdpbmF0aW9uJywgdiksXG4gICAgICAgICdjdXJyZW50LWl0ZW1zJzogKHY6IGFueVtdKSA9PiB7XG4gICAgICAgICAgdGhpcy5pbnRlcm5hbEN1cnJlbnRJdGVtcyA9IHZcbiAgICAgICAgICB0aGlzLiRlbWl0KCdjdXJyZW50LWl0ZW1zJywgdilcbiAgICAgICAgfSxcbiAgICAgICAgJ3BhZ2UtY291bnQnOiAodjogbnVtYmVyKSA9PiB0aGlzLiRlbWl0KCdwYWdlLWNvdW50JywgdiksXG4gICAgICB9LFxuICAgICAgc2NvcGVkU2xvdHM6IHtcbiAgICAgICAgZGVmYXVsdDogdGhpcy5nZW5EZWZhdWx0U2NvcGVkU2xvdCxcbiAgICAgIH0sXG4gICAgfSlcbiAgfSxcbn0pXG4iXX0=
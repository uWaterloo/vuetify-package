import './VDataFooter.sass';
// Components
import VSelect from '../VSelect/VSelect';
import VIcon from '../VIcon';
import VBtn from '../VBtn';
// Types
import Vue from 'vue';
import { getSlot } from '../../util/helpers';
export default Vue.extend({
    name: 'v-data-footer',
    props: {
        options: {
            type: Object,
            required: true,
        },
        pagination: {
            type: Object,
            required: true,
        },
        itemsPerPageOptions: {
            type: Array,
            default: () => ([5, 10, 15, -1]),
        },
        prevIcon: {
            type: String,
            default: '$prev',
        },
        nextIcon: {
            type: String,
            default: '$next',
        },
        firstIcon: {
            type: String,
            default: '$first',
        },
        lastIcon: {
            type: String,
            default: '$last',
        },
        itemsPerPageText: {
            type: String,
            default: '$vuetify.dataFooter.itemsPerPageText',
        },
        itemsPerPageAllText: {
            type: String,
            default: '$vuetify.dataFooter.itemsPerPageAll',
        },
        showFirstLastPage: Boolean,
        showCurrentPage: Boolean,
        disablePagination: Boolean,
        disableItemsPerPage: Boolean,
        pageText: {
            type: String,
            default: '$vuetify.dataFooter.pageText',
        },
    },
    computed: {
        disableNextPageIcon() {
            return this.options.itemsPerPage <= 0 ||
                this.options.page * this.options.itemsPerPage >= this.pagination.itemsLength ||
                this.pagination.pageStop < 0;
        },
        computedDataItemsPerPageOptions() {
            return this.itemsPerPageOptions.map(option => {
                if (typeof option === 'object')
                    return option;
                else
                    return this.genDataItemsPerPageOption(option);
            });
        },
    },
    methods: {
        updateOptions(obj) {
            this.$emit('update:options', Object.assign({}, this.options, obj));
        },
        onFirstPage() {
            this.updateOptions({ page: 1 });
        },
        onPreviousPage() {
            this.updateOptions({ page: this.options.page - 1 });
        },
        onNextPage() {
            this.updateOptions({ page: this.options.page + 1 });
        },
        onLastPage() {
            this.updateOptions({ page: this.pagination.pageCount });
        },
        onChangeItemsPerPage(itemsPerPage) {
            this.updateOptions({ itemsPerPage, page: 1 });
        },
        genDataItemsPerPageOption(option) {
            return {
                text: option === -1 ? this.$vuetify.lang.t(this.itemsPerPageAllText) : String(option),
                value: option,
            };
        },
        genItemsPerPageSelect() {
            let value = this.options.itemsPerPage;
            const computedIPPO = this.computedDataItemsPerPageOptions;
            if (computedIPPO.length <= 1)
                return null;
            if (!computedIPPO.find(ippo => ippo.value === value))
                value = computedIPPO[0];
            return this.$createElement('div', {
                staticClass: 'v-data-footer__select',
            }, [
                this.$vuetify.lang.t(this.itemsPerPageText),
                this.$createElement(VSelect, {
                    attrs: {
                        'aria-label': this.$vuetify.lang.t(this.itemsPerPageText),
                    },
                    props: {
                        disabled: this.disableItemsPerPage,
                        items: computedIPPO,
                        value,
                        hideDetails: true,
                        auto: true,
                        minWidth: '75px',
                    },
                    on: {
                        input: this.onChangeItemsPerPage,
                    },
                }),
            ]);
        },
        genPaginationInfo() {
            let children = ['–'];
            const itemsLength = this.pagination.itemsLength;
            let pageStart = this.pagination.pageStart;
            let pageStop = this.pagination.pageStop;
            if (this.pagination.itemsLength && this.pagination.itemsPerPage) {
                pageStart = this.pagination.pageStart + 1;
                pageStop = itemsLength < this.pagination.pageStop || this.pagination.pageStop < 0
                    ? itemsLength
                    : this.pagination.pageStop;
                children = this.$scopedSlots['page-text']
                    ? [this.$scopedSlots['page-text']({ pageStart, pageStop, itemsLength })]
                    : [this.$vuetify.lang.t(this.pageText, pageStart, pageStop, itemsLength)];
            }
            else if (this.$scopedSlots['page-text']) {
                children = [this.$scopedSlots['page-text']({ pageStart, pageStop, itemsLength })];
            }
            return this.$createElement('div', {
                class: 'v-data-footer__pagination',
            }, children);
        },
        genIcon(click, disabled, label, icon) {
            return this.$createElement(VBtn, {
                props: {
                    disabled: disabled || this.disablePagination,
                    icon: true,
                    text: true,
                },
                on: {
                    click,
                },
                attrs: {
                    'aria-label': label,
                },
            }, [this.$createElement(VIcon, icon)]);
        },
        genIcons() {
            const before = [];
            const after = [];
            before.push(this.genIcon(this.onPreviousPage, this.options.page === 1, this.$vuetify.lang.t('$vuetify.dataFooter.prevPage'), this.$vuetify.rtl ? this.nextIcon : this.prevIcon));
            after.push(this.genIcon(this.onNextPage, this.disableNextPageIcon, this.$vuetify.lang.t('$vuetify.dataFooter.nextPage'), this.$vuetify.rtl ? this.prevIcon : this.nextIcon));
            if (this.showFirstLastPage) {
                before.unshift(this.genIcon(this.onFirstPage, this.options.page === 1, this.$vuetify.lang.t('$vuetify.dataFooter.firstPage'), this.$vuetify.rtl ? this.lastIcon : this.firstIcon));
                after.push(this.genIcon(this.onLastPage, this.options.page >= this.pagination.pageCount || this.options.itemsPerPage === -1, this.$vuetify.lang.t('$vuetify.dataFooter.lastPage'), this.$vuetify.rtl ? this.firstIcon : this.lastIcon));
            }
            return [
                this.$createElement('div', {
                    staticClass: 'v-data-footer__icons-before',
                }, before),
                this.showCurrentPage && this.$createElement('span', [this.options.page.toString()]),
                this.$createElement('div', {
                    staticClass: 'v-data-footer__icons-after',
                }, after),
            ];
        },
    },
    render() {
        return this.$createElement('div', {
            staticClass: 'v-data-footer',
        }, [
            getSlot(this, 'prepend'),
            this.genItemsPerPageSelect(),
            this.genPaginationInfo(),
            this.genIcons(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkRhdGFGb290ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WRGF0YUl0ZXJhdG9yL1ZEYXRhRm9vdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sb0JBQW9CLENBQUE7QUFFM0IsYUFBYTtBQUNiLE9BQU8sT0FBTyxNQUFNLG9CQUFvQixDQUFBO0FBQ3hDLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUM1QixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFFMUIsUUFBUTtBQUNSLE9BQU8sR0FBb0QsTUFBTSxLQUFLLENBQUE7QUFHdEUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBRTVDLGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUN4QixJQUFJLEVBQUUsZUFBZTtJQUVyQixLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsTUFBK0I7WUFDckMsUUFBUSxFQUFFLElBQUk7U0FDZjtRQUNELFVBQVUsRUFBRTtZQUNWLElBQUksRUFBRSxNQUFrQztZQUN4QyxRQUFRLEVBQUUsSUFBSTtTQUNmO1FBQ0QsbUJBQW1CLEVBQUU7WUFDbkIsSUFBSSxFQUFFLEtBQUs7WUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDVTtRQUM1QyxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxPQUFPO1NBQ2pCO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsT0FBTztTQUNqQjtRQUNELFNBQVMsRUFBRTtZQUNULElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLFFBQVE7U0FDbEI7UUFDRCxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsTUFBTTtZ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QUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtZQUNoQyxXQUFXLEVBQUUsZUFBZTtTQUM3QixFQUFFO1lBQ0QsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7WUFDeEIsSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBQzVCLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUN4QixJQUFJLENBQUMsUUFBUSxFQUFFO1NBQ2hCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vVkRhdGFGb290ZXIuc2FzcydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZTZWxlY3QgZnJvbSAnLi4vVlNlbGVjdC9WU2VsZWN0J1xuaW1wb3J0IFZJY29uIGZyb20gJy4uL1ZJY29uJ1xuaW1wb3J0IFZCdG4gZnJvbSAnLi4vVkJ0bidcblxuLy8gVHlwZXNcbmltcG9ydCBWdWUsIHsgVk5vZGUsIFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzLCBQcm9wVHlwZSB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IERhdGFQYWdpbmF0aW9uLCBEYXRhT3B0aW9ucywgRGF0YUl0ZW1zUGVyUGFnZU9wdGlvbiB9IGZyb20gJ3Z1ZXRpZnkvdHlwZXMnXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5pbXBvcnQgeyBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBWdWUuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtZGF0YS1mb290ZXInLFxuXG4gIHByb3BzOiB7XG4gICAgb3B0aW9uczoge1xuICAgICAgdHlwZTogT2JqZWN0IGFzIFByb3BUeXBlPERhdGFPcHRpb25zPixcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAgcGFnaW5hdGlvbjoge1xuICAgICAgdHlwZTogT2JqZWN0IGFzIFByb3BUeXBlPERhdGFQYWdpbmF0aW9uPixcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAgaXRlbXNQZXJQYWdlT3B0aW9uczoge1xuICAgICAgdHlwZTogQXJyYXksXG4gICAgICBkZWZhdWx0OiAoKSA9PiAoWzUsIDEwLCAxNSwgLTFdKSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8RGF0YUl0ZW1zUGVyUGFnZU9wdGlvbltdPixcbiAgICBwcmV2SWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRwcmV2JyxcbiAgICB9LFxuICAgIG5leHRJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJG5leHQnLFxuICAgIH0sXG4gICAgZmlyc3RJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJGZpcnN0JyxcbiAgICB9LFxuICAgIGxhc3RJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJGxhc3QnLFxuICAgIH0sXG4gICAgaXRlbXNQZXJQYWdlVGV4dDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyR2dWV0aWZ5LmRhdGFGb290ZXIuaXRlbXNQZXJQYWdlVGV4dCcsXG4gICAgfSxcbiAgICBpdGVtc1BlclBhZ2VBbGxUZXh0OiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHZ1ZXRpZnkuZGF0YUZvb3Rlci5pdGVtc1BlclBhZ2VBbGwnLFxuICAgIH0sXG4gICAgc2hvd0ZpcnN0TGFzdFBhZ2U6IEJvb2xlYW4sXG4gICAgc2hvd0N1cnJlbnRQYWdlOiBCb29sZWFuLFxuICAgIGRpc2FibGVQYWdpbmF0aW9uOiBCb29sZWFuLFxuICAgIGRpc2FibGVJdGVtc1BlclBhZ2U6IEJvb2xlYW4sXG4gICAgcGFnZVRleHQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5kYXRhRm9vdGVyLnBhZ2VUZXh0JyxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgZGlzYWJsZU5leHRQYWdlSWNvbiAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLml0ZW1zUGVyUGFnZSA8PSAwIHx8XG4gICAgICAgIHRoaXMub3B0aW9ucy5wYWdlICogdGhpcy5vcHRpb25zLml0ZW1zUGVyUGFnZSA+PSB0aGlzLnBhZ2luYXRpb24uaXRlbXNMZW5ndGggfHxcbiAgICAgICAgdGhpcy5wYWdpbmF0aW9uLnBhZ2VTdG9wIDwgMFxuICAgIH0sXG4gICAgY29tcHV0ZWREYXRhSXRlbXNQZXJQYWdlT3B0aW9ucyAoKTogYW55W10ge1xuICAgICAgcmV0dXJuIHRoaXMuaXRlbXNQZXJQYWdlT3B0aW9ucy5tYXAob3B0aW9uID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdvYmplY3QnKSByZXR1cm4gb3B0aW9uXG4gICAgICAgIGVsc2UgcmV0dXJuIHRoaXMuZ2VuRGF0YUl0ZW1zUGVyUGFnZU9wdGlvbihvcHRpb24pXG4gICAgICB9KVxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIHVwZGF0ZU9wdGlvbnMgKG9iajogb2JqZWN0KSB7XG4gICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6b3B0aW9ucycsIE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb2JqKSlcbiAgICB9LFxuICAgIG9uRmlyc3RQYWdlICgpIHtcbiAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyh7IHBhZ2U6IDEgfSlcbiAgICB9LFxuICAgIG9uUHJldmlvdXNQYWdlICgpIHtcbiAgICAgIHRoaXMudXBkYXRlT3B0aW9ucyh7IHBhZ2U6IHRoaXMub3B0aW9ucy5wYWdlIC0gMSB9KVxuICAgIH0sXG4gICAgb25OZXh0UGFnZSAoKSB7XG4gICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMoeyBwYWdlOiB0aGlzLm9wdGlvbnMucGFnZSArIDEgfSlcbiAgICB9LFxuICAgIG9uTGFzdFBhZ2UgKCkge1xuICAgICAgdGhpcy51cGRhdGVPcHRpb25zKHsgcGFnZTogdGhpcy5wYWdpbmF0aW9uLnBhZ2VDb3VudCB9KVxuICAgIH0sXG4gICAgb25DaGFuZ2VJdGVtc1BlclBhZ2UgKGl0ZW1zUGVyUGFnZTogbnVtYmVyKSB7XG4gICAgICB0aGlzLnVwZGF0ZU9wdGlvbnMoeyBpdGVtc1BlclBhZ2UsIHBhZ2U6IDEgfSlcbiAgICB9LFxuICAgIGdlbkRhdGFJdGVtc1BlclBhZ2VPcHRpb24gKG9wdGlvbjogbnVtYmVyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0ZXh0OiBvcHRpb24gPT09IC0xID8gdGhpcy4kdnVldGlmeS5sYW5nLnQodGhpcy5pdGVtc1BlclBhZ2VBbGxUZXh0KSA6IFN0cmluZyhvcHRpb24pLFxuICAgICAgICB2YWx1ZTogb3B0aW9uLFxuICAgICAgfVxuICAgIH0sXG4gICAgZ2VuSXRlbXNQZXJQYWdlU2VsZWN0ICgpIHtcbiAgICAgIGxldCB2YWx1ZSA9IHRoaXMub3B0aW9ucy5pdGVtc1BlclBhZ2VcbiAgICAgIGNvbnN0IGNvbXB1dGVkSVBQTyA9IHRoaXMuY29tcHV0ZWREYXRhSXRlbXNQZXJQYWdlT3B0aW9uc1xuXG4gICAgICBpZiAoY29tcHV0ZWRJUFBPLmxlbmd0aCA8PSAxKSByZXR1cm4gbnVsbFxuXG4gICAgICBpZiAoIWNvbXB1dGVkSVBQTy5maW5kKGlwcG8gPT4gaXBwby52YWx1ZSA9PT0gdmFsdWUpKSB2YWx1ZSA9IGNvbXB1dGVkSVBQT1swXVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtZGF0YS1mb290ZXJfX3NlbGVjdCcsXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMuaXRlbXNQZXJQYWdlVGV4dCksXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVlNlbGVjdCwge1xuICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMuaXRlbXNQZXJQYWdlVGV4dCksXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZUl0ZW1zUGVyUGFnZSxcbiAgICAgICAgICAgIGl0ZW1zOiBjb21wdXRlZElQUE8sXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGhpZGVEZXRhaWxzOiB0cnVlLFxuICAgICAgICAgICAgYXV0bzogdHJ1ZSxcbiAgICAgICAgICAgIG1pbldpZHRoOiAnNzVweCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgaW5wdXQ6IHRoaXMub25DaGFuZ2VJdGVtc1BlclBhZ2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICBdKVxuICAgIH0sXG4gICAgZ2VuUGFnaW5hdGlvbkluZm8gKCkge1xuICAgICAgbGV0IGNoaWxkcmVuOiBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cyA9IFsn4oCTJ11cbiAgICAgIGNvbnN0IGl0ZW1zTGVuZ3RoOiBudW1iZXIgPSB0aGlzLnBhZ2luYXRpb24uaXRlbXNMZW5ndGhcbiAgICAgIGxldCBwYWdlU3RhcnQ6IG51bWJlciA9IHRoaXMucGFnaW5hdGlvbi5wYWdlU3RhcnRcbiAgICAgIGxldCBwYWdlU3RvcDogbnVtYmVyID0gdGhpcy5wYWdpbmF0aW9uLnBhZ2VTdG9wXG5cbiAgICAgIGlmICh0aGlzLnBhZ2luYXRpb24uaXRlbXNMZW5ndGggJiYgdGhpcy5wYWdpbmF0aW9uLml0ZW1zUGVyUGFnZSkge1xuICAgICAgICBwYWdlU3RhcnQgPSB0aGlzLnBhZ2luYXRpb24ucGFnZVN0YXJ0ICsgMVxuICAgICAgICBwYWdlU3RvcCA9IGl0ZW1zTGVuZ3RoIDwgdGhpcy5wYWdpbmF0aW9uLnBhZ2VTdG9wIHx8IHRoaXMucGFnaW5hdGlvbi5wYWdlU3RvcCA8IDBcbiAgICAgICAgICA/IGl0ZW1zTGVuZ3RoXG4gICAgICAgICAgOiB0aGlzLnBhZ2luYXRpb24ucGFnZVN0b3BcblxuICAgICAgICBjaGlsZHJlbiA9IHRoaXMuJHNjb3BlZFNsb3RzWydwYWdlLXRleHQnXVxuICAgICAgICAgID8gW3RoaXMuJHNjb3BlZFNsb3RzWydwYWdlLXRleHQnXSEoeyBwYWdlU3RhcnQsIHBhZ2VTdG9wLCBpdGVtc0xlbmd0aCB9KV1cbiAgICAgICAgICA6IFt0aGlzLiR2dWV0aWZ5LmxhbmcudCh0aGlzLnBhZ2VUZXh0LCBwYWdlU3RhcnQsIHBhZ2VTdG9wLCBpdGVtc0xlbmd0aCldXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuJHNjb3BlZFNsb3RzWydwYWdlLXRleHQnXSkge1xuICAgICAgICBjaGlsZHJlbiA9IFt0aGlzLiRzY29wZWRTbG90c1sncGFnZS10ZXh0J10hKHsgcGFnZVN0YXJ0LCBwYWdlU3RvcCwgaXRlbXNMZW5ndGggfSldXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGNsYXNzOiAndi1kYXRhLWZvb3Rlcl9fcGFnaW5hdGlvbicsXG4gICAgICB9LCBjaGlsZHJlbilcbiAgICB9LFxuICAgIGdlbkljb24gKGNsaWNrOiBGdW5jdGlvbiwgZGlzYWJsZWQ6IGJvb2xlYW4sIGxhYmVsOiBzdHJpbmcsIGljb246IHN0cmluZyk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZCdG4sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQgfHwgdGhpcy5kaXNhYmxlUGFnaW5hdGlvbixcbiAgICAgICAgICBpY29uOiB0cnVlLFxuICAgICAgICAgIHRleHQ6IHRydWUsXG4gICAgICAgICAgLy8gZGFyazogdGhpcy5kYXJrLCAvLyBUT0RPOiBhZGQgbWl4aW5cbiAgICAgICAgICAvLyBsaWdodDogdGhpcy5saWdodCAvLyBUT0RPOiBhZGQgbWl4aW5cbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBjbGljayxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IGxhYmVsLCAvLyBUT0RPOiBMb2NhbGl6YXRpb25cbiAgICAgICAgfSxcbiAgICAgIH0sIFt0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCBpY29uKV0pXG4gICAgfSxcbiAgICBnZW5JY29ucyAoKSB7XG4gICAgICBjb25zdCBiZWZvcmU6IFZOb2RlQ2hpbGRyZW5BcnJheUNvbnRlbnRzID0gW11cbiAgICAgIGNvbnN0IGFmdGVyOiBWTm9kZUNoaWxkcmVuQXJyYXlDb250ZW50cyA9IFtdXG5cbiAgICAgIGJlZm9yZS5wdXNoKHRoaXMuZ2VuSWNvbihcbiAgICAgICAgdGhpcy5vblByZXZpb3VzUGFnZSxcbiAgICAgICAgdGhpcy5vcHRpb25zLnBhZ2UgPT09IDEsXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkubGFuZy50KCckdnVldGlmeS5kYXRhRm9vdGVyLnByZXZQYWdlJyksXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkucnRsID8gdGhpcy5uZXh0SWNvbiA6IHRoaXMucHJldkljb25cbiAgICAgICkpXG5cbiAgICAgIGFmdGVyLnB1c2godGhpcy5nZW5JY29uKFxuICAgICAgICB0aGlzLm9uTmV4dFBhZ2UsXG4gICAgICAgIHRoaXMuZGlzYWJsZU5leHRQYWdlSWNvbixcbiAgICAgICAgdGhpcy4kdnVldGlmeS5sYW5nLnQoJyR2dWV0aWZ5LmRhdGFGb290ZXIubmV4dFBhZ2UnKSxcbiAgICAgICAgdGhpcy4kdnVldGlmeS5ydGwgPyB0aGlzLnByZXZJY29uIDogdGhpcy5uZXh0SWNvblxuICAgICAgKSlcblxuICAgICAgaWYgKHRoaXMuc2hvd0ZpcnN0TGFzdFBhZ2UpIHtcbiAgICAgICAgYmVmb3JlLnVuc2hpZnQodGhpcy5nZW5JY29uKFxuICAgICAgICAgIHRoaXMub25GaXJzdFBhZ2UsXG4gICAgICAgICAgdGhpcy5vcHRpb25zLnBhZ2UgPT09IDEsXG4gICAgICAgICAgdGhpcy4kdnVldGlmeS5sYW5nLnQoJyR2dWV0aWZ5LmRhdGFGb290ZXIuZmlyc3RQYWdlJyksXG4gICAgICAgICAgdGhpcy4kdnVldGlmeS5ydGwgPyB0aGlzLmxhc3RJY29uIDogdGhpcy5maXJzdEljb25cbiAgICAgICAgKSlcblxuICAgICAgICBhZnRlci5wdXNoKHRoaXMuZ2VuSWNvbihcbiAgICAgICAgICB0aGlzLm9uTGFzdFBhZ2UsXG4gICAgICAgICAgdGhpcy5vcHRpb25zLnBhZ2UgPj0gdGhpcy5wYWdpbmF0aW9uLnBhZ2VDb3VudCB8fCB0aGlzLm9wdGlvbnMuaXRlbXNQZXJQYWdlID09PSAtMSxcbiAgICAgICAgICB0aGlzLiR2dWV0aWZ5LmxhbmcudCgnJHZ1ZXRpZnkuZGF0YUZvb3Rlci5sYXN0UGFnZScpLFxuICAgICAgICAgIHRoaXMuJHZ1ZXRpZnkucnRsID8gdGhpcy5maXJzdEljb24gOiB0aGlzLmxhc3RJY29uXG4gICAgICAgICkpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtZGF0YS1mb290ZXJfX2ljb25zLWJlZm9yZScsXG4gICAgICAgIH0sIGJlZm9yZSksXG4gICAgICAgIHRoaXMuc2hvd0N1cnJlbnRQYWdlICYmIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCBbdGhpcy5vcHRpb25zLnBhZ2UudG9TdHJpbmcoKV0pLFxuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWRhdGEtZm9vdGVyX19pY29ucy1hZnRlcicsXG4gICAgICAgIH0sIGFmdGVyKSxcbiAgICAgIF1cbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoKTogVk5vZGUge1xuICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtZGF0YS1mb290ZXInLFxuICAgIH0sIFtcbiAgICAgIGdldFNsb3QodGhpcywgJ3ByZXBlbmQnKSxcbiAgICAgIHRoaXMuZ2VuSXRlbXNQZXJQYWdlU2VsZWN0KCksXG4gICAgICB0aGlzLmdlblBhZ2luYXRpb25JbmZvKCksXG4gICAgICB0aGlzLmdlbkljb25zKCksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=
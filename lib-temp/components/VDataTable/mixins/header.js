import VIcon from '../../VIcon';
import VSimpleCheckbox from '../../VCheckbox/VSimpleCheckbox';
import ripple from '../../../directives/ripple';
import mixins from '../../../util/mixins';
export default mixins().extend({
    // https://github.com/vuejs/vue/issues/6872
    directives: {
        ripple,
    },
    props: {
        headers: {
            type: Array,
            default: () => ([]),
        },
        options: {
            type: Object,
            default: () => ({
                page: 1,
                itemsPerPage: 10,
                sortBy: [],
                sortDesc: [],
                groupBy: [],
                groupDesc: [],
                multiSort: false,
                mustSort: false,
            }),
        },
        checkboxColor: String,
        sortIcon: {
            type: String,
            default: '$sort',
        },
        everyItem: Boolean,
        someItems: Boolean,
        showGroupBy: Boolean,
        singleSelect: Boolean,
        disableSort: Boolean,
    },
    methods: {
        genSelectAll() {
            const data = {
                props: {
                    value: this.everyItem,
                    indeterminate: !this.everyItem && this.someItems,
                    color: this.checkboxColor ?? '',
                },
                on: {
                    input: (v) => this.$emit('toggle-select-all', v),
                },
            };
            if (this.$scopedSlots['data-table-select']) {
                return this.$scopedSlots['data-table-select'](data);
            }
            return this.$createElement(VSimpleCheckbox, {
                staticClass: 'v-data-table__checkbox',
                ...data,
            });
        },
        genSortIcon() {
            return this.$createElement(VIcon, {
                staticClass: 'v-data-table-header__icon',
                props: {
                    size: 18,
                },
            }, [this.sortIcon]);
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkRhdGFUYWJsZS9taXhpbnMvaGVhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sS0FBSyxNQUFNLGFBQWEsQ0FBQTtBQUMvQixPQUFPLGVBQWUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUM3RCxPQUFPLE1BQU0sTUFBTSw0QkFBNEIsQ0FBQTtBQUkvQyxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQVN6QyxlQUFlLE1BQU0sRUFBVyxDQUFDLE1BQU0sQ0FBQztJQUN0QywyQ0FBMkM7SUFDM0MsVUFBVSxFQUFFO1FBQ1YsTUFBTTtLQUNQO0lBRUQsS0FBSyxFQUFFO1FBQ0wsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLEtBQUs7WUFDWCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDZ0I7UUFDckMsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDZCxJQUFJLEVBQUUsQ0FBQztnQkFDUCxZQUFZLEVBQUUsRUFBRTtnQkFDaEIsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsU0FBUyxFQUFFLEtBQUs7Z0JBQ2hCLFFBQVEsRUFBRSxLQUFLO2FBQ2hCLENBQUM7U0FDMkI7UUFDL0IsYUFBYSxFQUFFLE1BQU07UUFDckIsUUFBUSxFQUFFO1lBQ1IsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsT0FBTztTQUNqQjtRQUNELFNBQVMsRUFBRSxPQUFPO1FBQ2xCLFNBQVMsRUFBRSxPQUFPO1FBQ2xCLFdBQVcsRUFBRSxPQUFPO1FBQ3BCLFlBQVksRUFBRSxPQUFPO1FBQ3JCLFdBQVcsRUFBRSxPQUFPO0tBQ3JCO0lBRUQsT0FBTyxFQUFFO1FBQ1AsWUFBWTtZQUNWLE1BQU0sSUFBSSxHQUFHO2dCQUNYLEtBQUssRUFBRTtvQkFDTCxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7b0JBQ3JCLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVM7b0JBQ2hELEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxJQUFJLEVBQUU7aUJBQ2hDO2dCQUNELEVBQUUsRUFBRTtvQkFDRixLQUFLLEVBQUUsQ0FBQyxDQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2lCQUMxRDthQUNGLENBQUE7WUFFRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsRUFBRTtnQkFDMUMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFFLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDckQ7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFO2dCQUMxQyxXQUFXLEVBQUUsd0JBQXdCO2dCQUNyQyxHQUFHLElBQUk7YUFDUixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsV0FBVztZQUNULE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hDLFdBQVcsRUFBRSwyQkFBMkI7Z0JBQ3hDLEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsRUFBRTtpQkFDVDthQUNGLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtRQUNyQixDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWRGF0YVRhYmxlIH0gZnJvbSAnLi4vJ1xuaW1wb3J0IFZJY29uIGZyb20gJy4uLy4uL1ZJY29uJ1xuaW1wb3J0IFZTaW1wbGVDaGVja2JveCBmcm9tICcuLi8uLi9WQ2hlY2tib3gvVlNpbXBsZUNoZWNrYm94J1xuaW1wb3J0IHJpcHBsZSBmcm9tICcuLi8uLi8uLi9kaXJlY3RpdmVzL3JpcHBsZSdcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgRGF0YU9wdGlvbnMsIERhdGFUYWJsZUhlYWRlciB9IGZyb20gJ3Z1ZXRpZnkvdHlwZXMnXG5cbnR5cGUgVkRhdGFUYWJsZUluc3RhbmNlID0gSW5zdGFuY2VUeXBlPHR5cGVvZiBWRGF0YVRhYmxlPlxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIFZ1ZSB7XG4gIGRhdGFUYWJsZTogVkRhdGFUYWJsZUluc3RhbmNlXG59XG5cbmV4cG9ydCBkZWZhdWx0IG1peGluczxvcHRpb25zPigpLmV4dGVuZCh7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUvaXNzdWVzLzY4NzJcbiAgZGlyZWN0aXZlczoge1xuICAgIHJpcHBsZSxcbiAgfSxcblxuICBwcm9wczoge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKFtdKSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8RGF0YVRhYmxlSGVhZGVyW10+LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHR5cGU6IE9iamVjdCxcbiAgICAgIGRlZmF1bHQ6ICgpID0+ICh7XG4gICAgICAgIHBhZ2U6IDEsXG4gICAgICAgIGl0ZW1zUGVyUGFnZTogMTAsXG4gICAgICAgIHNvcnRCeTogW10sXG4gICAgICAgIHNvcnREZXNjOiBbXSxcbiAgICAgICAgZ3JvdXBCeTogW10sXG4gICAgICAgIGdyb3VwRGVzYzogW10sXG4gICAgICAgIG11bHRpU29ydDogZmFsc2UsXG4gICAgICAgIG11c3RTb3J0OiBmYWxzZSxcbiAgICAgIH0pLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxEYXRhT3B0aW9ucz4sXG4gICAgY2hlY2tib3hDb2xvcjogU3RyaW5nLFxuICAgIHNvcnRJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJHNvcnQnLFxuICAgIH0sXG4gICAgZXZlcnlJdGVtOiBCb29sZWFuLFxuICAgIHNvbWVJdGVtczogQm9vbGVhbixcbiAgICBzaG93R3JvdXBCeTogQm9vbGVhbixcbiAgICBzaW5nbGVTZWxlY3Q6IEJvb2xlYW4sXG4gICAgZGlzYWJsZVNvcnQ6IEJvb2xlYW4sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlblNlbGVjdEFsbCAoKSB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIHZhbHVlOiB0aGlzLmV2ZXJ5SXRlbSxcbiAgICAgICAgICBpbmRldGVybWluYXRlOiAhdGhpcy5ldmVyeUl0ZW0gJiYgdGhpcy5zb21lSXRlbXMsXG4gICAgICAgICAgY29sb3I6IHRoaXMuY2hlY2tib3hDb2xvciA/PyAnJyxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHtcbiAgICAgICAgICBpbnB1dDogKHY6IGJvb2xlYW4pID0+IHRoaXMuJGVtaXQoJ3RvZ2dsZS1zZWxlY3QtYWxsJywgdiksXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLiRzY29wZWRTbG90c1snZGF0YS10YWJsZS1zZWxlY3QnXSkge1xuICAgICAgICByZXR1cm4gdGhpcy4kc2NvcGVkU2xvdHNbJ2RhdGEtdGFibGUtc2VsZWN0J10hKGRhdGEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZTaW1wbGVDaGVja2JveCwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtZGF0YS10YWJsZV9fY2hlY2tib3gnLFxuICAgICAgICAuLi5kYXRhLFxuICAgICAgfSlcbiAgICB9LFxuICAgIGdlblNvcnRJY29uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1kYXRhLXRhYmxlLWhlYWRlcl9faWNvbicsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgc2l6ZTogMTgsXG4gICAgICAgIH0sXG4gICAgICB9LCBbdGhpcy5zb3J0SWNvbl0pXG4gICAgfSxcbiAgfSxcbn0pXG4iXX0=
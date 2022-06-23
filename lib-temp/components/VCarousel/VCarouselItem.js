// Extensions
import VWindowItem from '../VWindow/VWindowItem';
// Components
import { VImg } from '../VImg';
// Utilities
import mixins from '../../util/mixins';
import { getSlot } from '../../util/helpers';
import Routable from '../../mixins/routable';
// Types
const baseMixins = mixins(VWindowItem, Routable);
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'v-carousel-item',
    inject: {
        parentTheme: {
            default: {
                isDark: false,
            },
        },
    },
    // pass down the parent's theme
    provide() {
        return {
            theme: this.parentTheme,
        };
    },
    inheritAttrs: false,
    methods: {
        genDefaultSlot() {
            return [
                this.$createElement(VImg, {
                    staticClass: 'v-carousel__item',
                    props: {
                        ...this.$attrs,
                        height: this.windowGroup.internalHeight,
                    },
                    on: this.$listeners,
                    scopedSlots: {
                        placeholder: this.$scopedSlots.placeholder,
                    },
                }, getSlot(this)),
            ];
        },
        genWindowItem() {
            const { tag, data } = this.generateRouteLink();
            data.staticClass = 'v-window-item';
            data.directives.push({
                name: 'show',
                value: this.isActive,
            });
            return this.$createElement(tag, data, this.genDefaultSlot());
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNhcm91c2VsSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZDYXJvdXNlbC9WQ2Fyb3VzZWxJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGFBQWE7QUFDYixPQUFPLFdBQVcsTUFBTSx3QkFBd0IsQ0FBQTtBQUVoRCxhQUFhO0FBQ2IsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUU5QixZQUFZO0FBQ1osT0FBTyxNQUFzQixNQUFNLG1CQUFtQixDQUFBO0FBQ3RELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUM1QyxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUU1QyxRQUFRO0FBQ1IsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixXQUFXLEVBQ1gsUUFBUSxDQUNULENBQUE7QUFRRCxvQkFBb0I7QUFDcEIsZUFBZSxVQUFVLENBQUMsTUFBTSxFQUFXLENBQUMsTUFBTSxDQUFDO0lBQ2pELElBQUksRUFBRSxpQkFBaUI7SUFFdkIsTUFBTSxFQUFFO1FBQ04sV0FBVyxFQUFFO1lBQ1gsT0FBTyxFQUFFO2dCQUNQLE1BQU0sRUFBRSxLQUFLO2FBQ2Q7U0FDRjtLQUNGO0lBRUQsK0JBQStCO0lBQy9CLE9BQU87UUFDTCxPQUFPO1lBQ0wsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXO1NBQ3hCLENBQUE7SUFDSCxDQUFDO0lBRUQsWUFBWSxFQUFFLEtBQUs7SUFFbkIsT0FBTyxFQUFFO1FBQ1AsY0FBYztZQUNaLE9BQU87Z0JBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUU7b0JBQ3hCLFdBQVcsRUFBRSxrQkFBa0I7b0JBQy9CLEtBQUssRUFBRTt3QkFDTCxHQUFHLElBQUksQ0FBQyxNQUFNO3dCQUNkLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWM7cUJBQ3hDO29CQUNELEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVTtvQkFDbkIsV0FBVyxFQUFFO3dCQUNYLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVc7cUJBQzNDO2lCQUNGLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2xCLENBQUE7UUFDSCxDQUFDO1FBQ0QsYUFBYTtZQUNYLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7WUFFOUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUE7WUFDbEMsSUFBSSxDQUFDLFVBQVcsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BCLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUTthQUNyQixDQUFDLENBQUE7WUFFRixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtRQUM5RCxDQUFDO0tBQ0Y7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBFeHRlbnNpb25zXG5pbXBvcnQgVldpbmRvd0l0ZW0gZnJvbSAnLi4vVldpbmRvdy9WV2luZG93SXRlbSdcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IHsgVkltZyB9IGZyb20gJy4uL1ZJbWcnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IFJvdXRhYmxlIGZyb20gJy4uLy4uL21peGlucy9yb3V0YWJsZSdcblxuLy8gVHlwZXNcbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIFZXaW5kb3dJdGVtLFxuICBSb3V0YWJsZVxuKVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEV4dHJhY3RWdWU8dHlwZW9mIGJhc2VNaXhpbnM+IHtcbiAgcGFyZW50VGhlbWU6IHtcbiAgICBpc0Rhcms6IGJvb2xlYW5cbiAgfVxufVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQ8b3B0aW9ucz4oKS5leHRlbmQoe1xuICBuYW1lOiAndi1jYXJvdXNlbC1pdGVtJyxcblxuICBpbmplY3Q6IHtcbiAgICBwYXJlbnRUaGVtZToge1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBpc0Rhcms6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXG4gIC8vIHBhc3MgZG93biB0aGUgcGFyZW50J3MgdGhlbWVcbiAgcHJvdmlkZSAoKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgdGhlbWU6IHRoaXMucGFyZW50VGhlbWUsXG4gICAgfVxuICB9LFxuXG4gIGluaGVyaXRBdHRyczogZmFsc2UsXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkRlZmF1bHRTbG90ICgpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkltZywge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1jYXJvdXNlbF9faXRlbScsXG4gICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIC4uLnRoaXMuJGF0dHJzLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLndpbmRvd0dyb3VwLmludGVybmFsSGVpZ2h0LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgb246IHRoaXMuJGxpc3RlbmVycyxcbiAgICAgICAgICBzY29wZWRTbG90czoge1xuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHRoaXMuJHNjb3BlZFNsb3RzLnBsYWNlaG9sZGVyLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sIGdldFNsb3QodGhpcykpLFxuICAgICAgXVxuICAgIH0sXG4gICAgZ2VuV2luZG93SXRlbSAoKSB7XG4gICAgICBjb25zdCB7IHRhZywgZGF0YSB9ID0gdGhpcy5nZW5lcmF0ZVJvdXRlTGluaygpXG5cbiAgICAgIGRhdGEuc3RhdGljQ2xhc3MgPSAndi13aW5kb3ctaXRlbSdcbiAgICAgIGRhdGEuZGlyZWN0aXZlcyEucHVzaCh7XG4gICAgICAgIG5hbWU6ICdzaG93JyxcbiAgICAgICAgdmFsdWU6IHRoaXMuaXNBY3RpdmUsXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCh0YWcsIGRhdGEsIHRoaXMuZ2VuRGVmYXVsdFNsb3QoKSlcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==
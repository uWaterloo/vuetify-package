// Mixins
import Measurable from '../../mixins/measurable';
import Toggleable from '../../mixins/toggleable';
// Directives
import intersect from '../../directives/intersect';
// Utilities
import mixins from '../../util/mixins';
import { getSlot } from '../../util/helpers';
export default mixins(Measurable, Toggleable).extend({
    name: 'VLazy',
    directives: { intersect },
    props: {
        options: {
            type: Object,
            // For more information on types, navigate to:
            // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
            default: () => ({
                root: undefined,
                rootMargin: undefined,
                threshold: undefined,
            }),
        },
        tag: {
            type: String,
            default: 'div',
        },
        transition: {
            type: String,
            default: 'fade-transition',
        },
    },
    computed: {
        styles() {
            return {
                ...this.measurableStyles,
            };
        },
    },
    methods: {
        genContent() {
            const children = this.isActive && getSlot(this);
            return this.transition
                ? this.$createElement('transition', {
                    props: { name: this.transition },
                }, children)
                : children;
        },
        onObserve(entries, observer, isIntersecting) {
            if (this.isActive)
                return;
            this.isActive = isIntersecting;
        },
    },
    render(h) {
        return h(this.tag, {
            staticClass: 'v-lazy',
            attrs: this.$attrs,
            directives: [{
                    name: 'intersect',
                    value: {
                        handler: this.onObserve,
                        options: this.options,
                    },
                }],
            on: this.$listeners,
            style: this.styles,
        }, [this.genContent()]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxhenkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WTGF6eS9WTGF6eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFFaEQsYUFBYTtBQUNiLE9BQU8sU0FBUyxNQUFNLDRCQUE0QixDQUFBO0FBRWxELFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFNNUMsZUFBZSxNQUFNLENBQ25CLFVBQVUsRUFDVixVQUFVLENBQ1gsQ0FBQyxNQUFNLENBQUM7SUFDUCxJQUFJLEVBQUUsT0FBTztJQUViLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRTtJQUV6QixLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsTUFBTTtZQUNaLDhDQUE4QztZQUM5Qyw2RUFBNkU7WUFDN0UsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLFNBQVMsRUFBRSxTQUFTO2FBQ3JCLENBQUM7U0FDd0M7UUFDNUMsR0FBRyxFQUFFO1lBQ0gsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsS0FBSztTQUNmO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsaUJBQWlCO1NBQzNCO0tBQ0Y7SUFFRCxRQUFRLEVBQUU7UUFDUixNQUFNO1lBQ0osT0FBTztnQkFDTCxHQUFHLElBQUksQ0FBQyxnQkFBZ0I7YUFDekIsQ0FBQTtRQUNILENBQUM7S0FDRjtJQUVELE9BQU8sRUFBRTtRQUNQLFVBQVU7WUFDUixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUUvQyxPQUFPLElBQUksQ0FBQyxVQUFVO2dCQUNwQixDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUU7b0JBQ2xDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFO2lCQUNqQyxFQUFFLFFBQVEsQ0FBQztnQkFDWixDQUFDLENBQUMsUUFBUSxDQUFBO1FBQ2QsQ0FBQztRQUNELFNBQVMsQ0FDUCxPQUFvQyxFQUNwQyxRQUE4QixFQUM5QixjQUF1QjtZQUV2QixJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU07WUFFekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUE7UUFDaEMsQ0FBQztLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ2pCLFdBQVcsRUFBRSxRQUFRO1lBQ3JCLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNsQixVQUFVLEVBQUUsQ0FBQztvQkFDWCxJQUFJLEVBQUUsV0FBVztvQkFDakIsS0FBSyxFQUFFO3dCQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUzt3QkFDdkIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO3FCQUN0QjtpQkFDRixDQUFDO1lBQ0YsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQ25CLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtTQUNuQixFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN6QixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTWl4aW5zXG5pbXBvcnQgTWVhc3VyYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvbWVhc3VyYWJsZSdcbmltcG9ydCBUb2dnbGVhYmxlIGZyb20gJy4uLy4uL21peGlucy90b2dnbGVhYmxlJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgaW50ZXJzZWN0IGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvaW50ZXJzZWN0J1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IG1peGlucyhcbiAgTWVhc3VyYWJsZSxcbiAgVG9nZ2xlYWJsZVxuKS5leHRlbmQoe1xuICBuYW1lOiAnVkxhenknLFxuXG4gIGRpcmVjdGl2ZXM6IHsgaW50ZXJzZWN0IH0sXG5cbiAgcHJvcHM6IHtcbiAgICBvcHRpb25zOiB7XG4gICAgICB0eXBlOiBPYmplY3QsXG4gICAgICAvLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0eXBlcywgbmF2aWdhdGUgdG86XG4gICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSW50ZXJzZWN0aW9uX09ic2VydmVyX0FQSVxuICAgICAgZGVmYXVsdDogKCkgPT4gKHtcbiAgICAgICAgcm9vdDogdW5kZWZpbmVkLFxuICAgICAgICByb290TWFyZ2luOiB1bmRlZmluZWQsXG4gICAgICAgIHRocmVzaG9sZDogdW5kZWZpbmVkLFxuICAgICAgfSksXG4gICAgfSBhcyBQcm9wVmFsaWRhdG9yPEludGVyc2VjdGlvbk9ic2VydmVySW5pdD4sXG4gICAgdGFnOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnZGl2JyxcbiAgICB9LFxuICAgIHRyYW5zaXRpb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdmYWRlLXRyYW5zaXRpb24nLFxuICAgIH0sXG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBzdHlsZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi50aGlzLm1lYXN1cmFibGVTdHlsZXMsXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuQ29udGVudCAoKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuaXNBY3RpdmUgJiYgZ2V0U2xvdCh0aGlzKVxuXG4gICAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uXG4gICAgICAgID8gdGhpcy4kY3JlYXRlRWxlbWVudCgndHJhbnNpdGlvbicsIHtcbiAgICAgICAgICBwcm9wczogeyBuYW1lOiB0aGlzLnRyYW5zaXRpb24gfSxcbiAgICAgICAgfSwgY2hpbGRyZW4pXG4gICAgICAgIDogY2hpbGRyZW5cbiAgICB9LFxuICAgIG9uT2JzZXJ2ZSAoXG4gICAgICBlbnRyaWVzOiBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5W10sXG4gICAgICBvYnNlcnZlcjogSW50ZXJzZWN0aW9uT2JzZXJ2ZXIsXG4gICAgICBpc0ludGVyc2VjdGluZzogYm9vbGVhbixcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSByZXR1cm5cblxuICAgICAgdGhpcy5pc0FjdGl2ZSA9IGlzSW50ZXJzZWN0aW5nXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgodGhpcy50YWcsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1sYXp5JyxcbiAgICAgIGF0dHJzOiB0aGlzLiRhdHRycyxcbiAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgIG5hbWU6ICdpbnRlcnNlY3QnLFxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIGhhbmRsZXI6IHRoaXMub25PYnNlcnZlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSxcbiAgICAgIH1dLFxuICAgICAgb246IHRoaXMuJGxpc3RlbmVycyxcbiAgICAgIHN0eWxlOiB0aGlzLnN0eWxlcyxcbiAgICB9LCBbdGhpcy5nZW5Db250ZW50KCldKVxuICB9LFxufSlcbiJdfQ==
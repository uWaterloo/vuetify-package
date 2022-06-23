import './VResponsive.sass';
// Mixins
import Measurable from '../../mixins/measurable';
// Utils
import mixins from '../../util/mixins';
import { getSlot } from '../../util/helpers';
/* @vue/component */
export default mixins(Measurable).extend({
    name: 'v-responsive',
    props: {
        aspectRatio: [String, Number],
        contentClass: String,
    },
    computed: {
        computedAspectRatio() {
            return Number(this.aspectRatio);
        },
        aspectStyle() {
            return this.computedAspectRatio
                ? { paddingBottom: (1 / this.computedAspectRatio) * 100 + '%' }
                : undefined;
        },
        __cachedSizer() {
            if (!this.aspectStyle)
                return [];
            return this.$createElement('div', {
                style: this.aspectStyle,
                staticClass: 'v-responsive__sizer',
            });
        },
    },
    methods: {
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-responsive__content',
                class: this.contentClass,
            }, getSlot(this));
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-responsive',
            style: this.measurableStyles,
            on: this.$listeners,
        }, [
            this.__cachedSizer,
            this.genContent(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlJlc3BvbnNpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WUmVzcG9uc2l2ZS9WUmVzcG9uc2l2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLG9CQUFvQixDQUFBO0FBRTNCLFNBQVM7QUFDVCxPQUFPLFVBQW9DLE1BQU0seUJBQXlCLENBQUE7QUFLMUUsUUFBUTtBQUNSLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUU1QyxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3ZDLElBQUksRUFBRSxjQUFjO0lBRXBCLEtBQUssRUFBRTtRQUNMLFdBQVcsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQXlCO1FBQ3JELFlBQVksRUFBRSxNQUFNO0tBQ3JCO0lBRUQsUUFBUSxFQUFFO1FBQ1IsbUJBQW1CO1lBQ2pCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNqQyxDQUFDO1FBQ0QsV0FBVztZQUNULE9BQU8sSUFBSSxDQUFDLG1CQUFtQjtnQkFDN0IsQ0FBQyxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUU7Z0JBQy9ELENBQUMsQ0FBQyxTQUFTLENBQUE7UUFDZixDQUFDO1FBQ0QsYUFBYTtZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPLEVBQUUsQ0FBQTtZQUVoQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFO2dCQUNoQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQ3ZCLFdBQVcsRUFBRSxxQkFBcUI7YUFDbkMsQ0FBQyxDQUFBO1FBQ0osQ0FBQztLQUNGO0lBRUQsT0FBTyxFQUFFO1FBQ1AsVUFBVTtZQUNSLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hDLFdBQVcsRUFBRSx1QkFBdUI7Z0JBQ3BDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWTthQUN6QixFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ25CLENBQUM7S0FDRjtJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ2QsV0FBVyxFQUFFLGNBQWM7WUFDM0IsS0FBSyxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7WUFDNUIsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVO1NBQ3BCLEVBQUU7WUFDRCxJQUFJLENBQUMsYUFBYTtZQUNsQixJQUFJLENBQUMsVUFBVSxFQUFFO1NBQ2xCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vVlJlc3BvbnNpdmUuc2FzcydcblxuLy8gTWl4aW5zXG5pbXBvcnQgTWVhc3VyYWJsZSwgeyBOdW1iZXJPck51bWJlclN0cmluZyB9IGZyb20gJy4uLy4uL21peGlucy9tZWFzdXJhYmxlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUnXG5cbi8vIFV0aWxzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgZ2V0U2xvdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcblxuLyogQHZ1ZS9jb21wb25lbnQgKi9cbmV4cG9ydCBkZWZhdWx0IG1peGlucyhNZWFzdXJhYmxlKS5leHRlbmQoe1xuICBuYW1lOiAndi1yZXNwb25zaXZlJyxcblxuICBwcm9wczoge1xuICAgIGFzcGVjdFJhdGlvOiBbU3RyaW5nLCBOdW1iZXJdIGFzIE51bWJlck9yTnVtYmVyU3RyaW5nLFxuICAgIGNvbnRlbnRDbGFzczogU3RyaW5nLFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY29tcHV0ZWRBc3BlY3RSYXRpbyAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBOdW1iZXIodGhpcy5hc3BlY3RSYXRpbylcbiAgICB9LFxuICAgIGFzcGVjdFN0eWxlICgpOiBvYmplY3QgfCB1bmRlZmluZWQge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcHV0ZWRBc3BlY3RSYXRpb1xuICAgICAgICA/IHsgcGFkZGluZ0JvdHRvbTogKDEgLyB0aGlzLmNvbXB1dGVkQXNwZWN0UmF0aW8pICogMTAwICsgJyUnIH1cbiAgICAgICAgOiB1bmRlZmluZWRcbiAgICB9LFxuICAgIF9fY2FjaGVkU2l6ZXIgKCk6IFZOb2RlIHwgW10ge1xuICAgICAgaWYgKCF0aGlzLmFzcGVjdFN0eWxlKSByZXR1cm4gW11cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3R5bGU6IHRoaXMuYXNwZWN0U3R5bGUsXG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1yZXNwb25zaXZlX19zaXplcicsXG4gICAgICB9KVxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkNvbnRlbnQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1yZXNwb25zaXZlX19jb250ZW50JyxcbiAgICAgICAgY2xhc3M6IHRoaXMuY29udGVudENsYXNzLFxuICAgICAgfSwgZ2V0U2xvdCh0aGlzKSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LXJlc3BvbnNpdmUnLFxuICAgICAgc3R5bGU6IHRoaXMubWVhc3VyYWJsZVN0eWxlcyxcbiAgICAgIG9uOiB0aGlzLiRsaXN0ZW5lcnMsXG4gICAgfSwgW1xuICAgICAgdGhpcy5fX2NhY2hlZFNpemVyLFxuICAgICAgdGhpcy5nZW5Db250ZW50KCksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=
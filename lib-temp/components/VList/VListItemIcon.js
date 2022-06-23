// Types
import Vue from 'vue';
/* @vue/component */
export default Vue.extend({
    name: 'v-list-item-icon',
    functional: true,
    render(h, { data, children }) {
        data.staticClass = (`v-list-item__icon ${data.staticClass || ''}`).trim();
        return h('div', data, children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxpc3RJdGVtSWNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZMaXN0L1ZMaXN0SXRlbUljb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBUTtBQUNSLE9BQU8sR0FBYyxNQUFNLEtBQUssQ0FBQTtBQUVoQyxvQkFBb0I7QUFDcEIsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxrQkFBa0I7SUFFeEIsVUFBVSxFQUFFLElBQUk7SUFFaEIsTUFBTSxDQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLHFCQUFxQixJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7UUFFekUsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVHlwZXNcbmltcG9ydCBWdWUsIHsgVk5vZGUgfSBmcm9tICd2dWUnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBWdWUuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtbGlzdC1pdGVtLWljb24nLFxuXG4gIGZ1bmN0aW9uYWw6IHRydWUsXG5cbiAgcmVuZGVyIChoLCB7IGRhdGEsIGNoaWxkcmVuIH0pOiBWTm9kZSB7XG4gICAgZGF0YS5zdGF0aWNDbGFzcyA9IChgdi1saXN0LWl0ZW1fX2ljb24gJHtkYXRhLnN0YXRpY0NsYXNzIHx8ICcnfWApLnRyaW0oKVxuXG4gICAgcmV0dXJuIGgoJ2RpdicsIGRhdGEsIGNoaWxkcmVuKVxuICB9LFxufSlcbiJdfQ==
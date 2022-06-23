// Types
import Vue from 'vue';
// Utils
import { getObjectValueByPath, wrapInArray } from '../../util/helpers';
function needsTd(slot) {
    return slot.length !== 1 ||
        !['td', 'th'].includes(slot[0]?.tag);
}
export default Vue.extend({
    name: 'row',
    functional: true,
    props: {
        headers: Array,
        index: Number,
        item: Object,
        rtl: Boolean,
    },
    render(h, { props, slots, data }) {
        const computedSlots = slots();
        const columns = props.headers.map((header) => {
            const children = [];
            const value = getObjectValueByPath(props.item, header.value);
            const slotName = header.value;
            const scopedSlot = data.scopedSlots && data.scopedSlots.hasOwnProperty(slotName) && data.scopedSlots[slotName];
            const regularSlot = computedSlots.hasOwnProperty(slotName) && computedSlots[slotName];
            if (scopedSlot) {
                children.push(...wrapInArray(scopedSlot({
                    item: props.item,
                    isMobile: false,
                    header,
                    index: props.index,
                    value,
                })));
            }
            else if (regularSlot) {
                children.push(...wrapInArray(regularSlot));
            }
            else {
                children.push(value == null ? value : String(value));
            }
            const textAlign = `text-${header.align || 'start'}`;
            return needsTd(children)
                ? h('td', {
                    class: [
                        textAlign,
                        header.cellClass,
                        {
                            'v-data-table__divider': header.divider,
                        },
                    ],
                }, children)
                : children;
        });
        return h('tr', data, columns);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkRhdGFUYWJsZS9Sb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBUTtBQUNSLE9BQU8sR0FBd0IsTUFBTSxLQUFLLENBQUE7QUFHMUMsUUFBUTtBQUNSLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUV0RSxTQUFTLE9BQU8sQ0FBRSxJQUF5QjtJQUN6QyxPQUFPLElBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBSSxDQUFDLENBQUE7QUFDMUMsQ0FBQztBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUN4QixJQUFJLEVBQUUsS0FBSztJQUVYLFVBQVUsRUFBRSxJQUFJO0lBRWhCLEtBQUssRUFBRTtRQUNMLE9BQU8sRUFBRSxLQUFvQztRQUM3QyxLQUFLLEVBQUUsTUFBTTtRQUNiLElBQUksRUFBRSxNQUFNO1FBQ1osR0FBRyxFQUFFLE9BQU87S0FDYjtJQUVELE1BQU0sQ0FBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtRQUMvQixNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsQ0FBQTtRQUU3QixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQXVCLEVBQUUsRUFBRTtZQUM1RCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUE7WUFDbkIsTUFBTSxLQUFLLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7WUFFNUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQTtZQUM3QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDOUcsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7WUFFckYsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUM7b0JBQ3RDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtvQkFDaEIsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsTUFBTTtvQkFDTixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7b0JBQ2xCLEtBQUs7aUJBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQTthQUNMO2lCQUFNLElBQUksV0FBVyxFQUFFO2dCQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7YUFDM0M7aUJBQU07Z0JBQ0wsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO2FBQ3JEO1lBRUQsTUFBTSxTQUFTLEdBQUcsUUFBUSxNQUFNLENBQUMsS0FBSyxJQUFJLE9BQU8sRUFBRSxDQUFBO1lBRW5ELE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7b0JBQ1IsS0FBSyxFQUFFO3dCQUNMLFNBQVM7d0JBQ1QsTUFBTSxDQUFDLFNBQVM7d0JBQ2hCOzRCQUNFLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxPQUFPO3lCQUN4QztxQkFDRjtpQkFDRixFQUFFLFFBQVEsQ0FBQztnQkFDWixDQUFDLENBQUMsUUFBUSxDQUFBO1FBQ2QsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQy9CLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUeXBlc1xuaW1wb3J0IFZ1ZSwgeyBWTm9kZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBEYXRhVGFibGVIZWFkZXIgfSBmcm9tICd2dWV0aWZ5L3R5cGVzJ1xuXG4vLyBVdGlsc1xuaW1wb3J0IHsgZ2V0T2JqZWN0VmFsdWVCeVBhdGgsIHdyYXBJbkFycmF5IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG5mdW5jdGlvbiBuZWVkc1RkIChzbG90OiBWTm9kZVtdIHwgdW5kZWZpbmVkKSB7XG4gIHJldHVybiBzbG90IS5sZW5ndGggIT09IDEgfHxcbiAgICAhWyd0ZCcsICd0aCddLmluY2x1ZGVzKHNsb3QhWzBdPy50YWchKVxufVxuXG5leHBvcnQgZGVmYXVsdCBWdWUuZXh0ZW5kKHtcbiAgbmFtZTogJ3JvdycsXG5cbiAgZnVuY3Rpb25hbDogdHJ1ZSxcblxuICBwcm9wczoge1xuICAgIGhlYWRlcnM6IEFycmF5IGFzIFByb3BUeXBlPERhdGFUYWJsZUhlYWRlcltdPixcbiAgICBpbmRleDogTnVtYmVyLFxuICAgIGl0ZW06IE9iamVjdCxcbiAgICBydGw6IEJvb2xlYW4sXG4gIH0sXG5cbiAgcmVuZGVyIChoLCB7IHByb3BzLCBzbG90cywgZGF0YSB9KTogVk5vZGUge1xuICAgIGNvbnN0IGNvbXB1dGVkU2xvdHMgPSBzbG90cygpXG5cbiAgICBjb25zdCBjb2x1bW5zID0gcHJvcHMuaGVhZGVycy5tYXAoKGhlYWRlcjogRGF0YVRhYmxlSGVhZGVyKSA9PiB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtdXG4gICAgICBjb25zdCB2YWx1ZSA9IGdldE9iamVjdFZhbHVlQnlQYXRoKHByb3BzLml0ZW0sIGhlYWRlci52YWx1ZSlcblxuICAgICAgY29uc3Qgc2xvdE5hbWUgPSBoZWFkZXIudmFsdWVcbiAgICAgIGNvbnN0IHNjb3BlZFNsb3QgPSBkYXRhLnNjb3BlZFNsb3RzICYmIGRhdGEuc2NvcGVkU2xvdHMuaGFzT3duUHJvcGVydHkoc2xvdE5hbWUpICYmIGRhdGEuc2NvcGVkU2xvdHNbc2xvdE5hbWVdXG4gICAgICBjb25zdCByZWd1bGFyU2xvdCA9IGNvbXB1dGVkU2xvdHMuaGFzT3duUHJvcGVydHkoc2xvdE5hbWUpICYmIGNvbXB1dGVkU2xvdHNbc2xvdE5hbWVdXG5cbiAgICAgIGlmIChzY29wZWRTbG90KSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goLi4ud3JhcEluQXJyYXkoc2NvcGVkU2xvdCh7XG4gICAgICAgICAgaXRlbTogcHJvcHMuaXRlbSxcbiAgICAgICAgICBpc01vYmlsZTogZmFsc2UsXG4gICAgICAgICAgaGVhZGVyLFxuICAgICAgICAgIGluZGV4OiBwcm9wcy5pbmRleCxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgfSkpKVxuICAgICAgfSBlbHNlIGlmIChyZWd1bGFyU2xvdCkge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKC4uLndyYXBJbkFycmF5KHJlZ3VsYXJTbG90KSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2godmFsdWUgPT0gbnVsbCA/IHZhbHVlIDogU3RyaW5nKHZhbHVlKSlcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGV4dEFsaWduID0gYHRleHQtJHtoZWFkZXIuYWxpZ24gfHwgJ3N0YXJ0J31gXG5cbiAgICAgIHJldHVybiBuZWVkc1RkKGNoaWxkcmVuKVxuICAgICAgICA/IGgoJ3RkJywge1xuICAgICAgICAgIGNsYXNzOiBbXG4gICAgICAgICAgICB0ZXh0QWxpZ24sXG4gICAgICAgICAgICBoZWFkZXIuY2VsbENsYXNzLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAndi1kYXRhLXRhYmxlX19kaXZpZGVyJzogaGVhZGVyLmRpdmlkZXIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sIGNoaWxkcmVuKVxuICAgICAgICA6IGNoaWxkcmVuXG4gICAgfSlcblxuICAgIHJldHVybiBoKCd0cicsIGRhdGEsIGNvbHVtbnMpXG4gIH0sXG59KVxuIl19
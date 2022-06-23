import './VBottomSheet.sass';
// Extensions
import VDialog from '../VDialog/VDialog';
/* @vue/component */
export default VDialog.extend({
    name: 'v-bottom-sheet',
    props: {
        inset: Boolean,
        maxWidth: [String, Number],
        transition: {
            type: String,
            default: 'bottom-sheet-transition',
        },
    },
    computed: {
        classes() {
            return {
                ...VDialog.options.computed.classes.call(this),
                'v-bottom-sheet': true,
                'v-bottom-sheet--inset': this.inset,
            };
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkJvdHRvbVNoZWV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkJvdHRvbVNoZWV0L1ZCb3R0b21TaGVldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLHFCQUFxQixDQUFBO0FBRTVCLGFBQWE7QUFDYixPQUFPLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQTtBQUV4QyxvQkFBb0I7QUFDcEIsZUFBZSxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzVCLElBQUksRUFBRSxnQkFBZ0I7SUFFdEIsS0FBSyxFQUFFO1FBQ0wsS0FBSyxFQUFFLE9BQU87UUFDZCxRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQzFCLFVBQVUsRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLHlCQUF5QjtTQUNuQztLQUNGO0lBRUQsUUFBUSxFQUFFO1FBQ1IsT0FBTztZQUNMLE9BQU87Z0JBQ0wsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDOUMsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLEtBQUs7YUFDcEMsQ0FBQTtRQUNILENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9WQm90dG9tU2hlZXQuc2FzcydcblxuLy8gRXh0ZW5zaW9uc1xuaW1wb3J0IFZEaWFsb2cgZnJvbSAnLi4vVkRpYWxvZy9WRGlhbG9nJ1xuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgVkRpYWxvZy5leHRlbmQoe1xuICBuYW1lOiAndi1ib3R0b20tc2hlZXQnLFxuXG4gIHByb3BzOiB7XG4gICAgaW5zZXQ6IEJvb2xlYW4sXG4gICAgbWF4V2lkdGg6IFtTdHJpbmcsIE51bWJlcl0sXG4gICAgdHJhbnNpdGlvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2JvdHRvbS1zaGVldC10cmFuc2l0aW9uJyxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLlZEaWFsb2cub3B0aW9ucy5jb21wdXRlZC5jbGFzc2VzLmNhbGwodGhpcyksXG4gICAgICAgICd2LWJvdHRvbS1zaGVldCc6IHRydWUsXG4gICAgICAgICd2LWJvdHRvbS1zaGVldC0taW5zZXQnOiB0aGlzLmluc2V0LFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG59KVxuIl19
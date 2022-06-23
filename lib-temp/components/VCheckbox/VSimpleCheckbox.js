import './VSimpleCheckbox.sass';
import ripple from '../../directives/ripple';
import Vue from 'vue';
import { VIcon } from '../VIcon';
// Mixins
import Colorable from '../../mixins/colorable';
import Themeable from '../../mixins/themeable';
// Utilities
import mergeData from '../../util/mergeData';
import { wrapInArray } from '../../util/helpers';
export default Vue.extend({
    name: 'v-simple-checkbox',
    functional: true,
    directives: {
        ripple,
    },
    props: {
        ...Colorable.options.props,
        ...Themeable.options.props,
        disabled: Boolean,
        ripple: {
            type: Boolean,
            default: true,
        },
        value: Boolean,
        indeterminate: Boolean,
        indeterminateIcon: {
            type: String,
            default: '$checkboxIndeterminate',
        },
        onIcon: {
            type: String,
            default: '$checkboxOn',
        },
        offIcon: {
            type: String,
            default: '$checkboxOff',
        },
    },
    render(h, { props, data, listeners }) {
        const children = [];
        let icon = props.offIcon;
        if (props.indeterminate)
            icon = props.indeterminateIcon;
        else if (props.value)
            icon = props.onIcon;
        children.push(h(VIcon, Colorable.options.methods.setTextColor(props.value && props.color, {
            props: {
                disabled: props.disabled,
                dark: props.dark,
                light: props.light,
            },
        }), icon));
        if (props.ripple && !props.disabled) {
            const ripple = h('div', Colorable.options.methods.setTextColor(props.color, {
                staticClass: 'v-input--selection-controls__ripple',
                directives: [{
                        name: 'ripple',
                        value: { center: true },
                    }],
            }));
            children.push(ripple);
        }
        return h('div', mergeData(data, {
            class: {
                'v-simple-checkbox': true,
                'v-simple-checkbox--disabled': props.disabled,
            },
            on: {
                click: (e) => {
                    e.stopPropagation();
                    if (data.on && data.on.input && !props.disabled) {
                        wrapInArray(data.on.input).forEach(f => f(!props.value));
                    }
                },
            },
        }), [
            h('div', { staticClass: 'v-input--selection-controls__input' }, children),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNpbXBsZUNoZWNrYm94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkNoZWNrYm94L1ZTaW1wbGVDaGVja2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLHdCQUF3QixDQUFBO0FBRS9CLE9BQU8sTUFBTSxNQUFNLHlCQUF5QixDQUFBO0FBRTVDLE9BQU8sR0FBOEIsTUFBTSxLQUFLLENBQUE7QUFDaEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUVoQyxTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsWUFBWTtBQUNaLE9BQU8sU0FBUyxNQUFNLHNCQUFzQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUVoRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDeEIsSUFBSSxFQUFFLG1CQUFtQjtJQUV6QixVQUFVLEVBQUUsSUFBSTtJQUVoQixVQUFVLEVBQUU7UUFDVixNQUFNO0tBQ1A7SUFFRCxLQUFLLEVBQUU7UUFDTCxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSztRQUMxQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSztRQUMxQixRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsT0FBTztZQUNiLE9BQU8sRUFBRSxJQUFJO1NBQ2Q7UUFDRCxLQUFLLEVBQUUsT0FBTztRQUNkLGFBQWEsRUFBRSxPQUFPO1FBQ3RCLGlCQUFpQixFQUFFO1lBQ2pCLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLHdCQUF3QjtTQUNsQztRQUNELE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLGFBQWE7U0FDdkI7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxjQUFjO1NBQ3hCO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7UUFDbkMsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFBO1FBQ25CLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUE7UUFDeEIsSUFBSSxLQUFLLENBQUMsYUFBYTtZQUFFLElBQUksR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUE7YUFDbEQsSUFBSSxLQUFLLENBQUMsS0FBSztZQUFFLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFBO1FBRXpDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ3hGLEtBQUssRUFBRTtnQkFDTCxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7Z0JBQ3hCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtnQkFDaEIsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO2FBQ25CO1NBQ0YsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7UUFFVixJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ25DLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7Z0JBQzFFLFdBQVcsRUFBRSxxQ0FBcUM7Z0JBQ2xELFVBQVUsRUFBRSxDQUFDO3dCQUNYLElBQUksRUFBRSxRQUFRO3dCQUNkLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7cUJBQ3hCLENBQXFCO2FBQ3ZCLENBQUMsQ0FBQyxDQUFBO1lBRUgsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUN0QjtRQUVELE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFDWixTQUFTLENBQUMsSUFBSSxFQUFFO1lBQ2QsS0FBSyxFQUFFO2dCQUNMLG1CQUFtQixFQUFFLElBQUk7Z0JBQ3pCLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxRQUFRO2FBQzlDO1lBQ0QsRUFBRSxFQUFFO2dCQUNGLEtBQUssRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFO29CQUN2QixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUE7b0JBRW5CLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7d0JBQy9DLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO3FCQUN6RDtnQkFDSCxDQUFDO2FBQ0Y7U0FDRixDQUFDLEVBQUU7WUFDRixDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLG9DQUFvQyxFQUFFLEVBQUUsUUFBUSxDQUFDO1NBQzFFLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vVlNpbXBsZUNoZWNrYm94LnNhc3MnXG5cbmltcG9ydCByaXBwbGUgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9yaXBwbGUnXG5cbmltcG9ydCBWdWUsIHsgVk5vZGUsIFZOb2RlRGlyZWN0aXZlIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgVkljb24gfSBmcm9tICcuLi9WSWNvbidcblxuLy8gTWl4aW5zXG5pbXBvcnQgQ29sb3JhYmxlIGZyb20gJy4uLy4uL21peGlucy9jb2xvcmFibGUnXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1lcmdlRGF0YSBmcm9tICcuLi8uLi91dGlsL21lcmdlRGF0YSdcbmltcG9ydCB7IHdyYXBJbkFycmF5IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBWdWUuZXh0ZW5kKHtcbiAgbmFtZTogJ3Ytc2ltcGxlLWNoZWNrYm94JyxcblxuICBmdW5jdGlvbmFsOiB0cnVlLFxuXG4gIGRpcmVjdGl2ZXM6IHtcbiAgICByaXBwbGUsXG4gIH0sXG5cbiAgcHJvcHM6IHtcbiAgICAuLi5Db2xvcmFibGUub3B0aW9ucy5wcm9wcyxcbiAgICAuLi5UaGVtZWFibGUub3B0aW9ucy5wcm9wcyxcbiAgICBkaXNhYmxlZDogQm9vbGVhbixcbiAgICByaXBwbGU6IHtcbiAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgdmFsdWU6IEJvb2xlYW4sXG4gICAgaW5kZXRlcm1pbmF0ZTogQm9vbGVhbixcbiAgICBpbmRldGVybWluYXRlSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRjaGVja2JveEluZGV0ZXJtaW5hdGUnLFxuICAgIH0sXG4gICAgb25JY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJGNoZWNrYm94T24nLFxuICAgIH0sXG4gICAgb2ZmSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRjaGVja2JveE9mZicsXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgsIHsgcHJvcHMsIGRhdGEsIGxpc3RlbmVycyB9KTogVk5vZGUge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gW11cbiAgICBsZXQgaWNvbiA9IHByb3BzLm9mZkljb25cbiAgICBpZiAocHJvcHMuaW5kZXRlcm1pbmF0ZSkgaWNvbiA9IHByb3BzLmluZGV0ZXJtaW5hdGVJY29uXG4gICAgZWxzZSBpZiAocHJvcHMudmFsdWUpIGljb24gPSBwcm9wcy5vbkljb25cblxuICAgIGNoaWxkcmVuLnB1c2goaChWSWNvbiwgQ29sb3JhYmxlLm9wdGlvbnMubWV0aG9kcy5zZXRUZXh0Q29sb3IocHJvcHMudmFsdWUgJiYgcHJvcHMuY29sb3IsIHtcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGRpc2FibGVkOiBwcm9wcy5kaXNhYmxlZCxcbiAgICAgICAgZGFyazogcHJvcHMuZGFyayxcbiAgICAgICAgbGlnaHQ6IHByb3BzLmxpZ2h0LFxuICAgICAgfSxcbiAgICB9KSwgaWNvbikpXG5cbiAgICBpZiAocHJvcHMucmlwcGxlICYmICFwcm9wcy5kaXNhYmxlZCkge1xuICAgICAgY29uc3QgcmlwcGxlID0gaCgnZGl2JywgQ29sb3JhYmxlLm9wdGlvbnMubWV0aG9kcy5zZXRUZXh0Q29sb3IocHJvcHMuY29sb3IsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWlucHV0LS1zZWxlY3Rpb24tY29udHJvbHNfX3JpcHBsZScsXG4gICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgbmFtZTogJ3JpcHBsZScsXG4gICAgICAgICAgdmFsdWU6IHsgY2VudGVyOiB0cnVlIH0sXG4gICAgICAgIH1dIGFzIFZOb2RlRGlyZWN0aXZlW10sXG4gICAgICB9KSlcblxuICAgICAgY2hpbGRyZW4ucHVzaChyaXBwbGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIGgoJ2RpdicsXG4gICAgICBtZXJnZURhdGEoZGF0YSwge1xuICAgICAgICBjbGFzczoge1xuICAgICAgICAgICd2LXNpbXBsZS1jaGVja2JveCc6IHRydWUsXG4gICAgICAgICAgJ3Ytc2ltcGxlLWNoZWNrYm94LS1kaXNhYmxlZCc6IHByb3BzLmRpc2FibGVkLFxuICAgICAgICB9LFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgICAgICAgICBpZiAoZGF0YS5vbiAmJiBkYXRhLm9uLmlucHV0ICYmICFwcm9wcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICB3cmFwSW5BcnJheShkYXRhLm9uLmlucHV0KS5mb3JFYWNoKGYgPT4gZighcHJvcHMudmFsdWUpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9KSwgW1xuICAgICAgICBoKCdkaXYnLCB7IHN0YXRpY0NsYXNzOiAndi1pbnB1dC0tc2VsZWN0aW9uLWNvbnRyb2xzX19pbnB1dCcgfSwgY2hpbGRyZW4pLFxuICAgICAgXSlcbiAgfSxcbn0pXG4iXX0=
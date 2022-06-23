import './VIcon.sass';
// Mixins
import BindsAttrs from '../../mixins/binds-attrs';
import Colorable from '../../mixins/colorable';
import Sizeable from '../../mixins/sizeable';
import Themeable from '../../mixins/themeable';
// Util
import { convertToUnit, keys, remapInternalIcon } from '../../util/helpers';
// Types
import Vue from 'vue';
import mixins from '../../util/mixins';
var SIZE_MAP;
(function (SIZE_MAP) {
    SIZE_MAP["xSmall"] = "12px";
    SIZE_MAP["small"] = "16px";
    SIZE_MAP["default"] = "24px";
    SIZE_MAP["medium"] = "28px";
    SIZE_MAP["large"] = "36px";
    SIZE_MAP["xLarge"] = "40px";
})(SIZE_MAP || (SIZE_MAP = {}));
function isFontAwesome5(iconType) {
    return ['fas', 'far', 'fal', 'fab', 'fad', 'fak'].some(val => iconType.includes(val));
}
function isSvgPath(icon) {
    return (/^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(icon) && /[\dz]$/i.test(icon) && icon.length > 4);
}
const VIcon = mixins(BindsAttrs, Colorable, Sizeable, Themeable
/* @vue/component */
).extend({
    name: 'v-icon',
    props: {
        dense: Boolean,
        disabled: Boolean,
        left: Boolean,
        right: Boolean,
        size: [Number, String],
        tag: {
            type: String,
            required: false,
            default: 'i',
        },
    },
    computed: {
        medium() {
            return false;
        },
        hasClickListener() {
            return Boolean(this.listeners$.click || this.listeners$['!click']);
        },
    },
    methods: {
        getIcon() {
            let iconName = '';
            if (this.$slots.default)
                iconName = this.$slots.default[0].text.trim();
            return remapInternalIcon(this, iconName);
        },
        getSize() {
            const sizes = {
                xSmall: this.xSmall,
                small: this.small,
                medium: this.medium,
                large: this.large,
                xLarge: this.xLarge,
            };
            const explicitSize = keys(sizes).find(key => sizes[key]);
            return ((explicitSize && SIZE_MAP[explicitSize]) || convertToUnit(this.size));
        },
        // Component data for both font icon and SVG wrapper span
        getDefaultData() {
            return {
                staticClass: 'v-icon notranslate',
                class: {
                    'v-icon--disabled': this.disabled,
                    'v-icon--left': this.left,
                    'v-icon--link': this.hasClickListener,
                    'v-icon--right': this.right,
                    'v-icon--dense': this.dense,
                },
                attrs: {
                    'aria-hidden': !this.hasClickListener,
                    disabled: this.hasClickListener && this.disabled,
                    type: this.hasClickListener ? 'button' : undefined,
                    ...this.attrs$,
                },
                on: this.listeners$,
            };
        },
        getSvgWrapperData() {
            const fontSize = this.getSize();
            const wrapperData = {
                ...this.getDefaultData(),
                style: fontSize ? {
                    fontSize,
                    height: fontSize,
                    width: fontSize,
                } : undefined,
            };
            this.applyColors(wrapperData);
            return wrapperData;
        },
        applyColors(data) {
            data.class = { ...data.class, ...this.themeClasses };
            this.setTextColor(this.color, data);
        },
        renderFontIcon(icon, h) {
            const newChildren = [];
            const data = this.getDefaultData();
            let iconType = 'material-icons';
            // Material Icon delimiter is _
            // https://material.io/icons/
            const delimiterIndex = icon.indexOf('-');
            const isMaterialIcon = delimiterIndex <= -1;
            if (isMaterialIcon) {
                // Material icon uses ligatures.
                newChildren.push(icon);
            }
            else {
                iconType = icon.slice(0, delimiterIndex);
                if (isFontAwesome5(iconType))
                    iconType = '';
            }
            data.class[iconType] = true;
            data.class[icon] = !isMaterialIcon;
            const fontSize = this.getSize();
            if (fontSize)
                data.style = { fontSize };
            this.applyColors(data);
            return h(this.hasClickListener ? 'button' : this.tag, data, newChildren);
        },
        renderSvgIcon(icon, h) {
            const svgData = {
                class: 'v-icon__svg',
                attrs: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    role: 'img',
                    'aria-hidden': true,
                },
            };
            const size = this.getSize();
            if (size) {
                svgData.style = {
                    fontSize: size,
                    height: size,
                    width: size,
                };
            }
            return h(this.hasClickListener ? 'button' : 'span', this.getSvgWrapperData(), [
                h('svg', svgData, [
                    h('path', {
                        attrs: {
                            d: icon,
                        },
                    }),
                ]),
            ]);
        },
        renderSvgIconComponent(icon, h) {
            const data = {
                class: {
                    'v-icon__component': true,
                },
            };
            const size = this.getSize();
            if (size) {
                data.style = {
                    fontSize: size,
                    height: size,
                    width: size,
                };
            }
            this.applyColors(data);
            const component = icon.component;
            data.props = icon.props;
            data.nativeOn = data.on;
            return h(this.hasClickListener ? 'button' : 'span', this.getSvgWrapperData(), [
                h(component, data),
            ]);
        },
    },
    render(h) {
        const icon = this.getIcon();
        if (typeof icon === 'string') {
            if (isSvgPath(icon)) {
                return this.renderSvgIcon(icon, h);
            }
            return this.renderFontIcon(icon, h);
        }
        return this.renderSvgIconComponent(icon, h);
    },
});
export default Vue.extend({
    name: 'v-icon',
    $_wrapperFor: VIcon,
    functional: true,
    render(h, { data, children }) {
        let iconName = '';
        // Support usage of v-text and v-html
        if (data.domProps) {
            iconName = data.domProps.textContent ||
                data.domProps.innerHTML ||
                iconName;
            // Remove nodes so it doesn't
            // overwrite our changes
            delete data.domProps.textContent;
            delete data.domProps.innerHTML;
        }
        return h(VIcon, data, iconName ? [iconName] : children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkljb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WSWNvbi9WSWNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGNBQWMsQ0FBQTtBQUVyQixTQUFTO0FBQ1QsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxRQUFRLE1BQU0sdUJBQXVCLENBQUE7QUFDNUMsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsT0FBTztBQUNQLE9BQU8sRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFM0UsUUFBUTtBQUNSLE9BQU8sR0FBdUQsTUFBTSxLQUFLLENBQUE7QUFDekUsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFHdEMsSUFBSyxRQU9KO0FBUEQsV0FBSyxRQUFRO0lBQ1gsMkJBQWUsQ0FBQTtJQUNmLDBCQUFjLENBQUE7SUFDZCw0QkFBZ0IsQ0FBQTtJQUNoQiwyQkFBZSxDQUFBO0lBQ2YsMEJBQWMsQ0FBQTtJQUNkLDJCQUFlLENBQUE7QUFDakIsQ0FBQyxFQVBJLFFBQVEsS0FBUixRQUFRLFFBT1o7QUFFRCxTQUFTLGNBQWMsQ0FBRSxRQUFnQjtJQUN2QyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDdkYsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFFLElBQVk7SUFDOUIsT0FBTyxDQUFDLHlDQUF5QyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJ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QUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBO2FBQ25DO1lBQ0QsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUNwQztRQUVELE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0NBQ0YsQ0FBQyxDQUFBO0FBRUYsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxRQUFRO0lBRWQsWUFBWSxFQUFFLEtBQUs7SUFFbkIsVUFBVSxFQUFFLElBQUk7SUFFaEIsTUFBTSxDQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDM0IsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFBO1FBRWpCLHFDQUFxQztRQUNyQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDakIsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVztnQkFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTO2dCQUN2QixRQUFRLENBQUE7WUFFViw2QkFBNkI7WUFDN0Isd0JBQXdCO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUE7WUFDaEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQTtTQUMvQjtRQUVELE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN6RCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuL1ZJY29uLnNhc3MnXG5cbi8vIE1peGluc1xuaW1wb3J0IEJpbmRzQXR0cnMgZnJvbSAnLi4vLi4vbWl4aW5zL2JpbmRzLWF0dHJzJ1xuaW1wb3J0IENvbG9yYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvY29sb3JhYmxlJ1xuaW1wb3J0IFNpemVhYmxlIGZyb20gJy4uLy4uL21peGlucy9zaXplYWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcblxuLy8gVXRpbFxuaW1wb3J0IHsgY29udmVydFRvVW5pdCwga2V5cywgcmVtYXBJbnRlcm5hbEljb24gfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlLCB7IENyZWF0ZUVsZW1lbnQsIFZOb2RlLCBWTm9kZUNoaWxkcmVuLCBWTm9kZURhdGEgfSBmcm9tICd2dWUnXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgVnVldGlmeUljb24sIFZ1ZXRpZnlJY29uQ29tcG9uZW50IH0gZnJvbSAndnVldGlmeS90eXBlcy9zZXJ2aWNlcy9pY29ucydcblxuZW51bSBTSVpFX01BUCB7XG4gIHhTbWFsbCA9ICcxMnB4JyxcbiAgc21hbGwgPSAnMTZweCcsXG4gIGRlZmF1bHQgPSAnMjRweCcsXG4gIG1lZGl1bSA9ICcyOHB4JyxcbiAgbGFyZ2UgPSAnMzZweCcsXG4gIHhMYXJnZSA9ICc0MHB4J1xufVxuXG5mdW5jdGlvbiBpc0ZvbnRBd2Vzb21lNSAoaWNvblR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gWydmYXMnLCAnZmFyJywgJ2ZhbCcsICdmYWInLCAnZmFkJywgJ2ZhayddLnNvbWUodmFsID0+IGljb25UeXBlLmluY2x1ZGVzKHZhbCkpXG59XG5cbmZ1bmN0aW9uIGlzU3ZnUGF0aCAoaWNvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAoL15bbXpsaHZjc3F0YV1cXHMqWy0rLjAtOV1bXm1saHZ6Y3NxdGFdKy9pLnRlc3QoaWNvbikgJiYgL1tcXGR6XSQvaS50ZXN0KGljb24pICYmIGljb24ubGVuZ3RoID4gNClcbn1cblxuY29uc3QgVkljb24gPSBtaXhpbnMoXG4gIEJpbmRzQXR0cnMsXG4gIENvbG9yYWJsZSxcbiAgU2l6ZWFibGUsXG4gIFRoZW1lYWJsZVxuICAvKiBAdnVlL2NvbXBvbmVudCAqL1xuKS5leHRlbmQoe1xuICBuYW1lOiAndi1pY29uJyxcblxuICBwcm9wczoge1xuICAgIGRlbnNlOiBCb29sZWFuLFxuICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIGxlZnQ6IEJvb2xlYW4sXG4gICAgcmlnaHQ6IEJvb2xlYW4sXG4gICAgc2l6ZTogW051bWJlciwgU3RyaW5nXSxcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIGRlZmF1bHQ6ICdpJyxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgbWVkaXVtICgpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG4gICAgaGFzQ2xpY2tMaXN0ZW5lciAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gQm9vbGVhbihcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMkLmNsaWNrIHx8IHRoaXMubGlzdGVuZXJzJFsnIWNsaWNrJ11cbiAgICAgIClcbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZXRJY29uICgpOiBWdWV0aWZ5SWNvbiB7XG4gICAgICBsZXQgaWNvbk5hbWUgPSAnJ1xuICAgICAgaWYgKHRoaXMuJHNsb3RzLmRlZmF1bHQpIGljb25OYW1lID0gdGhpcy4kc2xvdHMuZGVmYXVsdFswXS50ZXh0IS50cmltKClcblxuICAgICAgcmV0dXJuIHJlbWFwSW50ZXJuYWxJY29uKHRoaXMsIGljb25OYW1lKVxuICAgIH0sXG4gICAgZ2V0U2l6ZSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICB4U21hbGw6IHRoaXMueFNtYWxsLFxuICAgICAgICBzbWFsbDogdGhpcy5zbWFsbCxcbiAgICAgICAgbWVkaXVtOiB0aGlzLm1lZGl1bSxcbiAgICAgICAgbGFyZ2U6IHRoaXMubGFyZ2UsXG4gICAgICAgIHhMYXJnZTogdGhpcy54TGFyZ2UsXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGV4cGxpY2l0U2l6ZSA9IGtleXMoc2l6ZXMpLmZpbmQoa2V5ID0+IHNpemVzW2tleV0pXG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIChleHBsaWNpdFNpemUgJiYgU0laRV9NQVBbZXhwbGljaXRTaXplXSkgfHwgY29udmVydFRvVW5pdCh0aGlzLnNpemUpXG4gICAgICApXG4gICAgfSxcbiAgICAvLyBDb21wb25lbnQgZGF0YSBmb3IgYm90aCBmb250IGljb24gYW5kIFNWRyB3cmFwcGVyIHNwYW5cbiAgICBnZXREZWZhdWx0RGF0YSAoKTogVk5vZGVEYXRhIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1pY29uIG5vdHJhbnNsYXRlJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1pY29uLS1kaXNhYmxlZCc6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgJ3YtaWNvbi0tbGVmdCc6IHRoaXMubGVmdCxcbiAgICAgICAgICAndi1pY29uLS1saW5rJzogdGhpcy5oYXNDbGlja0xpc3RlbmVyLFxuICAgICAgICAgICd2LWljb24tLXJpZ2h0JzogdGhpcy5yaWdodCxcbiAgICAgICAgICAndi1pY29uLS1kZW5zZSc6IHRoaXMuZGVuc2UsXG4gICAgICAgIH0sXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgJ2FyaWEtaGlkZGVuJzogIXRoaXMuaGFzQ2xpY2tMaXN0ZW5lcixcbiAgICAgICAgICBkaXNhYmxlZDogdGhpcy5oYXNDbGlja0xpc3RlbmVyICYmIHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgdHlwZTogdGhpcy5oYXNDbGlja0xpc3RlbmVyID8gJ2J1dHRvbicgOiB1bmRlZmluZWQsXG4gICAgICAgICAgLi4udGhpcy5hdHRycyQsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB0aGlzLmxpc3RlbmVycyQsXG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRTdmdXcmFwcGVyRGF0YSAoKSB7XG4gICAgICBjb25zdCBmb250U2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpXG4gICAgICBjb25zdCB3cmFwcGVyRGF0YSA9IHtcbiAgICAgICAgLi4udGhpcy5nZXREZWZhdWx0RGF0YSgpLFxuICAgICAgICBzdHlsZTogZm9udFNpemUgPyB7XG4gICAgICAgICAgZm9udFNpemUsXG4gICAgICAgICAgaGVpZ2h0OiBmb250U2l6ZSxcbiAgICAgICAgICB3aWR0aDogZm9udFNpemUsXG4gICAgICAgIH0gOiB1bmRlZmluZWQsXG4gICAgICB9XG4gICAgICB0aGlzLmFwcGx5Q29sb3JzKHdyYXBwZXJEYXRhKVxuXG4gICAgICByZXR1cm4gd3JhcHBlckRhdGFcbiAgICB9LFxuICAgIGFwcGx5Q29sb3JzIChkYXRhOiBWTm9kZURhdGEpOiB2b2lkIHtcbiAgICAgIGRhdGEuY2xhc3MgPSB7IC4uLmRhdGEuY2xhc3MsIC4uLnRoaXMudGhlbWVDbGFzc2VzIH1cbiAgICAgIHRoaXMuc2V0VGV4dENvbG9yKHRoaXMuY29sb3IsIGRhdGEpXG4gICAgfSxcbiAgICByZW5kZXJGb250SWNvbiAoaWNvbjogc3RyaW5nLCBoOiBDcmVhdGVFbGVtZW50KTogVk5vZGUge1xuICAgICAgY29uc3QgbmV3Q2hpbGRyZW46IFZOb2RlQ2hpbGRyZW4gPSBbXVxuICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0RGVmYXVsdERhdGEoKVxuXG4gICAgICBsZXQgaWNvblR5cGUgPSAnbWF0ZXJpYWwtaWNvbnMnXG4gICAgICAvLyBNYXRlcmlhbCBJY29uIGRlbGltaXRlciBpcyBfXG4gICAgICAvLyBodHRwczovL21hdGVyaWFsLmlvL2ljb25zL1xuICAgICAgY29uc3QgZGVsaW1pdGVySW5kZXggPSBpY29uLmluZGV4T2YoJy0nKVxuICAgICAgY29uc3QgaXNNYXRlcmlhbEljb24gPSBkZWxpbWl0ZXJJbmRleCA8PSAtMVxuXG4gICAgICBpZiAoaXNNYXRlcmlhbEljb24pIHtcbiAgICAgICAgLy8gTWF0ZXJpYWwgaWNvbiB1c2VzIGxpZ2F0dXJlcy5cbiAgICAgICAgbmV3Q2hpbGRyZW4ucHVzaChpY29uKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWNvblR5cGUgPSBpY29uLnNsaWNlKDAsIGRlbGltaXRlckluZGV4KVxuICAgICAgICBpZiAoaXNGb250QXdlc29tZTUoaWNvblR5cGUpKSBpY29uVHlwZSA9ICcnXG4gICAgICB9XG5cbiAgICAgIGRhdGEuY2xhc3NbaWNvblR5cGVdID0gdHJ1ZVxuICAgICAgZGF0YS5jbGFzc1tpY29uXSA9ICFpc01hdGVyaWFsSWNvblxuXG4gICAgICBjb25zdCBmb250U2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpXG4gICAgICBpZiAoZm9udFNpemUpIGRhdGEuc3R5bGUgPSB7IGZvbnRTaXplIH1cblxuICAgICAgdGhpcy5hcHBseUNvbG9ycyhkYXRhKVxuXG4gICAgICByZXR1cm4gaCh0aGlzLmhhc0NsaWNrTGlzdGVuZXIgPyAnYnV0dG9uJyA6IHRoaXMudGFnLCBkYXRhLCBuZXdDaGlsZHJlbilcbiAgICB9LFxuICAgIHJlbmRlclN2Z0ljb24gKGljb246IHN0cmluZywgaDogQ3JlYXRlRWxlbWVudCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IHN2Z0RhdGE6IFZOb2RlRGF0YSA9IHtcbiAgICAgICAgY2xhc3M6ICd2LWljb25fX3N2ZycsXG4gICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgeG1sbnM6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsXG4gICAgICAgICAgdmlld0JveDogJzAgMCAyNCAyNCcsXG4gICAgICAgICAgcm9sZTogJ2ltZycsXG4gICAgICAgICAgJ2FyaWEtaGlkZGVuJzogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpXG4gICAgICBpZiAoc2l6ZSkge1xuICAgICAgICBzdmdEYXRhLnN0eWxlID0ge1xuICAgICAgICAgIGZvbnRTaXplOiBzaXplLFxuICAgICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gaCh0aGlzLmhhc0NsaWNrTGlzdGVuZXIgPyAnYnV0dG9uJyA6ICdzcGFuJywgdGhpcy5nZXRTdmdXcmFwcGVyRGF0YSgpLCBbXG4gICAgICAgIGgoJ3N2ZycsIHN2Z0RhdGEsIFtcbiAgICAgICAgICBoKCdwYXRoJywge1xuICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgZDogaWNvbixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0pLFxuICAgICAgXSlcbiAgICB9LFxuICAgIHJlbmRlclN2Z0ljb25Db21wb25lbnQgKFxuICAgICAgaWNvbjogVnVldGlmeUljb25Db21wb25lbnQsXG4gICAgICBoOiBDcmVhdGVFbGVtZW50XG4gICAgKTogVk5vZGUge1xuICAgICAgY29uc3QgZGF0YTogVk5vZGVEYXRhID0ge1xuICAgICAgICBjbGFzczoge1xuICAgICAgICAgICd2LWljb25fX2NvbXBvbmVudCc6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmdldFNpemUoKVxuICAgICAgaWYgKHNpemUpIHtcbiAgICAgICAgZGF0YS5zdHlsZSA9IHtcbiAgICAgICAgICBmb250U2l6ZTogc2l6ZSxcbiAgICAgICAgICBoZWlnaHQ6IHNpemUsXG4gICAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcHBseUNvbG9ycyhkYXRhKVxuXG4gICAgICBjb25zdCBjb21wb25lbnQgPSBpY29uLmNvbXBvbmVudFxuICAgICAgZGF0YS5wcm9wcyA9IGljb24ucHJvcHNcbiAgICAgIGRhdGEubmF0aXZlT24gPSBkYXRhLm9uXG5cbiAgICAgIHJldHVybiBoKHRoaXMuaGFzQ2xpY2tMaXN0ZW5lciA/ICdidXR0b24nIDogJ3NwYW4nLCB0aGlzLmdldFN2Z1dyYXBwZXJEYXRhKCksIFtcbiAgICAgICAgaChjb21wb25lbnQsIGRhdGEpLFxuICAgICAgXSlcbiAgICB9LFxuICB9LFxuXG4gIHJlbmRlciAoaDogQ3JlYXRlRWxlbWVudCk6IFZOb2RlIHtcbiAgICBjb25zdCBpY29uID0gdGhpcy5nZXRJY29uKClcblxuICAgIGlmICh0eXBlb2YgaWNvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChpc1N2Z1BhdGgoaWNvbikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyU3ZnSWNvbihpY29uLCBoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyRm9udEljb24oaWNvbiwgaClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJTdmdJY29uQ29tcG9uZW50KGljb24sIGgpXG4gIH0sXG59KVxuXG5leHBvcnQgZGVmYXVsdCBWdWUuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtaWNvbicsXG5cbiAgJF93cmFwcGVyRm9yOiBWSWNvbixcblxuICBmdW5jdGlvbmFsOiB0cnVlLFxuXG4gIHJlbmRlciAoaCwgeyBkYXRhLCBjaGlsZHJlbiB9KTogVk5vZGUge1xuICAgIGxldCBpY29uTmFtZSA9ICcnXG5cbiAgICAvLyBTdXBwb3J0IHVzYWdlIG9mIHYtdGV4dCBhbmQgdi1odG1sXG4gICAgaWYgKGRhdGEuZG9tUHJvcHMpIHtcbiAgICAgIGljb25OYW1lID0gZGF0YS5kb21Qcm9wcy50ZXh0Q29udGVudCB8fFxuICAgICAgICBkYXRhLmRvbVByb3BzLmlubmVySFRNTCB8fFxuICAgICAgICBpY29uTmFtZVxuXG4gICAgICAvLyBSZW1vdmUgbm9kZXMgc28gaXQgZG9lc24ndFxuICAgICAgLy8gb3ZlcndyaXRlIG91ciBjaGFuZ2VzXG4gICAgICBkZWxldGUgZGF0YS5kb21Qcm9wcy50ZXh0Q29udGVudFxuICAgICAgZGVsZXRlIGRhdGEuZG9tUHJvcHMuaW5uZXJIVE1MXG4gICAgfVxuXG4gICAgcmV0dXJuIGgoVkljb24sIGRhdGEsIGljb25OYW1lID8gW2ljb25OYW1lXSA6IGNoaWxkcmVuKVxuICB9LFxufSlcbiJdfQ==
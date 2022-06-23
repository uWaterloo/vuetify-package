// Styles
import './VFooter.sass';
// Components
import VSheet from '../VSheet/VSheet';
// Mixins
import Applicationable from '../../mixins/applicationable';
import SSRBootable from '../../mixins/ssr-bootable';
// Utilities
import mixins from '../../util/mixins';
import { convertToUnit } from '../../util/helpers';
/* @vue/component */
export default mixins(VSheet, Applicationable('footer', [
    'height',
    'inset',
]), SSRBootable).extend({
    name: 'v-footer',
    props: {
        height: {
            default: 'auto',
            type: [Number, String],
        },
        inset: Boolean,
        padless: Boolean,
        tag: {
            type: String,
            default: 'footer',
        },
    },
    computed: {
        applicationProperty() {
            return this.inset ? 'insetFooter' : 'footer';
        },
        classes() {
            return {
                ...VSheet.options.computed.classes.call(this),
                'v-footer--absolute': this.absolute,
                'v-footer--fixed': !this.absolute && (this.app || this.fixed),
                'v-footer--padless': this.padless,
                'v-footer--inset': this.inset,
            };
        },
        computedBottom() {
            if (!this.isPositioned)
                return undefined;
            return this.app
                ? this.$vuetify.application.bottom
                : 0;
        },
        computedLeft() {
            if (!this.isPositioned)
                return undefined;
            return this.app && this.inset
                ? this.$vuetify.application.left
                : 0;
        },
        computedRight() {
            if (!this.isPositioned)
                return undefined;
            return this.app && this.inset
                ? this.$vuetify.application.right
                : 0;
        },
        isPositioned() {
            return Boolean(this.absolute ||
                this.fixed ||
                this.app);
        },
        styles() {
            const height = parseInt(this.height);
            return {
                ...VSheet.options.computed.styles.call(this),
                height: isNaN(height) ? height : convertToUnit(height),
                left: convertToUnit(this.computedLeft),
                right: convertToUnit(this.computedRight),
                bottom: convertToUnit(this.computedBottom),
            };
        },
    },
    methods: {
        updateApplication() {
            const height = parseInt(this.height);
            return isNaN(height)
                ? this.$el ? this.$el.clientHeight : 0
                : height;
        },
    },
    render(h) {
        const data = this.setBackgroundColor(this.color, {
            staticClass: 'v-footer',
            class: this.classes,
            style: this.styles,
        });
        return h(this.tag, data, this.$slots.default);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkZvb3Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZGb290ZXIvVkZvb3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxnQkFBZ0IsQ0FBQTtBQUV2QixhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0sa0JBQWtCLENBQUE7QUFFckMsU0FBUztBQUNULE9BQU8sZUFBZSxNQUFNLDhCQUE4QixDQUFBO0FBQzFELE9BQU8sV0FBVyxNQUFNLDJCQUEyQixDQUFBO0FBRW5ELFlBQVk7QUFDWixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFLbEQsb0JBQW9CO0FBQ3BCLGVBQWUsTUFBTSxDQUNuQixNQUFNLEVBQ04sZUFBZSxDQUFDLFFBQVEsRUFBRTtJQUN4QixRQUFRO0lBQ1IsT0FBTztDQUNSLENBQUMsRUFDRixXQUFXLENBQ1osQ0FBQyxNQUFNLENBQUM7SUFDUCxJQUFJLEVBQUUsVUFBVTtJQUVoQixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUU7WUFDTixPQUFPLEVBQUUsTUFBTTtZQUNmLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7U0FDdkI7UUFDRCxLQUFLLEVBQUUsT0FBTztRQUNkLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLEdBQUcsRUFBRTtZQUNILElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLFFBQVE7U0FDbEI7S0FDRjtJQUVELFFBQVEsRUFBRTtRQUNSLG1CQUFtQjtZQUNqQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFBO1FBQzlDLENBQUM7UUFDRCxPQUFPO1lBQ0wsT0FBTztnQkFDTCxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJ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LENBQUMsT0FBTyxDQUFDLENBQUE7SUFDL0MsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZGb290ZXIuc2FzcydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZTaGVldCBmcm9tICcuLi9WU2hlZXQvVlNoZWV0J1xuXG4vLyBNaXhpbnNcbmltcG9ydCBBcHBsaWNhdGlvbmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2FwcGxpY2F0aW9uYWJsZSdcbmltcG9ydCBTU1JCb290YWJsZSBmcm9tICcuLi8uLi9taXhpbnMvc3NyLWJvb3RhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBjb252ZXJ0VG9Vbml0IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUvdHlwZXMvdm5vZGUnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIFZTaGVldCxcbiAgQXBwbGljYXRpb25hYmxlKCdmb290ZXInLCBbXG4gICAgJ2hlaWdodCcsXG4gICAgJ2luc2V0JyxcbiAgXSksXG4gIFNTUkJvb3RhYmxlXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWZvb3RlcicsXG5cbiAgcHJvcHM6IHtcbiAgICBoZWlnaHQ6IHtcbiAgICAgIGRlZmF1bHQ6ICdhdXRvJyxcbiAgICAgIHR5cGU6IFtOdW1iZXIsIFN0cmluZ10sXG4gICAgfSxcbiAgICBpbnNldDogQm9vbGVhbixcbiAgICBwYWRsZXNzOiBCb29sZWFuLFxuICAgIHRhZzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2Zvb3RlcicsXG4gICAgfSxcbiAgfSxcblxuICBjb21wdXRlZDoge1xuICAgIGFwcGxpY2F0aW9uUHJvcGVydHkgKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gdGhpcy5pbnNldCA/ICdpbnNldEZvb3RlcicgOiAnZm9vdGVyJ1xuICAgIH0sXG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLlZTaGVldC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtZm9vdGVyLS1hYnNvbHV0ZSc6IHRoaXMuYWJzb2x1dGUsXG4gICAgICAgICd2LWZvb3Rlci0tZml4ZWQnOiAhdGhpcy5hYnNvbHV0ZSAmJiAodGhpcy5hcHAgfHwgdGhpcy5maXhlZCksXG4gICAgICAgICd2LWZvb3Rlci0tcGFkbGVzcyc6IHRoaXMucGFkbGVzcyxcbiAgICAgICAgJ3YtZm9vdGVyLS1pbnNldCc6IHRoaXMuaW5zZXQsXG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZEJvdHRvbSAoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICghdGhpcy5pc1Bvc2l0aW9uZWQpIHJldHVybiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIHRoaXMuYXBwXG4gICAgICAgID8gdGhpcy4kdnVldGlmeS5hcHBsaWNhdGlvbi5ib3R0b21cbiAgICAgICAgOiAwXG4gICAgfSxcbiAgICBjb21wdXRlZExlZnQgKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgICBpZiAoIXRoaXMuaXNQb3NpdGlvbmVkKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICAgIHJldHVybiB0aGlzLmFwcCAmJiB0aGlzLmluc2V0XG4gICAgICAgID8gdGhpcy4kdnVldGlmeS5hcHBsaWNhdGlvbi5sZWZ0XG4gICAgICAgIDogMFxuICAgIH0sXG4gICAgY29tcHV0ZWRSaWdodCAoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICAgIGlmICghdGhpcy5pc1Bvc2l0aW9uZWQpIHJldHVybiB1bmRlZmluZWRcblxuICAgICAgcmV0dXJuIHRoaXMuYXBwICYmIHRoaXMuaW5zZXRcbiAgICAgICAgPyB0aGlzLiR2dWV0aWZ5LmFwcGxpY2F0aW9uLnJpZ2h0XG4gICAgICAgIDogMFxuICAgIH0sXG4gICAgaXNQb3NpdGlvbmVkICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBCb29sZWFuKFxuICAgICAgICB0aGlzLmFic29sdXRlIHx8XG4gICAgICAgIHRoaXMuZml4ZWQgfHxcbiAgICAgICAgdGhpcy5hcHBcbiAgICAgIClcbiAgICB9LFxuICAgIHN0eWxlcyAoKTogb2JqZWN0IHtcbiAgICAgIGNvbnN0IGhlaWdodCA9IHBhcnNlSW50KHRoaXMuaGVpZ2h0KVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5WU2hlZXQub3B0aW9ucy5jb21wdXRlZC5zdHlsZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgaGVpZ2h0OiBpc05hTihoZWlnaHQpID8gaGVpZ2h0IDogY29udmVydFRvVW5pdChoZWlnaHQpLFxuICAgICAgICBsZWZ0OiBjb252ZXJ0VG9Vbml0KHRoaXMuY29tcHV0ZWRMZWZ0KSxcbiAgICAgICAgcmlnaHQ6IGNvbnZlcnRUb1VuaXQodGhpcy5jb21wdXRlZFJpZ2h0KSxcbiAgICAgICAgYm90dG9tOiBjb252ZXJ0VG9Vbml0KHRoaXMuY29tcHV0ZWRCb3R0b20pLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIHVwZGF0ZUFwcGxpY2F0aW9uICgpIHtcbiAgICAgIGNvbnN0IGhlaWdodCA9IHBhcnNlSW50KHRoaXMuaGVpZ2h0KVxuXG4gICAgICByZXR1cm4gaXNOYU4oaGVpZ2h0KVxuICAgICAgICA/IHRoaXMuJGVsID8gdGhpcy4kZWwuY2xpZW50SGVpZ2h0IDogMFxuICAgICAgICA6IGhlaWdodFxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnNldEJhY2tncm91bmRDb2xvcih0aGlzLmNvbG9yLCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3YtZm9vdGVyJyxcbiAgICAgIGNsYXNzOiB0aGlzLmNsYXNzZXMsXG4gICAgICBzdHlsZTogdGhpcy5zdHlsZXMsXG4gICAgfSlcblxuICAgIHJldHVybiBoKHRoaXMudGFnLCBkYXRhLCB0aGlzLiRzbG90cy5kZWZhdWx0KVxuICB9LFxufSlcbiJdfQ==
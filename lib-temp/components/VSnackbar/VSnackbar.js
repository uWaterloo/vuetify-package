// Styles
import './VSnackbar.sass';
// Components
import VSheet from '../VSheet/VSheet';
// Mixins
import Colorable from '../../mixins/colorable';
import Themeable from '../../mixins/themeable';
import Toggleable from '../../mixins/toggleable';
import { factory as PositionableFactory } from '../../mixins/positionable';
// Utilities
import mixins from '../../util/mixins';
import { convertToUnit, getSlot } from '../../util/helpers';
import { deprecate, removed } from '../../util/console';
export default mixins(VSheet, Colorable, Toggleable, PositionableFactory([
    'absolute',
    'bottom',
    'left',
    'right',
    'top',
])
/* @vue/component */
).extend({
    name: 'v-snackbar',
    props: {
        app: Boolean,
        centered: Boolean,
        contentClass: {
            type: String,
            default: '',
        },
        multiLine: Boolean,
        text: Boolean,
        timeout: {
            type: [Number, String],
            default: 5000,
        },
        transition: {
            type: [Boolean, String],
            default: 'v-snack-transition',
            validator: v => typeof v === 'string' || v === false,
        },
        vertical: Boolean,
    },
    data: () => ({
        activeTimeout: -1,
    }),
    computed: {
        classes() {
            return {
                'v-snack--absolute': this.absolute,
                'v-snack--active': this.isActive,
                'v-snack--bottom': this.bottom || !this.top,
                'v-snack--centered': this.centered,
                'v-snack--has-background': this.hasBackground,
                'v-snack--left': this.left,
                'v-snack--multi-line': this.multiLine && !this.vertical,
                'v-snack--right': this.right,
                'v-snack--text': this.text,
                'v-snack--top': this.top,
                'v-snack--vertical': this.vertical,
            };
        },
        // Text and outlined styles both
        // use transparent backgrounds
        hasBackground() {
            return (!this.text &&
                !this.outlined);
        },
        // Snackbar is dark by default
        // override themeable logic.
        isDark() {
            return this.hasBackground
                ? !this.light
                : Themeable.options.computed.isDark.call(this);
        },
        styles() {
            if (this.absolute || !this.app)
                return {};
            const { bar, bottom, footer, insetFooter, left, right, top, } = this.$vuetify.application;
            return {
                paddingBottom: convertToUnit(bottom + footer + insetFooter),
                paddingLeft: convertToUnit(left),
                paddingRight: convertToUnit(right),
                paddingTop: convertToUnit(bar + top),
            };
        },
    },
    watch: {
        isActive: 'setTimeout',
        timeout: 'setTimeout',
    },
    mounted() {
        if (this.isActive)
            this.setTimeout();
    },
    created() {
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('auto-height')) {
            removed('auto-height', this);
        }
        /* istanbul ignore next */
        // eslint-disable-next-line eqeqeq
        if (this.timeout == 0) {
            deprecate('timeout="0"', '-1', this);
        }
    },
    methods: {
        genActions() {
            return this.$createElement('div', {
                staticClass: 'v-snack__action ',
            }, [
                getSlot(this, 'action', {
                    attrs: { class: 'v-snack__btn' },
                }),
            ]);
        },
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-snack__content',
                class: {
                    [this.contentClass]: true,
                },
                attrs: {
                    role: 'status',
                    'aria-live': 'polite',
                },
            }, [getSlot(this)]);
        },
        genWrapper() {
            const setColor = this.hasBackground
                ? this.setBackgroundColor
                : this.setTextColor;
            const data = setColor(this.color, {
                staticClass: 'v-snack__wrapper',
                class: VSheet.options.computed.classes.call(this),
                style: VSheet.options.computed.styles.call(this),
                directives: [{
                        name: 'show',
                        value: this.isActive,
                    }],
                on: {
                    pointerenter: () => window.clearTimeout(this.activeTimeout),
                    pointerleave: this.setTimeout,
                },
            });
            return this.$createElement('div', data, [
                this.genContent(),
                this.genActions(),
            ]);
        },
        genTransition() {
            return this.$createElement('transition', {
                props: { name: this.transition },
            }, [this.genWrapper()]);
        },
        setTimeout() {
            window.clearTimeout(this.activeTimeout);
            const timeout = Number(this.timeout);
            if (!this.isActive ||
                // TODO: remove 0 in v3
                [0, -1].includes(timeout)) {
                return;
            }
            this.activeTimeout = window.setTimeout(() => {
                this.isActive = false;
            }, timeout);
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-snack',
            class: this.classes,
            style: this.styles,
        }, [
            this.transition !== false
                ? this.genTransition()
                : this.genWrapper(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNuYWNrYmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVlNuYWNrYmFyL1ZTbmFja2Jhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxrQkFBa0IsQ0FBQTtBQUV6QixhQUFhO0FBQ2IsT0FBTyxNQUFNLE1BQU0sa0JBQWtCLENBQUE7QUFFckMsU0FBUztBQUNULE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sU0FBUyxNQUFNLHdCQUF3QixDQUFBO0FBQzlDLE9BQU8sVUFBVSxNQUFNLHlCQUF5QixDQUFBO0FBQ2hELE9BQU8sRUFBRSxPQUFPLElBQUksbUJBQW1CLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUUxRSxZQUFZO0FBQ1osT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBS3ZELGVBQWUsTUFBTSxDQUNuQixNQUFNLEVBQ04sU0FBUyxFQUNULFVBQVUsRUFDVixtQkFBbUIsQ0FBQztJQUNsQixVQUFVO0lBQ1YsUUFBUTtJQUNSLE1BQU07SUFDTixPQUFPO0lBQ1AsS0FBSztDQUNOLENBQUM7QUFDSixvQkFBb0I7Q0FDbkIsQ0FBQyxNQUFNLENBQUM7SUFDUCxJQUFJLEVBQUUsWUFBWTtJQUVsQixLQUFLLEVBQUU7UUFDTCxHQUFHLEVBQUUsT0FBTztRQUNaLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFlBQVksRUFBRTtZQUNaLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLEVBQUU7U0FDWjtRQUNELFNBQVMsRUFBRSxPQUFPO1FBQ2xCLElBQUksRUFBRSxPQUFPO1FBQ2IsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLENBQUMsTUFBTSxF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QUE7UUFDYixDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUNkLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTztZQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU07U0FDbkIsRUFBRTtZQUNELElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSztnQkFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1NBQ3RCLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WU25hY2tiYXIuc2FzcydcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZTaGVldCBmcm9tICcuLi9WU2hlZXQvVlNoZWV0J1xuXG4vLyBNaXhpbnNcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcbmltcG9ydCBUb2dnbGVhYmxlIGZyb20gJy4uLy4uL21peGlucy90b2dnbGVhYmxlJ1xuaW1wb3J0IHsgZmFjdG9yeSBhcyBQb3NpdGlvbmFibGVGYWN0b3J5IH0gZnJvbSAnLi4vLi4vbWl4aW5zL3Bvc2l0aW9uYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgY29udmVydFRvVW5pdCwgZ2V0U2xvdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcbmltcG9ydCB7IGRlcHJlY2F0ZSwgcmVtb3ZlZCB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCB7IFByb3BUeXBlLCBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuZXhwb3J0IGRlZmF1bHQgbWl4aW5zKFxuICBWU2hlZXQsXG4gIENvbG9yYWJsZSxcbiAgVG9nZ2xlYWJsZSxcbiAgUG9zaXRpb25hYmxlRmFjdG9yeShbXG4gICAgJ2Fic29sdXRlJyxcbiAgICAnYm90dG9tJyxcbiAgICAnbGVmdCcsXG4gICAgJ3JpZ2h0JyxcbiAgICAndG9wJyxcbiAgXSlcbi8qIEB2dWUvY29tcG9uZW50ICovXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LXNuYWNrYmFyJyxcblxuICBwcm9wczoge1xuICAgIGFwcDogQm9vbGVhbixcbiAgICBjZW50ZXJlZDogQm9vbGVhbixcbiAgICBjb250ZW50Q2xhc3M6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICcnLFxuICAgIH0sXG4gICAgbXVsdGlMaW5lOiBCb29sZWFuLFxuICAgIHRleHQ6IEJvb2xlYW4sXG4gICAgdGltZW91dDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6IDUwMDAsXG4gICAgfSxcbiAgICB0cmFuc2l0aW9uOiB7XG4gICAgICB0eXBlOiBbQm9vbGVhbiwgU3RyaW5nXSBhcyBQcm9wVHlwZTxmYWxzZSB8IHN0cmluZz4sXG4gICAgICBkZWZhdWx0OiAndi1zbmFjay10cmFuc2l0aW9uJyxcbiAgICAgIHZhbGlkYXRvcjogdiA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZycgfHwgdiA9PT0gZmFsc2UsXG4gICAgfSxcbiAgICB2ZXJ0aWNhbDogQm9vbGVhbixcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGFjdGl2ZVRpbWVvdXQ6IC0xLFxuICB9KSxcblxuICBjb21wdXRlZDoge1xuICAgIGNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndi1zbmFjay0tYWJzb2x1dGUnOiB0aGlzLmFic29sdXRlLFxuICAgICAgICAndi1zbmFjay0tYWN0aXZlJzogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgJ3Ytc25hY2stLWJvdHRvbSc6IHRoaXMuYm90dG9tIHx8ICF0aGlzLnRvcCxcbiAgICAgICAgJ3Ytc25hY2stLWNlbnRlcmVkJzogdGhpcy5jZW50ZXJlZCxcbiAgICAgICAgJ3Ytc25hY2stLWhhcy1iYWNrZ3JvdW5kJzogdGhpcy5oYXNCYWNrZ3JvdW5kLFxuICAgICAgICAndi1zbmFjay0tbGVmdCc6IHRoaXMubGVmdCxcbiAgICAgICAgJ3Ytc25hY2stLW11bHRpLWxpbmUnOiB0aGlzLm11bHRpTGluZSAmJiAhdGhpcy52ZXJ0aWNhbCxcbiAgICAgICAgJ3Ytc25hY2stLXJpZ2h0JzogdGhpcy5yaWdodCxcbiAgICAgICAgJ3Ytc25hY2stLXRleHQnOiB0aGlzLnRleHQsXG4gICAgICAgICd2LXNuYWNrLS10b3AnOiB0aGlzLnRvcCxcbiAgICAgICAgJ3Ytc25hY2stLXZlcnRpY2FsJzogdGhpcy52ZXJ0aWNhbCxcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIFRleHQgYW5kIG91dGxpbmVkIHN0eWxlcyBib3RoXG4gICAgLy8gdXNlIHRyYW5zcGFyZW50IGJhY2tncm91bmRzXG4gICAgaGFzQmFja2dyb3VuZCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAhdGhpcy50ZXh0ICYmXG4gICAgICAgICF0aGlzLm91dGxpbmVkXG4gICAgICApXG4gICAgfSxcbiAgICAvLyBTbmFja2JhciBpcyBkYXJrIGJ5IGRlZmF1bHRcbiAgICAvLyBvdmVycmlkZSB0aGVtZWFibGUgbG9naWMuXG4gICAgaXNEYXJrICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmhhc0JhY2tncm91bmRcbiAgICAgICAgPyAhdGhpcy5saWdodFxuICAgICAgICA6IFRoZW1lYWJsZS5vcHRpb25zLmNvbXB1dGVkLmlzRGFyay5jYWxsKHRoaXMpXG4gICAgfSxcbiAgICBzdHlsZXMgKCk6IG9iamVjdCB7XG4gICAgICBpZiAodGhpcy5hYnNvbHV0ZSB8fCAhdGhpcy5hcHApIHJldHVybiB7fVxuXG4gICAgICBjb25zdCB7XG4gICAgICAgIGJhcixcbiAgICAgICAgYm90dG9tLFxuICAgICAgICBmb290ZXIsXG4gICAgICAgIGluc2V0Rm9vdGVyLFxuICAgICAgICBsZWZ0LFxuICAgICAgICByaWdodCxcbiAgICAgICAgdG9wLFxuICAgICAgfSA9IHRoaXMuJHZ1ZXRpZnkuYXBwbGljYXRpb25cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGFkZGluZ0JvdHRvbTogY29udmVydFRvVW5pdChib3R0b20gKyBmb290ZXIgKyBpbnNldEZvb3RlciksXG4gICAgICAgIHBhZGRpbmdMZWZ0OiBjb252ZXJ0VG9Vbml0KGxlZnQpLFxuICAgICAgICBwYWRkaW5nUmlnaHQ6IGNvbnZlcnRUb1VuaXQocmlnaHQpLFxuICAgICAgICBwYWRkaW5nVG9wOiBjb252ZXJ0VG9Vbml0KGJhciArIHRvcCksXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIGlzQWN0aXZlOiAnc2V0VGltZW91dCcsXG4gICAgdGltZW91dDogJ3NldFRpbWVvdXQnLFxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIGlmICh0aGlzLmlzQWN0aXZlKSB0aGlzLnNldFRpbWVvdXQoKVxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHRoaXMuJGF0dHJzLmhhc093blByb3BlcnR5KCdhdXRvLWhlaWdodCcpKSB7XG4gICAgICByZW1vdmVkKCdhdXRvLWhlaWdodCcsIHRoaXMpXG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZXFlcWVxXG4gICAgaWYgKHRoaXMudGltZW91dCA9PSAwKSB7XG4gICAgICBkZXByZWNhdGUoJ3RpbWVvdXQ9XCIwXCInLCAnLTEnLCB0aGlzKVxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2VuQWN0aW9ucyAoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3Ytc25hY2tfX2FjdGlvbiAnLFxuICAgICAgfSwgW1xuICAgICAgICBnZXRTbG90KHRoaXMsICdhY3Rpb24nLCB7XG4gICAgICAgICAgYXR0cnM6IHsgY2xhc3M6ICd2LXNuYWNrX19idG4nIH0sXG4gICAgICAgIH0pLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkNvbnRlbnQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNuYWNrX19jb250ZW50JyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICBbdGhpcy5jb250ZW50Q2xhc3NdOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIHJvbGU6ICdzdGF0dXMnLFxuICAgICAgICAgICdhcmlhLWxpdmUnOiAncG9saXRlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sIFtnZXRTbG90KHRoaXMpXSlcbiAgICB9LFxuICAgIGdlbldyYXBwZXIgKCkge1xuICAgICAgY29uc3Qgc2V0Q29sb3IgPSB0aGlzLmhhc0JhY2tncm91bmRcbiAgICAgICAgPyB0aGlzLnNldEJhY2tncm91bmRDb2xvclxuICAgICAgICA6IHRoaXMuc2V0VGV4dENvbG9yXG5cbiAgICAgIGNvbnN0IGRhdGEgPSBzZXRDb2xvcih0aGlzLmNvbG9yLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbmFja19fd3JhcHBlcicsXG4gICAgICAgIGNsYXNzOiBWU2hlZXQub3B0aW9ucy5jb21wdXRlZC5jbGFzc2VzLmNhbGwodGhpcyksXG4gICAgICAgIHN0eWxlOiBWU2hlZXQub3B0aW9ucy5jb21wdXRlZC5zdHlsZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgICBuYW1lOiAnc2hvdycsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgIH1dLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIHBvaW50ZXJlbnRlcjogKCkgPT4gd2luZG93LmNsZWFyVGltZW91dCh0aGlzLmFjdGl2ZVRpbWVvdXQpLFxuICAgICAgICAgIHBvaW50ZXJsZWF2ZTogdGhpcy5zZXRUaW1lb3V0LFxuICAgICAgICB9LFxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIGRhdGEsIFtcbiAgICAgICAgdGhpcy5nZW5Db250ZW50KCksXG4gICAgICAgIHRoaXMuZ2VuQWN0aW9ucygpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlblRyYW5zaXRpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ3RyYW5zaXRpb24nLCB7XG4gICAgICAgIHByb3BzOiB7IG5hbWU6IHRoaXMudHJhbnNpdGlvbiB9LFxuICAgICAgfSwgW3RoaXMuZ2VuV3JhcHBlcigpXSlcbiAgICB9LFxuICAgIHNldFRpbWVvdXQgKCkge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLmFjdGl2ZVRpbWVvdXQpXG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBOdW1iZXIodGhpcy50aW1lb3V0KVxuXG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLmlzQWN0aXZlIHx8XG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSAwIGluIHYzXG4gICAgICAgIFswLCAtMV0uaW5jbHVkZXModGltZW91dClcbiAgICAgICkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3RpdmVUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgICAgIH0sIHRpbWVvdXQpXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1zbmFjaycsXG4gICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGVzLFxuICAgIH0sIFtcbiAgICAgIHRoaXMudHJhbnNpdGlvbiAhPT0gZmFsc2VcbiAgICAgICAgPyB0aGlzLmdlblRyYW5zaXRpb24oKVxuICAgICAgICA6IHRoaXMuZ2VuV3JhcHBlcigpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
// Styles
import './VAlert.sass';
// Extensions
import VSheet from '../VSheet';
// Components
import VBtn from '../VBtn';
import VIcon from '../VIcon';
// Mixins
import Toggleable from '../../mixins/toggleable';
import Themeable from '../../mixins/themeable';
import Transitionable from '../../mixins/transitionable';
// Utilities
import mixins from '../../util/mixins';
import { breaking } from '../../util/console';
/* @vue/component */
export default mixins(VSheet, Toggleable, Transitionable).extend({
    name: 'v-alert',
    props: {
        border: {
            type: String,
            validator(val) {
                return [
                    'top',
                    'right',
                    'bottom',
                    'left',
                ].includes(val);
            },
        },
        closeLabel: {
            type: String,
            default: '$vuetify.close',
        },
        coloredBorder: Boolean,
        dense: Boolean,
        dismissible: Boolean,
        closeIcon: {
            type: String,
            default: '$cancel',
        },
        icon: {
            default: '',
            type: [Boolean, String],
            validator(val) {
                return typeof val === 'string' || val === false;
            },
        },
        outlined: Boolean,
        prominent: Boolean,
        text: Boolean,
        type: {
            type: String,
            validator(val) {
                return [
                    'info',
                    'error',
                    'success',
                    'warning',
                ].includes(val);
            },
        },
        value: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        __cachedBorder() {
            if (!this.border)
                return null;
            let data = {
                staticClass: 'v-alert__border',
                class: {
                    [`v-alert__border--${this.border}`]: true,
                },
            };
            if (this.coloredBorder) {
                data = this.setBackgroundColor(this.computedColor, data);
                data.class['v-alert__border--has-color'] = true;
            }
            return this.$createElement('div', data);
        },
        __cachedDismissible() {
            if (!this.dismissible)
                return null;
            const color = this.iconColor;
            return this.$createElement(VBtn, {
                staticClass: 'v-alert__dismissible',
                props: {
                    color,
                    icon: true,
                    small: true,
                },
                attrs: {
                    'aria-label': this.$vuetify.lang.t(this.closeLabel),
                },
                on: {
                    click: () => (this.isActive = false),
                },
            }, [
                this.$createElement(VIcon, {
                    props: { color },
                }, this.closeIcon),
            ]);
        },
        __cachedIcon() {
            if (!this.computedIcon)
                return null;
            return this.$createElement(VIcon, {
                staticClass: 'v-alert__icon',
                props: { color: this.iconColor },
            }, this.computedIcon);
        },
        classes() {
            const classes = {
                ...VSheet.options.computed.classes.call(this),
                'v-alert--border': Boolean(this.border),
                'v-alert--dense': this.dense,
                'v-alert--outlined': this.outlined,
                'v-alert--prominent': this.prominent,
                'v-alert--text': this.text,
            };
            if (this.border) {
                classes[`v-alert--border-${this.border}`] = true;
            }
            return classes;
        },
        computedColor() {
            return this.color || this.type;
        },
        computedIcon() {
            if (this.icon === false)
                return false;
            if (typeof this.icon === 'string' && this.icon)
                return this.icon;
            if (!['error', 'info', 'success', 'warning'].includes(this.type))
                return false;
            return `$${this.type}`;
        },
        hasColoredIcon() {
            return (this.hasText ||
                (Boolean(this.border) && this.coloredBorder));
        },
        hasText() {
            return this.text || this.outlined;
        },
        iconColor() {
            return this.hasColoredIcon ? this.computedColor : undefined;
        },
        isDark() {
            if (this.type &&
                !this.coloredBorder &&
                !this.outlined)
                return true;
            return Themeable.options.computed.isDark.call(this);
        },
    },
    created() {
        /* istanbul ignore next */
        if (this.$attrs.hasOwnProperty('outline')) {
            breaking('outline', 'outlined', this);
        }
    },
    methods: {
        genWrapper() {
            const children = [
                this.$slots.prepend || this.__cachedIcon,
                this.genContent(),
                this.__cachedBorder,
                this.$slots.append,
                this.$scopedSlots.close
                    ? this.$scopedSlots.close({ toggle: this.toggle })
                    : this.__cachedDismissible,
            ];
            const data = {
                staticClass: 'v-alert__wrapper',
            };
            return this.$createElement('div', data, children);
        },
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-alert__content',
            }, this.$slots.default);
        },
        genAlert() {
            let data = {
                staticClass: 'v-alert',
                attrs: {
                    role: 'alert',
                },
                on: this.listeners$,
                class: this.classes,
                style: this.styles,
                directives: [{
                        name: 'show',
                        value: this.isActive,
                    }],
            };
            if (!this.coloredBorder) {
                const setColor = this.hasText ? this.setTextColor : this.setBackgroundColor;
                data = setColor(this.computedColor, data);
            }
            return this.$createElement('div', data, [this.genWrapper()]);
        },
        /** @public */
        toggle() {
            this.isActive = !this.isActive;
        },
    },
    render(h) {
        const render = this.genAlert();
        if (!this.transition)
            return render;
        return h('transition', {
            props: {
                name: this.transition,
                origin: this.origin,
                mode: this.mode,
            },
        }, [render]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkFsZXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkFsZXJ0L1ZBbGVydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxlQUFlLENBQUE7QUFFdEIsYUFBYTtBQUNiLE9BQU8sTUFBTSxNQUFNLFdBQVcsQ0FBQTtBQUU5QixhQUFhO0FBQ2IsT0FBTyxJQUFJLE1BQU0sU0FBUyxDQUFBO0FBQzFCLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixTQUFTO0FBQ1QsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxjQUFjLE1BQU0sNkJBQTZCLENBQUE7QUFFeEQsWUFBWTtBQUNaLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQU03QyxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBYyxDQUNmLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLFNBQVM7SUFFZixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLFNBQVMsQ0FBRSxHQUFXO2dCQUNwQixPQUFPO29CQUNMLEtBQUs7b0JBQ0wsT0FBTztvQkFDUCxRQUFRO29CQUNSLE1BQU07aUJBQ1AsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDakIsQ0FBQztTQUNGO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsZ0JBQWdCO1NBQzFCO1FBQ0QsYUFBYSxFQUFFLE9BQU87UUFDdEIsS0FBSyxFQUFFLE9BQU87UUFDZCxXQUFXLEVBQUUsT0FBTztRQUNwQixTQUFTLEVBQUU7WUFDVCxJQUFJLEVBQUUsTUFB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TSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBRTlCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU8sTUFBTSxDQUFBO1FBRW5DLE9BQU8sQ0FBQyxDQUFDLFlBQVksRUFBRTtZQUNyQixLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ25CLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTthQUNoQjtTQUNGLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ2QsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFN0eWxlc1xuaW1wb3J0ICcuL1ZBbGVydC5zYXNzJ1xuXG4vLyBFeHRlbnNpb25zXG5pbXBvcnQgVlNoZWV0IGZyb20gJy4uL1ZTaGVldCdcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZCdG4gZnJvbSAnLi4vVkJ0bidcbmltcG9ydCBWSWNvbiBmcm9tICcuLi9WSWNvbidcblxuLy8gTWl4aW5zXG5pbXBvcnQgVG9nZ2xlYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdG9nZ2xlYWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcbmltcG9ydCBUcmFuc2l0aW9uYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvdHJhbnNpdGlvbmFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IG1peGlucyBmcm9tICcuLi8uLi91dGlsL21peGlucydcbmltcG9ydCB7IGJyZWFraW5nIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGVEYXRhIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUvdHlwZXMnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIFZTaGVldCxcbiAgVG9nZ2xlYWJsZSxcbiAgVHJhbnNpdGlvbmFibGVcbikuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtYWxlcnQnLFxuXG4gIHByb3BzOiB7XG4gICAgYm9yZGVyOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICB2YWxpZGF0b3IgKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgJ3RvcCcsXG4gICAgICAgICAgJ3JpZ2h0JyxcbiAgICAgICAgICAnYm90dG9tJyxcbiAgICAgICAgICAnbGVmdCcsXG4gICAgICAgIF0uaW5jbHVkZXModmFsKVxuICAgICAgfSxcbiAgICB9LFxuICAgIGNsb3NlTGFiZWw6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICckdnVldGlmeS5jbG9zZScsXG4gICAgfSxcbiAgICBjb2xvcmVkQm9yZGVyOiBCb29sZWFuLFxuICAgIGRlbnNlOiBCb29sZWFuLFxuICAgIGRpc21pc3NpYmxlOiBCb29sZWFuLFxuICAgIGNsb3NlSWNvbjoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJyRjYW5jZWwnLFxuICAgIH0sXG4gICAgaWNvbjoge1xuICAgICAgZGVmYXVsdDogJycsXG4gICAgICB0eXBlOiBbQm9vbGVhbiwgU3RyaW5nXSxcbiAgICAgIHZhbGlkYXRvciAodmFsOiBib29sZWFuIHwgc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyB8fCB2YWwgPT09IGZhbHNlXG4gICAgICB9LFxuICAgIH0sXG4gICAgb3V0bGluZWQ6IEJvb2xlYW4sXG4gICAgcHJvbWluZW50OiBCb29sZWFuLFxuICAgIHRleHQ6IEJvb2xlYW4sXG4gICAgdHlwZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgdmFsaWRhdG9yICh2YWw6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICdpbmZvJyxcbiAgICAgICAgICAnZXJyb3InLFxuICAgICAgICAgICdzdWNjZXNzJyxcbiAgICAgICAgICAnd2FybmluZycsXG4gICAgICAgIF0uaW5jbHVkZXModmFsKVxuICAgICAgfSxcbiAgICB9LFxuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgX19jYWNoZWRCb3JkZXIgKCk6IFZOb2RlIHwgbnVsbCB7XG4gICAgICBpZiAoIXRoaXMuYm9yZGVyKSByZXR1cm4gbnVsbFxuXG4gICAgICBsZXQgZGF0YTogVk5vZGVEYXRhID0ge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtYWxlcnRfX2JvcmRlcicsXG4gICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgW2B2LWFsZXJ0X19ib3JkZXItLSR7dGhpcy5ib3JkZXJ9YF06IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbG9yZWRCb3JkZXIpIHtcbiAgICAgICAgZGF0YSA9IHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29tcHV0ZWRDb2xvciwgZGF0YSlcbiAgICAgICAgZGF0YS5jbGFzc1sndi1hbGVydF9fYm9yZGVyLS1oYXMtY29sb3InXSA9IHRydWVcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIGRhdGEpXG4gICAgfSxcbiAgICBfX2NhY2hlZERpc21pc3NpYmxlICgpOiBWTm9kZSB8IG51bGwge1xuICAgICAgaWYgKCF0aGlzLmRpc21pc3NpYmxlKSByZXR1cm4gbnVsbFxuXG4gICAgICBjb25zdCBjb2xvciA9IHRoaXMuaWNvbkNvbG9yXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZCdG4sIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWFsZXJ0X19kaXNtaXNzaWJsZScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgY29sb3IsXG4gICAgICAgICAgaWNvbjogdHJ1ZSxcbiAgICAgICAgICBzbWFsbDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IHRoaXMuJHZ1ZXRpZnkubGFuZy50KHRoaXMuY2xvc2VMYWJlbCksXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6ICgpID0+ICh0aGlzLmlzQWN0aXZlID0gZmFsc2UpLFxuICAgICAgICB9LFxuICAgICAgfSwgW1xuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB7XG4gICAgICAgICAgcHJvcHM6IHsgY29sb3IgfSxcbiAgICAgICAgfSwgdGhpcy5jbG9zZUljb24pLFxuICAgICAgXSlcbiAgICB9LFxuICAgIF9fY2FjaGVkSWNvbiAoKTogVk5vZGUgfCBudWxsIHtcbiAgICAgIGlmICghdGhpcy5jb21wdXRlZEljb24pIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1hbGVydF9faWNvbicsXG4gICAgICAgIHByb3BzOiB7IGNvbG9yOiB0aGlzLmljb25Db2xvciB9LFxuICAgICAgfSwgdGhpcy5jb21wdXRlZEljb24pXG4gICAgfSxcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgY29uc3QgY2xhc3NlczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7XG4gICAgICAgIC4uLlZTaGVldC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtYWxlcnQtLWJvcmRlcic6IEJvb2xlYW4odGhpcy5ib3JkZXIpLFxuICAgICAgICAndi1hbGVydC0tZGVuc2UnOiB0aGlzLmRlbnNlLFxuICAgICAgICAndi1hbGVydC0tb3V0bGluZWQnOiB0aGlzLm91dGxpbmVkLFxuICAgICAgICAndi1hbGVydC0tcHJvbWluZW50JzogdGhpcy5wcm9taW5lbnQsXG4gICAgICAgICd2LWFsZXJ0LS10ZXh0JzogdGhpcy50ZXh0LFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5ib3JkZXIpIHtcbiAgICAgICAgY2xhc3Nlc1tgdi1hbGVydC0tYm9yZGVyLSR7dGhpcy5ib3JkZXJ9YF0gPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjbGFzc2VzXG4gICAgfSxcbiAgICBjb21wdXRlZENvbG9yICgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuY29sb3IgfHwgdGhpcy50eXBlXG4gICAgfSxcbiAgICBjb21wdXRlZEljb24gKCk6IHN0cmluZyB8IGJvb2xlYW4ge1xuICAgICAgaWYgKHRoaXMuaWNvbiA9PT0gZmFsc2UpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLmljb24gPT09ICdzdHJpbmcnICYmIHRoaXMuaWNvbikgcmV0dXJuIHRoaXMuaWNvblxuICAgICAgaWYgKCFbJ2Vycm9yJywgJ2luZm8nLCAnc3VjY2VzcycsICd3YXJuaW5nJ10uaW5jbHVkZXModGhpcy50eXBlKSkgcmV0dXJuIGZhbHNlXG5cbiAgICAgIHJldHVybiBgJCR7dGhpcy50eXBlfWBcbiAgICB9LFxuICAgIGhhc0NvbG9yZWRJY29uICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuaGFzVGV4dCB8fFxuICAgICAgICAoQm9vbGVhbih0aGlzLmJvcmRlcikgJiYgdGhpcy5jb2xvcmVkQm9yZGVyKVxuICAgICAgKVxuICAgIH0sXG4gICAgaGFzVGV4dCAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0IHx8IHRoaXMub3V0bGluZWRcbiAgICB9LFxuICAgIGljb25Db2xvciAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgIHJldHVybiB0aGlzLmhhc0NvbG9yZWRJY29uID8gdGhpcy5jb21wdXRlZENvbG9yIDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBpc0RhcmsgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnR5cGUgJiZcbiAgICAgICAgIXRoaXMuY29sb3JlZEJvcmRlciAmJlxuICAgICAgICAhdGhpcy5vdXRsaW5lZFxuICAgICAgKSByZXR1cm4gdHJ1ZVxuXG4gICAgICByZXR1cm4gVGhlbWVhYmxlLm9wdGlvbnMuY29tcHV0ZWQuaXNEYXJrLmNhbGwodGhpcylcbiAgICB9LFxuICB9LFxuXG4gIGNyZWF0ZWQgKCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHRoaXMuJGF0dHJzLmhhc093blByb3BlcnR5KCdvdXRsaW5lJykpIHtcbiAgICAgIGJyZWFraW5nKCdvdXRsaW5lJywgJ291dGxpbmVkJywgdGhpcylcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbldyYXBwZXIgKCk6IFZOb2RlIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW1xuICAgICAgICB0aGlzLiRzbG90cy5wcmVwZW5kIHx8IHRoaXMuX19jYWNoZWRJY29uLFxuICAgICAgICB0aGlzLmdlbkNvbnRlbnQoKSxcbiAgICAgICAgdGhpcy5fX2NhY2hlZEJvcmRlcixcbiAgICAgICAgdGhpcy4kc2xvdHMuYXBwZW5kLFxuICAgICAgICB0aGlzLiRzY29wZWRTbG90cy5jbG9zZVxuICAgICAgICAgID8gdGhpcy4kc2NvcGVkU2xvdHMuY2xvc2UoeyB0b2dnbGU6IHRoaXMudG9nZ2xlIH0pXG4gICAgICAgICAgOiB0aGlzLl9fY2FjaGVkRGlzbWlzc2libGUsXG4gICAgICBdXG5cbiAgICAgIGNvbnN0IGRhdGE6IFZOb2RlRGF0YSA9IHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWFsZXJ0X193cmFwcGVyJyxcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIGRhdGEsIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuQ29udGVudCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWFsZXJ0X19jb250ZW50JyxcbiAgICAgIH0sIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gICAgfSxcbiAgICBnZW5BbGVydCAoKTogVk5vZGUge1xuICAgICAgbGV0IGRhdGE6IFZOb2RlRGF0YSA9IHtcbiAgICAgICAgc3RhdGljQ2xhc3M6ICd2LWFsZXJ0JyxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICByb2xlOiAnYWxlcnQnLFxuICAgICAgICB9LFxuICAgICAgICBvbjogdGhpcy5saXN0ZW5lcnMkLFxuICAgICAgICBjbGFzczogdGhpcy5jbGFzc2VzLFxuICAgICAgICBzdHlsZTogdGhpcy5zdHlsZXMsXG4gICAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgICAgbmFtZTogJ3Nob3cnLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLmlzQWN0aXZlLFxuICAgICAgICB9XSxcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmNvbG9yZWRCb3JkZXIpIHtcbiAgICAgICAgY29uc3Qgc2V0Q29sb3IgPSB0aGlzLmhhc1RleHQgPyB0aGlzLnNldFRleHRDb2xvciA6IHRoaXMuc2V0QmFja2dyb3VuZENvbG9yXG4gICAgICAgIGRhdGEgPSBzZXRDb2xvcih0aGlzLmNvbXB1dGVkQ29sb3IsIGRhdGEpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCBkYXRhLCBbdGhpcy5nZW5XcmFwcGVyKCldKVxuICAgIH0sXG4gICAgLyoqIEBwdWJsaWMgKi9cbiAgICB0b2dnbGUgKCkge1xuICAgICAgdGhpcy5pc0FjdGl2ZSA9ICF0aGlzLmlzQWN0aXZlXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3QgcmVuZGVyID0gdGhpcy5nZW5BbGVydCgpXG5cbiAgICBpZiAoIXRoaXMudHJhbnNpdGlvbikgcmV0dXJuIHJlbmRlclxuXG4gICAgcmV0dXJuIGgoJ3RyYW5zaXRpb24nLCB7XG4gICAgICBwcm9wczoge1xuICAgICAgICBuYW1lOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICAgIG1vZGU6IHRoaXMubW9kZSxcbiAgICAgIH0sXG4gICAgfSwgW3JlbmRlcl0pXG4gIH0sXG59KVxuIl19
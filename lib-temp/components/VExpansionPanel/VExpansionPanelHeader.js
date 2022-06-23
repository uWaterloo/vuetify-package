// Components
import { VFadeTransition } from '../transitions';
import VIcon from '../VIcon';
// Mixins
import Colorable from '../../mixins/colorable';
import { inject as RegistrableInject } from '../../mixins/registrable';
// Directives
import ripple from '../../directives/ripple';
// Utilities
import { getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Colorable, RegistrableInject('expansionPanel', 'v-expansion-panel-header', 'v-expansion-panel'));
export default baseMixins.extend().extend({
    name: 'v-expansion-panel-header',
    directives: { ripple },
    props: {
        disableIconRotate: Boolean,
        expandIcon: {
            type: String,
            default: '$expand',
        },
        hideActions: Boolean,
        ripple: {
            type: [Boolean, Object],
            default: false,
        },
    },
    data: () => ({
        hasMousedown: false,
    }),
    computed: {
        classes() {
            return {
                'v-expansion-panel-header--active': this.isActive,
                'v-expansion-panel-header--mousedown': this.hasMousedown,
            };
        },
        isActive() {
            return this.expansionPanel.isActive;
        },
        isDisabled() {
            return this.expansionPanel.isDisabled;
        },
        isReadonly() {
            return this.expansionPanel.isReadonly;
        },
    },
    created() {
        this.expansionPanel.registerHeader(this);
    },
    beforeDestroy() {
        this.expansionPanel.unregisterHeader();
    },
    methods: {
        onClick(e) {
            this.$emit('click', e);
        },
        genIcon() {
            const icon = getSlot(this, 'actions') ||
                [this.$createElement(VIcon, this.expandIcon)];
            return this.$createElement(VFadeTransition, [
                this.$createElement('div', {
                    staticClass: 'v-expansion-panel-header__icon',
                    class: {
                        'v-expansion-panel-header__icon--disable-rotate': this.disableIconRotate,
                    },
                    directives: [{
                            name: 'show',
                            value: !this.isDisabled,
                        }],
                }, icon),
            ]);
        },
    },
    render(h) {
        return h('button', this.setBackgroundColor(this.color, {
            staticClass: 'v-expansion-panel-header',
            class: this.classes,
            attrs: {
                tabindex: this.isDisabled ? -1 : null,
                type: 'button',
                'aria-expanded': this.isActive,
            },
            directives: [{
                    name: 'ripple',
                    value: this.ripple,
                }],
            on: {
                ...this.$listeners,
                click: this.onClick,
                mousedown: () => (this.hasMousedown = true),
                mouseup: () => (this.hasMousedown = false),
            },
        }), [
            getSlot(this, 'default', { open: this.isActive }, true),
            this.hideActions || this.genIcon(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkV4cGFuc2lvblBhbmVsSGVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVkV4cGFuc2lvblBhbmVsL1ZFeHBhbnNpb25QYW5lbEhlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxhQUFhO0FBQ2IsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRWhELE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFDOUMsT0FBTyxFQUFFLE1BQU0sSUFBSSxpQkFBaUIsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBRXRFLGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSx5QkFBeUIsQ0FBQTtBQUU1QyxZQUFZO0FBQ1osT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzVDLE9BQU8sTUFBc0IsTUFBTSxtQkFBbUIsQ0FBQTtBQUt0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLFNBQVMsRUFDVCxpQkFBaUIsQ0FBd0MsZ0JBQWdCLEVBQUUsMEJBQTBCLEVBQUUsbUJBQW1CLENBQUMsQ0FDNUgsQ0FBQTtBQU9ELGVBQWUsVUFBVSxDQUFDLE1BQU0sRUFBVyxDQUFDLE1BQU0sQ0FBQztJQUNqRCxJQUFJLEVBQUUsMEJBQTBCO0lBRWhDLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRTtJQUV0QixLQUFLLEVBQUU7UUFDTCxpQkFBaUIsRUFBRSxPQUFPO1FBQzFCLFVBQVUsRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxFQUFFLFNBQVM7U0FDbkI7UUFDRCxXQUFXLEVBQUUsT0FBTztRQUNwQixNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxLQUFLO1NBQ2Y7S0FDRjtJQUVELElBQUksRUFBRSxH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QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29tcG9uZW50c1xuaW1wb3J0IHsgVkZhZGVUcmFuc2l0aW9uIH0gZnJvbSAnLi4vdHJhbnNpdGlvbnMnXG5pbXBvcnQgVkV4cGFuc2lvblBhbmVsIGZyb20gJy4vVkV4cGFuc2lvblBhbmVsJ1xuaW1wb3J0IFZJY29uIGZyb20gJy4uL1ZJY29uJ1xuXG4vLyBNaXhpbnNcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcbmltcG9ydCB7IGluamVjdCBhcyBSZWdpc3RyYWJsZUluamVjdCB9IGZyb20gJy4uLy4uL21peGlucy9yZWdpc3RyYWJsZSdcblxuLy8gRGlyZWN0aXZlc1xuaW1wb3J0IHJpcHBsZSBmcm9tICcuLi8uLi9kaXJlY3RpdmVzL3JpcHBsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlLCB7IFZOb2RlLCBWdWVDb25zdHJ1Y3RvciB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgQ29sb3JhYmxlLFxuICBSZWdpc3RyYWJsZUluamVjdDwnZXhwYW5zaW9uUGFuZWwnLCBWdWVDb25zdHJ1Y3RvcjxWdWU+PignZXhwYW5zaW9uUGFuZWwnLCAndi1leHBhbnNpb24tcGFuZWwtaGVhZGVyJywgJ3YtZXhwYW5zaW9uLXBhbmVsJylcbilcblxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBFeHRyYWN0VnVlPHR5cGVvZiBiYXNlTWl4aW5zPiB7XG4gICRlbDogSFRNTEVsZW1lbnRcbiAgZXhwYW5zaW9uUGFuZWw6IEluc3RhbmNlVHlwZTx0eXBlb2YgVkV4cGFuc2lvblBhbmVsPlxufVxuXG5leHBvcnQgZGVmYXVsdCBiYXNlTWl4aW5zLmV4dGVuZDxvcHRpb25zPigpLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXInLFxuXG4gIGRpcmVjdGl2ZXM6IHsgcmlwcGxlIH0sXG5cbiAgcHJvcHM6IHtcbiAgICBkaXNhYmxlSWNvblJvdGF0ZTogQm9vbGVhbixcbiAgICBleHBhbmRJY29uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnJGV4cGFuZCcsXG4gICAgfSxcbiAgICBoaWRlQWN0aW9uczogQm9vbGVhbixcbiAgICByaXBwbGU6IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBPYmplY3RdLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGhhc01vdXNlZG93bjogZmFsc2UsXG4gIH0pLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXItLWFjdGl2ZSc6IHRoaXMuaXNBY3RpdmUsXG4gICAgICAgICd2LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXItLW1vdXNlZG93bic6IHRoaXMuaGFzTW91c2Vkb3duLFxuICAgICAgfVxuICAgIH0sXG4gICAgaXNBY3RpdmUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5zaW9uUGFuZWwuaXNBY3RpdmVcbiAgICB9LFxuICAgIGlzRGlzYWJsZWQgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5zaW9uUGFuZWwuaXNEaXNhYmxlZFxuICAgIH0sXG4gICAgaXNSZWFkb25seSAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5leHBhbnNpb25QYW5lbC5pc1JlYWRvbmx5XG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICB0aGlzLmV4cGFuc2lvblBhbmVsLnJlZ2lzdGVySGVhZGVyKHRoaXMpXG4gIH0sXG5cbiAgYmVmb3JlRGVzdHJveSAoKSB7XG4gICAgdGhpcy5leHBhbnNpb25QYW5lbC51bnJlZ2lzdGVySGVhZGVyKClcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgb25DbGljayAoZTogTW91c2VFdmVudCkge1xuICAgICAgdGhpcy4kZW1pdCgnY2xpY2snLCBlKVxuICAgIH0sXG4gICAgZ2VuSWNvbiAoKSB7XG4gICAgICBjb25zdCBpY29uID0gZ2V0U2xvdCh0aGlzLCAnYWN0aW9ucycpIHx8XG4gICAgICAgIFt0aGlzLiRjcmVhdGVFbGVtZW50KFZJY29uLCB0aGlzLmV4cGFuZEljb24pXVxuXG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudChWRmFkZVRyYW5zaXRpb24sIFtcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1leHBhbnNpb24tcGFuZWwtaGVhZGVyX19pY29uJyxcbiAgICAgICAgICBjbGFzczoge1xuICAgICAgICAgICAgJ3YtZXhwYW5zaW9uLXBhbmVsLWhlYWRlcl9faWNvbi0tZGlzYWJsZS1yb3RhdGUnOiB0aGlzLmRpc2FibGVJY29uUm90YXRlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZGlyZWN0aXZlczogW3tcbiAgICAgICAgICAgIG5hbWU6ICdzaG93JyxcbiAgICAgICAgICAgIHZhbHVlOiAhdGhpcy5pc0Rpc2FibGVkLFxuICAgICAgICAgIH1dLFxuICAgICAgICB9LCBpY29uKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2J1dHRvbicsIHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKHRoaXMuY29sb3IsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1leHBhbnNpb24tcGFuZWwtaGVhZGVyJyxcbiAgICAgIGNsYXNzOiB0aGlzLmNsYXNzZXMsXG4gICAgICBhdHRyczoge1xuICAgICAgICB0YWJpbmRleDogdGhpcy5pc0Rpc2FibGVkID8gLTEgOiBudWxsLFxuICAgICAgICB0eXBlOiAnYnV0dG9uJyxcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiB0aGlzLmlzQWN0aXZlLFxuICAgICAgfSxcbiAgICAgIGRpcmVjdGl2ZXM6IFt7XG4gICAgICAgIG5hbWU6ICdyaXBwbGUnLFxuICAgICAgICB2YWx1ZTogdGhpcy5yaXBwbGUsXG4gICAgICB9XSxcbiAgICAgIG9uOiB7XG4gICAgICAgIC4uLnRoaXMuJGxpc3RlbmVycyxcbiAgICAgICAgY2xpY2s6IHRoaXMub25DbGljayxcbiAgICAgICAgbW91c2Vkb3duOiAoKSA9PiAodGhpcy5oYXNNb3VzZWRvd24gPSB0cnVlKSxcbiAgICAgICAgbW91c2V1cDogKCkgPT4gKHRoaXMuaGFzTW91c2Vkb3duID0gZmFsc2UpLFxuICAgICAgfSxcbiAgICB9KSwgW1xuICAgICAgZ2V0U2xvdCh0aGlzLCAnZGVmYXVsdCcsIHsgb3BlbjogdGhpcy5pc0FjdGl2ZSB9LCB0cnVlKSxcbiAgICAgIHRoaXMuaGlkZUFjdGlvbnMgfHwgdGhpcy5nZW5JY29uKCksXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=
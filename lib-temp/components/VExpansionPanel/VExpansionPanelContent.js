import { VExpandTransition } from '../transitions';
// Mixins
import Bootable from '../../mixins/bootable';
import Colorable from '../../mixins/colorable';
import { inject as RegistrableInject } from '../../mixins/registrable';
// Utilities
import { getSlot } from '../../util/helpers';
import mixins from '../../util/mixins';
const baseMixins = mixins(Bootable, Colorable, RegistrableInject('expansionPanel', 'v-expansion-panel-content', 'v-expansion-panel'));
/* @vue/component */
export default baseMixins.extend().extend({
    name: 'v-expansion-panel-content',
    data: () => ({
        isActive: false,
    }),
    computed: {
        parentIsActive() {
            return this.expansionPanel.isActive;
        },
    },
    watch: {
        parentIsActive: {
            immediate: true,
            handler(val, oldVal) {
                if (val)
                    this.isBooted = true;
                if (oldVal == null)
                    this.isActive = val;
                else
                    this.$nextTick(() => this.isActive = val);
            },
        },
    },
    created() {
        this.expansionPanel.registerContent(this);
    },
    beforeDestroy() {
        this.expansionPanel.unregisterContent();
    },
    render(h) {
        return h(VExpandTransition, this.showLazyContent(() => [
            h('div', this.setBackgroundColor(this.color, {
                staticClass: 'v-expansion-panel-content',
                directives: [{
                        name: 'show',
                        value: this.isActive,
                    }],
            }), [
                h('div', { class: 'v-expansion-panel-content__wrap' }, getSlot(this)),
            ]),
        ]));
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkV4cGFuc2lvblBhbmVsQ29udGVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZFeHBhbnNpb25QYW5lbC9WRXhwYW5zaW9uUGFuZWxDb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRWxELFNBQVM7QUFDVCxPQUFPLFFBQVEsTUFBTSx1QkFBdUIsQ0FBQTtBQUM1QyxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsTUFBTSxJQUFJLGlCQUFpQixFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFFdEUsWUFBWTtBQUNaLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUM1QyxPQUFPLE1BQXNCLE1BQU0sbUJBQW1CLENBQUE7QUFLdEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUN2QixRQUFRLEVBQ1IsU0FBUyxFQUNULGlCQUFpQixDQUF3QyxnQkFBZ0IsRUFBRSwyQkFBMkIsRUFBRSxtQkFBbUIsQ0FBQyxDQUM3SCxDQUFBO0FBTUQsb0JBQW9CO0FBQ3BCLGVBQWUsVUFBVSxDQUFDLE1BQU0sRUFBVyxDQUFDLE1BQU0sQ0FBQztJQUNqRCxJQUFJLEVBQUUsMkJBQTJCO0lBRWpDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsUUFBUSxFQUFFLEtBQUs7S0FDaEIsQ0FBQztJQUVGLFFBQVEsRUFBRTtRQUNSLGNBQWM7WUFDWixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFBO1FBQ3JDLENBQUM7S0FDRjtJQUVELEtBQUssRUFBRTtRQUNMLGNBQWMsRUFBRTtZQUNkLFNBQVMsRUFBRSxJQUFJO1lBQ2YsT0FBTyxDQUFFLEdBQUcsRUFBRSxNQUFNO2dCQUNsQixJQUFJLEdBQUc7b0JBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7Z0JBRTdCLElBQUksTUFBTSxJQUFJLElBQUk7b0JBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUE7O29CQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUE7WUFDaEQsQ0FBQztTQUNGO0tBQ0Y7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDM0MsQ0FBQztJQUVELGFBQWE7UUFDWCxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUE7SUFDekMsQ0FBQztJQUVELE1BQU0sQ0FBRSxDQUFDO1FBQ1AsT0FBTyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNyRCxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUMzQyxXQUFXLEVBQUUsMkJBQTJCO2dCQUN4QyxVQUFVLEVBQUUsQ0FBQzt3QkFDWCxJQUFJLEVBQUUsTUFBTTt3QkFDWixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVE7cUJBQ3JCLENBQUM7YUFDSCxDQUFDLEVBQUU7Z0JBQ0YsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxpQ0FBaUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN0RSxDQUFDO1NBQ0gsQ0FBQyxDQUFDLENBQUE7SUFDTCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29tcG9uZW50c1xuaW1wb3J0IFZFeHBhbnNpb25QYW5lbCBmcm9tICcuL1ZFeHBhbnNpb25QYW5lbCdcbmltcG9ydCB7IFZFeHBhbmRUcmFuc2l0aW9uIH0gZnJvbSAnLi4vdHJhbnNpdGlvbnMnXG5cbi8vIE1peGluc1xuaW1wb3J0IEJvb3RhYmxlIGZyb20gJy4uLy4uL21peGlucy9ib290YWJsZSdcbmltcG9ydCBDb2xvcmFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2NvbG9yYWJsZSdcbmltcG9ydCB7IGluamVjdCBhcyBSZWdpc3RyYWJsZUluamVjdCB9IGZyb20gJy4uLy4uL21peGlucy9yZWdpc3RyYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgeyBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlLCB7IFZOb2RlLCBWdWVDb25zdHJ1Y3RvciB9IGZyb20gJ3Z1ZSdcblxuY29uc3QgYmFzZU1peGlucyA9IG1peGlucyhcbiAgQm9vdGFibGUsXG4gIENvbG9yYWJsZSxcbiAgUmVnaXN0cmFibGVJbmplY3Q8J2V4cGFuc2lvblBhbmVsJywgVnVlQ29uc3RydWN0b3I8VnVlPj4oJ2V4cGFuc2lvblBhbmVsJywgJ3YtZXhwYW5zaW9uLXBhbmVsLWNvbnRlbnQnLCAndi1leHBhbnNpb24tcGFuZWwnKVxuKVxuXG5pbnRlcmZhY2Ugb3B0aW9ucyBleHRlbmRzIEV4dHJhY3RWdWU8dHlwZW9mIGJhc2VNaXhpbnM+IHtcbiAgZXhwYW5zaW9uUGFuZWw6IEluc3RhbmNlVHlwZTx0eXBlb2YgVkV4cGFuc2lvblBhbmVsPlxufVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQ8b3B0aW9ucz4oKS5leHRlbmQoe1xuICBuYW1lOiAndi1leHBhbnNpb24tcGFuZWwtY29udGVudCcsXG5cbiAgZGF0YTogKCkgPT4gKHtcbiAgICBpc0FjdGl2ZTogZmFsc2UsXG4gIH0pLFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgcGFyZW50SXNBY3RpdmUgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXhwYW5zaW9uUGFuZWwuaXNBY3RpdmVcbiAgICB9LFxuICB9LFxuXG4gIHdhdGNoOiB7XG4gICAgcGFyZW50SXNBY3RpdmU6IHtcbiAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgIGhhbmRsZXIgKHZhbCwgb2xkVmFsKSB7XG4gICAgICAgIGlmICh2YWwpIHRoaXMuaXNCb290ZWQgPSB0cnVlXG5cbiAgICAgICAgaWYgKG9sZFZhbCA9PSBudWxsKSB0aGlzLmlzQWN0aXZlID0gdmFsXG4gICAgICAgIGVsc2UgdGhpcy4kbmV4dFRpY2soKCkgPT4gdGhpcy5pc0FjdGl2ZSA9IHZhbClcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICBjcmVhdGVkICgpIHtcbiAgICB0aGlzLmV4cGFuc2lvblBhbmVsLnJlZ2lzdGVyQ29udGVudCh0aGlzKVxuICB9LFxuXG4gIGJlZm9yZURlc3Ryb3kgKCkge1xuICAgIHRoaXMuZXhwYW5zaW9uUGFuZWwudW5yZWdpc3RlckNvbnRlbnQoKVxuICB9LFxuXG4gIHJlbmRlciAoaCk6IFZOb2RlIHtcbiAgICByZXR1cm4gaChWRXhwYW5kVHJhbnNpdGlvbiwgdGhpcy5zaG93TGF6eUNvbnRlbnQoKCkgPT4gW1xuICAgICAgaCgnZGl2JywgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IodGhpcy5jb2xvciwge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtZXhwYW5zaW9uLXBhbmVsLWNvbnRlbnQnLFxuICAgICAgICBkaXJlY3RpdmVzOiBbe1xuICAgICAgICAgIG5hbWU6ICdzaG93JyxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgfV0sXG4gICAgICB9KSwgW1xuICAgICAgICBoKCdkaXYnLCB7IGNsYXNzOiAndi1leHBhbnNpb24tcGFuZWwtY29udGVudF9fd3JhcCcgfSwgZ2V0U2xvdCh0aGlzKSksXG4gICAgICBdKSxcbiAgICBdKSlcbiAgfSxcbn0pXG4iXX0=
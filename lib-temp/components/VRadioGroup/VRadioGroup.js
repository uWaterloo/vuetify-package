// Styles
import '../../styles/components/_selection-controls.sass';
import './VRadioGroup.sass';
// Extensions
import VInput from '../VInput';
import { BaseItemGroup } from '../VItemGroup/VItemGroup';
// Types
import mixins from '../../util/mixins';
const baseMixins = mixins(BaseItemGroup, VInput);
/* @vue/component */
export default baseMixins.extend({
    name: 'v-radio-group',
    provide() {
        return {
            radioGroup: this,
        };
    },
    props: {
        column: {
            type: Boolean,
            default: true,
        },
        height: {
            type: [Number, String],
            default: 'auto',
        },
        name: String,
        row: Boolean,
        // If no value set on VRadio
        // will match valueComparator
        // force default to null
        value: null,
    },
    computed: {
        classes() {
            return {
                ...VInput.options.computed.classes.call(this),
                'v-input--selection-controls v-input--radio-group': true,
                'v-input--radio-group--column': this.column && !this.row,
                'v-input--radio-group--row': this.row,
            };
        },
    },
    methods: {
        genDefaultSlot() {
            return this.$createElement('div', {
                staticClass: 'v-input--radio-group__input',
                attrs: {
                    id: this.id,
                    role: 'radiogroup',
                    'aria-labelledby': this.computedId,
                },
            }, VInput.options.methods.genDefaultSlot.call(this));
        },
        genInputSlot() {
            const render = VInput.options.methods.genInputSlot.call(this);
            delete render.data.on.click;
            return render;
        },
        genLabel() {
            const label = VInput.options.methods.genLabel.call(this);
            if (!label)
                return null;
            label.data.attrs.id = this.computedId;
            // WAI considers this an orphaned label
            delete label.data.attrs.for;
            label.tag = 'legend';
            return label;
        },
        onClick: BaseItemGroup.options.methods.onClick,
    },
    render(h) {
        const vnode = VInput.options.render.call(this, h);
        this._b(vnode.data, 'div', this.attrs$);
        return vnode;
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlJhZGlvR3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WUmFkaW9Hcm91cC9WUmFkaW9Hcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxrREFBa0QsQ0FBQTtBQUN6RCxPQUFPLG9CQUFvQixDQUFBO0FBRTNCLGFBQWE7QUFDYixPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUE7QUFDOUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBRXhELFFBQVE7QUFDUixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUd0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQ3ZCLGFBQWEsRUFDYixNQUFNLENBQ1AsQ0FBQTtBQUVELG9CQUFvQjtBQUNwQixlQUFlLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDL0IsSUFBSSxFQUFFLGVBQWU7SUFFckIsT0FBTztRQUNMLE9BQU87WUFDTCxVQUFVLEVBQUUsSUFBSTtTQUNqQixDQUFBO0lBQ0gsQ0FBQztJQUVELEtBQUssRUFBRTtRQUNMLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUk7U0FDZDtRQUNELE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdEIsT0FBTyxFQUFFLE1BQU07U0FDaEI7UUFDRCxJQUFJLEVBQUUsTUFBTTtRQUNaLEdBQUcsRUFBRSxPQUFPO1FBQ1osNEJBQTRCO1FBQzVCLDZCQUE2QjtRQUM3Qix3QkFBd0I7UUFDeEIsS0FBSyxFQUFFLElBQWdDO0tBQ3hDO0lBRUQsUUFBUSxFQUFFO1FBQ1IsT0FBTztZQUNMLE9BQU87Z0JBQ0wsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDN0Msa0RBQWtELEVBQUUsSUFBSTtnQkFDeEQsOEJBQThCLEVBQUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO2dCQUN4RCwyQkFBMkIsRUFBRSxJQUFJLENBQUMsR0FBRzthQUN0QyxDQUFBO1FBQ0gsQ0FBQztLQUNGO0lBRUQsT0FBTyxFQUFFO1FBQ1AsY0FBYztZQUNaLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hDLFdBQVcsRUFBRSw2QkFBNkI7Z0JBQzFDLEtBQUssRUFBRTtvQkFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLFlBQVk7b0JBQ2xCLGlCQUFpQixFQUFFLElBQUksQ0FBQyxVQUFVO2lCQUNuQzthQUNGLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ3RELENBQUM7UUFDRCxZQUFZO1lBQ1YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUU3RCxPQUFPLE1BQU0sQ0FBQyxJQUFLLENBQUMsRUFBRyxDQUFDLEtBQUssQ0FBQTtZQUU3QixPQUFPLE1BQU0sQ0FBQTtRQUNmLENBQUM7UUFDRCxRQUFRO1lBQ04sTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUV4RCxJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPLElBQUksQ0FBQTtZQUV2QixLQUFLLENBQUMsSUFBSyxDQUFDLEtBQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQTtZQUN2Qyx1Q0FBdUM7WUFDdkMsT0FBTyxLQUFLLENBQUMsSUFBSyxDQUFDLEtBQU0sQ0FBQyxHQUFHLENBQUE7WUFDN0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUE7WUFFcEIsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDO1FBQ0QsT0FBTyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU87S0FDL0M7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFakQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFeEMsT0FBTyxLQUFLLENBQUE7SUFDZCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4uLy4uL3N0eWxlcy9jb21wb25lbnRzL19zZWxlY3Rpb24tY29udHJvbHMuc2FzcydcbmltcG9ydCAnLi9WUmFkaW9Hcm91cC5zYXNzJ1xuXG4vLyBFeHRlbnNpb25zXG5pbXBvcnQgVklucHV0IGZyb20gJy4uL1ZJbnB1dCdcbmltcG9ydCB7IEJhc2VJdGVtR3JvdXAgfSBmcm9tICcuLi9WSXRlbUdyb3VwL1ZJdGVtR3JvdXAnXG5cbi8vIFR5cGVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5cbmNvbnN0IGJhc2VNaXhpbnMgPSBtaXhpbnMoXG4gIEJhc2VJdGVtR3JvdXAsXG4gIFZJbnB1dFxuKVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuZXhwb3J0IGRlZmF1bHQgYmFzZU1peGlucy5leHRlbmQoe1xuICBuYW1lOiAndi1yYWRpby1ncm91cCcsXG5cbiAgcHJvdmlkZSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJhZGlvR3JvdXA6IHRoaXMsXG4gICAgfVxuICB9LFxuXG4gIHByb3BzOiB7XG4gICAgY29sdW1uOiB7XG4gICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogW051bWJlciwgU3RyaW5nXSxcbiAgICAgIGRlZmF1bHQ6ICdhdXRvJyxcbiAgICB9LFxuICAgIG5hbWU6IFN0cmluZyxcbiAgICByb3c6IEJvb2xlYW4sXG4gICAgLy8gSWYgbm8gdmFsdWUgc2V0IG9uIFZSYWRpb1xuICAgIC8vIHdpbGwgbWF0Y2ggdmFsdWVDb21wYXJhdG9yXG4gICAgLy8gZm9yY2UgZGVmYXVsdCB0byBudWxsXG4gICAgdmFsdWU6IG51bGwgYXMgdW5rbm93biBhcyBQcm9wVHlwZTxhbnk+LFxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLlZJbnB1dC5vcHRpb25zLmNvbXB1dGVkLmNsYXNzZXMuY2FsbCh0aGlzKSxcbiAgICAgICAgJ3YtaW5wdXQtLXNlbGVjdGlvbi1jb250cm9scyB2LWlucHV0LS1yYWRpby1ncm91cCc6IHRydWUsXG4gICAgICAgICd2LWlucHV0LS1yYWRpby1ncm91cC0tY29sdW1uJzogdGhpcy5jb2x1bW4gJiYgIXRoaXMucm93LFxuICAgICAgICAndi1pbnB1dC0tcmFkaW8tZ3JvdXAtLXJvdyc6IHRoaXMucm93LFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuICAgIGdlbkRlZmF1bHRTbG90ICgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1pbnB1dC0tcmFkaW8tZ3JvdXBfX2lucHV0JyxcbiAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgICByb2xlOiAncmFkaW9ncm91cCcsXG4gICAgICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6IHRoaXMuY29tcHV0ZWRJZCxcbiAgICAgICAgfSxcbiAgICAgIH0sIFZJbnB1dC5vcHRpb25zLm1ldGhvZHMuZ2VuRGVmYXVsdFNsb3QuY2FsbCh0aGlzKSlcbiAgICB9LFxuICAgIGdlbklucHV0U2xvdCAoKSB7XG4gICAgICBjb25zdCByZW5kZXIgPSBWSW5wdXQub3B0aW9ucy5tZXRob2RzLmdlbklucHV0U2xvdC5jYWxsKHRoaXMpXG5cbiAgICAgIGRlbGV0ZSByZW5kZXIuZGF0YSEub24hLmNsaWNrXG5cbiAgICAgIHJldHVybiByZW5kZXJcbiAgICB9LFxuICAgIGdlbkxhYmVsICgpIHtcbiAgICAgIGNvbnN0IGxhYmVsID0gVklucHV0Lm9wdGlvbnMubWV0aG9kcy5nZW5MYWJlbC5jYWxsKHRoaXMpXG5cbiAgICAgIGlmICghbGFiZWwpIHJldHVybiBudWxsXG5cbiAgICAgIGxhYmVsLmRhdGEhLmF0dHJzIS5pZCA9IHRoaXMuY29tcHV0ZWRJZFxuICAgICAgLy8gV0FJIGNvbnNpZGVycyB0aGlzIGFuIG9ycGhhbmVkIGxhYmVsXG4gICAgICBkZWxldGUgbGFiZWwuZGF0YSEuYXR0cnMhLmZvclxuICAgICAgbGFiZWwudGFnID0gJ2xlZ2VuZCdcblxuICAgICAgcmV0dXJuIGxhYmVsXG4gICAgfSxcbiAgICBvbkNsaWNrOiBCYXNlSXRlbUdyb3VwLm9wdGlvbnMubWV0aG9kcy5vbkNsaWNrLFxuICB9LFxuXG4gIHJlbmRlciAoaCkge1xuICAgIGNvbnN0IHZub2RlID0gVklucHV0Lm9wdGlvbnMucmVuZGVyLmNhbGwodGhpcywgaClcblxuICAgIHRoaXMuX2Iodm5vZGUuZGF0YSEsICdkaXYnLCB0aGlzLmF0dHJzJClcblxuICAgIHJldHVybiB2bm9kZVxuICB9LFxufSlcbiJdfQ==
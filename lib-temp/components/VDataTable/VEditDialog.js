// Styles
import './VEditDialog.sass';
// Mixins
import Returnable from '../../mixins/returnable';
import Themeable from '../../mixins/themeable';
// Utils
import { keyCodes } from '../../util/helpers';
// Component
import VBtn from '../VBtn';
import VMenu from '../VMenu';
import mixins from '../../util/mixins';
/* @vue/component */
export default mixins(Returnable, Themeable).extend({
    name: 'v-edit-dialog',
    props: {
        cancelText: {
            default: 'Cancel',
        },
        large: Boolean,
        eager: Boolean,
        persistent: Boolean,
        saveText: {
            default: 'Save',
        },
        transition: {
            type: String,
            default: 'slide-x-reverse-transition',
        },
    },
    data() {
        return {
            isActive: false,
        };
    },
    watch: {
        isActive(val) {
            if (val) {
                this.$emit('open');
                setTimeout(this.focus, 50); // Give DOM time to paint
            }
            else {
                this.$emit('close');
            }
        },
    },
    methods: {
        cancel() {
            this.isActive = false;
            this.$emit('cancel');
        },
        focus() {
            const input = this.$refs.content.querySelector('input');
            input && input.focus();
        },
        genButton(fn, text) {
            return this.$createElement(VBtn, {
                props: {
                    text: true,
                    color: 'primary',
                    light: true,
                },
                on: { click: fn },
            }, text);
        },
        genActions() {
            return this.$createElement('div', {
                class: 'v-small-dialog__actions',
            }, [
                this.genButton(this.cancel, this.cancelText),
                this.genButton(() => {
                    this.save(this.returnValue);
                    this.$emit('save');
                }, this.saveText),
            ]);
        },
        genContent() {
            return this.$createElement('div', {
                staticClass: 'v-small-dialog__content',
                on: {
                    keydown: (e) => {
                        e.keyCode === keyCodes.esc && this.cancel();
                        if (e.keyCode === keyCodes.enter) {
                            this.save(this.returnValue);
                            this.$emit('save');
                        }
                    },
                },
                ref: 'content',
            }, [this.$slots.input]);
        },
    },
    render(h) {
        return h(VMenu, {
            staticClass: 'v-small-dialog',
            class: this.themeClasses,
            props: {
                contentClass: 'v-small-dialog__menu-content',
                transition: this.transition,
                origin: 'top right',
                right: true,
                value: this.isActive,
                closeOnClick: !this.persistent,
                closeOnContentClick: false,
                eager: this.eager,
                light: this.light,
                dark: this.dark,
            },
            on: {
                input: (val) => (this.isActive = val),
            },
            scopedSlots: {
                activator: ({ on }) => {
                    return h('div', {
                        staticClass: 'v-small-dialog__activator',
                        on,
                    }, [
                        h('span', {
                            staticClass: 'v-small-dialog__activator__content',
                        }, this.$slots.default),
                    ]);
                },
            },
        }, [
            this.genContent(),
            this.large ? this.genActions() : null,
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkVkaXREaWFsb2cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WRGF0YVRhYmxlL1ZFZGl0RGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLG9CQUFvQixDQUFBO0FBRTNCLFNBQVM7QUFDVCxPQUFPLFVBQVUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoRCxPQUFPLFNBQVMsTUFBTSx3QkFBd0IsQ0FBQTtBQUU5QyxRQUFRO0FBQ1IsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBRTdDLFlBQVk7QUFDWixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFDMUIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBSTVCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBRXRDLG9CQUFvQjtBQUNwQixlQUFlLE1BQU0sQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2xELElBQUksRUFBRSxlQUFlO0lBRXJCLEtBQUssRUFBRTtRQUNMLFVBQVUsRUFBRTtZQUNWLE9BQU8sRUFBRSxRQUFRO1NBQ2xCO1FBQ0QsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsT0FBTztRQUNkLFVBQVUsRUFBRSxPQUFPO1FBQ25CLFFBQVEsRUFBRTtZQUNSLE9BQU8sRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsNEJBQTRCO1NBQ3RDO0tBQ0Y7SUFFRCxJQUFJO1FBQ0YsT0FBTztZQUNMLFFBQVEsRUFBRSxLQUFLO1NBQ2hCLENBQUE7SUFDSCxDQUFDO0lBRUQsS0FBSyxFQUFFO1FBQ0wsUUFBUSxDQUFFLEdBQUc7WUFDWCxJQUFJLEdBQUcsRUFBRTtnQkFDUCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dCQUNsQixVQUFVLENBQUMsSUFB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RSxJQUFJLENBQUMsSUFBSTthQUNoQjtZQUNELEVBQUUsRUFBRTtnQkFDRixLQUFLLEVBQUUsQ0FBQyxHQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7YUFDL0M7WUFDRCxXQUFXLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO29CQUNwQixPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUU7d0JBQ2QsV0FBVyxFQUFFLDJCQUEyQjt3QkFDeEMsRUFBRTtxQkFDSCxFQUFFO3dCQUNELENBQUMsQ0FBQyxNQUFNLEVBQUU7NEJBQ1IsV0FBVyxFQUFFLG9DQUFvQzt5QkFDbEQsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztxQkFDeEIsQ0FBQyxDQUFBO2dCQUNKLENBQUM7YUFDRjtTQUNGLEVBQUU7WUFDRCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUN0QyxDQUFDLENBQUE7SUFDSixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVkVkaXREaWFsb2cuc2FzcydcblxuLy8gTWl4aW5zXG5pbXBvcnQgUmV0dXJuYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvcmV0dXJuYWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcblxuLy8gVXRpbHNcbmltcG9ydCB7IGtleUNvZGVzIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuXG4vLyBDb21wb25lbnRcbmltcG9ydCBWQnRuIGZyb20gJy4uL1ZCdG4nXG5pbXBvcnQgVk1lbnUgZnJvbSAnLi4vVk1lbnUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVDaGlsZHJlbiB9IGZyb20gJ3Z1ZSdcbmltcG9ydCBtaXhpbnMgZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoUmV0dXJuYWJsZSwgVGhlbWVhYmxlKS5leHRlbmQoe1xuICBuYW1lOiAndi1lZGl0LWRpYWxvZycsXG5cbiAgcHJvcHM6IHtcbiAgICBjYW5jZWxUZXh0OiB7XG4gICAgICBkZWZhdWx0OiAnQ2FuY2VsJyxcbiAgICB9LFxuICAgIGxhcmdlOiBCb29sZWFuLFxuICAgIGVhZ2VyOiBCb29sZWFuLFxuICAgIHBlcnNpc3RlbnQ6IEJvb2xlYW4sXG4gICAgc2F2ZVRleHQ6IHtcbiAgICAgIGRlZmF1bHQ6ICdTYXZlJyxcbiAgICB9LFxuICAgIHRyYW5zaXRpb246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdzbGlkZS14LXJldmVyc2UtdHJhbnNpdGlvbicsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNBY3RpdmU6IGZhbHNlLFxuICAgIH1cbiAgfSxcblxuICB3YXRjaDoge1xuICAgIGlzQWN0aXZlICh2YWwpIHtcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgdGhpcy4kZW1pdCgnb3BlbicpXG4gICAgICAgIHNldFRpbWVvdXQodGhpcy5mb2N1cywgNTApIC8vIEdpdmUgRE9NIHRpbWUgdG8gcGFpbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJGVtaXQoJ2Nsb3NlJylcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBjYW5jZWwgKCkge1xuICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlXG4gICAgICB0aGlzLiRlbWl0KCdjYW5jZWwnKVxuICAgIH0sXG4gICAgZm9jdXMgKCkge1xuICAgICAgY29uc3QgaW5wdXQgPSAodGhpcy4kcmVmcy5jb250ZW50IGFzIEVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JylcbiAgICAgIGlucHV0ICYmIGlucHV0LmZvY3VzKClcbiAgICB9LFxuICAgIGdlbkJ1dHRvbiAoZm46IEZ1bmN0aW9uLCB0ZXh0OiBWTm9kZUNoaWxkcmVuKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkJ0biwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIHRleHQ6IHRydWUsXG4gICAgICAgICAgY29sb3I6ICdwcmltYXJ5JyxcbiAgICAgICAgICBsaWdodDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgb246IHsgY2xpY2s6IGZuIH0sXG4gICAgICB9LCB0ZXh0KVxuICAgIH0sXG4gICAgZ2VuQWN0aW9ucyAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgY2xhc3M6ICd2LXNtYWxsLWRpYWxvZ19fYWN0aW9ucycsXG4gICAgICB9LCBbXG4gICAgICAgIHRoaXMuZ2VuQnV0dG9uKHRoaXMuY2FuY2VsLCB0aGlzLmNhbmNlbFRleHQpLFxuICAgICAgICB0aGlzLmdlbkJ1dHRvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zYXZlKHRoaXMucmV0dXJuVmFsdWUpXG4gICAgICAgICAgdGhpcy4kZW1pdCgnc2F2ZScpXG4gICAgICAgIH0sIHRoaXMuc2F2ZVRleHQpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbkNvbnRlbnQgKCk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbWFsbC1kaWFsb2dfX2NvbnRlbnQnLFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGtleWRvd246IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgICAgICBlLmtleUNvZGUgPT09IGtleUNvZGVzLmVzYyAmJiB0aGlzLmNhbmNlbCgpXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5lbnRlcikge1xuICAgICAgICAgICAgICB0aGlzLnNhdmUodGhpcy5yZXR1cm5WYWx1ZSlcbiAgICAgICAgICAgICAgdGhpcy4kZW1pdCgnc2F2ZScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAnY29udGVudCcsXG4gICAgICB9LCBbdGhpcy4kc2xvdHMuaW5wdXRdKVxuICAgIH0sXG4gIH0sXG5cbiAgcmVuZGVyIChoKTogVk5vZGUge1xuICAgIHJldHVybiBoKFZNZW51LCB7XG4gICAgICBzdGF0aWNDbGFzczogJ3Ytc21hbGwtZGlhbG9nJyxcbiAgICAgIGNsYXNzOiB0aGlzLnRoZW1lQ2xhc3NlcyxcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGNvbnRlbnRDbGFzczogJ3Ytc21hbGwtZGlhbG9nX19tZW51LWNvbnRlbnQnLFxuICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgIG9yaWdpbjogJ3RvcCByaWdodCcsXG4gICAgICAgIHJpZ2h0OiB0cnVlLFxuICAgICAgICB2YWx1ZTogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgY2xvc2VPbkNsaWNrOiAhdGhpcy5wZXJzaXN0ZW50LFxuICAgICAgICBjbG9zZU9uQ29udGVudENsaWNrOiBmYWxzZSxcbiAgICAgICAgZWFnZXI6IHRoaXMuZWFnZXIsXG4gICAgICAgIGxpZ2h0OiB0aGlzLmxpZ2h0LFxuICAgICAgICBkYXJrOiB0aGlzLmRhcmssXG4gICAgICB9LFxuICAgICAgb246IHtcbiAgICAgICAgaW5wdXQ6ICh2YWw6IGJvb2xlYW4pID0+ICh0aGlzLmlzQWN0aXZlID0gdmFsKSxcbiAgICAgIH0sXG4gICAgICBzY29wZWRTbG90czoge1xuICAgICAgICBhY3RpdmF0b3I6ICh7IG9uIH0pID0+IHtcbiAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgICAgICAgc3RhdGljQ2xhc3M6ICd2LXNtYWxsLWRpYWxvZ19fYWN0aXZhdG9yJyxcbiAgICAgICAgICAgIG9uLFxuICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7XG4gICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiAndi1zbWFsbC1kaWFsb2dfX2FjdGl2YXRvcl9fY29udGVudCcsXG4gICAgICAgICAgICB9LCB0aGlzLiRzbG90cy5kZWZhdWx0KSxcbiAgICAgICAgICBdKVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LCBbXG4gICAgICB0aGlzLmdlbkNvbnRlbnQoKSxcbiAgICAgIHRoaXMubGFyZ2UgPyB0aGlzLmdlbkFjdGlvbnMoKSA6IG51bGwsXG4gICAgXSlcbiAgfSxcbn0pXG4iXX0=
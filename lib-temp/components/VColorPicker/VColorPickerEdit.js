// Styles
import './VColorPickerEdit.sass';
// Components
import VBtn from '../VBtn';
import VIcon from '../VIcon';
// Helpers
import { parseHex } from '../../util/colorUtils';
// Types
import Vue from 'vue';
import { fromRGBA, fromHexa, fromHSLA } from './util';
export const modes = {
    rgba: {
        inputs: [
            ['r', 255, 'int'],
            ['g', 255, 'int'],
            ['b', 255, 'int'],
            ['a', 1, 'float'],
        ],
        from: fromRGBA,
    },
    hsla: {
        inputs: [
            ['h', 360, 'int'],
            ['s', 1, 'float'],
            ['l', 1, 'float'],
            ['a', 1, 'float'],
        ],
        from: fromHSLA,
    },
    hexa: {
        from: fromHexa,
    },
};
export default Vue.extend({
    name: 'v-color-picker-edit',
    props: {
        color: Object,
        disabled: Boolean,
        hideAlpha: Boolean,
        hideModeSwitch: Boolean,
        mode: {
            type: String,
            default: 'rgba',
            validator: (v) => Object.keys(modes).includes(v),
        },
    },
    data() {
        return {
            modes,
            internalMode: this.mode,
        };
    },
    computed: {
        currentMode() {
            return this.modes[this.internalMode];
        },
    },
    watch: {
        mode(mode) {
            this.internalMode = mode;
        },
    },
    created() {
        this.internalMode = this.mode;
    },
    methods: {
        getValue(v, type) {
            if (type === 'float')
                return Math.round(v * 100) / 100;
            else if (type === 'int')
                return Math.round(v);
            else
                return 0;
        },
        parseValue(v, type) {
            if (type === 'float')
                return parseFloat(v);
            else if (type === 'int')
                return parseInt(v, 10) || 0;
            else
                return 0;
        },
        changeMode() {
            const modes = Object.keys(this.modes);
            const index = modes.indexOf(this.internalMode);
            const newMode = modes[(index + 1) % modes.length];
            this.internalMode = newMode;
            this.$emit('update:mode', newMode);
        },
        genInput(target, attrs, value, on) {
            return this.$createElement('div', {
                staticClass: 'v-color-picker__input',
            }, [
                this.$createElement('input', {
                    key: target,
                    attrs,
                    domProps: {
                        value,
                    },
                    on,
                }),
                this.$createElement('span', target.toUpperCase()),
            ]);
        },
        genInputs() {
            if (this.internalMode === 'hexa') {
                const hex = this.color.hexa;
                const value = this.hideAlpha && hex.endsWith('FF') ? hex.substr(0, 7) : hex;
                return this.genInput('hex', {
                    maxlength: this.hideAlpha ? 7 : 9,
                    disabled: this.disabled,
                }, value, {
                    change: (e) => {
                        const el = e.target;
                        this.$emit('update:color', this.currentMode.from(parseHex(el.value)));
                    },
                });
            }
            else {
                const inputs = this.hideAlpha ? this.currentMode.inputs.slice(0, -1) : this.currentMode.inputs;
                return inputs.map(([target, max, type]) => {
                    const value = this.color[this.internalMode];
                    return this.genInput(target, {
                        type: 'number',
                        min: 0,
                        max,
                        step: type === 'float' ? '0.01' : type === 'int' ? '1' : undefined,
                        disabled: this.disabled,
                    }, this.getValue(value[target], type), {
                        input: (e) => {
                            const el = e.target;
                            const newVal = this.parseValue(el.value || '0', type);
                            this.$emit('update:color', this.currentMode.from(Object.assign({}, value, { [target]: newVal }), this.color.alpha));
                        },
                    });
                });
            }
        },
        genSwitch() {
            return this.$createElement(VBtn, {
                props: {
                    small: true,
                    icon: true,
                    disabled: this.disabled,
                },
                on: {
                    click: this.changeMode,
                },
            }, [
                this.$createElement(VIcon, '$unfold'),
            ]);
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-color-picker__edit',
        }, [
            this.genInputs(),
            !this.hideModeSwitch && this.genSwitch(),
        ]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNvbG9yUGlja2VyRWRpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZDb2xvclBpY2tlci9WQ29sb3JQaWNrZXJFZGl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVM7QUFDVCxPQUFPLHlCQUF5QixDQUFBO0FBRWhDLGFBQWE7QUFDYixPQUFPLElBQUksTUFBTSxTQUFTLENBQUE7QUFDMUIsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBRTVCLFVBQVU7QUFDVixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFFaEQsUUFBUTtBQUNSLE9BQU8sR0FBd0IsTUFBTSxLQUFLLENBQUE7QUFDMUMsT0FBTyxFQUFxQixRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQVN4RSxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUc7SUFDbkIsSUFBSSxFQUFFO1FBQ0osTUFBTSxFQUFFO1lBQ04sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQztZQUNqQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDO1lBQ2pCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUM7WUFDakIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQztTQUNsQjtRQUNELElBQUksRUFBRSxRQUFRO0tBQ2Y7SUFDRCxJQUFJLEVBQUU7UUFDSixNQUFNLEVBQUU7WUFDTixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDO1lBQ2pCLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUM7WUFDakIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQztZQUNqQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxFQUFFLFFBQVE7S0FDZjtJQUNELElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxRQUFRO0tBQ2Y7Q0FDeUIsQ0FBQTtBQUU1QixlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDeEIsSUFBSSxFQUFFLHFCQUFxQjtJQUUzQixLQUFLLEVBQUU7UUFDTCxLQUFLLEVBQUUsTUFBcUM7UUFDNUMsUUFBUSxFQUFFLE9BQU87UUFDakIsU0FBUyxFQUFFLE9BQU87UUFDbEIsY0FBYyxFQUFFLE9BQU87UUFDdkIsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsTUFBTTtZQUNmLFNBQVMsRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ3pEO0tBQ0Y7SUFFRCxJQUFJO1FBQ0YsT0FBTztZQUNMLEtBQUs7WUFDTCxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDeEIsQ0FBQTtJQUNILENBQUM7SUFFRCxRQUFRLEVBQUU7UUFDUixXQUFXO1lBQ1QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUN0QyxDQUFDO0tBQ0Y7SUFFRCxLQUFLLEVBQUU7UUFDTCxJQUFJLENBQUUsSUFBSTtZQUNSLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO1FBQzFCLENBQUM7S0FDRjtJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDL0IsQ0FBQztJQUVELE9BQU8sRUFBRTtRQUNQLFFBQVEsQ0FBRSxDQUFNLEVBQUUsSUFBWTtZQUM1QixJQUFJLElBQUksS0FBSyxPQUFPO2dCQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFBO2lCQUNqRCxJQUFJLElBQUksS0FBSyxLQUFLO2dCQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTs7Z0JBQ3hDLE9BQU8sQ0FBQyxDQUFBO1FBQ2YsQ0FBQztRQUNELFVBQVUsQ0FBRSxDQUFTLEVBQUUsSUFBWTtZQUNqQyxJQUFJLElBQUksS0FBSyxPQUFPO2dCQUFFLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO2lCQUNyQyxJQUFJLElBQUksS0FBSyxLQUFLO2dCQUFFLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUE7O2dCQUMvQyxPQUFPLENBQUMsQ0FBQTtRQUNmLENBQUM7UUFDRCxVQUFVO1lBQ1IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDckMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7WUFDOUMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNqRCxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQTtZQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNwQyxDQUFDO1FBQ0QsUUFBUSxDQUFFLE1BQWMsRUFBRSxLQUFVLEVBQUUsS0FBVSxFQUFFLEVBQU87WUFDdkQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtnQkFDaEMsV0FBVyxFQUFFLHVCQUF1QjthQUNyQyxFQUFFO2dCQUNELElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFO29CQUMzQixHQUFHLEVBQUUsTUFBTTtvQkFDWCxLQUFLO29CQUNMLFFBQVEsRUFBRTt3QkFDUixLQUFLO3FCQUNOO29CQUNELEVBQUU7aUJBQ0gsQ0FBQztnQkFDRixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDbEQsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELFNBQVM7WUFDUCxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssTUFBTSxFQUFFO2dCQUNoQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQTtnQkFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFBO2dCQUMzRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQ2xCLEtBQUssRUFDTDtvQkFDRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7aUJBQ3hCLEVBQ0QsS0FBSyxFQUNMO29CQUNFLE1BQU0sRUFBRSxDQUFDLENBQVEsRUFBRSxFQUFFO3dCQUNuQixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBMEIsQ0FBQTt3QkFDdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ3ZFLENBQUM7aUJBQ0YsQ0FDRixDQUFBO2FBQ0Y7aUJBQU07Z0JBQ0wsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU8sQ0FBQTtnQkFDaEcsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7b0JBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQXVDLENBQVEsQ0FBQTtvQkFDN0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUNsQixNQUFNLEVBQ047d0JBQ0UsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsR0FBRyxFQUFFLENBQUM7d0JBQ04sR0FBRzt3QkFDSCxJQUFJLEVBQUUsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVM7d0JBQ2xFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtxQkFDeEIsRUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsRUFDbEM7d0JBQ0UsS0FBSyxFQUFFLENBQUMsQ0FBUSxFQUFFLEVBQUU7NEJBQ2xCLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUEwQixDQUFBOzRCQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBOzRCQUVyRCxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FDOUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FDakIsQ0FBQyxDQUFBO3dCQUNKLENBQUM7cUJBQ0YsQ0FDRixDQUFBO2dCQUNILENBQUMsQ0FBQyxDQUFBO2FBQ0g7UUFDSCxDQUFDO1FBQ0QsU0FBUztZQUNQLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUU7Z0JBQy9CLEtBQUssRUFBRTtvQkFDTCxLQUFLLEVBQUUsSUFBSTtvQkFDWCxJQUFJLEVBQUUsSUFBSTtvQkFDVixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7aUJBQ3hCO2dCQUNELEVBQUUsRUFBRTtvQkFDRixLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVU7aUJBQ3ZCO2FBQ0YsRUFBRTtnQkFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUM7YUFDdEMsQ0FBQyxDQUFBO1FBQ0osQ0FBQztLQUNGO0lBRUQsTUFBTSxDQUFFLENBQUM7UUFDUCxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDZCxXQUFXLEVBQUUsc0JBQXNCO1NBQ3BDLEVBQUU7WUFDRCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1NBQ3pDLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTdHlsZXNcbmltcG9ydCAnLi9WQ29sb3JQaWNrZXJFZGl0LnNhc3MnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWQnRuIGZyb20gJy4uL1ZCdG4nXG5pbXBvcnQgVkljb24gZnJvbSAnLi4vVkljb24nXG5cbi8vIEhlbHBlcnNcbmltcG9ydCB7IHBhcnNlSGV4IH0gZnJvbSAnLi4vLi4vdXRpbC9jb2xvclV0aWxzJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IFZ1ZSwgeyBWTm9kZSwgUHJvcFR5cGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBWQ29sb3JQaWNrZXJDb2xvciwgZnJvbVJHQkEsIGZyb21IZXhhLCBmcm9tSFNMQSB9IGZyb20gJy4vdXRpbCdcblxudHlwZSBJbnB1dCA9IFtzdHJpbmcsIG51bWJlciwgc3RyaW5nXVxuXG5leHBvcnQgdHlwZSBNb2RlID0ge1xuICBpbnB1dHM/OiBJbnB1dFtdXG4gIGZyb206IEZ1bmN0aW9uXG59XG5cbmV4cG9ydCBjb25zdCBtb2RlcyA9IHtcbiAgcmdiYToge1xuICAgIGlucHV0czogW1xuICAgICAgWydyJywgMjU1LCAnaW50J10sXG4gICAgICBbJ2cnLCAyNTUsICdpbnQnXSxcbiAgICAgIFsnYicsIDI1NSwgJ2ludCddLFxuICAgICAgWydhJywgMSwgJ2Zsb2F0J10sXG4gICAgXSxcbiAgICBmcm9tOiBmcm9tUkdCQSxcbiAgfSxcbiAgaHNsYToge1xuICAgIGlucHV0czogW1xuICAgICAgWydoJywgMzYwLCAnaW50J10sXG4gICAgICBbJ3MnLCAxLCAnZmxvYXQnXSxcbiAgICAgIFsnbCcsIDEsICdmbG9hdCddLFxuICAgICAgWydhJywgMSwgJ2Zsb2F0J10sXG4gICAgXSxcbiAgICBmcm9tOiBmcm9tSFNMQSxcbiAgfSxcbiAgaGV4YToge1xuICAgIGZyb206IGZyb21IZXhhLFxuICB9LFxufSBhcyB7IFtrZXk6IHN0cmluZ106IE1vZGUgfVxuXG5leHBvcnQgZGVmYXVsdCBWdWUuZXh0ZW5kKHtcbiAgbmFtZTogJ3YtY29sb3ItcGlja2VyLWVkaXQnLFxuXG4gIHByb3BzOiB7XG4gICAgY29sb3I6IE9iamVjdCBhcyBQcm9wVHlwZTxWQ29sb3JQaWNrZXJDb2xvcj4sXG4gICAgZGlzYWJsZWQ6IEJvb2xlYW4sXG4gICAgaGlkZUFscGhhOiBCb29sZWFuLFxuICAgIGhpZGVNb2RlU3dpdGNoOiBCb29sZWFuLFxuICAgIG1vZGU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdyZ2JhJyxcbiAgICAgIHZhbGlkYXRvcjogKHY6IHN0cmluZykgPT4gT2JqZWN0LmtleXMobW9kZXMpLmluY2x1ZGVzKHYpLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVzLFxuICAgICAgaW50ZXJuYWxNb2RlOiB0aGlzLm1vZGUsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY3VycmVudE1vZGUgKCk6IE1vZGUge1xuICAgICAgcmV0dXJuIHRoaXMubW9kZXNbdGhpcy5pbnRlcm5hbE1vZGVdXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIG1vZGUgKG1vZGUpIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxNb2RlID0gbW9kZVxuICAgIH0sXG4gIH0sXG5cbiAgY3JlYXRlZCAoKSB7XG4gICAgdGhpcy5pbnRlcm5hbE1vZGUgPSB0aGlzLm1vZGVcbiAgfSxcblxuICBtZXRob2RzOiB7XG4gICAgZ2V0VmFsdWUgKHY6IGFueSwgdHlwZTogc3RyaW5nKSB7XG4gICAgICBpZiAodHlwZSA9PT0gJ2Zsb2F0JykgcmV0dXJuIE1hdGgucm91bmQodiAqIDEwMCkgLyAxMDBcbiAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdpbnQnKSByZXR1cm4gTWF0aC5yb3VuZCh2KVxuICAgICAgZWxzZSByZXR1cm4gMFxuICAgIH0sXG4gICAgcGFyc2VWYWx1ZSAodjogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgICAgIGlmICh0eXBlID09PSAnZmxvYXQnKSByZXR1cm4gcGFyc2VGbG9hdCh2KVxuICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ludCcpIHJldHVybiBwYXJzZUludCh2LCAxMCkgfHwgMFxuICAgICAgZWxzZSByZXR1cm4gMFxuICAgIH0sXG4gICAgY2hhbmdlTW9kZSAoKSB7XG4gICAgICBjb25zdCBtb2RlcyA9IE9iamVjdC5rZXlzKHRoaXMubW9kZXMpXG4gICAgICBjb25zdCBpbmRleCA9IG1vZGVzLmluZGV4T2YodGhpcy5pbnRlcm5hbE1vZGUpXG4gICAgICBjb25zdCBuZXdNb2RlID0gbW9kZXNbKGluZGV4ICsgMSkgJSBtb2Rlcy5sZW5ndGhdXG4gICAgICB0aGlzLmludGVybmFsTW9kZSA9IG5ld01vZGVcbiAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTptb2RlJywgbmV3TW9kZSlcbiAgICB9LFxuICAgIGdlbklucHV0ICh0YXJnZXQ6IHN0cmluZywgYXR0cnM6IGFueSwgdmFsdWU6IGFueSwgb246IGFueSk6IFZOb2RlIHtcbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0YXRpY0NsYXNzOiAndi1jb2xvci1waWNrZXJfX2lucHV0JyxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XG4gICAgICAgICAga2V5OiB0YXJnZXQsXG4gICAgICAgICAgYXR0cnMsXG4gICAgICAgICAgZG9tUHJvcHM6IHtcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgb24sXG4gICAgICAgIH0pLFxuICAgICAgICB0aGlzLiRjcmVhdGVFbGVtZW50KCdzcGFuJywgdGFyZ2V0LnRvVXBwZXJDYXNlKCkpLFxuICAgICAgXSlcbiAgICB9LFxuICAgIGdlbklucHV0cyAoKTogVk5vZGVbXSB8IFZOb2RlIHtcbiAgICAgIGlmICh0aGlzLmludGVybmFsTW9kZSA9PT0gJ2hleGEnKSB7XG4gICAgICAgIGNvbnN0IGhleCA9IHRoaXMuY29sb3IuaGV4YVxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaGlkZUFscGhhICYmIGhleC5lbmRzV2l0aCgnRkYnKSA/IGhleC5zdWJzdHIoMCwgNykgOiBoZXhcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VuSW5wdXQoXG4gICAgICAgICAgJ2hleCcsXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWF4bGVuZ3RoOiB0aGlzLmhpZGVBbHBoYSA/IDcgOiA5LFxuICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjaGFuZ2U6IChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgICAgICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOmNvbG9yJywgdGhpcy5jdXJyZW50TW9kZS5mcm9tKHBhcnNlSGV4KGVsLnZhbHVlKSkpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaW5wdXRzID0gdGhpcy5oaWRlQWxwaGEgPyB0aGlzLmN1cnJlbnRNb2RlLmlucHV0cyEuc2xpY2UoMCwgLTEpIDogdGhpcy5jdXJyZW50TW9kZS5pbnB1dHMhXG4gICAgICAgIHJldHVybiBpbnB1dHMubWFwKChbdGFyZ2V0LCBtYXgsIHR5cGVdKSA9PiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmNvbG9yW3RoaXMuaW50ZXJuYWxNb2RlIGFzIGtleW9mIFZDb2xvclBpY2tlckNvbG9yXSBhcyBhbnlcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZW5JbnB1dChcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgICAgbWF4LFxuICAgICAgICAgICAgICBzdGVwOiB0eXBlID09PSAnZmxvYXQnID8gJzAuMDEnIDogdHlwZSA9PT0gJ2ludCcgPyAnMScgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLmRpc2FibGVkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRoaXMuZ2V0VmFsdWUodmFsdWVbdGFyZ2V0XSwgdHlwZSksXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlucHV0OiAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnRcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdWYWwgPSB0aGlzLnBhcnNlVmFsdWUoZWwudmFsdWUgfHwgJzAnLCB0eXBlKVxuXG4gICAgICAgICAgICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOmNvbG9yJywgdGhpcy5jdXJyZW50TW9kZS5mcm9tKFxuICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgdmFsdWUsIHsgW3RhcmdldF06IG5ld1ZhbCB9KSxcbiAgICAgICAgICAgICAgICAgIHRoaXMuY29sb3IuYWxwaGFcbiAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGdlblN3aXRjaCAoKTogVk5vZGUge1xuICAgICAgcmV0dXJuIHRoaXMuJGNyZWF0ZUVsZW1lbnQoVkJ0biwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIHNtYWxsOiB0cnVlLFxuICAgICAgICAgIGljb246IHRydWUsXG4gICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQsXG4gICAgICAgIH0sXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgY2xpY2s6IHRoaXMuY2hhbmdlTW9kZSxcbiAgICAgICAgfSxcbiAgICAgIH0sIFtcbiAgICAgICAgdGhpcy4kY3JlYXRlRWxlbWVudChWSWNvbiwgJyR1bmZvbGQnKSxcbiAgICAgIF0pXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1jb2xvci1waWNrZXJfX2VkaXQnLFxuICAgIH0sIFtcbiAgICAgIHRoaXMuZ2VuSW5wdXRzKCksXG4gICAgICAhdGhpcy5oaWRlTW9kZVN3aXRjaCAmJiB0aGlzLmdlblN3aXRjaCgpLFxuICAgIF0pXG4gIH0sXG59KVxuIl19
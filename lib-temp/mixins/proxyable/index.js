import Vue from 'vue';
export function factory(prop = 'value', event = 'change') {
    return Vue.extend({
        name: 'proxyable',
        model: {
            prop,
            event,
        },
        props: {
            [prop]: {
                required: false,
            },
        },
        data() {
            return {
                internalLazyValue: this[prop],
            };
        },
        computed: {
            internalValue: {
                get() {
                    return this.internalLazyValue;
                },
                set(val) {
                    if (val === this.internalLazyValue)
                        return;
                    this.internalLazyValue = val;
                    this.$emit(event, val);
                },
            },
        },
        watch: {
            [prop](val) {
                this.internalLazyValue = val;
            },
        },
    });
}
/* eslint-disable-next-line @typescript-eslint/no-redeclare */
const Proxyable = factory();
export default Proxyable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL3Byb3h5YWJsZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEdBQXVCLE1BQU0sS0FBSyxDQUFBO0FBUXpDLE1BQU0sVUFBVSxPQUFPLENBQ3JCLElBQUksR0FBRyxPQUFPLEVBQ2QsS0FBSyxHQUFHLFFBQVE7SUFFaEIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ2hCLElBQUksRUFBRSxXQUFXO1FBRWpCLEtBQUssRUFBRTtZQUNMLElBQUk7WUFDSixLQUFLO1NBQ047UUFFRCxLQUFLLEVBQUU7WUFDTCxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNOLFFBQVEsRUFBRSxLQUFLO2FBQ2hCO1NBQ0Y7UUFFRCxJQUFJO1lBQ0YsT0FBTztnQkFDTCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFZO2FBQ3pDLENBQUE7UUFDSCxDQUFDO1FBRUQsUUFBUSxFQUFFO1lBQ1IsYUFBYSxFQUFFO2dCQUNiLEdBQUc7b0JBQ0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7Z0JBQy9CLENBQUM7Z0JBQ0QsR0FBRyxDQUFFLEdBQVE7b0JBQ1gsSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDLGlCQUFpQjt3QkFBRSxPQUFNO29CQUUxQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFBO29CQUU1QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTtnQkFDeEIsQ0FBQzthQUNGO1NBQ0Y7UUFFRCxLQUFLLEVBQUU7WUFDTCxDQUFDLElBQUksQ0FBQyxDQUFFLEdBQUc7Z0JBQ1QsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQTtZQUM5QixDQUFDO1NBQ0Y7S0FDRixDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsOERBQThEO0FBQzlELE1BQU0sU0FBUyxHQUFHLE9BQU8sRUFBRSxDQUFBO0FBRTNCLGVBQWUsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFZ1ZSwgeyBWdWVDb25zdHJ1Y3RvciB9IGZyb20gJ3Z1ZSdcblxuZXhwb3J0IHR5cGUgUHJveHlhYmxlPFQgZXh0ZW5kcyBzdHJpbmcgPSAndmFsdWUnPiA9IFZ1ZUNvbnN0cnVjdG9yPFZ1ZSAmIHtcbiAgaW50ZXJuYWxMYXp5VmFsdWU6IHVua25vd25cbiAgaW50ZXJuYWxWYWx1ZTogdW5rbm93blxufSAmIFJlY29yZDxULCBhbnk+PlxuXG5leHBvcnQgZnVuY3Rpb24gZmFjdG9yeTxUIGV4dGVuZHMgc3RyaW5nID0gJ3ZhbHVlJz4gKHByb3A/OiBULCBldmVudD86IHN0cmluZyk6IFByb3h5YWJsZTxUPlxuZXhwb3J0IGZ1bmN0aW9uIGZhY3RvcnkgKFxuICBwcm9wID0gJ3ZhbHVlJyxcbiAgZXZlbnQgPSAnY2hhbmdlJ1xuKSB7XG4gIHJldHVybiBWdWUuZXh0ZW5kKHtcbiAgICBuYW1lOiAncHJveHlhYmxlJyxcblxuICAgIG1vZGVsOiB7XG4gICAgICBwcm9wLFxuICAgICAgZXZlbnQsXG4gICAgfSxcblxuICAgIHByb3BzOiB7XG4gICAgICBbcHJvcF06IHtcbiAgICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgZGF0YSAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpbnRlcm5hbExhenlWYWx1ZTogdGhpc1twcm9wXSBhcyB1bmtub3duLFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wdXRlZDoge1xuICAgICAgaW50ZXJuYWxWYWx1ZToge1xuICAgICAgICBnZXQgKCk6IHVua25vd24ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmludGVybmFsTGF6eVZhbHVlXG4gICAgICAgIH0sXG4gICAgICAgIHNldCAodmFsOiBhbnkpIHtcbiAgICAgICAgICBpZiAodmFsID09PSB0aGlzLmludGVybmFsTGF6eVZhbHVlKSByZXR1cm5cblxuICAgICAgICAgIHRoaXMuaW50ZXJuYWxMYXp5VmFsdWUgPSB2YWxcblxuICAgICAgICAgIHRoaXMuJGVtaXQoZXZlbnQsIHZhbClcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHdhdGNoOiB7XG4gICAgICBbcHJvcF0gKHZhbCkge1xuICAgICAgICB0aGlzLmludGVybmFsTGF6eVZhbHVlID0gdmFsXG4gICAgICB9LFxuICAgIH0sXG4gIH0pXG59XG5cbi8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVkZWNsYXJlICovXG5jb25zdCBQcm94eWFibGUgPSBmYWN0b3J5KClcblxuZXhwb3J0IGRlZmF1bHQgUHJveHlhYmxlXG4iXX0=
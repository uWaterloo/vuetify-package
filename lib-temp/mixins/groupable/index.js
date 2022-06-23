// Mixins
import { inject as RegistrableInject } from '../registrable';
export function factory(namespace, child, parent) {
    return RegistrableInject(namespace, child, parent).extend({
        name: 'groupable',
        props: {
            activeClass: {
                type: String,
                default() {
                    if (!this[namespace])
                        return undefined;
                    return this[namespace].activeClass;
                },
            },
            disabled: Boolean,
        },
        data() {
            return {
                isActive: false,
            };
        },
        computed: {
            groupClasses() {
                if (!this.activeClass)
                    return {};
                return {
                    [this.activeClass]: this.isActive,
                };
            },
        },
        created() {
            this[namespace] && this[namespace].register(this);
        },
        beforeDestroy() {
            this[namespace] && this[namespace].unregister(this);
        },
        methods: {
            toggle() {
                this.$emit('change');
            },
        },
    });
}
/* eslint-disable-next-line @typescript-eslint/no-redeclare */
const Groupable = factory('itemGroup');
export default Groupable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL2dyb3VwYWJsZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxFQUFlLE1BQU0sSUFBSSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBZXpFLE1BQU0sVUFBVSxPQUFPLENBQ3JCLFNBQVksRUFDWixLQUFjLEVBQ2QsTUFBZTtJQUVmLE9BQU8saUJBQWlCLENBQU8sU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDOUQsSUFBSSxFQUFFLFdBQVc7UUFFakIsS0FBSyxFQUFFO1lBQ0wsV0FBVyxFQUFFO2dCQUNYLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU87b0JBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7d0JBQUUsT0FBTyxTQUFTLENBQUE7b0JBRXRDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsQ0FBQTtnQkFDcEMsQ0FBQzthQUM4QjtZQUNqQyxRQUFRLEVBQUUsT0FBTztTQUNsQjtRQUVELElBQUk7WUFDRixPQUFPO2dCQUNMLFFBQVEsRUFBRSxLQUFLO2FBQ2hCLENBQUE7UUFDSCxDQUFDO1FBRUQsUUFBUSxFQUFFO1lBQ1IsWUFBWTtnQkFDVixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVc7b0JBQUUsT0FBTyxFQUFFLENBQUE7Z0JBRWhDLE9BQU87b0JBQ0wsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVE7aUJBQ2xDLENBQUE7WUFDSCxDQUFDO1NBQ0Y7UUFFRCxPQUFPO1lBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFLLElBQUksQ0FBQyxTQUFTLENBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDNUQsQ0FBQztRQUVELGFBQWE7WUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUssSUFBSSxDQUFDLFNBQVMsQ0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5RCxDQUFDO1FBRUQsT0FBTyxFQUFFO1lBQ1AsTUFBTTtnQkFDSixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3RCLENBQUM7U0FDRjtLQUNGLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRCw4REFBOEQ7QUFDOUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBRXRDLGVBQWUsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTWl4aW5zXG5pbXBvcnQgeyBSZWdpc3RyYWJsZSwgaW5qZWN0IGFzIFJlZ2lzdHJhYmxlSW5qZWN0IH0gZnJvbSAnLi4vcmVnaXN0cmFibGUnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHsgRXh0cmFjdFZ1ZSB9IGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IHsgVnVlQ29uc3RydWN0b3IgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5cbmV4cG9ydCB0eXBlIEdyb3VwYWJsZTxUIGV4dGVuZHMgc3RyaW5nLCBDIGV4dGVuZHMgVnVlQ29uc3RydWN0b3IgfCBudWxsID0gbnVsbD4gPSBWdWVDb25zdHJ1Y3RvcjxFeHRyYWN0VnVlPFJlZ2lzdHJhYmxlPFQsIEM+PiAmIHtcbiAgYWN0aXZlQ2xhc3M6IHN0cmluZ1xuICBpc0FjdGl2ZTogYm9vbGVhblxuICBkaXNhYmxlZDogYm9vbGVhblxuICBncm91cENsYXNzZXM6IG9iamVjdFxuICB0b2dnbGUgKCk6IHZvaWRcbn0+XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWN0b3J5PFQgZXh0ZW5kcyBzdHJpbmcsIEMgZXh0ZW5kcyBWdWVDb25zdHJ1Y3RvciB8IG51bGwgPSBudWxsPiAoXG4gIG5hbWVzcGFjZTogVCxcbiAgY2hpbGQ/OiBzdHJpbmcsXG4gIHBhcmVudD86IHN0cmluZ1xuKTogR3JvdXBhYmxlPFQsIEM+IHtcbiAgcmV0dXJuIFJlZ2lzdHJhYmxlSW5qZWN0PFQsIEM+KG5hbWVzcGFjZSwgY2hpbGQsIHBhcmVudCkuZXh0ZW5kKHtcbiAgICBuYW1lOiAnZ3JvdXBhYmxlJyxcblxuICAgIHByb3BzOiB7XG4gICAgICBhY3RpdmVDbGFzczoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIGRlZmF1bHQgKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICAgICAgaWYgKCF0aGlzW25hbWVzcGFjZV0pIHJldHVybiB1bmRlZmluZWRcblxuICAgICAgICAgIHJldHVybiB0aGlzW25hbWVzcGFjZV0uYWN0aXZlQ2xhc3NcbiAgICAgICAgfSxcbiAgICAgIH0gYXMgYW55IGFzIFByb3BWYWxpZGF0b3I8c3RyaW5nPixcbiAgICAgIGRpc2FibGVkOiBCb29sZWFuLFxuICAgIH0sXG5cbiAgICBkYXRhICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcHV0ZWQ6IHtcbiAgICAgIGdyb3VwQ2xhc3NlcyAoKTogb2JqZWN0IHtcbiAgICAgICAgaWYgKCF0aGlzLmFjdGl2ZUNsYXNzKSByZXR1cm4ge31cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIFt0aGlzLmFjdGl2ZUNsYXNzXTogdGhpcy5pc0FjdGl2ZSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgY3JlYXRlZCAoKSB7XG4gICAgICB0aGlzW25hbWVzcGFjZV0gJiYgKHRoaXNbbmFtZXNwYWNlXSBhcyBhbnkpLnJlZ2lzdGVyKHRoaXMpXG4gICAgfSxcblxuICAgIGJlZm9yZURlc3Ryb3kgKCkge1xuICAgICAgdGhpc1tuYW1lc3BhY2VdICYmICh0aGlzW25hbWVzcGFjZV0gYXMgYW55KS51bnJlZ2lzdGVyKHRoaXMpXG4gICAgfSxcblxuICAgIG1ldGhvZHM6IHtcbiAgICAgIHRvZ2dsZSAoKSB7XG4gICAgICAgIHRoaXMuJGVtaXQoJ2NoYW5nZScpXG4gICAgICB9LFxuICAgIH0sXG4gIH0pXG59XG5cbi8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVkZWNsYXJlICovXG5jb25zdCBHcm91cGFibGUgPSBmYWN0b3J5KCdpdGVtR3JvdXAnKVxuXG5leHBvcnQgZGVmYXVsdCBHcm91cGFibGVcbiJdfQ==
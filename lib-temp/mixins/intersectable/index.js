// Directives
import Intersect from '../../directives/intersect';
// Utilities
import { consoleWarn } from '../../util/console';
// Types
import Vue from 'vue';
export default function intersectable(options) {
    return Vue.extend({
        name: 'intersectable',
        data: () => ({
            isIntersecting: false,
        }),
        mounted() {
            Intersect.inserted(this.$el, {
                name: 'intersect',
                value: this.onObserve,
            }, this.$vnode);
        },
        destroyed() {
            Intersect.unbind(this.$el, {
                name: 'intersect',
                value: this.onObserve,
            }, this.$vnode);
        },
        methods: {
            onObserve(entries, observer, isIntersecting) {
                this.isIntersecting = isIntersecting;
                if (!isIntersecting)
                    return;
                for (let i = 0, length = options.onVisible.length; i < length; i++) {
                    const callback = this[options.onVisible[i]];
                    if (typeof callback === 'function') {
                        callback();
                        continue;
                    }
                    consoleWarn(options.onVisible[i] + ' method is not available on the instance but referenced in intersectable mixin options');
                }
            },
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL2ludGVyc2VjdGFibGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsYUFBYTtBQUNiLE9BQU8sU0FBUyxNQUFNLDRCQUE0QixDQUFBO0FBRWxELFlBQVk7QUFDWixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFFaEQsUUFBUTtBQUNSLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQUVyQixNQUFNLENBQUMsT0FBTyxVQUFVLGFBQWEsQ0FBRSxPQUFnQztJQUNyRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDaEIsSUFBSSxFQUFFLGVBQWU7UUFFckIsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDWCxjQUFjLEVBQUUsS0FBSztTQUN0QixDQUFDO1FBRUYsT0FBTztZQUNMLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQWtCLEVBQUU7Z0JBQzFDLElBQUksRUFBRSxXQUFXO2dCQUNqQixLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVM7YUFDdEIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDakIsQ0FBQztRQUVELFNBQVM7WUFDUCxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFrQixFQUFFO2dCQUN4QyxJQUFJLEVBQUUsV0FBVztnQkFDakIsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTO2FBQ3RCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2pCLENBQUM7UUFFRCxPQUFPLEVBQUU7WUFDUCxTQUFTLENBQUUsT0FBb0MsRUFBRSxRQUE4QixFQUFFLGNBQXVCO2dCQUN0RyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQTtnQkFFcEMsSUFBSSxDQUFDLGNBQWM7b0JBQUUsT0FBTTtnQkFFM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ2xFLE1BQU0sUUFBUSxHQUFJLElBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBRXBELElBQUksT0FBTyxRQUFRLEtBQUssVUFBVSxFQUFFO3dCQUNsQyxRQUFRLEVBQUUsQ0FBQTt3QkFDVixTQUFRO3FCQUNUO29CQUVELFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLHdGQUF3RixDQUFDLENBQUE7aUJBQzdIO1lBQ0gsQ0FBQztTQUNGO0tBQ0YsQ0FBQyxDQUFBO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIERpcmVjdGl2ZXNcbmltcG9ydCBJbnRlcnNlY3QgZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9pbnRlcnNlY3QnXG5cbi8vIFV0aWxpdGllc1xuaW1wb3J0IHsgY29uc29sZVdhcm4gfSBmcm9tICcuLi8uLi91dGlsL2NvbnNvbGUnXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW50ZXJzZWN0YWJsZSAob3B0aW9uczogeyBvblZpc2libGU6IHN0cmluZ1tdIH0pIHtcbiAgcmV0dXJuIFZ1ZS5leHRlbmQoe1xuICAgIG5hbWU6ICdpbnRlcnNlY3RhYmxlJyxcblxuICAgIGRhdGE6ICgpID0+ICh7XG4gICAgICBpc0ludGVyc2VjdGluZzogZmFsc2UsXG4gICAgfSksXG5cbiAgICBtb3VudGVkICgpIHtcbiAgICAgIEludGVyc2VjdC5pbnNlcnRlZCh0aGlzLiRlbCBhcyBIVE1MRWxlbWVudCwge1xuICAgICAgICBuYW1lOiAnaW50ZXJzZWN0JyxcbiAgICAgICAgdmFsdWU6IHRoaXMub25PYnNlcnZlLFxuICAgICAgfSwgdGhpcy4kdm5vZGUpXG4gICAgfSxcblxuICAgIGRlc3Ryb3llZCAoKSB7XG4gICAgICBJbnRlcnNlY3QudW5iaW5kKHRoaXMuJGVsIGFzIEhUTUxFbGVtZW50LCB7XG4gICAgICAgIG5hbWU6ICdpbnRlcnNlY3QnLFxuICAgICAgICB2YWx1ZTogdGhpcy5vbk9ic2VydmUsXG4gICAgICB9LCB0aGlzLiR2bm9kZSlcbiAgICB9LFxuXG4gICAgbWV0aG9kczoge1xuICAgICAgb25PYnNlcnZlIChlbnRyaWVzOiBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5W10sIG9ic2VydmVyOiBJbnRlcnNlY3Rpb25PYnNlcnZlciwgaXNJbnRlcnNlY3Rpbmc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5pc0ludGVyc2VjdGluZyA9IGlzSW50ZXJzZWN0aW5nXG5cbiAgICAgICAgaWYgKCFpc0ludGVyc2VjdGluZykgcmV0dXJuXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IG9wdGlvbnMub25WaXNpYmxlLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSAodGhpcyBhcyBhbnkpW29wdGlvbnMub25WaXNpYmxlW2ldXVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zb2xlV2FybihvcHRpb25zLm9uVmlzaWJsZVtpXSArICcgbWV0aG9kIGlzIG5vdCBhdmFpbGFibGUgb24gdGhlIGluc3RhbmNlIGJ1dCByZWZlcmVuY2VkIGluIGludGVyc2VjdGFibGUgbWl4aW4gb3B0aW9ucycpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSlcbn1cbiJdfQ==
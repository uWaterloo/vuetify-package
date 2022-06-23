import OurVue from 'vue';
import { consoleError } from './util/console';
export function install(Vue, args = {}) {
    if (install.installed)
        return;
    install.installed = true;
    if (OurVue !== Vue) {
        consoleError(`Multiple instances of Vue detected
See https://github.com/vuetifyjs/vuetify/issues/4068

If you're seeing "$attrs is readonly", it's caused by this`);
    }
    const components = args.components || {};
    const directives = args.directives || {};
    for (const name in directives) {
        const directive = directives[name];
        Vue.directive(name, directive);
    }
    (function registerComponents(components) {
        if (components) {
            for (const key in components) {
                const component = components[key];
                if (component && !registerComponents(component.$_vuetify_subcomponents)) {
                    Vue.component(key, component);
                }
            }
            return true;
        }
        return false;
    })(components);
    // Used to avoid multiple mixins being setup
    // when in dev mode and hot module reload
    // https://github.com/vuejs/vue/issues/5089#issuecomment-284260111
    if (Vue.$_vuetify_installed)
        return;
    Vue.$_vuetify_installed = true;
    Vue.mixin({
        beforeCreate() {
            const options = this.$options;
            if (options.vuetify) {
                options.vuetify.init(this, this.$ssrContext);
                this.$vuetify = Vue.observable(options.vuetify.framework);
            }
            else {
                this.$vuetify = (options.parent && options.parent.$vuetify) || this;
            }
        },
        beforeMount() {
            // @ts-ignore
            if (this.$options.vuetify && this.$el && this.$el.hasAttribute('data-server-rendered')) {
                // @ts-ignore
                this.$vuetify.isHydrating = true;
                // @ts-ignore
                this.$vuetify.breakpoint.update(true);
            }
        },
        mounted() {
            // @ts-ignore
            if (this.$options.vuetify && this.$vuetify.isHydrating) {
                // @ts-ignore
                this.$vuetify.isHydrating = false;
                // @ts-ignore
                this.$vuetify.breakpoint.update();
            }
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnN0YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBMEIsTUFBTSxLQUFLLENBQUE7QUFFNUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRTdDLE1BQU0sVUFBVSxPQUFPLENBQUUsR0FBbUIsRUFBRSxPQUEwQixFQUFFO0lBQ3hFLElBQUssT0FBZSxDQUFDLFNBQVM7UUFBRSxPQUFNO0lBQ3JDLE9BQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBRWpDLElBQUksTUFBTSxLQUFLLEdBQUcsRUFBRTtRQUNsQixZQUFZLENBQUM7OzsyREFHMEMsQ0FBQyxDQUFBO0tBQ3pEO0lBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUE7SUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUE7SUFFeEMsS0FBSyxNQUFNLElBQUksSUFBSSxVQUFVLEVBQUU7UUFDN0IsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRWxDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0tBQy9CO0lBRUQsQ0FBQyxTQUFTLGtCQUFrQixDQUFFLFVBQWU7UUFDM0MsSUFBSSxVQUFVLEVBQUU7WUFDZCxLQUFLLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRTtnQkFDNUIsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNqQyxJQUFJLFNBQVMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFO29CQUN2RSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUF1QixDQUFDLENBQUE7aUJBQzVDO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQTtTQUNaO1FBQ0QsT0FBTyxLQUFLLENBQUE7SUFDZCxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUVkLDRDQUE0QztJQUM1Qyx5Q0FBeUM7SUFDekMsa0VBQWtFO0lBQ2xFLElBQUksR0FBRyxDQUFDLG1CQUFtQjtRQUFFLE9BQU07SUFDbkMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQTtJQUU5QixHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ1IsWUFBWTtZQUNWLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFlLENBQUE7WUFFcEMsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO2dCQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO2dCQUM1QyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTthQUMxRDtpQkFBTTtnQkFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQTthQUNwRTtRQUNILENBQUM7UUFDRCxXQUFXO1lBQ1QsYUFBYTtZQUNiLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO2dCQUN0RixhQUFhO2dCQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtnQkFDaEMsYUFBYTtnQkFDYixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDdEM7UUFDSCxDQUFDO1FBQ0QsT0FBTztZQUNMLGFBQWE7WUFDYixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFO2dCQUN0RCxhQUFhO2dCQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQTtnQkFDakMsYUFBYTtnQkFDYixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTthQUNsQztRQUNILENBQUM7S0FDRixDQUFDLENBQUE7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE91clZ1ZSwgeyBWdWVDb25zdHJ1Y3RvciB9IGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFZ1ZXRpZnlVc2VPcHRpb25zIH0gZnJvbSAndnVldGlmeS90eXBlcydcbmltcG9ydCB7IGNvbnNvbGVFcnJvciB9IGZyb20gJy4vdXRpbC9jb25zb2xlJ1xuXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbCAoVnVlOiBWdWVDb25zdHJ1Y3RvciwgYXJnczogVnVldGlmeVVzZU9wdGlvbnMgPSB7fSkge1xuICBpZiAoKGluc3RhbGwgYXMgYW55KS5pbnN0YWxsZWQpIHJldHVyblxuICAoaW5zdGFsbCBhcyBhbnkpLmluc3RhbGxlZCA9IHRydWVcblxuICBpZiAoT3VyVnVlICE9PSBWdWUpIHtcbiAgICBjb25zb2xlRXJyb3IoYE11bHRpcGxlIGluc3RhbmNlcyBvZiBWdWUgZGV0ZWN0ZWRcblNlZSBodHRwczovL2dpdGh1Yi5jb20vdnVldGlmeWpzL3Z1ZXRpZnkvaXNzdWVzLzQwNjhcblxuSWYgeW91J3JlIHNlZWluZyBcIiRhdHRycyBpcyByZWFkb25seVwiLCBpdCdzIGNhdXNlZCBieSB0aGlzYClcbiAgfVxuXG4gIGNvbnN0IGNvbXBvbmVudHMgPSBhcmdzLmNvbXBvbmVudHMgfHwge31cbiAgY29uc3QgZGlyZWN0aXZlcyA9IGFyZ3MuZGlyZWN0aXZlcyB8fCB7fVxuXG4gIGZvciAoY29uc3QgbmFtZSBpbiBkaXJlY3RpdmVzKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1tuYW1lXVxuXG4gICAgVnVlLmRpcmVjdGl2ZShuYW1lLCBkaXJlY3RpdmUpXG4gIH1cblxuICAoZnVuY3Rpb24gcmVnaXN0ZXJDb21wb25lbnRzIChjb21wb25lbnRzOiBhbnkpIHtcbiAgICBpZiAoY29tcG9uZW50cykge1xuICAgICAgZm9yIChjb25zdCBrZXkgaW4gY29tcG9uZW50cykge1xuICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wb25lbnRzW2tleV1cbiAgICAgICAgaWYgKGNvbXBvbmVudCAmJiAhcmVnaXN0ZXJDb21wb25lbnRzKGNvbXBvbmVudC4kX3Z1ZXRpZnlfc3ViY29tcG9uZW50cykpIHtcbiAgICAgICAgICBWdWUuY29tcG9uZW50KGtleSwgY29tcG9uZW50IGFzIHR5cGVvZiBWdWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9KShjb21wb25lbnRzKVxuXG4gIC8vIFVzZWQgdG8gYXZvaWQgbXVsdGlwbGUgbWl4aW5zIGJlaW5nIHNldHVwXG4gIC8vIHdoZW4gaW4gZGV2IG1vZGUgYW5kIGhvdCBtb2R1bGUgcmVsb2FkXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUvaXNzdWVzLzUwODkjaXNzdWVjb21tZW50LTI4NDI2MDExMVxuICBpZiAoVnVlLiRfdnVldGlmeV9pbnN0YWxsZWQpIHJldHVyblxuICBWdWUuJF92dWV0aWZ5X2luc3RhbGxlZCA9IHRydWVcblxuICBWdWUubWl4aW4oe1xuICAgIGJlZm9yZUNyZWF0ZSAoKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gdGhpcy4kb3B0aW9ucyBhcyBhbnlcblxuICAgICAgaWYgKG9wdGlvbnMudnVldGlmeSkge1xuICAgICAgICBvcHRpb25zLnZ1ZXRpZnkuaW5pdCh0aGlzLCB0aGlzLiRzc3JDb250ZXh0KVxuICAgICAgICB0aGlzLiR2dWV0aWZ5ID0gVnVlLm9ic2VydmFibGUob3B0aW9ucy52dWV0aWZ5LmZyYW1ld29yaylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkgPSAob3B0aW9ucy5wYXJlbnQgJiYgb3B0aW9ucy5wYXJlbnQuJHZ1ZXRpZnkpIHx8IHRoaXNcbiAgICAgIH1cbiAgICB9LFxuICAgIGJlZm9yZU1vdW50ICgpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGlmICh0aGlzLiRvcHRpb25zLnZ1ZXRpZnkgJiYgdGhpcy4kZWwgJiYgdGhpcy4kZWwuaGFzQXR0cmlidXRlKCdkYXRhLXNlcnZlci1yZW5kZXJlZCcpKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy4kdnVldGlmeS5pc0h5ZHJhdGluZyA9IHRydWVcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLiR2dWV0aWZ5LmJyZWFrcG9pbnQudXBkYXRlKHRydWUpXG4gICAgICB9XG4gICAgfSxcbiAgICBtb3VudGVkICgpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGlmICh0aGlzLiRvcHRpb25zLnZ1ZXRpZnkgJiYgdGhpcy4kdnVldGlmeS5pc0h5ZHJhdGluZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkuaXNIeWRyYXRpbmcgPSBmYWxzZVxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuJHZ1ZXRpZnkuYnJlYWtwb2ludC51cGRhdGUoKVxuICAgICAgfVxuICAgIH0sXG4gIH0pXG59XG4iXX0=
import { install } from './install';
// Services
import * as services from './services';
export default class Vuetify {
    constructor(userPreset = {}) {
        this.framework = {
            isHydrating: false,
        };
        this.installed = [];
        this.preset = {};
        this.userPreset = {};
        this.userPreset = userPreset;
        this.use(services.Presets);
        this.use(services.Application);
        this.use(services.Breakpoint);
        this.use(services.Goto);
        this.use(services.Icons);
        this.use(services.Lang);
        this.use(services.Theme);
    }
    // Called on the new vuetify instance
    // bootstrap in install beforeCreate
    // Exposes ssrContext if available
    init(root, ssrContext) {
        this.installed.forEach(property => {
            const service = this.framework[property];
            service.framework = this.framework;
            service.init(root, ssrContext);
        });
        // rtl is not installed and
        // will never be called by
        // the init process
        this.framework.rtl = Boolean(this.preset.rtl);
    }
    // Instantiate a VuetifyService
    use(Service) {
        const property = Service.property;
        if (this.installed.includes(property))
            return;
        // TODO maybe a specific type for arg 2?
        this.framework[property] = new Service(this.preset, this);
        this.installed.push(property);
    }
}
Vuetify.install = install;
Vuetify.installed = false;
Vuetify.version = __VUETIFY_VERSION__;
Vuetify.config = {
    silent: false,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWV3b3JrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ZyYW1ld29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBYW5DLFdBQVc7QUFDWCxPQUFPLEtBQUssUUFBUSxNQUFNLFlBQVksQ0FBQTtBQUV0QyxNQUFNLENBQUMsT0FBTyxPQUFPLE9BQU87SUFxQjFCLFlBQWEsYUFBZ0MsRUFBRTtRQVZ4QyxjQUFTLEdBQXVDO1lBQ3JELFdBQVcsRUFBRSxLQUFLO1NBQ1osQ0FBQTtRQUVELGNBQVMsR0FBYSxFQUFFLENBQUE7UUFFeEIsV0FBTSxHQUFHLEVBQW1CLENBQUE7UUFFNUIsZUFBVSxHQUFzQixFQUFFLENBQUE7UUFHdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7UUFFNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUIsQ0FBQztJQUVELHFDQUFxQztJQUNyQyxvQ0FBb0M7SUFDcEMsa0NBQWtDO0lBQ2xDLElBQUksQ0FBRSxJQUFTLEVBQUUsVUFBbUI7UUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUV4QyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUE7WUFFbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDaEMsQ0FBQyxDQUFDLENBQUE7UUFFRiwyQkFBMkI7UUFDM0IsMEJBQTBCO1FBQzFCLG1CQUFtQjtRQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQVEsQ0FBQTtJQUN0RCxDQUFDO0lBRUQsK0JBQStCO0lBQy9CLEdBQUcsQ0FBRSxPQUF1QjtRQUMxQixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBO1FBRWpDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQUUsT0FBTTtRQUU3Qyx3Q0FBd0M7UUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQVcsQ0FBQyxDQUFBO1FBQ2hFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQy9CLENBQUM7O0FBM0RNLGVBQU8sR0FBRyxPQUFPLENBQUE7QUFFakIsaUJBQVMsR0FBRyxLQUFLLENBQUE7QUFFakIsZUFBTyxHQUFHLG1CQUFtQixDQUFBO0FBRTdCLGNBQU0sR0FBRztJQUNkLE1BQU0sRUFBRSxLQUFLO0NBQ2QsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGluc3RhbGwgfSBmcm9tICcuL2luc3RhbGwnXG5cbi8vIFR5cGVzXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCB7XG4gIFVzZXJWdWV0aWZ5UHJlc2V0LFxuICBWdWV0aWZ5UHJlc2V0LFxufSBmcm9tICd2dWV0aWZ5L3R5cGVzL3NlcnZpY2VzL3ByZXNldHMnXG5pbXBvcnQge1xuICBWdWV0aWZ5U2VydmljZSxcbiAgVnVldGlmeVNlcnZpY2VDb250cmFjdCxcbn0gZnJvbSAndnVldGlmeS90eXBlcy9zZXJ2aWNlcydcblxuLy8gU2VydmljZXNcbmltcG9ydCAqIGFzIHNlcnZpY2VzIGZyb20gJy4vc2VydmljZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZ1ZXRpZnkge1xuICBzdGF0aWMgaW5zdGFsbCA9IGluc3RhbGxcblxuICBzdGF0aWMgaW5zdGFsbGVkID0gZmFsc2VcblxuICBzdGF0aWMgdmVyc2lvbiA9IF9fVlVFVElGWV9WRVJTSU9OX19cblxuICBzdGF0aWMgY29uZmlnID0ge1xuICAgIHNpbGVudDogZmFsc2UsXG4gIH1cblxuICBwdWJsaWMgZnJhbWV3b3JrOiBEaWN0aW9uYXJ5PFZ1ZXRpZnlTZXJ2aWNlQ29udHJhY3Q+ID0ge1xuICAgIGlzSHlkcmF0aW5nOiBmYWxzZSxcbiAgfSBhcyBhbnlcblxuICBwdWJsaWMgaW5zdGFsbGVkOiBzdHJpbmdbXSA9IFtdXG5cbiAgcHVibGljIHByZXNldCA9IHt9IGFzIFZ1ZXRpZnlQcmVzZXRcblxuICBwdWJsaWMgdXNlclByZXNldDogVXNlclZ1ZXRpZnlQcmVzZXQgPSB7fVxuXG4gIGNvbnN0cnVjdG9yICh1c2VyUHJlc2V0OiBVc2VyVnVldGlmeVByZXNldCA9IHt9KSB7XG4gICAgdGhpcy51c2VyUHJlc2V0ID0gdXNlclByZXNldFxuXG4gICAgdGhpcy51c2Uoc2VydmljZXMuUHJlc2V0cylcbiAgICB0aGlzLnVzZShzZXJ2aWNlcy5BcHBsaWNhdGlvbilcbiAgICB0aGlzLnVzZShzZXJ2aWNlcy5CcmVha3BvaW50KVxuICAgIHRoaXMudXNlKHNlcnZpY2VzLkdvdG8pXG4gICAgdGhpcy51c2Uoc2VydmljZXMuSWNvbnMpXG4gICAgdGhpcy51c2Uoc2VydmljZXMuTGFuZylcbiAgICB0aGlzLnVzZShzZXJ2aWNlcy5UaGVtZSlcbiAgfVxuXG4gIC8vIENhbGxlZCBvbiB0aGUgbmV3IHZ1ZXRpZnkgaW5zdGFuY2VcbiAgLy8gYm9vdHN0cmFwIGluIGluc3RhbGwgYmVmb3JlQ3JlYXRlXG4gIC8vIEV4cG9zZXMgc3NyQ29udGV4dCBpZiBhdmFpbGFibGVcbiAgaW5pdCAocm9vdDogVnVlLCBzc3JDb250ZXh0Pzogb2JqZWN0KSB7XG4gICAgdGhpcy5pbnN0YWxsZWQuZm9yRWFjaChwcm9wZXJ0eSA9PiB7XG4gICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5mcmFtZXdvcmtbcHJvcGVydHldXG5cbiAgICAgIHNlcnZpY2UuZnJhbWV3b3JrID0gdGhpcy5mcmFtZXdvcmtcblxuICAgICAgc2VydmljZS5pbml0KHJvb3QsIHNzckNvbnRleHQpXG4gICAgfSlcblxuICAgIC8vIHJ0bCBpcyBub3QgaW5zdGFsbGVkIGFuZFxuICAgIC8vIHdpbGwgbmV2ZXIgYmUgY2FsbGVkIGJ5XG4gICAgLy8gdGhlIGluaXQgcHJvY2Vzc1xuICAgIHRoaXMuZnJhbWV3b3JrLnJ0bCA9IEJvb2xlYW4odGhpcy5wcmVzZXQucnRsKSBhcyBhbnlcbiAgfVxuXG4gIC8vIEluc3RhbnRpYXRlIGEgVnVldGlmeVNlcnZpY2VcbiAgdXNlIChTZXJ2aWNlOiBWdWV0aWZ5U2VydmljZSkge1xuICAgIGNvbnN0IHByb3BlcnR5ID0gU2VydmljZS5wcm9wZXJ0eVxuXG4gICAgaWYgKHRoaXMuaW5zdGFsbGVkLmluY2x1ZGVzKHByb3BlcnR5KSkgcmV0dXJuXG5cbiAgICAvLyBUT0RPIG1heWJlIGEgc3BlY2lmaWMgdHlwZSBmb3IgYXJnIDI/XG4gICAgdGhpcy5mcmFtZXdvcmtbcHJvcGVydHldID0gbmV3IFNlcnZpY2UodGhpcy5wcmVzZXQsIHRoaXMgYXMgYW55KVxuICAgIHRoaXMuaW5zdGFsbGVkLnB1c2gocHJvcGVydHkpXG4gIH1cbn1cbiJdfQ==
// Extensions
import { Service } from '../service';
export class Breakpoint extends Service {
    constructor(preset) {
        super();
        // Public
        this.xs = false;
        this.sm = false;
        this.md = false;
        this.lg = false;
        this.xl = false;
        this.xsOnly = false;
        this.smOnly = false;
        this.smAndDown = false;
        this.smAndUp = false;
        this.mdOnly = false;
        this.mdAndDown = false;
        this.mdAndUp = false;
        this.lgOnly = false;
        this.lgAndDown = false;
        this.lgAndUp = false;
        this.xlOnly = false;
        // Value is xs to match v2.x functionality
        this.name = 'xs';
        this.height = 0;
        this.width = 0;
        // TODO: Add functionality to detect this dynamically in v3
        // Value is true to match v2.x functionality
        this.mobile = true;
        this.resizeTimeout = 0;
        const { mobileBreakpoint, scrollBarWidth, thresholds, } = preset[Breakpoint.property];
        this.mobileBreakpoint = mobileBreakpoint;
        this.scrollBarWidth = scrollBarWidth;
        this.thresholds = thresholds;
    }
    init() {
        this.update();
        /* istanbul ignore if */
        if (typeof window === 'undefined')
            return;
        window.addEventListener('resize', this.onResize.bind(this), { passive: true });
    }
    /* eslint-disable-next-line max-statements */
    update(ssr = false) {
        const height = ssr ? 0 : this.getClientHeight();
        const width = ssr ? 0 : this.getClientWidth();
        const xs = width < this.thresholds.xs;
        const sm = width < this.thresholds.sm && !xs;
        const md = width < (this.thresholds.md - this.scrollBarWidth) && !(sm || xs);
        const lg = width < (this.thresholds.lg - this.scrollBarWidth) && !(md || sm || xs);
        const xl = width >= (this.thresholds.lg - this.scrollBarWidth);
        this.height = height;
        this.width = width;
        this.xs = xs;
        this.sm = sm;
        this.md = md;
        this.lg = lg;
        this.xl = xl;
        this.xsOnly = xs;
        this.smOnly = sm;
        this.smAndDown = (xs || sm) && !(md || lg || xl);
        this.smAndUp = !xs && (sm || md || lg || xl);
        this.mdOnly = md;
        this.mdAndDown = (xs || sm || md) && !(lg || xl);
        this.mdAndUp = !(xs || sm) && (md || lg || xl);
        this.lgOnly = lg;
        this.lgAndDown = (xs || sm || md || lg) && !xl;
        this.lgAndUp = !(xs || sm || md) && (lg || xl);
        this.xlOnly = xl;
        switch (true) {
            case (xs):
                this.name = 'xs';
                break;
            case (sm):
                this.name = 'sm';
                break;
            case (md):
                this.name = 'md';
                break;
            case (lg):
                this.name = 'lg';
                break;
            default:
                this.name = 'xl';
                break;
        }
        if (typeof this.mobileBreakpoint === 'number') {
            this.mobile = width < parseInt(this.mobileBreakpoint, 10);
            return;
        }
        const breakpoints = {
            xs: 0,
            sm: 1,
            md: 2,
            lg: 3,
            xl: 4,
        };
        const current = breakpoints[this.name];
        const max = breakpoints[this.mobileBreakpoint];
        this.mobile = current <= max;
    }
    onResize() {
        clearTimeout(this.resizeTimeout);
        // Added debounce to match what
        // v-resize used to do but was
        // removed due to a memory leak
        // https://github.com/vuetifyjs/vuetify/pull/2997
        this.resizeTimeout = window.setTimeout(this.update.bind(this), 200);
    }
    // Cross-browser support as described in:
    // https://stackoverflow.com/questions/1248081
    getClientWidth() {
        /* istanbul ignore if */
        if (typeof document === 'undefined')
            return 0; // SSR
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    getClientHeight() {
        /* istanbul ignore if */
        if (typeof document === 'undefined')
            return 0; // SSR
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
}
Breakpoint.property = 'breakpoint';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvYnJlYWtwb2ludC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxhQUFhO0FBQ2IsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQTtBQU1wQyxNQUFNLE9BQU8sVUFBVyxTQUFRLE9BQU87SUF1RHJDLFlBQWEsTUFBcUI7UUFDaEMsS0FBSyxFQUFFLENBQUE7UUFyRFQsU0FBUztRQUNGLE9BQUUsR0FBRyxLQUFLLENBQUE7UUFFVixPQUFFLEdBQUcsS0FBSyxDQUFBO1FBRVYsT0FBRSxHQUFHLEtBQUssQ0FBQTtRQUVWLE9BQUUsR0FBRyxLQUFLLENBQUE7UUFFVixPQUFFLEdBQUcsS0FBSyxDQUFBO1FBRVYsV0FBTSxHQUFHLEtBQUssQ0FBQTtRQUVkLFdBQU0sR0FBRyxLQUFLLENBQUE7UUFFZCxjQUFTLEdBQUcsS0FBSyxDQUFBO1FBRWpCLFlBQU8sR0FBRyxLQUFLLENBQUE7UUFFZixXQUFNLEdBQUcsS0FBSyxDQUFBO1FBRWQsY0FBUyxHQUFHLEtBQUssQ0FBQTtRQUVqQixZQUFPLEdBQUcsS0FBSyxDQUFBO1FBRWYsV0FBTSxHQUFHLEtBQUssQ0FBQTtRQUVkLGNBQVMsR0FBRyxLQUFLLENBQUE7UUFFakIsWUFBTyxHQUFHLEtBQUssQ0FBQTtRQUVmLFdBQU0sR0FBRyxLQUFLLENBQUE7UUFFckIsMENBQTBDO1FBQ25DLFNBQUksR0FBd0IsSUFBSSxDQUFBO1FBRWhDLFdBQU0sR0FBRyxDQUFDLENBQUE7UUFFVixVQUFLLEdBQUcsQ0FBQyxDQUFBO1FBRWhCLDJEQUEyRDtRQUMzRCw0Q0FBNEM7UUFDckMsV0FBTSxHQUFHLElBQUksQ0FBQTtRQVFaLGtCQUFhLEdBQUcsQ0FBQyxDQUFBO1FBS3ZCLE1BQU0sRUFDSixnQkFBZ0IsRUFDaEIsY0FBYyxFQUNkLFVBQVUsR0FDWCxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7UUFFL0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFBO1FBQ3hDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBO1FBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0lBQzlCLENBQUM7SUFFTSxJQUFJO1FBQ1QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBRWIsd0JBQXdCO1FBQ3hCLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVztZQUFFLE9BQU07UUFFekMsTUFBTSxDQUFDLGdCQUFnQixDQUNyQixRQUFRLEVBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3hCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUNsQixDQUFBO0lBQ0gsQ0FBQztJQUVELDZDQUE2QztJQUN0QyxNQUFNLENBQUUsR0FBRyxHQUFHLEtBQUs7UUFDeEIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUMvQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBRTdDLE1BQU0sRUFBRSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQTtRQUNyQyxNQUFNLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUE7UUFDNUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7UUFDNUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQ2xGLE1BQU0sRUFBRSxHQUFHLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUU5RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtRQUVsQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNaLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ1osSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDWixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNaLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBRVosSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7UUFDaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7UUFDNUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7UUFDaEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJ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cnQgeyBTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZSdcblxuLy8gVHlwZXNcbmltcG9ydCB7IFZ1ZXRpZnlQcmVzZXQgfSBmcm9tICd2dWV0aWZ5L3R5cGVzL3NlcnZpY2VzL3ByZXNldHMnXG5pbXBvcnQgeyBCcmVha3BvaW50IGFzIElCcmVha3BvaW50IH0gZnJvbSAndnVldGlmeS90eXBlcy9zZXJ2aWNlcy9icmVha3BvaW50J1xuXG5leHBvcnQgY2xhc3MgQnJlYWtwb2ludCBleHRlbmRzIFNlcnZpY2UgaW1wbGVtZW50cyBJQnJlYWtwb2ludCB7XG4gIHB1YmxpYyBzdGF0aWMgcHJvcGVydHk6ICdicmVha3BvaW50JyA9ICdicmVha3BvaW50J1xuXG4gIC8vIFB1YmxpY1xuICBwdWJsaWMgeHMgPSBmYWxzZVxuXG4gIHB1YmxpYyBzbSA9IGZhbHNlXG5cbiAgcHVibGljIG1kID0gZmFsc2VcblxuICBwdWJsaWMgbGcgPSBmYWxzZVxuXG4gIHB1YmxpYyB4bCA9IGZhbHNlXG5cbiAgcHVibGljIHhzT25seSA9IGZhbHNlXG5cbiAgcHVibGljIHNtT25seSA9IGZhbHNlXG5cbiAgcHVibGljIHNtQW5kRG93biA9IGZhbHNlXG5cbiAgcHVibGljIHNtQW5kVXAgPSBmYWxzZVxuXG4gIHB1YmxpYyBtZE9ubHkgPSBmYWxzZVxuXG4gIHB1YmxpYyBtZEFuZERvd24gPSBmYWxzZVxuXG4gIHB1YmxpYyBtZEFuZFVwID0gZmFsc2VcblxuICBwdWJsaWMgbGdPbmx5ID0gZmFsc2VcblxuICBwdWJsaWMgbGdBbmREb3duID0gZmFsc2VcblxuICBwdWJsaWMgbGdBbmRVcCA9IGZhbHNlXG5cbiAgcHVibGljIHhsT25seSA9IGZhbHNlXG5cbiAgLy8gVmFsdWUgaXMgeHMgdG8gbWF0Y2ggdjIueCBmdW5jdGlvbmFsaXR5XG4gIHB1YmxpYyBuYW1lOiBJQnJlYWtwb2ludFsnbmFtZSddID0gJ3hzJ1xuXG4gIHB1YmxpYyBoZWlnaHQgPSAwXG5cbiAgcHVibGljIHdpZHRoID0gMFxuXG4gIC8vIFRPRE86IEFkZCBmdW5jdGlvbmFsaXR5IHRvIGRldGVjdCB0aGlzIGR5bmFtaWNhbGx5IGluIHYzXG4gIC8vIFZhbHVlIGlzIHRydWUgdG8gbWF0Y2ggdjIueCBmdW5jdGlvbmFsaXR5XG4gIHB1YmxpYyBtb2JpbGUgPSB0cnVlXG5cbiAgcHVibGljIG1vYmlsZUJyZWFrcG9pbnQ6IElCcmVha3BvaW50Wydtb2JpbGVCcmVha3BvaW50J11cblxuICBwdWJsaWMgdGhyZXNob2xkczogSUJyZWFrcG9pbnRbJ3RocmVzaG9sZHMnXVxuXG4gIHB1YmxpYyBzY3JvbGxCYXJXaWR0aDogSUJyZWFrcG9pbnRbJ3Njcm9sbEJhcldpZHRoJ11cblxuICBwcml2YXRlIHJlc2l6ZVRpbWVvdXQgPSAwXG5cbiAgY29uc3RydWN0b3IgKHByZXNldDogVnVldGlmeVByZXNldCkge1xuICAgIHN1cGVyKClcblxuICAgIGNvbnN0IHtcbiAgICAgIG1vYmlsZUJyZWFrcG9pbnQsXG4gICAgICBzY3JvbGxCYXJXaWR0aCxcbiAgICAgIHRocmVzaG9sZHMsXG4gICAgfSA9IHByZXNldFtCcmVha3BvaW50LnByb3BlcnR5XVxuXG4gICAgdGhpcy5tb2JpbGVCcmVha3BvaW50ID0gbW9iaWxlQnJlYWtwb2ludFxuICAgIHRoaXMuc2Nyb2xsQmFyV2lkdGggPSBzY3JvbGxCYXJXaWR0aFxuICAgIHRoaXMudGhyZXNob2xkcyA9IHRocmVzaG9sZHNcbiAgfVxuXG4gIHB1YmxpYyBpbml0ICgpIHtcbiAgICB0aGlzLnVwZGF0ZSgpXG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAncmVzaXplJyxcbiAgICAgIHRoaXMub25SZXNpemUuYmluZCh0aGlzKSxcbiAgICAgIHsgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgKVxuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1zdGF0ZW1lbnRzICovXG4gIHB1YmxpYyB1cGRhdGUgKHNzciA9IGZhbHNlKSB7XG4gICAgY29uc3QgaGVpZ2h0ID0gc3NyID8gMCA6IHRoaXMuZ2V0Q2xpZW50SGVpZ2h0KClcbiAgICBjb25zdCB3aWR0aCA9IHNzciA/IDAgOiB0aGlzLmdldENsaWVudFdpZHRoKClcblxuICAgIGNvbnN0IHhzID0gd2lkdGggPCB0aGlzLnRocmVzaG9sZHMueHNcbiAgICBjb25zdCBzbSA9IHdpZHRoIDwgdGhpcy50aHJlc2hvbGRzLnNtICYmICF4c1xuICAgIGNvbnN0IG1kID0gd2lkdGggPCAodGhpcy50aHJlc2hvbGRzLm1kIC0gdGhpcy5zY3JvbGxCYXJXaWR0aCkgJiYgIShzbSB8fCB4cylcbiAgICBjb25zdCBsZyA9IHdpZHRoIDwgKHRoaXMudGhyZXNob2xkcy5sZyAtIHRoaXMuc2Nyb2xsQmFyV2lkdGgpICYmICEobWQgfHwgc20gfHwgeHMpXG4gICAgY29uc3QgeGwgPSB3aWR0aCA+PSAodGhpcy50aHJlc2hvbGRzLmxnIC0gdGhpcy5zY3JvbGxCYXJXaWR0aClcblxuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoXG5cbiAgICB0aGlzLnhzID0geHNcbiAgICB0aGlzLnNtID0gc21cbiAgICB0aGlzLm1kID0gbWRcbiAgICB0aGlzLmxnID0gbGdcbiAgICB0aGlzLnhsID0geGxcblxuICAgIHRoaXMueHNPbmx5ID0geHNcbiAgICB0aGlzLnNtT25seSA9IHNtXG4gICAgdGhpcy5zbUFuZERvd24gPSAoeHMgfHwgc20pICYmICEobWQgfHwgbGcgfHwgeGwpXG4gICAgdGhpcy5zbUFuZFVwID0gIXhzICYmIChzbSB8fCBtZCB8fCBsZyB8fCB4bClcbiAgICB0aGlzLm1kT25seSA9IG1kXG4gICAgdGhpcy5tZEFuZERvd24gPSAoeHMgfHwgc20gfHwgbWQpICYmICEobGcgfHwgeGwpXG4gICAgdGhpcy5tZEFuZFVwID0gISh4cyB8fCBzbSkgJiYgKG1kIHx8IGxnIHx8IHhsKVxuICAgIHRoaXMubGdPbmx5ID0gbGdcbiAgICB0aGlzLmxnQW5kRG93biA9ICh4cyB8fCBzbSB8fCBtZCB8fCBsZykgJiYgIXhsXG4gICAgdGhpcy5sZ0FuZFVwID0gISh4cyB8fCBzbSB8fCBtZCkgJiYgKGxnIHx8IHhsKVxuICAgIHRoaXMueGxPbmx5ID0geGxcblxuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgY2FzZSAoeHMpOlxuICAgICAgICB0aGlzLm5hbWUgPSAneHMnXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIChzbSk6XG4gICAgICAgIHRoaXMubmFtZSA9ICdzbSdcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgKG1kKTpcbiAgICAgICAgdGhpcy5uYW1lID0gJ21kJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAobGcpOlxuICAgICAgICB0aGlzLm5hbWUgPSAnbGcnXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLm5hbWUgPSAneGwnXG4gICAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLm1vYmlsZUJyZWFrcG9pbnQgPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLm1vYmlsZSA9IHdpZHRoIDwgcGFyc2VJbnQodGhpcy5tb2JpbGVCcmVha3BvaW50LCAxMClcblxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgYnJlYWtwb2ludHMgPSB7XG4gICAgICB4czogMCxcbiAgICAgIHNtOiAxLFxuICAgICAgbWQ6IDIsXG4gICAgICBsZzogMyxcbiAgICAgIHhsOiA0LFxuICAgIH0gYXMgY29uc3RcblxuICAgIGNvbnN0IGN1cnJlbnQgPSBicmVha3BvaW50c1t0aGlzLm5hbWVdXG4gICAgY29uc3QgbWF4ID0gYnJlYWtwb2ludHNbdGhpcy5tb2JpbGVCcmVha3BvaW50XVxuXG4gICAgdGhpcy5tb2JpbGUgPSBjdXJyZW50IDw9IG1heFxuICB9XG5cbiAgcHJpdmF0ZSBvblJlc2l6ZSAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucmVzaXplVGltZW91dClcblxuICAgIC8vIEFkZGVkIGRlYm91bmNlIHRvIG1hdGNoIHdoYXRcbiAgICAvLyB2LXJlc2l6ZSB1c2VkIHRvIGRvIGJ1dCB3YXNcbiAgICAvLyByZW1vdmVkIGR1ZSB0byBhIG1lbW9yeSBsZWFrXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZXRpZnlqcy92dWV0aWZ5L3B1bGwvMjk5N1xuICAgIHRoaXMucmVzaXplVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMudXBkYXRlLmJpbmQodGhpcyksIDIwMClcbiAgfVxuXG4gIC8vIENyb3NzLWJyb3dzZXIgc3VwcG9ydCBhcyBkZXNjcmliZWQgaW46XG4gIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyNDgwODFcbiAgcHJpdmF0ZSBnZXRDbGllbnRXaWR0aCAoKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiAwIC8vIFNTUlxuICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCEuY2xpZW50V2lkdGgsXG4gICAgICB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRDbGllbnRIZWlnaHQgKCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gMCAvLyBTU1JcbiAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQhLmNsaWVudEhlaWdodCxcbiAgICAgIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwXG4gICAgKVxuICB9XG59XG4iXX0=
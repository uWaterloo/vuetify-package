import Vue from 'vue';
export default Vue.extend({
    name: 'mouse',
    methods: {
        getDefaultMouseEventHandlers(suffix, getEvent) {
            return this.getMouseEventHandlers({
                ['click' + suffix]: { event: 'click' },
                ['contextmenu' + suffix]: { event: 'contextmenu', prevent: true, result: false },
                ['mousedown' + suffix]: { event: 'mousedown' },
                ['mousemove' + suffix]: { event: 'mousemove' },
                ['mouseup' + suffix]: { event: 'mouseup' },
                ['mouseenter' + suffix]: { event: 'mouseenter' },
                ['mouseleave' + suffix]: { event: 'mouseleave' },
                ['touchstart' + suffix]: { event: 'touchstart' },
                ['touchmove' + suffix]: { event: 'touchmove' },
                ['touchend' + suffix]: { event: 'touchend' },
            }, getEvent);
        },
        getMouseEventHandlers(events, getEvent) {
            const on = {};
            for (const event in events) {
                const eventOptions = events[event];
                if (!this.$listeners[event])
                    continue;
                // TODO somehow pull in modifiers
                const prefix = eventOptions.passive ? '&' : ((eventOptions.once ? '~' : '') + (eventOptions.capture ? '!' : ''));
                const key = prefix + eventOptions.event;
                const handler = e => {
                    const mouseEvent = e;
                    if (eventOptions.button === undefined || (mouseEvent.buttons > 0 && mouseEvent.button === eventOptions.button)) {
                        if (eventOptions.prevent) {
                            e.preventDefault();
                        }
                        if (eventOptions.stop) {
                            e.stopPropagation();
                        }
                        // Due to TouchEvent target always returns the element that is first placed
                        // Even if touch point has since moved outside the interactive area of that element
                        // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Touch/target
                        // This block of code aims to make sure touchEvent is always dispatched from the element that is being pointed at
                        if (e && 'touches' in e) {
                            const classSeparator = ' ';
                            const eventTargetClasses = e.currentTarget?.className.split(classSeparator);
                            const currentTargets = document.elementsFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                            // Get "the same kind" current hovering target by checking
                            // If element has the same class of initial touch start element (which has touch event listener registered)
                            const currentTarget = currentTargets.find(t => t.className.split(classSeparator).some(c => eventTargetClasses.includes(c)));
                            if (currentTarget &&
                                !e.target?.isSameNode(currentTarget)) {
                                currentTarget.dispatchEvent(new TouchEvent(e.type, {
                                    changedTouches: e.changedTouches,
                                    targetTouches: e.targetTouches,
                                    touches: e.touches,
                                }));
                                return;
                            }
                        }
                        this.$emit(event, getEvent(e), e);
                    }
                    return eventOptions.result;
                };
                if (key in on) {
                    /* istanbul ignore next */
                    if (Array.isArray(on[key])) {
                        on[key].push(handler);
                    }
                    else {
                        on[key] = [on[key], handler];
                    }
                }
                else {
                    on[key] = handler;
                }
            }
            return on;
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW91c2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ2FsZW5kYXIvbWl4aW5zL21vdXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQXFCckIsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxPQUFPO0lBRWIsT0FBTyxFQUFFO1FBQ1AsNEJBQTRCLENBQUUsTUFBYyxFQUFFLFFBQXNCO1lBQ2xFLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDO2dCQUNoQyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUU7Z0JBQ3RDLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7Z0JBQ2hGLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtnQkFDOUMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFO2dCQUM5QyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7Z0JBQzFDLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRTtnQkFDaEQsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFO2dCQUNoRCxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUU7Z0JBQ2hELENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtn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LFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtxQkFDbEM7b0JBRUQsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFBO2dCQUM1QixDQUFDLENBQUE7Z0JBRUQsSUFBSSxHQUFHLElBQUksRUFBRSxFQUFFO29CQUNiLDBCQUEwQjtvQkFDMUIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO3dCQUN6QixFQUFFLENBQUMsR0FBRyxDQUFvQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtxQkFDMUM7eUJBQU07d0JBQ0wsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBbUIsQ0FBQTtxQkFDL0M7aUJBQ0Y7cUJBQU07b0JBQ0wsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtpQkFDbEI7YUFDRjtZQUVELE9BQU8sRUFBRSxDQUFBO1FBQ1gsQ0FBQztLQUNGO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5cbmV4cG9ydCB0eXBlIE1vdXNlSGFuZGxlciA9IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4gYW55XG5cbmV4cG9ydCB0eXBlIE1vdXNlRXZlbnRzID0ge1xuICBbZXZlbnQ6IHN0cmluZ106IHtcbiAgICBldmVudDogc3RyaW5nXG4gICAgcGFzc2l2ZT86IGJvb2xlYW5cbiAgICBjYXB0dXJlPzogYm9vbGVhblxuICAgIG9uY2U/OiBib29sZWFuXG4gICAgc3RvcD86IGJvb2xlYW5cbiAgICBwcmV2ZW50PzogYm9vbGVhblxuICAgIGJ1dHRvbj86IG51bWJlclxuICAgIHJlc3VsdD86IGFueVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIE1vdXNlRXZlbnRzTWFwID0ge1xuICBbZXZlbnQ6IHN0cmluZ106IE1vdXNlSGFuZGxlciB8IE1vdXNlSGFuZGxlcltdXG59XG5cbmV4cG9ydCBkZWZhdWx0IFZ1ZS5leHRlbmQoe1xuICBuYW1lOiAnbW91c2UnLFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZXREZWZhdWx0TW91c2VFdmVudEhhbmRsZXJzIChzdWZmaXg6IHN0cmluZywgZ2V0RXZlbnQ6IE1vdXNlSGFuZGxlcik6IE1vdXNlRXZlbnRzTWFwIHtcbiAgICAgIHJldHVybiB0aGlzLmdldE1vdXNlRXZlbnRIYW5kbGVycyh7XG4gICAgICAgIFsnY2xpY2snICsgc3VmZml4XTogeyBldmVudDogJ2NsaWNrJyB9LFxuICAgICAgICBbJ2NvbnRleHRtZW51JyArIHN1ZmZpeF06IHsgZXZlbnQ6ICdjb250ZXh0bWVudScsIHByZXZlbnQ6IHRydWUsIHJlc3VsdDogZmFsc2UgfSxcbiAgICAgICAgWydtb3VzZWRvd24nICsgc3VmZml4XTogeyBldmVudDogJ21vdXNlZG93bicgfSxcbiAgICAgICAgWydtb3VzZW1vdmUnICsgc3VmZml4XTogeyBldmVudDogJ21vdXNlbW92ZScgfSxcbiAgICAgICAgWydtb3VzZXVwJyArIHN1ZmZpeF06IHsgZXZlbnQ6ICdtb3VzZXVwJyB9LFxuICAgICAgICBbJ21vdXNlZW50ZXInICsgc3VmZml4XTogeyBldmVudDogJ21vdXNlZW50ZXInIH0sXG4gICAgICAgIFsnbW91c2VsZWF2ZScgKyBzdWZmaXhdOiB7IGV2ZW50OiAnbW91c2VsZWF2ZScgfSxcbiAgICAgICAgWyd0b3VjaHN0YXJ0JyArIHN1ZmZpeF06IHsgZXZlbnQ6ICd0b3VjaHN0YXJ0JyB9LFxuICAgICAgICBbJ3RvdWNobW92ZScgKyBzdWZmaXhdOiB7IGV2ZW50OiAndG91Y2htb3ZlJyB9LFxuICAgICAgICBbJ3RvdWNoZW5kJyArIHN1ZmZpeF06IHsgZXZlbnQ6ICd0b3VjaGVuZCcgfSxcbiAgICAgIH0sIGdldEV2ZW50KVxuICAgIH0sXG4gICAgZ2V0TW91c2VFdmVudEhhbmRsZXJzIChldmVudHM6IE1vdXNlRXZlbnRzLCBnZXRFdmVudDogTW91c2VIYW5kbGVyKTogTW91c2VFdmVudHNNYXAge1xuICAgICAgY29uc3Qgb246IE1vdXNlRXZlbnRzTWFwID0ge31cblxuICAgICAgZm9yIChjb25zdCBldmVudCBpbiBldmVudHMpIHtcbiAgICAgICAgY29uc3QgZXZlbnRPcHRpb25zID0gZXZlbnRzW2V2ZW50XVxuXG4gICAgICAgIGlmICghdGhpcy4kbGlzdGVuZXJzW2V2ZW50XSkgY29udGludWVcblxuICAgICAgICAvLyBUT0RPIHNvbWVob3cgcHVsbCBpbiBtb2RpZmllcnNcblxuICAgICAgICBjb25zdCBwcmVmaXggPSBldmVudE9wdGlvbnMucGFzc2l2ZSA/ICcmJyA6ICgoZXZlbnRPcHRpb25zLm9uY2UgPyAnficgOiAnJykgKyAoZXZlbnRPcHRpb25zLmNhcHR1cmUgPyAnIScgOiAnJykpXG4gICAgICAgIGNvbnN0IGtleSA9IHByZWZpeCArIGV2ZW50T3B0aW9ucy5ldmVudFxuXG4gICAgICAgIGNvbnN0IGhhbmRsZXI6IE1vdXNlSGFuZGxlciA9IGUgPT4ge1xuICAgICAgICAgIGNvbnN0IG1vdXNlRXZlbnQ6IE1vdXNlRXZlbnQgPSBlIGFzIE1vdXNlRXZlbnRcbiAgICAgICAgICBpZiAoZXZlbnRPcHRpb25zLmJ1dHRvbiA9PT0gdW5kZWZpbmVkIHx8IChtb3VzZUV2ZW50LmJ1dHRvbnMgPiAwICYmIG1vdXNlRXZlbnQuYnV0dG9uID09PSBldmVudE9wdGlvbnMuYnV0dG9uKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50T3B0aW9ucy5wcmV2ZW50KSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50T3B0aW9ucy5zdG9wKSB7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRHVlIHRvIFRvdWNoRXZlbnQgdGFyZ2V0IGFsd2F5cyByZXR1cm5zIHRoZSBlbGVtZW50IHRoYXQgaXMgZmlyc3QgcGxhY2VkXG4gICAgICAgICAgICAvLyBFdmVuIGlmIHRvdWNoIHBvaW50IGhhcyBzaW5jZSBtb3ZlZCBvdXRzaWRlIHRoZSBpbnRlcmFjdGl2ZSBhcmVhIG9mIHRoYXQgZWxlbWVudFxuICAgICAgICAgICAgLy8gUmVmOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvVG91Y2gvdGFyZ2V0XG4gICAgICAgICAgICAvLyBUaGlzIGJsb2NrIG9mIGNvZGUgYWltcyB0byBtYWtlIHN1cmUgdG91Y2hFdmVudCBpcyBhbHdheXMgZGlzcGF0Y2hlZCBmcm9tIHRoZSBlbGVtZW50IHRoYXQgaXMgYmVpbmcgcG9pbnRlZCBhdFxuICAgICAgICAgICAgaWYgKGUgJiYgJ3RvdWNoZXMnIGluIGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2xhc3NTZXBhcmF0b3IgPSAnICdcblxuICAgICAgICAgICAgICBjb25zdCBldmVudFRhcmdldENsYXNzZXMgPSAoZS5jdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50KT8uY2xhc3NOYW1lLnNwbGl0KGNsYXNzU2VwYXJhdG9yKVxuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0cyA9IGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCwgZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZKVxuXG4gICAgICAgICAgICAgIC8vIEdldCBcInRoZSBzYW1lIGtpbmRcIiBjdXJyZW50IGhvdmVyaW5nIHRhcmdldCBieSBjaGVja2luZ1xuICAgICAgICAgICAgICAvLyBJZiBlbGVtZW50IGhhcyB0aGUgc2FtZSBjbGFzcyBvZiBpbml0aWFsIHRvdWNoIHN0YXJ0IGVsZW1lbnQgKHdoaWNoIGhhcyB0b3VjaCBldmVudCBsaXN0ZW5lciByZWdpc3RlcmVkKVxuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0ID0gY3VycmVudFRhcmdldHMuZmluZCh0ID0+IHQuY2xhc3NOYW1lLnNwbGl0KGNsYXNzU2VwYXJhdG9yKS5zb21lKGMgPT4gZXZlbnRUYXJnZXRDbGFzc2VzLmluY2x1ZGVzKGMpKSlcblxuICAgICAgICAgICAgICBpZiAoY3VycmVudFRhcmdldCAmJlxuICAgICAgICAgICAgICAgICEoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpPy5pc1NhbWVOb2RlKGN1cnJlbnRUYXJnZXQpXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgVG91Y2hFdmVudChlLnR5cGUsIHtcbiAgICAgICAgICAgICAgICAgIGNoYW5nZWRUb3VjaGVzOiBlLmNoYW5nZWRUb3VjaGVzIGFzIHVua25vd24gYXMgVG91Y2hbXSxcbiAgICAgICAgICAgICAgICAgIHRhcmdldFRvdWNoZXM6IGUudGFyZ2V0VG91Y2hlcyBhcyB1bmtub3duIGFzIFRvdWNoW10sXG4gICAgICAgICAgICAgICAgICB0b3VjaGVzOiBlLnRvdWNoZXMgYXMgdW5rbm93biBhcyBUb3VjaFtdLFxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJGVtaXQoZXZlbnQsIGdldEV2ZW50KGUpLCBlKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBldmVudE9wdGlvbnMucmVzdWx0XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5IGluIG9uKSB7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvbltrZXldKSkge1xuICAgICAgICAgICAgKG9uW2tleV0gYXMgTW91c2VIYW5kbGVyW10pLnB1c2goaGFuZGxlcilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb25ba2V5XSA9IFtvbltrZXldLCBoYW5kbGVyXSBhcyBNb3VzZUhhbmRsZXJbXVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvbltrZXldID0gaGFuZGxlclxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvblxuICAgIH0sXG4gIH0sXG59KVxuIl19
import { createSimpleTransition, createJavascriptTransition, } from './createTransition';
import ExpandTransitionGenerator from './expand-transition';
// Component specific transitions
export const VCarouselTransition = createSimpleTransition('carousel-transition');
export const VCarouselReverseTransition = createSimpleTransition('carousel-reverse-transition');
export const VTabTransition = createSimpleTransition('tab-transition');
export const VTabReverseTransition = createSimpleTransition('tab-reverse-transition');
export const VMenuTransition = createSimpleTransition('menu-transition');
export const VFabTransition = createSimpleTransition('fab-transition', 'center center', 'out-in');
// Generic transitions
export const VDialogTransition = createSimpleTransition('dialog-transition');
export const VDialogBottomTransition = createSimpleTransition('dialog-bottom-transition');
export const VDialogTopTransition = createSimpleTransition('dialog-top-transition');
export const VFadeTransition = createSimpleTransition('fade-transition');
export const VScaleTransition = createSimpleTransition('scale-transition');
export const VScrollXTransition = createSimpleTransition('scroll-x-transition');
export const VScrollXReverseTransition = createSimpleTransition('scroll-x-reverse-transition');
export const VScrollYTransition = createSimpleTransition('scroll-y-transition');
export const VScrollYReverseTransition = createSimpleTransition('scroll-y-reverse-transition');
export const VSlideXTransition = createSimpleTransition('slide-x-transition');
export const VSlideXReverseTransition = createSimpleTransition('slide-x-reverse-transition');
export const VSlideYTransition = createSimpleTransition('slide-y-transition');
export const VSlideYReverseTransition = createSimpleTransition('slide-y-reverse-transition');
// Javascript transitions
export const VExpandTransition = createJavascriptTransition('expand-transition', ExpandTransitionGenerator());
export const VExpandXTransition = createJavascriptTransition('expand-x-transition', ExpandTransitionGenerator('', true));
export default {
    $_vuetify_subcomponents: {
        VCarouselTransition,
        VCarouselReverseTransition,
        VDialogTransition,
        VDialogBottomTransition,
        VDialogTopTransition,
        VFabTransition,
        VFadeTransition,
        VMenuTransition,
        VScaleTransition,
        VScrollXTransition,
        VScrollXReverseTransition,
        VScrollYTransition,
        VScrollYReverseTransition,
        VSlideXTransition,
        VSlideXReverseTransition,
        VSlideYTransition,
        VSlideYReverseTransition,
        VTabReverseTransition,
        VTabTransition,
        VExpandTransition,
        VExpandXTransition,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy90cmFuc2l0aW9ucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsc0JBQXNCLEVBQ3RCLDBCQUEwQixHQUMzQixNQUFNLG9CQUFvQixDQUFBO0FBRTNCLE9BQU8seUJBQXlCLE1BQU0scUJBQXFCLENBQUE7QUFFM0QsaUNBQWlDO0FBQ2pDLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFDaEYsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsc0JBQXNCLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtBQUMvRixNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUN0RSxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxzQkFBc0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0FBQ3JGLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQ3hFLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxzQkFBc0IsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFFakcsc0JBQXNCO0FBQ3RCLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDNUUsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsc0JBQXNCLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtBQUN6RixNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxzQkFBc0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO0FBQ25GLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQ3hFLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDLENBQUE7QUFDMUUsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsc0JBQXNCLENBQUMscUJBQXFCLENBQUMsQ0FBQTtBQUMvRSxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBRyxzQkFBc0IsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO0FBQzlGLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFDL0UsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsc0JBQXNCLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtBQUM5RixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQzdFLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLHNCQUFzQixDQUFDLDRCQUE0QixDQUFDLENBQUE7QUFDNUYsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUM3RSxNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRyxzQkFBc0IsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO0FBRTVGLHlCQUF5QjtBQUN6QixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRywwQkFBMEIsQ0FBQyxtQkFBbUIsRUFBRSx5QkFBeUIsRUFBRSxDQUFDLENBQUE7QUFDN0csTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsMEJBQTBCLENBQUMscUJBQXFCLEVBQUUseUJBQXlCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7QUFFeEgsZUFBZTtJQUNiLHVCQUF1QixFQUFFO1FBQ3ZCLG1CQUFtQjtRQUNuQiwwQkFBMEI7UUFDMUIsaUJBQWlCO1FBQ2pCLHVCQUF1QjtRQUN2QixvQkFBb0I7UUFDcEIsY0FBYztRQUNkLGVBQWU7UUFDZixlQUFlO1FBQ2YsZ0JBQWdCO1FBQ2hCLGtCQUFrQjtRQUNsQix5QkFBeUI7UUFDekIsa0JBQWtCO1FBQ2xCLHlCQUF5QjtRQUN6QixpQkFBaUI7UUFDakIsd0JBQXdCO1FBQ3hCLGlCQUFpQjtRQUNqQix3QkFBd0I7UUFDeEIscUJBQXFCO1FBQ3JCLGNBQWM7UUFDZCxpQkFBaUI7UUFDakIsa0JBQWtCO0tBQ25CO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGNyZWF0ZVNpbXBsZVRyYW5zaXRpb24sXG4gIGNyZWF0ZUphdmFzY3JpcHRUcmFuc2l0aW9uLFxufSBmcm9tICcuL2NyZWF0ZVRyYW5zaXRpb24nXG5cbmltcG9ydCBFeHBhbmRUcmFuc2l0aW9uR2VuZXJhdG9yIGZyb20gJy4vZXhwYW5kLXRyYW5zaXRpb24nXG5cbi8vIENvbXBvbmVudCBzcGVjaWZpYyB0cmFuc2l0aW9uc1xuZXhwb3J0IGNvbnN0IFZDYXJvdXNlbFRyYW5zaXRpb24gPSBjcmVhdGVTaW1wbGVUcmFuc2l0aW9uKCdjYXJvdXNlbC10cmFuc2l0aW9uJylcbmV4cG9ydCBjb25zdCBWQ2Fyb3VzZWxSZXZlcnNlVHJhbnNpdGlvbiA9IGNyZWF0ZVNpbXBsZVRyYW5zaXRpb24oJ2Nhcm91c2VsLXJldmVyc2UtdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVlRhYlRyYW5zaXRpb24gPSBjcmVhdGVTaW1wbGVUcmFuc2l0aW9uKCd0YWItdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVlRhYlJldmVyc2VUcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbigndGFiLXJldmVyc2UtdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVk1lbnVUcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbignbWVudS10cmFuc2l0aW9uJylcbmV4cG9ydCBjb25zdCBWRmFiVHJhbnNpdGlvbiA9IGNyZWF0ZVNpbXBsZVRyYW5zaXRpb24oJ2ZhYi10cmFuc2l0aW9uJywgJ2NlbnRlciBjZW50ZXInLCAnb3V0LWluJylcblxuLy8gR2VuZXJpYyB0cmFuc2l0aW9uc1xuZXhwb3J0IGNvbnN0IFZEaWFsb2dUcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbignZGlhbG9nLXRyYW5zaXRpb24nKVxuZXhwb3J0IGNvbnN0IFZEaWFsb2dCb3R0b21UcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbignZGlhbG9nLWJvdHRvbS10cmFuc2l0aW9uJylcbmV4cG9ydCBjb25zdCBWRGlhbG9nVG9wVHJhbnNpdGlvbiA9IGNyZWF0ZVNpbXBsZVRyYW5zaXRpb24oJ2RpYWxvZy10b3AtdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVkZhZGVUcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbignZmFkZS10cmFuc2l0aW9uJylcbmV4cG9ydCBjb25zdCBWU2NhbGVUcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbignc2NhbGUtdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVlNjcm9sbFhUcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbignc2Nyb2xsLXgtdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVlNjcm9sbFhSZXZlcnNlVHJhbnNpdGlvbiA9IGNyZWF0ZVNpbXBsZVRyYW5zaXRpb24oJ3Njcm9sbC14LXJldmVyc2UtdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVlNjcm9sbFlUcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbignc2Nyb2xsLXktdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVlNjcm9sbFlSZXZlcnNlVHJhbnNpdGlvbiA9IGNyZWF0ZVNpbXBsZVRyYW5zaXRpb24oJ3Njcm9sbC15LXJldmVyc2UtdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVlNsaWRlWFRyYW5zaXRpb24gPSBjcmVhdGVTaW1wbGVUcmFuc2l0aW9uKCdzbGlkZS14LXRyYW5zaXRpb24nKVxuZXhwb3J0IGNvbnN0IFZTbGlkZVhSZXZlcnNlVHJhbnNpdGlvbiA9IGNyZWF0ZVNpbXBsZVRyYW5zaXRpb24oJ3NsaWRlLXgtcmV2ZXJzZS10cmFuc2l0aW9uJylcbmV4cG9ydCBjb25zdCBWU2xpZGVZVHJhbnNpdGlvbiA9IGNyZWF0ZVNpbXBsZVRyYW5zaXRpb24oJ3NsaWRlLXktdHJhbnNpdGlvbicpXG5leHBvcnQgY29uc3QgVlNsaWRlWVJldmVyc2VUcmFuc2l0aW9uID0gY3JlYXRlU2ltcGxlVHJhbnNpdGlvbignc2xpZGUteS1yZXZlcnNlLXRyYW5zaXRpb24nKVxuXG4vLyBKYXZhc2NyaXB0IHRyYW5zaXRpb25zXG5leHBvcnQgY29uc3QgVkV4cGFuZFRyYW5zaXRpb24gPSBjcmVhdGVKYXZhc2NyaXB0VHJhbnNpdGlvbignZXhwYW5kLXRyYW5zaXRpb24nLCBFeHBhbmRUcmFuc2l0aW9uR2VuZXJhdG9yKCkpXG5leHBvcnQgY29uc3QgVkV4cGFuZFhUcmFuc2l0aW9uID0gY3JlYXRlSmF2YXNjcmlwdFRyYW5zaXRpb24oJ2V4cGFuZC14LXRyYW5zaXRpb24nLCBFeHBhbmRUcmFuc2l0aW9uR2VuZXJhdG9yKCcnLCB0cnVlKSlcblxuZXhwb3J0IGRlZmF1bHQge1xuICAkX3Z1ZXRpZnlfc3ViY29tcG9uZW50czoge1xuICAgIFZDYXJvdXNlbFRyYW5zaXRpb24sXG4gICAgVkNhcm91c2VsUmV2ZXJzZVRyYW5zaXRpb24sXG4gICAgVkRpYWxvZ1RyYW5zaXRpb24sXG4gICAgVkRpYWxvZ0JvdHRvbVRyYW5zaXRpb24sXG4gICAgVkRpYWxvZ1RvcFRyYW5zaXRpb24sXG4gICAgVkZhYlRyYW5zaXRpb24sXG4gICAgVkZhZGVUcmFuc2l0aW9uLFxuICAgIFZNZW51VHJhbnNpdGlvbixcbiAgICBWU2NhbGVUcmFuc2l0aW9uLFxuICAgIFZTY3JvbGxYVHJhbnNpdGlvbixcbiAgICBWU2Nyb2xsWFJldmVyc2VUcmFuc2l0aW9uLFxuICAgIFZTY3JvbGxZVHJhbnNpdGlvbixcbiAgICBWU2Nyb2xsWVJldmVyc2VUcmFuc2l0aW9uLFxuICAgIFZTbGlkZVhUcmFuc2l0aW9uLFxuICAgIFZTbGlkZVhSZXZlcnNlVHJhbnNpdGlvbixcbiAgICBWU2xpZGVZVHJhbnNpdGlvbixcbiAgICBWU2xpZGVZUmV2ZXJzZVRyYW5zaXRpb24sXG4gICAgVlRhYlJldmVyc2VUcmFuc2l0aW9uLFxuICAgIFZUYWJUcmFuc2l0aW9uLFxuICAgIFZFeHBhbmRUcmFuc2l0aW9uLFxuICAgIFZFeHBhbmRYVHJhbnNpdGlvbixcbiAgfSxcbn1cbiJdfQ==
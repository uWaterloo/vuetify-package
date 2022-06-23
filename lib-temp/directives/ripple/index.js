// Styles
import './VRipple.sass';
// Utilities
import { consoleWarn } from '../../util/console';
import { keyCodes } from '../../util/helpers';
const DELAY_RIPPLE = 80;
function transform(el, value) {
    el.style.transform = value;
    el.style.webkitTransform = value;
}
function isTouchEvent(e) {
    return e.constructor.name === 'TouchEvent';
}
function isKeyboardEvent(e) {
    return e.constructor.name === 'KeyboardEvent';
}
const calculate = (e, el, value = {}) => {
    let localX = 0;
    let localY = 0;
    if (!isKeyboardEvent(e)) {
        const offset = el.getBoundingClientRect();
        const target = isTouchEvent(e) ? e.touches[e.touches.length - 1] : e;
        localX = target.clientX - offset.left;
        localY = target.clientY - offset.top;
    }
    let radius = 0;
    let scale = 0.3;
    if (el._ripple && el._ripple.circle) {
        scale = 0.15;
        radius = el.clientWidth / 2;
        radius = value.center ? radius : radius + Math.sqrt((localX - radius) ** 2 + (localY - radius) ** 2) / 4;
    }
    else {
        radius = Math.sqrt(el.clientWidth ** 2 + el.clientHeight ** 2) / 2;
    }
    const centerX = `${(el.clientWidth - (radius * 2)) / 2}px`;
    const centerY = `${(el.clientHeight - (radius * 2)) / 2}px`;
    const x = value.center ? centerX : `${localX - radius}px`;
    const y = value.center ? centerY : `${localY - radius}px`;
    return { radius, scale, x, y, centerX, centerY };
};
const ripples = {
    /* eslint-disable max-statements */
    show(e, el, value = {}) {
        if (!el._ripple || !el._ripple.enabled) {
            return;
        }
        const container = document.createElement('span');
        const animation = document.createElement('span');
        container.appendChild(animation);
        container.className = 'v-ripple__container';
        if (value.class) {
            container.className += ` ${value.class}`;
        }
        const { radius, scale, x, y, centerX, centerY } = calculate(e, el, value);
        const size = `${radius * 2}px`;
        animation.className = 'v-ripple__animation';
        animation.style.width = size;
        animation.style.height = size;
        el.appendChild(container);
        const computed = window.getComputedStyle(el);
        if (computed && computed.position === 'static') {
            el.style.position = 'relative';
            el.dataset.previousPosition = 'static';
        }
        animation.classList.add('v-ripple__animation--enter');
        animation.classList.add('v-ripple__animation--visible');
        transform(animation, `translate(${x}, ${y}) scale3d(${scale},${scale},${scale})`);
        animation.dataset.activated = String(performance.now());
        setTimeout(() => {
            animation.classList.remove('v-ripple__animation--enter');
            animation.classList.add('v-ripple__animation--in');
            transform(animation, `translate(${centerX}, ${centerY}) scale3d(1,1,1)`);
        }, 0);
    },
    hide(el) {
        if (!el || !el._ripple || !el._ripple.enabled)
            return;
        const ripples = el.getElementsByClassName('v-ripple__animation');
        if (ripples.length === 0)
            return;
        const animation = ripples[ripples.length - 1];
        if (animation.dataset.isHiding)
            return;
        else
            animation.dataset.isHiding = 'true';
        const diff = performance.now() - Number(animation.dataset.activated);
        const delay = Math.max(250 - diff, 0);
        setTimeout(() => {
            animation.classList.remove('v-ripple__animation--in');
            animation.classList.add('v-ripple__animation--out');
            setTimeout(() => {
                const ripples = el.getElementsByClassName('v-ripple__animation');
                if (ripples.length === 1 && el.dataset.previousPosition) {
                    el.style.position = el.dataset.previousPosition;
                    delete el.dataset.previousPosition;
                }
                animation.parentNode && el.removeChild(animation.parentNode);
            }, 300);
        }, delay);
    },
};
function isRippleEnabled(value) {
    return typeof value === 'undefined' || !!value;
}
function rippleShow(e) {
    const value = {};
    const element = e.currentTarget;
    if (!element || !element._ripple || element._ripple.touched || e.rippleStop)
        return;
    // Don't allow the event to trigger ripples on any other elements
    e.rippleStop = true;
    if (isTouchEvent(e)) {
        element._ripple.touched = true;
        element._ripple.isTouch = true;
    }
    else {
        // It's possible for touch events to fire
        // as mouse events on Android/iOS, this
        // will skip the event call if it has
        // already been registered as touch
        if (element._ripple.isTouch)
            return;
    }
    value.center = element._ripple.centered || isKeyboardEvent(e);
    if (element._ripple.class) {
        value.class = element._ripple.class;
    }
    if (isTouchEvent(e)) {
        // already queued that shows or hides the ripple
        if (element._ripple.showTimerCommit)
            return;
        element._ripple.showTimerCommit = () => {
            ripples.show(e, element, value);
        };
        element._ripple.showTimer = window.setTimeout(() => {
            if (element && element._ripple && element._ripple.showTimerCommit) {
                element._ripple.showTimerCommit();
                element._ripple.showTimerCommit = null;
            }
        }, DELAY_RIPPLE);
    }
    else {
        ripples.show(e, element, value);
    }
}
function rippleHide(e) {
    const element = e.currentTarget;
    if (!element || !element._ripple)
        return;
    window.clearTimeout(element._ripple.showTimer);
    // The touch interaction occurs before the show timer is triggered.
    // We still want to show ripple effect.
    if (e.type === 'touchend' && element._ripple.showTimerCommit) {
        element._ripple.showTimerCommit();
        element._ripple.showTimerCommit = null;
        // re-queue ripple hiding
        element._ripple.showTimer = setTimeout(() => {
            rippleHide(e);
        });
        return;
    }
    window.setTimeout(() => {
        if (element._ripple) {
            element._ripple.touched = false;
        }
    });
    ripples.hide(element);
}
function rippleCancelShow(e) {
    const element = e.currentTarget;
    if (!element || !element._ripple)
        return;
    if (element._ripple.showTimerCommit) {
        element._ripple.showTimerCommit = null;
    }
    window.clearTimeout(element._ripple.showTimer);
}
let keyboardRipple = false;
function keyboardRippleShow(e) {
    if (!keyboardRipple && (e.keyCode === keyCodes.enter || e.keyCode === keyCodes.space)) {
        keyboardRipple = true;
        rippleShow(e);
    }
}
function keyboardRippleHide(e) {
    keyboardRipple = false;
    rippleHide(e);
}
function focusRippleHide(e) {
    if (keyboardRipple === true) {
        keyboardRipple = false;
        rippleHide(e);
    }
}
function updateRipple(el, binding, wasEnabled) {
    const enabled = isRippleEnabled(binding.value);
    if (!enabled) {
        ripples.hide(el);
    }
    el._ripple = el._ripple || {};
    el._ripple.enabled = enabled;
    const value = binding.value || {};
    if (value.center) {
        el._ripple.centered = true;
    }
    if (value.class) {
        el._ripple.class = binding.value.class;
    }
    if (value.circle) {
        el._ripple.circle = value.circle;
    }
    if (enabled && !wasEnabled) {
        el.addEventListener('touchstart', rippleShow, { passive: true });
        el.addEventListener('touchend', rippleHide, { passive: true });
        el.addEventListener('touchmove', rippleCancelShow, { passive: true });
        el.addEventListener('touchcancel', rippleHide);
        el.addEventListener('mousedown', rippleShow);
        el.addEventListener('mouseup', rippleHide);
        el.addEventListener('mouseleave', rippleHide);
        el.addEventListener('keydown', keyboardRippleShow);
        el.addEventListener('keyup', keyboardRippleHide);
        el.addEventListener('blur', focusRippleHide);
        // Anchor tags can be dragged, causes other hides to fail - #1537
        el.addEventListener('dragstart', rippleHide, { passive: true });
    }
    else if (!enabled && wasEnabled) {
        removeListeners(el);
    }
}
function removeListeners(el) {
    el.removeEventListener('mousedown', rippleShow);
    el.removeEventListener('touchstart', rippleShow);
    el.removeEventListener('touchend', rippleHide);
    el.removeEventListener('touchmove', rippleCancelShow);
    el.removeEventListener('touchcancel', rippleHide);
    el.removeEventListener('mouseup', rippleHide);
    el.removeEventListener('mouseleave', rippleHide);
    el.removeEventListener('keydown', keyboardRippleShow);
    el.removeEventListener('keyup', keyboardRippleHide);
    el.removeEventListener('dragstart', rippleHide);
    el.removeEventListener('blur', focusRippleHide);
}
function directive(el, binding, node) {
    updateRipple(el, binding, false);
    if (process.env.NODE_ENV === 'development') {
        // warn if an inline element is used, waiting for el to be in the DOM first
        node.context && node.context.$nextTick(() => {
            const computed = window.getComputedStyle(el);
            if (computed && computed.display === 'inline') {
                const context = node.fnOptions ? [node.fnOptions, node.context] : [node.componentInstance];
                consoleWarn('v-ripple can only be used on block-level elements', ...context);
            }
        });
    }
}
function unbind(el) {
    delete el._ripple;
    removeListeners(el);
}
function update(el, binding) {
    if (binding.value === binding.oldValue) {
        return;
    }
    const wasEnabled = isRippleEnabled(binding.oldValue);
    updateRipple(el, binding, wasEnabled);
}
export const Ripple = {
    bind: directive,
    unbind,
    update,
};
export default Ripple;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0aXZlcy9yaXBwbGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sZ0JBQWdCLENBQUE7QUFFdkIsWUFBWTtBQUNaLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNoRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFPN0MsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFBO0FBRXZCLFNBQVMsU0FBUyxDQUFFLEVBQWUsRUFBRSxLQUFhO0lBQ2hELEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtJQUMxQixFQUFFLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUE7QUFDbEMsQ0FBQztBQVFELFNBQVMsWUFBWSxDQUFFLENBQXFCO0lBQzFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFBO0FBQzVDLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBRSxDQUFxQjtJQUM3QyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLGVBQWUsQ0FBQTtBQUMvQyxDQUFDO0FBRUQsTUFBTSxTQUFTLEdBQUcsQ0FDaEIsQ0FBcUIsRUFDckIsRUFBZSxFQUNmLFFBQXVCLEVBQUUsRUFDekIsRUFBRTtJQUNGLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNkLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUVkLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDdkIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUE7UUFDekMsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FB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RTtnQkFDN0MsTUFBTSxPQUFPLEdBQUksSUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxJQUFZLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtnQkFDNUcsV0FBVyxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUE7YUFDN0U7UUFDSCxDQUFDLENBQUMsQ0FBQTtLQUNIO0FBQ0gsQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFFLEVBQWU7SUFDOUIsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFBO0lBQ2pCLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNyQixDQUFDO0FBRUQsU0FBUyxNQUFNLENBQUUsRUFBZSxFQUFFLE9BQXVCO0lBQ3ZELElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsUUFBUSxFQUFFO1FBQ3RDLE9BQU07S0FDUDtJQUVELE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDcEQsWUFBWSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUE7QUFDdkMsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRztJQUNwQixJQUFJLEVBQUUsU0FBUztJQUNmLE1BQU07SUFDTixNQUFNO0NBQ1AsQ0FBQTtBQUVELGVBQWUsTUFBTSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVlJpcHBsZS5zYXNzJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGNvbnNvbGVXYXJuIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuaW1wb3J0IHsga2V5Q29kZXMgfSBmcm9tICcuLi8uLi91dGlsL2hlbHBlcnMnXG5cbi8vIFR5cGVzXG5pbXBvcnQgeyBWTm9kZSwgVk5vZGVEaXJlY3RpdmUgfSBmcm9tICd2dWUnXG5cbnR5cGUgVnVldGlmeVJpcHBsZUV2ZW50ID0gKE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgS2V5Ym9hcmRFdmVudCkgJiB7IHJpcHBsZVN0b3A/OiBib29sZWFuIH1cblxuY29uc3QgREVMQVlfUklQUExFID0gODBcblxuZnVuY3Rpb24gdHJhbnNmb3JtIChlbDogSFRNTEVsZW1lbnQsIHZhbHVlOiBzdHJpbmcpIHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gdmFsdWVcbiAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gdmFsdWVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSaXBwbGVPcHRpb25zIHtcbiAgY2xhc3M/OiBzdHJpbmdcbiAgY2VudGVyPzogYm9vbGVhblxuICBjaXJjbGU/OiBib29sZWFuXG59XG5cbmZ1bmN0aW9uIGlzVG91Y2hFdmVudCAoZTogVnVldGlmeVJpcHBsZUV2ZW50KTogZSBpcyBUb3VjaEV2ZW50IHtcbiAgcmV0dXJuIGUuY29uc3RydWN0b3IubmFtZSA9PT0gJ1RvdWNoRXZlbnQnXG59XG5cbmZ1bmN0aW9uIGlzS2V5Ym9hcmRFdmVudCAoZTogVnVldGlmeVJpcHBsZUV2ZW50KTogZSBpcyBLZXlib2FyZEV2ZW50IHtcbiAgcmV0dXJuIGUuY29uc3RydWN0b3IubmFtZSA9PT0gJ0tleWJvYXJkRXZlbnQnXG59XG5cbmNvbnN0IGNhbGN1bGF0ZSA9IChcbiAgZTogVnVldGlmeVJpcHBsZUV2ZW50LFxuICBlbDogSFRNTEVsZW1lbnQsXG4gIHZhbHVlOiBSaXBwbGVPcHRpb25zID0ge31cbikgPT4ge1xuICBsZXQgbG9jYWxYID0gMFxuICBsZXQgbG9jYWxZID0gMFxuXG4gIGlmICghaXNLZXlib2FyZEV2ZW50KGUpKSB7XG4gICAgY29uc3Qgb2Zmc2V0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCB0YXJnZXQgPSBpc1RvdWNoRXZlbnQoZSkgPyBlLnRvdWNoZXNbZS50b3VjaGVzLmxlbmd0aCAtIDFdIDogZVxuXG4gICAgbG9jYWxYID0gdGFyZ2V0LmNsaWVudFggLSBvZmZzZXQubGVmdFxuICAgIGxvY2FsWSA9IHRhcmdldC5jbGllbnRZIC0gb2Zmc2V0LnRvcFxuICB9XG5cbiAgbGV0IHJhZGl1cyA9IDBcbiAgbGV0IHNjYWxlID0gMC4zXG4gIGlmIChlbC5fcmlwcGxlICYmIGVsLl9yaXBwbGUuY2lyY2xlKSB7XG4gICAgc2NhbGUgPSAwLjE1XG4gICAgcmFkaXVzID0gZWwuY2xpZW50V2lkdGggLyAyXG4gICAgcmFkaXVzID0gdmFsdWUuY2VudGVyID8gcmFkaXVzIDogcmFkaXVzICsgTWF0aC5zcXJ0KChsb2NhbFggLSByYWRpdXMpICoqIDIgKyAobG9jYWxZIC0gcmFkaXVzKSAqKiAyKSAvIDRcbiAgfSBlbHNlIHtcbiAgICByYWRpdXMgPSBNYXRoLnNxcnQoZWwuY2xpZW50V2lkdGggKiogMiArIGVsLmNsaWVudEhlaWdodCAqKiAyKSAvIDJcbiAgfVxuXG4gIGNvbnN0IGNlbnRlclggPSBgJHsoZWwuY2xpZW50V2lkdGggLSAocmFkaXVzICogMikpIC8gMn1weGBcbiAgY29uc3QgY2VudGVyWSA9IGAkeyhlbC5jbGllbnRIZWlnaHQgLSAocmFkaXVzICogMikpIC8gMn1weGBcblxuICBjb25zdCB4ID0gdmFsdWUuY2VudGVyID8gY2VudGVyWCA6IGAke2xvY2FsWCAtIHJhZGl1c31weGBcbiAgY29uc3QgeSA9IHZhbHVlLmNlbnRlciA/IGNlbnRlclkgOiBgJHtsb2NhbFkgLSByYWRpdXN9cHhgXG5cbiAgcmV0dXJuIHsgcmFkaXVzLCBzY2FsZSwgeCwgeSwgY2VudGVyWCwgY2VudGVyWSB9XG59XG5cbmNvbnN0IHJpcHBsZXMgPSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzICovXG4gIHNob3cgKFxuICAgIGU6IFZ1ZXRpZnlSaXBwbGVFdmVudCxcbiAgICBlbDogSFRNTEVsZW1lbnQsXG4gICAgdmFsdWU6IFJpcHBsZU9wdGlvbnMgPSB7fVxuICApIHtcbiAgICBpZiAoIWVsLl9yaXBwbGUgfHwgIWVsLl9yaXBwbGUuZW5hYmxlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgY29uc3QgYW5pbWF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYW5pbWF0aW9uKVxuICAgIGNvbnRhaW5lci5jbGFzc05hbWUgPSAndi1yaXBwbGVfX2NvbnRhaW5lcidcblxuICAgIGlmICh2YWx1ZS5jbGFzcykge1xuICAgICAgY29udGFpbmVyLmNsYXNzTmFtZSArPSBgICR7dmFsdWUuY2xhc3N9YFxuICAgIH1cblxuICAgIGNvbnN0IHsgcmFkaXVzLCBzY2FsZSwgeCwgeSwgY2VudGVyWCwgY2VudGVyWSB9ID0gY2FsY3VsYXRlKGUsIGVsLCB2YWx1ZSlcblxuICAgIGNvbnN0IHNpemUgPSBgJHtyYWRpdXMgKiAyfXB4YFxuICAgIGFuaW1hdGlvbi5jbGFzc05hbWUgPSAndi1yaXBwbGVfX2FuaW1hdGlvbidcbiAgICBhbmltYXRpb24uc3R5bGUud2lkdGggPSBzaXplXG4gICAgYW5pbWF0aW9uLnN0eWxlLmhlaWdodCA9IHNpemVcblxuICAgIGVsLmFwcGVuZENoaWxkKGNvbnRhaW5lcilcblxuICAgIGNvbnN0IGNvbXB1dGVkID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gICAgaWYgKGNvbXB1dGVkICYmIGNvbXB1dGVkLnBvc2l0aW9uID09PSAnc3RhdGljJykge1xuICAgICAgZWwuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnXG4gICAgICBlbC5kYXRhc2V0LnByZXZpb3VzUG9zaXRpb24gPSAnc3RhdGljJ1xuICAgIH1cblxuICAgIGFuaW1hdGlvbi5jbGFzc0xpc3QuYWRkKCd2LXJpcHBsZV9fYW5pbWF0aW9uLS1lbnRlcicpXG4gICAgYW5pbWF0aW9uLmNsYXNzTGlzdC5hZGQoJ3YtcmlwcGxlX19hbmltYXRpb24tLXZpc2libGUnKVxuICAgIHRyYW5zZm9ybShhbmltYXRpb24sIGB0cmFuc2xhdGUoJHt4fSwgJHt5fSkgc2NhbGUzZCgke3NjYWxlfSwke3NjYWxlfSwke3NjYWxlfSlgKVxuICAgIGFuaW1hdGlvbi5kYXRhc2V0LmFjdGl2YXRlZCA9IFN0cmluZyhwZXJmb3JtYW5jZS5ub3coKSlcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgYW5pbWF0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ3YtcmlwcGxlX19hbmltYXRpb24tLWVudGVyJylcbiAgICAgIGFuaW1hdGlvbi5jbGFzc0xpc3QuYWRkKCd2LXJpcHBsZV9fYW5pbWF0aW9uLS1pbicpXG4gICAgICB0cmFuc2Zvcm0oYW5pbWF0aW9uLCBgdHJhbnNsYXRlKCR7Y2VudGVyWH0sICR7Y2VudGVyWX0pIHNjYWxlM2QoMSwxLDEpYClcbiAgICB9LCAwKVxuICB9LFxuXG4gIGhpZGUgKGVsOiBIVE1MRWxlbWVudCB8IG51bGwpIHtcbiAgICBpZiAoIWVsIHx8ICFlbC5fcmlwcGxlIHx8ICFlbC5fcmlwcGxlLmVuYWJsZWQpIHJldHVyblxuXG4gICAgY29uc3QgcmlwcGxlcyA9IGVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3YtcmlwcGxlX19hbmltYXRpb24nKVxuXG4gICAgaWYgKHJpcHBsZXMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICBjb25zdCBhbmltYXRpb24gPSByaXBwbGVzW3JpcHBsZXMubGVuZ3RoIC0gMV1cblxuICAgIGlmIChhbmltYXRpb24uZGF0YXNldC5pc0hpZGluZykgcmV0dXJuXG4gICAgZWxzZSBhbmltYXRpb24uZGF0YXNldC5pc0hpZGluZyA9ICd0cnVlJ1xuXG4gICAgY29uc3QgZGlmZiA9IHBlcmZvcm1hbmNlLm5vdygpIC0gTnVtYmVyKGFuaW1hdGlvbi5kYXRhc2V0LmFjdGl2YXRlZClcbiAgICBjb25zdCBkZWxheSA9IE1hdGgubWF4KDI1MCAtIGRpZmYsIDApXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGFuaW1hdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCd2LXJpcHBsZV9fYW5pbWF0aW9uLS1pbicpXG4gICAgICBhbmltYXRpb24uY2xhc3NMaXN0LmFkZCgndi1yaXBwbGVfX2FuaW1hdGlvbi0tb3V0JylcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJpcHBsZXMgPSBlbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd2LXJpcHBsZV9fYW5pbWF0aW9uJylcbiAgICAgICAgaWYgKHJpcHBsZXMubGVuZ3RoID09PSAxICYmIGVsLmRhdGFzZXQucHJldmlvdXNQb3NpdGlvbikge1xuICAgICAgICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gZWwuZGF0YXNldC5wcmV2aW91c1Bvc2l0aW9uXG4gICAgICAgICAgZGVsZXRlIGVsLmRhdGFzZXQucHJldmlvdXNQb3NpdGlvblxuICAgICAgICB9XG5cbiAgICAgICAgYW5pbWF0aW9uLnBhcmVudE5vZGUgJiYgZWwucmVtb3ZlQ2hpbGQoYW5pbWF0aW9uLnBhcmVudE5vZGUpXG4gICAgICB9LCAzMDApXG4gICAgfSwgZGVsYXkpXG4gIH0sXG59XG5cbmZ1bmN0aW9uIGlzUmlwcGxlRW5hYmxlZCAodmFsdWU6IGFueSk6IHZhbHVlIGlzIHRydWUge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyB8fCAhIXZhbHVlXG59XG5cbmZ1bmN0aW9uIHJpcHBsZVNob3cgKGU6IFZ1ZXRpZnlSaXBwbGVFdmVudCkge1xuICBjb25zdCB2YWx1ZTogUmlwcGxlT3B0aW9ucyA9IHt9XG4gIGNvbnN0IGVsZW1lbnQgPSBlLmN1cnJlbnRUYXJnZXQgYXMgSFRNTEVsZW1lbnRcblxuICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQuX3JpcHBsZSB8fCBlbGVtZW50Ll9yaXBwbGUudG91Y2hlZCB8fCBlLnJpcHBsZVN0b3ApIHJldHVyblxuXG4gIC8vIERvbid0IGFsbG93IHRoZSBldmVudCB0byB0cmlnZ2VyIHJpcHBsZXMgb24gYW55IG90aGVyIGVsZW1lbnRzXG4gIGUucmlwcGxlU3RvcCA9IHRydWVcblxuICBpZiAoaXNUb3VjaEV2ZW50KGUpKSB7XG4gICAgZWxlbWVudC5fcmlwcGxlLnRvdWNoZWQgPSB0cnVlXG4gICAgZWxlbWVudC5fcmlwcGxlLmlzVG91Y2ggPSB0cnVlXG4gIH0gZWxzZSB7XG4gICAgLy8gSXQncyBwb3NzaWJsZSBmb3IgdG91Y2ggZXZlbnRzIHRvIGZpcmVcbiAgICAvLyBhcyBtb3VzZSBldmVudHMgb24gQW5kcm9pZC9pT1MsIHRoaXNcbiAgICAvLyB3aWxsIHNraXAgdGhlIGV2ZW50IGNhbGwgaWYgaXQgaGFzXG4gICAgLy8gYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWQgYXMgdG91Y2hcbiAgICBpZiAoZWxlbWVudC5fcmlwcGxlLmlzVG91Y2gpIHJldHVyblxuICB9XG4gIHZhbHVlLmNlbnRlciA9IGVsZW1lbnQuX3JpcHBsZS5jZW50ZXJlZCB8fCBpc0tleWJvYXJkRXZlbnQoZSlcbiAgaWYgKGVsZW1lbnQuX3JpcHBsZS5jbGFzcykge1xuICAgIHZhbHVlLmNsYXNzID0gZWxlbWVudC5fcmlwcGxlLmNsYXNzXG4gIH1cblxuICBpZiAoaXNUb3VjaEV2ZW50KGUpKSB7XG4gICAgLy8gYWxyZWFkeSBxdWV1ZWQgdGhhdCBzaG93cyBvciBoaWRlcyB0aGUgcmlwcGxlXG4gICAgaWYgKGVsZW1lbnQuX3JpcHBsZS5zaG93VGltZXJDb21taXQpIHJldHVyblxuXG4gICAgZWxlbWVudC5fcmlwcGxlLnNob3dUaW1lckNvbW1pdCA9ICgpID0+IHtcbiAgICAgIHJpcHBsZXMuc2hvdyhlLCBlbGVtZW50LCB2YWx1ZSlcbiAgICB9XG4gICAgZWxlbWVudC5fcmlwcGxlLnNob3dUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQuX3JpcHBsZSAmJiBlbGVtZW50Ll9yaXBwbGUuc2hvd1RpbWVyQ29tbWl0KSB7XG4gICAgICAgIGVsZW1lbnQuX3JpcHBsZS5zaG93VGltZXJDb21taXQoKVxuICAgICAgICBlbGVtZW50Ll9yaXBwbGUuc2hvd1RpbWVyQ29tbWl0ID0gbnVsbFxuICAgICAgfVxuICAgIH0sIERFTEFZX1JJUFBMRSlcbiAgfSBlbHNlIHtcbiAgICByaXBwbGVzLnNob3coZSwgZWxlbWVudCwgdmFsdWUpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmlwcGxlSGlkZSAoZTogRXZlbnQpIHtcbiAgY29uc3QgZWxlbWVudCA9IGUuY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudCB8IG51bGxcbiAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50Ll9yaXBwbGUpIHJldHVyblxuXG4gIHdpbmRvdy5jbGVhclRpbWVvdXQoZWxlbWVudC5fcmlwcGxlLnNob3dUaW1lcilcblxuICAvLyBUaGUgdG91Y2ggaW50ZXJhY3Rpb24gb2NjdXJzIGJlZm9yZSB0aGUgc2hvdyB0aW1lciBpcyB0cmlnZ2VyZWQuXG4gIC8vIFdlIHN0aWxsIHdhbnQgdG8gc2hvdyByaXBwbGUgZWZmZWN0LlxuICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnICYmIGVsZW1lbnQuX3JpcHBsZS5zaG93VGltZXJDb21taXQpIHtcbiAgICBlbGVtZW50Ll9yaXBwbGUuc2hvd1RpbWVyQ29tbWl0KClcbiAgICBlbGVtZW50Ll9yaXBwbGUuc2hvd1RpbWVyQ29tbWl0ID0gbnVsbFxuXG4gICAgLy8gcmUtcXVldWUgcmlwcGxlIGhpZGluZ1xuICAgIGVsZW1lbnQuX3JpcHBsZS5zaG93VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJpcHBsZUhpZGUoZSlcbiAgICB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGlmIChlbGVtZW50Ll9yaXBwbGUpIHtcbiAgICAgIGVsZW1lbnQuX3JpcHBsZS50b3VjaGVkID0gZmFsc2VcbiAgICB9XG4gIH0pXG4gIHJpcHBsZXMuaGlkZShlbGVtZW50KVxufVxuXG5mdW5jdGlvbiByaXBwbGVDYW5jZWxTaG93IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuICBjb25zdCBlbGVtZW50ID0gZS5jdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkXG5cbiAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50Ll9yaXBwbGUpIHJldHVyblxuXG4gIGlmIChlbGVtZW50Ll9yaXBwbGUuc2hvd1RpbWVyQ29tbWl0KSB7XG4gICAgZWxlbWVudC5fcmlwcGxlLnNob3dUaW1lckNvbW1pdCA9IG51bGxcbiAgfVxuXG4gIHdpbmRvdy5jbGVhclRpbWVvdXQoZWxlbWVudC5fcmlwcGxlLnNob3dUaW1lcilcbn1cblxubGV0IGtleWJvYXJkUmlwcGxlID0gZmFsc2VcblxuZnVuY3Rpb24ga2V5Ym9hcmRSaXBwbGVTaG93IChlOiBLZXlib2FyZEV2ZW50KSB7XG4gIGlmICgha2V5Ym9hcmRSaXBwbGUgJiYgKGUua2V5Q29kZSA9PT0ga2V5Q29kZXMuZW50ZXIgfHwgZS5rZXlDb2RlID09PSBrZXlDb2Rlcy5zcGFjZSkpIHtcbiAgICBrZXlib2FyZFJpcHBsZSA9IHRydWVcbiAgICByaXBwbGVTaG93KGUpXG4gIH1cbn1cblxuZnVuY3Rpb24ga2V5Ym9hcmRSaXBwbGVIaWRlIChlOiBLZXlib2FyZEV2ZW50KSB7XG4gIGtleWJvYXJkUmlwcGxlID0gZmFsc2VcbiAgcmlwcGxlSGlkZShlKVxufVxuXG5mdW5jdGlvbiBmb2N1c1JpcHBsZUhpZGUgKGU6IEZvY3VzRXZlbnQpIHtcbiAgaWYgKGtleWJvYXJkUmlwcGxlID09PSB0cnVlKSB7XG4gICAga2V5Ym9hcmRSaXBwbGUgPSBmYWxzZVxuICAgIHJpcHBsZUhpZGUoZSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVSaXBwbGUgKGVsOiBIVE1MRWxlbWVudCwgYmluZGluZzogVk5vZGVEaXJlY3RpdmUsIHdhc0VuYWJsZWQ6IGJvb2xlYW4pIHtcbiAgY29uc3QgZW5hYmxlZCA9IGlzUmlwcGxlRW5hYmxlZChiaW5kaW5nLnZhbHVlKVxuICBpZiAoIWVuYWJsZWQpIHtcbiAgICByaXBwbGVzLmhpZGUoZWwpXG4gIH1cbiAgZWwuX3JpcHBsZSA9IGVsLl9yaXBwbGUgfHwge31cbiAgZWwuX3JpcHBsZS5lbmFibGVkID0gZW5hYmxlZFxuICBjb25zdCB2YWx1ZSA9IGJpbmRpbmcudmFsdWUgfHwge31cbiAgaWYgKHZhbHVlLmNlbnRlcikge1xuICAgIGVsLl9yaXBwbGUuY2VudGVyZWQgPSB0cnVlXG4gIH1cbiAgaWYgKHZhbHVlLmNsYXNzKSB7XG4gICAgZWwuX3JpcHBsZS5jbGFzcyA9IGJpbmRpbmcudmFsdWUuY2xhc3NcbiAgfVxuICBpZiAodmFsdWUuY2lyY2xlKSB7XG4gICAgZWwuX3JpcHBsZS5jaXJjbGUgPSB2YWx1ZS5jaXJjbGVcbiAgfVxuICBpZiAoZW5hYmxlZCAmJiAhd2FzRW5hYmxlZCkge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCByaXBwbGVTaG93LCB7IHBhc3NpdmU6IHRydWUgfSlcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHJpcHBsZUhpZGUsIHsgcGFzc2l2ZTogdHJ1ZSB9KVxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHJpcHBsZUNhbmNlbFNob3csIHsgcGFzc2l2ZTogdHJ1ZSB9KVxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgcmlwcGxlSGlkZSlcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHJpcHBsZVNob3cpXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHJpcHBsZUhpZGUpXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHJpcHBsZUhpZGUpXG5cbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywga2V5Ym9hcmRSaXBwbGVTaG93KVxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywga2V5Ym9hcmRSaXBwbGVIaWRlKVxuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGZvY3VzUmlwcGxlSGlkZSlcblxuICAgIC8vIEFuY2hvciB0YWdzIGNhbiBiZSBkcmFnZ2VkLCBjYXVzZXMgb3RoZXIgaGlkZXMgdG8gZmFpbCAtICMxNTM3XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgcmlwcGxlSGlkZSwgeyBwYXNzaXZlOiB0cnVlIH0pXG4gIH0gZWxzZSBpZiAoIWVuYWJsZWQgJiYgd2FzRW5hYmxlZCkge1xuICAgIHJlbW92ZUxpc3RlbmVycyhlbClcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMgKGVsOiBIVE1MRWxlbWVudCkge1xuICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCByaXBwbGVTaG93KVxuICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgcmlwcGxlU2hvdylcbiAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCByaXBwbGVIaWRlKVxuICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCByaXBwbGVDYW5jZWxTaG93KVxuICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHJpcHBsZUhpZGUpXG4gIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCByaXBwbGVIaWRlKVxuICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgcmlwcGxlSGlkZSlcbiAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleWJvYXJkUmlwcGxlU2hvdylcbiAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXlib2FyZFJpcHBsZUhpZGUpXG4gIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHJpcHBsZUhpZGUpXG4gIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBmb2N1c1JpcHBsZUhpZGUpXG59XG5cbmZ1bmN0aW9uIGRpcmVjdGl2ZSAoZWw6IEhUTUxFbGVtZW50LCBiaW5kaW5nOiBWTm9kZURpcmVjdGl2ZSwgbm9kZTogVk5vZGUpIHtcbiAgdXBkYXRlUmlwcGxlKGVsLCBiaW5kaW5nLCBmYWxzZSlcblxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICAvLyB3YXJuIGlmIGFuIGlubGluZSBlbGVtZW50IGlzIHVzZWQsIHdhaXRpbmcgZm9yIGVsIHRvIGJlIGluIHRoZSBET00gZmlyc3RcbiAgICBub2RlLmNvbnRleHQgJiYgbm9kZS5jb250ZXh0LiRuZXh0VGljaygoKSA9PiB7XG4gICAgICBjb25zdCBjb21wdXRlZCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICAgICAgaWYgKGNvbXB1dGVkICYmIGNvbXB1dGVkLmRpc3BsYXkgPT09ICdpbmxpbmUnKSB7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSAobm9kZSBhcyBhbnkpLmZuT3B0aW9ucyA/IFsobm9kZSBhcyBhbnkpLmZuT3B0aW9ucywgbm9kZS5jb250ZXh0XSA6IFtub2RlLmNvbXBvbmVudEluc3RhbmNlXVxuICAgICAgICBjb25zb2xlV2Fybigndi1yaXBwbGUgY2FuIG9ubHkgYmUgdXNlZCBvbiBibG9jay1sZXZlbCBlbGVtZW50cycsIC4uLmNvbnRleHQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1bmJpbmQgKGVsOiBIVE1MRWxlbWVudCkge1xuICBkZWxldGUgZWwuX3JpcHBsZVxuICByZW1vdmVMaXN0ZW5lcnMoZWwpXG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSAoZWw6IEhUTUxFbGVtZW50LCBiaW5kaW5nOiBWTm9kZURpcmVjdGl2ZSkge1xuICBpZiAoYmluZGluZy52YWx1ZSA9PT0gYmluZGluZy5vbGRWYWx1ZSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3Qgd2FzRW5hYmxlZCA9IGlzUmlwcGxlRW5hYmxlZChiaW5kaW5nLm9sZFZhbHVlKVxuICB1cGRhdGVSaXBwbGUoZWwsIGJpbmRpbmcsIHdhc0VuYWJsZWQpXG59XG5cbmV4cG9ydCBjb25zdCBSaXBwbGUgPSB7XG4gIGJpbmQ6IGRpcmVjdGl2ZSxcbiAgdW5iaW5kLFxuICB1cGRhdGUsXG59XG5cbmV4cG9ydCBkZWZhdWx0IFJpcHBsZVxuIl19
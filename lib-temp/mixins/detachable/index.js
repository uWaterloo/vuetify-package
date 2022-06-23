// Mixins
import Bootable from '../bootable';
// Utilities
import { getObjectValueByPath } from '../../util/helpers';
import mixins from '../../util/mixins';
import { consoleWarn } from '../../util/console';
function validateAttachTarget(val) {
    const type = typeof val;
    if (type === 'boolean' || type === 'string')
        return true;
    return val.nodeType === Node.ELEMENT_NODE;
}
function removeActivator(activator) {
    activator.forEach(node => {
        node.elm &&
            node.elm.parentNode &&
            node.elm.parentNode.removeChild(node.elm);
    });
}
/* @vue/component */
export default mixins(Bootable).extend({
    name: 'detachable',
    props: {
        attach: {
            default: false,
            validator: validateAttachTarget,
        },
        contentClass: {
            type: String,
            default: '',
        },
    },
    data: () => ({
        activatorNode: null,
        hasDetached: false,
    }),
    watch: {
        attach() {
            this.hasDetached = false;
            this.initDetach();
        },
        hasContent() {
            this.$nextTick(this.initDetach);
        },
    },
    beforeMount() {
        this.$nextTick(() => {
            if (this.activatorNode) {
                const activator = Array.isArray(this.activatorNode) ? this.activatorNode : [this.activatorNode];
                activator.forEach(node => {
                    if (!node.elm)
                        return;
                    if (!this.$el.parentNode)
                        return;
                    const target = this.$el === this.$el.parentNode.firstChild
                        ? this.$el
                        : this.$el.nextSibling;
                    this.$el.parentNode.insertBefore(node.elm, target);
                });
            }
        });
    },
    mounted() {
        this.hasContent && this.initDetach();
    },
    deactivated() {
        this.isActive = false;
    },
    beforeDestroy() {
        if (this.$refs.content &&
            this.$refs.content.parentNode) {
            this.$refs.content.parentNode.removeChild(this.$refs.content);
        }
    },
    destroyed() {
        if (this.activatorNode) {
            const activator = Array.isArray(this.activatorNode) ? this.activatorNode : [this.activatorNode];
            if (this.$el.isConnected) {
                // Component has been destroyed but the element still exists, we must be in a transition
                // Wait for the transition to finish before cleaning up the detached activator
                const observer = new MutationObserver(list => {
                    if (list.some(record => Array.from(record.removedNodes).includes(this.$el))) {
                        observer.disconnect();
                        removeActivator(activator);
                    }
                });
                observer.observe(this.$el.parentNode, { subtree: false, childList: true });
            }
            else {
                removeActivator(activator);
            }
        }
    },
    methods: {
        getScopeIdAttrs() {
            const scopeId = getObjectValueByPath(this.$vnode, 'context.$options._scopeId');
            return scopeId && {
                [scopeId]: '',
            };
        },
        initDetach() {
            if (this._isDestroyed ||
                !this.$refs.content ||
                this.hasDetached ||
                // Leave menu in place if attached
                // and dev has not changed target
                this.attach === '' || // If used as a boolean prop (<v-menu attach>)
                this.attach === true || // If bound to a boolean (<v-menu :attach="true">)
                this.attach === 'attach' // If bound as boolean prop in pug (v-menu(attach))
            )
                return;
            let target;
            if (this.attach === false) {
                // Default, detach to app
                target = document.querySelector('[data-app]');
            }
            else if (typeof this.attach === 'string') {
                // CSS selector
                target = document.querySelector(this.attach);
            }
            else {
                // DOM Element
                target = this.attach;
            }
            if (!target) {
                consoleWarn(`Unable to locate target ${this.attach || '[data-app]'}`, this);
                return;
            }
            target.appendChild(this.$refs.content);
            this.hasDetached = true;
        },
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL2RldGFjaGFibGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUztBQUNULE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQTtBQUVsQyxZQUFZO0FBQ1osT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFDekQsT0FBTyxNQUFzQixNQUFNLG1CQUFtQixDQUFBO0FBQ3RELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQWFoRCxTQUFTLG9CQUFvQixDQUFFLEdBQVE7SUFDckMsTUFBTSxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUE7SUFFdkIsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksS0FBSyxRQUFRO1FBQUUsT0FBTyxJQUFJLENBQUE7SUFFeEQsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUE7QUFDM0MsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFFLFNBQWtCO0lBQzFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDdkIsSUFBSSxDQUFDLEdBQUc7WUFDUixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVU7WUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUMzQyxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRCxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBSW5CLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNqQixJQUFJLEVBQUUsWUFBWTtJQUVsQixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUU7WUFDTixPQUFPLEVBQUUsS0FBSztZQUNkLFNBQVMsRUFBRSxvQkFBb0I7U0FDVztRQUM1QyxZQUFZLEVBQUU7WUFDWixJQUFJLEVBQUUsTUFB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Q0FBQyxNQUFNLENBQUE7YUFDckI7WUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLFdBQVcsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE1BQU0sSUFBSSxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQTtnQkFDM0UsT0FBTTthQUNQO1lBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBRXRDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFBO1FBQ3pCLENBQUM7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIE1peGluc1xuaW1wb3J0IEJvb3RhYmxlIGZyb20gJy4uL2Jvb3RhYmxlJ1xuXG4vLyBVdGlsaXRpZXNcbmltcG9ydCB7IGdldE9iamVjdFZhbHVlQnlQYXRoIH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IG1peGlucywgeyBFeHRyYWN0VnVlIH0gZnJvbSAnLi4vLi4vdXRpbC9taXhpbnMnXG5pbXBvcnQgeyBjb25zb2xlV2FybiB9IGZyb20gJy4uLy4uL3V0aWwvY29uc29sZSdcblxuLy8gVHlwZXNcbmltcG9ydCBWdWUsIHsgUHJvcE9wdGlvbnMgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZS90eXBlcydcblxuaW50ZXJmYWNlIG9wdGlvbnMgZXh0ZW5kcyBWdWUge1xuICAkZWw6IEhUTUxFbGVtZW50XG4gICRyZWZzOiB7XG4gICAgY29udGVudDogSFRNTEVsZW1lbnRcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUF0dGFjaFRhcmdldCAodmFsOiBhbnkpIHtcbiAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWxcblxuICBpZiAodHlwZSA9PT0gJ2Jvb2xlYW4nIHx8IHR5cGUgPT09ICdzdHJpbmcnKSByZXR1cm4gdHJ1ZVxuXG4gIHJldHVybiB2YWwubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUFjdGl2YXRvciAoYWN0aXZhdG9yOiBWTm9kZVtdKSB7XG4gIGFjdGl2YXRvci5mb3JFYWNoKG5vZGUgPT4ge1xuICAgIG5vZGUuZWxtICYmXG4gICAgbm9kZS5lbG0ucGFyZW50Tm9kZSAmJlxuICAgIG5vZGUuZWxtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZS5lbG0pXG4gIH0pXG59XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnM8b3B0aW9ucyAmXG4gIC8qIGVzbGludC1kaXNhYmxlIGluZGVudCAqL1xuICBFeHRyYWN0VnVlPHR5cGVvZiBCb290YWJsZT5cbiAgLyogZXNsaW50LWVuYWJsZSBpbmRlbnQgKi9cbj4oQm9vdGFibGUpLmV4dGVuZCh7XG4gIG5hbWU6ICdkZXRhY2hhYmxlJyxcblxuICBwcm9wczoge1xuICAgIGF0dGFjaDoge1xuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB2YWxpZGF0b3I6IHZhbGlkYXRlQXR0YWNoVGFyZ2V0LFxuICAgIH0gYXMgUHJvcE9wdGlvbnM8Ym9vbGVhbiB8IHN0cmluZyB8IEVsZW1lbnQ+LFxuICAgIGNvbnRlbnRDbGFzczoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJycsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGFjdGl2YXRvck5vZGU6IG51bGwgYXMgbnVsbCB8IFZOb2RlIHwgVk5vZGVbXSxcbiAgICBoYXNEZXRhY2hlZDogZmFsc2UsXG4gIH0pLFxuXG4gIHdhdGNoOiB7XG4gICAgYXR0YWNoICgpIHtcbiAgICAgIHRoaXMuaGFzRGV0YWNoZWQgPSBmYWxzZVxuICAgICAgdGhpcy5pbml0RGV0YWNoKClcbiAgICB9LFxuICAgIGhhc0NvbnRlbnQgKCkge1xuICAgICAgdGhpcy4kbmV4dFRpY2sodGhpcy5pbml0RGV0YWNoKVxuICAgIH0sXG4gIH0sXG5cbiAgYmVmb3JlTW91bnQgKCkge1xuICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmFjdGl2YXRvck5vZGUpIHtcbiAgICAgICAgY29uc3QgYWN0aXZhdG9yID0gQXJyYXkuaXNBcnJheSh0aGlzLmFjdGl2YXRvck5vZGUpID8gdGhpcy5hY3RpdmF0b3JOb2RlIDogW3RoaXMuYWN0aXZhdG9yTm9kZV1cblxuICAgICAgICBhY3RpdmF0b3IuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICBpZiAoIW5vZGUuZWxtKSByZXR1cm5cbiAgICAgICAgICBpZiAoIXRoaXMuJGVsLnBhcmVudE5vZGUpIHJldHVyblxuXG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy4kZWwgPT09IHRoaXMuJGVsLnBhcmVudE5vZGUuZmlyc3RDaGlsZFxuICAgICAgICAgICAgPyB0aGlzLiRlbFxuICAgICAgICAgICAgOiB0aGlzLiRlbC5uZXh0U2libGluZ1xuXG4gICAgICAgICAgdGhpcy4kZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZS5lbG0sIHRhcmdldClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIG1vdW50ZWQgKCkge1xuICAgIHRoaXMuaGFzQ29udGVudCAmJiB0aGlzLmluaXREZXRhY2goKVxuICB9LFxuXG4gIGRlYWN0aXZhdGVkICgpIHtcbiAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2VcbiAgfSxcblxuICBiZWZvcmVEZXN0cm95ICgpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLiRyZWZzLmNvbnRlbnQgJiZcbiAgICAgIHRoaXMuJHJlZnMuY29udGVudC5wYXJlbnROb2RlXG4gICAgKSB7XG4gICAgICB0aGlzLiRyZWZzLmNvbnRlbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLiRyZWZzLmNvbnRlbnQpXG4gICAgfVxuICB9LFxuXG4gIGRlc3Ryb3llZCAoKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZhdG9yTm9kZSkge1xuICAgICAgY29uc3QgYWN0aXZhdG9yID0gQXJyYXkuaXNBcnJheSh0aGlzLmFjdGl2YXRvck5vZGUpID8gdGhpcy5hY3RpdmF0b3JOb2RlIDogW3RoaXMuYWN0aXZhdG9yTm9kZV1cbiAgICAgIGlmICh0aGlzLiRlbC5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAvLyBDb21wb25lbnQgaGFzIGJlZW4gZGVzdHJveWVkIGJ1dCB0aGUgZWxlbWVudCBzdGlsbCBleGlzdHMsIHdlIG11c3QgYmUgaW4gYSB0cmFuc2l0aW9uXG4gICAgICAgIC8vIFdhaXQgZm9yIHRoZSB0cmFuc2l0aW9uIHRvIGZpbmlzaCBiZWZvcmUgY2xlYW5pbmcgdXAgdGhlIGRldGFjaGVkIGFjdGl2YXRvclxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3QgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGxpc3Quc29tZShyZWNvcmQgPT4gQXJyYXkuZnJvbShyZWNvcmQucmVtb3ZlZE5vZGVzKS5pbmNsdWRlcyh0aGlzLiRlbCkpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICAgICAgICAgIHJlbW92ZUFjdGl2YXRvcihhY3RpdmF0b3IpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRoaXMuJGVsLnBhcmVudE5vZGUhLCB7IHN1YnRyZWU6IGZhbHNlLCBjaGlsZExpc3Q6IHRydWUgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbW92ZUFjdGl2YXRvcihhY3RpdmF0b3IpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZXRTY29wZUlkQXR0cnMgKCkge1xuICAgICAgY29uc3Qgc2NvcGVJZCA9IGdldE9iamVjdFZhbHVlQnlQYXRoKHRoaXMuJHZub2RlLCAnY29udGV4dC4kb3B0aW9ucy5fc2NvcGVJZCcpXG5cbiAgICAgIHJldHVybiBzY29wZUlkICYmIHtcbiAgICAgICAgW3Njb3BlSWRdOiAnJyxcbiAgICAgIH1cbiAgICB9LFxuICAgIGluaXREZXRhY2ggKCkge1xuICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkIHx8XG4gICAgICAgICF0aGlzLiRyZWZzLmNvbnRlbnQgfHxcbiAgICAgICAgdGhpcy5oYXNEZXRhY2hlZCB8fFxuICAgICAgICAvLyBMZWF2ZSBtZW51IGluIHBsYWNlIGlmIGF0dGFjaGVkXG4gICAgICAgIC8vIGFuZCBkZXYgaGFzIG5vdCBjaGFuZ2VkIHRhcmdldFxuICAgICAgICB0aGlzLmF0dGFjaCA9PT0gJycgfHwgLy8gSWYgdXNlZCBhcyBhIGJvb2xlYW4gcHJvcCAoPHYtbWVudSBhdHRhY2g+KVxuICAgICAgICB0aGlzLmF0dGFjaCA9PT0gdHJ1ZSB8fCAvLyBJZiBib3VuZCB0byBhIGJvb2xlYW4gKDx2LW1lbnUgOmF0dGFjaD1cInRydWVcIj4pXG4gICAgICAgIHRoaXMuYXR0YWNoID09PSAnYXR0YWNoJyAvLyBJZiBib3VuZCBhcyBib29sZWFuIHByb3AgaW4gcHVnICh2LW1lbnUoYXR0YWNoKSlcbiAgICAgICkgcmV0dXJuXG5cbiAgICAgIGxldCB0YXJnZXRcbiAgICAgIGlmICh0aGlzLmF0dGFjaCA9PT0gZmFsc2UpIHtcbiAgICAgICAgLy8gRGVmYXVsdCwgZGV0YWNoIHRvIGFwcFxuICAgICAgICB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1hcHBdJylcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuYXR0YWNoID09PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBDU1Mgc2VsZWN0b3JcbiAgICAgICAgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmF0dGFjaClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIERPTSBFbGVtZW50XG4gICAgICAgIHRhcmdldCA9IHRoaXMuYXR0YWNoXG4gICAgICB9XG5cbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIGNvbnNvbGVXYXJuKGBVbmFibGUgdG8gbG9jYXRlIHRhcmdldCAke3RoaXMuYXR0YWNoIHx8ICdbZGF0YS1hcHBdJ31gLCB0aGlzKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHRoaXMuJHJlZnMuY29udGVudClcblxuICAgICAgdGhpcy5oYXNEZXRhY2hlZCA9IHRydWVcbiAgICB9LFxuICB9LFxufSlcbiJdfQ==
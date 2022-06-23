import Vue from 'vue';
/* @vue/component */
const Themeable = Vue.extend().extend({
    name: 'themeable',
    provide() {
        return {
            theme: this.themeableProvide,
        };
    },
    inject: {
        theme: {
            default: {
                isDark: false,
            },
        },
    },
    props: {
        dark: {
            type: Boolean,
            default: null,
        },
        light: {
            type: Boolean,
            default: null,
        },
    },
    data() {
        return {
            themeableProvide: {
                isDark: false,
            },
        };
    },
    computed: {
        appIsDark() {
            return this.$vuetify.theme.dark || false;
        },
        isDark() {
            if (this.dark === true) {
                // explicitly dark
                return true;
            }
            else if (this.light === true) {
                // explicitly light
                return false;
            }
            else {
                // inherit from parent, or default false if there is none
                return this.theme.isDark;
            }
        },
        themeClasses() {
            return {
                'theme--dark': this.isDark,
                'theme--light': !this.isDark,
            };
        },
        /** Used by menus and dialogs, inherits from v-app instead of the parent */
        rootIsDark() {
            if (this.dark === true) {
                // explicitly dark
                return true;
            }
            else if (this.light === true) {
                // explicitly light
                return false;
            }
            else {
                // inherit from v-app
                return this.appIsDark;
            }
        },
        rootThemeClasses() {
            return {
                'theme--dark': this.rootIsDark,
                'theme--light': !this.rootIsDark,
            };
        },
    },
    watch: {
        isDark: {
            handler(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.themeableProvide.isDark = this.isDark;
                }
            },
            immediate: true,
        },
    },
});
export default Themeable;
export function functionalThemeClasses(context) {
    const vm = {
        ...context.props,
        ...context.injections,
    };
    const isDark = Themeable.options.computed.isDark.call(vm);
    return Themeable.options.computed.themeClasses.call({ isDark });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWl4aW5zL3RoZW1lYWJsZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFTckIsb0JBQW9CO0FBQ3BCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQVcsQ0FBQyxNQUFNLENBQUM7SUFDN0MsSUFBSSxFQUFFLFdBQVc7SUFFakIsT0FBTztRQUNMLE9BQU87WUFDTCxLQUFLLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtTQUM3QixDQUFBO0lBQ0gsQ0FBQztJQUVELE1BQU0sRUFBRTtRQUNOLEtBQUssRUFBRTtZQUNMLE9BQU8sRUFBRTtnQkFDUCxNQUFNLEVBQUUsS0FBSzthQUNkO1NBQ0Y7S0FDRjtJQUVELEtBQUssRUFBRTtRQUNMLElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxPQUFtQztZQUN6QyxPQUFPLEVBQUUsSUFBSTtTQUNkO1FBQ0QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLE9BQW1DO1lBQ3pDLE9BQU8sRUFBRSxJQUFJO1NBQ2Q7S0FDRjtJQUVELElBQUk7UUFDRixPQUFPO1lBQ0wsZ0JBQWdCLEVBQUU7Z0JBQ2hCLE1BQU0sRUFBRSxLQUFLO2FBQ2Q7U0FDRixDQUFBO0lBQ0gsQ0FBQztJQUVELFFBQVEsRUFBRTtRQUNSLFNBQVM7WUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUE7UUFDMUMsQ0FBQztRQUNELE1BQU07WUFDSixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUN0QixrQkFBa0I7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFBO2FBQ1o7aUJBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDOUIsbUJBQW1CO2dCQUNuQixPQUFPLEtBQUssQ0FBQTthQUNiO2lCQUFNO2dCQUNMLHlEQUF5RDtnQkFDekQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQTthQUN6QjtRQUNILENBQUM7UUFDRCxZQUFZO1lBQ1YsT0FBTztnQkFDTCxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQzFCLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNO2FBQzdCLENBQUE7UUFDSCxDQUFDO1FBQ0QsMkVBQTJFO1FBQzNFLFVBQVU7WUFDUixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUN0QixrQkFBa0I7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFBO2FBQ1o7aUJBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDOUIsbUJBQW1CO2dCQUNuQixPQUFPLEtBQUssQ0FBQTthQUNiO2lCQUFNO2dCQUNMLHFCQUFxQjtnQkFDckIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFBO2FBQ3RCO1FBQ0gsQ0FBQztRQUNELGdCQUFnQjtZQUNkLE9BQU87Z0JBQ0wsYUFBYSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUM5QixjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVTthQUNqQyxDQUFBO1FBQ0gsQ0FBQztLQUNGO0lBRUQsS0FBSyxFQUFFO1FBQ0wsTUFBTSxFQUFFO1lBQ04sT0FBTyxDQUFFLE1BQU0sRUFBRSxNQUFNO2dCQUNyQixJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7b0JBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtpQkFDM0M7WUFDSCxDQUFDO1lBQ0QsU0FBUyxFQUFFLElBQUk7U0FDaEI7S0FDRjtDQUNGLENBQUMsQ0FBQTtBQUVGLGVBQWUsU0FBUyxDQUFBO0FBRXhCLE1BQU0sVUFBVSxzQkFBc0IsQ0FBRSxPQUFzQjtJQUM1RCxNQUFNLEVBQUUsR0FBRztRQUNULEdBQUcsT0FBTyxDQUFDLEtBQUs7UUFDaEIsR0FBRyxPQUFPLENBQUMsVUFBVTtLQUN0QixDQUFBO0lBQ0QsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUN6RCxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0FBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCB7IFByb3BUeXBlLCBSZW5kZXJDb250ZXh0IH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5cbmludGVyZmFjZSBvcHRpb25zIGV4dGVuZHMgVnVlIHtcbiAgdGhlbWU6IHtcbiAgICBpc0Rhcms6IGJvb2xlYW5cbiAgfVxufVxuXG4vKiBAdnVlL2NvbXBvbmVudCAqL1xuY29uc3QgVGhlbWVhYmxlID0gVnVlLmV4dGVuZDxvcHRpb25zPigpLmV4dGVuZCh7XG4gIG5hbWU6ICd0aGVtZWFibGUnLFxuXG4gIHByb3ZpZGUgKCk6IG9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRoZW1lOiB0aGlzLnRoZW1lYWJsZVByb3ZpZGUsXG4gICAgfVxuICB9LFxuXG4gIGluamVjdDoge1xuICAgIHRoZW1lOiB7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGlzRGFyazogZmFsc2UsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG5cbiAgcHJvcHM6IHtcbiAgICBkYXJrOiB7XG4gICAgICB0eXBlOiBCb29sZWFuIGFzIFByb3BUeXBlPGJvb2xlYW4gfCBudWxsPixcbiAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgfSxcbiAgICBsaWdodDoge1xuICAgICAgdHlwZTogQm9vbGVhbiBhcyBQcm9wVHlwZTxib29sZWFuIHwgbnVsbD4sXG4gICAgICBkZWZhdWx0OiBudWxsLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YSAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRoZW1lYWJsZVByb3ZpZGU6IHtcbiAgICAgICAgaXNEYXJrOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgYXBwSXNEYXJrICgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLiR2dWV0aWZ5LnRoZW1lLmRhcmsgfHwgZmFsc2VcbiAgICB9LFxuICAgIGlzRGFyayAoKTogYm9vbGVhbiB7XG4gICAgICBpZiAodGhpcy5kYXJrID09PSB0cnVlKSB7XG4gICAgICAgIC8vIGV4cGxpY2l0bHkgZGFya1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmxpZ2h0ID09PSB0cnVlKSB7XG4gICAgICAgIC8vIGV4cGxpY2l0bHkgbGlnaHRcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpbmhlcml0IGZyb20gcGFyZW50LCBvciBkZWZhdWx0IGZhbHNlIGlmIHRoZXJlIGlzIG5vbmVcbiAgICAgICAgcmV0dXJuIHRoaXMudGhlbWUuaXNEYXJrXG4gICAgICB9XG4gICAgfSxcbiAgICB0aGVtZUNsYXNzZXMgKCk6IG9iamVjdCB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndGhlbWUtLWRhcmsnOiB0aGlzLmlzRGFyayxcbiAgICAgICAgJ3RoZW1lLS1saWdodCc6ICF0aGlzLmlzRGFyayxcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qKiBVc2VkIGJ5IG1lbnVzIGFuZCBkaWFsb2dzLCBpbmhlcml0cyBmcm9tIHYtYXBwIGluc3RlYWQgb2YgdGhlIHBhcmVudCAqL1xuICAgIHJvb3RJc0RhcmsgKCk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHRoaXMuZGFyayA9PT0gdHJ1ZSkge1xuICAgICAgICAvLyBleHBsaWNpdGx5IGRhcmtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5saWdodCA9PT0gdHJ1ZSkge1xuICAgICAgICAvLyBleHBsaWNpdGx5IGxpZ2h0XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaW5oZXJpdCBmcm9tIHYtYXBwXG4gICAgICAgIHJldHVybiB0aGlzLmFwcElzRGFya1xuICAgICAgfVxuICAgIH0sXG4gICAgcm9vdFRoZW1lQ2xhc3NlcyAoKTogRGljdGlvbmFyeTxib29sZWFuPiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAndGhlbWUtLWRhcmsnOiB0aGlzLnJvb3RJc0RhcmssXG4gICAgICAgICd0aGVtZS0tbGlnaHQnOiAhdGhpcy5yb290SXNEYXJrLFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG5cbiAgd2F0Y2g6IHtcbiAgICBpc0Rhcms6IHtcbiAgICAgIGhhbmRsZXIgKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgIGlmIChuZXdWYWwgIT09IG9sZFZhbCkge1xuICAgICAgICAgIHRoaXMudGhlbWVhYmxlUHJvdmlkZS5pc0RhcmsgPSB0aGlzLmlzRGFya1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgIH0sXG4gIH0sXG59KVxuXG5leHBvcnQgZGVmYXVsdCBUaGVtZWFibGVcblxuZXhwb3J0IGZ1bmN0aW9uIGZ1bmN0aW9uYWxUaGVtZUNsYXNzZXMgKGNvbnRleHQ6IFJlbmRlckNvbnRleHQpOiBvYmplY3Qge1xuICBjb25zdCB2bSA9IHtcbiAgICAuLi5jb250ZXh0LnByb3BzLFxuICAgIC4uLmNvbnRleHQuaW5qZWN0aW9ucyxcbiAgfVxuICBjb25zdCBpc0RhcmsgPSBUaGVtZWFibGUub3B0aW9ucy5jb21wdXRlZC5pc0RhcmsuY2FsbCh2bSlcbiAgcmV0dXJuIFRoZW1lYWJsZS5vcHRpb25zLmNvbXB1dGVkLnRoZW1lQ2xhc3Nlcy5jYWxsKHsgaXNEYXJrIH0pXG59XG4iXX0=
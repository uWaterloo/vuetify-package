// Styles
import './VSkeletonLoader.sass';
// Mixins
import Elevatable from '../../mixins/elevatable';
import Measurable from '../../mixins/measurable';
import Themeable from '../../mixins/themeable';
// Utilities
import mixins from '../../util/mixins';
import { getSlot } from '../../util/helpers';
/* @vue/component */
export default mixins(Elevatable, Measurable, Themeable).extend({
    name: 'VSkeletonLoader',
    props: {
        boilerplate: Boolean,
        loading: Boolean,
        tile: Boolean,
        transition: String,
        type: String,
        types: {
            type: Object,
            default: () => ({}),
        },
    },
    computed: {
        attrs() {
            if (!this.isLoading)
                return this.$attrs;
            return !this.boilerplate ? {
                'aria-busy': true,
                'aria-live': 'polite',
                role: 'alert',
                ...this.$attrs,
            } : {};
        },
        classes() {
            return {
                'v-skeleton-loader--boilerplate': this.boilerplate,
                'v-skeleton-loader--is-loading': this.isLoading,
                'v-skeleton-loader--tile': this.tile,
                ...this.themeClasses,
                ...this.elevationClasses,
            };
        },
        isLoading() {
            return !('default' in this.$scopedSlots) || this.loading;
        },
        rootTypes() {
            return {
                actions: 'button@2',
                article: 'heading, paragraph',
                avatar: 'avatar',
                button: 'button',
                card: 'image, card-heading',
                'card-avatar': 'image, list-item-avatar',
                'card-heading': 'heading',
                chip: 'chip',
                'date-picker': 'list-item, card-heading, divider, date-picker-options, date-picker-days, actions',
                'date-picker-options': 'text, avatar@2',
                'date-picker-days': 'avatar@28',
                heading: 'heading',
                image: 'image',
                'list-item': 'text',
                'list-item-avatar': 'avatar, text',
                'list-item-two-line': 'sentences',
                'list-item-avatar-two-line': 'avatar, sentences',
                'list-item-three-line': 'paragraph',
                'list-item-avatar-three-line': 'avatar, paragraph',
                paragraph: 'text@3',
                sentences: 'text@2',
                table: 'table-heading, table-thead, table-tbody, table-tfoot',
                'table-heading': 'heading, text',
                'table-thead': 'heading@6',
                'table-tbody': 'table-row-divider@6',
                'table-row-divider': 'table-row, divider',
                'table-row': 'table-cell@6',
                'table-cell': 'text',
                'table-tfoot': 'text@2, avatar@2',
                text: 'text',
                ...this.types,
            };
        },
    },
    methods: {
        genBone(text, children) {
            return this.$createElement('div', {
                staticClass: `v-skeleton-loader__${text} v-skeleton-loader__bone`,
            }, children);
        },
        genBones(bone) {
            // e.g. 'text@3'
            const [type, length] = bone.split('@');
            const generator = () => this.genStructure(type);
            // Generate a length array based upon
            // value after @ in the bone string
            return Array.from({ length }).map(generator);
        },
        // Fix type when this is merged
        // https://github.com/microsoft/TypeScript/pull/33050
        genStructure(type) {
            let children = [];
            type = type || this.type || '';
            const bone = this.rootTypes[type] || '';
            // End of recursion, do nothing
            /* eslint-disable-next-line no-empty, brace-style */
            if (type === bone) { }
            // Array of values - e.g. 'heading, paragraph, text@2'
            else if (type.indexOf(',') > -1)
                return this.mapBones(type);
            // Array of values - e.g. 'paragraph@4'
            else if (type.indexOf('@') > -1)
                return this.genBones(type);
            // Array of values - e.g. 'card@2'
            else if (bone.indexOf(',') > -1)
                children = this.mapBones(bone);
            // Array of values - e.g. 'list-item@2'
            else if (bone.indexOf('@') > -1)
                children = this.genBones(bone);
            // Single value - e.g. 'card-heading'
            else if (bone)
                children.push(this.genStructure(bone));
            return [this.genBone(type, children)];
        },
        genSkeleton() {
            const children = [];
            if (!this.isLoading)
                children.push(getSlot(this));
            else
                children.push(this.genStructure());
            /* istanbul ignore else */
            if (!this.transition)
                return children;
            /* istanbul ignore next */
            return this.$createElement('transition', {
                props: {
                    name: this.transition,
                },
                // Only show transition when
                // content has been loaded
                on: {
                    afterEnter: this.resetStyles,
                    beforeEnter: this.onBeforeEnter,
                    beforeLeave: this.onBeforeLeave,
                    leaveCancelled: this.resetStyles,
                },
            }, children);
        },
        mapBones(bones) {
            // Remove spaces and return array of structures
            return bones.replace(/\s/g, '').split(',').map(this.genStructure);
        },
        onBeforeEnter(el) {
            this.resetStyles(el);
            if (!this.isLoading)
                return;
            el._initialStyle = {
                display: el.style.display,
                transition: el.style.transition,
            };
            el.style.setProperty('transition', 'none', 'important');
        },
        onBeforeLeave(el) {
            el.style.setProperty('display', 'none', 'important');
        },
        resetStyles(el) {
            if (!el._initialStyle)
                return;
            el.style.display = el._initialStyle.display || '';
            el.style.transition = el._initialStyle.transition;
            delete el._initialStyle;
        },
    },
    render(h) {
        return h('div', {
            staticClass: 'v-skeleton-loader',
            attrs: this.attrs,
            on: this.$listeners,
            class: this.classes,
            style: this.isLoading ? this.measurableStyles : undefined,
        }, [this.genSkeleton()]);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNrZWxldG9uTG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVlNrZWxldG9uTG9hZGVyL1ZTa2VsZXRvbkxvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyx3QkFBd0IsQ0FBQTtBQUUvQixTQUFTO0FBQ1QsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxVQUFVLE1BQU0seUJBQXlCLENBQUE7QUFDaEQsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsWUFBWTtBQUNaLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBSXRDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQVU1QyxvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLFVBQVUsRUFDVixVQUFVLEVBQ1YsU0FBUyxDQUNWLENBQUMsTUFBTSxDQUFDO0lBQ1AsSUFBSSxFQUFFLGlCQUFpQjtJQUV2QixLQUFLLEVBQUU7UUFDTCxXQUFXLEVBQUUsT0FBTztRQUNwQixPQUFPLEVBQUUsT0FBTztRQUNoQixJQUFJLEVBQUUsT0FBTztRQUNiLFVBQVUsRUFBRSxNQUFNO1FBQ2xCLElBQUksRUFBRSxNQUFNO1FBQ1osS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDcUI7S0FDM0M7SUFFRCxRQUFRLEVBQUU7UUFDUixLQUFLO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtZQUV2QyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixXQUFXLEVBQUUsUUFBUTtnQkFDckIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsR0FB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QVcsQ0FBQyxDQUFBO1FBQ3RELENBQUM7UUFDRCxXQUFXLENBQUUsRUFBNkI7WUFDeEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhO2dCQUFFLE9BQU07WUFFN0IsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFBO1lBQ2pELEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFBO1lBRWpELE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQTtRQUN6QixDQUFDO0tBQ0Y7SUFFRCxNQUFNLENBQUUsQ0FBQztRQUNQLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUNkLFdBQVcsRUFBRSxtQkFBbUI7WUFDaEMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUztTQUMxRCxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUMxQixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVlNrZWxldG9uTG9hZGVyLnNhc3MnXG5cbi8vIE1peGluc1xuaW1wb3J0IEVsZXZhdGFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL2VsZXZhdGFibGUnXG5pbXBvcnQgTWVhc3VyYWJsZSBmcm9tICcuLi8uLi9taXhpbnMvbWVhc3VyYWJsZSdcbmltcG9ydCBUaGVtZWFibGUgZnJvbSAnLi4vLi4vbWl4aW5zL3RoZW1lYWJsZSdcblxuLy8gVXRpbGl0aWVzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBnZXRTbG90IH0gZnJvbSAnLi4vLi4vdXRpbC9oZWxwZXJzJ1xuaW1wb3J0IHsgUHJvcFZhbGlkYXRvciB9IGZyb20gJ3Z1ZS90eXBlcy9vcHRpb25zJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEhUTUxTa2VsZXRvbkxvYWRlckVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIF9pbml0aWFsU3R5bGU/OiB7XG4gICAgZGlzcGxheTogc3RyaW5nIHwgbnVsbFxuICAgIHRyYW5zaXRpb246IHN0cmluZ1xuICB9XG59XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIEVsZXZhdGFibGUsXG4gIE1lYXN1cmFibGUsXG4gIFRoZW1lYWJsZSxcbikuZXh0ZW5kKHtcbiAgbmFtZTogJ1ZTa2VsZXRvbkxvYWRlcicsXG5cbiAgcHJvcHM6IHtcbiAgICBib2lsZXJwbGF0ZTogQm9vbGVhbixcbiAgICBsb2FkaW5nOiBCb29sZWFuLFxuICAgIHRpbGU6IEJvb2xlYW4sXG4gICAgdHJhbnNpdGlvbjogU3RyaW5nLFxuICAgIHR5cGU6IFN0cmluZyxcbiAgICB0eXBlczoge1xuICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgZGVmYXVsdDogKCkgPT4gKHt9KSxcbiAgICB9IGFzIFByb3BWYWxpZGF0b3I8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4sXG4gIH0sXG5cbiAgY29tcHV0ZWQ6IHtcbiAgICBhdHRycyAoKTogb2JqZWN0IHtcbiAgICAgIGlmICghdGhpcy5pc0xvYWRpbmcpIHJldHVybiB0aGlzLiRhdHRyc1xuXG4gICAgICByZXR1cm4gIXRoaXMuYm9pbGVycGxhdGUgPyB7XG4gICAgICAgICdhcmlhLWJ1c3knOiB0cnVlLFxuICAgICAgICAnYXJpYS1saXZlJzogJ3BvbGl0ZScsXG4gICAgICAgIHJvbGU6ICdhbGVydCcsXG4gICAgICAgIC4uLnRoaXMuJGF0dHJzLFxuICAgICAgfSA6IHt9XG4gICAgfSxcbiAgICBjbGFzc2VzICgpOiBvYmplY3Qge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3Ytc2tlbGV0b24tbG9hZGVyLS1ib2lsZXJwbGF0ZSc6IHRoaXMuYm9pbGVycGxhdGUsXG4gICAgICAgICd2LXNrZWxldG9uLWxvYWRlci0taXMtbG9hZGluZyc6IHRoaXMuaXNMb2FkaW5nLFxuICAgICAgICAndi1za2VsZXRvbi1sb2FkZXItLXRpbGUnOiB0aGlzLnRpbGUsXG4gICAgICAgIC4uLnRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgICAuLi50aGlzLmVsZXZhdGlvbkNsYXNzZXMsXG4gICAgICB9XG4gICAgfSxcbiAgICBpc0xvYWRpbmcgKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuICEoJ2RlZmF1bHQnIGluIHRoaXMuJHNjb3BlZFNsb3RzKSB8fCB0aGlzLmxvYWRpbmdcbiAgICB9LFxuICAgIHJvb3RUeXBlcyAoKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhY3Rpb25zOiAnYnV0dG9uQDInLFxuICAgICAgICBhcnRpY2xlOiAnaGVhZGluZywgcGFyYWdyYXBoJyxcbiAgICAgICAgYXZhdGFyOiAnYXZhdGFyJyxcbiAgICAgICAgYnV0dG9uOiAnYnV0dG9uJyxcbiAgICAgICAgY2FyZDogJ2ltYWdlLCBjYXJkLWhlYWRpbmcnLFxuICAgICAgICAnY2FyZC1hdmF0YXInOiAnaW1hZ2UsIGxpc3QtaXRlbS1hdmF0YXInLFxuICAgICAgICAnY2FyZC1oZWFkaW5nJzogJ2hlYWRpbmcnLFxuICAgICAgICBjaGlwOiAnY2hpcCcsXG4gICAgICAgICdkYXRlLXBpY2tlcic6ICdsaXN0LWl0ZW0sIGNhcmQtaGVhZGluZywgZGl2aWRlciwgZGF0ZS1waWNrZXItb3B0aW9ucywgZGF0ZS1waWNrZXItZGF5cywgYWN0aW9ucycsXG4gICAgICAgICdkYXRlLXBpY2tlci1vcHRpb25zJzogJ3RleHQsIGF2YXRhckAyJyxcbiAgICAgICAgJ2RhdGUtcGlja2VyLWRheXMnOiAnYXZhdGFyQDI4JyxcbiAgICAgICAgaGVhZGluZzogJ2hlYWRpbmcnLFxuICAgICAgICBpbWFnZTogJ2ltYWdlJyxcbiAgICAgICAgJ2xpc3QtaXRlbSc6ICd0ZXh0JyxcbiAgICAgICAgJ2xpc3QtaXRlbS1hdmF0YXInOiAnYXZhdGFyLCB0ZXh0JyxcbiAgICAgICAgJ2xpc3QtaXRlbS10d28tbGluZSc6ICdzZW50ZW5jZXMnLFxuICAgICAgICAnbGlzdC1pdGVtLWF2YXRhci10d28tbGluZSc6ICdhdmF0YXIsIHNlbnRlbmNlcycsXG4gICAgICAgICdsaXN0LWl0ZW0tdGhyZWUtbGluZSc6ICdwYXJhZ3JhcGgnLFxuICAgICAgICAnbGlzdC1pdGVtLWF2YXRhci10aHJlZS1saW5lJzogJ2F2YXRhciwgcGFyYWdyYXBoJyxcbiAgICAgICAgcGFyYWdyYXBoOiAndGV4dEAzJyxcbiAgICAgICAgc2VudGVuY2VzOiAndGV4dEAyJyxcbiAgICAgICAgdGFibGU6ICd0YWJsZS1oZWFkaW5nLCB0YWJsZS10aGVhZCwgdGFibGUtdGJvZHksIHRhYmxlLXRmb290JyxcbiAgICAgICAgJ3RhYmxlLWhlYWRpbmcnOiAnaGVhZGluZywgdGV4dCcsXG4gICAgICAgICd0YWJsZS10aGVhZCc6ICdoZWFkaW5nQDYnLFxuICAgICAgICAndGFibGUtdGJvZHknOiAndGFibGUtcm93LWRpdmlkZXJANicsXG4gICAgICAgICd0YWJsZS1yb3ctZGl2aWRlcic6ICd0YWJsZS1yb3csIGRpdmlkZXInLFxuICAgICAgICAndGFibGUtcm93JzogJ3RhYmxlLWNlbGxANicsXG4gICAgICAgICd0YWJsZS1jZWxsJzogJ3RleHQnLFxuICAgICAgICAndGFibGUtdGZvb3QnOiAndGV4dEAyLCBhdmF0YXJAMicsXG4gICAgICAgIHRleHQ6ICd0ZXh0JyxcbiAgICAgICAgLi4udGhpcy50eXBlcyxcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBnZW5Cb25lICh0ZXh0OiBzdHJpbmcsIGNoaWxkcmVuOiBWTm9kZVtdKSB7XG4gICAgICByZXR1cm4gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogYHYtc2tlbGV0b24tbG9hZGVyX18ke3RleHR9IHYtc2tlbGV0b24tbG9hZGVyX19ib25lYCxcbiAgICAgIH0sIGNoaWxkcmVuKVxuICAgIH0sXG4gICAgZ2VuQm9uZXMgKGJvbmU6IHN0cmluZyk6IFZOb2RlW10ge1xuICAgICAgLy8gZS5nLiAndGV4dEAzJ1xuICAgICAgY29uc3QgW3R5cGUsIGxlbmd0aF0gPSBib25lLnNwbGl0KCdAJykgYXMgW3N0cmluZywgbnVtYmVyXVxuICAgICAgY29uc3QgZ2VuZXJhdG9yID0gKCkgPT4gdGhpcy5nZW5TdHJ1Y3R1cmUodHlwZSlcblxuICAgICAgLy8gR2VuZXJhdGUgYSBsZW5ndGggYXJyYXkgYmFzZWQgdXBvblxuICAgICAgLy8gdmFsdWUgYWZ0ZXIgQCBpbiB0aGUgYm9uZSBzdHJpbmdcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoIH0pLm1hcChnZW5lcmF0b3IpXG4gICAgfSxcbiAgICAvLyBGaXggdHlwZSB3aGVuIHRoaXMgaXMgbWVyZ2VkXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L3B1bGwvMzMwNTBcbiAgICBnZW5TdHJ1Y3R1cmUgKHR5cGU/OiBzdHJpbmcpOiBhbnkge1xuICAgICAgbGV0IGNoaWxkcmVuID0gW11cbiAgICAgIHR5cGUgPSB0eXBlIHx8IHRoaXMudHlwZSB8fCAnJ1xuICAgICAgY29uc3QgYm9uZSA9IHRoaXMucm9vdFR5cGVzW3R5cGVdIHx8ICcnXG5cbiAgICAgIC8vIEVuZCBvZiByZWN1cnNpb24sIGRvIG5vdGhpbmdcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lbXB0eSwgYnJhY2Utc3R5bGUgKi9cbiAgICAgIGlmICh0eXBlID09PSBib25lKSB7fVxuICAgICAgLy8gQXJyYXkgb2YgdmFsdWVzIC0gZS5nLiAnaGVhZGluZywgcGFyYWdyYXBoLCB0ZXh0QDInXG4gICAgICBlbHNlIGlmICh0eXBlLmluZGV4T2YoJywnKSA+IC0xKSByZXR1cm4gdGhpcy5tYXBCb25lcyh0eXBlKVxuICAgICAgLy8gQXJyYXkgb2YgdmFsdWVzIC0gZS5nLiAncGFyYWdyYXBoQDQnXG4gICAgICBlbHNlIGlmICh0eXBlLmluZGV4T2YoJ0AnKSA+IC0xKSByZXR1cm4gdGhpcy5nZW5Cb25lcyh0eXBlKVxuICAgICAgLy8gQXJyYXkgb2YgdmFsdWVzIC0gZS5nLiAnY2FyZEAyJ1xuICAgICAgZWxzZSBpZiAoYm9uZS5pbmRleE9mKCcsJykgPiAtMSkgY2hpbGRyZW4gPSB0aGlzLm1hcEJvbmVzKGJvbmUpXG4gICAgICAvLyBBcnJheSBvZiB2YWx1ZXMgLSBlLmcuICdsaXN0LWl0ZW1AMidcbiAgICAgIGVsc2UgaWYgKGJvbmUuaW5kZXhPZignQCcpID4gLTEpIGNoaWxkcmVuID0gdGhpcy5nZW5Cb25lcyhib25lKVxuICAgICAgLy8gU2luZ2xlIHZhbHVlIC0gZS5nLiAnY2FyZC1oZWFkaW5nJ1xuICAgICAgZWxzZSBpZiAoYm9uZSkgY2hpbGRyZW4ucHVzaCh0aGlzLmdlblN0cnVjdHVyZShib25lKSlcblxuICAgICAgcmV0dXJuIFt0aGlzLmdlbkJvbmUodHlwZSwgY2hpbGRyZW4pXVxuICAgIH0sXG4gICAgZ2VuU2tlbGV0b24gKCkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbXVxuXG4gICAgICBpZiAoIXRoaXMuaXNMb2FkaW5nKSBjaGlsZHJlbi5wdXNoKGdldFNsb3QodGhpcykpXG4gICAgICBlbHNlIGNoaWxkcmVuLnB1c2godGhpcy5nZW5TdHJ1Y3R1cmUoKSlcblxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmICghdGhpcy50cmFuc2l0aW9uKSByZXR1cm4gY2hpbGRyZW5cblxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCd0cmFuc2l0aW9uJywge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgIG5hbWU6IHRoaXMudHJhbnNpdGlvbixcbiAgICAgICAgfSxcbiAgICAgICAgLy8gT25seSBzaG93IHRyYW5zaXRpb24gd2hlblxuICAgICAgICAvLyBjb250ZW50IGhhcyBiZWVuIGxvYWRlZFxuICAgICAgICBvbjoge1xuICAgICAgICAgIGFmdGVyRW50ZXI6IHRoaXMucmVzZXRTdHlsZXMsXG4gICAgICAgICAgYmVmb3JlRW50ZXI6IHRoaXMub25CZWZvcmVFbnRlcixcbiAgICAgICAgICBiZWZvcmVMZWF2ZTogdGhpcy5vbkJlZm9yZUxlYXZlLFxuICAgICAgICAgIGxlYXZlQ2FuY2VsbGVkOiB0aGlzLnJlc2V0U3R5bGVzLFxuICAgICAgICB9LFxuICAgICAgfSwgY2hpbGRyZW4pXG4gICAgfSxcbiAgICBtYXBCb25lcyAoYm9uZXM6IHN0cmluZykge1xuICAgICAgLy8gUmVtb3ZlIHNwYWNlcyBhbmQgcmV0dXJuIGFycmF5IG9mIHN0cnVjdHVyZXNcbiAgICAgIHJldHVybiBib25lcy5yZXBsYWNlKC9cXHMvZywgJycpLnNwbGl0KCcsJykubWFwKHRoaXMuZ2VuU3RydWN0dXJlKVxuICAgIH0sXG4gICAgb25CZWZvcmVFbnRlciAoZWw6IEhUTUxTa2VsZXRvbkxvYWRlckVsZW1lbnQpIHtcbiAgICAgIHRoaXMucmVzZXRTdHlsZXMoZWwpXG5cbiAgICAgIGlmICghdGhpcy5pc0xvYWRpbmcpIHJldHVyblxuXG4gICAgICBlbC5faW5pdGlhbFN0eWxlID0ge1xuICAgICAgICBkaXNwbGF5OiBlbC5zdHlsZS5kaXNwbGF5LFxuICAgICAgICB0cmFuc2l0aW9uOiBlbC5zdHlsZS50cmFuc2l0aW9uLFxuICAgICAgfVxuXG4gICAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eSgndHJhbnNpdGlvbicsICdub25lJywgJ2ltcG9ydGFudCcpXG4gICAgfSxcbiAgICBvbkJlZm9yZUxlYXZlIChlbDogSFRNTFNrZWxldG9uTG9hZGVyRWxlbWVudCkge1xuICAgICAgZWwuc3R5bGUuc2V0UHJvcGVydHkoJ2Rpc3BsYXknLCAnbm9uZScsICdpbXBvcnRhbnQnKVxuICAgIH0sXG4gICAgcmVzZXRTdHlsZXMgKGVsOiBIVE1MU2tlbGV0b25Mb2FkZXJFbGVtZW50KSB7XG4gICAgICBpZiAoIWVsLl9pbml0aWFsU3R5bGUpIHJldHVyblxuXG4gICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gZWwuX2luaXRpYWxTdHlsZS5kaXNwbGF5IHx8ICcnXG4gICAgICBlbC5zdHlsZS50cmFuc2l0aW9uID0gZWwuX2luaXRpYWxTdHlsZS50cmFuc2l0aW9uXG5cbiAgICAgIGRlbGV0ZSBlbC5faW5pdGlhbFN0eWxlXG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0YXRpY0NsYXNzOiAndi1za2VsZXRvbi1sb2FkZXInLFxuICAgICAgYXR0cnM6IHRoaXMuYXR0cnMsXG4gICAgICBvbjogdGhpcy4kbGlzdGVuZXJzLFxuICAgICAgY2xhc3M6IHRoaXMuY2xhc3NlcyxcbiAgICAgIHN0eWxlOiB0aGlzLmlzTG9hZGluZyA/IHRoaXMubWVhc3VyYWJsZVN0eWxlcyA6IHVuZGVmaW5lZCxcbiAgICB9LCBbdGhpcy5nZW5Ta2VsZXRvbigpXSlcbiAgfSxcbn0pXG4iXX0=
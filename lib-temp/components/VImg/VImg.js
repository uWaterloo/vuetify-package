// Styles
import './VImg.sass';
// Directives
import intersect from '../../directives/intersect';
// Components
import VResponsive from '../VResponsive';
// Mixins
import Themeable from '../../mixins/themeable';
// Utils
import mixins from '../../util/mixins';
import mergeData from '../../util/mergeData';
import { consoleWarn } from '../../util/console';
import { getSlot } from '../../util/helpers';
const hasIntersect = typeof window !== 'undefined' && 'IntersectionObserver' in window;
/* @vue/component */
export default mixins(VResponsive, Themeable).extend({
    name: 'v-img',
    directives: { intersect },
    props: {
        alt: String,
        contain: Boolean,
        eager: Boolean,
        gradient: String,
        lazySrc: String,
        options: {
            type: Object,
            // For more information on types, navigate to:
            // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
            default: () => ({
                root: undefined,
                rootMargin: undefined,
                threshold: undefined,
            }),
        },
        position: {
            type: String,
            default: 'center center',
        },
        sizes: String,
        src: {
            type: [String, Object],
            default: '',
        },
        srcset: String,
        transition: {
            type: [Boolean, String],
            default: 'fade-transition',
        },
    },
    data() {
        return {
            currentSrc: '',
            image: null,
            isLoading: true,
            calculatedAspectRatio: undefined,
            naturalWidth: undefined,
            hasError: false,
        };
    },
    computed: {
        computedAspectRatio() {
            return Number(this.normalisedSrc.aspect || this.calculatedAspectRatio);
        },
        normalisedSrc() {
            return this.src && typeof this.src === 'object'
                ? {
                    src: this.src.src,
                    srcset: this.srcset || this.src.srcset,
                    lazySrc: this.lazySrc || this.src.lazySrc,
                    aspect: Number(this.aspectRatio || this.src.aspect),
                } : {
                src: this.src,
                srcset: this.srcset,
                lazySrc: this.lazySrc,
                aspect: Number(this.aspectRatio || 0),
            };
        },
        __cachedImage() {
            if (!(this.normalisedSrc.src || this.normalisedSrc.lazySrc || this.gradient))
                return [];
            const backgroundImage = [];
            const src = this.isLoading ? this.normalisedSrc.lazySrc : this.currentSrc;
            if (this.gradient)
                backgroundImage.push(`linear-gradient(${this.gradient})`);
            if (src)
                backgroundImage.push(`url("${src}")`);
            const image = this.$createElement('div', {
                staticClass: 'v-image__image',
                class: {
                    'v-image__image--preload': this.isLoading,
                    'v-image__image--contain': this.contain,
                    'v-image__image--cover': !this.contain,
                },
                style: {
                    backgroundImage: backgroundImage.join(', '),
                    backgroundPosition: this.position,
                },
                key: +this.isLoading,
            });
            /* istanbul ignore if */
            if (!this.transition)
                return image;
            return this.$createElement('transition', {
                attrs: {
                    name: this.transition,
                    mode: 'in-out',
                },
            }, [image]);
        },
    },
    watch: {
        src() {
            // Force re-init when src changes
            if (!this.isLoading)
                this.init(undefined, undefined, true);
            else
                this.loadImage();
        },
        '$vuetify.breakpoint.width': 'getSrc',
    },
    mounted() {
        this.init();
    },
    methods: {
        init(entries, observer, isIntersecting) {
            // If the current browser supports the intersection
            // observer api, the image is not observable, and
            // the eager prop isn't being used, do not load
            if (hasIntersect &&
                !isIntersecting &&
                !this.eager)
                return;
            if (this.normalisedSrc.lazySrc) {
                const lazyImg = new Image();
                lazyImg.src = this.normalisedSrc.lazySrc;
                this.pollForSize(lazyImg, null);
            }
            /* istanbul ignore else */
            if (this.normalisedSrc.src)
                this.loadImage();
        },
        onLoad() {
            this.getSrc();
            this.isLoading = false;
            this.$emit('load', this.src);
            if (this.image &&
                (this.normalisedSrc.src.endsWith('.svg') || this.normalisedSrc.src.startsWith('data:image/svg+xml'))) {
                if (this.image.naturalHeight && this.image.naturalWidth) {
                    this.naturalWidth = this.image.naturalWidth;
                    this.calculatedAspectRatio = this.image.naturalWidth / this.image.naturalHeight;
                }
                else {
                    this.calculatedAspectRatio = 1;
                }
            }
        },
        onError() {
            this.hasError = true;
            this.$emit('error', this.src);
        },
        getSrc() {
            /* istanbul ignore else */
            if (this.image)
                this.currentSrc = this.image.currentSrc || this.image.src;
        },
        loadImage() {
            const image = new Image();
            this.image = image;
            image.onload = () => {
                /* istanbul ignore if */
                if (image.decode) {
                    image.decode().catch((err) => {
                        consoleWarn(`Failed to decode image, trying to render anyway\n\n` +
                            `src: ${this.normalisedSrc.src}` +
                            (err.message ? `\nOriginal error: ${err.message}` : ''), this);
                    }).then(this.onLoad);
                }
                else {
                    this.onLoad();
                }
            };
            image.onerror = this.onError;
            this.hasError = false;
            this.sizes && (image.sizes = this.sizes);
            this.normalisedSrc.srcset && (image.srcset = this.normalisedSrc.srcset);
            image.src = this.normalisedSrc.src;
            this.$emit('loadstart', this.normalisedSrc.src);
            this.aspectRatio || this.pollForSize(image);
            this.getSrc();
        },
        pollForSize(img, timeout = 100) {
            const poll = () => {
                const { naturalHeight, naturalWidth } = img;
                if (naturalHeight || naturalWidth) {
                    this.naturalWidth = naturalWidth;
                    this.calculatedAspectRatio = naturalWidth / naturalHeight;
                }
                else if (!img.complete && this.isLoading && !this.hasError && timeout != null) {
                    setTimeout(poll, timeout);
                }
            };
            poll();
        },
        genContent() {
            const content = VResponsive.options.methods.genContent.call(this);
            if (this.naturalWidth) {
                this._b(content.data, 'div', {
                    style: { width: `${this.naturalWidth}px` },
                });
            }
            return content;
        },
        __genPlaceholder() {
            const slot = getSlot(this, 'placeholder');
            if (slot) {
                const placeholder = this.isLoading
                    ? [this.$createElement('div', {
                            staticClass: 'v-image__placeholder',
                        }, slot)]
                    : [];
                if (!this.transition)
                    return placeholder[0];
                return this.$createElement('transition', {
                    props: {
                        appear: true,
                        name: this.transition,
                    },
                }, placeholder);
            }
        },
    },
    render(h) {
        const node = VResponsive.options.render.call(this, h);
        const data = mergeData(node.data, {
            staticClass: 'v-image',
            attrs: {
                'aria-label': this.alt,
                role: this.alt ? 'img' : undefined,
            },
            class: this.themeClasses,
            // Only load intersect directive if it
            // will work in the current browser.
            directives: hasIntersect
                ? [{
                        name: 'intersect',
                        modifiers: { once: true },
                        value: {
                            handler: this.init,
                            options: this.options,
                        },
                    }]
                : undefined,
        });
        node.children = [
            this.__cachedSizer,
            this.__cachedImage,
            this.__genPlaceholder(),
            this.genContent(),
        ];
        return h(node.tag, data, node.children);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkltZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1ZJbWcvVkltZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTO0FBQ1QsT0FBTyxhQUFhLENBQUE7QUFFcEIsYUFBYTtBQUNiLE9BQU8sU0FBUyxNQUFNLDRCQUE0QixDQUFBO0FBTWxELGFBQWE7QUFDYixPQUFPLFdBQVcsTUFBTSxnQkFBZ0IsQ0FBQTtBQUV4QyxTQUFTO0FBQ1QsT0FBTyxTQUFTLE1BQU0sd0JBQXdCLENBQUE7QUFFOUMsUUFBUTtBQUNSLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sU0FBUyxNQUFNLHNCQUFzQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNoRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUE7QUFVNUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLHNCQUFzQixJQUFJLE1BQU0sQ0FBQTtBQUV0RixvQkFBb0I7QUFDcEIsZUFBZSxNQUFNLENBQ25CLFdBQVcsRUFDWCxTQUFTLENBQ1YsQ0FBQyxNQUFNLENBQUM7SUFDUCxJQUFJLEVBQUUsT0FBTztJQUViLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRTtJQUV6QixLQUFLLEVBQUU7UUFDTCxHQUFHLEVBQUUsTUFBTTtRQUNYLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsUUFBUSxFQUFFLE1BQU07UUFDaEIsT0FBTyxFQUFFLE1BQU07UUFDZixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsTUFBTTtZQUNaLDhDQUE4QztZQUM5Qyw2RUFBNkU7WUFDN0UsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLFNBQVMsRUFB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QUFDLENBQUMsQ0FBQzt3QkFDRCxJQUFJLEVBQUUsV0FBVzt3QkFDakIsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTt3QkFDekIsS0FBSyxFQUFFOzRCQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSTs0QkFDbEIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO3lCQUN0QjtxQkFDRixDQUFDO2dCQUNGLENBQUMsQ0FBQyxTQUFTO1NBQ2QsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNkLElBQUksQ0FBQyxhQUFhO1lBQ2xCLElBQUksQ0FBQyxhQUFhO1lBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUN2QixJQUFJLENBQUMsVUFBVSxFQUFFO1NBQ1AsQ0FBQTtRQUVaLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R5bGVzXG5pbXBvcnQgJy4vVkltZy5zYXNzJ1xuXG4vLyBEaXJlY3RpdmVzXG5pbXBvcnQgaW50ZXJzZWN0IGZyb20gJy4uLy4uL2RpcmVjdGl2ZXMvaW50ZXJzZWN0J1xuXG4vLyBUeXBlc1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgeyBQcm9wVmFsaWRhdG9yIH0gZnJvbSAndnVlL3R5cGVzL29wdGlvbnMnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBWUmVzcG9uc2l2ZSBmcm9tICcuLi9WUmVzcG9uc2l2ZSdcblxuLy8gTWl4aW5zXG5pbXBvcnQgVGhlbWVhYmxlIGZyb20gJy4uLy4uL21peGlucy90aGVtZWFibGUnXG5cbi8vIFV0aWxzXG5pbXBvcnQgbWl4aW5zIGZyb20gJy4uLy4uL3V0aWwvbWl4aW5zJ1xuaW1wb3J0IG1lcmdlRGF0YSBmcm9tICcuLi8uLi91dGlsL21lcmdlRGF0YSdcbmltcG9ydCB7IGNvbnNvbGVXYXJuIH0gZnJvbSAnLi4vLi4vdXRpbC9jb25zb2xlJ1xuaW1wb3J0IHsgZ2V0U2xvdCB9IGZyb20gJy4uLy4uL3V0aWwvaGVscGVycydcblxuLy8gbm90IGludGVuZGVkIGZvciBwdWJsaWMgdXNlLCB0aGlzIGlzIHBhc3NlZCBpbiBieSB2dWV0aWZ5LWxvYWRlclxuZXhwb3J0IGludGVyZmFjZSBzcmNPYmplY3Qge1xuICBzcmM6IHN0cmluZ1xuICBzcmNzZXQ/OiBzdHJpbmdcbiAgbGF6eVNyYzogc3RyaW5nXG4gIGFzcGVjdDogbnVtYmVyXG59XG5cbmNvbnN0IGhhc0ludGVyc2VjdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICdJbnRlcnNlY3Rpb25PYnNlcnZlcicgaW4gd2luZG93XG5cbi8qIEB2dWUvY29tcG9uZW50ICovXG5leHBvcnQgZGVmYXVsdCBtaXhpbnMoXG4gIFZSZXNwb25zaXZlLFxuICBUaGVtZWFibGUsXG4pLmV4dGVuZCh7XG4gIG5hbWU6ICd2LWltZycsXG5cbiAgZGlyZWN0aXZlczogeyBpbnRlcnNlY3QgfSxcblxuICBwcm9wczoge1xuICAgIGFsdDogU3RyaW5nLFxuICAgIGNvbnRhaW46IEJvb2xlYW4sXG4gICAgZWFnZXI6IEJvb2xlYW4sXG4gICAgZ3JhZGllbnQ6IFN0cmluZyxcbiAgICBsYXp5U3JjOiBTdHJpbmcsXG4gICAgb3B0aW9uczoge1xuICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdHlwZXMsIG5hdmlnYXRlIHRvOlxuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0ludGVyc2VjdGlvbl9PYnNlcnZlcl9BUElcbiAgICAgIGRlZmF1bHQ6ICgpID0+ICh7XG4gICAgICAgIHJvb3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgcm9vdE1hcmdpbjogdW5kZWZpbmVkLFxuICAgICAgICB0aHJlc2hvbGQ6IHVuZGVmaW5lZCxcbiAgICAgIH0pLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxJbnRlcnNlY3Rpb25PYnNlcnZlckluaXQ+LFxuICAgIHBvc2l0aW9uOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnY2VudGVyIGNlbnRlcicsXG4gICAgfSxcbiAgICBzaXplczogU3RyaW5nLFxuICAgIHNyYzoge1xuICAgICAgdHlwZTogW1N0cmluZywgT2JqZWN0XSxcbiAgICAgIGRlZmF1bHQ6ICcnLFxuICAgIH0gYXMgUHJvcFZhbGlkYXRvcjxzdHJpbmcgfCBzcmNPYmplY3Q+LFxuICAgIHNyY3NldDogU3RyaW5nLFxuICAgIHRyYW5zaXRpb246IHtcbiAgICAgIHR5cGU6IFtCb29sZWFuLCBTdHJpbmddLFxuICAgICAgZGVmYXVsdDogJ2ZhZGUtdHJhbnNpdGlvbicsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVudFNyYzogJycsIC8vIFNldCBmcm9tIHNyY3NldFxuICAgICAgaW1hZ2U6IG51bGwgYXMgSFRNTEltYWdlRWxlbWVudCB8IG51bGwsXG4gICAgICBpc0xvYWRpbmc6IHRydWUsXG4gICAgICBjYWxjdWxhdGVkQXNwZWN0UmF0aW86IHVuZGVmaW5lZCBhcyBudW1iZXIgfCB1bmRlZmluZWQsXG4gICAgICBuYXR1cmFsV2lkdGg6IHVuZGVmaW5lZCBhcyBudW1iZXIgfCB1bmRlZmluZWQsXG4gICAgICBoYXNFcnJvcjogZmFsc2UsXG4gICAgfVxuICB9LFxuXG4gIGNvbXB1dGVkOiB7XG4gICAgY29tcHV0ZWRBc3BlY3RSYXRpbyAoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBOdW1iZXIodGhpcy5ub3JtYWxpc2VkU3JjLmFzcGVjdCB8fCB0aGlzLmNhbGN1bGF0ZWRBc3BlY3RSYXRpbylcbiAgICB9LFxuICAgIG5vcm1hbGlzZWRTcmMgKCk6IHNyY09iamVjdCB7XG4gICAgICByZXR1cm4gdGhpcy5zcmMgJiYgdHlwZW9mIHRoaXMuc3JjID09PSAnb2JqZWN0J1xuICAgICAgICA/IHtcbiAgICAgICAgICBzcmM6IHRoaXMuc3JjLnNyYyxcbiAgICAgICAgICBzcmNzZXQ6IHRoaXMuc3Jjc2V0IHx8IHRoaXMuc3JjLnNyY3NldCxcbiAgICAgICAgICBsYXp5U3JjOiB0aGlzLmxhenlTcmMgfHwgdGhpcy5zcmMubGF6eVNyYyxcbiAgICAgICAgICBhc3BlY3Q6IE51bWJlcih0aGlzLmFzcGVjdFJhdGlvIHx8IHRoaXMuc3JjLmFzcGVjdCksXG4gICAgICAgIH0gOiB7XG4gICAgICAgICAgc3JjOiB0aGlzLnNyYyxcbiAgICAgICAgICBzcmNzZXQ6IHRoaXMuc3Jjc2V0LFxuICAgICAgICAgIGxhenlTcmM6IHRoaXMubGF6eVNyYyxcbiAgICAgICAgICBhc3BlY3Q6IE51bWJlcih0aGlzLmFzcGVjdFJhdGlvIHx8IDApLFxuICAgICAgICB9XG4gICAgfSxcbiAgICBfX2NhY2hlZEltYWdlICgpOiBWTm9kZSB8IFtdIHtcbiAgICAgIGlmICghKHRoaXMubm9ybWFsaXNlZFNyYy5zcmMgfHwgdGhpcy5ub3JtYWxpc2VkU3JjLmxhenlTcmMgfHwgdGhpcy5ncmFkaWVudCkpIHJldHVybiBbXVxuXG4gICAgICBjb25zdCBiYWNrZ3JvdW5kSW1hZ2U6IHN0cmluZ1tdID0gW11cbiAgICAgIGNvbnN0IHNyYyA9IHRoaXMuaXNMb2FkaW5nID8gdGhpcy5ub3JtYWxpc2VkU3JjLmxhenlTcmMgOiB0aGlzLmN1cnJlbnRTcmNcblxuICAgICAgaWYgKHRoaXMuZ3JhZGllbnQpIGJhY2tncm91bmRJbWFnZS5wdXNoKGBsaW5lYXItZ3JhZGllbnQoJHt0aGlzLmdyYWRpZW50fSlgKVxuICAgICAgaWYgKHNyYykgYmFja2dyb3VuZEltYWdlLnB1c2goYHVybChcIiR7c3JjfVwiKWApXG5cbiAgICAgIGNvbnN0IGltYWdlID0gdGhpcy4kY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBzdGF0aWNDbGFzczogJ3YtaW1hZ2VfX2ltYWdlJyxcbiAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAndi1pbWFnZV9faW1hZ2UtLXByZWxvYWQnOiB0aGlzLmlzTG9hZGluZyxcbiAgICAgICAgICAndi1pbWFnZV9faW1hZ2UtLWNvbnRhaW4nOiB0aGlzLmNvbnRhaW4sXG4gICAgICAgICAgJ3YtaW1hZ2VfX2ltYWdlLS1jb3Zlcic6ICF0aGlzLmNvbnRhaW4sXG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBiYWNrZ3JvdW5kSW1hZ2Uuam9pbignLCAnKSxcbiAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IHRoaXMucG9zaXRpb24sXG4gICAgICAgIH0sXG4gICAgICAgIGtleTogK3RoaXMuaXNMb2FkaW5nLFxuICAgICAgfSlcblxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoIXRoaXMudHJhbnNpdGlvbikgcmV0dXJuIGltYWdlXG5cbiAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCd0cmFuc2l0aW9uJywge1xuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIG5hbWU6IHRoaXMudHJhbnNpdGlvbixcbiAgICAgICAgICBtb2RlOiAnaW4tb3V0JyxcbiAgICAgICAgfSxcbiAgICAgIH0sIFtpbWFnZV0pXG4gICAgfSxcbiAgfSxcblxuICB3YXRjaDoge1xuICAgIHNyYyAoKSB7XG4gICAgICAvLyBGb3JjZSByZS1pbml0IHdoZW4gc3JjIGNoYW5nZXNcbiAgICAgIGlmICghdGhpcy5pc0xvYWRpbmcpIHRoaXMuaW5pdCh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICAgIGVsc2UgdGhpcy5sb2FkSW1hZ2UoKVxuICAgIH0sXG4gICAgJyR2dWV0aWZ5LmJyZWFrcG9pbnQud2lkdGgnOiAnZ2V0U3JjJyxcbiAgfSxcblxuICBtb3VudGVkICgpIHtcbiAgICB0aGlzLmluaXQoKVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBpbml0IChcbiAgICAgIGVudHJpZXM/OiBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5W10sXG4gICAgICBvYnNlcnZlcj86IEludGVyc2VjdGlvbk9ic2VydmVyLFxuICAgICAgaXNJbnRlcnNlY3Rpbmc/OiBib29sZWFuXG4gICAgKSB7XG4gICAgICAvLyBJZiB0aGUgY3VycmVudCBicm93c2VyIHN1cHBvcnRzIHRoZSBpbnRlcnNlY3Rpb25cbiAgICAgIC8vIG9ic2VydmVyIGFwaSwgdGhlIGltYWdlIGlzIG5vdCBvYnNlcnZhYmxlLCBhbmRcbiAgICAgIC8vIHRoZSBlYWdlciBwcm9wIGlzbid0IGJlaW5nIHVzZWQsIGRvIG5vdCBsb2FkXG4gICAgICBpZiAoXG4gICAgICAgIGhhc0ludGVyc2VjdCAmJlxuICAgICAgICAhaXNJbnRlcnNlY3RpbmcgJiZcbiAgICAgICAgIXRoaXMuZWFnZXJcbiAgICAgICkgcmV0dXJuXG5cbiAgICAgIGlmICh0aGlzLm5vcm1hbGlzZWRTcmMubGF6eVNyYykge1xuICAgICAgICBjb25zdCBsYXp5SW1nID0gbmV3IEltYWdlKClcbiAgICAgICAgbGF6eUltZy5zcmMgPSB0aGlzLm5vcm1hbGlzZWRTcmMubGF6eVNyY1xuICAgICAgICB0aGlzLnBvbGxGb3JTaXplKGxhenlJbWcsIG51bGwpXG4gICAgICB9XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKHRoaXMubm9ybWFsaXNlZFNyYy5zcmMpIHRoaXMubG9hZEltYWdlKClcbiAgICB9LFxuICAgIG9uTG9hZCAoKSB7XG4gICAgICB0aGlzLmdldFNyYygpXG4gICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlXG4gICAgICB0aGlzLiRlbWl0KCdsb2FkJywgdGhpcy5zcmMpXG5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5pbWFnZSAmJlxuICAgICAgICAodGhpcy5ub3JtYWxpc2VkU3JjLnNyYy5lbmRzV2l0aCgnLnN2ZycpIHx8IHRoaXMubm9ybWFsaXNlZFNyYy5zcmMuc3RhcnRzV2l0aCgnZGF0YTppbWFnZS9zdmcreG1sJykpXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2UubmF0dXJhbEhlaWdodCAmJiB0aGlzLmltYWdlLm5hdHVyYWxXaWR0aCkge1xuICAgICAgICAgIHRoaXMubmF0dXJhbFdpZHRoID0gdGhpcy5pbWFnZS5uYXR1cmFsV2lkdGhcbiAgICAgICAgICB0aGlzLmNhbGN1bGF0ZWRBc3BlY3RSYXRpbyA9IHRoaXMuaW1hZ2UubmF0dXJhbFdpZHRoIC8gdGhpcy5pbWFnZS5uYXR1cmFsSGVpZ2h0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5jYWxjdWxhdGVkQXNwZWN0UmF0aW8gPSAxXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG9uRXJyb3IgKCkge1xuICAgICAgdGhpcy5oYXNFcnJvciA9IHRydWVcbiAgICAgIHRoaXMuJGVtaXQoJ2Vycm9yJywgdGhpcy5zcmMpXG4gICAgfSxcbiAgICBnZXRTcmMgKCkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmICh0aGlzLmltYWdlKSB0aGlzLmN1cnJlbnRTcmMgPSB0aGlzLmltYWdlLmN1cnJlbnRTcmMgfHwgdGhpcy5pbWFnZS5zcmNcbiAgICB9LFxuICAgIGxvYWRJbWFnZSAoKSB7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpXG4gICAgICB0aGlzLmltYWdlID0gaW1hZ2VcblxuICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKGltYWdlLmRlY29kZSkge1xuICAgICAgICAgIGltYWdlLmRlY29kZSgpLmNhdGNoKChlcnI6IERPTUV4Y2VwdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc29sZVdhcm4oXG4gICAgICAgICAgICAgIGBGYWlsZWQgdG8gZGVjb2RlIGltYWdlLCB0cnlpbmcgdG8gcmVuZGVyIGFueXdheVxcblxcbmAgK1xuICAgICAgICAgICAgICBgc3JjOiAke3RoaXMubm9ybWFsaXNlZFNyYy5zcmN9YCArXG4gICAgICAgICAgICAgIChlcnIubWVzc2FnZSA/IGBcXG5PcmlnaW5hbCBlcnJvcjogJHtlcnIubWVzc2FnZX1gIDogJycpLFxuICAgICAgICAgICAgICB0aGlzXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSkudGhlbih0aGlzLm9uTG9hZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLm9uTG9hZCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGltYWdlLm9uZXJyb3IgPSB0aGlzLm9uRXJyb3JcblxuICAgICAgdGhpcy5oYXNFcnJvciA9IGZhbHNlXG4gICAgICB0aGlzLnNpemVzICYmIChpbWFnZS5zaXplcyA9IHRoaXMuc2l6ZXMpXG4gICAgICB0aGlzLm5vcm1hbGlzZWRTcmMuc3Jjc2V0ICYmIChpbWFnZS5zcmNzZXQgPSB0aGlzLm5vcm1hbGlzZWRTcmMuc3Jjc2V0KVxuICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5ub3JtYWxpc2VkU3JjLnNyY1xuICAgICAgdGhpcy4kZW1pdCgnbG9hZHN0YXJ0JywgdGhpcy5ub3JtYWxpc2VkU3JjLnNyYylcblxuICAgICAgdGhpcy5hc3BlY3RSYXRpbyB8fCB0aGlzLnBvbGxGb3JTaXplKGltYWdlKVxuICAgICAgdGhpcy5nZXRTcmMoKVxuICAgIH0sXG4gICAgcG9sbEZvclNpemUgKGltZzogSFRNTEltYWdlRWxlbWVudCwgdGltZW91dDogbnVtYmVyIHwgbnVsbCA9IDEwMCkge1xuICAgICAgY29uc3QgcG9sbCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgeyBuYXR1cmFsSGVpZ2h0LCBuYXR1cmFsV2lkdGggfSA9IGltZ1xuXG4gICAgICAgIGlmIChuYXR1cmFsSGVpZ2h0IHx8IG5hdHVyYWxXaWR0aCkge1xuICAgICAgICAgIHRoaXMubmF0dXJhbFdpZHRoID0gbmF0dXJhbFdpZHRoXG4gICAgICAgICAgdGhpcy5jYWxjdWxhdGVkQXNwZWN0UmF0aW8gPSBuYXR1cmFsV2lkdGggLyBuYXR1cmFsSGVpZ2h0XG4gICAgICAgIH0gZWxzZSBpZiAoIWltZy5jb21wbGV0ZSAmJiB0aGlzLmlzTG9hZGluZyAmJiAhdGhpcy5oYXNFcnJvciAmJiB0aW1lb3V0ICE9IG51bGwpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KHBvbGwsIHRpbWVvdXQpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcG9sbCgpXG4gICAgfSxcbiAgICBnZW5Db250ZW50ICgpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQ6IFZOb2RlID0gVlJlc3BvbnNpdmUub3B0aW9ucy5tZXRob2RzLmdlbkNvbnRlbnQuY2FsbCh0aGlzKVxuICAgICAgaWYgKHRoaXMubmF0dXJhbFdpZHRoKSB7XG4gICAgICAgIHRoaXMuX2IoY29udGVudC5kYXRhISwgJ2RpdicsIHtcbiAgICAgICAgICBzdHlsZTogeyB3aWR0aDogYCR7dGhpcy5uYXR1cmFsV2lkdGh9cHhgIH0sXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50XG4gICAgfSxcbiAgICBfX2dlblBsYWNlaG9sZGVyICgpOiBWTm9kZSB8IHZvaWQge1xuICAgICAgY29uc3Qgc2xvdCA9IGdldFNsb3QodGhpcywgJ3BsYWNlaG9sZGVyJylcbiAgICAgIGlmIChzbG90KSB7XG4gICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5pc0xvYWRpbmdcbiAgICAgICAgICA/IFt0aGlzLiRjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgICBzdGF0aWNDbGFzczogJ3YtaW1hZ2VfX3BsYWNlaG9sZGVyJyxcbiAgICAgICAgICB9LCBzbG90KV1cbiAgICAgICAgICA6IFtdXG5cbiAgICAgICAgaWYgKCF0aGlzLnRyYW5zaXRpb24pIHJldHVybiBwbGFjZWhvbGRlclswXVxuXG4gICAgICAgIHJldHVybiB0aGlzLiRjcmVhdGVFbGVtZW50KCd0cmFuc2l0aW9uJywge1xuICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBhcHBlYXI6IHRydWUsXG4gICAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zaXRpb24sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSwgcGxhY2Vob2xkZXIpXG4gICAgICB9XG4gICAgfSxcbiAgfSxcblxuICByZW5kZXIgKGgpOiBWTm9kZSB7XG4gICAgY29uc3Qgbm9kZSA9IFZSZXNwb25zaXZlLm9wdGlvbnMucmVuZGVyLmNhbGwodGhpcywgaClcblxuICAgIGNvbnN0IGRhdGEgPSBtZXJnZURhdGEobm9kZS5kYXRhISwge1xuICAgICAgc3RhdGljQ2xhc3M6ICd2LWltYWdlJyxcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgICdhcmlhLWxhYmVsJzogdGhpcy5hbHQsXG4gICAgICAgIHJvbGU6IHRoaXMuYWx0ID8gJ2ltZycgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgICAgY2xhc3M6IHRoaXMudGhlbWVDbGFzc2VzLFxuICAgICAgLy8gT25seSBsb2FkIGludGVyc2VjdCBkaXJlY3RpdmUgaWYgaXRcbiAgICAgIC8vIHdpbGwgd29yayBpbiB0aGUgY3VycmVudCBicm93c2VyLlxuICAgICAgZGlyZWN0aXZlczogaGFzSW50ZXJzZWN0XG4gICAgICAgID8gW3tcbiAgICAgICAgICBuYW1lOiAnaW50ZXJzZWN0JyxcbiAgICAgICAgICBtb2RpZmllcnM6IHsgb25jZTogdHJ1ZSB9LFxuICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBoYW5kbGVyOiB0aGlzLmluaXQsXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgfSxcbiAgICAgICAgfV1cbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgfSlcblxuICAgIG5vZGUuY2hpbGRyZW4gPSBbXG4gICAgICB0aGlzLl9fY2FjaGVkU2l6ZXIsXG4gICAgICB0aGlzLl9fY2FjaGVkSW1hZ2UsXG4gICAgICB0aGlzLl9fZ2VuUGxhY2Vob2xkZXIoKSxcbiAgICAgIHRoaXMuZ2VuQ29udGVudCgpLFxuICAgIF0gYXMgVk5vZGVbXVxuXG4gICAgcmV0dXJuIGgobm9kZS50YWcsIGRhdGEsIG5vZGUuY2hpbGRyZW4pXG4gIH0sXG59KVxuIl19
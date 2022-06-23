function inserted(el, binding, vnode) {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window))
        return;
    const modifiers = binding.modifiers || {};
    const value = binding.value;
    const { handler, options } = typeof value === 'object'
        ? value
        : { handler: value, options: {} };
    const observer = new IntersectionObserver((entries = [], observer) => {
        const _observe = el._observe?.[vnode.context._uid];
        if (!_observe)
            return; // Just in case, should never fire
        const isIntersecting = entries.some(entry => entry.isIntersecting);
        // If is not quiet or has already been
        // initted, invoke the user callback
        if (handler && (!modifiers.quiet ||
            _observe.init) && (!modifiers.once ||
            isIntersecting ||
            _observe.init)) {
            handler(entries, observer, isIntersecting);
        }
        if (isIntersecting && modifiers.once)
            unbind(el, binding, vnode);
        else
            _observe.init = true;
    }, options);
    el._observe = Object(el._observe);
    el._observe[vnode.context._uid] = { init: false, observer };
    observer.observe(el);
}
function unbind(el, binding, vnode) {
    const observe = el._observe?.[vnode.context._uid];
    if (!observe)
        return;
    observe.observer.unobserve(el);
    delete el._observe[vnode.context._uid];
}
export const Intersect = {
    inserted,
    unbind,
};
export default Intersect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0aXZlcy9pbnRlcnNlY3QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJBLFNBQVMsUUFBUSxDQUFFLEVBQWUsRUFBRSxPQUE4QixFQUFFLEtBQVk7SUFDOUUsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksQ0FBQyxDQUFDLHNCQUFzQixJQUFJLE1BQU0sQ0FBQztRQUFFLE9BQU07SUFFaEYsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUE7SUFDekMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQTtJQUMzQixNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVE7UUFDcEQsQ0FBQyxDQUFDLEtBQUs7UUFDUCxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQTtJQUNuQyxNQUFNLFFBQVEsR0FBRyxJQUFJLG9CQUFvQixDQUFDLENBQ3hDLFVBQXVDLEVBQUUsRUFDekMsUUFBOEIsRUFDOUIsRUFBRTtRQUNGLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBUSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ25ELElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTSxDQUFDLGtDQUFrQztRQUV4RCxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBRWxFLHNDQUFzQztRQUN0QyxvQ0FBb0M7UUFDcEMsSUFDRSxPQUFPLElBQUksQ0FDVCxDQUFDLFNBQVMsQ0FBQyxLQUFLO1lBQ2hCLFFBQVEsQ0FBQyxJQUFJLENBQ2QsSUFBSSxDQUNILENBQUMsU0FBUyxDQUFDLElBQUk7WUFDZixjQUFjO1lBQ2QsUUFBUSxDQUFDLElBQUksQ0FDZCxFQUNEO1lBQ0EsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUE7U0FDM0M7UUFFRCxJQUFJLGNBQWMsSUFBSSxTQUFTLENBQUMsSUFBSTtZQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBOztZQUMzRCxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUMzQixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFWCxFQUFFLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDakMsRUFBRSxDQUFDLFFBQVMsQ0FBQyxLQUFLLENBQUMsT0FBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQTtJQUU3RCxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3RCLENBQUM7QUFFRCxTQUFTLE1BQU0sQ0FBRSxFQUFlLEVBQUUsT0FBOEIsRUFBRSxLQUFZO0lBQzVFLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2xELElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTTtJQUVwQixPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUM5QixPQUFPLEVBQUUsQ0FBQyxRQUFTLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQyxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHO0lBQ3ZCLFFBQVE7SUFDUixNQUFNO0NBQ1AsQ0FBQTtBQUVELGVBQWUsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVk5vZGVEaXJlY3RpdmUgfSBmcm9tICd2dWUvdHlwZXMvdm5vZGUnXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxudHlwZSBPYnNlcnZlSGFuZGxlciA9IChcbiAgZW50cmllczogSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeVtdLFxuICBvYnNlcnZlcjogSW50ZXJzZWN0aW9uT2JzZXJ2ZXIsXG4gIGlzSW50ZXJzZWN0aW5nOiBib29sZWFuLFxuKSA9PiB2b2lkXG5cbmludGVyZmFjZSBPYnNlcnZlVk5vZGVEaXJlY3RpdmUgZXh0ZW5kcyBPbWl0PFZOb2RlRGlyZWN0aXZlLCAnbW9kaWZpZXJzJz4ge1xuICB2YWx1ZT86IE9ic2VydmVIYW5kbGVyIHwgeyBoYW5kbGVyOiBPYnNlcnZlSGFuZGxlciwgb3B0aW9ucz86IEludGVyc2VjdGlvbk9ic2VydmVySW5pdCB9XG4gIG1vZGlmaWVycz86IHtcbiAgICBvbmNlPzogYm9vbGVhblxuICAgIHF1aWV0PzogYm9vbGVhblxuICB9XG59XG5cbmZ1bmN0aW9uIGluc2VydGVkIChlbDogSFRNTEVsZW1lbnQsIGJpbmRpbmc6IE9ic2VydmVWTm9kZURpcmVjdGl2ZSwgdm5vZGU6IFZOb2RlKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCAhKCdJbnRlcnNlY3Rpb25PYnNlcnZlcicgaW4gd2luZG93KSkgcmV0dXJuXG5cbiAgY29uc3QgbW9kaWZpZXJzID0gYmluZGluZy5tb2RpZmllcnMgfHwge31cbiAgY29uc3QgdmFsdWUgPSBiaW5kaW5nLnZhbHVlXG4gIGNvbnN0IHsgaGFuZGxlciwgb3B0aW9ucyB9ID0gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0J1xuICAgID8gdmFsdWVcbiAgICA6IHsgaGFuZGxlcjogdmFsdWUsIG9wdGlvbnM6IHt9IH1cbiAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoKFxuICAgIGVudHJpZXM6IEludGVyc2VjdGlvbk9ic2VydmVyRW50cnlbXSA9IFtdLFxuICAgIG9ic2VydmVyOiBJbnRlcnNlY3Rpb25PYnNlcnZlclxuICApID0+IHtcbiAgICBjb25zdCBfb2JzZXJ2ZSA9IGVsLl9vYnNlcnZlPy5bdm5vZGUuY29udGV4dCEuX3VpZF1cbiAgICBpZiAoIV9vYnNlcnZlKSByZXR1cm4gLy8gSnVzdCBpbiBjYXNlLCBzaG91bGQgbmV2ZXIgZmlyZVxuXG4gICAgY29uc3QgaXNJbnRlcnNlY3RpbmcgPSBlbnRyaWVzLnNvbWUoZW50cnkgPT4gZW50cnkuaXNJbnRlcnNlY3RpbmcpXG5cbiAgICAvLyBJZiBpcyBub3QgcXVpZXQgb3IgaGFzIGFscmVhZHkgYmVlblxuICAgIC8vIGluaXR0ZWQsIGludm9rZSB0aGUgdXNlciBjYWxsYmFja1xuICAgIGlmIChcbiAgICAgIGhhbmRsZXIgJiYgKFxuICAgICAgICAhbW9kaWZpZXJzLnF1aWV0IHx8XG4gICAgICAgIF9vYnNlcnZlLmluaXRcbiAgICAgICkgJiYgKFxuICAgICAgICAhbW9kaWZpZXJzLm9uY2UgfHxcbiAgICAgICAgaXNJbnRlcnNlY3RpbmcgfHxcbiAgICAgICAgX29ic2VydmUuaW5pdFxuICAgICAgKVxuICAgICkge1xuICAgICAgaGFuZGxlcihlbnRyaWVzLCBvYnNlcnZlciwgaXNJbnRlcnNlY3RpbmcpXG4gICAgfVxuXG4gICAgaWYgKGlzSW50ZXJzZWN0aW5nICYmIG1vZGlmaWVycy5vbmNlKSB1bmJpbmQoZWwsIGJpbmRpbmcsIHZub2RlKVxuICAgIGVsc2UgX29ic2VydmUuaW5pdCA9IHRydWVcbiAgfSwgb3B0aW9ucylcblxuICBlbC5fb2JzZXJ2ZSA9IE9iamVjdChlbC5fb2JzZXJ2ZSlcbiAgZWwuX29ic2VydmUhW3Zub2RlLmNvbnRleHQhLl91aWRdID0geyBpbml0OiBmYWxzZSwgb2JzZXJ2ZXIgfVxuXG4gIG9ic2VydmVyLm9ic2VydmUoZWwpXG59XG5cbmZ1bmN0aW9uIHVuYmluZCAoZWw6IEhUTUxFbGVtZW50LCBiaW5kaW5nOiBPYnNlcnZlVk5vZGVEaXJlY3RpdmUsIHZub2RlOiBWTm9kZSkge1xuICBjb25zdCBvYnNlcnZlID0gZWwuX29ic2VydmU/Llt2bm9kZS5jb250ZXh0IS5fdWlkXVxuICBpZiAoIW9ic2VydmUpIHJldHVyblxuXG4gIG9ic2VydmUub2JzZXJ2ZXIudW5vYnNlcnZlKGVsKVxuICBkZWxldGUgZWwuX29ic2VydmUhW3Zub2RlLmNvbnRleHQhLl91aWRdXG59XG5cbmV4cG9ydCBjb25zdCBJbnRlcnNlY3QgPSB7XG4gIGluc2VydGVkLFxuICB1bmJpbmQsXG59XG5cbmV4cG9ydCBkZWZhdWx0IEludGVyc2VjdFxuIl19
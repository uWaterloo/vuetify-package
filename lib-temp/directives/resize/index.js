function inserted(el, binding, vnode) {
    const callback = binding.value;
    const options = binding.options || { passive: true };
    window.addEventListener('resize', callback, options);
    el._onResize = Object(el._onResize);
    el._onResize[vnode.context._uid] = {
        callback,
        options,
    };
    if (!binding.modifiers || !binding.modifiers.quiet) {
        callback();
    }
}
function unbind(el, binding, vnode) {
    if (!el._onResize?.[vnode.context._uid])
        return;
    const { callback, options } = el._onResize[vnode.context._uid];
    window.removeEventListener('resize', callback, options);
    delete el._onResize[vnode.context._uid];
}
export const Resize = {
    inserted,
    unbind,
};
export default Resize;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZGlyZWN0aXZlcy9yZXNpemUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsU0FBUyxRQUFRLENBQUUsRUFBZSxFQUFFLE9BQTZCLEVBQUUsS0FBWTtJQUM3RSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBTSxDQUFBO0lBQy9CLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFFcEQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFFcEQsRUFBRSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ25DLEVBQUUsQ0FBQyxTQUFVLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQyxJQUFJLENBQUMsR0FBRztRQUNuQyxRQUFRO1FBQ1IsT0FBTztLQUNSLENBQUE7SUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ2xELFFBQVEsRUFBRSxDQUFBO0tBQ1g7QUFDSCxDQUFDO0FBRUQsU0FBUyxNQUFNLENBQUUsRUFBZSxFQUFFLE9BQTZCLEVBQUUsS0FBWTtJQUMzRSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUMsSUFBSSxDQUFDO1FBQUUsT0FBTTtJQUVoRCxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQyxJQUFJLENBQUUsQ0FBQTtJQUVoRSxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUV2RCxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQyxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHO0lBQ3BCLFFBQVE7SUFDUixNQUFNO0NBQ1AsQ0FBQTtBQUVELGVBQWUsTUFBTSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVk5vZGVEaXJlY3RpdmUgfSBmcm9tICd2dWUvdHlwZXMvdm5vZGUnXG5pbXBvcnQgeyBWTm9kZSB9IGZyb20gJ3Z1ZSdcblxuaW50ZXJmYWNlIFJlc2l6ZVZOb2RlRGlyZWN0aXZlIGV4dGVuZHMgVk5vZGVEaXJlY3RpdmUge1xuICB2YWx1ZT86ICgpID0+IHZvaWRcbiAgb3B0aW9ucz86IGJvb2xlYW4gfCBBZGRFdmVudExpc3RlbmVyT3B0aW9uc1xufVxuXG5mdW5jdGlvbiBpbnNlcnRlZCAoZWw6IEhUTUxFbGVtZW50LCBiaW5kaW5nOiBSZXNpemVWTm9kZURpcmVjdGl2ZSwgdm5vZGU6IFZOb2RlKSB7XG4gIGNvbnN0IGNhbGxiYWNrID0gYmluZGluZy52YWx1ZSFcbiAgY29uc3Qgb3B0aW9ucyA9IGJpbmRpbmcub3B0aW9ucyB8fCB7IHBhc3NpdmU6IHRydWUgfVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBjYWxsYmFjaywgb3B0aW9ucylcblxuICBlbC5fb25SZXNpemUgPSBPYmplY3QoZWwuX29uUmVzaXplKVxuICBlbC5fb25SZXNpemUhW3Zub2RlLmNvbnRleHQhLl91aWRdID0ge1xuICAgIGNhbGxiYWNrLFxuICAgIG9wdGlvbnMsXG4gIH1cblxuICBpZiAoIWJpbmRpbmcubW9kaWZpZXJzIHx8ICFiaW5kaW5nLm1vZGlmaWVycy5xdWlldCkge1xuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG5mdW5jdGlvbiB1bmJpbmQgKGVsOiBIVE1MRWxlbWVudCwgYmluZGluZzogUmVzaXplVk5vZGVEaXJlY3RpdmUsIHZub2RlOiBWTm9kZSkge1xuICBpZiAoIWVsLl9vblJlc2l6ZT8uW3Zub2RlLmNvbnRleHQhLl91aWRdKSByZXR1cm5cblxuICBjb25zdCB7IGNhbGxiYWNrLCBvcHRpb25zIH0gPSBlbC5fb25SZXNpemVbdm5vZGUuY29udGV4dCEuX3VpZF0hXG5cbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGNhbGxiYWNrLCBvcHRpb25zKVxuXG4gIGRlbGV0ZSBlbC5fb25SZXNpemVbdm5vZGUuY29udGV4dCEuX3VpZF1cbn1cblxuZXhwb3J0IGNvbnN0IFJlc2l6ZSA9IHtcbiAgaW5zZXJ0ZWQsXG4gIHVuYmluZCxcbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVzaXplXG4iXX0=
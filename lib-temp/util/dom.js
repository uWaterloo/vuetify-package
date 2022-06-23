/**
 * Returns:
 *  - 'null' if the node is not attached to the DOM
 *  - the root node (HTMLDocument | ShadowRoot) otherwise
 */
export function attachedRoot(node) {
    /* istanbul ignore next */
    if (typeof node.getRootNode !== 'function') {
        // Shadow DOM not supported (IE11), lets find the root of this node
        while (node.parentNode)
            node = node.parentNode;
        // The root parent is the document if the node is attached to the DOM
        if (node !== document)
            return null;
        return document;
    }
    const root = node.getRootNode();
    // The composed root node is the document if the node is attached to the DOM
    if (root !== document && root.getRootNode({ composed: true }) !== document)
        return null;
    return root;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvZG9tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFFLElBQVU7SUFDdEMsMEJBQTBCO0lBQzFCLElBQUksT0FBTyxJQUFJLENBQUMsV0FBVyxLQUFLLFVBQVUsRUFBRTtRQUMxQyxtRUFBbUU7UUFDbkUsT0FBTyxJQUFJLENBQUMsVUFBVTtZQUFFLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFBO1FBRTlDLHFFQUFxRTtRQUNyRSxJQUFJLElBQUksS0FBSyxRQUFRO1lBQUUsT0FBTyxJQUFJLENBQUE7UUFFbEMsT0FBTyxRQUFRLENBQUE7S0FDaEI7SUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFFL0IsNEVBQTRFO0lBQzVFLElBQUksSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssUUFBUTtRQUFFLE9BQU8sSUFBSSxDQUFBO0lBRXZGLE9BQU8sSUFBaUMsQ0FBQTtBQUMxQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBSZXR1cm5zOlxuICogIC0gJ251bGwnIGlmIHRoZSBub2RlIGlzIG5vdCBhdHRhY2hlZCB0byB0aGUgRE9NXG4gKiAgLSB0aGUgcm9vdCBub2RlIChIVE1MRG9jdW1lbnQgfCBTaGFkb3dSb290KSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaGVkUm9vdCAobm9kZTogTm9kZSk6IG51bGwgfCBIVE1MRG9jdW1lbnQgfCBTaGFkb3dSb290IHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKHR5cGVvZiBub2RlLmdldFJvb3ROb2RlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gU2hhZG93IERPTSBub3Qgc3VwcG9ydGVkIChJRTExKSwgbGV0cyBmaW5kIHRoZSByb290IG9mIHRoaXMgbm9kZVxuICAgIHdoaWxlIChub2RlLnBhcmVudE5vZGUpIG5vZGUgPSBub2RlLnBhcmVudE5vZGVcblxuICAgIC8vIFRoZSByb290IHBhcmVudCBpcyB0aGUgZG9jdW1lbnQgaWYgdGhlIG5vZGUgaXMgYXR0YWNoZWQgdG8gdGhlIERPTVxuICAgIGlmIChub2RlICE9PSBkb2N1bWVudCkgcmV0dXJuIG51bGxcblxuICAgIHJldHVybiBkb2N1bWVudFxuICB9XG5cbiAgY29uc3Qgcm9vdCA9IG5vZGUuZ2V0Um9vdE5vZGUoKVxuXG4gIC8vIFRoZSBjb21wb3NlZCByb290IG5vZGUgaXMgdGhlIGRvY3VtZW50IGlmIHRoZSBub2RlIGlzIGF0dGFjaGVkIHRvIHRoZSBET01cbiAgaWYgKHJvb3QgIT09IGRvY3VtZW50ICYmIHJvb3QuZ2V0Um9vdE5vZGUoeyBjb21wb3NlZDogdHJ1ZSB9KSAhPT0gZG9jdW1lbnQpIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIHJvb3QgYXMgSFRNTERvY3VtZW50IHwgU2hhZG93Um9vdFxufVxuIl19
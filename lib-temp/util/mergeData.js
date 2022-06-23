import { camelize, wrapInArray } from './helpers';
const pattern = {
    styleList: /;(?![^(]*\))/g,
    styleProp: /:(.*)/,
};
function parseStyle(style) {
    const styleMap = {};
    for (const s of style.split(pattern.styleList)) {
        let [key, val] = s.split(pattern.styleProp);
        key = key.trim();
        if (!key) {
            continue;
        }
        // May be undefined if the `key: value` pair is incomplete.
        if (typeof val === 'string') {
            val = val.trim();
        }
        styleMap[camelize(key)] = val;
    }
    return styleMap;
}
export default function mergeData() {
    const mergeTarget = {};
    let i = arguments.length;
    let prop;
    // Allow for variadic argument length.
    while (i--) {
        // Iterate through the data properties and execute merge strategies
        // Object.keys eliminates need for hasOwnProperty call
        for (prop of Object.keys(arguments[i])) {
            switch (prop) {
                // Array merge strategy (array concatenation)
                case 'class':
                case 'directives':
                    if (arguments[i][prop]) {
                        mergeTarget[prop] = mergeClasses(mergeTarget[prop], arguments[i][prop]);
                    }
                    break;
                case 'style':
                    if (arguments[i][prop]) {
                        mergeTarget[prop] = mergeStyles(mergeTarget[prop], arguments[i][prop]);
                    }
                    break;
                // Space delimited string concatenation strategy
                case 'staticClass':
                    if (!arguments[i][prop]) {
                        break;
                    }
                    if (mergeTarget[prop] === undefined) {
                        mergeTarget[prop] = '';
                    }
                    if (mergeTarget[prop]) {
                        // Not an empty string, so concatenate
                        mergeTarget[prop] += ' ';
                    }
                    mergeTarget[prop] += arguments[i][prop].trim();
                    break;
                // Object, the properties of which to merge via array merge strategy (array concatenation).
                // Callback merge strategy merges callbacks to the beginning of the array,
                // so that the last defined callback will be invoked first.
                // This is done since to mimic how Object.assign merging
                // uses the last given value to assign.
                case 'on':
                case 'nativeOn':
                    if (arguments[i][prop]) {
                        mergeTarget[prop] = mergeListeners(mergeTarget[prop], arguments[i][prop]);
                    }
                    break;
                // Object merge strategy
                case 'attrs':
                case 'props':
                case 'domProps':
                case 'scopedSlots':
                case 'staticStyle':
                case 'hook':
                case 'transition':
                    if (!arguments[i][prop]) {
                        break;
                    }
                    if (!mergeTarget[prop]) {
                        mergeTarget[prop] = {};
                    }
                    mergeTarget[prop] = { ...arguments[i][prop], ...mergeTarget[prop] };
                    break;
                // Reassignment strategy (no merge)
                default: // slot, key, ref, tag, show, keepAlive
                    if (!mergeTarget[prop]) {
                        mergeTarget[prop] = arguments[i][prop];
                    }
            }
        }
    }
    return mergeTarget;
}
export function mergeStyles(target, source) {
    if (!target)
        return source;
    if (!source)
        return target;
    target = wrapInArray(typeof target === 'string' ? parseStyle(target) : target);
    return target.concat(typeof source === 'string' ? parseStyle(source) : source);
}
export function mergeClasses(target, source) {
    if (!source)
        return target;
    if (!target)
        return source;
    return target ? wrapInArray(target).concat(source) : source;
}
export function mergeListeners(...args) {
    if (!args[0])
        return args[1];
    if (!args[1])
        return args[0];
    const dest = {};
    for (let i = 2; i--;) {
        const arg = args[i];
        for (const event in arg) {
            if (!arg[event])
                continue;
            if (dest[event]) {
                // Merge current listeners before (because we are iterating backwards).
                // Note that neither "target" or "source" must be altered.
                dest[event] = [].concat(arg[event], dest[event]);
            }
            else {
                // Straight assign.
                dest[event] = arg[event];
            }
        }
    }
    return dest;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VEYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvbWVyZ2VEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sV0FBVyxDQUFBO0FBRWpELE1BQU0sT0FBTyxHQUFHO0lBQ2QsU0FBUyxFQUFFLGVBQWU7SUFDMUIsU0FBUyxFQUFFLE9BQU87Q0FDVixDQUFBO0FBRVYsU0FBUyxVQUFVLENBQUUsS0FBYTtJQUNoQyxNQUFNLFFBQVEsR0FBb0IsRUFBRSxDQUFBO0lBRXBDLEtBQUssTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDOUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUMzQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUixTQUFRO1NBQ1Q7UUFDRCwyREFBMkQ7UUFDM0QsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDM0IsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtTQUNqQjtRQUNELFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7S0FDOUI7SUFFRCxPQUFPLFFBQVEsQ0FBQTtBQUNqQixDQUFDO0FBUUQsTUFBTSxDQUFDLE9BQU8sVUFBVSxTQUFTO0lBQy9CLE1BQU0sV0FBVyxHQUFnQyxFQUFFLENBQUE7SUFDbkQsSUFBSSxDQUFDLEdBQVcsU0FBUyxDQUFDLE1BQU0sQ0FBQTtJQUNoQyxJQUFJLElBQVksQ0FBQTtJQUVoQixzQ0FBc0M7SUFDdEMsT0FBTyxDQUFDLEVBQUUsRUFBRTtRQUNWLG1FQUFtRTtRQUNu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QUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUc7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ25CLEtBQUssTUFBTSxLQUFLLElBQUksR0FBRyxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUFFLFNBQVE7WUFFekIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2YsdUVBQXVFO2dCQUN2RSwwREFBMEQ7Z0JBQzFELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBSSxFQUFpQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7YUFDakU7aUJBQU07Z0JBQ0wsbUJBQW1CO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO2FBQ3pCO1NBQ0Y7S0FDRjtJQUVELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNvcHlyaWdodCAyMDE3IEFsZXggUmVnYW5cbiAqIEBsaWNlbnNlIE1JVFxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vYWxleHNhc2hhcmVnYW4vdnVlLWZ1bmN0aW9uYWwtZGF0YS1tZXJnZVxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuaW1wb3J0IHsgVk5vZGVEYXRhIH0gZnJvbSAndnVlJ1xuaW1wb3J0IHsgY2FtZWxpemUsIHdyYXBJbkFycmF5IH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5jb25zdCBwYXR0ZXJuID0ge1xuICBzdHlsZUxpc3Q6IC87KD8hW14oXSpcXCkpL2csXG4gIHN0eWxlUHJvcDogLzooLiopLyxcbn0gYXMgY29uc3RcblxuZnVuY3Rpb24gcGFyc2VTdHlsZSAoc3R5bGU6IHN0cmluZykge1xuICBjb25zdCBzdHlsZU1hcDogRGljdGlvbmFyeTxhbnk+ID0ge31cblxuICBmb3IgKGNvbnN0IHMgb2Ygc3R5bGUuc3BsaXQocGF0dGVybi5zdHlsZUxpc3QpKSB7XG4gICAgbGV0IFtrZXksIHZhbF0gPSBzLnNwbGl0KHBhdHRlcm4uc3R5bGVQcm9wKVxuICAgIGtleSA9IGtleS50cmltKClcbiAgICBpZiAoIWtleSkge1xuICAgICAgY29udGludWVcbiAgICB9XG4gICAgLy8gTWF5IGJlIHVuZGVmaW5lZCBpZiB0aGUgYGtleTogdmFsdWVgIHBhaXIgaXMgaW5jb21wbGV0ZS5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbCA9IHZhbC50cmltKClcbiAgICB9XG4gICAgc3R5bGVNYXBbY2FtZWxpemUoa2V5KV0gPSB2YWxcbiAgfVxuXG4gIHJldHVybiBzdHlsZU1hcFxufVxuXG4vKipcbiAqIEludGVsbGlnZW50bHkgbWVyZ2VzIGRhdGEgZm9yIGNyZWF0ZUVsZW1lbnQuXG4gKiBNZXJnZXMgYXJndW1lbnRzIGxlZnQgdG8gcmlnaHQsIHByZWZlcnJpbmcgdGhlIHJpZ2h0IGFyZ3VtZW50LlxuICogUmV0dXJucyBuZXcgVk5vZGVEYXRhIG9iamVjdC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWVyZ2VEYXRhICguLi52Tm9kZURhdGE6IFZOb2RlRGF0YVtdKTogVk5vZGVEYXRhXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZURhdGEgKCk6IFZOb2RlRGF0YSB7XG4gIGNvbnN0IG1lcmdlVGFyZ2V0OiBWTm9kZURhdGEgJiBEaWN0aW9uYXJ5PGFueT4gPSB7fVxuICBsZXQgaTogbnVtYmVyID0gYXJndW1lbnRzLmxlbmd0aFxuICBsZXQgcHJvcDogc3RyaW5nXG5cbiAgLy8gQWxsb3cgZm9yIHZhcmlhZGljIGFyZ3VtZW50IGxlbmd0aC5cbiAgd2hpbGUgKGktLSkge1xuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgZGF0YSBwcm9wZXJ0aWVzIGFuZCBleGVjdXRlIG1lcmdlIHN0cmF0ZWdpZXNcbiAgICAvLyBPYmplY3Qua2V5cyBlbGltaW5hdGVzIG5lZWQgZm9yIGhhc093blByb3BlcnR5IGNhbGxcbiAgICBmb3IgKHByb3Agb2YgT2JqZWN0LmtleXMoYXJndW1lbnRzW2ldKSkge1xuICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgIC8vIEFycmF5IG1lcmdlIHN0cmF0ZWd5IChhcnJheSBjb25jYXRlbmF0aW9uKVxuICAgICAgICBjYXNlICdjbGFzcyc6XG4gICAgICAgIGNhc2UgJ2RpcmVjdGl2ZXMnOlxuICAgICAgICAgIGlmIChhcmd1bWVudHNbaV1bcHJvcF0pIHtcbiAgICAgICAgICAgIG1lcmdlVGFyZ2V0W3Byb3BdID0gbWVyZ2VDbGFzc2VzKG1lcmdlVGFyZ2V0W3Byb3BdLCBhcmd1bWVudHNbaV1bcHJvcF0pXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3N0eWxlJzpcbiAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldW3Byb3BdKSB7XG4gICAgICAgICAgICBtZXJnZVRhcmdldFtwcm9wXSA9IG1lcmdlU3R5bGVzKG1lcmdlVGFyZ2V0W3Byb3BdLCBhcmd1bWVudHNbaV1bcHJvcF0pXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIC8vIFNwYWNlIGRlbGltaXRlZCBzdHJpbmcgY29uY2F0ZW5hdGlvbiBzdHJhdGVneVxuICAgICAgICBjYXNlICdzdGF0aWNDbGFzcyc6XG4gICAgICAgICAgaWYgKCFhcmd1bWVudHNbaV1bcHJvcF0pIHtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtZXJnZVRhcmdldFtwcm9wXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBtZXJnZVRhcmdldFtwcm9wXSA9ICcnXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtZXJnZVRhcmdldFtwcm9wXSkge1xuICAgICAgICAgICAgLy8gTm90IGFuIGVtcHR5IHN0cmluZywgc28gY29uY2F0ZW5hdGVcbiAgICAgICAgICAgIG1lcmdlVGFyZ2V0W3Byb3BdICs9ICcgJ1xuICAgICAgICAgIH1cbiAgICAgICAgICBtZXJnZVRhcmdldFtwcm9wXSArPSBhcmd1bWVudHNbaV1bcHJvcF0udHJpbSgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gT2JqZWN0LCB0aGUgcHJvcGVydGllcyBvZiB3aGljaCB0byBtZXJnZSB2aWEgYXJyYXkgbWVyZ2Ugc3RyYXRlZ3kgKGFycmF5IGNvbmNhdGVuYXRpb24pLlxuICAgICAgICAvLyBDYWxsYmFjayBtZXJnZSBzdHJhdGVneSBtZXJnZXMgY2FsbGJhY2tzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5LFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBsYXN0IGRlZmluZWQgY2FsbGJhY2sgd2lsbCBiZSBpbnZva2VkIGZpcnN0LlxuICAgICAgICAvLyBUaGlzIGlzIGRvbmUgc2luY2UgdG8gbWltaWMgaG93IE9iamVjdC5hc3NpZ24gbWVyZ2luZ1xuICAgICAgICAvLyB1c2VzIHRoZSBsYXN0IGdpdmVuIHZhbHVlIHRvIGFzc2lnbi5cbiAgICAgICAgY2FzZSAnb24nOlxuICAgICAgICBjYXNlICduYXRpdmVPbic6XG4gICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXVtwcm9wXSkge1xuICAgICAgICAgICAgbWVyZ2VUYXJnZXRbcHJvcF0gPSBtZXJnZUxpc3RlbmVycyhtZXJnZVRhcmdldFtwcm9wXSwgYXJndW1lbnRzW2ldW3Byb3BdKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICAvLyBPYmplY3QgbWVyZ2Ugc3RyYXRlZ3lcbiAgICAgICAgY2FzZSAnYXR0cnMnOlxuICAgICAgICBjYXNlICdwcm9wcyc6XG4gICAgICAgIGNhc2UgJ2RvbVByb3BzJzpcbiAgICAgICAgY2FzZSAnc2NvcGVkU2xvdHMnOlxuICAgICAgICBjYXNlICdzdGF0aWNTdHlsZSc6XG4gICAgICAgIGNhc2UgJ2hvb2snOlxuICAgICAgICBjYXNlICd0cmFuc2l0aW9uJzpcbiAgICAgICAgICBpZiAoIWFyZ3VtZW50c1tpXVtwcm9wXSkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFtZXJnZVRhcmdldFtwcm9wXSkge1xuICAgICAgICAgICAgbWVyZ2VUYXJnZXRbcHJvcF0gPSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgICBtZXJnZVRhcmdldFtwcm9wXSA9IHsgLi4uYXJndW1lbnRzW2ldW3Byb3BdLCAuLi5tZXJnZVRhcmdldFtwcm9wXSB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gUmVhc3NpZ25tZW50IHN0cmF0ZWd5IChubyBtZXJnZSlcbiAgICAgICAgZGVmYXVsdDogLy8gc2xvdCwga2V5LCByZWYsIHRhZywgc2hvdywga2VlcEFsaXZlXG4gICAgICAgICAgaWYgKCFtZXJnZVRhcmdldFtwcm9wXSkge1xuICAgICAgICAgICAgbWVyZ2VUYXJnZXRbcHJvcF0gPSBhcmd1bWVudHNbaV1bcHJvcF1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1lcmdlVGFyZ2V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVN0eWxlcyAoXG4gIHRhcmdldDogdW5kZWZpbmVkIHwgc3RyaW5nIHwgb2JqZWN0W10gfCBvYmplY3QsXG4gIHNvdXJjZTogdW5kZWZpbmVkIHwgc3RyaW5nIHwgb2JqZWN0W10gfCBvYmplY3Rcbikge1xuICBpZiAoIXRhcmdldCkgcmV0dXJuIHNvdXJjZVxuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHRhcmdldFxuXG4gIHRhcmdldCA9IHdyYXBJbkFycmF5KHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnID8gcGFyc2VTdHlsZSh0YXJnZXQpIDogdGFyZ2V0KVxuXG4gIHJldHVybiAodGFyZ2V0IGFzIG9iamVjdFtdKS5jb25jYXQodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgPyBwYXJzZVN0eWxlKHNvdXJjZSkgOiBzb3VyY2UpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUNsYXNzZXMgKHRhcmdldDogYW55LCBzb3VyY2U6IGFueSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHRhcmdldFxuICBpZiAoIXRhcmdldCkgcmV0dXJuIHNvdXJjZVxuXG4gIHJldHVybiB0YXJnZXQgPyB3cmFwSW5BcnJheSh0YXJnZXQpLmNvbmNhdChzb3VyY2UpIDogc291cmNlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUxpc3RlbmVycyAoLi4uYXJnczogW1xuICB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIHwgRnVuY3Rpb25bXSB9IHwgdW5kZWZpbmVkLFxuICB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIHwgRnVuY3Rpb25bXSB9IHwgdW5kZWZpbmVkXG5dKSB7XG4gIGlmICghYXJnc1swXSkgcmV0dXJuIGFyZ3NbMV1cbiAgaWYgKCFhcmdzWzFdKSByZXR1cm4gYXJnc1swXVxuXG4gIGNvbnN0IGRlc3Q6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBGdW5jdGlvbltdIH0gPSB7fVxuXG4gIGZvciAobGV0IGkgPSAyOyBpLS07KSB7XG4gICAgY29uc3QgYXJnID0gYXJnc1tpXVxuICAgIGZvciAoY29uc3QgZXZlbnQgaW4gYXJnKSB7XG4gICAgICBpZiAoIWFyZ1tldmVudF0pIGNvbnRpbnVlXG5cbiAgICAgIGlmIChkZXN0W2V2ZW50XSkge1xuICAgICAgICAvLyBNZXJnZSBjdXJyZW50IGxpc3RlbmVycyBiZWZvcmUgKGJlY2F1c2Ugd2UgYXJlIGl0ZXJhdGluZyBiYWNrd2FyZHMpLlxuICAgICAgICAvLyBOb3RlIHRoYXQgbmVpdGhlciBcInRhcmdldFwiIG9yIFwic291cmNlXCIgbXVzdCBiZSBhbHRlcmVkLlxuICAgICAgICBkZXN0W2V2ZW50XSA9IChbXSBhcyBGdW5jdGlvbltdKS5jb25jYXQoYXJnW2V2ZW50XSwgZGVzdFtldmVudF0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTdHJhaWdodCBhc3NpZ24uXG4gICAgICAgIGRlc3RbZXZlbnRdID0gYXJnW2V2ZW50XVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZXN0XG59XG4iXX0=
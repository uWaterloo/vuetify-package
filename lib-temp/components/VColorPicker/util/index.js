// Utilities
import { HSVAtoRGBA, HSVAtoHex, RGBAtoHSVA, HexToHSVA, HSVAtoHSLA, RGBAtoHex, HSLAtoHSVA, parseHex, } from '../../../util/colorUtils';
export function fromHSVA(hsva) {
    hsva = { ...hsva };
    const hexa = HSVAtoHex(hsva);
    const hsla = HSVAtoHSLA(hsva);
    const rgba = HSVAtoRGBA(hsva);
    return {
        alpha: hsva.a,
        hex: hexa.substr(0, 7),
        hexa,
        hsla,
        hsva,
        hue: hsva.h,
        rgba,
    };
}
export function fromHSLA(hsla) {
    const hsva = HSLAtoHSVA(hsla);
    const hexa = HSVAtoHex(hsva);
    const rgba = HSVAtoRGBA(hsva);
    return {
        alpha: hsva.a,
        hex: hexa.substr(0, 7),
        hexa,
        hsla,
        hsva,
        hue: hsva.h,
        rgba,
    };
}
export function fromRGBA(rgba) {
    const hsva = RGBAtoHSVA(rgba);
    const hexa = RGBAtoHex(rgba);
    const hsla = HSVAtoHSLA(hsva);
    return {
        alpha: hsva.a,
        hex: hexa.substr(0, 7),
        hexa,
        hsla,
        hsva,
        hue: hsva.h,
        rgba,
    };
}
export function fromHexa(hexa) {
    const hsva = HexToHSVA(hexa);
    const hsla = HSVAtoHSLA(hsva);
    const rgba = HSVAtoRGBA(hsva);
    return {
        alpha: hsva.a,
        hex: hexa.substr(0, 7),
        hexa,
        hsla,
        hsva,
        hue: hsva.h,
        rgba,
    };
}
export function fromHex(hex) {
    return fromHexa(parseHex(hex));
}
function has(obj, key) {
    return key.every(k => obj.hasOwnProperty(k));
}
export function parseColor(color, oldColor) {
    if (!color)
        return fromRGBA({ r: 255, g: 0, b: 0, a: 1 });
    if (typeof color === 'string') {
        if (color === 'transparent')
            return fromHexa('#00000000');
        const hex = parseHex(color);
        if (oldColor && hex === oldColor.hexa)
            return oldColor;
        else
            return fromHexa(hex);
    }
    if (typeof color === 'object') {
        if (color.hasOwnProperty('alpha'))
            return color;
        const a = color.hasOwnProperty('a') ? parseFloat(color.a) : 1;
        if (has(color, ['r', 'g', 'b'])) {
            if (oldColor && color === oldColor.rgba)
                return oldColor;
            else
                return fromRGBA({ ...color, a });
        }
        else if (has(color, ['h', 's', 'l'])) {
            if (oldColor && color === oldColor.hsla)
                return oldColor;
            else
                return fromHSLA({ ...color, a });
        }
        else if (has(color, ['h', 's', 'v'])) {
            if (oldColor && color === oldColor.hsva)
                return oldColor;
            else
                return fromHSVA({ ...color, a });
        }
    }
    return fromRGBA({ r: 255, g: 0, b: 0, a: 1 });
}
function stripAlpha(color, stripAlpha) {
    if (stripAlpha) {
        const { a, ...rest } = color;
        return rest;
    }
    return color;
}
export function extractColor(color, input) {
    if (input == null)
        return color;
    if (typeof input === 'string') {
        return input.length === 7 ? color.hex : color.hexa;
    }
    if (typeof input === 'object') {
        const shouldStrip = typeof input.a === 'number' && input.a === 0 ? !!input.a : !input.a;
        if (has(input, ['r', 'g', 'b']))
            return stripAlpha(color.rgba, shouldStrip);
        else if (has(input, ['h', 's', 'l']))
            return stripAlpha(color.hsla, shouldStrip);
        else if (has(input, ['h', 's', 'v']))
            return stripAlpha(color.hsva, shouldStrip);
    }
    return color;
}
export function hasAlpha(color) {
    if (!color)
        return false;
    if (typeof color === 'string') {
        return color.length > 7;
    }
    if (typeof color === 'object') {
        return has(color, ['a']) || has(color, ['alpha']);
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9WQ29sb3JQaWNrZXIvdXRpbC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZO0FBQ1osT0FBTyxFQUVMLFVBQVUsRUFDVixTQUFTLEVBR1QsVUFBVSxFQUNWLFNBQVMsRUFFVCxVQUFVLEVBQ1YsU0FBUyxFQUNULFVBQVUsRUFDVixRQUFRLEdBRVQsTUFBTSwwQkFBMEIsQ0FBQTtBQVlqQyxNQUFNLFVBQVUsUUFBUSxDQUFFLElBQVU7SUFDbEMsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQTtJQUNsQixNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDNUIsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QixPQUFPO1FBQ0wsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2IsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDWCxJQUFJO0tBQ0wsQ0FBQTtBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsUUFBUSxDQUFFLElBQVU7SUFDbEMsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM1QixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0IsT0FBTztRQUNMLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNiLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFD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QU0sR0FBRyxDQUFDLENBQUE7S0FDeEI7SUFFRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0tBQ2xEO0lBRUQsT0FBTyxLQUFLLENBQUE7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVXRpbGl0aWVzXG5pbXBvcnQge1xuICBIU1ZBLFxuICBIU1ZBdG9SR0JBLFxuICBIU1ZBdG9IZXgsXG4gIFJHQkEsXG4gIEhleCxcbiAgUkdCQXRvSFNWQSxcbiAgSGV4VG9IU1ZBLFxuICBIU0xBLFxuICBIU1ZBdG9IU0xBLFxuICBSR0JBdG9IZXgsXG4gIEhTTEF0b0hTVkEsXG4gIHBhcnNlSGV4LFxuICBIZXhhLFxufSBmcm9tICcuLi8uLi8uLi91dGlsL2NvbG9yVXRpbHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgVkNvbG9yUGlja2VyQ29sb3Ige1xuICBhbHBoYTogbnVtYmVyXG4gIGhleDogSGV4XG4gIGhleGE6IEhleGFcbiAgaHNsYTogSFNMQVxuICBoc3ZhOiBIU1ZBXG4gIGh1ZTogbnVtYmVyXG4gIHJnYmE6IFJHQkFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21IU1ZBIChoc3ZhOiBIU1ZBKTogVkNvbG9yUGlja2VyQ29sb3Ige1xuICBoc3ZhID0geyAuLi5oc3ZhIH1cbiAgY29uc3QgaGV4YSA9IEhTVkF0b0hleChoc3ZhKVxuICBjb25zdCBoc2xhID0gSFNWQXRvSFNMQShoc3ZhKVxuICBjb25zdCByZ2JhID0gSFNWQXRvUkdCQShoc3ZhKVxuICByZXR1cm4ge1xuICAgIGFscGhhOiBoc3ZhLmEsXG4gICAgaGV4OiBoZXhhLnN1YnN0cigwLCA3KSxcbiAgICBoZXhhLFxuICAgIGhzbGEsXG4gICAgaHN2YSxcbiAgICBodWU6IGhzdmEuaCxcbiAgICByZ2JhLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tSFNMQSAoaHNsYTogSFNMQSk6IFZDb2xvclBpY2tlckNvbG9yIHtcbiAgY29uc3QgaHN2YSA9IEhTTEF0b0hTVkEoaHNsYSlcbiAgY29uc3QgaGV4YSA9IEhTVkF0b0hleChoc3ZhKVxuICBjb25zdCByZ2JhID0gSFNWQXRvUkdCQShoc3ZhKVxuICByZXR1cm4ge1xuICAgIGFscGhhOiBoc3ZhLmEsXG4gICAgaGV4OiBoZXhhLnN1YnN0cigwLCA3KSxcbiAgICBoZXhhLFxuICAgIGhzbGEsXG4gICAgaHN2YSxcbiAgICBodWU6IGhzdmEuaCxcbiAgICByZ2JhLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUkdCQSAocmdiYTogUkdCQSk6IFZDb2xvclBpY2tlckNvbG9yIHtcbiAgY29uc3QgaHN2YSA9IFJHQkF0b0hTVkEocmdiYSlcbiAgY29uc3QgaGV4YSA9IFJHQkF0b0hleChyZ2JhKVxuICBjb25zdCBoc2xhID0gSFNWQXRvSFNMQShoc3ZhKVxuICByZXR1cm4ge1xuICAgIGFscGhhOiBoc3ZhLmEsXG4gICAgaGV4OiBoZXhhLnN1YnN0cigwLCA3KSxcbiAgICBoZXhhLFxuICAgIGhzbGEsXG4gICAgaHN2YSxcbiAgICBodWU6IGhzdmEuaCxcbiAgICByZ2JhLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tSGV4YSAoaGV4YTogSGV4YSk6IFZDb2xvclBpY2tlckNvbG9yIHtcbiAgY29uc3QgaHN2YSA9IEhleFRvSFNWQShoZXhhKVxuICBjb25zdCBoc2xhID0gSFNWQXRvSFNMQShoc3ZhKVxuICBjb25zdCByZ2JhID0gSFNWQXRvUkdCQShoc3ZhKVxuICByZXR1cm4ge1xuICAgIGFscGhhOiBoc3ZhLmEsXG4gICAgaGV4OiBoZXhhLnN1YnN0cigwLCA3KSxcbiAgICBoZXhhLFxuICAgIGhzbGEsXG4gICAgaHN2YSxcbiAgICBodWU6IGhzdmEuaCxcbiAgICByZ2JhLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tSGV4IChoZXg6IEhleCk6IFZDb2xvclBpY2tlckNvbG9yIHtcbiAgcmV0dXJuIGZyb21IZXhhKHBhcnNlSGV4KGhleCkpXG59XG5cbmZ1bmN0aW9uIGhhcyAob2JqOiBvYmplY3QsIGtleTogc3RyaW5nW10pIHtcbiAgcmV0dXJuIGtleS5ldmVyeShrID0+IG9iai5oYXNPd25Qcm9wZXJ0eShrKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29sb3IgKGNvbG9yOiBhbnksIG9sZENvbG9yOiBWQ29sb3JQaWNrZXJDb2xvciB8IG51bGwpIHtcbiAgaWYgKCFjb2xvcikgcmV0dXJuIGZyb21SR0JBKHsgcjogMjU1LCBnOiAwLCBiOiAwLCBhOiAxIH0pXG5cbiAgaWYgKHR5cGVvZiBjb2xvciA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoY29sb3IgPT09ICd0cmFuc3BhcmVudCcpIHJldHVybiBmcm9tSGV4YSgnIzAwMDAwMDAwJylcblxuICAgIGNvbnN0IGhleCA9IHBhcnNlSGV4KGNvbG9yKVxuXG4gICAgaWYgKG9sZENvbG9yICYmIGhleCA9PT0gb2xkQ29sb3IuaGV4YSkgcmV0dXJuIG9sZENvbG9yXG4gICAgZWxzZSByZXR1cm4gZnJvbUhleGEoaGV4KVxuICB9XG5cbiAgaWYgKHR5cGVvZiBjb2xvciA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAoY29sb3IuaGFzT3duUHJvcGVydHkoJ2FscGhhJykpIHJldHVybiBjb2xvclxuXG4gICAgY29uc3QgYSA9IGNvbG9yLmhhc093blByb3BlcnR5KCdhJykgPyBwYXJzZUZsb2F0KGNvbG9yLmEpIDogMVxuXG4gICAgaWYgKGhhcyhjb2xvciwgWydyJywgJ2cnLCAnYiddKSkge1xuICAgICAgaWYgKG9sZENvbG9yICYmIGNvbG9yID09PSBvbGRDb2xvci5yZ2JhKSByZXR1cm4gb2xkQ29sb3JcbiAgICAgIGVsc2UgcmV0dXJuIGZyb21SR0JBKHsgLi4uY29sb3IsIGEgfSlcbiAgICB9IGVsc2UgaWYgKGhhcyhjb2xvciwgWydoJywgJ3MnLCAnbCddKSkge1xuICAgICAgaWYgKG9sZENvbG9yICYmIGNvbG9yID09PSBvbGRDb2xvci5oc2xhKSByZXR1cm4gb2xkQ29sb3JcbiAgICAgIGVsc2UgcmV0dXJuIGZyb21IU0xBKHsgLi4uY29sb3IsIGEgfSlcbiAgICB9IGVsc2UgaWYgKGhhcyhjb2xvciwgWydoJywgJ3MnLCAndiddKSkge1xuICAgICAgaWYgKG9sZENvbG9yICYmIGNvbG9yID09PSBvbGRDb2xvci5oc3ZhKSByZXR1cm4gb2xkQ29sb3JcbiAgICAgIGVsc2UgcmV0dXJuIGZyb21IU1ZBKHsgLi4uY29sb3IsIGEgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnJvbVJHQkEoeyByOiAyNTUsIGc6IDAsIGI6IDAsIGE6IDEgfSlcbn1cblxuZnVuY3Rpb24gc3RyaXBBbHBoYSAoY29sb3I6IGFueSwgc3RyaXBBbHBoYTogYm9vbGVhbikge1xuICBpZiAoc3RyaXBBbHBoYSkge1xuICAgIGNvbnN0IHsgYSwgLi4ucmVzdCB9ID0gY29sb3JcblxuICAgIHJldHVybiByZXN0XG4gIH1cblxuICByZXR1cm4gY29sb3Jcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RDb2xvciAoY29sb3I6IFZDb2xvclBpY2tlckNvbG9yLCBpbnB1dDogYW55KSB7XG4gIGlmIChpbnB1dCA9PSBudWxsKSByZXR1cm4gY29sb3JcblxuICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBpbnB1dC5sZW5ndGggPT09IDcgPyBjb2xvci5oZXggOiBjb2xvci5oZXhhXG4gIH1cblxuICBpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IHNob3VsZFN0cmlwID0gdHlwZW9mIGlucHV0LmEgPT09ICdudW1iZXInICYmIGlucHV0LmEgPT09IDAgPyAhIWlucHV0LmEgOiAhaW5wdXQuYVxuICAgIGlmIChoYXMoaW5wdXQsIFsncicsICdnJywgJ2InXSkpIHJldHVybiBzdHJpcEFscGhhKGNvbG9yLnJnYmEsIHNob3VsZFN0cmlwKVxuICAgIGVsc2UgaWYgKGhhcyhpbnB1dCwgWydoJywgJ3MnLCAnbCddKSkgcmV0dXJuIHN0cmlwQWxwaGEoY29sb3IuaHNsYSwgc2hvdWxkU3RyaXApXG4gICAgZWxzZSBpZiAoaGFzKGlucHV0LCBbJ2gnLCAncycsICd2J10pKSByZXR1cm4gc3RyaXBBbHBoYShjb2xvci5oc3ZhLCBzaG91bGRTdHJpcClcbiAgfVxuXG4gIHJldHVybiBjb2xvclxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQWxwaGEgKGNvbG9yOiBhbnkpIHtcbiAgaWYgKCFjb2xvcikgcmV0dXJuIGZhbHNlXG5cbiAgaWYgKHR5cGVvZiBjb2xvciA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY29sb3IubGVuZ3RoID4gN1xuICB9XG5cbiAgaWYgKHR5cGVvZiBjb2xvciA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gaGFzKGNvbG9yLCBbJ2EnXSkgfHwgaGFzKGNvbG9yLCBbJ2FscGhhJ10pXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cbiJdfQ==
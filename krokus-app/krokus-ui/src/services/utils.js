function deepParseFloat(val) {
    if (Array.isArray(val))
        return val.map(deepParseFloat);
    else
        return parseFloat(val);
}

function deepToString(val) {
    if (Array.isArray(val))
        return val.map(deepToString);
    else {
        try {
            return val.toString();
        }
        catch (e) {
            return '';
        }
    }
        
}

export { deepParseFloat, deepToString };
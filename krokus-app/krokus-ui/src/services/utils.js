function deepParseFloat(val) {
    if (Array.isArray(val))
        return val.map(deepParseFloat);
    else
        return parseFloat(val);
}

export { deepParseFloat };
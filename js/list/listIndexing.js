export function depthIndexingByValue(items, context) {
    context = context || {idx: 0, dict: {}};
    return items.reduce(function (ac, cr, idx) {
        var value = typeof cr === "string" ? cr : cr.value + '';
        ac[value] = ac[value] || [];
        ac[value].push({
            idx: context.idx++,
            item: cr
        });
        if (cr && cr.items && cr.items.length > 0) {
            depthIndexingByValue(cr.items, context);
        }
        return ac;
    }, context.dict);
}

export function indexingByValue(items, dict) {
    return items.reduce(function (ac, cr, idx) {
        var value = typeof cr === "string" ? cr : cr.value + '';
        ac[value] = ac[value] || [];
        ac[value].push({
            idx: idx,
            item: cr
        });
        return ac;
    }, dict || {});
}
import CTIPropHandlers from "../checktreebox/CTIPropHandlers";

var CTLIPropHandlers = Object.keys(CTIPropHandlers).reduce((ac, key) => {
    ac[key] = Object.assign({}, CTIPropHandlers[key]);
    return ac;
}, {});

export default CTLIPropHandlers;

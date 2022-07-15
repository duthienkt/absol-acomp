import CTBPropHandlers from "../checktreebox/CTBPropHandlers";

var CTLBPropHandlers = Object.keys(CTBPropHandlers).reduce((ac, key) => {
    ac[key] = Object.assign({}, CTBPropHandlers[key]);
    return ac;
}, {});


CTLBPropHandlers.leafOnly = {
    enumerable: true,
    value: true
};


export default CTLBPropHandlers;


/***
 *
 * @type {boolean}
 * @name enableSearch
 * @memberOf MCheckTreeBox#
 */
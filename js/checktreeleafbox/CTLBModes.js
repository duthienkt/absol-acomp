import { CTBModeNormal } from "../checktreebox/CTBModes";
import OOP from "absol/src/HTML5/OOP";

/***
 * @extends CTBModeNormal
 * @param {MCheckTreeBox} elt
 * @param {[]} items
 * @constructor
 */
export function CTLBModeNormal(elt, items) {
    CTBModeNormal.apply(this, arguments);
}

OOP.mixClass(CTLBModeNormal, CTBModeNormal);

CTLBModeNormal.prototype.getViewValues = function () {
    var values = [];
    this.children.forEach(function visit(node) {
        if (node.selected === 'all' && node.data.isLeaf) {
            values.push(node.data.value);
        }
        else if (node.children) {
            node.children.forEach(visit);
        }
    });
    return values;
};

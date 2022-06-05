import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { _ } from "../../../ACore";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTNumber() {
    OMTBaseType.apply(this, arguments);
    this.value = null;
}


OOP.mixClass(OMTNumber, OMTBaseType);
OMTBaseType.classes.string = OMTNumber;

OMTNumber.prototype.assign = function (o) {
    this.value = o;
    this.$body.clearChild();
    this.$value = _({
        tag: 'span',
        child: { text: o + '' }
    });
    this.$body.addChild(this.$value);
};

export default OMTNumber;
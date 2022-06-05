import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { _ } from "../../../ACore";
import { generateJSVariable } from "absol/src/JSMaker/generator";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTString() {
    OMTBaseType.apply(this, arguments);
    this.value = null;
}


OOP.mixClass(OMTString, OMTBaseType);
OMTBaseType.classes.string = OMTString;

OMTString.prototype.assign = function (o) {
    this.value = o;
    this.$body.clearChild();
    this.$value = _({
        tag: 'span',
        child: { text: (o || '') + '' }
    });
    this.$body.addChild(this.$value);

};

OMTString.prototype.getRaw = function () {
    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: { text: (this.descriptor.displayName || this.descriptor.name || "ROOT") + ': ' }
            },
            {
                tag: 'span',
                child: { text: this.export() }
            }
        ]
    };
};

export default OMTString;
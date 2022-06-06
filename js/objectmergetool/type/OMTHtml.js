import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { _ } from "../../../ACore";
import { generateJSVariable } from "absol/src/JSMaker/generator";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTHtml() {
    OMTBaseType.apply(this, arguments);
    this.value = null;
}


OOP.mixClass(OMTHtml, OMTBaseType);
OMTBaseType.classes.html = OMTHtml;
OMTHtml.prototype.type = 'html';

OMTHtml.prototype.assign = function (o) {
    this.value = o;
    this.$body.clearChild();
    this.$value = _({
        tag: 'div',
        props:{
            innerHTML: o
        }
    });
    this.$body.addChild(this.$value);

};

OMTHtml.prototype.getRaw = function () {
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

export default OMTHtml;
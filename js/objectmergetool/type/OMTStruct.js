import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { $, _ } from "../../../ACore";
import { stringHashCode } from "absol/src/String/stringUtils";
import { generateJSVariable } from "absol/src/JSMaker/generator";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTStruct() {
    OMTBaseType.apply(this, arguments);
    this.children = (this.descriptor.fields || []).map(field => OMTBaseType.make(this.tool, this, field));
    this.$body.addChild(this.children.map(child => child.elt));
    this.data = null;
}


OOP.mixClass(OMTStruct, OMTBaseType);

OMTStruct.prototype.type = 'struct';


OMTStruct.prototype.assign = function (o) {
    if (o !== null && typeof o === "object") {
        this.elt.removeClass('as-null');
        this.children.forEach(child => {
            var name = child.descriptor.name;
            child.assign(o[name]);
        });
    }
    else {
        this.elt.addClass('as-null');
    }
};

OMTStruct.prototype.export = function () {
    return this.children.reduce((ac, cr) => {
        ac[cr.descriptor.name] = cr.export();
        return ac;
    }, {});
};

OMTStruct.prototype.getHash = function () {
    var hash = this.children.map(c => c.getHash()).join('_');
    return stringHashCode(hash);
};

OMTStruct.prototype.getRaw = function () {
    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: { text: (this.descriptor.displayName || this.descriptor.name || "ROOT")+': ' }
            },
            {
                style:{paddingLeft: '25px'},
                child: this.children.map((child=> child.getRaw()))
            }
        ]
    };
};


OMTBaseType.classes.struct = OMTStruct;
export default OMTStruct;
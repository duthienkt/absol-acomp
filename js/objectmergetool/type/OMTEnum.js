import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { _ } from "../../../ACore";
import SelectTreeMenu from "../../SelectTreeMenu";
import { generateJSVariable } from "absol/src/JSMaker/generator";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTEnum() {
    OMTBaseType.apply(this, arguments);
    this.value = null;
}

OOP.mixClass(OMTEnum, OMTBaseType);

OMTBaseType.classes.enum = OMTEnum;

OMTEnum.prototype.render = function () {
    OMTBaseType.prototype.render.call(this);
    this.$value = _({
        tag: SelectTreeMenu.tag,
        class: 'as-border-none',
        style: { height: '18px' },
        props: {
            readOnly: true,
        }
    });
    this.$body.addChild(this.$value);
    if (this.descriptor.items && this.descriptor.items.then) {
        this.descriptor.items.then(items => {
            this.$value.items = items;
        });
    }
    else {
        this.$value.items = this.descriptor.items;
    }
}

OMTEnum.prototype.assign = function (o) {
    this.value = o;
    this.$value.value = o;
};


OMTEnum.prototype.getRaw = function () {
    var text = '';
    var holders = this.$value.findItemsByValue(this.export());
    if (holders && holders.length > 0) {
        text = holders[0].item.text;
        if (holders[0].item.desc) text += ' - ' + holders[0].item.desc;
    }

    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: { text: (this.descriptor.displayName || this.descriptor.name || "ROOT") + ': ' }
            },
            {
                tag: 'span',
                child: { text: text }
            }
        ]
    };
};

export default OMTEnum;
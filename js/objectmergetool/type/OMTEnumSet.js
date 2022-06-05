import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { $$, _ } from "../../../ACore";
import OMTArray from "./OMTArray";
import OMTEnumSetMergeDialog from "../dialog/OMTEnumSetMergeDialog";
import MultiCheckMenu from "../../MultiCheckMenu";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTEnumSet() {
    OMTBaseType.apply(this, arguments);
    this.value = null;
    this._flatTreeItems();
}

OOP.mixClass(OMTEnumSet, OMTBaseType);

OMTBaseType.classes['{enum}'] = OMTEnumSet;

OMTEnumSet.prototype.commands = OMTArray.prototype.commands.slice();

OMTEnumSet.prototype._flatTreeItems = function () {
    if (!this.descriptor.flat) {
        this.descriptor.flat = true;
        this.descriptor.items = this.descriptor.items.reduce(function visit(ac, cr) {
            var item = Object.assign({}, cr);
            ac.push(item);
            if (item.items && item.items.length > 0) {
                item.items.reduce(visit, ac);
            }
            delete item.items;
            return ac;
        }, []);
    }
};

OMTEnumSet.prototype.render = function () {
    OMTBaseType.prototype.render.call(this);
    this.$value = _({
        tag: MultiCheckMenu.tag,
        class: 'as-border-none',
        style: { height: '18px' },
        props: {
            readOnly: true,
            strictValue: false
        }
    });
    this.$body.addChild(this.$value);
    this.$value.items = this.descriptor.items;
    this.$value.values = this.value;
}

OMTEnumSet.prototype.assign = function (o) {
    this.value = o;
    this.$value.values = o;
};

OMTEnumSet.prototype.execCmd = function (commandName) {
    OMTBaseType.prototype.execCmd.call(this, commandName);
    if (commandName === 'merge') {
        this.userMerge();
    }
};

OMTEnumSet.prototype.userMerge = function () {
    //as-omt-option-row

    new OMTEnumSetMergeDialog(this);
};


OMTEnumSet.prototype.getRaw = function () {
    var textItems = this.export().map(value => {
        var text = '';
        var holders = this.$value.findItemsByValue(value);
        if (holders && holders.length > 0) {
            text = holders[0].item.text;
            if (holders[0].item.desc) text += ' - ' + holders[0].item.desc;
        }
        return text;
    })


    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: { text: (this.descriptor.displayName || this.descriptor.name || "ROOT") + ': ' }
            },
            {
                style: { paddingLeft: '25px' },
                child: textItems.map(text => ({
                    tag: 'li',
                    child: { text: text }
                }))
            }
        ]
    };
};

export default OMTEnumSet;
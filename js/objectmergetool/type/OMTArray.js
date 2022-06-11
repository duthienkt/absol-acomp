import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import {_} from "../../../ACore";
import OMTArrayMergeDialog from "../dialog/OMTArrayMergeDialog";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTArray() {
    OMTBaseType.apply(this, arguments);
    this.value = null;
}


OOP.mixClass(OMTArray, OMTBaseType);
OMTBaseType.classes.array = OMTArray;

OMTArray.prototype.commands = OMTArray.prototype.commands.concat([
    {
        name: 'merge',
        icon: 'span.mdi.mdi-set-merge',
        title: 'Merge'
    }
]);

OMTArray.prototype.execCmd = function (commandName) {
    OMTBaseType.prototype.execCmd.call(this, commandName);
    if (commandName === 'merge') {
        new OMTArrayMergeDialog(this);
    }
};

OMTArray.prototype.assign = function (o) {
    this.$body.clearChild();
    this.children = (o || []).map((it, i) => {
        var desc = Object.assign({
            name: i,
            displayName: i + 1 + ''
        }, this.descriptor.of);
        if (!desc.displayName) desc.displayName = i + 1 + '';
        var res = OMTBaseType.make(this.tool, this.parent, desc);
        res.assign(it);
        return res;
    });
    this.$body.addChild(this.children.map(c => c.elt));
};

OMTArray.prototype.export = function () {
    return this.children.map(c => c.export());
};

OMTArray.prototype.getRaw = function () {
    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: {text: (this.descriptor.displayName || this.descriptor.name || "ROOT") + ': '}
            },
            {
                style: {paddingLeft: '25px'},
                child: this.children.map((child => child.getRaw()))
            }
        ]
    };
};


export default OMTArray;
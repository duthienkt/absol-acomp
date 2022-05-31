import Fragment from "absol/src/AppPattern/Fragment";
import { $$, _ } from "../../../ACore";
import MessageDialog from "../../MessageDialog";
import Modal from "../../Modal";
import OOP from "absol/src/HTML5/OOP";
import MultiCheckTreeMenu from "../../MultiCheckTreeMenu";
import CheckboxInput from "../../CheckBoxInput";
import { arrayUnique } from "absol/src/DataStructure/Array";
import RadioButton from "../../RadioButton";
import OMTSelectOptionsDialog from "./OMTSelectOptionsDialog";
import { randomIdent } from "absol/src/String/stringGenerate";
import CheckboxButton from "../../CheckboxButton";
import { stringHashCode } from "absol/src/String/stringUtils";

function hashArrayOf(node) {
    var res = (node.children || []).map(child => child.getHash());
    res.sort((a, b) => a - b);
    return arrayUnique(res);
}

/***
 * @extends Fragment
 * @param {OMTArray} node
 * @constructor
 */
function OMTArrayMergeDialog(node) {
    Fragment.call(this);
    this.node = node;
    this.calc();
    this.getView();
    this.start();
}

OOP.mixClass(OMTArrayMergeDialog, Fragment);


OMTArrayMergeDialog.prototype.calc = function () {
    this.options = this.node.getSelectOptions();
    this.curHash = hashArrayOf(this.node);
    this.selectedNodes = {};
};

OMTArrayMergeDialog.prototype.onStart = function () {
    this.$modal.addTo(document.body);
};


OMTArrayMergeDialog.prototype.onStop = function () {
    this.$modal.remove();
};

OMTArrayMergeDialog.prototype.assignResult = function () {
    var dict = {};
    var itemArr = [];
    var hashArr = [];
    var node
    for (var key in this.selectedNodes) {
        node = this.selectedNodes[key];
        if (node.children) {
            node.children.forEach(cr => {
                var hash = cr.getHash();
                if (dict[hash]) return;
                dict[hash] = true;
                itemArr.push(cr.export());
                hashArr.push(hash);
            });
        }
    }

    if (this.curHash === hashArr && arrayUnique(this.curHash.concat(hashArr)).length === this.curHash.length) return;
    this.node.assign(itemArr);
    this.node.updateRaw();
    this.node.tool.notifyChange();
};


OMTArrayMergeDialog.prototype._makeOptionRow = function (opt, i, dict) {
    var self = this;
    var descriptor = Object.assign({}, this.node.descriptor);
    var clazz = this.node.constructor;
    var node = new clazz(this.node.tool, this.node.parent, descriptor);
    node.assign(opt);
    var nodeHash = stringHashCode(hashArrayOf(node).join(','));
    if (dict[nodeHash]) return null;
    dict[nodeHash] = node;
    var checked = arrayUnique(this.curHash.concat(hashArrayOf(node))).length === this.curHash.length;
    if (checked) this.selectedNodes[nodeHash] = node;
    var radio = _({
        tag: CheckboxInput.tag,
        style: {
            marginRight: '10px'
        },
        props: {
            checked: checked
        },
        on: {
            change: function () {
                if (radio.checked) {
                    self.selectedNodes[nodeHash] = node;
                }
                else {
                    delete self.selectedNodes[nodeHash];
                }
                self.$view.$actionBtns[1].disabled = Object.keys(self.selectedNodes).length === 0;
            }
        }
    });
    return _({
        class: 'as-omt-option-row',
        child: [
            radio,
            node.elt
        ]
    });
};

OMTArrayMergeDialog.prototype.createView = function () {
    var self = this;
    /***
     * @type MessageDialog
     */
    this.$view = _({
        tag: MessageDialog.tag,
        class: 'as-omt-dialog',
        props: {
            dialogTitle: 'Options',
            dialogActions: [
                {
                    class: 'secondary',
                    text: 'Cancel',
                    name: 'cancel'
                },
                {
                    class: 'primary',
                    text: 'OK',
                    name: 'ok'
                }
            ]
        },
        on: {
            action: function (event) {
                self.stop()
                var action = event.action;
                if (action.name === 'cancel') return;
                if (action.name === 'ok') {
                    self.assignResult();
                }
            }
        }
    });

    var dict = {};
    var rows = this.options.map((opt, i) => this._makeOptionRow(opt, i, dict)).filter(x => !!x);

    this.$view.addChild(rows);

    this.$modal = _({
        tag: Modal.tag,
        child: this.$view
    });
};


export default OMTArrayMergeDialog;
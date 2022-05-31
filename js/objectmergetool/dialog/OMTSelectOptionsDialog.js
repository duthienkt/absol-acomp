import Fragment from "absol/src/AppPattern/Fragment";
import { $$, _ } from "../../../ACore";
import MessageDialog from "../../MessageDialog";
import Modal from "../../Modal";
import OOP from "absol/src/HTML5/OOP";
import { randomIdent } from "absol/src/String/stringGenerate";
import RadioButton from "../../RadioButton";

/***
 * @extends Fragment
 * @param {OMTBaseType} node
 * @constructor
 */
function OMTSelectOptionsDialog(node) {
    Fragment.call(this);
    this.node = node;
    this.calc();
    this.getView();
    this.start();
}

OOP.mixClass(OMTSelectOptionsDialog, Fragment);

OMTSelectOptionsDialog.prototype.calc = function () {
    this.options = this.node.getSelectOptions();
    this.curHash = this.node.getHash();
    this.selectedHash = this.curHash;
    this.selectedOption = null;
    this.ident = randomIdent(5);
};

OMTSelectOptionsDialog.prototype.onStart = function () {
    this.$modal.addTo(document.body);
};


OMTSelectOptionsDialog.prototype.onStop = function () {
    this.$modal.remove();
};

OMTSelectOptionsDialog.prototype.assignResult = function () {
    if (this.curHash !== this.selectedHash) {
        this.node.assign(this.selectedOption);
        this.node.updateRaw();
        this.node.tool.notifyChange();
    }
};


OMTSelectOptionsDialog.prototype._makeOptionRow = function (opt, i, dict) {
    var descriptor = Object.assign({}, this.node.descriptor);
    if (i < 0) {
        descriptor.desc = '(current-mixed)';
    }
    var clazz = this.node.constructor;
    var node = new clazz(this.node.tool, this.node.parent, descriptor);
    node.assign(opt);
    var nodeHash = node.getHash();
    if (dict[nodeHash]) return null;
    dict[nodeHash] = node;
    var self = this;
    var radio = _({
        tag: RadioButton.tag,
        style: {
            marginRight: '10px'
        },
        props: {
            name: this.ident,
            checked: nodeHash === this.curHash
        },
        on: {
            change: function () {
                if (radio.checked) {
                    self.selectedHash = nodeHash;
                    self.selectedOption = opt;
                }
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

OMTSelectOptionsDialog.prototype.createView = function () {
    var self = this;
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
    if (!dict[this.curHash]) {
        rows.unshift(this._makeOptionRow(this.node.export(), -1, dict));
    }

    this.$view.addChild(rows);

    this.$modal = _({
        tag: Modal.tag,
        child: this.$view
    });
};


export default OMTSelectOptionsDialog;
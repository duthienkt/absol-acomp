import Fragment from "absol/src/AppPattern/Fragment";
import { $$, _ } from "../../../ACore";
import MessageDialog from "../../MessageDialog";
import Modal from "../../Modal";
import OOP from "absol/src/HTML5/OOP";
import MultiCheckTreeMenu from "../../MultiCheckTreeMenu";
import CheckboxInput from "../../CheckBoxInput";
import { arrayUnique } from "absol/src/DataStructure/Array";


/***
 * @extends Fragment
 * @param {OMTEnumSet} node
 * @constructor
 */
function OMTEnumSetMergeDialog(node) {
    Fragment.call(this);
    this.node = node;
    this.calc();
    this.getView();
    this.start();
}

OOP.mixClass(OMTEnumSetMergeDialog, Fragment);

OMTEnumSetMergeDialog.prototype.calc = function () {
    this.currentValues = this.node.export();
    this.descriptor = this.node.descriptor;
    this.selectOptions = this.node.getSelectOptions();
    this.selected = {};

};

OMTEnumSetMergeDialog.prototype.onStart = function () {
    this.$modal.addTo(document.body);
};


OMTEnumSetMergeDialog.prototype.onStop = function () {
    this.$modal.remove();
};

OMTEnumSetMergeDialog.prototype.assignResult = function () {
    var selectedValues = this._getCurrent();
    if (selectedValues.length > 0) {
        this.node.assign(arrayUnique(this.currentValues.concat(selectedValues)));
        this.node.notifyChange();
    }
};

OMTEnumSetMergeDialog.prototype._getCurrent = function () {
    var selectedValues = this.selectOptions.reduce((ac, cr, i) => {
        if (this.selected[i]) ac = ac.concat(cr);
        return ac;
    }, []);
    selectedValues = arrayUnique(selectedValues);
    return selectedValues;
}

OMTEnumSetMergeDialog.prototype._makeOptionRow = function (opt, i) {
    var self = this;
    var checked = arrayUnique(this.currentValues.concat(opt)).length === arrayUnique(this.currentValues).length;
    this.selected[i] = checked;
    var checkbox = _({
        tag: CheckboxInput.tag,

        style: {
            marginRight: '10px',
        },
        props: {
            checked: checked
        },
        on: {
            change: function () {
                self.selected[i] = checkbox.checked;
                var currentValues = self._getCurrent();
                self.previewNode.assign(currentValues);
                self.$view.$actionBtns[1].disabled = currentValues.length === 0;
            }
        }
    });

    var mSelect = _({
        tag: MultiCheckTreeMenu.tag,
        class: 'as-border-none',
        props: {
            pendingValues: opt,
            readOnly: true
        }
    });

    return _({
        class: 'as-omt-option-row',
        child: [
            checkbox,
            mSelect
        ]
    });
};

OMTEnumSetMergeDialog.prototype.createView = function () {
    var self = this;
    this.$optionRows = this.selectOptions.map((opt, i) => this._makeOptionRow(opt, i));
    this.previewNode = new this.node.constructor(this.node.tool, this.node.parent, this.node.descriptor);
    this.previewNode.assign(this.currentValues);
    this.$view = _({
        tag: MessageDialog.tag,
        class: ['as-omt-dialog'],
        props: {
            dialogTitle: 'Merge',
            dialogActions: [
                {
                    text: 'OK',
                    name: 'ok'
                },
                {
                    text: 'Cancel',
                    name: 'cancel'
                }
            ],

        },
        on: {
            action: function (event) {
                self.stop();
                if (event.action.name === 'ok') {
                    self.assignResult();
                }
            }
        },
        child: [
            this.previewNode,
            {
                child: [
                    {
                        class: 'as-omt-field-name',
                        child: { text: 'Merge From' }
                    }

                ].concat(this.$optionRows)
            }
        ]
    });
    Promise.resolve(this.descriptor.items).then(items => {
        $$(MultiCheckTreeMenu.tag, this.$view).forEach(elt => {
            elt.items = items;
            elt.values = elt.pendingValues;
        });
    });


    this.$modal = _({
        tag: Modal.tag,
        style:{
            zIndex: 1000000,
        },
        child: this.$view
    });
};


export default OMTEnumSetMergeDialog;
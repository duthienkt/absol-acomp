import Dom from "absol/src/HTML5/Dom";
import OOP from "absol/src/HTML5/OOP";
import { randomIdent } from "absol/src/String/stringGenerate";

/**
 * @extends Dom
 * @constructor
 */
function EditableDom() {
    Dom.apply(this, arguments);
}

OOP.mixClass(EditableDom, Dom);

EditableDom.prototype.attach = function (element) {
    Dom.prototype.attach.apply(this, arguments);
    element.defineEvent(['range', 'focus', 'blur']);
};

var EditableDomInstance = new EditableDom();

export var _ = EditableDomInstance._;
export var $ = EditableDomInstance.$;
export var $$ = EditableDomInstance.$$;

/**
 * @extends AElement
 * @constructor
 */
function EditableElement() {
    this.attr('contenteditable', true);
    this.addClass('as-editable');
    this.selectionCtrl = new EESelectionController(this);
}

EditableElement.tag = 'EditableElement';
EditableElement.render = function () {
    return _('div');
};


function EESelectionController(elt) {
    this.elt = elt;
    this.rangeFocusing = {};
    for (var key in this.constructor.prototype) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.elt.on({
        focus: this.ev_focus,
        blur: this.ev_blur
    });
}

EESelectionController.prototype.ev_selectionChange = function (event) {
    var sel = document.getSelection();
    // var range = sel.getRangeAt(0);
    console.log(sel,  sel.rangeCount)
};

EESelectionController.prototype.ev_focus = function (event) {
    document.addEventListener('selectionchange', this.ev_selectionChange);
};

EESelectionController.prototype.ev_blur = function (event) {
    document.removeEventListener('selectionchange', this.ev_selectionChange);

};

export default EditableElement;

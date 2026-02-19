import '../css/pincodeinput.css';
import ACore from '../ACore';
import AElement from 'absol/src/HTML5/AElement';
import { mixClass } from 'absol/src/HTML5/OOP';
import { implicitInteger, isNaturalNumber } from "absol/src/Converter/DataTypes";

var _ = ACore._;
var $ = ACore.$;

/**
 * Pin code input.
 *
 * @augments {AElement}
 * @constructor
 */
function PinCodeInput() {
    this.defineEvent(['change', 'input', 'focus', 'blur']);

    this.$input = $('input.as-pin-code-input-hidden', this);
    this.$cellsCtn = $('.as-pin-code-input-cells-ctn', this);
    this.$cells = [];

    this.rawValue = '';

    this.inputCtrl = new PCIInputController(this);
    this.cellsCtrl = new PCICellsController(this);

    this.on('click', this.eventHandler.click);
    this.addEventListener('focus', this.eventHandler.focus, true);

    // init
    this.length = 6;
    this.value = '';
}

mixClass(PinCodeInput, AElement);

PinCodeInput.tag = 'pincodeinput';

PinCodeInput.render = function () {
    return _({
        attr: {
            tabindex: 1
        },
        class: 'as-pin-code-input',
        child: [
            {
                tag: 'input',
                class: 'as-pin-code-input-hidden',
                attr: {
                    type: 'text',
                    inputmode: 'numeric',
                    autocomplete: 'one-time-code',
                    'aria-label': 'PIN code'
                }
            },
            {
                class: 'as-pin-code-input-cells-ctn'
            }
        ]
    });
};
//
// PinCodeInput.prototype._renderCells = function () {
//     this.$cells.clearChild();
//     this.$cellList = [];
//     for (var i = 0; i < this._length; ++i) {
//         var cell = _({
//             class: 'as-pin-code-input-cell',
//             child: {
//                 class: 'as-pin-code-input-cell-text',
//                 child: { text: '' }
//             }
//         });
//         this.$cellList.push(cell);
//         cell.addTo(this.$cells);
//     }
//     this._syncUI();
// };

PinCodeInput.prototype.focus = function () {
    this.inputCtrl.focus();
};

PinCodeInput.prototype.blur = function () {
    this.inputCtrl.blur();
};

PinCodeInput.prototype.clear = function () {
    this.value = '';
};

PinCodeInput.property = {};

PinCodeInput.property.value = {

    /**
     * @this {PinCodeInput}
     */
    set: function (value) {
        value = value + '';
        value = value.replace(/\D+/g, '');
        this.rawValue = value;
        this.inputCtrl.updateValue();
        this.cellsCtrl.updateValue();
        if (document.activeElement === this.$input || document.activeElement === this) {
            this.inputCtrl.normalizeRange();
            this.cellsCtrl.updateRange();
        }
    },
    get: function () {
        return this.rawValue.slice(0, this.length);
    }
};

PinCodeInput.property.length = {
    set: function (value) {
        this.cellsCtrl.length = value;
        this.inputCtrl.updateValue();
    },
    get: function () {
        return this.cellsCtrl.length;
    }
};


PinCodeInput.eventHandler = {};

PinCodeInput.eventHandler.click = function (event) {
    if (event.target === this.$cellsCtn || event.target === this) {
        this.focus();
    }
};

PinCodeInput.eventHandler.focus = function (event) {
    if (event.target === this) {
        this.focus();
    }
};


ACore.install(PinCodeInput);

export default PinCodeInput;

/**
 *
 * @param {PinCodeInput} elt
 * @constructor
 */
function PCICellsController(elt) {
    this.elt = elt;
    this.$cellsCtn = elt.$cellsCtn;
    this.$cells = this.elt.$cells;
}

PCICellsController.prototype.updateValue = function () {
    var value = this.elt.value;
    var ch;
    for (var i = 0; i < this.$cells.length; ++i) {
        ch = value[i] || '';
        this.$cells[i].firstChild.firstChild.data = ch;
        this.$cells[i].classList.toggle('as-filled', !!ch);
    }
};

PCICellsController.prototype.updateRange = function () {
    var rawValue = this.elt.value;
    var selStart = this.elt.inputCtrl.getSelectionStart();
    var selEnd = this.elt.inputCtrl.getSelectionEnd();
    var activeIdx = this.elt.inputCtrl.getCaretIndex();
    for (var i = 0; i < this.$cells.length; ++i) {
        // highlight selection for corresponding rawValue positions
        this.$cells[i].classList.toggle('as-active', i === activeIdx);
        this.$cells[i].classList.toggle('as-selected', i >= selStart && i < selEnd && i < rawValue.length);
    }
};

PCICellsController.prototype.update = function () {
    this.updateValue();
    this.updateRange();
};


PCICellsController.prototype.ev_clickCell = function (cellIdx) {
    var value = this.elt.value;
    var idx = Math.min(cellIdx, value.length);
    this.elt.inputCtrl.focusAt(idx);
    this.updateRange();

};


Object.defineProperty(PCICellsController.prototype, 'length', {
    set: function (value) {
        value = implicitInteger(Math.round(value));
        if (!isNaturalNumber(value) || value < 1) value = 6;
        var cell;
        while (this.$cells.length < value) {
            cell = _({
                class: 'as-pin-code-input-cell',
                attr: {
                    'data-idx': this.$cells.length
                },
                child: {
                    class: 'as-pin-code-input-cell-text',
                    child: { text: '' }
                },
                on: {
                    click: this.ev_clickCell.bind(this, this.$cells.length)
                }
            });
            this.$cells.push(cell);
            cell.addTo(this.$cellsCtn);
        }
        while (this.$cells.length > value) {
            cell = this.$cells.pop();
            cell.remove();
        }
        this.updateValue();
    },
    get: function () {
        return this.$cells.length;
    }
});

/**
 * Controller for the hidden input element of {@link PinCodeInput}.
 * Owns all input parsing/sanitizing and emits changes back to the host.
 *
 * @param {PinCodeInput} elt
 * @constructor
 */
function PCIInputController(elt) {
    for (var key in this) {
        if (key.startsWith('ev_') && typeof this[key] === 'function') {
            this[key] = this[key].bind(this);
        }
    }
    this.elt = elt;
    /**
     *
     * @type {HTMLInputElement|AElement}
     */
    this.$input = elt.$input;

    this.$input.on('input', this.ev_input);
    this.$input.on('focus', this.ev_focus);
    this.$input.on('blur', this.ev_blur);
    this.$input.on('select', this.ev_select);
    this.$input.on('keyup', this.ev_keyup);
    this.$input.on('mouseup', this.ev_mouseup);
}

PCIInputController.prototype.getSelectionStart = function () {
    return implicitInteger(this.$input.selectionStart || 0);
};

PCIInputController.prototype.getSelectionEnd = function () {
    var v = this.$input.value || '';
    var end = this.$input.selectionEnd;
    end = end == null ? v.length : end;
    return implicitInteger(end);
};

PCIInputController.prototype.getCaretIndex = function () {
    // selectionStart is caret if no selection
    return this.getSelectionStart();
};

PCIInputController.prototype.updateValue = function () {
    // keep native input in sync with displayed value
    this.$input.value = this.elt.value;
    this.normalizeRange();
};

PCIInputController.prototype.normalizeRange = function () {
    var rawValue = this.elt.rawValue || '';
    var maxLen = rawValue.length;

    // current caret
    var start = implicitInteger(this.$input.selectionStart || 0);
    if (!isNaturalNumber(start)) start = 0;

    if (start > maxLen) start = maxLen;

    try {
        this.$input.setSelectionRange(start, maxLen);
    } catch (err) {
        // ignore
    }

    this.elt.cellsCtrl.updateValue();
};

PCIInputController.prototype.ev_select = function () {
    this.normalizeRange();
};

PCIInputController.prototype.ev_keyup = function () {
    this.normalizeRange();
};

PCIInputController.prototype.ev_mouseup = function () {
    this.normalizeRange();
};

PCIInputController.prototype.sanitize = function (value) {
    value = value == null ? '' : (value + '');
    value = value.replace(/\D+/g, '');
    return value;
};

PCIInputController.prototype.focus = function () {
    this.$input.focus();
};

PCIInputController.prototype.blur = function () {
    this.$input.blur();
};

PCIInputController.prototype.focusAt = function (idx) {
    idx = implicitInteger(Math.round(idx));
    if (!isNaturalNumber(idx)) idx = 0;

    var rawValue = this.elt.rawValue || '';
    if (idx > rawValue.length) idx = rawValue.length;

    this.$input.focus();

    try {
        this.$input.setSelectionRange(idx, rawValue.length);
    } catch (err) {
        // ignore
    }
};

PCIInputController.prototype.ev_focus = function (event) {
    this.elt.emit('focus', { type: 'focus', target: this.elt, originEvent: event }, this.elt);
    this.normalizeRange();
};

PCIInputController.prototype.ev_blur = function (event) {
    setTimeout(() => {
        var activeElt = document.activeElement;
        if (this.elt.contains(activeElt)) return;
        //todo: blur
        this.elt.emit('blur', { type: 'blur', target: this.elt, originEvent: event }, this.elt);
    }, 5)
    // this.elt.emit('blur', { type: 'blur', target: this.elt, originEvent: event }, this.elt);
    // // clear selection visuals on blur
    // this.$input.setSelectionRange(0, 0);
    // this.elt.cellsCtrl.updateValue();
};

PCIInputController.prototype.ev_input = function (event) {
    var newRawValue = this.sanitize(this.$input.value);

    if (newRawValue !== this.elt.rawValue) {
        this.elt.rawValue = newRawValue;
        this.updateValue();
        this.elt.cellsCtrl.update();
        this.elt.emit('input', {
            type: 'input',
            target: this.elt,
            value: this.elt.value,
            originEvent: event
        }, this.elt);
        if (this.elt.value.length === this.elt.length) {
            this.elt.emit('change', {
                type: 'change',
                target: this.elt,
                value: this.elt.value,
                originEvent: event
            }, this.elt);
            this.elt.blur();//auto blur when filled to max length
        }
    }
    else if (newRawValue !== this.$input.value) {
        this.$input.value = newRawValue;
        this.normalizeRange();
        this.elt.cellsCtrl.update();
    }
    else {
        this.normalizeRange();
        this.elt.cellsCtrl.update();
    }
};

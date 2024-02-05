import ACore, { _, $, $$ } from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import PreInput from "./PreInput";
import '../css/tableoftextinput.css';
import Follower from "./Follower";
import FontColorButton from "./colorpicker/FontColorButton";
import Attributes from "absol/src/AppPattern/Attributes";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { findMaxZIndex, isNaturalNumber, isRealNumber } from "./utils";
import Color from "absol/src/Color/Color";
import { InsertColLeftIcon, InsertColRightIcon } from "./Icons";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import Snackbar from "./Snackbar";


/**
 * @typedef TEIDataRow
 */

/**
 * @typedef TEIDataBody
 * @property {TEIDataRow[]} rows
 */

/**
 * @typedef TEIData
 * @property {TEIDataBody} body
 */

/**
 * @typedef TEIDataCell
 * @property {{color?:string, fontSize?: number, fontWeight?: ("bool"|"normal")}} [style]
 * @property {string} value
 */


/**
 * @extends AElement
 * @constructor
 */
function TableOfTextInput() {
    /**
     *
     * @type {TEICell[]}
     */
    this.cells = [];
    this.$row = $('tbody tr', this);
    this.formatTool = new TEIFormatTool(this);

    this._minCol = 3;
    this._maxCol = 3;

    /**
     * @name data
     * @type {TEICell[]}
     */
}

/**
 *
 * @param name
 * @param value
 * @returns  {this}
 */
TableOfTextInput.prototype.addStyle = function (name, value) {
    if (name === 'display') {
        if ((typeof value === "string") && value.indexOf('inline')) {
            this.addClass('as-inline');
        }
        else {
            this.removeClass('as-inline');
        }
        return this;
    }
    else return AElement.prototype.addStyle.apply(this, arguments);
};

TableOfTextInput.tag = 'TableOfTextInput'.toLowerCase();

TableOfTextInput.render = function () {
    return _({
        tag: 'table',
        extendEvent: ['change'],
        class: 'as-table-of-text-input',
        child: [
            {
                tag: 'tbody',
                child: [
                    {
                        tag: 'tr'
                    }
                ]
            }
        ]
    });
};

TableOfTextInput.property = {};
TableOfTextInput.property.data = {
    set: function (value) {
        value = value || [];
        this.cells.slice().forEach(c => c.remove());
        this.cells = value.map(cd => new TEICell(this, cd));
        this.$row.addChild(this.cells.map(c => c.td));
    },
    get: function () {
        return this.cells.map(c => c.data);
    }
};

TableOfTextInput.property.minCol = {
    set: function (value) {
        if (!isNaturalNumber(value)) value = 1;
        value = Math.max(1, Math.floor(value));
        this._minCol = value;
    },
    get: function () {
        return this._minCol;
    }
};


TableOfTextInput.property.maxCol = {
    set: function (value) {
        if (!isNaturalNumber(value)) value = 20;
        value = Math.min(20, Math.max(1, Math.floor(value)));
        this._maxCol = value;
    },
    get: function () {
        return Math.max(this._minCol, this._maxCol);
    }
};


export default TableOfTextInput;

ACore.install(TableOfTextInput);

/**
 *
 * @param {TableOfTextInput} table
 * @param {TEIDataCell} data
 * @constructor
 */
function TEICell(table, data) {
    this.table = table;
    this.td = _({
        tag: 'td',
        class: 'as-table-of-text-input-cell',
        child: {
            tag: PreInput,
            attr: {
                spellcheck: 'false'
            },
            props: {},
            on: {
                focus: () => {
                    table.formatTool.onFocus(this);
                },
                blur: () => {
                    table.formatTool.onBlur(this);
                },
                change: (event) => {
                    if (event.originalEvent)
                        table.emit('change', { type: 'change', target: table, cell: this }, this);
                }
            }
        }
    });
    this.$input = $('preinput', this.td);
    this.data = data;
    this.style = new Attributes(this);
    Object.assign(this.style, data.style);
    this.style.loadAttributeHandlers(this.styleHandlers);
}

TEICell.prototype.remove = function () {
    this.td.remove();
    var idx = this.table.cells.indexOf(this);
    if (idx >= 0) this.table.cells.splice(idx, 1);
};

TEICell.prototype.styleHandlers = {
    fontWeight: {
        set: function (value) {
            if (value === 'bold') {
                this.td.addClass('as-bold');

            }
            else {
                this.td.removeClass('as-bold');
            }
        },
        get: function () {
            if (this.td.hasClass('as-bold')) return 'bold';
            return 'normal';
        },
        export: function () {
            if (this.td.hasClass('as-bold')) return 'bold';
            return undefined;
        }
    },
    fontStyle: {
        set: function (value) {
            if (value === 'italic') {
                this.td.addClass('as-italic');
            }
            else {
                this.td.removeClass('as-italic');
            }
        },
        get: function () {
            if (this.td.hasClass('as-italic')) return 'italic';
            return 'normal';
        },
        export: function () {
            if (this.td.hasClass('as-italic')) return 'italic';
            return undefined;
        }
    },
    fontSize: {
        set: function (value) {
            if (typeof value === "string") value = parseInt(value.replace(/[^0-9.]/g, ''), 10);
            if (!isRealNumber(value)) value = 14;
            value = Math.abs(value);
            value = value || 14;
            this.td.addStyle('font-size', value + 'px');
            return value;
        },
        get: function (ref) {
            var value = ref.get();
            return value || 14;
        },
        export: function (ref) {
            var value = ref.get();
            if (value === 14) value = undefined;
            return value || undefined;
        }
    },
    color: {
        set: function (value) {
            try {
                var cValue = Color.parse(value);
                value = cValue.toString('hex6');
            } catch (err) {
                value = '#000000';
            }
            this.td.addStyle('color', value);
            return value;
        },
        get: function (ref) {
            return ref.get() || '#000000';
        },
        export: function (ref) {
            var value = ref.get();
            if (value === '#000000') value = undefined;
            return value || undefined;
        }
    },
    textAlign: {
        set: function (value) {
            if (!['left', 'right', 'center'].includes(value))
                value = 'left';
            this.td.addStyle('text-align', value);
            return value;
        },
        get: function (ref) {
            var value = ref.get();
            return value || 'left';
        },
        export: function (ref) {
            var value = ref.get();
            if (value === 'left') value = undefined;
            return value;
        }
    }
};

Object.defineProperty(TEICell.prototype, "data", {
    set: function (value) {
        value = value || {};
        if (typeof value === "string") value = { value: value };
        if (typeof value.value === "string") {
            this.$input.value = value.value;
        }
        else {
            this.$input.value = "";
        }
    },
    get: function () {
        var res = {};
        res.value = this.$input.value;
        res.style = this.style.export();
        Object.keys(res.style).forEach(key => {
            if (res.style[key] === undefined) delete res.style[key];
        });
        return res;
    }
});


function TEIFormatTool(table) {
    Object.keys(TEIFormatTool.prototype).filter(k => k.startsWith('ev_')).forEach(k => this[k] = this[k].bind(this));
    this.table = table;
    this.table.on('keydown', this.ev_keydown)
    this.$follower = _({
        tag: Follower,
        child: {
            class: 'as-table-of-text-input-tool',
            child: [
                {
                    tag: 'numberinput',
                    class: 'as-table-of-text-input-tool-font-size',
                    props: {
                        value: 14
                    },
                    attr: { title: 'Ctrl+< | Ctrl+>' }
                },
                {
                    tag: 'button',
                    attr: { title: 'Ctrl+B' },
                    class: ['as-transparent-button', 'as-table-of-text-input-tool-bold'/*, 'as-checked'*/],
                    child: 'span.mdi.mdi-format-bold'
                },
                {
                    tag: 'button',
                    attr: { title: 'Ctrl+I' },
                    class: ['as-transparent-button', 'as-table-of-text-input-tool-italic'],
                    child: 'span.mdi.mdi-format-italic'
                },

                {
                    tag: FontColorButton
                },
                {
                    tag: 'button',
                    class: ['as-transparent-button', 'as-table-of-text-input-tool-text-align'],
                    child: 'span.mdi.mdi-format-align-left',
                    attr: { 'data-align': 'left', title: 'Ctrl+L' }
                },
                {
                    tag: 'button',
                    class: ['as-transparent-button', 'as-table-of-text-input-tool-text-align'],
                    child: 'span.mdi.mdi-format-align-center',
                    attr: { 'data-align': 'center', title: 'Ctrl+E' }
                },
                {
                    tag: 'button',
                    class: ['as-transparent-button', 'as-table-of-text-input-tool-text-align'],
                    child: 'span.mdi.mdi-format-align-right',
                    attr: { 'data-align': 'right', title: 'Ctrl+R' }
                },
                {
                    tag: 'button',
                    class: ['as-transparent-button', 'as-table-of-text-input-tool-insert-col'],
                    child: { tag: InsertColLeftIcon },
                    attr: { 'data-insert': 'left' }
                },
                {
                    tag: 'button',
                    class: ['as-transparent-button', 'as-table-of-text-input-tool-insert-col'],
                    child: { tag: InsertColRightIcon },
                    attr: { 'data-insert': 'right' }
                },

            ]
        }
    });

    this.$fontSize = $('.as-table-of-text-input-tool-font-size', this.$follower).on('change', this.ev_fontSizeChange);
    this.$bold = $('.as-table-of-text-input-tool-bold', this.$follower).on('click', this.ev_clickBold);
    this.$italic = $('.as-table-of-text-input-tool-italic', this.$follower).on('click', this.ev_clickItalic);
    this.$fontColor = $(FontColorButton.tag, this.$follower).on('submit', this.ev_fontColorSubmit);
    this.$alignBtns = $$('.as-table-of-text-input-tool-text-align', this.$follower)
        .reduce((ac, btn) => {
            var value = btn.attr('data-align');
            btn.on('click', ev => {
                this.ev_clickAlign(value, ev);
            });
            ac[value] = btn;
            return ac;
        }, {});
    this.$insertBtns = $$('.as-table-of-text-input-tool-insert-col', this.$follower)
        .reduce((ac, btn) => {
            var value = btn.attr('data-insert');
            btn.on('click', ev => {
                this.ev_clickInsert(value, ev);
            });
            ac[value] = btn;
            return ac;
        }, {});
    this.focusCell = null;
}


TEIFormatTool.prototype.onFocus = function (cell) {
    this.focusCell = cell;
    if (!this.$follower.parentElement) {
        this.$follower.addTo(document.body);
        setTimeout(() => {
            document.addEventListener('click', this.ev_clickOut);
        }, 30);
    }
    this.$follower.followTarget = this.focusCell.td;
    this.$follower.sponsorElement = this.focusCell.td;
    this.$follower.addStyle('z-index', findMaxZIndex(this.focusCell.td));

    this.$fontSize.value = this.focusCell.style.fontSize;
    if (this.focusCell.style.fontWeight === 'bold')
        this.$bold.addClass('as-checked');
    else this.$bold.removeClass('as-checked');
    if (this.focusCell.style.fontStyle === 'italic')
        this.$italic.addClass('as-checked');
    else this.$italic.removeClass('as-checked');
    this.$fontColor.value = this.focusCell.style.color;
    var textAlign = this.focusCell.style.textAlign;
    for (var align in this.$alignBtns) {
        if (align === textAlign) {
            this.$alignBtns[align].addClass('as-checked');
        }
        else {
            this.$alignBtns[align].removeClass('as-checked');
        }
    }
};


TEIFormatTool.prototype.onBlur = function (cell) {
    // if (this.focusCell !== cell) return;

};


TEIFormatTool.prototype.ev_clickOut = function (event) {
    if (hitElement(this.table, event)) return;
    this.focusCell = null;
    this.$follower.followTarget = null;
    this.$follower.remove();
    document.removeEventListener('click', this.ev_clickOut);
};

TEIFormatTool.prototype.ev_fontSizeChange = function () {
    if (!this.focusCell) return;
    var prevValue = this.focusCell.style.fontSize;
    var newValue = this.$fontSize.value;
    if (newValue !== prevValue) {
        this.focusCell.style.fontSize = newValue;
        this.table.emit('change', { type: 'change', target: this.table, cell: this }, this);
    }
};

TEIFormatTool.prototype.ev_clickBold = function () {
    if (this.$bold.hasClass('as-checked')) {
        this.$bold.removeClass('as-checked');
        this.focusCell.style.fontWeight = 'normal';
    }
    else {
        this.$bold.addClass('as-checked');
        this.focusCell.style.fontWeight = 'bold';
    }
    this.table.emit('change', { type: 'change', target: this.table, cell: this }, this);

};

TEIFormatTool.prototype.ev_clickItalic = function () {
    if (!this.focusCell) return;
    if (this.$italic.hasClass('as-checked')) {
        this.$italic.removeClass('as-checked');
        this.focusCell.style.fontStyle = 'normal';
    }
    else {
        this.$italic.addClass('as-checked');
        this.focusCell.style.fontStyle = 'italic';
    }
    this.table.emit('change', { type: 'change', target: this.table, cell: this }, this);
};

TEIFormatTool.prototype.ev_fontColorSubmit = function () {
    if (!this.focusCell) return;
    var prevColor = this.focusCell.style.color;
    var newColor = this.$fontColor.value;
    if (prevColor !== newColor) {
        this.focusCell.style.color = newColor;
        this.table.emit('change', { type: 'change', target: this.table, cell: this }, this);
    }
};

TEIFormatTool.prototype.ev_clickAlign = function (newValue, event) {
    if (!this.focusCell) return;
    var prevValue = this.focusCell.style.textAlign;
    if (prevValue !== newValue) {
        this.$alignBtns[prevValue].removeClass('as-checked');
        this.$alignBtns[newValue].addClass('as-checked');
        this.focusCell.style.textAlign = newValue;
        console.log('change')
        this.table.emit('change', { type: 'change', target: this.table, cell: this }, this);
    }
};


TEIFormatTool.prototype.ev_clickInsert = function (at, event) {
    if (!this.focusCell) return;
    var idx = this.table.cells.indexOf(this.focusCell);
    var bfIdx = at === 'left' ? idx : idx + 1;
    var newCell = new TEICell(this.table, { value: '' });
    if (bfIdx >= this.table.cells.length) {
        this.table.$row.addChild(newCell.td);
        this.table.cells.push(newCell);
    }
    else {
        this.table.$row.addChildBefore(newCell.td, this.table.cells[bfIdx].td);
        this.table.cells.splice(bfIdx, 0, newCell);

    }

    this.table.emit('change', { type: 'change', target: this.table, cell: this }, this);

};


TEIFormatTool.prototype.ev_keydown = function (event) {
    var key = keyboardEventToKeyBindingIdent(event);
    switch (key) {
        case 'ctrl-b':
            this.ev_clickBold(event);
            event.preventDefault();
            break;
        case 'ctrl-i':
            this.ev_clickItalic();
            event.preventDefault();
            break;
        case 'ctrl-l':
            this.ev_clickAlign('left', event);
            event.preventDefault();
            break;
        case 'ctrl-e':
            this.ev_clickAlign('center', event);
            event.preventDefault();
            break;
        case 'ctrl-r':
            this.ev_clickAlign('right', event);
            event.preventDefault();
            break;

    }
};
import ACore, { _, $, $$ } from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import PreInput from "./PreInput";
import '../css/tableoftextinput.css';
import FontColorButton from "./colorpicker/FontColorButton";
import Attributes from "absol/src/AppPattern/Attributes";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { getTextNodeBounds, isNaturalNumber, isRealNumber } from "./utils";
import Color from "absol/src/Color/Color";
import { InsertColLeftIcon, InsertColRightIcon } from "./Icons";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import Snackbar from "./Snackbar";
import { getTextNodeBound } from "absol/src/HTML5/Dom";
import { getTextNodesIn } from "absol/src/HTML5/Text";
import OOP from "absol/src/HTML5/OOP";
import { copyJSVariable } from "absol/src/JSMaker/generator";


/**
 * @typedef TEIDataRow
 * @property {TEIDataCell[]} cells
 */

/**
 * @typedef TEIData
 * @property {TEIDataRow[]} rows
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
     * @type {TEITable}
     */
    this.teiTable = new TEITable(this);
    /**
     * @name data
     * @type {TEICell[]}
     */

    OOP.drillProperty(this, this.teiTable, ['minCol', 'maxCol', 'data', 'excelRichTextRows']);
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
        class: 'as-table-of-text-input-wrapper',
        child: [
            {
                class: 'as-table-of-text-input-content-ctn',
                child: {
                    tag: 'table',
                    extendEvent: ['change'],
                    class: 'as-table-of-text-input',
                    child: [
                        {
                            tag: 'tbody',
                            child: []
                        }
                    ]
                }
            }

        ]
    });
};


export default TableOfTextInput;

ACore.install(TableOfTextInput);


/**
 *
 * @param {TableOfTextInput} wrapper
 * @constructor
 */
function TEITable(wrapper) {
    this._minCol = 3;
    this._maxCol = 3;
    this._minRow = 1;
    this._maxRow = 9;
    this.wrapper = wrapper;
    this.elt = $('table', wrapper);
    this.$body = $('tbody', this.elt);

    /**
     *
     * @type {TEIRow[]}
     */
    this.rows = [];
    this.formatTool = new TEIFormatTool(this);
}

TEITable.prototype.defaultData = {
    rows: [
        {
            cells: [
                { value: '' },
                { value: '' },
                { value: '' }
            ]
        }
    ]
}


TEITable.prototype.notifyChange = function (data) {
    this.elt.emit('change', Object.assign({ type: 'change', target: this }, data), this.elt);
};

TEITable.prototype.calcCellPos = function () {
    var n = this.rows[0].cells.reduce((ac, cell) => ac + cell.colspan, 0);
    var m = this.rows.length;
    var heights = Array(n).fill(0);
    var row, i, j, k;
    var cell, colspan, rowspan, colIdx;
    for (i = 0; i < m; ++i) {
        row = this.rows[i];
        colIdx = 0;
        for (j = 0; j < row.cells.length; ++j) {
            cell = row.cells[j];
            while (heights[colIdx] > i) colIdx++;
            colspan = cell.colspan;
            rowspan = cell.rowspan;
            cell.td.attr('data-col-idx', colIdx);
            for (k = 0; k < colspan; ++k) {
                heights[colIdx] = i + rowspan;
            }
        }
    }

};

Object.defineProperties(TEITable.prototype, {
    minCol: {
        /**
         * @this TableOfTextInput
         * @param value
         */
        set: function (value) {
            if (!isNaturalNumber(value)) value = 1;
            value = Math.max(1, Math.floor(value));
            this._minCol = value;
        },
        get: function () {
            return this._minCol;
        }
    },
    maxCol: {
        /**
         * @this TableOfTextInput
         * @param value
         */
        set: function (value) {
            if (!isNaturalNumber(value)) value = 20;
            value = Math.min(20, Math.max(1, Math.floor(value)));
            this._maxCol = value;
        },
        get: function () {
            return Math.max(this._minCol, this._maxCol);
        }
    },
    minRow: {
        /**
         * @this TableOfTextInput
         * @param value
         */
        set: function (value) {
            if (!isNaturalNumber(value)) value = 1;
            value = Math.max(1, Math.floor(value));
            this._minRow = value;
        },
        get: function () {
            return this._minRow;
        }
    },
    maxRow: {
        /**
         * @this TableOfTextInput
         * @param value
         */
        set: function (value) {
            if (!isNaturalNumber(value)) value = 20;
            value = Math.min(20, Math.max(1, Math.floor(value)));
            this._maxRow = value;
        },
        get: function () {
            return Math.max(this._minRow, this._maxRow);
        }
    },
    data: {
        set: function (value) {
            if (typeof value === "string") {
                value = {
                    rows: [
                        { cells: [{ value: value }] }
                    ]
                };
            }
            value = copyJSVariable(value || this.defaultData);

            if (!(value.rows instanceof Array)) value.rows = copyJSVariable(this.defaultData.rows);
            value.rows.forEach(row => {
                if (!(row.cells instanceof Array)) {
                    row.cells = []
                }
                if (row.cells.length === 0) {
                    row.cells.push({ value: '' });
                }
            });

            this.rows.forEach(row => row.tr.remove());
            this.rows = value.rows.map(rowData => new TEIRow(this, rowData));
            this.$body.addChild(this.rows.map(row => row.tr));
            this.calcCellPos();
        },
        get: function () {
            return {
                rows: this.rows.map(row => row.data)
            }
        }
    },
    excelRichTextRows: {
        get: function () {
            var cBound = this.elt.getBoundingClientRect();
            var placeHolderElt;
            var renderSpace;
            if (!cBound.width || !cBound.height) {
                if (this.parentElement) {
                    placeHolderElt = _({
                        style: {
                            display: 'none'
                        }
                    });
                    this.selfReplace(placeHolderElt);
                }
                renderSpace = _({
                    style: {
                        position: 'fixed',
                        zIndex: -1000,
                        visibility: 'hidden',
                        opacity: 0
                    }
                }).addTo(document.body);
            }

            var textNodes = getTextNodesIn(this.elt).filter(t => !!t.data);
            var lineHeight = 25.662879943847656;
            cBound = this.elt.getBoundingClientRect();
            var y0 = cBound.top + 4 + 3.2348480224609375;
            var textInfos = textNodes.reduce((ac, txt) => {
                var cell = cellOf(txt);
                var style = cell.style.export();
                var bounds = getTextNodeBounds(txt);

                bounds.forEach(bound => {
                    var excelData = {
                        text: bound.text.replace(/\n+$/, ''),
                    };
                    if (excelData.text.trim().length === 0) return;

                    excelData.font = { 'name': 'Calibri' };
                    if (style.color) {
                        excelData.font.color = { argb: 'ff' + Color.parse(style.color).toString('hex6').substring(1).toLowerCase() };
                    }
                    if (style.fontWeight === 'bold') {
                        excelData.font.bold = true;
                    }
                    if (style.fontStyle === 'italic') {
                        excelData.font.italic = true;
                    }

                    if (style.fontSize) {
                        excelData.font.size = style.fontSize;
                    }


                    ac.push({
                        rowIdx: Math.round((bound.rect.y - y0) / lineHeight),
                        bound: bound.rect,
                        text: excelData.text,
                        excelData: excelData
                    });

                });
                return ac;
            }, []);

            textInfos.sort((a, b) => {
                if (a.rowIdx === b.rowIdx) {
                    return a.bound.x - b.bound.x;
                }
                else {
                    return a.bound.y - b.bound.y;
                }
            });


            var richTextRows = textInfos.reduce((ac, cr, i) => {
                var rowIdx = cr.rowIdx;
                while (ac.richTextRows.length <= rowIdx) {
                    ac.x = ac.x0;
                    ac.richTextRows.push([]);
                }

                var marginTextL = Math.floor((cr.bound.x - ac.x) / 3.314239501953125);
                if (marginTextL > 0) {
                    ac.richTextRows[ac.richTextRows.length - 1].push({
                        text: ' '.repeat(marginTextL),
                        font: { 'name': 'Calibri' }
                    });
                }

                ac.richTextRows[ac.richTextRows.length - 1].push(cr.excelData);
                ac.x = cr.bound.x + cr.bound.width;
                ac.y = cr.bound.y;

                return ac;
            }, {
                richTextRows: [],

                x: cBound.left + 5,
                x0: cBound.left + 5,


            }).richTextRows;

            if (placeHolderElt) {
                placeHolderElt.selfReplace(this);
            }
            if (renderSpace) renderSpace.remove();
            return richTextRows;
        }
    }
});


/**
 *
 * @param {TEITable} table
 * @param  data
 * @constructor
 */
function TEIRow(table, data) {
    data = data || {};
    if (!(data.cells instanceof Array)) data.cells = [];
    this.table = table;
    this.tr = _('tr');
    /**
     *
     * @type {TEICell[]}
     */
    this.cells = [];
    this.data = data;
}

Object.defineProperty(TEIRow.prototype, 'data', {
    set: function (data) {
        this.cells = data.cells.map(cellData => new TEICell(this, cellData));
        this.tr.clearChild().addChild(this.cells.map(cell => cell.td));
    },
    get: function () {
        return {
            cells: this.cells.map(cell => cell.data)
        }
    }
});


var cellOf = node => {
    while (node) {
        if (node.teiCell) return node.teiCell;
        node = node.parentElement;
    }
    return null;
}

/**
 *
 * @param {TEIRow} row
 * @param {TEIDataCell} data
 * @constructor
 */
function TEICell(row, data) {
    this.row = row;
    this.table = row.table;
    this.td = _({
        tag: 'td',
        class: 'as-table-of-text-input-cell',
        on: {
            click: (event) => {
                if (event.target === this.td) this.focus();
            },
        },
        child: {
            tag: PreInput,
            attr: {
                spellcheck: 'false'
            },
            props: {
                teiCell: this
            },
            on: {
                focus: () => {
                    this.table.formatTool.onFocus(this);
                },
                blur: () => {
                    this.table.formatTool.onBlur(this);
                },
                change: (event) => {
                    if (event.originalEvent)
                        this.table.elt.emit('change', {
                            type: 'change',
                            target: this.table,
                            cell: this
                        }, this.table.elt);
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

TEICell.prototype.focus = function () {
    this.$input.focus();
    var textNode = getTextNodesIn(this.$input).pop();
    if (!textNode) return;
    var range = document.createRange();
    range.setStart(textNode, textNode.data.length);
    range.setEnd(textNode, textNode.data.length);
    var sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

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
            if (!isRealNumber(value)) value = 11;
            value = Math.abs(value);
            value = value || 11;
            this.td.addStyle('font-size', value + 'pt');
            return value;
        },
        get: function (ref) {
            var value = ref.get();
            return value || 11;
        },
        export: function (ref) {
            var value = ref.get();
            if (value === 11) value = undefined;
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


Object.defineProperties(TEICell.prototype, {
    colspan: {
        set: function (value) {

        },
        get: function () {
            var value = this.td.attr('colspan') || '1';
            value = parseInt(value);
            if (isNaturalNumber(value)) return value;
            return 1;
        }
    },
    rowspan: {
        set: function (value) {

        },
        get: function () {
            var value = this.td.attr('rowspan') || '1';
            value = parseInt(value);
            if (isNaturalNumber(value)) return value;
            return 1;
        }
    },
    colpos: {
        get: function () {

        }
    },
    rowpos: {
        get: function () {

        }
    }
});

function TEIFormatTool(table) {
    Object.keys(TEIFormatTool.prototype).filter(k => k.startsWith('ev_')).forEach(k => this[k] = this[k].bind(this));
    this.table = table;
    this.table.elt.on('keydown', this.ev_keydown)
    this.$tool = _({
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
                class: ['as-transparent-button', 'as-table-of-text-input-tool-command'],
                child: 'span.mdi.mdi-table-column-plus-before',
                attr: { 'data-command': 'left' }
            },
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-table-of-text-input-tool-command'],
                child: 'span.mdi.mdi-table-column-plus-after',
                attr: { 'data-command': 'right' }
            },
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-table-of-text-input-tool-command'],
                child: 'span.mdi.mdi-table-row-plus-before',
                attr: { 'data-command': 'above' }
            },
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-table-of-text-input-tool-command'],
                child: 'span.mdi.mdi-table-row-plus-after',
                attr: { 'data-command': 'bellow' }
            },
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-table-of-text-input-tool-command', 'as-variant-danger'],
                attr: { 'data-command': 'removeCol' },
                child: {
                    tag: 'span',
                    class: ['mdi', 'mdi-table-column-remove'],
                },
            },
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-table-of-text-input-tool-command', 'as-variant-danger'],
                attr: { 'data-command': 'removeRow' },
                child: {
                    tag: 'span',
                    class: ['mdi', 'mdi-table-row-remove'],
                },
            },
        ]
    });
    this.table.wrapper.addChildBefore(this.$tool, this.table.wrapper.firstChild);

    this.$fontSize = $('.as-table-of-text-input-tool-font-size', this.$tool).on('change', this.ev_fontSizeChange);
    this.$bold = $('.as-table-of-text-input-tool-bold', this.$tool).on('click', this.ev_clickBold);
    this.$italic = $('.as-table-of-text-input-tool-italic', this.$tool).on('click', this.ev_clickItalic);
    this.$fontColor = $(FontColorButton.tag, this.$tool).on('submit', this.ev_fontColorSubmit);
    this.$alignBtns = $$('.as-table-of-text-input-tool-text-align', this.$tool)
        .reduce((ac, btn) => {
            var value = btn.attr('data-align');
            btn.on('click', ev => {
                this.ev_clickAlign(value, ev);
            });
            ac[value] = btn;
            return ac;
        }, {});
    this.$commandBtns = $$('.as-table-of-text-input-tool-command', this.$tool)
        .reduce((ac, btn) => {
            var value = btn.attr('data-command');
            btn.on('click', ev => {
                this.commands[value].exec.call(this);
                // this.ev_clickInsert(value, ev);
            });
            ac[value] = btn;
            return ac;
        }, {});
    // this.$removeBtn = $('.as-table-of-text-input-tool-remove-col', this.$tool)
    //     .on('click', this.ev_clickRemove);

    this.focusCell = null;
    this.table.elt.on('change', () => this.updateAvailableCommands());
}


TEIFormatTool.prototype.commands = {
    left: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            return this.focusCell.row.cells.length < this.table.maxCol;
        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var idx = this.focusCell.row.cells.indexOf(this.focusCell);
            this.table.rows.forEach(row => {
                var newCell = new TEICell(row, { value: '' });
                row.tr.addChildBefore(newCell.td, row.cells[idx].td);
                row.cells.splice(idx, 0, newCell);

            });
            this.table.elt.emit('change', { type: 'change', target: this.table }, this.table.elt);

        }
    },
    right: {
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var idx = this.focusCell.row.cells.indexOf(this.focusCell);
            this.table.rows.forEach(row => {
                var newCell = new TEICell(row, { value: '' });
                row.tr.addChildAfter(newCell.td, row.cells[idx].td);
                row.cells.splice(idx + 1, 0, newCell);

            });
            this.table.elt.emit('change', { type: 'change', target: this.table }, this.table.elt);
        }
    },
    above: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            return this.table.rows.length < this.table.maxRow;
        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            if (!this.focusCell) return;
            var colN = this.table.rows[0].cells.length;
            var focusRow = this.focusCell.row;
            var idx = this.table.rows.indexOf(focusRow);
            var newRow = new TEIRow(this.table, {
                cells: Array(colN).fill().map(() => ({
                    value: ''
                }))
            });
            this.table.rows.splice(idx, 0, newRow);
            this.table.$body.addChildBefore(newRow.tr, focusRow.tr);
            this.table.notifyChange({ newRow: newRow });
        }
    },
    bellow: {
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            if (!this.focusCell) return;
            var colN = this.table.rows[0].cells.length;
            var focusRow = this.focusCell.row;
            var idx = this.table.rows.indexOf(focusRow);
            var newRow = new TEIRow(this.table, {
                cells: Array(colN).fill().map(() => ({
                    value: ''
                }))
            });
            this.table.rows.splice(idx + 1, 0, newRow);
            this.table.$body.addChildAfter(newRow.tr, focusRow.tr);
            this.table.notifyChange({ newRow: newRow });
        }
    },
    removeCol: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            return this.table.minCol < this.focusCell.row.cells.length;
        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            if (!this.focusCell) return;
            var focusRow = this.focusCell.row;
            var idx = focusRow.cells.indexOf(this.focusCell);
            this.table.rows.forEach(row => {
                var cell = row.cells[idx];
                cell.td.remove();
                row.cells.splice(idx, 1);
            });
            this.table.elt.emit('change', { type: 'change', target: this.table }, this.table.elt);
            var cellNext = focusRow.cells[idx - 1] || focusRow.cells[idx];
            if (cellNext) cellNext.focus();
        }
    },
    removeRow: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            return this.table.minRow < this.table.rows.length;
        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            if (!this.focusCell) return;
            var focusRow = this.focusCell.row;
            var idx = this.table.rows.indexOf(focusRow);
            var colIdx = focusRow.cells.indexOf(this.focusCell);
            focusRow.tr.remove();
            this.table.rows.splice(idx, 1);
            this.table.elt.emit('change', { type: 'change', target: this.table }, this.table.elt);
            var nextRow = this.table.rows[idx] || this.table.rows[idx - 1];
            var nexCell;
            if (nextRow) {
                nexCell = nextRow.cells[colIdx];
                if (nexCell) nexCell.focus();
            }
        }
    }
};

TEIFormatTool.prototype.commands.right.available = TEIFormatTool.prototype.commands.left.available;
TEIFormatTool.prototype.commands.bellow.available = TEIFormatTool.prototype.commands.above.available;

TEIFormatTool.prototype.onFocus = function (cell) {
    if (this.focusCell !== cell && this.focusCell) {
        this.focusCell.td.removeClass('as-focus');
    }

    if (!this.focusCell) {
        setTimeout(() => {
            document.addEventListener('click', this.ev_clickOut);
        }, 30);
    }


    this.focusCell = cell;
    this.focusCell.td.addClass('as-focus');

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
    this.updateAvailableCommands();

};

TEIFormatTool.prototype.updateAvailableCommands = function () {
    Object.keys(this.$commandBtns).forEach(key => {
        var available = this.focusCell && this.commands[key].available.call(this);
        this.$commandBtns[key].disabled = !available;
    });
};


TEIFormatTool.prototype.onBlur = function (cell) {

};


TEIFormatTool.prototype.ev_clickOut = function (event) {
    if (hitElement(this.table.wrapper, event)) return;
    if (this.focusCell) {
        this.focusCell.td.removeClass('as-focus');
        this.focusCell = null;
    }
    document.removeEventListener('click', this.ev_clickOut);
};

TEIFormatTool.prototype.ev_fontSizeChange = function () {
    if (!this.focusCell) return;
    var prevValue = this.focusCell.style.fontSize;
    var newValue = this.$fontSize.value;
    if (newValue !== prevValue) {
        this.focusCell.style.fontSize = newValue;
        this.table.elt.emit('change', { type: 'change', target: this.table, cell: this }, this);
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
    this.table.elt.emit('change', { type: 'change', target: this.table, cell: this }, this);

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
    this.table.elt.emit('change', { type: 'change', target: this.table, cell: this }, this);
};

TEIFormatTool.prototype.ev_fontColorSubmit = function () {
    if (!this.focusCell) return;
    var prevColor = this.focusCell.style.color;
    var newColor = this.$fontColor.value;
    if (prevColor !== newColor) {
        this.focusCell.style.color = newColor;
        this.table.elt.emit('change', { type: 'change', target: this.table, cell: this }, this);
    }
};

TEIFormatTool.prototype.ev_clickAlign = function (newValue, event) {
    if (!this.focusCell) return;
    var prevValue = this.focusCell.style.textAlign;
    if (prevValue !== newValue) {
        this.$alignBtns[prevValue].removeClass('as-checked');
        this.$alignBtns[newValue].addClass('as-checked');
        this.focusCell.style.textAlign = newValue;
        this.table.elt.emit('change', { type: 'change', target: this.table, cell: this }, this);
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

    this.table.elt.emit('change', { type: 'change', target: this.table, cell: this }, this);

};


TEIFormatTool.prototype.ev_clickRemove = function () {
    if (!this.focusCell) return;
    this.focusCell.remove();
    this.table.elt.emit('change', { type: 'change', target: this.table, cell: this.focusCell }, this.table);
    this.focusCell = null;
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
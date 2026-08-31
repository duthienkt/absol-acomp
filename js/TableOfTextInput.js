import ACore, { _, $, $$ } from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import PreInput from "./PreInput";
import '../css/tableoftextinput.css';
import FontColorButton from "./colorpicker/FontColorButton";
import Attributes from "absol/src/AppPattern/Attributes";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { findMaxZIndex, getTextNodeBounds, isNaturalNumber, isRealNumber } from "./utils";
import Color from "absol/src/Color/Color";
import { InsertColLeftIcon, InsertColRightIcon } from "./Icons";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import { getTextNodeBound } from "absol/src/HTML5/Dom";
import { getTextNodesIn } from "absol/src/HTML5/Text";
import OOP, { quickAssign } from "absol/src/HTML5/OOP";
import { copyJSVariable } from "absol/src/JSMaker/generator";
import { isNone } from "absol/src/Converter/DataTypes";
import Hanger from "./Hanger";
import Rectangle from "absol/src/Math/Rectangle";
import Vec2 from "absol/src/Math/Vec2";


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
    this.teiTable.elt.on('change', event => {
        this.emit('change', event, this);//throw event out
    });
    this.focusCtrl = new TEIFocusController(this);
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
        extendEvent: 'change',
        class: 'as-table-of-text-input-wrapper',
        attr: {
            tabindex: 1
        },
        child: [
            {
                class: 'as-table-of-text-input-content-ctn',
                child: {
                    tag: 'table',
                    extendEvent: ['change'],
                    class: 'as-table-of-text-input',
                    child: [
                        {
                            tag: 'thead',
                            child: [{
                                tag: 'tr', child: {
                                    tag: 'th',
                                    child: { text: '◢' }
                                }
                            }]
                        },
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


TableOfTextInput.prototype.exportExcelData = function () {
    return this.teiTable.exportExcelData(...arguments);
}

export default TableOfTextInput;

ACore.install(TableOfTextInput);


function TEIFocusController(elt) {
    this.elt = elt;
    this.ev_clickOut = this.ev_clickOut.bind(this);
    this.ev_click = this.ev_click.bind(this);
    this.to = -1;
    this.elt.on('click', this.ev_click);
}

TEIFocusController.prototype.notifyFocus = function () {
    if (this.elt.hasClass('as-focus')) return;
    this.elt.addClass('as-focus');
    clearTimeout(this.to);
    this.to = setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut);
    });
};

TEIFocusController.prototype.notifyBlur = function () {
    if (!this.elt.hasClass('as-focus')) return;
    this.elt.removeClass('as-focus');
    clearTimeout(this.to);
    document.removeEventListener('click', this.ev_clickOut);
};


TEIFocusController.prototype.ev_clickOut = function (event) {
    if (!hitElement(this.elt, event)) {
        this.notifyBlur();
    }
};

TEIFocusController.prototype.ev_click = function () {
    this.notifyFocus();
};


/**
 *
 * @param {TableOfTextInput} wrapper
 * @constructor
 */
function TEITable(wrapper) {
    this._minCol = 3;
    this._maxCol = 30;
    this._minRow = 1;
    this._maxRow = 90;
    this.wrapper = wrapper;
    this.elt = $('table', wrapper);
    this.$body = $('tbody', this.elt);
    this.$headerRow = $('thead > tr', this.elt);

    this.headRow = new TEIHeadRow(this);
    /**
     *
     * @type {TEIRow[]}
     */
    this.rows = [];
    this.formatTool = new TEIFormatTool(this);
    this.selectTool = new TEISelectTool(this);
    this.data = this.defaultData;
    this.formatTool.updateCommands();
}

TEITable.prototype.defaultData = {
    rows: [
        {
            cells: [
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' }
            ]
        },
        {
            cells: [
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' }
            ]
        },
        {
            cells: [
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' },
                { value: '' }
            ]
        }
    ]
};


TEITable.prototype.notifyChange = function (data) {
    this.elt.emit('change', Object.assign({ type: 'change', target: this }, data), this.elt);
};

TEITable.prototype.updateRowIndices = function () {
    this.rows.forEach((row, i) => {
        row.idx = i;
        row.tr.attr('data-row-idx', row.idx + 1);
    });
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
            cell.td.attr('data-info', `r=${i + 1},c=${colIdx + 1}`);
            for (k = 0; k < colspan; ++k) {
                heights[colIdx +k] = i + rowspan;
            }
            colIdx += colspan;
        }
    }
};

TEITable.prototype.getCells = function () {
    return this.rows.reduce((ac, row) => {
        return ac.concat(row.cells);
    }, []);
};

/**
 *
 * @param {AElement|Node|HTMLElement} nd
 */
TEITable.prototype.cellOfElt = function (nd) {
    while (nd && nd !== this.$body) {
        if (nd['teiCell']) return nd['teiCell'];
        nd = nd.parentElement;
    }
    return null;
};


export function teiDataToExcelData(data, rowOffset, colOffset) {
    if (!isNaturalNumber(rowOffset)) rowOffset = 0;
    if (!isNaturalNumber(colOffset)) colOffset = 0;
    var xlCells = [];
    var xlCell;
    var row, i, j,k, cell, style;
    var richTextItem;
    var colspan, rowspan, colIdx, xlColIndex;
    var heights = Array(16000).fill(0);
    for (i = 0; i < data.rows.length; ++i) {
        row = data.rows[i];
        colIdx = 0;
        for (j = 0; j < row.cells.length; ++j) {
            cell = row.cells[j];
            colspan = cell.colspan || 1;
            rowspan = cell.rowspan;
            while (heights[colIdx] > i) colIdx++;
            xlColIndex = colIdx;
            for (k = 0; k < colspan; ++k) {
                heights[colIdx] = i + rowspan;
            }
            colIdx += colspan;


            if (isNone(cell.value)) continue;
            if (!(cell.value + '').trim()) continue;
            style = cell.style || {};
            richTextItem = {
                text: cell.value + '',
                ignoreWidth: true,
                font: {
                    name: 'Calibri'
                }
            };

            if (style.color) {
                richTextItem.font.color = {
                    argb: 'ff' + Color.parse(style.color).toString('hex6').substring(1).toLowerCase()
                };
            }

            if (style.fontWeight === 'bold') {
                richTextItem.font.bold = true;
            }

            if (style.fontStyle === 'italic') {
                richTextItem.font.italic = true;
            }

            if (style.fontSize) {
                richTextItem.font.size = style.fontSize;
            }
            xlCell = {
                row: i + rowOffset,//excel_module use index from 0, not 1
                col: xlColIndex + colOffset,
                value: {
                    richText: [richTextItem]
                }
            };
            if (cell.rowspan > 1) xlCell.rowSpan = cell.rowspan;
            if (cell.colspan > 1) xlCell.colSpan = cell.colspan;

            if (style.textAlign && style.textAlign !== 'left') {
                xlCell.horizontal = style.textAlign;
            }


            xlCells.push(xlCell);
        }
    }
    var rowCount = data.rows.length;
    var colCount = 0;
    if (data.rows.length > 0) {
        colCount = data.rows[0].cells.length;
    }
    return {
        startRowIdx: rowOffset,
        startColIdx: colOffset,
        endRowIdx: rowOffset + rowCount,
        endColIdx: colOffset + colCount,
        rowCount: rowCount,
        colCount: colCount,
        cells: xlCells
    };
}

TEITable.prototype.exportExcelData = function (rowOffset, colOffset) {
    return teiDataToExcelData(this.data, rowOffset, colOffset);
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
            value = Math.min(16000, Math.max(1, Math.floor(value)));
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
            if (value.rows.length === 0) {
                value.rows.push({
                    cells: [{ value: '' }]
                });
            }
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
            this.updateRowIndices();
            this.$body.addChild(this.rows.map(row => row.tr));
            this.calcCellPos();
            this.headRow.update();
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
                if (this.wrapper.parentElement) {
                    placeHolderElt = _({
                        style: {
                            display: 'none'
                        }
                    });
                    this.wrapper.selfReplace(placeHolderElt);
                }
                renderSpace = _({
                    style: {
                        position: 'fixed',
                        zIndex: -1000,
                        visibility: 'hidden',
                        opacity: 0,
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                    },
                    child: this.wrapper
                }).addTo(document.body);
            }

            var textNodes = getTextNodesIn(this.$body).filter(t => !!t.data);
            var lineHeight = 25.662879943847656;
            cBound = this.$body.getBoundingClientRect();
            var y0 = cBound.top + 4 + 3.2348480224609375;
            var textInfos = textNodes.reduce((ac, txt) => {
                var cell = cellOf(txt);
                var style = cell.style.export();
                var bounds = getTextNodeBounds(txt);

                bounds.forEach(bound => {
                    var excelData = {
                        text: bound.text.replace(/\n+$/, ''),
                        ignoreWidth: true
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
                        font: { 'name': 'Calibri' },
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
                placeHolderElt.selfReplace(this.wrapper);
            }
            if (renderSpace) renderSpace.remove();
            return richTextRows;
        }
    }
});


/**
 *
 * @param {TEITable} table
 * @constructor
 */
function TEIHeadRow(table) {
    this.table = table;
    this.$tr = $('thead tr', this.table.wrapper);
}

TEIHeadRow.prototype.update = function () {
    var rowLength = 0;
    for (var i = 0; i < this.table.rows.length; i++) {
        rowLength = Math.max(rowLength, this.table.rows[i].length);
    }

    var cellElt;
    while (this.$tr.childNodes.length < rowLength + 1) {
        cellElt = _({
            tag: 'th',
            child: {
                text: this.numberToExcelColumn(this.$tr.childNodes.length - 1)
            }
        });
        this.$tr.addChild(cellElt);
    }

    while (this.$tr.childNodes.length > rowLength + 1) {
        this.$tr.lastChild.remove();
    }

};


TEIHeadRow.prototype.numberToExcelColumn = function (index) {
    var label = '';
    index = Number(index);
    while (index >= 0) {
        label = String.fromCharCode(index % 26 + 65) + label;
        index = Math.floor(index / 26) - 1;
    }
    return label;
};

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
    this.$indexCell = _({
        tag: 'td',
        class: 'as-tei-idx-cell',
        attr: {
            'data-idx': 0
        }
    }).addTo(this.tr);
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
        while (this.tr.lastChild !== this.$indexCell && this.tr.lastChild) {
            this.tr.lastChild.remove();
        }
        this.tr.addChild(this.cells.map(cell => cell.td));
    },
    get: function () {
        return {
            cells: this.cells.map(cell => cell.data)
        }
    }
});

Object.defineProperty(TEIRow.prototype, 'length', {
    get: function () {
        var s = 0;
        for (var i = 0; i < this.cells.length; ++i) {
            s += this.cells[i].colspan;
        }
        return s;
    }
});

Object.defineProperty(TEIRow.prototype, 'idx', {
    get: function () {
        return parseInt(this.$indexCell.attr('data-idx')) - 1;
    },
    set: function (idx) {
        this.$indexCell.attr('data-idx', idx + 1);
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
        props: {
            teiCell: this
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
                    this.table.selectTool.onInputFocus(this);
                },
                blur: () => {
                    this.table.selectTool.onInputFocus(this);
                },
                change: (event) => {
                    if (event.originalEvent) {
                        this.table.elt.emit('change', {
                            type: 'change',
                            target: this.table,
                            cell: this
                        }, this.table.elt);
                    }
                }
            }
        }
    });
    this.$input = $('preinput', this.td);
    this.style = new Attributes(this);
    this.data = data;
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
    var idx = this.row.cells.indexOf(this);
    if (idx >= 0) this.row.cells.splice(idx, 1);
};

TEICell.prototype.resetStyle = function () {
    Object.keys(this.styleHandlers).forEach(key => {
        this.style[key] = undefined;
    });
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
    set: function (data) {
        data = data || {};
        if (typeof data === "string") data = { value: data };
        if (typeof data.value === "string") {
            this.$input.value = data.value;
        }
        else {
            this.$input.value = "";
        }
        this.colspan = data.colspan || 1;
        this.rowspan = data.rowspan || 1;
        var defaultStyle = Object.keys(this.styleHandlers).reduce((ac, key)=>{
            ac[key] = undefined;
            return ac;
        },{});
        quickAssign(defaultStyle, data.style ||{});
        quickAssign(this.style, defaultStyle);
    },
    get: function () {
        var res = {};
        res.value = this.$input.value;
        res.style = this.style.export();
        if (this.colspan > 1) res.colspan = this.colspan;
        if (this.rowspan > 1) res.rowspan = this.rowspan;

        Object.keys(res.style).forEach(key => {
            if (res.style[key] === undefined) delete res.style[key];
        });
        return res;
    }
});


Object.defineProperties(TEICell.prototype, {
    colspan: {
        set: function (value) {
            var v = parseInt(value);
            if (!isNaturalNumber(v)) v = 1;
            v = Math.max(1, v);
            this.td.attr('colspan', v);
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
            var v = parseInt(value);
            if (!isNaturalNumber(v)) v = 1;
            this.td.attr('rowspan', v);
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
            var t = this.td.attr('data-col-idx') || '0';
            t = parseInt(t);
            if (isNaturalNumber(t)) return t;
            return 0;
        }
    },
    rowpos: {
        get: function () {
            var parent = this.row;
            if (!parent) return 0;
            return parent.idx;
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
            {
                tag: 'button',
                class: ['as-transparent-button', 'as-table-of-text-input-tool-command', 'as-table-of-text-input-tool-merge-cells'],
                attr: { 'data-command': 'mergeCells' },
                child: {
                    tag: 'span',
                    class: ['mdi', 'mdi-table-merge-cells'],
                }
            }
        ]
    });
    this.table.wrapper.addChildBefore(this.$tool, this.table.wrapper.firstChild);

    this.$fontSize = $('.as-table-of-text-input-tool-font-size', this.$tool).on('change', this.ev_fontSizeChange);
    this.$bold = $('.as-table-of-text-input-tool-bold', this.$tool).on('click', this.ev_clickBold);
    this.$italic = $('.as-table-of-text-input-tool-italic', this.$tool).on('click', this.ev_clickItalic);
    this.$fontColor = $(FontColorButton.tag, this.$tool).on('submit', this.ev_fontColorSubmit);
    this.$mergeCells = $('.as-table-of-text-input-tool-merge-cells', this.$tool).on('click', this.ev_clickMergeCells);
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


    this.table.elt.on('change', event => {
        this.updateAvailableCommands();
    });
}


TEIFormatTool.prototype.commands = {
    left: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            if (this.selectedCells.length <1) return false;
            return this.focusCell.row.length < this.table.maxCol;
        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return;
            var colpos = selectedCells.reduce((ac, cell) => Math.min(ac, cell.colpos), 1e9);
            this.addColumnAt(colpos);
            if (this.focusCell) {
                this.table.selectTool.selectCell(this.focusCell);
            }
            this.table.notifyChange({});
        }
    },
    right: {
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return;
            var colpos = selectedCells.reduce((ac, cell) => Math.max(ac, cell.colpos + cell.colspan), -1e9);
            this.addColumnAt(colpos);
            if (this.focusCell) {
                this.table.selectTool.selectCell(this.focusCell);
            }
            this.table.notifyChange({});
        }
    },
    above: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return false;
            return this.table.rows.length < this.table.maxRow;
        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return;
            var rowPos = selectedCells.reduce((ac, cell) => Math.min(ac, cell.rowpos), 1e9);
            this.addRowAt(rowPos);
            if (this.focusCell) {
                this.table.selectTool.selectCell(this.focusCell);
            }
            this.table.notifyChange({});
        }

    },
    bellow: {
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return;
            var rowPos = selectedCells.reduce((ac, cell) => Math.max(ac, cell.rowpos + cell.rowspan), -1e9);
            this.addRowAt(rowPos);
            if (this.focusCell) {
                this.table.selectTool.selectCell(this.focusCell);
            }
            this.table.notifyChange({});
        }
    },
    removeCol: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return false;
            var colpos = selectedCells.reduce((ac, cell) => Math.min(ac, cell.colpos), 1e9);
            var colspan = selectedCells.reduce((ac, cell) => Math.max(ac, cell.colpos + cell.colspan), -1e9) - colpos;
            return this.table.minCol <= selectedCells[0].row.length - colspan;
        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return false;
            var colpos = selectedCells.reduce((ac, cell) => Math.min(ac, cell.colpos), 1e9);
            var colspan = selectedCells.reduce((ac, cell) => Math.max(ac, cell.colpos + cell.colspan), -1e9) - colpos;
            if (this.table.minCol > selectedCells[0].row.length - colspan) return;
            for (var k = 0; k < colspan; ++k) {
                this.removeColumnAt(colpos);
            }

            this.table.notifyChange({});
        }
    },
    removeRow: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return false;
            var rowpos = selectedCells.reduce((ac, cell) => Math.min(ac, cell.rowpos), 1e9);
            var rowspan = selectedCells.reduce((ac, cell) => Math.max(ac, cell.rowpos + cell.rowspan), -1e9) - rowpos;
            return this.table.minCol <= selectedCells[0].row.table.rows.length - rowspan;

        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var selectedCells = this.selectedCells;
            if (selectedCells.length < 1) return false;
            var rowpos = selectedCells.reduce((ac, cell) => Math.min(ac, cell.rowpos), 1e9);
            var rowspan = selectedCells.reduce((ac, cell) => Math.max(ac, cell.rowpos + cell.rowspan), -1e9) - rowpos;
            if ( this.table.minCol > selectedCells[0].row.table.rows.length - rowspan) return;
            for (var k = 0; k < rowspan; ++k) {
                this.removeRowAt(rowpos);
            }
            this.table.notifyChange({});
        }
    },
    mergeCells: {
        /**
         * @this TEIFormatTool
         */
        available: function () {
            return this.selectedCells.length > 0;
        },
        /**
         * @this TEIFormatTool
         */
        exec: function () {
            var selectedCells = this.selectedCells;//all cells must be a rect
            if (selectedCells.length === 0) return;
            var merged = selectedCells.some(cell => {
                return cell.rowspan > 1 || cell.colspan > 1;
            });
            if (merged) {
                this.unmergeSelectedCells();
            }
            else {
                this.mergeSelectedCells();
            }
            if (this.focusCell) {
                this.table.selectTool.selectCell(this.focusCell);
            }
            this.table.notifyChange({});
        }
    }
};

TEIFormatTool.prototype.commands.right.available = TEIFormatTool.prototype.commands.left.available;
TEIFormatTool.prototype.commands.bellow.available = TEIFormatTool.prototype.commands.above.available;

TEIFormatTool.prototype.onFocus = function () {
    this.updateCommandArgs();
    this.updateAvailableCommands();

};

TEIFormatTool.prototype.updateCommandArgs = function () {
    var selectedCells = this.selectedCells;
    var focusCell = this.focusCell || selectedCells[0];
    var isBold = focusCell && focusCell.style.fontWeight === 'bold';
    this.$fontSize.value = focusCell ? focusCell.style.fontSize : 11;
    this.$bold.classList.toggle('as-checked', isBold);
    var isItalic = focusCell && focusCell.style.fontStyle === 'italic';
    this.$italic.classList.toggle('as-checked', isItalic);

    this.$fontColor.value = focusCell ? focusCell.style.color : '#000000';
    var textAlign = focusCell ? focusCell.style.textAlign : 'left';
    for (var align in this.$alignBtns) {
        this.$alignBtns[align].classList.toggle('as-checked', align === textAlign);
    }

    var merged = selectedCells.some(cell => {
        return cell.rowspan > 1 || cell.colspan > 1;
    });
    this.$commandBtns['mergeCells'].classList.toggle('as-checked', merged);

};

TEIFormatTool.prototype.updateAvailableCommands = function () {
    Object.keys(this.$commandBtns).forEach(key => {
        var available = this.focusCell && this.commands[key].available.call(this);
        this.$commandBtns[key].disabled = !available;
    });
};

TEIFormatTool.prototype.updateCommands = function () {
    this.updateCommandArgs();
    this.updateAvailableCommands();
}




TEIFormatTool.prototype.mergeSelectedCells = function () {
    var selectedCells = this.selectedCells;
    var minCol = Infinity, maxCol = -Infinity, minRow = Infinity, maxRow = -Infinity;
    var cell;
    var i;
    var dataCell = selectedCells.find(cell =>{
       var text = cell.$input.value.trim();
       return !!text;
    });
    var rootCell = selectedCells[0];
    this.table.selectTool.deselectAll();
    rootCell = rootCell || selectedCells[0];


    for (i = 0; i < selectedCells.length; i++) {
        cell = selectedCells[i];
        minCol = Math.min(minCol, cell.colpos);
        maxCol = Math.max(maxCol, cell.colpos + cell.colspan);
        minRow = Math.min(minRow, cell.rowpos);
        maxRow = Math.max(maxRow, cell.rowpos + cell.rowspan);
        if (cell.colpos === minCol && cell.rowpos === minRow) {
            rootCell = cell;
        }
    }
    rootCell.colspan = maxCol - minCol;
    rootCell.rowspan = maxRow - minRow;
    for (i = 0; i < selectedCells.length; i++) {
        cell = selectedCells[i];
        if (cell !== rootCell) {
            cell.remove();
        }
    }
    if (dataCell !== rootCell) {
        rootCell.$input.value = dataCell.$input.value;
        rootCell.resetStyle();
        quickAssign(rootCell.style, dataCell.style.export());
    }
    this.table.calcCellPos();
    this.table.selectTool.selectCell(rootCell);
};

TEIFormatTool.prototype.unmergeSelectedCells = function () {
    var selectedCells = this.selectedCells;
    var cell;
    for (var i = 0; i < selectedCells.length; i++) {
        cell = selectedCells[i];
        if (cell.colspan > 1 || cell.rowspan > 1) {
            this.unmergeCell(cell);
        }
    }
};

TEIFormatTool.prototype.unmergeCell = function (cell) {
    var colpos = cell.colpos;
    var rowpos = cell.rowpos;
    var colspan = cell.colspan;
    var rowspan = cell.rowspan;
    cell.colspan = 1;
    cell.rowspan = 1;
    var deltaCol = colspan - 1;
    var deltaRow = rowspan - 1;
    var bf, bfIdx;
    var i, j;
    var row;
    var newCell;

    row = cell.row;
    bfIdx = row.cells.indexOf(cell) + 1;
    for (j = 0; j < deltaCol; ++j) {
        newCell = new TEICell(row, { value: '', style: cell.style.export() });
        row.cells.splice(bfIdx, 0, newCell);
        row.tr.addChildAfter(newCell.td, cell.td);
    }


    for (i = 0; i < deltaRow; ++i) {
        row = this.table.rows[rowpos + 1 + i];
        bfIdx = row.cells.length;
        bf = null;
        for (j = 0; j < row.cells.length; ++j) {
            if (row.cells[j].colpos > colpos) {
                bf = row.cells[j];
                bfIdx = j;
                break;
            }
        }
        for (j = 0; j < colspan; ++j) {
            newCell = new TEICell(row, { value: '', style: cell.style.export() });
            row.cells.splice(bfIdx, 0, newCell);
            if (bf) {
                row.tr.addChildBefore(newCell.td, bf.td);
            }
            else {
                row.tr.addChild(newCell.td);
            }
        }
    }


    this.table.calcCellPos();
};

TEIFormatTool.prototype.addColumnAt = function (colpos) {
    this.table.selectTool.deselectAll();
    var i, j, row, cell, newCell;
    for (i = 0; i < this.table.rows.length; ++i) {
        row = this.table.rows[i];
        for (j = 0; j < row.cells.length; ++j) {
            cell = row.cells[j];
            newCell = null;
            if (cell.colpos <= colpos && colpos < cell.colpos + cell.colspan) {
                if (cell.colpos < colpos) {
                    newCell = cell;//added
                    cell.colspan += 1;
                }
                else {
                    newCell = new TEICell(row, { value: '' });
                    row.tr.addChildBefore(newCell.td, cell.td);
                    row.cells.splice(j, 0, newCell);
                }
                break;
            }
        }
        if (!newCell) {//not added, add at the end
            newCell = new TEICell(row, { value: '' });
            row.tr.addChild(newCell.td);
            row.cells.push(newCell);
        }
    }

    this.table.updateRowIndices();
    this.table.calcCellPos();
    this.table.headRow.update();
};

TEIFormatTool.prototype.removeColumnAt = function (colpos) {
    this.table.selectTool.deselectAll();
    var i, j, row, cell;
    var needRemovedCells = [];

    for (i = 0; i < this.table.rows.length; ++i) {
        row = this.table.rows[i];
        for (j = 0; j < row.cells.length; ++j) {
            cell = row.cells[j];
            if (cell.colpos <= colpos && colpos < cell.colpos + cell.colspan) {
                if (cell.colspan > 1) {
                    cell.colspan -= 1;
                }
                else {
                    needRemovedCells.push(cell);
                }
                break;
            }
        }
    }

    needRemovedCells.forEach(cell => cell.remove());

    this.table.updateRowIndices();
    this.table.calcCellPos();
    this.table.headRow.update();
};

TEIFormatTool.prototype.addRowAt = function (rowpos) {
    this.table.selectTool.deselectAll();
    var mergedCells = this.table.getCells().filter(cell => {
        return cell.rowpos < rowpos && cell.rowpos + cell.rowspan > rowpos;
    });
    mergedCells.forEach(cell => {
        cell.rowspan += 1;
    });
    var newRowData = { cells: [] };
    var length = this.table.rows[0] ? this.table.rows[0].length : 0;
    var needAdd;
    for (var j = 0; j < length; j++) {
        needAdd = !mergedCells.some(cell => {
            return cell.colpos <= j && j < cell.colpos + cell.colspan;
        });
        if (needAdd) {
            newRowData.cells.push({ value: '' });
        }
    }
    var newRow = new TEIRow(this.table, newRowData);

    this.table.$body.addChildBefore(newRow.tr, this.table.rows[rowpos] ? this.table.rows[rowpos].tr : null);
    this.table.rows.splice(rowpos, 0, newRow);

    this.table.updateRowIndices();
    this.table.calcCellPos();
    this.table.headRow.update();
};

TEIFormatTool.prototype.removeRowAt = function (rowpos) {
    this.table.selectTool.deselectAll();
    var mergedCells = this.table.getCells().filter(cell => {
        return cell.rowpos <= rowpos && cell.rowpos + cell.rowspan > rowpos && cell.rowspan > 1;
    });
    mergedCells.forEach(cell => {
        cell.rowspan -= 1;
    });
    var needPushCells = mergedCells.filter(cell => {
        return cell.rowpos === rowpos;
    });


    this.table.$body.removeChild(this.table.rows[rowpos].tr);
    this.table.rows.splice(rowpos, 1);

    var newRow = this.table.rows[rowpos];
    if (newRow) {
        needPushCells.forEach(cell => {
            var newIdx = newRow.cells.findIndex(c => c.colpos> cell.colpos);
            var bf;
            cell.row = newRow;
            if (newIdx >= 0) {
                bf = newRow.cells[newIdx].td;
                newRow.cells.splice(newIdx, 0, cell);
                newRow.tr.addChildBefore(cell.td, bf);
            }
            else {
                newRow.cells.push(cell);
                newRow.tr.addChild(cell.td);
            }
        });
    }

    this.table.updateRowIndices();
    this.table.calcCellPos();
    this.table.headRow.update();
};



TEIFormatTool.prototype.ev_fontSizeChange = function () {
    var cells = this.selectedCells;
    var changed = false;
    cells.forEach(cell => {
        var prevValue = cell.style.fontSize;
        var newValue = this.$fontSize.value;
        if (newValue !== prevValue) {
            cell.style.fontSize = newValue;
            changed = true;
        }
    });
    if (changed) {
        this.table.elt.emit('change', { type: 'change', target: this.table, cells: cells, cell: cells[0] }, this);
    }
};


TEIFormatTool.prototype.ev_clickBold = function () {
    var isChecked = this.$bold.hasClass('as-checked');
    var value = isChecked ? 'normal' : 'bold';
    var changed = false;
    this.selectedCells.forEach(cell => {
        if (cell.style.fontWeight !== value) {
            changed = true;
            cell.style.fontWeight = value;
        }
    });
    if (!this.focusCell) return;
    this.$bold.classList.toggle('as-checked', !isChecked);
    if (changed)
        this.table.elt.emit('change', { type: 'change', target: this.table, cell: this }, this);
};

TEIFormatTool.prototype.ev_clickItalic = function () {
    if (!this.focusCell) return;
    var isChecked = this.$italic.hasClass('as-checked');
    var cells = this.selectedCells;
    var changed = false;
    cells.forEach(cell => {
        if (cell.style.fontStyle !== (isChecked ? 'normal' : 'italic')) {
            changed = true;
            cell.style.fontStyle = isChecked ? 'normal' : 'italic';
        }
    });
    this.$italic.classList.toggle('as-checked', !isChecked);
    if (changed)
        this.table.elt.emit('change', { type: 'change', target: this.table, cells: cells, cell: cells[0] }, this);
};

TEIFormatTool.prototype.ev_fontColorSubmit = function () {
    var cells = this.selectedCells;
    if (cells.length === 0 && this.focusCell) cells = [this.focusCell];
    if (cells.length === 0) return;
    var newColor = this.$fontColor.value;
    var changed = false;
    cells.forEach(cell => {
        if (cell.style.color !== newColor) {
            changed = true;
            cell.style.color = newColor;
        }
    });
    if (changed) {
        this.table.elt.emit('change', { type: 'change', target: this.table, cells: cells, cell: cells[0] }, this);
    }
};

TEIFormatTool.prototype.ev_clickAlign = function (newValue, event) {
    var cells = this.selectedCells;
    if (cells.length === 0 && this.focusCell) cells = [this.focusCell];
    if (cells.length === 0) return;
    var changed = false;
    cells.forEach(cell => {
        if (cell.style.textAlign !== newValue) {
            changed = true;
            cell.style.textAlign = newValue;
        }
    });
    for (var align in this.$alignBtns) {
        this.$alignBtns[align].classList.toggle('as-checked', align === newValue);
    }
    if (changed) {
        this.table.elt.emit('change', { type: 'change', target: this.table, cells: cells, cell: cells[0] }, this);
    }
};


TEIFormatTool.prototype.ev_keydown = function (event) {
    var key = keyboardEventToKeyBindingIdent(event);
    key = key.replace('meta-', 'ctrl-');//macOS
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


Object.defineProperty(TEIFormatTool.prototype, 'selectedCells', {
    get: function () {
        return this.table.selectTool.selectedCells;
    }
});


Object.defineProperty(TEIFormatTool.prototype, 'focusCell', {
    get: function () {
        return this.table.selectTool.focusCell;
    }
});

/**
 *
 * @param {TEITable} table
 * @constructor
 */
function TEISelectTool(table) {
    this.table = table;
    _({
        tag: Hanger,
        elt: this.table.elt,
        on: {
            draginit: this.ev_dragInit.bind(this),
            dragstart: this.ev_dragStart.bind(this),
            drag: this.ev_drag.bind(this),
            dragend: this.ev_dragEnd.bind(this),
            dragdeinit: this.ev_dragDeInit.bind(this)

        }
    });
    this.ev_clickOut = this.ev_clickOut.bind(this);
    this.$dragBox = null;
    this.startOffsetInTable = new Vec2(0, 0);
    this.selectedCells = [];
}


TEISelectTool.prototype.ev_dragInit = function (event) {
    this.dragStarted = false;
};

TEISelectTool.prototype.ev_dragDeInit = function (event) {
    if (this.dragStarted) return;
    var rect = Rectangle.boundingPoints([event.startingPoint, event.currentPoint]);
    var cells = this.findCellsByRect(rect);
    if (cells.length > 0) {
        this.selectCell(cells[0]);
    }
};


/**
 *
 * @param {Rectangle} rect
 * @returns {{}}
 */
TEISelectTool.prototype.findCellsByRect = function (rect) {
    var cells = this.table.getCells();
    return cells.filter(cell => {
        var cellRect = Rectangle.fromClientRect(cell.td.getBoundingClientRect());
        return rect.isCollapse(cellRect);
    });
};


TEISelectTool.prototype.ev_dragStart = function (event) {
    this.dragStarted = true;
    this.$dragBox = _({
        class: 'as-tei-drag-box',
        style: {
            zIndex: findMaxZIndex(this.table.wrapper) + 1e9,
            top: event.startingPoint.y + 'px',
            left: event.startingPoint.x + 'px',
            width: 0,
            height: 0
        }
    }).addTo(document.body);
    var tableRect = this.table.elt.getBoundingClientRect();
    this.startOffsetInTable = event.startingPoint.sub(new Vec2(tableRect.left, tableRect.top));
};


TEISelectTool.prototype.ev_drag = function (event) {
    var tableRect = this.table.elt.getBoundingClientRect();
    var startingPoint = new Vec2(tableRect.left, tableRect.top).add(this.startOffsetInTable);

    var delta = event.currentPoint.sub(startingPoint);
    this.$dragBox.addStyle({
        width: Math.abs(delta.x) + 'px',
        height: Math.abs(delta.y) + 'px',
        left: (delta.x < 0 ? event.currentPoint.x : startingPoint.x) + 'px',
        top: (delta.y < 0 ? event.currentPoint.y : startingPoint.y) + 'px'
    });

};


TEISelectTool.prototype.ev_dragEnd = function (event) {
    this.$dragBox.remove();
    this.$dragBox = null;
    var tableRect = this.table.elt.getBoundingClientRect();
    var startingPoint = new Vec2(tableRect.left, tableRect.top).add(this.startOffsetInTable);
    var currentPoint = event.currentPoint;

    var rect = Rectangle.boundingPoints([startingPoint, currentPoint]);
    var cells = this.findCellsByRect(rect);

    //*** find focus cell
    var focusCell = cells.find(cell => {
        var rect = Rectangle.fromClientRect(cell.td.getBoundingClientRect());
        return rect.containsPoint(startingPoint);
    });
    focusCell = focusCell || cells[0] || null;
    if (focusCell) {
        setTimeout(() => {
            if (!focusCell.td.contains(document.activeElement)) {
                focusCell.focus();
            }
        }, 10);
    }
    else {
    }
    this.selectExpandFromCells(cells);
};

TEISelectTool.prototype.ev_clickOut = function (event) {
    if (hitElement(this.table.wrapper, event)) return;
    document.removeEventListener('click', this.ev_clickOut);
};


TEISelectTool.prototype.deselectAll = function () {
    this.selectedCells.forEach(cell => {
        cell.td.removeClass('as-selected')
            .removeClass('as-selected-top')
            .removeClass('as-selected-bottom')
            .removeClass('as-selected-left')
            .removeClass('as-selected-right');

    });
    this.selectedCells = [];
};

TEISelectTool.prototype.selectExpandFromCells = function (cells) {
    if (cells.length < 2) {
        if (cells.length === 1) {
            this.selectCell(cells[0]);
        }
        return;
    }
    var rowpos = cells.reduce((ac, cell) => {
        return Math.min(ac, cell.rowpos);
    }, Infinity);
    var colpos = cells.reduce((ac, cell) => {
        return Math.min(ac, cell.colpos);
    }, Infinity);
    var rowposEnd = cells.reduce((ac, cell) => {
        return Math.max(ac, cell.rowpos + cell.rowspan);
    }, -Infinity);
    var colposEnd = cells.reduce((ac, cell) => {
        return Math.max(ac, cell.colpos + cell.colspan);
    }, -Infinity);
    this.selectCellsAt(rowpos, colpos, rowposEnd, colposEnd);
};

TEISelectTool.prototype.selectCellsAt = function (rowpos, colpos, rowposEnd, colposEnd) {
    this.deselectAll();
    var cells = this.table.getCells().filter(cell => {
        return cell.rowpos >= rowpos && cell.colpos >= colpos && cell.rowpos + cell.rowspan <= rowposEnd && cell.colpos + cell.colspan <= colposEnd;
    });
    this.selectedCells = cells;
    cells.forEach(cell => {
        var td = cell.td;
        td.classList.add('as-selected');
        td.classList.toggle('as-selected-top', cell.rowpos === rowpos);
        td.classList.toggle('as-selected-bottom', cell.rowpos + cell.rowspan === rowposEnd);
        td.classList.toggle('as-selected-left', cell.colpos === colpos);
        td.classList.toggle('as-selected-right', cell.colpos + cell.colspan === colposEnd);
    });
    if (this.selectedCells.length > 0 && this.selectedCells.indexOf(this.focusCell) < 0) {
        this.selectedCells[0].focus();
    }
    this.table.formatTool.updateCommands();

};


TEISelectTool.prototype.selectCell = function (cell) {
    this.deselectAll();
    this.selectedCells = [cell];
    cell.td.addClass('as-selected')
        .addClass('as-selected-top')
        .addClass('as-selected-bottom')
        .addClass('as-selected-left')
        .addClass('as-selected-right');
    if (!cell.td.contains(document.activeElement)) {
        cell.focus();
    }
    this.table.formatTool.updateCommands();

};


TEISelectTool.prototype.onInputFocus = function (cell) {
    if (this.focusCell !== cell && this.focusCell) {
        this.focusCell.td.removeClass('as-focus');
    }

    if (!this.focusCell) {
        setTimeout(() => {
            document.addEventListener('click', this.ev_clickOut);
        }, 30);
    }
    if (this.table.wrapper && this.table.wrapper.focusCtrl) {
        this.table.wrapper.focusCtrl.notifyFocus();
    }

    this.focusCell = cell;
    this.focusCell.td.addClass('as-focus');
    this.table.formatTool.onFocus();
    if (this.selectedCells.indexOf(cell) < 0) {
        this.selectCell(cell);
    }
};


TEISelectTool.prototype.onInputBlur = function (cell) {
    console.log('onInputBlur', cell);
};
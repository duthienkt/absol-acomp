import ACore, { _, $, $$ } from "../ACore";
import '../css/compactdatagrid.css';
import OOP, { drillProperty, mixClass } from "absol/src/HTML5/OOP";
import FontColorButton from "./colorpicker/FontColorButton";
import { findMaxZIndex, isNaturalNumber, revokeResource } from "./utils";
import { isDomNode } from "absol/src/HTML5/Dom";
import Vec2 from "absol/src/Math/Vec2";
import Rectangle from "absol/src/Math/Rectangle";
import EventEmitter, { hitElement } from "absol/src/HTML5/EventEmitter";
import Follower from "./Follower";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import table_header_add_txt from '../assets/icon/table_header_add.tpl';
import RibbonButton from "./RibbonButton";
import PreInput from "./PreInput";
import Snackbar from "./Snackbar";


var EV_SELECTED_CELL_CHANGE = 'SELECTED_CELL_CHANGE'.toLowerCase();
var EV_CELL_DATA_CHANGE = 'change';
var EV_UNDO_APPLY = 'EV_UNDO_APPLY'.toLowerCase();

/**
 * loc: [row, col, rowHeight, colHeight]
 * @param {AElement} cell
 * @returns {number[]}
 */
var locOfCell = cell => (cell.getAttribute('data-loc') || 'Nan,NaN').split(',')
    .concat([cell.getAttribute('rowspan') || '1', cell.getAttribute('colspan') || '1'])
    .map(it => parseInt(it, 10));

var locOfCells = cells => {
    return cells.reduce((ac, cell) => {
        var cellLoc = locOfCell(cell);
        if (!ac) return cellLoc;
        return mergeLoc(ac, cellLoc)
    }, null);
}

function mergeLoc(loc1, loc2) {
    var rowLow = Math.min(loc1[0], loc2[0]);
    var colLow = Math.min(loc1[1], loc2[1]);
    var rowHigh = Math.max(loc1[0] + loc1[2] - 1, loc2[0] + loc2[2] - 1);
    var colHigh = Math.max(loc1[1] + loc1[3] - 1, loc2[1] + loc2[3] - 1);
    var res = [rowLow, colLow, rowHigh - rowLow + 1, colHigh - colLow + 1];
    if (arguments[2]) res = mergeLoc(res, arguments[2]);
    return res;
};

var locInLoc = (loc, ctn) => {
    var mlc = mergeLoc(loc, ctn);
    return locEqual(mlc, ctn);
};

var locEqual = (loc1, loc2) => {
    return loc1[0] === loc2[0] && loc1[1] === loc2[1]
        && loc1[2] === loc2[2] && loc1[3] === loc2[3];
}

var locCollapse = (loc1, loc2) => {
    if (loc1[0] + loc1[2] <= loc2[0]) return false;
    if (loc2[0] + loc2[2] <= loc1[0]) return false;

    if (loc1[1] + loc1[3] <= loc2[1]) return false;
    if (loc2[1] + loc2[3] <= loc1[1]) return false;
    return true;
};
var varNameOf = o => {
    var res;
    if (!o) res = undefined;
    else if (typeof o === "string") res = o;
    else if (o.attr) res = o.attr('data-name');
    else if (typeof o.name === "string") res = o.name;
    return res || undefined;
};

var varTitleOf = o => {
    var res = undefined;
    if (!o) res = undefined;
    else if (o.attr) {
        res = o.attr('data-title');
        if (typeof res !== "string") res = undefined;
    }
    else if (typeof o.title === "string") res = o.title;
    return res;
};

var normalizeVariableData = data => {
    if (typeof data === "string") {
        data = data.trim();
        if (data.length === 0) return null;
        return { name: data, title: data };
    }
    else if (typeof data === "object" && data) {
        data = Object.assign({}, data);
        if (typeof data.name !== "string" || data.name.trim().length === 0) return null;
        data.name = data.name.trim();
        if (typeof data.title !== "string" || data.title.trim().length === 0) data.title = data.name;
        return data;
    }

    return null;
};

var normalizeUsedVariable = data => {
    if (typeof data === "string") {
        data = data.trim();
        if (data.length === 0) return null;
        return { name: data };
    }
    else if (typeof data === "object" && data) {
        data = Object.assign({}, data);
        if (typeof data.name !== "string" || data.name.trim().length === 0) return null;
        data.name = data.name.trim();
        if (('title' in data) && (typeof data.title !== "string")) delete data.title;
        return data;
    }

    return null;
}


var variableDataOfElt = elt => {
    if (!elt.attr) return null;
    if (!elt.attr('data-default-title')) return null;
    var res = {};
    res.name = elt.attr('data-name');
    if (typeof res.name !== "string" || !res.name) return null;
    var title = elt.attr && elt.attr('data-title');
    if (typeof title === "string") res.title = title;
    return res;
}

var varEltOfCell = cell => {
    return Array.prototype.filter.call(cell.childNodes, c => !!c.attr('data-default-title'));
}

var isChangeParent = (parentElt, elt, bf) => {
    if (parentElt !== elt.parentElement) return true;
    var children = varEltOfCell(parentElt);
    var idx;
    if (bf === 'end') {
        return children[children.length - 1] !== bf;
    }
    else {
        if (bf === elt) return false;
        idx = children.indexOf(bf);
        return children[idx - 1] !== elt;
    }
};

var hoverXOf = (cell, bf) => {
    var children = varEltOfCell(cell);
    var bound, cBound;
    if (children.length > 0) {
        bound = cell.getBoundingClientRect();
        if (bf === 'end') {
            cBound = children[children.length - 1].getBoundingClientRect();
            return cBound.right + 10 - bound.left;
        }
        else {
            cBound = bf.getBoundingClientRect();
            return cBound.left - bound.left;
        }
    }
    else {
        return 20;
    }
}


/**
 * @extends AElement
 * @constructor
 */
function CompactDataGridEditor() {
    /**
     *
     * @type {CDContext}
     */
    var context = {
        editor: this, table: null, formatTool: null, varMng: null, selectCtrl: null,
        lcEmitter: new EventEmitter()
    }
    context.table = new CDTable(context);
    this.$body = $('.as-compact-data-grid-editor-body', this);

    this.$body.addChild(context.table.$table);
    context.undoMng = new CDUndoManager(context);
    context.selectCtrl = new CDSelectController(context);
    context.formatTool = new CDGFormatTool(context);
    context.varMng = new CDGVariableManager(context);

    // OOP.drillProperty(this, context.table, 'header', 'data');
    // OOP.drillProperty(this, context.table, 'data', 'data');
    OOP.drillProperty(this, context.varMng, 'variables');
    var dataTO = -1;
    Object.defineProperties(this, {
        header: {
            set: function (value) {
                if (value) {
                    context.table.header.data = value;

                }
                else {
                    context.table.header.hidden = true;
                }
                clearTimeout(dataTO);
                dataTO = setTimeout(() => {
                    context.table.autoFixRowsWidth();
                    context.formatTool.updateAvailableCommands();
                    context.undoMng.reset().commit();
                });

            },
            get: function () {
                clearTimeout(dataTO);
                context.table.autoFixRowsWidth();
                if (context.table.header.hidden) return null;
                return context.table.header.data;
            },
            configurable: true
        },
        data: {
            set: function (value) {
                context.varMng.rejectAllVariables();
                context.table.body.data = value;
                clearTimeout(dataTO);
                dataTO = setTimeout(() => {
                    context.table.autoFixRowsWidth();
                    context.formatTool.updateAvailableCommands();
                    context.undoMng.reset().commit();
                });
            },
            get: function () {
                clearTimeout(dataTO);
                context.table.autoFixRowsWidth();
                return context.table.body.data;
            },
            configurable: true
        }
    });

    var count = 0;
    context.lcEmitter.on(EV_CELL_DATA_CHANGE, () => {
        context.undoMng.commit();
        context.formatTool.updateAvailableCommands();
        if (window.ABSOL_DEBUG) Snackbar.show('change ' + (++count));
        this.emit('change', { type: 'change', target: this }, this);
    });

    context.lcEmitter.on(EV_UNDO_APPLY, () => {
        context.formatTool.updateAvailableCommands();
        if (window.ABSOL_DEBUG) Snackbar.show('change ' + (++count));
        this.emit('change', { type: 'change', target: this }, this);
    });

    /**
     * @name data
     * @memberof CompactDataGridEditor#
     */

    /**
     * @name header
     * @memberof CompactDataGridEditor#
     */
}

/**
 * @typedef CDContext
 * @property {CompactDataGridEditor} editor
 * @property {CDTable} table
 * @property {CDGVariableManager} varMng
 * @property {CDUndoManager} undoMng
 * @property {CDGFormatTool} formatTool
 * @property {CDSelectController} selectCtrl
 * @property {EventEmitter} lcEmitter
 *
 */

CompactDataGridEditor.tag = 'CompactDataGridEditor'.toLowerCase();
CompactDataGridEditor.render = function () {
    return _({
        attr: { tabindex: 1 },
        extendEvent: ['change'],
        class: 'as-compact-data-grid-editor',
        child: ['.as-compact-data-grid-editor-body']
    });
};

CompactDataGridEditor.prototype.revokeResource = function () {
    var data = this.data;
    var header = this.header;
    Object.defineProperties(this, {
        data: {
            value: data,
            configurable: true,
            writable: true
        },
        header: {
            value: header,
            configurable: true,
            writable: true
        }
    });
    revokeResource(this.grid);
    revokeResource(this.varMng);
    this.grid = undefined;
    this.varMng = undefined;
    while (this.firstChild) {
        revokeResource(this.firstChild);
        this.firstChild.remove();
    }
};


CompactDataGridEditor.prototype.init = function (props) {
    props = Object.assign({}, props);
    this.variables = props.variables;
    this.header = props.header;
    this.data = props.data;
    delete props.variables;
    delete props.header;
    delete props.data;
    Object.assign(this, props);
};


ACore.install(CompactDataGridEditor);
export default CompactDataGridEditor;


/**
 *
 * @param  {CDContext} context
 * @constructor
 */
function CDGrid(context) {
    this.context = context;
    this.$grid = _(this.gridCt);

    // /**
    //  * @type {CompactDataGridEditor}
    //  */
    // this.elt = this.context.elt;
    // this.$body = $('tbody', this.elt);
}


CDGrid.prototype.gridCt = 'tbody';
CDGrid.prototype.rowCt = 'tr';
CDGrid.prototype.cellCt = 'td';

CDGrid.prototype.makeCell = function (data) {
    var attr = {};
    if (isNaturalNumber(data.rowSpan) && data.rowSpan > 1) {
        attr.rowspan = data.rowSpan;
    }
    else if (isNaturalNumber(data.rowspan) && data.rowspan > 1) {
        attr.rowspan = data.rowspan;
    }
    if (isNaturalNumber(data.colSpan) && data.colSpan > 1) {
        attr.colspan = data.colSpan;
    }
    else if (isNaturalNumber(data.colspan) && data.colspan > 1) {
        attr.colspan = data.colspan;
    }
    return _({
        tag: this.cellCt,
        attr: attr,
        class: 'as-ca-cell',
        // child:
    });
};

CDGrid.prototype.hasCell = function (cell) {
    return cell.isDescendantOf(this.$grid);
};

CDGrid.prototype.dataOfCell = function (cellElt) {
    var cellData = {};
    var loc = locOfCell(cellElt);
    if (loc[2] > 1) cellData.rowSpan = loc[2];
    if (loc[3] > 1) cellData.colSpan = loc[3];
    return cellData;
};

CDGrid.prototype.makeRow = function (data) {
    var cells = data.cells || [];
    return _({
        tag: this.rowCt,
        class: 'as-ca-row',
        child: cells.map(it => this.makeCell(it))
    });
};


CDGrid.prototype.updateCellLoc = function () {
    var row, cell;
    var gridElt = this.$grid;
    var height = Array(100).fill(0);
    var jj, loc;
    for (var i = 0; i < gridElt.childNodes.length; ++i) {
        row = gridElt.childNodes[i];
        jj = 0;
        for (var j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            loc = locOfCell(cell);
            while (height[jj] > i) jj++;
            cell.attr('data-loc', i + ',' + jj);
            for (var k = 0; k < loc[3]; ++k) {
                height[jj + k] = i + loc[2];
            }
            jj += loc[3];
        }
    }
    var nCol = height.indexOf(0);
    gridElt.attr('data-width', nCol);
    return nCol;
};


CDGrid.prototype.calcWidth = function () {
    var row, cell;
    var gridElt = this.$grid;
    var height = Array(100).fill(0);
    var jj, loc;
    for (var i = 0; i < gridElt.childNodes.length; ++i) {
        row = gridElt.childNodes[i];
        jj = 0;
        for (var j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            loc = locOfCell(cell);
            while (height[jj] > i) jj++;
            for (var k = 0; k < loc[3]; ++k) {
                height[jj + k] = i + loc[2];
            }
            jj += loc[3];
        }
    }
    var nCol = height.indexOf(0);
    gridElt.attr('data-width', nCol);
    return nCol;
};


CDGrid.prototype.getSize = function () {
    return {
        width: parseInt(this.$grid.attr('data-width'), 10),
        height: this.$grid.childNodes.length
    }
};

CDGrid.prototype.fixRowLength = function (rowLength) {
    rowLength = rowLength || 1;
    var row, cell;
    var gridElt = this.$grid;
    var height = Array(100).fill(0);
    var jj, colspan, rowspan;
    for (var i = 0; i < gridElt.childNodes.length; ++i) {
        row = gridElt.childNodes[i];
        jj = 0;
        for (var j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            colspan = parseInt(cell.attr('colspan'), 10) || 1;
            rowspan = parseInt(cell.attr('rowspan'), 10) || 1;
            while (height[jj] > i) jj++;
            for (var k = 0; k < colspan; ++k) {
                height[jj + k] = i + rowspan;
            }
            jj += colspan;

        }
        for (j = jj; j < rowLength; ++j) {
            row.addChild(this.makeCell({}).attr('data-loc', i + ',' + j));
            height[j] = i + 1;
        }
    }
};


CDGrid.prototype.getCellsFromLoc = function (loc) {
    var row, cell, cellLoc;
    var res = [];
    var gridElt = this.$grid;
    for (var i = 0; i < gridElt.childNodes.length; ++i) {
        row = gridElt.childNodes[i];
        for (var j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            cellLoc = locOfCell(cell);
            if (locCollapse(cellLoc, loc)) res.push(cell);
        }
    }
    var newLoc = locOfCells(res);
    if (!locEqual(newLoc, loc)) res = this.getCellsFromLoc(newLoc);
    return res;
};

CDGrid.prototype.addRowAt = function (newRowIdx) {
    var height = Array(50).fill(0);
    var row, cell, jj;
    var gridElt = this.$grid;

    var loc;
    if (gridElt.firstChild && gridElt.firstChild.lastChild)
        loc = locOfCell(gridElt.firstChild.lastChild);
    else loc = [0, 0, 1, 1];
    var rowLength = loc[1] + loc[3];

    for (var i = 0; i < gridElt.childNodes.length; ++i) {
        if (i === newRowIdx) {
            row = this.makeRow({ cell: [] });
            gridElt.addChildBefore(row, gridElt.childNodes[i]);
            jj = 0;
            while (jj < rowLength) {
                while (height[jj] > newRowIdx) {
                    jj++;
                }
                row.addChild(this.makeCell({}));
                height[jj] = i + 1;
                jj++;
            }
            ++i;
        }
        row = gridElt.childNodes[i];
        jj = 0;
        for (var j = 0; j < row.childNodes.length; ++j) {
            while (height[jj] > i + 1) jj++;
            cell = row.childNodes[j];
            loc = locOfCell(cell);

            if (i <= newRowIdx && i + loc[2] > newRowIdx) {
                loc[2]++;
                cell.attr('rowspan', loc[2]);
            }
            for (var k = 0; k < loc[3]; ++k) {
                height[jj + k] = i + loc[2];
            }
            jj += loc[3];
        }
    }

    if (newRowIdx === gridElt.childNodes.length) {
        row = this.makeRow({ cell: [] })
        gridElt.addChild(row);
        jj = 0;
        while (jj < rowLength) {
            while (height[jj] > newRowIdx) jj++;
            row.addChild(this.makeCell({}));
            jj++;
        }
    }

    this.updateCellLoc();
}

CDGrid.prototype.addColAt = function (newColIdx) {
    var height = Array(50).fill(0);
    var row, cell, jj;
    var gridElt = this.$grid;
    var colspan, rowspan;
    for (var i = 0; i < gridElt.childNodes.length; ++i) {
        row = gridElt.childNodes[i];
        jj = 0;
        for (var j = 0; j < row.childNodes.length; ++j) {
            while (height[jj] > i) jj++;
            cell = row.childNodes[j];
            colspan = parseInt(cell.getAttribute('colspan'), 10) || 1;
            rowspan = parseInt(cell.getAttribute('rowspan'), 10) || 1;
            if (jj === newColIdx) {
                row.addChildBefore(this.makeCell({}), cell);
                height[jj] = i + 1;
                j++;
                jj++;
            }
            else if (jj <= newColIdx && jj + colspan > newColIdx) {
                colspan++;
                cell.attr('colspan', colspan);
            }
            height[jj] = i + rowspan;
            jj += colspan;
        }
        if (jj === newColIdx) {
            row.addChild(this.makeCell({}));
            height[jj] = i + 1;
        }
    }

    this.updateCellLoc();
};

/**
 *
 * @param rowIdx
 * @param {number=} rowHeight
 */
CDGrid.prototype.removeRowAt = function (rowIdx, rowHeight) {
    if (!isNaturalNumber(rowHeight)) rowHeight = 1;
    rowHeight = rowHeight || 1;
    var body = this.$body;
    var row, cell;
    var loc;
    var rmLoc = [rowIdx, 0, rowHeight, 100];
    var needSplitLocs = [];
    var needSplitCells = [];
    var childSplitCells = [];
    var i, j;
    for (i = 0; i < body.childNodes.length; ++i) {
        row = body.childNodes[i];
        for (j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            loc = locOfCell(cell);
            if ((loc[2] > 1 || loc[3] > 1) && locCollapse(rmLoc, loc) && !locInLoc(loc, rmLoc)) {
                needSplitLocs.push(loc);
                needSplitCells.push(cell);
                childSplitCells.push(Array.prototype.slice.call(cell.childNodes));
            }
        }
    }
    for (i = 0; i < needSplitCells.length; ++i) {
        this.splitCell(needSplitCells[i]);
        loc = needSplitLocs[i];
        if (loc[0] < rowIdx) {
            if (loc[0] + loc[2] <= rowIdx + rowHeight) {
                loc[2] = rowIdx - loc[0];
            }
            else {
                loc[2] -= rowHeight;
            }
        }
        else {
            loc[2] -= rowIdx + rowHeight - loc[0];
        }
    }

    for (i = rowIdx + rowHeight - 1; i >= rowIdx; --i) {
        body.childNodes[i].remove();
    }
    this.updateCellLoc();
    var cells;
    for (i = 0; i < needSplitLocs.length; ++i) {
        loc = needSplitLocs[i];
        cells = this.getCellsFromLoc(loc);
        cells[0].addChild(childSplitCells[i]);
        this.mergeCells(cells);
    }
    this.updateCellLoc();
};


/**
 *
 * @param colIdx
 * @param {number=} colWidth
 */
CDGrid.prototype.removeColAt = function (colIdx, colWidth) {
    if (!isNaturalNumber(colWidth)) colWidth = 1;
    colWidth = colWidth || 1;
    var gridElt = this.$grid;
    var row, cell;
    var loc;
    var rmLoc = [0, colIdx, 100, colWidth];
    var needSplitLocs = [];
    var needSplitCells = [];
    var childSplitCells = [];
    var i, j;
    for (i = 0; i < gridElt.childNodes.length; ++i) {
        row = gridElt.childNodes[i];
        for (j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            loc = locOfCell(cell);
            if ((loc[2] > 1 || loc[3] > 1) && locCollapse(rmLoc, loc) && !locInLoc(loc, rmLoc)) {
                needSplitLocs.push(loc);
                needSplitCells.push(cell);
                childSplitCells.push(Array.prototype.slice.call(cell.childNodes));
            }
        }
    }
    for (i = 0; i < needSplitCells.length; ++i) {
        this.splitCell(needSplitCells[i]);
        loc = needSplitLocs[i];
        if (loc[1] < colIdx) {
            if (loc[1] + loc[3] <= colIdx + colWidth) {
                loc[3] = colIdx - loc[1];
            }
            else {
                loc[3] -= colWidth;
            }
        }
        else {
            loc[3] -= colIdx + colWidth - loc[1];
        }
    }

    var cells = this.getCellsFromLoc(rmLoc);
    cells.forEach(cell => cell.remove());
    this.updateCellLoc();
    for (i = 0; i < needSplitLocs.length; ++i) {
        loc = needSplitLocs[i];
        cells = this.getCellsFromLoc(loc);
        cells[0].addChild(childSplitCells[i]);
        this.mergeCells(cells);
    }
    this.updateCellLoc();
};


CDGrid.prototype.mergeCells = function (cells) {
    var loc = locOfCells(cells);
    var cell0 = cells[0];
    cell0.attr({
        rowspan: loc[2],
        colspan: loc[3]
    });
    for (var i = 1; i < cells.length; ++i) {
        cell0.addChild($$('.as-cag-var', cells[i]));
        cells[i].remove();
    }
    this.updateCellLoc();
};


CDGrid.prototype.splitCell = function (originalCell) {
    // var originalLoc = locOfCell(originalCell);
    var height = Array(100).fill(0);
    var loc;
    var gridElt = this.$grid;
    var size = this.getSize();
    loc = [0, 0, size.height, size.width];
    var rowLength = loc[1] + loc[3];
    originalCell.attr('rowspan', undefined);
    originalCell.attr('colspan', undefined);
    var row, cell;
    var jj;
    for (var i = 0; i < gridElt.childNodes.length; ++i) {
        row = gridElt.childNodes[i];
        jj = 0;
        while (height[jj] > i) ++jj;
        for (var j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            loc = locOfCell(cell);
            while (jj < loc[1]) {
                if (height[jj] <=i) {
                    row.addChildBefore(this.makeCell({}), cell);
                    height[jj] = i + 1;
                    ++j;
                }
                ++jj;
            }
            for (var k = 0; k < loc[3]; ++k) {
                height[jj + k] = i + loc[2];
            }

            jj += loc[3];
            while (height[jj] > i) ++jj;
        }
        while (jj < rowLength) {
            row.addChild(this.makeCell({}));
            height[jj] = i + 1;
            ++jj;
            ++j;
        }
    }
    this.updateCellLoc();
};


/**
 * @typedef CDGData
 * @property {CDGDataRow[]}
 */


/**
 * @typedef CDGDataRow
 * @property {CDGDataCell[]}
 */

/**
 * @typedef CDGDataCell
 * @property {{}} style
 * @property {string} text
 */


Object.defineProperty(CDGrid.prototype, 'data', {
    set: function (value) {
        this.$grid.clearChild();
        var rows = (value && value.rows) || [];
        if (rows.length === 0) rows.push({
            cells: [{}]
        });
        this.$grid.addChild(rows.map(it => this.makeRow(it)));
        var nCol = this.updateCellLoc();
        this.fixRowLength(nCol);
    },
    get: function () {
        var res = {};
        res.rows = Array.prototype.map.call(this.$grid.childNodes, (rowElt) => {
            var rowData = {};
            rowData.cells = Array.prototype.map.call(rowElt.childNodes, cellElt => {
                return this.dataOfCell(cellElt);
            });
            return rowData;
        })
        return res;
    },
    configurable: true
});

/**
 * @extends CDGrid
 * @param {CDContext} context
 * @param {CDTable} table
 * @constructor
 */
function CDTableBody(context, table) {
    CDGrid.call(this, context);
    this.table = table;
}

mixClass(CDTableBody, CDGrid);

CDTableBody.prototype.gridCt = 'tbody';


CDTableBody.prototype.makeCell = function (data) {
    var variables = data.variables || [];
    var attr = {};
    if (isNaturalNumber(data.rowSpan) && data.rowSpan > 1) {
        attr.rowspan = data.rowSpan;
    }
    else if (isNaturalNumber(data.rowspan) && data.rowspan > 1) {
        attr.rowspan = data.rowspan;
    }
    if (isNaturalNumber(data.colSpan) && data.colSpan > 1) {
        attr.colspan = data.colSpan;
    }
    else if (isNaturalNumber(data.colspan) && data.colspan > 1) {
        attr.colspan = data.colspan;
    }
    return _({
        tag: 'td',
        attr: attr,
        class: 'as-ca-cell',
        child: variables.map(it => {
            it = normalizeUsedVariable(it);
            var name = it.name;
            return this.context.varMng.pickVariable(name);
        })
    });
};

CDTableBody.prototype.dataOfCell = function (cellElt) {
    var cellData = CDGrid.prototype.dataOfCell.call(this, cellElt);
    var variables = $$('.as-cag-var', cellElt).map(varElt => variableDataOfElt(varElt)).filter(x => !!x);
    if (variables.length > 0) cellData.variables = variables;
    return cellData;
};

/**
 *
 * @param {CDContext} context
 * @constructor
 */
function CDTable(context) {
    /**
     *
     * @type {CDContext}
     */
    this.context = context;
    this.header = new CDTableHeader(context, this);
    this.body = new CDTableBody(context, this);
    this.$table = _({
        tag: 'table',
        class: 'as-cdg-table',
        child: [
            this.header.$grid,
            this.body.$grid
        ]
    });
    this.header.hidden = true;//default
    this.header.data = { rows: [{ cells: [{}] }] }
}

CDTable.prototype.autoFixRowsWidth = function () {
    var hL = this.header.calcWidth();
    var bL = Math.max(1, this.body.calcWidth());
    if (hL < bL) {
        this.header.fixRowLength(bL);
    }
    else if (hL > bL) {
        this.body.fixRowLength(bL);
    }
};


/**
 * @extends CDGrid
 *  @param {CDContext} context
 * @param {CDTable} table
 * @constructor
 */
function CDTableHeader(context, table) {
    CDGrid.call(this, context);
    this.table = table;
}


mixClass(CDTableHeader, CDGrid);


CDTableHeader.prototype.gridCt = 'thead';
CDTableHeader.prototype.cellCt = 'th';

CDTableHeader.prototype.makeCell = function (data) {
    var res = CDGrid.prototype.makeCell.call(this, data);
    var beforeValue;
    var input = _({
        tag: PreInput,
        attr: {
            contenteditable: 'true',
            spellcheck: 'false'
        },
        props: {
            value: (data.text || ' ') + ''
        },
        on: {
            focus: function () {
                beforeValue = input.value;
            },
            blur: () => {
                if (input.value !== beforeValue) {
                    this.context.lcEmitter.emit(EV_CELL_DATA_CHANGE);
                }
                beforeValue = undefined;
            }
        }
    });
    res.addChild(input);
    return res;
};

CDTableHeader.prototype.dataOfCell = function (cellElt) {
    var cellData = CDGrid.prototype.dataOfCell.call(this, cellElt);
    cellData.text = cellElt.firstChild.value;
    return cellData;
};


Object.defineProperty(CDTableHeader.prototype, 'hidden', {
    set: function (value) {
        if (value) {
            this.$grid.addClass('as-hidden');
        }
        else {
            this.$grid.removeClass('as-hidden');
        }
    },
    get: function () {
        return this.$grid.hasClass('as-hidden');
    },
    configurable: true
});


/**
 *
 * @param {CDContext} context
 * @constructor
 */
function CDSelectController(context) {
    this.context = context;
    this.editor = context.editor;
    this.lcEmitter = context.lcEmitter;
    Object.keys(this.constructor.prototype).filter(k => k.startsWith('ev_'))
        .forEach(key => this[key] = this[key].bind(this));

    this.selectedGrid = null;
    this.selectedCells = [];

    _({
        tag: 'hanger',
        elt: this.context.table.$table,
        on: {
            draginit: this.ev_dragInit,
            drag: this.ev_drag,
            dragdeinit: this.ev_dragDeinit
        }
    });


}


CDSelectController.prototype.cellOf = function (o) {
    while (o) {
        if (o.hasClass && o.hasClass('as-ca-cell')) return o;
        o = o.parentElement;
    }
    return null;
};

/**
 *
 * @param {Vec2} pos
 */
CDSelectController.prototype.cellOfScreenPos = function (pos) {
    var row, cell, bound;
    var body = this.startingGrid.$grid;
    for (var i = 0; i < body.childNodes.length; ++i) {
        row = body.childNodes[i];
        for (var j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            bound = Rectangle.fromClientRect(cell.getBoundingClientRect());
            if (bound.containsPoint(pos)) return cell;
        }
    }
    return null;
};

CDSelectController.prototype.ev_dragInit = function (event) {
    var cell = null;
    if (event.target.hasClass && event.target.hasClass('as-ca-cell')) {
        cell = event.target;
    }

    this.startingCell = cell;
    this.mouseDownCell = this.cellOf(event.target);
    if (this.mouseDownCell) {
        this.startingGrid = this.mouseDownCell.isDescendantOf(this.context.table.header.$grid) ? this.context.table.header : this.context.table.body;
    }
    this.hoveringCells = [];

};

CDSelectController.prototype.ev_drag = function (event) {
    if (!this.startingCell) return;
    var curCell = this.cellOfScreenPos(event.currentPoint);
    if (!curCell) return;
    var startingLoc = locOfCell(this.startingCell);
    var endingLoc = locOfCell(curCell);
    var selectedLoc = mergeLoc(startingLoc, endingLoc);
    this.hoveringCells.forEach(cell => {
        cell.removeClass('as-hovering');
    });
    this.hoveringCells = this.startingGrid.getCellsFromLoc(selectedLoc);
    this.hoveringCells.forEach(cell => {
        cell.addClass('as-hovering');
    });
};


CDSelectController.prototype.ev_dragDeinit = function (event) {
    this.hoveringCells.forEach(cell => {
        cell.removeClass('as-hovering');
    });
    if (this.hoveringCells.length > 0) {
        this.selectCells(this.hoveringCells);
    }
    else if (this.cellOf(event.target) === this.mouseDownCell) {
        this.selectCells([this.mouseDownCell]);

    }
    this.hoveringCells = null;
    this.hoveringCells = [];
};

CDSelectController.prototype.selectCells = function (cells) {
    this.selectedCells.forEach(cell => cell.removeClass('as-selected'));
    this.selectedCells = cells.slice();
    this.selectedCells.forEach(cell => cell.addClass('as-selected'));
    var focsVar = $('td.as-selected .as-cag-var.as-focus', this.editor);
    if (!focsVar) {
        focsVar = $('td.as-selected .as-cag-var', this.editor);
        this.context.varMng.focus(focsVar || null);

    }
    if (!focsVar) {
        focsVar = $('th.as-selected preinput', this.editor);
        if (focsVar) {
            focsVar.focus();
            focsVar.select(focsVar.value.length);
        }
    }

    this.lcEmitter.emit(EV_SELECTED_CELL_CHANGE);
};


/**
 *
 * @param  context
 * @constructor
 */
function CDGVariableManager(context) {
    this.context = context;
    this.editor = context.editor;
    this.lcEmitter = context.lcEmitter;
    /**
     *
     * @type {CDGrid}
     */
    this.body = context.table.body;
    this.createView();
    this._variables = [];
    this.variableDict = {};

    this.pickedVariables = {};
    this.availableVariables = {};
    Object.keys(this.constructor.prototype).filter(k => k.startsWith('ev_'))
        .forEach(key => this[key] = this[key].bind(this));
    this.focusVariable = null;
}

CDGVariableManager.prototype.focus = function (varElt) {
    if (this.focusVariable) {
        this.focusVariable.removeClass('as-focus');
    }
    this.focusVariable = varElt;
    if (this.focusVariable) {
        this.focusVariable.addClass('as-focus');
    }
};


CDGVariableManager.revokeResource = function () {
    this.editor = undefined;
    this.grid = undefined;
};

CDGVariableManager.prototype.createView = function () {
    this.$varMng = _({
        class: 'as-cag-var-mng',
        child: []
    });
    this.editor.addChildAfter(this.$varMng, this.context.formatTool.$tool);
};


/**
 *
 * @param {string} name
 * @returns {*}
 */
CDGVariableManager.prototype.makeVariable = function (name) {

    var info = this.variableDict[name] || {};

    var elt = _({
        tag: 'hanger',
        class: 'as-cag-var',
        attr: {
            'data-name': name,
        },
        child: [
            // { tag: 'span', child: { text: name } }
        ],
        props: {
            hangOn: 3,
        },
        on: {
            dragstart: this.ev_dragStart,
            dragend: this.ev_dragEnd,
            drag: this.ev_drag,
            click: () => {
                this.focus(elt);
            }
        }
    });

    if (typeof info.title === "string") {
        elt.attr('data-title', info.title);
    }
    if (info) {
        elt.attr('data-default-title', info.title);
    }

    return elt;
};


CDGVariableManager.prototype.pickVariable = function (name) {
    if (this.availableVariables[name]) {
        this.pickedVariables[name] = this.availableVariables[name];
        delete this.availableVariables[name];
    }
    else if (!this.pickedVariables[name]) {
        this.pickedVariables[name] = this.makeVariable(name);
    }

    return this.pickedVariables[name];
};


CDGVariableManager.prototype.rejectVariable = function (name) {
    if (this.pickedVariables[name]) {
        this.availableVariables[name] = this.pickedVariables[name];
        delete this.pickedVariables[name];
    }
    this.$varMng.addChild(this.availableVariables[name]);
    return this.availableVariables[name];
};

CDGVariableManager.prototype.rejectAllVariables = function () {
    Object.keys(this.pickedVariables).forEach(name => this.rejectVariable(name));
};

CDGVariableManager.prototype.variableElementOf = function (o) {
    var name = varNameOf(o);
    if (name === "string") return this.availableVariables[o] || this.pickedVariables[o];
    if (isDomNode(o)) {
        while (o) {
            if (o.hasClass && o.hasClass('as-cag-var')) {
                return o;
            }
            o = o.parentElement;
        }
    }
    return null;
};


CDGVariableManager.prototype.findVariableLocation = function (rect) {
    var cells = $$('.as-ca-cell', this.body.$grid);
    var best = 0;
    var cellRect;
    var bestCell;
    var square;
    var i;
    for (i = 0; i < cells.length; ++i) {
        cellRect = Rectangle.fromClientRect(cells[i].getBoundingClientRect());
        square = rect.collapsedSquare(cellRect);
        if (square > best) {
            bestCell = cells[i];
        }
    }
    var res = { in: null };
    if (bestCell) {
        res.in = bestCell;
    }
    else {
        res.in = null;
    }

    var varEltList, varElt, varBound;
    if (res.in) {
        varEltList = $$('.as-cag-var', res.in);
        res.bf = 'end';
        for (i = varEltList.length - 1; i >= 0; --i) {
            varElt = varEltList[i];
            if (!varElt.attr('data-default-title')) continue;
            varBound = Rectangle.fromClientRect(varElt.getBoundingClientRect());
            if (varBound.centerPoint().x > rect.centerPoint().x) {
                res.bf = varElt;
            }
            else break;
        }
        return res;
    }
    else {
        return null;
    }

};

/**
 *
 * @param {AElement=} elt
 */
CDGVariableManager.prototype.openEditVariableDialog = function (elt) {
    elt = elt || this.focusVariable;
    if (!elt) return;

    var flushData = () => {
        var newTile = checkbox.checked ? undefined : titleInput.value;
        var oldTile = elt.attr('data-title');
        if (typeof oldTile !== "string") oldTile = undefined;
        if (newTile !== oldTile) {
            elt.attr('data-title', newTile);
            this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
        }
    }
    var finish = () => {
        flushData();
        cancel();
    }

    var cancel = () => {
        document.removeEventListener('click', clickOut);
        elt = null;
        follower.followTarget = null;
        follower.clearChild();
        follower.remove();
        ResizeSystem.removeTrash();
        finish = undefined;
        cancel = undefined;
        clickOut = undefined;

    }

    var clickOut = event => {
        if (hitElement(follower, event)) return;
        cancel();

    };
    setTimeout(() => {
        document.addEventListener('click', clickOut);

    }, 100);


    var checkboxUpdate = () => {
        if (checkbox.checked) {
            titleInput.disabled = true;
            titleInput.savedData = titleInput.value;
            titleInput.value = '';
        }
        else {
            titleInput.disabled = false;
            titleInput.value = titleInput.value || titleInput.savedData || '';
        }
    }

    var follower = _({
        tag: Follower,
        class: ['as-dropdown-box-common-style', 'as-cdg-variable-edit-dialog'],
        style: {
            zIndex: findMaxZIndex(elt) + 10,
        },
        child: [
            {
                style: {
                    fontWeight: 'bold',
                    padding: '10px 5px'
                },
                child: { text: 'Tiêu đề' }
            },
            {
                class: 'as-table-grid',
                child: [
                    {
                        class: 'as-table-grid-row',
                        child: [
                            {
                                class: 'as-table-grid-cell',
                                child: { tag: 'span', child: { text: 'Mặc định' } }
                            },
                            {
                                class: 'as-table-grid-cell',
                                child: {
                                    tag: 'checkboxinput',
                                    props: {
                                        checked: typeof elt.attr('data-title') !== "string"
                                    },
                                    on: {
                                        change: checkboxUpdate
                                    }
                                }
                            },
                        ]
                    },
                    {
                        class: 'as-table-grid-row',
                        child: [
                            {
                                class: 'as-table-grid-cell',
                                child: { tag: 'span', child: { text: 'Giá trị' } }
                            },
                            {
                                class: 'as-table-grid-cell',
                                child: {
                                    tag: 'input',
                                    attr: { type: 'text' },
                                    props: {
                                        value: elt.attr('data-title') || ''
                                    },
                                    class: 'as-text-input'
                                }
                            },
                        ]
                    }
                ]
            },
            {
                style: { textAlign: 'center', padding: '10px' },
                child: [{
                    tag: 'flexiconbutton',
                    props: { text: 'Xác nhận' },
                    style: { marginRight: '20px' },
                    on: {
                        click: finish
                    }
                },
                    {
                        tag: 'flexiconbutton',
                        props: { text: 'Hủy' },
                        on: {
                            click: cancel
                        }
                    }
                ]
            }
        ],
        props: {
            followTarget: elt,
        }
    }).addTo(document.body);
    var checkbox = $('checkboxinput', follower);
    var titleInput = $('input[type="text"]', follower);
    checkboxUpdate();
};

CDGVariableManager.prototype.ev_dragStart = function (event) {
    var varElt = this.variableElementOf(event.target);
    var eltBound = varElt.getBoundingClientRect();
    var offset = event.currentPoint.sub(new Vec2(eltBound.left, eltBound.top));
    this.draggingElt = varElt;
    this.dragOffset = offset;
    this.clonedElt = $(varElt.cloneNode(true)).addClass('as-clone-var').addStyle({
        position: 'fixed',
        zIndex: findMaxZIndex(varElt) + 2,
        left: eltBound.left + 'px',
        top: eltBound.top + 'px'
    }).addTo(document.body);
    varElt.addStyle('opacity', 0.8);
    this.hoverCell = null;
};

CDGVariableManager.prototype.ev_drag = function (event) {
    var newPos = event.currentPoint.sub(this.dragOffset);
    this.clonedElt.addStyle({
        left: newPos.x + 'px',
        top: newPos.y + 'px'
    });
    var pointerRect = new Rectangle(event.currentPoint.x - 10, event.currentPoint.y - 10, 20, 20);
    this.newLocation = this.findVariableLocation(pointerRect);
    var newLocation = this.newLocation;
    if (newLocation) {
        if (newLocation.in !== this.hoverCell) {
            if (this.hoverCell)
                this.hoverCell.removeClass('as-drag-over');
            this.hoverCell = newLocation.in;
            this.hoverCell.addClass('as-drag-over');
        }
        if (isChangeParent(newLocation.in, this.draggingElt, newLocation.bf)) {
            this.hoverCell.addClass('as-bf');
            this.hoverCell.addStyle('--hover-x', hoverXOf(newLocation.in, newLocation.bf) + 'px');
        }
        else {
            this.hoverCell.removeClass('as-bf').removeStyle('--hover-x');
        }
    }
    else {
        if (this.hoverCell)
            this.hoverCell.removeClass('as-drag-over')
                .removeClass('as-bf').removeStyle('--hover-x');
    }
};


CDGVariableManager.prototype.ev_dragEnd = function () {
    this.draggingElt.removeStyle('opacity');
    this.clonedElt.remove();
    if (this.hoverCell)
        this.hoverCell.removeClass('as-drag-over');

    var name = this.draggingElt.attr('data-name');
    var newLocation = this.newLocation;
    if (newLocation) {
        if (isChangeParent(newLocation.in, this.draggingElt, newLocation.bf)) {
            this.draggingElt.selfRemove();
            if (newLocation.bf === 'end') {
                newLocation.in.addChild(this.draggingElt);
            }
            else {
                newLocation.in.addChildBefore(this.draggingElt, newLocation.bf);
            }
            this.pickVariable(name);
            this.context.selectCtrl.selectCells([this.newLocation.in]);
            this.context.varMng.focus(this.draggingElt);
            this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
        }
    }
    else {
        if (this.draggingElt.parentElement !== this.$varMng) {
            this.rejectVariable(name);
            this.$varMng.addChild(this.draggingElt);
            this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
        }
    }
};

CDGVariableManager.prototype.updateVariableInfo = function () {
    var i, elt;
    var varInfo;
    for (i in this.availableVariables) {
        elt = this.availableVariables[i];
        varInfo = this.variableDict[i];
        if (varInfo)
            elt.attr('data-default-title', varInfo.title)
    }

    for (i in this.pickedVariables) {
        elt = this.pickedVariables[i];
        varInfo = this.variableDict[i];
        if (varInfo)
            elt.attr('data-default-title', varInfo.title);
    }

    for (i = 0; i < this._variables.length; ++i) {
        varInfo = this._variables[i];
        if (this.pickedVariables[varInfo.name] || this.availableVariables[varInfo.name]) continue;
        this.availableVariables[varInfo.name] = this.makeVariable(varInfo.name);
        this.$varMng.addChild(this.availableVariables[varInfo.name]);
    }

}

/// nếu không c trong danh sách thì tự bỏ ra
Object.defineProperty(CDGVariableManager.prototype, 'variables', {
    set: function (variables) {
        if (!Array.isArray(variables)) variables = [];
        variables = variables.map(v => normalizeVariableData(v)).filter(x => !!x);
        var t = variables.reduce((ac, cr) => {
            if (!ac.dict[cr.name]) {
                ac.dict[cr.name] = cr;
                ac.arr.push(cr);
            }
            return ac;
        }, { arr: [], dict: {} });
        this._variables = t.arr;
        this.variableDict = t.dict;
        this.updateVariableInfo();

        //
        // this.availableVariables = {};
        // this.$varMng.clearChild();

    },
    get: function () {
        return this._variables;
    }
});


/**
 *
 * @param {CDContext} context
 * @constructor
 */
function CDUndoManager(context) {
    this.context = context;
    this.data = [];
    this.idx = -1;
}


CDUndoManager.prototype.revokeResource = function () {
    this.data = [];
    this.idx = -1;
};

CDUndoManager.prototype.reset = function () {
    this.data = [];
    this.idx = -1;
    return this;
}

CDUndoManager.prototype.commit = function () {
    while (this.data.length - 1 > this.idx) this.data.pop();
    var item = {
        header: this.context.table.header.data,
        data: this.context.table.body.data,
        headerHidden: this.context.table.header.hidden
    };
    this.data.push(item);
    this.idx = this.data.length - 1;
    return this;
};

CDUndoManager.prototype._applyTop = function () {
    var item = this.data[this.idx];
    this.context.varMng.rejectAllVariables();
    this.context.table.header.data = item.header;
    this.context.table.header.hidden = item.headerHidden;
    this.context.table.body.data = item.data;
    this.context.lcEmitter.emit(EV_UNDO_APPLY);
}

CDUndoManager.prototype.undo = function () {
    if (!this.canUndo()) return this;
    this.idx--;
    this._applyTop();
    return this;
};


CDUndoManager.prototype.redo = function () {
    if (!this.canRedo()) return this;
    this.idx++;
    this._applyTop();
    return this;

};


CDUndoManager.prototype.canRedo = function () {
    return this.idx + 1 < this.data.length;
};


CDUndoManager.prototype.canUndo = function () {
    return this.idx > 0;
};


/**
 *
 * @param {CDContext} context
 * @constructor
 */
function CDGFormatTool(context) {
    this.context = context;
    this.table = context.table;
    this.editor = context.editor;
    this.lcEmitter = context.lcEmitter;
    Object.keys(this.constructor.prototype).filter(k => k.startsWith('ev_')).forEach(k => this[k] = this[k].bind(this));
    this.$tool = _({
        class: 'as-table-of-text-input-tool',
        child: [
            {
                class: 'as-table-of-text-input-tool-group',
                child: [
                    {
                        tag: RibbonButton,
                        attr: { "data-command": 'toggle_header' },
                        props: {
                            items: [
                                {
                                    text: 'Show Header',
                                    arg: true,
                                    icon: _(table_header_add_txt).addClass('as-show-header')
                                },
                                { text: 'Hide Header', arg: false, icon: table_header_add_txt }
                            ],
                            icon: _(table_header_add_txt).addClass('as-show-header')
                        }
                    }
                ]
            },
            {
                class: 'as-table-of-text-input-tool-group',
                child: [
                    {
                        tag: 'button',
                        class: ['as-transparent-button', 'as-table-of-text-input-tool-command'],
                        child: 'span.mdi.mdi-undo',
                        attr: { 'data-command': 'undo' }
                    },
                    {
                        tag: 'button',
                        class: ['as-transparent-button', 'as-table-of-text-input-tool-command'],
                        child: 'span.mdi.mdi-redo',
                        attr: { 'data-command': 'redo' }
                    },
                ]
            },
            {
                class: 'as-table-of-text-input-tool-group',
                child: [
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
                        }
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
                        class: ['as-transparent-button', 'as-table-of-text-input-tool-command'],//can checked
                        attr: { 'data-command': 'merge' },
                        child: {
                            tag: 'span',
                            class: ['mdi', 'mdi-table-merge-cells'],
                        },
                    }]
            },

            {
                tag: 'button',
                class: ['as-transparent-button', 'as-table-of-text-input-tool-command'],
                attr: { 'data-command': 'edit_variable' },
                child: {
                    tag: 'span',
                    class: ['mdi', 'mdi-tag-edit-outline'],
                }
            }
        ]
    });
    this.editor.addChildAfter(this.$tool, null);
    this.$commandBtns = $$('.as-table-of-text-input-tool >button', this.$tool).concat($$('.as-table-of-text-input-tool-group >button', this.$tool))
        .reduce((ac, btn) => {
            var value = btn.attr('data-command');
            if (!value) return ac;
            if (btn.isSupportedEvent('select')) {
                btn.on('select', (event) => {
                    this.commands[value].exec.call(this, event.item.arg);
                    console.log(event)
                });
            }
            else
                btn.on('click', ev => {
                    this.commands[value].exec.call(this);
                    // this.ev_clickInsert(value, ev);
                });
            ac[value] = btn;
            return ac;
        }, {});
    this.updateAvailableCommands();
    this.lcEmitter.on(EV_SELECTED_CELL_CHANGE, this.updateAvailableCommands.bind(this));
}

CDGFormatTool.prototype.updateAvailableCommands = function () {
    Object.values(this.$commandBtns).forEach(btn => {
        var name = btn.attr('data-command');
        if (this.commands[name] && this.commands[name].available) {
            btn.disabled = !this.commands[name].available.call(this);
        }
        if (this.commands[name] && this.commands[name].checked) {
            if (this.commands[name].checked.call(this)) {
                btn.addClass('as-checked');
            }
            else {
                btn.removeClass('as-checked');
            }
        }
        else if (this.commands[name] && this.commands[name].getIcon) {
            btn.icon = this.commands[name].getIcon.call(this);
        }
    });
};

CDGFormatTool.prototype.addColAt = function (newColIdx) {
    this.table.header.addColAt(newColIdx);
    this.table.body.addColAt(newColIdx);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);

};


CDGFormatTool.prototype.addRowAt = function (grid, newRowIdx) {//todo: wrong
    grid.addRowAt(newRowIdx);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
};


CDGFormatTool.prototype.removeRowAt = function (grid, rowIdx, rowHeight) {
    grid.removeRowAt(rowIdx, rowHeight);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
};


CDGFormatTool.prototype.removeColAt = function (rowIdx, colWidth) {
    this.table.header.removeColAt(rowIdx, colWidth);
    this.table.body.removeColAt(rowIdx, colWidth);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
};

CDGFormatTool.prototype.mergeCells = function (grid, cells) {
    grid.mergeCells(cells);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
};

CDGFormatTool.prototype.splitCell = function (grid, originalCell) {
    grid.splitCell(originalCell);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
};


/**
 * @this CDGFormatTool
 */
function hasSelectedCell() {
    var selectedCells = this.context.selectCtrl.selectedCells;
    return selectedCells.length > 0;
}

CDGFormatTool.prototype.commands = {
    undo: {
        /**
         * @this CDGFormatTool
         */
        available: function () {
            return this.context.undoMng.canUndo();
        },
        exec: function () {
            this.context.undoMng.undo();
        }
    },
    redo: {
        available: function () {
            return this.context.undoMng.canRedo();
        },
        exec: function () {
            this.context.undoMng.redo();

        }
    },
    toggle_header: {
        /**
         * @this CDGFormatTool
         */
        getIcon: function () {
            if (this.context && this.context.table.header.hidden) {
                return _(table_header_add_txt);
            }
            else {
                return _(table_header_add_txt).addClass('as-show-header')
            }
        },
        /**
         * @this CDGFormatTool
         */
        exec: function (arg) {
            if (!this.context.table.header.hidden === !!arg) return;
            this.context.table.header.hidden = !arg;
            this.lcEmitter.emit(EV_SELECTED_CELL_CHANGE);
            this.lcEmitter.emit(EV_CELL_DATA_CHANGE);

        }
    },
    left: {
        available: hasSelectedCell,
        /**
         * @this CDGFormatTool
         */
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return;
            var loc = locOfCells(selectedCells);
            var newColIdx = loc[1];
            this.addColAt(newColIdx);
        }
    },
    right: {
        available: hasSelectedCell,
        /**
         * @this CDGFormatTool
         */
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return;
            var loc = locOfCells(selectedCells);
            var newColIdx = loc[1] + loc[3];
            this.addColAt(newColIdx);
        }
    },
    above: {
        available: hasSelectedCell,
        /**
         * @this CDGFormatTool
         */
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return;
            var loc = locOfCells(selectedCells);
            var newRowIdx = loc[0];
            var grid = this.context.table.body;
            if (this.context.table.header.hasCell(selectedCells[0]))
                grid = this.context.table.header;
            this.addRowAt(grid, newRowIdx);
        }
    },
    bellow: {
        available: hasSelectedCell,
        /**
         * @this CDGFormatTool
         */
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return;
            var loc = locOfCells(selectedCells);
            var newRowIdx = loc[0] + loc[2];
            var grid = this.context.table.body;
            if (this.context.table.header.hasCell(selectedCells[0]))
                grid = this.context.table.header;
            this.addRowAt(grid, newRowIdx);

        }
    },
    removeRow: {
        available: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return false;
            var loc = locOfCells(selectedCells);
            var grid = this.context.table.body;
            if (this.context.table.header.hasCell(selectedCells[0]))
                grid = this.context.table.header;
            var size = grid.getSize();
            return loc[2] < size.height;

        },
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return;
            var loc = locOfCells(selectedCells);
            var grid = this.context.table.body;
            if (this.context.table.header.hasCell(selectedCells[0]))
                grid = this.context.table.header;
            this.removeRowAt(grid, loc[0], loc[2]);
            this.context.selectCtrl.selectCells([]);
        }
    },
    removeCol: {
        available: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return false;
            var loc = locOfCells(selectedCells);
            var grid = this.context.table.body;
            if (this.context.table.header.hasCell(selectedCells[0]))
                grid = this.context.table.header;
            var size = grid.getSize();

            return loc[3] < size.width;
        },
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return;
            var loc = locOfCells(selectedCells);
            // var grid = this.context.table.body;
            // if (this.context.table.header.hasCell(selectedCells[0]))
            //     grid = this.context.table.header;
            this.removeColAt(loc[1], loc[3]);
            this.context.selectCtrl.selectCells([]);
        }
    },
    merge: {
        checked: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (selectedCells.length !== 1) return false;
            var loc = locOfCells(selectedCells);
            return loc[2] > 1 || loc[3] > 1;
        },
        available: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return false;
            var loc = locOfCells(selectedCells);
            return loc[2] > 1 || loc[3] > 1;
        },
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return false;
            var loc = locOfCells(selectedCells);
            var grid = this.context.table.body;
            if (this.context.table.header.hasCell(selectedCells[0]))
                grid = this.context.table.header;
            var isMerged = selectedCells.length === 1 && (loc[2] > 1 || loc[3] > 1);
            if (isMerged) this.splitCell(grid, selectedCells[0])
            else this.mergeCells(grid, selectedCells);
            selectedCells = grid.getCellsFromLoc(loc);
            this.context.selectCtrl.selectCells(selectedCells);
        }
    },
    edit_variable: {
        /**
         * @this CDGFormatTool
         */
        available: function () {
            var fv = this.context.varMng && this.context.varMng.focusVariable;
            return !!(fv && fv.isDescendantOf(this.elt));
        },
        /**
         * @this CDGFormatTool
         */
        exec: function () {
            this.context.varMng.openEditVariableDialog();
        }
    }
};


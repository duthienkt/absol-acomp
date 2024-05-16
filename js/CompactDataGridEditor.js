import ACore, { _, $, $$ } from "../ACore";
import '../css/compactdatagrid.css';
import OOP from "absol/src/HTML5/OOP";
import FontColorButton from "./colorpicker/FontColorButton";
import { findMaxZIndex, isNaturalNumber, revokeResource } from "./utils";
import { isDomNode } from "absol/src/HTML5/Dom";
import Vec2 from "absol/src/Math/Vec2";
import Rectangle from "absol/src/Math/Rectangle";
import EventEmitter from "absol/src/HTML5/EventEmitter";


var EV_SELECTED_CELL_CHANGE = 'SELECTED_CELL_CHANGE'.toLowerCase();
var EV_CELL_DATA_CHANGE = 'change';

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
}

var varTitleOf = o => {
    var res = undefined;
    if (!o) res = undefined;
    else if (o.attr) {
        res = o.attr('data-title');
        if (typeof res !== "string") res = undefined;
    }
    else if (typeof o.title === "string") res = o.title;
    return res;
}


/**
 * @extends AElement
 * @constructor
 */
function CompactDataGridEditor() {
    /**
     *
     * @type {CDGContext}
     */
    var context = {
        elt: this, grid: null, formatTool: null, varMng: null, selectCtrl: null,
        lcEmitter: new EventEmitter()
    }
    context.grid = new CDGrid(context);
    context.selectCtrl = new CDSelectController(context);
    context.formatTool = new CDGFormatTool(context);
    context.varMng = new CDGVariableManager(context);
    OOP.drillProperty(this, context.grid, 'data');
    OOP.drillProperty(this, context.varMng, 'variables');
    context.lcEmitter.on(EV_CELL_DATA_CHANGE, () => {
        this.emit('change', { type: 'change', target: this }, this);
    })
}

/**
 * @typedef CDGContext
 * @property {CompactDataGridEditor} elt
 * @property {CDGrid} grid
 * @property {CDGVariableManager} varMng
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
        child: [
            {
                tag: 'table',
                class: 'as-cdg-table',
                child: {
                    tag: 'tbody',
                    child: []
                }
            }
        ]
    });
};

CompactDataGridEditor.prototype.revokeResource = function () {
    revokeResource(this.grid);
    revokeResource(this.varMng);
    this.grid = undefined;
    this.varMng = undefined;
};


ACore.install(CompactDataGridEditor);
export default CompactDataGridEditor;


/**
 *
 * @param  context
 * @constructor
 */
function CDGrid(context) {
    this.context = context;
    /**
     * @type {CompactDataGridEditor}
     */
    this.elt = context.elt;
    this.$body = $('tbody', this.elt);
}


CDGrid.prototype.makeCell = function (data) {
    var variables = data.variables || [];
    var attr = {};
    if (isNaturalNumber(data.rowspan) && data.rowspan > 1) attr.rowspan = data.rowspan;
    if (isNaturalNumber(data.colspan) && data.colspan > 1) attr.colspan = data.colspan;
    return _({
        tag: 'td',
        attr: attr,
        class: 'as-ca-cell',
        child: variables.map(it => {
            var name = varNameOf(it);
            this.context.varMng.onVariable(it);
            return this.context.varMng.pickVariable(name)
        })
    })
};

CDGrid.prototype.makeRow = function (data) {
    var cells = data.cells || [];
    return _({
        tag: 'tr',
        class: 'as-ca-row',
        child: cells.map(it => this.makeCell(it))
    });
};


CDGrid.prototype.updateCellLoc = function () {
    var row, cell;
    var body = this.$body;
    var height = Array(100).fill(0);
    var jj, loc;
    for (var i = 0; i < body.childNodes.length; ++i) {
        row = body.childNodes[i];
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
    height = [];
    this.$body.attr('data-width', nCol);
    return nCol;
};

CDGrid.prototype.getSize = function () {
    return {
        width: parseInt(this.$body.attr('data-width'), 10),
        height: this.$body.childNodes.length
    }
}

CDGrid.prototype.fixRowLength = function (rowLength) {
    rowLength = rowLength || 1;
    var row, cell;
    var body = this.$body;
    var height = Array(100).fill(0);
    var jj, colspan, rowspan;
    for (var i = 0; i < body.childNodes.length; ++i) {
        row = body.childNodes[i];
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
    height = [];
};


CDGrid.prototype.getCellsFromLoc = function (loc) {
    var row, cell, cellLoc;
    var res = [];
    var body = this.$body;
    for (var i = 0; i < body.childNodes.length; ++i) {
        row = body.childNodes[i];
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
    var body = this.$body;

    var loc;
    if (body.firstChild && body.firstChild.lastChild)
        loc = locOfCell(body.firstChild.lastChild);
    else loc = [0, 0, 1, 1];
    var rowLength = loc[1] + loc[3];

    for (var i = 0; i < body.childNodes.length; ++i) {
        if (i === newRowIdx) {
            row = this.makeRow({ cell: [] });
            body.addChildBefore(row, body.childNodes[i]);
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
        row = body.childNodes[i];
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

    if (newRowIdx === body.childNodes.length) {
        row = this.makeRow({ cell: [] })
        body.addChild(row);
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
    var body = this.$body;
    var colspan, rowspan;
    for (var i = 0; i < body.childNodes.length; ++i) {
        row = body.childNodes[i];
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
    var body = this.$body;
    var row, cell;
    var loc;
    var rmLoc = [0, colIdx, 100, colWidth];
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
    var body = this.$body;

    if (body.firstChild && body.firstChild.lastChild)
        loc = locOfCell(body.firstChild.lastChild);
    else loc = [0, 0, 1, 1];
    var rowLength = loc[1] + loc[3];
    originalCell.attr('rowspan', undefined);
    originalCell.attr('colspan', undefined);
    var row, cell;
    var jj;
    for (var i = 0; i < body.childNodes.length; ++i) {
        row = body.childNodes[i];
        jj = 0;
        while (height[jj] > i) ++jj;
        for (var j = 0; j < row.childNodes.length; ++j) {
            cell = row.childNodes[j];
            loc = locOfCell(cell);
            while (jj < loc[1]) {
                row.addChildBefore(this.makeCell({}), cell);
                height[jj] = i + 1;
                ++jj;
                ++j;
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
        this.$body.clearChild();
        var rows = (value && value.rows) ||[];
        if (rows.length === 0) rows.push({
            cells:[{}]
        });
        this.$body.addChild(rows.map(it => this.makeRow(it)));
        var nCol = this.updateCellLoc();
        this.fixRowLength(nCol);
    },
    get: function () {
        var res = {};
        res.rows = Array.prototype.map.call(this.$body.childNodes, (rowElt) => {
            var rowData = {};
            rowData.cells = Array.prototype.map.call(rowElt.childNodes, cellElt => {
                var cellData = {};
                var variables = $$('.as-cag-var', cellElt).map(varElt => {
                    var vData = {};
                    var name = varElt.attr('data-name');
                    if (!name) return null;
                    vData.name = name;
                    var title = varElt.attr('data-title');
                    if (typeof title === "string") vData.title = title;
                    return vData;
                }).filter(x => !!x);
                if (variables.length > 0) cellData.variables = variables;
                var loc = locOfCell(cellElt);
                if (loc[2] > 1) cellData.rowspan = loc[2];
                if (loc[3] > 1) cellData.colspan = loc[3];
                return cellData;
            });
            return rowData;
        })
        return res;
    }
});

/**
 *
 * @param {CDGContext} context
 * @constructor
 */
function CDSelectController(context) {
    this.context = context;
    this.elt = context.elt;
    this.lcEmitter = context.lcEmitter;
    Object.keys(this.constructor.prototype).filter(k => k.startsWith('ev_'))
        .forEach(key => this[key] = this[key].bind(this));
    this.selectedCells = [];

    _({
        tag: 'hanger',
        elt: this.context.grid.$body,
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
    var body = this.context.grid.$body;
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
    this.hoveringCells = this.context.grid.getCellsFromLoc(selectedLoc);
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
    this.lcEmitter.emit(EV_SELECTED_CELL_CHANGE);
};


/**
 *
 * @param  context
 * @constructor
 */
function CDGVariableManager(context) {
    this.context = context;
    this.elt = context.elt;
    this.lcEmitter = context.lcEmitter;
    /**
     *
     * @type {CDGrid}
     */
    this.grid = context.grid;
    this.createView();
    this.pickedVariables = {};
    this.availableVariables = {};
    Object.keys(this.constructor.prototype).filter(k => k.startsWith('ev_'))
        .forEach(key => this[key] = this[key].bind(this));
}


CDGVariableManager.revokeResource = function () {
    this.elt = undefined;
    this.grid = undefined;
};

CDGVariableManager.prototype.createView = function () {
    this.$varMng = _({
        class: 'as-cag-var-mng',
        child: []
    });
    this.elt.addChildAfter(this.$varMng, this.context.formatTool.$tool);
};


CDGVariableManager.prototype.onVariable = function (data) {
    var name = varNameOf(data);
    var elt = this.availableVariables[name] || this.pickedVariables[name];
    var title;
    if (elt) {
        title = varTitleOf(data);
        if (typeof title === "string") elt.attr('data-title', title);
    }
    else {
        this.availableVariables[name] = this.makeVariable(data);
        this.$varMng.addChild(this.availableVariables[name]);
    }
};

CDGVariableManager.prototype.makeVariable = function (data) {
    var name;
    if (typeof data === "string") {
        name = data;
    }
    else if (typeof data.name === "string") {
        name = data.name;
    }
    if (!name) {
        throw new Error('CompactDataGridEditor: Invalid name in ' + JSON.stringify(data));
    }

    var elt = _({
        tag: 'hanger',
        class: 'as-cag-var',
        attr: {
            'data-name': name,
        },
        child: [
            // { tag: 'span', child: { text: name } }
        ],
        on: {
            dragstart: this.ev_dragStart,
            dragend: this.ev_dragEnd,
            drag: this.ev_drag
        }
    });

    if (typeof data.title === "string") {
        elt.attr('data-title', data.title);
    }

    return elt;
};


CDGVariableManager.prototype.pickVariable = function (name) {
    if (this.availableVariables[name]) {
        this.pickedVariables[name] = this.availableVariables[name];
        delete this.availableVariables[name];
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
    var cells = $$('.as-ca-cell', this.grid.$body);
    var best = 0;
    var cellRect;
    var bestCell;
    var square;
    for (var i = 0; i < cells.length; ++i) {
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

    return res;
};

CDGVariableManager.prototype.ev_dragStart = function (event) {
    var varElt = this.variableElementOf(event.target);
    var eltBound = varElt.getBoundingClientRect();
    var offset = event.currentPoint.sub(new Vec2(eltBound.left, eltBound.top));
    this.draggingElt = varElt;
    this.dragOffset = offset;
    this.clonedElt = $(varElt.cloneNode(true)).addStyle({
        position: 'fixed',
        zIndex: findMaxZIndex(varElt) + 2,
        left: eltBound.left + 'px',
        top: eltBound.top + 'px'
    }).addTo(document.body);
    varElt.addStyle('opacity', 0.5);
};

CDGVariableManager.prototype.ev_drag = function (event) {
    var newPos = event.currentPoint.sub(this.dragOffset);
    this.clonedElt.addStyle({
        left: newPos.x + 'px',
        top: newPos.y + 'px'
    });
    this.newLocation = this.findVariableLocation(Rectangle.fromClientRect(this.clonedElt.getBoundingClientRect()));
};

CDGVariableManager.prototype.ev_dragEnd = function () {
    this.draggingElt.removeStyle('opacity');
    this.clonedElt.remove();

    var name = this.draggingElt.attr('data-name');
    var newLocation = this.newLocation;
    if (newLocation && newLocation.in) {
        if (this.draggingElt.parentElement !== this.newLocation.in) {
            this.newLocation.in.addChild(this.draggingElt);
            this.pickVariable(name);
            this.context.selectCtrl.selectCells([this.newLocation.in]);
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


Object.defineProperty(CDGVariableManager.prototype, 'variables', {
    set: function (variables) {
        variables = variables || [];
        this.availableVariables = {};
        this.$varMng.clearChild();
        for (var i = 0; i < variables.length; ++i) {
            this.onVariable(variables[i]);
        }
    },
    get: function () {
        //todo
    }
});


/**
 *
 * @param {CDGContext} context
 * @constructor
 */
function CDGFormatTool(context) {
    this.context = context;
    this.grid = context.grid;
    this.elt = context.elt;
    this.lcEmitter = context.lcEmitter;
    Object.keys(this.constructor.prototype).filter(k => k.startsWith('ev_')).forEach(k => this[k] = this[k].bind(this));
    this.$tool = _({
        class: 'as-table-of-text-input-tool',
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
            }
        ]
    });
    this.elt.addChildAfter(this.$tool, null);
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
    });
};

CDGFormatTool.prototype.addColAt = function (newColIdx) {
    this.grid.addColAt(newColIdx);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);

};


CDGFormatTool.prototype.addRowAt = function (newRowIdx) {//todo: wrong
    this.grid.addRowAt(newRowIdx);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
};


CDGFormatTool.prototype.removeRowAt = function (rowIdx, rowHeight) {
    this.grid.removeRowAt(rowIdx, rowHeight);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);

};


CDGFormatTool.prototype.removeColAt = function (rowIdx, colWidth) {
    this.grid.removeColAt(rowIdx, colWidth);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
};

CDGFormatTool.prototype.mergeCells = function (cells) {
    this.grid.mergeCells(cells);
    this.lcEmitter.emit(EV_CELL_DATA_CHANGE);
};

CDGFormatTool.prototype.splitCell = function (originalCell) {
    this.grid.splitCell(originalCell);
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
            this.addRowAt(newRowIdx);
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
            this.addRowAt(newRowIdx);

        }
    },
    removeRow: {
        available: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return false;
            var loc = locOfCells(selectedCells);
            var size = this.context.grid.getSize();
            return loc[2] < size.height;

        },
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return;
            var loc = locOfCells(selectedCells);
            this.removeRowAt(loc[0], loc[2]);
            this.context.selectCtrl.selectCells([]);
        }
    },
    removeCol: {
        available: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return false;
            var loc = locOfCells(selectedCells);
            var size = this.context.grid.getSize();
            return loc[3] < size.width;
        },
        exec: function () {
            var selectedCells = this.context.selectCtrl.selectedCells;
            if (!selectedCells.length) return;
            var loc = locOfCells(selectedCells);
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
            var isMerged = selectedCells.length === 1 && (loc[2] > 1 || loc[3] > 1);
            if (isMerged) this.splitCell(selectedCells[0])
            else this.mergeCells(selectedCells);
            selectedCells = this.context.grid.getCellsFromLoc(loc);
            this.context.selectCtrl.selectCells(selectedCells);
        }
    }
};



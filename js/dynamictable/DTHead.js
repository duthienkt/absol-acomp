import DTHeadRow from "./DTHeadRow";
import { $$, _, $ } from "../../ACore";

/***
 *
 * @param {DTTable} table
 * @param {} data
 * @constructor
 */
function DTHead(table, data) {
    if (!data) data = {};
    if (!data.rows) data.rows = [];
    this.table = table;
    this._elt = null;
    this._copyElt = null;
    this._fixedXYElt = null;
    this._fixedXElt = null;
    this.data = data;
    this.rows = this.data.rows.map((rowData) => new DTHeadRow(this, rowData));
    this.makeCellIdx();
}

DTHead.prototype.makeCellIdx = function () {
    var height = Array(200).fill(0);
    var i, j, k, row, cells, colIdx, cell, colspan, rowspan;
    for (i = 0; i < this.rows.length; ++i) {
        row = this.rows[i];
        cells = row.cells;
        colIdx = 0;
        for (j = 0; j < cells.length; ++j) {
            while (height[colIdx] > i) ++colIdx;
            cell = cells[j];
            cell.idx = colIdx;
            colspan = cell.colspan;
            rowspan = cell.rowspan;
            if (rowspan === this.rows.length) {
                cell.elt.addClass('as-matched-head-height');
            }
            for (k = 0; k < colspan; ++k) {
                height[colIdx] = i + rowspan;
                ++colIdx;
            }
        }
    }
};

DTHead.prototype.getStructSelection = function () {
    var stDepth = this.table.wrapper.headerSturctSelectionDepth;
    if (!stDepth || stDepth < 1) stDepth = Infinity;
    stDepth = Math.floor(stDepth);
    if (stDepth < 1) stDepth = Infinity;
    var res = [];
    var rRows = this.rows.map(r => {
        return r.cells.map(cell => {
            if (!this.elt.contains(cell.elt)) return null;
            if ((cell.elt.attr('class') || '').indexOf('-copy-elt') >= 0) return null;
            var rCell = {
                rowspan: cell.rowspan,
                colspan: cell.colspan,
            };
            var clnElt = cell.elt.cloneNode(true);
            var removeElts = clnElt.querySelectorAll('.material-icons');
            Array.prototype.forEach.call(removeElts, function (elt) {
                elt.remove();
            });
            var text = clnElt.innerText;
            text = text.trim().replace(/\n/, ' ');
            rCell.text = text;
            rCell.value = cell.autoId;
            return rCell;
        }).filter(r => !!r);
    });
    var height = Array(200).fill(0);
    var i, j, k, row, cells, colIdx, cell, colspan, rowspan;
    var n = Math.min(rRows.length, stDepth);
    for (i = 0; i < n; ++i) {
        row = rRows[i];
        cells = row;
        colIdx = 0;
        for (j = 0; j < cells.length; ++j) {
            while (height[colIdx] > i) ++colIdx;
            cell = cells[j];
            cell.colIdx = colIdx;
            colspan = cell.colspan;
            rowspan = cell.rowspan;
            for (k = 0; k < colspan; ++k) {
                height[colIdx] = i + rowspan;
                ++colIdx;
            }
        }
    }
    var tailDict = {};
    var parent;
    for (i = 0; i < n; ++i) {
        row = rRows[i];
        cells = row;
        for (j = 0; j < cells.length; ++j) {
            cell = cells[j];
            parent = tailDict[cell.colIdx];
            if (parent) {
                parent.items = parent.items || [];
                parent.items.push(cell);
            }
            else {
                res.push(cell);
            }
            for (k = 0; k < cell.colspan; ++k) {
                tailDict[cell.colIdx + k] = cell;
            }
        }
    }

    var minifyTree = nd => {
        if (nd.items) {
            nd.items = nd.items.map(minifyTree);
            if (nd.items.length === 1) {
                if (nd.items[0].text) {
                    if (nd.text) {
                        nd.text = nd.text + ' - ' + nd.items[0].text;
                    }
                    else {
                        nd.text = nd.items[0].text;
                    }
                }
                delete nd.items;
            }
        }
        return nd;
    };

    res = res.map(minifyTree);
    return res;
};

DTHead.prototype.lockWidth = function () {
    this.rows.forEach(r => r.lockWidth());
};

DTHead.prototype.updateCopyEltSize = function () {
    if (!this._copyElt) return;
    this.rows.forEach(r => r.updateCopyEltSize());
};

Object.defineProperty(DTHead.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        this._elt = _({
            tag: 'thead',
            class: 'as-dt-header',
            child: this.rows.map(r => r.elt)
        });
        if (this.data.style) this._elt.addStyle(this.data.style);
        return this._elt;
    }
});


Object.defineProperty(DTHead.prototype, 'copyElt', {
    get: function () {
        if (this._copyElt) return this._copyElt;
        this._copyElt = _({
            elt: this.elt.cloneNode(false),
            child: this.rows.map(r => r.copyElt)
        });

        return this._copyElt;
    }
});


Object.defineProperty(DTHead.prototype, 'fixedXYElt', {
    get: function () {
        if (this._fixedXYElt) return this._fixedXYElt;

        this._fixedXYElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-xy',
            child: this.rows.map(r => r.fixedXYElt)
        });

        return this._fixedXYElt;
    }
});


Object.defineProperty(DTHead.prototype, 'fixedXYRightElt', {
    get: function () {
        if (this._fixedXYRightElt) return this._fixedXYRightElt;
        this._fixedXYRightElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-xy-right',
            child: this.rows.map(r => r.fixedXYRightElt)
        });
        return this._fixedXYRightElt;
    }
});


Object.defineProperty(DTHead.prototype, 'fixedXElt', {
    get: function () {
        if (this._fixedXElt) return this._fixedXElt;
        this._fixedXElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-x',
            child: this.rows.map(r => r.fixedXElt)
        });

        return this._fixedXElt;
    }
});


Object.defineProperty(DTHead.prototype, 'fixedXRightElt', {
    get: function () {
        if (this._fixedXRightElt) return this._fixedXRightElt;
        this._fixedXRightElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-x-right',
            child: this.rows.map(r => r.fixedXRightElt)
        });
        return this._fixedXRightElt;
    }
});


Object.defineProperty(DTHead.prototype, 'adapter', {
    get: function () {
        return this.table.wrapper.adapter;
    }
});

export default DTHead;
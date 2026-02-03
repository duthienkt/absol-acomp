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
            if (rowspan ===this.rows.length) {
                cell.elt.addClass('as-matched-head-height');
            }
            for (k = 0; k < colspan; ++k) {
                height[colIdx] = i + rowspan;
                ++colIdx;
            }
        }
    }
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
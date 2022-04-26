import DTBodyRow from "./DTBodyRow";
import prepareSearchForItem, { searchListByText } from "../list/search";
import DTRowDragController from "./DTRowDragController";
import { isNaturalNumber, isRealNumber } from "../utils";


/***
 *
 * @param {DTBody} body
 * @constructor
 */
function SearchingMode(body) {
    this.body = body;
    this.offset = 0;
}

SearchingMode.prototype.start = function () {
    this.body.table.elt.addClass('as-searching');
    this.body.requireRows();
    this.searchingCache = {};
    var rows = this.body.rows;
    this.searchingItems = rows.map(function (row, i) {
        return prepareSearchForItem({
            text: row.innerText,
            value: i
        })
    }.bind(this));
};


SearchingMode.prototype.end = function () {
    this.body.table.elt.removeClass('as-searching');
    this.searchingItems = null;
};

SearchingMode.prototype.selectPage = function (pageIdx) {
    var newOffset = pageIdx * this.body.table.adapter.rowsPerPage;
    if (this.offset === newOffset) return;
    this.offset = newOffset;
    this.render();
};

SearchingMode.prototype.render = function () {
    var start = this.offset;
    var end = Math.min(start + this.body.table.adapter.rowsPerPage, this.resultItems.length);
    var elt = this.body.elt;
    elt.clearChild();
    var rows = this.body.rows
    for (var i = start; i < end; ++i) {
        elt.addChild(rows[this.resultItems[i].value].elt);
    }
};

SearchingMode.prototype.onRowSplice = function (idx) {

};

SearchingMode.prototype.viewIntoRow = function (row) {

};

SearchingMode.prototype.searchFor = function (query) {
    this.searchingCache[query] = this.searchingCache[query] || searchListByText(query, this.searchingItems);
    this.resultItems = this.searchingCache[query];
    this.offset = 0;
    var pageCount = Math.max(Math.ceil(this.resultItems.length / this.body.table.adapter.rowsPerPage), 1);
    this.body.table.elt.$pageSelector.pageCount = pageCount;
    this.body.table.elt.$pageSelector.pageRange = Math.min(pageCount, 5);

    this.body.table.elt.$pageSelector.pageOffset = 1;
    this.body.table.elt.$pageSelector.selectedIndex = 1;
};

/***
 *
 * @param {DTBody} body
 * @constructor
 */
function NormalMode(body) {
    this.body = body;
    this.offset = 0;
}

NormalMode.prototype.start = function () {
    if (isNaturalNumber(this.body.table.adapter.rowsPerPage)) {
        this.body.table.elt.removeClass('as-no-paging');
    }
    else {
        this.body.table.elt.addClass('as-no-paging');
    }

    var pageCount = Math.max(1, Math.ceil(this.body.rows.length / this.body.table.adapter.rowsPerPage));
    this.body.table.elt.$pageSelector.pageCount = pageCount;
    this.body.table.elt.$pageSelector.pageRange = Math.min(pageCount, 5);
    this.body.table.elt.$pageSelector.pageOffset = this.offset + 1;
    this.body.table.elt.$pageSelector.selectedIndex = this.offset + 1;
    this.render();
};

NormalMode.prototype.end = function () {

};

NormalMode.prototype.selectPage = function (pageIdx) {
    var newOffset = pageIdx * this.body.table.adapter.rowsPerPage;
    if (this.offset === newOffset) return;
    this.offset = newOffset;
    this.render();
};

NormalMode.prototype.render = function () {
    var start = this.offset;
    var rowsPerPage = this.body.table.adapter.rowsPerPage;
    var data = this.body.data;
    var elt = this.body.elt;
    var end = Math.min(start + rowsPerPage, data.rows.length);
    this.body.requireRows(start, end);
    var rows = this.body.rows;
    elt.clearChild();
    for (var i = start; i < end; ++i) {
        elt.addChild(rows[i].elt);
    }
};


NormalMode.prototype.onRowSplice = function (idx) {
    var rowsPerPage = this.body.table.adapter.rowsPerPage;
    if (!isNaturalNumber(rowsPerPage)) rowsPerPage = Infinity;
    if (this.offset <= idx && this.offset + rowsPerPage > idx) this.render();

    var pageCount;
    if (rowsPerPage !== Infinity) {
        pageCount = Math.max(1, Math.ceil(this.body.rows.length / this.body.table.adapter.rowsPerPage));
        if (this.body.table.elt.$pageSelector.pageCount !== pageCount) {
            this.body.table.elt.$pageSelector.pageCount = pageCount;
            if (this.body.table.elt.$pageSelector.selectedIndex + 1 >= pageCount) {
                this.body.table.elt.$pageSelector.selectPage(Math.min(this.body.table.elt.$pageSelector.selectedIndex, pageCount), false);//to show last page
            }
        }
    }
};


NormalMode.prototype.viewIntoRow = function (row) {
    if (!isNaturalNumber(this.body.table.adapter.rowsPerPage)) return;
    var idx = this.body.rowIndexOf(row);
    if (idx <= 0) return;
    var pageIdx = Math.floor(idx / this.body.table.adapter.rowsPerPage);
    if (this.body.table.elt.$pageSelector.selectedIndex !== pageIdx + 1) {
        this.body.table.elt.$pageSelector.selectedIndex = pageIdx + 1;
    }
};

/***
 *
 * @param {DTTable} table
 * @param data
 * @constructor
 */
function DTBody(table, data) {
    this.table = table;
    /***
     *
     * @type {AElement}
     */
    this.elt = this.table.elt.$tbody;
    this.data = data;

    this.rows = Array(this.data.rows.length).fill(null);
    this.rowDragCtrl = new DTRowDragController(this);

    this.modes = {
        normal: new NormalMode(this),
        searching: new SearchingMode(this)
    };

    this._offset = 0;


    this.curentMode = this.modes.normal;
    this.curentMode.start();
    this.curentMode.render();


    /***
     * @name offset
     * @type {number}
     * @memberOf DTBody#
     */
}

DTBody.prototype.requireRows = function (start, end) {
    if (typeof start !== "number") start = 0;
    if (typeof end !== "number") end = Infinity;
    end = Math.min(end, this.data.rows.length);
    for (var i = start; i < end; ++i) {
        if (!this.rows[i])
            this.rows[i] = new DTBodyRow(this, this.data.rows[i]);
    }
    return this.rows.slice(start, end);
};

DTBody.prototype.onRowSplice = function (idx) {
    this.curentMode.onRowSplice(idx);
}

DTBody.prototype.rowIndexOf = function (o) {
    var n = this.rows.length;
    for (var i = 0; i < n; ++i) {
        if (o === this.rows[i]) return i;
        if (o === this.data.rows[i]) return i;
        if (o === this.data.rows[i].id) return i;
    }
    return -1;
};

DTBody.prototype.addRowBefore = function (rowData, bf) {
    var idx;
    if (bf === null || bf === undefined) {
        return this.addRow(rowData);
    }
    else {
        idx = this.rowIndexOf(bf);
        if (idx < 0) throw new Error("$bf not is a row in table");
        return this.addRow(rowData, idx);
    }
};

DTBody.prototype.addRowAfter = function (rowData, at) {
    var idx;
    if (at === null || at === undefined) {
        return this.addRow(rowData, 0);
    }
    else {
        idx = this.rowIndexOf(at);
        if (idx < 0) throw new Error("$bf not is a row in table");
        return this.addRow(rowData, idx + 1);
    }
};

DTBody.prototype.addRow = function (rowData, idx) {
    if (!isNaturalNumber(idx) || idx >= this.rows.length) {
        idx = this.rows.length;
    }
    var res;
    if (idx >= this.rows.length) {
        this.data.rows.push(rowData);
        res = new DTBodyRow(this, rowData)
        this.rows.push(res);
        this.onRowSplice(this.rows.length - 1);
    }
    else {
        res = new DTBodyRow(this, rowData);
        this.rows.splice(idx, 0, res);
        this.data.rows.splice(idx, 0, rowData);
        this.onRowSplice(idx);
    }

    return res;
};

DTBody.prototype.removeRow = function (row) {
    var idx = this.rowIndexOf(row);
    if (idx < 0) return;
    this.rows.splice(idx, 1);
    this.data.rows.splice(idx, 1);
    this.onRowSplice(idx);
};

DTBody.prototype.rowAt = function (idx) {
    if (this.rows[idx]) return this.rows[idx];
    var rowData = this.data.rows[idx];
    if (rowData) {
        this.rows[idx] = new DTBodyRow(this, rowData);
    }
    else return null;
};

DTBody.prototype.viewIntoRow = function (row) {
    return this.curentMode.viewIntoRow(row);
};

DTBody.prototype.selectPage = function (pageIdx, userAction) {
    this.curentMode.selectPage(pageIdx);

};


DTBody.prototype.searchFor = function (query) {
    var now = new Date().getTime();
    if (!this._searchQuery && query) {
        this.curentMode.end();
        this.curentMode = this.modes.searching;
        this.curentMode.start();
    }
    else if (this._searchQuery && !query) {
        this.curentMode.end();
        this.curentMode = this.modes.normal;
        this.curentMode.start();
    }
    this._searchQuery = query;
    if (this.curentMode.searchFor) {
        this.curentMode.searchFor(query);
    }
    this.curentMode.render();

};


Object.defineProperties(DTBody.prototype, {
    rowsPerPage: {
        get: function () {
            return this.table.adapter.rowsPerPage;
        }
    },
    offset: {
        set: function (value) {
            this._offset = value;
            this.renderCurrentOffset();
        },
        get: function () {
            return this._offset;
        }
    },
    searching: {
        get: function () {
            return this.elt.hasClass('as-searching');
        }
    }
});


export default DTBody;
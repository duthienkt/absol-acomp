import DTBodyRow from "./DTBodyRow";
import DTRowDragController from "./DTRowDragController";
import {isNaturalNumber, isRealNumber, calcDTQueryHash} from "../utils";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import Thread from "absol/src/Network/Thread";
import DTSearchFactor from "./DTSearchFactor";
import {randomIdent} from "absol/src/String/stringGenerate";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

/***
 *
 * @param {DTBody} body
 * @constructor
 */
function SearchingMaster(body) {
    this.body = body;
    this.mode = body.modes.searching;
    this.waitingCtrl = body.table.elt.waitingCtl;
    this.initWorker();
    this.id = randomIdent(10);
    this.transferSession = Math.random() + '';
    this.transferred = 0;
    this.isTranferring = false;
    this.share.instances[this.id] = this;

    this.itemVersion = 0;
    this.outputCache = {};
    this.lastTaskIdx = 0;
}

SearchingMaster.prototype.destroy = function () {
    this.share.thread.invoke('destroySlave', this.id);
    this.share.instances[this.id] = null;
    this.transferSession = "DIE";
    delete this.share.instances[this.id];
};

SearchingMaster.prototype.transferFrom = function (offset) {
    if (this.transferSession === "DIE") {
        return;
    }
    this.outputCache = {};

    if (offset < this.transferred) {
        this.transferred = offset;
        this.itemVersion++;
    }

    if (this.isTranferring) return;
    var waitingCtrl = this.waitingCtrl;
    var wTkn = waitingCtrl.begin();
    var self = this;
    var transferSession = Math.random() + '';
    self.transferSession = transferSession;
    self.isTranferring = true;
    setTimeout(function tick() {
        if (self.transferSession !== transferSession) {
            waitingCtrl.end(wTkn);
            return;
        }
        var i = self.transferred;
        var rows = self.body.rows;
        var n = self.body.rows.length;
        if (i >= n) {
            if (n === 0){
                self.share.thread.invoke('transferSearchItems', self.id, n, 0, 0, [], self.itemVersion);
            }
            self.isTranferring = false;
            self.onFinishTransfer();
            waitingCtrl.end(wTkn);
            return;
        }
        self.share.benchmark = self.share.benchmark || BrowserDetector.calcBenchmark();
        var k = self.share.benchmark >> 2;
        var items = [];
        var item;
        var start = i;
        while (i < n && k--) {
            item = {
                text: rows[i].innerText,
                value: i,
                keys: rows[i].data.keys
            };
            items.push(item);
            ++i;
        }
        var sync = self.share.thread.invoke('transferSearchItems', self.id, n, start, i, items, self.itemVersion);
        self.transferred = i;
        Promise.all([sync, new Promise(function (rs) {
            setTimeout(rs, 5);
        })]).then(tick);
    }, 5);
};


SearchingMaster.prototype.onFinishTransfer = function () {
    // console.log('finish');
};

SearchingMaster.prototype.sendTask = function (query) {
    if (this.transferSession === "DIE") {
        return;
    }
    this.lastTaskIdx++;
    var taskData = {
        idx: this.lastTaskIdx,
        query: query,
        hash: calcDTQueryHash(query)
    };
    if (this.outputCache[taskData.hash]) {
        setTimeout(this.onResult.bind(this, this.outputCache[taskData.hash], true), 5);
    }
    else {
        this.share.thread.invoke('transferTask', this.id, taskData);
    }
    return taskData;
};


SearchingMaster.prototype.onResult = function (response, dontCache) {
    if (this.itemVersion !== response.itemVersion) return;
    if (!dontCache) {
        this.outputCache[response.hash] = response;
    }
    this.body.modes.searching.onResult(response);
};

SearchingMaster.prototype.share = {
    thread: null,
    benchmark: 0,
    instances: {}
};

SearchingMaster.prototype.initWorker = function () {
    if (!this.share.thread) {
        this.share.thread = new Thread({
            methods: {
                init: DTSearchFactor,
                calcBenchmark: BrowserDetector.calcBenchmark
            },
            extendCode: 'init(this);'
        });

        this.share.thread.on('alert', function (mess) {
            alert(mess);
        });

        this.share.thread.on('searchEnd', function (id, response) {
            this.share.instances[id] && this.share.instances[id].onResult(response);
        }.bind(this));
        setTimeout(function () {
            this.share.benchmark = this.share.benchmark || BrowserDetector.calcBenchmark();
        }.bind(this));
    }
};


/***
 *
 * @param {DTBody} body
 * @constructor
 */
function SearchingMode(body) {
    this.status = 'STANDBY';
    this.body = body;
    this.offset = 0;

    this.waitingToken = 'none';
    this.waitingCtrl = body.table.elt.waitingCtl;

    this.taskHash = 0;
    this.renderingHash = -1;
    this.resultItems = [];
}

SearchingMode.prototype.start = function () {
    this.status = "RUNNING";
    this.searchingCache = {};
    this.body.table.elt.addClass('as-searching');
    this.renderingHash = -1;
};


SearchingMode.prototype.end = function () {
    this.body.table.elt.removeClass('as-searching');
    this.searchingItems = null;
    this.status = "STOP";
    this.waitingCtrl.end(this.waitingToken);
    this.body.master.sendTask(null);

};

SearchingMode.prototype.selectPage = function (pageIdx) {
    if (this.renderingHash === -1) {
        this.body.modes.normal.selectPage(pageIdx);
        return;
    }
    var newOffset = pageIdx * this.body.table.adapter.rowsPerPage;
    if (this.offset === newOffset) return;
    this.offset = newOffset;
    this.render();
};

SearchingMode.prototype.render = function () {
    var start = this.offset;
    var end = Math.min(start + this.body.table.adapter.rowsPerPage, this.resultItems.length);
    var elt = this.body.elt;
    var cChildren = Array.prototype.slice.call(elt.childNodes);
    var nChildren = [];
    var rows = this.body.rows;
    for (var i = start; i < end; ++i) {
        nChildren.push(rows[this.resultItems[i]].elt);
    }
    var cC, nC;
    while (cChildren.length > 0 && nChildren.length > 0) {
        cC = cChildren[0];
        nC = nChildren[0];
        if (cC === nC) {
            cChildren.shift();
            nChildren.shift();
        }
        else {
            break;
        }
    }
    cChildren.forEach(function (elt) {
        elt.remove();
    });
    elt.addChild(nChildren);
};
SearchingMode.prototype.onRowSplice = function (idx) {
    this.render();
}

SearchingMode.prototype.onRowRemoved = function (idx, n) {
    n = n || 1;
    this.resultItems = this.resultItems.reduce(function (ac, cr) {
        if (cr >= idx + n) {
            ac.push(cr - n);
        }
        else if (cr < idx) {
            ac.push(cr);
        }
        return ac;
    }, []);
    this._updatePageSelector();
};

SearchingMode.prototype.onRowAdded = function (idx, n) {
    n = n || 1;
    this.resultItems = this.resultItems.reduce(function (ac, cr) {
        if (cr >= idx) {
            ac.push(cr + n);
        }
        else {
            ac.push(cr);
        }
        return ac;
    }, []);
};

SearchingMode.prototype.viewIntoRow = function (row) {

};

SearchingMode.prototype.query = function (query) {
    this.waitingCtrl.end(this.waitingToken);
    this.waitingToken = this.waitingCtrl.begin();
    var taskHolder = this.body.master.sendTask(query);
    this.taskHash = taskHolder.hash;
};

SearchingMode.prototype._updatePageSelector = function () {
    var pageCount = Math.max(1, Math.ceil(this.resultItems.length / this.body.table.adapter.rowsPerPage));
    if (this.offset >= pageCount * this.body.table.adapter.rowsPerPage) {
        this.offset = (pageCount - 1) * this.body.table.adapter.rowsPerPage;
    }
    this.body.table.elt.$pageSelector.pageCount = pageCount;
    this.body.table.elt.$pageSelector.pageRange = Math.min(pageCount, 5);
    this.body.table.elt.$pageSelector.selectedIndex = Math.floor(this.offset / this.body.table.adapter.rowsPerPage) + 1;
    var newPageOffset = this.body.table.elt.$pageSelector.selectedIndex;
    if (newPageOffset > 0) {
        newPageOffset--;
    }
    newPageOffset = Math.max(1, Math.min(pageCount - this.body.table.elt.$pageSelector.pageRange + 1, newPageOffset));
    this.body.table.elt.$pageSelector.pageOffset = newPageOffset;

};

SearchingMode.prototype.onResult = function (response) {
    if (this.status !== 'RUNNING' || response.hash !== this.taskHash) return;
    this.waitingCtrl.end(this.waitingToken);
    if (this.renderingHash !== response.hash) {
        this.renderingHash = response.hash;
        this.offset = 0;
    }
    this.resultItems = response.result;
    this._updatePageSelector();

    this.render();
};


SearchingMode.prototype.share = {
    thread: null
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
    this.body.table.elt.$pageSelector.selectedIndex = Math.floor(this.offset / this.body.table.adapter.rowsPerPage) + 1;
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
        if (Math.min(pageCount, 5) !== this.body.table.elt.$pageSelector.pageRange)
            this.body.table.elt.$pageSelector.pageRange = Math.min(pageCount, 5);

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

    this.rows = this.data.rows.map(function (rowData, i) {
        var row = new DTBodyRow(this, rowData);
        row.idx = i;
        return row;
    }.bind(this));
    this.rowDragCtrl = new DTRowDragController(this);

    this.modes = {
        normal: new NormalMode(this),
        searching: new SearchingMode(this)
    };


    this.curentMode = this.modes.normal;
    this.curentMode.start();
    this.curentMode.render();

    this.master = new SearchingMaster(this);

    this.master.transferFrom(0);
    /***
     * @name offset
     * @type {number}
     * @memberOf DTBody#
     */
}

DTBody.prototype.revokeResource = function () {
    this.master.destroy();
};

DTBody.prototype.requireRows = function (start, end) {
    if (typeof start !== "number") start = 0;
    if (typeof end !== "number") end = Infinity;
    end = Math.min(end, this.data.rows.length);
    return this.rows.slice(start, end);
};

DTBody.prototype.reindexRows = function (start, end) {
    if (typeof start !== "number") start = 0;
    if (typeof end !== "number") end = Infinity;
    end = Math.min(end, this.data.rows.length);
    for (var i = start; i < end; ++i) {
        if (this.rows[i])
            this.rows[i].idx = i;
    }
};

DTBody.prototype.onRowSplice = function (idx) {
    this.curentMode.onRowSplice(idx);
    this.master.transferFrom(idx);
    ResizeSystem.requestUpdateSignal();
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
    var row;
    if (idx >= this.rows.length) {
        idx = this.rows.length;
        this.data.rows.push(rowData);
        row = new DTBodyRow(this, rowData)
        row.idx = idx;
        this.rows.push(row);
        if (this.curentMode.onRowAdded)
            this.curentMode.onRowAdded(idx, 1);
        this.onRowSplice(this.rows.length - 1);
    }
    else {
        row = new DTBodyRow(this, rowData);
        row.idx = idx;
        this.rows.splice(idx, 0, row);
        this.data.rows.splice(idx, 0, rowData);
        this.reindexRows(idx + 1);
        this.onRowSplice(idx);
    }

    return row;
};

DTBody.prototype.addRows = function (rowsData, idx) {
    if (!isNaturalNumber(idx) || idx >= this.rows.length) {
        idx = this.rows.length;
    }
    var res = [];
    var row, i, rowData;
    if (idx >= this.rows.length) {
        idx = this.rows.length;
        for (i = 0; i < rowsData.length; ++i) {
            rowData = rowsData[i];
            row = new DTBodyRow(this, rowData);
            row.idx = i + idx;
            this.data.rows.push(rowData);
            res.push(row);
            this.rows.push(row);
        }
    }
    else {
        for (i = 0; i < rowsData.length; ++i) {
            rowData = rowsData[i];
            row = new DTBodyRow(this, rowData);
            row.idx = i + idx;
            res.push(row);
            this.data.rows.splice(idx + i, 0, rowData);
            this.rows.splice(idx + i, 0, row);
        }
        this.reindexRows(idx + rowsData.length);
    }
    if (this.curentMode.onRowAdded)
        this.curentMode.onRowAdded(idx, rowsData.length);
    this.onRowSplice(idx);
    return res;
};


DTBody.prototype.removeRow = function (row) {
    var idx = this.rowIndexOf(row);
    if (idx < 0) return;
    this.rows.splice(idx, 1);
    this.data.rows.splice(idx, 1);
    this.reindexRows(idx);
    if (this.curentMode.onRowRemoved)
        this.curentMode.onRowRemoved(idx);
    this.onRowSplice(idx);
};

DTBody.prototype.clearRows = function () {
    var n = this.rows.length;
    this.rows.splice(0);
    this.data.rows.splice(0);
    if (this.curentMode.onRowRemoved)
        this.curentMode.onRowRemoved(0, n);
    this.onRowSplice(0);
};


DTBody.prototype.rowAt = function (idx) {
    if (this.rows[idx]) return this.rows[idx];
    var rowData = this.data.rows[idx];
    if (rowData) {
        this.rows[idx] = new DTBodyRow(this, rowData);
        this.rows[idx].idx = idx;
    }
    else return null;
};


DTBody.prototype.rowOf = function (o) {
    var idx = this.rowIndexOf(o);
    return this.rowAt(idx);
};


DTBody.prototype.viewIntoRow = function (row) {
    return this.curentMode.viewIntoRow(row);
};

DTBody.prototype.selectPage = function (pageIdx, userAction) {
    this.curentMode.selectPage(pageIdx);

};

DTBody.prototype.startSearchingIfNeed = function () {
    if (this.curentMode !== this.modes.searching) {
        this.curentMode.end();
        this.curentMode = this.modes.searching;
        this.curentMode.start();
    }
};


DTBody.prototype.stopSearchIfNeed = function () {
    if (this.curentMode === this.modes.searching) {
        this.curentMode.end();
        this.curentMode = this.modes.normal;
        this.curentMode.start();
    }
};


DTBody.prototype.query = function (query) {
    var now = new Date().getTime();
    if (query) {
        this.startSearchingIfNeed();
    }
    else if (!query) {
        this.stopSearchIfNeed();
        this.curentMode.render();
    }
    if (this.curentMode.query && query) {
        this.curentMode.query(query);
    }
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
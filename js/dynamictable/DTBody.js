import DTBodyRow from "./DTBodyRow";
import { isNaturalNumber, isRealNumber, calcDTQueryHash, replaceChildrenInElt } from "../utils";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import Thread from "absol/src/Network/Thread";
import DTSearchFactor from "./DTSearchFactor";
import { randomIdent } from "absol/src/String/stringGenerate";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { $$, _, $ } from "../../ACore";
import Rectangle from "absol/src/Math/Rectangle";
import { getScreenSize } from "absol/src/HTML5/Dom";
import OOP from "absol/src/HTML5/OOP";

/***
 *
 * @param {DTBody} body
 * @constructor
 */
function SearchingMaster(body) {
    this.body = body;
    this.mode = body.modes.searching;
    this.waitingCtrl = body.table.wrapper.waitingCtl;
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
    this.outputCache = {};
    this.body = null;
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
            if (n === 0) {
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
                keys: rows[i].filterKeys
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
                calcBenchmark: BrowserDetector.calcBenchmark
            },
            extendCode: DTSearchFactor.exportCode()
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
 * @param {DTBody}  body
 * @constructor
 */
function BaseMode(body) {
    this.body = body;

    this.offset = 0;
    this.rowOffset = -1000;
    this.boundCache = null;
    this.viewedRows = null;
}

BaseMode.prototype.name = 'base';

NormalMode.prototype.revoke = function () {
    this.body = null;
};


BaseMode.prototype.resetViewParam = function () {
    this.offset = 0;
    this.rowOffset = -1000;
    this.boundCache = null;
    this.viewedRows = null;
};


BaseMode.prototype.getBoundOfRows = function () {
    if (this.boundCache) return this.boundCache;
    if (!this.body.table.wrapper.isDescendantOf(document.body)) return null;
    var bodyBound = this.body.elt.getBoundingClientRect();
    if (!bodyBound || bodyBound.width <= 0 || bodyBound.height <= 0) return null;
    var elt = this.body.elt;
    var childNodes = elt.childNodes;
    this.boundCache = Array.prototype.map.call(childNodes, elt => {
        var eBound = Rectangle.fromClientRect(elt.getBoundingClientRect());
        eBound.y -= bodyBound.top;
        return eBound;
    });
    this.boundCache.body = Rectangle.fromClientRect(bodyBound);
    this.boundCache.header = Rectangle.fromClientRect(this.body.table.header.elt.getBoundingClientRect());


    return this.boundCache;
};

BaseMode.prototype.updateRowsIfNeed = function () {
    throw Error("Not implement!");
};


BaseMode.prototype.render = function () {
    this.updateRowsIfNeed();
    var bounds = this.getBoundOfRows();
    if (!bounds) {
        setTimeout(() => {
            if (this.body.elt.isDescendantOf(document.body)) {
                this.render();
            }
        }, 5);
        return;
    }
    var dy = 0, rowIdx;
    if (bounds.length > 0) {
        rowIdx = Math.floor(this.offset - this.rowOffset);
        //todo: fix bounds[rowIdx] undefined
        if (!bounds[rowIdx]) return;
        dy = bounds[rowIdx].y + (this.offset - this.rowOffset - rowIdx) * bounds[rowIdx].height;
    }
    var availableHeight;
    if (bounds.length > 0) {
        availableHeight = this.body.table.wrapper.$viewport.getBoundingClientRect().height - bounds.header.height;
        if (bounds[bounds.length - 1].y + bounds[bounds.length - 1].height - dy < availableHeight - 1) {
            dy = -availableHeight + bounds[bounds.length - 1].y + bounds[bounds.length - 1].height + 1;//1: last border
        }
    }

    dy = Math.max(0, dy);

    //small padding top
    var hs = this.body.table.wrapper.$vscrollbar.innerOffset / ((this.body.table.wrapper.$vscrollbar.innerHeight - this.body.table.wrapper.$vscrollbar.outerHeight) || 1)
    dy += hs * 100;

    this.body.table.wrapper.$space.addStyle('top', -dy + 'px');
    this.body.table.wrapper.$fixedXCtn.addStyle('top', -dy + 'px');
};


/***
 * @extends BaseMode
 * @param {DTBody} body
 * @constructor
 */
function SearchingMode(body) {
    BaseMode.call(this, body);
    this.status = 'STANDBY';

    this.waitingToken = 'none';
    this.waitingCtrl = body.table.wrapper.waitingCtl;

    this.taskHash = 0;
    this.renderingHash = -1;
    this.resultItems = [];
    this.viewedRows = [];
}

OOP.mixClass(SearchingMode, BaseMode);

SearchingMode.prototype.name = 'search';

SearchingMode.prototype.revoke = function () {
    this.resultItems = [];
    this.viewedRows = [];
};

SearchingMode.prototype.start = function () {
    this.status = "RUNNING";
    this.searchingCache = {};
    this.body.table.wrapper.addClass('as-searching');
    this.renderingHash = -1;
};


SearchingMode.prototype.end = function () {
    this.body.table.wrapper.removeClass('as-searching');
    this.searchingItems = null;
    this.status = "STOP";
    this.waitingCtrl.end(this.waitingToken);
    if (this.body.master)
        this.body.master.sendTask(null);
};


SearchingMode.prototype.updateRowsIfNeed = function () {
    var screenSize = getScreenSize();
    var rowPerPage = Math.ceil(Math.ceil(screenSize.height / 40) / 25) * 25;
    if (this.body.table.wrapper.hasClass('as-adapt-infinity-grow')) rowPerPage = 1e7;

    var newRowOffset = Math.floor(this.offset / rowPerPage) * rowPerPage;
    if (this.resultItems.length - newRowOffset < rowPerPage) {
        newRowOffset = Math.max(0, newRowOffset - rowPerPage);
    }
    if (newRowOffset === this.rowOffset) return;
    this.rowOffset = newRowOffset;
    var start = this.rowOffset;
    var end = Math.min(start + rowPerPage * 2, this.resultItems.length);
    var elt = this.body.elt;
    var fixedXElt = this.body.fixedXElt;


    var rows = this.body.rows;
    var nRows = [];
    var i;
    for (i = start; i < end; ++i) {
        nRows.push(rows[this.resultItems[i]]);
    }
    var nChildren = nRows.map(r => r.elt);
    var nFixedXChildren = nRows.map(r => r.fixedXElt);
    replaceChildrenInElt(elt, nChildren);
    replaceChildrenInElt(fixedXElt, nFixedXChildren);
    this.boundCache = null;


    var bounds = this.getBoundOfRows();
    if (bounds) {
        for (i = 0; i < nRows.length; ++i) {
            nRows[i].updateCopyEltSize();
        }
        this.body.table.wrapper.layoutCtrl.onResize();
        this.body.table.updateCopyEltSize();

    }
    var updateFx = () => {
        if (counter > 20) return;
        if (this.body.elt.isDescendantOf(document.body)) {
            var bounds = this.getBoundOfRows();
            if (bounds) {
                for (var i = 0; i < nRows.length; ++i) {
                    nRows[i].updateCopyEltSize();
                }
                this.body.table.wrapper.layoutCtrl.onResize();
                this.body.table.updateCopyEltSize();
            }
            counter += 3;
            setTimeout(updateFx, (counter++) * 5);
        }
        else {
            setTimeout(updateFx, (counter++) * 5)
        }
    };
    var counter = 1;
    if (!bounds) {
        setTimeout(updateFx, 1);
    }
};


SearchingMode.prototype.onRowSplice = function (idx) {
    this.rowOffset = -1000;
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
    console.log(row);
};

SearchingMode.prototype.query = function (query) {
    this.waitingCtrl.end(this.waitingToken);
    this.waitingToken = this.waitingCtrl.begin();
    if (!this.body.master) {
        this.body.master = new SearchingMaster(this.body);
        this.body.master.transferFrom(0);
    }
    var taskHolder = this.body.master.sendTask(query);
    this.taskHash = taskHolder.hash;
};


SearchingMode.prototype.onResult = function (response) {
    if (this.status !== 'RUNNING' || response.hash !== this.taskHash) return;
    this.waitingCtrl.end(this.waitingToken);
    if (this.renderingHash !== response.hash) {
        this.renderingHash = response.hash;
        this.offset = 0;
        this.rowOffset = -1000;

    }

    var addedRows = [];
    var i;
    this.resultItems = [];
    var colCount = this.body.rows[0] ? this.body.rows[0].colCount : 0;
    var rowIdx;
    var result = response.result || [];
    var rows = this.body.rows;
    var startRow;
    var j;
    for (i = 0; i < result.length; ++i) {
        rowIdx = result[i];
        startRow = rowIdx;
        while (startRow > 0 && rows[startRow - 1] && rows[startRow].colCount < colCount) {
            --startRow;
        }
        rowIdx = startRow + rows[startRow].rowCount - 1;
        for (j = startRow; j <= rowIdx; ++j) {
            if (addedRows[j]) continue;
            addedRows[j] = true;
            this.resultItems.push(j);
        }
    }
    this.viewedRows = this.resultItems.map(rIdx => this.body.rows[rIdx]);

    this.render();
};


SearchingMode.prototype.share = {
    thread: null
};


/***
 * @extends BaseMode
 * @param {DTBody} body
 * @constructor
 */
function NormalMode(body) {
    BaseMode.call(this, body);
}

OOP.mixClass(NormalMode, BaseMode);

NormalMode.prototype.name = 'normal';

NormalMode.prototype.start = function () {
    this.resetViewParam();
    this.viewedRows = this.body.rows;

    this.render();
};

NormalMode.prototype.end = function () {

};


NormalMode.prototype.updateRowsIfNeed = function () {
    var screenSize = getScreenSize();
    var rowPerPage = Math.ceil(Math.ceil(screenSize.height / 40 + 1) / 100) * 100;
    if (this.body.table.wrapper.hasClass('as-adapt-infinity-grow')) rowPerPage = 1e7;
    var newRowOffset = Math.floor(this.offset / rowPerPage) * rowPerPage;

    var data = this.body.data;
    if (data.rows.length - newRowOffset < rowPerPage) {
        newRowOffset = Math.max(0, newRowOffset - rowPerPage);
    }

    if (newRowOffset === this.rowOffset) return;
    this.rowOffset = newRowOffset;
    var start = this.rowOffset;

    var elt = this.body.elt;
    var fixedXElt = this.body.fixedXElt;
    var end = Math.min(start + rowPerPage * 2, data.rows.length);
    var rows = this.body.rows;
    elt.clearChild();
    fixedXElt.clearChild();
    for (var i = start; i < end; ++i) {
        elt.addChild(rows[i].elt);
        fixedXElt.addChild(rows[i].fixedXElt);
    }
    this.boundCache = null;

    var bounds = this.getBoundOfRows();
    if (bounds) {
        for (var i = start; i < end; ++i) {
            rows[i].updateCopyEltSize();
        }
        this.body.table.wrapper.layoutCtrl.onResize();
        this.body.table.updateCopyEltSize();
    }

    var counter = 1;
    var fx = () => {
        if (counter > 20) return;
        if (this.body.elt.isDescendantOf(document.body)) {
            var bounds = this.getBoundOfRows();
            if (bounds) {
                for (var i = start; i < end; ++i) {
                    rows[i].updateCopyEltSize();
                }
                this.body.table.wrapper.layoutCtrl.onResize();
                this.body.table.updateCopyEltSize();
            }
            counter += 3;
            setTimeout(fx, counter * 5);
        }
        else {
            setTimeout(fx, (counter++) * 5);
        }
    };

    if (!bounds) {
        setTimeout(fx, 1);
    }
    this.body.table.wrapper.rowDragCtrl.ev_rowRenderChange();
    ResizeSystem.requestUpdateUpSignal(this.body.elt);
}


NormalMode.prototype.onRowSplice = function (idx) {
    this.rowOffset = -1;
    this.render();
};


NormalMode.prototype.viewIntoRow = function (o) {
    var idx = this.viewedRows.findIndex(row => {
        if (o === row._elt) return true;
        if (o === row) return true;
        if (o === row.data) return true;
        if (o === row.id || row.data.id === o) return true;
        return false;
    });
    if (idx <= 0) return;
    var scrollbar = this.body.table.wrapper.$vscrollbar;
    scrollbar.innerOffset = Math.max(0, Math.min(idx - scrollbar.outerHeight / 3, scrollbar.innerHeight - scrollbar.outerHeight));
    scrollbar.emit('scroll');
};


/***
 *
 * @param {DTTable} table
 * @param data
 * @constructor
 */
function DTBody(table, data) {
    this.table = table;

    this.data = data;

    this._elt = null;
    this._fixedXElt = null;

    /**
     * @type {DTBodyRow[]}
     */
    this.rows = this.data.rows.map((rowData, i) => {
        var row = new DTBodyRow(this, rowData);
        row.idx = i;
        return row;
    });


    this.modes = {
        normal: new NormalMode(this),
        searching: new SearchingMode(this)
    };
    //
    //
    this.curentMode = this.modes.normal;
    this.curentMode.start();
    this.curentMode.render();
    this.master = null;
    //
    // this.master = new SearchingMaster(this);
    // this.master.transferFrom(0);
    /***
     * @name offset
     * @type {number}
     * @memberOf DTBody#
     */
}


DTBody.prototype.revokeResource = function () {
    if (this.master) {
        this.master.destroy();
        this.master = null;
    }
    while (this.rows.length) {
        this.rows.pop().revoke();
    }
    this.modes.normal.revoke();
    this.modes.searching.revoke();
    this.rows = [];
    this.data = null;

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
        if (this.rows[i]) {
            this.rows[i].idx = i;
            this.rows[i].prevRow = this.rows[i - 1] || null;
            this.rows[i].nextRow = this.rows[i + 1] || null;
        }
    }

};

DTBody.prototype.onRowSplice = function (idx) {
    this.curentMode.onRowSplice(idx);
    if (this.master) this.master.transferFrom(idx);
    ResizeSystem.requestUpdateSignal();
}

DTBody.prototype.rowIndexOf = function (o) {
    var n = this.rows.length;
    for (var i = 0; i < n; ++i) {
        if (o === this.rows[i]._elt) return i;
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

DTBody.prototype.moveRowAt = function (idx, newIdx) {
    var row = this.rows.splice(idx, 1)[0];
    var rowData = this.data.rows.splice(idx, 1)[0];
    this.rows.splice(newIdx, 0, row);
    this.data.rows.splice(newIdx, 0, rowData);
    this.reindexRows(Math.min(idx, newIdx));
    this.onRowSplice(Math.min(idx, newIdx));
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


DTBody.prototype.updateCopyEltSize = function () {
    this.rows.forEach(row => row.updateCopyEltSize());
};


Object.defineProperties(DTBody.prototype, {
    offset: {
        set: function (value) {
            this._offset = value;
            this.curentMode.offset = value;
            this.curentMode.render();
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


Object.defineProperty(DTBody.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        this._elt = _({
            tag: 'tbody',
            class: 'as-dt-body',
        });
        if (this.data.on) {
            Object.keys(this.data.on).forEach(key => {
                var cb = this.data.on[key];
                if (typeof cb !== "function") return;
                this._elt.on(key, event => {
                    cb.call(this._elt, event, this);
                });
            });
        }
        return this._elt;
    }
});

Object.defineProperty(DTBody.prototype, 'fixedXElt', {
    get: function () {
        if (this._fixedXElt) return this._fixedXElt;
        this._fixedXElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-fixed-x',
        });
        return this._fixedXElt;
    }
});

Object.defineProperty(DTBody.prototype, 'adapter', {
    get: function () {
        return this.table.adapter;
    }
});


export default DTBody;
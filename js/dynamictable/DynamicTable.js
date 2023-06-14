import ACore, { $, $$, _ } from "../../ACore";
import DTDataAdapter from "./DTDataAdapter";
import '../../css/dynamictable.css';
import PageSelector from "../PageSelector";
import DTWaitingViewController from "./DTWaitingViewController";
import noop from "absol/src/Code/noop";
import { buildCss, swapChildrenInElt } from "../utils";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import DomSignal from "absol/src/HTML5/DomSignal";
import { getScreenSize } from "absol/src/HTML5/Dom";
import { HScrollbar, VScrollbar } from "../Scroller";
import Vec2 from "absol/src/Math/Vec2";
import DTTable from "./DTTable";
import vec2 from "absol/src/Math/Vec2";
import Hanger from "../Hanger";
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import Rectangle from "absol/src/Math/Rectangle";
import { randomIdent } from "absol/src/String/stringGenerate";

var loadStyleSheet = function () {
    var dynamicStyleSheet = {};
    var key = Array(20).fill(0).map((u, i) => [
        '.as-dynamic-table-wrapper.as-hide-col-' + i + ' td[data-col-idx="' + i + '"]',
        '.as-dynamic-table-wrapper.as-hide-col-' + i + ' th[data-col-idx="' + i + '"]'
    ].join(', ')).join(',\n');
    dynamicStyleSheet[key] = { display: 'none' };
    buildCss(dynamicStyleSheet);
    loadStyleSheet = noop;
}


function DynamicTableManager() {
    this.tables = [];
    this.storageChanged = false;
}

DynamicTableManager.prototype.STORE_KEY = 'DynamicTableSetting';
DynamicTableManager.prototype.VER = 2;

DynamicTableManager.prototype.initIfNeed = function () {
    if (this.css) return;
    this.css = new DynamicCSS();
    this.tables = [];
    try {
        var json = localStorage.getItem(this.STORE_KEY);
        if (json) {
            this.data = JSON.parse(json);
            if (!this.data || this.data.ver !== this.VER) this.data = null;
        }

    } catch (er) {

    }
    this.data = this.data || {
        ver: this.VER,
        colWidth: {}
    };
    this.initCss();
};

DynamicTableManager.prototype.initCss = function () {
    Object.keys(this.data.colWidth).forEach(tableId => {
        Object.keys(this.data.colWidth[tableId]).forEach(colId => {
            var value = this.data.colWidth[tableId][colId];
            this.css.setProperty(`#${tableId} th[data-col-id="${colId}"]`, 'width', value + 'px')
        });
    });
    this.css.commit();
};

DynamicTableManager.prototype.add = function (table) {
    this.tables.push(table);
};

DynamicTableManager.prototype.removeTrash = function () {
    this.tables = this.tables.filter(table => table.isDescendantOf(document.body));
};

DynamicTableManager.prototype.commitColWidth = function (sender, tableId, colId, value, storage) {
    this.setColWidth(tableId, colId, value, storage);
    this.removeTrash();
    this.commit();
    this.tables.forEach(table => {
        if (table.id === table && table !== sender) {
            table.requestUpdateSize();
        }
    });
};

DynamicTableManager.prototype.hasColSize = function (tableId, colId) {
    return this.data.colWidth[tableId] && this.data.colWidth[tableId][colId];
};

DynamicTableManager.prototype.setColWidth = function (tableId, colId, value, storage) {
    if (storage){
        this.data.colWidth[tableId] = this.data.colWidth[tableId] || {};
        this.data.colWidth[tableId][colId] = value;
        this.storageChanged = true;
    }

    this.css.setProperty(`#${tableId} th[data-col-id="${colId}"]`, 'width', value + 'px');
};

DynamicTableManager.prototype.commit = function () {
    if (this.storageChanged) {
        localStorage.setItem(this.STORE_KEY, JSON.stringify(this.data));
        this.storageChanged = false;
    }
    this.css.commit();
}

var manager = new DynamicTableManager();


/***
 * @extends AElement
 * @constructor
 */
function DynamicTable() {
    manager.initIfNeed();
    loadStyleSheet();
    this.css = new DynamicCSS();
    this._hiddenColumns = [];
    /***
     *
     * @type {SearchTextInput|null}
     */
    this.$searchInput = null;
    /***
     *
     * @type {AElement}
     */
    this.$table = $('.as-dynamic-table', this);
    /***
     *
     * @type {AElement}
     */
    this.$thead = $('.as-dynamic-table>thead', this.$table);
    /***
     *
     * @type {AElement}
     */
    this.$tbody = $('.as-dynamic-table>tbody', this.$table);


    this.$filterInputs = [];

    this.$attachhook = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(_('attachhook').addTo(this));
    //controller
    this.table = null;
    this.$space = $('.as-dynamic-table-space', this);
    this.$fixedYCtn = $('.as-dynamic-table-fixed-y-ctn', this);
    this.$fixedXCtn = $('.as-dynamic-table-fixed-x-ctn', this);
    this.$fixedXYCtn = $('.as-dynamic-table-fixed-xy-ctn', this);
    this.$viewport = $('.as-dynamic-table-viewport', this);
    this.$hscrollbar = $('.as-dynamic-table-hb', this);
    this.$vscrollbar = $('.as-dynamic-table-vb', this);

    // this.$attachhook.requestUpdateSize = this.fixedContentCtrl.updateSize.bind(this.fixedContentCtrl);
    this.$attachhook.requestUpdateSize = this.requestUpdateSize.bind(this);
    this.$attachhook.on('attached', () => {
        ResizeSystem.add(this.$attachhook);
        this.layoutCtrl.onAttached();
        this.colSizeCtrl.onAttached();
        manager.add(this);
    })
    /***
     *
     * @type {DTDataTable||null}
     */
    this.adapter = null;

    this.waitingCtl = new DTWaitingViewController(this);
    this.layoutCtrl = new LayoutController(this);
    this.pointerCtrl = new PointerController(this);
    this.colSizeCtrl = new ColSizeController(this);

    var checkAlive = () => {
        if (this.isDescendantOf(document.body)) {
            setTimeout(checkAlive, 5000);
        }
        else {
            this.revokeResource();
        }
    };
    setTimeout(checkAlive, 30000);
}


DynamicTable.tag = 'DynamicTable'.toLowerCase();

DynamicTable.render = function () {
    return _({
        id: 'no-id-' + randomIdent(10),
        extendEvent: ['orderchange'],
        class: 'as-dynamic-table-wrapper',
        child: [
            {
                tag: Hanger.tag,
                class: 'as-dynamic-table-viewport',
                child: [
                    {
                        class: 'as-dynamic-table-space',
                    },
                    {
                        class: 'as-dynamic-table-fixed-y-ctn'
                    },
                    {
                        class: 'as-dynamic-table-fixed-x-ctn'
                    },
                    {
                        class: 'as-dynamic-table-fixed-xy-ctn'
                    }
                ]
            },
            {
                tag: VScrollbar,
                class: 'as-dynamic-table-vb'
            },
            {
                tag: HScrollbar,
                class: 'as-dynamic-table-hb'
            },
        ]
    });
};


DynamicTable.prototype.requestUpdateSize = function () {
    this.layoutCtrl.onResize();
};

DynamicTable.prototype.revokeResource = function () {
    this.css.stop();
    this.table && this.table.revokeResource();
    this.attachSearchInput(null);
    this.filterInputs = [];
};

DynamicTable.prototype.addRowBefore = function (rowData, bf) {
    return this.table.body.addRowBefore(rowData, bf);
};


DynamicTable.prototype.addRowAfter = function (rowData, at) {
    return this.table.body.addRowAfter(rowData, at);
};

DynamicTable.prototype.replaceRow = function (rowData, rp) {
    var row = this.rowOf(rp);
    if (row) {
        row.updateData(rowData);
    }
    ResizeSystem.requestUpdateSignal();
};


DynamicTable.prototype.addRow = function (rowData, idx) {
    return this.table.body.addRow(rowData, idx);
};

DynamicTable.prototype.addRows = function (rowsData, idx) {
    return this.table.body.addRows(rowsData, idx);
};

DynamicTable.prototype.removeRow = function (row) {
    return this.table.body.removeRow(row);
};

DynamicTable.prototype.rowAt = function (idx) {
    return this.table.body.rowAt(idx);
};

DynamicTable.prototype.rowOf = function (o) {
    return this.table.body.rowOf(o);
};


DynamicTable.prototype.getRows = function () {
    return this.table.body.rows;
};

DynamicTable.prototype.requireRows = function (start, end) {
    return this.table.body.requireRows(start, end);
};

DynamicTable.prototype.clearRows = function () {
    return this.table.body.clearRows();
};

DynamicTable.prototype.viewIntoRow = function (row) {
    this.table.body.viewIntoRow(row);
};

DynamicTable.prototype.attachSearchInput = function (inputElt) {
    if (this.$searchInput) {
        this.$searchInput.off('stoptyping', this.eventHandler.searchModify);
        this.$searchInput.off('keyup', this.eventHandler.searchKeyUp);
    }
    this.$searchInput = inputElt;
    if (this.$searchInput) {
        if (this.$searchInput.$table) {
            this.$searchInput.off('stoptyping', this.$searchInput.$table.eventHandler.searchModify);
            this.$searchInput.off('keyup', this.$searchInput.$table.eventHandler.searchKeyUp);

        }
        this.$searchInput.$table = this;
        this.$searchInput.on('stoptyping', this.eventHandler.searchModify);
        this.$searchInput.on('keyup', this.eventHandler.searchKeyUp);
    }
};

DynamicTable.prototype.filter = function (filter) {
    var query = {};
    var queryText = (this.$searchInput && this.$searchInput.value) || '';
    queryText = queryText.trim().replace(/\s\s+/g, ' ');
    var i;
    if (filter) {
        for (i in filter) {
            query.filter = filter;
            break;
        }
    }

    if (queryText && queryText.length > 0)
        query.text = queryText;
    for (i in query) {
        this.query(query);
        return;
    }
    this.query(null);
};


DynamicTable.prototype.makeQuery = function () {
    var query = {};
    var textQuery = this.$searchInput && this.$searchInput.value.trim().replace(/\s\s+/, ' ');
    if (textQuery && textQuery.length > 0) query.text = textQuery;
    var i;
    var filter = this.$filterInputs.reduce(function (ac, elt) {
        if (elt.exportFilter) {
            elt.exportFilter(ac);
        }
        else if (elt.name) {
            ac[elt.name] = elt.value;
        }
        return ac;
    }, {});

    var sort = $$('th', this.table.header.elt).reduce((ac, cr) => {
        var key = cr.attr('data-sort-key');
        var order = cr.attr('data-sort-order');
        if (key && order && order !== 'none') {
            ac.push({ key: key, order: order });
        }
        return ac;
    }, []);

    for (i in filter) {
        query.filter = filter;
        break;
    }

    if (sort.length > 0) {
        query.sort = sort;
    }

    for (i in query) {
        return query;
    }


    return null;
};


DynamicTable.prototype.requestQuery = function () {
    var query = this.makeQuery();
    this.query(query);
};


DynamicTable.prototype.query = function (query) {
    this.table.body.query(query);
};

DynamicTable.prototype.addFilter = function (inputElt) {
    if (inputElt.$dynamicTable) {
        inputElt.$dynamicTable.removeFilter(inputElt);
    }

    inputElt.$dynamicTable = this;
    inputElt.on('change', this.eventHandler.searchModify);
    this.$filterInputs.push(inputElt);
};

DynamicTable.prototype.removeFilter = function (inputElt) {
    if (inputElt.$dynamicTable !== this) return;
    inputElt.$dynamicTable = null;
    inputElt.off('change', this.eventHandler.searchModify);
    var idx = this.$filterInputs.indexOf(inputElt);
    if (idx >= 0)
        this.$filterInputs.splice(idx, 1);
};

DynamicTable.prototype.notifyRowChange = function (row) {
    var idx = this.table.body.rowIndexOf(row);
    if (idx >= 0)
        this.table.body.onRowSplice(idx)
};

DynamicTable.prototype.notifyRowsChange = noop;

DynamicTable.property = {};

DynamicTable.property.adapter = {
    /***
     * @this DynamicTable
     * @param data
     */
    set: function (data) {
        if (!data) return
        this._adapterData = data;
        this._adapter = new DTDataAdapter(this, data);
        this.layoutCtrl.onAdapter();

        this.table = new DTTable(this, this._adapterData.data);
        this.$space.clearChild().addChild(this.table.elt);
        this.$fixedYCtn.clearChild().addChild(this.table.fixedYElt);
        this.$fixedXCtn.clearChild().addChild(this.table.fixedXElt);
        this.$fixedXYCtn.clearChild().addChild(this.table.fixedXYElt);

        this.layoutCtrl.onAdapter();
    },
    get: function () {
        return this._adapterData;
    }
};
DynamicTable.property.filterInputs = {
    set: function (inputs) {
        inputs = inputs || [];
        this.$filterInputs.slice().forEach(input => {
            this.removeFilter(input);
        });

        inputs.forEach(input => this.addFilter(input));
    },
    get: function () {
        return this.$filterInputs;
    }
};


DynamicTable.property.hiddenColumns = {
    set: function (value) {
        value = value || [];
        this._hiddenColumns.forEach(function (idxV) {
            this.removeClass('as-hide-col-' + idxV);
        }.bind(this));
        this._hiddenColumns = value;

        this._hiddenColumns.forEach(function (idxV) {
            this.addClass('as-hide-col-' + idxV);
        }.bind(this));
        var c = this.parentElement;
        while (c) {
            if (c.hasClass && c.hasClass('absol-table-vscroller') && c.update) {
                c.update();
                break;
            }
            c = c.parentElement;
        }
    },
    get: function () {
        return this._hiddenColumns;
    }
}


/***
 * @memberOf {DynamicTable#}
 * @type {{}}
 */
DynamicTable.eventHandler = {};


/***
 * @this DynamicTable#
 * @param event
 */
DynamicTable.eventHandler.searchModify = function (event) {
    this.requestQuery();


};

/***
 * @this DynamicTable#
 * @param event
 */
DynamicTable.eventHandler.searchKeyUp = function (event) {
    setTimeout(function () {
        var query = this.$searchInput.value;
        query = query.trim().replace(/\s+/, ' ');
        if (query.length)
            this.table.body.startSearchingIfNeed();
    }.bind(this), 30);
};


ACore.install(DynamicTable);

export default DynamicTable;


/***
 *
 * @param {DynamicTable} elt
 * @constructor
 */
function LayoutController(elt) {
    /***
     *
     * @type {DynamicTable}
     */
    this.elt = elt;
    this.maxRows = Math.ceil(Math.max(getScreenSize().height / 40, 1080 / 40));
    this.offset = Vec2.ZERO;
    Object.keys(this.constructor.prototype).forEach(key => {
        if (key.startsWith('ev_')) this[key] = this[key].bind(this);
    });

    this.elt.$hscrollbar.on('scroll', this.ev_hScrollbarScroll);
    this.elt.$vscrollbar.on('scroll', this.ev_vScrollbarScroll);

    this.elt.on('wheel', this.ev_wheel);
    this.scrollingDir = Vec2.ZERO;
    this.scrollingStartOffset = Vec2.ZERO;
}

/***
 *
 * @param {WheelEvent} event
 */
LayoutController.prototype.ev_wheel = function (event) {
    var isOverflowY = this.elt.hasClass('as-overflow-y');
    var isOverflowX = this.elt.hasClass('as-overflow-x');
    var dy = event.deltaY;
    var prevOffset;
    if (isOverflowY && (!event.shiftKey || !isOverflowX)) {
        prevOffset = this.elt.$vscrollbar.innerOffset;
        if (dy > 0) {
            this.elt.$vscrollbar.innerOffset = Math.max(
                Math.min(prevOffset + 100 / 40,
                    this.elt.$vscrollbar.innerHeight - this.elt.$vscrollbar.outerHeight),
                0);
            if (prevOffset !== this.elt.$vscrollbar.innerOffset) {
                event.preventDefault();
                this.elt.$vscrollbar.emit('scroll');
            }
        }
        else if (dy < 0) {
            this.elt.$vscrollbar.innerOffset = Math.max(
                Math.min(prevOffset - 100 / 40,
                    this.elt.$vscrollbar.innerHeight - this.elt.$vscrollbar.outerHeight),
                0);
            if (prevOffset !== this.elt.$vscrollbar.innerOffset) {
                event.preventDefault();
                this.elt.$vscrollbar.emit('scroll');
            }
        }

    }
    else if (isOverflowX && (event.shiftKey || !isOverflowY)) {
        prevOffset = this.elt.$hscrollbar.innerOffset;
        if (dy > 0) {
            this.elt.$hscrollbar.innerOffset = Math.max(
                Math.min(prevOffset + 100,
                    this.elt.$hscrollbar.innerWidth - this.elt.$hscrollbar.outerWidth),
                0);
            if (prevOffset !== this.elt.$hscrollbar.innerOffset) {
                event.preventDefault();
                this.elt.$hscrollbar.emit('scroll');
            }
        }
        else if (dy < 0) {
            this.elt.$hscrollbar.innerOffset = Math.max(
                Math.min(prevOffset - 100,
                    this.elt.$hscrollbar.innerWidth - this.elt.$hscrollbar.outerWidth),
                0);
            if (prevOffset !== this.elt.$hscrollbar.innerOffset) {
                event.preventDefault();
                this.elt.$hscrollbar.emit('scroll');
            }
        }

    }
};


LayoutController.prototype.onAdapter = function () {
    var adapter = this.elt.adapter;
    if (this.elt.style.height === 'auto') this.elt.removeStyle('height');
    if (adapter.fixedCol > 0) {
        this.elt.addClass('as-has-fixed-col');
    }
    else {
        this.elt.removeClass('as-has-fixed-col');
    }

    if (adapter?.rowsPerPage === Infinity) {
        this.elt.addStyle('as-adapt-infinity-grow');
    }
    else {
        this.elt.addStyle('as-adapt-infinity-grow');
    }
};

LayoutController.prototype.onAttached = function () {
    var c = this.elt.parentElement;
    while (c) {
        if (c.isSupportedEvent && c.isSupportedEvent('sizechange')) {
            c.on('sizechange', () => {
                this.onResize();
            });
        }
        c = c.parentElement;
    }
    if (this.elt.table) {
        this.elt.table.updateCopyEltSize();
        this.updateOverflowStatus();
        this.elt.$vscrollbar.once('scroll', ()=>{
            setTimeout(() => {
                if (this.elt.table.body.rows.length === 0) return;
                var tableId = this.elt.id;

                var cells = this.elt.table.header.rows[0] && this.elt.table.header.rows[0].cells;
                if (!cells) return;
                var changed = false;
                cells.forEach(cell => {
                    var colId = cell.data.id;
                    var bound;
                    if (!colId) {//local style
                        bound = cell.copyElt.getBoundingClientRect();
                        this.elt.css.setProperty(`#${this.elt.id} th[data-col-idx="${cell.idx}"]`, 'width', bound.width + 'px')
                            .commit();

                        return;
                    }
                    if (!manager.hasColSize(tableId, colId)) {
                        bound = cell.copyElt.getBoundingClientRect();
                        if (bound.width) {
                            manager.setColWidth(tableId, colId, bound.width);
                            changed = true;
                        }
                    }
                });
                if (changed) manager.commit();
            }, 100);

        });
    }
};


LayoutController.prototype.onResize = function () {
    this.updateOverflowStatus();
    this.updateScrollbarStatus();
    if (this.elt.table) {
        this.elt.table.updateCopyEltSize();
        this.updateLines();
    }
};

LayoutController.prototype.updateOverflowStatus = function () {
    var contentBound = this.elt.table ? this.elt.table.elt.getBoundingClientRect() : { width: 0, height: 0 };
    this.elt.addStyle('--dt-content-height', contentBound.height + 'px');
    this.elt.addStyle('--dt-content-width', contentBound.width + 'px');
    var bound = this.elt.getBoundingClientRect();
    if (bound.width < contentBound.width) {
        this.elt.addClass('as-overflow-x');
    }
    else {
        this.elt.removeClass('as-overflow-x');
        this.elt.$space.removeStyle('left');
    }

    if (bound.height < contentBound.height) {
        this.elt.addClass('as-overflow-y');
    }
    else {
        this.elt.removeClass('as-overflow-y');
        this.elt.$space.removeStyle('top');
    }
};

LayoutController.prototype.updateScrollbarStatus = function () {
    //todo: not overflow y
    if (!this.elt.table) return;
    var childNodes = this.elt.table.body.elt.childNodes;
    var vBound = this.elt.$viewport.getBoundingClientRect();
    var headBound = this.elt.table.header.elt.getBoundingClientRect();
    var availableHeight = vBound.height - headBound.height;

    var rBound;
    var outer = 0;
    var sHeight = 1;//border of last row
    for (var i = 0; i < childNodes.length; ++i) {
        rBound = childNodes[childNodes.length - 1 - i].getBoundingClientRect();
        sHeight += rBound.height;
        if (sHeight >= availableHeight) {
            outer = i + (1 - (sHeight - availableHeight) / rBound.height);
            break;
        }
    }

    this.elt.$vscrollbar.outerHeight = outer;
    this.elt.$vscrollbar.innerHeight = this.elt.table.body.curentMode.viewedRows.length;
    this.elt.$vscrollbar.innerOffset = this.elt.table.body.curentMode.offset;
    var viewportBound = this.elt.$viewport.getBoundingClientRect();
    var tableBound = this.elt.table.elt.getBoundingClientRect();
    this.elt.$hscrollbar.innerWidth = tableBound.width;
    this.elt.$hscrollbar.outerWidth = viewportBound.width;
};

LayoutController.prototype.updateLines = function () {
    var fixXBound, headerBound;
    if (this.elt.hasClass('as-overflow-x') && this.elt.hasClass('as-has-fixed-col')) {
        fixXBound = this.elt.$fixedXCtn.getBoundingClientRect();
        this.elt.addStyle('--dt-fixed-x-width', fixXBound.width + 'px');
    }
    if (this.elt.hasClass('as-overflow-y')) {
        headerBound = this.elt.$fixedYCtn.firstChild.getBoundingClientRect();
        this.elt.addStyle('--dt-header-height', headerBound.height + 'px');
    }
};

LayoutController.prototype.ev_hScrollbarScroll = function (event) {
    this.elt.$space.addStyle('left', -this.elt.$hscrollbar.innerOffset + 'px');
    this.elt.$fixedYCtn.addStyle('left', -this.elt.$hscrollbar.innerOffset + 'px');
    this.elt.$viewport.emit('scroll');
};


LayoutController.prototype.ev_vScrollbarScroll = function () {
    this.elt.$viewport.emit('scroll');
    this.elt.table.body.offset = this.elt.$vscrollbar.innerOffset;
};

LayoutController.prototype.ev_dragStart = function (event) {
    var isOverflowY = this.elt.hasClass('as-overflow-y');
    var isOverflowX = this.elt.hasClass('as-overflow-x');
    var dir = event.currentPoint.sub(event.startingPoint);
    if (isOverflowY && Math.abs(dir.y) > Math.abs(dir.x)) {
        this.scrollingDir = new Vec2(0, 1);
        event.preventDefault();
    }
    else if (isOverflowX && Math.abs(dir.y) < Math.abs(dir.x)) {
        this.scrollingDir = new Vec2(1, 0);
        event.preventDefault();
    }
    else {
        this.scrollingDir = Vec2.ZERO;
    }
    this.scrollingStartOffset = new Vec2(this.elt.$hscrollbar.innerOffset, this.elt.$vscrollbar.innerOffset);
};

LayoutController.prototype.ev_drag = function (event) {
    var changed = false;
    var dir = event.currentPoint.sub(event.startingPoint);

    var newOffset = new Vec2(0, 0);
    if (this.scrollingDir.x !== 0) {
        newOffset.x = Math.max(0,
            Math.min(this.elt.$hscrollbar.innerWidth - this.elt.$hscrollbar.outerWidth,
                this.scrollingStartOffset.x - dir.x));
        if (this.elt.$hscrollbar.innerOffset !== newOffset.x) {
            changed = true;
            this.elt.$hscrollbar.innerOffset = newOffset.x;
            this.elt.$hscrollbar.emit('scroll');
        }
    }
    else if (this.scrollingDir.y !== 0) {
        newOffset.y = Math.max(0,
            Math.min(this.elt.$vscrollbar.innerHeight - this.elt.$vscrollbar.outerHeight,
                this.scrollingStartOffset.y - dir.y / 40));

        if (this.elt.$vscrollbar.innerOffset !== newOffset.y) {
            changed = true;
            this.elt.$vscrollbar.innerOffset = newOffset.y;
            this.elt.$vscrollbar.emit('scroll');
        }
    }


    if (changed) event.preventDefault();
};


LayoutController.prototype.ev_dragEnd = function (event) {

};

/***
 *
 * @param {DynamicTable} elt
 * @constructor
 */
function PointerController(elt) {
    Object.keys(this.constructor.prototype).forEach(key => {
        if (key.startsWith('ev_')) this[key] = this[key].bind(this);
    });
    /***
     *
     * @type {DynamicTable}
     */
    this.elt = elt;
    this.elt.$viewport.hangon = 5;
    this.elt.$viewport.on('draginit', this.ev_dragInit);
    this.elt.$viewport.on('dragstart', this.ev_dragStart);
    this.elt.$viewport.on('drag', this.ev_drag);
    this.elt.$viewport.on('dragend', this.ev_dragEnd);
    this.destHandler = null;
}


PointerController.prototype.isInDragZone = function (elt) {
    return false;
};

PointerController.prototype.isInInput = function (elt) {
    while (elt) {
        if (elt.tagName === 'INPUT') return true;
        if (elt.tagName === 'TD') return false;
        var clazz = elt.getAttribute('class') || '';
        if (clazz.indexOf('input') >= 0) return true;
        if (clazz.indexOf('input') >= 0) return true;
        if (clazz.indexOf('menu') >= 0) return true;
        elt = elt.parentElement;
    }
    return false;
};

PointerController.prototype.isInColResizer = function (elt) {
    return !!(elt.hasClass && elt.hasClass('as-dt-header-cell-resizer'));
};


PointerController.prototype.ev_dragInit = function (event) {
    if (this.isInColResizer(event.target)) {
        event.preventDefault();
        this.destHandler = this.elt.colSizeCtrl;
    }
    else if (this.isInInput(event.target)) {
        event.cancel();
        return;
    }
    else if (event.isTouch) {
        // event.preventDefault();//todo: check
    }

}

PointerController.prototype.ev_dragStart = function (event) {
    event.preventDefault && event.preventDefault();
    var dir = event.currentPoint.sub(event.startingPoint).normalized();
    var ox = new Vec2(1, 0);
    var oy = new Vec2(0, 1);
    if (this.destHandler) {
        this.destHandler.ev_dragStart(event);
    }
    else if (event.isTouch && (Math.abs(dir.dot(ox)) < 0.3 || Math.abs(dir.dot(oy)) < 0.3)) {
        this.destHandler = this.elt.layoutCtrl;
        this.destHandler.ev_dragStart(event);
    }
    else {
        this.destHandler = null;
    }
};

PointerController.prototype.ev_drag = function (event) {
    event.preventDefault && event.preventDefault();
    if (this.destHandler) this.destHandler.ev_drag(event);
}

PointerController.prototype.ev_dragEnd = function (event) {
    event.preventDefault && event.preventDefault();
    if (this.destHandler) this.destHandler.ev_dragEnd(event);
    this.destHandler = null;
};


PointerController.prototype.ev_dragDeinit = function (event) {

};

/***
 *
 * @param {DynamicTable} elt
 * @constructor
 */
function ColSizeController(elt) {
    this.elt = elt;

    this.colId = null;//number: col index, string: ident
    this.startingBound = null;
    this.cellElt = null;
    this.cell = null;
}

ColSizeController.prototype.onAttached = function () {

};

ColSizeController.prototype.onAdapter = function () {

};


ColSizeController.prototype.ev_dragStart = function (event) {
    this.colId = event.target.parentElement.attr('data-col-id') || parseInt(event.target.parentElement.attr('data-col-idx'));
    this.cell = this.elt.table.header.rows[0].cells.find(cell => cell.data.id === this.colId || cell.idx === this.colId);
    this.cellElt = this.cell.copyElt;
    this.startingBound = Rectangle.fromClientRect(this.cellElt.getBoundingClientRect());

};


ColSizeController.prototype.ev_drag = function (event) {
    var newWidth = this.startingBound.width + event.currentPoint.sub(event.startingPoint).x;
    this.cellElt.addStyle('width', newWidth + 'px');
    this.elt.table.updateCopyEltSize();

};


ColSizeController.prototype.ev_dragEnd = function (event) {
    if (typeof this.colId === "string"){
        manager.commitColWidth(this.elt, this.elt.id, this.cell.data.id, this.cellElt.getBoundingClientRect().width, true);
    }
    else {
        this.elt.css.setProperty(`#${this.elt.id} th[data-col-idx="${this.colId}"]`, 'width', this.cellElt.getBoundingClientRect().width + 'px').commit();
    }
    this.elt.requestUpdateSize();
    setTimeout(() => {
        this.cellElt.removeStyle('width');
    }, 150);
};

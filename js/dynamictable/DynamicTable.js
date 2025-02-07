import ACore, { $, $$, _ } from "../../ACore";
import DTDataAdapter from "./DTDataAdapter";
import '../../css/dynamictable.css';
import DTWaitingViewController from "./DTWaitingViewController";
import noop from "absol/src/Code/noop";
import {
    buildCss,
    findMaxZIndex,
    findVScrollContainer,
    isNaturalNumber,
    revokeResource,
    vScrollIntoView
} from "../utils";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import DomSignal from "absol/src/HTML5/DomSignal";
import { getScreenSize } from "absol/src/HTML5/Dom";
import { HScrollbar, VScrollbar } from "../Scroller";
import Vec2 from "absol/src/Math/Vec2";
import DTTable from "./DTTable";
import Hanger from "../Hanger";
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import Rectangle from "absol/src/Math/Rectangle";
import { randomIdent } from "absol/src/String/stringGenerate";
import AElement from "absol/src/HTML5/AElement";
import { computeMeasureExpression, parseMeasureValue } from "absol/src/JSX/attribute";
import Attributes from "absol/src/AppPattern/Attributes";
import { kebabCaseToCamelCase } from "absol/src/String/stringFormat";

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
    this.css.elt.setAttribute('id', "dynamic_mng");
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
    if (storage) {
        this.data.colWidth[tableId] = this.data.colWidth[tableId] || {};
        this.data.colWidth[tableId][colId] = value;
        this.storageChanged = true;
    }

    this.css.setProperty(`#${tableId} th[data-col-id="${colId}"]:not([colspan])`, 'width', value + 'px');
};

DynamicTableManager.prototype.commit = function () {
    if (this.storageChanged) {
        localStorage.setItem(this.STORE_KEY, JSON.stringify(this.data));
        this.storageChanged = false;
    }
    this.css.commit();
}

var manager = new DynamicTableManager();


var pendingTables = {};

/***
 * @extends AElement
 * @constructor
 */
function DynamicTable() {
    this._pendingId = randomIdent(4);
    pendingTables[this._pendingId] = this;
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
    this.$domSignal = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$domSignal);
    //controller
    this.table = null;
    this.$space = $('.as-dynamic-table-space', this);
    this.$fixedYCtn = $('.as-dynamic-table-fixed-y-ctn', this);
    this.$fixedXCtn = $('.as-dynamic-table-fixed-x-ctn', this);
    this.$fixedXYCtn = $('.as-dynamic-table-fixed-xy-ctn', this);
    this.$viewport = $('.as-dynamic-table-viewport', this);
    this.$hscrollbar = $('.as-dynamic-table-hb', this);
    this.$vscrollbar = $('.as-dynamic-table-vb', this);

    this.$pageSelector = new VirtualPageSelector(this);
    this.extendStyle = Object.assign(new Attributes(this), this.extendStyle);
    this.extendStyle.loadAttributeHandlers(this.styleHandlers);


    // this.$attachhook.requestUpdateSize = this.fixedContentCtrl.updateSize.bind(this.fixedContentCtrl);
    this.$attachhook.requestUpdateSize = this.requestUpdateSize.bind(this);
    var trashTO = -1;
    this.readySync = new Promise(rs => {
        this.onReady = rs;
    });
    this.$attachhook.once('attached', () => {
        delete pendingTables[this._pendingId];
        // setTimeout(()=>{
        //     Object.values(pendingTables).forEach(table=>{
        //         if (!table.isDescendantOf(document.body))
        //         table.revokeResource();
        //     });
        // }, 5000);
        ResizeSystem.add(this.$attachhook);
        this.layoutCtrl.onAttached();
        this.colSizeCtrl.onAttached();
        manager.add(this);
        setTimeout(() => {
            this.requestUpdateSize();
            if (this.onReady) {
                this.onReady();
                this.onReady = null;
            }
        }, 10);

        clearTimeout(trashTO);

        var checkAlive = () => {
            if (this.isDescendantOf(document.body)) {
                setTimeout(checkAlive, 2000);
            }
            else {
                this.revokeResource();
            }
        };
        setTimeout(checkAlive, 500);
    });

    /***
     *
     * @type {{data: DTDataTable}||null}
     */
    this.adapter = null;

    this.waitingCtl = new DTWaitingViewController(this);
    this.layoutCtrl = new LayoutController(this);
    this.pointerCtrl = new PointerController(this);
    this.colSizeCtrl = new ColSizeController(this);
    this.rowDragCtrl = new RowDragController(this);
}


DynamicTable.tag = 'DynamicTable'.toLowerCase();

DynamicTable.render = function (data, domDesc) {
    var width = domDesc.style && domDesc.style.width;
    var classList = ['as-dynamic-table-wrapper'];
    if (width === 'match_parent' || width === '100%') {
        classList.push('as-width-match-parent');
    }
    return _({
        id: 'no-id-' + randomIdent(10),
        extendEvent: ['orderchange', 'colresize'],
        class: classList,
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

DynamicTable.prototype.extendStyle = {};//init value

DynamicTable.prototype.extendStyle.tableLayout = 'fixed';
DynamicTable.prototype.extendStyle.width = 'auto';
DynamicTable.prototype.extendStyle.minWidth = 'unset';

DynamicTable.prototype.styleHandlers = {};


DynamicTable.prototype.styleHandlers.minWidth = {
    set: function (value) {
        var parsedValue = parseMeasureValue(value);
        if (!parsedValue) value = 'unset';
        else if (parsedValue.value === 'match_parent') value = '100%';
        else if (parsedValue.unit === 'px') value = parsedValue.value + parsedValue.unit;
        if (parsedValue && parsedValue.unit) {
            this.style.minWidth = value;
            this.addClass('as-has-min-width');
        }
        else {
            this.removeClass('as-has-min-width');
        }
        return value;
    }
};

DynamicTable.prototype.styleHandlers.width = {
    set: function (value) {
        var parsedValue = parseMeasureValue(value);
        if (!parsedValue) value = 'auto';
        else if (parsedValue.value === 'match_parent') value = '100%';
        else if (parsedValue.unit === 'px') value = parsedValue.value + parsedValue.unit;
        if (parsedValue && parsedValue.unit) {
            this.style.width = value;
            this.removeClass('as-width-auto');
        }
        else {
            this.addClass('as-width-auto');
        }
        return value;
    }
};

DynamicTable.prototype.styleHandlers.height = {
    set: function (value) {//todo: handle expression
        var parsedValue;
        if (value && value.indexOf && value.indexOf('--') > 0) {
            this.style.height = value;
        }
        else {
            parsedValue = computeMeasureExpression(value, { elt: this, parentSize: 0 });
            if (!parsedValue) value = 'auto';
            else if (parsedValue.value === 'match_parent') value = '100%';
            else if (parsedValue.unit === 'px') value = parsedValue.value + parsedValue.unit;
            if (parsedValue && parsedValue.unit) {
                this.style.height = value;
                this.removeClass('as-auto-height');
            }
            else {
                this.addClass('as-auto-height');
            }
        }

        return value;
    }
};

//
// DynamicTable.prototype.width = function (value) {
//     this.extendStyle.minWidth = value;
// };
//


DynamicTable.prototype.styleHandlers.tableLayout = {

    /***
     * @this {DynamicTable}
     * @param value
     */
    set: function (value) {
        if (value === 'fixed') {
            this.addClass('as-table-layout-fixed');
        }
        else {
            this.removeClass('as-table-layout-fixed');
            value = 'auto';
        }
        return value;
    }
};


DynamicTable.prototype.addStyle = function (arg0, arg1) {
    if ((typeof arg0 === "string") && (arg0 in this.extendStyle)) {
        if (arg0.indexOf('-') > 0) arg0 = kebabCaseToCamelCase(arg0);//not --
        this.extendStyle[arg0] = arg1;
    }
    else {
        AElement.prototype.addStyle.apply(this, arguments);
    }
    return this;
};


DynamicTable.prototype.requestUpdateSize = function () {
    this.layoutCtrl.onResize();
};

DynamicTable.prototype.revokeResource = function () {
    this.$attachhook.cancelWaiting();
    delete pendingTables[this._pendingId];
    this.css.stop();
    this.css = null;
    this.revokeResource = noop;
    return;
    var row, cell, keys, key;
    var rows = this._adapterData && this._adapterData.data && this._adapterData.data.body && this._adapterData.data.body.rows;
    // if (rows) {
    //     while (rows.length) {
    //         row = rows.pop();
    //         while (row.cells.length) {
    //             cell = row.cells.pop();
    //             keys = Object.keys(cell);
    //             while (keys.length){
    //                 key = keys.pop();
    //                 cell[key] = null;
    //                 delete cell[key];
    //             }
    //         }
    //     }
    // }
    // revokeResource(rows);

    if (this.table) {
        this.table.revokeResource();
        this.table = null;
    }
    if (this._adapter) {
        this._adapter.revoke();
        this._adapter = null;
    }
    this.attachSearchInput(null);
    this.filterInputs = [];
    this.waitingCtl = null;
    this.layoutCtrl = null;
    this.pointerCtrl = null;
    this.colSizeCtrl = null;
    this.rowDragCtrl = null;
    manager.removeTrash();
    ResizeSystem.removeTrash();

};

DynamicTable.prototype.getSavedState = function () {
    var res = {};
    res.scrollTop = this.$vscrollbar.innerOffset;
    res.scrollLeft = this.$hscrollbar.innerOffset;
    return res;
};

DynamicTable.prototype.setSavedState = function (state) {
    this.readySync.then(() => {
        state = state || {};
        this.$vscrollbar.innerOffset = state.scrollTop || 0;
        this.$hscrollbar.innerOffset = state.scrollLeft || 0;
        this.$hscrollbar.emit('scroll');
        this.$vscrollbar.emit('scroll');
    });
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


DynamicTable.prototype.rowIndexOf = function (o) {
    return this.table.body.rowIndexOf(o);
};


DynamicTable.prototype.getRows = function () {
    return this.table.body.rows.slice();
};

DynamicTable.prototype.requireRows = function (start, end) {
    return this.table.body.requireRows(start, end);
};

DynamicTable.prototype.clearRows = function () {
    return this.table.body.clearRows();
};

DynamicTable.prototype.viewIntoRow = function (row) {
    var counter = 300;
    var wait = () => {
        counter--;
        if (this.isDescendantOf(document.body)) {
            if (this.hasClass('as-adapt-infinity-grow') || !this.hasClass('as-overflow-y')) {
                row = this.rowOf(row);
                if (row) {
                    vScrollIntoView(row.elt);
                }
            }
            else {
                this.table.body.viewIntoRow(row);//TODO: CHECK MORE
            }
        }
        else if (counter > 0) {
            setTimeout(wait, 30);
        }

    }
    setTimeout(wait, 130);
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
        if (this.extendStyle) this.addStyle(this.extendStyle);
        setTimeout(() => {
            this.requestUpdateSize();
        }, 10);

        setTimeout(() => {
            this.requestUpdateSize();
        }, 30);

        setTimeout(() => {
            this.requestUpdateSize();
        }, 100);
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
        ResizeSystem.update();
        ResizeSystem.requestUpdateSignal();
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

DynamicTable.prototype.getColWidth = function () {
    return this.colSizeCtrl.getColWidth();
};

DynamicTable.prototype.setColWidth = function (colId, value) {
    return this.colSizeCtrl.setColWidth(colId, value);
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
    this.elt.$viewport.on('scroll', this.ev_viewportScroll);

    this.elt.on('wheel', this.ev_wheel);
    this.scrollingDir = Vec2.ZERO;
    this.scrollingStartOffset = Vec2.ZERO;
}

/***
 *
 * @param {WheelEvent} event
 */
LayoutController.prototype.ev_wheel = function (event) {
    var vScroller = findVScrollContainer(event.target);
    if (vScroller && vScroller.hasClass && vScroller.hasClass('as-bscroller')) return;
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
    if (this.elt.style.height === 'auto') {
        this.elt.removeStyle('height');
        this.elt.addClass('as-adapt-infinity-grow');
    }
    if (adapter.fixedCol > 0) {
        this.elt.addClass('as-has-fixed-col');
    }
    else {
        this.elt.removeClass('as-has-fixed-col');
    }
    if (adapter.rowsPerPage === Infinity) {
        this.elt.addClass('as-adapt-infinity-grow');
    }
    if (!adapter.data.head || !adapter.data.head.rows || !adapter.data.head.rows[0] || !adapter.data.head.rows[0].cells || !adapter.data.head.rows[0].cells[0]) {
        this.elt.addClass('as-headless');
    }
    else {
        this.elt.removeClass('as-headless');
    }
};

LayoutController.prototype.handleMinWidth = function () {
    var minWidth = this.elt.extendStyle.minWidth || this.elt.table.elt.getComputedStyleValue('min-width');

    var mv = parseMeasureValue(minWidth);
    if (!mv) return;
    if (mv.unit !== 'px') return;
    if (!this.elt.table.elt.firstChild || !this.elt.table.elt.firstChild.firstChild) return;
    var bound = this.elt.table.elt.firstChild.firstChild.getBoundingClientRect();
    if (bound.width >= mv.value) return;
    //copyElt
    var cells = this.elt.table.header.rows[0].cells;
    var freeCells = cells.filter(cell => {
        return !cell.data.style || !cell.data.style.width;
    });
    if (freeCells.length === 0) return;
    var cellWidths = freeCells.map(cell => cell.copyElt.getBoundingClientRect().width);
    var sumWidth = cellWidths.reduce((ac, w) => ac + w, 0);
    var needGrowUp = mv.value - bound.width;
    freeCells.forEach((cell, i) => {
        var width = cellWidths[i];
        var newWidth = width + width / sumWidth * needGrowUp;
        var paddingLeft = cell.copyElt.getComputedStyleValue('padding-left') || '0px';
        var paddingRight = cell.copyElt.getComputedStyleValue('padding-right') || '0px';
        paddingLeft = parseFloat(paddingLeft.replace('px', ''));
        paddingRight = parseFloat(paddingRight.replace('px', ''));

        cell.copyElt.addStyle('width', newWidth + 'px');
        cell.copyElt.addStyle('--as-force-min-width', newWidth - paddingLeft - paddingRight - 1 + 'px');
        cell.elt.addClass('as-col-width-auto');
        cell.copyElt.addClass('as-col-width-auto');
        cell.elt.addStyle('--as-force-min-width', newWidth - paddingLeft - paddingRight - 1 + 'px');
        if (cell._copyElt1) {
            cell._copyElt1.addStyle('--as-force-min-width', newWidth - paddingLeft - paddingRight - 1 + 'px');
            cell._copyElt1.addClass('as-col-width-auto');

        }
        if (cell._copyElt2) {
            cell._copyElt2.addClass('as-col-width-auto');
            cell._copyElt2.addStyle('--as-force-min-width', newWidth - paddingLeft - paddingRight - 1 + 'px');
        }
    });
};


LayoutController.prototype.handleDisplay = function () {
    if (!this.elt.hasClass('as-width-match-parent')) {
        return;
    }
    var tableWidth = this.elt.table.elt.getBoundingClientRect().width;
    var viewportWidth = this.elt.$viewport.getBoundingClientRect().width;
    if (tableWidth < viewportWidth - 17 && !this.elt.hasClass('as-table-layout-fixed')) {
        this.elt.table.elt.addStyle('width', viewportWidth - 17 + 'px');
    }
    if (!this.elt.hasClass('as-table-layout-fixed')) {
        this.elt.table.elt.addStyle('min-width', viewportWidth - 17 + 'px');
    }
};

LayoutController.prototype.onAttached = function () {
    ResizeSystem.updateUp(this.elt.parentElement);

    this.update();

    if (this.elt.table) {
        this.handleDisplay();
        this.handleMinWidth();
        this.elt.table.updateCopyEltSize();
        this.updateOverflowStatus();
        this.elt.$vscrollbar.once('scroll', () => {
            // return;
            setTimeout(() => {
                if (this.elt.table.body.rows.length === 0) return;
                var tableId = this.elt.id;

                var rows = this.elt.table.header.rows;
                if (!rows || rows.length === 0) return;
                var changed = false;
                var colDict = {};

                rows.forEach(row => {
                    var cells = row.cells;
                    if (!cells) return;
                    cells.forEach(cell => {
                        var colId = cell.data.id;
                        var bound;
                        if (cell.colspan > 1) return;
                        if (!colId && !colDict[cell.idx]) {//local style
                            bound = cell.copyElt.getBoundingClientRect();
                            if (bound.width > 0) {
                                this.elt.css.setProperty(`#${this.elt.id} th[data-col-idx="${cell.idx}"]:not(colspan)`, 'width', bound.width + 'px')
                                    .commit();
                            }

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
                })


                if (changed) manager.commit();
            }, 100);

        });
    }
};


LayoutController.prototype.update = function () {
    var stWidth = this.elt.extendStyle.width;
    var psWidth = parseMeasureValue(this.elt.extendStyle.width);
    var stHeight = this.elt.extendStyle.height;
    var psHeight = computeMeasureExpression(stHeight, {
        elt: this,
        parentSize: (this.elt.parentElement ? this.elt.parentElement.getBoundingClientRect().height : 0)
    });
    var cpStyle = getComputedStyle(this.elt);
    var psMaxHeight = parseMeasureValue(cpStyle.getPropertyValue('max-height'));
    var psMinWidth = parseMeasureValue(cpStyle.getPropertyValue('min-width'));
    var parentElt = this.elt.parentElement;
    var parentCpStyle;
    var parentBound;
    var screenSize;
    var singleView = (() => {
        var ctn = this.elt.parentElement && this.elt.parentElement.parentElement;
        if (!ctn) return false;
        if (!ctn.hasClass || !ctn.hasClass('absol-single-page-scroller-viewport')) return false;
        if (ctn.lastChild === ctn.firstChild && ctn.firstChild === this.elt) return singleView;
    })();
    var singleViewBound;
    var getMaxBoundHeight = () => {
        var mxH = Infinity;
        if (this.elt.hasClass('as-adapt-infinity-grow'))  return Infinity;
        if (!psHeight) {

        }
        else if (psHeight.unit === 'px') {
            mxH = psHeight.value;
        }
        else if (psHeight.unit === '%' && parentElt) {
            parentBound = parentBound || parentElt.getBoundingClientRect();
            mxH = parentBound.height * psHeight.value / 100;
        }
        else if (psHeight.unit === 'vh') {
            screenSize = screenSize || getScreenSize();
            mxH = screenSize.height * psHeight.value / 100;
        }

        if (psMaxHeight && psMaxHeight.unit === 'px') {
            mxH = Math.min(mxH, psMaxHeight.value);
        }
        return mxH;
    }

    var getMinInnerWidth = () => {
        var mnWidth = 0;
        var paddingLeft, paddingRight;
        if (!psWidth) {

        }
        else if (psWidth.unit === 'px') {
            mnWidth = psWidth.value;
        }
        else if (psWidth.unit === '%' && parentElt) {
            parentBound = parentBound || parentElt.getBoundingClientRect();
            parentCpStyle = parentCpStyle || getComputedStyle(parentElt);
            paddingLeft = parseFloat((parentCpStyle.getPropertyValue('padding-left') || '0px').replace('px', ''));
            paddingRight = parseFloat((parentCpStyle.getPropertyValue('padding-right') || '0px').replace('px', ''));
            mnWidth = (parentBound.width - paddingLeft - paddingRight) * psWidth.value / 100;
        }
        else if (psWidth.unit === 'vw') {
            screenSize = screenSize || getScreenSize();
            mnWidth = screenSize.width * psWidth.value / 100;
        }

        if (psMinWidth && psMinWidth.unit === 'px') {
            mnWidth = Math.max(mnWidth, psMinWidth.value);
        }
        return mnWidth;
    };


    var bound, tbBound;
    var maxHeight;
    if (!this.elt.table) return;
    if (stWidth === 'auto') {//table max-width is 100% of parentWidth
        this.elt.table.elt.addStyle('min-width', Math.max(getMinInnerWidth() - 17, 0) + 'px');
    }
    else if (psWidth.unit === 'px' || psWidth.unit === 'vw' || psWidth.unit === '%') {
        this.elt.table.elt.addStyle('min-width', getMinInnerWidth() - 17 + 'px');
        bound = this.elt.getBoundingClientRect();
        if (bound.width > 0 && !this.elt.table.body.offset) {//if overflowY this.elt.table.body.offset >0
            tbBound = this.elt.table.elt.getBoundingClientRect();
            // if (singleView) {
            //     // singleViewBound =
            // }
            // if (this.elt.parentElement && this.elt.parentElement.)
            maxHeight = getMaxBoundHeight();
            if (!maxHeight || maxHeight.value >= tbBound) {
                this.elt.table.elt.addStyle('min-width', getMinInnerWidth() + 'px');
                //isOverflowY = false;
            }
            else {
                //isOverflowY = true;
            }
        }
    }
};


LayoutController.prototype.onResize = function () {
    this.update();
    this.updateOverflowStatus();
    this.updateScrollbarStatus();
    if (this.elt.table) {
        this.elt.table.updateCopyEltSize();
        this.updateLines();
    }
};

LayoutController.prototype.updateOverflowStatus = function () {
    var contentBound = this.elt.table ? this.elt.table.elt.getBoundingClientRect() : { width: 0, height: 0 };

    var bound = this.elt.getBoundingClientRect();
    var cpStyle = getComputedStyle(this.elt);
    var psMaxHeight = parseMeasureValue(cpStyle.getPropertyValue('max-height'));
    if (bound.width < contentBound.width) {
        this.elt.addClass('as-overflow-x');
    }
    else {
        this.elt.removeClass('as-overflow-x');
        this.elt.$space.removeStyle('left');
    }

    if (this.elt.hasClass('as-adapt-infinity-grow')) {
        this.elt.removeClass('as-overflow-y');
        this.elt.$space.removeStyle('top');
    }
    else if (bound.height < contentBound.height || (psMaxHeight && psMaxHeight.unit === 'px' && bound.width < contentBound.width + 17 && psMaxHeight.value < contentBound.height + 18)) {
        this.elt.addClass('as-overflow-y');
    }
    else {
        this.elt.removeClass('as-overflow-y');
        this.elt.$space.removeStyle('top');
    }

    this.elt.addStyle('--dt-content-height', contentBound.height + 'px');
    this.elt.addStyle('--dt-content-width', contentBound.width + 'px');
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
    if (this.elt.$hscrollbar.innerOffset + this.elt.$hscrollbar.outerWidth > this.elt.$hscrollbar.innerWidth) {
        this.elt.$hscrollbar.innerOffset = Math.max(0, this.elt.$hscrollbar.innerWidth - this.elt.$hscrollbar.outerWidth);
        this.elt.$hscrollbar.emit('scroll');
    }
    if (tableBound.width < viewportBound.width) {
        this.elt.$vscrollbar.addStyle('right', viewportBound.width - tableBound.width + 'px');
    }
    else {
        this.elt.$vscrollbar.removeStyle('right');
    }

    // this.$vscrollbar
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
    if (!this.elt.table || !this.elt.table.body) return;
    this.elt.table.body.offset = this.elt.$vscrollbar.innerOffset;
    this.elt.$viewport.emit('scroll');
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

LayoutController.prototype.ev_viewportScroll = function (event) {
    if (this.elt.$viewport.scrollLeft !== 0) {
        this.elt.$hscrollbar.innerOffset += this.elt.$viewport.scrollLeft;
        this.elt.$viewport.scrollLeft = 0;
        this.elt.$hscrollbar.emit('scroll');
    }

    if (this.elt.$viewport.scrollTop !== 0) {
        this.elt.$vscrollbar.innerOffset += this.elt.$viewport.scrollTop / 30;//todo: better solution
        this.elt.$viewport.scrollTop = 0;
        this.elt.$vscrollbar.emit('scroll');
    }
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
    while (elt && elt !== this.elt) {
        if (elt.classList.contains('as-drag-zone')) return true;
        elt = elt.parentElement;
    }

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
    if (this.isInDragZone(event.target)) {
        event.preventDefault();
        this.destHandler = this.elt.rowDragCtrl;
    }
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
    var dir = event.currentPoint.sub(event.startingPoint).normalized();
    var ox = new Vec2(1, 0);
    var oy = new Vec2(0, 1);
    if (this.destHandler) {
        event.preventDefault && event.preventDefault();
        this.destHandler.ev_dragStart(event);
    }
    else if (event.isTouch && (Math.abs(dir.dot(ox)) < 0.3 || Math.abs(dir.dot(oy)) < 0.3)) {
        event.preventDefault && event.preventDefault();
        this.destHandler = this.elt.layoutCtrl;
        this.destHandler.ev_dragStart(event);
    }
    else {
        this.destHandler = null;
    }
};

PointerController.prototype.ev_drag = function (event) {
    if (this.destHandler) {
        event.preventDefault && event.preventDefault();
        this.destHandler.ev_drag(event);
    }
}

PointerController.prototype.ev_dragEnd = function (event) {
    if (this.destHandler) {
        event.preventDefault && event.preventDefault();
        this.destHandler.ev_dragEnd(event);
    }
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
    if (!this.elt.isDescendantOf(document.body)) return;
    this.dragOK = true;
    this.colId = event.target.parentElement.attr('data-col-id') || parseInt(event.target.parentElement.attr('data-col-idx'));
    this.cell = this.elt.table.header.rows[0].cells.find(cell => cell.data.id === this.colId || cell.idx === this.colId);
    if (!this.cell) {
        this.dragOK = false;
        return;
    }
    this.cellElt = this.cell.copyElt;
    this.startingBound = Rectangle.fromClientRect(this.cellElt.getBoundingClientRect());
};


ColSizeController.prototype.ev_drag = function (event) {
    if (!this.dragOK) return;
    if (!this.elt.isDescendantOf(document.body)) return;
    var newWidth = this.startingBound.width + event.currentPoint.sub(event.startingPoint).x;
    this.cellElt.addStyle('width', newWidth + 'px');
    this.elt.table.updateCopyEltSize();


    //todo: split code
    var viewportBound = this.elt.$viewport.getBoundingClientRect();
    var tableBound = this.elt.table.elt.getBoundingClientRect();
    if (tableBound.width < viewportBound.width) {
        this.elt.$vscrollbar.addStyle('right', viewportBound.width - tableBound.width + 'px');
    }
    else {
        this.elt.$vscrollbar.removeStyle('right');
    }
    this.elt.addStyle('--dt-content-height', tableBound.height + 'px');
    this.elt.addStyle('--dt-content-width', tableBound.width + 'px');
};


ColSizeController.prototype.ev_dragEnd = function (event) {
    if (!this.dragOK) return;
    if (!this.cell) return;
    if (!this.elt.isDescendantOf(document.body)) return;
    if (typeof this.colId === "string") {
        if (this.cell.colspan === 1)
            manager.commitColWidth(this.elt, this.elt.id, this.cell.data.id, this.cellElt.getBoundingClientRect().width, true);
        this.notifyColResize(event);
    }
    else {
        if (this.cell.colspan === 1)
            this.elt.css.setProperty(`#${this.elt.id} th[data-col-idx="${this.colId}"]:not([colspan])`, 'width', this.cellElt.getBoundingClientRect().width + 'px').commit();
    }
    this.elt.requestUpdateSize();
    setTimeout(() => {
        if (!this.cellElt.isDescendantOf(document.body)) return;
        this.cellElt.removeStyle('width');
        this.elt.requestUpdateSize();
    }, 150);
};

ColSizeController.prototype.getColWidth = function () {
    var res = {};
    this.elt.table.header.rows[0].cells.forEach(cell => {
        var id = cell.data.id;
        if (typeof id === "string" || typeof id === "number") id = '' + id;

        if (!id) return;
        Object.defineProperty(res, id, {
            enumerable: true,
            get: () => {
                return cell.copyElt.getBoundingClientRect().width;
            }
        })
    });

    return res;
};

ColSizeController.prototype.setColWidth = function (colId, value) {
    var cell = this.elt.table.header.rows[0].cells.find(cell => cell.data.id === colId || cell.idx === colId);
    cell.copyElt.removeStyle('width');
    if (typeof colId === "string") {
        if (cell.colspan !== 1)
            manager.commitColWidth(this.elt, this.elt.id, colId, value, true);
    }
    else {
        this.elt.css.setProperty(`#${this.elt.id} th[data-col-idx="${colId}"]:not([colspan])`, 'width', value + 'px').commit();
    }
    this.elt.requestUpdateSize();
};

ColSizeController.prototype.notifyColResize = function (originalEvent) {
    var event = {
        type: 'colresize',
        target: this,
        colId: this.colId,
        width: this.cellElt.getBoundingClientRect().width,
        originalEvent: originalEvent.originalEvent || event
    };
    var colWidth;
    Object.defineProperty(event, 'colWidth', {
        get: () => {
            if (colWidth) return colWidth;
            colWidth = this.getColWidth();

            return colWidth;
        }
    });

    this.elt.emit('colresize', event, this);
};

/**
 * new version
 * @param {DynamicTable} elt
 * @constructor
 */
function RowDragController(elt) {
    this.elt = elt;
    this._isDragging = false;
}

RowDragController.prototype._findRow = function (cElt) {
    while (cElt && cElt !== this.elt) {
        if (cElt.dtBodyRow) {
            return cElt.dtBodyRow;
        }
        cElt = cElt.parentElement;
    }
    return null;
}

RowDragController.prototype._getZIndex = function () {
    var e = this.elt.$fixedXYCtn;
    return findMaxZIndex(e);
};


RowDragController.prototype._updateClass = function () {
    this.row.body.rows.forEach((row, i) => {
        if (!row._elt) return;
        if (this.newIdx < this.rowIdx) {
            if (i < this.newIdx || i >= this.rowIdx) {
                row._elt.addStyle('transform', `translate(0, 0)`);
            }
            else if (i < this.rowIdx) {
                row._elt.addStyle('transform', `translate(0, ${this.rowRect.height}px)`);
            }
        }
        else if (this.newIdx > this.rowIdx) {
            if (i <= this.rowIdx || i > this.newIdx) {
                row._elt.addStyle('transform', `translate(0, 0)`);
                row._elt._transformY = this.rowRect.height;
            }
            else if (i <= this.newIdx) {
                row._elt.addStyle('transform', `translate(0, ${-this.rowRect.height}px)`);
                row._elt._transformY = -this.rowRect.height;
            }
        }
        else {
            row._elt.addStyle('transform', `translate(0, 0)`);
            row._elt._transformY = 0;
        }

    })
};


RowDragController.prototype._computeRowBound = function () {
    this.firstBoundIdx = this.elt.rowIndexOf(this.row.body.elt.firstChild);

    this.bounds = Array.prototype.map.call(this.row.body.elt.childNodes, (elt, i) => {
        var rect = Rectangle.fromClientRect(elt.getBoundingClientRect());
        rect.y -= elt._transformY || 0;
        return rect;
    });
};

RowDragController.prototype._computeNewIdx = function () {
    var firstBound = Rectangle.fromClientRect(this.row.body.elt.firstChild.getBoundingClientRect());
    var delta = firstBound.A().sub(this.bounds[0].A());
    var cBound = Rectangle.fromClientRect(this.ctn.getBoundingClientRect());
    var y0 = this.bounds[0].y + delta.y;
    var nearest = Infinity;
    this.newIdx = this.firstBoundIdx;
    var cur;
    var S = [];
    S['-1'] = 0;
    var i, y;
    for (i = 0; i < this.bounds.length; ++i) {
        S.push(S[i - 1] + this.bounds[i].height);
    }
    for (i = 0; i < this.bounds.length; ++i) {
        cur = this.firstBoundIdx + i;
        if (cur <= this.rowIdx) {
            y = y0 + S[i - 1];
        }
        else {
            y = y0 + S[i] - cBound.height;
        }
        if (nearest > Math.abs(cBound.y - y) + 0.1 && this.row.body.rows[cur].draggable) {
            nearest = Math.abs(cBound.y - y);
            this.newIdx = cur;
        }
    }


};


RowDragController.prototype.ev_dragStart = function (event) {
    if (this.elt.table.body.curentMode.name !== 'normal') return;
    this.elt.addClass('as-row-dragging');
    this.row = this._findRow(event.target);
    this.body = this.row.body;
    this.rowIdx = this.elt.rowIndexOf(this.row);
    this.newIdx = this.rowIdx;
    this.clonedTable = this._cloneTableRow(this.row);
    this.ctn = _({
        class: 'as-dt-body-row-cloned-ctn',
        style: {
            zIndex: this._getZIndex() + 20,
            cursor: 'move',
            opacity: 0.9
        },
        child: $(this._cloneTableRow(this.row)).removeStyle('transform')
    }).addTo(document.body);
    this.row.elt.addClass('as-dragging');
    this.rowRect = Rectangle.fromClientRect(this.row.elt.getBoundingClientRect());
    this.elt.addStyle('--dt-dragging-row-height', this.rowRect.height);
    this.viewportRect = Rectangle.fromClientRect(this.elt.$viewport.getBoundingClientRect());
    this.headerRect = Rectangle.fromClientRect(this.elt.$fixedYCtn.getBoundingClientRect());
    this.pointeroffset = event.startingPoint.sub(this.rowRect.A());
    this.ctn.addStyle({
        top: this.rowRect.y + 'px',
        left: this.rowRect.x + 'px'
    });
    this._computeRowBound();
    this._computeNewIdx();
    this._updateClass();
    this._isDragging = true;
};

RowDragController.prototype.ev_rowRenderChange = function () {
    if (!this._isDragging) return;
    this._computeRowBound();
    this._computeNewIdx();
    this._computeNewIdx();
    this._updateClass();
};

/**
 *
 * @param {DTBodyRow}row
 * @private
 */
RowDragController.prototype._cloneTableRow = function (row) {
    var tableElt = $(row.body.table.elt.cloneNode(false))
        .addStyle({ tableLayout: 'fixed', width: row.body.table.elt.getBoundingClientRect().width + 'px' });
    var tBodyElt = $(row.body.elt.cloneNode(false));
    tableElt.addChild(tBodyElt);
    var rowElt = $(this.row.elt.cloneNode(false)).addStyle({
        height: this.row.elt.getBoundingClientRect().height + 'px',
        backgroundColor: this.row.elt.getComputedStyleValue('background-color')
    });
    tBodyElt.addChild(rowElt);
    this.row.cells.forEach(cell => {
        var width = cell.elt.getBoundingClientRect().width;
        $(cell.elt.cloneNode(true)).addStyle({ width: width + 'px' }).addTo(rowElt);
    });
    return tableElt;
};


RowDragController.prototype.ev_drag = function (event) {
    var newY = event.currentPoint.sub(this.pointeroffset).y;
    this.ctn.addStyle('top', newY + 'px');
    clearTimeout(this._dragOutTO);

    var ctnBound = Rectangle.fromClientRect(this.ctn.getBoundingClientRect());
    var onDragOutPositive = () => {
        var dy = ctnBound.D().y - this.viewportRect.D().y;
        dy /= 1000 / 60 / 4 * this.rowRect.height;
        dy = Math.min(dy, this.elt.$vscrollbar.innerHeight - this.elt.$vscrollbar.outerHeight - this.elt.$vscrollbar.innerOffset);

        if (dy > 0.5) {//dy may be very small
            this.elt.$vscrollbar.innerOffset += dy;
            this.elt.$vscrollbar.emit('scroll');
        }
        this._computeNewIdx();
        this._updateClass();
        clearTimeout(this._dragOutTO);
        this._dragOutTO = setTimeout(onDragOutPositive, 33);
    };

    var onDragOutNegative = () => {
        var dy = ctnBound.y - this.headerRect.D().y;
        dy /= 1000 / 60 / 4 * this.rowRect.height;
        dy = Math.max(dy, -this.elt.$vscrollbar.innerOffset);
        if (dy < -0.5) {//dy may be very small
            this.elt.$vscrollbar.innerOffset += dy;
            this.elt.$vscrollbar.emit('scroll');
        }
        this._computeNewIdx();
        this._updateClass();
        clearTimeout(this._dragOutTO);
        this._dragOutTO = setTimeout(onDragOutNegative, 33);
    };
    if (this.viewportRect.D().y < ctnBound.D().y) {
        this._dragOutTO = setTimeout(onDragOutPositive, 1000 / 60);
    }
    else if (this.headerRect.D().y > ctnBound.y) {
        this._dragOutTO = setTimeout(onDragOutNegative, 100 / 60);
    }
    else {
        this._computeNewIdx();
        this._updateClass();
    }
};


RowDragController.prototype.ev_dragEnd = function (event) {
    this.elt.addClass('as-row-dragging');
    this.elt.removeClass('as-row-dragging');

    this.elt.removeStyle('--dragging-row-height');
    this.row.elt.removeClass('as-dragging');
    this._isDragging = false;
    clearTimeout(this._dragOutTO);
    this.ctn.remove();
    this.row.body.rows.forEach(row => {
        if (row._elt) {
            row._elt.removeStyle('transform');
            row._elt._transformY = 0;
        }
    });
    if (this.newIdx !== this.rowIdx) {
        this.row.body.moveRowAt(this.rowIdx, this.newIdx);

        var eventData = {
            type: 'orderchange',
            target: this.row,
            from: this.rowIdx,
            to: this.newIdx,
            originalEvent: event,
            row: this.row,
            data: this.row.data
        }
        if (this.row.data.on && this.row.data.on.orderchange) {
            this.row.data.on.orderchange.call(this.row, eventData, this.row)
        }
        this.elt.emit('orderchange', eventData, this.body.table.wrapper);
    }
};

function VirtualPageSelector(elt) {
    this.elt = elt;
}

VirtualPageSelector.prototype.getSelectedPage = function () {
    return this.elt.$vscrollbar.innerOffset / 25;
};

VirtualPageSelector.prototype.selectPage = function (value) {
    this.elt.$vscrollbar.innerOffset = value * 25;
    this.elt.$vscrollbar.emit('scroll');
};






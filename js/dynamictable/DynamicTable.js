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


/***
 * @extends AElement
 * @constructor
 */
function DynamicTable() {
    loadStyleSheet();
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
    })
    /***
     *
     * @type {DTDataTable||null}
     */
    this.adapter = null;

    this.waitingCtl = new DTWaitingViewController(this);
    this.layoutCtrl = new LayoutController(this);

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
        extendEvent: ['orderchange'],
        class: 'as-dynamic-table-wrapper',
        child: [

            {
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
}

/***
 *
 * @param {WheelEvent} event
 */
LayoutController.prototype.ev_wheel = function (event) {
    var isOverflowY = this.elt.hasClass('as-overflow-y');
    var isOverflowX = this.elt.hasClass('as-overflow-x');
    console.log(isOverflowX, isOverflowY)
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
};

LayoutController.prototype.onAttached = function () {
    if (this.elt.table) {
        this.elt.table.updateCopyEltSize();
        this.updateOverflowStatus();
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
    if (this.elt.hasClass('as-overflow-x') && this.elt.hasClass('as-has-fixed-col')) {

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


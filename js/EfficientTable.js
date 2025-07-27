import '../css/dynamictable.css';
import ACore, { $, _ } from "../ACore";
import { randomIdent, randomPhrase } from "absol/src/String/stringGenerate";
import DomSignal from "absol/src/HTML5/DomSignal";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import AElement from "absol/src/HTML5/AElement";
import { parseMeasureValue } from "absol/src/JSX/attribute";
import Rectangle from "absol/src/Math/Rectangle";
import safeThrow from "absol/src/Code/safeThrow";
import { isNaturalNumber, isRealNumber, revokeResource } from "./utils";
import noop from "absol/src/Code/noop";
import Attributes from "absol/src/AppPattern/Attributes";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import { AbstractStyleExtended } from "./Abstraction";

var execAsync = (commands, whileFunc) => {
    return commands.reduce((ac, act) => {
        if (whileFunc && !whileFunc()) return;
        if (ac && ac.then) {
            if (typeof act === "function") {
                return ac.then(act);
            }
            else {
                return ac.then(() => act);
            }
        }
        if (typeof act === 'function')
            return act(ac);
        else return act;
    }, null);
}

var getMaxRowCount = () => {
    var screenSize = getScreenSize();
    return Math.ceil(Math.max(2048, screenSize.height) / 40.0) * 3;
}

var waitAll = (variables, thenCb) => {
    var hasPromise = variables.findIndex(v => v && (typeof v.then === "function"));
    if (hasPromise >= 0) return Promise.all(variables).then(thenCb);
    else return thenCb(variables);
}

var waitValue = (value, thenCb) => {
    if (value && (typeof value.then === "function")) {
        return value.then(thenCb);
    }
    else return thenCb(value);
}

/**
 * @extends AElement
 * @constructor
 */
function EfficientTable() {
    this.layoutCtrl = new ETLayoutController(this);
    this.fixHeaderCtrl = new ETFixHeaderController(this);
    this._adapter = null;
    this.table = null;
    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.requestUpdateSize = this.layoutCtrl.requestUpdateSize.bind(this);
    this.colWidth = new ETColWidthDeclaration(this);
    AbstractStyleExtended.call(this);
    /**
     * @name adapter
     * @type {ETAdapter}
     * @memberof EfficientTable#
     */

    //if available width bigger than sum of width, use min-width ins  width
}

mixClass(EfficientTable, AbstractStyleExtended);

EfficientTable.prototype.styleHandlers.tableLayout = {
    set: function (value) {

    },
};

EfficientTable.prototype.styleHandlers.width = {
    set: function (value, ref) {
        ref.set(value);
        if (this.table) {
            this.table.handleStyle();
        }
        return value;
    },
};

EfficientTable.tag = 'EfficientTable'.toLowerCase();

EfficientTable.render = function (data, domDesc) {
    var width = domDesc.style && domDesc.style.width;
    var classList = ['as-efficient-table-wrapper'];
    if (width === 'match_parent') {
        classList.push('as-width-match-parent');
    }

    var id = domDesc.id || (domDesc.attr && domDesc.attr.id) || 'no-id-' + randomIdent(10);
    return _({
        id: id,
        extendEvent: ['colresize'],
        class: classList,
        props: {
            extendStyle: domDesc.style
        },
        child: [
            {
                class: 'as-dynamic-table-fixed-y-ctn'
            }
        ]
    });
};


EfficientTable.prototype.getColWidth = function () {
    var table = this.table;
    if (!table) return null;
    if (arguments.length === 0) return this.colWidth.export();
    else return this.colWidth.getProperty(...arguments);
};

EfficientTable.prototype.setColWidth = function () {
    var table = this.table;
    if (!table) return null;
    if (arguments.length === 0) Object.assign(this.colWidth);
    else this.colWidth.setProperty(...arguments);
};


/**
 *
 * @param {string|number|function}arg
 */
EfficientTable.prototype.findRow = function (arg) {
    if (this.table) {
        return this.table.body.findRow(arg);
    }
    return null;
};


EfficientTable.prototype.requestUpdateSize = function () {
    this.layoutCtrl.requestUpdateSize();
};

EfficientTable.prototype.notifyDataSheetChange = function () {
    if (this.adapter) this.adapter.notifyDataSheetChange();
};

EfficientTable.prototype.notifyRowModifiedAt = function (idx) {
    if (this.adapter) this.adapter.notifyRowModifiedAt(idx);
};

EfficientTable.prototype.notifyRowRemoveAt = function (idx) {
    if (this.adapter) this.adapter.notifyRowRemoveAt(idx);
};

EfficientTable.prototype.notifyAddRowAt = function (idx) {
    if (this.adapter) this.adapter.notifyAddRowAt(idx);
};


EfficientTable.prototype.revokeResource = function () {
    this.fixHeaderCtrl.revokeResource();
    //todo: revoke all resource
};


EfficientTable.property = {};

EfficientTable.property.adapter = {
    set: function (value) {
        this.colWidth.revokeResource();
        this.fixHeaderCtrl.reset();
        this._adapter = new ETAdapter(this, value);
        this.table = new ETTable(this, this._adapter.data);
        this.addChild(this.table.elt);
        this._adapter.notifyDataSheetChange();
        this.colWidth = new ETColWidthDeclaration(this);
    },
    get: function () {
        return this._adapter;
    }
};

export default EfficientTable;

ACore.install(EfficientTable);


// ETAdapter.prototype.

/**
 *
 * @param {EfficientTable} elt
 * @constructor
 */
function ETFixHeaderController(elt) {
    this.elt = elt;
    this.$cloneTable = null;
    this.$cloneHead = null;
}

ETFixHeaderController.prototype.updateSize = function () {

};

ETFixHeaderController.prototype.reset = function () {
    if (this.isWrapped) {

    }
};

ETFixHeaderController.prototype.revokeResource = function () {
    this.revokeResource = noop;
    this.elt = null;

}


/**
 *
 * @param {EfficientTable} elt
 * @constructor
 */
function ETLayoutController(elt) {
    this.elt = elt;
    /***
     *
     * @type {SearchTextInput|null}
     */
    this.$searchInput = null;
    /***
     *
     * @type {AElement}
     */
    this.$table = $('.as-dynamic-table', elt);
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

    this.$attachhook = _('attachhook').addTo(elt);
    this.domSignal = new DomSignal(_('attachhook').addTo(elt));
    //controller
    this.$fixedYCtn = $('.as-dynamic-table-fixed-y-ctn', elt);


    // this.$attachhook.requestUpdateSize = this.fixedContentCtrl.updateSize.bind(this.fixedContentCtrl);
    this.$attachhook.requestUpdateSize = this.requestUpdateSize.bind(this);
    this.$attachhook.on('attached', () => {
        ResizeSystem.add(this.$attachhook);
        this.onAttached();
        this.onAttached();
        // manager.add(this);
        setTimeout(() => {
            this.requestUpdateSize();
        }, 10);

    });

    this.ev_scroll = this.ev_scroll.bind(this);
    this.$BindedScrollers = [];
    this.stopScrollTO = -1;
    this.obs = new IntersectionObserver(()=>{
        if (this.elt.isDescendantOf(document.body)) {
            this.requestUpdateSize();
        }
        else if (this.obs) {
            this.obs.disconnect();
            this.obs = null;
        }
    }, {root: document.body});
    this.obs.observe(this.elt);

}

ETLayoutController.prototype.onAttached = function () {
    this.bindScroller();
};

ETLayoutController.prototype.requestUpdateSize = function () {
    var bound = this.elt.table.elt.getBoundingClientRect();
    var tcs = this.elt.table.head.templateColumSum;
   if (tcs < bound.width - this.elt.table.head.templateColums.length) {
       this.elt.addClass('as-up-size-columns');
   }
   else {
       this.elt.removeClass('as-up-size-columns');
   }
    this.elt.table.body.updateYOffset(true);
    var beforeRect = this.elt.table.body.size;
    this.viewSize();
    this.viewByScroll();
    this.elt.table.body.calcSize();
    var newRect = this.elt.table.body.size;
    if (newRect.width !== beforeRect.width || newRect.height !== beforeRect.height) {
        ResizeSystem.updateUp(this.elt.parentElement);
    }
};

ETLayoutController.prototype.viewSize = function () {
    this.elt.table.calcSize();
    var size = this.elt.table.size;
    if (size.trueValue) {
        this.elt.addClass('as-true-size');
    }
    this.elt.addStyle('height', (size.height + 1) + 'px');

};

ETLayoutController.prototype.bindScroller = function () {
    var p = this.elt.parentElement;
    while (p) {
        p.addEventListener('scroll', this.ev_scroll);
        this.$BindedScrollers.push(p);
        p = p.parentElement;
    }
    document.addEventListener('scroll', this.ev_scroll);
    this.$BindedScrollers.push(document);
};


ETLayoutController.prototype.unBindScroller = function () {
    while (this.$BindedScrollers.length) {
        this.$BindedScrollers.pop().removeEventListener('scroll', this.ev_scroll);
    }
};

ETLayoutController.prototype.viewByScroll = function () {
    if (!this.elt.table) return;
    if (this.elt.table.size.trueValue) return;
    var bound = this.elt.getBoundingClientRect();
    var outbound = traceOutBoundingClientRect(this.elt);//todo: small than scroller
    var head = this.elt.table.head;
    var hs = 0;
    if (bound.top >= outbound.top) {
        hs = 0;
        this.elt.table.elt.addStyle('top', 0);
        return;
    }
    else if (bound.bottom < outbound.bottom) {
        hs = 1;
    }
    else {
        hs = (outbound.top - (bound.top + head.size.height)) / (bound.height - head.size.height - outbound.height);
    }

    var rowLNIdx = this.elt.adapter.length * hs;
    var y = outbound.top + head.size.height + hs * (outbound.height - head.size.height);
    var rowIdx = Math.floor(rowLNIdx);
    if (hs === 1) rowIdx = this.elt.adapter.length - 1;
    var body = this.elt.table.body;
    var currentOffset = body.rowOffset;
    this.elt.table.body.requestVisible(rowIdx);
    this.elt.table.body.waitLoaded(() => {
        if (currentOffset !== body.rowOffset) return;
        this.elt.table.body.updateYOffset();
        var row = body.rows[rowIdx - body.rowOffset];
        if (!row) return;//out of date, don't update
        var rowLNY = row.offsetY + row.offsetHeight * hs;
        var dy = y - bound.top - rowLNY - hs;//hs for border 1px
        this.elt.table.elt.addStyle('top', dy + 'px');
    });
}


ETLayoutController.prototype.ev_scroll = function () {
    this.viewByScroll();
    clearTimeout(this.stopScrollTO);
    this.stopScrollTO = setTimeout(() => {
        this.viewByScroll();
    }, 100);
};

/**
 *
 * @param elt
 * @param adapterData
 * @constructor
 */
function ETAdapter(elt, adapterData) {
    this.elt = elt;
    this.data = adapterData.data;
    this.raw = adapterData;
    this.asyncSession = Math.random();
    this.sync = null;
}

ETAdapter.prototype.notifyDataSheetChange = function () {
    var asyncSession = Math.random();
    this.asyncSession = asyncSession;
    var cmdArr = [
        () => this.getLength(),
        () => {
            var body = this.elt.table.body;
            var head = this.elt.table.head;
            body.clear();
            body.drawFrom(0);
            var makeSize = () => {
                body.waitLoaded(() => {
                    body.updateYOffset(true);
                    this.elt.layoutCtrl.requestUpdateSize();

                });
            }
            if (this.elt.isDescendantOf(document.body)) {
                makeSize();
            }
            else {
                this.elt.$attachhook.once('attached', makeSize);
            }
        }
    ];
    execAsync(cmdArr, () => this.asyncSession === asyncSession);
};

ETAdapter.prototype.notifyRowModifiedAt = function (idx) {
    this.sync = execAsync([
        this.sync,
        () => {
            this.elt.table.body.modifiedRowAt(idx);
            if (this.elt.isDescendantOf(document.body)) {
                this.elt.table.body.waitLoaded(() => {
                    this.elt.layoutCtrl.requestUpdateSize();
                });
            }
        }
    ]);
};

ETAdapter.prototype.notifyRowRemoveAt = function (idx) {
    this.sync = execAsync([
        this.sync,
        () => this.getLength(),
        () => {
            this.elt.table.body.removeRowAt(idx);
            if (this.elt.isDescendantOf(document.body)) {
                this.elt.table.body.waitLoaded(() => {
                    this.elt.layoutCtrl.requestUpdateSize();
                });
            }
        }
    ]);
};

ETAdapter.prototype.notifyAddRowAt = function (idx) {
    this.sync = execAsync([
        this.sync,
        () => this.getLength(),
        () => {
            this.elt.table.body.addRowAt(idx);
            if (this.elt.isDescendantOf(document.body)) {
                this.elt.table.body.waitLoaded(() => {
                    this.elt.layoutCtrl.viewSize();
                });
            }
        }
    ]);
};


ETAdapter.prototype.getLength = function () {
    return execAsync([() => {
        var body = this.raw.data.body;
        var length;
        if (typeof body.length === "number") {
            length = body.rows.length;
        }
        else if (body.length && body.length.then) {
            length = body.length;
        }
        else if (typeof body.getLength === "function") {
            try {
                length = this.raw.data.body.getLength(this);

            } catch (e) {
                safeThrow(e);
            }
        }
        else if (body.rows) length = body.rows.length;
        return length;
    },
        l => {
            this.length = l;
            return l;
        }]);

};

ETAdapter.prototype.getRowAt = function (idx) {
    var data;
    var body = this.raw.data.body;

    if (typeof body.getRowAt === "function") {
        try {
            data = body.getRowAt(idx, this);
        } catch (e) {
            safeThrow(e);
        }
    }
    else if (body.rows) data = body.rows[idx];
    return data;
};

ETAdapter.prototype.renderHeadCell = function (elt, data, controller) {
    if (data.child) {
        if (data.child.map) {
            elt.addChild(data.child.map(function (it) {
                return _(it);
            }));
        }
        else {
            elt.addChild(_(data.child));
        }
    }
    if (data.render) {
        data.render.call(null, elt, data, controller);
    }
};

ETAdapter.prototype.renderBodyCell = function (elt, data, idx, controller) {
    var body = this.raw.data.body;
    var template = body.rowTemplate;
    var cellTpl = template.cells[idx];
    if (cellTpl.child) {
        if (cellTpl.child.map) {
            elt.addChild(cellTpl.child.map(function (it) {
                return _(it);
            }));
        }
        else {
            elt.addChild(_(cellTpl.child));
        }
    }
    if (cellTpl.render) {
        cellTpl.render.call(null, elt, data, controller);
    }
    if (cellTpl.style) elt.addStyle(cellTpl.style);
};

ETAdapter.prototype.getRowLength = function () {
    var body = this.raw.data.body;
    var template = body.rowTemplate;
    return template.cells.length;
};


/**
 *
 * @param {EfficientTable} wrapper
 * @param data
 * @constructor
 */
function ETTable(wrapper, data) {
    this.trace = new Error();
    this.wrapper = wrapper;
    this.adapter = this.wrapper.adapter;
    this.data = data;
    this.head = new ETHead(this, this.data.head);
    this.body = new ETBody(this, this.data.body);

    this.elt = _({
        tag: 'table',
        class: 'as-dynamic-table',
        child: [
            this.head.elt,
            this.body.elt
        ]
    });
    this.handleStyle();
    this.size = new Rectangle(0, 0, 0, 0);
    this.size.trueValue = false;
}


ETTable.prototype.handleStyle = function () {
    var style = this.wrapper.extendStyle;
    var value;
    if (style.width) {
        value = parseMeasureValue(style.width);
        if (value) {
            if (value.unit === '%') {
                this.wrapper.style.setProperty('width', value);
                this.elt.addStyle('width', '100%');
            }
        }

    }
};

ETTable.prototype.calcSize = function () {
    this.head.calcSize();
    this.body.calcSize();
    this.size = this.head.size.clone();
    this.size.height += this.body.size.height;
    this.size.trueValue = this.body.size.trueValue;
};


/**
 *
 * @param {ETTable} table
 * @param data
 * @constructor
 */
function ETHead(table, data) {
    this.table = table;
    this.data = data || {};
    if (!this.data.rows) this.data.rows = [];
    this.rows = this.data.rows.map(rowData => new ETHeadRow(this, rowData));
    this.elt = _({
        tag: 'thead',
        class: 'as-dt-header',
        child: this.rows.map(it => it.elt)
    });
    this.size = new Rectangle(0, 0, 0, 0);
    this.calcTemplateColumns();
}


ETHead.prototype.calcSize = function () {
    var bound = this.elt.getBoundingClientRect();
    this.size = Rectangle.fromClientRect(bound);
};

ETHead.prototype.calcTemplateColumns = function () {
    var row;
    var rows = this.rows;
    var cell, i, j, l;
    var k = 0;
    var template = [];
    var value;
    var cHeights = Array(20).fill(0);
    for (i = 0; i < rows.length; ++i) {
        row = rows[i];
        k = 0;
        for (j = 0; j < row.cells.length; ++j) {
            cell = row.cells[j];
            while (cHeights[k] > i) k++;
            while (template < k) template.push(undefined);
            value = undefined;
            if (cell.colspan === 1 && cell.data && cell.data.style) {
                if (cell.data.style.width) {
                    value = { width: cell.data.style.width };
                }
                else if (cell.data.style.maxWidth) {
                    value = {
                        maxWidth: cell.data.style.maxWidth,
                        width: cell.data.style.maxWidth,
                        applyBodyCell: true
                    };
                }
                if (value)
                    template[k] = value;
            }
            for (l = 0; l < cell.colspan; l++) {
                cHeights[k] = Math.max(cHeights[k], i + cell.rowspan);
                k++;
            }
        }
    }
    this.templateColums = template;
    this.templateColumSum = template.reduce((ac, it) => {
        if (!it) return Infinity;
        var width = it.width;
        var psWidth = parseMeasureValue(width);
        if (!psWidth) return Infinity;
        if (psWidth.unit !== 'px') return Infinity;
        return  ac+ psWidth.value;
    }, 0);
};

/**
 *
 * @param {ETHead} head
 * @param data
 * @constructor
 */
function ETHeadRow(head, data) {
    this.head = head;
    this.data = data || {};
    if (!this.data.cells) this.data.cells = [];
    this.cells = this.data.cells.map(cellData => new ETHeadCell(this, cellData))
    this.elt = _({
        tag: 'tr',
        class: 'as-dt-header-row',
        child: this.cells.map(it => it.elt)
    });
}


function ETHeadCell(row, data) {
    this.row = row;
    this.data = data || {};
    this.colspan = 1;
    this.rowspan = 1;
    this.elt = _({
        tag: 'th',
        class: 'as-dt-header-cell'
    });
    if (data.attr && isNaturalNumber(data.attr.colspan)) {
        this.elt.attr('colspan', data.attr.colspan);
        this.colspan = data.attr.colspan;
    }
    if (data.attr && isNaturalNumber(data.attr.rowspan)) {
        this.elt.attr('rowspan', data.attr.rowspan);
        this.rowspan = data.attr.rowspan;
    }
    var style = Object.assign({}, data.style || {});
    if (style.maxWidth) {
        this.elt.addClass('as-has-width').addClass('as-exact-width');
        style['--width'] = style.maxWidth;
        delete style.maxWidth;
    }
    if (style.width) {
        this.elt.addClass('as-has-width');
        style['--width'] = style.width;
        delete style.width;
    }
    this.elt.addStyle(style);
    this.row.head.table.adapter.renderHeadCell(this.elt, this.data, this);
}


/**
 *
 * @param {ETTable} table
 * @param data
 * @constructor
 */
function ETBody(table, data) {
    this.data = data;
    this.table = table;
    this.elt = _({
        tag: 'tbody',
        class: 'as-dt-body'
    });

    this.rowOffset = 0;
    this.rows = [];
    /**
     *
     * @type {Rectangle|{trueValue:boolean}}
     */
    this.size = new Rectangle(0, 0, 0, 0);
    this.size.trueValue = false;

    this.needUpdateYOffset = false;
    this.sync = null;
}


ETBody.prototype.clear = function () {
    this.rowOffset = 0;
    var row;
    while (this.rows.length) {
        row = this.rows.shift();
        this.rowOffset++;
        row.elt.remove();
        row.revokeResource();
    }
    this.needUpdateYOffset = true;
};


ETBody.prototype.removeRowAt = function (idx) {
    var localIdx = idx - this.rowOffset;
    var row = this.rows[localIdx];
    if (!row) return false;
    row.elt.selfRemove();
    this.rows.splice(localIdx, 1);
    row.revokeResource();
    for (var i = 0; i < this.rows.length; ++i) {
        this.rows[i].updateIdx(i + this.rowOffset);
    }
    this.drawFrom(this.rowOffset);
};


ETBody.prototype.modifiedRowAt = function (idx) {
    var localIdx = idx - this.rowOffset;
    var row = this.rows[localIdx];
    if (!row) return false;
    var newRow = new ETBodyRow(this, this.table.wrapper.adapter.getRowAt(idx));
    newRow.updateIdx(idx);
    this.rows[localIdx] = newRow;
    row.elt.selfReplace(newRow.elt);
    this.needUpdateYOffset = true;
};

ETBody.prototype.addRowAt = function (idx) {
    var localIdx = idx - this.rowOffset;
    var row = this.rows[localIdx];
    if (!row) return false;
    var newRow = new ETBodyRow(this, this.table.wrapper.adapter.getRowAt(idx));
    this.rows.splice(localIdx, 0, newRow);
    row.elt.parentElement.addChildBefore(newRow.elt, row.elt);
    for (var i = 0; i < this.rows.length; ++i) {
        this.rows[i].updateIdx(i + this.rowOffset);
    }
    this.needUpdateYOffset = true;
};


ETBody.prototype.requestVisible = function (idx) {
    var maxRow = getMaxRowCount();
    var length = this.table.wrapper.adapter.length;
    var pageIdx;
    var pageN = Math.ceil(Math.max(length / (maxRow / 3)));
    idx = Math.max(0, idx);
    idx = Math.min(length - 1, idx);

    pageIdx = Math.floor(idx / (maxRow / 3));
    pageIdx = Math.min(pageN - 3, pageIdx - 1);
    pageIdx = Math.max(0, pageIdx);
    this.drawFrom(pageIdx * Math.floor(maxRow / 3));
};


ETBody.prototype.drawFrom = function (idx) {
    var adapter = this.table.wrapper.adapter;
    var maxRowCount = getMaxRowCount();
    idx = Math.max(0, idx);
    var endIdx = Math.min(idx + maxRowCount, adapter.length);
    idx = Math.max(0, Math.min(endIdx - 1, idx));

    var row;
    while (this.rowOffset + this.rows.length > idx + maxRowCount && this.rows.length) {
        row = this.rows.pop();
        row.elt.remove();
    }

    while (this.rowOffset < idx && this.rows.length) {
        row = this.rows.shift();
        this.rowOffset++;
        row.elt.remove();
        row.revokeResource();
        this.needUpdateYOffset = true;
    }

    if (this.rows.length === 0) this.rowOffset = Math.min(adapter.length, idx + 1);
    var newRows = [];
    var newRow;
    while (this.rowOffset > idx && this.rowOffset > 0) {
        this.rowOffset--;
        newRow = new ETBodyRow(this, adapter.getRowAt(this.rowOffset));
        newRows.push(newRow);
        newRow.updateIdx(this.rowOffset);
        this.rows.unshift(newRow);
        this.elt.addChildBefore(newRow.elt, this.elt.firstChild);
        this.needUpdateYOffset = true;
    }

    while (this.rowOffset + this.rows.length < endIdx) {
        newRow = new ETBodyRow(this, adapter.getRowAt(this.rowOffset + this.rows.length));
        newRow.updateIdx(this.rowOffset + this.rows.length);
        newRows.push(newRow);
        this.rows.push(newRow);
        this.elt.addChild(newRow.elt);
        this.needUpdateYOffset = true;
    }

};

/**
 *
 * @param {boolean} force
 */
ETBody.prototype.updateYOffset = function (force) {
    if (!this.needUpdateYOffset && !force) return;
    this.needUpdateYOffset = false;
    var tableBound = this.table.elt.getBoundingClientRect();
    this.rows.forEach((row) => {
        row.calcSize();
        var rowBound = row.size;
        row.offsetY = rowBound.y - tableBound.top;
        row.offsetHeight = rowBound.height;
    });
};

ETBody.prototype.calcSize = function () {
    var adapter = this.table.wrapper.adapter;
    var bound = this.elt.getBoundingClientRect();
    if (this.rows.length === adapter.length) {
        this.size = Rectangle.fromClientRect(bound);
        this.size.trueValue = true;
    }
    else {
        this.size = Rectangle.fromClientRect(bound);
        this.size.height = bound.height / this.rows.length * adapter.length;
        this.size.trueValue = false;
    }
};


ETBody.prototype.waitLoaded = function (cb) {
    waitAll(this.rows.map(row => row.data), cb);
};

function ETBodyRow(body, data) {
    this.elt = _({
        tag: 'tr',
        class: 'as-dt-body-row'
    });
    this.offsetY = 0;
    this.data = data;
    this.body = body;
    this.idx = 0;
    this.$idx = undefined;
    waitValue(this.data, data => {
        this.data = data;
        var adapter = body.table.wrapper.adapter;
        var length = adapter.getRowLength();
        this.cells = Array(length).fill(null).map((u, i) => new ETBodyCell(this, i));
        this.elt.addChild(this.cells.map(cell => cell.elt));
        this.$idx = $('.as-dt-row-index', this.elt) || null;
        if (this.$idx)
            this.$idx.attr('data-idx', this.idx + 1);
        if (data.on && (data.on.click)) {
            this.elt.on('click', (event) => {
                data.on.click.call(this.elt, event, this);
            });
        }
        if (adapter.data.body.rowTemplate.on && (typeof adapter.data.body.rowTemplate.on.click === "function")) {
            this.elt.on('click', (event) => {
                adapter.data.body.rowTemplate.on.click.call(this.elt, event, this);
            });
        }
    });
    this.size = new Rectangle(0, 0, 0, 0);
    // this.cells = data.cells.map(cell => new ETBodyCell(this, cell));
    /**
     * @name adapter
     * @type {ETAdapter}
     * @memberof ETBodyRow#
     */
}

ETBodyRow.prototype.updateIdx = function (value) {
    this.idx = value;
    if (!this.cells) return;
    if (this.$idx === undefined) this.$idx = $('.as-dt-row-index', this.elt) || null;
    if (this.$idx)
        this.$idx.attr('data-idx', this.idx + 1);

};

ETBodyRow.prototype.calcSize = function () {
    this.size = Rectangle.fromClientRect(this.elt.getBoundingClientRect());
};


ETBodyRow.prototype.notifyRemove = function () {
    if (this.adapter)
        this.adapter.notifyRowRemoveAt(this.idx);
};

ETBodyRow.prototype.notifyModified = function () {
    if (this.adapter)
        this.adapter.notifyRowModifiedAt(this.idx);
}

ETBodyRow.prototype.revokeResource = function () {
    // return;
    this.revokeResource = noop;
    revokeResource(this.elt);
    delete this.elt;
    this.body = null;
    this.notifyRemove = noop;
};


Object.defineProperty(ETBodyRow.prototype, 'adapter', {
    /**
     *
     * @returns {ETAdapter}
     */
    get: function () {
        return this.body && this.body.table.wrapper && this.body.table.wrapper.adapter;
    }
})

function ETBodyCell(row, idx) {
    this.elt = _({
        tag: 'td',
        class: 'as-dt-body-cell'
    });
    this.row = row;
    var adapter = this.row.body.table.wrapper.adapter;
    adapter.renderBodyCell(this.elt, row.data, idx, this);
    var tc = this.row.body.table.head && this.row.body.table.head.templateColums[idx];
    if (tc && tc.applyBodyCell) {
        this.elt.addStyle(tc);
    }
}


/**
 * @extends Attributes
 * @param {EfficientTable} elt
 * @constructor
 */
function ETColWidthDeclaration(elt) {
    Attributes.call(this, this);

    if (!elt.table) return;
    var temp = elt.table.head.rows.reduce((ac, row) => {
        var l = row.cells.reduce((ac1, cell) => {
            var colspan = cell.data.attr && (cell.data.attrs.colspan || cell.data.attrs.colSpan);
            colspan = parseInt(colspan + '', 10);
            if (!isNaturalNumber(colspan) || !colspan) colspan = 1;
            var id = cell.data.id;
            if (id && (typeof id === "string")) {
                ac.id2idx[id] = ac1;
            }
            if (colspan === 1) {
                if (!ac.idx2cells[ac1]) ac.idx2cells[ac1] = [];
                ac.idx2cells[ac1].push(cell);
            }


            return ac1 + colspan;
        }, 0);

        ac.length = (Math.max(ac.length, l));
        return ac;
    }, { length: 0, id2idx: {}, idx2cells: {} });


    Array(temp.length).fill(0).forEach((u, i) => {
        this.defineProperty('' + i, {
            set: function (value, ...args) {
                var unit;
                if (args.length > 1) unit = args[0];
                var headWith;
                var originValue = this.getProperty('' + i);
                var pOValue = parseMeasureValue(originValue);
                if (isRealNumber(value) && value >0) {
                    value = value+'px';
                }
                else if (!isRealNumber(value) || value < 0) {
                    value = 'auto';
                }
                else if (unit === 'px') {
                    if (pOValue.unit === '%') {
                        headWith = elt.table.head.elt.getBoundingClientRect().width;
                        value = value / headWith * 100 + '%';
                    }
                    else {
                        value = value + 'px';
                    }
                }
                else if (unit === '%') {
                    headWith = elt.table.head.elt.getBoundingClientRect().width;
                    if (pOValue.unit === 'px') {
                        value = value / 188 * headWith;
                    }
                    else {
                        value = value + '%';
                    }
                }

                if (typeof value === "number") value = value + 'px';
                var cells = temp.idx2cells[i] || [];
                cells.forEach(cell => {
                    if (value === 'auto') {
                        if (cell.data.style) {
                            delete cell.data.style.width;
                            cell.elt.removeStyle('width');
                        }
                    }
                    else {
                        if (!cell.data.style) cell.data.style = {};
                        cell.data.style.width = value;
                        cell.elt.addStyle('width', value);
                    }
                });

            },
            get: function (...args) {
                var unit;
                if (args.length > 1) unit = args[0];
                var ref = args[args.length - 1];
                var value = ref.get();
                var cells = temp.idx2cells[i] || [];
                if (cells.length === 0) return 0;
                if (unit === 'px') {
                    value = cells[0].elt.getBoundingClientRect().width;
                }
                else if (unit === '%') {
                    value = cells[0].elt.getBoundingClientRect().width / elt.table.head.elt.getBoundingClientRect().width * 100;
                }
                else {
                    value = cells.reduce((ac, cell) => {
                        var pValue;
                        if (cell.data.style && cell.data.style.width) {
                            pValue = parseMeasureValue(cell.data.style.width);
                            if (!pValue || pValue.unit !== 'px') return ac;
                            return pValue.value;
                        }
                        return ac;
                    }, 'auto');
                }
                return value;
            }
        })
    });

    Object.keys(temp.id2idx).forEach(id => {
        var idx = temp.id2idx[id];
        this.defineProperty(id, {
            set: function (...args) {
                return this.setProperty(idx, ...args);
            },
            get: function (...args) {
                return this.getProperty(idx, ...args);
            }
        });
    });
}


OOP.mixClass(ETColWidthDeclaration, Attributes);

Object.defineProperty(ETColWidthDeclaration.prototype, 'revokeResource', {
    value: function () {
        delete this.$node;
        delete this.revokeResource;
    },
    writable: true,
    enumerable: false,
    configurable: true
})



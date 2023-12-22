import ACore, { _, $ } from "../../ACore";
import TTDataAdapter from "./TTDataAdapter";
import noop from 'absol/src/Code/noop';
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import '../../css/treetable.css';
import TTQueryController from "./TTQueryController";
import { formatDateTime } from "absol/src/Time/datetime";
import LinearColorTinyBar from "../LinearColorTinyBar";
import { findVScrollContainer, keyStringOf } from "../utils";
import { parseMeasureValue } from "absol/src/JSX/attribute";
import Rectangle from "absol/src/Math/Rectangle";
import { ShareSerializer } from "absol/src/Print/printer";
import Hanger from "../Hanger";
import Vec2 from "absol/src/Math/Vec2";
import Modal from "../Modal";

/***
 * @typedef {Object} TTDHeadCell
 * @property {AbsolConstructDescriptor|Array<AbsolConstructDescriptor>|AElement} [child]
 * @property {function(elt:AElement, data:TTDHeadCell, controller:TTCell): void} render
 * @property {CSSStyleDeclaration} style
 */

/***
 * @typedef {Object} TTDHeadRow
 * @property {Array<TTDHeadCell>} cells
 * @property {Array<TTDHeadRow>} subRows
 */


/***
 * @typedef {Object} TTDHead
 * @property {Array<TTDHeadRow>} rows
 */

/***
 * @typedef {Object} TTDCell
 * @property {AbsolConstructDescriptor|Array<AbsolConstructDescriptor>|AElement} [child]
 * @property {function(elt:AElement, data:TTDCell, controller:TTCell): void} render
 * @property {CSSStyleDeclaration} [style]
 * @property {string|Array<string>} class
 * @property {Object} attr
 */

/***
 * @typedef {Object} TTDRow
 * @property {Array<TTDCell>} cells
 * @property {Array<TTDRow>} subRows
 * @property {string} [id]
 *
 */


/***
 * @typedef {Object} TTDHead
 * @property {Array<TTDHeadRow>} rows
 */

/***
 * @typedef {Object} TTDBody
 * @property {Array<TTDRow>} rows
 */

/***
 * @typedef {Object} TTData
 * @property {TTDHead} head
 * @property {TTDBody} body
 * @property {boolean} [initOpened]
 */

/***
 * @typedef {Object} TTDAdapter
 * @property {TTData} data
 */

var loadCss = () => {
    var dynamicCss = new DynamicCSS();

    dynamicCss.setRules(Array(20).fill(null).reduce((ac, cr, i) => {
        ac[`.as-tree-table-row[data-level="${i}"] .as-tree-table-toggle::before`] = {
            width: 2 * i + 'em'
        }
        ac[['.as-tree-table.as-hide-col-' + i + ' td[data-col-idx="' + i + '"]',
            '.as-tree-table.as-hide-col-' + i + ' th[data-col-idx="' + i + '"]'].join(',')] = {
            display: 'none'
        }

        ac[`.as-tree-table-row[data-level="${i}"] .as-tree-table-cell.as-has-toggle`] = {
            'padding-left': `calc(5px + ${2 * i + 1.5}em)`
        }

        ac[`.as-printer-content .as-tree-table-row[data-level="${i}"] .as-tree-table-cell.as-has-toggle`] = {
            'padding-left': `calc(5px + ${2 * i}em)`
        }


        return ac;
    }, {})).commit();
    loadCss = noop;
}

/***
 * @extends AElement
 * @constructor
 */
function TreeTable() {
    loadCss();
    this._hiddenColumns = [];
    this.$head = $('thead', this);
    this.$body = $('tbody', this);
    this.savedState = {};
    /**
     *
     * @type {null|TTTable}
     */
    this.table = null;
    /***
     *
     * @type {null|TTDataAdapter}
     */

    this.mAdapter = null;
    this.queryCtrl = new TTQueryController(this);
    this.rowMoveTool = new TTRowMoveTool(this);
    /***
     * @name adapter
     * @type TTDAdapter
     * @memberOf TreeTable#
     */
    /***
     * @name searchInput
     * @type SearchTextInput
     * @memberOf TreeTable#
     */
}


TreeTable.tag = 'TreeTable'.toLowerCase();

TreeTable.render = function () {
    return _({
        extendEvent: ['orderchange'],
        tag: 'table',
        class: 'as-tree-table',
        child: [
            {
                tag: 'thead',
                class: 'as-tree-table-head'
            },
            {
                tag: 'tbody'
            }
        ]
    });
};


TreeTable.prototype.removeRow = function (rowData) {
    if (!this.table) return;
    var row = this.table.body.rowOf(rowData);
    if (row) row.remove();
};

TreeTable.prototype.replaceRow = function (rowData, oldRowData) {
    if (!this.table) return;
    var row = this.table.body.rowOf(oldRowData);
    if (row) row.replace(rowData);
};

/***
 *
 * @param rowData
 * @param {any|null} parentRow
 */
TreeTable.prototype.addRowIn = function (rowData, parentRow) {
    if (!this.table) return;
    var row;
    if (parentRow) {
        row = this.table.body.rowOf(parentRow);
        if (row) row.addSubRow(rowData);
        else {
            console.error('Can not find row', parentRow)
        }
    }
    else {
        this.table.body.addRow(rowData);
    }
};

TreeTable.prototype.addRow = function (rowData) {
    if (!this.table) return;
    this.table.body.addRow(rowData);
};


TreeTable.prototype.addRows = function (rowDataArr) {
    if (!this.table) return;
    rowDataArr.forEach(rowData => {
        this.table.body.addRow(rowData);
    });
};


/***
 *
 * @param rowData
 * @param {any|null} bfRow
 */
TreeTable.prototype.addRowBefore = function (rowData, bfRow) {
    if (!this.table) return;
    var row;
    if (bfRow) {
        row = this.table.body.rowOf(bfRow);
        if (row) row.addRowBefore(rowData);
        else {
            console.error('Can not find row', bfRow)
        }
    }
    else {
        this.table.body.addRow(rowData);
    }
};


/***
 *
 * @param rowData
 * @param {any|null} atRow
 */
TreeTable.prototype.addRowAfter = function (rowData, atRow) {
    if (!this.table) return;
    var row;
    if (atRow) {
        row = this.table.body.rowOf(atRow);
        if (row) row.addRowAfter(rowData);
        else {
            console.error('Can not find row', atRow)
        }
    }
    else {
        if (this.table.body.rows.length === 0) {
            this.table.body.addRow(rowData);
        }
        else {
            this.table.body.rows[0].addRowBefore(rowData);
        }
    }
};


TreeTable.prototype.rowOf = function (rowData) {
    return this.table.body.rowOf(rowData);
};

TreeTable.prototype.notifySizeChange = function () {
    var c = this.parentElement;
    while (c) {
        if (typeof c.updateSize === 'function') c.updateSize();
        c = c.parentElement;
    }
};

TreeTable.prototype.attachSearchInput = function (input) {
    this.searchInput = input;
};


TreeTable.property = {};


TreeTable.property.adapter = {
    set: function (adapter) {
        if (adapter.type === 'struct') {
            adapter = ttStructAdapter2TTDAdapter(adapter);
        }
        this._adapterData = adapter;
        if (adapter && adapter.data) {
            adapter.data.initOpened = adapter.data.initOpened || adapter.initOpened;//adapt param
        }
        this.mAdapter = new TTDataAdapter(this, adapter);
        this.mAdapter.render();
        this.queryCtrl.transferSearchItems();

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
        return this._adapterData;
    }
};

TreeTable.property.filterInputs = {
    set: function (inputs) {

    },
    get: function () {

    }
};

TreeTable.property.searchInput = {
    set: function (input) {
        if (input)
            this.queryCtrl.attachSearchInput(input);
        else this.queryCtrl.detachSearchInput();
    },
    get: function () {
        return this.queryCtrl.$searchInput;
    }
};

TreeTable.property.hiddenColumns = {
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
};


ACore.install(TreeTable);
export default TreeTable;

/**
 *
 * @param {TreeTable} elt
 * @constructor
 */
function TTRowMoveTool(elt) {
    this.elt = elt;

    this.dragListenners = {
        dragstart: this.ev_dragStart.bind(this),
        drag: this.ev_drag.bind(this),
        dragend: this.ev_dragEnd.bind(this),
        dragdeinit: this.ev_dragDeinit.bind(this)
    };

    this.$body = _({
        tag: Hanger,
        elt: this.elt.$body,
        props: {
            hangOn: 3
        }
    }).on('draginit', this.ev_dragInit.bind(this));
    /**
     *
     * @type {null|TTRow}
     */
    this.inParent = null;
    /**
     *
     * @type {null|TTRow}
     */
    this.row = null;
    this.siblingRows = [];
    this.siblingBounds = [];
}


TTRowMoveTool.prototype._getZIndex = function () {
    var res = 0;
    var c = this.elt;
    while (c) {
        res = Math.max(res, parseInt(getComputedStyle(c).getPropertyValue('z-index'), 10) || 0);
        c = c.parentElement;
    }
    return res;
};

TTRowMoveTool.prototype.ev_dragInit = function (event) {
    var row = this._findRow(event.target, true);
    if (!row) return;
    if (this.elt.table.body.clonedRows) return;// searching
    this.inParent = row.parentRow;
    this.row = row;
    this.$body.on(this.dragListenners);
};

TTRowMoveTool.prototype.ev_dragDeinit = function () {
    this.$body.off(this.dragListenners);
};

TTRowMoveTool.prototype.ev_dragStart = function (event) {
    event.preventDefault();
    var row = this.row;
    var originTableElt = this.elt.table.elt;
    var originBody = originTableElt.lastChild;
    var tableBound = originTableElt.getBoundingClientRect();
    var zIndex = this._getZIndex();
    this.$clonedTable = $(originTableElt.cloneNode(false))
        .addClass('as-dt-body-row-cloned-ctn')//reuse class
    this.$clonedTable.addStyle({
        tableLayout: 'fixed',
        width: tableBound.width + 'px',
        zIndex: zIndex + 200

    }).addTo(document.body);
    this.$modal = this.$modal || _({
        tag: Modal,
        style: {
            zIndex: zIndex + 201,
            userSelect: 'none'
        }
    });
    this.$modal.addTo(document.body);
    this.$clonedBody = $(originBody.cloneNode());
    this.$clonedTable.addChild(this.$clonedBody);
    var originRowElt = row.elt;
    this.$clonedRow = $(originRowElt.cloneNode(true)).addStyle({
        backgroundColor: originRowElt.getComputedStyleValue('background-color')
    });
    this.$clonedBody.addChild(this.$clonedRow);
    var rowBound = originRowElt.getBoundingClientRect();
    this.$clonedTable.addStyle({
        top: rowBound.top + 'px',
        left: rowBound.left + 'px'
    });
    this.$newPostLine = this.$newPostLine || _('.as-dt-insert-line');
    this.$newPostLine.addStyle({
        left: rowBound.left + 'px',
        width: rowBound.width + 'px'
    });
    this.$newPostLine.addTo(document.body);
    this.rowBond = Rectangle.fromClientRect(rowBound);
    this.mouseOffset = event.currentPoint.sub(this.rowBond.A());
    Array.prototype.forEach.call(this.$clonedRow.childNodes, (td, i) => {
        var originTd = originRowElt.childNodes[i];
        var bound = originTd.getBoundingClientRect();
        $(td).addStyle({
            'width': bound.width + 'px',
            boxSizing: 'border-box'
        });
    });
    this.siblingRows = this.inParent ? this.inParent.subRows.slice() : this.elt.table.body.rows.slice();
    this.firstSiblingRow = this.inParent ? this.inParent.subRows[0] : this.elt.table.body.rows[0];
    this.siblingBounds = (this.inParent ? this.inParent.subRows : this.elt.table.body.rows).map(row => this._boundOfRow(row));
    this.idx = this.siblingRows.indexOf(this.row);
    this.newIdx = this.idx;
    this.$scroller = findVScrollContainer(this.elt);
    if (this.$scroller === document.body.parentElement) this.$scroller = null;
    this.overflowCheckITV = setInterval(() => {
        if (!this.$scroller) return;
        var scrollerBound = this.$scroller.getBoundingClientRect();
        var cloneBound = this.$clonedTable.getBoundingClientRect();
        if (cloneBound.height >= scrollerBound.height) return;

        var newScrollTop = this.$scroller.scrollTop;
        if (cloneBound.top < scrollerBound.top) {
            newScrollTop = newScrollTop - Math.min(100, (scrollerBound.top - cloneBound.top) / 6);
        }
        else if (cloneBound.bottom > scrollerBound.bottom) {
            newScrollTop = newScrollTop - Math.min(100, (scrollerBound.bottom - cloneBound.bottom) / 6);
            newScrollTop = Math.min(this.$scroller.scrollHeight - this.$scroller.clientHeight, newScrollTop);
        }

        newScrollTop = Math.max(0, newScrollTop);
        if (newScrollTop !== this.$scroller.scrollTop) {
            this.$scroller.scrollTop = newScrollTop;
        }
    }, 33);
};

TTRowMoveTool.prototype._boundOfRow = function (row) {
    var rowElements = row.getRowElements();
    var bound = Rectangle.fromClientRect(rowElements[0].getBoundingClientRect());
    if (rowElements.length > 1) {
        bound = bound.merge(
            Rectangle.fromClientRect(rowElements[rowElements.length - 1].getBoundingClientRect())
        );
    }
    return bound;
};

TTRowMoveTool.prototype.ev_drag = function (event) {
    event.preventDefault();
    var newPos = event.currentPoint.sub(this.mouseOffset);
    this.$clonedTable.addStyle('top', newPos.y + 'px');
    var firstSiblingRowBound = Rectangle.fromClientRect(this.firstSiblingRow.elt.getBoundingClientRect());
    var viewDelta = firstSiblingRowBound.A().sub(this.siblingBounds[0].A()).y;
    var y = newPos.y + this.rowBond.height / 2 - viewDelta;
    var beforeIdx = this.siblingBounds.length;
    var rBound;
    for (var i = 0; i < this.siblingBounds.length; ++i) {
        rBound = this.siblingBounds[i];
        if (rBound.centerPoint().y > y) {
            beforeIdx = i;
            break;
        }
    }
    if ((beforeIdx === this.idx + 1 || beforeIdx === this.idx)) {
        this.$newPostLine.addStyle('display', 'none');
        this.newIdx = this.idx;
    }
    else {
        this.$newPostLine.removeStyle('display');
        if (beforeIdx < this.siblingBounds.length) {
            this.$newPostLine.addStyle('top', this.siblingBounds[beforeIdx].y + viewDelta + 'px');
            if (beforeIdx < this.idx) {
                this.newIdx = beforeIdx;
            }
            else {
                this.newIdx = beforeIdx - 1;
            }
        }
        else {
            this.newIdx = this.siblingBounds.length - 1;
            this.$newPostLine.addStyle('top', this.siblingBounds[this.siblingBounds.length - 1].C().y + viewDelta + 'px');
        }
    }

};


TTRowMoveTool.prototype.ev_dragEnd = function (event) {
    clearInterval(this.overflowCheckITV);
    this.$modal.remove();
    this.$newPostLine.remove();
    this.$clonedTable.remove();
    if (this.newIdx !== this.idx) {
        if (this.inParent) {
            this.inParent.subRows.splice(this.idx, 1);
            this.inParent.subRows.splice(this.newIdx, 0, this.row);
            this.inParent.data.subRows.splice(this.idx, 1);
            this.inParent.data.subRows.splice(this.newIdx, 0, this.row.data);
        }
        else {
            this.elt.table.body.rows.splice(this.idx, 1);
            this.elt.table.body.rows.splice(this.newIdx, 0, this.row);
            this.elt.table.body.data.rows.splice(this.idx, 1);
            this.elt.table.body.data.rows.splice(this.newIdx, 0, this.row.data);
        }
        this.elt.table.body.renderRows();
        this.elt.emit('orderchange', {
            type: 'orderchange',
            target: this.row,
            inParent: this.inParent || this.elt.table.body,
            inParentData: this.inParent ? this.inParent.data : this.elt.table.body.data,
            from: this.idx,
            to: this.newIdx,
            originalEvent: event,
            row: this.row,
            data: this.row.data,
            devMessage: this.inParent ? 'order change in array event.inParent.subRows' : 'order change in array event.inParent.rows'
        });
    }
};


TTRowMoveTool.prototype._findRow = function (elt, inDraZone) {
    var hitDragZone = false;
    while (elt) {
        if (elt.classList.contains('as-drag-zone')) hitDragZone = true;
        if (elt.ttRow) {
            if (hitDragZone || !inDraZone)
                return elt.ttRow;
            return null;
        }
        elt = elt.parentElement;
    }
    return null;
};


/***
 *
 * @param adapterData
 * @returns {TTDAdapter}
 */
export function ttStructAdapter2TTDAdapter(adapterData) {
    var toString = {
        'Date': x => x ? formatDateTime(x, 'dd/MM/yyyy') : '',
        'DateTime': x => x ? formatDateTime(x, 'dd/MM/yyyy HH:mm') : '',
        text: x => (x || '') + ''
    };

    var getItemDict = desc => {
        var dict = desc.__dict__;
        if (!dict) {
            Object.defineProperty(desc, '__dict__', {
                enumerable: false,
                writable: true,
                configurable: true,
                value: (desc.items || []).reduce(function makeDict(ac, cr) {
                    var key = keyStringOf(cr.value);
                    ac[key] = cr;
                    if (cr.items && cr.items.reduce) {
                        cr.items.reduce(makeDict, ac);
                    }
                    return ac;
                }, {})
            });
            dict = desc.__dict__;
        }
        return dict;
    }

    var handlers = {
        'Date': x => [{ tag: 'span', child: { text: x ? formatDateTime(x, 'dd/MM/yyyy') : '' } }],
        'DateTime': x => [{ tag: 'span', child: { text: x ? formatDateTime(x, 'dd/MM/yyyy HH:mm') : '' } }],
        text: x => [{ tag: 'span', child: { text: (x || '') + '' } }],
        performance: (x, desc) => {
            return [{
                tag: LinearColorTinyBar.tag,
                props: {
                    colorMapping: desc.colorMapping || 'performance',
                    value: x,
                    extend: (typeof desc.extend === "number") && (desc.extend > 0) ? desc.extend : 0.5,
                    valueText: typeof x === 'number' ? (x * 100).toFixed(2) + '%' : x + ''
                }
            }]
        },
        enum: (x, desc) => {
            var dict = getItemDict(desc);
            var item = dict[keyStringOf(x)];
            if (item) return [{ tag: 'span', child: { text: item.text } }];
            else return [{ tag: 'span', child: { text: '' } }];
        },
        '{enum}': (x, desc) => {
            var dict = getItemDict(desc);
            if (!(x instanceof Array)) return [{ tag: 'span', child: { text: '' } }];
            var items = x.map(it => dict[keyStringOf(it)]).filter(it => !!it);
            var text = items.map(it => it.text).join(', ');
            return [{ tag: 'span', child: { text: text } }];
        }
    }
    /**
     *
     * @type {TTDAdapter}
     */
    var res = {
        data: {
            initOpened: true,
            head: {
                rows: [
                    {
                        cells: adapterData.propertyNames.map(name => {
                            var cellData = {
                                child: { text: name }
                            };
                            var descriptor = adapterData.propertyDescriptors[name];
                            if (descriptor && descriptor.text) cellData.child.text = descriptor.text;
                            return cellData;
                        })
                    }
                ]
            },
            body: {
                rows: adapterData.records.map(function visit(it) {
                    var row = {};
                    row.cells = adapterData.propertyNames.map(name => {
                        var descriptor = adapterData.propertyDescriptors[name];
                        var type = (descriptor && descriptor.type) || 'text'
                        var value = it[name];
                        var f = toString[type] || toString.text;
                        var text = f(value);
                        var handler = handlers[type] || handlers.text;

                        var cell = {
                            innerText: text,
                            attr: {
                                'data-type': type
                            },
                            child: handler(value, descriptor)
                        };
                        if (name === adapterData.treeBy) {
                            cell.child.unshift('.as-tree-table-toggle');
                        }
                        return cell;
                    });
                    if (it.__children__) {
                        row.subRows = it.__children__.map(visit);
                    }
                    return row;
                })
            }
        }
    };

    return res;
}

ShareSerializer.addHandlerBefore({
    id: 'TreeTableCellBorder',
    match: (elt, scope, stack) => {
        if (!elt.hasClass) return false;
        if (!elt.hasClass('as-tree-table-head-cell') && !elt.hasClass('as-tree-table-cell')) return false;
        var style = getComputedStyle(elt);
        var borderColor = style.getPropertyValue('border-color');
        var borderStyle = style.getPropertyValue('border-style');
        var borderWidth = style.getPropertyValue('border-width');
        var borderRadius = style.getPropertyValue('border-radius');
        if (borderStyle === 'none' || borderWidth === '0px') return false;
        scope.declare('borderStyle', {
            width: parseFloat(borderWidth.replace('px', '')),
            radius: parseMeasureValue(borderRadius),
            color: borderColor,
        });

        return true;


    },
    exec: (printer, elt, scope, stack, accept) => {
        var borderStyle = scope.get('borderStyle');
        var bound = Rectangle.fromClientRect(elt.getBoundingClientRect());
        var rect = bound.clone();
        var strokeWidth = borderStyle.width;
        rect.x -= printer.O.x;
        rect.y -= printer.O.y;
        var radius = borderStyle.radius;
        var rounded;
        if (radius) {
            switch (radius.unit) {
                case '%':
                    rounded = [radius.value * rect.width / 100, radius.value * rect.height / 100];
                    break;
                case 'px':
                    rounded = radius.value;
                    break;
            }
        }
        printer.rect(rect, {
            stroke: borderStyle.color,
            rounded: rounded,
            strokeWidth: strokeWidth
        });
        return true;
    }
}, 'Border');
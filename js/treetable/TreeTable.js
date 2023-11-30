import ACore, {_, $} from "../../ACore";
import TTDataAdapter from "./TTDataAdapter";
import noop from 'absol/src/Code/noop';
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import '../../css/treetable.css';
import TTQueryController from "./TTQueryController";
import {formatDateTime} from "absol/src/Time/datetime";
import LinearColorTinyBar from "../LinearColorTinyBar";
import {keyStringOf} from "../utils";
import {parseMeasureValue} from "absol/src/JSX/attribute";
import Rectangle from "absol/src/Math/Rectangle";
import {ShareSerializer} from "absol/src/Print/printer";

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
    rowDataArr.forEach(rowData=>{
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
            adapter.data.initOpened  = adapter.data.initOpened || adapter.initOpened;//adapt param
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
        rect.x -= printer.O.x ;
        rect.y -= printer.O.y ;
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
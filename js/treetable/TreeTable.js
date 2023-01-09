import ACore, { _, $ } from "../../ACore";
import TTDataAdapter from "./TTDataAdapter";
import noop from 'absol/src/Code/noop';
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import '../../css/treetable.css';
import TTQueryController from "./TTQueryController";
import DynamicTable from "../dynamictable/DynamicTable";

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
        ac[[ '.as-tree-table.as-hide-col-' + i + ' td[data-col-idx="' + i + '"]',
            '.as-tree-table.as-hide-col-' + i + ' th[data-col-idx="' + i + '"]'].join(',')] = {
            display: 'none'
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

TreeTable.prototype.notifySizeChange = function () {
    var c = this.parentElement;
    while (c) {
        if (typeof c.updateSize === 'function') c.updateSize();
        c = c.parentElement;
    }
};

TreeTable.prototype.attachSearchInput = function (input) {
    this.searchInput = input;
}


TreeTable.property = {};


TreeTable.property.adapter = {
    set: function (adapter) {
        this._adapterData = adapter;
        this.mAdapter = new TTDataAdapter(this, adapter);
        this.mAdapter.render();
        this.queryCtrl.transferSearchItems();
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

TreeTable.property.hiddenColumns = DynamicTable.property.hiddenColumns;


ACore.install(TreeTable);
export default TreeTable;
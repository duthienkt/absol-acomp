import ACore, { _, $ } from "../../ACore";
import TTDataAdapter from "./TTDataAdapter";
import noop from 'absol/src/Code/noop';
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import '../../css/treetable.css';

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
 * @property {CSSStyleDeclaration} style
 */

/***
 * @typedef {Object} TTDRow
 * @property {Array<TTDCell>} cells
 * @property {Array<TTDRow>} subRows
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
    this.$head = $('thead', this);
    this.$body = $('tbody', this);
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
    /***
     * @name adapter
     * @type TTDAdapter
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


TreeTable.property = {};


TreeTable.property.adapter = {
    set: function (adapter) {
        this.mAdapter = new TTDataAdapter(this, adapter);
        this.mAdapter.render();
    },
    get: function () {
        return this.mAdapter.data;
    }
};


ACore.install(TreeTable);
export default TreeTable;
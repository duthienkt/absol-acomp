/***
 * @typedef DTDataRow
 * @property
 */

/***
 * @typedef DTDataBody
 * @property {DTDataRow[]} row
 */


/***
 * @typedef DTDataHead
 * @property {DTDataHRow[]} row
 */


/***
 * @typedef DTDataTable
 * @property head
 * @property body
 * @property {number} rowsPerPage
 * @property {number} fixedCol
 */

import DTTable from "./DTTable";
import { _ } from "../../ACore";

/***
 *
 * @param {DynamicTable} tableElt
 * @param {DTDataAdapter} opt
 * @constructor
 */
function DTDataAdapter(tableElt, opt) {
    this.tableElt = tableElt;
    /***
     *
     * @type {null|DTDataTable}
     */
    this.data = null;
    this.rowsPerPage = 20;
    this.fixedCol = 0;
    Object.assign(this, opt);
    if (this.fixedCol === 0) {
        this.tableElt.removeClass('as-has-fixed-col');
    }
    else {
        this.tableElt.addClass('as-has-fixed-col');
    }
}

DTDataAdapter.prototype.render = function () {
    if (this.tableElt.table) this.tableElt.table.revokeResource();
    this.tableElt.table = new DTTable(this.tableElt, this.data);
};

DTDataAdapter.prototype.renderHeadCell = function (elt, data, controller) {
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


DTDataAdapter.prototype.renderBodyCell = function (elt, data, controller) {
    if (data.child) {
        if (data.child.map) {
            elt.addChild(data.child.map(function (it) {
                return _(it);
            }))
        }
        else {
            elt.addChild(_(data.child));
        }
    }
    if (data.render) {
        data.render.call(null, elt, data, controller);
    }
    if (data.style) {
        elt.addStyle(data.style);
    }
};


export default DTDataAdapter;
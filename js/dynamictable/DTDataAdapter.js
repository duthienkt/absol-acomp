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
import { _, $ } from "../../ACore";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";


var overrideNames = ['insertChildBefore', 'appendChild', 'remove', 'removeChild',
    'addStyle', 'removeStyle'];
var overrideName1s = overrideNames.map(x => x + '1');

var overrideFunctions = overrideNames.map((name, i) => {
    var name1 = overrideName1s[i];
    if (i < 2) {
        return function () {
            hookContentChange(arguments[0]);
            ResizeSystem.requestUpdateUpSignal(this, true);
            return this[name1].apply(this, arguments);
        }
    }
    else {
        return function () {
            ResizeSystem.requestUpdateUpSignal(this, true);
            return this[name1].apply(this, arguments);
        }
    }
});

export var hookContentChange = elt => {
    if (!elt) return;
    if (elt.nodeType !== Node.ELEMENT_NODE) return;
    if (elt.contentHooked) return;
    elt.contentHooked = true;
    if (!elt.selfRemove) $(elt);
    overrideNames.forEach((name, i) => {
        var name1 = overrideName1s[i];
        elt[name1] = elt[name];
        elt[name] = overrideFunctions[i];
    });
    if (elt._azar_extendTags)
        for (var key in elt._azar_extendTags) {
            return;
        }
    Array.prototype.map.call(elt.childNodes, sElt => hookContentChange(sElt));
}


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

DTDataAdapter.prototype.revoke = function () {
    this.tableElt = null;
    this.data = null;
};

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
    hookContentChange(elt);
};


export default DTDataAdapter;
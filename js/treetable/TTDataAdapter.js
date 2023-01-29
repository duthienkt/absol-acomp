import { _ } from "../../ACore";
import TTTable from "./TTTable";


/***
 *
 * @param {TreeTable} tableElt
 * @param opt
 * @constructor
 */
function TTDataAdapter(tableElt, opt) {
    this.tableElt = tableElt;
    this.data = null;
    Object.assign(this, opt || {});

}


TTDataAdapter.prototype.render = function () {
    if (this.tableElt.table) {

    }

    this.tableElt.table = new TTTable(this.tableElt, this.data);
};

/***
 *
 * @param {AElement} elt
 * @param {TTDHeadCell} data
 * @param {TTHeadCell} controller
 */
TTDataAdapter.prototype.renderHeadCell = function (elt, data, controller) {
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
    if (data.style) {
        elt.addStyle(data.style);
    }
};



/***
 *
 * @param {AElement} elt
 * @param {TTDCell} data
 * @param {TTCell} controller
 */
TTDataAdapter.prototype.renderBodyCell = function (elt, data, controller) {
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
    if (data.class) {
        elt.addClass(data.class);
    }

    if (data.attr) {
        elt.attr(data.attr);
    }
};





export default TTDataAdapter;
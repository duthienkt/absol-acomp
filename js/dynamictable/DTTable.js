/***
 *
 * @param {DynamicTable} elt
 * @param {} data
 * @constructor
 */
import DTHead from "./DTHead";
import DTBody from "./DTBody";

function DTTable(elt, data) {
    this.elt = elt;
    /***
     *
     * @type {DTDataTable|null|*|string}
     */
    this.adapter = this.elt._adapter;
    this.data = data;
    this.clearView();
    this.header = new DTHead(this, this.data.head);
    this.body = new DTBody(this, this.data.body);

}

DTTable.prototype.clearView = function () {
    this.elt.$tbody.clearChild();
    this.elt.$thead.clearChild();
};


Object.defineProperty(DTTable.prototype, 'offset', {
    set: function (value) {
        this.body.offset = value;
    },
    get: function () {
        return this.body.offset;
    }
});

export default DTTable;
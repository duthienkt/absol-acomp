import DTBodyRow from "./DTBodyRow";

/***
 *
 * @param {DTTable} table
 * @param data
 * @constructor
 */
function DTBody(table, data) {
    this.table = table;
    /***
     *
     * @type {AElement}
     */
    this.elt = this.table.elt.$tbody;
    this.data = data;

    this._offset = 0;
    this.renderRows();

    /***
     * @name offset
     * @type {number}
     * @memberOf DTBody#
     */
}

DTBody.prototype.renderRows = function () {
    this.rows = Array().fill(null);
    this.renderCurrentOffset();
};


DTBody.prototype.renderCurrentOffset = function () {
    var start = this.offset;
    var end = Math.min(start + this.rowsPerPage, this.data.rows.length);
    this.elt.clearChild();
    for (var i = start; i < end; ++i) {
        if (!this.rows[i]) {
            this.rows[i] = new DTBodyRow(this, this.data.rows[i]);
        }
        this.elt.addChild(this.rows[i].elt);
    }
};


Object.defineProperties(DTBody.prototype, {
    rowsPerPage: {
        get: function () {
            return this.table.adapter.rowsPerPage;
        }
    },
    offset: {
        set: function (value) {
            this._offset = value;
            this.renderCurrentOffset();
        },
        get: function () {
            return this._offset;
        }
    }
});


export default DTBody;
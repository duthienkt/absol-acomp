import { _ } from "../../ACore";

/***
 *
 * @param {DTHeadRow} row
 * @param data
 * @constructor
 */
function DTHeadCell(row, data) {
    this.row = row;
    this.elt = _({ tag: 'th', class: 'as-dt-header-cell' });
    this.data = data;
    this._idx = null;
    this.render();
}

DTHeadCell.prototype.render = function () {
    this.row.head.table.adapter.renderHeadCell(this.elt, this.data, this);
};


Object.defineProperty(DTHeadCell.prototype, 'idx', {
    set: function (value) {
        this._idx = value;
        this.elt.attr('data-col-idx', value + '');
    },
    get: function () {
        return this._idx;
    }
});


export default DTHeadCell;
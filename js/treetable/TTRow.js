import { $, _ } from "../../ACore";
import TTCell from "./TTCell";

/***
 *
 * @param {TTBody} body
 * @param {TTDRow}data
 * @param parentRow
 * @constructor
 */
function TTRow(body, data, parentRow) {
    this.level = parentRow ? parentRow.level + 1 : 0;
    this.body = body;
    this.data = data;
    this.parentRow = parentRow;
    this.cells = (this.data.cells || []).map(cellData => new TTCell(this, cellData));
    this.subRows = (this.data.subRows || []).map(rowData => new TTRow(body, rowData, this));

}

TTRow.prototype.isOpened = false;

/***
 *
 * @param {Array<AElement>=} ac
 */
TTRow.prototype.getRowElements = function (ac) {
    ac = ac || [];
    ac.push(this.elt);
    if (this.isOpened) {
        this.subRows.forEach(row => row.getRowElements(ac));
    }
    return ac;
};


TTRow.prototype.toggle = function () {
    if (this.isOpened) this.close();
    else this.open();
};

TTRow.prototype.open = function () {
    if (this.isOpened) return;
    this.isOpened = true;
    this.elt.addClass('as-is-opened');
    var rowElements = this.getRowElements();
    rowElements.shift();
    var bodyElt = this.body.elt;
    var bf = this.body.elt.findChildAfter(this.elt);
    if (bf) {
        rowElements.forEach(elt => bodyElt.addChildBefore(elt, bf));
    }
    else {
        bodyElt.addChild(rowElements);
    }
    this.updateSizeUp();
};


TTRow.prototype.close = function () {
    if (!this.isOpened) return;
    var rowElements = this.getRowElements();
    rowElements.shift();
    rowElements.forEach(elt => elt.remove());
    this.isOpened = false;
    this._elt.removeClass('as-is-opened');
    this.updateSizeUp();
};

TTRow.prototype.updateSizeUp = function () {
    var c = this.elt.parentElement;
    while (c) {
        if (typeof c.updateSize === 'function') c.updateSize();
        c = c.parentElement;
    }
};


Object.defineProperty(TTRow.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({
                tag: 'tr',
                class: 'as-tree-table-row',
                attr: {
                    'data-level': this.level + ''
                }
            });
            if (this.isOpened) this._elt.addClass('as-is-opened');
            if (this.subRows.length > 0) this._elt.addClass('as-has-sub-row');
            this._elt.addChild(this.cells.map(cell => cell.elt));

            this.$toggle = $('.as-tree-table-toggle', this._elt);
            if (this.$toggle) {
                this.$toggle = _({
                    elt: this.$toggle, child: 'toggler-ico',
                    on: {
                        click: this.toggle.bind(this)
                    }
                });
            }

        }
        return this._elt;
    }
});


export default TTRow;
import { $, _ } from "../../ACore";
import TTCell from "./TTCell";
import DTBodyRow from "../dynamictable/DTBodyRow";
import { isNone } from "../utils";
import { randomIdent } from "absol/src/String/stringGenerate";

/***
 *
 * @param {TTBody} body
 * @param {TTDRow}data
 * @param parentRow
 * @constructor
 */
function TTRow(body, data, parentRow) {
    this.id = randomIdent(8);
    this.level = parentRow ? parentRow.level + 1 : 0;
    this.body = body;
    this.data = data;
    this.parentRow = parentRow;
    this.clonedRow = null;
    this.cells = (this.data.cells || []).map(cellData => new TTCell(this, cellData));

    this.subRows = (this.data.subRows || []).map(rowData => new TTRow(body, rowData, this));
    if (!isNone(data.id) && data.subRows && data.subRows.length > 0 && (data.id in this.body.table.elt.savedState)) {
        this.isOpened = !!this.body.table.elt.savedState[data.id];
    }
    else if (typeof body.table.data.initOpened === "boolean") {
        this.isOpened = body.table.data.initOpened;
    }
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
    if (this.subRows.length === 0) return;
    this.isOpened = true;
    if (!isNone(this.data.id) && this.cells)//real node
        this.body.table.elt.savedState[this.data.id] = this.isOpened;
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
    if (!isNone(this.data.id) && this.cells)
        this.body.table.elt.savedState[this.data.id] = this.isOpened;
    this._elt.removeClass('as-is-opened');
    this.updateSizeUp();
};

TTRow.prototype.updateSizeUp = function () {
    this.body.table.elt.notifySizeChange();
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
            if (this.data.id) this._elt.attr('data-id', this.data.id);
            if (this.isOpened) this._elt.addClass('as-is-opened');
            if (this.subRows.length > 0) this._elt.addClass('as-has-sub-row');
            this._elt.addChild(this.cells.map((cell, i) => (cell.elt).attr('data-col-idx', i + '')));

            this.$toggle = $('.as-tree-table-toggle', this._elt);
            if (this.$toggle) {
                this.$toggle = _({
                    elt: this.$toggle, child: 'toggler-ico',
                    on: {
                        click: () => {
                            if (this.clonedRow) {
                                this.clonedRow.toggle();
                            }
                            else {
                                this.toggle();
                            }
                        }
                    }
                });
            }

        }
        return this._elt;
    }
});

Object.defineProperty(TTRow.prototype, 'innerText', Object.getOwnPropertyDescriptor(DTBodyRow.prototype, 'innerText'));


export default TTRow;

/***
 *
 * @param {TTRow} origin
 * @param queryResult
 * @param idx
 * @constructor
 */
export function TTClonedRow(origin, queryResult, idx) {
    this.body = origin.body;
    this.idx = idx;
    this.id = origin.id;
    this._elt = origin.elt;
    this.elt = origin.elt;
    this.data = origin.data;
    this.origin = origin;
    this.score = queryResult && queryResult[this.id];
    this.isOpened = this.score && this.score[0] < this.score[1];
    this.attach();
    if (this.isOpened){
        this.subRows = this.origin.subRows.filter(row => queryResult[row.id])
            .map((row, i) => new TTClonedRow(row, queryResult, i));
        this.subRows.sort((a, b) => {
            var sa = a.score[1];
            var sb = b.score[1];
            if (sa !== sb) return sb - sa;
            return a.idx - b.idx;
        });
    }
    else {
        this.subRows = this.origin.subRows.map((row, i) => new TTClonedRow(row, queryResult, i));
    }
}

['toggle', 'open', 'close', 'getRowElements', 'updateSizeUp'].forEach(key => {
    TTClonedRow.prototype[key] = TTRow.prototype[key];
});


TTClonedRow.prototype.attach = function () {
    if (this.isOpened) {
        this.origin.elt.addClass('as-is-opened');
    }
    else {
        this.origin.elt.removeClass('as-is-opened');

    }
    this.origin.clonedRow = this;
};


TTClonedRow.prototype.detach = function () {
    if (this.origin.isOpened) {
        this.origin.elt.addClass('as-is-opened');
    }
    else {

        this.origin.elt.removeClass('as-is-opened');
    }
    this.origin.clonedRow = null;
    this.subRows.forEach(row => row.detach());
};

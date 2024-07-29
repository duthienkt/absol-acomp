import {$, _} from "../../ACore";
import TTCell from "./TTCell";
import DTBodyRow from "../dynamictable/DTBodyRow";
import {isNone} from "../utils";
import {randomIdent} from "absol/src/String/stringGenerate";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

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
    } else if (typeof data.initOpened === 'boolean') {
        this.isOpened = data.initOpened;
    } else if (typeof body.table.data.initOpened === "boolean") {
        this.isOpened = body.table.data.initOpened;
    } else if (typeof body.table.elt.initOpen === 'boolean') {
        this.isOpened = body.table.elt.initOpen;
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
    } else {
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


TTRow.prototype.remove = function () {
    var idx = -1;
    var rowElements;

    var removeRow = (idx, rows, dataRows) => {
        rows.splice(idx, 1);
        dataRows.splice(idx, 1);
        if (this.clonedRow) this.clonedRow.remove();
        if (this.elt.parentElement) {
            rowElements = this.clonedRow ? this.clonedRow.getRowElements() : this.getRowElements();
            rowElements.forEach(elt => elt.selfRemove());
            ResizeSystem.requestUpdateSignal();
        }
        this.body.table.elt.queryCtrl.requestTransferSearchItems();
    }

    if (this.parentRow) {
        idx = this.parentRow.subRows.indexOf(this);
        if (idx >= 0) {
            removeRow(idx, this.parentRow.subRows, this.parentRow.data.subRows);
            if (this.parentRow.subRows.length === 0) this.parentRow.elt.removeClass('as-has-sub-row');
        }
    } else {
        idx = this.body.rows.indexOf(this);
        if (idx >= 0) {
            removeRow(idx, this.body.rows, this.body.data.rows);
        }
    }
};

/***
 * @param {TTDRow} rowData
 */
TTRow.prototype.addSubRow = function (rowData) {
    var row = new TTRow(this.body, rowData, this);
    var clonedRow;
    if (this.clonedRow)
        clonedRow = new TTClonedRow(row, null, this.subRows.length);//idx is not important
    var rowElements;
    var bf;
    if (this.elt.parentElement && this.isOpened) {
        rowElements = this.clonedRow ? this.clonedRow.getRowElements() : this.getRowElements();
        bf = this.body.elt.findChildAfter(rowElements[rowElements.length - 1]);
        rowElements = clonedRow ? clonedRow.getRowElements() : row.getRowElements();
        if (bf) {
            rowElements.forEach(elt => this.body.elt.addChildBefore(elt, bf));
        } else {
            rowElements.forEach(elt => this.body.elt.addChild(elt));
        }
        ResizeSystem.requestUpdateSignal();

    }

    this.subRows.push(row);
    if (this.data.subRows) {
        this.data.subRows.push(rowData);
    } else {
        this.data.subRows = [rowData];
    }
    if (this.clonedRow)
        this.clonedRow.addSubRow(clonedRow);
    if (this._elt)
        this.elt.addClass('as-has-sub-row');
    this.body.table.elt.queryCtrl.requestTransferSearchItems();
};

/***
 *
 @param {TTDRow} newRowData
 */
TTRow.prototype.replace = function (newRowData) {
    var idx = -1;
    var rowElements;
    var bf;
    var newRow;
    var newClonedRow;
    var needView;

    var makeReplaceRow = (idx, rows, dataRows) => {
        newRow = new TTRow(this.body, newRowData, this.parentRow);
        rows.splice(idx, 1, newRow);
        dataRows.splice(idx, 1, newRowData);
        if (this.clonedRow) {
            newClonedRow = new TTClonedRow(newRow, null, idx);
            this.clonedRow.replace(newClonedRow)
        }
        if (this.elt.parentElement) {
            rowElements = this.clonedRow ? this.clonedRow.getRowElements() : this.getRowElements();
            bf = this.body.elt.findChildAfter(rowElements[rowElements.length - 1]);
            rowElements.forEach(elt => elt.selfRemove());
            rowElements = newClonedRow ? newClonedRow.getRowElements() : newRow.getRowElements();
            if (bf) {
                rowElements.forEach(elt => this.body.elt.addChildBefore(elt, bf));
            } else {
                rowElements.forEach(elt => this.body.elt.addChild(elt));
            }
            ResizeSystem.requestUpdateSignal();
        }
        this.body.table.elt.queryCtrl.requestTransferSearchItems();

    }
    if (this.parentRow) {
        idx = this.parentRow.subRows.indexOf(this);
        if (idx >= 0) {
            makeReplaceRow(idx, this.parentRow.subRows, this.parentRow.data.subRows);
        }
    } else {
        idx = this.body.rows.indexOf(this);
        if (idx >= 0) {
            makeReplaceRow(idx, this.body.rows, this.body.data.rows);
        }
    }
};


/***
 *
 @param {TTDRow} newRowData
 */
TTRow.prototype.addRowBefore = function (newRowData) {
    var idx = -1;

    var makeNewRowBefore = (idx, rows, dataRows) => {
        var row, clonedRow;
        var rowElements;
        row = new TTRow(this.body, newRowData, this.parentRow);
        if (this.clonedRow) {
            clonedRow = new TTClonedRow(row, null, idx);
        }
        if (this.elt.parentElement) {
            rowElements = clonedRow ? clonedRow.getRowElements() : row.getRowElements();
            rowElements.forEach(elt => this.body.elt.addChildBefore(elt, this.elt));
            ResizeSystem.requestUpdateSignal();
        }
        rows.splice(idx, 0, row);
        dataRows.splice(idx, 0, newRowData);
        if (this.clonedRow) {
            this.clonedRow.addRowBefore(clonedRow);
        }
        this.body.table.elt.queryCtrl.requestTransferSearchItems();
    }

    if (this.parentRow) {
        idx = this.parentRow.subRows.indexOf(this);
        if (idx >= 0) {
            makeNewRowBefore(idx, this.parentRow.subRows, this.parentRow.data.subRows)
        }
    } else {
        idx = this.body.rows.indexOf(this);
        if (idx >= 0) {
            makeNewRowBefore(idx, this.body.rows, this.body.data.rows);
        }
    }
};
/***
 *
 @param {TTDRow} newRowData
 */
TTRow.prototype.addRowAfter = function (newRowData) {
    var idx = -1;
    var rowElements;
    var bf;

    var makeNewRowAfter = (idx, rows, dataRows) => {
        var row = new TTRow(this.body, newRowData, this.parentRow);
        var clonedRow;
        if (this.clonedRow) clonedRow = new TTClonedRow(row, null, idx);
        if (this.elt.parentElement) {
            rowElements = this.clonedRow ? this.clonedRow.getRowElements() : this.getRowElements();
            bf = this.body.elt.findChildAfter(rowElements[rowElements.length - 1]);
            rowElements = clonedRow ? clonedRow.getRowElements() : row.getRowElements();
            if (bf) {
                rowElements.forEach(elt => this.body.elt.addChildBefore(elt, bf));

            } else {
                rowElements.forEach(elt => this.body.elt.addChild(elt));
            }
            ResizeSystem.requestUpdateSignal();
        }
        rows.splice(idx + 1, 0, row);
        dataRows.splice(idx + 1, 0, newRowData);
        if (this.clonedRow) this.clonedRow.addRowBefore(clonedRow);
        this.body.table.elt.queryCtrl.requestTransferSearchItems();
    }

    if (this.parentRow) {
        idx = this.parentRow.subRows.indexOf(this);
        if (idx >= 0) {
            makeNewRowAfter(idx, this.parentRow.subRows, this.parentRow.data.subRows);
        }
    } else {
        idx = this.body.rows.indexOf(this);
        if (idx >= 0) {
            makeNewRowAfter(idx, this.body.rows, this.body.data.rows);
        }
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
                },
                props: {
                    ttRow: this
                }
            });
            if (this.data.id) this._elt.attr('data-id', this.data.id);
            if (this.isOpened) this._elt.addClass('as-is-opened');
            if (this.subRows.length > 0) this._elt.addClass('as-has-sub-row');
            this._elt.addChild(this.cells.map((cell, i) => (cell.elt).attr('data-col-idx', i + '')));
            if (this.data.on && (typeof this.data.on.click  === "function")) {
                this._elt.on('click', (event)=>{
                    this.data.on.click.call(this._elt, event, this);
                });
            }
            this.$toggle = $('.as-tree-table-toggle', this._elt);
            if (this.$toggle) {
                this.$toggleCell = this.$toggle.parentElement;
                this.$toggleCell.addClass('as-has-toggle');
                this.$toggle = _({
                    elt: this.$toggle, child: 'toggler-ico',
                    on: {
                        click: () => {
                            if (this.clonedRow) {
                                this.clonedRow.toggle();
                            } else {
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
    if (!queryResult) this.score = 1e6;
    this.isOpened = this.score && this.score[0] <= this.score[1];
    this.attach();
    if (this.isOpened) {
        this.subRows = this.origin.subRows.filter(row => queryResult[row.id])
            .map((row, i) => new TTClonedRow(row, queryResult, i));
        this.subRows.sort((a, b) => {
            var sa = a.score[1];
            var sb = b.score[1];
            if (sa !== sb) return sb - sa;
            return a.idx - b.idx;
        });
    } else {
        this.subRows = this.origin.subRows.map((row, i) => new TTClonedRow(row, queryResult, i));
    }
}

['toggle', 'open', 'close', 'getRowElements', 'updateSizeUp'].forEach(key => {
    TTClonedRow.prototype[key] = TTRow.prototype[key];
});


TTClonedRow.prototype.remove = function () {
    var parentRow = this.origin.parentRow && this.origin.parentRow.clonedRow;
    var idx;
    if (parentRow) {
        idx = parentRow.subRows.indexOf(this);
        if (idx >= 0) {
            parentRow.subRows.splice(idx, 1);
        }
    } else {
        idx = this.origin.body.clonedRows.indexOf(this);
        if (idx >= 0) {
            this.origin.body.clonedRows.splice(idx, 1);
        }
    }
};

TTClonedRow.prototype.replace = function (newClonedRow) {
    var parentRow = this.origin.parentRow && this.origin.parentRow.clonedRow;
    var idx;
    if (parentRow) {
        idx = parentRow.subRows.indexOf(this);
        if (idx >= 0) {
            parentRow.subRows.splice(idx, 1, newClonedRow);
        }
    } else {
        idx = this.origin.body.clonedRows.indexOf(this);
        if (idx >= 0) {
            this.origin.body.clonedRows.splice(idx, 1, newClonedRow);
        }
    }
};


TTClonedRow.prototype.addRowBefore = function (newClonedRow) {
    var parentRow = this.origin.parentRow && this.origin.parentRow.clonedRow;
    var idx;
    if (parentRow) {
        idx = parentRow.subRows.indexOf(this);
        if (idx >= 0) {
            parentRow.subRows.splice(idx, 0, newClonedRow);
        }
    } else {
        idx = this.origin.body.clonedRows.indexOf(this);
        if (idx >= 0) {
            this.origin.body.clonedRows.splice(idx, 0, newClonedRow);
        }
    }
};


TTClonedRow.prototype.addRowAfter = function (newClonedRow) {
    var parentRow = this.origin.parentRow && this.origin.parentRow.clonedRow;
    var idx;
    if (parentRow) {
        idx = parentRow.subRows.indexOf(this);
        if (idx >= 0) {
            parentRow.subRows.splice(idx + 1, 0, newClonedRow);
        }
    } else {
        idx = this.origin.body.clonedRows.indexOf(this);
        if (idx >= 0) {
            this.origin.body.clonedRows.splice(idx + 1, 0, newClonedRow);
        }
    }
};

TTClonedRow.prototype.addSubRow = function (newClonedRow) {
    this.subRows.push(newClonedRow);
};


TTClonedRow.prototype.attach = function () {
    if (this.isOpened) {
        this.origin.elt.addClass('as-is-opened');
    } else {
        this.origin.elt.removeClass('as-is-opened');

    }
    this.origin.clonedRow = this;
};


TTClonedRow.prototype.detach = function () {
    if (this.origin.isOpened) {
        this.origin.elt.addClass('as-is-opened');
    } else {
        this.origin.elt.removeClass('as-is-opened');
    }
    this.origin.clonedRow = null;
    this.subRows.forEach(row => row.detach());
};

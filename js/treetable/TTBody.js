import TTRow, {TTClonedRow} from "./TTRow";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

/***
 *
 * @param {TTTable}table
 * @param {TTDBody} data
 * @constructor
 */
function TTBody(table, data) {
    this.table = table;
    this.data = data;
    this.elt = this.table.elt.$body;
    /***
     *
     * @type {TTRow[]}
     */
    this.rows = (this.data.rows || []).map(rowData => new TTRow(this, rowData, null));
    this.clonedRows = null;
    this.renderRows();
}

TTBody.prototype.applyQueryResult = function (queryResult) {
    this.clearClonedRows();
    if (queryResult) {
        this.clonedRows = this.rows.filter(row => queryResult[row.id])
            .map((row, i) => new TTClonedRow(row, queryResult, i));
        this.clonedRows.sort((a, b) => {
            var sa = a.score[1];
            var sb = b.score[1];
            if (sa !== sb) return sb - sa;
            return a.idx - b.idx;
        });
        this.renderRows(this.clonedRows);
        this.table.elt.notifySizeChange();
    }
    else {
        this.renderRows();
    }

};

TTBody.prototype.clearClonedRows = function () {
    if (this.clonedRows)
        this.clonedRows.forEach(row => row.detach());
    this.clonedRows = null;
};

/***
 *
 */
TTBody.prototype.renderRows = function (rows) {
    rows = rows || this.rows;
    this.elt.clearChild().addChild(rows.reduce((ac, row) => {
        row.getRowElements(ac);
        return ac;
    }, []));
};

/***
 *
 * @param data
 */
TTBody.prototype.rowOf = function (data) {
    if (data instanceof TTRow) {
        data = data.data;
    }
    var result = null;
    var queue = this.rows.slice();
    var cr;
    while (queue.length > 0 && !result) {
        cr = queue.shift();
        if (cr.data === data || cr.data.id === data || (data.id && cr.data.id === data.id)) {
            result = cr;
        }
        else {
            queue.push.apply(queue, cr.subRows);
        }
    }
    return result;
};


/***
 *
 * @param {TTDRow} rowData
 */
TTBody.prototype.addRow = function (rowData) {
    var row = new TTRow(this, rowData, null);
    this.data.rows.push(rowData);
    this.rows.push(row);
    var elements = row.getRowElements();
    elements.forEach(elt => this.elt.addChild(elt));
    ResizeSystem.requestUpdateSignal();
};


export default TTBody;
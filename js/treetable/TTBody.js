import TTRow, { TTClonedRow } from "./TTRow";

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
    if (queryResult){
        this.clonedRows = this.rows.filter(row => queryResult[row.id])
            .map((row, i) => new TTClonedRow(row, queryResult, i));
        this.clonedRows .sort((a, b) => {
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


export default TTBody;

import DTHeadRow from "./DTHeadRow";

/***
 *
 * @param {DTTable} table
 * @param {} data
 * @constructor
 */
function DTHead(table, data){
    this.table = table;
    this.elt = this.table.elt.$thead;
    this.data = data;
    this.renderRows();
}

DTHead.prototype.renderRows = function (){
    this.rows = this.data.rows.map(function (rowData){
       return new DTHeadRow(this, rowData);
    }.bind(this));
    var rowEltArr = this.rows.map(function (row){
        return row.elt;
    });
    this.elt.addChild(rowEltArr);

};



export default DTHead;
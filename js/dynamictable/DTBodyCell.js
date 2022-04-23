import { _ } from "../../ACore";

/***
 *
 * @param {DTBodyRow} row
 * @param data
 * @constructor
 */
function DTBodyCell(row, data) {
    this.row = row;
    this.elt = _({ tag: 'td', class: 'as-dt-body-cell' });
    this.data = data;
    this.render();
}

DTBodyCell.prototype.render = function () {
    this.row.head.table.adapter.renderBodyCell(this.elt, this.data, this);
};

Object.defineProperty(DTBodyCell.prototype, 'innerText', {
    get: function () {
        var res = [];

        function visit(node) {
            if (node.nodeType === 3 && node.data){
                res.push(node.data);
            }
            else if (node.childNodes && node.childNodes.length >0){
                Array.prototype.forEach.call(node.childNodes, visit);
            }
        }

        visit(this.elt);
        return res.join(' ');
    }
});


export default DTBodyCell;
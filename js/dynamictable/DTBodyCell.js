import { _ } from "../../ACore";

/***
 *
 * @param {DTBodyRow} row
 * @param data
 * @constructor
 */
function DTBodyCell(row, data) {
    this.row = row;
    this._elt = null;
    this.data = data;
}


Object.defineProperty(DTBodyCell.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({ tag: 'td', class: 'as-dt-body-cell' });
            if (this.data.attr) this.elt.attr(data.attr);
            if (this.data.class) this.elt.addClass(this.data.class);
            this.row.body.table.adapter.renderBodyCell(this.elt, this.data, this);
        }
        return this._elt;
    }
});

Object.defineProperty(DTBodyCell.prototype, 'innerText', {
    get: function () {
        if (this.data.innerText) return this.data.innerText;
        if (this.data.getInnerText) return this.data.getInnerText();
        if ('innerText' in this.data) return this.data.innerText ||'';
        console.log(this);
        var res = [];
        function visit(node) {
            if (node.nodeType === 3 && node.data) {
                res.push(node.data);
            }
            else if (node.childNodes && node.childNodes.length > 0) {
                Array.prototype.forEach.call(node.childNodes, visit);
            }
        }

        visit(this.elt);
        return res.join(' ');
    }
});


export default DTBodyCell;
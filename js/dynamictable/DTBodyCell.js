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
    this._idx = null;
    this.data = data;
}


Object.defineProperty(DTBodyCell.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({ tag: 'td', class: 'as-dt-body-cell' });
            if (this.data.attr) this.elt.attr(data.attr);
            if (this.data.class) this.elt.addClass(this.data.class);
            if (this._idx !== null) this._elt.attr('data-col-idx', this._idx + '');
            this.row.body.table.adapter.renderBodyCell(this.elt, this.data, this);
        }
        return this._elt;
    }
});

Object.defineProperty(DTBodyCell.prototype, 'innerText', {
    get: function () {
        if (this.data.innerText) return this.data.innerText;
        if (this.data.getInnerText) return this.data.getInnerText();
        // if ('innerText' in this.data)
        return this.data.innerText || '';
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


Object.defineProperty(DTBodyCell.prototype, 'idx', {
    set: function (value) {
        this._idx = value;
        if (this._elt)
            this._elt.attr('data-col-idx', value + '');
    },
    get: function () {
        return this._idx;
    }
})


export default DTBodyCell;
import { $, _ } from "../../ACore";
import { addElementClassName, jsStringOf } from "../utils";
import { formatDateTime } from "absol/src/Time/datetime";

/***
 *
 * @param {DTBodyRow} row
 * @param data
 * @constructor
 */
function DTBodyCell(row, data) {
    this.row = row;
    this._elt = null;
    this._copyElt = null;
    this._idx = null;
    this.data = data;
}


Object.defineProperty(DTBodyCell.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        this._elt = _({
            tag: 'td', class: 'as-dt-body-cell',
            on: {
                click: (event) => {
                    if (this.data && this.data.on && this.data.on.click) {
                        this.data.on.click.call(this._elt, event, this);
                    }
                }
            }
        });
        this._elt.holder = this;

        if (this.data.attr) this._elt.attr(this.data.attr);
        if (typeof this.data.class === "string") addElementClassName(this._elt, this.data.class);
        if (this.data.style) this._elt.addStyle(this.data.style);

        if (this.data.on) this._elt.on(this.data.on);
        if (this._idx !== null) this._elt.attr('data-col-idx', this._idx + '');
        this.row.body.table.adapter.renderBodyCell(this.elt, this.data, this);

        return this._elt;
    }
});

Object.defineProperty(DTBodyCell.prototype, 'copyElt', {
    get: function () {
        if (this._copyElt) return this._copyElt;
        this._copyElt = $(this.elt.cloneNode(true)).addClass('as-copy-elt');
        return this._copyElt;
    }
});


Object.defineProperty(DTBodyCell.prototype, 'innerText', {
    get: function () {
        var text = this.data.innerText;
        if (text === undefined || text === null) text = '';
        else if (!text) {
            text = text + '';
        }
        else if (text.substring) {

        }
        else if (typeof text === "number") {
            text = text + ''
        }
        else if (typeof text === "object") {
            if (text instanceof Date) {
                return formatDateTime(text, 'dd/MM/yyyy hh:mm a');
            }
            else {
                return jsStringOf(text);
            }
        }
        else if (typeof text === "function") {
            text = text.call(this.data, this);
        }

        return text;

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
});

Object.defineProperty(DTBodyCell.prototype, 'colspan', {
    get: function () {
        var value = this.data.attr && this.data.attr.colspan;
        if (typeof value === "string") value = parseInt(value);
        if (typeof value === "number") return value;
        else return 1;
    }
});


export default DTBodyCell;
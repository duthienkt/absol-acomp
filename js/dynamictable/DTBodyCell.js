import { $, _ } from "../../ACore";
import { addElementClassName, jsStringOf, listenDomChange, listenDomContentChange } from "../utils";
import { formatDateTime } from "absol/src/Time/datetime";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

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
    if (data.attr) {
        Object.keys(data.attr).forEach(key => {
            var key2 = key.toLowerCase();
            if (key2 !== key) data.attr[key2] = data.attr[key];
        })
    }
    this.data = data;
}

DTBodyCell.prototype.revoke = function () {
    this.row = null;
    if (this._elt) this._elt.holder = null;
    this._elt = null;
    this._copyElt = null;
    this._idx = null;
    this.data = null;
};


Object.defineProperty(DTBodyCell.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        this._elt = _({
            tag: 'td', class: 'as-dt-body-cell'
        });
        this._elt.holder = this;

        var addChild = this._elt.addChild;
        this._elt.addChild = function () {
            addChild.apply(this, arguments);
            ResizeSystem.requestUpdateUpSignal(this);
            return this;
        };

        if (this.data.attr) this._elt.attr(this.data.attr);
        if (typeof this.data.class === "string") addElementClassName(this._elt, this.data.class);
        if (this.data.style) this._elt.addStyle(this.data.style);

        if (this.data.on) {
            Object.keys(this.data.on).forEach(key => {
                var cb = this.data.on[key];
                if (typeof cb !== "function") return;
                this._elt.on(key, event => {
                    cb.call(this._elt, event, this);
                });
            });
        }
        if (this._idx !== null) this._elt.attr('data-col-idx', this._idx + '');
        this.row.body.table.adapter.renderBodyCell(this.elt, this.data, this);
        listenDomContentChange(this._elt, (event) => {
            this.requestUpdateContent();
        });
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

DTBodyCell.prototype.requestUpdateContent = function () {
    if (!this._copyElt) return;
    if (this.ucTO > 0) return;
    // this.ucTO = setTimeout(() => {
        this.ucTO = -1;
        this._copyElt.clearChild();
        this._copyElt.addChild(Array.prototype.map.call(this._elt.childNodes, c => c.cloneNode(true)));
        ResizeSystem.updateUp(this._elt);
    ResizeSystem.requestUpdateUpSignal(this._elt);

    // }, 1);
}


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
                return formatDateTime(text, 'dd/MM/yyyy HH:mm');
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
/***
 *
 * @param {DynamicTable} elt
 * @param {} data
 * @constructor
 */
import DTHead from "./DTHead";
import DTBody from "./DTBody";
import { $$, _, $ } from "../../ACore";


function DTTable(wrapper, data) {
    this.wrapper = wrapper;
    this._elt = null;
    this._fixedXElt = null;
    this._fixedXYElt = null;
    this._fixedYElt = null;
    /***
     *
     * @type {DTDataTable|null|*|string}
     */
    this.adapter = this.wrapper._adapter;
    this.data = data;
    this.header = new DTHead(this, this.data.head);
    this.body = new DTBody(this, this.data.body);
}

DTTable.prototype.updateCopyEltSize = function () {
    if (!this._fixedYElt) return;
    var bound = this._elt.getBoundingClientRect();
    if (this._fixedYElt)
        this._fixedYElt.addStyle('width', bound.width + 'px');
    this.header.updateCopyEltSize();
    this.body.updateCopyEltSize();
}


DTTable.prototype.revokeResource = function () {
    this.body.revokeResource();
};

Object.defineProperty(DTTable.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        this._elt = _({
            tag: 'table',
            class: 'as-dynamic-table',
            child: [
                this.header.copyElt,
                this.body.elt
            ]
        });

        return this._elt;
    }
});


Object.defineProperty(DTTable.prototype, 'fixedXElt', {
    get: function () {
        if (this._fixedXElt) return this._fixedXElt;
        this._fixedXElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-fixed-x',
            child: [this.header.fixedXElt, this.body.fixedXElt]
        });

        return this._fixedXElt;
    }
});


Object.defineProperty(DTTable.prototype, 'fixedYElt', {
    get: function () {
        if (this._fixedYElt) return this._fixedYElt;
        this._fixedYElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-y',
            child: [this.header.elt]
        });
        return this._fixedYElt;
    }
});

Object.defineProperty(DTTable.prototype, 'fixedXYElt', {
    get: function () {
        if (this._fixedXYElt) return this._fixedXYElt;
        this._fixedXYElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-y',
            child: [this.header.fixedXYElt]
        });
        return this._fixedXYElt;
    }
});




export default DTTable;
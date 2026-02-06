/***
 *
 * @param {DynamicTable} elt
 * @param {} data
 * @constructor
 */
import DTHead from "./DTHead";
import DTBody, { rawTableRemoveEmptyImage, rawTableViewEmptyImage } from "./DTBody";
import { $$, _, $ } from "../../ACore";
import ObsDiv from "../ObsDiv";


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
    this._fixedYElt.parentElement.addStyle('width', bound.width + 'px');
    this.header.updateCopyEltSize();
    this.body.updateCopyEltSize();
}


DTTable.prototype.revokeResource = function () {
    this.wrapper = null;
    this._elt = null;
    this.adapter = null;
    this.data = null;
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
        setTimeout(()=>{// Wait for layout complete
            _({
                tag:ObsDiv,
                elt: this._elt,
                on:{
                    resize: ()=>{
                        this.wrapper.requestUpdateSize();
                    }
                }
            });
        }, 100);

        if (this.wrapper.placeholder) {
            rawTableRemoveEmptyImage(this._elt);
            rawTableViewEmptyImage(this._elt);
        }
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



Object.defineProperty(DTTable.prototype, 'fixedXRightElt', {
    get: function () {
        if (this._fixedXRightElt) return this._fixedXRightElt;
        this._fixedXRightElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-fixed-x-right',
            child: [this.header.fixedXRightElt, this.body.fixedXRightElt]
        });

        return this._fixedXRightElt;
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
            class: 'as-dt-fixed-xy',
            child: [this.header.fixedXYElt]
        });
        return this._fixedXYElt;
    }
});


Object.defineProperty(DTTable.prototype, 'fixedXYRightElt', {
    get: function () {
        if (this._fixedXYRightElt) return this._fixedXYRightElt;
        this._fixedXYRightElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-xy-right',
            child: [this.header.fixedXYRightElt]
        });
        return this._fixedXYRightElt;
    }
});



export default DTTable;
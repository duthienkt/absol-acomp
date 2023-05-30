import { $$, _, $ } from "../../ACore";

/***
 *
 * @param {DTHeadRow} row
 * @param data
 * @constructor
 */
function DTHeadCell(row, data) {
    this.row = row;
    this._elt = null;
    this._copyElt = null;
    this._copyElt1 = null;
    this._copyElt2 = null;


    this.data = data;
    if (data.attr) {
        this.elt.attr(data.attr);
    }
    if (data.style) {
        this.elt.addStyle(data.style);
    }
    this._idx = null;
}


Object.defineProperty(DTHeadCell.prototype, 'idx', {
    set: function (value) {
        this._idx = value;
        this.elt.attr('data-col-idx', value + '');
    },
    get: function () {
        return this._idx;
    }
});

DTHeadCell.prototype.nextSortState = function () {
    if (!this.elt.attr('data-sort-key')) return;
    var c = this.elt.attr('data-sort-order');
    var n = { none: 'ascending', ascending: 'descending', descending: 'none' }[c] || 'none';

    //todo
    console.log("TODO this??");
    $$('th', this.row.elt).forEach(elt => {
        if (elt === this.elt) return;
        if (elt.attr('data-sort-key')) {
            elt.attr('data-sort-order', 'none');
        }
    })
    this.elt.attr('data-sort-order', n);
    this.row.head.table.wrapper.requestQuery();
};

DTHeadCell.prototype.updateCopyEltSize = function () {
    if (!this._copyElt && !this._copyElt1 && !this._copyElt2) return;
    // copyElt is in space
    var bound = this._copyElt.getBoundingClientRect();
    this._elt.addStyle('width', bound.width + 'px');
    if (this._copyElt1) {
        this._copyElt1.addStyle('width', bound.width +'px');
    }
    if (this._copyElt2) {
        this._copyElt2.addStyle('width', bound.width +'px');
    }
};

Object.defineProperty(DTHeadCell.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        this._elt = _({ tag: 'th', class: 'as-dt-header-cell' })
            .on('click', this.nextSortState.bind(this));
        this.row.head.table.adapter.renderHeadCell(this._elt, this.data, this);
        if (this.data.sortKey) {
            this._elt.attr('data-sort-key', this.data.sortKey);
            this._elt.attr('data-sort-order', 'none');
        }
        this.$sortBtn = _({
            tag: 'span',
            class: 'as-dt-sort-btn',

            child: [
                {
                    tag: 'span',
                    class: ['mdi', 'mdi-menu-up']
                    // child: { text: '🡑' }
                },
                {
                    tag: 'span',
                    class: ['mdi', 'mdi-menu-down']
                }
            ]
        });
        this._elt.addChild(this.$sortBtn);
        return this._elt;
    }
});

Object.defineProperty(DTHeadCell.prototype, 'copyElt', {
    get: function () {
        if (this._copyElt) return this._copyElt;
        this._copyElt = $(this.elt.cloneNode(true)).addClass('as-copy-elt');
        return this._copyElt;
    }
});

Object.defineProperty(DTHeadCell.prototype, 'copyElt1', {
    get: function () {
        if (this._copyElt1) return this._copyElt1;
        this._copyElt1 = $(this.elt.cloneNode(true)).addClass('as-copy-elt-1');
        return this._copyElt1;
    }
});

Object.defineProperty(DTHeadCell.prototype, 'copyElt2', {
    get: function () {
        if (this._copyElt2) return this._copyElt2;
        this._copyElt2 = $(this.elt.cloneNode(true)).addClass('as-copy-elt-2');
        return this._copyElt2;
    }
});


export default DTHeadCell;
import { $$, _ } from "../../ACore";

/***
 *
 * @param {DTHeadRow} row
 * @param data
 * @constructor
 */
function DTHeadCell(row, data) {
    this.row = row;
    this.elt = _({ tag: 'th', class: 'as-dt-header-cell' }).on('click', this.nextSortState.bind(this));
    if (data.sortKey) {
        this.elt.attr('data-sort-key', data.sortKey);
        this.elt.attr('data-sort-order', 'none');
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
    this.data = data;
    if (data.attr) {
        this.elt.attr(data.attr);
    }
    if (data.style){
        this.elt.addStyle(data.style);
    }
    this._idx = null;
    this.render();
}

DTHeadCell.prototype.render = function () {
    this.row.head.table.adapter.renderHeadCell(this.elt, this.data, this);
    this.elt.addChild(this.$sortBtn);
};


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
    $$('th', this.row.elt).forEach(elt => {
        if (elt === this.elt) return;
        if (elt.attr('data-sort-key')) {
            elt.attr('data-sort-order', 'none');
        }
    })
    this.elt.attr('data-sort-order', n);
    this.row.head.table.elt.requestQuery();
};


export default DTHeadCell;
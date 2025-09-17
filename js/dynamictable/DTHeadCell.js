import { $$, _, $ } from "../../ACore";
import Follower from "../Follower";
import { addElementClassName, findMaxZIndex, listenDomContentChange } from "../utils";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";


var implicitSortKeyArr = key => {
    var res;
    if (typeof key === 'string') {
        res = key.split(/[\s,;]+/);
    }
    else if (key instanceof Array) {
        res = key.slice();
    }
    else res = [];
    res = res.filter(k => !!k).map(k => k + '');
    return res;
}

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


    if (data.attr) {
        Object.keys(data.attr).forEach(key => {
            var key2 = key.toLowerCase();
            if (key2 !== key) data.attr[key2] = data.attr[key];
        })
    }

    this.data = data;

    this._idx = null;
}

DTHeadCell.prototype.makeAutoSortAttribute = function () {
    var rows = this.row.head.table.data && this.row.head.table.data.body && this.row.head.table.data.body.rows;
    if (!rows || !rows.length) return;
    if (this.elt.attr('data-sort-key')) return;
    var idx = this.idx;
    var canSort = rows.every(row => {
        return row.cells[idx] && (typeof row.cells[idx].innerText === 'string');
    });
    if (canSort) {
        this.elt.attr('data-sort-key', '[' + idx + ']');
        this.data.sortKey = '[' + idx + ']';
        this._elt.attr('data-sort-order', 'none');
        // this._elt.attr('title', 'Sort');
    }
};

Object.defineProperty(DTHeadCell.prototype, 'idx', {
    set: function (value) {
        this._idx = value;
        this.elt.attr('data-col-idx', value + '');
        this.makeAutoSortAttribute();
    },
    get: function () {
        return this._idx;
    }
});

DTHeadCell.prototype.nextSortState = function (event) {
    if (!this.elt.attr('data-sort-key')) return;
    var c = this.elt.attr('data-sort-order') || 'none';
    var n = { none: 'ascending', ascending: 'descending', descending: 'none' }[c] || 'none';
    var sortKeyArr = implicitSortKeyArr(this.data.sortKey || c);

    var sortBtn = this.$sortBtn;
    var followerElt, menuElt, items;

    if (sortKeyArr.length === 1) {
        $$('th', this.row.elt).forEach(elt => {
            if (elt === this.elt) return;
            if (elt.attr('data-sort-key')) {
                elt.attr('data-sort-order', 'none');
            }
        })
        this.elt.attr('data-sort-order', n);
        this.row.head.table.wrapper.requestQuery();
    }
    else {
        items = [{
            text: 'Không sắp xếp',
            value: { key: sortKeyArr.join(';'), order: 'none' },
            icon: 'span.mdi.mdi-sort-variant-off'
        }];
        if (c === 'none') {
            items[0].extendStyle = { color: '#007bff' };
        }
        sortKeyArr.forEach(key => {
            items.push('-------');
            var text = this.data.sortMenu && this.data.sortMenu[key] && this.data.sortMenu[key][0];
            text = text || ("Tăng theo " + key);
            var item = {
                icon: 'span.mdi.mdi-sort-ascending',
                text: text,
                value: { key: key, order: 'ascending' }
            };
            if (key === this.elt.attr('data-sort-key') && c === 'ascending') {
                item.extendStyle = { color: '#007bff' }
            }
            items.push(item);
            text = this.data.sortMenu && this.data.sortMenu[key] && this.data.sortMenu[key][1];
            text = text || ("Tăng theo " + key);
            item = {
                icon: 'span.mdi.mdi-sort-descending',
                text: text,
                value: { key: key, order: 'descending' }
            };
            if (key === this.elt.attr('data-sort-key') && c === 'descending') {
                item.extendStyle = { color: '#007bff' }
            }
            items.push(item);
        });
        menuElt = _({
            tag: 'vmenu',
            props: {
                items: items
            }, on: {
                press: event => {
                    var value = event.menuItem.value;
                    $$('th', this.row.elt).forEach(elt => {
                        if (elt === this.elt) return;
                        if (elt.attr('data-sort-key')) {
                            elt.attr('data-sort-order', 'none');
                        }
                    })
                    this.elt.attr('data-sort-order', value.order);
                    this.elt.attr('data-sort-key', value.key);
                    this.row.head.table.wrapper.requestQuery();
                    finish();
                }
            }
        });
        followerElt = _({
            tag: Follower,
            class: 'absol-context-menu-anchor',
            style: {
                zIndex: findMaxZIndex(sortBtn) + 22
            },
            child: [
                menuElt
            ],
            props: {
                followTarget: sortBtn
            }
        }).addTo(document.body);
        var finish = () => {
            document.removeEventListener('click', finish);
            followerElt.remove();
        }
        setTimeout(() => {
            followerElt.addStyle('visibility', 'visible').addStyle('opacity', 1);

        }, 5)

    }

};

DTHeadCell.prototype.updateCopyContent = function () {
    var makeCopyChildren = () => Array.prototype.map.call(this._elt.childNodes, elt => elt.cloneNode(true));
    if (this._copyElt1) {
        this._copyElt1.clearChild().addChild(makeCopyChildren());

    }
    if (this._copyElt2) {
        this._copyElt2.clearChild().addChild(makeCopyChildren());
    }
    if (this._copyElt) {
        this._copyElt.clearChild().addChild(makeCopyChildren());
    }
    ResizeSystem.updateUp(this._elt);
    ResizeSystem.requestUpdateUpSignal(this._elt);
};

DTHeadCell.prototype.requestUpdateContent = function () {
    if (this.ucTO > 0) return;
    // this.ucTO = setTimeout(() => {
        this.ucTO = -1;
        this.updateCopyContent();
    // }, 20)
};


DTHeadCell.prototype.updateCopyEltSize = function () {
    if (!this._copyElt && !this._copyElt1 && !this._copyElt2) return;
    // copyElt is in space
    var bound = this._copyElt.getBoundingClientRect();
    var matchHeight = this._elt.hasClass('as-matched-head-height');
    this._elt.addStyle('width', bound.width + 'px');
    if (matchHeight) this._elt.addStyle('min-width', bound.width + 'px');
    if (this._copyElt1) {
        this._copyElt1.addStyle('width', bound.width + 'px');
        if (matchHeight) this._copyElt1.addStyle('min-width', bound.width + 'px');

    }
    if (this._copyElt2) {
        this._copyElt2.addStyle('width', bound.width + 'px');
        if (matchHeight) this._copyElt2.addStyle('min-width', bound.width + 'px');
    }
};

Object.defineProperty(DTHeadCell.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;

        var eventAdded = false;
        var onPointerDown = (event) => {
            if (event.target.hasClass && event.target.hasClass('as-dt-header-cell-resizer')) return;
            if (!eventAdded) {
                document.addEventListener('pointerup', onPointerUp);
                eventAdded = true;
            }
        }

        var onPointerUp = () => {
            document.removeEventListener('pointerup', onPointerUp);
            eventAdded = false;
            this.nextSortState();
        };

        this._elt = _({ tag: 'th', class: 'as-dt-header-cell' })
            .on('pointerdown', onPointerDown);
        if (this.data.attr) {
            this._elt.attr(this.data.attr);
        }

        if (this.data.style) {
            this._elt.addStyle(this.data.style);
            if (this.data.style.width) {
                this._elt.addStyle('max-width', this.data.style.width);
                this._elt.addStyle('min-width', this.data.style.width);
                this._elt.addClass('as-wrap-text');
            }
        }

        if (this.data.id !== null && this.data.id !== undefined) {
            this._elt.attr('data-col-id', this.data.id + '');
        }
        this.row.head.table.adapter.renderHeadCell(this._elt, this.data, this);
        if (typeof this.data.class) addElementClassName(this._elt, this.data.class);
        var sortKeyArr = implicitSortKeyArr(this.data.sortKey)
        if (sortKeyArr.length > 0) {
            this._elt.attr('data-sort-key', sortKeyArr.join(';'));
            this._elt.attr('data-sort-order', 'none');
            // this._elt.attr('title', 'Sort');
        }
        this.$sortBtn = _({
            // tag: 'span',
            class: 'as-dt-sort-btn',

            child: [
                {
                    tag: 'span',
                    class: ['mdi', 'mdi-chevron-up']
                    // child: { text: '🡑' }
                },
                {
                    tag: 'span',
                    class: ['mdi', 'mdi-chevron-down']
                }
            ]
        });

        this.$resizer = _({
            class: 'as-dt-header-cell-resizer'
        });

        this._elt.addChild(this.$sortBtn);
        this._elt.addChild(this.$resizer);
        var ctrl = this;
        // setTimeout(() => {
        //     var addChild = this._elt.addChild;
        //     var clearChild = this._elt.clearChild;
        //     this._elt.addChild = function () {
        //         ctrl.requestUpdateContent();
        //         addChild.apply(this, arguments);
        //     };
        //     this._elt.clearChild = function () {
        //         ctrl.requestUpdateContent();
        //         clearChild.apply(this, arguments);
        //     };
        // }, 10);
        // listenDomContentChange(this._elt, (event) => {
        //     this.requestUpdateContent();
        // });
        setTimeout(()=>{
            listenDomContentChange(this._elt, (event) => {
                this.requestUpdateContent();
            });
        }, 10);

        return this._elt;
    }
});

Object.defineProperty(DTHeadCell.prototype, 'copyElt', {
    get: function () {
        if (this._copyElt) return this._copyElt;
        this._copyElt = $(this.elt.cloneNode(true)).addClass('as-copy-elt');
        if (this.data.style && this.data.style.width) {
            var self = this;
            setTimeout(function wait() {
                if (self._copyElt.isDescendantOf(document.body)) {
                    self._copyElt.addStyle('width', self._copyElt.getBoundingClientRect().width + 'px');
                }
                else {
                    setTimeout(wait, 10);
                }
            }, 10);
        }
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


Object.defineProperty(DTHeadCell.prototype, 'colspan', {
    get: function () {
        var value = this.data.attr && this.data.attr.colspan;
        if (typeof value === "string") value = parseInt(value);
        if (typeof value === "number") return value;
        else return 1;
    }
});

Object.defineProperty(DTHeadCell.prototype, 'rowspan', {
    get: function () {
        var value = this.data.attr && this.data.attr.rowspan;
        if (typeof value === "string") value = parseInt(value);
        if (typeof value === "number") return value;
        else return 1;
    }
});


export default DTHeadCell;
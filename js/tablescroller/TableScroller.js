import '../../css/tablescroller.css';
import ACore from "../../ACore";
import Dom from "absol/src/HTML5/Dom";
import TSLMoveTool from "./TSLMoveTool";
import { randomIdent } from "absol/src/String/stringGenerate";
import { swapChildrenInElt } from "../utils";
import DomSignal from "absol/src/HTML5/DomSignal";

var $ = ACore.$;
var _ = ACore._;


var sliceCellArray = (cells, start, end) => {
    if (typeof start !== "number") start = 0;
    if (typeof end !== "number") end = Infinity;
    var res = [];
    cells = cells.slice();
    var cell, colSpan;
    var n = 0;
    while (cells.length > 0) {
        cell = cells.shift();
        colSpan = parseInt(cell.getAttribute('colspan') || '1') || 1;
        n += colSpan;
        if (n > start && n <= end)
            res.push(cell);
    }
    return res;
}

/***
 * @extends {AElement}
 * @constructor
 */
function TableScroller() {
    this.$originCtn = $('.as-table-scroller-origin-table-ctn', this);
    this.$originTable = undefined;
    this.$originContent = undefined;

    this.$fixedYHeaderScroller = $('.as-table-scroller-fixed-y-header-scroller', this);
    this.$fixedYHeader = $('.as-table-scroller-fixed-y-header', this);
    this.$fixedXYHeader = $('.as-table-scroller-fixed-xy-header', this);

    this.$fixXCol = $('.as-table-scroller-fixed-x-col', this);

    this.$attachHook = $('attachhook', this);
    this.$attachHook.requestUpdateSize = this.updateContentSize.bind(this);
    this.requestUpdateSize = this.updateContentSize.bind(this);
    this.$attachHook.on('attached', function () {
        Dom.addToResizeSystem(this);
    });

    this.$domSignal = _('attachhook');
    this.appendChild(this.$domSignal);
    this.domSignal = new DomSignal(this.$domSignal);
    this.domSignal.on('requestUpdateContent', this.updateContent.bind(this));

    this.$vscrollbar = $('.absol-table-scroller-vscrollbar-container vscrollbar', this);
    this.$hscrollbar = $('.absol-table-scroller-hscrollbar-container hscrollbar', this);

    this.$vscroller = $('.as-table-scroller-vertical-scroller', this);
    this.$hscroller = $('.as-table-scroller-horizontal-scroller', this);

    this.$leftLine = $('.absol-table-scroller-left-line', this).addStyle('display', 'none');
    this.$headLine = $('.absol-table-scroller-head-line', this);

    this.scrollCtr = new ScrollController(this);
    this.moveTool = new TSLMoveTool(this);

    this._swappedPairs = [];
    this.originalRows = {};
    this.leftCopyRows = {};

    /***
     * @name fixedCol
     * @type {number}
     * @memberOf TableScroller#
     */
}

TableScroller.tag = 'TableScroller'.toLowerCase();

TableScroller.render = function () {
    return _({
        class: 'absol-table-scroller',
        extendEvent: ['orderchange', 'preupdatesize', 'sizeupdated'],
        child: [
            {
                class: 'absol-table-scroller-content',
                child: [
                    {
                        class: 'as-table-scroller-vertical-scroller',
                        child: [
                            {
                                class: 'as-table-scroller-horizontal-scroller-viewport',
                                child: [
                                    {
                                        class: 'as-table-scroller-fixed-x-col-ctn',
                                        child: {
                                            tag: 'table',
                                            class: 'as-table-scroller-fixed-x-col',
                                        }
                                    },
                                    {
                                        class: 'as-table-scroller-horizontal-scroller',
                                        child: [
                                            {
                                                class: 'as-table-scroller-origin-table-ctn'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        class: 'as-table-scroller-fixed-y-header-ctn',
                        child: {
                            class: 'as-table-scroller-fixed-y-header-scroller',
                            child: {
                                tag: 'table',
                                class: 'as-table-scroller-fixed-y-header',

                            }

                        }
                    },
                    {
                        class: 'as-table-scroller-fixed-xy-header-ctn',
                        child: {
                            tag: 'table',
                            class: 'as-table-scroller-fixed-xy-header'
                        }
                    },

                    '.absol-table-scroller-viewport',
                    '.absol-table-scroller-fixed-viewport',//place holder
                    {
                        class: 'absol-table-scroller-header-hscroller',
                        child: '.absol-table-scroller-header-hscroller-viewport'
                    },
                    {
                        class: 'absol-table-scroller-left-vscroller',
                        child: '.absol-table-scroller-left-vscroller-viewport'
                    },
                    '.absol-table-scroller-head-line',
                    '.absol-table-scroller-left-line'

                ]
            },
            {
                class: 'absol-table-scroller-vscrollbar-container',
                child: {
                    tag: 'vscrollbar'
                }
            },
            {
                class: 'absol-table-scroller-hscrollbar-container',
                child: {
                    tag: 'hscrollbar'
                }
            },
            'attachhook'
        ]
    });
};


TableScroller.scrollSize = 17;//default 

Dom.getScrollSize().then(function (size) {
    TableScroller.scrollSize = size.width;//default scroller
    TableScroller.$style = _('style[id="table-scroller-css"]').addTo(document.head);
    TableScroller.$style.innerHTML = [
        'body .absol-table-scroller {',
        '    --scrollbar-width: ' + (size.width + 0) + 'px',
        '}',
    ].join('\n');
    Dom.updateResizeSystem();
    setTimeout(Dom.updateResizeSystem.bind(Dom), 30);// css load delay
});

TableScroller.eventHandler = {};


TableScroller.prototype.clearChild = function () {
    this.$fixXCol.clearChild();
    this.$fixedYHeader.clearChild();
    this.$fixedXYHeader.clearChild();
    if (this.$originTable) this.$originTable.remove();
    this.$originTable = null;
    return this;
};

TableScroller.prototype.addChild = function (elt) {
    if (this.$originTable) {
        throw new Error('Only one table is accepted!');
    }
    this.$originContent = elt;
    this.$originTable = $('table', this.$originContent);
    this._hookHover();
    this.$originCtn.addChild(this.$originTable);
    this.requestUpdateContent();
};


TableScroller.prototype._hookHover = function () {
   if (!this.$originTable) return;
    var tbody = this.$originTableBody = $('tbody', this.$originTable);
    var rows = Array.prototype.filter.call(tbody.childNodes, elt => elt.tagName === 'TR');
    rows.forEach(row=>{
       row.addEventListener('mouseover', (event) => {
           row.classList.add('as-hover');
           if (row.$clonedRow) {
                row.$clonedRow.classList.add('as-hover');
           }
        });
        row.addEventListener('mouseleave', (event) => {
            if (row.$clonedRow) {
                row.$clonedRow.classList.remove('as-hover');
            }
            row.classList.remove('as-hover');
        });
    });
}

TableScroller.prototype._revertWrapped = function () {
    var pair;
    while (this._swappedPairs.length > 0) {
        pair = this._swappedPairs.pop();
        swapChildrenInElt(pair[0], pair[1]);
    }
};


TableScroller.prototype._makeDataIdent = function () {
    this.originalRows = {};
    Array.prototype.slice.call(this.$originTableBody.childNodes).forEach((elt, i) => {
        var id;
        if (elt.tagName === 'TR') {
            id = elt.getAttribute('data-id') || randomIdent(12) + '_' + i;
            elt.setAttribute('data-id', id);
            this.originalRows[id] = $(elt);
        }
        else {
            elt.remove();
        }
    });
};


TableScroller.prototype._updateFixedYHeader = function () {
    var head = $(this.$originTableThead.cloneNode(false));
    var headRows = Array.prototype.filter.call(this.$originTableThead.childNodes, elt => elt.tagName === 'TR')
        .map(tr => {
            var copyTr = $(tr.cloneNode(false));
            copyTr.$origin = tr;
            var cells = Array.prototype.filter.call(tr.childNodes, elt => elt.tagName === 'TH' || elt.tagName === 'TD')
                .map(td => $(Object.assign(td.cloneNode(true), { $origin: td })));
            copyTr.addChild(cells);
            sliceCellArray(cells, this.fixedCol).forEach(elt => {
                swapChildrenInElt(elt, elt.$origin);
                this._swappedPairs.push([elt, elt.$origin]);
            });
            return copyTr;

        });
    head.addChild(headRows);
    this.$fixedYHeader.clearChild().addChild(head);
    this.$fixedYHeader.attr('class', this.$originTable.attr('class')).addClass('as-table-scroller-fixed-y-header');
};


TableScroller.prototype._updateFixedYHeaderSize = function () {
    var bound = this.$originTable.getBoundingClientRect();
    this.$fixedYHeader.addStyle('width', bound.width + 'px');
    if (this.$fixedYHeader.firstChild && this.$fixedYHeader.firstChild.firstChild)
        Array.prototype.forEach.call(this.$fixedYHeader.firstChild.firstChild.childNodes, elt => {
            var bound = elt.$origin.getBoundingClientRect();
            elt.addStyle('width', bound.width + 'px');
            if (bound.width + bound.height === 0) {
                elt.addStyle('display', 'none');
            }
            else {
                elt.removeStyle('display');
            }
        });
    var headBound = this.$originTableThead.getBoundingClientRect();
    this.$fixedYHeader.addStyle('height', headBound.height + 'px');
    // this.$fixedYHeader

    this.$headLine.addStyle('top',headBound.height - 1 + 'px')
        .addStyle('max-width', bound.width + 'px');

};


TableScroller.prototype._updateFixedXCol = function () {
    this.$fixXCol.clearChild();
    var head = $(this.$originTableThead.cloneNode(false));
    var headRows = Array.prototype.filter.call(this.$originTableThead.childNodes, elt => elt.tagName === 'TR')
        .map(tr => {
            var copyTr = $(tr.cloneNode(false));
            tr.$clonedRow = copyTr;
            copyTr.$origin = tr;
            var cells = Array.prototype.filter.call(tr.childNodes, elt => elt.tagName === 'TH' || elt.tagName === 'TD');
            cells = sliceCellArray(cells, 0, this.fixedCol)
                .map(td => $(Object.assign(td.cloneNode(true), { $origin: td })));

            copyTr.addChild(cells);
            return copyTr;

        });
    head.addChild(headRows);

    var body = $(this.$originTableBody.cloneNode());
    var rows = Array.prototype.filter.call(this.$originTableBody.childNodes, elt => elt.tagName === 'TR')
        .map(tr => {
            var copyTr = $(tr.cloneNode(false));
            copyTr.$origin = tr;
            tr.$clonedRow = copyTr;
            copyTr.addEventListener('mouseover', (event) => {
                copyTr.classList.add('as-hover');
                if (copyTr.$origin) {
                    copyTr.$origin.classList.add('as-hover');
                }
            });
            copyTr.addEventListener('mouseleave', (event) => {
                if (copyTr.$origin) {
                    copyTr.$origin.classList.remove('as-hover');
                }
                copyTr.classList.remove('as-hover');
            });
            var id = copyTr.attr('data-id');
            this.leftCopyRows[id] = copyTr;
            var cells = Array.prototype.filter.call(tr.childNodes, elt => elt.tagName === 'TH' || elt.tagName === 'TD');
            cells = sliceCellArray(cells, 0, this.fixedCol)
                .map(td => $(Object.assign(td.cloneNode(true), { $origin: td })));
            cells.forEach(elt => {
                swapChildrenInElt(elt, elt.$origin);
                this._swappedPairs.push([elt, elt.$origin]);
            });
            copyTr.addChild(cells);
            return copyTr;
        });
    body.addChild(rows);
    this.$fixXCol.addChild(head)
        .addChild(body);
    this.$fixXCol.attr('class', this.$originTable.attr('class')).addClass('as-table-scroller-fixed-x-col');
};


TableScroller.prototype._updateFixedXColSize = function () {
    if (this.fixedCol === 0) return;
    var bound = this.$originTable.getBoundingClientRect();
    // this.$fixXCol.addStyle('height', bound.height + 'px');
    var width = 0;
    Array.prototype.forEach.call(this.$fixXCol.firstChild.childNodes, elt => {
        elt.addStyle('height', elt.$origin.getBoundingClientRect().height + 'px');
    });

    Array.prototype.forEach.call(this.$fixXCol.firstChild.firstChild.childNodes, elt => {
        var bound = elt.$origin.getBoundingClientRect();
        width += bound.width + 1;//1 is border
        elt.addStyle('width', bound.width + 'px');
    });
    Array.prototype.forEach.call(this.$fixXCol.lastChild.childNodes, elt => {
        elt.addStyle('height', elt.$origin.getBoundingClientRect().height + 'px');
    });
    this.$fixXCol.addStyle('width', width + 'px');
    this.$fixedXYHeader.addStyle('width', width + 'px');
};

TableScroller.prototype._updateFixedXYHeader = function () {
    var head = $(this.$originTableThead.cloneNode(false));
    var headRows = Array.prototype.filter.call(this.$originTableThead.childNodes, elt => elt.tagName === 'TR')
        .map(tr => {
            var copyTr = _('tr');
            copyTr.$origin = tr;
            var cells = Array.prototype.filter.call(tr.childNodes, elt => elt.tagName === 'TH' || elt.tagName === 'TD');
            cells = sliceCellArray(cells, 0, this.fixedCol)
                .map(td => $(Object.assign(td.cloneNode(true), { $origin: td })));
            copyTr.addChild(cells);
            cells.forEach(cell => {
                swapChildrenInElt(cell, cell.$origin);
                this._swappedPairs.push([cell, cell.$origin]);
            })
            return copyTr;

        });
    head.addChild(headRows);
    this.$fixedXYHeader.clearChild().addChild(head);
    this.$fixedXYHeader.attr('class', this.$originTable.attr('class')).addClass('as-table-scroller-fixed-xy-header');
};


TableScroller.prototype._updateFixedXYHeaderSize = function () {
    if (this.$fixedXYHeader.firstChild) {
        Array.prototype.forEach.call(this.$fixedXYHeader.firstChild.childNodes, elt => {
            elt.addStyle('height', elt.$origin.getBoundingClientRect().height + 'px');
        });
    }
    if (this.$fixedXYHeader.firstChild && this.$fixedXYHeader.firstChild.firstChild)
        Array.prototype.forEach.call(this.$fixedXYHeader.firstChild.firstChild.childNodes, elt => {
            elt.addStyle('width', elt.$origin.getBoundingClientRect().width + 'px');
        });
    this.$leftLine.addStyle('left', this.$fixedXYHeader.getBoundingClientRect().width - 1 + 'px');
};


TableScroller.prototype.updateContent = function () {
    if (!this.$originTable) return;
    this._revertWrapped();

    this.$originTableThead = $('thead', this.$originTable);
    this.$originTableBody = $('tbody', this.$originTable);


    this._makeDataIdent();

    this._updateFixedYHeader();
    this._updateFixedXCol();
    this._updateFixedXYHeader();

    this.reindexRows();

    this.updateContentSize();
    requestAnimationFrame(() => {
        this.updateContentSize();
    });

};


TableScroller.prototype._updateScrollStatus = function () {
    var bound = this.getBoundingClientRect();
    var tableBound = this.$originTable.getBoundingClientRect();
    if (bound.width < tableBound.width) {
        this.addClass('as-scroll-horizontal');
        this.$vscrollbar.outerHeight = bound.height - 17;
    }
    else {
        this.$vscrollbar.outerHeight = bound.height;
        this.removeClass('as-scroll-horizontal');
    }
    if (bound.height < tableBound.height) {
        this.addClass('as-scroll-vertical');
        this.$hscrollbar.outerWidth = bound.width - 17;
    }
    else {
        this.$hscrollbar.outerWidth = bound.width;
        this.removeClass('as-scroll-vertical');
    }
    var paddingBottom = this.getComputedStyleValue('--tvs-scroll-padding-bottom');
    paddingBottom = parseFloat((paddingBottom || '0px').replace('px', ''));
    this.$vscrollbar.innerHeight = tableBound.height + paddingBottom;
    this.$hscrollbar.innerWidth = tableBound.width;
    if (this.style.maxHeight) {
        this.addStyle('height', tableBound.height + 17 + 'px');
    }
};


TableScroller.prototype.updateContentSize = function () {
    if (!this.$originTable) return;
    this._updateScrollStatus();
    this._updateFixedYHeaderSize();
    this._updateFixedXColSize();
    this._updateFixedXYHeaderSize();
};

TableScroller.prototype.reindexRows = function () {
    if (!this.$originTableBody) return;

    Array.prototype.filter.call(this.$originTableBody.childNodes, elt => elt.tagName === 'TR')
        .forEach((elt, i) => {
            if (elt.$idx === null) return;
            elt.$idx = elt.$idx || $('.as-table-scroller-row-index', elt) || null;
            if (elt.$idx)
                elt.$idx.attr('data-idx', i + 1);
        });
    Array.prototype.forEach.call(this.$fixXCol.lastChild.childNodes, (elt, i) => {
        if (elt.$idx === null) return;
        elt.$idx = elt.$idx || $('.as-table-scroller-row-index', elt) || null;
        if (elt.$idx)
            elt.$idx.attr('data-idx', i + 1);
    });
};

TableScroller.prototype.removeRow = function (row) {
    if ($(row).isDescendantOf(this)) {
        row.remove();
        this.requestUpdateContent();
    }
    return this;
};


TableScroller.prototype.addRowBefore = function (row, bf) {
    if (!this.$originTableBody) return this;
    this.$originTableBody.addChildBefore(row, bf);
    this.requestUpdateContent();
    return this;
};


TableScroller.prototype.addRowAfter = function (row, at) {
    if (!this.$originTableBody) return this;
    this.$originTableBody.addChildAfter(row, at);
    this.requestUpdateContent();
    return this;
};

TableScroller.prototype.requestUpdateContent = function () {
    this.domSignal.emit('requestUpdateContent');

};

TableScroller.property = {};

TableScroller.property.fixedCol = {
    set: function (value) {
        value = value || 0;
        this._fixedCol = value;
        if (value === 0) this.$leftLine.addStyle('display', 'none');
        else this.$leftLine.removeStyle('display');
        this.requestUpdateContent();

        // this.$domSignal.emit('requestUpdateContent');
    },
    get: function () {
        return this._fixedCol || 0;
    }
};


ACore.install(TableScroller);

export default TableScroller;

/***
 *
 * @param {TableScroller} elt
 * @constructor
 */
function ScrollController(elt) {
    this.elt = elt;

    Object.keys(this.constructor.prototype).filter(k => k.startsWith('ev_'))
        .forEach(k => this[k] = this[k].bind(this));

    this.vscrollTarget = null;
    this.hscrollTarget = null;


    this.elt.$vscroller.on('scroll', this.ev_vScrollerScroll);
    this.elt.$vscrollbar.on('scroll', this.ev_vScrollbarScroll);


    this.elt.$hscroller.on('scroll', this.ev_hScrollerScroll);
    this.elt.$hscrollbar.on('scroll', this.ev_hScrollbarScroll);
    this.elt.$fixedYHeaderScroller.on('scroll', this.ev_fixedYHeaderScroll);
}


ScrollController.prototype.ev_vScrollerScroll = function (event) {
    var now = new Date().getTime();
    if (this.vscrollTarget && now - this.vscrollTarget.time < 100 && this.vscrollTarget.elt !== this.elt.$vscroller) return;
    this.elt.$vscrollbar.innerOffset = this.elt.$vscroller.scrollTop;
    this.vscrollTarget = {
        time: now,
        elt: this.elt.$vscroller
    };
};


ScrollController.prototype.ev_vScrollbarScroll = function (event) {
    var now = new Date().getTime();
    if (this.vscrollTarget && now - this.vscrollTarget.time < 100 && this.vscrollTarget.elt !== this.elt.$vscrollbar) return;
    this.elt.$vscroller.scrollTop = this.elt.$vscrollbar.innerOffset;
    this.vscrollTarget = {
        time: now,
        elt: this.elt.$vscrollbar
    };
};


ScrollController.prototype.ev_hScrollerScroll = function (event) {
    var now = new Date().getTime();
    if (this.hscrollTarget && now - this.hscrollTarget.time < 100 && this.hscrollTarget.elt !== this.elt.$hscroller) return;
    this.elt.$hscrollbar.innerOffset = this.elt.$hscroller.scrollLeft;
    this.elt.$fixedYHeaderScroller.scrollLeft = this.elt.$hscroller.scrollLeft;
    this.hscrollTarget = {
        time: now,
        elt: this.elt.$hscroller
    };
};

ScrollController.prototype.ev_fixedYHeaderScroll = function (event) {
    var now = new Date().getTime();
    if (this.hscrollTarget && now - this.hscrollTarget.time < 100 && this.hscrollTarget.elt !== this.elt.$fixedYHeaderScroller) return;
    this.elt.$hscrollbar.innerOffset = this.elt.$fixedYHeaderScroller.scrollLeft;
    this.elt.$hscroller.scrollLeft = this.elt.$fixedYHeaderScroller.scrollLeft;
    this.hscrollTarget = {
        time: now,
        elt: this.elt.$fixedYHeaderScroller
    };
};


ScrollController.prototype.ev_hScrollbarScroll = function (event) {
    var now = new Date().getTime();
    if (this.hscrollTarget && now - this.hscrollTarget.time < 100 && this.hscrollTarget.elt !== this.elt.$hscrollbar) return;
    this.elt.$hscroller.scrollLeft = this.elt.$hscrollbar.innerOffset >> 0;
    this.vscrollTarget = {
        time: now,
        elt: this.elt.$hscrollbar
    };
};

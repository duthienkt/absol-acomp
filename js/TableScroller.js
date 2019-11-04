import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";
import Element from "absol/src/HTML5/Element";
import BScroller from "./BScroller";

var $ = Acore.$;
var _ = Acore._;



function TableScroller() {
    var res = _({
        class: 'absol-table-scroller',
        child: [
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
            '.absol-table-scroller-left-line',
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
            }
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, TableScroller.eventHandler);

    res.$content = undefined;
    res.$fixedViewport = $('.absol-table-scroller-fixed-viewport', res);

    res.$leftScroller = $('.absol-table-scroller-left-vscroller', res);
    res.$leftViewport = $('.absol-table-scroller-left-vscroller-viewport', res)
        .on('scroll', res.eventHandler.scrollLeftScrollerViewport);;

    res.$headScroller = $('.absol-table-scroller-header-hscroller', res);
    res.$headScrollerViewport = $('.absol-table-scroller-header-hscroller-viewport', res)
        .on('scroll', res.eventHandler.scrollHeadScrollerViewport);

    res.$attachHook = _('attachhook').addTo(res);
    res.$attachHook.on('error', function () {
        Dom.addToResizeSystem(res.$attachHook);
        res.$attachHook.updateSize = res.$attachHook.updateSize||res._updateContentSize.bind(res);
    });

    res.sync = new Promise(function (rs) {
        res.$attachHook.once('error', rs)
    });

    res.$viewport = $('.absol-table-scroller-viewport', res)
        .on('scroll', res.eventHandler.scrollViewport);

    res.$viewport.scrollInto = BScroller.prototype.scrollInto;

    res.$leftLine = $('.absol-table-scroller-left-line', res);
    res.$headLine = $('.absol-table-scroller-head-line', res);

    res.$vscrollbarCtn = $('.absol-table-scroller-vscrollbar-container', res);
    res.$vscrollbar = $('.absol-table-scroller-vscrollbar-container vscrollbar', res)
        .on('scroll', function () {
            res.$viewport.scrollTop = this.innerOffset;
        });


    res.$hscrollbarCtn = $('.absol-table-scroller-hscrollbar-container', res);
    res.$hscrollbar = $('.absol-table-scroller-hscrollbar-container hscrollbar', res)
        .on('scroll', function () {
            res.$viewport.scrollLeft = this.innerOffset;
        });

    res.$vscrollbar.hidden = false;
    res.$hscrollbar.hidden = false;
    return res;
}

TableScroller.scrollSize = 17;//default 

Dom.getScrollSize().then(function (size) {
    TableScroller.scrollSize = size.width;//default scroller
    TableScroller.$style = _('style[id="table-scroller-css"]').addTo(document.head);
    TableScroller.$style.innerHTML = [
        '.absol-table-scroller .absol-table-scroller-viewport {',// 
        '    width: calc(100% + ' + size.width + 'px);',
        '    height: calc(100% + ' + size.width + 'px);',
        '}',
        '.absol-table-scroller .absol-table-scroller-header-hscroller-viewport {',
        '    margin-bottom: -' + size.width + 'px;/*default*/',
        '}'

    ].join('\n');
    Dom.updateResizeSystem();
    setTimeout(Dom.updateResizeSystem.bind(Dom), 30);// css load delay
});

TableScroller.eventHandler = {};
TableScroller.eventHandler.scrollViewport = function (event) {
    if (!this.__scrollingElement__ || this.__scrollingElement__ == this.$viewport) {
        this.__scrollingElement__ = this.$viewport;
        this.$headScrollerViewport.scrollLeft = this.$viewport.scrollLeft;
        this.$leftViewport.scrollTop = this.$viewport.scrollTop;
        this.$vscrollbar.innerOffset = this.$viewport.scrollTop;
        this.$hscrollbar.innerOffset = this.$viewport.scrollLeft;

        if (this.__scrollTimer__ > 0) {
            clearTimeout(this.__scrollTimer__);
        }
        this.__scrollTimer__ = setTimeout(function () {
            this.__scrollingElement__ = undefined;
            this.__scrollTimer__ = -1;
        }.bind(this), 300);
    }
};

TableScroller.eventHandler.scrollHeadScrollerViewport = function (event) {
    if (!this.__scrollingElement__ || this.__scrollingElement__ == this.$headScrollerViewport) {
        this.__scrollingElement__ = this.$headScrollerViewport;
        this.$viewport.scrollLeft = this.$headScrollerViewport.scrollLeft;
        if (this.__scrollTimer__ > 0) {
            clearTimeout(this.__scrollTimer__);
        }
        this.__scrollTimer__ = setTimeout(function () {
            this.__scrollingElement__ = undefined;
            this.__scrollTimer__ = -1;
        }.bind(this), 100);
    }
};


TableScroller.eventHandler.scrollLeftScrollerViewport = function () {
    if (!this.__scrollingElement__ || this.__scrollingElement__ == this.$leftViewport) {
        this.__scrollingElement__ = this.$leftViewport;
        this.$viewport.scrollTop = this.$leftViewport.scrollTop;
        if (this.__scrollTimer__ > 0) {
            clearTimeout(this.__scrollTimer__);
        }
        this.__scrollTimer__ = setTimeout(function () {
            this.__scrollingElement__ = undefined;
            this.__scrollTimer__ = -1;
        }.bind(this), 100);
    }
}

TableScroller.prototype.clearChild = function () {
    this.$viewport.clearChild();
    this.$fixedViewport.clearChild();
    this.$headScrollerViewport.clearChild();
    this.$leftViewport.clearChild();
    this.$content = null;
    return this;
};

TableScroller.prototype.addChild = function (elt) {
    if (this.$viewport.childNodes.length == 0) {
        if (elt.tagName && elt.tagName.toLowerCase() == 'table') {

            this.$viewport.addChild(elt);
            this.$content = elt;
            this._updateContent();
            this.sync.then(this._updateContentSize.bind(this)).then(function () {
                setTimeout(this._updateContentSize.bind(this), 30);
            }.bind(this));
        }
        else {
            throw new Error('Element must be a table!');
        }
    }
    else {
        throw new Error("Only 1 table accepted!");
    }
};


TableScroller.prototype._updateFixedTable = function () {
    var fixedCol = this.fixedCol;
    this.$fixedViewport.clearChild();
    this.$fixedTable = $(this.$content.cloneNode(false)).addClass('absol-table-scroller-fixed-table').addTo(this.$fixedViewport);
    this.$fixedTableThead = $(this.$contentThead.cloneNode(false)).addTo(this.$fixedTable);

    this.$fixedTableThead.clearChild();
    this._fixedTableThsVisible = [];
    var self = this;
    this._fixedTableTr = Array.prototype.filter.call(this.$contentThead.childNodes, function (elt) {
        return elt.tagName == "TR";
    }).map(function (tr) {
        var cloneTr = $(tr.cloneNode(false));
        cloneTr.__originElement__ = tr;
        self.$fixedTableThead.appendChild(cloneTr);
        return cloneTr;
    });

    this._fixedTableThs = this._fixedTableTr.map(function (tr) {
        return Array.prototype.filter.call(tr.__originElement__.childNodes, function (elt1) {
            return elt1.tagName == "TH" || elt1.tagName == "TD";
        }).reduce(function (ac, th) {
            var colspan = th.getAttribute('colspan');
            if (colspan) {
                colspan = parseInt(colspan);
            }
            else {
                colspan = 1;
            }
            ac.colspanSum += colspan;
            var cloneTh = $(th.cloneNode(true));
            tr.appendChild(cloneTh);
            cloneTh.__originElement__ = th;
            ac.result.push(cloneTh);
            if (ac.colspanSum <= fixedCol) {
                self._fixedTableThsVisible.push(th);
            }
            return ac;
        }, { result: [], colspanSum: 0 }).result;
    });

};


TableScroller.prototype._updateHeaderScroller = function () {
    var self = this;
    this.$headScrollerViewport.clearChild();
    this.$headScrollerTable = $(this.$content.cloneNode(false))
        .addTo(this.$headScrollerViewport);
    this.$headScrollerThead = $(this.$contentThead.cloneNode(false))
        .addTo(this.$headScrollerTable);

    this._headScrollerTr = Array.prototype.filter.call(this.$contentThead.childNodes, function (elt) {
        return elt.tagName == "TR";
    }).map(function (tr) {
        var cloneTr = $(tr.cloneNode(false));
        cloneTr.__originElement__ = tr;
        self.$headScrollerThead.appendChild(cloneTr);
        return cloneTr;
    });

    this._headScrollerTds = this._headScrollerTr.map(function (tr) {
        return Array.prototype.filter.call(tr.__originElement__.childNodes, function (elt1) {
            return elt1.tagName == "TH";
        }).map(function (th) {
            var cloneTh = $(th.cloneNode(true)).addTo(tr);
            cloneTh.__originElement__ = th;
            return cloneTh;
        });

    });
};


TableScroller.prototype._updateLeftTable = function () {
    this.$leftViewport.clearChild();
    this.$leftTable = $(this.$content.cloneNode(true)).addTo(this.$leftViewport);


};


TableScroller.prototype._updateContent = function () {
    this.$contentThead = $('thead', this.$content);
    this._updateFixedTable();
    this._updateHeaderScroller();
    this._updateLeftTable();
};

TableScroller.prototype._updateFixedTableSize = function () {
    var l = 1000;
    var r = -1000;
    this._fixedTableThsVisible.forEach(function (elt) {
        var b = elt.getBoundingClientRect();
        l = Math.min(l, b.left);
        r = Math.max(r, b.right);
    });
    this._leftWidth = Math.max(r - l, 0);

    this.$fixedViewport.addStyle('width', this._leftWidth + 2 + 'px');

    this._fixedTableTr.forEach(function (elt) {
        var styleHeight = elt.__originElement__.getBoundingClientRect().height + 'px';
        elt.addStyle('height', styleHeight);
    });

    this._fixedTableThs.forEach(function (row) {
        row.forEach(function (elt) {
            var styleWidth = elt.__originElement__.getBoundingClientRect().width + 'px';
            elt.addStyle('width', styleWidth);
        });

    });

    this.$fixedTable.addStyle({
        height: this.$contentThead.getBoundingClientRect().height + 'px',
        width: this.$content.getBoundingClientRect().width + 'px',
    });
};


TableScroller.prototype._updateHeaderScrollerSize = function () {
    var headHeight = this.$contentThead.getBoundingClientRect().height + 'px';
    this.$headScrollerTable.addStyle('height', headHeight);
    this.$headScrollerTable.addStyle('width', this.$content.getBoundingClientRect().width + 'px');
    this._headScrollerTr.forEach(function (elt) {
        var styleHeight = elt.__originElement__.getBoundingClientRect().height + 'px';
        elt.addStyle('height', styleHeight);
    });

    this._headScrollerTds.forEach(function (row) {
        row.forEach(function (elt) {
            var styleWidth = elt.__originElement__.getBoundingClientRect().width + 'px';
            elt.addStyle('width', styleWidth);
        });
    });
};

TableScroller.prototype._updateLeftTableSize = function () {
    this.$leftTable.addStyle('width', this.$content.getBoundingClientRect().width + 'px');
    this.$leftTable.addStyle('height', this.$content.getBoundingClientRect().height + 'px');
    this.$leftScroller.addStyle('width', this._leftWidth + 2 + 'px');
};

TableScroller.prototype._updateLinesSize = function () {
    if (this.$viewport.clientHeight < this.$viewport.scrollHeight) {
        this.addClass('scroll-v');
    }
    else {
        this.removeClass('scroll-v');
    }

    if (this.$viewport.clientWidth < this.$viewport.scrollWidth) {
        this.addClass('scroll-h');
    }
    else {
        this.removeClass('scroll-h');
    }

    this.$leftLine.addStyle({
        maxHeight: this.$content.getBoundingClientRect().height + 'px',
        left: this._leftWidth + 'px'
    });
    this.$headLine.addStyle({
        top: this.$contentThead.getBoundingClientRect().height + 'px',
        maxWidth: this.$content.getBoundingClientRect().width + 'px'
    });
};


TableScroller.prototype._updateScrollBarSize = function () {
    var viewportBound = this.$viewport.getBoundingClientRect();
    var tableBound = this.$content.getBoundingClientRect();
    this.$vscrollbar.innerHeight = this.$viewport.scrollHeight;
    this.$vscrollbar.outerHeight = viewportBound.height - TableScroller.scrollSize;


    this.$hscrollbar.innerWidth = this.$viewport.scrollWidth;
    this.$hscrollbar.outerWidth = viewportBound.width - TableScroller.scrollSize;

    var overHeight = this.$viewport.clientHeight < this.$viewport.scrollHeight;
    var overWidth = this.$viewport.clientWidth < this.$viewport.scrollWidth;
    if (overHeight) {
        if (overWidth) {
            this.$hscrollbarCtn.removeStyle('bottom');
            this.$vscrollbarCtn.removeStyle('right');
        }
        else {
            this.$vscrollbarCtn.addStyle('right', viewportBound.width - TableScroller.scrollSize - tableBound.width + 'px');
        }
    }
    else {
        if (overWidth) {
            this.$hscrollbarCtn.addStyle('bottom', viewportBound.height - TableScroller.scrollSize - tableBound.height + 'px');
        }
    }
};

TableScroller.prototype._updateContentSize = function () {
    this._updateFixedTableSize();
    this._updateHeaderScrollerSize();
    this._updateLeftTableSize();
    this._updateLinesSize();
    this._updateScrollBarSize();
};

TableScroller.property = {};

TableScroller.property.fixedCol = {
    set: function (value) {
        value = value || 0;
        this._fixedCol = value;
        if (this.$content) {
            this._updateContent();
            this.sync.then(this._updateContentSize.bind(this)).then(function () {
                setTimeout(this._updateContentSize.bind(this), 30)
            }.bind(this));
        }
    },
    get: function () {
        return this._fixedCol || 0;
    }
};




Acore.install('TableScroller'.toLowerCase(), TableScroller);

export default TableScroller;
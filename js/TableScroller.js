import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";
import Element from "absol/src/HTML5/Element";

var $ = Acore.$;
var _ = Acore._;

function TableScroller() {
    var res = _({
        class: 'absol-table-scroller',
        child: [
            'bscroller.absol-table-scroller-viewport',
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
        res.$attachHook.updateSize = res._updateContentSize.bind(res);

    });

    res.sync = new Promise(function (rs) {
        res.$attachHook.on('error', rs)
    });

    res.$viewport = $('bscroller.absol-table-scroller-viewport', res)
        .on('scroll', res.eventHandler.scrollViewport);

    res.$leftLine = $('.absol-table-scroller-left-line', res);
    res.$headLine = $('.absol-table-scroller-head-line', res);
    return res;
}

TableScroller.eventHandler = {};
TableScroller.eventHandler.scrollViewport = function (event) {
    if (!this.__scrollingElement__ || this.__scrollingElement__ == this.$viewport) {
        this.__scrollingElement__ = this.$viewport;
        this.$headScrollerViewport.scrollLeft = this.$viewport.scrollLeft;
        this.$leftViewport.scrollTop = this.$viewport.scrollTop;

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
    this.$topTable.clearChild();
    this.$content = null;
};

TableScroller.prototype.addChild = function (elt) {
    if (this.$viewport.childNodes.length == 0) {
        if (elt.tagName && elt.tagName.toLowerCase() == 'table') {
            this.$viewport.addChild(elt);
            this.$content = elt;
            this._updateContent();
            this.sync.then(this._updateContentSize.bind(this)).then(function () {
                setTimeout(this._updateContentSize.bind(this), 30)
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
            return elt1.tagName == "TH";
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

    this._leftWidth = r - l;
    this.$fixedViewport.addStyle('width', this._leftWidth + 2 + 'px');

    this._fixedTableTr.forEach(function (elt) {
        var styleHeight = Element.prototype.getComputedStyleValue.call(elt.__originElement__, 'height');
        elt.addStyle('height', styleHeight);
    });

    this._fixedTableThs.forEach(function (row) {
        row.forEach(function (elt) {
            var styleWidth = Element.prototype.getComputedStyleValue.call(elt.__originElement__, 'width');

            elt.addStyle('width', styleWidth);
        });

    });
    this.$fixedTable.addStyle({
        height: this.$contentThead.getComputedStyleValue('height')
    });
};


TableScroller.prototype._updateHeaderScrollerSize = function () {
    var headHeight = Element.prototype.getComputedStyleValue.call(this.$contentThead, 'height');
    this.$headScrollerTable.addStyle('height', headHeight);
    this.$headScroller.addStyle('height', headHeight);
    this._headScrollerTr.forEach(function (elt) {

        var styleHeight = Element.prototype.getComputedStyleValue.call(elt.__originElement__, 'height');
        elt.addStyle('height', styleHeight);
    });

    this._headScrollerTds.forEach(function (row) {
        row.forEach(function (elt) {
            var styleWidth = Element.prototype.getComputedStyleValue.call(elt.__originElement__, 'width');
            elt.addStyle('width', styleWidth);
        });
    });
};

TableScroller.prototype._updateLeftTableSize = function () {
    if (!this.$leftTable.style.width) {
        this.$leftTable.addStyle('width', this.$content.getComputedStyleValue('width'));
    }
    if (!this.$leftTable.style.height) {
        this.$leftTable.addStyle('height', this.$content.getComputedStyleValue('height'));
    }

    // console.log(this._leftWidth);

    this.$leftScroller.addStyle('width', this._leftWidth + 2 + 'px');
};

TableScroller.prototype._updateLinesSize = function () {
    this.$leftLine.addStyle({
        maxHeight: this.$content.getComputedStyleValue('height'),
        left: this._leftWidth + 'px'
    });
    this.$headLine.addStyle({
        top: this.$contentThead.getComputedStyleValue('height'),
        maxWidth: this.$content.getComputedStyleValue('width')
    });
};

TableScroller.prototype._updateContentSize = function () {
    this._updateFixedTableSize();
    this._updateHeaderScrollerSize();
    this._updateLeftTableSize();
    this._updateLinesSize();
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
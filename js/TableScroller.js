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
            '.absol-table-scroller-fixed-table'//place holder
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, TableScroller.eventHandler);

    res.$content = undefined;
    res.$fixedTable = $('.absol-table-scroller-fixed-table', res);
    res.$attachHook = _('attachhook').addTo(res);
    res.$attachHook.on('error', function () {
        Dom.addToResizeSystem(res.$attachHook);
    });

    res.sync = new Promise(function (rs) {
        res.$attachHook.on('error', rs)
    });

    res.$viewport = $('bscroller.absol-table-scroller-viewport', res)
        .on('scroll', res.eventHandler.scrollViewport);

    return res;
}

TableScroller.eventHandler = {};
TableScroller.eventHandler.scrollViewport = function (event) {

};

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
            this.sync.then(this._updateContentSize.bind(this))

            // this.$table = $(elt);
            // this.$thead = $('thead', elt);
            // this.$tr = $('tr', this.$thead);
            // this.$topThead = this.$thead.cloneNode(true);
            // this.$topTr = $('tr', this.$topThead);
            // this.$topTable.addChild(this.$topThead).addStyle('display', 'none');
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
    // console.log(this.fixedCol, this.$contentThead);
    var fixedCol = this.fixedCol;
    this.$fixedTableThead.clearChild();
    var self = this;
    this._fixedTableTr = Array.prototype.filter.call(this.$contentThead.childNodes, function (elt) {
        return elt.tagName == "TR";
    }).map(function (tr) {
        var cloneTr = tr.cloneNode(false);
        cloneTr.__originElement__ = tr;
        self.$fixedTableThead.appendChild(cloneTr);
        return cloneTr;
    });

    this._fixedTableTds = this._fixedTableTr.map(function (tr) {
        return Array.prototype.filter.call(tr.__originElement__.childNodes, function (elt1) {
            return elt1.tagName == "TH";
        }).reduce(function (ac, td) {
            var colspan = td.getAttribute('colspan');
            if (colspan) {
                colspan = parseInt(colspan);
            }
            else {
                colspan = 1;
            }
            ac.colspanSum += colspan;
            if (ac.colspanSum <= fixedCol) {
                var cloneTd = $(td.cloneNode(true));
                cloneTd.__originElement__ = td;
                ac.result.push(cloneTd);
                tr.appendChild(cloneTd);
            }
            return ac;
        }, { result: [], colspanSum: 0 }).result;
    });



};



TableScroller.prototype._updateContent = function () {
    this.$contentThead = $('thead', this.$content);
    var newFixedTable = $(this.$content.cloneNode(false)).addClass('absol-table-scroller-fixed-table');
    this.$fixedTable.selfReplace(newFixedTable) ;
    this.$fixedTable = newFixedTable;
    this.$fixedTableThead = $(this.$contentThead.cloneNode(false)).addTo(this.$fixedTable);
    this._updateFixedTable();

};

TableScroller.prototype._updateFixedTableSize = function () {

    var bleft = 100000;
    var bright = -100000;
    var btop = 100000;
    var bbottom = -100000;
    this._fixedTableTds.forEach(row => {
        row.forEach(function (elt) {
            var b = elt.__originElement__.getBoundingClientRect();
            bleft = Math.min(b.left, bleft);
            btop = Math.min(b.top, btop);
            bright = Math.max(b.right, bright);
            bbottom = Math.max(b.bottom, bbottom);
            var styleWidth = Element.prototype.getComputedStyleValue.call(elt.__originElement__,'width');
            elt.addStyle('width', styleWidth);
        });
    });
    this.$fixedTable.addStyle({
        width: bright - bleft + 'px',
        height: bbottom - btop + 'px'
    })
};

TableScroller.prototype._updateContentSize = function () {
    this._updateFixedTableSize();
};

TableScroller.property = {};

TableScroller.property.fixedCol = {
    set: function (value) {
        value = value || 0;
        this._fixedCol = value;
    },
    get: function () {
        return this._fixedCol || 0;
    }
};




Acore.install('TableScroller'.toLowerCase(), TableScroller);

export default TableScroller;
import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";

var $ = Acore.$;
var _ = Acore._;

function TableScroller() {
    var res = _({
        class: 'absol-table-scroller',
        child: [
            'bscroller.absol-table-scroller-viewport',
            {
                tag: 'table',
                class:"absol-table-scroller-fixed-table",
                child: ['thead']
            }
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

TableScroller.prototype._updateContent = function () {
    if (!this.$content) return;

};


TableScroller.property = {};

TableScroller.property.fixedCol = {
    set: function (value) {
        value = value || 0;
        this._fixedCol = value;
        this.sync.then( this._updateContent.bind(this));
    },
    get: function () {
        return this._fixedCol || 0;
    }
};




Acore.install('TableScroller'.toLowerCase(), TableScroller);

export default TableScroller;
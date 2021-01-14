import '../css/tablevscroller.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

function TableVScroller() {
    var thisTS = this;
    this.$attachHook = $('attachhook', this);
    this.$attachHook.updateSize = this.update.bind(this);

    this.sync = new Promise(function (rs) {
        thisTS.$attachHook.on('error', rs)
    });
    this.$viewport = $('.absol-table-vscroller-viewport', this);
    this.$attachHook.on('error', function () {
        Dom.addToResizeSystem(thisTS.$attachHook);
        this.updateSize();
    });
    this.$topTable = $('.absol-table-vscroller-head', this);
    this.$headLine = $('.absol-table-vscroller-head-line', this);
}

TableVScroller.tag = 'TableVScroller'.toLowerCase();

TableVScroller.render = function () {
    return _(
        {
            class: 'absol-table-vscroller',
            child: [
                '.absol-table-vscroller-viewport',
                'table.absol-table-vscroller-head',
                '.absol-table-vscroller-head-line',
                'attachhook'
            ]
        }
    );
};

TableVScroller.prototype.clearChild = function () {
    this.$viewport.clearChild();
    this.$topTable.clearChild();
};

TableVScroller.prototype.addChild = function (elt) {
    if (this.$viewport.childNodes.length == 0) {
        if (elt.tagName && elt.tagName.toLowerCase() == 'table') {
            this.$viewport.addChild(elt);
            this.$table = $(elt);
            this.$thead = $('thead', elt);
            this.$tr = $('tr', this.$thead);
            this.$topThead = this.$thead.cloneNode(true);
            this.$topTr = $('tr', this.$topThead);
            this.$topTable.addChild(this.$topThead).addStyle('display', 'none');
            this.update();
        }
        else {
            throw new Error('Element must be a table!');
        }
    }
    else {
        throw new Error("Only 1 table accepted!");
    }
};

TableVScroller.prototype._trackBackgroundColor = function (element) {
    var current = this.$thead;
    var res;
    while (current && !res && res != 'rgba(0, 0, 0, 0)') {
        res = window.getComputedStyle(element).getPropertyValue('background-color');
        current = current.parentNode;

    }
    if (res == 'rgba(0, 0, 0, 0)') return 'white';
    return res;
}

TableVScroller.prototype.updateStyle = function () {
    if (!this.$thead) return;
    var clazz = this.$table.attr('class');
    if (clazz) {
        clazz = clazz.trim().split(/\s+/);
        for (var i = 0; i < clazz.length; ++i) {
            this.$topTable.addClass(clazz[i]);
        }
    }
    var bgColor = this._trackBackgroundColor(this.$thead);
    this.$topTable.addStyle('background-color', bgColor);
};


TableVScroller.prototype.updateSize = function () {
    var theadBound = this.$thead.getBoundingClientRect();
    var tableBound = this.$table.getBoundingClientRect();
    this.$topTable.addStyle({
        width: tableBound.width + 'px',
        height: theadBound.height + 'px'
    });
    this.$headLine.addStyle({
        top: theadBound.height + 'px',
        maxWidth: tableBound.width + 'px'
    });

    if (this.$viewport.clientHeight < this.$viewport.scrollHeight) {
        this.addClass('scroll-v');
    }
    else {
        this.removeClass('scroll-v');
    }
    var realNodes = this.$tr.childNodes;
    var topNodes = this.$topTr.childNodes;

    for (var i = 0; i < realNodes.length; ++i) {
        if (!realNodes[i].tagName) continue;
        var wstyle = window.getComputedStyle($(realNodes[i])).getPropertyValue('width');
        $(topNodes[i]).attr('style', realNodes[i].attr('style')).addStyle('width', wstyle);
    }
    this.$topTable.removeStyle('display');
}


TableVScroller.prototype.update = function () {
    if (!this.$thead) return;
    this.updateStyle();
    this.updateSize();
};

ACore.install(TableVScroller);

export default TableVScroller;

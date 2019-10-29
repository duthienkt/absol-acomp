import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

function SinglePage() {
    var res = _({
        tag: 'tabframe',
        class: 'absol-single-page',
        child: {
            class: 'absol-single-page-scroller',
            child: { class: 'absol-single-page-scroller-viewport' }
        }
    });
    res.$attachhook = _('attachhook').addTo(res)
        .on('error', function () {
            this.updateSize = this.updateSize || res.updateSize.bind(res);
            this.updateSize();
            Dom.addToResizeSystem(this);
        });
    res.$header = null;
    res.$footer = null;
    res.$viewport = $('.absol-single-page-scroller-viewport', res);
    res.$scroller = $('.absol-single-page-scroller', res);
    return res;
}


SinglePage.prototype.updateSize = function () {

    if (this.$header) {
        var headerBound = this.$header.getBoundingClientRect();
        this.$viewport.addStyle('padding-top', headerBound.height + 'px');
        var viewportBound = this.$viewport.getBoundingClientRect();
        this.$header.addStyle('width', viewportBound.width + 'px');
    }
    if (this.$footer) {
        var footerBound = this.$footer.getBoundingClientRect();
        
        // this.$viewport.addStyle('padding-bottom', footerBound.height + 'px');
    }
};

SinglePage.prototype.addChild = function (elt) {
    if (elt.classList.contains('absol-single-page-header')) {
        this.appendChild(elt);
        this.$header = elt;
    }
    else if (elt.classList.contains('absol-single-page-footer')) {
        this.$viewport.addChild(elt);
        this.$footer = elt;
    }
    else {
        this.$viewport.addChild(elt);
    }
};

SinglePage.prototype.removeChild = function (elt) {
    if (elt == this.$footer) {
        this.$viewport.removeChild(elt);
        this.$footer = undefined;
    }
    else if (elt == this.$header) {
        this.super(elt);
        this.$header = undefined;
    }
    else {
        this.$viewport.removeChild(elt);
    }
};




Acore.install('singlepage', SinglePage);

export default SinglePage;

import '../css/singlepage.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import AElement from "absol/src/HTML5/AElement";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

var _ = ACore._;
var $ = ACore.$;

var warned = false;

/***
 * @extends TabFrame
 * @constructor
 */
function SinglePage() {
    var thisSP = this;
    this._updateIntv = -1;
    this._tick = function () {
        if (this.isDescendantOf(document.body)) {
            if (this.$header) {
                var headerHeight = this.$header.getBoundingClientRect().height;
                if (this._prevHeaderHeight !== headerHeight) {
                    ResizeSystem.update();
                }
            }
        }
        else {
            clearInterval(this._updateIntv);
            this._updateIntv = -1;
        }
    }.bind(this);
    this.$attachhook = $('attachhook', this)
        .on('attached', function () {
            this.updateSize();
            setTimeout(this.updateSize, 20);
            Dom.addToResizeSystem(this);
            if (thisSP._updateIntv < 0) {
                thisSP._updateIntv = setInterval(thisSP._tick, 200);
            }
            if (obs) {
                obs.disconnect();
                obs = null;
            }

        });
    var obs = new IntersectionObserver( (entries) =>{
        this.updateSize();
    }, {root: document.body});
    obs.observe(this);
    this.$attachhook.updateSize = this.updateSize.bind(this);
    this.$header = null;
    this.$footer = null;
    this.$viewport = $('.absol-single-page-scroller-viewport', this);
    this.$scroller = $('.absol-single-page-scroller', this);
}

SinglePage.tag = 'SinglePage'.toLowerCase();

SinglePage.render = function () {
    return _({
        tag: 'tabframe',
        extendEvent: ['sizechange'],
        class: 'absol-single-page',
        child: [{
            class: 'absol-single-page-scroller',
            child: { class: 'absol-single-page-scroller-viewport' }
        },
            'attachhook']
    });
};


SinglePage.prototype.updateSize = function () {
    if (!this.isDescendantOf(document.body)) return;
    var paddingTop = parseFloat(this.getComputedStyleValue('padding-top').replace('px', '')) || 0;

    if (this.$header) {
        var headerBound = this.$header.getBoundingClientRect();
        this._prevHeaderHeight = headerBound.height;
    }
    if (this.$footer) {
        var footerBound = this.$footer.getBoundingClientRect();
        this.$viewport.addStyle('padding-bottom', footerBound.height + 'px');
    }
    this.addStyle('--single-page-scroller-height', this.$scroller.clientHeight + 'px');
    if (this.isSupportedEvent('sizechange'))
        this.emit('sizechange', { type: 'sizechange', target: this }, this);

};

SinglePage.prototype.isHeader = function (elt) {
    return elt && elt.classList && elt.classList.contains('absol-single-page-header');
};

SinglePage.prototype.updateLayoutStyle = function () {
  if (this.$header) {
      this.addClass('as-has-header');
  }
  else {
      this.removeClass('as-has-header');
  }
};

SinglePage.prototype.addChild = function (elt) {
    if (this.isHeader(elt)) {
        if (this.$header) {
            this.$header.remove();
        }
        if (this.firstChild) {
            this.addChildBefore(elt, this.firstChild);
        }
        else {
            this.appendChild(elt);
        }
        this.$header = $(elt);
        this.updateLayoutStyle();
        this.updateSize();
    }
    else if (elt.classList.contains('absol-single-page-footer')) {
        this.$viewport.addChild(elt);
        this.$footer = $(elt);
        this.updateLayoutStyle();
        this.updateSize();
    }
    else {
        this.$viewport.addChild(elt);
    }
};

SinglePage.prototype.removeChild = function (elt) {
    if (elt == this.$footer) {
        this.$viewport.removeChild(elt);
        this.$footer = undefined;
        this.updateSize();
    }
    else if (elt == this.$header) {
        this.super(elt);
        this.$header = undefined;
        this.updateSize();
    }
    else {
        this.$viewport.removeChild(elt);
    }
};


ACore.install(SinglePage);

export default SinglePage;

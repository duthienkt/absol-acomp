import '../css/bscroller.css';
import ACore from "../ACore";
import Element from "absol/src/HTML5/Element";

var _ = ACore._;
var $ = ACore.$;

function BScroller(data) {
    this.addClass('as-bscroller');
}


BScroller.tag = "bscroller";

BScroller.render = function (data) {
    if (data && data.elt) {
        return $(data.elt)
    }
    else
        return _('div');
};

BScroller.prototype.scrollInto = function (element) {
    if (Element.prototype.isDescendantOf.call(element, this)) {
        var elementBound = element.getBoundingClientRect();
        var viewportBound = this.getBoundingClientRect();
        var currentScrollTop = this.scrollTop;
        var newScrollTop = currentScrollTop;
        if (elementBound.bottom > viewportBound.bottom) {
            newScrollTop = currentScrollTop + (elementBound.bottom - viewportBound.bottom);
        }
        if (elementBound.top < viewportBound.top) {
            newScrollTop = currentScrollTop - (viewportBound.top - elementBound.top);
        }

        if (newScrollTop != currentScrollTop) {
            this.scrollTop = newScrollTop;
        }

        var currentScrollLeft = this.scrollLeft;
        var newScrollLeft = currentScrollLeft;
        if (elementBound.right > viewportBound.right) {
            newScrollLeft = currentScrollLeft + (elementBound.right - viewportBound.right);
        }
        if (elementBound.left < viewportBound.left) {
            newScrollLeft = currentScrollLeft - (viewportBound.left - elementBound.left);
        }

        if (newScrollLeft != currentScrollLeft) {
            this.scrollLeft = newScrollLeft;
        }
    }
}


ACore.install(BScroller);

export default BScroller;
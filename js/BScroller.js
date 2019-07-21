import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;

function BScroller(data) {
    if (data && data.elt) {
        return $(data.elt)
    }
    else
        return _('.absol-bscroller');
}


BScroller.scrollInto = function (element) {
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


Acore.install('bscroller', BScroller);

export default BScroller;
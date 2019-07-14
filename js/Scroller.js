import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import OOP from "absol/src/HTML5/OOP";
import Element from "absol/src/HTML5/Element";
import { map } from 'absol/src/Math/int';

var _ = Acore._;
var $ = Acore.$;

Acore.$scrollStyle = (function () {
    var element = _('style#vscroller-style');
    element.innerHTML = [
        '.absol-vscroller-viewport{ margin-right: ' + (-17) + 'px;  min-width: calc(100% + ' + (17) + 'px);}',
        '.absol-hscroller-viewport{ margin-bottom: ' + (-17) + 'px;  min-height: calc(100% + ' + (17) + 'px);}'
    ].join('\n');
    document.head.appendChild(element);

    Dom.getScrollSize().then(function (size) {
        element.innerHTML = [
            '.absol-vscroller-viewport{ margin-right: ' + (-size.width) + 'px; min-width: calc(100% + ' + (size.width) + 'px);}',
            '.absol-hscroller-viewport{ margin-bottom: ' + (-size.height) + 'px; min-height: calc(100% + ' + (size.height) + 'px);}'
        ].join('\n');
    });
    return element;
}
)();

function VScroller() {
    var res = _({
        class: 'absol-vscroller',
        child: ['.absol-vscroller-viewport',
            {
                class: ['absol-scrollbar-container', 'vertical'],
                child: 'vscrollbar'
            }
        ]
    });
    res.eventHandler = OOP.bindFunctions(res, VScroller.eventHandler);
    res.sync = res.afterAttached();
    res.$vscrollbar = $('vscrollbar', res).on('scroll', res.eventHandler.scrollScrollbar);
    res.$viewport = $('.absol-vscroller-viewport', res)
        .on('scroll', res.eventHandler.scrollViewport);
    OOP.extends(res.$viewport, {
        removeChild: function () {
            this.super.apply(this, arguments);
            res.requestUpdateSize();
            return res;
        }
    })
    return res;
};

VScroller.prototype.requestUpdateSize = function () {
    // return;
    if (this._isRequestingUpdateSize) return this.sync;
    this._isRequestingUpdateSize = true;
    this.sync = this.sync.then(function () {
        this.$vscrollbar.outerHeight = this.$viewport.clientHeight;
        this.$vscrollbar.innerHeight = this.$viewport.scrollHeight - 2;
        this.$vscrollbar.innerOffset = this.$viewport.scrollTop;
        if (this.$vscrollbar.innerHeight <= this.$vscrollbar.outerHeight) {
            this.$vscrollbar.hidden = true;
            this.addClass('disabled');
        }
        else {
            this.removeClass('disabled');
            this.$vscrollbar.hidden = false;
        }
        this._isRequestingUpdateSize = false;
    }.bind(this));
    return this.sync;
};

VScroller.prototype.init = function (props) {
    this.super(props);
    this.requestUpdateSize();
};

VScroller.prototype.addChild = function () {
    var res = this.$viewport.addChild.apply(this.$viewport, arguments);
    this.requestUpdateSize();
    return res;
};

VScroller.prototype.clearChild = function () {
    var res = this.$viewport.clearChild.apply(this.$viewport, arguments);
    this.requestUpdateSize();
    return res;

};

VScroller.prototype.addChildBefore = function () {
    var res = this.$viewport.addChildBefore.apply(this.$viewport, arguments);
    this.requestUpdateSize();
    return res;
};

VScroller.prototype.addChildAfter = function () {
    var res = this.$viewport.addChildAfter.apply(this.$viewport, arguments);
    this.requestUpdateSize();
    return res;
};

VScroller.prototype.findChildAfter = function () {
    return this.$viewport.findChildAfter.apply(this.$viewport, arguments);
};

VScroller.prototype.findChildBefore = function () {
    return this.$viewport.findChildBefore.apply(this.$viewport, arguments);
};

VScroller.prototype.removeChild = function () {
    var res = this.$viewport.removeChild.apply(this.$viewport, arguments);
    this.requestUpdateSize();
    return res;
};

VScroller.prototype.scrollInto = function (element) {
    if (Element.prototype.isDescendantOf.call(element, this.$viewport)) {
        var elementBound = element.getBoundingClientRect();
        var viewportBound = this.$viewport.getBoundingClientRect();
        var currentScrollTop = this.$viewport.scrollTop;
        var newScrollTop = currentScrollTop;
        if (elementBound.bottom > viewportBound.bottom) {
            newScrollTop = currentScrollTop + (elementBound.bottom - viewportBound.bottom);
        }
        if (elementBound.top < viewportBound.top) {
            newScrollTop = currentScrollTop - (viewportBound.top - elementBound.top);
        }

        if (newScrollTop != currentScrollTop) {
            this.$viewport.scrollTop = newScrollTop;
        }
    }
}




VScroller.eventHandler = {};

VScroller.eventHandler.scrollViewport = function (event) {
    this.$vscrollbar.outerHeight = this.$viewport.clientHeight;
    this.$vscrollbar.innerHeight = this.$viewport.scrollHeight;
    this.$vscrollbar.innerOffset = this.$viewport.scrollTop;
};

VScroller.eventHandler.scrollScrollbar = function (event) {
    this.$viewport.scrollTop = this.$vscrollbar.innerOffset;
};







function HScroller() {
    var res = _({
        class: 'absol-hscroller',
        child: ['.absol-hscroller-viewport',
            {
                class: ['absol-scrollbar-container', 'horizontal'],
                child: 'hscrollbar'
            }
        ]
    });
    res.eventHandler = OOP.bindFunctions(res, HScroller.eventHandler);
    res.sync = res.afterAttached();
    res.$hscrollbar = $('hscrollbar', res).on('scroll', res.eventHandler.scrollScrollbar);
    res.$viewport = $('.absol-hscroller-viewport', res)
        .on('scroll', res.eventHandler.scrollViewport);
    OOP.extends(res.$viewport, {
        removeChild: function () {
            this.super.apply(this, arguments);
            res.requestUpdateSize();
            return res;
        }
    })
    return res;
};

HScroller.eventHandler = {};

HScroller.eventHandler.scrollViewport = function (event) {
    this.$hscrollbar.outerWidth = this.$viewport.clientWidth;
    this.$hscrollbar.innerWidth = this.$viewport.scrollWidth;
    this.$hscrollbar.innerOffset = this.$viewport.scrollLeft;
};

HScroller.eventHandler.scrollScrollbar = function (event) {
    this.$viewport.scrollLeft = this.$hscrollbar.innerOffset;
};


Object.assign(HScroller.prototype, VScroller.prototype);

HScroller.prototype.requestUpdateSize = function () {
    // return;
    if (this._isRequestingUpdateSize) return this.sync;
    this._isRequestingUpdateSize = true;
    this.sync = this.sync.then(function () {
        this.$hscrollbar.outerWidth = this.$viewport.clientWidth;
        this.$hscrollbar.innerWidth = this.$viewport.scrollWidth - 2;
        this.$hscrollbar.innerOffset = this.$viewport.scrollLeft;
        if (this.$hscrollbar.innerWidth <= this.$hscrollbar.outerWidth) {
            this.$hscrollbar.hidden = true;
            this.addClass('disabled');
        }
        else {
            this.removeClass('disabled');
            this.$hscrollbar.hidden = false;
        }
        this._isRequestingUpdateSize = false;
    }.bind(this));
    return this.sync;
};




function Scrollbar() {

    var res = _({
        class: ['absol-scrollbar', 'absol-hidden'],
        extendEvent: 'scroll',
        child: '.absol-scrollbar-button'
    });

    res.$button = $('.absol-scrollbar-button', res);
    return res;
};

Scrollbar.property = {};
Scrollbar.property.hidden = {
    set: function (value) {
        value = !!value;
        if (value != this._hidden) {
            this._hidden = value;
            if (value)
                this.addClass('absol-hidden');
            else
                this.removeClass('absol-hidden');
        }
    },
    get: function () {
        return this.containsClass('absol-hidden')
    }
};



function VScrollbar() {

    var res = _({
        tag: 'scrollbar',
    });


    var body = $('body');
    var top0, innerOffset0;
    var pointerMoveEventHandler = function (event) {
        event.preventDefault();
        var dy = event.clientY - top0;
        var newInnerOffset = innerOffset0 + dy * (res.innerHeight / res.outerHeight) * (res.outerHeight / res.getBoundingClientRect().height);
        if (newInnerOffset + res.outerHeight > res.innerHeight)
            newInnerOffset = res.innerHeight - res.outerHeight;
        if (newInnerOffset < 0) newInnerOffset = 0;
        res.innerOffset = newInnerOffset;
        //todo
        event.innerOffset = newInnerOffset;
        res.emit('scroll', event);
    };

    var finishEventHandler = function (event) {
        body.off('pointerleave', finishEventHandler);
        body.off('pointerup', finishEventHandler);
        body.off('pointermove', pointerMoveEventHandler);
    };

    var pointerDownEventHandler = function (event) {
        var boundRes = res.getBoundingClientRect();
        var boundButton = res.$button.getBoundingClientRect();
        top0 = event.clientY;
        if (event.target == res.$button) {
            innerOffset0 = res.innerOffset;
        }
        else {
            var newInnerOffset = map(top0 - boundButton.height / 2 - boundRes.top, 0, boundRes.height, 0, res.innerHeight);
            if (newInnerOffset + res.outerHeight > res.innerHeight)
                newInnerOffset = res.innerHeight - res.outerHeight;
            if (newInnerOffset < 0) newInnerOffset = 0;
            res.innerOffset = newInnerOffset;
            //todo
            event.innerOffset = newInnerOffset;
            innerOffset0 = newInnerOffset;
            res.emit('scroll', event);
        }

        body.on('pointerleave', finishEventHandler);
        body.on('pointerup', finishEventHandler);
        body.on('pointermove', pointerMoveEventHandler);

    };

    res.on('pointerdown', pointerDownEventHandler, true);


    return res;
};



VScrollbar.prototype.updateValue = function () {
    this.$button.addStyle('height', Math.min(this.outerHeight / this.innerHeight, 1) * 100 + '%');
    this.$button.addStyle('top', this.innerOffset / this.innerHeight * 100 + '%');
};


VScrollbar.property = {
    innerOffset: {
        set: function (value) {
            value = value || 0;
            if (this._innerOffset != value) {
                this._innerOffset = value;
                this.updateValue();
            }
        },
        get: function () {
            return this._innerOffset || 0;
        }
    },

    innerHeight: {
        set: function (value) {
            value = value || 1;
            value = Math.max(value, 1);
            if (this._innerHeight != value) {
                this._innerHeight = value;
                this.updateValue();
            }
        },
        get: function () {
            return this._innerHeight || 1;
        }
    },
    outerHeight: {
        set: function (value) {
            value = value || 0;
            value = Math.max(value, 0);
            if (this._outerHeight != value) {
                this._outerHeight = value;
                this.updateValue();
            }
        },
        get: function () {
            return this._outerHeight || 0;
        }
    }
};





function HScrollbar() {

    var res = _({
        tag: 'scrollbar',
    });

    var body = $('body');
    var left0, innerOffset0;
    var pointerMoveEventHandler = function (event) {
        event.preventDefault();
        var dy = event.clientX - left0;
        var newInnerOffset = innerOffset0 + dy * (res.innerWidth / res.outerWidth) * (res.outerWidth / res.getBoundingClientRect().width);
        if (newInnerOffset + res.outerWidth > res.innerWidth)
            newInnerOffset = res.innerWidth - res.outerWidth;
        if (newInnerOffset < 0) newInnerOffset = 0;
        res.innerOffset = newInnerOffset;
        //todo
        event.innerOffset = newInnerOffset;
        res.emit('scroll', event);
    };

    var finishEventHandler = function (event) {
        body.off('pointerleave', finishEventHandler);
        body.off('pointerup', finishEventHandler);
        body.off('pointermove', pointerMoveEventHandler);
    };

    var pointerDownEventHandler = function (event) {
        var boundRes = res.getBoundingClientRect();
        var boundButton = res.$button.getBoundingClientRect();
        left0 = event.clientX;
        if (event.target == res.$button) {
            innerOffset0 = res.innerOffset;
        }
        else {
            var newInnerOffset = map(left0 - boundButton.width / 2 - boundRes.left, 0, boundRes.width, 0, res.innerWidth);
            if (newInnerOffset + res.outerWidth > res.innerWidth)
                newInnerOffset = res.innerWidth - res.outerWidth;
            if (newInnerOffset < 0) newInnerOffset = 0;
            res.innerOffset = newInnerOffset;
            //todo
            event.innerOffset = newInnerOffset;
            innerOffset0 = newInnerOffset;
            res.emit('scroll', event);
        }

        body.on('pointerleave', finishEventHandler);
        body.on('pointerup', finishEventHandler);
        body.on('pointermove', pointerMoveEventHandler);

    };

    res.on('pointerdown', pointerDownEventHandler, true);


    return res;
}



HScrollbar.prototype.updateValue = function () {
    this.$button.addStyle('width', Math.min(this.outerWidth / this.innerWidth, 1) * 100 + '%');
    this.$button.addStyle('left', this.innerOffset / this.innerWidth * 100 + '%');
};


HScrollbar.property = {
    innerOffset: {
        set: function (value) {
            value = value || 0;
            if (this._innerOffset != value) {
                this._innerOffset = value;
                this.updateValue();
            }
        },
        get: function () {
            return this._innerOffset || 0;
        }
    },

    innerWidth: {
        set: function (value) {
            value = value || 1;
            value = Math.max(value, 1);
            if (this._innerWidth != value) {
                this._innerWidth = value;
                this.updateValue();
            }
        },
        get: function () {
            return this._innerWidth || 1;
        }
    },
    outerWidth: {
        set: function (value) {
            value = value || 0;
            value = Math.max(value, 0);
            if (this._outerWidth != value) {
                this._outerWidth = value;
                this.updateValue();
            }
        },
        get: function () {
            return this._outerWidth || 0;
        }
    }
};



Acore.creator.vscrollbar = VScrollbar;
Acore.creator.hscrollbar = HScrollbar;
Acore.creator.scrollbar = Scrollbar;
Acore.creator.vscroller = VScroller;
Acore.creator.hscroller = HScroller;
import '../css/scroller.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import OOP from "absol/src/HTML5/OOP";
import Element from "absol/src/HTML5/Element";
import { map } from 'absol/src/Math/int';
import Hanger from "./Hanger";

var _ = ACore._;
var $ = ACore.$;

ACore.$scrollStyle = (function () {
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

/***
 * @extends AElement
 * @constructor
 */
export function VScroller() {
    var thisVS = this;
    this.$attachHook = $('attachhook', this);
    this.sync = new Promise(function (rs) {
        thisVS.$attachHook.once('error', function () {
            rs();
        });
    });

    this.$attachHook.on('error', function () {
        thisVS.requestUpdateSize();
    });
    this.$vscrollbar = $('vscrollbar', this).on('scroll', this.eventHandler.scrollScrollbar);
    this.$viewport = $('.absol-vscroller-viewport', this)
        .on('scroll', this.eventHandler.scrollViewport);
    OOP.extends(thisVS.$viewport, {
        removeChild: function () {
            this.super.apply(this, arguments);
            thisVS.requestUpdateSize();
            return thisVS;
        }
    })
}

VScroller.tag = 'vscroller';
VScroller.render = function () {
    return _({
        class: 'absol-vscroller',
        child: ['.absol-vscroller-viewport',
            {
                class: ['absol-scrollbar-container', 'vertical'],
                child: 'vscrollbar'
            },
            'attachhook'
        ]
    });
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

VScroller.prototype.scrollInto = function (element, padding, scrollTime, beforFrame, afterFrame) {
    padding = padding || 0;
    scrollTime = scrollTime || 0;
    var frameCount = Math.ceil(scrollTime / 15 + 1);
    var self = this;

    function onFrame() {
        beforFrame && beforFrame();
        var elementBound = element.getBoundingClientRect();
        var viewportBound = self.$viewport.getBoundingClientRect();
        var currentScrollTop = self.$viewport.scrollTop;
        var newScrollTop = currentScrollTop;
        if (elementBound.bottom + padding > viewportBound.bottom) {
            newScrollTop = currentScrollTop + ((elementBound.bottom + padding) - viewportBound.bottom) / (Math.log(frameCount) + 1);
        }
        if (elementBound.top - padding < viewportBound.top) {
            newScrollTop = currentScrollTop - (viewportBound.top - (elementBound.top - padding)) / (Math.log(frameCount) + 1);
        }

        if (newScrollTop != currentScrollTop) {
            self.$viewport.scrollTop = newScrollTop;
        }
        afterFrame && afterFrame();
        frameCount--;
        if (frameCount > 0) setTimeout(onFrame, 15)
    }

    if (Element.prototype.isDescendantOf.call(element, this.$viewport)) {
        onFrame();
    }
};


VScroller.prototype.scrollBy = function (dy, duration) {
    duration = duration || 0;
    var frameCount = Math.ceil(duration / 20);
    var timeOut = duration / frameCount;
    var i = 0;
    var self = this;
    var start = self.$viewport.scrollTop;
    var end = start + dy;

    function onFrame() {
        self.$viewport.scrollTop = Math.max(map(i, 0, frameCount, start, end), 0);
        ++i;
        if (i <= frameCount)
            setTimeout(onFrame, timeOut);
    }

    onFrame();
};


VScroller.eventHandler = {};

VScroller.eventHandler.scrollViewport = function (event) {
    this.$vscrollbar.outerHeight = this.$viewport.clientHeight;
    this.$vscrollbar.innerHeight = this.$viewport.scrollHeight;
    this.$vscrollbar.innerOffset = this.$viewport.scrollTop;
};

VScroller.eventHandler.scrollScrollbar = function (event) {
    this.$viewport.scrollTop = this.$vscrollbar.innerOffset;
};

/***
 * @extends AElement
 * @constructor
 */
export function HScroller() {
    var thisHS = this;
    this.$attachHook = $('attachhook', this)
        .on('error', function () {
            this.requestUpdateSize = this.requestUpdateSize || thisHS.requestUpdateSize.bind(thisHS);
            Dom.addToResizeSystem(this);
        });

    this.sync = new Promise(function (rs, rj) {
        thisHS.$attachHook.once('error', rs);
    });
    this.$hscrollbar = $('hscrollbar', this).on('scroll', this.eventHandler.scrollScrollbar);
    this.$viewport = $('.absol-hscroller-viewport', this)
        .on('scroll', this.eventHandler.scrollViewport);
    OOP.extends(this.$viewport, {
        removeChild: function () {
            this.super.apply(this, arguments);
            thisHS.requestUpdateSize();
            return thisHS;
        }
    });
}


HScroller.tag = 'hscroller';

HScroller.render = function () {
    return _({
        class: 'absol-hscroller',
        child: ['.absol-hscroller-viewport',
            {
                class: ['absol-scrollbar-container', 'horizontal'],
                child: 'hscrollbar'
            },
            'attachhook'
        ]
    });
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
        this.$hscrollbar.innerWidth = this.$viewport.scrollWidth;
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

HScroller.prototype.scrollInto = function (element) {
    if (Element.prototype.isDescendantOf.call(element, this.$viewport)) {
        var elementBound = element.getBoundingClientRect();
        var viewportBound = this.$viewport.getBoundingClientRect();
        var currentScrollLeft = this.$viewport.scrollLeft;
        var newScrollLeft = currentScrollLeft;
        if (elementBound.right > viewportBound.right) {
            newScrollLeft = currentScrollLeft + (elementBound.right - viewportBound.right);
        }
        if (elementBound.left < viewportBound.left) {
            newScrollLeft = currentScrollLeft - (viewportBound.left - elementBound.left);
        }

        if (newScrollLeft != currentScrollLeft) {
            this.$viewport.scrollLeft = newScrollLeft;
        }
    }
}


/***
 * @extends AElement
 * @constructor
 */
export function Scrollbar() {
    var thisSB = this;
    this.$button = $('.absol-scrollbar-button', this);
    this.on('inactive', function (event, sender) {
        this.emit('deactive', event, sender);
    });
}

Scrollbar.tag = 'scrollbar';

Scrollbar.render = function () {
    return _({
        tag: Hanger.tag,
        class: ['absol-scrollbar'],
        extendEvent: ['scroll', 'active', 'inactive', 'deactive'],
        child: '.absol-scrollbar-button'
    });
};

Scrollbar.property = {};
Scrollbar.property.hidden = {
    set: function (value) {
        value = !!value;
        if (value !== this._hidden) {
            this._hidden = value;
            if (value)
                this.addClass('absol-hidden');
            else
                this.removeClass('absol-hidden');
        }
    },
    get: function () {
        return this.hasClass('absol-hidden')
    }
};

/***
 * @extends Scrollbar
 * @constructor
 */
export function VScrollbar() {
    this.on('draginit', this.eventHandler.dragInit, true)
        .on('drag', this.eventHandler.drag, true)
        .on('dragend', this.eventHandler.dragEnd, true);
    /***
     * @type {number}
     * @name outerHeight
     * @memberOf VScrollbar#
     */

    /***
     * @type {number}
     * @name innerHeight
     * @memberOf VScrollbar#
     */
    /***
     * @type {number}
     * @name innerHeight
     * @memberOf VScrollbar#
     */
}

VScrollbar.tag = 'vscrollbar';
VScrollbar.render = function () {
    return _({
        tag: 'scrollbar',
        class: 'absol-vscrollbar'
    }, true);
};


VScrollbar.prototype.updateValue = function () {
    this.$button.addStyle('height', Math.min(this.outerHeight / this.innerHeight, 1) * 100 + '%');
    this.$button.addStyle('top', this.innerOffset / this.innerHeight * 100 + '%');
};

VScrollbar.prototype.updateStatus = function () {
    if (this.innerHeight > this.outerHeight) {
        this.addClass('as-overflow');
    }
    else {
        this.removeClass('as-overflow');
    }
};


VScrollbar.eventHandler = {};

VScrollbar.eventHandler.dragInit = function (event) {
    event.preventDefault();
    var boundRes = this.getBoundingClientRect();
    var boundButton = this.$button.getBoundingClientRect();
    if (event.target === this.$button) {
        this.innerOffset0 = this.innerOffset;
    }
    else {
        var newInnerOffset = map(event.startingPoint.y - boundButton.height / 2 - boundRes.top, 0, boundRes.height, 0, this.innerHeight);
        if (newInnerOffset + this.outerHeight > this.innerHeight)
            newInnerOffset = this.innerHeight - this.outerHeight;
        if (newInnerOffset < 0) newInnerOffset = 0;
        this.innerOffset = newInnerOffset;
        //todo
        event.innerOffset = newInnerOffset;
        this.innerOffset0 = newInnerOffset;
        this.emit('scroll', event);
    }
    this.addClass('absol-active');
    this.emit('active', {
        type: 'active',
        originEvent: event,
        target: this,
        originalEvent: event.originalEvent || event
    });
};

VScrollbar.eventHandler.drag = function (event) {
    event.preventDefault();
    var dy = event.currentPoint.sub(event.startingPoint).y;
    var newInnerOffset = this.innerOffset0 + dy * (this.innerHeight / this.outerHeight) * (this.outerHeight / this.getBoundingClientRect().height);
    if (newInnerOffset + this.outerHeight > this.innerHeight)
        newInnerOffset = this.innerHeight - this.outerHeight;
    if (newInnerOffset < 0) newInnerOffset = 0;
    this.innerOffset = newInnerOffset;
    event.innerOffset = newInnerOffset;
    this.emit('scroll', event);
};

VScrollbar.eventHandler.dragEnd = function (event) {
    this.removeClass('absol-active');
    this.emit('inactive', {
        type: 'inactive',
        originEvent: event, target: this,
        originalEvent: event.originalEvent || event
    });
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
            if (this._innerHeight !== value) {
                this._innerHeight = value;
                this.updateValue();
            }
            this.updateStatus();
        },
        get: function () {
            return this._innerHeight || 1;
        }
    },
    outerHeight: {
        set: function (value) {
            value = value || 0;
            value = Math.max(value, 0);
            if (this._outerHeight !== value) {
                this._outerHeight = value;
                this.updateValue();
            }
            this.updateStatus();
        },
        get: function () {
            return this._outerHeight || 0;
        }
    }
};


/***
 * @extends Scrollbar
 * @constructor
 */
export function HScrollbar() {


    this.on('draginit', this.eventHandler.dragInit, true)
        .on('drag', this.eventHandler.drag, true)
        .on('dragend', this.eventHandler.dragEnd, true);

    /***
     * @type {number}
     * @name innerOffset
     * @memberOf HScrollbar#
     */
    /***
     * @type {number}
     * @name innerWidth
     * @memberOf HScrollbar#
     */
    /***
     * @type {number}
     * @name outerWidth
     * @memberOf HScrollbar#
     */
}

HScrollbar.tag = 'hscrollbar';

HScrollbar.render = function () {
    return _({
        tag: 'scrollbar',
        class: 'absol-hscrollbar'
    }, true);
}

HScrollbar.prototype.updateValue = function () {
    this.$button.addStyle('width', Math.min(this.outerWidth / this.innerWidth, 1) * 100 + '%');
    this.$button.addStyle('left', this.innerOffset / this.innerWidth * 100 + '%');
};


HScrollbar.prototype.updateStatus = function () {
    if (this.innerWidth > this.outerWidth) {
        this.addClass('as-overflow');
    }
    else {
        this.removeClass('as-overflow');
    }
};


/**
 *
 * @type {{[key: string]:function}}
 */
HScrollbar.eventHandler = {};


/**
 * @this HScrollbar
 * @param event
 */
HScrollbar.eventHandler.dragInit = function (event) {
    event.preventDefault();
    var boundRes = this.getBoundingClientRect();
    var boundButton = this.$button.getBoundingClientRect();

    if (event.target === this.$button) {
        this.innerOffset0 = this.innerOffset;
    }
    else {
        var newInnerOffset = map(event.startingPoint.x - boundButton.width / 2 - boundRes.left, 0, boundRes.width, 0, this.innerWidth);
        if (newInnerOffset + this.outerWidth > this.innerWidth)
            newInnerOffset = this.innerWidth - this.outerWidth;
        if (newInnerOffset < 0) newInnerOffset = 0;
        this.innerOffset = newInnerOffset;
        //todo
        event.innerOffset = newInnerOffset;
        this.innerOffset0 = newInnerOffset;
        this.emit('scroll', event);
    }
    var body = $(document.body);

    this.addClass('absol-active');
    this.emit('active', { type: 'inactive', originEvent: event, target: this });
};


/**
 * @this HScrollbar
 * @param event
 */
HScrollbar.eventHandler.drag = function (event) {
    event.preventDefault();
    var dy = event.currentPoint.x - event.startingPoint.x;
    var newInnerOffset = this.innerOffset0 + dy * (this.innerWidth / this.outerWidth) * (this.outerWidth / this.getBoundingClientRect().width);
    if (newInnerOffset + this.outerWidth > this.innerWidth)
        newInnerOffset = this.innerWidth - this.outerWidth;
    if (newInnerOffset < 0) newInnerOffset = 0;
    this.innerOffset = newInnerOffset;
    //todo
    event.innerOffset = newInnerOffset;
    this.emit('scroll', event);
};


/**
 * @this HScrollbar
 * @param event
 */
HScrollbar.eventHandler.dragEnd = function (event) {
    this.removeClass('absol-active');
    this.emit('inactive', { type: 'inactive', originEvent: event, target: this });
};


HScrollbar.property = {
    innerOffset: {
        set: function (value) {
            value = value || 0;
            if (this._innerOffset !== value) {
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
            if (this._innerWidth !== value) {
                this._innerWidth = value;
                this.updateValue();
            }
            this.updateStatus();
        },
        get: function () {
            return this._innerWidth || 1;
        }
    },
    outerWidth: {
        set: function (value) {
            value = value || 0;
            value = Math.max(value, 0);
            if (this._outerWidth !== value) {
                this._outerWidth = value;
                this.updateValue();
            }
            this.updateStatus();
        },
        get: function () {
            return this._outerWidth || 0;
        }
    }
};

ACore.install([VScrollbar, HScrollbar, Scrollbar, VScroller, HScroller]);
import Acore from "../ACore";
import Dom from "../../HTML5/Dom";
import OOP from "../../HTML5/OOP";

var _ = Acore._;
var $ = Acore.$;

(function () {
    var element = _('style#vscroller-style');
    element.innerHTML = '.absol-vscroller-viewport{ margin-right: ' + (-17) + 'px; }\n';
    document.head.appendChild(element);

    Dom.getScrollSize().then(function (size) {
        element.innerHTML = '.absol-vscroller-viewport{ margin-right: ' + (-size.width) + 'px; }\n';
    });
}
)();

function VScroller() {
    var res = _({
        class: 'absol-scroller',
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
        // var maxHeight = this.getComputedStyleValue('max-height');
        // if (maxHeight && maxHeight.length > 0 && maxHeight != 'none') this.$viewport.addStyle('max-height', 'inherit');
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

VScroller.eventHandler = {};

VScroller.eventHandler.scrollViewport = function (event) {
    this.$vscrollbar.outerHeight = this.$viewport.clientHeight;
    this.$vscrollbar.innerHeight = this.$viewport.scrollHeight;
    this.$vscrollbar.innerOffset = this.$viewport.scrollTop;
};

VScroller.eventHandler.scrollScrollbar = function (event) {
    this.$viewport.scrollTop = this.$vscrollbar.innerOffset;
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
            var newInnerOffset = Math.map(top0 - boundButton.height / 2 - boundRes.top, 0, boundRes.height, 0, res.innerHeight);
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

Acore.creator.vscrollbar = VScrollbar;
Acore.creator.scrollbar = Scrollbar;
Acore.creator.vscroller = VScroller;
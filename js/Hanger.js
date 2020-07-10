import ACore from "../ACore";
import Vec2 from "absol/src/Math/Vec2";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import {findChangedTouchByIdent} from "absol/src/HTML5/EventEmitter";

var _ = ACore._;
var $ = ACore.$;

function Hanger() {
    this.addClass('as-hanger');
    this.defineEvent(['predrag', 'dragstart', 'drag', 'dragend']);
    this._hangOn = 0;
    this._hangerPointerData = null;
    this.on2({
        mousedown: this.eventHandler.hangerPointerDown,
        touchstart: this.eventHandler.hangerPointerDown,
    });

    this._touchEvents = {
        touchend: this.eventHandler.hangerPointerFinish,
        touchcancel: this.eventHandler.hangerPointerFinish,
        touchmove: this.eventHandler.hangerPointerMove
    }
    this._mouseEvents = {
        mouseup: this.eventHandler.hangerPointerFinish,
        mouseleave: this.eventHandler.hangerPointerFinish,
        mousemove: this.eventHandler.hangerPointerMove
    };
}


Hanger.render = function () {
    return _('div');
};

Hanger.prototype.on2 = function () {
    if (arguments.length == 1) {
        for (var name in arguments[0]) {
            Hanger.prototype.on2.call(this, name, arguments[0][name]);
        }
    }
    else if (arguments.length == 2) {
        this.addEventListener(arguments[0], arguments[1], BrowserDetector.supportPassiveEvent ? { passive: false } : true);
    }
};


Hanger.prototype.off2 = function () {
    if (arguments.length == 1) {
        for (var name in arguments[0]) {
            Hanger.prototype.off2.call(this, name, arguments[0][name]);
        }
    }
    else if (arguments.length == 2) {
        this.removeEventListener(arguments[0], arguments[1], BrowserDetector.supportPassiveEvent ? { passive: false } : true);
    }
};


Hanger.property = {};

/**
 * @type {Hanger}
 */
Hanger.property.hangOn = {
    set: function (value) {
        if (!(value > 0)) value = 0;
        this._hangOn = value;
    },
    get: function () {
        return this._hangOn;
    }
};

/**
 * @type {Hanger}
 */
Hanger.eventHandler = {};

Hanger.eventHandler.hangerPointerDown = function (event) {
    if (this._hangerPointerData) return;
    var bound = this.getBoundingClientRect();
    var startingPoint;
    var isTouch = event.type === 'touchstart';
    var pointerIdent = -1;
    var target;
    if (isTouch) {
        var touch = event.changedTouches[0];
        target = touch.target;
        pointerIdent = touch.identifier;
        startingPoint = new Vec2(touch.clientX, touch.clientY);
    }
    else {
        startingPoint = new Vec2(event.clientX, event.clientY);
        target = event.target;
    }
    var offsetVec = startingPoint.sub(new Vec2(bound.left, bound.top));

    this._hangerPointerData = {
        state: 0,
        isTouch: isTouch,
        bound: bound,
        startingPoint: startingPoint,
        offsetVec: offsetVec,
        pointerIdent: pointerIdent,
        target: target
    };
    var preDragEvent = {
        type: 'predrag',
        originEvent: event,
        isTouch: isTouch,
        bound: bound,
        startingPoint: startingPoint,
        currentPoint: startingPoint,
        offsetVec: offsetVec,
        pointerIdent: pointerIdent,
        canceled: false,
        cancel: function () {
            this.cancel = true;
        },
        clientX: startingPoint.x,
        clientY: startingPoint.y,
        target: target,
        preventDefault: function () {
            event.preventDefault();
        }
    };
    if (preDragEvent.canceled) return;
    if (isTouch)
        this.on2.call(document.body, this._touchEvents)
    else
        this.on2.call(document.body, this._mouseEvents);
    this.emit('predrag', preDragEvent, this);
};

Hanger.eventHandler.hangerPointerMove = function (event) {
    var pointerData = this._hangerPointerData;
    var isTouch = pointerData.isTouch;
    var pointerIdent = -2;
    var currentPoint;
    if (isTouch) {
        var touch = findChangedTouchByIdent(event, pointerData.pointerIdent);
        if (touch) {
            pointerIdent = touch.identifier;
            currentPoint = new Vec2(touch.clientX, touch.clientY);
        }
    }
    else {
        currentPoint = new Vec2(event.clientX, event.clientY);
        pointerIdent = -1;
    }
    if (pointerIdent != pointerData.pointerIdent) return;
    pointerData.currentPoint = currentPoint;
    if (pointerData.state == 0) {
        var distance = currentPoint.sub(pointerData.startingPoint).abs();
        if (distance >= this._hangOn) {
            var dragStartEvent = {
                type: 'dragstart',
                originEvent: event,
                isTouch: isTouch,
                bound: pointerData.bound,
                startingPoint: pointerData.startingPoint,
                offsetVec: pointerData.offsetVec,
                pointerIdent: pointerIdent,
                currentPoint: currentPoint,
                target: pointerData.target,
                clientX: currentPoint.x,
                clientY: currentPoint.y,
                preventDefault: function () {
                    event.preventDefault();
                }
            };
            pointerData.state = 1;
            this.emit('dragstart', dragStartEvent, this);
        }
    }

    if (pointerData.state === 1) {
        var dragEvent = {
            type: 'drag',
            originEvent: event,
            isTouch: isTouch,
            bound: pointerData.bound,
            startingPoint: pointerData.startingPoint,
            offsetVec: pointerData.offsetVec,
            pointerIdent: pointerIdent,
            currentPoint: currentPoint,
            target: pointerData.target,
            clientX: currentPoint.x,
            clientY: currentPoint.y,
            preventDefault: function () {
                event.preventDefault();
            }
        };
        this.emit('drag', dragEvent, this);
    }
};

Hanger.eventHandler.hangerPointerFinish = function (event) {
    var pointerData = this._hangerPointerData;
    var isTouch = event.type === 'touchend';
    if (pointerData.isTouch !== isTouch) return;
    var pointerIdent = -2;
    var currentPoint;
    if (isTouch) {
        var touch = findChangedTouchByIdent(event, pointerData.pointerIdent);
        if (touch) {
            pointerIdent = touch.identifier;
            currentPoint = new Vec2(touch.clientX, touch.clientY);
        }
    }
    else {
        currentPoint = new Vec2(event.clientX, event.clientY);
        pointerIdent = -1;
    }
    if (pointerIdent !== pointerData.pointerIdent) return;
    if (pointerData.state === 1) {
        var dragEndEvent = {
            type: 'dragend',
            originEvent: event,
            isTouch: isTouch,
            bound: pointerData.bound,
            startingPoint: pointerData.startingPoint,
            offsetVec: pointerData.offsetVec,
            pointerIdent: pointerIdent,
            currentPoint: currentPoint,
            target: pointerData.target,
            clientX: currentPoint.x,
            clientY: currentPoint.y,
            preventDefault: function () {
                event.preventDefault();
            }
        };
        this.emit('dragend', dragEndEvent, this);
    }

    this._hangerPointerData = null;
    if (isTouch)
        this.off2.call(document.body, this._touchEvents)
    else
        this.off2.call(document.body, this._mouseEvents);
};

ACore.install('hanger', Hanger);

export default Hanger;

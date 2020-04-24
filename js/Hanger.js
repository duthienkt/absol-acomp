import ACore from "../ACore";
import Vec2 from "absol/src/Math/Vec2";

var _ = ACore._;
var $ = ACore.$;

function Hanger() {
    this.addClass('as-hanger');
    this.defineEvent(['predrag', 'dragstart', 'drag', 'dragend']);
    this._hangOn = 0;
    this._hangerPointerData = null;
    this.on({
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
    var isTouch = event.type == 'touchstart';
    var pointerIdent = -1;
    if (isTouch) {
        var touch = event.changedTouches[0];
        pointerIdent = touch.identifier;
        startingPoint = new Vec2(touch.clientX, touch.clientY);
    }
    else {
        startingPoint = new Vec2(event.clientX, event.clientY);
    }
    var offsetVec = startingPoint.sub(new Vec2(bound.left, bound.top));

    this._hangerPointerData = {
        state: 0,
        isTouch: isTouch,
        bound: bound,
        startingPoint: startingPoint,
        offsetVec: offsetVec,
        pointerIdent: pointerIdent
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
        }
    };
    if (preDragEvent.canceled) return;
    $(document.body);
    if (isTouch)
        document.body.on(this._touchEvents)
    else
        document.body.on(this._mouseEvents);
    this.emit('predrag', preDragEvent, this);
};

Hanger.eventHandler.hangerPointerMove = function (event) {
    var pointerData = this._hangerPointerData;
    var isTouch = pointerData.isTouch;
    var pointerIdent = -1;
    var currentPoint;
    if (isTouch) {
        var touch = event.changedTouches[0];
        pointerIdent = touch.identifier;
        currentPoint = new Vec2(touch.clientX, touch.clientY);
    }
    else {
        currentPoint = new Vec2(event.clientX, event.clientY);
    }
    if (pointerIdent != pointerData.pointerIdent) return;
    event.preventDefault();
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
                currentPoint: currentPoint
            };
            pointerData.state = 1;
            this.emit('dragstart', dragStartEvent, this);
        }
    }

    if (pointerData.state == 1) {
        var dragEvent = {
            type: 'drag',
            originEvent: event,
            isTouch: isTouch,
            bound: pointerData.bound,
            startingPoint: pointerData.startingPoint,
            offsetVec: pointerData.offsetVec,
            pointerIdent: pointerIdent,
            currentPoint: currentPoint
        };
        this.emit('drag', dragEvent, this);
    }
};

Hanger.eventHandler.hangerPointerFinish = function () {
    var pointerData = this._hangerPointerData;
    var isTouch = pointerData.isTouch;
    var pointerIdent = -1;
    var currentPoint;
    if (isTouch) {
        var touch = event.changedTouches[0];
        pointerIdent = touch.identifier;
        currentPoint = new Vec2(touch.clientX, touch.clientY);
    }
    else {
        currentPoint = new Vec2(event.clientX, event.clientY);
    }
    if (pointerIdent != pointerData.pointerIdent) return;

    if (pointerData.state == 1){
        var dragEndEvent = {
            type: 'dragend',
            originEvent: event,
            isTouch: isTouch,
            bound: pointerData.bound,
            startingPoint: pointerData.startingPoint,
            offsetVec: pointerData.offsetVec,
            pointerIdent: pointerIdent,
            currentPoint: currentPoint
        };
        this.emit('dragend', dragEndEvent, this);
    }

    this._hangerPointerData = null;
    if (isTouch)
        document.body.off(this._touchEvents)
    else
        document.body.off(this._mouseEvents);
};

ACore.install('hanger', Hanger);

export default Hanger;

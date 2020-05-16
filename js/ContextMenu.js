import ACore from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";
import Vec2 from 'absol/src/Math/Vec2';

var _ = ACore._;
var $ = ACore.$;

export function ContextCaptor() {
    this.attachedElt = null;
    this.$textarea = $('textarea', this)
        .on('contextmenu', this.eventHandler.contextmenu, true);
    this._ss = 0;
    this._isTouch = false;
    /**
    this._target = null;
     * @type {Vec2}
     */
    this._posStart = null;
    /**
     * @type {Vec2}
     */
    this._posCurrent = null;
    this._touchId = -100;
    this._longPressTimeout = -1;
    this._removeTimeout = -1;

    this.$target = null;

    this.mousedownEvent = null;
    this.sync = Promise.resolve();
};

ContextCaptor.prototype.attachTo = function (elt) {
    if (this.attachedElt) {
        this.attachedElt.removeEventListener('mousedown', this.eventHandler.mousedown);
        this.attachedElt.removeEventListener('touchstart', this.eventHandler.mousedown);
        this.attachedElt = null;
    }
    this.attachedElt = elt;
    if (this.attachedElt) {
        this.attachedElt.addEventListener('mousedown', this.eventHandler.mousedown);
        this.attachedElt.addEventListener('touchstart', this.eventHandler.mousedown);
    }
    return this;
};


ContextCaptor.render = function () {
    return _({
        class: 'absol-context-menu-anchor',
        extendEvent: 'requestcontextmenu',
        child: [
            'textarea'
        ]
    });
}

ContextCaptor.prototype.showContextMenu = function (x, y, props, onSelectItems, onCancel) {
    var self = this;
    var anchor = _('.absol-context-menu-anchor').addTo(document.body);
    var finish = function (event) {
        (document.body).off('click', finish)
            .off('touchcancel', finish)
            .off('touchend', finish);

        self.off('requestcontextmenu', finish);
        setTimeout(function () {
            anchor.selfRemove();
        }, 10);
    };
    var vmenu = _({
        tag: 'vmenu',
        props: props,
        on: {
            press: onSelectItems || function () { }
        }
    }).addTo(anchor);
    setTimeout(function () {
        var screenSize = Dom.getScreenSize();
        var menuBound = vmenu.getBoundingClientRect();
        if (x + menuBound.width > screenSize.width - 17) {
            x -= menuBound.width;
        }
        if (y + menuBound.height > screenSize.height - 17) {
            y -= menuBound.height;
        }

        anchor.addStyle({
            left: x + 'px',
            top: y + 'px'
        });
        anchor.addClass('absol-active');
    }, 30);
    setTimeout(function () {
        (document.body).on('click', finish);
        self.on('requestcontextmenu', finish);
    }, 10)
};

ContextCaptor.prototype._checkNeedHandle = function (target) {
    var current = target;
    var needHandle = false;
    while (current && !needHandle && !current.classList.contains('as-system-context-menu')) {
        if (current.isSupportedEvent && current.isSupportedEvent('contextmenu'))
            needHandle = true;
        current = current.parentElement;
    }
    return needHandle;
};

/**
 * @type {ContextCaptor}
 */
ContextCaptor.eventHandler = {};

ContextCaptor.eventHandler.mousedown = function (event) {
    if (this._touchId != -100) return;

    var target;
    var isTouch;
    var touchId;
    var posCurrent;
    var pointer;
    if (event.type == 'touchstart') {
        isTouch = true;
        pointer = event.changedTouches[0];
        touchId = pointer.identifier;
    }
    else {
        isTouch = false;
        touchId = -1;
        pointer = event;
    }
    target = pointer.target;

    posCurrent = new Vec2(pointer.clientX, pointer.clientY);

    if (isTouch) {
        var thisCT = this;
        this._longPressTimeout = setTimeout(function () {
            if (!thisCT._checkNeedHandle(target)) return;
            if (thisCT._removeTimeout > 0) {
                clearTimeout(thisCT._removeTimeout);
                thisCT._removeTimeout = -1;
            }


            thisCT._ss++;
            thisCT.moveTo(thisCT._posCurrent);
            thisCT.active(true);
            thisCT._longPressTimeout = -1;
        }, 400);
        this.$target = target;
        this._isTouch = isTouch;
        this._touchId = touchId;
        this._posCurrent = posCurrent;
        this._posStart = posCurrent;
        $(document.body).on('touchmove', thisCT.eventHandler.mousemove)
            .on('touchend', thisCT.eventHandler.mousefinish)
            .on('touchcancel', thisCT.eventHandler.mousefinish);

    }
    else {
        if (EventEmitter.isMouseRight(event) && this._checkNeedHandle(target)) {
            if (this._removeTimeout > 0) {
                clearTimeout(this._removeTimeout);
                this._removeTimeout = -1;
            }
            this.$target = target;
            this._isTouch = isTouch;
            this._posCurrent = posCurrent;
            this._posStart = posCurrent;
            this._touchId = touchId;
            this._ss++;
            this.moveTo(this._posCurrent);
            this.active(true);

            $(document.body).on('mousemove', this.eventHandler.mousemove)
                .on('mouseup', this.eventHandler.mousefinish)
                .on('mouseleave', this.eventHandler.mousefinish);
        }
    }
};

/**
 * @param {Vec2} pos
 */
ContextCaptor.prototype.moveTo = function (pos) {
    this.addStyle({
        left: pos.x - 20 + 'px',
        top: pos.y - 20 + 'px'
    });
};

ContextCaptor.prototype.active = function (flag) {
    if (flag)
        this.addClass('absol-active');
    else
        this.removeClass('absol-active');
};

ContextCaptor.eventHandler.mousemove = function () {
    var isTouch = this._isTouch;
    var isTouch;
    var touchId;
    var pointer;
    var posCurrent;
    if (isTouch) {
        isTouch = true;
        pointer = event.changedTouches[0];
        touchId = pointer.identifier;
    }
    else {
        isTouch = false;
        touchId = -1;
        pointer = event;
    }

    if (touchId != this._touchId) return;
    posCurrent = new Vec2(pointer.clientX, pointer.clientY);
    this._posCurrent = posCurrent;
    if (isTouch) {
        if (this._posStart.sub(posCurrent).abs() > 10) this.eventHandler.mousefinish(event);
    }
    this.moveTo(posCurrent);
};


ContextCaptor.eventHandler.mousefinish = function () {

    var isTouch = this._isTouch;
    var touchId;
    var pointer;

    if (isTouch) {
        pointer = event.changedTouches[0];
        touchId = pointer.identifier;
    }
    else {
        isTouch = false;
        touchId = -1;
        pointer = event;

    }
    if (touchId != this._touchId) return;
    if (isTouch) {
        $(document.body).off('touchmove', this.eventHandler.mousemove)
            .off('touchend', this.eventHandler.mousefinish)
            .off('touchcancel', this.eventHandler.mousefinish);
        if (this._longPressTimeout > 0) {
            clearTimeout(this._longPressTimeout);
            this._longPressTimeout = -1;
        }
    }
    else {
        $(document.body).off('mousemove', this.eventHandler.mousemove)
            .off('mouseup', this.eventHandler.mousefinish)
            .off('mouseleave', this.eventHandler.mousefinish);
    }

    this._touchId = -100;
    var thisCT = this;
    this._removeTimeout = setTimeout(function () {
        thisCT.active(false);
        thisCT._removeTimeout = -1;
    }, 1);
};

ContextCaptor.eventHandler.contextmenu = function (event) {
    this.emit('requestcontextmenu', event, this);
    var self = this;
    event.preventDefault();

    var propagation = true;
    var localEvent = {
        clientX: event.clientX,
        clientY: event.clientY,
        target: this.$target,
        showContextMenu: function (props, onSelectItems) {
            self.sync = self.sync.then(function () {
                return new Promise(function (rs) {
                    setTimeout(function () {
                        self.showContextMenu(event.clientX, event.clientY, props, onSelectItems);
                        rs();
                    }, 30)
                });
            })
        },
        stopPropagation: function () {
            propagation = false;
        }
    }

    var current = this.$target;
    while (current && propagation) {
        if (current.isSupportedEvent && current.isSupportedEvent('contextmenu')) {
            current.emit('contextmenu', localEvent, current, this);
        }
        current = current.parentElement;
    }
};


ContextCaptor.auto = function () {
    if (ContextCaptor.$elt) return;
    ContextCaptor.$elt = _('contextcaptor');
    Dom.documentReady.then(function () {
        ContextCaptor.$elt.addTo(document.body);
        ContextCaptor.$elt.attachTo(document.body);
    });
};

ACore.install('contextcaptor', ContextCaptor);

export default ContextCaptor;
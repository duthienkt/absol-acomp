import { hitElement } from "absol/src/HTML5/EventEmitter";

var STATE_INIT = 0;
var STATE_ATTACHED = 1;
var STATE_RELEASED = 2;
var STATE_FIRED = 3;
var STATE_DESTROYED = 4;

/***
 *
 * @param {AElement[]|AElement} eltList
 * @param {"click"|"mousedown"} eventType
 * @param {function} callback
 * @param {number=} initAfter
 * @param {number=} fireDelay
 * @param {*[]=} args
 * @constructor
 */
function BlurTrigger(eltList, eventType, callback, initAfter, fireDelay, args) {
    this.args = args || [];
    this.callback = callback;
    this.eltTargets = eltList || [];
    this.initAfter = initAfter || 0;
    this.fireDelay = fireDelay || 0;
    this.state = STATE_INIT;
    this.eventType = eventType;
    this['ev_mouse'] = this.ev_mouse.bind(this);
    this['ev_blur'] = this.ev_blur.bind(this);
    if (this.initAfter > 0) {
        setTimeout(this._attach.bind(this));
    }
    else this._attach();
}

BlurTrigger.prototype._attach = function () {
    if (this.state !== STATE_INIT) return;
    document.addEventListener(this.eventType, this.ev_mouse);
    window.addEventListener('blur', this.ev_blur);
    this.state = STATE_ATTACHED;
};

BlurTrigger.prototype._fire = function () {
    if (this.state !== STATE_RELEASED) return;
    this.callback.apply(this, this.args);
    this.state = STATE_FIRED;
};

BlurTrigger.prototype._release = function () {
    if (this.state !== STATE_ATTACHED) return;
    document.removeEventListener(this.eventType, this.ev_mouse);
    window.removeEventListener('blur', this.ev_blur);
    this.state = STATE_RELEASED;
};


BlurTrigger.prototype.destroy = function () {
    if (this.state === 4) return;
    if (this.state === STATE_ATTACHED) this._release();
    this.state = STATE_DESTROYED;
};

BlurTrigger.prototype._prepareFire = function () {
    if (this.fireDelay > 0) {
        setTimeout(this._fire.bind(this), this.fireDelay);
    }
    else {
        this._fire();
    }
}

BlurTrigger.prototype.ev_mouse = function (event) {
    var hit = false;
    if (this.eltTargets instanceof Array) {
        hit = this.eltTargets.some(function (elt) {
            return hitElement(elt, event);
        });
    }
    else if (typeof hit === "function") {
        hit = this.eltTargets.call(this, event.target);
    }
    if (!hit) {
        this._release();
        this._prepareFire();
    }
};

BlurTrigger.prototype.ev_blur = function () {
    var tagName = (document.activeElement && document.activeElement.tagName) || '';
    tagName = tagName.toLowerCase();
    if (tagName === 'iframe') {
        this._release();
        this._prepareFire();
    }
};

export default BlurTrigger;

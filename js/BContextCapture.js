import Dom from "absol/src/HTML5/Dom";
import ContextCaptor from "./ContextMenu";
import Vec2 from "absol/src/Math/Vec2";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import OOP from "absol/src/HTML5/OOP";

/***
 * simple way, to replace old ContextCapture version
 ***/

function BContextCapture() {
    EventEmitter.call(this);
    this.sync = Promise.resolve();
    this.$root = null;
    this._pointerSession = 0;
    this.ev_contextMenu = this.ev_contextMenu.bind(this);
}

OOP.mixClass(BContextCapture, EventEmitter);

BContextCapture.prototype.attachTo = function (elt) {
    if (this.$root) this.$root.removeEventListener('contextmenu', this.ev_contextMenu, false);
    this.$root = elt;
    if (this.$root) this.$root.addEventListener('contextmenu', this.ev_contextMenu, false);
}

BContextCapture.prototype.auto = function () {
    Dom.documentReady.then(function () {
        this.attachTo(document.body);
    }.bind(this));
};


BContextCapture.prototype.showContextMenu = ContextCaptor.prototype.showContextMenu;
BContextCapture.prototype._fireContextMenuEvent = ContextCaptor.prototype._fireContextMenuEvent;
BContextCapture.prototype._checkNeedHandle = ContextCaptor.prototype._checkNeedHandle;
/***
 *
 * @param {PointerEvent} event
 */
BContextCapture.prototype.ev_contextMenu = function (event) {
    this._pointerSession++;
    this._posCurrent = new Vec2(event.clientX, event.clientY);
    this.$target = event.target;
    if (this._checkNeedHandle(event.target)) {
        if (this._fireContextMenuEvent()) {
            event.preventDefault();
        }
    }
};

var instance = new BContextCapture();
ContextCaptor.auto = instance.auto.bind(instance);//override old version
export default instance;
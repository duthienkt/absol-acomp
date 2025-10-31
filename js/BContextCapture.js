import Dom from "absol/src/HTML5/Dom";
import ContextCaptor from "./ContextMenu";
import Vec2 from "absol/src/Math/Vec2";
import EventEmitter, { hitElement, isMouseRight } from "absol/src/HTML5/EventEmitter";
import { mixClass } from "absol/src/HTML5/OOP";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { getSelectionText } from "./utils";
import { $$, _ } from "../ACore";
import Context from "absol/src/AppPattern/Context";


/***
 * simple way, to replace old ContextCapture version
 * @augments EventEmitter
 * @augments Context
 * @constructor
 ***/
function BContextCapture() {
    EventEmitter.call(this);
    Context.call(this);
    this.sync = Promise.resolve();
    this.pointerSession = 0;
    this.ev_contextMenu = this.ev_contextMenu.bind(this);
    this.ev_clickOut = this.ev_clickOut.bind(this);
    this.$anchor = null;
    this.$vmenu = null;
    this.originalEvent = null;
    this.pendingMenu = null;
}

mixClass(BContextCapture, EventEmitter, Context);

/**
 * @deprecated
 * @param elt
 */
BContextCapture.prototype.attachTo = function (elt) {
};

BContextCapture.prototype.onStart = function () {
    document.addEventListener('contextmenu', this.ev_contextMenu, true);
};

BContextCapture.prototype.onPause = function () {
    document.removeEventListener('mousedown', this.ev_clickOut, true);
    this.$anchor.selfRemove();

};

BContextCapture.prototype.onResume = function () {
    var isMobile = BrowserDetector.isMobile;
    this.$anchor = _('.as-context-menu-ctn.absol-context-menu-anchor' + (isMobile ? '.as-anchor-modal' : '')).addTo(document.body);
    this.$vmenu = _({
        tag: 'vmenu',
        props: this.pendingMenu.props,
        on: {
            press: (event) => {
                var menuItem = event.menuItem;
                var items = menuItem.items;
                if (items && items.length) {

                }
                else {
                    if (this.pendingMenu.onSelectItem) {
                        this.pendingMenu.onSelectItem(event);
                        this.pause();
                    }
                }
            }
        }
    }).addTo(this.$anchor);


    setTimeout(() => {
        var x = this.currentPos.x;
        var y = this.currentPos.y;
        var anchor = this.$anchor;
        var menu = this.$vmenu;
        var screenSize;
        var menuBound;
        if (!isMobile) {
            screenSize = Dom.getScreenSize();
            menuBound = menu.getBoundingClientRect();
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
        }
        $$('VMenuItem'.toLowerCase(), menu).forEach(e => {
            if (e.autoFixParentSize) e.autoFixParentSize();
        });
        anchor.addClass('absol-active');
    }, 30);


    document.addEventListener('mousedown', this.ev_clickOut, true);
};


BContextCapture.prototype.auto = function () {
    this.start(true);//standby, wait for contextmenu event
};


BContextCapture.prototype.fireContextMenuEvent = function () {
    if (this.lastContextSession >= this.pointerSession) return false;// prevent fire multi-times in a pointer session
    this.lastContextSession = this.pointerSession;
    this.pendingMenu = null;

    var propagation = true;
    var localEvent = {
        clientX: this.currentPos.x, clientY: this.currentPos.y,
        target: this.$target,
        originalEvent: this.originalEvent,
        showContextMenu: (props, onSelectItem) => {

            this.pendingMenu = { props: props, onSelectItem: onSelectItem };
        },
        stopPropagation: function () {
            propagation = false;
        }
    };

    Object.defineProperty(localEvent, 'selectedText', {
        get: function () {
            return getSelectionText();
        }
    });

    var current = this.$target;
    while (current && propagation) {
        if (current.isSupportedEvent && current.isSupportedEvent('contextmenu')) {
            current.emit('contextmenu', localEvent, current, this);
        }
        current = current.parentElement;
    }
    return !!this.pendingMenu;
};

BContextCapture.prototype.checkNeedHandle = function (target) {
    var current = target;
    var needHandle = false;
    while (current && !needHandle && !current.classList.contains('as-system-context-menu')) {
        if (current.isSupportedEvent && current.isSupportedEvent('contextmenu'))
            needHandle = true;
        current = current.parentElement;
    }
    return needHandle;
};
/***
 *
 * @param {PointerEvent} event
 */
BContextCapture.prototype.ev_contextMenu = function (event) {
    this.pointerSession++;
    this.currentPos = new Vec2(event.clientX, event.clientY);
    this.$target = event.target;
    this.originalEvent = event;
    if (this.checkNeedHandle(event.target)) {
        if (this.fireContextMenuEvent()) {
            event.preventDefault();
            setTimeout(() => {
                this.resume();
            }, 50);
        }
    }
};

BContextCapture.prototype.ev_clickOut = function (event) {
    if (hitElement(this.$vmenu, event) && !isMouseRight(event)) return;
    this.pause();
};

var instance = new BContextCapture();
BrowserDetector.nativeContextMenuSupport = true;
ContextCaptor.auto = instance.auto.bind(instance);//override old version


export default instance;
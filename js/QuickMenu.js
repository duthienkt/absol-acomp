import ACore, { $$ } from "../ACore";
import Dom, { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import './Menu';
import { cleanMenuItemProperty } from "./utils";
import Follower from "./Follower";
import { copyEvent, hitElement } from "absol/src/HTML5/EventEmitter";
import safeThrow from "absol/src/Code/safeThrow";
import noop from "absol/src/Code/noop";

var isMobile = BrowserDetector.isMobile;
var _ = ACore._;
var $ = ACore.$;

function QuickMenu() {
    //like context menu without right-click
    this._contextMenuSync = Promise.resolve();
}

QuickMenu.tag = 'QuickMenu'.toLowerCase();

QuickMenu.render = function () {
    return _({
        tag: 'vmenu',
        extendEvent: 'requestcontextmenu',
        class: [
            'as-quick-menu', 'as-bscroller'
        ],
        style: {
            'overflow-y': 'auto',
            'box-sizing': 'border-box'
        }
    });
};


ACore.install(QuickMenu);

/**
 * @typedef {object|{triggerEvent:string, menuProps,getMenuProps, anchor,  onClick, onSelect,onOpen, onClose, menuCtn, getAnchor}} QuickMenuOptions
 */

/***
 *
 * @param {AElement} elt
 * @param  {QuickMenuOptions} opt
 * @constructor
 */
export function QuickMenuInstance(elt, opt) {
    this.id = (Math.random() * 10000 >> 0) + '' + new Date().getTime();
    /***
     *
     * @type {"OPEN"|"CLOSE"}
     */
    this.state = 'CLOSE';
    this._willAddClickOut = -1;
    this.elt = elt;
    /**
     *
     * @type {QuickMenuOptions}
     */
    this.opt = Object.assign({}, opt);
    for (var key in this) {
        if (key.startsWith('_on')) {
            this[key] = this[key].bind(this);
        }
    }
    this._init();
}

QuickMenuInstance.prototype._init = function () {
    this.elt.classList.add('as-quick-menu-trigger');
    if (this.opt.triggerEvent === 'mousedown')
        $(this.elt).on('contextmenu', function (event) {
            event.preventDefault();
        }).attr('oncontextmenu', "return false;");
    if (this.opt.triggerEvent && this.opt.triggerEvent !== 'none') {
        this.elt.addEventListener(this.opt.triggerEvent, this._onClick, true);
    }
    else
        this.elt.addEventListener('click', this._onClick, true);
    if (!this.elt.revokeResource) {
        this.elt.revokeResource = ()=>{
            this.elt.revokeResource = noop;
            this.remove();
        }
    }
};

QuickMenuInstance.prototype._deinit = function () {
    if (this.state === "OPEN") this.close();
    this.elt.classList.remove('as-quick-menu-trigger');
    if (this.opt.triggerEvent && this.opt.triggerEvent !== 'none') {
        this.elt.removeEventListener(this.opt.triggerEvent, this._onClick, true);
    }
    else {
        this.elt.removeEventListener('click', this._onClick, true);
    }
    this.elt = null;
    this.opt = null;
    for (var key in this) {
        if (key.startsWith('_on')) {
            this[key] = noop;
        }
    }
};

QuickMenuInstance.prototype.getMenuProps = function () {
    var props;
    if (this.opt.getMenuProps) {
        props = this.opt.getMenuProps();
    }
    else {
        props = this.opt.menuProps;
    }
    props = props || {};
    return Object.assign({ extendClasses: [], extendStyle: {} }, props);
};

QuickMenuInstance.prototype.remove = function () {
    this._deinit();
};

QuickMenuInstance.prototype._onClick = function (event) {
    if (this.opt.triggerEvent === 'mousedown') {
        event.preventDefault();
    }
    var event = copyEvent(event, {
        canceled: false,
        cancel: function () {
            this.canceled = true;
        }
    });
    if (this.opt.onClick) {
        this.opt.onClick.call(this, event);
    }
    if (!event.canceled)
        this.toggle();
};

QuickMenuInstance.prototype._onClickOut = function (event) {
    if (hitElement(this.elt, event) || hitElement(QuickMenu.$elt, event)) return;
    this.close();
};

QuickMenuInstance.prototype.onSelect = function (item) {
    item = item.__originalItem__ || item;
    if (item.items && item.items.length > 0) return;
    if (this.opt.onSelect) this.opt.onSelect(item);
    this.close();
}


QuickMenuInstance.prototype.open = function () {
    if (QuickMenu.runningInstance === this) return;
    if (this.state !== "CLOSE") return;
    if (QuickMenu.runningInstance) QuickMenu.runningInstance.close();
    QuickMenu.runningInstance = this;
    this.state = 'OPEN';
    this.elt.classList.add('as-quick-menu-attached');
    this._willAddClickOut = setTimeout(() => {
        this._willAddClickOut = -1;
        document.addEventListener('click', this._onClickOut, false);
        followerElt.updatePosition();
        menuElt.addStyle('visibility', 'visible');
    }, isMobile ? 33 : 2);

    var anchor = this.getAnchor();
    var followerElt = QuickMenu.$follower;
    var menuElt = QuickMenu.$elt;

    this.originProps = this.getMenuProps();
    this.copyProps = Object.assign({}, this.originProps);
    if (typeof  this.originProps.items === "function") {
        this.copyProps.items = this.originProps.items.call(this);
    }
    else {
        this.copyProps.items = this.originProps.items || [];
    }
    this.copyProps.items = this.copyProps.items.map(function visit(item) {
        var cpyItem = item;
        if (typeof item === "string") cpyItem = item;
        else if (item && (typeof item.text === "string")) {
            cpyItem = Object.assign({ __originalItem__: item }, item);
            if (cpyItem.items && cpyItem.items.map) cpyItem.items = cpyItem.items.map(visit);
        }
        return cpyItem;
    });

    Object.assign(menuElt, this.copyProps);
    followerElt.addClass('absol-active');


    if (anchor === 'modal') {
        followerElt.addClass('as-anchor-modal');
        followerElt.anchor = [];
    }
    else {
        followerElt.removeClass('as-anchor-modal');
        followerElt.anchor = anchor;

    }
    this._onSizeNeedUpdate();
    QuickMenu.$follower.on('preupdateposition', this._onSizeNeedUpdate);
    followerElt.followTarget = this.elt;
    followerElt.sponsorElement = this.elt;
    menuElt.addStyle('visibility', 'hidden');
    followerElt.addTo(this.opt.menuCtn || document.body);
    followerElt.addClass('absol-active');
    if (this.opt.onOpen) {
        try {
            this.opt.onOpen.call(this);
        } catch (err) {
            safeThrow(err);
        }
    }
};


QuickMenuInstance.prototype.close = function () {
    if (QuickMenu.runningInstance !== this) return;
    if (this.state !== "OPEN") return;
    if (this.opt.onClose) {
        try {
            this.opt.onClose.call(this);
        } catch (err) {
            safeThrow(err);
        }
    }
    this.state = 'CLOSE';
    this.elt.classList.remove('as-quick-menu-attached');
    QuickMenu.$elt.removeStyle('--available-height');
    var followerElt = QuickMenu.$follower;
    followerElt.addClass('absol-active');
    followerElt.remove();
    QuickMenu.$follower.off('preupdateposition', this._onSizeNeedUpdate);

    if (this._willAddClickOut >= 0) {
        clearTimeout(this._willAddClickOut);
    }
    else {
        document.removeEventListener('click', this._onClickOut, false);
    }
    QuickMenu.runningInstance = null;

};

QuickMenuInstance.prototype._onSizeNeedUpdate = function () {
    $$('VMenuItem'.toLowerCase(), QuickMenu.$elt).forEach(e => {
        if (e.autoFixParentSize) e.autoFixParentSize();
    });
    var screenSize = getScreenSize();
    var eltBound = this.elt.getBoundingClientRect();
    var outRect = traceOutBoundingClientRect(this.elt);
    var isOut = false;
    if (eltBound.left > outRect.right || eltBound.right < outRect.left || eltBound.top > outRect.bottom || eltBound.bottom < outRect.top) isOut = true;

    if (isOut || (!eltBound.width && !eltBound.height)) {
        setTimeout(() => {
            this.close();
        }, 0);
    }

    var aTop = eltBound.bottom;
    var aBottom = screenSize.height - eltBound.top;
    QuickMenu.$elt.addStyle('--available-height', (Math.max(aTop, aBottom) - 10) + 'px');
};


QuickMenuInstance.prototype.toggle = function () {
    if (this.state === "OPEN") {
        this.close();
    }
    else if (this.state === 'CLOSE') {
        this.open();
    }
};

QuickMenuInstance.prototype.getAnchor = function () {
    var menuAnchors;
    var anchor = this.opt.getAnchor ? this.opt.getAnchor() : this.opt.anchor;

    if (typeof anchor == 'number') {
        menuAnchors = [anchor];
    }
    else if (anchor instanceof Array) {
        menuAnchors = anchor;
    }
    else if (anchor === 'modal') {
        menuAnchors = 'modal';
    }
    else {
        menuAnchors = QuickMenu.PRIORITY_ANCHORS;
    }

    return menuAnchors;
};


QuickMenu.PRIORITY_ANCHORS = [0, 3, 7, 4, 1, 2, 6, 5];

QuickMenu.$elt = _('quickmenu');
/***
 *
 * @type {Follower}
 */
QuickMenu.$follower = _({
    tag: Follower.tag,
    class: 'absol-context-menu-anchor',
    child: QuickMenu.$elt,
    on: {
        preupdateposition: function () {
            var bound = this.getBoundingClientRect();
            var outBound = traceOutBoundingClientRect(this);
            if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
                QuickMenu.close(QuickMenu._session);
            }
        }
    }
});

QuickMenu.$follower.cancelWaiting();

/***
 *
 * @type {null|QuickMenuInstance}
 */
QuickMenu.runningInstance = null;

QuickMenu._session = Math.random() * 10000000000 >> 0;
QuickMenu._menuListener = undefined;

QuickMenu.$elt.on('press', function (event) {
    if (QuickMenu.runningInstance) QuickMenu.runningInstance.onSelect(cleanMenuItemProperty(event.menuItem));
    if (QuickMenu._menuListener) QuickMenu._menuListener(cleanMenuItemProperty(event.menuItem));
});


QuickMenu.show = function (element, menuProps, anchor, menuListener, darkTheme) {
    var instance = new QuickMenuInstance(element, {
        menuProps: menuProps,
        anchor: anchor,
        onSelect: menuListener,
        darkTheme: darkTheme
    });
    instance.open();
};


QuickMenu.close = function (session) {
    if (QuickMenu.runningInstance && QuickMenu.runningInstance.id === session) QuickMenu.runningInstance.close();
};


QuickMenu.showWhenClick = function (element, menuProps, anchor, menuListener, darkTheme) {
    return new QuickMenuInstance(element, {
        menuProps: menuProps,
        anchor: anchor,
        onSelect: menuListener,
        darkTheme: darkTheme
    });
};


/**
 * @typedef {Object} QuickMenuAdaptor
 * @property {Function} getFlowedElement default is trigger
 * @property {Function} getMenuProps define menuProps if un-change
 * @property {Function} getAnchor default is 'auto', define anchor if un-change
 * @property {Function} onClose callback
 * @property {Function} onOpen callback
 * @property {Function} onSelect calback
 * @property {Function} isDarkTheme default is false, define darkThem if un-change
 *
 *
 * @typedef {Object} QuickMenuDataHolder
 * @property {Function} remove
 *
 * @param {Element} trigger
 * @param {QuickMenuAdaptor} adaptor
 * @returns {QuickMenuDataHolder}
 */
QuickMenu.toggleWhenClick = function (trigger, adaptor) {
    return new QuickMenuInstance(trigger, adaptor);
};


export default QuickMenu;
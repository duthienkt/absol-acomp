import ACore from "../ACore";
import Dom, { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import './Menu';
import { cleanMenuItemProperty } from "./utils";
import Follower from "./Follower";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import safeThrow from "absol/src/Code/safeThrow";

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


/***
 *
 * @param {AElement} elt
 * @param opt
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
    this.opt = opt;
    for (var key in this) {
        if (key.startsWith('_on')) {
            this[key] = this[key].bind(this);
        }
    }
    this._init();
}

QuickMenuInstance.prototype._init = function () {
    this.elt.classList.add('as-quick-menu-trigger');
    this.elt.addEventListener('click', this._onClick, true);
};

QuickMenuInstance.prototype._deinit = function () {
    if (this.state === "OPEN") this.close();
    this.elt.classList.remove('as-quick-menu-trigger');
    this.elt.removeEventListener('click', this._onClick, true);
};

QuickMenuInstance.prototype.getMenuProps = function () {
    var props;
    if (this.opt.getMenuProps) {
        props = this.opt.getMenuProps();
    }
    else {
        props = this.opt.menuProps;
    }
    return props || {};
};

QuickMenuInstance.prototype.remove = function () {
    this._deinit();
};

QuickMenuInstance.prototype._onClick = function () {
    this.toggle();
};

QuickMenuInstance.prototype._onClickOut = function (event) {
    if (hitElement(this.elt, event)) return;
    this.close();
};

QuickMenuInstance.prototype.onSelect = function (item) {
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
    Object.assign(menuElt, this.getMenuProps());
    followerElt.addClass('absol-active');


    if (anchor === 'modal') {
        followerElt.addClass('as-anchor-modal');
        followerElt.anchor = [];
    }
    else {
        followerElt.removeClass('as-anchor-modal');
        followerElt.anchor = anchor;

    }
    followerElt.followTarget = this.elt;
    menuElt.addStyle('visibility', 'hidden');
    followerElt.addTo(document.body);
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
    var followerElt = QuickMenu.$follower;
    followerElt.addClass('absol-active');
    followerElt.remove();
    if (this._willAddClickOut >= 0) {
        clearTimeout(this._willAddClickOut);
    }
    else {
        document.removeEventListener('click', this._onClickOut, false);
    }
    QuickMenu.runningInstance = null;

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
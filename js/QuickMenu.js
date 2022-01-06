import ACore from "../ACore";
import Dom, { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import Rectangle from "absol/src/Math/Rectangle";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import './Menu';
import { cleanMenuItemProperty } from "./utils";
import Follower from "./Follower";

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


QuickMenu._session = Math.random() * 10000000000 >> 0;
QuickMenu._menuListener = undefined;

QuickMenu.$elt.on('press', function (event) {
    if (QuickMenu._menuListener) QuickMenu._menuListener(cleanMenuItemProperty(event.menuItem));
});


QuickMenu.show = function (element, menuProps, anchor, menuListener, darkTheme) {
    var menuElt = QuickMenu.$elt;
    var followerElt = QuickMenu.$follower;
    var menuAnchors = [];

    if (typeof anchor == 'number') {
        menuAnchors = [anchor];
    }
    else if (anchor instanceof Array) {
        menuAnchors = anchor;
    }
    else if (anchor === 'modal') {
        menuAnchors = [];
    }
    else {
        QuickMenu._acceptAnchors = QuickMenu.PRIORITY_ANCHORS;
    }

    if (anchor === 'modal') {
        followerElt.addClass('as-anchor-modal');
    }
    else {
        followerElt.removeClass('as-anchor-modal');
    }


    QuickMenu._session = Math.random() * 10000000000 >> 0;
    followerElt.addTo(document.body);
    Object.assign(menuElt, menuProps);
    followerElt.anchor = menuAnchors;
    followerElt.followTarget = element;
    QuickMenu.$element = element;
    QuickMenu.$element.classList.add('as-quick-menu-attached');
    QuickMenu._menuListener = menuListener;


    if (darkTheme) followerElt.addClass('dark');
    else followerElt.removeClass('dark');
    menuElt.addStyle('visibility', 'hidden');//for prevent size change blink
    followerElt.addClass('absol-active');

    setTimeout(function () {
        followerElt.updatePosition();
        menuElt.addStyle('visibility', 'visible');
    }, isMobile ? 33 : 2);


    return QuickMenu._session;
};

QuickMenu.close = function (session) {
    if (session !== true && session !== QuickMenu._session) return;
    QuickMenu._session = Math.random() * 10000000000 >> 0;
    if (QuickMenu.$element)
        QuickMenu.$element.classList.remove('as-quick-menu-attached');
    QuickMenu.$element = undefined;
    QuickMenu._menuListener = undefined;

    QuickMenu.$follower.removeClass('absol-active');
    QuickMenu.$follower.remove();
};


QuickMenu.showWhenClick = function (element, menuProps, anchor, menuListener, darkTheme) {
    var res = {
        menuProps: menuProps,
        anchor: anchor,
        currentSession: undefined,
        element: element,
        menuListener: menuListener,
        darkTheme: darkTheme
    };

    var clickHandler = function () {
        if (QuickMenu._session === res.currentSession) return;
        res.currentSession = QuickMenu.show(res.element, res.menuProps, res.anchor, res.menuListener, res.darkTheme);
        var finish = function () {
            document.removeEventListener('click', finish, false);
            QuickMenu.close(res.currentSession);
            res.currentSession = undefined;
        };

        setTimeout(function () {
            document.addEventListener('click', finish, false);
        }, 10)
    };

    res.remove = function () {
        element.removeEventListener('click', clickHandler, false);
        element.classList.remove('as-quick-menu-trigger');

    };

    element.addEventListener('click', clickHandler, false);
    element.classList.add('as-quick-menu-trigger');
    return res;
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
    var res = {
        trigger: trigger,
        adaptor: adaptor,
        currentSession: undefined,
    };

    var clickHandler = function () {
        if (QuickMenu._session === res.currentSession) return;

        res.currentSession = QuickMenu.show(res.adaptor.getFlowedElement ? res.adaptor.getFlowedElement() : trigger,
            res.adaptor.getMenuProps ? res.adaptor.getMenuProps() : (adaptor.menuProps || []),
            res.adaptor.getAnchor ? res.adaptor.getAnchor() : (adaptor.anchor || 'auto'),
            res.adaptor.onSelect,
            res.adaptor.isDarkTheme ? res.adaptor.isDarkTheme() : !!res.adaptor.darkTheme);
        if (res.adaptor.onOpen) res.adaptor.onOpen();

        var finish = function () {
            document.body.removeEventListener('click', finish, false);
            QuickMenu.close(res.currentSession);
            if (adaptor.onClose) adaptor.onClose();
            res.currentSession = undefined;
        };

        setTimeout(function () {
            document.body.addEventListener('click', finish, false);
        }, 10);
    };

    res.remove = function () {
        trigger.removeEventListener('click', clickHandler, false);
        trigger.classList.remove('as-quick-menu-trigger');
    };

    trigger.addEventListener('click', clickHandler, false);
    trigger.classList.add('as-quick-menu-trigger');

    return res;

};


export default QuickMenu;
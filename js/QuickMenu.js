import ACore from "../ACore";
import Dom, {getScreenSize, traceOutBoundingClientRect} from "absol/src/HTML5/Dom";
import Rectangle from "absol/src/Math/Rectangle";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import './Menu';


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
QuickMenu.DEFAULT_ANCHOR = 0;

QuickMenu.$elt = _('quickmenu');
QuickMenu.$element = undefined;
QuickMenu.$anchor = _('.absol-context-menu-anchor');
QuickMenu.$anchor.addChild(QuickMenu.$elt);

QuickMenu._acceptAnchors = 0;
QuickMenu._previewAnchor = QuickMenu.DEFAULT_ANCHOR;
QuickMenu._session = Math.random() * 10000000000 >> 0;
QuickMenu._menuListener = undefined;
QuickMenu._scrollOutListener = undefined;

QuickMenu.$elt.on('press', function (event) {
    if (QuickMenu._menuListener) QuickMenu._menuListener(event.menuItem);
});


QuickMenu.updatePosition = function () {

    if (!QuickMenu.$element) return;
    var menu = QuickMenu.$elt;
    var anchor = QuickMenu.$anchor;
    var anchorBound = anchor.getBoundingClientRect();
    var eBound = QuickMenu.$element.getBoundingClientRect();
    var outBound = traceOutBoundingClientRect(QuickMenu.$element);

    if (eBound.bottom < outBound.top || eBound.left > outBound.right || eBound.top > outBound.bottom
        || eBound.right < outBound.left) {
        QuickMenu._scrollOutListener && QuickMenu._scrollOutListener();
    }

    var qBound = menu.getBoundingClientRect();
    outBound = getScreenSize();
    outBound.left = 0;
    outBound.right = outBound.width;
    outBound.top = 0;
    outBound.bottom = outBound.height;
    //padding
    outBound.left += 2;
    outBound.top += 2;
    outBound.bottom -= 2;
    outBound.right -= 2;
    outBound.height -= 4;
    outBound.width -= 4;

    var getPos = function (anchor) {
        anchor = anchor % 8;
        var x = 0;
        var y = 0;
        if (anchor == 0 || anchor == 3) {
            y = eBound.top;
        }

        if (anchor == 0 || anchor == 7) {
            x = eBound.right;
        }

        if (anchor == 1 || anchor == 6) {
            x = eBound.left;
        }

        if (anchor == 1 || anchor == 2) {
            y = eBound.bottom;
        }

        if (anchor == 2 || anchor == 5) {
            x = eBound.right - qBound.width;
        }

        if (anchor == 3 || anchor == 4) {
            x = eBound.left - qBound.width;
        }

        if (anchor == 4 || anchor == 7) {
            y = eBound.bottom - qBound.height;
        }

        if (anchor == 5 || anchor == 6) {
            y = eBound.top - qBound.height;
        }
        return { x: x, y: y };
    };

    var pos;

    var bestSquare = -1;
    var bestRect;
    var priority = [QuickMenu._previewAnchor].concat(QuickMenu._acceptAnchors);

    var cAnchor;
    var outRect = new Rectangle(outBound.left, outBound.top, outBound.width, outBound.height);

    var menuRect;
    var viewSquare;
    var cPos;
    for (var i = 0; i < priority.length; ++i) {
        cAnchor = priority[i];
        cPos = getPos(cAnchor);
        menuRect = new Rectangle(cPos.x, cPos.y, qBound.width, qBound.height);
        viewSquare = outRect.collapsedSquare(menuRect);

        if (viewSquare - 0.01 > bestSquare) {
            bestSquare = viewSquare;
            pos = cPos;
            QuickMenu._previewAnchor = cAnchor;
            bestRect = outRect.collapsedRect(menuRect);
        }
    }

    anchor.addStyle({
        left: pos.x + 'px',
        top: pos.y + 'px'
    });
};

QuickMenu._scrollEventHandler = QuickMenu.updatePosition.bind(QuickMenu);
QuickMenu.$scrollTrackElements = [];


QuickMenu.show = function (element, menuProps, anchor, menuListener, darkTheme) {
    //untrack all element
    QuickMenu.$scrollTrackElements.forEach(function (e) {
        if (e.removeEventListener)
            e.removeEventListener('scroll', QuickMenu._scrollEventHandler, false);
        else
            e.dettachEvent('onscroll', QuickMenu._scrollEventHandler, false);

    });
    QuickMenu.$scrollTrackElements = [];
    if (typeof anchor == 'number') {
        QuickMenu._acceptAnchors = [anchor];
    }
    else if (anchor instanceof Array) {
        QuickMenu._acceptAnchors = anchor;
    }
    else {
        QuickMenu._acceptAnchors = QuickMenu.PRIORITY_ANCHORS;
    }

    QuickMenu._previewAnchor = QuickMenu._acceptAnchors[0];

    QuickMenu._session = Math.random() * 10000000000 >> 0;
    QuickMenu.$anchor.addTo(document.body)
    Dom.addToResizeSystem(QuickMenu.$elt);
    QuickMenu.$elt.updateSize = QuickMenu.updatePosition.bind(QuickMenu);
    QuickMenu.$element = element;
    QuickMenu._menuListener = menuListener;
    var qmenu = QuickMenu.$elt;
    var anchor = QuickMenu.$anchor;
    Object.assign(qmenu, menuProps);
    if (darkTheme) anchor.addClass('dark');
    else anchor.removeClass('dark');
    qmenu.removeStyle('visibility');//for prevent size change blink
    QuickMenu.$anchor.addClass('absol-active');

    QuickMenu.updatePosition();
    setTimeout(function () {
        qmenu.addStyle('visibility', 'visible');
    }, BrowserDetector.isMobile ? 33 : 2);

    //track element
    var trackElt = element.parentElement;
    while (trackElt) {
        // trackElt.addEventListener('scroll', QuickMenu._scrollEventHandler, false);
        if (trackElt.addEventListener)
            trackElt.addEventListener('scroll', QuickMenu._scrollEventHandler, false);
        else
            trackElt.attachEvent('onscroll', QuickMenu._scrollEventHandler, false);

        QuickMenu.$scrollTrackElements.push(trackElt);
        trackElt = trackElt.parentElement;
    }
    if (document.addEventListener) {
        document.addEventListener('scroll', QuickMenu._scrollEventHandler, false);
    }
    else {
        document.attachEvent('onscroll', QuickMenu._scrollEventHandler, false);
    }
    QuickMenu.$scrollTrackElements.push(document);

    return QuickMenu._session;
};

QuickMenu.close = function (session) {
    if (session !== true && session !== QuickMenu._session) return;
    QuickMenu._session = Math.random() * 10000000000 >> 0;
    QuickMenu.$element = undefined;
    QuickMenu._menuListener = undefined;
    QuickMenu._previewAnchor = QuickMenu.DEFAULT_ANCHOR;

    //untrack all element
    QuickMenu.$scrollTrackElements.forEach(function (e) {
        e.removeEventListener('scroll', QuickMenu._scrollEventHandler, false);
    });
    QuickMenu.$scrollTrackElements = [];
    var qmenu = QuickMenu.$elt;
    qmenu.removeStyle('visibility');//for prevent size change blink
    qmenu.removeStyle({
        left: true,
        top: true
    });
    QuickMenu.$anchor.removeClass('absol-active');
    QuickMenu.$anchor.remove();
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
            document.body.removeEventListener('click', finish, false);
            QuickMenu.close(res.currentSession);
            res.currentSession = undefined;
            if (QuickMenu._scrollOutListener === finish) QuickMenu._scrollOutListener = undefined;
        };
        QuickMenu._scrollOutListener = finish;

        setTimeout(function () {
            document.body.addEventListener('click', finish, false);
        }, 10)
    };

    res.remove = function () {
        element.removeEventListener('click', clickHandler, false);
    };

    element.addEventListener('click', clickHandler, false);
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
            if (QuickMenu._scrollOutListener === finish) QuickMenu._scrollOutListener = undefined;
        };
        QuickMenu._scrollOutListener = finish;

        setTimeout(function () {
            document.body.addEventListener('click', finish, false);
        }, 10);
    };

    res.remove = function () {
        trigger.removeEventListener('click', clickHandler, false);
    };

    trigger.addEventListener('click', clickHandler, false);
    return res;

};


export default QuickMenu;
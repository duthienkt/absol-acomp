import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import Rectangle from "absol/src/Math/Rectangle";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import './Menu';


var _ = ACore._;
var $ = ACore.$;

function QuickMenu() {
    //like context menu without right-click

    this.$contextMenu = $('vmenu.absol-context-menu', this);
    this._contextMenuSync = Promise.resolve();
}

QuickMenu.tag = 'QuickMenu'.toLowerCase();

QuickMenu.render = function () {
    return _({
        extendEvent: 'requestcontextmenu',
        class: ['absol-context-hinge'],
        child: {
            tag: 'vmenu',
            class: [
                'absol-context-menu', 'absol-bscroller'
            ],
            style: {
                'overflow-y': 'auto',
                'box-sizing': 'border-box'
            }
        }
    });
};
// QuickMenu.prototype.show = function(element, menuProps, anchor){
//     var elementBound = element.getBoundingClientRect();

// };

ACore.install(QuickMenu);
QuickMenu.PRIORITY_ANCHORS = [0, 3, 7, 4, 1, 2, 6, 5];
QuickMenu.DEFAULT_ANCHOR = 0;

QuickMenu.$ctn = _('.absol-context-hinge-fixed-container');
QuickMenu.$elt = _('quickmenu').addTo(QuickMenu.$ctn);
QuickMenu.$element = undefined;
QuickMenu._acceptAnchors = 0;
QuickMenu._previewAnchor = QuickMenu.DEFAULT_ANCHOR;
QuickMenu._session = Math.random() * 10000000000 >> 0;
QuickMenu._menuListener = undefined;
QuickMenu._scrollOutListener = undefined;

QuickMenu.$elt.$contextMenu.on('press', function (event) {
    if (QuickMenu._menuListener) QuickMenu._menuListener(event.menuItem);
});


QuickMenu.updatePosition = function () {

    if (!QuickMenu.$element) return;

    var qmenu = QuickMenu.$elt;
    var menu = qmenu.$contextMenu;
    var ebound = QuickMenu.$element.getBoundingClientRect();
    var outBound = Dom.traceOutBoundingClientRect(QuickMenu.$element);
    if (ebound.bottom < outBound.top || ebound.left > outBound.right || ebound.top> outBound.bottom
    || ebound.right < outBound.left){
        QuickMenu._scrollOutListener && QuickMenu._scrollOutListener();
        return ;
    }
    var menuBound = menu.getBoundingRecursiveRect(3);
    var qBound = qmenu.getBoundingClientRect();
    var outBound = Dom.traceOutBoundingClientRect(qmenu);
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
            y = ebound.top;
        }

        if (anchor == 0 || anchor == 7) {
            x = ebound.right;
        }

        if (anchor == 1 || anchor == 6) {
            x = ebound.left;
        }

        if (anchor == 1 || anchor == 2) {
            y = ebound.bottom;
        }

        if (anchor == 2 || anchor == 5) {
            x = ebound.right - menuBound.width;
        }

        if (anchor == 3 || anchor == 4) {
            x = ebound.left - menuBound.width;
        }

        if (anchor == 4 || anchor == 7) {
            y = ebound.bottom - menuBound.height;
        }

        if (anchor == 5 || anchor == 6) {
            y = ebound.top - menuBound.height;
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
        menuRect = new Rectangle(cPos.x, cPos.y, menuBound.width, menuBound.height);
        viewSquare = outRect.collapsedSquare(menuRect);

        if (viewSquare - 0.01 > bestSquare) {
            bestSquare = viewSquare;
            pos = cPos;
            QuickMenu._previewAnchor = cAnchor;
            bestRect = outRect.collapsedRect(menuRect);
        }
    }

    // if (bestRect && pos.y < ebound.bottom) {
    //     pos.y += menuBound.height - Math.min(menuBound.height, bestRect.height - 5);
    // }

    pos.x -= qBound.left;
    pos.y -= qBound.top;

    menu.addStyle({
        left: pos.x + 'px',
        top: pos.y + 'px'
    });

    // if (bestRect) {
    //     menu.addStyle('max-height', bestRect.height + 'px');
    // }
    // else {
    //     menu.removeStyle('max-height');
    // }

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
    QuickMenu.$ctn.addTo(document.body);
    Dom.addToResizeSystem(QuickMenu.$ctn);

    QuickMenu.$ctn.updateSize = QuickMenu.updatePosition.bind(QuickMenu);
    QuickMenu.$element = element;
    QuickMenu._menuListener = menuListener;
    var qmenu = QuickMenu.$elt;
    var menu = qmenu.$contextMenu;
    Object.assign(menu, menuProps);
    if (darkTheme) qmenu.addClass('dark');
    else qmenu.removeClass('dark');
    menu.removeStyle('visibility');//for prevent size change blink
    QuickMenu.updatePosition();
    setTimeout(function () {
        menu.addStyle('visibility', 'visible');
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
    var menu = qmenu.$contextMenu;
    menu.removeStyle('visibility');//for prevent size change blink
    menu.removeStyle({
        left: true,
        top: true
    });
    QuickMenu.$ctn.remove();
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
            if ( QuickMenu._scrollOutListener === finish )QuickMenu._scrollOutListener = undefined;
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
            if ( QuickMenu._scrollOutListener === finish )QuickMenu._scrollOutListener = undefined;
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
import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import Rectangle from "absol/src/Math/Rectangle";



var _ = Acore._;
var $ = Acore.$;

function QuickMenu() {
    //like context menu without right-click
    var res = _({
        extendEvent: 'requestcontextmenu',
        class: ['absol-context-hinge'],
        child: ['vmenu.absol-context-menu']
    });

    res.$contextMenu = $('vmenu.absol-context-menu', res);

    res._contextMenuSync = Promise.resolve();

    return res;
};

// QuickMenu.prototype.show = function(element, menuProps, anchor){
//     var elementBound = element.getBoundingClientRect();

// };

Acore.install('quickmenu', QuickMenu);
QuickMenu.PRIORITY_ANCHORS = [0, 3, 7, 4, 1, 2, 6, 5];
QuickMenu.DEFAULT_ANCHOR = 0;

QuickMenu.$ctn = _('.absol-context-hinge-fixed-container');
QuickMenu.$elt = _('quickmenu').addTo(QuickMenu.$ctn);
QuickMenu.$element = undefined;
QuickMenu._acceptAnchors = 0;
QuickMenu._previewAnchor = QuickMenu.DEFAULT_ANCHOR;
QuickMenu._session = Math.random() * 10000000000 >> 0;
QuickMenu._menuListener = undefined;

QuickMenu.$elt.$contextMenu.on('press', function (event) {
    if (QuickMenu._menuListener) QuickMenu._menuListener(event.menuItem);
});



QuickMenu.updatePosition = function () {

    if (!QuickMenu.$element) return;

    var qmenu = QuickMenu.$elt;
    var menu = qmenu.$contextMenu;
    var ebound = QuickMenu.$element.getBoundingClientRect();
    var menuBound = menu.getBoundingClientRect();
    var qBound = qmenu.getBoundingClientRect();
    var outBound = Dom.traceOutBoundingClientRect(qmenu);

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
        }
    }


    pos.x -= qBound.left;
    pos.y -= qBound.top;
    menu.addStyle({
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
    }, 2);

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
    if (session !== true && session != QuickMenu._session) return;
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
        if (QuickMenu._session == res.currentSession) return;

        res.currentSession = QuickMenu.show(res.element, res.menuProps, res.anchor, res.menuListener, res.darkTheme);

        var finish = function () {
            document.body.removeEventListener('click', finish, false);
            QuickMenu.close(res.currentSession);
            res.currentSession = undefined;
        };

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


export default QuickMenu;
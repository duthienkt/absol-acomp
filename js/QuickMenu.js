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
QuickMenu.$ctn = _('.absol-context-hinge-fixed-container');
QuickMenu.$elt = _('quickmenu').addTo(QuickMenu.$ctn);
QuickMenu.$element = undefined;
QuickMenu._anchor = 0;
QuickMenu._session = Math.random() * 10000000000 >> 0;

QuickMenu.updatePosition = function () {
    if (!QuickMenu.$element) return;
    var anchor = QuickMenu._anchor;

    var qmenu = QuickMenu.$elt;
    var menu = qmenu.$contextMenu;
    var ebound = QuickMenu.$element.getBoundingClientRect();
    var menuBound = menu.getBoundingClientRect();
    var qBound = qmenu.getBoundingClientRect();
    var outBound = Dom.traceOutBoundingClientRect(qmenu);

    var aleft = ebound.left - outBound.left;
    var atop = ebound.top - outBound.top;

    var aright = outBound.right - ebound.right;
    var abottom = outBound.bottom - ebound.bottom;

    var getPos = function (anchor) {
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
    if (anchor == 'auto') {
        var bestSquare = -1;
        var priority = [1, 2, 0, 3, 4, 7, 6, 5];
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
            }
        }
    }
    else {
        pos = getPos(anchor);
    }

    pos.x -= qBound.left;
    pos.y -= qBound.top;
    menu.addStyle({
        left: pos.x + 'px',
        top: pos.y + 'px'
    });

};

QuickMenu.show = function (element, menuProps, anchor) {
    QuickMenu.$ctn.addTo(document.body);
    QuickMenu.$element = element;
    var elementBound = element.getBoundingClientRect();
    var qmenu = QuickMenu.$elt;
    var menu = qmenu.$contextMenu;
    menu.items = menuProps.items || [];
    QuickMenu._anchor = typeof (anchor) == 'number' ? (anchor % 8) : 'auto';
    menu.removeStyle('visibility');//for prevent size change blink
    QuickMenu.updatePosition();
    setTimeout(function () {
        menu.addStyle('visibility', 'visible');
    }, 2);

};


export default QuickMenu;
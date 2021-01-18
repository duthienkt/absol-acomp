import '../css/tooltip.css';
import ACore from "../ACore";
import Dom, {getScreenSize} from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function ToolTip() {
    this.$content = $('.absol-tooltip-content', this);
    this.$arrow = $('.absol-tooltip-arrow', this);
}

ToolTip.tag = 'ToolTip'.toLowerCase();

ToolTip.render = function () {
    return _({
        class: 'absol-tooltip',
        child: [
            { class: 'absol-tooltip-content' },
            '.absol-tooltip-arrow'
        ]
    });
};

['addChild', 'addChildBefore', 'addChildAfter', 'clearChild'].forEach(function (key) {
    ToolTip.prototype[key] = function () {
        return this.$content[key].apply(this.$content, arguments);
    }
});

ACore.install(ToolTip);

export function updateTooltipPosition(toolTipClass) {
    var element = toolTipClass.$element;
    if (!element) return;
    var orientation = toolTipClass._orientation;

    var tBound = toolTipClass.$tooltip.$content.getBoundingClientRect();
    var ebound = element.getBoundingClientRect();
    var screenSize = getScreenSize();
    var sMargin = Math.round(Math.min(5, screenSize.width/100, screenSize.height));
    screenSize.width = Math.min(screenSize.width, document.body.getBoundingClientRect().width);
    var fontSize = toolTipClass.$tooltip.getFontSize();

    var dx = 0;
    var dy = 0;
    var arrowPos = null;

    var aHCenter = (ebound.left + ebound.width / 2 > tBound.width / 2)
        && (screenSize.width - ebound.left - ebound.width / 2 > tBound.width / 2);
    var aVCenter = (ebound.top + ebound.height / 2 > tBound.height / 2)
        && (screenSize.height - ebound.top - ebound.height / 2 > tBound.height / 2);
    var aTop = (tBound.height < ebound.top - sMargin);
    var aBottom = tBound.height < screenSize.height - sMargin - ebound.bottom;
    var aRight = tBound.width < screenSize.width - sMargin - ebound.right;
    var aLeft = tBound.width < ebound.left - sMargin;

    var aHLeft = (ebound.left + ebound.width / 2 - tBound.width / 2 < sMargin) && (ebound.left + ebound.width / 2 >= sMargin + fontSize / 2);
    var aHRight = (ebound.left + ebound.width / 2 + tBound.width / 2 > screenSize.width - sMargin) && (ebound.left + ebound.width / 2 < screenSize.width - sMargin - fontSize / 2);
    var aVTop = (ebound.top + ebound.width / 2 - tBound.height / 2 < sMargin) && (ebound.top + ebound.height / 2 >= sMargin + fontSize / 2);
    var aVBottom = (ebound.top + ebound.width / 2 + tBound.height / 2 <= screenSize.height - sMargin) && (ebound.top + ebound.height / 2 > screenSize.height - sMargin - fontSize / 2);

    if (orientation === 'auto' && aHCenter) {
        if (aTop) {
            orientation = 'top';
        }
        else if (aBottom) {
            orientation = 'bottom';
        }
    }
    if (orientation === 'auto' && aVCenter) {
        if (aRight) {
            orientation = 'right';
        }
        else if (aLeft) {
            orientation = 'left';
        }
    }


    if ((orientation === 'auto' || orientation === 'top' || orientation === 'bottom') && aHLeft) {
        if (aTop || orientation === 'auto') orientation = "top";
        else if (aBottom || orientation === 'auto') orientation = 'bottom';
        if (aTop || aBottom) {
            dx += tBound.width / 2 - (ebound.left + ebound.width / 2) + sMargin;
            arrowPos = tBound.width / 2 - dx + 'px';
        }
    }
    if ((orientation === 'auto' || orientation === 'top' || orientation === 'bottom') && aHRight) {
        if (aTop || orientation === 'auto') orientation = "top";
        else if (aBottom || orientation === 'auto') orientation = 'bottom';
        if (aTop || aBottom) {
            dx -= tBound.width / 2 - (screenSize.width - (ebound.left + ebound.width / 2)) + sMargin;
            arrowPos = tBound.width / 2 - dx + 'px';
        }
    }


    if ((orientation === 'auto'|| orientation === 'left' || orientation === 'right') && aVTop) {
        if (aLeft || orientation === 'auto') orientation = "left";
        else if (aRight || orientation === 'auto') {
            orientation = 'right';
        }
        if (aLeft || aRight) {
            dy += tBound.height / 2 - (ebound.top + ebound.height / 2) + sMargin;
            arrowPos = tBound.height / 2 - dy + 'px';
        }
    }
    if ((orientation === 'auto'|| orientation === 'left' || orientation === 'right') && aVBottom) {
        if (aLeft || orientation === 'auto') orientation = "left";
        else if (aRight || orientation === 'auto') {
            orientation = 'right';
        }
        if (aLeft || aRight) {
            dy -= tBound.height / 2 - (screenSize.height - (ebound.top + ebound.height / 2)) + sMargin;
            arrowPos = tBound.height / 2 - dx + 'px'
        }
    }

    if (orientation === 'auto') {
        if (aRight) {
            if (aTop) {
                orientation = 'ne';
            }
            else if (aBottom) {
                orientation = 'se';
            }
        }
        else if (aLeft) {
            if (aTop) {
                orientation = 'nw';
            }
            else if (aBottom) {
                orientation = 'sw';
            }
        }
    }
    if (orientation === 'auto') orientation = "error";
    toolTipClass.$tooltip.removeClass('top')
        .removeClass('left')
        .removeClass('right')
        .removeClass('bottom')
        .removeClass('ne')
        .removeClass('nw')
        .removeClass('se')
        .removeClass('sw')
        .addClass(orientation);


    tBound = toolTipClass.$tooltip.getBoundingClientRect();

    if (orientation == 'top') {
        dy += ebound.top - tBound.height;
        dx += ebound.left + ebound.width / 2 - tBound.width / 2;
    }
    else if (orientation == 'left') {
        dy += ebound.top + ebound.height / 2 - tBound.height / 2;
        dx += ebound.left - tBound.width;
    }
    else if (orientation == 'right') {
        dy += ebound.top + ebound.height / 2 - tBound.height / 2;
        dx += ebound.right;
    }
    else if (orientation == 'bottom') {
        dy += ebound.bottom;
        dx += ebound.left + ebound.width / 2 - tBound.width / 2;

    }
    else if (orientation === 'ne') {
        dy += ebound.top - tBound.height;
        dx += ebound.right;
    }
    else if (orientation === 'nw') {
        dy += ebound.top - tBound.height;
        dx += ebound.left - tBound.width;
    }
    else if (orientation === 'se') {
        dy += ebound.bottom;
        dx += ebound.right;
    }
    else if (orientation === 'sw') {
        dy += ebound.bottom;
        dx += ebound.left - tBound.width;
    }
    else {
        throw new Error("Invalid orientation, orientation: ['left', 'right', 'top', 'bottom', 'auto', 'nw', 'ne', 'sw', 'se']");
    }

    if (arrowPos) {
        toolTipClass.$tooltip.addStyle('--tool-tip-arrow-pos', arrowPos);
    }
    else {
        toolTipClass.$tooltip.removeStyle('--tool-tip-arrow-pos')
    }

    toolTipClass.$holder.addStyle({
        top: dy + 'px',
        left: dx + 'px'
    });
}


ToolTip.$holder = _('.absol-tooltip-root-holder')
ToolTip.$tooltip = _('tooltip.top').addTo(ToolTip.$holder);
ToolTip.$element = undefined;
ToolTip.$content = undefined;
ToolTip._orientation = 'top';
ToolTip._session = Math.random() * 10000000000 >> 0;

ToolTip.updatePosition = function () {
    if (!ToolTip.$element) return;
    updateTooltipPosition(ToolTip);
};

ToolTip.$tooltip.$arrow.updateSize = ToolTip.updatePosition.bind(ToolTip);


ToolTip.show = function (element, content, orientation) {
    orientation = orientation || 'auto';
    if (typeof content == 'string') {
        content = _({
            tag: 'span',
            style: {
                'white-space': 'nowrap'
            },
            props: {
                innerHTML: content
            }
        });
    }


    $('', content, function (elt) {
        if (elt.tagName == "IMG" && elt.src) {
            Dom.waitImageLoaded(elt).then(ToolTip.updatePosition.bind(ToolTip));
        }
        else if (elt.sync) {
            elt.sync.then(ToolTip.updatePosition.bind(ToolTip));
        }
    });
    var currentSession = Math.random() * 10000000000 >> 0;

    ToolTip.$holder.addTo(document.body);
    Dom.addToResizeSystem(ToolTip.$tooltip.$arrow);

    ToolTip.$element = element;
    ToolTip._session = currentSession;
    ToolTip.$content = content;
    ToolTip._orientation = orientation;

    ToolTip.$tooltip.clearChild().addChild(content);
    ToolTip.$holder.removeStyle('visibility');
    ToolTip.$tooltip.removeClass('top')
        .removeClass('left')
        .removeClass('right')
        .removeClass('bottom')
        .removeClass('ne')
        .removeClass('nw')
        .removeClass('auto');
    ToolTip.$tooltip.addClass(orientation);
    ToolTip.updatePosition();
    return currentSession;
};


ToolTip.close = function (session) {
    if (session === true || session === this._session) {
        ToolTip.$holder.addStyle('visibility', 'hidden');
        ToolTip.$tooltip.clearChild();
        ToolTip.$holder.addStyle({
            top: false,
            left: false
        });
    }
};

ToolTip.closeTooltip = ToolTip.close;


ToolTip.showWhenClick = function (element, content, orientation) {
    var mSession = undefined;
    element.addEventListener('click', function () {
        if (mSession !== undefined) return;
        mSession = ToolTip.show(element, content, orientation);
        var finish = function (event) {
            if (!EventEmitter.hitElement(content, event)) {
                $(document.body).off('click', finish);
                ToolTip.closeTooltip(mSession);
                mSession = undefined;
            }
        };

        setTimeout(function () {
            $(document.body).on('click', finish);
        }, 100)
    });
};


export default ToolTip;
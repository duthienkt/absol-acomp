import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";

var _ = ACore._;
var $ = ACore.$;

function ToolTip() {
    var res = _({
        class: 'absol-tooltip',
        child: [
            { class: 'absol-tooltip-content', child: '<span>No</span>' },

            '.absol-tooltip-arrow'
        ]
    });

    res.$content = $('.absol-tooltip-content', res);
    res.$arrow = $('.absol-tooltip-arrow', res);
    return res;
}

['addChild', 'addChildBefore', 'addChildAfter', 'clearChild'].forEach(function (key) {
    ToolTip.prototype[key] = function () {
        return this.$content[key].apply(this.$content, arguments);
    }
});

ACore.install('tooltip', ToolTip);


ToolTip.$root = _('.absol-tooltip-root').addStyle('visibility', 'hidden');
ToolTip.$holder = _('.absol-tooltip-root-holder').addTo(ToolTip.$root);
ToolTip.$tooltip = _('tooltip.top').addTo(ToolTip.$holder);
ToolTip.$element = undefined;
ToolTip.$content = undefined;
ToolTip._orientation = 'top';
ToolTip._session = Math.random() * 10000000000 >> 0;

ToolTip.updatePosition = function () {
    var element = ToolTip.$element;
    if (!element) return;
    var orientation = ToolTip._orientation;

    var tBound = ToolTip.$tooltip.getBoundingClientRect();

    var rBound = ToolTip.$root.getBoundingClientRect();
    var ebound = element.getBoundingRecursiveRect();

    var dx, dy;

    if (orientation == 'top') {
        dy = ebound.top - rBound.top - tBound.height;
        dx = ebound.left + ebound.width / 2 - rBound.left - tBound.width / 2;
    }
    else if (orientation == 'left') {
        dy = ebound.top + ebound.height / 2 - rBound.top - tBound.height / 2;
        dx = ebound.left - rBound.left - tBound.width;
    }
    else if (orientation == 'right') {
        dy = ebound.top + ebound.height / 2 - rBound.top - tBound.height / 2;
        dx = ebound.right - rBound.left;
    }
    else if (orientation == 'bottom') {
        dy = ebound.bottom - rBound.top;
        dx = ebound.left + ebound.width / 2 - rBound.left - tBound.width / 2;

    }
    else {
        throw new Error("Invalid orientation, orientation:['left', 'right', 'top', 'bottom', 'auto'] ");
    }

    ToolTip.$holder.addStyle({
        top: dy + 'px',
        left: dx + 'px'
    });
};

ToolTip.$tooltip.$arrow.updateSize = ToolTip.updatePosition.bind(ToolTip);


ToolTip.show = function (element, content, orientation) {

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
            Dom.waitImageLoaded(elt).then(ToolTip.updatePosition.bind(ToolTip));;
        }
        else if (elt.sync) {
            elt.sync.then(ToolTip.updatePosition.bind(ToolTip));
        }
    });
    var currentSession = Math.random() * 10000000000 >> 0;

    ToolTip.$root.addTo(document.body);
    Dom.addToResizeSystem(ToolTip.$tooltip.$arrow);

    ToolTip.$element = element;
    ToolTip._session = currentSession;
    ToolTip.$content = content;
    ToolTip._orientation = orientation;

    ToolTip.$tooltip.clearChild().addChild(content);
    ToolTip.$root.removeStyle('visibility');
    ToolTip.$tooltip.removeClass('top').removeClass('left').removeClass('right').removeClass('bottom');
    ToolTip.$tooltip.addClass(orientation);
    ToolTip.updatePosition();
    return currentSession;
};

ToolTip.closeTooltip = function (session) {
    if (session === true || session === this._session) {
        ToolTip.$root.addStyle('visibility', 'hidden');
        ToolTip.$tooltip.clearChild();
        ToolTip.$holder.addStyle({
            top: false,
            left: false
        });
    }
}


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
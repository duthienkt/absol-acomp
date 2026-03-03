import '../css/tooltip.css';
import ACore, { _, $, $$ } from "../ACore";
import Dom, { getScreenSize, isDomNode } from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { AbstractStyleExtended } from "./Abstraction";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import Rectangle from "absol/src/Math/Rectangle";


/**
 * Option object for {@link TooltipInstance}.
 *
 * @typedef {Object} TooltipInstanceOption
 * @property {HTMLElement|import('absol/src/HTML5/AElement').default|string} [elt]
 *  The target element. If a string is provided, it will be used as a query selector.
 * @property {string|Node|import('absol/src/HTML5/AElement').default} [content]
 *  Tooltip content.
 * @property {'top'|'left'|'right'|'bottom'|'auto'|'nw'|'ne'|'sw'|'se'} [orientation]
 *  Preferred tooltip orientation.
 */

/***
 * @extends AElement
 * @constructor
 */
function ToolTip() {
    this.$content = $('.absol-tooltip-content', this);
    this.$arrow = $('.absol-tooltip-arrow', this);
    /**
     *
     * @type {"top"|"left"|"right"|"bottom"|"nw"|"ne"|"sw"|"se"}
     */
    this.orientation = 'top';
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

ToolTip.prototype.supportedOrientations = ['left', 'right', 'top', 'bottom', 'nw', 'ne', 'sw', 'se'];

ToolTip.property = {};

ToolTip.property.orientation = {
    set: function (value) {
        this._orientation = null;
        for (var i = 0; i < this.supportedOrientations.length; ++i) {
            if (this.supportedOrientations[i] === value) {
                this._orientation = value;
                this.addClass(value);
            }
            else {
                this.removeClass(this.supportedOrientations[i]);
            }
        }
        if (!this._orientation) {
            this._orientation = 'top';
            this.addClass('top');
        }
    },
    get: function () {
        return this._orientation;
    }
}

ACore.install(ToolTip);


/**
 *
 * @param {TooltipInstanceOption} [opt]
 * @constructor
 */
export function TooltipInstance(opt) {
    this.id = Math.random() * 10000000000 >> 0;
    this.opt = opt || {};
    this.opt.orientation = this.opt.orientation || 'auto';
    this.orienttation = null;//previous orientation
}

//quick fix
TooltipInstance.prototype.share = {
    $holder: _('.absol-tooltip-root-holder'),
    $tooltip: _({
        tag: 'tooltip',
        props: {
            orientation: 'top'
        }
    }),
    instance: null
};

TooltipInstance.prototype.share.$tooltip.addTo(TooltipInstance.prototype.share.$holder);


TooltipInstance.prototype.prepare = function () {
    if (!this.share.$holder) {
        this.share.$holder = _('.absol-tooltip-root-holder');
    }
    if (!this.share.$tooltip) {
        this.share.$tooltip = _({
            tag: 'tooltip',
            props: {
                orientation: 'top'
            }
        }).addTo(this.share.$holder);
    }
    if (this.$elt || this.$content) return;//prepare only once
    this.$elt = $(this.opt.elt);//auto wrap element, if element is string, it will be query selector, if element is dom element, it will be wrapped as AElement, if element is AElement, it will be used directly
    var content = this.opt.content;
    if (typeof content === 'string') {
        content = _({
            tag: 'span',
            style: {
                'white-space': 'pre-wrap'
            },
            props: {
                innerHTML: content
            }
        });
    }
    else if (Array.isArray(content)) {
        content = content.map(x => {
            return _(x);
        });
    }
    else if (isDomNode(content)) {

    }
    this.$content = content;
    var images = $$('img', this.$content).filter(x => x.src);
    if (images.length) {
        this.contentSync = Promise.all(images.map(x => Dom.waitImageLoaded(x)));
    }
    else {
        this.contentSync = null;
    }

    return this;

};

TooltipInstance.prototype.show = function () {
    this.prepare();
    if (this.share.instance === this) return;
    if (this.share.instance) {
        this.share.instance.hide();
    }

    this.share.instance = this;
    if (this.opt.variant) {
        this.share.$tooltip.attr('data-variant', this.opt.variant);
    }
    else {
        this.share.$tooltip.attr('data-variant', null);
    }
    this.share.$tooltip.clearChild().addChild(this.$content);
    this.share.$holder.addStyle('visibility', 'hidden').addTo(document.body);
    if (this.share.$tooltip.$arrow) {
        this.share.$tooltip.$arrow.requestUpdateSize = this.updatePosition.bind(this);
        ResizeSystem.add(this.share.$tooltip.$arrow);
    }
    if (this.contentSync) {
        this.contentSync.then(() => {
            if (this.share.instance === this) {
                this.updatePosition();
                this.share.$holder.removeStyle('visibility');
            }
        });
    }
    else {
        this.updatePosition();
        this.share.$holder.removeStyle('visibility');
    }
};

TooltipInstance.prototype.hide = function () {
    if (this.share.instance !== this) return;
    this.share.$holder.selfRemove();
    this.share.$tooltip.clearChild();
    this.share.instance = null;
    if (this.share.$tooltip.$arrow) {
        this.share.$tooltip.$arrow.requestUpdateSize = undefined;
    }
};


/**
 * Update tooltip position according to current `opt.elt` and preferred orientation.
 * This function contains an inlined copy of the positioning logic.
 */
TooltipInstance.prototype.updatePosition = function () {
    if (!this.$elt) return;
    if (this.share.instance !== this) return;

    // Attach holder to body when positioning (mirrors ToolTip.show behavior)

    // Ensure arrow resize system is hooked

    var element = this.$elt;
    var orientation = this.opt.orientation || 'auto';
    var prevOrientation = this.orienttation;
    var exi = 1;

    var tBound = this.share.$tooltip.$content.getBoundingClientRect();
    var eBound = element.getBoundingClientRect();
    var screenSize = getScreenSize();
    var sMargin = Math.round(Math.min(5, screenSize.width / 100, screenSize.height));
    screenSize.width = Math.min(screenSize.width, document.body.getBoundingClientRect().width);
    var fontSize = this.share.$tooltip.getFontSize();

    var destRect;
    var destOrientation;
    var destLostSquare = Infinity;


    var screenRect = new Rectangle(sMargin, sMargin, screenSize.width - sMargin * 2, screenSize.height - sMargin * 2);
    var dx = 0;
    var dy = 0;
    var arrowPos = null;

    var allowOrientations = orientation === 'auto' ? ['top', 'bottom', 'left', 'right', "nw","ne","sw","se"] : [orientation];

    var rRect;
    var lostArea;
    for (var i = 0; i < allowOrientations.length; ++i) {
        rRect = Rectangle.fromClientRect(tBound);
        orientation = allowOrientations[i];
        if (orientation === 'top' || orientation === 'bottom') {
            rRect.height += fontSize * 0.28;
            rRect.x = eBound.left + eBound.width / 2 - tBound.width / 2;
            if (orientation === 'top') {
                rRect.y = eBound.top - rRect.height;
            }
            else {
                rRect.y = eBound.bottom;
            }
            if (rRect.B().x > screenRect.B().x) rRect.x = screenRect.B().x - rRect.width;
            if (rRect.x < screenRect.x) rRect.x = screenRect.x;
            if (rRect.x + 0.28 * fontSize > eBound.right) {
                rRect.x = eBound.right - 0.28 * fontSize - rRect.width;
            }
            if (rRect.x + rRect.width - 0.28 * fontSize < eBound.left) {
                rRect.x = eBound.left + 0.28 * fontSize - rRect.width;
            }
        }
        else if (orientation === 'left' || orientation === 'right') {
            rRect.width += fontSize * 0.28;

            rRect.y = eBound.top + eBound.height / 2 - tBound.height / 2;
            if (orientation === 'left') {
                rRect.x = eBound.left - rRect.width;
            }
            else {
                rRect.x = eBound.right;
            }
            if (rRect.C().y > screenRect.C().y) rRect.y = screenRect.C().y - rRect.height;
            if (rRect.y < screenRect.y) rRect.y = screenRect.y;
            if (rRect.y + 0.28 * fontSize > eBound.bottom) {
                rRect.y = eBound.bottom - 0.28 * fontSize - rRect.height;
            }
            if (rRect.y + rRect.height - 0.28 * fontSize < eBound.top) {
                rRect.y = eBound.top + 0.28 * fontSize - rRect.height;
            }
        }
        else {
            if (orientation === 'nw' || orientation === 'ne') {
                rRect.height += fontSize * 0.28;
                rRect.y = eBound.top - rRect.height;
            }
            else {
                rRect.height += fontSize * 0.28;
                rRect.y = eBound.bottom;
            }
            if (orientation === 'nw' || orientation === 'sw') {
                rRect.width += fontSize * 0.28;
                rRect.x = eBound.left - rRect.width;
            }
            else {
                rRect.width += fontSize * 0.28;
                rRect.x = eBound.right;
            }
        }

        lostArea = rRect.square() - rRect.collapsedSquare(screenRect);

        if (lostArea < exi && prevOrientation === orientation) {
            lostArea = -1;
        }
        if (lostArea < destLostSquare) {
            destLostSquare = lostArea;
            destOrientation = orientation;
            destRect = rRect.copy();
            if (orientation === 'top' || orientation === 'bottom') {
                arrowPos = Math.max(0.4 * fontSize, Math.min(rRect.width - 0.4 * fontSize, (eBound.left + eBound.width / 2 - rRect.x))) + 'px';
            }
            else {
                arrowPos = Math.max(0.4 * fontSize, Math.min(rRect.height - 0.4 * fontSize, (eBound.top + eBound.height / 2 - rRect.y))) + 'px';
            }
        }
    }


    orientation = destOrientation;
    this.orienttation = orientation;

    if (orientation === 'auto') orientation = "error";
    this.share.$tooltip.orientation = orientation;


    if (arrowPos) {
        this.share.$tooltip.addStyle('--tool-tip-arrow-pos', arrowPos);
    }
    else {
        this.share.$tooltip.removeStyle('--tool-tip-arrow-pos')
    }

    this.share.$holder.addStyle({
        top: destRect.y + 'px',
        left: destRect.x + 'px'
    });
}


/**
 * adapt old module
 */
ToolTip.$holder = TooltipInstance.prototype.share.$holder;
ToolTip.$tooltip = TooltipInstance.prototype.share.$tooltip;
ToolTip.$element = undefined;
ToolTip.$content = undefined;
ToolTip._orientation = 'top';
ToolTip._session = Math.random() * 10000000000 >> 0;

ToolTip.updatePosition = function () {
    if (TooltipInstance.prototype.share.instance) {
        TooltipInstance.prototype.share.instance.updatePosition();
    }
};

export function updateTooltipPosition(tooltipClass) {
    var dumInstance = {
        share: tooltipClass,
        opt: {
            orientation: tooltipClass._orientation,
            elt: tooltipClass.$element,
            content: tooltipClass.$content,
        },
        $elt: tooltipClass.$element,
        $content: tooltipClass.$content
    }
    for (var key in TooltipInstance.prototype) {
        if (typeof TooltipInstance.prototype[key] === 'function') {
            dumInstance[key] = TooltipInstance.prototype[key];
        }
    }
    TooltipInstance.prototype.updatePosition.call(dumInstance);
}

ToolTip.show = function (element, content, orientation) {
    var instance = new TooltipInstance({
        elt: element,
        content: content,
        orientation: orientation || 'auto'
    });
    instance.show();
    return instance.id;
};


ToolTip.close = function (session) {
    var instance = TooltipInstance.prototype.share.instance;
    if (session === true || session === (instance && instance.id)) {
        if (instance) instance.hide();
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
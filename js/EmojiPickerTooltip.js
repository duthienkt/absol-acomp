import '../css/emojipickertooltip.css';
import {updateTooltipPosition} from "./Tooltip";
import ACore from "../ACore";
import EmojiPicker from "./EmojiPicker";
import EmojiAnims from "./EmojiAnims";
import PositionTracker from "./PositionTracker";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import {traceOutBoundingClientRect} from "absol/src/HTML5/Dom";
import Rectangle from "absol/src/Math/Rectangle";
import {hitElement} from "absol/src/HTML5/EventEmitter";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends Tooltip
 * @constructor
 */
function EmojiPickerTooltip() {
    this.$iconList = $('.as-emoji-picker-tooltip-icon-list', this);
    this.$leftBtn = $('.as-emoji-picker-tooltip-left-btn', this)
        .on('click', this.eventHandler.clickLeft);

    this.$rightBtn = $('.as-emoji-picker-tooltip-right-btn', this)
        .on('click', this.eventHandler.clickRight);
    this._iconButtonCache = {};
    this._icons = [];
    this.icons = EmojiPickerTooltip.defaultIcons;
}

EmojiPickerTooltip.tag = 'EmojiPickerTooltip'.toLowerCase();


EmojiPickerTooltip.defaultIcons = [';(', '(sarcastic)', ':O', '(cwl)', '(heart)', '(y)', '(n)', '(rock)', '(facepalm)', '(xd)', ':$', '(waiting)', '(headbang)', '(ghost)', '(clap)', '(punch)', '(ok)', '(angry)'];


EmojiPickerTooltip.render = function () {
    return _({
        tag: 'tooltip',
        extendEvent: 'pick',
        class: 'as-emoji-picker-tooltip',
        child: [
            {
                tag: 'button',
                class: 'as-emoji-picker-tooltip-left-btn',
                child: 'span.mdi.mdi-chevron-left'
            },
            {
                class: 'as-emoji-picker-tooltip-scroller',
                child: {
                    class: 'as-emoji-picker-tooltip-icon-list',
                }
            },
            {
                tag: 'button',
                class: 'as-emoji-picker-tooltip-right-btn',
                child: 'span.mdi.mdi-chevron-right'
            }
        ]


    }, true);
};

/*var */


EmojiPickerTooltip.prototype._makeIconBtn = function (iconText) {
    EmojiPickerTooltip.emojiDict = EmojiPickerTooltip.emojiDict || EmojiAnims.reduce(function (ac, cr) {
        ac[cr[0]] = {
            imageFileName: cr[1],
            text: cr[0],
            desc: cr[2]
        };
        return ac;
    }, {});
    var icon = EmojiPickerTooltip.emojiDict[iconText];
    var url = EmojiPicker.assetRoot + '/anim/x40/' + icon.imageFileName;
    var spriteElt = _({
        tag: 'sprite',
        class: 'as-emoji-picker-tooltip-icon',
        attr: {
            title: icon.desc
        },
        props: {
            src: url,
            loop: true,
            fps: 30,
            debug: true
        },
        on: {
            ready: function () {
                this.frames = {
                    type: 'grid',
                    col: 1,
                    row: this.texture.naturalHeight / this.texture.naturalWidth
                };
                this.frameIndex = 0;
            }
        }
    });
    var buttonElt = _({
        tag: 'button',
        class: 'as-emoji-picker-tooltip-icon-btn',
        child: spriteElt,
        on: {
            click: this.eventHandler.clickIconBtn.bind(null, icon)
        }
    });

    buttonElt.on('mouseenter', function () {
        spriteElt.play();
    }).on('mouseleave', function () {
        spriteElt.stop();
        spriteElt.frameIndex = 0;
    });

    return buttonElt;

};

EmojiPickerTooltip.prototype._updateIconList = function () {
    this.$iconList.clearChild();
    var iconText;
    for (var i = 0; i < this._icons.length; ++i) {
        iconText = this._icons[i];
        this._iconButtonCache[iconText] = this._iconButtonCache[iconText] || this._makeIconBtn(iconText);
        this.$iconList.addChild(this._iconButtonCache[iconText])
    }
};

EmojiPickerTooltip.property = {};

EmojiPickerTooltip.property.icons = {
    set: function (icons) {
        this._icons = icons || [];
        this._updateIconList();
        this.viewOffset = 0;
    },
    get: function () {
        return this._icons;
    }
};

EmojiPickerTooltip.property.viewOffset = {
    set: function (value) {
        this._viewOffset = Math.max(0, Math.min(value, this._icons.length - 6));
        this.$iconList.addStyle('left', -60 * this._viewOffset + 'px');
        this.$leftBtn.disabled = this._viewOffset === 0;
        this.$rightBtn.disabled = this._viewOffset === this._icons.length - 6;
    },
    get: function () {
        return this._viewOffset;
    }
};

EmojiPickerTooltip.eventHandler = {};

EmojiPickerTooltip.eventHandler.clickLeft = function () {
    this.viewOffset -= 6;
};


EmojiPickerTooltip.eventHandler.clickRight = function () {
    this.viewOffset += 6;
};

EmojiPickerTooltip.eventHandler.clickIconBtn = function (icon) {
    this.emit('pick', Object.assign({ type: 'pick', icon: icon, target: this }, icon));
};

ACore.install(EmojiPickerTooltip);


EmojiPickerTooltip.$holder = _('.absol-tooltip-root-holder')
EmojiPickerTooltip.$tooltip = _('emojipickertooltip.top').addTo(EmojiPickerTooltip.$holder)
    .on('pick', function (event) {
        EmojiPickerTooltip._listener && EmojiPickerTooltip._listener(event.icon);
    });
/***
 *
 * @type {PositionTracker|undefined}
 */
EmojiPickerTooltip.$element = undefined;
EmojiPickerTooltip.$content = undefined;
EmojiPickerTooltip._orientation = 'auto';
EmojiPickerTooltip._session = Math.random() * 10000000000 >> 0;
EmojiPickerTooltip._listener = undefined;
EmojiPickerTooltip._scrollOutListener = undefined;


EmojiPickerTooltip.updatePosition = function () {
    if (!EmojiPickerTooltip.$element) return;
    var outBound = Rectangle.fromClientRect(traceOutBoundingClientRect(EmojiPickerTooltip.$element));
    var eBound = Rectangle.fromClientRect(EmojiPickerTooltip.$element.getBoundingClientRect());
    if (!outBound.isCollapse(eBound, 0)) {
        EmojiPickerTooltip._scrollOutListener && EmojiPickerTooltip._scrollOutListener();
    }
    updateTooltipPosition(EmojiPickerTooltip);
};

EmojiPickerTooltip.updatePosition = EmojiPickerTooltip.updatePosition.bind(EmojiPickerTooltip);
EmojiPickerTooltip.$tooltip.$arrow.updateSize = EmojiPickerTooltip.updatePosition;

EmojiPickerTooltip.show = function (element, menuListener, orientation) {
    if (EmojiPickerTooltip.$element) {
        EmojiPickerTooltip.$element.stopTrackPosition();
        EmojiPickerTooltip.$element.off('positionchange', EmojiPickerTooltip.updatePosition);
    }
    if (!element.startTrackPosition) {
        _({
            tag: PositionTracker.tag,
            elt: element
        })
    }
    element.startTrackPosition();
    EmojiPickerTooltip.$element = element;
    EmojiPickerTooltip.$element.on('positionchange', EmojiPickerTooltip.updatePosition);
    EmojiPickerTooltip._listener = menuListener;
    EmojiPickerTooltip._session = Math.random() * 10000000000 >> 0;
    EmojiPickerTooltip._orientation = orientation || 'auto';
    EmojiPickerTooltip.$holder.addTo(document.body);
    ResizeSystem.add(EmojiPickerTooltip.$tooltip.$arrow);
    EmojiPickerTooltip.$tooltip.viewOffset = 0;
    EmojiPickerTooltip.$tooltip.addClass('top')
        .removeClass('left')
        .removeClass('right')
        .removeClass('bottom')
        .removeClass('ne')
        .removeClass('nw')
        .removeClass('auto');
    EmojiPickerTooltip.updatePosition();

    return EmojiPickerTooltip._session;
};


EmojiPickerTooltip.close = function (token) {
    if (EmojiPickerTooltip._session !== token) return;
    if (EmojiPickerTooltip.$element) {
        EmojiPickerTooltip.$element.stopTrackPosition();
        EmojiPickerTooltip.$element.off('positionchange', EmojiPickerTooltip.updatePosition);
    }
    EmojiPickerTooltip.$element = undefined;
    EmojiPickerTooltip._listener = undefined;
    EmojiPickerTooltip._session = Math.random() * 10000000000 >> 0;
    EmojiPickerTooltip.$holder.remove();
};


EmojiPickerTooltip.toggleWhenClick = function (trigger, adaptor) {
    var res = {
        trigger: trigger,
        adaptor: adaptor,
        currentSession: undefined,
    };

    function clickHandler(event) {
        if (res.currentSession === EmojiPickerTooltip._session) return;

        res.currentSession = EmojiPickerTooltip.show(res.adaptor.getFlowedElement ? res.adaptor.getFlowedElement() : trigger,
            res.adaptor.onSelect,
            res.adaptor.orientation || 'auto'
        );
        if (res.adaptor.onOpen) res.adaptor.onOpen();

        var finish = function (event) {
            if (event && (hitElement(EmojiPickerTooltip.$tooltip.$leftBtn, event) || hitElement(EmojiPickerTooltip.$tooltip.$rightBtn, event)) || event.target.classList.contains('absol-tooltip-content')) return;
            document.body.removeEventListener('click', finish, false);
            EmojiPickerTooltip.close(res.currentSession);
            if (adaptor.onClose) adaptor.onClose();
            res.currentSession = undefined;
            if (EmojiPickerTooltip._scrollOutListener === EmojiPickerTooltip) EmojiPickerTooltip._scrollOutListener = undefined;
        };
        EmojiPickerTooltip._scrollOutListener = finish;

        setTimeout(function () {
            document.body.addEventListener('click', finish, false);
        }, 10);

    }

    res.remove = function () {
        trigger.removeEventListener('click', clickHandler, false);
        trigger.classList.remove('as-emoji-picker-tooltip-trigger');
    };

    trigger.addEventListener('click', clickHandler, false);
    trigger.classList.add('as-emoji-picker-tooltip-trigger');
    return res;
};

export default EmojiPickerTooltip;


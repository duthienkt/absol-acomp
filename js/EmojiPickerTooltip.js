import '../css/emojipickertooltip.css';
import ToolTip from "./Tooltip";
import ACore from "../ACore";
import EmojiPicker from "./EmojiPicker";
import EmojiAnims from "./EmojiAnims";

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

export default EmojiPickerTooltip;


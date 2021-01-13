import '../css/emojicounter.css';
import ACore from "../ACore";
import EmojiPickerTooltip from "./EmojiPickerTooltip";
import EmojiPicker from "./EmojiPicker";
import ToolTip, {updateTooltipPosition} from "./Tooltip";
import Rectangle from "absol/src/Math/Rectangle";
import {traceOutBoundingClientRect} from "absol/src/HTML5/Dom";
import EmojiUserListTooltip from "./EmojiUserListTooltip";

var $ = ACore.$;
var _ = ACore._;

/***
 * @extends AElement
 * @constructor
 */
function EmojiCounter() {
    /***
     *
     * @type {Sprite}
     */
    this.$sprite = $('sprite', this);
    this.$num = $('.as-emoji-counter-num', this);
    this.$numText = this.$num.firstChild;
    this._text = '(heart)';
    this.text = this._text;
    this._count = 0;
    this.count = 0;
    this._checkInterval = -1;
    this.on('mouseenter', this.eventHandler.mouseEnter);
}

EmojiCounter.tag = 'EmojiCounter'.toLowerCase();

EmojiCounter.render = function () {
    var icon = EmojiPickerTooltip.emojiDict['(heart)'];
    var url = EmojiPicker.assetRoot + '/anim/x40/' + icon.imageFileName;
    return _({
            class: 'as-emoji-counter',
            child: [
                {
                    tag: 'sprite',
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
                },
                {
                    tag: 'span',
                    class: 'as-emoji-counter-num',
                    child: { text: '0' }
                }
            ]
        }
    );
};


EmojiCounter.property = {};

EmojiCounter.property.text = {
    set: function (value) {
        var icon = EmojiPickerTooltip.emojiDict[value];
        if (!icon) return;
        if (this._text === value) return;
        this.$sprite.src = EmojiPicker.assetRoot + '/anim/x40/' + icon.imageFileName;
        this._text = value;
    },
    get: function () {
        return this._text;
    }
};

EmojiCounter.property.count = {
    set: function (value) {
        this.$numText.data = value + '';
        if (value === 1 && this._count != 1) {
            this.$numText.remove();
        }
        else if (value != 1 && this._count == 1) {
            this.$num.addChild(this.$numText);
        }
        if (value == 0) this.addClass('as-zero');
        else this.removeClass('as-zero');
        this._count = value;
    },
    get: function () {
        return this._count;
    }
}

ACore.install(EmojiCounter);

EmojiCounter.eventHandler = {};

EmojiCounter.eventHandler.loop = function () {
    if (!this.isDescendantOf(document.body))
        this.eventHandler.finishHover();
    if (this.getBoundingClientRect().width === 0)
        this.eventHandler.finishHover();
};

EmojiCounter.eventHandler.mouseEnter = function () {
    if (this._checkInterval > 0) return;
    this.$sprite.play();
    this._checkInterval = setInterval(this.eventHandler.loop, 1000);
    this.on('mouseleave', this.eventHandler.finishHover);

    if (this.users && this.users.length > 0) {
        EmojiCounter.$element = this;
        EmojiCounter.$holder.addTo(document.body);
        updateTooltipPosition(EmojiCounter);
    }
};

EmojiCounter.eventHandler.finishHover = function () {
    this.$sprite.stop();
    this.off('mouseleave', this.eventHandler.finishHover);
    if (this._checkInterval > 0) {
        clearInterval(this._checkInterval);
        this._checkInterval = -1;
    }
    EmojiCounter.$holder.remove();
};


EmojiCounter.$holder = _('.absol-tooltip-root-holder');
EmojiCounter.$tooltip = _('EmojiUserListTooltip.top'.toLowerCase()).addTo(EmojiCounter.$holder);
EmojiCounter._scrollOutListener = undefined;
EmojiCounter._orientation = 'top';
EmojiCounter._session = Math.random() * 10000000000 >> 0;
EmojiPickerTooltip._listener = undefined;
EmojiCounter.$element = null;

EmojiCounter.updatePosition = function () {
    if (!EmojiCounter.$element) return;
    var outBound = Rectangle.fromClientRect(traceOutBoundingClientRect(EmojiCounter.$element));
    var eBound = Rectangle.fromClientRect(EmojiCounter.$element.getBoundingClientRect());
    if (!outBound.isCollapse(eBound, 0)) {
        EmojiPickerTooltip._scrollOutListener && EmojiCounter._scrollOutListener();
    }
    updateTooltipPosition(EmojiCounter);
};


EmojiCounter.updatePosition = EmojiCounter.updatePosition.bind(EmojiCounter);
EmojiCounter.$tooltip.$arrow.updateSize = EmojiCounter.updatePosition;


export default EmojiCounter;
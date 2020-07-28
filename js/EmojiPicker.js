import '../css/emojipicker.css';
import ACore from "../ACore";
import EmojiAnims from "./EmojiAnims";
import Sprite from "./Sprite";

var _ = ACore._;
var $ = ACore.$;

function EmojiPicker() {
    var thisPicker = this;
    this._aliveTimeout = 90;
    this._assetRoot = this.attr('data-asset-root');
    /***
     *
     * @type {Sprite}
     */
    this.$previewAnim = $('sprite.as-emoji-picker-preview-anim', this)
        .on('ready', this.eventHandler.previewAnimReady)
        .on('frame', this.eventHandler.previewAnimFrame);
    this.$previewAnim.loop = true;
    this.$previewAnim.src = this._assetRoot + '/anim/x120/' + EmojiAnims[0][1];
    this.$previewAnim.fps = 30;
    this.$desc = $('.as-emoji-picker-preview-desc', this);
    this.$shortcut = $('.as-emoji-picker-preview-shortcut', this);
    this.$desc.clearChild().addChild(_({ text: EmojiAnims[0][2] }));
    this.$shortcut.clearChild().addChild(_({ text: EmojiAnims[0][0] }));
    this.$list = $('.as-emoji-picker-list', this);
    this.$items = EmojiAnims.reduce(function (ac, it) {
        var itemElt = _({
            tag: 'img',
            class: 'as-emoji-picker-item',
            props: {
                src: thisPicker._assetRoot + '/static/x20/' + it[1]
            }
        }).addTo(thisPicker.$list);
        itemElt.on('mouseenter', thisPicker.eventHandler.mouseenterItem.bind(thisPicker, it, itemElt));
        itemElt.on('click', thisPicker.eventHandler.clickItem.bind(thisPicker, it));
        ac[it[0]] = itemElt;
        return ac;
    }, {});
    this.$attachook = _('attachhook').addTo(this).on('error', this.eventHandler.attach);
}

EmojiPicker.assetRoot = 'https://absol.cf/emoji';
EmojiPicker.tag = 'EmojiPicker'.toLowerCase();

EmojiPicker.render = function (data) {
    data = data || {};
    data.assetRoot = data.assetRoot || EmojiPicker.assetRoot;
    return _({
        class: 'as-emoji-picker',
        extendEvent: 'pick',
        attr: {
            'data-asset-root': data.assetRoot
        },
        child: [
            {
                class: 'as-emoji-picker-preview',
                child: [
                    {
                        class: '.as-emoji-picker-preview-anim-ctn',
                        child: 'sprite.as-emoji-picker-preview-anim'
                    },
                    '.as-emoji-picker-preview-desc',
                    '.as-emoji-picker-preview-shortcut'
                ]
            },
            {
                tag: 'bscroller',
                class: 'as-emoji-picker-list'
            }
        ]
    });
};


/**
 * @type {EmojiPicker}
 */
EmojiPicker.eventHandler = {};


EmojiPicker.eventHandler.attach = function () {
    this._aliveTimeout = 90;
    setTimeout(this.$previewAnim.play.bind(this.$previewAnim), 1);
};

EmojiPicker.eventHandler.previewAnimReady = function () {
    this.$previewAnim.frames = {
        type: 'grid',
        col: 1,
        row: this.$previewAnim.texture.naturalHeight / this.$previewAnim.texture.naturalWidth
    };
    this.$previewAnim.play();
};

EmojiPicker.eventHandler.previewAnimFrame = function () {
    if (this._aliveTimeout == 0) {
        var bound = this.getBoundingClientRect();
        if (bound.width == 0) {
            this.$previewAnim.stop();
        }
        else {
            this._aliveTimeout = 90;
        }
    }
    this._aliveTimeout--;
};


EmojiPicker.eventHandler.mouseenterItem = function (itemData, itemElt, event) {
    if (this.$lastHoverItem == itemElt) return;
    this.$lastHoverItem = itemElt;
    this.$previewAnim.src = this._assetRoot + '/anim/x120/' + itemData[1];
    this.$desc.clearChild().addChild(_({ text: itemData[2] }));
    this.$shortcut.clearChild().addChild(_({ text: itemData[0] }));
};

EmojiPicker.eventHandler.clickItem = function (itemData, event) {
    this.emit('pick', { name: 'pick', key: itemData[0], target: this }, this);
};

ACore.install(EmojiPicker);
export default EmojiPicker;

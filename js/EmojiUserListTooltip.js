import '../css/emojiuserlisttooltip.css';
import ACore from "../ACore";
import ToolTip from "./Tooltip";
import EmojiPicker from "./EmojiPicker";
import EmojiPickerTooltip from "./EmojiPickerTooltip";

var _ = ACore._;
var $ = ACore.$;

/***
 * @augments ToolTip
 * @augments AElement
 * @constructor
 */
function EmojiUserListTooltip() {
    this._text = null;
    this._users = [];
    this.$sprite = _({
        tag: 'sprite',
        class: 'as-emoji-user-list-tooltip-emoji',
        props: {
            fps: 30,
            loop: true
        },
        on: {
            ready: function () {
                this.frames = {
                    type: 'grid',
                    col: 1,
                    row: this.texture.naturalHeight / this.texture.naturalWidth
                };
            }
        }
    });
    this.appendChild(this.$sprite);

    this.text = '(heart)'
    this.user = [];
}

EmojiUserListTooltip.tag = 'EmojiUserListTooltip'.toLowerCase();

EmojiUserListTooltip.render = function () {
    return _({
        tag: 'tooltip',
        class: 'as-emoji-user-list-tooltip'
    }, true);
};


EmojiUserListTooltip.prototype._updateUsers = function () {
    var thisT = this;
    this.$content.clearChild();
    this._users.forEach(function (user) {
        var elt = _({
            class: 'as-emoji-user-list-tooltip-user',
            child: [
                {
                    class: 'as-emoji-user-list-tooltip-avatar',
                    style: {
                        backgroundImage: 'url(' + user.avatar + ')'
                    }
                },
                {
                    class: 'as-emoji-user-list-tooltip-name',
                    child: { text: user.name }
                }
            ]
        });
        if (user.onclick) {
            elt.addClass('as-clickable');
            elt.on('click', user.onclick.bind(user));
        }
        thisT.$content.addChild(elt);
    })
};

EmojiUserListTooltip.prototype.playEmoji = function () {
    this.$sprite.afterReady().then(this.$sprite.play.bind(this.$sprite));
};

EmojiUserListTooltip.prototype.stopEmoji = function () {
    this.$sprite.stop();
};

EmojiUserListTooltip.property = {};

EmojiUserListTooltip.property.users = {
    set: function (users) {
        this._users = users || [];
        this._updateUsers();
    },
    get: function () {
        return this._users;
    }
};

EmojiUserListTooltip.property.text = {
    set: function (value) {
        if (value === this._text) return;
        var icon = EmojiPickerTooltip.emojiDict[value];
        if (!value) return;
        var url = EmojiPicker.assetRoot + '/anim/x60/' + icon.imageFileName;
        this._text = value;
        this.$sprite.src = url;
    },
    get: function () {
        return this._text;
    }
};

ACore.install(EmojiUserListTooltip);


export default EmojiUserListTooltip;
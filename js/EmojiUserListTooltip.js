import '../css/emojiuserlisttooltip.css';
import ACore from "../ACore";


var _ = ACore._;
var $ = ACore.$;

/***
 * @augments Tooltip
 * @augments AElement
 * @constructor
 */
function EmojiUserListTooltip() {

}

EmojiUserListTooltip.tag = 'EmojiUserListTooltip'.toLowerCase();

EmojiUserListTooltip.render = function () {
    return _({
        tag: 'tooltip',
        class: 'as-emoji-user-list-tooltip'
    }, true);
};

ACore.install(EmojiUserListTooltip);


export default EmojiUserListTooltip;
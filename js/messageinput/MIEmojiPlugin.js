import OOP from "absol/src/HTML5/OOP";
import MessageInputPlugin from "./MessageInputPlugin";
import { _ } from "../../ACore";


/****
 * @extends MessageInputPlugin
 * @constructor
 */
function MIEmojiPlugin(inputElt) {
    MessageInputPlugin.call(this, inputElt, {
        id: 'emoji_picker',
        icon: 'span.mdi.mdi-emoticon-happy-outline'
    });

    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
}

OOP.mixClass(MIEmojiPlugin, MessageInputPlugin);


MIEmojiPlugin.prototype.createContent = function () {
    return _('emojipicker')//.addTo(this.$emojiPickerCtn)
        .on('pick', this.ev_PickEmoji);
};

MIEmojiPlugin.prototype.ev_PickEmoji = function (event) {
    var text = this.inputElt.$preInput.value;
    var selected = this._lastInputSelectPosion;

    var newText = text.substr(0, selected.start) + event.key + text.substr(selected.end);
    var newOffset = selected.start + event.key.length;
    this._lastInputSelectPosion = { start: newOffset, end: newOffset };
    this.inputElt.$preInput.focus();
    this.inputElt.$preInput.applyData(newText, newOffset);
    this.inputElt.$preInput.commitChange(newText, newOffset);
    this.inputElt.notifySizeChange();
    this.inputElt.$preInput.focus();
};

MIEmojiPlugin.prototype.onOpen = function (){
    console.log('open')
    var value = this.inputElt.$preInput.value;
    this._lastInputSelectPosion = this.inputElt.$preInput.getSelectPosition() || { start: value.length, end: value.length };
    this.inputElt.$preInput.focus();
}


export default MIEmojiPlugin;
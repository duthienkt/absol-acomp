import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;

function TextClipboard() {
    
    var res = _({
        style: {
            positon: 'fixed',
            opacity: 0,
            width: '1px',
            height: '1px',
            top: 0,
            left: 0
        }
    });

    res.$textarea = _('<textarea class="absol-text-clipboard" wrap="off" autocorrect="off"' +
        ' autocapitalize="off" spellcheck="false"></textarea>').addTo(res);
    return res;
};

TextClipboard.prototype.copy = function (text) {
    this.$textarea.value = text;
    this.$textarea.select();
    document.execCommand('copy');
};

TextClipboard.prototype.paste = function () {
    this.$textarea.select();
    document.execCommand('paste');
};

ACore.creator.textclipboard = TextClipboard;

export default TextClipboard;
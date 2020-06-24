import '../css/checkboxinput.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends  Element
 * @constructor
 */
function NumberSpanInput() {
    this.ev_keydown = this.ev_keydown.bind(this);
    this.on('keydown', this.ev_keydown, true);
    this.readOnly = false;
    this.value = 0;
    this.on('paste', function (event) {
        event.preventDefault();
    })
}

NumberSpanInput.tag = 'NumberSpanInput'.toLowerCase();
NumberSpanInput.render = function () {
    return _({ tag: 'span', child: { text: '' } });
};

NumberSpanInput.prototype.selectAll = function(){
    var sel;
    if (window.getSelection) {
        sel = window.getSelection();
        sel.removeAllRanges();
        var range = document.createRange();
        range.selectNode(this.childNodes[this.childNodes.length - 1]);
        sel.addRange(range);
    } else {
        console.error("TimePicker: Not support!")
    }
};

NumberSpanInput.prototype.selectEnd = function(){
    var sel;
    if (window.getSelection) {
        sel = window.getSelection();
        sel.removeAllRanges();
        var length = this.firstChild.data.length;
        var range = document.createRange();
        range.setStart(this.firstChild, length);
        range.setEnd(this.firstChild, length);
        sel.addRange(range);
    } else {
        console.error("TimePicker: Not support!")
    }
};

NumberSpanInput.prototype.selectNone = function(){
    var sel;
    if (document.activeElement === this){
        sel = window.getSelection();
        sel.removeAllRanges();
    }
}
/***
 *
 * @param {KeyboardEvent} event
 */
NumberSpanInput.prototype.ev_keydown = function (event) {
    if (event.key && event.key.length == 1 && !event.ctrlKey && !event.altKey) {
        if (event.key.match(/[0-9]/)) {

        }
        else {
            event.preventDefault();
        }
    }
    else if (event.key == 'Enter'){
        event.preventDefault();
    }
};


NumberSpanInput.property = {};

NumberSpanInput.property.readOnly = {
    set: function (value) {
        this.contentEditable = !value;
    },
    get: function () {
        return this.contentEditable === false|| this.contentEditable === 'false';
    }
};

/***
 *
 * @type {NumberSpanInput}
 */
NumberSpanInput.property.value = {
    set: function (value) {
        this.firstChild.data = value + '';
    },
    get: function () {
        return (this.firstChild && this.firstChild.data)||'';
    }
}

ACore.install(NumberSpanInput);

export default NumberSpanInput;
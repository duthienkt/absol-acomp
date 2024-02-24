import ACore, { _, $ } from "../ACore";
import { stringHashCode } from "absol/src/String/stringUtils";
import YesNoQuestionDialog from "./YesNoQuestionDialog";
import Modal from "./Modal";
import ext2MineType from "absol/src/Converter/ext2MineType";
import TextMeasurement from "./tool/TextMeasurement";
import { MILLIS_PER_DAY, MILLIS_PER_HOUR, MILLIS_PER_MINUTE } from "absol/src/Time/datetime";
import Rectangle from "absol/src/Math/Rectangle";

export function getSelectionRangeDirection(range) {
    var sel = document.getSelection();
    var direction = 'forward';
    var cmpPosition = sel.anchorNode.compareDocumentPosition(sel.focusNode);
    if (cmpPosition === 4) {
        direction = 'forward';
    }
    else if (cmpPosition === 2) {
        direction = 'backward'
    }
    else if (!cmpPosition && sel.anchorOffset > sel.focusOffset ||
        cmpPosition === Node.DOCUMENT_POSITION_PRECEDING) {
        direction = 'backward';
    }
    return direction;
}

/***
 *
 * @param {Range} range
 * @param {boolean=} backward
 */
export function setSelectionRange(range, backward) {
    var sel = document.getSelection();
    if (backward) {
        if (typeof sel.extend != "undefined") {
            var endRange = range.cloneRange();
            endRange.collapse(false);
            sel.removeAllRanges();
            sel.addRange(endRange);
            sel.extend(range.startContainer, range.startOffset);
        }
    }
    else {
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

export function insertTextAtCursor(text) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    }
    else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
}


export function contenteditableTextOnly(element, processText) {
    if (element.__contenteditableTextOnly__) return;
    element.__contenteditableTextOnly__ = true;
    element.addEventListener("paste", function (e) {
        e.preventDefault();
        if (e.clipboardData && e.clipboardData.getData) {
            var text = e.clipboardData.getData("text/plain");
            if (processText) text = processText(text)
            document.execCommand("insertHTML", false, text);
        }
        else if (window.clipboardData && window.clipboardData.getData) {
            var text = window.clipboardData.getData("Text");
            if (processText) text = processText(text)
            insertTextAtCursor(text);
        }
    });
}

export function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (activeElTagName == "textarea") || (activeElTagName == "input" &&
            /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
        (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    }
    else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}

/***
 *
 * @param num
 * @param maxVal
 * @return {number}
 */
export function positiveIntMod(num, maxVal) {
    if (maxVal <= 0) return 0;
    if (num >= 0 && num < maxVal) {
        return Math.floor(num);
    }
    else if (num === Infinity) {
        if (maxVal === Infinity)
            return Infinity;
        else
            return 0;
    }
    else if (num < 0) {
        return (num + (Math.ceil(-num / maxVal) * maxVal)) % maxVal;
    }
    else if (num >= maxVal) {
        return Math.floor(num) % maxVal
    }
    else return 0;

}

export function nearFloor(x, epsilon) {
    var y = Math.floor(x);
    if (x - y + epsilon >= 1) y++;
    return y;
}


export function measureText(text, font) {
    // re-use canvas object for better performance
    var canvas = measureText.canvas || (measureText.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    if (font)
        context.font = font;
    var metrics = context.measureText(text);
    return metrics;
}


export function getCaretPosition(oField) {
    var iCaretPos = 0;
    if (document.selection) {
        oField.focus();
        var oSel = document.selection.createRange();
        oSel.moveStart('character', -oField.value.length);
        iCaretPos = oSel.text.length;
    }
    else if (oField.selectionStart || oField.selectionStart == '0')
        iCaretPos = oField.selectionDirection == 'backward' ? oField.selectionStart : oField.selectionEnd;
    return iCaretPos;
}


/**
 *
 * @param {AElement} elt
 */
export function preventNotNumberInput(elt) {
    elt.addEventListener('keyup', function () {
        var lastValue = (elt.tagName === "DIV" || elt.tagName === "SPAN") ? elt.innerHTML : elt.attributes.value;
        var cValue = parseFloat(this.value);
        if (this.value != lastValue) {
            elt.attributes.value = cValue;
            elt.emit('change', cValue, elt);
        }
    });
    elt.addEventListener("paste", function (e) {
        e.preventDefault();
        var text = "";
        if (e.clipboardData && e.clipboardData.getData) {
            text = e.clipboardData.getData("text/plain");

        }
        else if (window.clipboardData && window.clipboardData.getData) {
            text = window.clipboardData.getData("Text");
        }
        var matched = text.match(/[+-]?([0-9]*[.])?[0-9]+/);
        if (matched) {
            this.value = matched[0];
        }
    });
    elt.addEventListener('keydown', function (event) {
        var key = event.key;
        if (key && key.length == 1 && !event.ctrlKey && !event.altKey) {
            if (key.match(/[0-9.\-\+]/)) {
                if (key == '.' && this.value.indexOf('.') >= 0) event.preventDefault();
                if ((key == '+' || key == '-') && (this.value.indexOf('+') >= 0 || this.value.indexOf('-') >= 0 || getCaretPosition(this) > 0)) event.preventDefault();
            }
            else event.preventDefault();
        }
    });
}


export function buildCss(StyleSheet) {
    return _({
        tag: 'style',
        props: {
            innerHTML: Object.keys(StyleSheet).map(function (key) {
                var style = StyleSheet[key];
                return key + ' {\n' +
                    Object.keys(style).map(function (propName) {
                        return propName + ': ' + style[propName] + ';';
                    }).join('\n') +
                    '}';
            }).join('\n')
        }
    }).addTo(document.head);
}

export function forwardEvent(elt, fromName, toName) {
    elt.defineEvent(toName);
    elt.on(fromName, function (event) {
        event = Object.assign({}, event);
        event.type = toName;
        this.emit.apply(this, [toName, event].concat(Array.prototype.slice.call(arguments, 1)));
    });
}

export function forwardMethod(elt, fromName, toName) {
    elt[fromName] = function () {
        this[toName].apply(this, arguments);
    }
}

/***
 *
 * @param {"camera"|"microphone"|"camcorder"|{accept:("image/*"|"audio/*"|"video/*"|undefined), capture:boolean|undefined, multiple:boolean|undefined}|{}=} props
 * @param {boolean=}unSafe
 *  @return {Promise<File[]>}
 */
export function openFileDialog(props, unSafe) {
    return new Promise(function (resolve) {
        var input = ACore._({
            tag: 'input',
            style: {
                display: 'none'
            },
            attr: {
                type: 'file'
            }
        }).addTo(document.body);
        props = props || {};
        if (props === 'camera') {
            props = {
                accept: 'image/*',
                capture: 'camera'
            }
        }
        else if (props === 'microphone') {
            props = {
                accept: 'audio/*',
                capture: "microphone"
            }
        }
        else if (props === 'camcorder') {
            props = {
                accept: 'video/*',
                capture: 'camcorder'
            }
        }

        if (props.accept) {
            if (props.accept instanceof Array)
                input.attr('accept', props.accept.join(','));
            else
                input.attr('accept', props.accept);
        }
        else {
            input.attr('accept', null);
        }

        if (props.capture) {
            input.attr('capture', props.capture);
        }
        if (props.multiple) {
            input.attr('multiple', 'true');
        }
        else {
            input.attr('multiple');
        }
        input.value = null;

        function focusHandler() {
            setTimeout(function () {
                window.removeEventListener('focus', focusHandler);
                if (unSafe) {
                    input.off('change', changeHandler);
                    input.remove();
                    resolve([]);
                }
            }, 1000);
        }

        function changeHandler() {
            input.off('change', changeHandler);
            window.removeEventListener('focus', focusHandler);
            var files = Array.prototype.slice.call(input.files)
            resolve(files);
            input.remove();
        }

        input.on('change', changeHandler);
        input.click();

        setTimeout(function () {
            window.addEventListener('focus', focusHandler);
        }, 10);
    });
}

export function openYesNoQuestionDialog(title, message) {
    return new Promise(resolve => {
        if (window.ModalElement && window.ModalElement.question) {
            window.ModalElement.question({
                title: title,
                message: message,
                onclick: function (sel) {
                    if (sel === 0) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
            });
        }
        else {
            var modal = _({
                tag: Modal.tag,
                child: {
                    tag: YesNoQuestionDialog.tag,
                    props: {
                        textYes: 'Có',
                        textNo: 'Không',
                        message: message,
                        dialogTitle: title
                    },
                    on: {
                        action: (event) => {
                            modal.remove();
                            resolve(event.action.name === 'yes');
                        }
                    }
                }

            }).addTo(document.body);

        }
    });
}


export var charWidth = {
    "A": 9.337890625,
    "Á": 9.337890625,
    "À": 9.337890625,
    "Ả": 9.337890625,
    "Ã": 9.337890625,
    "Ạ": 9.337890625,

    "a": 7.7861328125,
    "á": 7.7861328125,
    "à": 7.7861328125,
    "ả": 7.7861328125,
    "ã": 7.7861328125,
    "ạ": 7.7861328125,

    "Ă": 9.337890625,
    "Ắ": 9.337890625,
    "Ằ": 9.337890625,
    "Ẳ": 9.337890625,
    "Ẵ": 9.337890625,
    "Ặ": 9.337890625,

    "ă": 7.7861328125,
    "ắ": 7.7861328125,
    "ằ": 7.7861328125,
    "ẳ": 7.7861328125,
    "ẵ": 7.7861328125,
    "ặ": 7.7861328125,

    "Â": 9.337890625,
    "Ấ": 9.337890625,
    "Ầ": 9.337890625,
    "Ẩ": 9.337890625,
    "Ẫ": 9.337890625,
    "Ậ": 9.337890625,

    "â": 7.7861328125,
    "ấ": 7.7861328125,
    "ầ": 7.7861328125,
    "ẩ": 7.7861328125,
    "ẫ": 7.7861328125,
    "ậ": 7.7861328125,

    "B": 9.337890625,
    "b": 7.7861328125,
    "C": 10.1103515625,
    "c": 7,
    "D": 10.1103515625,
    "d": 7.7861328125,
    "Đ": 10.1103515625,
    "đ": 7.7861328125,

    "E": 9.337890625,
    "É": 9.337890625,
    "È": 9.337890625,
    "Ẻ": 9.337890625,
    "Ẽ": 9.337890625,
    "Ẹ": 9.337890625,

    "e": 7.7861328125,
    "é": 7.7861328125,
    "è": 7.7861328125,
    "ẻ": 7.7861328125,
    "ẽ": 7.7861328125,
    "ẹ": 7.7861328125,

    "Ê": 9.337890625,
    "Ế": 9.337890625,
    "Ề": 9.337890625,
    "Ể": 9.337890625,
    "Ễ": 9.337890625,
    "Ệ": 9.337890625,

    "ê": 7.7861328125,
    "ế": 7.7861328125,
    "ề": 7.7861328125,
    "ể": 7.7861328125,
    "ễ": 7.7861328125,
    "ệ": 7.7861328125,

    "G": 10.8896484375,
    "g": 7.7861328125,
    "H": 10.1103515625,
    "h": 7.7861328125,

    "I": 3.8896484375,
    "Í": 3.8896484375,
    "Ì": 3.8896484375,
    "Ỉ": 3.8896484375,
    "Ĩ": 3.8896484375,
    "Ị": 3.8896484375,

    "i": 3.1103515625,
    "í": 3.1103515625,
    "ì": 3.1103515625,
    "ỉ": 3.1103515625,
    "ĩ": 3.1103515625,
    "ị": 3.1103515625,

    "K": 9.337890625,
    "k": 7,
    "L": 7.7861328125,
    "l": 3.1103515625,
    "M": 11.662109375,
    "m": 11.662109375,
    "N": 10.1103515625,
    "n": 7.7861328125,

    "O": 10.8896484375,
    "Ó": 10.8896484375,
    "Ò": 10.8896484375,
    "Ỏ": 10.8896484375,
    "Õ": 10.8896484375,
    "Ọ": 10.8896484375,

    "o": 7.7861328125,
    "ó": 7.7861328125,
    "ò": 7.7861328125,
    "ỏ": 7.7861328125,
    "õ": 7.7861328125,
    "ọ": 7.7861328125,

    "Ô": 10.8896484375,
    "Ố": 10.8896484375,
    "Ồ": 10.8896484375,
    "Ổ": 10.8896484375,
    "Ỗ": 10.8896484375,
    "Ộ": 10.8896484375,

    "ô": 7.7861328125,
    "ố": 7.7861328125,
    "ồ": 7.7861328125,
    "ổ": 7.7861328125,
    "ỗ": 7.7861328125,
    "ộ": 7.7861328125,


    "Ơ": 12.00390625,
    "Ớ": 12.00390625,
    "Ờ": 12.00390625,
    "Ở": 12.00390625,
    "Ỡ": 12.00390625,
    "Ợ": 12.00390625,

    "ơ": 9.1806640625,
    "ớ": 9.1806640625,
    "ờ": 9.1806640625,
    "ở": 9.1806640625,
    "ỡ": 9.1806640625,
    "ợ": 9.1806640625,

    "P": 9.337890625,
    "p": 7.7861328125,
    "Q": 10.8896484375,
    "q": 7.7861328125,
    "R": 10.1103515625,
    "r": 4.662109375,
    "S": 9.337890625,
    "s": 7,
    "T": 8.5517578125,
    "t": 3.8896484375,

    "U": 10.1103515625,
    "Ú": 10.1103515625,
    "Ù": 10.1103515625,
    "Ủ": 10.1103515625,
    "Ũ": 10.1103515625,
    "Ụ": 10.1103515625,

    "u": 7.7861328125,
    "ú": 7.7861328125,
    "ù": 7.7861328125,
    "ủ": 7.7861328125,
    "ũ": 7.7861328125,
    "ụ": 7.7861328125,

    "Ư": 11.9560546875,
    "Ứ": 11.9560546875,
    "Ừ": 11.9560546875,
    "Ử": 11.9560546875,
    "Ữ": 11.9560546875,
    "Ự": 11.9560546875,

    "ư": 9.3720703125,
    "ứ": 9.3720703125,
    "ừ": 9.3720703125,
    "ử": 9.3720703125,
    "ữ": 9.3720703125,
    "ự": 9.3720703125,

    "V": 9.337890625,
    "v": 7,
    "X": 9.337890625,
    "x": 7,

    "Y": 9.337890625,
    "Ý": 9.337890625,
    "Ỳ": 9.337890625,
    "Ỷ": 9.337890625,
    "Ỹ": 9.337890625,
    "Ỵ": 9.337890625,

    "y": 7,
    "ý": 7,
    "ỳ": 7,
    "ỷ": 7,
    "ỹ": 7,
    "ỵ": 7,
    " ": 3.8896484375
};


export function estimateWidth14(text) {
    // return absol.text.measureText(text, '14px arial').width
    var l = 0;
    for (var j = 0; j < text.length; ++j) {
        l += (charWidth[text.charAt(j)]) || 9.337890625;
    }
    return l;
}


/**
 *TODO: import from absol-acomp
 * @param {Text} text
 * @param {number=} startOffset
 * @param {number=} endOffset
 * @returns {*[]}
 */
export function getTextNodeBounds(text, startOffset, endOffset) {
    if (!text || text.nodeType !== Node.TEXT_NODE || !text.parentElement) return null;
    var style = getComputedStyle(text.parentElement);
    var fontSize = parseFloat(style.getPropertyValue('font-size').replace('px', ''));
    var lineHeight = style.getPropertyValue('line-height');
    if (lineHeight === 'normal') lineHeight = 1.2;
    else lineHeight = parseFloat(lineHeight.replace('px', '')) / fontSize;
    var txt = text.data;
    var y = -Infinity;
    var c;
    var range;
    var parts = [];
    var cPart;
    var j;
    var delta = lineHeight * fontSize / 3;
    var rect;
    var i = 0;
    if (isNaturalNumber(startOffset)) i = Math.max(startOffset, i);
    if (isNaturalNumber(endOffset)) endOffset = Math.min(txt.length, endOffset);
    else endOffset = txt.length
    while (i < endOffset) {
        c = txt[i];
        j = i + 1;

        range = document.createRange();
        range.setStart(text, i);
        range.setEnd(text, j);
        rect = Rectangle.fromClientRect(range.getBoundingClientRect());
        if (Math.abs(rect.y - y) < delta) {
            cPart.end = j;
            cPart.rect = cPart.rect.merge(rect);
        }
        else {
            cPart = {
                start: i,
                end: j,
                rect: rect
            };
            y = rect.y;
            parts.push(cPart);
        }
        i = j;
    }

    parts.forEach(part => {
        rect = part.rect;
        part.text = txt.substring(part.start, part.end);
    });
    return parts;
}

/***
 *
 * @param {number} v
 * @returns {number}
 */
export function absCeil(v) {
    var a = Math.ceil(Math.abs(v));
    return v < 0 ? -a : a;
}

/***
 *
 * @param {number} x
 * @param {number} l
 * @returns {String}
 */
export function zeroPadding(x, l) {
    var res = Math.abs(x) + '';
    while (res.length < l) {
        res = '0' + res;
    }
    if (x < 0) res = '-' + res;
    return res;
}

var propertyFilter =
    ["$trigger",
        "$content", "_isShow", "defineEvent", "isSupportedEvent",
        "emit", "fire", "eventEmittorOnWithTime", "on", "once",
        "off", "init", "eventHandler", "super", "defineAttribute",
        "defineAttributes", "attr", "addStyle", "removeStyle", "addChild", "addTo", "selfRemove",
        "selfReplace", "clearChild", "containsClass", "addClass", "removeClass", "getComputedStyleValue",
        "getFontSize", "findChildAfter", "findChildBefore", "addChildBefore", "addChildAfter",
        "getBoundingRecursiveRect", "isDescendantOf", "getCSSRules", "afterAttached", "afterDisplayed",
        "_azar_extendEvents", "__azar_force", "_azar_extendAttributes", "_azar_extendTags",
        "findAvailablePosition", "$container", "autoFixParentSize", "sync", "$dropper", "$vmenu",
        "$button", "$text", "$key", "$arrow", "$iconCtn", "_textMarginRight", "_tabIndex",
        '$icon', '_icon', '$textNode', '$primaryBtn', '$extendBtn', '_menuHolder', '_items', 'hasClass'].reduce(function (ac, cr) {
        ac[cr] = true;
        return ac;
    }, {});

/**
 * This is a solution for menu, before a better one.
 * @param obj
 * @returns {{}}
 */
export function cleanMenuItemProperty(obj) {
    var res = {};
    var keys = Object.keys(obj);
    var key;
    for (var i = 0; i < keys.length; ++i) {
        key = keys[i];
        if (!propertyFilter[key]) {
            res[key] = obj[key];
        }
    }
    res.text = obj.text;
    if (obj.icon) {
        res.icon = obj.icon;
    }
    if (obj.items) {
        res.items = obj.items;
    }

    return res;
}

export function getTagListInTextMessage(text) {
    var rg = /@\[id:(\d+)]/g;
    var matched = rg.exec(text);
    var dict = {};
    var v;
    var res = [];
    while (matched) {
        v = parseInt(matched[1]);
        if (isNaN(v)) v = matched[1];
        if (!dict[v]) {
            dict[v] = true;
            res.push(v);
        }
        matched = rg.exec(text);
    }
    return res;
}

/***
 *
 * @param {AElement} e1
 * @param {AElement} e2
 */
export function swapElt(e1, e2) {
    var temp = _('div');
    e1.parentElement.replaceChild(temp, e1);
    e2.parentElement.replaceChild(e1, e2);
    temp.parentElement.replaceChild(e2, temp);
}

export function swapChildrenInElt(e1, e2) {
    var c1 = Array.prototype.slice.call(e1.childNodes);
    var c2 = Array.prototype.slice.call(e2.childNodes);
    $(e1).clearChild();
    $(e2).clearChild();
    while (c2.length > 0) {
        e1.appendChild(c2.shift());
    }
    while (c1.length > 0) {
        e2.appendChild(c1.shift());
    }
}

export function replaceChildrenInElt(elt, childNodes) {
    var nChildren = childNodes.slice();
    var cChildren = Array.prototype.slice.call(elt.childNodes);
    var cC, nC;
    while (cChildren.length > 0 && nChildren.length > 0) {
        cC = cChildren[0];
        nC = nChildren[0];
        if (cC === nC) {
            cChildren.shift();
            nChildren.shift();
        }
        else {
            break;
        }
    }
    cChildren.forEach((elt) => {
        elt.remove();
    });
    elt.addChild(nChildren);
}

export function findVScrollContainer(elt) {
    var parent = elt.parentElement;
    var overflowStyle;
    while (parent) {
        overflowStyle = window.getComputedStyle(parent)['overflow'];
        if ((overflowStyle === 'auto scroll' || overflowStyle === 'auto' || overflowStyle === 'hidden auto' || overflowStyle === 'scroll' || parent.tagName === 'HTML')
            && (parent.clientHeight < parent.scrollHeight)) {
            break;
        }
        parent = parent.parentElement;
    }
    if (!parent || parent === document || parent.tagName === "HTML" || parent.tagName === "html") {
        parent = document.body.parentElement;
    }
    return parent;
}

/**
 *
 * @param {HTMLElement} elt
 */
export function vScrollIntoView(elt) {
    var parent = findVScrollContainer(elt);
    var eBound = elt.getBoundingClientRect();
    var viewportBound = parent.getBoundingClientRect();
    var currentScrollTop = parent.scrollTop;
    var newScrollTop = currentScrollTop;
    if (eBound.bottom > viewportBound.bottom) {
        newScrollTop = currentScrollTop + (eBound.bottom - viewportBound.bottom);
    }
    if (eBound.top < viewportBound.top) {
        newScrollTop = currentScrollTop - (viewportBound.top - eBound.top);
    }

    if (newScrollTop !== currentScrollTop) {
        parent.scrollTop = newScrollTop;
    }
}

export function fileSize2Text(s) {
    if (typeof s !== "number" || isNaN(s)) return '';
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var b = 1;
    for (var i = 0; i < units.length; ++i) {
        if (s <= b * 1024) {
            return Math.floor(s / b * 100) / 100 + units[i];
        }
        b *= 1024;
    }
    return Math.floor(s / b * 10) / 100 + 'PB';
}

export function isDateTimeFormatToken(text) {
    return ['d', 'dd', 'M', 'MM', 'y', 'yyyy', 'h', 'hh', 'H', 'HH', 'm', 'mm', 'a', 'w', 'ww', 'Q', 'QQ'].indexOf(text) >= 0;
}

export var normalizeMinuteOfMillis = mil => {
    mil = mil >> 0;
    if (mil < 0) {
        mil += Math.ceil(-mil / MILLIS_PER_DAY) * MILLIS_PER_DAY
    }
    mil = mil % MILLIS_PER_DAY;
    return Math.floor(mil / 6e4) * 6e4;
};

/**
 *
 * @param {number} mil
 * @returns {{hour: number, minute: number, isNextDate: boolean}}
 */
export var millisToClock = mil => {
    var res = {};
    res.minute = Math.floor(mil / 6e4) % 60;
    var hour = Math.floor(mil / 36e5);

    if (hour >= 24) {
        res.hour = hour % 24;
        res.isNextDate = true;
    } else {
        res.hour = hour;
    }
    return res;
};


export var clockToMillis = (hour, minute) => {
    var res = hour * MILLIS_PER_HOUR + minute * MILLIS_PER_MINUTE;
    if (isNaturalNumber(res)) return res;
    return null;
};


export function isRealNumber(value) {
    return (isFinite(value) && (typeof value === "number"));
}

export function isNaturalNumber(value) {
    return (isFinite(value) && (typeof value === "number") && Math.floor(value) === value && value >= 0);
}


/****
 *
 * @param {string} text
 * @param {{locales?:string}|string =} opt
 */
export function parseLocalFloat(text, opt) {
    if (typeof opt === "string") opt = { locales: opt };
    var locales = (opt && opt.locales) || (window.systemconfig && window.systemconfig.numberFormatLocales);
    var sample = locales ? (new Intl.NumberFormat(locales).format(123456.78)) : (123456.78.toLocaleString());
    // decimal-separator, thousand-separator.
    var thousandSeparator = sample.match(/3(.?)4/)[1] || '';
    var decimalSeparator = sample.match(/6(.?)7/)[1];
    text = text.replace(new RegExp('[' + thousandSeparator + ']', 'g'), '')
        .replace(new RegExp('[' + decimalSeparator + ']', 'g'), '.');
    return parseFloat(text);
}

export function formatLocalFloat(value, opt) {
    if (typeof opt === "string") opt = { locales: opt };
    var formatOpt = Object.assign({}, opt);
    delete formatOpt.locales;

    var locales = (opt && opt.locales) || (window.systemconfig && window.systemconfig.numberFormatLocales);
    var sample;
    var thousandSeparator;
    var decimalSeparator;
    if (!locales) {
        sample = (123456.78.toLocaleString());
        thousandSeparator = sample.match(/3(.?)4/)[1] || '';
        decimalSeparator = sample.match(/6(.?)7/)[1];
        if (decimalSeparator === '.') locales = 'en-US';
        else if (decimalSeparator === ',') {
            locales = 'vi-VN';
        }
    }

    return new Intl.NumberFormat(locales, formatOpt).format(value);
}


/***
 *
 * @param {String} text
 * @returns {Boolean}
 */
export function isURLAddress(text) {
    if (typeof text != "string") return false;
    return text.startsWith('.') || text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/');
}

/***
 *
 * @param {string | null} pattern
 * @param {string} typeString
 * @returns {boolean}
 */
export function fileAccept(pattern, typeString) {
    if (!pattern) return true;
    var parts = pattern.split(',').map(function (x) {
        return x.trim().toLowerCase();
    });
    var ext = typeString.split('.').pop().toLowerCase();
    var mineType = typeString.split('/').shift().toLowerCase();
    return parts.some(function (part) {
        if (part === '*') return true;
        if (part === 'audio/*') {
            return mineType === 'audio' || ['.3gp', '.aa', '.aac', '.aax', '.act', '.aiff', '.alac', '.amr', '.ape',
                '.au', '.awb', '.dss', '.flac', '.gsm', '.m4a', '.m4b', '.m4p', '.mp3', '.mpc', '.ogg, .oga, .mogg'
                , '.opus', '.ra', '.rm', '.raw', '.rf64', '.sln', '.tta', '.voc', '.vox', '.wav', '.wma', '.wv', '.webm',
                '.8svx', '.cda'].indexOf(ext) >= 0;
        }
        else if (part === 'video/*') {
            return mineType === 'video' || ['.webm', '.mkv', '.flv', '.flv', '.vob', '.drc', '.gif', '.gifv', '.mng',
                '.avi', '.wmv', '.yuv', '.rm', '.rmvb', '.viv', '.asf', '.amv', '.m4v', '.svi',
                '.3gp', '.3g2', '.mxf', '.roq', '.nsv'].indexOf(ext) >= 0;
        }
        else if (part === 'image/*') {
            return mineType === 'video' || [
                "ase", "art", "bmp", "blp", "cd5", "cit", "cpt", "cr2", "cut", "dds", "dib", "djvu", "egt", "exif", "gif", "gpl",
                "grf", "icns", "ico", "iff", "jng", "jpeg", "jpg", "jfif", "jp2", "jps", "lbm", "max", "miff", "mng", "msp", "nef",
                "nitf", "ota", "pbm", "pc1", "pc2", "pc3", "pcf", "pcx", "pdn", "pgm", "PI1", "PI2", "PI3", "pict", "pct", "pnm",
                "pns", "ppm", "psb", "psd", "pdd", "psp", "px", "pxm", "pxr", "qfx", "raw", "rle", "sct", "sgi", "rgb", "int", "bw",
                "tga", "tiff", "tif", "vtf", "xbm", "xcf", "xpm", "3dv", "amf", "ai", "awg", "cgm", "cdr", "cmx", "dxf", "e2d", "egt",
                "eps", "fs", "gbr", "odg", "svg", "stl", "vrml", "x3d", "sxd", "v2d", "vnd", "wmf", "emf", "art", "xar", "png", "webp",
                "jxr", "hdp", "wdp", "cur", "ecw", "iff", "lbm", "liff", "nrrd", "pam", "pcx", "pgf", "sgi", "rgb", "rgba", "bw", "int",
                "inta", "sid", "ras", "sun", "tga", "heic", "heif"
            ].indexOf(ext) >= 0;
        }
        else if (part.startsWith('.')) {
            return '.' + ext === part;
        }
        else {
            return part === ext || part === mineType;
        }
    });
}


/***
 *
 * @param {File|Blob|string|{url:string}} fi
 */
export function fileInfoOf(fi) {
    var res = {};
    var handle = o => {
        var parts;
        if (typeof o === "string") {
            res.name = res.name || (o.split('/').pop() || '').replace(/%([\dA-Fa-f][\dA-Fa-f])/g, (all, g1) => {
                var n = parseInt(g1, 16);
                if (typeof n === "number") {
                    return String.fromCharCode(n);
                }
                return all;
            }).replace(/\?.+$/, '');
            if (!res.url && isURLAddress(o)) res.url = o;
            parts = res.name.split('.');
            if (!res.type && parts.length > 1) {
                res.type = parts.pop();
            }
            else if (typeof res.url === 'string') {
                parts = res.url.split('.');
                res.type = parts.pop();
            }
            if (res.type === 'upload') res.type = parts.pop();
        }
        else if ((typeof o === "object") && o) {
            if (o instanceof Blob) {
                res.mimeType = o.type;
            }
            if (!res.name && (typeof o.name === "string")) {
                res.name = o.name;
            }
            if (!res.size && (typeof o.size === "number")) {
                res.size = o.size;
            }
            if (typeof o.url === "string") {
                res.url = o.url;
                handle(o.url);
            }

        }
    };
    handle(fi);

    if (res.name) {
        res.name = res.name.replace(/\.upload$/, '')
    }
    if (!res.type && res.name) {
        res.type = res.name.toLowerCase().split('.').slice(1).pop();
    }
    if (!res.mimeType && res.type) {
        res.mimeType = ext2MineType[res.type];
    }

    for (var k in res) {
        if (res[k] === undefined) delete res[k];
    }

    return res;
}

export function addElementsBefore(inElement, elements, at) {
    for (var i = 0; i < elements.length; ++i) {
        (inElement.addChildBefore || inElement.insertBefore).call(inElement, elements[i], at);
    }
}

export function addElementAfter(inElement, elements, at) {
    var atIdx;
    var before;
    var i;
    if (at) {
        atIdx = Array.prototype.indexOf.call(inElement.childNodes, at);
        if (at && atIdx < 0) throw new Error("The node before which the new node is to be inserted is not a child of this node.");
        before = inElement.childNodes[atIdx + 1];
        if (before) {
            for (i = 0; i < elements.length; ++i) {
                (inElement.addChildBefore || inElement.insertBefore).call(inElement, elements[i], before);
            }
        }
        else {
            for (i = 0; i < elements.length; ++i) {
                (inElement.addChild || inElement.appendChild).call(inElement, elements[i]);
            }
        }

    }
    else {
        before = inElement.firstChild;
        for (i = 0; i < elements.length; ++i) {
            (inElement.addChildBefore || inElement.insertBefore).call(inElement, elements[i], before);
        }
    }
}


export function addElementClassName(elt, className) {
    if (typeof className === "string") {
        className = className.trim().split(/\s+/);
    }
    if (className instanceof Array) {
        className.forEach(cls => elt.classList.add(cls));
    }
}

export function findMaxZIndex(elt) {
    var e = elt
    var style;
    var res = 0;
    while (e && e !== document.body) {
        style = getComputedStyle(e);
        res = Math.max(parseFloat(style.getPropertyValue('z-index')) || 0);
        e = e.parentElement;
    }
    return res;
}

export function getAncestorElementOf(elt) {
    while (elt.parentElement) {
        elt = elt.parentElement;
    }
    return elt;
}

export function checkedValues2RootTreeValues(items, values) {
    var keyOf = (x) => (typeof x) + x;
    var dict = values.reduce((ac, cr) => {
        ac[keyOf(cr)] = true;
        return ac;
    }, {});
    var checkScan = item => {
        if (dict[keyOf(item.value)]) return true;
        if (item.items && item.items.length > 0) {
            item.items.forEach(sItem => checkScan(sItem));
            dict[keyOf(item.value)] = item.items.every(sItem => dict[keyOf(sItem.value)]);
        }
        return dict[keyOf(item.value)];
    }

    var res = [];
    var scan = item => {
        if (dict[keyOf(item.value)]) {
            res.push(item.value);
        }
        else if (item.items && item.items.length > 0) {
            item.items.forEach(sItem => scan(sItem));
        }
    }

    items.forEach(sItem => scan(sItem));
    return res;
}


export function rootTreeValues2CheckedValues(items, values) {
    var keyOf = (x) => (typeof x) + x;
    var dict = values.reduce((ac, cr) => {
        ac[keyOf(cr)] = true;
        return ac;
    }, {});
    var res = [];
    var visit = (item, checked) => {
        if (checked) res.push(item.value);
        if (item.items && item.items.length > 0) {
            item.items.forEach(cr => visit(cr, checked || dict[keyOf(cr.value)]));
        }
    }

    items.forEach(cr => visit(cr, dict[keyOf(cr.value)]))
    return res;
}

/***
 *
 * @param {SelectionItem[]} items
 * @param {{removeNoView?: boolean, removeNewLine?:boolean}=} opt
 * @returns {SelectionItem[]}
 */
export function copySelectionItemArray(items, opt) {
    opt = opt || {};
    if (opt.removeNoView) {
        items = items.filter((item) => !item.noView);
    }
    if (opt.removeNewLine) {
        items.forEach(it => {
            if (it.text && it.text.indexOf && it.text.indexOf('\n') >= 0) {
                it.text = it.text.replace(/[\r\n]/g, '');
            }
        })
    }
    return items.map(item => {
        var newItem;
        if (typeof item === "object" && ('text' in item)) {
            newItem = Object.assign({}, item);
        }
        else {
            newItem = { text: item + '', value: item }
        }
        if (item.items) {
            newItem.items = copySelectionItemArray(item.items, opt);
        }
        return newItem;
    });
}


function compareSelectionItemArray(a, b) {
    if (a === b) return true;
    var aEmpty = !a || !a.length;
    var bEmpty = !b || !b.length;
    if (!aEmpty && aEmpty === bEmpty) return true;
    if (aEmpty !== bEmpty) return false;
    if (a.length !== b.length) return false;
    var n = a.length;

    var ait, bit;
    for (var i = 0; i < n; ++i) {
        ait = a[i];
        bit = b[i];
        if (ait === bit) continue;
        if (ait.text !== bit.text) return false;
        if (ait.text !== bit.text) return false;
        if (!compareSelectionItemArray(ait.items, bit.items)) return false;
    }
    return true;
}


/***
 *
 * @param {AElement|HTMLElement} element
 * @param {number} padding
 */
export function isScrolledToBottom(element, padding) {
    if (!isRealNumber(padding)) padding = 0;
    return (element.scrollHeight - element.scrollTop - padding <= element.clientHeight);
}

export function implicitLatLng(value) {
    var latlng = null;
    var nums;
    if (typeof value === "string") {
        nums = value.split(/\s*,\s*/).map(function (t) {
            return parseFloat(t);
        });
        if (isRealNumber(nums[0]) && isRealNumber(nums[1])) {
            latlng = new google.maps.LatLng(nums[0], nums[1]);
        }
    }
    else if (value instanceof google.maps.LatLng) {
        latlng = value;
    }
    else if (value && isRealNumber(value.latitude) && isRealNumber(value.longitude)) {
        latlng = new google.maps.LatLng(value.latitude, value.longitude);
    }
    else if (value && isRealNumber(value.lat) && isRealNumber(value.lng)) {
        latlng = new google.maps.LatLng(value.lat, value.lng);
    }
    else if ((value instanceof Array) && isRealNumber(value[0]) && isRealNumber(value[1])) {
        latlng = new google.maps.LatLng(value[0], value[1]);
    }
    return latlng;
}

export function getMapZoomLevel(mapDim, bounds) {
    var WORLD_DIM = { height: 256, width: 256 };
    var ZOOM_MAX = 21;

    function latRad(lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    var lngDiff = ne.lng() - sw.lng();
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}


/***
 *
 * @param p0
 * @param p1
 * @returns {number}
 */
export function latLngDistance(p0, p1) {
    var lat0 = p0.lat();
    var lat1 = p1.lat();
    var lng0 = p0.lng();
    var lng1 = p1.lng();

    var toRad = function (value) {
        return value * Math.PI / 180;
    };
    var R = 6371;
    var dLat = toRad(lat1 - lat0);
    var dLng = toRad(lng1 - lng0);
    lat0 = toRad(lat0);
    lat1 = toRad(lat1);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat0) * Math.cos(lat1);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}


export function keyStringOf(o) {
    var type = typeof o;
    var keys;
    if (o && type === "object") {
        if (typeof o.getTime === "function") {
            return 'd(' + o.getTime() + ')';
        }
        else if (typeof o.map === "function") {
            return 'a(' + o.map(val => keyStringOf(val)).join(',') + ')';
        }
        else {
            keys = Object.keys(o);
            keys.sort();
            return 'o(' + keys.map(key => key + ':' + keyStringOf(o[key])).join(',') + ')';
        }
    }
    else {
        return type[0] + '(' + o + ')';
    }
}


export function jsStringOf(x) {
    if (x === null) return 'null';
    if (x === undefined) return 'undefined';
    var type = typeof x;
    if (type === 'string' || type === 'number') return JSON.stringify(x);
    if (x instanceof Date) return 'new Date(' + x.getTime() + ')';
    var keys;
    keys = Object.keys(x);
    keys.sort();
    return '{' + keys.map(function (key) {
        return JSON.stringify(key) + ':' + jsStringOf(x[key]);
    }).join(',') + '}';
}

export function calcDTQueryHash(o) {
    var s = jsStringOf(o);
    return stringHashCode(s);
}


export function replaceInObject(o, replacer, test) {
    return new Promise((rs) => {
        var sync = [];

        function visit(so) {
            Object.keys(so).forEach((key) => {
                var newValue;
                if (test(so[key])) {
                    newValue = replacer(so[key], key, so);
                    if (newValue && newValue.then) {
                        sync.push(newValue);
                        newValue.then(newValue => so[key] = newValue);
                    }
                    else {
                        so[key] = newValue;
                    }
                }
                else if (typeof so[key] === "object" && so[key]) {
                    visit(so[key]);
                }
            });
        }

        visit(o);

        Promise.all(sync).then(() => {
            rs(o);
        })
    });
}

export function replaceFileInObject(o, replacer) {
    return replaceInObject(o, replacer, (value, key, object) => {
        return (value instanceof File) || (value instanceof Blob);
    });
}

export function isNone(x) {
    return x === null || x === undefined;
}

var measureTool = new TextMeasurement();


export function wrapWord(text, width, font) {
    font = font || '14px arial';
    measureTool.compute(font);
    var res = [];
    var i = 1;
    var prevText = '';
    var curText;
    while (text.length > 0) {
        if (i > text.length && text) {
            res.push(text);
            break;
        }
        curText = text.substring(0, i);
        if (measureTool.measureTextWidth(curText, font) <= width || !prevText) {
            prevText = curText;
        }
        else {
            text = text.substring(prevText.length).trimStart();
            res.push(prevText);
            prevText = '';
            i = 1;
            continue;
        }
        ++i;
    }

    return res;

}

export function wrapText(text, width, font) {
    font = font || '14px arial';
    measureTool.compute(font);

    var res = [];
    var i = 1;
    var prevText = '';
    var prevWidth = 0;
    var curText, curWidth;
    while (text.length > 0) {
        if (i > text.length && text) {
            prevText = text;
            prevWidth = measureTool.measureTextWidth(prevText, font);
            if (prevWidth <= width) {
                res.push(prevText);
            }
            else {
                res.push.apply(res, wrapWord(prevText, width, font));
            }
            break;
        }
        if (!text[i - 1].match(/[\s\n]/) && (!text[i] || text[i].match(/[\s\n]/))) {
            curText = text.substring(0, i);
            curWidth = measureTool.measureTextWidth(curText, font);
            if (curWidth <= width || !prevText) {
                prevText = curText;
                prevWidth = curWidth;
            }
            else {
                if (prevWidth <= width) {
                    res.push(prevText);
                }
                else {
                    prevText = wrapWord(prevText, width, font).shift();
                    res.push(prevText);
                }
                text = text.substring(prevText.length).trimStart();

                prevText = '';
                i = 1;
                continue;
            }
        }
        ++i;
    }


    return res;
}

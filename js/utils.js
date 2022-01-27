import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";

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
    ACore._({
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

/***
 *
 * @param {"camera"|"microphone"|"camcorder"|{accept:("image/*"|"audio/*"|"video/*"|undefined), capture:boolean|undefined, multiple:boolean|undefined}|{}} props
 * @return {Promise<File[]>}
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
        "findAvailablePosition", "$container", "autoFixParrentSize", "sync", "$dropper", "$vmenu",
        "$button", "$text", "$key", "$arrow", "$iconCtn", "_textMarginRight", "_tabIndex",
        '$icon', '_icon', '$textNode', '$primaryBtn', '$extendBtn', '_menuHolder', '_items'].reduce(function (ac, cr) {
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

/**
 *
 * @param {HTMLElement} elt
 */
export function vScrollIntoView(elt) {
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
    if (!parent || parent === document || parent.tagName == "HTML" || parent.tagName == "html") {
        elt.scrollIntoView(true);
        return;
    }

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

    if (newScrollTop != currentScrollTop) {
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
    return ['d', 'dd', 'M', 'MM', 'y', 'yyyy', 'h', 'hh', 'H', 'HH', 'm', 'mm', 'a', 'w', 'ww'].indexOf(text) >= 0;
}

export function isRealNumber(value) {
    return (isFinite(value) && (typeof value === "number"));
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
        if (at && atIdx <= 0) throw new Error("The node before which the new node is to be inserted is not a child of this node.");
        before = inElement.childNodes[atIdx + 1];
        if (before) {
            for (i = 0; i < elements.length; ++i) {
                (inElement.addChildBefore || inElement.insertBefore).call(inElement, elements[i], before);
            }
        }
        else {
            for (i = 0; i < elements.length; ++i) {
                (inElement.addChild || inElement.appendChild)(elements[i]);
            }
        }

    }
    else {
        before = inElement.firstChild;
        for (i = 0; i < elements.length; ++i) {
            (inElement.addChildBefore || inElement.insertBefore)(elements[i], before);
        }
    }
}


/***
 *
 * @param {AElement|HTMLElement} element
 * @param {number} padding
 */
export function isScrolledToBottom(element, padding){
    if (!isRealNumber(padding)) padding = 0;
    return (element.scrollHeight - element.scrollTop - padding<= element.clientHeight);
}
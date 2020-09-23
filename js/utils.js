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
 * @param {"camera"|"microphone"|"camcorder"|{accept:("image/*"|"audio/*"|"video/*"), capture:boolean, multiple:boolean}|{}} props
 * @return {Promise<File[]>}
 */
export function openFileDialog(props) {
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
        input.click();
        var finished = false;
        setTimeout(function () {
            ACore.$(document.body).once('click', function () {
                finished = true;
            })
        }, 100)

        function waitFinish() {
            if (input.files.length > 0) {
                resolve(input.files);
            }
            else {
                if (finished)
                    resolve([]);
                else {
                    setTimeout(waitFinish, 400);
                }
            }
        }

        setTimeout(waitFinish, 300);
    });

};


export var charWidth = {
    "A": 9.337890625,
    "a": 7.7861328125,
    "Ă": 9.337890625,
    "ă": 7.7861328125,
    "Â": 9.337890625,
    "â": 7.7861328125,
    "B": 9.337890625,
    "b": 7.7861328125,
    "C": 10.1103515625,
    "c": 7,
    "D": 10.1103515625,
    "d": 7.7861328125,
    "Đ": 10.1103515625,
    "đ": 7.7861328125,
    "E": 9.337890625,
    "e": 7.7861328125,
    "Ê": 9.337890625,
    "ê": 7.7861328125,
    "G": 10.8896484375,
    "g": 7.7861328125,
    "H": 10.1103515625,
    "h": 7.7861328125,
    "I": 3.8896484375,
    "i": 3.1103515625,
    "K": 9.337890625,
    "k": 7,
    "L": 7.7861328125,
    "l": 3.1103515625,
    "M": 11.662109375,
    "m": 11.662109375,
    "N": 10.1103515625,
    "n": 7.7861328125,
    "O": 10.8896484375,
    "o": 7.7861328125,
    "Ô": 10.8896484375,
    "ô": 7.7861328125,
    "Ơ": 12.00390625,
    "ơ": 9.1806640625,
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
    "u": 7.7861328125,
    "Ư": 11.9560546875,
    "ư": 9.3720703125,
    "V": 9.337890625,
    "v": 7,
    "X": 9.337890625,
    "x": 7,
    "Y": 9.337890625,
    "y": 7,
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

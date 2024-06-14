import TextMeasureData from "./TextMeasureData";
import { isDomNode } from "absol/src/HTML5/Dom";


/**
 * best module
 * @constructor
 */
function TextMeasure() {
    this.$canvas = null;
    this.data = {};
    this._loadComputedData();
    // if the font is not in data, create it and copy console log to TextMeasureData.js
    // this._makeFontSize('Times New Roman');
    // this._makeFontSize('Arial');
}

TextMeasure.prototype.exportCode = function () {
    var obj = 'self.absol.TextMeasure';
    var code = [
        'if (!self.absol) self.absol = {};',
        obj + ' = {};',
        obj+'.data = '+ JSON.stringify(this.data)+';'
    ];
    Object.keys(this.constructor.prototype).forEach(key=>{
        var val = this[key];
        if (typeof val === "function") {
            code.push(obj+'.'+key+' = '+ val+';\n');
        }
        else if (!isDomNode(val)) {
            //todo
        }
    })
    return code.join('\n');
};

TextMeasure.prototype._loadComputedData = function () {
    var thisO = this;
    this.data.chars = TextMeasureData.chars;
    this.data.fonts = Object.keys(TextMeasureData.fonts).reduce(function (ac, fontName) {
        var font = TextMeasureData.fonts[fontName];
        ac[fontName] = {
            width: thisO._valueDict2KeyDict(font.width),
            spacing: thisO._valueDict2KeyDict(font.spacing, 2),
            fontBoundingBoxAscent: font.fontBoundingBoxAscent,
            fontBoundingBoxDescent: font.fontBoundingBoxDescent
        }
        return ac;
    }, {});
};

TextMeasure.prototype._valueDict2KeyDict = function (dict, keyLength) {
    var thisO = this;
    return Object.keys(dict).reduce(function (ac, valueText) {
        var keys = thisO._splitKey(dict[valueText], keyLength || 1);
        var value = parseFloat(valueText);
        keys.reduce(function (ac1, key) {
            ac1[key] = value;
            return ac1;
        }, ac);
        return ac;
    }, {});
};

TextMeasure.prototype._keyDic2ValueDict = function (keyDict) {
    return Object.keys(keyDict).reduce(function (ac, cr) {
        var vKey = keyDict[cr].toString();
        ac[vKey] = ac[vKey] || '';
        ac[vKey] += cr;
        return ac;
    }, {});
}

/***
 *
 * @param s
 * @param l
 * @returns {string[]}
 * @private
 */
TextMeasure.prototype._splitKey = function (s, l) {
    var cArr = s.split('');
    if (!l || l < 2) return cArr;
    return cArr.reduce(function (ac, cr) {
        ac.last += cr;
        if (ac.last.length >= l) {
            ac.arr.push(ac.last);
            ac.last = '';
        }
        return ac;
    }, { arr: [], last: '' }).arr;
};

TextMeasure.prototype._array2keyDict = function (arrKey, arrVal) {
    return arrKey.reduce(function (ac, cr, i) {
        ac[cr] = arrVal[i]
        return ac;
    }, {})
};

TextMeasure.prototype._makeFontSize = function (fontName) {
    var thisO = this;
    var charList = TextMeasureData.chars;
    var fontMt = this.measureTextByCanvas("demo-abgH", '20px ' + fontName);
    var cWidthArr = charList.map(function (c) {
        return thisO.measureTextByCanvas(c).width;
    });
    var width = this._array2keyDict(charList, cWidthArr);
    var spacing = charList.reduce(function (ac, c1, i1) {
        return charList.reduce(function (ac1, c2, i2) {
            var d = thisO.measureTextByCanvas(c1 + c2).width - cWidthArr[i1] - cWidthArr[i2];
            if (d !== 0)
                ac1[c1 + c2] = d;
            return ac1;
        }, ac);
    }, {});

    TextMeasureData[fontName] = {
        width: thisO._keyDic2ValueDict(width),
        spacing: thisO._keyDic2ValueDict(spacing),
        fontBoundingBoxAscent: fontMt.fontBoundingBoxAscent,
        fontBoundingBoxDescent: fontMt.fontBoundingBoxDescent
    };

    this.data.fonts[fontName] = {
        width: width,
        spacing: spacing,
        fontBoundingBoxAscent: fontMt.fontBoundingBoxAscent,
        fontBoundingBoxDescent: fontMt.fontBoundingBoxDescent
    };

    // copy from console and paste it to TextMeasureData
    // console.log(fontName+":"+JSON.stringify(this.data.fonts[fontName]));
};

/***
 *
 * @param {string} text
 * @param {string} fontName
 * @param {number} fontSize
 * @return {number}
 */
TextMeasure.prototype.measureWidth = function (text, fontName, fontSize) {
    var width = this.data.fonts[fontName].width;
    var spacing = this.data.fonts[fontName].spacing;
    var res = 0;
    var prevC = text[0];
    var c = text[0];
    res += width[c] || 0;
    for (var i = 1; i < text.length; ++i) {
        c = text[i];
        res += spacing[prevC + c] || 0;
        res += width[c] || 0;
        prevC = c;
    }
    return res * fontSize / 20;
}

/***
 *
 * @param {string}text
 * @param {string=} font - without font-size, default is 20px
 * @returns {TextMetrics}
 */
TextMeasure.prototype.measureTextByCanvas = function (text, font) {
    if (!document || !document.createElement) throw new Error("Not support renderer!");
    var canvas = this.$canvas || (this.$canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    if (font)
        context.font = font;
    var metrics = context.measureText(text);
    return metrics;
};

var instance = new TextMeasure();

export default instance;


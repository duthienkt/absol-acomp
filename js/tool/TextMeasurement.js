
function TextMeasurement(opts) {
    opts = opts || {};
    this.chars = opts.chars || (" !\"$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "[\\]^_abcdefghijklmnopqrstuvwxyz{|}" +
        "¥©ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíñòóôõùúýĂăĐđĨĩŨũƠơƯưẠ̌̀́̃̉Р" +
        "ийксуẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊị" +
        "ỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ–’“”…₫€？").split('');

    this.computed = Object.assign({}, opts.computed || {});
}


TextMeasurement.prototype.compute = function (font) {
    if (this.computed[font]) return true;
    if (!('document' in window)) return false;
    if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    var ctx = this.ctx;
    ctx.font = font;
    var data = {};
    var charBoxes = {};
    data.charBoxes = charBoxes;
    var c, d, i, j;
    var metrics;
    var n = this.chars.length;
    var chars = this.chars;
    for (i = 0; i < n; ++i) {
        c = chars[i];
        metrics = ctx.measureText(c);
        charBoxes[c] = metrics.width;
    }

    var spacing = {};
    data.spacing = spacing;
    var pair;
    for (i = 0; i < n; ++i) {
        c = chars[i];
        for (j = 0; j < n; ++j) {
            d = chars[j];
            pair = c + d;
            metrics = ctx.measureText(pair);
            spacing[pair] = metrics.width - charBoxes[c] - charBoxes[d];
        }
    }

    this.computed[font] = data;
    return true;
};


/***
 *
 * @param {string} text
 * @param {string=} font
 * @return {number}
 */
TextMeasurement.prototype.measureTextWidth = function (text, font) {
    var l = text.length;
    if (l === 0) return 0;
    var width = 0;
    var data = this.computed[font];
    var charBoxes = data.charBoxes;
    var spacing = data.spacing;
    var c, pc;
    pc = text[0];
    width += charBoxes[pc] || charBoxes['0'];

    for (var i = 1; i < l; ++i) {
        c = text[i];
        width += spacing[pc + c];
        width += charBoxes[c] || charBoxes['0'];
        pc = c;
    }
    return width;
};

export default TextMeasurement;
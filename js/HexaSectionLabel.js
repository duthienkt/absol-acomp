import Acore from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

var _g = Svg.ShareInstance._;
var $g = Svg.ShareInstance.$;

function HexaSectionLabel() {
    this.$background = $('.as-hexa-section-label-background', this);
    this.$index = $('.as-hexa-section-label-index', this);
    this.$text = $('.as-hexa-section-label-text', this);
    this.$attachhook = _('attachhook').addTo(this).on('error', function () {
        Dom.addToResizeSystem(this);
        this.requestUpdateSize();
    });

    this.$attachhook.requestUpdateSize = this.redrawBackground.bind(this);
    this.$svg = _g({
        tag: 'svg',
        attr: {
            width: '0',
            height: '0'
        },
        child: [
            'path.as-hexa-section-label-text-box',
            'path.as-hexa-section-label-index-box'
        ]
    }).addTo(this.$background);
    this.$indexBox = $g('path.as-hexa-section-label-index-box', this.$svg);
    this.$textBox = $g('path.as-hexa-section-label-text-box', this.$svg);
};

HexaSectionLabel.prototype.redrawBackground = function () {
    var indexBound = this.$index.getBoundingClientRect();
    var textBound = this.$text.getBoundingClientRect();
    var cHeight = indexBound.height;
    var cWidth = textBound.right - indexBound.left;
    this.$svg.attr({
        height: cHeight + '',
        width: cWidth + '',
        viewBox: [0, 0, cWidth, cHeight].join(' ')
    });

    var radius = (cHeight / Math.cos(Math.PI / 6) / 2) * 0.8;
    var x0 = indexBound.width / 2;
    var y0 = cHeight / 2;


    this.$indexBox.attr('d', Array(6).fill(0).map(function (u, i) {
        var angle = Math.PI / 3 + i * Math.PI / 3;
        var x = radius * Math.cos(angle) + x0;
        var y = radius * Math.sin(angle) + y0;
        return (i == 0 ? 'M' : 'L') + x + ' ' + y;
    }).join(' ') + 'Z')
        .addStyle({
            strokeWidth: cHeight / 11 + ''
        });
    var skewX = 18 / 45;
    this.$textBox.attr('d', [
        [x0, cHeight / 6],
        [cWidth - 1, cHeight / 6],
        [cWidth - 1 - cHeight * skewX * 2 / 3, cHeight - cHeight / 6],
        [x0, cHeight - cHeight / 6],
    ].map(function (point, i) { return (i == 0 ? 'M' : 'L') + point.join(' ') }).join(' ') + 'Z')




};

HexaSectionLabel.render = function () {
    return _({
        class: 'as-hexa-section-label',
        child: [
            {
                class: 'as-hexa-section-label-background'
            },
            '.as-hexa-section-label-index',
            '.as-hexa-section-label-text'
        ]
    });
};

HexaSectionLabel.property = {};
HexaSectionLabel.property.index = {
    set: function (value) {
        this._index = value;
        this.$index.clearChild().addChild(_({ text: value + '' }))
    },
    get: function () {
        return this._index;
    }
};

HexaSectionLabel.property.text = {
    set: function (value) {
        this._text = value;
        this.$text.clearChild().addChild(_({ text: value + '' }))
    },
    get: function () {
        return this._text;
    }
}


Acore.install('hexasectionlabel', HexaSectionLabel);
export default HexaSectionLabel;
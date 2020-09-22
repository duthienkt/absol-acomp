import '../css/hexasectionlabel.css';
import ACore from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import Dom from "absol/src/HTML5/Dom";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;

var _g = Svg.ShareInstance._;
var $g = Svg.ShareInstance.$;


var Design = {
    hexaHeight: 425,
    textBoxHeight: 286,
    textHeight: 96,
    indexHeight: 110,
    textBoxPaddingLeft: 127,
    borderWidth: 38
};

var StyleSheet = {
    '.as-hexa-section-label-text': {
        height: Design.textBoxHeight / Design.textHeight + 'em',
        'padding-left': Design.textBoxPaddingLeft / Design.textHeight + 'em',
        'line-height': Design.textBoxHeight / Design.textHeight + 'em'
    },
    '.as-hexa-section-label-index': {
        'font-size': Design.indexHeight / Design.textHeight + 'em',
        height: Design.hexaHeight / Design.indexHeight + 'em',
        'line-height': Design.hexaHeight / Design.indexHeight + 'em',
        width: ((Design.hexaHeight + Design.borderWidth) / Math.cos(Math.PI / 6)) / Design.indexHeight + 'em'
    },

};

_({
    tag: 'style',
    id: 'hexa-section-label-style',
    props: {
        innerHTML: Object.keys(StyleSheet).map(function (key) {
            var style = StyleSheet[key];
            return key + ' {\n'
                + Object.keys(style).map(function (propName) {
                    return propName + ': ' + style[propName] + ';';
                }).join('\n')
                + '}';
        }).join('\n')
    }
}).addTo(document.head);

/***
 * @extends AElement
 * @constructor
 */
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
}

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

    var borderWidth = cHeight * Design.borderWidth / Design.hexaHeight;
    var radius = (cHeight / Math.cos(Math.PI / 6) / 2) - borderWidth / 2;
    var x0 = indexBound.width / 2;
    var y0 = cHeight / 2;


    this.$indexBox.attr('d', Array(6).fill(0).map(function (u, i) {
        var angle = Math.PI / 3 + i * Math.PI / 3;
        var x = radius * Math.cos(angle) + x0;
        var y = radius * Math.sin(angle) + y0;
        return (i == 0 ? 'M' : 'L') + x + ' ' + y;
    }).join(' ') + 'Z')
        .addStyle({
            strokeWidth: borderWidth + ''
        });
    var skewX = 18 / 45;
    var textBoxHeight = textBound.height;
    this.$textBox.attr('d', [
        [x0, (cHeight - textBoxHeight) / 2],
        [cWidth - 1, (cHeight - textBoxHeight) / 2],
        [cWidth - 1 - textBoxHeight * skewX, (cHeight - textBoxHeight) / 2 + textBoxHeight],
        [x0, (cHeight - textBoxHeight) / 2 + textBoxHeight],
    ].map(function (point, i) {
        return (i == 0 ? 'M' : 'L') + point.join(' ')
    }).join(' ') + 'Z')
};

HexaSectionLabel.tag = 'HexaSectionLabel'.toLowerCase();

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
};


ACore.install(HexaSectionLabel);
export default HexaSectionLabel;
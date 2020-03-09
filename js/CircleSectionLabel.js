import Acore from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

var _g = Svg.ShareInstance._;
var $g = Svg.ShareInstance.$;


var Design = {
    circleHeight: 218 - 36,
    borderWidth: 36,
    textBoxHeight: 146,
    textHeight: 48,
    indextHeight: 54,
    textBoxPaddingLeft: 80,
    indexArrowRadius: (172 - 18) / 2,
    indexArrowStrokeWidth: 18,
    indexArrowStartAngle: - Math.PI / 6,
    indexArrowEndAngle: - 7 * Math.PI / 12
};

var StyleSheet = {
    '.as-circle-section-label-text': {
        height: Design.textBoxHeight / Design.textHeight + 'em',
        'padding-left': Design.textBoxPaddingLeft / Design.textHeight + 'em',
        'line-height': Design.textBoxHeight / Design.textHeight + 'em'
    },
    '.as-circle-section-label-index': {
        'font-size': Design.indextHeight / Design.textHeight + 'em',
        height: (Design.circleHeight + Design.borderWidth) / Design.indextHeight + 'em',
        'line-height': (Design.circleHeight + Design.borderWidth) / Design.indextHeight + 'em',
        width: (Design.circleHeight + Design.borderWidth) / Design.indextHeight + 'em'
    },

};

_({
    tag: 'style',
    id: 'circle-section-label-style',
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

function CircleSectionLabel() {
    this._ident = (Math.random() + '').replace(/[^0-9]/g, '_');
    this.$background = $('.as-circle-section-label-background', this);
    this.$index = $('.as-circle-section-label-index', this);
    this.$text = $('.as-circle-section-label-text', this);
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
            {
                tag: 'defs',
                child: [
                    {
                        tag: 'marker',
                        id: 'marker_' + this._ident,
                        attr: {
                            markerWidth: "4",
                            markerHeight: "4",
                            refX: "0",
                            refY: "1",
                            orient: "auto",
                            markerUnits: "strokeWidth",
                            viewBox:"0 0 4 4"
                        },
                        child: {
                            tag: 'path',
                            class: 'as-circle-section-label-arrow-marker-path',
                            attr:{
                                d: 'M0,0 L0,2 L2,1 z'
                            }
                        }
                    }
                ]
            },
            'rect.as-circle-section-label-text-box',
            'circle.as-circle-section-label-index-box',
            'path.as-circle-section-label-arrow'
        ]
    }).addTo(this.$background);
    this.$indexBox = $g('circle.as-circle-section-label-index-box', this.$svg);
    this.$textBox = $g('rect.as-circle-section-label-text-box', this.$svg);
    // this.$marker = $g('defs marker', this.$svg);
    // this.$markerPath = $g(' path', this.$marker);
    this.$arrow = $g('path.as-circle-section-label-arrow', this.$svg)
        .attr({
            'marker-end': "url(" + '#marker_' + this._ident + ")"
        });
};

CircleSectionLabel.prototype.redrawBackground = function () {
    var indexBound = this.$index.getBoundingClientRect();
    var textBound = this.$text.getBoundingClientRect();
    var cHeight = indexBound.height;
    var cWidth = textBound.right - indexBound.left;
    this.$svg.attr({
        height: cHeight + '',
        width: cWidth + '',
        viewBox: [0, 0, cWidth, cHeight].join(' ')
    });

    var borderWidth = cHeight * Design.borderWidth / (Design.circleHeight + Design.borderWidth);
    var radius = cHeight * Design.circleHeight / (Design.circleHeight + Design.borderWidth) / 2;
    var x0 = indexBound.width / 2;
    var y0 = cHeight / 2;


    this.$indexBox.attr({
        r: radius + '',
        cx: x0,
        cy: y0
    })
        .addStyle({
            strokeWidth: borderWidth + ''
        });
    var textBoxHeight = textBound.height;
    this.$textBox.attr(
        {
            x: x0 / 2,
            y: (cHeight - textBoxHeight) / 2,
            width: cWidth - x0 - 1,
            height: textBoxHeight,
            rx: textBoxHeight / 2,
            ry: textBoxHeight / 2
        }
    );
    var arrowRadius = cHeight * Design.indexArrowRadius / (Design.circleHeight + Design.borderWidth);
    this.$arrow.attr({
        d: [
            'M', x0 + arrowRadius * Math.cos(Design.indexArrowStartAngle), y0 + arrowRadius * Math.sin(Design.indexArrowStartAngle),
            'A', arrowRadius, arrowRadius, 0, 1, 1, x0 + arrowRadius * Math.cos(Design.indexArrowEndAngle), y0 + arrowRadius * Math.sin(Design.indexArrowEndAngle)
        ].join(' ')
    }).addStyle('stroke-width', cHeight * Design.indexArrowStrokeWidth / (Design.circleHeight + Design.borderWidth))
};

CircleSectionLabel.render = function () {
    return _({
        class: 'as-circle-section-label',
        child: [
            {
                class: 'as-circle-section-label-background'
            },
            '.as-circle-section-label-index',
            '.as-circle-section-label-text'
        ]
    });
};

CircleSectionLabel.property = {};
CircleSectionLabel.property.index = {
    set: function (value) {
        this._index = value;
        this.$index.clearChild().addChild(_({ text: value + '' }))
    },
    get: function () {
        return this._index;
    }
};

CircleSectionLabel.property.text = {
    set: function (value) {
        this._text = value;
        this.$text.clearChild().addChild(_({ text: value + '' }))
    },
    get: function () {
        return this._text;
    }
}


Acore.install('circlesectionlabel', CircleSectionLabel);
export default CircleSectionLabel;
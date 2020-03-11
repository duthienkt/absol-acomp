import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import Svg from "absol/src/HTML5/Svg";
import { buildCss } from "./utils";

var _ = Acore._;
var $ = Acore.$;


var _g = Svg.ShareInstance._;
var $g = Svg.ShareInstance.$;

var Design = {
    textHeight: 56,
    barHeight: 97,
    barBlockWidth: 79,
    barBlockMargin: 19,
    valueTextHeight: 70,
    valueStrokeWidth: 5,
    valueHeight: 99,
    valueWidth: 52,
    valueTripHeight: 32,
    height: 430,
    barY: 201
};

var SyleSheet = {
    '.as-linear-color-bar': {
        height: Design.height / Design.textHeight + 'em'
    },
    '.as-linear-color-value-text': {
        'font-size': Design.valueTextHeight / Design.textHeight + 'em'
    }
};


buildCss(SyleSheet);

function LinearColorBar() {
    this._indent = (Math.random() + '').replace(/[^0-9]/g, '_');
    this._extendValue = 0;
    this._value = 0;
    this._valueText = '';
    this.$valueText = $('.as-linear-color-value-text', this);
    this.$minValueText = $('.as-linear-color-min-value-text', this);
    this.$maxValueText = $('.as-linear-color-max-value-text', this);
    this.$background = $('svg.as-linear-color-background', this);
    this._attached = false;
    var thisBar = this;
    this.$attachhook = _('attachhook').addTo(this).on('error', function () {
        thisBar._attached = true;
        Dom.addToResizeSystem(this);
        this.requestUpdateSize();
    });

    this.$background.attr({
        height: 0,
        width: 0,
    });
    this.$attachhook.requestUpdateSize = this.redraw.bind(this);
    this.$defs = _g('defs').addTo(this.$background);

    this.$gradient = _g('linearGradient#gradient_' + this._indent)
        .attr({
            x1: "0%",
            y1: "0%",
            x2: "100%",
            y2: "0%"
        }).addTo(this.$defs);
    this.$rect = _g('rect.as-linear-color-bar-rect')
        .attr({
            fill: 'url(#gradient_' + this._indent + ')'
        })
        .addTo(this.$background);
    this.$splitLine = _g('path.as-linear-color-split-line').addTo(this.$background)
    this.$valueArrow = _g('path.as-linear-color-value-arrow').addTo(this.$background);

    this.colorMapping = 'rainbow';
}

LinearColorBar.prototype.redraw = function () {
    var bBound = this.getBoundingClientRect();
    var cWidth = bBound.width;
    var cHeight = bBound.height;
    var maxTextBound = this.$maxValueText.getBoundingClientRect();
    var minTextBound = this.$minValueText.getBoundingClientRect();
    var valueTextBound = this.$valueText.getBoundingClientRect();

    var valueWidth = Design.valueWidth / Design.height * cHeight;
    var minValueX = valueWidth / 1.5;
    this.$minValueText.addStyle('left', Math.max((minValueX - minTextBound.width) / 2, 0) + 'px');

    var maxValueX = (cWidth - Design.valueWidth) / (1 + this._extendValue);
    var extendX = cWidth - valueWidth / 1.5;
    var valueX = minValueX + this._value * (maxValueX - minValueX);
    this.$valueText.addStyle('left', valueX - valueTextBound.width / 2 + 'px');
    this.$maxValueText.addStyle('left', maxValueX - maxTextBound.width / 2 + 'px');
    var barY = Design.barY / Design.height * cHeight;
    var barHeight = Design.barHeight / Design.height * cHeight;
    this.$rect.attr({
        x: '' + minValueX,
        y: '' + barY,
        width: extendX - minValueX + '',
        height: barHeight
    });

    this.$background.attr({
        height: cHeight + '',
        width: cWidth + '',
        viewBox: [0, 0, cWidth, cHeight].join(' ')
    });

    var valueTripHeight = Design.valueTripHeight / Design.height * cHeight;
    var valueHeight = Design.valueHeight / Design.height * cHeight;
    this.$valueArrow
        .addStyle('stroke-width', Design.valueStrokeWidth / Design.height * cHeight + '')
        .attr('d', [
            [
                [valueX, barY],
                [valueX - valueWidth / 2, barY - valueTripHeight],
                [valueX - valueWidth / 2, barY - valueHeight],
                [valueX + valueWidth / 2, barY - valueHeight],
                [valueX + valueWidth / 2, barY - valueTripHeight]

            ]
        ].map(function (point, i) {
            return (i == 0 ? 'M' : 'L') + point.join(' ')
        }).join(' ') + 'Z');

    var splitDistMin = (Design.barBlockWidth + Design.barBlockMargin) / Design.height * cHeight;
    var splitCounts = [100, 50, 20, 10, 5, 2, 1];
    var splitDist = maxValueX - minValueX;
    var splitCount = 1;
    for (var i = 0; i < splitCounts.length; ++i) {
        splitDist = (maxValueX - minValueX) / splitCounts[i];
        if (splitDist >= splitDistMin) {
            splitCount =  splitCounts[i];
            break;
        }
    }

    this.$splitLine.addStyle('stroke-width', Design.barBlockMargin / Design.height * cHeight + '')
        .attr({
            d: Array(splitCount + 1).fill(0).map(function (u, i) {
                return 'M' + (maxValueX - i * splitDist) + ' ' + (barY - 1) + 'v' + (barHeight + 2);
            }).join(' ')
        })
};

LinearColorBar.prototype._updateGradient = function () {
    var barMax = 1 + this._extendValue;
    var gradientElt = this.$gradient.clearChild();
    this._colorMapping.forEach(function (it) {
        _g({
            tag: 'stop',
            attr: {
                offset: (it.value <= 1 ? it.value / barMax * 100 : 100) + '%'
            },
            style: {
                'stop-color': it.color + '',
                'stop-opacity': '1'
            }
        }).addTo(gradientElt);
    });
};


LinearColorBar.prototype.BUILDIN_COLORS_RANGE = {
    'rainbow': [
        { value: 0, color: 'red' },
        { value: 1 / 6, color: 'orange' },
        { value: 1 / 3, color: 'yellow' },
        { value: 1 / 2, color: 'green' },
        { value: 2 / 3, color: 'blue' },
        { value: 5 / 6, color: 'indigo' },
        { value: 1, color: 'violet' },
        { value: Infinity, color: 'violet' }
    ],
    'rainbow-invert': [
        { value: 0, color: 'violet' },
        { value: 1 / 6, color: 'indigo' },
        { value: 1 / 3, color: 'blue' },
        { value: 1 / 2, color: 'green' },
        { value: 2 / 3, color: 'yellow' },
        { value: 5 / 6, color: 'orange' },
        { value: 1, color: 'red' },
        { value: Infinity, color: 'violet' }
    ],
    'performance': [
        { value: 0, color: 'red' },
        { value: 0.5, color: 'orange' },
        { value: 1, color: 'green' },
        { value: Infinity, color: 'green' }
    ],
    'performance-invert': [
        { value: 0, color: 'green' },
        { value: 0.5, color: 'orange' },
        { value: 1, color: 'red' },
        { value: Infinity, color: 'red' }
    ]
}


LinearColorBar.render = function () {
    return _({
        class: 'as-linear-color-bar',
        child: [
            'svg.as-linear-color-background',
            '.as-linear-color-value-text',
            '.as-linear-color-min-value-text',
            '.as-linear-color-max-value-text'
        ]
    });
};

LinearColorBar.property = {};
LinearColorBar.property.valueText = {
    set: function (value) {
        value = value + '';
        this._valueText = value;
        this.$valueText.clearChild().addChild(_({ text: value }));
    },
    get: function () {
        return this._valueText;
    }
};


LinearColorBar.property.minValueText = {
    set: function (value) {
        value = value + '';
        this._minValueText = value;
        this.$minValueText.clearChild().addChild(_({ text: value }));
    },
    get: function () {
        return this._valueText;
    }
};

LinearColorBar.property.maxValueText = {
    set: function (value) {
        value = value + '';
        this._maxValueText = value;
        this.$maxValueText.clearChild().addChild(_({ text: value }));
    },
    get: function () {
        return this._valueText;
    }
};

LinearColorBar.property.value = {
    set: function (value) {
        this._value = value;
    },
    get: function () {
        return this._value;
    }
};

LinearColorBar.property.extendValue = {
    set: function (value) {
        this._extendValue = value;
        this._updateGradient();
    },
    get: function () {
        return this._extendValue;
    }
};


LinearColorBar.property.colorMapping = {
    set: function (value) {
        if (typeof (value) == "string") value = this.BUILDIN_COLORS_RANGE[value];
        this._colorMapping = value.slice();
        this._colorMapping.sort(function (a, b) {
            return a.value - b.value;
        })
        this._updateGradient();
    },
    get: function () {
        return this._colorMapping;
    }
};

Acore.install('linearcolorbar', LinearColorBar);
export default LinearColorBar;
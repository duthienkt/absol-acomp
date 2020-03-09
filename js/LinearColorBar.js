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
    valueTextHeight: 70,
    valueStrokWidth: 5,
    valueHeight: 89,
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
}


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
    this.$valueArrow = _g('path.as-linear-color-value-arrow').addTo(this.$background);
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
    this.colorMapping = 'rainbow';
}

LinearColorBar.prototype.redraw = function () {
    var bBound = this.getBoundingClientRect();
    var cWidth = bBound.width;
    var cHeight = bBound.height;
    var fontSize = this.getFontSize();
    var minTextBound = this.$minValueText.getBoundingClientRect();
    var maxTextBound = this.$maxValueText.getBoundingClientRect();

    var minValueX = minTextBound.width / 2;
    var maxValueX = Math.min(cWidth - maxTextBound.width / 2, minValueX + (cWidth - minValueX) / (1 + this._extendValue));
    this.$valueText.addStyle('left', minValueX + this._value * (maxValueX - minValueX) + 'px');
    this.$maxValueText.addStyle('left', maxValueX - maxTextBound.width / 2 + 'px');
    var barY = Design.barY / Design.height * cHeight;
    var barHeight = Design.barHeight / Design.height * cHeight;
    this.$rect.attr({
        x: '' + minValueX,
        y: '' + barY,
        width: maxValueX - minValueX + '',
        height: barHeight
    });

    this.$background.attr({
        height: cHeight + '',
        width: cWidth + '',
        viewBox: [0, 0, cWidth, cHeight].join(' ')
    });
};

LinearColorBar.prototype._updateGradient = function () {
    var gradientElt = this.$gradient.clearChild();
    this._colorMapping.forEach(function (it) {
        _g({
            tag: 'stop',
            attr: {
                offset: it.value * 100 + '%'
            },
            style: {
                'stop-color': it.color + '',
                'stop-opacity': '1'
            }
        }).addTo(gradientElt);
    });
};


LinearColorBar.prototype.BUILDIN_COLORS_RANGE = {
    'rainbow': [{ value: 0, color: 'red' }, { value: 1, color: 'blue' }],
    'rainbow-invert': [],
    'red-green': []
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


LinearColorBar.property.colorMapping = {
    set: function (value) {
        if (typeof (value) == "string") value = this.BUILDIN_COLORS_RANGE[value];
        this._colorMapping = value;
        this._updateGradient();
    },
    get: function () {
        return this._colorMapping;
    }
};

Acore.install('linearcolorbar', LinearColorBar);
export default LinearColorBar;
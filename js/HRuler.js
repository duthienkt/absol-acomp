import  '../css/hruler.css';
import Dom from "absol/src/HTML5/Dom";
import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;


function HRuler() {
    var self = this;
    this.$attachHook = _('attachhook').on('error', function () {
        this.updateSize = self.update.bind(self);
        Dom.addToResizeSystem(this);
        this.updateSize();
    }).addTo(self);

    this.$lines = [];
    this.$numbers = [];
    this._viewingNumberCount = 0;
    this._viewingLineCount = 0;
    this._spacing = 10;
    this._major = 10;
    this.$measureTarget = null;
    this._valueFloat = 'left';
}

HRuler.tag = 'hruler';

HRuler.render = function () {
    return _({
        class: 'as-hruler'
    });
};


HRuler.prototype.measureElement = function (elt) {
    if (typeof elt == "string") elt = $(elt);
    this.$measureTarget = elt;
    this.update();
};


HRuler.prototype.update = function () {
    var fontSize = this.getFontSize();
    var measureBound;
    var bound = this.getBoundingClientRect();

    var contentBound = {
        left: bound.left + 1,
        right: bound.right - 1,
        top: bound.top + 1,
        bottom: bound.bottom - 1,
        width: bound.width - 2,
        height: bound.height - 2
    };
    if (this.$measureTarget) {
        measureBound = this.$measureTarget.getBoundingClientRect();
    }
    else {
        measureBound = contentBound;
    }


    var startOfset = (measureBound[this._valueFloat] - contentBound[this._valueFloat]) * (this.inverse ? -1 : 1) % this._spacing;
    if (startOfset < 0) startOfset += this._spacing;


    var lineIndexOfset = Math.round(((contentBound[this._valueFloat] - measureBound[this._valueFloat]) * (this.inverse ? -1 : 1) + startOfset) / this._spacing);

    var lineCount = Math.floor((contentBound.width - startOfset) / this._spacing) + 1;

    while (this.$lines.length < lineCount) {
        this.$lines.push(_('.as-hruler-line'));
    }

    var i;
    var lineElt;
    for (i = 0; i < lineCount; ++i) {
        lineElt = this.$lines[i];
        if ((i + lineIndexOfset) % this._major == 0) {
            lineElt.addClass('major');
        }
        else {
            lineElt.removeClass('major');
        }
        lineElt.addStyle(this._valueFloat, startOfset + this._spacing * i - 0.5 + 'px');
    }

    while (this._viewingLineCount < lineCount) {
        this.$lines[this._viewingLineCount++].addTo(this);
    }

    while (this._viewingLineCount > lineCount) {
        this.$lines[--this._viewingLineCount].remove();
    }

    var numberCount = Math.floor((lineCount + lineIndexOfset - 1) / this._major) - Math.ceil(lineIndexOfset / this._major) + 1;

    while (this.$numbers.length < numberCount) {
        this.$numbers.push(_('.as-hruler-major-number'));
    }
    var numberElt;
    var number;
    var majorStartOfset = startOfset;
    if (lineIndexOfset > 0) {
        majorStartOfset += (this._major - lineIndexOfset % this._spacing) * this._spacing;
    }
    else {
        majorStartOfset += (this._major - (this._spacing + lineIndexOfset % this._spacing)) * this._spacing;

    }


    for (i = 0; i < numberCount; ++i) {
        number = (Math.ceil(lineIndexOfset / this._major) + i) * this._spacing * this._major;
        numberElt = this.$numbers[i];
        if (numberElt.__cacheNumber__ != number) {
            numberElt.__cacheNumber__ = number;
            numberElt.innerHTML = number + '';
        }
        numberElt.addStyle(this._valueFloat, majorStartOfset + this._major * i * this._spacing - 0.7 * 2.5 * fontSize + 'px')
    }

    while (this._viewingNumberCount < numberCount) {
        this.$numbers[this._viewingNumberCount++].addTo(this);
    }

    while (this._viewingNumberCount > numberCount) {
        this.$numbers[--this._viewingNumberCount].remove();
    }
};


HRuler.property = {};
HRuler.property.major = {
    set: function (value) {
        if (value > 0) {
            this._major = value;
            this.update();
        }
    },
    get: function () {
        return this._major;
    }
};

HRuler.property.spacing = {
    set: function (value) {
        if (value > 0) {
            this._spacing = value;
            this.update();
        }
    },
    get: function () {
        return this._spacing;
    }
};

HRuler.property.inverse = {
    set: function (value) {
        this._valueFloat = value ? 'right' : 'left';
        this.update();
    },
    get: function () {
        return this._valueFloat == 'right';
    }
};

ACore.install(HRuler);

export default HRuler;
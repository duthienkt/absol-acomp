import '../css/hruler.css';
import Dom from "absol/src/HTML5/Dom";
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import noop from "absol/src/Code/noop";
import { revokeResource } from "absol/src/DataStructure/Object";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function HRuler() {
    this.$attachHook = _('attachhook').on('attached', () => {
        this.requestUpdateSize = this.update.bind(this);
        ResizeSystem.add(this.$attachHook);
        this.requestUpdateSize();
    }).addTo(this);
    this.$attachHook.requestRevokeResource = this.revokeResource.bind(this);

    this.$lines = [];
    this.$numbers = [];
    this._viewingNumberCount = 0;
    this._viewingLineCount = 0;
    this._spacing = 10;
    this._major = 10;
    this.$measureTarget = null;
    this._valueFloat = 'left';

    /**
     * @type {number}
     * @name major
     * @memberof HRuler#
     */
    /**
     * @type {number}
     * @name spacing
     * @memberof HRuler#
     */

    /**
     * @type {boolean}
     * @name inverse
     * @memberof HRuler#
     */
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
    if (!bound.width || !bound.height) return;

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


    var startOffset = (measureBound[this._valueFloat] - contentBound[this._valueFloat]) * (this.inverse ? -1 : 1) % this._spacing;
    if (startOffset < 0) startOffset += this._spacing;


    var lineIndexOffset = Math.round(((contentBound[this._valueFloat] - measureBound[this._valueFloat]) * (this.inverse ? -1 : 1) + startOffset) / this._spacing);

    var lineCount = Math.floor((contentBound.width - startOffset) / this._spacing) + 1;
    lineCount = Math.max(0, lineCount);

    while (this.$lines.length < lineCount) {
        this.$lines.push(_('.as-hruler-line'));
    }

    var i;
    var lineElt;
    for (i = 0; i < lineCount; ++i) {
        lineElt = this.$lines[i];
        if ((i + lineIndexOffset) % this._major === 0) {
            lineElt.addClass('major');
        }
        else {
            lineElt.removeClass('major');
        }
        lineElt.addStyle(this._valueFloat, startOffset + this._spacing * i - 0.5 + 'px');
    }

    while (this._viewingLineCount < lineCount) {
        this.$lines[this._viewingLineCount++].addTo(this);
    }

    while (this._viewingLineCount > lineCount) {
        this.$lines[--this._viewingLineCount].remove();
    }

    var numberCount = Math.floor((lineCount + lineIndexOffset - 1) / this._major) - Math.ceil(lineIndexOffset / this._major) + 1;

    while (this.$numbers.length < numberCount) {
        this.$numbers.push(_('.as-hruler-major-number'));
    }
    var numberElt;
    var number;
    var majorStartOfset = startOffset;
    if (lineIndexOffset > 0) {
        majorStartOfset += (this._major - lineIndexOffset % this._spacing) * this._spacing;
    }
    else {
        majorStartOfset += (this._major - (this._spacing + lineIndexOffset % this._spacing)) * this._spacing;

    }


    for (i = 0; i < numberCount; ++i) {
        number = (Math.ceil(lineIndexOffset / this._major) + i) * this._spacing * this._major;
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

HRuler.prototype.revokeResource = function () {
  this.$attachHook.cancelWaiting();
  this.$measureTarget = null;
  revokeResource(this.$lines);
  revokeResource(this.$numbers);
  this.clearChild();
  this.revokeResource = noop;
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
        return this._valueFloat === 'right';
    }
};

ACore.install(HRuler);

export default HRuler;
import  '../css/vruler.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import { revokeResource } from "./utils";
import noop from "absol/src/Code/noop";


var _ = ACore._;
var $ = ACore.$;

/**
 * @extends AElement
 * @constructor
 */
function VRuler() {
    var self = this;
    this.$attachHook = _('attachhook').on('error', function () {
        this.updateSize = self.update.bind(self);
        Dom.addToResizeSystem(this);
        this.updateSize();
    }).addTo(this);

    this.$lines = [];
    this.$numbers = [];
    this.$measureTarget = undefined;
    this._viewingNumberCount = 0;
    this._viewingLineCount = 0;
    this._spacing = 10;
    this._major = 10;
    this._valueFloat = 'top';

    /**
     * @type {number}
     * @name major
     * @memberof VRuler#
     */
    /**
     * @type {number}
     * @name spacing
     * @memberof VRuler#
     */

    /**
     * @type {boolean}
     * @name inverse
     * @memberof VRuler#
     */
}

VRuler.tag = 'vruler';

VRuler.render = function () {
    return _({
        class: 'as-vruler'
    });
};

VRuler.prototype.revokeResource = function () {
    this.$measureTarget = null;
    this.$attachHook.cancelWaiting();
    revokeResource(this.$lines);
    revokeResource(this.$numbers);
    this.clearChild();
    this.revokeResource = noop;
}

VRuler.prototype.measureElement = function (elt) {
    if (typeof elt == "string") elt = $(elt);
    this.$measureTarget = elt;
    this.update();
};


VRuler.prototype.update = function () {
    var fontSize = this.getFontSize() || 14;
    var measureBound;
    var bound = this.getBoundingClientRect();
    if (!bound.width ||!bound.height) return;
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

    var lineCount = Math.floor((contentBound.height - startOffset) / this._spacing) + 1;

    while (this.$lines.length < lineCount) {
        this.$lines.push(_('.as-vruler-line'));
    }
    var i;
    var lineElt;
    for (i = 0; i < lineCount; ++i) {
        lineElt = this.$lines[i];
        if ((i + lineIndexOffset) % this._major == 0) {
            lineElt.addClass('major');
        }
        else {
            lineElt.removeClass('major');
        }
        lineElt.addStyle(this._valueFloat, startOffset + this._spacing * i - 0.5 + 'px');
    }
    try {
        while (this._viewingLineCount < lineCount) {
            this.$lines[this._viewingLineCount++].addTo(this);
        }

        while (this._viewingLineCount > lineCount) {
            this.$lines[--this._viewingLineCount].remove();
        }
    } catch (e) {

    }


    var numberCount = Math.floor((lineCount + lineIndexOffset - 1) / this._major) - Math.ceil(lineIndexOffset / this._major) + 1;

    while (this.$numbers.length < numberCount) {
        this.$numbers.push(_('.as-vruler-major-number'));
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
        numberElt.addStyle(this._valueFloat, majorStartOfset + this._major * i * this._spacing - 0.7 * 0.5 * fontSize + 'px')
    }

    while (this._viewingNumberCount < numberCount) {
        this.$numbers[this._viewingNumberCount++].addTo(this);
    }

    try {
        while (this._viewingNumberCount > numberCount) {
            this.$numbers[--this._viewingNumberCount].remove();
        }
    } catch (e) {
    }

};


VRuler.property = {};
VRuler.property.major = {
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

VRuler.property.spacing = {
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


VRuler.property.inverse = {
    set: function (value) {
        this._valueFloat = value ? 'bottom' : 'top';
        this.update();
    },
    get: function () {
        return this._valueFloat === 'bottom';
    }
};

ACore.install(VRuler);

export default VRuler;
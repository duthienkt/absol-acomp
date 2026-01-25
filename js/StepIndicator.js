import ACore from "../ACore";
import '../css/stepindicator.css';
import { isRealNumber } from "absol/src/Converter/DataTypes";

var _ = ACore._;
var $ = ACore.$;

/**
 * StepIndicator component
 * @extends AElement
 * @constructor
 */
function StepIndicator() {
    this.$itemsCtn = $('.as-step-indicator-items-ctn', this);
    this.$items = [];
    this._idx = -1;
    /**
     * Number of steps in the StepIndicator.
     * @type {number}
     * @this StepIndicator
     */
    this.length = 0;
    /**
     * Current step index (starts from 0, -1 if none selected).
     * @type {number}
     * @this StepIndicator
     */
    this.idx = -1;
    /**
     * List of labels for each step (each item is a string or object).
     * @type {Array<string|Object>}
     * @this StepIndicator
     */
    this.labels = [];
}

StepIndicator.tag = 'StepIndicator'.toLowerCase();

StepIndicator.render = function () {
    return _({
        class: 'as-step-indicator',
        child: [
            {
                class:'as-step-indicator-line'
            },
            {
                class: 'as-step-indicator-items-ctn'
            }
        ]
    });
};

StepIndicator.property = {};

StepIndicator.property.length = {
    /**
     * @this StepIndicator
     * @param value
     */
    set: function (value) {
        value = value || 0;
        value = Math.floor(Math.max(1, value));

        while (this.$items.length > value) {
            this.$items.pop().remove();
        }
        var itemElt;
        while ( this.$items.length < value) {
            itemElt = _({
                tag: 'div',
                class: 'as-step-indicator-item',
                child: [
                    { tag: 'span', class: 'as-step-indicator-circle', child: [] },
                    { tag: 'span', class: 'as-step-indicator-label', child: [] }
                ]
            })
            this.$items.push(itemElt);
            this.$itemsCtn.addChild(itemElt);
        }
        this._updateLabels();
        this._updateIdx();
    },
    get: function () {
        return this.$items.length;
    }
};


StepIndicator.property.idx = {
    /**
     * @this StepIndicator
     */
    set: function (value) {
        if (!isRealNumber(value)) value = -1;
        value = Math.floor(value);
        this._idx = value;
        this._updateIdx();

    },
    /**
     * @this StepIndicator
     */
    get: function () {
        return Math.max(-1, Math.min(this._idx, this.length));
    }
};

StepIndicator.property.labels = {
    /**
     * @this StepIndicator
     */
    set: function (labels) {
        labels = Array.isArray(labels) ? labels : [];
        if (labels && labels.length > 0) {
            this.length = labels.length;
        }
        this._labels = labels;
        this._updateLabels();
        this._updateIdx();
    },
    /**
     * @this StepIndicator
     */
    get: function () {
        return this._labels || null;//default
    }
};

StepIndicator.prototype._updateLabels = function () {
    var labels = this._labels || [];
    var itemElt,labelElt, circleElt;
    var label;
    for (var i = 0; i < this.$items.length; ++i) {
        itemElt = this.$items[i];
        label = labels[i];
        if (typeof label === 'number') label = { text: label+'' };
        else if ((typeof label === 'string')) {
            if (label.length === 0) {
                label = { text: (i + 1) + '' };
            }
            else if (label.trim().length === 0) {
                label = { text: '' };
            }
            else {
                label = label.trim();
                if (label.length === 1) {
                    label = { text: label };
                }
            }
        }
        else if (!label) {
            label = { text: (i + 1) + '' };
        }
        labelElt = itemElt.$label || (itemElt.$label = $(".as-step-indicator-label", itemElt));
        labelElt.clearChild().addChild(_(label));
        circleElt = itemElt.$circle || (itemElt.$circle = $(".as-step-indicator-circle", itemElt));
    }
};

StepIndicator.prototype._updateIdx = function () {
    var idx = this.idx;
    var percent = idx/ (this.length - 1) * 100;
    if (isRealNumber(percent)) {
        percent = Math.max(0, Math.min(100, percent));
    }
    else {
        percent = 0;
    }
    this.addStyle('--percent-value', percent + '%');
    var itemElt;
    for (var i = 0; i < this.$items.length; ++i) {
        itemElt = this.$items[i];
        if (i === idx) {
            itemElt.addClass('as-active');
        }
        else {
            itemElt.removeClass('as-active');
        }
        if (i < idx) {
            itemElt.addClass('as-passed');
        }
        else {
            itemElt.removeClass('as-passed');
        }
    }
}


ACore.install(StepIndicator);

export default StepIndicator;

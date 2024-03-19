import '../css/progressbar.css';
import ACore, { $$ } from "../ACore";

var _ = ACore._;
var $ = ACore.$;


function ProgressCircle() {
    this._text = 'Loading\n$value';
    this._value = 0;
    this._variant = null;
    this._viewValue = 0;
    this.$pie = $('.as-progress-circle-pie', this);
    this.$inner = $('.as-progress-circle-inner', this);
    this.$end = $('.as-progress-circle-end', this);
    this.$text = $('.as-progress-circle-text', this);
    this._animated = true;
}

ProgressCircle.tag = 'ProgressCircle'.toLowerCase();
ProgressCircle.render = function () {
    return _({
        class: 'as-progress-circle',
        child: [

            '.as-progress-circle-start',
            '.as-progress-circle-pie',
            '.as-progress-circle-end',
            {
                class: 'as-progress-circle-inner',
                child: { class: 'as-progress-circle-text', child: { text: '' } }
            }
        ]
        // child: {
        //     class: 'as-progress-bar-value'
        // }
    });
};


ProgressCircle.property = {};

ProgressCircle.prototype._updateValue = function () {
    if (Math.abs(this._value - this._viewValue) < 0.05 || !this._animated) this._viewValue = this._value;
    else {
        if (this._value > this._viewValue) this._viewValue += 0.05;
        else this._viewValue -= 0.05;
    }
    var value = this._viewValue;
    var angle = Math.PI * (-0.5 + value * 2);
    var cosAngle = Math.cos(angle);
    var sinAngle = Math.sin(angle);
    var pl = 'polygon(50% 0%, 100% 0%, ';
    if (value >= 0.25) pl += '100% 100%, ';
    if (value >= 0.5) pl += '0% 100%, ';
    if (value >= 0.75) pl += '0% 0%, ';
    pl += `${50 + 50 * cosAngle}% ${50 + 50 * sinAngle}%`;
    pl += ', 50% 50%)';
    this.$pie.addStyle('clipPath', pl);
    this.$end.addStyle({
        left: `calc(${50 + 50 * cosAngle}% - ${(cosAngle + 1) * 0.8/2}em)`,
        top: `calc(${50 + 50 * sinAngle}% - ${(sinAngle + 1) * 0.8/2}em)`
    });

    if (this._value !== this._viewValue) {
        requestAnimationFrame(() => this._updateValue());
    }
}

ProgressCircle.prototype._updateText = function () {
    var value = this._value;
    var text = this._text;
    text = text.replace('$value', Math.round(value * 100) + '%');
    this.$text.firstChild.data = text;
};


/**
 * @type {ProgressCircle}
 */
ProgressCircle.property.variant = {
    set: function (value) {
        if (this._variant) {
            this.removeClass('as-variant-' + this._variant);
        }
        if (value) {
            this.addClass('as-variant-' + value)
        }
        else {
            value = null;
        }
        this._variant = value;
    },
    get: function () {
        return this._variant;
    }
};

ProgressCircle.property.value = {

    /**
     * @this ProgressCircle
     * @param value
     */
    set: function (value) {
        value = Math.max(0, Math.min(1, value || 0));
        this._value = value;
        this._updateValue();
        this._updateText();

    },
    get: function () {
        return this._value;
    }
};


ProgressCircle.property.text = {
    set: function (value) {
        value = value || '';
        if (typeof value !== "string") value = '';
        this._text = value;
        this._updateText();
    },
    get: function () {
        return this._text;
    }
}


ProgressCircle.property.animated = {
    set: function (value) {
        value = !!value;
        this._animated = value;
        if (value) {
            this.addClass('as-animated');
        }
        else {
            this.removeClass('as-animated');
        }
    },
    get: function () {
        return this._animated;
    }
}



ACore.install(ProgressCircle);


export default ProgressCircle;
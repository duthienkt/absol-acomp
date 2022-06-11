import '../css/trackbar.css';
import ACore from "../ACore";
import Hanger from "./Hanger";
import { map } from "absol/src/Math/int";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends Hanger
 * @constructor
 */
function TrackBar() {
    this.$bar = $('.absol-trackbar', this);
    this.$button = $('.absol-trackbar-button', this);
    this.$line = $('.absol-trackbar-line', this);
    this.on('predrag', this.eventHandler.predrag)
        .on('drag', this.eventHandler.drag);
    this.leftValue = 0;
    this.rightValue = 1;
    this._dragValue = 0;
}

TrackBar.tag = 'trackbar';

TrackBar.render = function () {
    return _({
        tag: 'hanger',
        extendEvent: 'change',
        class: 'absol-trackbar',
        child: [{ class: 'absol-trackbar-line', child: '.absol-trackbar-button' }, 'attachhook'],

    });
};

TrackBar.prototype._updateValue = function () {
    var left = map(this.value, this.leftValue, this.rightValue, 0, 100);
    this.$button.addStyle('left', left + '%');
}

TrackBar.eventHandler = {};

TrackBar.eventHandler.predrag = function (event) {
    if (event.target === this || this.readOnly) {
        event.cancel();
    }
    else {
        event.preventDefault();
        var lineBound = this.$line.getBoundingClientRect();
        var newValue = this.leftValue + (this.rightValue - this.leftValue) * (event.clientX - lineBound.left) / lineBound.width;
        newValue = Math.max(this.leftValue, Math.min(this.rightValue, newValue));
        if (newValue !== this.value) {
            this.value = newValue;
            event.trackbarValue = this.value;
            this._dragValue = this.value;
            this.emit('change', event);
        }
    }
};

TrackBar.eventHandler.drag = function (event) {
    var lineWidth = this.$line.getBoundingClientRect().width;
    var d = event.currentPoint.sub(event.startingPoint);
    var delta = d.x / lineWidth * (this.rightValue - this.leftValue);
    var newValue = Math.max(this.leftValue, Math.min(this.rightValue, this._dragValue + delta));
    if (newValue != this.value) {
        this.value = newValue;
        event.trackbarValue = this.value;
        this.emit('change', event);
    }
};


TrackBar.property = {};

TrackBar.property.value = {
    set: function (value) {
        value = parseFloat(value + '');
        if (isNaN(value)) value = 0;
        this._value = value;
        this._updateValue();
    },

    get: function () {
        return Math.max(this.leftValue, Math.min(this.rightValue, this._value));
    }
};


TrackBar.property.leftValue = {
    set: function (value) {
        value = parseFloat(value + '');
        if (isNaN(value)) value = 0;
        this._leftValue = value;
        this._updateValue();
    },
    get: function () {
        return this._leftValue || 0;
    }
};

TrackBar.property.rightValue = {
    set: function (value) {
        value = parseFloat(value + '');
        if (isNaN(value)) value = 1;
        this._rightValue = value;
        this._updateValue();
    },
    get: function () {
        return this._rightValue || 1;
    }
};

TrackBar.property.disabled = {
    get: function () {
        return this.hasClass('as-disabled');
    },
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    }
};

TrackBar.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};

ACore.install(TrackBar);

export default TrackBar;


import '../css/trackbarinput.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;

/***
 *
 * @extends {AElement}
 * @constructor
 */
function TrackBarInput() {
    var thisTI = this;
    this.$trackbarContainer = $('.absol-trackbar-input-trackbar-container', this)
    this.$inputContainer = $('.absol-trackbar-input-unit-input-container', this)
    this.$trackbar = $('trackbar', this);
    this.$input = $('flexiconinput', this);

    absol.OOP.drillProperty(this, this.$input, ['unit', 'icon']);


    this.$trackbar.on('change', function () {
        thisTI.$input.value = thisTI.value + '';
        thisTI.emit('change', thisTI.value);
    });

    this.$input.on('keyup', this.eventHandler.inputChange);
    this.inputTextWidth = 2;
    this.valueFixed = undefined;
    return this;
}


TrackBarInput.tag = 'TrackBarInput'.toLowerCase();

TrackBarInput.render = function () {
    return _({
        class: 'absol-trackbar-input',
        extendEvent: 'change',
        child: [{
            class: 'absol-trackbar-input-trackbar-container',
            child: 'trackbar'
        },
            {
                class: 'absol-trackbar-input-unit-input-container',
                child: 'flexiconinput'
            }
        ]
    });
};

TrackBarInput.prototype.init = function (props) {
    props = props || {};
    props.leftValue = props.leftValue || 0;
    props.value = props.value || props.leftValue;
    Object.assign(this, props);
    this.value = props.value;
};

TrackBarInput.prototype._calInputTextWidth = function () {
    var l = Math.max(this.leftValue.toFixed(this.valueFixed || 0).length, this.rightValue.toFixed(this.valueFixed || 0).length, 2);
    if (this.valueFixed > 0) {
        l -= 0.8;
    }
    this.inputTextWidth = l;
};

// absol.OOP.drillProperty(this, this.$trackbar, ['leftValue', 'rightValue']);


TrackBarInput.property = {};

TrackBarInput.property.leftValue = {
    set: function (value) {
        this.$trackbar.leftValue = value;
        this._calInputTextWidth();
    },
    get: function () {
        return this.$trackbar.leftValue;
    }
};

TrackBarInput.property.rightValue = {
    set: function (value) {
        this.$trackbar.rightValue = value;
        this._calInputTextWidth();
    },
    get: function () {
        return this.$trackbar.rightValue;
    }
};


TrackBarInput.property.value = {
    set: function (value) {
        this.$trackbar.value = value || 0;
        this.$input.value = this.value + '';
    },
    get: function () {
        return parseFloat((this.valueFixed === undefined ? this.$trackbar.value : this.$trackbar.value.toFixed(this.valueFixed)) + '');
    }
};

TrackBarInput.property.valueFixed = {
    set: function (value) {
        if (value === undefined || value === null) value = undefined;
        this._valueFixed = value;
        this.$input.value = this.value + '';
        this._calInputTextWidth();
    },
    get: function () {
        return this._valueFixed;
    }
};

TrackBarInput.property.inputTextWidth = {
    set: function (value) {
        if (typeof value == 'number') {
            this._inputTextWidth = value;
            this.$inputContainer.addStyle('width', 3 + (value - 2) * 0.42 + 0.3 + 'em');
            this.$trackbarContainer.addStyle('right', 3.5 + (value - 2) * 0.42 + 0.3 + 'em');
        }
        else {
            this._inputTextWidth = value;
            this.$inputContainer.addStyle('width', value);
            this.$trackbarContainer.addStyle('right', value);
        }
    },
    get: function () {
        return this._inputTextWidth;
    }
};

TrackBarInput.property.disabled = {
    get: function () {
        return this.containsClass('as-disabled');
    },
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
        this.$input.disabled = !!value;
        this.$trackbar.disabled = !!value;
    }
};

TrackBarInput.eventHandler = {};


TrackBarInput.eventHandler.inputChange = function (event) {
    var newValue = parseFloat(this.$input.value);
    if (!isNaN(newValue)) {
        newValue = Math.max(this.leftValue, Math.min(this.rightValue, newValue));
        this.$trackbar.value = newValue;
        this.emit('change', this.value);
    }
};

export default TrackBarInput;
import '../css/trackbarinput.css';
import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;

function TrackBarInput() {
    var thisTI = this;
    this.$trackbarContainer = $('.absol-trackbar-input-trackbar-container', this)
    this.$inputContainer = $('.absol-trackbar-input-unit-input-container', this)
    this.$trackbar = $('trackbar', this);
    this.$input = $('flexiconinput', this);

    absol.OOP.drillProperty(this, this.$input, ['unit', 'icon']);
    absol.OOP.drillProperty(this, this.$trackbar, ['leftValue', 'rightValue']);

    this.$trackbar.on('change', function () {
        thisTI.$input.value = thisTI.value + '';
        thisTI.emit('change', thisTI.value);
    });

    this.$input.on('keyup', this.eventHandler.inputChange);
    this.inputTextWidth = 2;
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
TrackBarInput.property = {};

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
    },
    get: function () {
        return this._valueFixed;
    }
};

TrackBarInput.property.inputTextWidth = {
    set: function (value) {
        if (typeof value == 'number') {
            this._inputTextWidth = value;
            this.$inputContainer.addStyle('width', 3 + (value - 2) * 0.69 + 'em');
            this.$trackbarContainer.addStyle('right', 3.5 + (value - 2) * 0.69 + 'em');
        }
    },
    get: function () {
        return this._inputTextWidth;
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
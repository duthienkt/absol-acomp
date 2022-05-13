import '../css/flexiconinput.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function FlexiconInput() {
    this.$input = $('.as-flexicon-input-text-input', this);
    this.$iconCtn = $('.as-flexicon-input-icon-ctn', this);
    this.$unitCtn = $('.as-flexicon-input-unit-ctn', this);
    OOP.drillProperty(this, this.$input, ['value', 'readonly']);
    this.on('click', function (event) {
        if (event.target != this.$input)
            this.$input.focus();
    }.bind(this));
}

FlexiconInput.prototype.on = function () {
    return this.$input.on.apply(this.$input, arguments);
};

FlexiconInput.prototype.once = function () {
    return this.$input.once.apply(this.$input, arguments);
};

FlexiconInput.prototype.off = function () {
    return this.$input.off.apply(this.$input, arguments);
};

FlexiconInput.tag = 'FlexiconInput'.toLowerCase();
FlexiconInput.render = function () {
    return _({
        class: 'as-flexicon-input',
        child: [
            {
                class: 'as-flexicon-input-icon-ctn'
            },
            {
                tag: 'input',
                class: 'as-flexicon-input-text-input',
                attr: { type: 'text' },

            },
            {
                class: 'as-flexicon-input-unit-ctn'
            }
        ]
    });
};


FlexiconInput.property = {};

FlexiconInput.property.icon = {
    set: function (value) {
        value = value || null;
        this._icon = value;
        this.$iconCtn.clearChild();
        if (value == null) {
            this.removeClass('as-flexicon-input-has-icon');
        }
        else {
            this.addClass('as-flexicon-input-has-icon');
            this.$iconCtn.addChild(_(value));
        }
    },
    get: function () {
        return this._icon;
    }
};

FlexiconInput.property.unit = {
    set: function (value) {
        this._unit = value;
        if (this._unit) {
            this.addClass('as-flexicon-input-has-unit');
            this.$unitCtn.clearChild().addChild(_({ text: value + '' }));
        }
        else {
            this.removeClass('as-flexicon-input-has-unit');
            this.$unitCtn.clearChild();
        }
    },
    get: function () {
        return this._unit;
    }
};

FlexiconInput.property.disabled = {
    set: function (value) {
        value = !!value;
        this.$input.disabled = value;
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.$input.disabled;
    }
};

FlexiconInput.property.readOnly = {
    set: function (value) {
        value = !!value;
        this.$input.readOnly = value;
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

ACore.install(FlexiconInput);

export default FlexiconInput;
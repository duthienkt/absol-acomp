import '../css/radio.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import RadioButton from "./RadioButton";
import Svg from "absol/src/HTML5/Svg";
import AElement from "absol/src/HTML5/AElement";


var _ = ACore._;
var $ = ACore.$;
var $$ = ACore.$$;
var _svg = Svg.ShareInstance._;

/***
 * @extends AElement
 * @constructor
 */
function Radio() {
    var thisR = this;
    this.defineEvent('change');
    this.$input = $('input', this)
        .on('change', this.notifyChange.bind(this));
    this.$labels = $$('span', this);

    OOP.drillProperty(this, this.$input, ['value', 'checked']);
}

Radio.tag = 'radio';

Radio.radioProto = _(
    '<svg class="absol-radio-icon" width="20" height="20" version="1.1" viewBox="0 0 5.2917 5.2917"' +
    '   xmlns="http://www.w3.org/2000/svg">' +
    '    <g transform="translate(0 -291.71)">' +
    '        <circle class="bound" cx="2.6458" cy="294.35" r="2.4626" style="stroke-opacity:.99497;stroke-width:.26458;" />' +
    '        <circle class="dot" cx="2.6458" cy="294.35"  r= "0.92604" style="fill-rule:evenodd;" />' +
    '    </g>' +
    '</svg>'
)

Radio.render = function () {
    return _({
        tag: 'label',
        class: 'absol-radio',
        child: [
            { tag: 'input', attr: { type: 'radio' } },
            { tag: 'span' },
            Radio.radioProto.cloneNode(true),
            { tag: 'span'}
        ]
    });
};


Radio.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', checked: this.checked, target: this }, this);
};


Radio.prototype.getAllFriend = function () {
    return Radio.getAllByName(this.name);
};


Radio.prototype.attribute = RadioButton;

Radio.property = {
    name: {
        set: function (name) {
            this.$input.setAttribute('name', name);

        },
        get: function () {
            return this.$input.getAttribute('name');
        }
    },
    text: {
        set: function (value) {
            value = (value || '').trim();
            this.$labels[0].clearChild();
            this.$labels[1].clearChild();

            if (value) {
                this.$labels[0].addChild(_({text: value}));
                this.$labels[1].addChild(_({text: value}));
            }

        },
        get: function () {
            return this.$labels[0].firstChild.data;
        }
    },
    disabled: {
        set: function (value) {
            this.$input.disabled = !!value;
            if (value) {
                this.addClass('disabled');
            }
            else {
                this.removeClass('disabled');
            }
        },
        get: function () {
            return this.$input.disabled;
        }
    }
};

Radio.getAllByName = function (name) {
    return (Array.apply(null, document.getElementsByTagName('input')) || []).filter(function (elt) {
        return elt.getAttribute('type') == 'radio' && elt.getAttribute('name') == name;
    });
};

Radio.getValueByName = function (name) {
    var inputs = Radio.getAllByName(name);
    var res = null;
    var input;
    for (var i = 0; i < inputs.length; ++i) {
        input = inputs[i];
        if (input.checked) {
            res = input.value;
        }
    }
    return res;
};


ACore.install(Radio);

export default Radio;
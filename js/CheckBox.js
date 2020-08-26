import '../css/checkbox.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import CheckboxInput from "./CheckBoxInput";
import OOP from "absol/src/HTML5/OOP";

var _ = ACore._;
var $ = ACore.$;
var $$ = ACore.$$;


/***
 * @extends AElement
 * @constructor
 */
function CheckBox() {
    this.defineEvent('change');
    /***
     *
     * @type {CheckboxInput}
     */
    this.$input = $('checkboxinput', this).on('change',
        this.notifyChange.bind(this)
    );
    this.$labels = $$('span', this);
    OOP.drillProperty(this, this.$input, ['checked', 'disabled'])
}

CheckBox.tag = 'checkbox';

CheckBox.render = function () {
    return _({
        class: ['absol-checkbox'],
        child: [
            {
                tag: 'span',
                class: 'absol-checkbox-label',
                child: { text: '' }
            },
            'checkboxinput',
            {
                tag: 'span',
                class: 'absol-checkbox-label',
                child: { text: '' }
            }
        ]
    });
};


CheckBox.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', checked: this.checked, target: this }, this);
};
//v, labelText, checked

CheckBox.attribute = {
    checked: {
        set: function (value) {
            if (value === 'false' || value == null) {
                this.checked = false;
            }
            else {
                this.checked = true;
            }

        },
        get: function () {
            return this.checked ? 'true' : 'false'
        },
        remove: function () {
            this.checked = false;
        }
    },
    disabled: {
        set: function (value) {
            console.log(value)
            if (value === 'false' || value === null) {
                this.disabled = false;
            }
            else {
                this.disabled = true;
            }

        },
        get: function () {
            return this.disabled ? 'true' : 'false'
        },
        remove: function () {
            this.disabled = false;
        }
    }
};


CheckBox.property = {};
CheckBox.property.text = {
    get: function () {

    },
    set: function (value) {
        value = value || '';
        this._value = value;
        this.$labels[0].firstChild.data = value;
        this.$labels[1].firstChild.data = value;
    }
}

ACore.install(CheckBox);
export default CheckBox;
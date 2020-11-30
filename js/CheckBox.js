import '../css/checkbox.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import CheckboxInput from "./CheckBoxInput";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";

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
    this.on('click', this.eventHandler.click);
    OOP.drillProperty(this, this.$input, ['checked'])
}

CheckBox.tag = 'checkbox';

CheckBox.render = function () {
    return _({
        class: ['absol-checkbox','as-no-label'],
        child: [
            {
                tag: 'span',
                class: ['absol-checkbox-label', 'as-left'],
                child: { text: '' }
            },
            'checkboxinput',
            {
                tag: 'span',
                class: ['absol-checkbox-label', 'as-right'],
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
        return  this._text;
    },
    set: function (value) {
        value = value || '';
        if (value.length === 0){
            this.addClass('as-no-label');
        }
        else{
            this.removeClass('as-no-label');
        }
        this._text = value;
        this.$labels[0].firstChild.data = value;
        this.$labels[1].firstChild.data = value;
    }
};


CheckBox.property.disabled = {
    get: function (){
        return    this.$input.disabled;
    },
    set: function (value){
        value = !!value;
        this.$input.disabled = value;
        if (value){
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    }
};



/***
 *
 * @type {{}|CheckBox}
 */
CheckBox.eventHandler = {};

CheckBox.eventHandler.click = function (event){
    if (!EventEmitter.hitElement(this.$input, event)){
        this.$input.click();
    }
};

ACore.install(CheckBox);
export default CheckBox;
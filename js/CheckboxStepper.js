import '../css/checkboxstepper.css';
import { $, _ } from '../ACore';
import Attributes from "absol/src/AppPattern/Attributes";
import CheckboxInput from "./CheckBoxInput";
import AElement from "absol/src/HTML5/AElement";

/**
 * @extends {AElement}
 * @constructor
 */
function CheckboxStepper() {
    this.itemCtrls = [];
    this.$title = $('.as-checkbox-stepper-title', this);
}

CheckboxStepper.tag = 'checkboxstepper';

CheckboxStepper.render = function () {
    return _({
        extendEvent: ['clickitem'],
        class: 'as-checkbox-stepper',
        child: [
            {
                class: 'as-checkbox-stepper-title',
                child: []
            }
        ]
    });
};

CheckboxStepper.prototype.on = function (name, listener) {
    console.log(name);
    if ((name === 'clickitem') || (name && name.clickitem)){
        this.addClass('as-clickable');
    }
    return AElement.prototype.on.apply(this, arguments);
} ;


CheckboxStepper.property = {};

CheckboxStepper.property.items = {
    set: function (items) {
        items = items || [];
        this.itemCtrls.forEach(item => item.$item.remove());
        if (!Array.isArray(items)) items = [];
        this.itemCtrls = items.map(item => new CheckboxStepperItem(this, item));
        this.addChild(this.itemCtrls.map(x => x.$item));
    },
    get: function () {
        return this.itemCtrls.map(x => x.data);
    }
};

CheckboxStepper.property.title = {
    set: function (value) {
        value = value || '';
        value = value + '';
        value = value.trim();
        this.$title.clearChild();
        if (value.length > 0) {
            this.$title.addChild(_({ text: value }));
        }
    },
    get: function () {
        if (this.$title.firstChild) {
            return this.$title.firstChild.data;
        }
        else {
            return '';
        }
    }
};

/**
 *
 * @param {CheckboxStepper} elt
 * @param {{checked: boolean, text:string, disabled?: boolean, color}} data
 * @constructor
 */
function CheckboxStepperItem(elt, data) {
    this.elt = elt;
    this.$item = _({
        class: 'as-checkbox-stepper-item',
        child: [
            {
                class: 'as-checkbox-stepper-check-ctn',
                child: [
                    {
                        tag: CheckboxInput.tag,
                        class: 'as-checkbox-stepper-checkbox',
                        style: {
                            variant: 'check-circle'
                        },
                        props: {
                            readOnly: true
                        }
                    }
                ]
            },

            {
                tag: 'span',
                class: 'as-checkbox-stepper-label',
                child: { text: '' }
            }
        ],
        on:{
            click: ()=>{
                elt.emit('clickitem', { data: this.data, itemCtrl: this, target: elt, type: 'clickitem' }, elt);
            }
        }
    });
    this.$checkbox = $('.as-checkbox-stepper-checkbox', this.$item)
    this.$label = $('.as-checkbox-stepper-label', this.$item);
    this.data = new Attributes(this);
    this.data.loadAttributeHandlers(this.attributeHandlers);
    Object.assign(this.data, data);
    if (data.color) {
        this.$item.addStyle('color' , data.color);
        this.$item.addStyle('--primary-color' , data.color);
    }
}


CheckboxStepperItem.prototype.attributeHandlers = {};

CheckboxStepperItem.prototype.attributeHandlers.text = {
    set: function (value) {
        this.$label.firstChild.data = value || '';
    },
    get: function () {
        return this.$label.firstChild.data;
    }
};


CheckboxStepperItem.prototype.attributeHandlers.checked = {
    set: function (value) {
        this.$checkbox.checked = value;
    },
    get: function () {
        return this.$checkbox.checked;
    }
};

CheckboxStepperItem.prototype.attributeHandlers.disabled = {
    set: function (value) {
        this.$checkbox.disabled = value;
    },
    get: function () {
        return this.$checkbox.disabled;
    }
};

export default CheckboxStepper;
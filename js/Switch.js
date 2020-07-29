import '../css/switch.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";

var _ = ACore._;
var $ = ACore.$;


function Switch() {
    var thisS = this;
    this.$input = $('input', this);
    this.on('click', function (event) {
        thisS.emit('change', event, thisS);
    });
    OOP.drillProperty(this, this.$input, 'checked');
    OOP.drillProperty(this, this.$input, 'isOn', 'checked');
}


Switch.tag = 'switch';

Switch.render = function () {
    return _({
        tag: 'label',
        class: 'absol-switch',
        extendEvent: 'change',
        child: [
            'input[type="checkbox"]',
            'span.absol-switch-slider'
        ]
    });
};

Switch.attribute = {
    checked: {
        set: function (value) {
            if (value == 'false' || value == null) {
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
            if (value == 'false' || value == null) {
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


Switch.property = {
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

ACore.install('switch', Switch);

export default Switch;
import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";

var _ = Acore._;
var $ = Acore.$;


function Switch() {
    var res = _({
        tag: 'label',
        class: 'absol-switch',
        extendEvent:'change',
        child: [
            'input[type="checkbox"]',
            'span.absol-switch-slider'
        ]
    });
    res.$input = $('input', res);
    res.on('click', function (event) {
            res.emit('change', event, res);
    });
    OOP.drillProperty(res, res.$input, 'checked');
    OOP.drillProperty(res, res.$input, 'isOn', 'checked');
    return res;
}




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
    }}

Acore.install('switch', Switch);

export default Switch;
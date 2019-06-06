import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import RadioInput from "./RadioInput";
import Dom from "absol/src/HTML5/Dom";


var _ = Acore._;
var $ = Acore.$;

function Radio() {
    var res = _(
        '<div class="absol-radio">' +
        '    <input type="radio" />' +
        '    <svg class="absol-radio-icon absol-radio-icon-left" width="20" height="20" version="1.1" viewBox="0 0 5.2917 5.2917"' +
        '        xmlns="http://www.w3.org/2000/svg">' +
        '        <g transform="translate(0 -291.71)">' +
        '            <circle class="bound" cx="2.6458" cy="294.35" r="2.4626" style="stroke-opacity:.99497;stroke-width:.26458;" />' +
        '            <circle class="dot" cx="2.6458" cy="294.35" r= "0.92604" style="fill-rule:evenodd;" />' +
        '        </g>' +
        '    </svg>' +
        '    <label style="display:none"></label>' +
        '    <svg class="absol-radio-icon absol-radio-icon-right" width="20" height="20" version="1.1" viewBox="0 0 5.2917 5.2917"' +
        '        xmlns="http://www.w3.org/2000/svg">' +
        '        <g transform="translate(0 -291.71)">' +
        '            <circle class="bound" cx="2.6458" cy="294.35" r="2.4626" style="stroke-opacity:.99497;stroke-width:.26458;" />' +
        '            <circle class="dot" cx="2.6458" cy="294.35"  r= "0.92604" style="fill-rule:evenodd;  " />' +
        '        </g>' +
        '    </svg>' +
        '</div>'
    );
    res.defineEvent('change');
    res.$input = $('input', res);
    res.$label = $('label', res);

    OOP.drillProperty(res, res.$input, 'value');

    res.on('click', function (event) {
        if (!res.checked) {
            if (!this.disabled) {
                res.checked = true;
                res.emit('change', event, res);
            }
        }
    });

    res.sync = res.afterAttached().then(function () {
        res.checked = res.checked;
    });

    return res;
};

Radio.prototype.getAllFriend = function () {
    return Radio.getAllByName(this.name);
};


Radio.prototype.attribute = RadioInput;

Radio.property = {
    checked: {
        set: function (value) {
            this.$input.checked = !!value;
            if (this.checked) {
                this.addClass('checked');
                var _this = this;
                setTimeout(function () {
                    function finish(event) {
                        if (!_this.checked) {
                            _this.removeClass('checked')
                            document.body.removeEventListener('click', finish, false);
                        }
                    }
                    document.body.addEventListener('click', finish, false);
                }, 100);
            }
            else {
                this.removeClass('checked');
            }
        },
        get: function () {
            return this.$input.checked;
        }
    },
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
            this.$label.innerHTML = value;
            if (value.length == 0) this.$label.addStyle('display', 'none');
            else this.$label.removeStyle('display');
        },
        get: function () {
            return this.$label.innerHTML;
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


Acore.creator.radio = Radio;

export default Radio;
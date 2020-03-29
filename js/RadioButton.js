import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

function RadioButton() {
    var res = _(
        '<div class="absol-radio">\
            <input type="radio" />\
            <svg class="absol-radio-icon absol-radio-icon-left" width="20" height="20" version="1.1" viewBox="0 0 5.2917 5.2917" \
                xmlns="http://www.w3.org/2000/svg">\
                <g transform="translate(0 -291.71)">\
                    <circle class="bound" cx="2.6458" cy="294.35" r="2.4626" style="stroke-opacity:.99497;stroke-width:.26458;" />\
                    <circle class="dot" cx="2.6458" cy="294.35" r="0.92604" style="fill-rule:evenodd;" />\
                </g>\
            </svg>\
        </div>'
    );

    res.$attachHook = _('attachhook').addTo(res);
    res.defineEvent('change');
    res.defineEvent('uncheck');
    res.defineEvent('check');
    res.$input = $('input', res);
    OOP.drillProperty(res, res.$input, 'value');

    res.on('click', function (event) {
        if (!res.checked) {
            if (!this.disabled) {
                res.checked = true;
                res.emit('check', { target: res }, res);
                res.emit('change', { target: res, checked: true }, res);
            }
        }
    });

    res.$attachHook.on('error', function () {
        res.checked = res.checked;
    });
    return res;
}

RadioButton.prototype.getAllFriend = function () {
    return Radio.getAllByName(this.name);
};


RadioButton.attribute = {
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
    },
    name: {
        set: function (value) {
            this.name = value;
        },
        get: function () {
            return this.name;
        },
        remove: function () {
            this.name = null;
        }
    }
}

RadioButton.property = {
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
                            _this.emit('uncheck', { target: _this }, _this);
                            _this.emit('change', { target: _this, checked: _this.checked }, _this);

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
            if (name == null) this.$input.removeAttribute('name');
            else
                this.$input.setAttribute('name', name);

        },
        get: function () {
            return this.$input.getAttribute('name');
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

RadioButton.getAllByName = function (name) {
    return (document.getElementsByTagName('input') || []).filter(function (elt) {
        return elt.getAttribute('type') == 'radio' && elt.getAttribute('name') == name;
    });
};

RadioButton.getValueByName = function (name) {
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



RadioButton.initAfterLoad = function () {
    return Dom.documentReady.then(function () {
        Array.apply(null, document.getElementsByTagName('input')).filter(function (e) {
            return e.getAttribute('type') == 'radio' && e.classList.contains('absol-radio');
        }).forEach(function (radio) {
            $(radio);
            radio.removeClass('absol-radio');
            var classes = radio.attr('class').trim().split(/\s+/);
            var res = _('<div class="absol-radio  standar-alone">\
                <svg class="absol-radio-icon absol-radio-icon-left" width="20" height="20" version="1.1" viewBox="0 0 5.2917 5.2917" \
                    xmlns="http://www.w3.org/2000/svg">\
                    <g transform="translate(0 -291.71)">\
                        <circle class="bound" cx="2.6458" cy="294.35" r="2.4626" style="stroke-opacity:.99497;stroke-width:.26458;" />\
                        <circle class="dot" cx="2.6458" cy="294.35" r="0.92604" style="fill-rule:evenodd;" />\
                    </g>\
                </svg>\
            </div>');

            radio.selfReplace(res);
            res.addChild(radio);
            for (var i = 0; i < classes.length; ++i) {
                if (classes[i])
                    res.addClass(classes[i]);
            }
            res.defineEvent('change');
            res.defineEvent('uncheck');
            res.$input = radio;
            OOP.drillProperty(res, res.$input, 'value');

            res.on('click', function (event) {
                if (!res.checked) {
                    if (!this.disabled) {
                        res.checked = true;
                        res.emit('change', event, res);
                    }
                }
            });

            res.defineAttributes(RadioButton.attribute);
            Object.defineProperties(res, RadioButton.property);
            Object.assign(res, RadioButton.prototype);
            if (radio.checked) res.attr('checked', 'true');
            res.$input.on('change', function () {
                res.checked = this.checked;
            });
        });
    });
}

ACore.install('RadioButton'.toLowerCase(), RadioButton);

export default RadioButton;
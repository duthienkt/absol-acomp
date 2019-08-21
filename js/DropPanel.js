import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Element from "absol/src/HTML5/Element";


var _ = Acore._;
var $ = Acore.$;



function DropPanel() {
    var res = _({
        class: 'absol-drop-panel',
        child: [
            {
                class: 'absol-drop-panel-head',
                child: [
                    'toggler-ico',
                    {
                        tag:'span',
                        class:"absol-drop-panel-name"
                    }
                ]

            },
            {
                class: 'absol-drop-panel-body'
            }
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, DropPanel.eventHandler);
    res.$body = $('.absol-drop-panel-body', res);
    res.$head = $('.absol-drop-panel-head', res)
        .on('click', res.eventHandler.clickHead);

    res.$name = $('.absol-drop-panel-name', res);
    OOP.drillProperty(res, res.$name, 'name', 'innerHTML');
    return res;
}


DropPanel.eventHandler = {};
DropPanel.eventHandler.clickHead = function (event) {
    if (!this._childOfButton(event.target)) {
        this.toggle();
    }
};

['findChildBefore', 'findChildAfter', 'removeChild', 'clearChild', 'addChild']
    .forEach(function (key) {
        DropPanel.prototype[key] = function () {
            this.$body[key].apply(this.$body, arguments);
        }
    });

DropPanel.prototype._childOfButton = function (elt) {
    while (elt && elt != this) {
        if (elt.tagName == "BUTTON") {
            return true;
        }
        elt = elt.parentElement
    }
    return false;
};

DropPanel.prototype.toggle = function () {
    this.show = !this.show;
};

DropPanel.property = {};

DropPanel.property.show = {
    set: function (value) {
        if (value) {
            var maxHeight = this.getComputedStyleValue('max-height');
            if (maxHeight != 'none' && maxHeight != 'auto') {
                this.$body.addStyle('max')
            }
            this.$body.addStyle('height', this.$body.scrollHeight + 'px');
            setTimeout(function () {
                this.$body.removeStyle('height');
            }.bind(this), 200);

            this.addClass('show');
        }
        else {
            this.$body.addStyle('height', this.$body.scrollHeight + 'px');
            setTimeout(function () {
                this.$body.addStyle('height', '0');
            }.bind(this), 0);
            setTimeout(function () {
                this.$body.removeStyle('height');
            }.bind(this), 200);
            this.removeClass('show');
        }
    },
    get: function () {
        return this.containsClass('show');
    }
};


Acore.install('DropPanel'.toLowerCase(), DropPanel);

export default DropPanel;
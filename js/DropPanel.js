import '../css/droppanel.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";
import {ExpGroup} from "./ExpTree";



var _ = ACore._;
var $ = ACore.$;

/**
 * @extends AElement
 * @constructor
 */
function DropPanel() {
    var thisDP = this;
    /***
     *
     * @type {ExpGroup}
     */
    this.$body = $('.absol-drop-panel-body', this);
    this.$head = $('.absol-drop-panel-head', this)
        .on('click', thisDP.eventHandler.clickHead);

    this.$name = $('.absol-drop-panel-name', thisDP);
    OOP.drillProperty(this, this.$name, 'name', 'innerHTML');
    return thisDP;
}

DropPanel.tag = 'DropPanel'.toLowerCase();

DropPanel.render = function () {
    return _({
        class: 'absol-drop-panel',
        extendEvent: ['toggle'],
        child: [
            {
                class: 'absol-drop-panel-head',
                child: [
                    'toggler-ico',
                    {
                        tag: 'span',
                        class: "absol-drop-panel-name"
                    }
                ]

            },
            {
                tag:'expgroup',
                class: ['absol-drop-panel-body', 'absol-bscroller']
            }
        ]
    });
};


DropPanel.eventHandler = {};
DropPanel.eventHandler.clickHead = function (event) {
    if (!this._childOfButton(event.target)) {
        var event = {
            target: this, isShowed: this.show, preventDefault: function () {
                this.prevented = true;
            }
        };
        this.emit('toggle', event, this);
        if (!event.prevented) {
            this.toggle();
        }
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
            var maxHeight = parseFloat(this.getComputedStyleValue('max-height').replace('px', ''));
            var headBound = this.$head.getBoundingClientRect();
            if (maxHeight != 'none' && maxHeight != 'auto') {
                this.$body.addStyle('max-height', maxHeight - headBound.height + 'px');
            }
            this.$body.addStyle('height', this.$body.scrollHeight + 'px');
            setTimeout(function () {
                this.$body.removeStyle('height');
                window.dispatchEvent(new Event('resize'));
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
                window.dispatchEvent(new Event('resize'));
            }.bind(this), 200);
            this.removeClass('show');
        }
    },
    get: function () {
        return this.containsClass('show');
    }
};


ACore.install(DropPanel);

export default DropPanel;
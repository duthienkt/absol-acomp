import '../css/statictabbar.css';
import ACore from "../ACore";
import { randomIdent } from 'absol/src/String/stringGenerate';
import { AbstractStyleExtended } from "./Abstraction";
import { mixClass } from "absol/src/HTML5/OOP";


var $ = ACore.$;
var _ = ACore._;


function StaticTabbar() {
    var thisST = this;
    this.$activeBox = $('.absol-static-tabbar-active-box', this)
    this.$hline = $('.absol-static-tabbar-hline', this);
    this.$buttons = [];
    this._btDict = {};
    this._activedButton = undefined;
    this.sync = new Promise(function (resolve) {
        _('attachhook').on('error', function () {
            this.remove();
            resolve();
        }).addTo(thisST);
    });
    AbstractStyleExtended.call(this);
    return this;
}

mixClass(StaticTabbar, AbstractStyleExtended);

StaticTabbar.prototype.extendStyle = {};
StaticTabbar.prototype.extendStyle.variant = 'secondary';

StaticTabbar.tag = 'StaticTabbar'.toLowerCase();

StaticTabbar.render = function () {
    return _({
        class: 'absol-static-tabbar',
        extendEvent: 'change',
        child: [
            {
                class: 'absol-static-tabbar-active-box',
                child: '.absol-static-tabbar-hline'
            }
        ]
    });
};


StaticTabbar.prototype.styleHandlers.variant = {
    set: function (value) {
        if (value !== 'secondary') value = 'v0';
        this.attr('data-variant', value);
        return value;
    }
}

StaticTabbar.prototype.fireChange = function (data) {
    this.emit('change', { target: this, data, value: this.value }, self);
}

StaticTabbar.property = {};

StaticTabbar.property.items = {
    set: function (value) {
        this.$buttons.forEach(function (e) {
            e.remove()
        });
        this._items = value;
        var self = this;
        this.$buttons = this.items.map(function (tab) {
            var ident = (tab.value || randomIdent());
            var button = _({
                tag: 'button',
                class: 'absol-static-tabbar-button',
                id: 'tab-' + ident,
                child: {
                    tag: 'span',
                    child: { text: tab.text }
                },
                on: {
                    click: function (event) {
                        if (self.value != tab.value) {
                            self.value = ident;
                            self.fireChange(tab);
                        }
                    }
                }
            }).addTo(self);
            self._btDict[ident] = button;
            return button;
        });
        if (this.value !== undefined) {
            this.sync.then(this.activeTab.bind(this, this.value));
        }
    },
    get: function () {
        return this._items || [];
    }
};


StaticTabbar.property.value = {
    set: function (value) {
        this._value = value;
        if (this.$buttons.length > 0) {
            this.sync.then(this.activeTab.bind(this, value));
        }
    },
    get: function () {
        return this._value;
    }
};

StaticTabbar.prototype.activeTab = function (ident) {
    if (this._activedButton) this._activedButton.removeClass('active');
    var button = this._btDict[ident];
    this._activedButton = button;
    if (button) {
        button.addClass('active');
        var bound = this.getBoundingClientRect();
        var buttonBound = button.getBoundingClientRect();
        var dx = buttonBound.left - bound.left;
        var fontSize = this.getFontSize();
        this.$activeBox.addStyle({
            left: dx / fontSize + 'em',
            width: buttonBound.width / fontSize + 'em'
        });
    }
    else {
        this.$activeBox.addStyle({
            left: '0',
            width: '0'
        });
    }
};

ACore.install('statictabbar', StaticTabbar);

export default StaticTabbar;



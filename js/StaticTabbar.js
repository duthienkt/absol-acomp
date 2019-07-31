import Acore from "../ACore";
import { randomIdent } from 'absol/src/String/stringGenerate';


var $ = Acore.$;
var _ = Acore._;


function StaticTabbar() {
    var res = _({
        class: 'absol-static-tabbar',
        extendEvent: 'change',
        child: [
            {
                class: 'absol-static-tabbar-active-box',
                child: '.absol-static-tabbar-hline'
            },
        ]
    });

    res.$activeBox = $('.absol-static-tabbar-active-box', res)
    res.$hline = $('.absol-static-tabbar-hline', res);
    res.$buttons = [];
    res._btDict = {};
    res._activedButton = undefined;
    res.sync = new Promise(function (resolve) {
        _('attachhook').on('error', function () {
            this.remove();
            resolve();
        })
    });
    return res;
}

StaticTabbar.prototype.fireChange = function (data) {
    this.emit('change', { target: this, data, value: this.value }, self);
}

StaticTabbar.property = {};

StaticTabbar.property.items = {
    set: function (value) {
        this.$buttons.forEach(function (e) { e.remove() });
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

Acore.install('statictabbar', StaticTabbar);

export default StaticTabbar;



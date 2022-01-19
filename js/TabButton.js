import '../css/tabview.css';
import ACore from "../ACore";
import { randomIdent } from "absol/src/String/stringGenerate";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function TabButton() {
    var thisTB = this;
    this._icon = null;
    this.$extIconCtn = $('.as-tab-bar-button-ext-icon-ctn', this);
    this.$close = $('.absol-tabbar-button-close', this)
    this.$iconCtn = $('.absol-tabbar-button-icon-container', this).on('click', function (event) {
        event.tabButtonEventName = 'delete';
        thisTB.emit('close', event);
    });
    this.$modifiedFlag = $('.absol-tabbar-button-modified-flag', this)
        .on('click', function (event) {
            event.tabButtonEventName = 'delete';
            thisTB.emit('close', event);
        });

    this.$textView = $('.absol-tabbar-button-text', this);
    this.on({
        click: function (event) {
            if (event.tabButtonEventName) return;
            event.tabButtonEventName = 'active';
            thisTB.emit('active', event);
        }
    });
}


TabButton.tag = 'TabButton'.toLowerCase();

TabButton.render = function () {
    return _({
        tag: 'button',
        class: 'absol-tabbar-button',
        extendEvent: ['close', 'active'],
        id: randomIdent(20),
        child: [
            {
                class: 'as-tab-bar-button-ext-icon-ctn'
            },
            {
                class: 'absol-tabbar-button-text',
            },
            {
                class: 'absol-tabbar-button-icon-container',
                child: [
                    {
                        tag: 'span',
                        class: ['absol-tabbar-button-close', 'mdi-close', 'mdi'],
                        attr: { title: 'Close' }
                    },
                    {
                        tag: 'span',
                        class: ['absol-tabbar-button-close-circle', 'mdi-close-circle', 'mdi'],
                        attr: { title: 'Close' }
                    },
                    {
                        tag: 'span',
                        class: ['absol-tabbar-button-modified-flag', 'mdi', 'mdi-checkbox-blank-circle']
                    }
                ]
            }
        ]
    });
};


TabButton.property = {};
TabButton.property.active = {
    set: function (value) {
        this._active = value;
        if (value)
            this.addClass('absol-tabbar-button-active');
        else
            this.removeClass('absol-tabbar-button-active');
    },
    get: function () {
        return this._active;
    }
};


TabButton.property.name = {
    set: function (value) {
        this._name = value || '';
        this.$textView.innerHTML = this._name;

    },
    get: function () {
        return this._name;
    }
};


TabButton.property.desc = {
    set: function (value) {
        this.attr('title', value);
    },
    get: function () {
        return this.attr('title');
    }
};

TabButton.property.icon = {
    set: function (value) {
        value = value || null;
        this._icon = value;
        this.$extIconCtn.clearChild();
        if (this._icon) {
            this.$extIconCtn.addChild(_(value));
        }
    },
    get: function () {
        return this._icon;
    }
}


TabButton.property.modified = {
    set: function (value) {
        if (value) {
            this.addClass('absol-tabbar-button-modified');
        }
        else {
            this.removeClass('absol-tabbar-button-modified');
        }
    },
    get: function () {
        return this.containsClass('absol-tabbar-button-modified');
    }
};

ACore.install(TabButton);

export default TabButton;
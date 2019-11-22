import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;


function FlexiconButton() {
    this._icon = null;
    this.$content = $('.as-flexicon-button-content', this);
    this.$iconCtn = $('.as-flexicon-button-icon-container', this);
    this.$textCtn = $('.as-flexicon-button-text-container', this);
}


FlexiconButton.render = function () {
    return _({
        tag: 'button',
        class: 'as-flexicon-button',
        child: {
            class: 'as-flexicon-button-content',
            child: [
                '.as-flexicon-button-icon-container',
                '.as-flexicon-button-text-container',
            ]
        }
    });
};

FlexiconButton.property = {};

FlexiconButton.property.icon = {
    set: function (value) {
        value = value || null;
        this._icon = value;
        this.$iconCtn.clearChild();
        if (value !== null) {
            this.$iconCtn.addChild(_(value));
        }
    },
    get: function () {
        return this._icon;
    }
};

FlexiconButton.property.text = {
    set: function (value) {
        value = value || null;
        this._text = value;
        this.$textCtn.clearChild();
        if (value !== null) {
            this.$textCtn.addChild(_({ text: value }));
        }
    },
    get: function () {
        this._text;
    }
};


Acore.install('flexiconbutton', FlexiconButton);


export default FlexiconButton;
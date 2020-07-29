import '../css/iconbutton.css';
import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;


function IconButton() {
    this.$iconContainer = $('.absol-icon-button-icon-container', this);
    this.$textContainer = $('.absol-icon-button-text-container', this);
    this.$attachhook = _('attachhook').addTo(this);
    this.sync = new Promise(function (rs) {
        this.$attachhook.on('error', rs);
    }.bind(this))
}

IconButton.tag = IconButton;

IconButton.render = function () {
    return _({
        tag: "button",
        class: ['absol-icon-button'],
        child: ['.absol-icon-button-icon-container', '.absol-icon-button-text-container']
    });
};

IconButton.prototype.addChild = function (child) {
    if (child instanceof Array) {
        child.forEach(function () {
            this.addChild(child);
        }.bind(this));
    }
    else {
        if (!this.$iconContainerChild) {
            this.$iconContainerChild = child;
            this.$iconContainer.addChild(child);
            this.sync = this.sync.then(this.updateTextPosition.bind(this));
        }
        else if (!this.$textContainerChild) {
            this.$textContainerChild = child;
            this.$textContainer.addChild(child);
            this.sync = this.sync.then(this.updateTextPosition.bind(this));
        }
    }
    return this;
};

IconButton.prototype.updateTextPosition = function () {
    var heightStyle = parseFloat(this.getComputedStyleValue('height').replace('px', ''));
    var iconContainerHeightStyle = parseFloat(this.$iconContainerChild.getComputedStyleValue('height').replace('px', ''));
    if (heightStyle - iconContainerHeightStyle > 0) {
        this.$iconContainer.addStyle({
            width: heightStyle + 'px',
            height: heightStyle + 'px'
        });
        this.addStyle('line-height', heightStyle - 2 + 'px');
        this.$textContainer.addStyle({
            'height': heightStyle + 'px',
            'line-height': heightStyle + 'px'
        });
    }
    if (this.$textContainerChild) {
        var textContainerBound = this.$textContainer.getBoundingClientRect();
        var bound = this.getBoundingClientRect();
        if (textContainerBound.right < bound.right - 2) {
            this.$textContainer.addStyle('width', textContainerBound.width + (bound.right - 2 - textContainerBound.right) + 'px');

        }
    }
}

IconButton.prototype.clearChild = function () {
    res.$iconContainer.clearChild();
    res.$textContainer.clearChild();
    this.$textContainerChild = undefined;
    this.$iconContainerChild = undefined;
    return this;
};

ACore.install(IconButton);

export default IconButton;
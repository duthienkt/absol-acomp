import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;


function IconButton() {
    var res = _({
        tag: "button",
        class: ['absol-icon-button'],
        child: ['.absol-icon-button-icon-container', '.absol-icon-button-text-container']
    });
    res.$iconContainer = $('.absol-icon-button-icon-container', res);
    res.$textContainer = $('.absol-icon-button-text-container', res);
    res.sync = res.afterAttached();
    return res;
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

ACore.creator.iconbutton = IconButton;

export default IconButton;
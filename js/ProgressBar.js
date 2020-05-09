import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;


function ProgressBar() {
    this._value = 0;
    this._variant = null;
    this.$value = $('.as-progress-bar-value', this);
    this._striped = false;
    this._animated = false;
}


ProgressBar.render = function () {
    return _({
        class: 'as-progress-bar',
        child: {
            class: 'as-progress-bar-value'
        }
    });
};


ProgressBar.property = {};


/**
 * @type {ProgressBar}
 */
ProgressBar.property.variant = {
    set: function (value) {
        if (this._variant) {
            this.removeClass('as-variant-' + this._variant);
        }
        if (value) {
            this.addClass('as-variant-' + value)
        }
        else {
            value = null;
        }
        this._variant = value;
    },
    get: function () {
        return this._variant;
    }

};

/**
 * @type {ProgressBar}
 */
ProgressBar.property.value = {
    set: function (value) {
        value = Math.max(0, Math.min(1, value || 0));
        this._value = value;
        this.$value.addStyle('width', value * 100 + '%');

    },
    get: function () {
        return this._value;
    }
};


ProgressBar.property.animated = {
    set: function (value) {
        value = !!value;
        this._striped = value;
        if (value) {
            this.addClass('as-animated');
        }
        else {
            this.removeClass('as-animated');
        }
    },
    get: function () {
        return this._animated;
    }
}

ProgressBar.property.striped = {
    set: function (value) {
        value = !!value;
        this._striped = value;
        if (value) {
            this.addClass('as-striped');
        }
        else {
            this.removeClass('as-striped');
        }
    },
    get: function () {
        return this._striped;
    }
}


ACore.install('progressbar', ProgressBar);


export default ProgressBar;
import '../css/editabletext.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";


var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function EditableText() {
    var thisET = this;
    this.$span = $('span', this);
    this.$text = document.createTextNode('');
    this.$span.addChild(this.$text);

    this.$higne = $('.absol-editabe-text-higne', this);
    this.$input = $('input', this);

    OOP.drillProperty(this, this.$input, ['selectionStart', 'selectionEnd']);
    this.sync = new Promise(function (rs) {
        _('attachhook').addTo(thisET).once('error', rs);
    });

    this.$input.on('keydown', this.eventHandler.inputKeyDown, true);
    this.$input.on('change', this.eventHandler.inputChange);
    this.$input.on('blur', this.eventHandler.inputBlur);
};

EditableText.tag = 'EditableText'.toLowerCase();

EditableText.render = function () {
    return _({
        class: 'absol-editabe-text',
        extendEvent: ['blur', 'focus', 'change', 'modify'],
        child: [
            {
                class: 'absol-editabe-text-higne',
                child: '<input type="text">'
            },
            'span'
        ]
    });
};


EditableText.prototype.focus = function () {
    this.$input.focus();
};
EditableText.prototype.blur = function () {
    this.$input.blur();
};

EditableText.prototype.select = function () {
    this.$input.select();
};

EditableText.prototype.edit = function (flag, select) {
    this.editing = !!flag;
    this.sync = this.sync.then(function () {
        if (flag) {
            this.focus();
            if (select) this.select();
        }
        else
            this.blur();
    }.bind(this));
    return this.sync;
}

EditableText.prototype._update = function () {
    this.sync = this.sync.then(function () {
        return new Promise(function (rs) {
            // setTimeout(function () {
            var bound = this.getBoundingClientRect();
            var higneBound = this.$higne.getBoundingClientRect();
            var fsize = this.getFontSize();
            this.$input.addStyle('width', bound.width + 4 + fsize * 0 + 'px');
            this.$input.addStyle('height', bound.height + 4 + 'px');
            this.$input.addStyle('left', bound.left - higneBound.left - 2 + 'px');
            this.$input.addStyle('top', bound.top - higneBound.top + 'px');
            rs();
        }.bind(this));
    }.bind(this));
}

EditableText.property = {};

EditableText.property.text = {
    set: function (value) {
        this.$text.textContent = value;
        this.$input.value = value;
    },

    get: function () {
        return this.$text.textContent;
    }
}


EditableText.property.editing = {
    set: function (value) {
        if (this._editting === value) return;
        this._editting = !!value;
        if (value) {
            this.$input.value = this.text;
            this._update();
            this.sync = this.sync.then(function () {
                this.addClass('editing');
                this.$input.value = this.text;
                this.$input.addStyle('font', this.$span.getComputedStyleValue('font'));
                this.$input.addStyle('font-style', this.$span.getComputedStyleValue('font-style'));
                this.$input.addStyle('color', this.$span.getComputedStyleValue('color'));
            }.bind(this));

        }
        else {
            this.removeClass('editing');
        }
    },
    get: function () {
        return !!this._editting;
    }
};


EditableText.eventHandler = {};

EditableText.eventHandler.inputKeyDown = function (event) {
    requestAnimationFrame(function () {
        this.text = this.$input.value;
        this._update();
        event.text = this.text;
        this.emit('modify', event);
    }.bind(this));
};


EditableText.eventHandler.inputChange = function (event) {
    this.editing = false;
    this.emit('change', event);
};

EditableText.eventHandler.inputBlur = function (event) {
    this.editing = false;
    this.emit('blur', event);
};

ACore.install(EditableText);

export default EditableText;

import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";

var _ = ACore._;
var $ = ACore.$;


function EditableText() {
    var res = _({
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
    res.$span = $('span', res);
    res.$text = document.createTextNode('');
    res.$span.addChild(res.$text);

    res.$higne = $('.absol-editabe-text-higne', res);
    res.$input = $('input', res);

    OOP.drillProperty(res, res.$input, ['selectionStart', 'selectionEnd']);
    res.eventHanler = OOP.bindFunctions(res, EditableText.eventHanler);
    res.sync = new Promise(function (rs) {
        _('attachhook').addTo(res).once('error', rs);
    });

    res.$input.on('keydown', res.eventHanler.inputKeyDown, true);
    res.$input.on('change', res.eventHanler.inputChange);
    res.$input.on('blur', res.eventHanler.inputBlur);
    return res;
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


EditableText.eventHanler = {};

EditableText.eventHanler.inputKeyDown = function (event) {
    requestAnimationFrame(function () {
        this.text = this.$input.value;
        this._update();
        event.text = this.text;
        this.emit('modify', event);
    }.bind(this));
};


EditableText.eventHanler.inputChange = function (event) {
    this.editing = false;
    this.emit('change', event);
};

EditableText.eventHanler.inputBlur = function (event) {
    this.editing = false;
    this.emit('blur', event);
};

ACore.creator.editabletext = EditableText;

export default EditableText;

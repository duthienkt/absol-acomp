import '../css/searcher.css';
import ACore from "../ACore";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";
import { SpinnerIco } from "./Icons";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import { AbstractStyleExtended } from "./Abstraction";

var _ = ACore._;
var $ = ACore.$;


ACore.creator['find-ico'] = function () {
    var res = _(
        '<svg class="find" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        ' <g transform="matrix(-1 0 0 1 99.478 -193.73)">' +
        '  <path d="m62.128 199.18c-18.859 0-34.148 15.289-34.148 34.148 0 5.4138 1.26 10.533 3.5026 15.081 0.6886 1.3965 1.4698 2.7392 2.3357 4.02-1.9962 2.1685-31.467 31.596-31.404 33.295 0.21757 5.8346 4.9404 8.7289 9.464 7.855 1.3264-0.25627 30.938-30.639 31.774-31.529 1.3906 0.89633 2.8508 1.6948 4.3702 2.3848 4.2995 1.9526 9.0756 3.04 14.105 3.04 18.859 0 34.147-15.288 34.147-34.147 3e-6 -18.859-15.288-34.148-34.147-34.148zm0.49444 8.2454a26.067 26.067 0 0 1 26.068 26.067 26.067 26.067 0 0 1-26.068 26.068 26.067 26.067 0 0 1-26.067-26.068 26.067 26.067 0 0 1 26.067-26.067z"/>' +
        ' </g>' +
        '</svg>'
    );
    return res;
};


ACore.creator['times-circle-ico'] = function () {
    var res = _(
        '<svg class="times" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
            <g transform="translate(0,-197)">\
                <path d="m49.979 236.2-14.231-14.231-10.696 10.696 14.257 14.257-14.351 14.351 10.737 10.737 14.292-14.292 14.292 14.292 10.761-10.761-14.257-14.257 14.316-14.316-10.725-10.725zm50.021 10.804a50 50 0 0 1-50 50 50 50 0 0 1-50-50 50 50 0 0 1 50-50 50 50 0 0 1 50 50z" />\
            </g>\
        </svg>'
    );
    return res;
};


/**
 * @augments {AbstractStyleExtended}
 * @augments {AElement}
 * @constructor
 */
function SearchTextInput() {
    var thisSTI = this;
    this.defineEvent(['change', 'modify', 'stoptyping']);

    this.eventHandler = OOP.bindFunctions(this, SearchTextInput.eventHandler);
    this.$button = $('button', this);
    this.$input = $('input', this);

    ['keyup', 'keydown', 'focus', 'blur'].forEach(function (evName) {
        thisSTI.defineEvent(evName);
        thisSTI.$input.on(evName, function (event) {
            thisSTI.emit(evName, event, thisSTI);
        });
    });

    this.$input.on('change', this.eventHandler.inputChange);
    this.$input.on('keyup', this.eventHandler.inputKeyUp);

    this.$button.on('click', function (event) {
        thisSTI.$input.value = '';
        thisSTI.eventHandler.inputKeyUp(event);
        setTimeout(function () {
            thisSTI.focus();
        }, 50);
    });

    AbstractStyleExtended.call(this);
    /**
     * @type {string}
     * @name value
     * @memberOf SearchTextInput#
     */
}


mixClass(SearchTextInput, AbstractStyleExtended);

SearchTextInput.tag = 'SearchTextInput'.toLowerCase();

SearchTextInput.render = function () {
    return _(
        {
            class: ['absol-search-text-input'],
            child: [
                {
                    class: 'absol-search-text-input-container',
                    child: {
                        tag: 'input',
                        attr: {
                            type: 'search',
                            placeholder: LanguageSystem.getText('txt_search') || 'Search...'
                        }
                    }
                },
                {
                    class: 'absol-search-text-button-container',
                    child: {
                        tag: 'button',
                        child: ['find-ico', 'times-circle-ico', { tag: SpinnerIco.tag, style: { margin: 0 } }]
                    }
                }
            ]
        }
    );
};


SearchTextInput.property = {
    value: {
        set: function (value) {
            value = value || '';
            this.$input.value = value;
            this._lastTextModified = value;
            if (this.value.length > 0) {
                this.addClass('searching');
            }
            else {
                this.removeClass('searching');
            }
        },
        get: function () {
            return this.$input.value;
        }
    },
    placeholder: {
        set: function (value) {
            this.$input.attr('placeholder', value);
        },
        get: function () {
            return this.$placeholder.getAttribute('placeholder');
        }
    }
};

SearchTextInput.property.waiting = {
    set: function (value) {
        value = value || false;
        this._waiting = value;
        if (value) {
            this.addClass('as-waiting');
        }
        else {
            this.removeClass('as-waiting');
        }
    },
    get: function () {
        return this._waiting || false;
    }
}

SearchTextInput.prototype.focus = function () {
    this.$input.focus();
};

SearchTextInput.prototype.blur = function () {
    this.$input.blur();
};


SearchTextInput.eventHandler = {};
SearchTextInput.eventHandler.inputChange = function (event) {
    event.value = this.value;
    if (typeof this.onchange == 'function') {
        this.onchange(event, this);
    }
    this.emit('change', event);
};

SearchTextInput.eventHandler.inputKeyUp = function (event) {
    if (this._lastTextModified != this.value) {
        if (this.value.length > 0) {
            this.addClass('searching');
        }
        else {
            this.removeClass('searching');
        }
        event.value = this.value;
        if (typeof this.onchange == 'function') {
            this.onchange(event, this);
        }
        this.emit('modify', event);
        if (this._updateTimeOut !== undefined) {
            clearTimeout(this._updateTimeOut);
            this._updateTimeOut = undefined;
        }
        this._updateTimeOut = setTimeout(function () {
            this.emit('stoptyping', event);
        }.bind(this), 500);
        this._lastTextModified = this.value;
    }
};


ACore.install(SearchTextInput);
ACore.install('searchtextinput', SearchTextInput);
ACore.install('searchcrosstextinput', SearchTextInput);

export default SearchTextInput;


/**
 * @augments {AElement}
 *
 * @constructor
 */
export function SearchMultiModeInput() {
    this.$input = $('input', this);
    this.$prevBtn = $('.as-smm-input-prev-btn', this);
    this.$nextBtn = $('.as-smm-input-next-btn', this);
    this.$modeBtn = $('.as-smm-input-mode-btn', this);
    this.$clearBtn = $('.as-smm-input-clear-btn', this);
    this.$count = $('.as-smm-input-result-count', this);
    this.modeCtrl = new SMMIModeController(this);
    this.actionCtrl = new SMMIActionController(this);
    /**
     *
     * @type {"filter"|"highlight"}
     */
    this.mode = "filter";
}

SearchMultiModeInput.tag = 'SearchMultiModeInput'.toLowerCase();

SearchMultiModeInput.render = function () {
    return _(
        {
            extendEvent: ['stoptyping', 'previous', 'next'],
            class: ['as-search-multi-mode-input', 'as-empty'],
            child: [
                {
                    class: 'as-smm-text-input-container',
                    child: {
                        tag: 'input',
                        attr: {
                            type: 'search',
                            placeholder: LanguageSystem.getText('txt_search') || 'Search...'
                        }
                    }
                },
                {
                    class: 'as-smm-button-container',
                    child: [
                        {
                            class: 'as-smm-input-result-count',
                            child: { text: '0/0' }
                        },
                        {
                            tag: 'button',
                            class: ['as-transparent-button', 'as-smm-input-clear-btn'],
                            child: 'span.mdi.mdi-close-circle'
                        },
                        {
                            tag: 'button',
                            class: ['as-transparent-button', 'as-smm-input-prev-btn'],
                            child: 'span.mdi.mdi-chevron-up'
                        },
                        {
                            tag: 'button',
                            class: ['as-transparent-button', 'as-smm-input-next-btn'],
                            child: 'span.mdi.mdi-chevron-down'
                        },
                        {
                            tag: 'button',
                            class: ['as-transparent-button', 'as-smm-input-mode-btn'],
                            child: ['span.mdi.mdi-magnify', 'span.mdi.mdi-filter-variant']
                        }
                    ]
                }
            ]
        }
    );
};

SearchMultiModeInput.property = {};

/**
 * Current search text.
 * @memberOf SearchMultiModeInput#
 * @name value
 * @type {string}
 */
SearchMultiModeInput.property.value = {
    set: function (value) {
        value = value == null ? '' : (value + '');
        this.$input.value = value;
        this.classList.toggle('as-empty', value.length === 0);
    },
    get: function () {
        return this.$input.value;
    }
};

SearchMultiModeInput.property.mode = {
    set: function (mode) {
        mode = mode === 'highlight' ? 'highlight' : 'filter';
        this.attr('data-mode', mode);
    },
    get: function () {
        return this.attr('data-mode') || 'filter';
    }
};

/**
 * Enable or disable the previous button
 * @name canPrevious
 * @memberOf SearchMultiModeInput#
 * @type {boolean}
 */
SearchMultiModeInput.property.canPrevious = {
    set: function (value) {
        this.$prevBtn.disabled = !value;
    },
    get: function () {
        return !this.$prevBtn.disabled;
    }
};

/**
 * Enable or disable the next button
 * @name canNext
 * @memberOf SearchMultiModeInput#
 * @type {boolean}
 */
SearchMultiModeInput.property.canNext = {

    set: function (value) {
        this.$nextBtn.disabled = !value;
    },
    get: function () {
        return !this.$nextBtn.disabled;
    }
};

/**
 * Text showing the count of search results (e.g. "3/10").
 * @memberOf SearchMultiModeInput#
 * @name countText
 * @type {string}
 */
SearchMultiModeInput.property.countText = {
    set: function (value) {
        this.$count.textContent = value == null ? '' : String(value);
    },
    get: function () {
        return this.$count.textContent;
    }
};


ACore.install(SearchMultiModeInput);


/**
 *
 * @param {SearchMultiModeInput} elt
 * @constructor
 */
function SMMIModeController(elt) {
    this.elt = elt;
    this.elt.$modeBtn.on('click', this.ev_clickButton.bind(this));
}

SMMIModeController.prototype.ev_clickButton = function (event) {
    if (this.elt.mode === 'filter') {
        this.elt.mode = 'highlight';
        this.elt.actionCtrl.delayNotifyStopChange();
    }
    else {
        this.elt.mode = 'filter';
        this.elt.actionCtrl.delayNotifyStopChange();
    }
};

/**
 *
 * @param {SearchMultiModeInput} elt
 * @constructor
 */
function SMMIActionController(elt) {
    this.elt = elt;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.elt.on('input', this.ev_input);
    this.elt.$clearBtn.on('click', this.ev_clickClear);
    this.elt.$prevBtn.on('click', this.ev_clickPrev);
    this.elt.$nextBtn.on('click', this.ev_clickNext);
    this.typingTO = -1;
}

SMMIActionController.prototype.delayNotifyStopChange = function () {
    clearTimeout(this.typingTO);
    this.typingTO = setTimeout(() => {
        this.elt.emit('stoptyping', { target: this.elt, type: 'stoptyping' }, this.elt);
    }, 500);
}

SMMIActionController.prototype.ev_input = function (event) {
    var value = this.elt.$input.value;
    if (value.length === 0) {
        this.elt.addClass('as-empty');
    }
    else {
        this.elt.removeClass('as-empty');
    }
    this.delayNotifyStopChange();
};

SMMIActionController.prototype.ev_clickClear = function (event) {
    this.elt.value = '';
    this.elt.addClass('as-empty');
    this.elt.$input.focus();
    this.delayNotifyStopChange();
};

SMMIActionController.prototype.ev_clickPrev = function (event) {
    this.elt.emit('previous', { target: this.elt, type: 'previous' }, this.elt);
};


SMMIActionController.prototype.ev_clickNext = function (event) {
    this.elt.emit('next', { target: this.elt, type: 'next' }, this.elt);
};
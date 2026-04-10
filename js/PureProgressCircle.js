window.PureProgressCircleModule = (function () {
    'use strict';

    var rawCss = `
        .az-progress-circle {
            display: inline-block;
            width: 7em;
            height: 7em;
            background-color: #fcfcf6;
            border-radius: 50%;
            position: relative;
            --value-color: #007bff;
            box-shadow: 3px 2px 12px -1px rgba(0, 0, 0, 0.1) inset;
            overflow: hidden;
            font-family: Roboto, sans-serif;
        }

        .az-progress-circle-inner {
            background-color: white;
            position: absolute;
            border-radius: 50%;
            left: 0.8em;
            right: 0.8em;
            top: 0.8em;
            bottom: 0.8em;
            font-size: 1rem;
            box-shadow: 3px 2px 12px -1px rgba(0, 0, 0, 0.1);
            white-space: nowrap;
            text-align: center;
        }

        .az-progress-circle-inner::before {
            content: "";
            height: 100%;
            display: inline-block;
            vertical-align: middle;
        }

        .az-progress-circle-text {
            display: inline-block;
            vertical-align: middle;
            white-space: pre-wrap;
            max-width: calc(100% - 0.3em);
            font-size: 1em;
            color: #454c5b;
        }

        .az-progress-circle-start,
        .az-progress-circle-end {
            border-radius: 50%;
            width: 0.8em;
            height: 0.8em;
            background-color: var(--value-color);
            top: 0;
            left: calc(50% - 0.4em);
            position: absolute;
        }

        .az-progress-circle-pie {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            border-radius: 50%;
            background-color: var(--value-color);
        }
        `;


    /**
     * @augments {Element}
     * @constructor
     */
    function ProgressCircle() {
        this._text = '$value';
        this._value = 0;
        this._viewValue = 0;
        this.$pie = this.querySelector('.az-progress-circle-pie');
        this.$inner = this.querySelector('.az-progress-circle-inner');
        this.$end = this.querySelector('.az-progress-circle-end');
        this.$text = this.querySelector('.az-progress-circle-text');
        this._animated = true;
        this.value = 0;//init
    }

    ProgressCircle.tag = 'ProgressCircle'.toLowerCase();
    ProgressCircle.render = function () {
        var html = '<div class="az-progress-circle">' +
            '<div class="az-progress-circle-start"></div>' +
            '<div class="az-progress-circle-pie" style="clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50.7816% 99.9939%, 50% 50%);"></div>' +
            '<div class="az-progress-circle-end" style="left: calc(50.7816% - 0.406253em); top: calc(99.9939% - 0.799951em);"></div>' +
            '<div class="az-progress-circle-inner"><div class="az-progress-circle-text">0</div></div>' +
            '</div>';
        var render = document.createElement('div');
        render.innerHTML = html;
        var elt = render.firstChild;
        elt.remove();
        return elt;

    };


    ProgressCircle.property = {};

    ProgressCircle.prototype._updateValue = function () {
        if (Math.abs(this._value - this._viewValue) < 0.05 || !this._animated) this._viewValue = this._value;
        else {
            if (this._value > this._viewValue) this._viewValue += 0.05;
            else this._viewValue -= 0.05;
        }
        var value = this._viewValue;
        var angle = Math.PI * (-0.5 + value * 2);
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        var pl = 'polygon(50% 0%, 100% 0%, ';
        if (value >= 0.25) pl += '100% 100%, ';
        if (value >= 0.5) pl += '0% 100%, ';
        if (value >= 0.75) pl += '0% 0%, ';
        pl += `${50 + 50 * cosAngle}% ${50 + 50 * sinAngle}%`;
        pl += ', 50% 50%)';
        this.$pie.style.setProperty('clip-path', pl);
        this.$end.style.setProperty('left', `calc(${50 + 50 * cosAngle}% - ${(cosAngle + 1) * 0.8 / 2}em)`);
        this.$end.style.setProperty('top', `calc(${50 + 50 * sinAngle}% - ${(sinAngle + 1) * 0.8 / 2}em)`);

        if (this._value !== this._viewValue) {
            setTimeout(() => this._updateValue(), 16);
        }
    }

    ProgressCircle.prototype._updateText = function () {
        var value = this._value;
        var text = this._text;
        text = text.replace('$value', Math.round(value * 100) + '%');
        this.$text.firstChild.data = text;
    };


    ProgressCircle.property.value = {
        set: function (value) {
            value = Math.max(0, Math.min(1, value || 0));
            this._value = value;
            this._updateValue();
            this._updateText();

        },
        get: function () {
            return this._value;
        }
    };

    ProgressCircle.property.color = {
        set: function (value) {
            if (typeof value === 'string' && value) {
                this.style.setProperty('--value-color', value);
            }
        },
        get: function () {
            return this.style.getPropertyValue('--value-color');
        }
    };


    ProgressCircle.property.text = {
        set: function (value) {
            value = value || '';
            if (typeof value !== "string") value = '';
            this._text = value;
            this._updateText();
        },
        get: function () {
            return this._text;
        }
    }


    ProgressCircle.property.animated = {
        set: function (value) {
            value = !!value;
            this._animated = value;
            if (value) {
                this.classList.add('az-animated');
            }
            else {
                this.classList.remove('az-animated');
            }
        },
        get: function () {
            return this._animated;
        }
    };


    var styleElt = null;
    function initCss() {
        if (styleElt) return;
        styleElt = document.createElement('style');
        styleElt.setAttribute('type', 'text/css');
        styleElt.innerHTML = rawCss;
        document.head.appendChild(styleElt);
    }

    function make() {
        initCss();
        var elt = ProgressCircle.render();
        Object.assign(elt, ProgressCircle.prototype);//quick assign methods
        Object.defineProperties(elt, ProgressCircle.property);
        ProgressCircle.call(elt);
        return elt;
    }

    function revokeResource() {
        rawCss = null;
        styleElt.remove();
        styleElt = null;
    }

    var mdl = {
        make: make,
        revokeResource:revokeResource
    };

    return mdl;
})();

/**
 Example


 // Create a new progress circle element
 var circle = window.PureProgressCircleModule.make();

 // Set value (from 0 to 1)
 circle.value = 0.75; // 75%

 // Set display text (use $value to insert percent)
 circle.text = 'Progress\n$value';


 document.body.appendChild(circle); // or any container

 */
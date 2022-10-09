import ACore, { $, _ } from "../ACore";
import LocationPicker from "./LocationPicker";
import '../css/locationinput.css';
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { isRealNumber } from "./utils";
import BrowserDetector from "absol/src/Detector/BrowserDetector";

function LocationInput() {
    this.$text = $('input', this)
        .on('change', this.eventHandler.textChange);
    this.$iconCtn = $('.as-location-input-icon-ctn', this)
        .on('click', this.eventHandler.clickIcon);


    /***
     * @type {{latitude: number, longitude: number}}
     * @name latLng
     * @memberOf LocationInput#
     */

    /***
     * @type {string}
     * @name value
     * @memberOf LocationInput#
     */
    /***
     * @type {boolean}
     * @name readOnly
     * @memberOf LocationInput#
     */
}

LocationInput.tag = 'LocationInput'.toLowerCase();

LocationInput.render = function () {
    return _({
        class: 'as-location-input',
        extendEvent: ['change'],
        child: [
            { tag: 'input', attr: { type: 'text' }, class: 'as-location-input-text' },
            {
                class: 'as-location-input-icon-ctn',
                child: 'span.mdi.mdi-google-maps'
            }
        ]
    });
};

LocationInput.prototype.share = {
    $modal: null,
    $picker: null,
    $holder: null
};


LocationInput.prototype._preparePicker = function () {
    if (this.share.$picker) return;
    this.share.$picker = _({
        tag: LocationPicker.tag
    });
    this.share.$modal = _({
        tag: 'modal',
        class: 'as-location-input-modal',
        child: {
            class: 'as-location-input-modal-window',
            child: this.share.$picker
        }
    });
    if (BrowserDetector.isMobile) {
        this.share.$modal.addClass('as-mobile');
    }
};

/***
 * @this LocationInput
 * @private
 */
LocationInput.prototype._attachPicker = function () {
    if (this.share.$holder) {
        this.share.$holder._releasePicker();
    }
    this._preparePicker();
    this.share.$holder = this;
    this.$iconCtn.off('click', this.eventHandler.clickIcon);
    document.body.appendChild(this.share.$modal);
    this.share.$picker.on('action', this.eventHandler.pickerAction);
    this.share.$picker.$searchInput.value = '';
    this.share.$picker.readOnly = this.readOnly;
    setTimeout(function () {
        document.addEventListener('click', this.eventHandler.clickOut);
    }.bind(this), 100);
    var value = this.latLng;
    if (value) {
        value = new google.maps.LatLng(value.latitude, value.longitude);
    }
    if (value)
        this.share.$picker.selectLocation(value, true);
    else this.share.$picker.selectPlace(null);
};


LocationInput.prototype._releasePicker = function () {
    if (this.share.$holder !== this) return;
    this.share.$picker.off('action', this.eventHandler.pickerAction);
    this.$iconCtn.on('click', this.eventHandler.clickIcon);
    document.removeEventListener('click', this.eventHandler.clickOut)
    this.share.$modal.remove();
    this.share.$holder = null;
};

/**
 *
 * @type {{}}
 * @memberOf LocationInput#
 */
LocationInput.eventHandler = {};

LocationInput.eventHandler.pickerAction = function (event) {
    if (!this.readOnly && event.action === 'OK' && this.share.$picker.selectedPlace && this.share.$picker.selectedPlace.geometry && this.share.$picker.selectedPlace.geometry.location) {
        this.$text.value = [this.share.$picker.selectedPlace.geometry.location.lat(), this.share.$picker.selectedPlace.geometry.location.lng()].join(', ');
        this.emit('change', { type: 'change', originalEvent: event.originalEvent || event, target: this }, this);
    }
    this._releasePicker();
};


/***
 * @this LocationInput
 */
LocationInput.eventHandler.clickIcon = function () {
    this._attachPicker();
};

/***
 * @this LocationInput
 * @param event
 */
LocationInput.eventHandler.clickOut = function (event) {
    if (event.target === this.share.$modal)
        this._releasePicker();
};

LocationInput.eventHandler.textChange = function (event) {
    this.emit('change', { type: 'change', originalEvent: event.originalEvent || event, target: this }, this);
};

LocationInput.property = {};

LocationInput.property.value = {
    set: function (value) {
        value = value || null;
        var lat, lng;
        if (typeof value === "string") {
            this.$text.value = value;
            return;
        }
        if (value instanceof Array) {
            lat = value[0];
            lng = value[1];
        }
        else if (value && typeof value === 'object') {
            if (('latitude' in value) && ('longitude' in value)) {
                lat = value.latitude;
                lng = value.longitude;
            }
            else if (value instanceof google.maps.LatLng) {
                lat = value.lat();
                lng = value.lng();
            }
        }
        if (isRealNumber(lat) && isRealNumber(lng)) {
            this.$text.value = [lat, lng].join(', ');
        }
        else {
            this.$text.value = '';
        }
    },
    get: function () {
        var nums = this.$text.value.split(/\s*,\s*/);
        var lat = parseFloat(nums[0]);
        var lng = parseFloat(nums[1]);
        if (isRealNumber(lat) && isRealNumber(lng)) {
            lat = Math.max(-90, Math.min(90, lat));
            if (lng < 180 && lng > 180)
                lng = (lng + 180 + 360 * Math.ceil(Math.abs(lng) / 360 + 2)) % 360 - 180;
            return [lat, lng].join(', ');
        }
        else {
            return '';
        }
    }
};

LocationInput.property.latLng = {
    get: function () {
        var nums = this.$text.value.split(/\s*,\s*/);
        var lat = parseFloat(nums[0]);
        var lng = parseFloat(nums[1]);
        if (isRealNumber(lat) && isRealNumber(lng)) {
            lat = Math.max(-90, Math.min(90, lat));
            if (lng < 180 && lng > 180)
                lng = (lng + 180 + 360 * Math.ceil(Math.abs(lng) / 360 + 2)) % 360 - 180;
            return { latitude: lat, longitude: lng };
        }
        else {
            return null;
        }
    }
};

LocationInput.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
        this.$text.readOnly = !!value;
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};

LocationInput.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
        this.$text.disabled = !!value;
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
};

ACore.install(LocationInput);

export default LocationInput;
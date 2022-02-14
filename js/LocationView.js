import ACore, { _ } from "../ACore";
import { isRealNumber } from "./utils";

/***
 * @extends AElement
 * @constructor
 */
function LocationView() {
    this.map = new google.maps.Map(this, { zoom: 8, center: new google.maps.LatLng(21.018755, 105.839729) });
    this.marker = null;
    this._value = null;
    /***
     * @type {LatLng}
     * @name value
     * @memberOf LocationView#
     */
}

LocationView.tag = 'LocationView'.toLowerCase();

LocationView.render = function () {
    return _({
        class: 'as-location-view'
    });
};


LocationView.property = {};


LocationView.property.zoom = {
    set: function (value) {
        if (!isRealNumber(value)) {
            value = 1;
        }
        this.map.setZoom(value);
    },
    get: function () {
        return this.map.getZoom();
    }
};


LocationView.property.value = {
    set: function (value) {
        value = value || null;
        var latlng = null;
        var nums;
        if (typeof value === "string") {
            nums = value.split(/\s*,\s*/).map(function (t) {
                return parseFloat(t);
            });
            if (isRealNumber(nums[0]) && isRealNumber(nums[1])) {
                latlng = new google.maps.LatLng(nums[0], nums[1]);
            }
        }
        else if (value instanceof google.maps.LatLng) {
            latlng = value;
        }
        else if (value && isRealNumber(value.latitude) && isRealNumber(value.longitude)) {
            latlng = new google.maps.LatLng(value.latitude, value.longitude);
        }
        else if ((value instanceof Array) && isRealNumber(value[0]) && isRealNumber(value[1])) {
            latlng = new google.maps.LatLng(value[0], value[1]);
        }
        console.log(latlng)
        latlng = latlng || new google.maps.LatLng(21.018755, 105.839729);
        this.map.setCenter(latlng || new google.maps.LatLng(21.018755, 105.839729));
        this._value = value;
        if (this.marker) {
            this.marker.setMap(null);
            this.marker = null;
        }
        if (latlng && value) {
            this.marker = new google.maps.Marker({
                map: this.map,
                position: latlng,
            });
        }
    },
    get: function () {
        return this._value;
    }
};

ACore.install(LocationView);

export default LocationView;
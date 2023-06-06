import ACore, { _ } from "../ACore";
import { getMapZoomLevel, isRealNumber } from "./utils";
import '../css/locationinput.css';
import AutoCompleteInput from "./AutoCompleteInput";
import FlexiconButton from "./FlexiconButton";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { randomIdent } from "absol/src/String/stringGenerate";


///https://developers.google.com/maps/documentation/javascript/examples/geocoding-place-id

/***
 * @extends AElement
 * @constructor
 */
function LocationPicker() {
    if (BrowserDetector.isMobile) {
        this.addClass('as-mobile');
    }
    this.map = new google.maps.Map(this, {
        zoom: 8,
        center: new google.maps.LatLng(21.018755, 105.839729),
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
        }
    });
    this.map.setOptions({ draggableCursor: 'default' });
    this.map.addListener('click', this.eventHandler.clickMap);
    this.geocoder = new google.maps.Geocoder();
    this.infoWindow = new google.maps.InfoWindow();
    window.map = this.map;
    this.$myLocationBtn = _({
        tag: 'button',
        class: 'as-location-picker-control-btn',
        child: 'span.mdi.mdi-crosshairs-gps',
        on: {
            click: this.selectMyLocation.bind(this)
        }
    });

    this.$rightBottomCtn = _({
        class: 'as-location-picker-control-ctn',
        child: [this.$myLocationBtn],
        style: {
            overflow: 'hidden'
        }
    });


    this.$searchInput = _({
        tag: AutoCompleteInput.tag,
        class: 'as-location-picker-search-input',
        props: {
            adapter: this
        },
        child: {
            class: 'as-location-picker-search-input-search-icon-ctn',
            child: 'span.mdi.mdi-magnify',
            on: {
                click: this.eventHandler.search
            }
        },
        on: {
            change: this.eventHandler.searchChange
        }
    });

    this.$searchInput.$input.on('keydown', this.eventHandler.searchKeypress)


    this.$topLeftCtn = _({
        class: ['as-location-picker-control-ctn', 'as-top'],
        child: [
            this.$searchInput
        ]
    });

    this.$okBtn = _({
            tag: FlexiconButton.tag,
            class: 'primary',
            props: {
                text: 'OK',
                disabled: true
            },
            on: {
                click: this.eventHandler.clickAction.bind(this, 'OK')
            }
        }
    );

    this.$cancelBtn = _({
            tag: FlexiconButton.tag,
            class: ['as-location-picker-cancel-btn', 'secondary'],
            props: {
                text: 'CANCEL'
            },
            on: {
                click: this.eventHandler.clickAction.bind(this, 'CANCEL')
            }
        }
    );

    this.$bottomLeftCtn = _({
        class: ['as-location-picker-control-ctn', 'as-transparent', 'as-bottom'],
        style: {
            paddingBottom: '5px'
        },
        child: [this.$okBtn, this.$cancelBtn]
    });


    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(this.$rightBottomCtn);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.$topLeftCtn);
    this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(this.$bottomLeftCtn);

    this.autoCompleteService = new google.maps.places.AutocompleteService(this.map, { fields: ["place_id", "geometry", "name", "formatted_address"] });
    this.placeService = new google.maps.places.PlacesService(this.map);

    this.selectedMarker = null;
    this.searchingMarkers = [];
    this.myLocationMarker = null;

    /***
     * @type {LatLng}
     * @name value
     * @memberOf LocationPicker#
     */
    /***
     * @type {boolean}
     * @name readOnly
     * @memberOf LocationPicker#
     */
}

LocationPicker.tag = 'LocationPicker'.toLowerCase();

LocationPicker.render = function () {
    return _({
        class: 'as-location-picker',
        extendEvent: ['action', 'location', 'requestlocation', 'error']
    });
};

LocationPicker.prototype.queryItems = function (query) {
    var request = {
        input: query,
        bounds: this.map.getBounds()
    };
    return new Promise(function (resolve) {
        this.autoCompleteService.getPlacePredictions(request, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            }
            else
                resolve([]);
        });
    }.bind(this));
};

LocationPicker.prototype.getItemText = function (item, mInput) {
    return item.description;
};


LocationPicker.prototype.getItemView = function (item, index, _, $, query, reuseItem, refParent, mInput) {
    return _({
        class: 'as-place-search-auto-complete-item',
        child: [
            {
                class: 'as-place-search-auto-complete-item-desc',
                child: { text: item.description }
            }
        ]
    });
};


LocationPicker.prototype.getBoundsZoomLevel = function (bounds) {
    var mapDim = this.getBoundingClientRect();
    return getMapZoomLevel(mapDim, bounds);
}

LocationPicker.prototype.clearSearchingMarkers = function () {
    while (this.searchingMarkers.length > 0) {
        this.searchingMarkers.pop().setMap(null);
    }
};

/**
 *
 * @param place
 * @param {boolean=} panTo
 */
LocationPicker.prototype.selectPlace = function (place, panTo) {
    if (arguments.length === 1) panTo = true;
    this.selectedPlace = place || null;
    if (this.selectedMarker) {
        this.selectedMarker.setMap(null);
    }
    this.$okBtn.disabled = !this.selectedPlace;
    if (!place) return;
    var latLng = place.geometry && place.geometry.location;
    if (!latLng) return;

    var zoom = panTo && (place.geometry.bounds || place.geometry.viewport) ? this.getBoundsZoomLevel(place.geometry.bounds || place.geometry.viewport) : 18;
    if (panTo) {
        this.map.setZoom(zoom);
        setTimeout(() => {
            this.map.panTo(latLng);
        }, 100)
    }

    this.selectedMarker = new google.maps.Marker({
        map: this.map,
        position: latLng
    });


    this.infoWindow.setContent((place.name ? place.name + ' - ' : '') + place.formatted_address);
    this.infoWindow.open(this.map, this.selectedMarker);

};

LocationPicker.prototype.showSearchPlaces = function (places) {
    this.clearSearchingMarkers();
    if (!places || places.length === 0) return;
    if (places.length === 1) {
        this.selectPlace(places[0]);
        return;
    }
    var bounds = places.reduce(function (ac, place) {
        if (place.geometry && place.geometry.location)
            ac.extend(place.geometry.location);
        return ac;
    }, new google.maps.LatLngBounds());
    var zoom = places.length === 1 ? ((places[0].geometry.bounds || places[0].geometry.viewport) ? this.getBoundsZoomLevel((places[0].geometry.bounds || places[0].geometry.viewport)) : 18) : this.getBoundsZoomLevel(bounds);
    var center = places.length === 1 ? places[0].geometry.location : bounds.getCenter();
    this.map.setCenter(center);
    this.map.setZoom(zoom);
    places.reduce(function (ac, place, i) {
        var marker;
        if (place.geometry && place.geometry.location) {
            marker = new google.maps.Marker({
                map: this.map,
                position: place.geometry.location,
                icon: 'https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_black.png'
            });
            ac.push(marker);
            marker.addListener('click', this.eventHandler.clickMarker.bind(null, marker, place));
        }
        return ac;
    }.bind(this), this.searchingMarkers);
};

/***
 *
 * @param {string} placeId
 * @param {boolean=} panTo
 */
LocationPicker.prototype.selectPlaceId = function (placeId, panTo) {
    if (arguments.length === 1) panTo = true;
    return new Promise(function (resolve) {
        this.placeService.getDetails({
            placeId: placeId,
            fields: ["name", "formatted_address", "place_id", "geometry"]
        }, function (place, status) {
            if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                place &&
                place.geometry &&
                place.geometry.location
            ) {
                this.selectPlace(place, panTo);
                resolve(true);
            }
            else {
                resolve(false);
            }
        }.bind(this));
    }.bind(this))
};

/***
 *
 * @param latLng
 * @param {boolean=} panTo
 */
LocationPicker.prototype.selectLocation = function (latLng, panTo) {
    if (arguments.length === 1) panTo = true;

    if (arguments.length === 1) panTo = true;

    if (this.selectedMarker) {
        this.selectedMarker.setMap(null);
    }
    this.$okBtn.disabled = !latLng;
    this.selectedPlace = null;
    if (!latLng) return;
    this.selectedPlace = { geometry: { location: latLng } };

    var zoom = 18;
    if (panTo) {
        this.map.setZoom(zoom);
        setTimeout(() => {
            this.map.panTo(latLng);
        }, 100)
    }


    this.selectedMarker = new google.maps.Marker({
        map: this.map,
        position: latLng
    });


    // this.infoWindow.open(this.map, this.selectedMarker);

    /*
    return this.geocoder
        .geocode({ location: latLng })
        .then(function (response) {
            if (response.results[0]) {
                return this.selectPlaceId(response.results[0].place_id, panTo);
            }
            else {
                return false;
            }
        }.bind(this))
        .catch(function (e) {
            safeThrow(e);
            return false;
        });

     */
};

LocationPicker.prototype.watchMyLocation = function (location, position) {
    if (this.myLocationMarker) return;

    this.accuracyCircle = new google.maps.Circle({
        strokeColor: "#1988c3",
        strokeOpacity: 0.4,
        strokeWeight: 2,
        fillColor: "#1988c3",
        fillOpacity: 0.2,
        radius: 100,
        map: this.map
    });
    this.myLocationMarker = new google.maps.Marker({
        position: location,
        sName: "My Location",
        map: this.map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "rgb(22, 118, 230)",
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: 'white'
        },
    });

    if (position && position.coords) {
        this.accuracyCircle.setRadius(position.coords.accuracy);
        // Snackbar.show('Accuracy: ' + position.coords.accuracy.toFixed(1) + '(m)');
    }


    var id;
    if (navigator.geolocation.watchPosition && navigator.geolocation.watchPosition) {
        id = navigator.geolocation.watchPosition(function (props) {
            if (!this.isDescendantOf(document.body)) {
                navigator.geolocation.clearWatch(id);
            }
            this.emit('location_now', { location: props.coords });
            this.myLocationMarker.setPosition(new google.maps.LatLng(props.coords.latitude, props.coords.longitude));
            this.accuracyCircle.setCenter(new google.maps.LatLng(props.coords.latitude, props.coords.longitude));
            this.accuracyCircle.setRadius(props.coords.accuracy);
            // Snackbar.show('Sai số tọa độ: ' + props.coords.accuracy.toFixed(1) + ' mét');

        }.bind(this), function () {
        }, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
        });

    }

}


LocationPicker.prototype.selectMyLocation = function () {
    var id = randomIdent();
    this.emit('requestlocation', { id: id });
    if (navigator.geolocation) {
        var to = setTimeout(() => {
            this.emit('error', Object.assign(new Error("GPS không phản hồi!"), { id: id }));
        }, 10000);
        navigator.geolocation.getCurrentPosition((position) => {
            clearTimeout(to);
            var location = null;
            if (position && position.coords) {
                this.emit('location', { location: position.coords, id: id });
                location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            }

            if (location) {
                this.watchMyLocation(location, position);
                if (!this.readOnly)
                    this.selectLocation(location);
                else {
                    this.map.setCenter(location)
                }
            }

        }, (err) => {
            clearTimeout(to);
            if (err && err.message.indexOf('denied') >=0)
                err = Object.assign(new Error("Yêu cầu lấy tọa độ bị từ chối!"), { id: id });
            this.emit('error', err);
        }, { maximumAge: Infinity});
    }
};

LocationPicker.property = {};


LocationPicker.property.zoom = {
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


LocationPicker.property.center = {
    set: function (value) {
        value = value || null;
        var latlng = null;
        if (value instanceof google.maps.LatLng) {
            latlng = value;
        }
        else if (value && isRealNumber(value.latitude) && isRealNumber(value.longitude)) {
            latlng = new google.maps.LatLng(value.latitude, value.longitude);
        }
        else if ((value instanceof Array) && isRealNumber(value[0]) && isRealNumber(value[1])) {
            latlng = new google.maps.LatLng(value[0], value[1]);
        }
        latlng = latlng || new google.maps.LatLng(21.018755, 105.839729);
        this.map.setCenter(latlng || new google.maps.LatLng(21.018755, 105.839729));
    },
    get: function () {
        return this.map.getCenter();
    }
};

LocationPicker.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};


/***
 *
 * @type {{}}
 * @memberOf LocationPicker#
 */
LocationPicker.eventHandler = {};

/***
 * @this LocationPicker
 */
LocationPicker.eventHandler.searchKeypress = function (event) {
    if (event.key === 'Enter')
        setTimeout(function () {
            if (!this.$searchInput.selectedItem) {
                this.eventHandler.search();
            }
        }.bind(this), 100);
};


LocationPicker.eventHandler.searchChange = function () {
    var item = this.$searchInput.selectedItem;
    if (!item) return;
    this.placeService.getDetails({
        placeId: item.place_id,
        fields: ["name", "formatted_address", "place_id", "geometry"]
    }, function (place, status) {
        if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
        ) {
            this.selectPlace(place);
        }
    }.bind(this));
};


/***
 * @this LocationPicker
 */
LocationPicker.eventHandler.search = function () {
    var request = {
        bounds: this.map.getBounds(),
        query: this.$searchInput.value
    };

    this.placeService.textSearch(request, function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            this.showSearchPlaces(results);
        }
    }.bind((this)));
};

LocationPicker.eventHandler.clickMarker = function (marker, place) {
    if (this.readOnly) return;
    this.selectPlace(place, false);
};

LocationPicker.eventHandler.clickMap = function (event) {
    if (this.readOnly) return;
    if (event.placeId) {
        this.selectPlaceId(event.placeId);
    }
    else if (event.latLng) {
        this.selectLocation(event.latLng, false);
    }
}
;

LocationPicker.eventHandler.clickAction = function (action, event) {
    this.emit('action', { type: 'action', action: action, originalEvent: event, target: this }, this);
};


ACore.install(LocationPicker);

export default LocationPicker;
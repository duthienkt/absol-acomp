import ACore, { _ } from "../ACore";
import { getMapZoomLevel, implicitLatLng, isRealNumber, latLngDistance } from "./utils";
import DomSignal from "absol/src/HTML5/DomSignal";
import { randomIdent } from "absol/src/String/stringGenerate";
import Color from "absol/src/Color/Color";
import MarkerClusterer from "./MarkerClusterer";

var MARKER_RADIUS = 10;
var MARKER_BORDER_COLOR = '#4945C8';

function generateColor(id) {
    id = id + '';
    var rgb = [0, 0, 0];
    var res;
    var white = Color.parse('white');
    var c = 100;
    while (c--) {
        for (var i = 0; i < id.length; ++i) {
            rgb[i % 3] = (rgb[i % 3] * 31 + id.charCodeAt(i) * 173) % 255;
        }
        res = new Color([rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1]);
        if (res.getContrastWith(white) > 2 && rgb[0] + rgb[1] + rgb[2] > 50) {
            break;
        }
    }
    return res;
}

// https://lab.daithangminh.vn/home_co/carddone/markerclusterer.js

var loadMarkerClustererSync = null;



var lastOpenInfo = null;

/***
 *
 * @param {LocationView} viewerElt
 * @param {Object} data
 * @constructor
 */
function LVPolyline(viewerElt, data) {
    this.viewerElt = viewerElt;
    this.map = viewerElt.map;
    this._polylines = [];

    this.id = data.id || randomIdent(12);

    this.polylineData = {
        geodesic: true,
        strokeColor: data.color || generateColor(this.id).toString('hex6'),
        strokeOpacity: 1.0,
        strokeWeight: 2,
    };
    this.polylineData.path = data.path.map(function (crd) {
        return implicitLatLng(crd);
    });
    this.polylineHL = new google.maps.Polyline(Object.assign({}, this.polylineData, {
        strokeColor: 'white',
        strokeWeight: 5
    }));
    this.polyline = new google.maps.Polyline(this.polylineData);
    this.markers = this.polylineData.path.map(function (crd, i) {
        var mkr = new google.maps.Marker({
            position: crd,
            // sName: data.name || data.id || this.id,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: MARKER_RADIUS,
                fillColor: this.polylineData.strokeColor,
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: MARKER_BORDER_COLOR
            },
        });
        mkr.setMap(this.map);
        var infoWindow;
        if (data.path[i] && data.path[i].info) {
            infoWindow = new google.maps.InfoWindow(data.path[i].info);
            mkr.addListener('mouseover', function () {
                if (lastOpenInfo === infoWindow) return;
                try {
                    if (lastOpenInfo) lastOpenInfo.close();
                } catch (e) {

                }

                lastOpenInfo = infoWindow;
                infoWindow.open({
                    anchor: mkr,
                    map: this.map,
                    shouldFocus: true
                });
            }.bind(this))
        }
        return mkr;
    }.bind(this));
    this.showRoute = viewerElt.showPolylineRoute;
}

LVPolyline.prototype.remove = function () {
    this.polyline.setMap(null);
    this.polylineHL.setMap(null);
    this.markers.forEach(function (mk) {
        mk.setMap(null);
    })

};

Object.defineProperty(LVPolyline.prototype, 'showRoute', {
    set: function (value) {
        this._showRoute = !!value;
        if (value) {
            this.polylineHL.setMap(this.map);
            this.polyline.setMap(this.map);
        }
        else {
            this.polylineHL.setMap(null);
            this.polyline.setMap(null);
        }
    },
    get: function () {
        return this._showRoute;
    }
});

Object.defineProperty(LVPolyline.prototype, 'color', {
    get: function () {
        return this.polylineData.strokeColor;
    }
});

Object.defineProperty(LVPolyline.prototype, 'sumDistance', {
    get: function () {
        var res = 0;
        var path = this.polylineData.path;
        for (var i = 1; i < path.length; ++i) {
            res += latLngDistance(path[i - 1], path[i]);
        }
        return res;
    }
});


function LVPoints(viewerElt, data) {
    this.data = data;
    this.refData = [data];
    this.id = data.id || randomIdent(12);
    this.latLng = implicitLatLng(data);
    if (!this.latLng) {
        console.error('Invalid data', data);
        return;
    }
    this.map = viewerElt.map;
    this.marker = new google.maps.Marker({
        position: this.latLng,
        // sName: data.name || data.id || this.id,
        // map: this.map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: MARKER_RADIUS,
            fillColor: data.color || generateColor(this.id).toString(),
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor:  MARKER_BORDER_COLOR
        },
    });
    // this.marker.setMap(this.map);

    if (!data.info) return;
    var infoWindow = new google.maps.InfoWindow(data.info);
    this.marker.addListener('mouseover', function () {
        if (lastOpenInfo === infoWindow) return;
        try {
            if (lastOpenInfo) lastOpenInfo.close();
        } catch (e) {

        }

        lastOpenInfo = infoWindow;
        infoWindow.open({
            anchor: this.marker,
            map: this.map,
            shouldFocus: true
        });
    }.bind(this))

}


LVPoints.prototype.remove = function () {
    if (this.marker)
        this.marker.setMap(null);
}

/***
 * @extends AElement
 * @constructor
 */
function LocationView() {
    this.map = new google.maps.Map(this, { zoom: 8, center: new google.maps.LatLng(21.018755, 105.839729),  scaleControl: true });
    this.marker = null;
    this._value = null;
    this.$domSignal = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$domSignal);
    /***
     * @type {LatLng}
     * @name value
     * @memberOf LocationView#
     */
    /****
     *
     * @type {LVPolyline[]}
     */
    this.$polylines = [];
    this._showPolylineRoute = true;

    /****
     *
     * @type {LVPoints[]}
     */
    this.$points = [];

}

LocationView.tag = 'LocationView'.toLowerCase();

LocationView.render = function () {
    return _({
        class: 'as-location-view'
    });
};

LocationView.prototype.getPolylineById = function (id) {
    return this.$polylines.find(function (pll) {
        return pll.id === id;
    }) || null;
};

LocationView.prototype.getPolylines = function () {
    return this.$polylines.slice();
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
        var latlng = implicitLatLng(value);
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

LocationView.property.polylines = {
    set: function (polylines) {
        this._polylines = polylines || [];
        this.$polylines.forEach(function (pll) {
            pll.remove();
        });


        this.$polylines = polylines.map(function (pll) {
            return new LVPolyline(this, pll);
        }.bind(this));
        var zoom;
        var center;
        var points = this.$polylines.reduce(function (ac, $polyline) {
            return ac.concat($polyline.polylineData.path);
        }, []);

        var bounds = points.reduce(function (ac, cr) {
            ac.extend(cr);
            return ac;
        }, new google.maps.LatLngBounds());

        this.domSignal.once('update_view', function () {
            if (points.length > 1) {
                zoom = getMapZoomLevel(this.getBoundingClientRect(), bounds);
                center = bounds.getCenter();
            }
            else {
                zoom = 17;
                center = points[0] || new google.maps.LatLng(21.018755, 105.839729);
            }
            zoom = Math.min(zoom, 17);
            this.map.setZoom(zoom);
            this.map.setCenter(center);
        }.bind(this), 100);
        this.domSignal.emit('update_view');
    },
    get: function () {
        return this._polylines;
    }
};

LocationView.property.showPolylineRoute = {
    set: function (value) {
        this._showPolylineRoute = !!value;
        this.$polylines.forEach(function (pll) {
            pll.showRoute = value;
        })
    },
    get: function () {
        return this._showPolylineRoute;
    }
};


LocationView.property.points = {
    set: function (points) {
        this.$points.forEach(function (point) {
            point.remove();
        });
        this._points = points || [];


        var rp = this._points.reduce(function (ac, pointData) {
            var id = pointData.id;
            var point;
            if (id && ac.dict[id]) {
                ac.dict[id].refData.push(pointData);
            }
            else {
                point = new LVPoints(this, pointData);
                ac.dict[point.id] = point;
                ac.arr.push(point);
            }

            return ac;
        }.bind(this), { arr: [], dict: {} });

        this.$points = rp.arr;

        var zoom;
        var center;
        var latLngs = this.$points.map(function (p) {
            return p.latLng;
        }, []).filter(function (x) {
            return !!x;
        });
        var bounds = latLngs.reduce(function (ac, cr) {
            ac.extend(cr);
            return ac;
        }, new google.maps.LatLngBounds());

        var markers = this.$points.map(function (p) {
            return p.marker;
        }, []).filter(function (x) {
            return !!x;
        });
        this.pointsCluster = new MarkerClusterer(this.map, markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

        this.domSignal.once('update_view', function () {
            if (points.length > 1) {
                zoom = getMapZoomLevel(this.getBoundingClientRect(), bounds);
                center = bounds.getCenter();
            }
            else {
                zoom = 17;
                center = points[0] || new google.maps.LatLng(21.018755, 105.839729);
            }
            zoom = Math.min(zoom, 17);
            this.map.setZoom(zoom);
            this.map.setCenter(center);
        }.bind(this), 100);
        this.domSignal.emit('update_view');
    },
    get: function () {
        return this._points;
    }
}

ACore.install(LocationView);

export default LocationView;
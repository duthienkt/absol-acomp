import ACore, { _ } from "../ACore";
import { getMapZoomLevel, implicitLatLng, isRealNumber, latLngDistance } from "./utils";
import DomSignal from "absol/src/HTML5/DomSignal";
import { randomIdent } from "absol/src/String/stringGenerate";
import Color from "absol/src/Color/Color";
import { getGoogleMarkerLib } from "./LocationPicker";
import Svg from "absol/src/HTML5/Svg";

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

function distanceInPixels(zoom, latLng1, latLng2) {
    // Calculate the geographical distance in meters
    var R = 6371000; // Earth's radius in meters
    var lat1 = latLng1.lat() * Math.PI / 180;
    var lat2 = latLng2.lat() * Math.PI / 180;
    var deltaLat = (latLng2.lat() - latLng1.lat()) * Math.PI / 180;
    var deltaLng = (latLng2.lng() - latLng1.lng()) * Math.PI / 180;

    var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distanceInMeters = R * c;


    // Calculate the resolution (meters per pixel)
    var scale = 156543.03392 * Math.cos(lat1) / Math.pow(2, zoom);

    // Convert meters to pixels
    return distanceInMeters / scale;

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
    this.template = _({
        style: {
            position: 'relative',
        },
        child: {
            tag: 'div',
            style: {
                width: `${MARKER_RADIUS * 2}px`,
                height: `${MARKER_RADIUS * 2}px`,
                position: 'absolute',
                top: `${-MARKER_RADIUS}px`,
                left: `${-MARKER_RADIUS}px`,
                borderRadius: '50%',
                backgroundColor: this.polylineData.strokeColor,
                border: `2px solid ${MARKER_BORDER_COLOR}`,
                boxSizing: 'border-box',
            }
        }
    });
    this.markers = this.polylineData.path.map(function (crd, i) {
        var anchor = this.template.cloneNode(true);
        var mkr = new google.maps.marker.AdvancedMarkerElement({
            position: crd,
            map: this.map,
            content: anchor,
        });


        var infoWindow;
        if (data.path[i] && data.path[i].info) {
            infoWindow = new google.maps.InfoWindow(data.path[i].info);
            anchor.addEventListener('mouseover', function () {
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
            })
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
    this.viewNumber = 0;


}

LVPoints.prototype.numberToHue = function (number) {
    var res = 0;

    var hs = 1;
    for (var i = 0; (i < 4 && number > 1); ++i) {
        hs *= 10;
        res += Math.log(Math.min(number, hs)) / Math.log(hs) * 0.25;
        number -= hs;
    }

    res = Math.min(0.8, res);
    return res;
};

LVPoints.prototype.number2Image = function (number) {
    var data = this.data;
    var color = number === 1 ? data.color || generateColor(this.id).toString() : Color.fromHSL(this.numberToHue(number), 1, 0.5).toString();
    try {
        color = Color.parse(color);
    } catch (e) {
        color = number === 1 ? generateColor(this.id) : Color.fromHSL(this.numberToHue(number), 1, 0.4)
    }
    var textColor = color.getContrastYIQ().toString('hex8');
    color = color.toString('hex8');

    var outLineCount;
    var radius;
    if (number <= 1) {
        outLineCount = 0;
        radius = 10;
    }
    else {
        outLineCount = ((number + '').length);
        radius = 5 + outLineCount * 2;

    }
    var canvasSize = 2 * (radius + 5 * outLineCount + 2);

    var res = {
        tag: 'svg',
        style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer'
        },
        attr: {
            width: canvasSize + '',
            height: canvasSize + '',
            viewBox: [-canvasSize / 2, -canvasSize / 2, canvasSize, canvasSize].join(' ')
        },
        child: [
            {
                tag: 'circle',
                attr: {
                    cx: 0,
                    cy: 0,
                    r: radius,
                },
                style: {
                    fill: color,
                    stroke: number === 1 ? 'white' : 'none',
                    'stroke-width': number === 1 ? 4 : 0,
                }
            }
        ]
    };

    var path, r;
    var j, sAngle, eAngle;
    var angle;
    var delta = 2 * Math.PI / 5;
    for (var i = 0; i < outLineCount; ++i) {
        angle = -Math.PI / 2 - delta / 2;
        r = radius + 3 + i * 5;
        path = '';
        for (j = 0; j < 5; ++j) {
            angle += delta;
            sAngle = angle + 0.1;
            eAngle = angle + delta - 0.1;
            path += ['M', Math.cos(sAngle) * r, Math.sin(sAngle) * r].join(' ') + ' ';
            path += ['A', r, r, 0, 0, 1, Math.cos(eAngle) * r, Math.sin(eAngle) * r].join(' ') + ' ';
        }
        res.child.push({
            tag: 'path',
            style: {
                fill: 'none',
                stroke: color,
                'stroke-width': 4
            },
            attr: {
                d: path,
                opacity: 0.5 - 0.5 * i / outLineCount,
            },
        });
    }


    if (number > 1) {
        res.child.push({
            tag: 'text',
            attr: {
                x: 0,
                y: 0,
                'dominant-baseline': 'middle',
                'text-anchor': 'middle',
                fill: textColor,
                'font-size': 10,
                'font-weight': 'bold'
            },
            child: {
                text: number + ''
            }
        })
    }


    return Svg.ShareInstance._(res);
};

/**
 *
 * @param {number} number - <0: not show>
 */
LVPoints.prototype.view = function (number) {
    if (!isRealNumber(number)) number = 0;
    number = Math.max(0, Math.floor(number));
    if (this.viewNumber === number) return;
    this.viewNumber = number;
    var data = this.data;
    if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
        this.content = null;
    }
    if (number <= 0) return;


    this.content = this.number2Image(number);

    this.marker = new google.maps.marker.AdvancedMarkerElement({
        position: this.latLng,
        map: this.map,
        content: this.content,
    });

    this.marker.getMap = this.marker.getMap || (function () {
        return this.map;
    });


    this.marker.getPosition = () => {
        return this.latLng;
    }
    this.marker.setMap(this.map);

    if (number === 1) {
        if (this.data.info && !this.infoWindow) {
            this.infoWindow = new google.maps.InfoWindow(this.data.info);
        }

        if (this.infoWindow ) {
            this.content.on('mouseover', () => {
                if (lastOpenInfo === this.infoWindow) return;
                try {
                    if (lastOpenInfo) lastOpenInfo.close();
                } catch (e) {

                }

                lastOpenInfo = this.infoWindow;
                this.infoWindow.open({
                    anchor: this.marker,
                    map: this.map,
                    shouldFocus: true
                });
            })
        }

    }
    else if (number >1) {
        this.content.on('click', ()=>{
            this.map.setCenter(this.latLng);
            this.map.setZoom(this.map.getZoom()+1);
        })
    }
}


LVPoints.prototype.remove = function () {
    if (this.marker)
        this.marker.setMap(null);
    this.content = null;
    this.marker = null;
    this.infoWindow = null;

}


/**
 *
 * @param {LocationView} lvElt
 * @param {LVPoints[]} points
 * @constructor
 */
function LVCluster(lvElt, points) {
    this.lvElt = lvElt;
    this.points = points;
    /**
     *
     * @type {Object<string, LVPoints>}
     */
    this.pointDict = this.points.reduce((ac, cr) => {
        ac[cr.id] = cr;
        return ac;
    }, {})

    this.viewingPoints = {};
    this.map = lvElt.map;
    this.zoom = this.map.getZoom();
    this.bounds = this.map.getBounds();
    this.idleTO = -1;
    this.onIdle = this.onIdle.bind(this);
}


LVCluster.prototype.onProcessed = function () {
    if (this.idleTO >= 0) {
        clearTimeout(this.idleTO);
    }
    this.idleTO = setTimeout(this.onIdle, 500);
};

LVCluster.prototype.onIdle = function () {
    this.idleTO = -1;
    this.bounds = this.map.getBounds();
    this.zoom = this.map.getZoom();
    if (!this.bounds) return;
    var newViewPoints = this.points.reduce((ac, point) => {
        if (!this.bounds.contains(point.latLng)) return ac;
        var rPoint;
        for (var rId in ac) {
            rPoint = this.pointDict[rId];
            if (distanceInPixels(this.zoom, rPoint.latLng, point.latLng) < 50) {
                ac[rId]++;
                return ac;
            }
        }
        ac[point.id] = 1;
        return ac;
    }, {});

    var id;
    var oldViewPoints = this.viewingPoints;
    for (id in oldViewPoints) {
        if (!newViewPoints[id]) {
            if (this.pointDict[id]) {
                this.pointDict[id].view(0);
            }
        }
    }

    for (id in newViewPoints) {
        if (this.pointDict[id]) {
            this.pointDict[id].view(newViewPoints[id]);
        }
    }
    this.viewingPoints = newViewPoints;
};


/***
 * @extends AElement
 * @constructor
 */
function LocationView() {
    this.map = new google.maps.Map(this, {
        zoom: 8,
        center: new google.maps.LatLng(21.018755, 105.839729),
        scaleControl: true,
        mapId: randomIdent()
    });
    google.maps.event.addListener(this.map, "zoom_changed", this.eventHandler.mapZoomChanged);
    google.maps.event.addListener(this.map, 'bounds_changed', this.eventHandler.mapBoundsChanged);

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
        getGoogleMarkerLib().then(() => {
            if (this.marker) {
                this.marker.setMap(null);
                this.marker = null;
            }
            if (latlng && value) {
                this.marker = new google.maps.marker.AdvancedMarkerElement({
                    map: this.map,
                    position: latlng,
                });
            }
        })

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

        getGoogleMarkerLib().then(() => {
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
        })


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
    /**
     * @this LocationView
     * @returns {*|boolean}
     */
    get: function () {
        return this._showPolylineRoute;
    }
};


LocationView.property.points = {
    /**
     * @this LocationView
     * @param points
     */
    set: function (points) {
        this.$points.forEach(function (point) {
            point.remove();
        });
        this._points = points || [];

        getGoogleMarkerLib().then(() => {
            var now = Date.now();
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


            this.pointsCluster = new LVCluster(this, this.$points);
            // console.log('set points', Date.now() - now);

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
                if (this.pointsCluster) this.pointsCluster.onProcessed();
            }.bind(this), 100);
            this.domSignal.emit('update_view');
        });
    },
    get: function () {
        return this._points;
    }
}

LocationView.eventHandler = {};

LocationView.eventHandler.mapZoomChanged = function () {
    if (this.pointsCluster)
        this.pointsCluster.onProcessed();
    // var now = Date.now();
    // var eltRect = Rectangle.fromClientRect(this.getBoundingClientRect());
    // var bounds = this.map.getBounds();
    // // var mapRect = new Rectangle()
    //
    // console.log('zoom changed', Date.now() - now);

};

LocationView.eventHandler.mapBoundsChanged = function () {
    if (this.pointsCluster)
        this.pointsCluster.onProcessed();
};


ACore.install(LocationView);

export default LocationView;

function render(o) {
    return absol._(o).addTo(document.body);
}

//
// var map;
// var service;
// var infowindow;
// function createMarker(place) {
//     if (!place.geometry || !place.geometry.location) return;
//
//     const marker = new google.maps.Marker({
//         map,
//         position: place.geometry.location,
//     });
//
//     google.maps.event.addListener(marker, "click", () => {
//         infowindow.setContent(place.name || "");
//         infowindow.open(map);
//     });
// }

function main() {
    render('<h2>Location Input</h2>');
    render({
        tag: 'locationinput',
        props: {
            value: { latitude: 10.799956, longitude: 106.710672 },//default type //or
            //value:'10.799956,106.710672',//or
            //value:[ 10.799956, 106.710672],//or
            //value:new google.map.LatLng(latitude: 10.799956, longitude:106.710672 )

        },
        on: {
            change: function (event) {
                viewer.value = this.value;
                absol.require('snackbar').show(JSON.stringify(this.value));
            }
        }
    });

    render('<h2>Location View</h2>');

    var viewer = render({
        tag: 'locationview',
        style: {
            height: '300px',
            margin: '50px'
        },
        props: {
            value: { latitude: 10.799956, longitude: 106.710672 },
            zoom: 16
        }
    });

    render('<h3>disabled = true</h3>');
    render({
        tag: 'locationinput',
        props: {
            value: { latitude: 10.799956, longitude: 106.710672 },//default type //or
            disabled: true
        }
    });

    render('<h3>readOnly = true</h3>');

    render({
        tag: 'locationinput',
        props: {
            value: { latitude: 10.799956, longitude: 106.710672 },//default type //or
            value: { lat: 37.772, lng: -122.214 },
            readOnly: true
        }
    });


    render('<h3>Location View - Polylines</h3>');
    var viewer = render({
        tag: 'locationview',
        style: {
            height: '700px',
            margin: '50px'
        },
        props: {
            polylines: [
                {
                    id: "sabc1",
                    path: Array(36).fill(null).map(function (u, i) {
                        return {
                            lat: 10.8258993 + Math.sin(i * Math.PI / 18) * (0.15 + Math.random() / 5),
                            lng: 106.7122713 + Math.cos(i * Math.PI / 18) * (0.15 + Math.random() / 5),
                            info: {
                                content: 'Nội dung'
                            }
                        }
                    }),
                    //default: color: 'red'
                },
                {
                    id: "sabc2",
                    path: Array(36).fill(null).map(function (u, i) {
                        return {
                            lat: 10.8258993 + Math.sin(i * Math.PI / 18) * (0.5 + Math.random() / 5),
                            lng: 106.7122713 + Math.cos(i * Math.PI / 18) * (0.5 + Math.random() / 5),
                            info: {
                                content: 'Nội dung'
                            }
                        }
                    }),
                    // color: 'green'//default: red
                },
                {
                    id: "sabc3",
                    path: Array(36).fill(null).map(function (u, i) {
                        return {
                            lat: 10.8258993 + Math.sin(i * Math.PI / 18) * (0.5 + Math.random() / 5),
                            lng: 106.7122713 + Math.cos(i * Math.PI / 18) * (0.5 + Math.random() / 5),
                            info: {
                                content: 'Nội dung'
                            }
                        }
                    }),
                    // color: 'green'//default: red
                }
            ],
        }
    });

    var viewer = render({
        tag: 'locationview',
        style: {
            height: '700px',
            margin: '50px'
        },
        props: {
            showPolylineRoute: false,
            polylines: [
                {
                    id: "sabc1",
                    path: Array(36).fill(null).map(function (u, i) {
                        return {
                            lat: 10.8258993 + Math.sin(i * Math.PI / 18) * (0.15 + Math.random() / 5),
                            lng: 106.7122713 + Math.cos(i * Math.PI / 18) * (0.15 + Math.random() / 5)
                        }
                    }),
                    //default: color: 'red'
                },
                {
                    id: "sabc2",
                    path: Array(36).fill(null).map(function (u, i) {
                        return {
                            lat: 10.8258993 + Math.sin(i * Math.PI / 18) * (0.5 + Math.random() / 5),
                            lng: 106.7122713 + Math.cos(i * Math.PI / 18) * (0.5 + Math.random() / 5),

                        }
                    }),
                    // color: 'green'//default: red
                },
                {
                    id: "sabc3",
                    path: Array(36).fill(null).map(function (u, i) {
                        return {
                            lat: 10.8258993 + Math.sin(i * Math.PI / 18) * (0.5 + Math.random() / 5),
                            lng: 106.7122713 + Math.cos(i * Math.PI / 18) * (0.5 + Math.random() / 5)
                        }
                    }),
                    // color: 'green'//default: red
                }
            ],
        }
    });

    render('<h3>Location View - Points</h3>');

    var viewer1 = render({
        tag: 'locationview',
        style: {
            height: '700px',
            margin: '50px'
        },
        props: {
            showPolylineRoute: false,
            points: Array(36).fill(0).map(function (u, i) {
                return {
                    id: 'my_point_' + i,
                    lat: 10.8258993 + Math.sin(i * Math.PI / 18) * (0.15 + Math.random() / 5),
                    lng: 106.7122713 + Math.cos(i * Math.PI / 18) * (0.15 + Math.random() / 5),
                    info: {//can be null
                        content: 'Nội dung điểm ' + i
                    },
                    color: 'red'
                };
            })
        }
    });


    var testBtn = render({
        tag: 'flexiconbutton',
        props: {
            text: 'set_points'
        },
        on: {
            click: function () {
                points = require('./locations.js');
                console.log(points)
                var now = new Date().getTime();
                viewer1.points = points;
                console.log(new Date().getTime() - now);
                this.remove();

            }
        }
    });

}

mapSync.then(main);
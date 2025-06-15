function render(o) {
    return absol._(o).addTo(document.body);
}

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
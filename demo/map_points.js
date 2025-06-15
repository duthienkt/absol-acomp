function render(o) {
    return absol._(o).addTo(document.body);
}
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
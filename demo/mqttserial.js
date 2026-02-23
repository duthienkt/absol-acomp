/*
var DEVICE_NAME = "CRYSTAL_MINI_001";
var CHANNEL = "duthienkt/serial";

var client = mqtt.connect('wss:absol.cf:9884');

client.on('connect', () => {
    client.subscribe(CHANNEL + '/online', (err) => {
        if (!err) {
            console.log('Subscribed to topic ' + CHANNEL + '/online');
        }
        else {
            console.error('Subscribe error:', err);
        }
    });

    client.subscribe(CHANNEL + '/' + DEVICE_NAME + '/tx', (err) => {
        if (!err) {
            console.log('Subscribed to topic ' + CHANNEL + '/online');
        }
        else {
            console.error('Subscribe error:', err);
        }
    });
});

client.on('message', (topic, message) => {
    console.log(topic, message.toString());
});

window.print = function (message) {
    client.publish(CHANNEL + '/' + DEVICE_NAME + '/rx', message);
}

 */

var input = absol._({
    tag:'gsminput'
}).addTo(document.body);
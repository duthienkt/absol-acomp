function render(o) {
    return absol._(o).addTo(document.body);
}

render('<h2>Data Over RGB</h2>');

var tx = render({
  tag:'DataOverRGBTx'.toLowerCase()
});

function sendLoop(){
    tx.begin();
    tx.sendString('Hello World!');
    tx.then(sendLoop);
}

sendLoop();



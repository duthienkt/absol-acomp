var rows = document.querySelectorAll('.simpleTable >table >tbody > tr');
rows = Array.prototype.slice.call(rows);

var doneRows = rows.filter(x => x.innerText.indexOf('unknown: Unexpected toke')>=0);



var clicker = doneRows.map(row=>{
   var clicker = row.querySelector('td > a');

    return clicker;
}).filter(x=> !!x);

var i = 0;

function  doTask(){
    clicker[i].click();
    i++;
    var select = document.querySelector('select');
    select.value = '2';
    var button = document.querySelector('.DOMElement_class_16 button');
    if (button) {
        button.click();
    }
    if (i < clicker.length)
    setTimeout(doTask, 500)
}

doTask();


function test() {
    _('<h2>Test</h2>').addTo(document.body);
    var menu1 = _({
        tag: MultiCheckTreeMenu,
        props:{
            enableSearch:true
        }
    }).addTo(document.body);

    var menu2 = _({
        tag: MultiCheckTreeMenu,
        props:{
            enableSearch:true,
            leafOnly:true
        }
    }).addTo(document.body);
    var availableValues = [];
    var items = [];

    function delay(n, value){
        return new Promise(resolve => setTimeout(resolve, n, value));
    }

    var sync = remoteRequireNodeAsync("https://absol.cf/libs/absol-acomp/demo/sample_data/multichecktreemenuitems1.js")
        .then(items1=>{
            items = items1;
            menu1.items = items;
            menu2.items = items;
            return delay(5);
        }).then(()=>{
            function visit(item){
                availableValues.push(item.value);
                if (item.items) {
                    item.items.forEach((cItem) => {
                        visit(cItem);
                    })
                }

            }
            items.forEach(cItem => visit(cItem));
        });
    var corrector = new MCTMDCorrectingValues(menu1);


    var count = 0;
    for (var i = 0; i < 0; ++i) {
        sync = sync.then(()=>{
            count++;
            console.log("Test case: ", count);
            var values = availableValues.slice();
            arrayShuffle(values);
            values = values.slice(0, Math.floor(Math.random() *(values.length - 1)) + 1);
            menu1.values = values;
            var menuValues = menu1.values;
            var crValues = corrector.correctNonLeafValues(values, false);
            var ok = arrayCompare(menuValues, crValues);
            console.assert(ok, "Values not match! ", { values, menuValues, crValues });
            return delay(100);
        })
    }

    count = 0;
    for (var i = 0; i < 500; ++i) {
        sync = sync.then(()=>{
            count++;
            console.log("Test case: ", count);
            var values = availableValues.slice();
            arrayShuffle(values);
            values = values.slice(0, Math.floor(Math.random() *40) + 1);
            menu2.values = values;
            var menuValues = menu2.values.slice();
            var crValues = corrector.correctLeafValues(values).slice();
            menuValues.sort((a, b) => a - b);
            crValues.sort((a, b) => a - b);
            var ok = arrayCompare(menuValues, crValues, false);
            console.assert(ok, "Values not match! ", { values, menuValues, crValues });
            return delay(100);
        })
    }

    _('<h2></h2>').addTo(document.body);

}


setTimeout(test, 1000);


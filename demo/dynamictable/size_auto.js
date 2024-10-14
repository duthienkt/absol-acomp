var _ = absol._;
var $ = absol.$;


var data = {
    head:{
      rows: [
          {
              cells:Array(40).fill(null).map((u, i) => {
                  return {
                      child: `<table style="width: 100%;"><tbody><tr><td align="center"><span>Kỹ năng sử dụng ngoại ngữ - ok</span></td><td style="width: 30px;"><div class="card-icon-cover"><i class="mdi mdi-book-open-blank-variant bsc-icon-hover-black"></i></div><div><div class="card-icon-cover" style="margin-left: 5px;"><i class="material-icons bsc-icon-hover-black">create</i></div></div></td></tr></tbody></table>`
                  }
              })
          }
      ]
    },
    body: {
        rows: Array(18).fill(null).map((u, i) => {
            return {
                id: i + '',
                cells: Array(40).fill(null).map((u, j) => {
                    return {
                        child: { tag: 'span', child: { text: 'Cell '+j+' row ' + (i + 1) } }
                    };
                })
            }
        })
    }
};

var tb = _({
    tag: 'dynamictable',
    style:{
      maxHeight:'800px'
    },
    props: {
        adapter: {
            data: data
        }
    }
}).addTo(document.body);

// tb.viewIntoRow('100')

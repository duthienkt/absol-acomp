## Tạo mới, mở rộng

Tạo mới, tương tự các module khác
```js
var dragSpace = _({
	tag: 'hanger',
  props:{hangOn: 2},//mặc định là 0
  on:{
  	predrag: function(event) {
      if (event.target.hasClass("some-thing-to-check")){
      	event.cancel();//hủy bỏ sự kiện drag, lúc này dragstart, dragend, drag sẽ không xảy ra
      }
      else {
        event.preventDefault();//trong 1 số trường hợp, cần phải chặn sự kiện hệ thống, tránh lỗi
      }
    },

  	dragstart: function(event) {
    },
    
  	drag: function(event) {
    },
    
  	dragend: function(event) {
    },
  }
});

```

> Chỉ khi nào khoảng cách di chuyển > `hangOn` thì dragstart, dragend, drag mới diễn ra, dùng `hangOn` khi dùng với sự kiện `click`



Mở rộng 1 đối tượng có sẵn để sử dụng các chức năng của Hanger

```js
_({
tag:'hanger',
elt: yourElement,
  on:{
  //có thể bỏ các listener ở đây 
  }
});

//hoặc gắn vào sau

your.on('predrag', hander);

```

## Sự kiện

## event (tất cả các sự kiện đều có)

- **type:** `string`
- **isTouch:** `boelean`, cho biết đây là sự kiện touch hay không
- **startingPoint:** `Vec2`, tọa độ bắt đầu
- **currentPoint:** `Vec2`, tọa đọ hiện tại
- **pointerIdent:** `number`, định danh cho figure cho touch, nếu click thì giá trị `-1`
- **clientX:** `number`
- **clientY:** `number`
- **target:** `Element`

### predrag: event

-**cancel:** `function(flag:boolean)->void`, gọi hàm này để hủy các sự kiện dragstart, dragend, drag 


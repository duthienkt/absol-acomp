import '../css/toast.css';
import ACore from "../ACore";

function Toast() {

}

Toast.tag = 'toast';

Toast.render = function () {
    return _(`<div role="alert" aria-live="assertive" aria-atomic="true" class="as-toast fade show" data-autohide="false">
          <div class="as-toast-header">
            <svg class="as-toast-type-color" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img">
              <rect fill="#007aff" width="100%" height="100%"></rect></svg>
            <strong class="mr-auto">Bootstrap</strong>
            <small>11 mins ago</small>
            <button  class="as-toast-close-btn">
              <span>×</span>
            </button>
          </div>
          <div class="toast-body">
          <div class="as-toast-message">
            Hello, world! This is a toast message.
</div>
          </div>
        </div>`);
}


ACore.install(Toast);

export default Toast;
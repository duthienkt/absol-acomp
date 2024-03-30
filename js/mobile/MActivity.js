import '../../css/mobileapp.css';
import  {_, $} from "../../ACore";
import Fragment from 'absol/src/AppPattern/Fragment';
import OOP from "absol/src/HTML5/OOP";

function MActivity(bundle) {
    Fragment.call(this);
    this.caller = null;
    this.arguments = null;
    this.result = null;
}

OOP.mixClass(MActivity, Fragment);

MActivity.prototype.createView = function () {
    this.$view = _({
        class: 'am-activity'
    });
};


//
//
// MActivity.prototype.finish = function () {
//     if (!this.session) {
//         throw new Error("Activity is not started!");
//     }
//     this.stop();
//     if (this.onFinished) this.onFinished();
//     if (this.caller) {
//         this.caller.activityReturn(this.session, this, this.result);
//         this.caller= null;
//         this.result = null;
//         this.arguments = null;
//         this.session = null;
//     }
// };

//
// /**
//  * @param {MActivity} activity
//  * @param {*} bundle
//  */
// MActivity.prototype.startActivity = function (session, activity, args) {
//     activity.stop();//stop before call new
//     this.pause();
//     activity.caller = this;
//     activity.arguments = args;
//     activity.result = null;
//     activity.session = session;
//     activity.attach(this);
//     activity.viewToApp();
//     activity.start();
// };
//
// MActivity.prototype.activityReturn = function (session, act, result) {
//     if (this.onActivityReturn) {
//         this.onActivityReturn(session, act, result);
//     }
//
//     this.viewToApp();
//     this.resume();
// };

export default MActivity;
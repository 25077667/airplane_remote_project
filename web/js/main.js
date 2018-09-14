//"use strict";
document.addEventListener("deviceready", onDeviceReady, false);
//----------declare variables---------------
var static_flag = false;
var x_axis = 0, y_axis = 0, z_axis = 0;
var sensor = new Accelerometer();
var ip_change_record = "";


//------------ buttons-----------------------
function static_flag_ctrl(){
	static_flag = true;
}

//誰給acceleration??
function set_up(acceleration){
	//加速度重設
	x_axis = acceleration.x;
	y_axis = acceleration.y;
	z_axis = acceleration.z;

}

//--------------touching screen------------------------
function about_touch(){
	let accelerometer = null;
	try {
    	accelerometer = new Accelerometer({ frequency: 10 });
    	accelerometer.addEventListener('error', event => {
        	// Handle runtime errors.
        	if (event.error.name === 'NotAllowedError') {
	            console.log('Permission to access sensor was denied.');
    	    } else if (event.error.name === 'NotReadableError' ) {
        	    console.log('Cannot connect to the sensor.');
        	}
    	});
	    accelerometer.addEventListener('reading', () => reloadOnShake(accelerometer));
    	accelerometer.start();
		} catch (error) {
    	// Handle construction errors.
    	if (error.name === 'SecurityError') {
        	console.log('Sensor construction was blocked by the Feature Policy.');
    	} else if (error.name === 'ReferenceError') {
        	console.log('Sensor is not supported by the User Agent.');
    	} else {
        	onError();
    	}
	}
}

//----------------matchin and send_something -------------------
function matching(){

	var device = jQuery('.YourAirplaneIP').val();
	console.log('trying to connect: ' + device);
  ip_change_record = device;
	var msg = "start"			//原本在考慮說，要怎麼去驗證使用者不是第三人，可是google後發現貌似不可能，所以改天再想
	send_something(ip_change_record, msg);
}

function send_something(IPAdress, msg){
	var request = new XMLHttpRequest();
	console.log('Trying to send:' + msg + " to " + IPAdress);
	request.open("POST", "http://"+IPAdress);
	request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
	request.send(msg);
}

// ------------calculating-------------
function calculating(dx_axis, dy_axis, dz_axis, static_flag){
//static_flag 是true代表穩定模式有打開

	var motor_power = 0 ; //這是馬達推力的變數，100是滿格
	if (!static_flag) {
		dx_axis = acceleration.x - x_axis;
		dy_axis = acceleration.y - y_axis;
		dz_axis = acceleration.z - z_axis;
		motor_power = touchmove(); //目前尚未宣告touchmove
		//自己拿手機起來測試啦
		//手機頭上揚是y軸增加
		//手機左翻是x軸增加
		//當螢幕朝上，平放手機後，每旋轉90，270之同界角，z軸加速度都是0
		//因為加速度是-9.8~9.8之間，我直接取三次方，就可以達到平衡點附近變動小的狀況
		//因此max取1000，min取-1000，1000為完全直立

		return Math.pow(dx_axis, 3) + " " + Math.pow(dy_axis, 3) + " " + Math.pow(dz_axis, 3) + " " + motor_power + " ";
	}

	else{
		dx_axis = 0;
		dy_axis = 0;
		dz_axis = 0;
		motor_power = 50;
	}
	return dx_axis + " " + dy_axis + " " + dz_axis + " " + motor_power + " ";
}

function touchmove(){

}
//--------------eooro alert----------------

function onDeviceReady(){
	navigator.accelerometer.getCurrentAcceleration(set_up, onError);
}

function onError(){
	alert('onError!');
}

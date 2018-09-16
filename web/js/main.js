//"use strict";
// some resource to read https://developer.mozilla.org/zh-TW/docs/Web/API/Touch_events

document.addEventListener("deviceready", onDeviceReady, false);
//----------declare variables---------------
var static_flag = false;
var x_axis = 0, y_axis = 0, z_axis = 0;
var sensor = new Accelerometer();
var ip_change_record = "";
fullscreen();
set_up();

//------------ buttons-----------------------

function static_flag_ctrl(){
	static_flag = true;
}

//誰給acceleration??
function set_up(){
	//加速度重設
	//Generic Sensor API
	var acceleration = new Accelerometer();
	x_axis = acceleration.x;
	y_axis = acceleration.y;
	z_axis = acceleration.z;
	//about_touch();

}

function fullscreen(){
	var canvas = document.getElementById("canvas");
	canvas.width  = jQuery(window).width()-2;
	canvas.height = jQuery(window).height()-42;
}

//--------------touching screen------------------------
var el = document.getElementsByTagName("canvas")[0];
el.addEventListener("touchstart", () => { touchStart(event) }, false);
el.addEventListener("touchend", () => { touchEnd(event) }, false);
el.addEventListener("touchmove", () => { touchMove(event) }, false);

var centorl_x = 0;
var centorl_y = 0;
var r = 0;
function touchStart(event){
	var x = event.touches[0].clientX;
	var y = event.touches[0].clientY;
	console.log(x);
	console.log(y);
	var c=document.getElementById("canvas");
	var ctx=c.getContext("2d");
	ctx.beginPath();
	ctx.arc(x,y,100,0,2*Math.PI);
	ctx.stroke();
	centorl_x = x; centorl_y =y;
}

function touchEnd(event){
	console.log("tEND");
	var c=document.getElementById("canvas");
	const ctx=c.getContext("2d");
	ctx.clearRect(0,0,c.width,c.height);
	document.getElementById("spot").style.visibility = 'hidden';
}

function touchMove(event){
	var x = event.touches[0].clientX;
	var y = event.touches[0].clientY;
	if ((x - centorl_x)**2 + (y - centorl_y)**2 > 2600 ){
		r = 50;
	}
	else {
		r = Math.sqrt((x - centorl_x)**2 + (y - centorl_y)**2);
	}
	console.log(r)
	document.getElementById("spot").style.setProperty('--y', y+'px');
	document.getElementById("spot").style.setProperty('--x', x+'px');
	document.getElementById("spot").style.visibility = 'visible';
}

//----------------matchin and send_something -------------------
function matching(){

	var device = jQuery('.YourAirplaneIP').val();
	console.log('trying to connect: ' + device);
  ip_change_record = device;
	var msg = "start"			//原本在考慮說，要怎麼去驗證使用者不是第三人，可是google後發現貌似不可能，所以改天再想
	send_something(ip_change_record, msg);
}

//need to set a slice of time to get the Accelerometer value

function send_something(IPAdress, msg){
	var request = new XMLHttpRequest();
	console.log('Trying to send:' + msg + " to " + IPAdress);
	request.open("POST", "http://"+IPAdress);
	request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
	request.send(msg);
}

// ------------calculating-------------
function calculating(x_axis, y_axis, z_axis, static_flag){
//static_flag 是true代表穩定模式有打開

	var motor_power = 0 ; //這是馬達推力的變數，100是滿格
	if (!static_flag) {
		var dx_axis = acceleration.x - x_axis;
		var dy_axis = acceleration.y - y_axis;
		var dz_axis = acceleration.z - z_axis;
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



//----------------eooro alert----------------

function onDeviceReady(){
	navigator.accelerometer.getCurrentAcceleration(set_up, onError);
}

function onError(){
	alert('onError!');
}

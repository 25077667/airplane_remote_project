// some resource to read https://developer.mozilla.org/zh-TW/docs/Web/API/Touch_events
// the Generic Sensor API only support on https so tou should make the raspi enable HTTPS server
// https://variax.wordpress.com/2017/03/18/adding-https-to-the-raspberry-pi-apache-web-server/comment-page-1/
window.addEventListener("resize", fullscreen);

//----------declare variables---------------
var static_flag = false;
var x_axis = 0, y_axis = 0, z_axis = 9.8;
var ip_change_record = "";
var matched = false;
let acceleration = new Accelerometer({frequency: 40});
var pattern="_";
set_up();

//------------ buttons-----------------------

function static_flag_ctrl(){
	static_flag = true;
}

function set_up(){
	//reset the accelerometer
	//Generic Sensor API
	acceleration.onloading = () => model.quaternion.fromArray(acceleration.quaternion);
	acceleration.onerror = ev => {
		if (ev.error.name == 'NotReadableError'){alert("Sensor is not available.");}
	}
	acceleration.start();
	x_axis = acceleration.x;
	y_axis = acceleration.y;
	z_axis = acceleration.z;
	console.log(x_axis);
	fullscreen();
}

function fullscreen(){
	var canvas = document.getElementById("canvas");
	canvas.width  = jQuery(window).width() -2 || document.documentElement.clientWidth -2 ;		//let user toucj on this full screen canvas
	canvas.height = jQuery(window).height() || document.documentElement.clientHeight;
	console.log("screen resize");
}
//--------------touching screen------------------------
var el = document.getElementsByTagName("canvas")[0];
el.addEventListener("touchstart", () => { touchStart(event) }, false);
el.addEventListener("touchend", () => { touchEnd(event) }, false);
el.addEventListener("touchmove", () => { touchMove(event) }, false);

var centorl_x = 0; //initial user touch point
var centorl_y = 0;
var radius = 0; //user touch move radius
function touchStart(event){
	event.preventDefault();  //prevent the page roll
	centorl_x = event.touches[0].clientX -20;	//fix the offset, without this code will identify to bottom right side rather then the true point
	centorl_y = event.touches[0].clientY -10;
	console.log(centorl_x);
	console.log(centorl_y);
	var c=document.getElementById("canvas");
	var ctx=c.getContext("2d");
	ctx.beginPath();
	ctx.arc(centorl_x+20,centorl_y-20,200,0,2*Math.PI);	//radius is 200
	ctx.stroke();	//draw a circle
	static_flag = false;  //close "強制穩定"
}

function touchEnd(event){
	console.log("tEND");
	var c=document.getElementById("canvas");
	const ctx=c.getContext("2d");
	ctx.clearRect(0,0,c.width,c.height);
	document.getElementById("spot").style.visibility = 'hidden';
}

function touchMove(event){
	event.preventDefault();
	var x = event.touches[0].clientX -20;	//fix the offset, without this code will identify to bottom right side rather then the true point
	var y = event.touches[0].clientY -10;
	if (((x - centorl_x)*0.5)**2 + ((y - centorl_y)*0.5)**2 > 10000 ){
		radius = 100;		//over the circle set it to be 100
	}
	else {
		radius = Math.sqrt(((x - centorl_x)*0.5)**2 + ((y - centorl_y)*0.5)**2);	//because radius is 200, but i wnat to make the r value in [0,100], I divide it by 2
	}
	console.log(radius)
	document.getElementById("spot").style.setProperty('--y', y+'px');  // modify the spot attribute, the place (x,y) of spot is a variable更改光點(圖片)屬姓，位置屬性是變數
	document.getElementById("spot").style.setProperty('--x', x+'px');
	document.getElementById("spot").style.visibility = 'visible';  //make the spot viewable

}

//----------------matchin and send_something -------------------

function MakePattern(){
	var pattern_elements = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_*=|~@$";
	for (var i=0;i<8;i++)
		pattern += pattern_elements.charAt(Math.floor( Math.random() * pattern_elements.length));
	return pattern;
}

function matching(){
	var device = jQuery('.YourAirplaneIP').val();
	console.log('trying to connect: ' + device);
  ip_change_record = device;
	var msg = MakePattern();	//send the pattern and the first char '_' is the start signal
	send_something(ip_change_record, msg);	//first time is the pattern
	matched = true;
	//if(ip_change_record != "0")
	start();
}

function send_something(IPAdress, msg){
	var request = new XMLHttpRequest();		//saw this in the book(JavaScript: The Definitive Guide: Activate Your Web Pages, 6, David Flanagan ) it is said this is an old API
	console.log('Trying to send:' + msg + " to " + IPAdress);
	request.open("POST", "http://"+IPAdress);
	request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
	request.send(msg);
}

function start(){
	if(matched == true && ip_change_record != "0")
		setInterval(() => {	send_something(ip_change_record, calculating());},16);
	else
		onError();
}

// ------------calculating-------------
function cal_d_axis(d_axis){
	if(d_axis < 0.4)
		return 0;
	else
		return d_axis;
}

function calculating(){
//if static_flag is true, that is "強制穩定" is on
	var motor_power = 50 ; //motor power max is 100, but initial is 50
	var dx_axis = acceleration.x - x_axis;
	var dy_axis = acceleration.y - y_axis;
	var dz_axis = acceleration.z - z_axis;

	//手機頭上揚是y軸增加
	//手機左翻是x軸增加
	//當螢幕朝上，平放手機後，每旋轉90，270之同界角，z軸加速度都是0

	if (!static_flag) {
		motor_power = radius;
	}
	else{
		dx_axis = dy_axis = dz_axis = 0;
		motor_power = 50;
	}

	console.log(cal_d_axis(dx_axis) + " " + cal_d_axis(dy_axis) + " " + cal_d_axis(dz_axis) + " " + motor_power + " " +pattern);
	return cal_d_axis(dx_axis) + ":" + cal_d_axis(dy_axis) + ":" + cal_d_axis(dz_axis) + ":" + motor_power + ":"+ pattern;
}

//----------------error alert----------------
function onError(){
	matched = false;
	alert('disconnected');
	send_something(ip_change_recordm, "00000"+pattern);
	location.replace('https://ltjh.io');
	// why not i cannot reload this page
}

// some resource to read https://developer.mozilla.org/zh-TW/docs/Web/API/Touch_events
// the Generic Sensor API only support on https so tou should make the raspi enable HTTPS server
// https://variax.wordpress.com/2017/03/18/adding-https-to-the-raspberry-pi-apache-web-server/comment-page-1/
window.addEventListener("resize", fullscreen);

//----------declare variables---------------
var static_flag = false;
var reference_parameter = { x: 0, y: 0, z: 0, radius:0 };
var initial_accelerator = { x: 0, y: 0, z: 0 };
var ip_change_record = "";
var matched = false;
let acceleration = new Accelerometer({ frequency: 40 });
var counting = 0;
var need_to_send = true;
set_up();

//------------ buttons-----------------------

function static_flag_ctrl() {
	static_flag = true;
}

function set_up() {
	//reset the accelerometer
	//Generic Sensor API
	acceleration.onloading = () => model.quaternion.fromArray(acceleration.quaternion);
	acceleration.onerror = ev => {
		if (ev.error.name == 'NotReadableError') { alert("Sensor is not available."); }
	}
	acceleration.start();
	fullscreen();
}

function fullscreen() {
	var canvas = document.getElementById("canvas");
	canvas.width = jQuery(window).width() - 2 || document.documentElement.clientWidth - 2;		//let user touch on this full screen canvas
	canvas.height = jQuery(window).height() || document.documentElement.clientHeight;
	console.log("screen resize");
}
//--------------touching screen------------------------
var el = document.getElementsByTagName("canvas")[0];
el.addEventListener("touchstart", () => { touchStart(event) }, false);
el.addEventListener("touchend", () => { touchEnd(event) }, false);
el.addEventListener("touchmove", () => { touchMove(event) }, false);

var central_point = { x: 0, y: 0 };
var radius = 0; //user touch move radius
function touchStart(event) {
	event.preventDefault();  //prevent the page roll
	central_point.x = event.touches[0].clientX - 20;	//fix the offset, without this code will identify to bottom right side rather then the true point
	central_point.y = event.touches[0].clientY - 10;
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	ctx.beginPath();
	ctx.arc(central_point.x + 20, central_point.y - 20, 200, 0, 2 * Math.PI);	//diameter is 200
	ctx.stroke();	//draw a circle
	static_flag = false;  //close "強制穩定"
}

function touchEnd(event) {
	console.log("tEND");
	var c = document.getElementById("canvas");
	const ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	document.getElementById("spot").style.visibility = 'hidden';
}

function touchMove(event) {
	event.preventDefault();
	var x = event.touches[0].clientX - 20;	//fix the offset, without this code will identify to bottom right side rather then the true point
	var y = event.touches[0].clientY - 10;
	if (((x - central_point.x) * 0.5) ** 2 + ((y - central_point.y) * 0.5) ** 2 > 10000) {
		radius = 100;		//over the circle set it to be 100
	}
	else {
		radius = Math.sqrt(((x - central_point.x) * 0.5) ** 2 + ((y - central_point.y) * 0.5) ** 2);	//because radius is 200, but i wnat to make the r value in [0,100], I divide it by 2
	}
	document.getElementById("spot").style.setProperty('--y', y + 'px');  // modify the spot attribute, the place (x,y) of spot is a variable更改光點(圖片)屬姓，位置屬性是變數
	document.getElementById("spot").style.setProperty('--x', x + 'px');
	document.getElementById("spot").style.visibility = 'visible';  //make the spot viewable
}

//----------------matchin and send_something -------------------

function MakePattern() {
	var pattern_elements = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_*=|~@$";
	var pattern = "";
	for (var i = 0; i < 8; i++)
		pattern += pattern_elements.charAt(Math.floor(Math.random() * pattern_elements.length));
	return pattern;
}

function matching() {
	var device = jQuery('.YourAirplaneIP').val();
	console.log('trying to connect: ' + device);
	need_to_send = true;
	ip_change_record = device;
	var pattern = MakePattern();
	send_something(ip_change_record, pattern);	//first time is the pattern
	//while (send_something(ip_change_record, pattern) != "Data received"){};
	//this annotation can keep sending macthing until success
	matched = true;
	start(pattern);
}

function send_something(IPAdress, msg) {
	if (need_to_send == false)
		return;

	var request = new XMLHttpRequest();		//saw this in the book(JavaScript: The Definitive Guide: Activate Your Web Pages, 6, David Flanagan ) it is said this is an old API
	console.log('Trying to send:' + msg + " to " + IPAdress);
	console.log(counting++);
	request.open("GET", "http://" + IPAdress + "/data/?msg=" + msg);
	return request.send();
}

function start(pattern) {
	initial_accelerator.x = acceleration.x;
	initial_accelerator.y = acceleration.y;
	initial_accelerator.z = acceleration.z;
	if (matched == true && ip_change_record != "0")
		setInterval(() => { send_something(ip_change_record, calculating(pattern)); }, 25);
	else
		onError(pattern);
}

// ------------calculating-------------
function cal_d_axis(d_axis) {
	if (Math.abs(d_axis) < 0.4)
		return 0;
	else
		return d_axis;
}

function paddingLeft(str) {
	if (str.length >= 7)
		return str;
	else
		return paddingLeft(str + "0");
}

function calculating(pattern) {
	var motor_power = 50; //motor power max is 100, but initial is 50
	var delta_x_init;	//acceleration.x - initial_accelerator.x;
	var delta_y_init;
	var delta_z_init;
	var delta_x_reference = acceleration.x - reference_parameter.x;
	var delta_y_reference = acceleration.y - reference_parameter.y;
	var delta_z_reference = acceleration.z - reference_parameter.z;
	var delta_radius_reference = radius - reference_parameter.radius;


	if (Math.abs(delta_x_reference) < 0.4 && Math.abs(delta_y_reference) < 0.4 && Math.abs(delta_z_reference) < 0.4 && delta_radius_reference < 4) {
		need_to_send = false;
		return;
	}
	else {
		need_to_send = true;
		reference_parameter.x = acceleration.x;
		reference_parameter.y = acceleration.y;
		reference_parameter.z = acceleration.z;
		delta_x_init = acceleration.x - initial_accelerator.x;
		delta_y_init = acceleration.y - initial_accelerator.y;
		delta_z_init = acceleration.z - initial_accelerator.z;
		delta_radius_reference = radius;
	}

	//手機頭上揚是y軸增加
	//手機左翻是x軸增加
	//當螢幕朝上，平放手機後，每旋轉90，270之同界角，z軸加速度都是0
	//if static_flag is true, that is "強制穩定" is on
	motor_power = radius;
	radius = 0;
	if (static_flag)
		motor_power = delta_x_init = delta_y_init = delta_z_init = 0;

	return paddingLeft((cal_d_axis(delta_x_init).toFixed(3)).toString()) + ":" + paddingLeft((cal_d_axis(delta_y_init).toFixed(3)).toString()) + ":" + paddingLeft((cal_d_axis(delta_z_init).toFixed(3)).toString()) + ":" + paddingLeft((motor_power.toFixed(3)).toString()) + ":" + pattern;
	// want to use XOR to encrypt a little message
}

//----------------error alert----------------
function onError(pattern) {
	matched = false;
	//this annotation code can make sure it disconnected.
	//while (send_something(ip_change_record, "0000000000:" + pattern) != "Data received"){	};
	send_something(ip_change_record, "0000000000:" + pattern);
	alert('disconnected');
	location.reload();
}

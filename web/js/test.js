//import 'react-dates/initialize';
jQuery(document).ready(function($) {

	$('.YourAirplaneIP').change(function() {
		var IPAddress = $('.YourAirplaneIP').val()
		app.connect()
		console.log(IPAddress)
	})

	$('#led').click(function(){
		app.ledOn()
	})
})

var app = {}

app.PORT = 1337
app.socketId

function post_message(IPAdress, msg){
	var request = new XMLHttpRequest();
	request.open("POST", IPAdress);
	request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
	request.send(msg);
}

app.connect = function() {

	var IPAddress = jQuery('.YourAirplaneIP').val()
	console.log('Trying to connect to ' + IPAddress)

	if(IPAddress == "0"){
		app.disconnect()
	}

	jQuery('#startView').hide()
	jQuery('#connectingStatus').text('Connecting to ' + IPAddress)
	jQuery('#connectingView').show()

	/*chrome.socket.create("tcp", null, function(createInfo) {

		app.socketId = createInfo.socketId

		chrome.socket.tcp.connect(
			app.socketId,
			IPAddress,
			app.PORT,
			connectedCallback)
	})*/

	function connectedCallback(result) {

		if (result === 0) {

			 console.log('Connected to ' + IPAddress)

			 jQuery('#connectingView').hide()
			 jQuery('#controlView').show()

		}
		else {

			var errorMessage = 'Failed to connect to ' + app.IPAdress
			console.log(errorMessage)
			navigator.notification.alert(errorMessage, function() {})
			jQuery('#connectingView').hide()
			jQuery('#startView').show()
		}
	}
}

app.sendString = function(sendString) {

	console.log('Trying to send:' + sendString)

	chrome.socket.tcp.send (
		app.socketId,
		app.stringToBuffer(sendString),
		function(sendInfo) {

			if (sendInfo.resultCode < 0) {

				var errorMessage = 'Failed to send data'

				console.log(errorMessage)
				navigator.notification.alert(errorMessage, function() {})
			}
		}
	)
}

app.ledOn = function() {

	app.sendString('H')

	jQuery('#led').removeClass('ledOff').addClass('ledOn')

	jQuery('#led').unbind('click').click(function(){
		app.ledOff()
	})
}

app.ledOff = function() {

	app.sendString('L')

	$('#led').removeClass('ledOn').addClass('ledOff')

	$('#led').unbind('click').click(function(){
		app.ledOn()
	})
}

app.disconnect = function() {

	chrome.socket.tcp.close(app.socketId, function() {
		console.log('TCP Socket close finished.')
	})

	$('#controlView').hide()
	$('#startView').show()
}

// Helper functions.

app.stringToBuffer = function(string) {

	var buffer = new ArrayBuffer(string.length)
	var bufferView = new Uint8Array(buffer)

	for (var i = 0; i < string.length; ++i) {

		bufferView[i] = string.charCodeAt(i)
	}

	return buffer
}

app.bufferToString = function(buffer) {

	return String.fromCharCode.apply(null, new Uint8Array(buffer))
}

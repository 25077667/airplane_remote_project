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
        	throw error;
    	}
	}
}

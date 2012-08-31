function showAlert(message, title) {
	if (navigator.notification) {
		navigator.notification.alert(message, null, // callback
		title, 'OK' // Button label
		);
	} else {
		alert(title + ": " + message);
	}
}
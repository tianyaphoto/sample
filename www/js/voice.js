/* Audio player */
var audio = null;
var audioTimer = null;
var pausePos = 0;

//var src = "/android_asset/audio/sample.mp3";;//"recording.wav"; // name of auio file
var src = "test.mp3";
var mediaRec; // the object for recording and play sound
var directory; // holds a reference for directory reading// handling document ready and phonegap deviceready


/* play audio file */
function playAudio(){
	audio = new Media(src, function(){ // success callback
    	console.log("playAudio():Audio Success");
    }, function(error){ // error callback
    	alert('code: '    + error.code    + '\n' + 
          	  'message: ' + error.message + '\n');
    });
    
    // get audio duration
    var duration = audio.getDuration();
    
    // set slider data
    if( duration > 0 ){
	    $('#slider').attr( 'max', Math.round(duration) );
	    $('#slider').slider('refresh');
    }
    
    // play audio
    audio.play();
    
    audio.seekTo(pausePos*1000);

    // update audio position every second
    if (audioTimer == null) {
        audioTimer = setInterval(function() {
            // get audio position
            audio.getCurrentPosition(
                function(position) { // get position success
                    if (position > -1) {
                        setAudioPosition(position);
                    }
                }, function(e) { // get position error
                    console.log("Error getting pos=" + e);
                    //setAudioPosition(duration);
                }
            );
        }, 1000);
    }
}

/* pause audio */
function pauseAudio() {
    if (audio) {
        audio.pause();
    }
}

/* stop audio */
function stopAudio() {
    if (audio) {
        audio.stop();
        audio.release();
    }
    clearInterval(audioTimer);
    audioTimer = null;
    pausePos = 0;
}

/* set audio position */
function setAudioPosition(position) {
	pausePos = position;
	position = Math.round(position);
    $('#slider').val(position);
    $('#slider').slider('refresh');
}

/* record audio file */
function recordAudio(file){
	//src = directory.fullPath+"/"+file;
	//src = file;
	audioRec = new Media(directory.fullPath+"/"+file, function(){
    	console.log("recordAudio():Audio Success");
    }, function(error){ // error callback
    	alert('recording error : ' + error.message);
    });
    
    // start recording
    audioRec.startRecord();
    
    // stop recording after 10 seconds
    setTimeout(function(){
    	audioRec.stopRecord();
    	audioRec.release();
    }, 10000);
}

function onFileSytemSuccess(fileSystem) {
    // Get the data directory, creating it if it doesn't exist.
    fileSystem.root.getDirectory("",{create:true},onDirectory,onError);
    // Create the lock file, if and only if it doesn't exist.	
    fileSystem.root.getFile(src, {create: true, exclusive: false}, onFileEntry, onError);  
}

function onFileEntry(fileEntry) {
    console.log("onFileEntry()");
}

function onDirectory(d) {
    console.log("onDirectory()");
    directory = d;
    var reader = d.createReader();
    reader.readEntries(onDirectoryRead,onError);
}

// Helpful if you want to see if a recording exists 
function onDirectoryRead(entries) {
    //console.log("The dir has "+entries.length+" entries.");
    // Scan for audio src
    for (var i=0; i<entries.length; i++) {
        //console.log(entries[i].name+' dir? '+entries[i].isDirectory);
        if(entries[i].name == src) {
            console.log("file found");
        }
    }
}

function onSuccess() {
    console.log("onSuccess()");
}

function onError(error) {
    alert('onError(): '    + error.code    + '\n' + 
          'message: ' + error.message + '\n');
}
 $(document).ready(function() {
	 
var directory = {
	models : {},
	views : {},
	utils : {},
	dao : {}
};

directory.views.HomeView = Backbone.View.extend({

	template : _.template($('#home').html()),
	// template:_.template(directory.utils.templateLoader.get('login-page')),

	events : {
		"click #submit-sign-in" : "sign_in"
	},

	render : function(eventName) {
		$(this.el).html(this.template());
		return this;
	},

	sign_in : function() {
		var username = $("#username").val();
		var password = $("#password").val();
		var md5p = hex_md5(password);
		$.ajax({
			type : "POST",
			url : "http://app.yeekle.com/?m=login",
			data : ({
				username : username,
				password : md5p
			}),
			cache : false,
			dataType : "html",
			success : function(data) {
				if (data == 1) {
					app.index();
				}
				app.index();
			}
		});

		return false;

	}
});

directory.views.IndexView = Backbone.View.extend({

	template : _.template($('#index').html()),
	
	events: {
		"click #create_for_me_link": "create_for_me"
	},
	
	create_for_me: function(){
		//app.createforme();
	},

	render : function(eventName) {
		$(this.el).html(this.template());
		return this;
	}
});

directory.views.CreateForMeView = Backbone.View.extend({

	

	template : _.template($('#create_for_me').html()),
	
	events: {
		"click #play":    "play",
		"click #pause":   "pause",
		"click #stop":    "stop",
		"click #rewind":  "rewind",
		"click #record":  "record"
	},
	
	play: function(){
		playAudio();
		
		$("#play").button('disable');
		$("#pause").button('enable');
	},
	
	pause: function(){
		pauseAudio();
		
		$("#pause").button('disable');
		$("#play").button('enable');
	},
	
	stop: function(){
		stopAudio();
		$('#slider').val(0);
		$('#slider').slider('refresh');
		
	    $("#pause").button('disable');
		$("#play").button('enable');
	},
	
	rewind: function(){
		stopAudio();
		playAudio();
		
	    $("#play").button('enable');
		$("#pause").button('disable');
	},
	
	record: function(){
		stopAudio();
		$("#record").button('disable');
		$("#play").button('enable');
		$("#pause").button('disable');
		
		var recsec = 10;
		recordAudio("test.mp3");
		var rectxt = setInterval(function(){
			var recording = $('#recording');
			if(recsec == 0) {
				clearInterval(rectxt);
				recording.text('Play recording');
				$("#record").button('enable');
				playAudio();
			} else {
				recording.text('Stop recording in ' + recsec + ' seconds' );
				--recsec;
			}
		},1000);
	},

	render : function(eventName) {
		$(this.el).html(this.template());
		return this;
	}
});

var AppRouter = Backbone.Router.extend({

	routes : {
		"" : "home",
		"index" : "index",
		"createforme" : "createforme"
	},

	initialize : function() {
		// Handle back button throughout the application
		$('.back').live('click', function(event) {
			window.history.back();
			return false;
		});
		this.firstPage = true;
		
	},

	home : function() {
		this.changePage(new directory.views.HomeView());
	},

	index : function() {
		this.changePage(new directory.views.IndexView());
	},

	createforme : function() {
		this.changePage(new directory.views.CreateForMeView());
	},

	changePage : function(page) {
		$(page.el).attr('data-role', 'page');
		page.render();
		$('body').append($(page.el));
		var transition = $.mobile.defaultPageTransition;
		// We don't want to slide the first page
		if (this.firstPage) {
			transition = 'none';
			this.firstPage = false;
		}
		$.mobile.changePage($(page.el), {
			changeHash : false,
			transition : transition
		});
	}

});


 	$.mobile.allowCrossDomainPages = true;
 	window.app = new AppRouter();
 	Backbone.history.start();


//function bodyLoad(){
//// 	document.addEventListener('backbutton', function(e) {
//// e.preventDefault();
//// }, true);
//// document.addEventListener('touchmove', function(e) {
//// }, false);
//	document.addEventListener('deviceready', deviceReady, false);
//// 	if(/https?:\/\//.test(document.location.href)) {
//// deviceReady();
//// }
//}
//
//
//

	    document.addEventListener('deviceready', onDeviceReady, false);

 
function onDeviceReady(){
   window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSytemSuccess, onError);
}

 });
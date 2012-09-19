var token = null;
var current_user = null;
var user = null;
var contacts = [];
var records = [];

/*
 * ========= contacts: "http://app.yeekle.com/?m=contact&a=list&uid=1",p login:
 * "http://app.yeekle.com/?m=login"
 */
var config = {
	url : {
		contacts : "http://106.187.95.72:8001/api/contacts.json",
		login : "http://app.yeekle.com/?m=login", // "http://106.187.95.72:8001/api/sign_in.json",
		aboutme : "http://106.187.95.72:8001/api/users.json",
		received: "http://106.187.95.72:8001/api/recieved.json"
	}
}

$(document).ready(
		function() {

			var directory = {
				models : {},
				views : {},
				utils : {},
				dao : {}
			};

			directory.models.User = Backbone.Model.extend({
				defaults : function() {
					return {
						id : 0,
						email : "test@test.com",
						lastname : "test",
						firstname : "test",
						face : "test.jpg",
						mobile : null,
					};
				},

				initialize : function() {
					console.log("init user data");
				},

			});

			directory.views.ReceivedView = Backbone.View.extend({

				template : _.template($("#received").html()),
				
				events : {
					"click a.play": "play"
				},
				
				play: function(){
					var file_src = $(this).attr("href");
					var file_src = "http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3";
					console.log(file_src);
					playAudio(file_src);
					return false;
				},

				render : function() {
					var result = {
							records : records
					}
					$(this.el).html(this.template(result));
					return this;
				}
			});

			directory.views.HomeView = Backbone.View.extend({

				template : _.template($('#home').html()),

				events : {
					"click #submit-sign-in" : "sign_in"
				},

				render : function(eventName) {
					$(this.el).html(this.template());
					return this;
				},

				sign_in : function() {
					$("#submit-sign-in").button("disable");
					var username = $("#username").val();
					var password = $("#password").val();
					var md5p = hex_md5(password);
					$.ajax({
						type : "POST",
						url : config.url.login,
						data : ({
							username : username,
							password : md5p
						}),
						cache : false,
						dataType : "json",
						success : function(data) {
							console.log("login data:  " + data);
							if (data.result == 0) {
								console.log(data.log);
								$("#submit-sign-in").button("enable");
								showAlert("Invalid Username OR Password.");

							} else {
								token = data.tonken;
								console.log("user data : " + data.user.id
										+ data.user.email);
								current_user = new directory.models.User(
										data.user);
								app.index();
							}
						}
					});

					return false;

				}
			});

			directory.views.IndexView = Backbone.View.extend({

				template : _.template($('#index').html()),

				events : {
					"click #create_for_me_link" : "create_for_me"
				},

				create_for_me : function() {

				},

				render : function(eventName) {
					$(this.el).html(this.template());
					return this;
				}
			});

			directory.views.ContactView = Backbone.View.extend({
				template : _.template($("#contact").html()),
				render : function(eventName) {
					var result = {
						contacts : contacts
					}
					$(this.el).html(this.template(result));
					return this;
				}
			});

			directory.views.AboutmeView = Backbone.View.extend({
				template : _.template($("#aboutme").html()),
				render : function(eventName) {
					var result = {
						user : user
					}
					$(this.el).html(this.template(result));
					return this;
				}
			});

			directory.views.CreateForMeView = Backbone.View.extend({

				template : _.template($('#create_for_me').html()),

				events : {
					"click #play" : "play",
					"click #pause" : "pause",
					"click #stop" : "stop",
					"click #rewind" : "rewind",
					"click #record" : "record",
					"click #submit" : "submit"
				},

				play : function() {
					playAudio(recordfilename);

					$("#play").button('disable');
					$("#pause").button('enable');
				},

				pause : function() {
					pauseAudio();

					$("#pause").button('disable');
					$("#play").button('enable');
				},

				stop : function() {
					stopAudio();
					$('#slider').val(0);
					$('#slider').slider('refresh');

					$("#pause").button('disable');
					$("#play").button('enable');
				},

				rewind : function() {
					stopAudio();
					playAudio(recordfilename);

					$("#play").button('enable');
					$("#pause").button('disable');
				},

				record : function() {
					stopAudio();
					$("#record").button('disable');
					$("#play").button('enable');
					$("#pause").button('disable');

					var recsec = 10;
					var date = new Date();
					recordfilename = date.getTime() + ".mp3";
					recordAudio(recordfilename);
					var rectxt = setInterval(function() {
						var recording = $('#recording');
						if (recsec == 0) {
							clearInterval(rectxt);
						} else {
							recording.text('Stop recording in ' + recsec
									+ ' seconds');
							--recsec;
						}
					}, 1000);
				},

				submit : function() {
					var win = function(r) {
						$("#submit").button('disable');
						app.navigate("index", {
							trigger : true,
							replace : true
						})
					}

					var fail = function(error) {
						$("#submit").button('disable');
						alert("An error has occurred: Code = " + error.code);
					}

					// var fileURI = "/mnt/sdcard/test.mp3";
					var fileURI = src;
					var options = new FileUploadOptions();
					options.fileKey = "record";
					options.fileName = fileURI
							.substr(fileURI.lastIndexOf('/') + 1);
					options.mimeType = "audio/mpeg";

					var params = new Object();
					params.uid = 1;
					params.speaker = $("#speaker").val();
					params.time = 10;

					options.params = params;

					var ft = new FileTransfer();
					var url = "http://app.yeekle.com/?m=create&u=me";
					var url = "http://app.yeekle.com/uploader1.php"
					ft.upload(fileURI, encodeURI(url), win, fail, options);

				},

				render : function(eventName) {
					$(this.el).html(this.template(current_user.toJSON()));
					// current_user = {
					// email: "test@gmail.com",
					// phone: "123444",
					// company: "aaaaa",
					// face: "http://192.168.1.104:3000/assets/avatar.jpg"
					// }
					// $(this.el).html(this.template(current_user));
					return this;
				}
			});

			directory.views.CreateForOtherView = Backbone.View.extend({

			});

			var AppRouter = Backbone.Router.extend({

				routes : {
					"" : "home",
					"index" : "index",
					"createforme" : "createforme",
					"createforother" : "createforother",
					"received" : "received",
					"created" : "created",
					"updates" : "updates",
					"system" : "system",
					"contact" : "contact",
					"about_me" : "aboutme"
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
					if (token === null) {
						this.changePage(new directory.views.HomeView());
					} else {
						this.changePage(new directory.views.IndexView());
					}

				},

				index : function() {
					this.changePage(new directory.views.IndexView());
				},

				createforme : function() {
					this.changePage(new directory.views.CreateForMeView());
				},

				received : function() {
					$.get(config.url.received, function(data) {
						console.log(data);
						records = data;
						app.changePage(new directory.views.ReceivedView());
					}, "json");
				},

				created : function() {
					this.changePage(new directory.views.ReceivedView());
				},

				updates : function() {
					this.changePage(new directory.views.ReceivedView());
				},

				system : function() {
					this.changePage(new directory.views.ReceivedView());
				},

				contact : function() {
					$.get(config.url.contacts, function(data) {
						contacts = data;
						app.changePage(new directory.views.ContactView());
					}, "json");
					// contacts =
					// [{"name":"\u5f20\u4e09","avatar":"http://192.168.1.104:3000/assets/avatar.jpg"},{"name":"\u674e\u56db","avatar":"http://192.168.1.104:3000/assets/avatar.jpg"}]
					// this.changePage(new directory.views.ContactView());

				},

				aboutme : function() {
					$.get(config.url.aboutme, function(data) {
						user = data;
						app.changePage(new directory.views.AboutmeView());
					}, "json");
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
			function onDeviceReady() {
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
						onFileSytemSuccess, onError);
			}

			window.app = new AppRouter();
			Backbone.history.start();

			document.addEventListener('deviceready', onDeviceReady, false);

		});
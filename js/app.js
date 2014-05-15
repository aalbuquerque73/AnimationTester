define(["jquery", "underscore", "knockout", "utils", 'handlers'],
function($, _, ko, U) {
	function ViewModel() {
		this._data = {
			html: "",
			js: "",
			css: ""
		};
		try {
			var local = JSON.parse(localStorage.AnimationTester);
			console.log("[ViewModel:constructor", local);
			_.each(local, function(value, key) {
				this[key] = ""+value;
			}, this._data);
			this._data.html = local.html;
			this._data.js = local.js;
		} catch(ignore) {
			console.warn("[ViewModel:unserialize]", localStorage.AnimationTester);
			console.log("[ViewModel:unserialize]", ignore.message);
			if (ignore.stack) {
				console.log(ignore.stack);
			}
		}
		
		_.each(this._data, function(value, key) {
			console.log("[ViewModel:constructor:data]", arguments);
			this[key] = ko.observable(value);
		}, this);
		
		this.process = ko.computed(function() {
			return this.html();
		}, this);
		
		this.execute = ko.computed(function() {
			var js = ko.utils.unwrapObservable(this.js());
			setTimeout(function() {
				(function() {
					eval(js);
				}).apply(this);
			}, 0);
		}, this);
	}
	ViewModel.prototype = {
		importData: function() {
		},
		exportData: function() {},
		
		serialize: function() {
			var save = {};
			_.each(this._data, function(value, key) {
				save[key] = this[key]();
			}, this);
			console.log("[ViewModel:serialize]", save);
			localStorage.AnimationTester = JSON.stringify(save);
		},
		parseHandler: function() {
			console.log("[ViewModel:parsehandler]", arguments);
			$('.loading').hide();
		},
		start: function() {
			ko.applyBindings(this);
			console.log("window.load", sessionStorage, localStorage);
		}
	};
	
	var model = new ViewModel();
	$(window).bind('beforeunload',function(){
		model.serialize();
		return 'Serializing data';
	});
	return model;
});
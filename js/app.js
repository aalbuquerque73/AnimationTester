define(["jquery", "underscore", "knockout", "utils", 'handlers'],
function($, _, ko, U) {
	function Property() {
		this._data = {
			name: "",
			value: ""
		};
		this._timer = null;
		this.name = ko.observable(this._data.name);
		this.value = ko.observable(this._data.value);
	}
	Property.prototype = {
		select: function(self, event) {
			clearTimeout(this._timer);
			//console.log("[Property:select]", arguments, this._timer);
			event.preventDefault();
			event.stopPropagation();
		},
		unselect: function() {
			//console.log("[Property:unselect]", arguments, this._timer);
			var self = this;
			this._timer = setTimeout(function() {
				console.log("[Property:unselect:timeout]", arguments);
				if (self.name() === "" && self.value() === "") {
					U.bus.trigger("remove-property", self);
				}
			}, 150);
		}
	};
	function Selector() {
		this._data = {
			name: "selector",
			properties: []
		};
		this.name = ko.observable(this._data.name);
		this.properties = ko.observableArray(this._data.properties);
		U.bus.on("remove-property", function(property) {
			var index = this.properties.indexOf(property);
			if (index>=0) {
				console.log("[Selector:properties:remove]", index);
				this.properties.splice(index, 1);
			}
		}, this);
	}
	Selector.create = function(values) {
		console.log("[Selector:create]", arguments);
		var s = new Selector();
		s.name(values.name);
		_.each(values.properties, function(property) {
			var p = new Property();
			p.name(property.name);
			p.value(property.value);
			this.properties.push(p);
		}, s);
		console.log("[Selector:create]", s);
		return s;
	};
	Selector.prototype = {
		add: function() {
			this.properties.push(new Property());
		},
		select: function(self, event) {
			console.log("[Selector:select]", arguments);
			event.preventDefault();
			event.stopPropagation();
		},
		remove: function(property, event) {
			console.log("[Selector:remove]", arguments);
			U.bus.trigger("remove-property", property);
			event.preventDefault();
			event.stopPropagation();
		}
	};
	function ViewModel() {
		this._data = {
			html: "",
			js: "",
			css: []
		};
		try {
			var local = JSON.parse(localStorage.AnimationTester);
			console.log("[ViewModel:constructor", local);
			this._data.html = local.html;
			this._data.js = local.js;
			_.each(local.css, function(value) {
				this.push(Selector.create(value));
			}, this._data.css);
		} catch(ignore) {
			console.warn("[ViewModel:unserialize]", localStorage.AnimationTester);
			console.log("[ViewModel:unserialize]", ignore.message);
			if (ignore.stack) {
				console.log(ignore.stack);
			}
		}
		
		_.each(this._data, function(value, key, object) {
			console.log("[ViewModel:constructor:data]", arguments);
			if(U.type(value)==="array") {
				this[key] = ko.observableArray(value);
				return;
			}
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
		
		/*this.style = ko.computed(function() {
			var css = [];
			_.each(this.css(), function(selector) {
				var s = {
					name: selector.name(),
					properties: []
				};
				_.each(selector.properties(), function(property) {
					this.push({
						name: property.name(),
						value: property.value()
					});
				}, s.properties);
				this.push(s);
			}, css);
			console.log("[ViewModel:constructor:style]", css);
			return css;
		}, this).extend({ notify: 'always' });*/
	}
	ViewModel.prototype = {
		add: function() {
			this.css.push(new Selector());
		},
		remove: function() {},
		
		serialize: function() {
			var save = {
				html: this.html(),
				js: this.js(),
				css: []
			};
			_.each(this.css(), function(selector) {
				var s = {
					name: selector.name(),
					properties: []
				};
				_.each(selector.properties(), function(property) {
					this.push({
						name: property.name(),
						value: property.value()
					});
				}, s.properties);
				this.push(s);
			}, save.css);
			console.log("[ViewModel:serialize]", save);
			localStorage.AnimationTester = JSON.stringify(save);
		},
		parseHandler: function() {
			console.log("[ViewModel:parsehandler]", arguments);
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
define(['jquery', 'underscore', 'knockout', 'utils'],
function($, _, ko, U) {
	var ui = {
		list: [],
		window: $(window),
		init: function() {
			//console.log("[ui:init]", this);
			this.window.resize(_.debounce(function() {
				//console.log("[window:resize:debounce(true)]");
				U.bus.trigger('resize-begin');
			}, 250, true));
			this.window.resize(_.debounce(function() {
				//console.log("[window:resize:debounce(false)]");
				U.bus.trigger('resize-end');
			}, 250));
			_.each(this.events, function(event, key) {
				U.bus.on(key, event, this);
			}, this);
		},
		events: {
			'resize-end': function() {
				U.bus.trigger('expander');
			},
			expander: function() {
				_.each(this.list, function(options) {
					var ctrl = options.ctrl;
					if(ctrl != undefined && ctrl.expand) {
						//console.log("[ui:update] expanding element", options.element);
						var div = {
							width: $(options.element).parent().attr('expand-width') || 1,
							height: $(options.element).parent().attr('expand-height') || 1
						};
						if(ctrl.horizontal) {
							if (ctrl.horizontal == 'all') {
								div.width = 1;
							}
							if (ctrl.vertical) {
								div.height = 1;
							}
							updatePropertyLength(options.context, options.element, "innerWidth", "width", "outerWidth", div.width);
						}
						if(ctrl.vertical) {
							if (ctrl.vertical == 'all') {
								div.height = 1;
							}
							updatePropertyLength(options.context, options.element, "innerHeight", "height", "outerHeight", div.height);
						}
					}
				}, this);
			}
		}
	};
	ui.init();
	
	function updatePropertyLength(context, element, property, parentProperty, outerProperty, expanders) {
		console.log("[updatePropertyLength] expanders", property, expanders, element);
		var length = $(element).parent()[parentProperty]();
		var count = 1;
		console.log("[updatePropertyLength] length", length);
		var el = $(element);
		//console.log("[updatePropertyLength] siblings of", el[0], el);
		//console.log("[updatePropertyLength] next siblings of", el[0], el.next()[0]);
		while(el.next().length) {
			el = el.next();
			if (el.attr('expand')==="true") {
				continue;
			}
			//console.log("[updatePropertyLength] next element", el[0], el[outerProperty]());
			length -= el[outerProperty]();
			++count;
		}
		el = $(element);
		//console.log("[updatePropertyLength] siblings of", el[0]);
		while(el.prev().length) {
			el = el.prev();
			if (el.attr('expand')==="true") {
				continue;
			}
			//console.log("[updatePropertyLength] prev element", el[0], el[outerProperty]());
			length -= el[outerProperty]();
			++count;
		}
		el = $(element);
		console.log("[updatePropertyLength] length of", el[0]);
		var delta = el[outerProperty]() - el[property]();
		console.log("[updatePropertyLength] new length", length, delta);
		length -= (count+1)*delta;
		console.log("[updatePropertyLength] new length", length);
		el[property](length / expanders);
	}
	
	//console.log("[App] Setting up UI bidings...");
	ko.bindingHandlers.ui = {
		init: function(element, valueAccessor, allBindings, viewModel, context) {
			//console.log("[ui:init] arguments", arguments);
			//console.log("[ui:init] valueAccessor", valueAccessor());
			var ctrl = valueAccessor();
			ui.list.push({
				ctrl: ctrl,
				element: element,
				model: viewModel,
				context: context
			});
			if(ctrl != undefined && ctrl.expand) {
				$(element).attr("expand", true);
				if(ctrl.horizontal) {
					var count = $(element).parent().attr('expand-width') || 0;
					$(element).parent().attr('expand-width', parseInt(count)+1);
				}
				if(ctrl.vertical) {
					var count = $(element).parent().attr('expand-height') || 0;
					$(element).parent().attr('expand-height', parseInt(count)+1);
				}
			}
		},
		update: function(element, valueAccessor, allBindings, viewModel, context) {
			//console.log("[ui:update] arguments", arguments);
		}
	};
	ko.bindingHandlers.attachTo = {
		init: function(element, valueAccessor, allBindings, viewModel, context) {
			//console.log("[attachTo:init]", arguments);
			//console.log("[attachTo:init]", valueAccessor());
			//console.log("[attachTo:init]", viewModel.url===valueAccessor);
			//console.log("[attachTo:init]", viewModel.url===valueAccessor());
			var actions = {
				enable: function() {
					$(element).removeAttr("disabled");
				},
				disable: function() {
					$(element).attr("disabled", "disabled");
				}
			};
			var opts = valueAccessor();
			opts.obj.subscribe(function() {
				//console.log("[attachTo:init] subscribe", arguments);
				if (actions.hasOwnProperty(opts.act)) {
					actions[opts.act]();
				}
			});
		},
		update: function(element, valueAccessor, allBindings, viewModel, context) {}
	};
	
	ko.bindingHandlers.parse = {
		init: function(element, valueAccessor, allBindings, viewModel, context) {
			//console.log("[parse:init]", arguments);
	        ko.applyBindingsToDescendants(context, element);
			var callback = valueAccessor();
			//console.log("[parse:init]", typeof(callback));
			if (typeof(callback)=="function") {
				callback(element, viewModel, context);
			} else if (typeof(callback)=="object" && typeof(callback.init)=="function") {
				callback.init(element, viewModel, context);
			}
			
			U.bus.trigger('expander');
			
	        return { controlsDescendantBindings: true };
		},
		update: function(element, valueAccessor, allBindings, viewModel, context) {
			//console.log("[parse:update]", arguments);
			if (typeof(callback)=="object" && typeof(callback.update)=="function") {
				callback.update(element, viewModel, context);
			}
		}
	};

	ko.bindingHandlers.style = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var css = ko.utils.unwrapObservable(valueAccessor());
			//console.log("[ko:style:init]", arguments, css);
			_.each(css, function(selector) {
				var $element = $("#content "+ko.unwrap(selector.name));
				_.each(selector.properties(), function(property) {
					if (property.name() && property.value()) {
						$element.css(ko.unwrap(property.name), ko.unwrap(property.value));
					}
				});
				//console.log("[ko:style:init]", $element);
			});
		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var css = ko.utils.unwrapObservable(valueAccessor());
			//console.log("[ko:style:update]", arguments, css);
			_.each(css, function(selector) {
				var $element = $("#content "+ko.unwrap(selector.name));
				$element.removeAttr("style");
				_.each(selector.properties(), function(property) {
					if (property.name() && property.value()) {
						//console.log("[ko:style:update:css:property]",property.name());
						$element.css(ko.unwrap(property.name), ko.unwrap(property.value));
					}
				});
				//console.log("[ko:style:update]", $element);
			});
		}
	};
	
	return {};
});
requirejs.config({
    baseUrl: 'js',
    
    paths: {
    	jquery: 'lib/jquery-2.1.0',
    	underscore: 'lib/underscore',
    	handlebars: 'lib/handlebars-v1.3.0',
    	template: 'lib/jquery-tmpl',
    	knockout: 'lib/knockout-3.0.0',
    	mapping: 'lib/knockout.mapping-2.0',
    	sammy: 'lib/sammy',
    	http: 'lib/http',
    	utils: 'lib/utils',
    	
    	handlers: 'handlers',
    	
    	app: 'app'
    },
    
    shim: {
    	template: {
    		deps: ['jquery'],
    		exports: "jQuery.fn.tmpl"
    	},
    	underscore: {
    		exports: '_'
    	},
    	knockout: {
    		deps: ["template", "underscore", "jquery"],
    		exports: "ko"
    	},
    	utils: {
    		exports: 'Utils'
    	},
    	'mode/css/css': {
    		deps: ['lib/codemirror']
    	},
    	'addon/edit/closebrackets': {
    		deps: ['lib/codemirror']
    	},
    	'addon/edit/matchbrackets': {
    		deps: ['lib/codemirror']
    	},
    	'addon/edit/closetag': {
    		deps: ['lib/codemirror']
    	},
    	handlers: {
    		deps: ['jquery', 'underscore', 'knockout', 'utils', 'lib/codemirror', 'mode/css/css']
    	},
    	app: {
    		deps: ["knockout"],
    		exports: "app"
    	}
    }
});

requirejs(['app'],
function(app) {
	app.start();
});
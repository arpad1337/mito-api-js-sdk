var MitoSDKError = function(msg, cause) {
	this.name = "MitoSDKError";
	this.message = msg;
	this.cause = cause;
};
MitoSDKError.prototype = new Error();
MitoSDKError.prototype.constructor = MitoSDKError;

var MitoSDK = (function() {
	"use strict";
	var _apiUrl = "http://api.mito.hu";
	var _isCreated = false,
		_options;
	/* TO DO: fill all the routes */
	var _routes = {
		'phone': {
			"bynumber": {
				"params": ["phonenumber"],
				"path": "/api/{key}/phone/{phonenumber}"
			},
			"withcountry": {
				"params": ["phonenumber", "country"],
				"path": "/api/{key}/phone/{country}/{phonenumber}"
			},
			"search": {
				"params": ["search", "firstname", "lastname", "city"],
				"path": "/api/{key}/phone/search/{country}/{firstname}/{lastname}/{city}"
			}
		}
	};
	var _checkEndpoint = function(endpoint, i, p) {
		if (i < endpoint.length && (endpoint[i] in p)) {
			p = p[endpoint[i]];
			i++;
			return _checkEndpoint(endpoint, i, p);
		}
		if (i < endpoint.length) {
			console.log(this);
			throw new MitoSDKError('Unknown endpoint.', endpoint);
		}
		return p;
	};
	var _handleReadyState = function(o, callback, errorCallback) {
		var poll = setInterval(function() {
			if (o && o.readyState == 4) {
				window.clearInterval(poll);
				var data = JSON.parse(o.responseText);
				if (o.status == 200) {
					if ("error" in data && errorCallback) {
						errorCallback.call(this, data);
						return;
					}
					if (callback) {
						callback.call(this, data);
					}
				} else if (o.status == 400) {
					if (errorCallback) {
						errorCallback.call(this, data);
					}
				}
			}
		}, 50);
	};
	var _getXHR = function() {
		var http;
		try {
			http = new XMLHttpRequest();
			_getXHR = function() {
				return new XMLHttpRequest();
			};
		} catch (e) {
			var msxml = [
				'MSXML2.XMLHTTP.3.0',
				'MSXML2.XMLHTTP',
				'Microsoft.XMLHTTP'
			];
			for (var i = 0, len = msxml.length; i < len; ++i) {
				try {
					http = new ActiveXObject(msxml[i]);
					_getXHR = function() {
						return new ActiveXObject(msxml[i]);
					};
					break;
				} catch (e) {}
			}
		}
		return http;
	};
	var _buildUrl = function(route,params){
		var url = _apiUrl;
		var path = route.path;
		var k = new RegExp("/{key}/g");
		if(k.test(path) && !("key" in _options) ) throw new MitoSDKError("Access token is missing.", _options);
		var p;
		for(p in params)
		{
			path = path.replace('{'+p+'}',params[p]);
		}
		path = path.replace('{key}',_options.key);
		return _apiUrl + path;
	};
	var _apiCall = function(route, data, callback, errorCallback) {
		var http = _getXHR();
		http.open('GET', _buildUrl(route,data) , true);
		http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		_handleReadyState(http, callback, errorCallback);
		http.send();
		return http;
	};
	return {
		init: function(options) {
			if (_isCreated) throw new MitoSDKError("Only one instance is allowed.", this);
			else _isCreated = true;
			_options = options || {};
		},
		api: function() {
			if (!_isCreated) {
				throw new MitoSDKError("MitoSDK is not initialized.", this);
			}
			var args = Array.prototype.slice.call(arguments, 0);
			if (args.length < 3) {
				throw new MitoSDKError('Unsupported call.', args);
			}
			var endpoint = args[0].substring(0, 1) == "/" ? args[0].substring(1).split('/') : args[0].split('/');
			// route validation
			var route = _checkEndpoint(endpoint, 0, _routes);
			// parameter validation
			var p;
			for (p in route.params) {
				if (!(route.params[p] in args[1])) throw new MitoSDKError('Missing parameter: ' + route.params[p] + '.', route.params);
			}
			_buildUrl(route,args[1]);
		},
		getRoutes: function() {
			return _routes;
		}
	};
})();
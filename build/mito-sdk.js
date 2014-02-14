var MitoApiSDKError = function(msg, cause) {
	this.name = 'MitoApiSDKError';
	this.message = msg;
	this.cause = cause;
};
MitoApiSDKError.prototype = new Error();
MitoApiSDKError.prototype.constructor = MitoApiSDKError;

var MitoApiSDK = (function(w) {
	'use strict';
	var _apiUrl = 'http://api.mito.hu';
	var _isInitialized = false,
		_options;
	/* TO DO: fill all the routes */
	var _routes = {
		'phone': {
			'bynumber': {
				'params': ['phonenumber'],
				'path': '/api/{key}/phone/{phonenumber}'
			},
			'withcountry': {
				'params': ['phonenumber', 'country'],
				'path': '/api/{key}/phone/{country}/{phonenumber}'
			},
			'search': {
				'params': ['country', 'firstname', 'lastname', 'city'],
				'path': '/api/{key}/phone/search/{country}/{firstname}/{lastname}/{city}'
			}
		},
		'email': {
			'params': ['email'],
			'path': '/api/{key}/email/{email}'
		},
		'name': {
			'bycountry': {
				'params': ['country', 'firstname', 'lastname'],
				'path': '/api/{key}/name/popularity/{country}/{firstname}/{lastname}'
			},
			'withcity': {
				'params': ['country', 'firstname', 'lastname', 'city'],
				'path': '/api/{key}/name/popularity/{country}/{firstname}/{lastname}/city/{city}'
			}
		},
		'identifier': {
			'personalid': {
				'params': ['number','country'],
				'path': '/api/{key}/validator/{country}/id/{number}'
			},
			'taxnumber': {
				'params': ['number','country'],
				'path': '/api/{key}/validator/{country}/tax/{number}'
			},
			'firmnumber': {
				'params': ['number','country'],
				'path': '/api/{key}/validator/{country}/firm/{number}'
			},
			'accountnumber': {
				'params': ['number','country'],
				'path': '/api/{key}/validator/{country}/account/{number}'
			},
			'ibannumber': {
				'params': ['number','country'],
				'path': '/api/{key}/validator/{country}/iban/{number}'
			},
			'eannumber': {
				'params': ['number','country'],
				'path': '/api/{key}/validator/{country}/ean/{number}'
			},
			'bicnumber': {
				'params': ['number','country'],
				'path': '/api/{key}/validator/{country}/bic/{number}'
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
			throw new MitoApiSDKError('Unknown endpoint.', endpoint);
		}
		return p;
	};
	var _parseJson = function(data) {
		if ("JSON" in w) {
			_parseJson = function(data) {
				return JSON.parse(data);
			};
			return JSON.parse(data);
		}
		_parseJson = function(data) { // fallback to eval
			if (/^[\],:{}\s]*$/.test(data.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				return eval('(' + data + ')');
			}
			throw new MitoApiSDKError('Response type is invalid!', data);
		};
		return _parseJson(data);
	};
	var _handleReadyState = function(o, callback, errorCallback) {
		var poll = setInterval(function() {
			if (o && o.readyState === 4) {
				w.clearInterval(poll);
				var data;
				if (o.responseText.length === 0) throw new MitoApiSDKError('It seems, the api hung down temporary.', o);
				data = _parseJson(o.responseText);
				if (o.status === 200) {
					if ('error' in data && errorCallback) {
						errorCallback.call(o, data); // assign response to this
						return;
					}
					callback.call(o, data);
				} else if (o.status >= 400) {
					if (errorCallback) {
						errorCallback.call(o, data);
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
			// shitty IE fallback, override after first call
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
	var _buildUrl = function(route, params) {
		var path = route.path;
		var k = new RegExp('/{key}/g'); // adding 'g' at the end for performance enhancement
		if (k.test(path) && !('key' in _options)) throw new MitoApiSDKError('API KEY is missing.', _options);
		var p;
		for (p in params) {
			path = path.replace('{' + p + '}', w.encodeURIComponent(params[p]));
		}
		path = path.replace('{key}', _options.key);
		return _apiUrl + path;
	};
	var _apiCall = function(route, params, callback, errorCallback) {
		var http = _getXHR();
		http.open('GET', _buildUrl(route, params), true);
		http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		_handleReadyState(http, callback, errorCallback);
		http.send();
		return http;
	};
	return {
		init: function(options) {
			if (_isInitialized) throw new MitoApiSDKError('SDK is initialized.', this);
			_isInitialized = true;
			_options = options || {};
		},
		api: function() {
			if (!_isInitialized) {
				throw new MitoApiSDKError('SDK is not initialized.', this);
			}
			var args = Array.prototype.slice.call(arguments, 0);
			if (args.length < 3) {
				throw new MitoApiSDKError('Unsupported call.', args);
			}
			if (typeof args[2] !== 'function') throw new MitoApiSDKError('Callback is not a function');
			if (args[3] && typeof args[3] !== 'function') throw new MitoApiSDKError('ErrorCallback is not a function');
			var endpoint = args[0].charAt(0) === '/' ? args[0].substring(1).split('/') : args[0].split('/');
			// route validation
			var route = _checkEndpoint(endpoint, 0, _routes);
			// parameter validation
			var p;
			for (p in route.params) {
				if (!(route.params[p] in args[1])) throw new MitoApiSDKError('Missing parameter: ' + route.params[p] + '.', route.params);
			}
			_apiCall(route, args[1], args[2], args[3]);
		},
		getRoutes: function() {
			return _routes;
		}
	};
})(window); // separate global namespace from local closure

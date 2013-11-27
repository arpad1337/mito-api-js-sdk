var MitoSDKError = function(msg, cause) {
	this.name = "MitoAPIError";
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
	var _rules = {
		'phone': {
			
		}
	};
	var _apiCall = function() {
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

		var _serialize = function(obj, prefix) {
			var str = [];
			for (var p in obj) {
				var k = prefix ? prefix + "[" + p + "]" : p,
					v = obj[p];
				str.push(typeof v == "object" ? _serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
			}
			return str.join("&");
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
		return function(method, uri, callback, errorCallback, postData) {
			var params = (postData) ? _serialize(postData) : null;
			var http = _getXHR();
			http.open(method, _apiUrl + uri, true);
			http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			_handleReadyState(http, callback, errorCallback);
			http.send(params);
			return http;
		};
	};
	return {
		init: function(options) {
			if (_isCreated) throw new MitoSDKError("Only one instance is allowed.", this);
			else _isCreated = true;
			_options = options || {};
		},
		api: function() {
			switch (arguments.length) {
				case 2:

					break;
				case 1:
				default:
					throw new MitoSDKError('Unsupported call.', this);
			}
		}
	};
})();
var googleoauth2crx = function() {
  var oauth_url = 'https://accounts.google.com/o/oauth2/auth';
  var token = '';
  var errorCode = {
    204: 'Empty Response',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Not Authorized',
    403: 'For Biddeng',
    404: 'Not Found',
    406: 'Not Acceptable',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  var httpMethod = {
    'GET': 'GET',
    'POST': 'POST',
    'PUT': 'PUT',
    'DELETE': 'DELETE'
  };

  var query_parse = function(query) {
    var obj = {};
    query.split('&').forEach(function(val) {
      var tmp = val.split('=');
      if (tmp.length != 2) return;
      obj[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1]);
    });
    return obj;
  };

  var query_stringify = function(obj) {
    var queries = [];
    for (var key in obj) {
      queries.push(encodeURIComponent(key)+'='+encodeURIComponent(obj[key]));
    }
    return queries.join('&');
  }

  var request = function(url, callback, error_callback, method, opt_params) {
    var request_url = url;
    var params = {};
    var post_data = '';
    var query_params = [];
    var dataType = 'json';

    params = opt_params;
    for (var key in params) {
      query_params.push(encodeURIComponent(key)+'='+encodeURIComponent(params[key]));
    };
    if (method == httpMethod.POST) {
      post_data = query_params.join('&');
    } else {
      request_url = query_params.length > 0 ? request_url+'?'+query_params.join('&') : request_url;
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      try {
        var data = JSON.parse(xhr.responseText);
      } catch(e) {
        var data = xhr.responseText;
      }
      callback(data);
    };
    xhr.onerror = function() {
      var error = '';
      try {
        var data = JSON.parse(xhr.responseText);
        error = data.error;
        console.debug('Response Code: '+xhr.status);
        console.debug('Error message: '+error);
      } catch(e) {
        if (errorCode[xhr.status] != undefined) {
          error = xhr.status+': '+errorCode[xhr.status];
        } else {
          error = xhr.status;
        }
      }
      error_callback(error);
    };
    xhr.open(method, request_url, true);
    xhr.send(post_data);
  };

  return {
    login: function(config) {
      var scope = config.scope.join(' ');
      var params = {
        client_id: config.api_key,
        redirect_uri: config.callback_url,
        scope: scope,
        response_type: 'token'
      }
      location.href = oauth_url+'?'+query_stringify(params);
    },
    setToken: function(_token) {
      token = _token;
    },
    api: function(path, callback, error_callback, params, method) {
      params = params || {};
      if (path.indexOf('?') !== -1) {
        var query_params = query_parse(path.substr(path.indexOf('?')+1));
        for (var key in query_params) {
          params[key] = query_params[key];
        }
        path = path.substr(0, path.indexOf('?'));
      }
      params.oauth_token = token.access_token;
      request(path, callback, error_callback, method || httpMethod.GET, params);
    }
  };
}();

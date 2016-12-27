exports.App = class App {
  /**
   * request
   */
  request(method, url, data, header) {
    var app = this;
    if (typeof method === 'object') {
      url    = method.url;
      data   = method.data;
      header = method.header;
      method = method.method;
    }
    var req = {
      method: method,
      url: url,
      header: {
        'X-Requested-With': 'wxapp',
      },
      data: {},
      query: {}
    },
    def = {
      config: function(name, value){
        if(arguments.length === 2) {
          req.options = req.options || {};
          req.options[ name ] = value;
        }
        else req.options = name;
        return def;
      },
      header: function(name, value) {
        if (arguments.length === 2)
          req.header[name] = value;
        else req.header = name;
        return def;
      },
      query: function(name, value) {
        if (arguments.length === 2)
          req.query[name] = value;
        else req.query = name;
        return def;
      },
      send: function(name, value) {
        if (arguments.length === 2) {
          req.data[name] = value;
        } else {
          req.data = name;
        }
        return def;
      },
      end: function(callback) {
        var p = new Promise(function(accept, reject) {
          if (!callback) {
            callback = function(err, res) {
              if (err) return reject(err);
              else accept(res);
            };
          }
        });
        for (var name in req.query) {
          req.url += ((!!~req.url.indexOf('?')) ? '&' : '?') + [
            encodeURIComponent(name),
            encodeURIComponent(req.query[name])
          ].join('=');
        }
        if (!req.header['content-type']) {
          if (req.method && req.method.toUpperCase() != 'GET') {
            req.header['content-type'] =  'application/x-www-form-urlencoded'
          } else {
            req.header['content-type'] =  'multipart/form-data'
          }
        }
        req.timestamp = +new Date;
        req.complete = function(res) {
          var error = null;
          var response = {
            request   : req,
            timestamp : +new Date,
            body      : res.data,
            statusCode: parseInt(res.statusCode)
          };
          callback && callback(error, response);
        };
        wx.request(req);
        return p;
      }
    };
    // define short method
    ('get post put delete').split(' ').forEach(function(method) {
      def[method] = (function() {
        return function(url) {
          req.url    = req.url    || url;
          req.method = req.method || method;
          return def;
        }
      })();
    });
    return def;
  }
}

exports.Page = class Page {
  setData(data){
    this.data = this.data || {};
    for(var k in data){
      this.data[ k ] = data[ k ];
    }
    return this.$ctx.setData(this.data);
  }
  onLoad(){
    console.log('xxx');
  }
}

exports.$Run = function(Component, register){
  const com = new Component();
  var props = [];
  var Ctor = Component;
  while(true){
    props = [].concat.apply(props, Object.getOwnPropertyNames(Ctor.prototype));
    if(typeof Ctor.__proto__.prototype === 'undefined'){
      break;
    }
    Ctor = Ctor.__proto__;
  }
  
  var keywords = [ 'constructor', 'setData' ];
  var methods = props.filter(function(prop){
    return keywords.indexOf(prop) === -1 && typeof com[ prop ] === 'function';
  });
  
  register(methods.reduce((item, method) => {
    var fn = com[ method ];
    item[ method ] = function(){
      com.$ctx = this;
      if(method === 'onLoad') com.setData();
      return fn.apply(com, arguments);
    }
    return item;
  }, {}));
  
}
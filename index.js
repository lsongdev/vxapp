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
        'X-Requested-With': 'wxapp'
      },
      data: {},
      query: {},
      options: {}
    },
    def = {
      config: function(name, value){
        if(arguments.length === 2) {
          req.options = req.options;
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
          wx.hideToast();
          wx.hideNavigationBarLoading();
          callback && callback(error, response);
        };
        if(req.options.loading){
          wx.showNavigationBarLoading();
          wx.showToast({
            title: '加载中...',
            icon: ' loading',
            duration: 10000
          })
        }
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
  onLoad(options){
    this.setData({ options: options });
    this.onPullDownRefresh();
  }
  onPullDownRefresh(){
    if(typeof this.onFetch === 'function'){
      this.data = this.data || {};
      var fetchIndex = 0;
      var fetchSize = this.data.fetchSize || 20;
      var fetchKey = this.data.fetchKey || 'list';
      this.onFetch(fetchIndex, fetchSize).then(list => {
        var data = {};
        data[ fetchKey ] = list;
        data['fetchIndex'] = fetchIndex;
        this.setData(data);
        wx.stopPullDownRefresh();
      });
    }
  }
  onReachBottom(){
    if(typeof this.onFetch === 'function'){
      this.data = this.data || {};
      var fetchIndex = this.data.fetchIndex || 0;
      var fetchSize = this.data.fetchSize || 20;
      var fetchKey = this.data.fetchKey || 'list';
      var fetchMore = this.data.fetchMore;
      if(typeof fetchMore !== 'undefined' && !fetchMore){
        return;
      }
      this.onFetch(++fetchIndex, fetchSize).then(list => {
        if(list.length){
          var data = {};
          list = this.data[ fetchKey ].concat(list);
          data[ 'fetchIndex' ] = fetchIndex;
          data[ fetchKey ] = list;
          this.setData(data);
        }
      });
    }
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

  register(props.filter(function(prop){
    var keywords = [ 'constructor', 'setData' ];
    return keywords.indexOf(prop) === -1;
  }).reduce((item, key) => {
    var prop = com[ key ];
    item[ key ] = typeof prop === 'function' ? (function(){
      com.$ctx = this;
      if(prop === 'onLoad') com.setData();
      return prop.apply(com, arguments);
    }) : prop;
    return item;
  }, {}));

}

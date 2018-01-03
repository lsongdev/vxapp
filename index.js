const META_DATA = '_';

const HOOKS = {
  'App': {},
  'Page': {}
};

let DEFAULT_CREATOR = function({ type, name, component, origin, hooks }) {
  return function() {
    let event = {};
    let shouldCancel = false;
    let shouldStop = false;

    Object.defineProperties(event, {
      type: {
        value: type
      },
      name: {
        value: name
      },
      component: {
        value: component
      },
      origin: {
        value: origin
      },
      args: {
        value: arguments
      },
      data: {
        value: {}
      },
      result: {
        value: undefined,
        writable: true
      },
      cancel: {
        value: function() {
          shouldCancel = true;
        }
      },
      stop: {
        value: function() {
          shouldStop = true;
        }
      },
    });

    for (const hook of hooks) {
      hook.call(this, event);
      if (shouldCancel) break;
    }

    if (!shouldStop
        && origin
        && typeof origin === 'function') {
      origin.apply(this, arguments);
    }
  }
};
let createHookHandler = DEFAULT_CREATOR

exports.App = class App {

  constructor() {
    wx.onCompassChange(res => 
      this.fire('CompassChange', res));

    wx.onAccelerometerChange(res => 
      this.fire('AccelerometerChange', res));

    this.wx2promise(wx.startCompass).then(x => {});
    this.wx2promise(wx.startAccelerometer).then(x => {});
    return this;
  }

  initData() {
    return Object.assign({}, this.globalData)
  }

  system(){
    return this.wx2promise(wx.getSystemInfo);
  }

  network(){
    return this.wx2promise(wx.getNetworkType);
  }

  on(type, fn){
    this.handlers = this.handlers || {};
    this.handlers[ type ] = this.handlers[ type ] || [];
    this.handlers[ type ].push(fn);
    return this;
  }

  off(type, fn){
    this.handlers = this.handlers || {};
    if(typeof fn === 'function'){
      const index = this.handlers[ type ].indexOf(fn);
      this.handlers[ type ].splice(index, 1);
    }else{
      delete this.handlers[ type ];
    }
    return this;
  }

  fire(type){
    this.handlers = this.handlers || {};
    const args = [].slice.call(arguments, 1);
    return (this.handlers[ type ] || []).map(fn => {
      return fn.apply(this, args);
    });
  }

  /**
   * 将微信小程序风格的函数调用转换成 Promise 风格
   */
  wx2promise(fn, params) {
    params = params || {};
    return new Promise((accept, reject) => {
      params.success = accept;
      params.fail = reject;
      fn(params);
    });
  }
  /**
   * [toast description]
   * @param  {[type]} message  [description]
   * @param  {[type]} duration [description]
   * @param  {[type]} type     [description]
   * @return {[type]}          [description]
   */
  toast(message, duration, type){
    type = type || 'loading';
    duration = duration || 2000;
    return this.wx2promise(wx.showToast, { 
      duration,
      icon: type,
      title: message
    });
  }
  /**
   * [dialog description]
   * @param  {[type]} title   [description]
   * @param  {[type]} content [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  dialog(title, content, options){
    options = options || {};
    options.title = title;
    options.content = content;
    return this.wx2promise(wx.showModal, options);
  }
  /**
   * [menu description]
   * @param  {[type]} itemList [description]
   * @return {[type]}          [description]
   */
  menu(itemList){
    return this.wx2promise(wx.showActionSheet, { itemList });
  }
  /**
   * [set description]
   * @param {[type]} key     [description]
   * @param {[type]} value   [description]
   * @param {[type]} options [description]
   */
  set(key, value, options){
    let meta = this.get(META_DATA) || {};
    options = options || {};
    if(key === undefined) return this;
    if(key === null){
      wx.clearStorage();
      return this;
    }
    if(value === undefined){
      meta[ key ] = undefined;
      delete meta[ key ];
      wx.removeStorageSync(key);
      wx.setStorageSync(META_DATA, meta);
      return this;
    }
    options.timestamp = +new Date;
    meta[ key ] = options;
    wx.setStorageSync(key, value);
    wx.setStorageSync(META_DATA, meta);
    return this;
  }
  /**
   * [get description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  get(key){
    let meta = wx.getStorageSync(META_DATA) || {};
    let self = this;
    if(typeof key === 'string'){
      let options = meta[ key ] || {};
      if(options.expires && +new Date - options.timestamp > options.expires){
        // expired
        return null;
      }
      return wx.getStorageSync(key);
    }
    return Object.keys(meta).reduce(function(item, key){
      item[ key ] = self.get(key);
      return item;
    }, {});
  }

  /**
   * [storage description]
   * @param  {[type]} key   [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  storage(key, value) {
    if (arguments.length === 2) {
      return this.set(key, value);
    } else {
      return this.get(key);
    }
  }

  /**
   * 设置页面标题
   */
  title(title){
    wx.setNavigationBarTitle({ title });
  }
  /**
   * 获取页面堆栈信息
   */
  pages(index){
    let pages = getCurrentPages();
    if(typeof index !== 'undefined'){
      if(index > 0){
        return pages[index];
      }else{
        return pages[ pages.length + index ];
      }
    }
    return pages;
  }
  /**
   * goto
   */
  goto(page){
    let app = this;
    let pages = app.pages();
    if(typeof page === 'string'){
      if(pages.length < 5){
        wx.navigateTo({ url: page });
      }else{
        wx.redirectTo({ url: page });
      }
    }else{
      wx.navigateBack({ delta: page });
    }

  }
  /**
   * [location description]
   * @return {[type]} [description]
   */
  location(){
    return this.wx2promise(wx.getLocation);
  }
  /**
   * [user description]
   * @return {[type]} [description]
   */
  user(){
    return this.wx2promise(wx.login)
    .then(res => res.code)
    .then(code => {
      return this.wx2promise(wx.getUserInfo)
      .then(userInfo => {
        userInfo.code = code;
        return userInfo;
      })
    })
  }
  /**
   * request
   * @param  {[type]} method [description]
   * @param  {[type]} url    [description]
   * @param  {[type]} data   [description]
   * @param  {[type]} header [description]
   * @return {[type]}        [description]
   */
  request(method, url, data, header) {
    let app = this;
    if (typeof method === 'object') {
      url    = method.url;
      data   = method.data;
      header = method.header;
      method = method.method;
    }
    let req = {
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
        if(arguments.length === 2)
          req.options[ name ] = value;
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
        if (arguments.length === 2)
          req.data[name] = value;
        else req.data = name;
        return def;
      },
      end: function(callback) {
        let p = new Promise(function(accept, reject) {
          if (!callback) {
            callback = function(err, res) {
              if(res && typeof req.options.success === 'function'){
                try{
                  res = req.options.success(res);
                }catch(e){
                  err = e;
                }
              }
              if(err && typeof req.options.error === 'function'){
                err = req.options.error(err);
              }
              if (err) return reject(err);
              accept(res);
            };
          }
        });
        for (let name in req.query) {
          req.url += (~req.url.indexOf('?') ? '&' : '?') + [
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
          let error = res.error;
          let response = {
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
    this.$ctx.data = this.$ctx.data || {};
    for(let k in data){
      this.$ctx.data[ k ] = data[ k ];
    }
    return this.$ctx.setData(this.$ctx.data);
  }
  initData() {
    return Object.assign({}, this.data)
  }
  onLoad(options){
    this.setData({ options: options });
    this.onPullDownRefresh();
  }
  onPullDownRefresh(){
    if(typeof this.onFetch === 'function'){
      this.data = this.data || {};
      let fetchIndex = 0;
      let fetchSize = this.data.fetchSize || 20;
      let fetchKey = this.data.fetchKey || 'list';
      this.onFetch(fetchIndex, fetchSize).then(list => {
        let data = {};
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
      let fetchIndex = this.data.fetchIndex || 0;
      let fetchSize = this.data.fetchSize || 20;
      let fetchKey = this.data.fetchKey || 'list';
      let fetchMore = this.data.fetchMore;
      if(typeof fetchMore !== 'undefined' && !fetchMore){
        return;
      }
      this.onFetch(++fetchIndex, fetchSize).then(list => {
        if(list.length){
          let data = {};
          list = this.data[ fetchKey ].concat(list);
          data[ 'fetchIndex' ] = fetchIndex;
          data[ fetchKey ] = list;
          this.setData(data);
        }
      });
    }
  }
}

exports.$Run = function(Component, register, registerName){
  const com = new Component();
  let props = [];
  let Ctor = Component;
  while(true){
    props = [].concat.apply(props, Object.getOwnPropertyNames(Ctor.prototype));
    if(typeof Ctor.__proto__.prototype === 'undefined'){
      break;
    }
    Ctor = Ctor.__proto__;
  }

  const options = props.filter(function(prop){
    let keywords = [ 'constructor', 'setData', 'initData' ];
    return keywords.indexOf(prop) === -1;
  }).reduce((item, key) => {
    let prop = com[ key ];
    item[ key ] = typeof prop === 'function' ? (function(){
      com.$ctx = this;
      if(prop === 'onLoad') com.setData();
      return prop.apply(com, arguments);
    }) : prop;
    return item;
  }, {});
  const optional = typeof com.initData === 'function' ? com.initData() : {};
  options.data = Object.assign({}, Object.assign(com.data || {}, optional));
  // add hook
  const hooks = HOOKS[registerName]
  Object.keys(hooks).forEach(name => {
    options[name] = createHookHandler({
      type: registerName,
      name,
      component: com,
      origin: options[name],
      hooks: hooks[name]
    });
  })
  register(options);

}

exports.setHookCreator = function(fn) {
  if (typeof fn === 'function') {
    createHookHandler = fn
    return true
  } else {
    createHookHandler = DEFAULT_CREATOR
    return false
  }
}

;['App', 'Page'].forEach(r => {
  exports[`register${r}Hook`] = function(name, handler) {
    if (HOOKS[r][name]) {
      HOOKS[r][name].push(handler);
    } else {
      HOOKS[r][name] = [handler];
    }
    return this;
  }

  exports[`clear${r}Hook`] = function(name) {
    if (typeof name === 'string') {
      HOOKS[r][name].length = 0;
    }
  }
});

'VXAPP_CONFIG_STUB';

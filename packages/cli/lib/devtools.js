const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const { MINA } = require('wechat-lite');
const { HOME } = process.env;
const root = process.cwd();

const devtools = new MINA({});

const APP_DIR = path.join(HOME, '.vxapp');
const profile = path.join(APP_DIR, 'profile');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

fs.ensureDirSync(APP_DIR);

const save = session => {
  return writeFile(profile, JSON.stringify(session));
};

const restore = () => {
  return readFile(profile, 'utf8').then(JSON.parse, x => null);
};

const getAppId = () => {
  var pkg, filename = path.join(root, 'project.config.json');
  try{
    pkg = require(filename);
  }catch(e){
    console.log('[@vxapp/cli] can not access', filename);
    process.exit(2);
    return;
  }
  if(!pkg.appid){
    console.log('[@vxapp/cli] appid is required in project.config.json');
    process.exit(3);
    return;
  }
  return pkg.appid;
};

const getCode = () => new Promise((resolve, reject) => {
  devtools.qrconnect({
    redirect_uri: 'https://mp.weixin.qq.com/xxx'
  }, async (err, res) => {
    if(err) return reject(err);
    const { state, qrcode, code } = res;
    switch(state){
      case 0:
        console.log('qrcode:', qrcode);
        break;
      case 405:
        resolve(code);
        break;
    }
  });
});

devtools.pack = project => MINA.pack(project);
devtools.requireLogin = async ({ force } = {}) => {
  const session = await restore();
  if(!force && session){
    devtools.appid = getAppId();
    return Object.assign(devtools, session);
  }
  const code = await getCode();
  const user = await devtools.login(code);
  return save(user);
};


module.exports = devtools;
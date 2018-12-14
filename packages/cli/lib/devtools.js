const path = require('path');
const fs = require('fs-extra');
const { MINA } = require('wechat-lite');
const pack = require('wechat-lite/lib/wxapp/pack');
const unpack = require('wechat-lite/lib/wxapp/unpack');

const devtools = new MINA();

const root = process.cwd();
const { HOME } = process.env;
const VXAPP_DIR = path.join(HOME, '.vxapp');

exports.login = async () => {
  devtools.qrconnect({
    redirect_uri: 'https://mp.weixin.qq.com/vxapp'
  }, async (err, res) => {
    if(err) return console.error('[@vxapp/cli] login error:', err);
    const { state, qrcode, code } = res;
    switch(state){
      case 0:
        console.log('qrcode', qrcode);
        break;
      case 405:
        console.log('scan success', code);
        const user = await devtools.login(code);
        // console.log('user', user);
        await fs.ensureDir(VXAPP_DIR);
        await fs.writeJSON(path.join(VXAPP_DIR, 'session'), user);
        console.log(`Hello ${user.nickname}, welcome to use @vxapp .`);
        break;
    }
  });
};

const restore = () => {
  try{
    return fs.readFileSync(path.join(VXAPP_DIR, 'session'));
  }catch(e){
    console.error('[@vxapp/cli] login required, You may need run `vxapp login` first.');
    process.exit(1);
  }
};

exports.preview = async (project, startPath) => {
  project = project || path.join(root, 'dist');
  const { newticket } = await restore();
  const package = pack(project);
  devtools.newticket = newticket;
  return devtools.preview(package, startPath);
};

exports.pack = (project, filename) => {
  if(!filename) return console.error('[@vxapp/cli] vxapp pack requires `--filename`');
  project = project || path.join(root, 'dist');
  return MINA.pack(project, path.resolve(filename));
};
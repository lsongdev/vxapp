const wxml = require('@vxapp/wxml');
const wxss = require('@vxapp/wxss');
const wxjs = require('@vxapp/wxjs');

const root = process.cwd();
// readFile
const readFile = promisify(fs.readFile);
const readJSONFile = (filename, encoding = 'utf8') => 
  readFile(filename, encoding).then(JSON.parse);

const build = async (src, out) => {
  const resolve = f => path.join(src, f);
  const appFile = resolve('app.json');
  const { pages } = await readJSONFile(appFile);
  const entries = [ 'app' ].concat(pages);
  const templates = entries.map(entry => resolve(`${entry}.wxml`));
  const javascripts = entries.map(entry => resolve(`${entry}.js`));
  const stylesheets = entries.map(entry => resolve(`${entry}.css`));
  Promise.all(templates.map(tmpl => wxml(tmpl)));
  Promise.all(stylesheets.map(style => wxss(style)));
  Promise.all(javascripts.map(script => wxjs(script)));
};
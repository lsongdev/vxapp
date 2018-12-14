#!/usr/bin/env node

const build = require('../lib/build');
const create = require('../lib/create');
const program = require('../lib/program');
const devtools = require('../lib/devtools');

program()
.command('new', async ({ _: [ name ] }) => {
  console.log('create vxapp project:', name);
  await create(name);
})
.command('build', async ({ src, out }) => {
  await build(src, out);
})
.command('login', async () => {
  await devtools.login();
})
.command('preview', async ({ src, out, path, version, message }) => {
  await build(src, out);
  const result = await devtools.preview(out, version, message, path);
  console.log('[@vxapp/cli] preview:', result);
})
.command('publish', async ({ version, message }) => {
  await devtools.publish('', version, message);
})
.command('pack', async ({ src, out, filename }) => {
  await build(src, out);
  await devtools.pack(src, filename);
})
.command('unpack', async ({ _, filename }) => {
  filename = filename || _[0];
  await devtools.unpack(filename);
})
.command('help', () => {
  console.log();
  console.log('~$ vxapp <command> [options]');
  console.log();
  console.log(' - new');
  console.log(' - build');
  console.log(' - pack');
  console.log(' - unpack');
  console.log(' - login');
  console.log(' - preview');
  console.log(' - publish');
  console.log(' - version');
  console.log(' - help');
})
.command('version', () => {
  console.log('');
})
.parse();
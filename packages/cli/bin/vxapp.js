#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const build = require('../lib/build');
const create = require('../lib/create');
const program = require('../lib/program');
const devtools = require('../lib/devtools');

program()
.command('new', async ({ _: [ name ] }) => {
  console.log('create vxapp project:', name);
  await create(name);
})
.command('build', async ({ _ }) => {
  const input = _[0] || 'src';
  const output = _[1] || 'dist';
  await build(input, output);
})
.command('login', async ({ force = true }) => {
  await devtools.requireLogin({ force });
})
.command('preview', async ({ _, path: startPath }) => {
  await devtools.requireLogin();
  const project = _[0] || './dist';
  const package = devtools.pack(project);
  const result = await devtools.preview(package, startPath);
  console.log('[@vxapp/cli] preview:', result.baseresponse);
  const qrcode = Buffer.from(result.qrcode_img, 'base64');
  const now = Date.now();
  const random = Math.random();
  const filename = path.join('/tmp', `vxapp-${now}-${random}.png`);
  fs.writeFile(filename, qrcode, () => {
    console.log('[@vxapp/cli] preview:', filename);
  });
})
.command('publish', async ({ _, version, message }) => {
  await devtools.requireLogin();
  const project = _[0] || './dist';
  const package = devtools.pack(project);
  const result = await devtools.publish(package, version, message);
  console.log('[@vxapp/cli] publish:', result);
})
.command('pack', async ({ _, filename }) => {
  const project = _[0] || './dist';
  await devtools.pack(project, filename);
})
.command('unpack', async ({ _, filename, output }) => {
  filename = filename || _[0];
  output = output || _[1];
  await devtools.unpack(filename, output);
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
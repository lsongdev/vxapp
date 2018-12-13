#!/usr/bin/env node

const build = require('../lib/build');
const create = require('../lib/create');
const program = require('../lib/program');

program()
.command('new', async ({ _: [ name ] }) => {
  console.log('create vxapp project:', name);
  await create(name);
})
.command('build', async ({ src, out }) => {
  await build(src, out);
})
.command('help', () => {
  console.log();
  console.log('~$ vxapp <command> [options]');
  console.log();
  console.log(' - new');
  console.log(' - build');
  console.log(' - version');
  console.log(' - help');
})
.command('version', () => {
  console.log('');
})
.parse();
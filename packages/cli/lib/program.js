const parse = (argv = process.argv.slice(2)) =>
  argv.reduce((args, value) => {
    if (value.startsWith('--')) {
      const m = value.match(/^--(\w+)(=(.+))?$/);
      const k = m[1];
      const v = m[3] ? m[3] : true;
      args[k] = v;
    } else {
      args._.push(value);
    }
    return args;
  }, {
    _: []
  });

const program = options => {
  const interface = {
    command(name, fn) {
      this.commands = this.commands || {};
      this.commands[name] = fn;
      return this;
    },
    exec(name = 'help') {
      const fn = this.commands[name];
      if (typeof fn !== 'function') {
        throw new TypeError(`command "${name}" not found`);
      }
      return fn.apply(this, [].slice.call(arguments, 1));
    },
    parse(argv) {
      const args = parse(argv);
      const name = args._.shift();
      return this.exec(name, args);
    }
  };
  return interface;
};

program.parse = parse;
module.exports = program;
export const vxapp = require('../index')

export const vxapp$run = function(_class, reg) {
  let ret
  vxapp.$Run(_class, reg(o => ret = o))
  return ret
}
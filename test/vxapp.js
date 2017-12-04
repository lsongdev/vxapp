export const vxapp = require('../index')

export const vxapp$run = function(_class, reg, regN) {
  let ret
  vxapp.$Run(_class, reg(o => ret = o), regN)
  return ret
}
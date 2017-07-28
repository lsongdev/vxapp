import proxyquire from 'proxyquire'

let dummyConfig = {
  libName: 'vxapp'
}

// proxy the config file
export const vxapp = proxyquire('../index', {
  '../config': {
    '@noCallThru': true,
    ...dummyConfig
  }
})

export const vxapp$run = function(_class, reg) {
  let ret
  vxapp.$Run(_class, reg(o => ret = o))
  return ret
}
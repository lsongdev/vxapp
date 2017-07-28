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
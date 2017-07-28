import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon from 'sinon'

import { wx } from '../wx'
import * as mp from '../mini-program'
import { vxapp } from '../vxapp'

global.wx = wx

describe('configuration', function() {
  it('should be an object by default', function() {
    class appForNoConfigTest extends vxapp.App {
    }
    let dummy = {}
    vxapp.$Run(appForNoConfigTest, mp.App(o => dummy = o))
    expect(dummy.data).to.be.a('object')
  })

  it('should return data after customizing initData', function() {
    class appForConfigTest extends vxapp.App {
      initData() {
        return {
          str: 'This is a test string.'
        }
      }
    }
    let dummy = {}
    vxapp.$Run(appForConfigTest, mp.App(o => dummy = o))
    expect(dummy.data).to.have.property('str').with.equal('This is a test string.')
  })
})
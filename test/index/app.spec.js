import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon from 'sinon'

import { wx } from '../wx'
import * as mp from '../mini-program'
import { vxapp, vxapp$run } from '../vxapp'

global.wx = wx

describe('App', function() {
  class appForTest extends vxapp.App {
  }
  let dummy

  describe('event', function() {
    let cb1 = sinon.spy()
    let cb2 = sinon.spy()
    dummy = new appForTest

    describe('on', function() {

      it('should bind event', function() {
        dummy.on('test', cb1)
        expect(dummy.handlers).to.be.a('object').with.property('test').to.be.a('array').lengthOf(1)
      })

      it('should store event in array', function() {
        dummy.on('test', cb2);
        expect(dummy.handlers.test).lengthOf(2)
      })
    })

    describe('off', function() {

      it('should remove a callback', function() {
        expect(dummy.handlers.test).lengthOf(2)
        dummy.off('test', cb1)
        expect(dummy.handlers.test).lengthOf(1)
        expect(dummy.handlers.test[0]).to.equal(cb2)
      })
    })

    describe('fire', function() {
      it('should trigger callback', function() {
        const message = 'this is a test message'
        dummy.fire('test', message)
        sinon.assert.calledWith(cb2, message)
      })
    })
  })
  
})
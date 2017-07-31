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

    describe('#on', function() {

      context('when called at the first time', function() {
        it('should bind event', function() {
          dummy.on('test', cb1)
          expect(dummy.handlers).to.be.a('object').with.property('test').to.be.a('array').lengthOf(1)
        })
      })

      context('when called at second time', function() {
        it('should store event in array', function() {
          dummy.on('test', cb2);
          expect(dummy.handlers.test).lengthOf(2)
        })
      })
    })

    describe('#fire', function() {
      it('should trigger callback', function() {
        const message = 'this is a test message'
        dummy.fire('test', message)
        sinon.assert.calledWith(cb1, message)
        sinon.assert.calledWith(cb2, message)
      })
    })

    describe('#off', function() {

      context('with param:fn', function() {
        it('should remove a callback', function() {
          expect(dummy.handlers.test).lengthOf(2)
          dummy.off('test', cb1)
          expect(dummy.handlers.test).lengthOf(1)
          expect(dummy.handlers.test[0]).to.equal(cb2)
        })
      })

      context('without param:fn', function() {
        it('should remove all callbacks', function() {
          dummy.off('test')
          expect(dummy.handlers).not.to.have.property('test')
        })
      })
    })
  })
  })
  
})
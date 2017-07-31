import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon from 'sinon'

import { wx } from '../wx'
import * as mp from '../mini-program'
import { vxapp, vxapp$run } from '../vxapp'

global.wx = wx

describe('App', function() {
  class appForTest extends vxapp.App {}

  describe('event', function() {
    let cb1 = sinon.spy()
    let cb2 = sinon.spy()
    let dummy = new appForTest

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

  describe('storage', function() {
    let app
    let sandbox

    beforeEach(function() {
      app = new appForTest
      sandbox = sinon.sandbox.create()
    })

    afterEach(function() {
      app = null
      sandbox.restore()
    })

    describe('#set', function() {

      context('when called without key', function() {
        it('should do nothing', function() {
          sandbox.stub(wx, 'removeStorageSync')
          sandbox.stub(wx, 'clearStorage')

          app.set()

          sinon.assert.notCalled(wx.removeStorageSync)
          sinon.assert.notCalled(wx.clearStorage)
        })
      })

      context('when called with key => null', function() {
        it('should call clearStorage internally', function() {
          sandbox.stub(wx, 'clearStorage')
          
          app.set(null)

          sinon.assert.called(wx.clearStorage)
        })
      })

      context('when called with key but without value', function() {
        it('should call removeStorageSync internally', function() {
          sandbox.stub(wx, 'removeStorageSync')

          app.set('test')

          sinon.assert.calledWith(wx.removeStorageSync, 'test')
        })
      })

      context('when called with key and value', function() {
        it('should call setStorageSync internally with k-v pair', function() {
          const params = ['test', 'this is a test string.']
          sandbox.stub(wx, 'setStorageSync')

          app.set(...params)

          sinon.assert.calledWith(wx.setStorageSync, ...params)
        })
      })
      
    })

    describe('#get', function() {

      context('when called with key', function() {
        it('should return value corresponded to the key', function() {
          const params = ['test', { str: 'this is a string.' }]
          sandbox.stub(wx, 'getStorageSync').withArgs(params[0]).returns(params[1])

          const val = app.get(params[0])

          expect(val).to.deep.equal(params[1])
        })
      })

      context('when called without key', function() {
        it('should return the whole storage', function() {
          const meta = [
            '_',  // key
            {
              a: {/*not concern*/},
              b: {/*not concern*/},
            }  // value
          ]
          const params = {
            a: 1,
            b: 2
          }
          const get = sandbox.stub(wx, 'getStorageSync')
          get.withArgs(meta[0]).returns(meta[1])
          get.withArgs('a').returns(params.a)
          get.withArgs('b').returns(params.b)

          const val0 = app.get()
          const val1 = app.get(0)
          const val2 = app.get([])
          const val3 = app.get({})

          expect(val0).to.deep.equal(params)
          expect(val1).to.deep.equal(params)
          expect(val2).to.deep.equal(params)
          expect(val3).to.deep.equal(params)
        })
      })
    })
    
  })
  
})
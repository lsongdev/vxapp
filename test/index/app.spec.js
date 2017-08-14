import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon from 'sinon'

import { wx } from '../wx'
import { vxapp, vxapp$run } from '../vxapp'

global.wx = wx

describe('App', function() {
  class appForTest extends vxapp.App {}

  describe('wx2promise', function() {
    let app = new appForTest
    const ret = {
      name: 'wechat'
    }
    function fakeNative(b) {
      const fn = sinon.stub()
      if (b) {
        return fn.yieldsTo('success', ret)
      } else {
        return fn.yieldsTo('fail', 'hmm?')
      }
    }
    
    context('when resolved', function() {
      it('should call resolve function', async function() {
        const resultPromise = new Promise((res, rej) => {
          return app.wx2promise(fakeNative(true))
          .then(res)
          .catch(rej)
        })

        try {
          const result = await resultPromise
          expect(result).to.deep.equal(ret)
        } catch(err) {
          throw new Error()
        }
      })
    })

    context('when rejected', function() {
      it('should call reject function', async function() {
        const resultPromise = new Promise((res, rej) => {
          return app.wx2promise(fakeNative(false))
          .then(res)
          .catch(rej)
        })

        try {
          const result = await resultPromise
        } catch(err) {
          expect(err).to.equal('hmm?')
        }
      })
    })
  })

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

    describe('#storage', function() {
      
      context('when called with two arguments', function() {
        it('should set value with key', function() {
          const params = ['test', 'this is a test string.']
          sandbox.stub(wx, 'setStorageSync')

          app.storage(...params)

          sinon.assert.calledWith(wx.setStorageSync, ...params)
        })
      })

      context('when called not with two arguments', function() {
        it('should get value with parameter as key', function() {
          const params = ['test', 'this is a string.']
          sandbox.stub(wx, 'getStorageSync').withArgs(params[0]).returns(params[1])

          const val = app.storage(params[0])
          
          expect(val).to.deep.equal(params[1])
        })
      })
      
    })
    
  })

  describe('request', function() {
    let app
    let sandbox

    beforeEach(function() {
      app = new appForTest
      sandbox = sinon.sandbox.create()
    })

    afterEach(function() {
      sandbox.restore()
      app = null
    })

    describe('#config', function() {
      it('should set key-value pair in options', async function() {
        const options = {
          test: 'this is a test string'
        }
        sandbox.stub(wx, 'request').yieldsTo('complete', {})

        try {
          await app.request()
                   .config('test', options.test)
                   .end()

          sinon.assert.calledWithMatch(wx.request, { options })
        } catch(err) {
          throw new Error(err)
        }

      })
    })

    describe('#header', function() {
      it('should set header', async function() {
        const header = {
          'x-test': 'test'
        }
        sandbox.stub(wx, 'request').yieldsTo('complete', {})

        try {
          await app.request()
                   .header('x-test', header['x-test'])
                   .end()

          sinon.assert.calledWithMatch(wx.request, { header })
        } catch(err) {
          throw new Error(err)
        }

      })
    })

    describe('#query', function() {
      it('should set queryString', async function() {
        const query = {
          x: 'x',
          y: 'y'
        }
        sandbox.stub(wx, 'request').yieldsTo('complete', {})

        try {
          await app.request()
                   .get('http://tets.com')
                   .query('x', query['x'])
                   .query('y', query['y'])
                   .end()

          sinon.assert.calledWithMatch(wx.request, { url: 'http://tets.com?x=x&y=y' })
        } catch(err) {
          throw new Error(err)
        }
      })
    })

    describe('#send', function() {
      it('should set data in \'data\' field', async function() {
        const data = {
          x: 'x',
          y: 'y'
        }
        sandbox.stub(wx, 'request').yieldsTo('complete', {})

        try {
          await app.request()
                   .post('http://tets.com')
                   .send('x', data['x'])
                   .send('y', data['y'])
                   .end()

          sinon.assert.calledWithMatch(wx.request, { data })
        } catch(err) {
          throw new Error(err)
        }
      })
    })
  })
  
})
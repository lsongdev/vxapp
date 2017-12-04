import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon, { sandbox } from 'sinon'

import { wx } from '../wx'
import { App, Page } from '../mini-program'
import { vxapp, vxapp$run } from '../vxapp'

global.wx = wx

describe('hook', function() {
  class simpleApp extends vxapp.App {}

  afterEach(function() {
    vxapp.clearAppHook('onLaunch')
  })

  describe('hook app onLaunch', function() {
    context('when initialized without custom onLaunch', function() {
      it('should call hook function', function() {
        const onLaunch = sinon.spy()
        vxapp.registerAppHook('onLaunch', onLaunch)

        const app = vxapp$run(simpleApp, App, 'App')
        app.onLaunch()
  
        expect(onLaunch.called).to.be.true
      })
    })

    context('when initialized with custom onLaunch', function() {
      it('should call hook function', function() {
        const onLaunch = sinon.spy()
        const conLaunch = sinon.spy()
        vxapp.registerAppHook('onLaunch', onLaunch)
  
        class appWithonLaunch extends vxapp.App {
          onLaunch() {
            conLaunch()
          }
        }
        const app = vxapp$run(appWithonLaunch, App, 'App')
        app.onLaunch()
  
        assert(onLaunch.calledBefore(conLaunch))
      })
    })

  })

  describe('register two handlers', function() {
    it('should call handlers in order', function() {
      const h1 = sinon.spy()
      const h2 = sinon.spy()
      vxapp.registerAppHook('onLaunch', h1).registerAppHook('onLaunch', h2)

      const app = vxapp$run(simpleApp, App, 'App')
      app.onLaunch()

      assert(h1.calledBefore(h2))
    })
  })

  describe('received event', function() {
    let h
    let app
    before(function() {
      h = sinon.spy()
      vxapp.registerAppHook('onLaunch', h)

      app = vxapp$run(simpleApp, App, 'App')
      app.onLaunch()
    })

    after(function() {
      h = app = null
    })
    
    it('should has name property', function() {
      assert(h.calledWithMatch({ name: 'onLaunch' }))
    })

    it('should has component property', function() {
      expect(h.args[0][0]['component']).to.be.an('object')
    })

    it('should has arguments property', function() {
      expect(h.args[0][0]['arguments']).to.be.arguments
    })

    it('should has result property', function() {
      assert(h.calledWithMatch({ result: undefined }))
    })

    it('should has cancel function', function() {
      expect(h.args[0][0]['cancel']).to.be.a('function')
    })

    it('should has stop function', function() {
      expect(h.args[0][0]['stop']).to.be.a('function')
    })
  })

  describe('event functions', function() {
    context('call cancel', function() {
      it('should cancel the rest of hooks', function() {
        function cancelHook(e) {
          e.cancel()
        }
        const h1 = sinon.spy(cancelHook)
        const h2 = sinon.spy()
        vxapp.registerAppHook('onLaunch', h1).registerAppHook('onLaunch', h2)
  
        const app = vxapp$run(simpleApp, App, 'App')
        app.onLaunch()
  
        assert(h1.called)
        assert(h2.notCalled)
      })
    })

    context('call stop', function() {
      it('should stop the origin call', function() {
        function stopOrigin(e) {
          e.stop()
        }
        const h1 = sinon.spy(stopOrigin)
        const h2 = sinon.spy()
        const conLaunch = sinon.spy()
        vxapp.registerAppHook('onLaunch', h1).registerAppHook('onLaunch', h2)
  
        class appWithOnLaunch extends vxapp.App {
          onLaunch() {
            conLaunch()
          }
        }
        const app = vxapp$run(appWithOnLaunch, App, 'App')
        app.onLaunch()

        assert(h1.called)
        assert(h2.called)
        assert(conLaunch.notCalled)
      })
    })
  })
})
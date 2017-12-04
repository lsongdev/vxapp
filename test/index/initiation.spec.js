import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon from 'sinon'

import { wx } from '../wx'
import * as mp from '../mini-program'
import { vxapp, vxapp$run } from '../vxapp'

global.wx = wx

describe('data initiation', function() {
  describe('App instance', function() {
    context('when created without initData()', function() {
      it('should have an object data by default', function() {
        class appWithoutInitData extends vxapp.App {
        }
        let dummy = vxapp$run(appWithoutInitData, mp.App, 'App')
        expect(dummy.data).to.be.a('object')
      })
    })
    
    context('when created with initData()', function() {
      it('should have data after customizing initData', function() {
        class appWithInitData extends vxapp.App {
          initData() {
            return {
              str: 'This is a test string.'
            }
          }
        }
        let dummy = vxapp$run(appWithInitData, mp.App, 'App')
        expect(dummy.data).to.have.property('str').with.equal('This is a test string.')
      })
    })
    
  })
  
  describe('Page instance', function() {
    context('when created without initData()', function() {
      it('should have an object data by default', function() {
        class PageWithoutInitData extends vxapp.Page {
        }
        let dummy = vxapp$run(PageWithoutInitData, mp.Page)
        expect(dummy.data).to.be.a('object')
      })
    })
    
    context('when created with initData()', function() {
      it('should have data after customizing initData', function() {
        class PageWithInitData extends vxapp.Page {
          initData() {
            return {
              str: 'This is a test string.'
            }
          }
        }
        let dummy = vxapp$run(PageWithInitData, mp.Page)
        expect(dummy.data).to.have.property('str').with.equal('This is a test string.')
      })
    })
    
  })
})
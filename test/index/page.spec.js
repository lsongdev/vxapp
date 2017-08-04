import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon from 'sinon'

import { wx } from '../wx'
import * as mp from '../mini-program'
import { vxapp, vxapp$run } from '../vxapp'

global.wx = wx

describe('Page', function() {
  class pageForTest extends vxapp.Page {}
  let page
  let sandbox

  beforeEach(function() {
    page = new pageForTest
    sandbox = sinon.sandbox.create()
    page.$ctx = {
      setData: sandbox.stub()
    }
  })

  afterEach(function() {
    sandbox.restore()
    page = null
  })
  
  describe('#setData', function() {
    it('should set data', function() {
      const args = {
        str: 'test'
      }

      page.setData(args)

      sinon.assert.calledWith(page.$ctx.setData, args)
    })
  })

  describe('#onLoad', function() {
    it('should set data on loading', async function() {
      const args = {
        str: 'test'
      }

      await page.onLoad(args)

      sinon.assert.calledWith(page.$ctx.setData, {options: args})
    })
  })

  describe('#onPullDownRefresh', function() {
    it('should fetch data', async function() {
      const list = [1, 2, 3]
      page.onFetch = page.onFetch || (function() {})
      sandbox.stub(page, 'onFetch').resolves(list)

      await page.onPullDownRefresh()

      sinon.assert.called(page.onFetch)
      sinon.assert.called(page.$ctx.setData)
    })
  })

  describe('#onReachBottom', function() {
    it('should fetch data', async function() {
      const list = [1, 2, 3]
      page.onFetch = page.onFetch || (function() {})
      sandbox.stub(page, 'onFetch').resolves(list)

      await page.onReachBottom()

      sinon.assert.called(page.onFetch)
      sinon.assert.called(page.$ctx.setData)
    })
  })
})
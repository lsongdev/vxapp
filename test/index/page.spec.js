import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon from 'sinon'

import { wx } from '../wx'
import { vxapp } from '../vxapp'

global.wx = wx

describe('Page', function() {
  class pageForTest extends vxapp.Page {}
  
  describe('#setData', function() {
    it('should set data')
  })

  describe('#onLoad', function() {
    it('should set data on loading')
  })

  describe('#onPullDownRefresh', function() {
    it('should fetch data')
  })

  describe('#onReachBottom', function() {
    it('should fetch data')
  })
})
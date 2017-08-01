import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import sinon from 'sinon'

import { wx } from '../wx'
import { vxapp } from '../vxapp'

global.wx = wx

describe('Page', function() {
  class pageForTest extends vxapp.Page {}
})
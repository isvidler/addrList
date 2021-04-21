const { expect } = require('chai')
const { accounts, contract } = require('@openzeppelin/test-environment')

const AddrList = contract.require('AddrList')

describe('AddrList', () => {
    const [ contractOwner, listOwner, listUser ] = accounts

    // Deploy a new contract before each test
    beforeEach(async () => this.contract = await AddrList.new({ from: contractOwner }))

    // Sample lists for use in test cases
    const list0 = [
        '0x9Ac977751e3E91110398fC3B95bc905F723a50eb',
        '0x719776f1Fb182C9Fa59D441f1472B1E4746B1D43',
        '0xfB33D47D33ac3992f7DEab5BFC9125E8a76479c1'
    ]

    const list1 = [
        '0xf037D4a34ea5EfF733348dA7d7982acE2c1964a4',
        '0x5288C65b5Fd34b19A2FB5c3df2Ee7E3da3CDf586',
        '0x2438A0c626A5477783187181F057EeC1a1E0f717'
    ]

    const extraAddress = '0x9fCE5CBE135a3c18c68B61b1f5505699B2c69Eb6'

    it('create a list', async () => {
        // createList with list0
        // expect list ID in `lists` mapping
        // expect ListCreated event with correct value
    })

    it('update a list', async () => {
        // createList with list0
        // expect list ID in `lists` state variable
        // updateList with list1
        // expect list ID in `lists` state variable
        // expect ListUpdated event with correct value
    })

    it('Non-owner attempts updateList', async () => {
        // createList with list0 as listOwner
        // expectRevert on updateList with list1 as listUser
    })

    it('queryList for an existing value', async () => {
        // createList with list0
        // expect queryList returns true for input list0[1]
    })

    it('queryList for a non-existing value', async () => {
        // createList with list0
        // expect queryList returns false for input extraAddress
    })

    it('queryList for a removed value after an update', async () => {
        // createList with list0
        // updateList with list1
        // expect queryList returns false for input list0[1]
    })

    it('queryList for a new value after an update', async () => {
        // createList with list0
        // updateList with list1
        // expect queryList returns true for input list1[1]
    })
})
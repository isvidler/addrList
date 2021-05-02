const { expect, assert } = require('chai')
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

const AddrList = artifacts.require('AddrList')

contract('AddrList', async accounts => {
    const [ listOwner, listUser ] = accounts

    beforeEach(async () => this.contract = await AddrList.deployed())
        
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

    it('create lists', async () => {
        const creationObject0 = await this.contract.createList(list0, { from: listOwner })
        const foundOwner0 = await this.contract.listOwners.call(1)
        assert.equal(listOwner, foundOwner0, "Incorrect listOwner")
        expectEvent(creationObject0, 'ListCreated', { listId: new BN('1'), owner: listOwner })

        const creationObject1 = await this.contract.createList(list0, { from: listUser })
        const foundOwner1 = await this.contract.listOwners.call(2)
        assert.equal(listUser, foundOwner1, "Incorrect listOwner")
        expectEvent(creationObject1, 'ListCreated', { listId: new BN('2'), owner: listUser })
    })

    it('create lists with call', async () => {
        const listId = await this.contract.createList.call(list0, { from: listOwner })
        assert.equal(listId.toString(), (new BN('3')).toString(), "Incorrect listId")
        const foundOwner = await this.contract.listOwners.call(listId)
        assert.equal(foundOwner, listOwner, "Incorrect listOwner")
    })

    // it('update a list', async () => {
    //     let listId = await this.contract.createList(list0, { from: listOwner })
    //     // expect list ID in `lists` mapping
    //     // ???
    //     await this.contract.updateList(list1, listId, { from: listOwner })
    //     // expect list ID in `lists` mapping
    //     // ???
    //     expectEvent(listId, 'ListUpdated', { id: listId, owner: listOwner })
    // })

    // it('Non-owner attempts updateList', async () => {
    //     let listId = await this.contract.createList(list0, { from: listOwner })
    //     await expectRevert(
    //         this.contract.updateList(list1, listId, { from: listUser }),
    //         'Only the owner of this list can call this function.'
    //     )
    // })

    // it('queryList for an existing value', async () => {
    //     let listId = await this.contract.createList(list0, { from: listOwner })
    //     let inList = await this.contract.queryList(listId, list0[1], { from: listUser })
    //     expect(inList).to.equal(true)
    // })

    // it('queryList for a non-existing value', async () => {
    //     let listId = await this.contract.createList(list0, { from: listOwner })
    //     let inList = await this.contract.queryList(listId, extraAddress, { from: listUser })
    //     expect(inList).to.equal(false)
    // })

    // it('queryList for a removed value after an update', async () => {
    //     let listId = await this.contract.createList(list0, { from: listOwner })
    //     await this.contract.updateList(list1, listId, { from: listOwner })
    //     let inList = await this.contract.queryList(listId, list0[1], { from: listUser })
    //     expect(inList).to.equal(false)
    // })

    // it('queryList for a new value after an update', async () => {
    //     let listId = await this.contract.createList(list0, { from: listOwner })
    //     await this.contract.updateList(list1, listId, { from: listOwner })
    //     let inList = await this.contract.queryList(listId, list1[1], { from: listUser })
    //     expect(inList).to.equal(true)
    // })
})
const { expect, assert } = require('chai')
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

const AddrList = artifacts.require('AddrList')

contract('AddrList', async accounts => {
    const [ treasuryOwner, listOwner, listUser ] = accounts

    // queryList fee amounts in wei
    const listOwnerFee = new BN('1000000000000')
    const treasuryFee  = new BN('100000000000')
    const sumFee = listOwnerFee.add(treasuryFee)
        
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

    beforeEach(async () => this.contract = await AddrList.new({ from: treasuryOwner }))

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
        const listId0 = await this.contract.createList.call(list0, { from: listOwner })
        assert.equal(listId0.toString(), (new BN('1')).toString(), "Incorrect listId")

        // Run as transaction instead of call to modify state
        await this.contract.createList(list0, { from: listOwner })

        const listId1 = await this.contract.createList.call(list0, { from: listOwner })
        assert.equal(listId1.toString(), (new BN('2')).toString(), "Incorrect listId")
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
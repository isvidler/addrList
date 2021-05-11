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

    // unique values
    const list1 = [
        '0xf037D4a34ea5EfF733348dA7d7982acE2c1964a4',
        '0x5288C65b5Fd34b19A2FB5c3df2Ee7E3da3CDf586',
        '0x2438A0c626A5477783187181F057EeC1a1E0f717'
    ]

    // first value overlaps with list0
    const list2 = [
        list0[1],
        '0x070d87c7A24c52E1BF78f8aA1fEEb8829Dc0B97d',
        '0x25630423fac7b0e3C1E9F2FeB010408fa1F04FEb'
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

    it('update a list', async () => {
        const listId = new BN('1')
        await this.contract.createList(list0, { from: listOwner })

        const updateEvent = await this.contract.updateList(list1, listId, { from: listOwner })
        expectEvent(updateEvent, 'ListUpdated', { listId: listId.toString(), owner: listOwner })

        // simple existence check for updated value
        const inList = await this.contract.queryList.call(listId, list1[1], { from: listUser, value: sumFee })
        assert.equal(inList, true, "List did not update correctly")
    })

    it('non-owner attempts updateList', async () => {
        const listId = new BN('1')
        await this.contract.createList(list0, { from: listOwner })

        await expectRevert(
            this.contract.updateList(list1, listId, { from: listUser }),
            'Only the owner of this list can call this function.'
        )

        // verifies that reverted update didn't change state
        const inList = await this.contract.queryList.call(listId, list1[1], { from: listUser, value: sumFee })
        assert.equal(inList, false, "Reverted update changed state")
    })

    it('queryList payment settlement', async () => {
        await this.contract.createList(list0, { from: listOwner })

        // get balances before query
        const preTreasuryBalance = new BN(await web3.eth.getBalance(treasuryOwner))
        const preOwnerBalance = new BN(await web3.eth.getBalance(listOwner))
        const preUserBalance = new BN(await web3.eth.getBalance(listUser))

        // run the query
        const queryObject = await this.contract.queryList(1, list0[1], { from: listUser, value: sumFee })

        // get balances after query
        const postTreasuryBalance = new BN(await web3.eth.getBalance(treasuryOwner))
        const postOwnerBalance = new BN(await web3.eth.getBalance(listOwner))
        const postUserBalance = new BN(await web3.eth.getBalance(listUser))

        // calculate final cost to user
        const gasCost = await calculateGasCost(queryObject)
        const userCost = gasCost.add(sumFee)
    
        // calculate changes in account balances
        const treasuryDiff = postTreasuryBalance.sub(preTreasuryBalance)
        const ownerDiff = postOwnerBalance.sub(preOwnerBalance)
        const userDiff = preUserBalance.sub(postUserBalance)

        // assert that address balance differences reflect fees and gas paid
        assert.equal(treasuryDiff.toString(), treasuryFee.toString(), "Treasury balance didn't change as expected")
        assert.equal(ownerDiff.toString(), listOwnerFee.toString(), "Owner balance didn't change as expected")
        assert.equal(userDiff.toString(), userCost.toString(), "User balance didn't change as expected")
    })

    it('queryList for an existing value', async () => {
        await this.contract.createList(list0, { from: listOwner })
        const inList = await this.contract.queryList.call(1, list0[1], { from: listUser, value: sumFee })
        assert.equal(inList, true, 'Correct value mising from list')
    })

    it('queryList for a non-existing value', async () => {
        await this.contract.createList(list0, { from: listOwner })
        let inList = await this.contract.queryList.call(1, extraAddress, { from: listUser, value: sumFee })
        assert.equal(inList, false, 'List contains incorrect value')
    })

    it('queryList for a removed value after an update', async () => {
        const listId = new BN('1')
        await this.contract.createList(list0, { from: listOwner })
        await this.contract.updateList(list2, listId, { from: listOwner })

        const inList = await this.contract.queryList.call(listId, list2[0], { from: listUser, value: sumFee })
        assert.equal(inList, false, "updateList did not remove value")
    })

    it('queryList for a new value after an update', async () => {
        const listId = new BN('1')
        await this.contract.createList(list0, { from: listOwner })
        await this.contract.updateList(list1, listId, { from: listOwner })

        const inList = await this.contract.queryList.call(listId, list1[1], { from: listUser, value: sumFee })
        assert.equal(inList, true, "updateList did not add value")
    })

    it('queryList for an unchanged value after an update', async () => {
        const listId = new BN('1')
        await this.contract.createList(list0, { from: listOwner })
        await this.contract.updateList(list1, listId, { from: listOwner })

        const inList = await this.contract.queryList.call(listId, list0[1], { from: listUser, value: sumFee })
        assert.equal(inList, true, "updateList changed value")
    })
})

// returns the amount spent in gas in a transaction as a BN
async function calculateGasCost(txObject) {
    const gasUsed = new BN(txObject.receipt.gasUsed)
    const tx = await web3.eth.getTransaction(txObject.tx)
    const gasPrice = new BN(tx.gasPrice)
    return gasUsed.mul(gasPrice)
}
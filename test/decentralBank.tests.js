const Tether = artifacts.require('./Tether.sol');
const RWD = artifacts.require('./RWD.sol');
const DecentralBank = artifacts.require('./DecentralBank.sol');

require('chai')
.use(require('chai-as-promised')) 
.should() 

contract('DecentralBank', ([owner, customer]) =>{
    let tether, rwd, decentralBank

    function tokens(number){
        return web3.utils.toWei(number, 'ether');
    }

    before(async () => {
        // load contracts
        tether = await Tether.new()
        rwd = await RWD.new()
        decentralBank = await DecentralBank.new(rwd.address, tether.address)

        await rwd.transfer(decentralBank.address, tokens('1000000'))

        // transfer 100 mock tether to customer 
        await tether.transfer(customer, tokens('100'),{from: owner})

    })

    describe('Tether Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await tether.name()
            assert.equal(name, 'Tether')
        })
    })

    describe('RWD Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await rwd.name()
            assert.equal(name, 'Reward Token')
        })
    })

    describe('Decentral Bank Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await decentralBank.name()
            assert.equal(name, 'Decental Bank')
        })

        it('Contract has tokens', async () => {
            let balance = await rwd.balanceOf(decentralBank.address)
            assert.equal(balance, tokens('1000000'))
        })
    })

    describe('Yeild Farming', async () =>{
        it('Rewards tokens for staking', async () =>{
            let result
            
            // check investor balance
            result = await tether.balanceOf(customer) 
            assert.equal(result.toString(), tokens('100'), 'inverster tether balance before staking')
            
        // Check staking for customer of 100 tokens
            await tether.approve(decentralBank.address,tokens('100'), {from: customer})
            await decentralBank.depositTokens(tokens('100'), {from: customer});

            // check updated balance of customer
            result = await tether.balanceOf(customer) 
            assert.equal(result.toString(), tokens('0'), 'inverster tether balance after staking')

            // check updated balance of decentralBank
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(), tokens('100'), 'Decentral Bank tether balance after staking')

            // check upadted status is true 
            result = await decentralBank.isStaking(customer)
            assert.equal(result.toString(), 'true', 'customer is staking staus after staking')

            // issue tokens
            await decentralBank.issueTokens({from: owner})

            // ensure only the owner can issue tokens
            await decentralBank.issueTokens({from: customer}).should.be.rejected; 

            //unstake tokens
            await decentralBank.unstakeTokens({from: customer})

            // check unstaking balances 
            result = await tether.balanceOf(customer) 
            assert.equal(result.toString(), tokens('100'), 'inverster tether balance after unstaking')

            // check updated balance of decentralBank
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(), tokens('0'), 'Decentral Bank tether balance after staking')

            // check upadted status is false 
            result = await decentralBank.isStaking(customer)
            assert.equal(result.toString(), 'false', 'customer is not staking staus after unstaking')

        })
    })

})

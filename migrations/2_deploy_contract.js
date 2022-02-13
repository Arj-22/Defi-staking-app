const Tether = artifacts.require('./Tether.sol');
const RWD = artifacts.require('./RWD.sol');
const DecentralBank = artifacts.require('./DecentralBank.sol');

module.exports = async function(deployer, network, accounts){
    //deploy Tehter contract
    await deployer.deploy(Tether); 
    const tether = await Tether.deployed(); 

    //Deploy RWD contract
    await deployer.deploy(RWD); 
    const rwd = await RWD.deployed();

    //Deploy DecentralBank contract
    await deployer.deploy(DecentralBank, rwd.address, tether.address); 
    const decentralBank = await DecentralBank.deployed(); 

    // Transfer all RWD tokens to Decentral bank

    await rwd.transfer(decentralBank.address,'1000000000000000000000000');

    //Distribute 100 Tether tokens to investor

    await tether.transfer(accounts[1], '100000000000000000000')
    
};

pragma solidity ^0.5.0;

import './Tether.sol';
import './RWD.sol';

contract DecentralBank{
    string public name = 'Decental Bank';
    address public owner; 
    Tether public tether;
    RWD public rwd; 

    address[] public stakers;

    mapping(address => uint) public stakingBalance; 
    mapping(address => bool) public hasStaked; 
    mapping(address => bool) public isStaking; 


    constructor(RWD _rwd,Tether _tether) public {
        rwd = _rwd; 
        tether = _tether; 
        owner = msg.sender; 
    }

    function depositTokens(uint _amount) public {

        require(_amount > 0, 'amount cannot be 0');
        // Transfer tether tokens to this contract address for staking
        tether.transferFrom(msg.sender, address(this), _amount);
        //update staking balance 
        stakingBalance[msg.sender] += _amount; 

        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        isStaking[msg.sender] = true; 
        hasStaked[msg.sender] = true; 

    }
    //unstake balance 
    function unstakeTokens() public {
        
        uint balance = stakingBalance[msg.sender]; 
        require(balance > 0, 'staking balance cant be less than 0'); 
        tether.transfer(msg.sender, balance); 

        stakingBalance[msg.sender] = 0; 
        isStaking[msg.sender] = false; 
        


    }

    //issue rewards 
    function issueTokens() public {
        require(owner == msg.sender, 'caller must be owner');

        for(uint i = 0; i < stakers.length; i++){
            address recipient = stakers[i]; 
            uint balance = stakingBalance[recipient] / 9; 
            if(balance > 0){
                rwd.transfer(recipient, balance); 
            }

        }

    }

}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Deployed token address:  0xb7411a799fb8a2F1e87BA9288912aE395b349dCB
contract MyToken is ERC20 {
    address public myOwner;
    mapping(address => uint256) public claims; 

    event TokensClaimed(address claimant, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
        myOwner = msg.sender; 
    }

    modifier onlyOwner() {
        require(msg.sender == myOwner, "Caller is not the owner");
        _;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function claimTokens() public {
        require(
            claims[msg.sender] < 3,
            "Maximum of 3 tokens have been claimed!"
        ); 
        uint256 claimAmount = 1 * (10**uint256(decimals())); 

        claims[msg.sender] += 1; 
        _mint(msg.sender, claimAmount); 

        emit TokensClaimed(msg.sender, claimAmount); 
    }
    
}

//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.0;

interface IERC20{
    function mint(address, uint) external;
    function transfer(address, uint) external;
    function transferFrom(address, address, uint) external;
}

contract Staking {
    address public owner;
    address public stakeTokenAddress;
    address public rewardTokenAddress;
    uint public freezingTime;
    uint public percents;

    struct StakeStruct{
        uint tokenAmount;
        uint timeStamp;
        uint rewardPaid;
    }

    mapping(address => StakeStruct) public stakes;

    event Stake(address indexed, uint, uint);
    event Claim(address indexed, uint);
    event Unstake(address indexed, uint);

    modifier checker() {
        require(stakes[msg.sender].tokenAmount > 0, "You don't have a stake");
        require(stakes[msg.sender].timeStamp + freezingTime < block.timestamp, "freezing time has not yet passed");
        _;
    }

    constructor(address _stakeTokenAddress, address _rewardTokenAddress, uint _freezingTime, uint _percents) {
        owner = msg.sender;
        stakeTokenAddress = _stakeTokenAddress;
        rewardTokenAddress = _rewardTokenAddress;
        freezingTime = _freezingTime;
        percents = _percents;
    }

    function stake(uint _amount) external {
        IERC20(stakeTokenAddress).transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender] = StakeStruct(_amount, block.timestamp, 0);
        emit Stake(msg.sender, block.timestamp, _amount);
    }

    function claim() external checker {
        // рассчитываме сколько раз уже необходимо 
        uint rewardCount = (block.timestamp - stakes[msg.sender].timeStamp) / freezingTime;
        uint reward = (stakes[msg.sender].tokenAmount / 100 * percents) * rewardCount - stakes[msg.sender].rewardPaid;
        require(reward != 0, "You have no reward available for withdrawal");
        IERC20(rewardTokenAddress).mint(msg.sender, reward);
        stakes[msg.sender].rewardPaid += reward;
        emit Claim(msg.sender, reward);
    }

    function unstake() external checker {
        IERC20(stakeTokenAddress).transfer(msg.sender, stakes[msg.sender].tokenAmount);
        emit Unstake(msg.sender, stakes[msg.sender].tokenAmount);
        stakes[msg.sender].tokenAmount = 0;
    }
}

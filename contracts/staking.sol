//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.17;

interface IERC20{
    function mint(address, uint256) external;
    function transfer(address, uint256) external;
    function transferFrom(address, address, uint256) external;
}

contract Staking {
    address public owner;
    address public stakeTokenAddress;
    address public rewardTokenAddress;
    uint256 public freezingTime;
    uint256 public percents;

    struct StakeStruct{
        uint256 tokenAmount;
        uint256 timeStamp;
        uint256 rewardPaid;
    }

    mapping(address => StakeStruct) public stakes;

    event Stake(address indexed sender, uint256 indexed timeStamp, uint256 indexed amount);
    event Claim(address indexed sender, uint256 indexed reward);
    event Unstake(address indexed sender, uint256 indexed amount);

    modifier checker() {
        require(stakes[msg.sender].tokenAmount > 0, "You don't have a stake");
        require(stakes[msg.sender].timeStamp + freezingTime < block.timestamp, "freezing time has not yet passed");
        _;
    }

    constructor(address _stakeTokenAddress, address _rewardTokenAddress, uint256 _freezingTime, uint256 _percents) {
        owner = msg.sender;
        stakeTokenAddress = _stakeTokenAddress;
        rewardTokenAddress = _rewardTokenAddress;
        freezingTime = _freezingTime;
        percents = _percents;
    }

    function stake(uint256 _amount) external {
        IERC20(stakeTokenAddress).transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender] = StakeStruct(_amount, block.timestamp, 0);
        emit Stake(msg.sender, block.timestamp, _amount);
    }

    function claim() external checker {
        uint256 rewardCount = (block.timestamp - stakes[msg.sender].timeStamp) / freezingTime;
        uint256 reward = (stakes[msg.sender].tokenAmount / 100 * percents) * rewardCount - stakes[msg.sender].rewardPaid;
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

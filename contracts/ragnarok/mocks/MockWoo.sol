// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockWoo is ERC20 {
    constructor() ERC20("Wootrade Network", "WOO") {}

    function mint(address receiver, uint256 amount) external {
        _mint(receiver, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}

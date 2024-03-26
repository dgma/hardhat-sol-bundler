// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {LenLibrary} from "./LenLibrary.sol";

contract MockContract {
    uint256 public len;
    uint256 public num;

    constructor(string memory word, uint256 num_) {
        len = LenLibrary.messageLen(word);
        num = num_;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {TestLibrary} from "./testLibrary.sol";

contract TestContract {
    uint256 public len;
    uint256 public num;

    constructor(string memory word, uint256 num_) {
        len = TestLibrary.messageLen(word);
        num = num_;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import {TestLibrary} from "./testLibrary.sol";

contract TestUpgradableContract is Initializable {
    uint256 private len;

    uint64 constant VERSION = 1;

    function _init(string memory word) private {
        len = TestLibrary.messageLen(word);
    }

    function initialize(string memory word) external initializer {
        _init(word);
    }

    function upgradeCallBack(string memory word) external reinitializer(VERSION) {
        _init(word);
    }
}
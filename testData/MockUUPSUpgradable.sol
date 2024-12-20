// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20 <0.9.0;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import {LenLibrary} from "./LenLibrary.sol";

contract MockUUPSUpgradable is Initializable, UUPSUpgradeable {
    uint256 private len;

    uint64 constant VERSION = 1;

    function _init(string memory word) private {
        len = LenLibrary.messageLen(word);
    }

    function initialize(string memory word) external initializer {
        _init(word);
    }

    function upgradeCallBack(string memory word) external reinitializer(VERSION) {
        _init(word);
    }

    function _authorizeUpgrade(address newImplementation) internal override {}
}

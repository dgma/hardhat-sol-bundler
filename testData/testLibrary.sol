// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

library TestLibrary {
    function messageLen(string memory message) external pure returns (uint256) {
        return bytes(message).length;
    }
}

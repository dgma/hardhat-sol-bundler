// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20 <0.9.0;

library LenLibrary {
    function messageLen(string memory message) external pure returns (uint256) {
        return bytes(message).length;
    }
}

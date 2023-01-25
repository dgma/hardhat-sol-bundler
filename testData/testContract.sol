// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {TestLibrary} from './testLibrary.sol';

contract TestContract {

  uint public len;

  constructor(string memory word) {
    len = TestLibrary.messageLen(word);
  }
}
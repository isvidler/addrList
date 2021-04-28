// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

import "../contracts/AddrList.sol";

contract TestAddrList {

  uint public initialBalance = 1 ether;

  AddrList addrListContract;

  address[] list0 = [
      0x9Ac977751e3E91110398fC3B95bc905F723a50eb,
      0x719776f1Fb182C9Fa59D441f1472B1E4746B1D43,
      0xfB33D47D33ac3992f7DEab5BFC9125E8a76479c1
  ];

  address[] list1 = [
      0xf037D4a34ea5EfF733348dA7d7982acE2c1964a4,
      0x5288C65b5Fd34b19A2FB5c3df2Ee7E3da3CDf586,
      0x2438A0c626A5477783187181F057EeC1a1E0f717
  ];


  function beforeEach() public {
    addrListContract = new AddrList();
  }

  function testCreateListTwice() public {
    uint32 id0 = addrListContract.createList(list0);
    require(id0 == 1 , "First created list has incorrect ID");

    address listOwner0 = addrListContract.listOwners(id0);
    require(listOwner0 == address(this), "First created list has an incorrect owner");

    uint32 id1 = addrListContract.createList(list1);
    require(id1 == 2 , "Second created list has incorrect ID");

    address listOwner1 = addrListContract.listOwners(id1);
    require(listOwner1 == address(this), "Second created list has an incorrect owner");
  }

  event addressValue(uint);

  function testQueryList() public {
   
    // Create lists
    uint32 id0 = addrListContract.createList(list0); 
    uint32 id1 = addrListContract.createList(list1);

    uint listOwnerFee   = 1000000000000 wei;
    uint treasuryFee    = 100000000000 wei;

    for(uint i = 0; i < list0.length; i++) {
      address addr = list0[i];
      bool addressInList = addrListContract.queryList{value: listOwnerFee + treasuryFee }(id0, addr);
      require(addressInList, "queryList returned false for address in list0");
    }

    // require(!addrListContract.queryList(id0, list1[0]), "queryList returned true for address that isn't in list0");

    // for(uint i = 0; i < list1.length; i++) {
    //   address addr = list1[i];
    //   require(addrListContract.queryList(id1, addr), string(abi.encodePacked("queryList returned false for address in list1: ", addr)));
    // }

    // require(!addrListContract.queryList(id1, list0[0]), "queryList returned true for address that isn't in list1");
  }
}
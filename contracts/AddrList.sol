// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title AddrList: A mechanism for delegated trust
/// @author Jonah Erlich, Ittai Svidler
/// @notice This contract can be used to create, update, and query lists
contract AddrList {
    
    /// @dev Keeps track of list owners
    mapping (uint32 => address payable) public listOwners;

    /// @dev Maps list id => address => bool for O(1) access
    mapping (uint32 => mapping(address => bool)) private lists;

    /// @dev ID value assigned to newest list, incremented after use
    uint32 private listCount;

    /// @dev Treasury address
    address payable treasury;
 
    /// @notice Restrict certain list actions to list owner
    /// @param _listId The id of the list in lists to check for ownership 
    modifier ownsList(uint32 _listId) { 
        require(msg.sender == listOwners[_listId], "Only the owner of this list can call this function."); 
        _; 
    }

    constructor() {
        treasury = payable(msg.sender);
    }

    /// TODO: Add events for createList (ListCreated) and updateList (ListUpdated)
    /// consider adding a non-indexed string for a canonical list name
    event ListCreated(uint32 indexed listId, address indexed owner);

    /// @notice Creates a new list
    /// @dev Sender of the transaction is the list owner
    /// @param _addresses The list of addresses to include in the list
    function createList(address[] calldata _addresses) public returns(uint32) {
        // Increment counter for use as listId
        listCount++;

        // Set list owner
        listOwners[listCount] = payable(msg.sender);

        // Create address set
        for(uint i = 0; i < _addresses.length; i++) {
            address addr = _addresses[i];
            lists[listCount][addr] = true;
        }

        emit ListCreated(listCount, msg.sender);

        return listCount;
    }

    /// @notice Replaces the values in a list with a new set of values
    /// @param _addresses The list of addresses to include in the list
    /// @param _listId The ID of the list to update
    function updateList(address[] calldata _addresses, uint32 _listId) public ownsList(_listId) {}
    
    /// @notice Queries a list to see if it contains an address
    /// @dev List owner and contract developers are paid a small fee for this function
    /// @param _listId The ID of the list to query
    /// @param _address The address to check for in the list
    function queryList(uint32 _listId, address _address) public payable returns(bool) {
        require(listOwners[_listId] != address(0), "List does not exist");

        uint listOwnerFee   = 1000000000000 wei;
        uint treasuryFee    = 100000000000 wei;

        require(msg.value == listOwnerFee + treasuryFee, "Not enough wei sent");

        address payable listOwner = listOwners[_listId];
        (bool sentToOwner, bytes memory data0) = listOwner.call{value: listOwnerFee}("");
        require(sentToOwner, "Failed to send Ether to listOwner");

        (bool sentToTreasury, bytes memory data1) = treasury.call{value: treasuryFee}("");
        require(sentToTreasury, "Failed to send Ether to treasury");

        return lists[_listId][_address];
    }
}

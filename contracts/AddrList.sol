// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @title AddrList: A mechanism for delegated trust
/// @author Jonah Erlich, Ittai Svidler
/// @notice This contract can be used to create, update, and query lists
contract AddrList {
    /// @dev Primary datastructure for storing a list
    struct AddressSet {
        address owner;
        mapping (address => bool) contains;
    }

    /// @dev Stores all lists maintained by the contract
    mapping (uint32 => AddressSet) public lists;
 
    /// @notice Restrict certain list actions to list owner
    /// @param _listId The id of the list in lists to check for ownership 
    modifier ownsList(uint32 _listId) { 
        require(msg.sender == lists[_listId].owner, "Only the owner of this list can call this function."); 
        _; 
    }

    /// TODO: Add events for createList and updateList

    /// @notice Creates a new list
    /// @dev Sender of the transaction is the list owner
    /// @param _addresses The list of addresses to include in the list
    function createList(address[] calldata _addresses) public returns(uint32) {}

    /// @notice Replaces the values in a list with a new set of values
    /// @param _addresses The list of addresses to include in the list
    /// @param _listId The ID of the list to update
    function updateList(address[] calldata _addresses, uint32 _listId) public ownsList(_listId) {}
    
    /// @notice Queries a list to see if it contains an address
    /// @dev List owner and contract developers are paid a small fee for this function
    /// @param _listId The ID of the list to query
    /// @param _address The address to check for in the list
    function queryList(uint32 _listId, address _address) public payable {}
}

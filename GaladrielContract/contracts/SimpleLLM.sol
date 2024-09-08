// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Galadriel {
    event ConversationStored(address sender, string message, string response);

    struct Conversation {
        string message;
        string response;
    }

    mapping(address => Conversation[]) private conversations;

    function storeConversation(string memory _message, string memory _response) public {
        conversations[msg.sender].push(Conversation(_message, _response));
        emit ConversationStored(msg.sender, _message, _response);
    }

    function getLastConversation() public view returns (string memory, string memory) {
        require(conversations[msg.sender].length > 0, "No conversations found");
        Conversation memory lastConv = conversations[msg.sender][conversations[msg.sender].length - 1];
        return (lastConv.message, lastConv.response);
    }

    function getConversationCount() public view returns (uint256) {
        return conversations[msg.sender].length;
    }
}
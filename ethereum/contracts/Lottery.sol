// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

contract Lottery {
    enum TicketType { t25, t50, t100 }
    bytes32 public name;
    uint256 public ticketPrice;
    uint public date;
    address public owner;
    address payable public winner;

    error InvalidPayment(uint256 payment);
    error TicketAlreadyPurchased(uint ticketNum);
    
    struct Ticket {
        TicketType ticketType;
        address owner;   
    }

    mapping(uint => Ticket) public tickets;
    uint [] public ticketList;

    function getTicketPrice(TicketType ticketType)  public view returns (uint256) {
        if (ticketType == TicketType.t25) return ticketPrice / 4;
        if (ticketType == TicketType.t50) return ticketPrice / 2;
        return ticketPrice;
    }

    modifier checkPayment(TicketType ticketType) {
        if (getTicketPrice(ticketType) != msg.value) revert InvalidPayment(msg.value);
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'only owner');
        _;
    }
    
    modifier validTicket(uint ticketNum) {
       require(tickets[ticketNum].owner != address(0), 'this is not valid');
        _;
    }    

    constructor(bytes32 _name, uint256 _ticketPrice, uint _date) {
        owner = msg.sender;
        name = _name;
        ticketPrice = _ticketPrice;
        date = _date;
    }

    function getTicket(uint ticketNum) public view validTicket(ticketNum) returns (TicketType, address) {
        return (tickets[ticketNum].ticketType, tickets[ticketNum].owner);
    }


    function purchase(TicketType ticketType, uint ticketNum) public payable checkPayment(ticketType) {
        require(tickets[ticketNum].owner == address(0), 'this ticket has been purchased');
        tickets[ticketNum] =  Ticket({
            owner: msg.sender,
            ticketType: ticketType
        });
        ticketList.push(ticketNum);
    }
}

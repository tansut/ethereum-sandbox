// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

contract Bid {

    enum BidState {
        active,
        waitVerification,
        completed
    }

    BidState public bidState;
    bytes32 public name;
    address public owner;
    uint256 public bidEndTime;
    uint256 public minBid;

    uint public totalVerifiers;
    uint public acceptedVerifiers;
    uint public verifiedVerifiers;

    struct Candidate {
        bytes32 name;
        uint256 score;
    }

    struct Verification {
        bool added;
        bool accepted;
        bool verified;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    Candidate[] public candidates;

    struct Bidding {
        uint256 candidate;
        uint payment;
    }

    mapping(address => Bidding[]) public bids;
    mapping(address => Verification) public verifications;

    constructor(
        bytes32 _name,
        uint256 _bidTime,
        uint256 _minBid,
        bytes32[] memory _candidates
    ) {
        owner = msg.sender;
        name = _name;
        bidEndTime = block.timestamp + _bidTime;
        minBid = _minBid;
        for (uint i = 0; i < _candidates.length; i++) {
            candidates.push(Candidate({name: _candidates[i], score: 0}));
        }
    }

    function setScores(uint[] memory scores) public onlyOwner {
        require(candidates.length == scores.length, 'invalid scores');
        for (uint i = 0; i < scores.length; i++) {
            candidates[i].score = scores[i];
        }
        bidState = BidState.waitVerification;
    }

    function bid(uint256 candidate) public payable {
        require(msg.value >= minBid, "should be greater than min bid");
        bids[msg.sender].push(Bidding({ payment: msg.value, candidate: candidate}));
    }

    function addVerifier(address adr) public onlyOwner {
        require(verifications[adr].added == false, 'already added as a verifier');
        verifications[adr] = Verification({
            added: true,
            verified: false,
            accepted: false
        });
        totalVerifiers+=1;
    }

    function claim() payable public returns (uint) {
        require(bids[msg.sender].length > 0, 'no bid from you');
        uint pay = bids[msg.sender][0].payment;
        payable(msg.sender).transfer(pay);
        return pay;
    }

    function acceptBeingVerifier() public {
        require(verifications[msg.sender].added == true, 'you are not invited as a verifier');
        require(verifications[msg.sender].accepted == true, 'already accepted');
        verifications[msg.sender].accepted = true;  
        acceptedVerifiers+=1;      
    }

    function verifiyScores() public {
        require(bidState == BidState.waitVerification, 'not this time');
        require(verifications[msg.sender].added == true, 'you are not invited as a verifier');
        require(verifications[msg.sender].accepted == true, 'accept being a verifier first');
        verifications[msg.sender].verified = true;
        verifiedVerifiers+=1;
    }    
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdminAuth {
    address public owner;

    struct Certificate {
        string registerNumber;
        string jsonHash;
        uint256 timestamp;
    }

    mapping(string => Certificate) private certificates;

    event CertificateAdded(string indexed registerNumber, string jsonHash);
    event CertificateRemoved(string indexed registerNumber);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function addCertificate(
        string memory _registerNumber,
        string memory _jsonHash
    ) public {
        require(
            bytes(certificates[_registerNumber].registerNumber).length == 0,
            "Certificate with this register number already exists"
        );

        certificates[_registerNumber] = Certificate({
            registerNumber: _registerNumber,
            jsonHash: _jsonHash,
            timestamp: block.timestamp
        });

        emit CertificateAdded(_registerNumber, _jsonHash);
    }

    function getCertificate(
        string memory _registerNumber
    )
        public
        view
        returns (string memory, string memory, uint256)
    {
        Certificate storage cert = certificates[_registerNumber];
        return (cert.registerNumber, cert.jsonHash, cert.timestamp);
    }

    function isAdmin(address /* _addr */) public pure returns (bool) {
        return true;
    }

    function removeCertificate(
        string memory _registerNumber
    ) public {
        require(
            bytes(certificates[_registerNumber].registerNumber).length != 0,
            "Certificate with this register number does not exist"
        );

        delete certificates[_registerNumber];
        emit CertificateRemoved(_registerNumber);
    }

    //  IMPORTANT: absorb unknown calls safely
    fallback() external payable {}
    receive() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChainGuard {

    struct Asset {
        string fileName;
        string fileHash;
        address owner;
        uint256 timestamp;
    }

    uint256 public assetCount;

    mapping(uint256 => Asset) public assets;

    function registerAsset(
        string memory _fileName,
        string memory _fileHash
    ) public {
        assetCount++;

        assets[assetCount] = Asset(
            _fileName,
            _fileHash,
            msg.sender,
            block.timestamp
        );
    }

    function verifyAsset(
        uint256 _assetId,
        string memory _fileHash
    ) public view returns (bool) {
        return keccak256(abi.encodePacked(assets[_assetId].fileHash))
            == keccak256(abi.encodePacked(_fileHash));
    }

    mapping(uint256 => mapping(address => bool)) public access;

    function grantAccess(
        uint256 _assetId,
        address _user
    ) public {
        require(
            assets[_assetId].owner == msg.sender,
            "Only owner can grant access"
        );

        access[_assetId][_user] = true;
    }

    function revokeAccess(
        uint256 _assetId,
        address _user
    ) public {
        require(
            assets[_assetId].owner == msg.sender,
            "Only owner can revoke access"
        );

        access[_assetId][_user] = false;
    }

    function checkAccess(
        uint256 _assetId,
        address _user
    ) public view returns (bool) {
        return access[_assetId][_user];
    }

}
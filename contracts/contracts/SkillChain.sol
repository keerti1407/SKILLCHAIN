// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SkillChain is ERC721, Ownable, Pausable {
    struct Certificate {
        string studentName;
        string courseName;
        string grade;
        uint256 issuedDate;
        string institution;
        bool isRevoked;
    }

    mapping(address => bool) public authorizedInstitutions;
    mapping(uint256 => Certificate) private certificates;

    uint256 public nextTokenId;

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed institution,
        address indexed studentWallet
    );
    event CertificateRevoked(uint256 indexed tokenId, address indexed institution);

    modifier onlyInstitution() {
        require(authorizedInstitutions[msg.sender], "Not an authorized institution");
        _;
    }

    constructor() ERC721("SkillChain Certificate", "SKCERT") Ownable(msg.sender) {}

    function addInstitution(address institution, bool isAuthorized) external onlyOwner {
        authorizedInstitutions[institution] = isAuthorized;
    }

    function mintCertificate(
        address studentWallet,
        string calldata studentName,
        string calldata courseName,
        string calldata grade,
        string calldata institution
    ) external onlyInstitution whenNotPaused returns (uint256) {
        require(studentWallet != address(0), "Invalid student wallet");

        uint256 tokenId = nextTokenId;
        nextTokenId += 1;

        _safeMint(studentWallet, tokenId);

        certificates[tokenId] = Certificate({
            studentName: studentName,
            courseName: courseName,
            grade: grade,
            issuedDate: block.timestamp,
            institution: institution,
            isRevoked: false
        });

        emit CertificateMinted(tokenId, msg.sender, studentWallet);
        return tokenId;
    }

    function revokeCertificate(uint256 tokenId) external onlyInstitution whenNotPaused {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        require(!certificates[tokenId].isRevoked, "Certificate already revoked");

        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    function verifyCertificate(uint256 tokenId) external view returns (Certificate memory) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return certificates[tokenId];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title AlumniSBT
 * @notice Soulbound Token (não-transferível) que certifica membros da Alumni Poli.
 *
 * Apenas administradores autorizados podem emitir credenciais.
 * Cada endereço pode ter no máximo um SBT (a formação primária).
 * As demais formações do membro ficam registradas no MemberProfile off-chain.
 *
 * "Soulbound" = transferência desabilitada — o token representa identidade,
 * não um ativo financeiro.
 */
contract AlumniSBT {
    // -------------------------------------------------------------------------
    // Eventos
    // -------------------------------------------------------------------------

    event CredentialIssued(address indexed to, uint256 indexed tokenId, address indexed issuedBy);
    event CredentialRevoked(address indexed member, address indexed revokedBy);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    // -------------------------------------------------------------------------
    // Erros
    // -------------------------------------------------------------------------

    error NotAdmin();
    error AlreadyHasCredential();
    error NoCredential();
    error Soulbound();
    error ZeroAddress();

    // -------------------------------------------------------------------------
    // Estado
    // -------------------------------------------------------------------------

    address public owner;
    mapping(address => bool) public admins;

    uint256 private _nextTokenId;

    /// tokenId → endereço do titular
    mapping(uint256 => address) private _ownerOf;

    /// endereço → tokenId (0 = não possui)
    mapping(address => uint256) private _tokenOf;

    /// tokenId → hash do perfil primário (graduationYear, course, degreeType)
    mapping(uint256 => bytes32) public credentialHash;

    /// tokenId → timestamp de emissão
    mapping(uint256 => uint256) public issuedAt;

    // -------------------------------------------------------------------------
    // Construtor
    // -------------------------------------------------------------------------

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
        _nextTokenId = 1;
    }

    // -------------------------------------------------------------------------
    // Modificadores
    // -------------------------------------------------------------------------

    modifier onlyAdmin() {
        if (!admins[msg.sender]) revert NotAdmin();
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // -------------------------------------------------------------------------
    // Administração
    // -------------------------------------------------------------------------

    function addAdmin(address admin) external onlyOwner {
        if (admin == address(0)) revert ZeroAddress();
        admins[admin] = true;
        emit AdminAdded(admin);
    }

    function removeAdmin(address admin) external onlyOwner {
        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    // -------------------------------------------------------------------------
    // Emissão de credencial
    // -------------------------------------------------------------------------

    /**
     * @notice Emite um SBT para um membro verificado.
     * @param to Endereço Ethereum do membro.
     * @param _credentialHash Hash dos dados da formação primária
     *        (keccak256 de course + graduationYear + degreeType).
     *        Os dados completos ficam no MemberProfile off-chain.
     */
    function issueCredential(address to, bytes32 _credentialHash) external onlyAdmin returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        if (_tokenOf[to] != 0) revert AlreadyHasCredential();

        uint256 tokenId = _nextTokenId++;
        _ownerOf[tokenId] = to;
        _tokenOf[to] = tokenId;
        credentialHash[tokenId] = _credentialHash;
        issuedAt[tokenId] = block.timestamp;

        emit CredentialIssued(to, tokenId, msg.sender);
        return tokenId;
    }

    // -------------------------------------------------------------------------
    // Revogação de credencial
    // -------------------------------------------------------------------------

    /**
     * @notice Revoga o SBT de um membro. Irreversível — para reintegrar,
     *         o membro deve solicitar nova credencial.
     * @param member Endereço Ethereum do membro a ter a credencial revogada.
     */
    function revokeCredential(address member) external onlyAdmin {
        uint256 tokenId = _tokenOf[member];
        if (tokenId == 0) revert NoCredential();

        delete _ownerOf[tokenId];
        delete _tokenOf[member];

        emit CredentialRevoked(member, msg.sender);
    }

    // -------------------------------------------------------------------------
    // Consultas
    // -------------------------------------------------------------------------

    function hasCredential(address account) external view returns (bool) {
        return _tokenOf[account] != 0;
    }

    function tokenOf(address account) external view returns (uint256) {
        return _tokenOf[account];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return _ownerOf[tokenId];
    }

    // -------------------------------------------------------------------------
    // Soulbound — transferência bloqueada
    // -------------------------------------------------------------------------

    function transfer(address, uint256) external pure {
        revert Soulbound();
    }

    function approve(address, uint256) external pure {
        revert Soulbound();
    }
}

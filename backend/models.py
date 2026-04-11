from typing import List

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    wallet: str


class CertificateIssueRequest(BaseModel):
    studentName: str
    studentWallet: str
    courseName: str
    grade: str
    institution: str


class CertificateRecord(BaseModel):
    tokenId: int
    studentName: str
    studentWallet: str
    courseName: str
    grade: str
    institution: str
    issuedDate: str
    isRevoked: bool


class SkillSuggestionRequest(BaseModel):
    """certificates: list of course names from the learner's issued certs."""

    domain: str = ""
    currentSkills: List[str] = []
    certificates: List[str] = []


class SkillSuggestionResponse(BaseModel):
    suggestions: List[str]


class BulkCertificateItem(BaseModel):
    studentName: str
    studentWallet: str
    courseName: str
    grade: str
    institution: str


class BulkIssueRequest(BaseModel):
    certificates: List[BulkCertificateItem]


class BulkIssueResultItem(BaseModel):
    studentName: str
    courseName: str
    grade: str
    tokenId: int | None = None
    status: str  # "success" | "failed"
    error: str | None = None


class BulkIssueResponse(BaseModel):
    results: List[BulkIssueResultItem]
    successCount: int
    failedCount: int

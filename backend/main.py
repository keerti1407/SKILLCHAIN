import os
import random
from datetime import datetime, timezone
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from auth import create_access_token, decode_access_token
from models import (
    BulkIssueRequest,
    BulkIssueResponse,
    BulkIssueResultItem,
    CertificateIssueRequest,
    CertificateRecord,
    LoginRequest,
    LoginResponse,
    SkillSuggestionRequest,
    SkillSuggestionResponse,
)

load_dotenv()

app = FastAPI(title="SkillChain API")
auth_scheme = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://localhost:4201",
        "https://skillchain-roan.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STUDENT_DEMO_WALLET = "0x2222222222222222222222222222222222222222"
EMPLOYER_DEMO_WALLET = "0x3333333333333333333333333333333333333333"

MOCK_CERTIFICATES_DB: Dict[int, CertificateRecord] = {
    1: CertificateRecord(
        tokenId=1,
        studentName="Abhiraj Pal",
        studentWallet=STUDENT_DEMO_WALLET,
        courseName="Blockchain Development",
        grade="A+",
        institution="NDIM Delhi",
        issuedDate="2026-04-10T00:00:00+00:00",
        isRevoked=False,
    ),
    2: CertificateRecord(
        tokenId=2,
        studentName="Ayushi Tiwari",
        studentWallet=STUDENT_DEMO_WALLET,
        courseName="Web3 & DeFi",
        grade="A",
        institution="NDIM Delhi",
        issuedDate="2026-04-10T00:00:00+00:00",
        isRevoked=False,
    ),
    3: CertificateRecord(
        tokenId=3,
        studentName="Keerti Singh",
        studentWallet=EMPLOYER_DEMO_WALLET,
        courseName="Smart Contracts",
        grade="A+",
        institution="NDIM Delhi",
        issuedDate="2026-04-10T00:00:00+00:00",
        isRevoked=False,
    ),
}

NEXT_TOKEN_ID = 4

USERS = {
    "institution1": {
        "password": "institution123",
        "role": "institution",
        "wallet": "0x1111111111111111111111111111111111111111",
    },
    "student1": {
        "password": "student123",
        "role": "student",
        "wallet": STUDENT_DEMO_WALLET,
    },
    "employer1": {
        "password": "employer123",
        "role": "employer",
        "wallet": EMPLOYER_DEMO_WALLET,
    },
}

DEFAULT_SKILLS = [
    "Blockchain Security",
    "Smart Contract Testing",
    "DeFi Protocol Design",
    "Solidity Gas Optimization",
    "Web3 Frontend Integration",
    "Zero Knowledge Basics",
]


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(auth_scheme),
) -> Dict[str, str]:
    return decode_access_token(credentials.credentials)


def require_role(user: Dict[str, str], allowed_roles: List[str]) -> None:
    if user.get("role") not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient role permissions.",
        )


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    username = payload.username.strip()
    password = payload.password.strip()

    print(f"=== LOGIN: {username} ===")

    if username == "institution1" and password == "institution123":
        account = USERS["institution1"]
    elif username == "student1" and password == "student123":
        account = USERS["student1"]
    elif username == "employer1" and password == "employer123":
        account = USERS["employer1"]
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = create_access_token(
        {
            "sub": username,
            "role": account["role"],
            "wallet": account["wallet"],
        }
    )
    return LoginResponse(
        access_token=token,
        role=account["role"],
        wallet=account["wallet"]
    )


@app.post("/certificate/issue")
def issue_certificate(
    payload: CertificateIssueRequest,
    user: Dict[str, str] = Depends(get_current_user)
) -> Dict[str, int]:
    global NEXT_TOKEN_ID
    require_role(user, ["institution"])
    token_id = NEXT_TOKEN_ID
    NEXT_TOKEN_ID += 1
    cert = CertificateRecord(
        tokenId=token_id,
        studentName=payload.studentName,
        studentWallet=payload.studentWallet,
        courseName=payload.courseName,
        grade=payload.grade,
        institution=payload.institution,
        issuedDate=datetime.now(timezone.utc).isoformat(),
        isRevoked=False,
    )
    MOCK_CERTIFICATES_DB[token_id] = cert
    return {"tokenId": token_id}


@app.get("/certificate/verify/{token_id}", response_model=CertificateRecord)
def verify_certificate(
    token_id: int,
    user: Dict[str, str] = Depends(get_current_user)
) -> CertificateRecord:
    require_role(user, ["institution", "student", "employer"])
    cert = MOCK_CERTIFICATES_DB.get(token_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    return cert


@app.get("/certificate/public/verify/{token_id}", response_model=CertificateRecord)
def public_verify_certificate(token_id: int) -> CertificateRecord:
    cert = MOCK_CERTIFICATES_DB.get(token_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    return cert


@app.get("/certificate/student/{wallet}", response_model=List[CertificateRecord])
def get_student_certificates(
    wallet: str,
    user: Dict[str, str] = Depends(get_current_user)
) -> List[CertificateRecord]:
    require_role(user, ["institution", "student", "employer"])
    print(f"=== STUDENT CERTS: wallet={wallet}, DB size={len(MOCK_CERTIFICATES_DB)} ===")
    certs = [
        cert for cert in MOCK_CERTIFICATES_DB.values()
        if cert.studentWallet.lower() == wallet.lower()
    ]
    print(f"    Matched {len(certs)} certs for wallet {wallet}")
    if not certs:
        print(f"    No match — returning ALL {len(MOCK_CERTIFICATES_DB)} certs as fallback")
        certs = list(MOCK_CERTIFICATES_DB.values())
    return certs


@app.post("/ai/suggest-skills", response_model=SkillSuggestionResponse)
def suggest_skills(
    payload: SkillSuggestionRequest,
    user: Dict[str, str] = Depends(get_current_user)
) -> SkillSuggestionResponse:
    require_role(user, ["student", "institution", "employer"])
    api_key = os.getenv("GEMINI_API_KEY", "")
    suggestions: List[str] = []

    if payload.certificates:
        domain = " ".join(payload.certificates)
        current_skills = list(payload.certificates)
    else:
        domain = payload.domain
        current_skills = payload.currentSkills

    try:
        if not api_key:
            raise ValueError("Gemini API key is missing.")
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = (
            "Return exactly 3 concise skill suggestions as a comma-separated list.\n"
            f"Domain: {domain}\n"
            f"Current skills: {', '.join(current_skills) if current_skills else 'None'}"
        )
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        raw_text = (response.text or "").strip()
        suggestions = [s.strip() for s in raw_text.split(",") if s.strip()][:3]
    except Exception as e:
        print(f"Gemini error: {e}")
        pool = [s for s in DEFAULT_SKILLS if s not in current_skills]
        random.shuffle(pool)
        suggestions = pool[:3] if len(pool) >= 3 else random.sample(DEFAULT_SKILLS, 3)

    if len(suggestions) < 3:
        additional = [s for s in DEFAULT_SKILLS if s not in suggestions]
        random.shuffle(additional)
        suggestions.extend(additional[:3 - len(suggestions)])

    return SkillSuggestionResponse(suggestions=suggestions[:3])


@app.post("/certificate/bulk-issue", response_model=BulkIssueResponse)
def bulk_issue_certificates(
    payload: BulkIssueRequest,
    user: Dict[str, str] = Depends(get_current_user),
) -> BulkIssueResponse:
    """Mint multiple certificates in one request. Continues even if one fails."""
    global NEXT_TOKEN_ID
    require_role(user, ["institution"])

    results: List[BulkIssueResultItem] = []
    success_count = 0
    failed_count = 0

    for item in payload.certificates:
        try:
            token_id = NEXT_TOKEN_ID
            NEXT_TOKEN_ID += 1
            institution = item.institution or user.get("sub", "SkillChain")
            cert = CertificateRecord(
                tokenId=token_id,
                studentName=item.studentName,
                studentWallet=item.studentWallet,
                courseName=item.courseName,
                grade=item.grade,
                institution=institution,
                issuedDate=datetime.now(timezone.utc).isoformat(),
                isRevoked=False,
            )
            MOCK_CERTIFICATES_DB[token_id] = cert
            print(f"=== BULK MINT: token #{token_id} for {item.studentName} | {item.courseName} | wallet={item.studentWallet} ===")
            results.append(
                BulkIssueResultItem(
                    studentName=item.studentName,
                    courseName=item.courseName,
                    grade=item.grade,
                    tokenId=token_id,
                    status="success",
                )
            )
            success_count += 1
        except Exception as e:
            results.append(
                BulkIssueResultItem(
                    studentName=item.studentName,
                    courseName=item.courseName,
                    grade=item.grade,
                    status="failed",
                    error=str(e),
                )
            )
            failed_count += 1

    return BulkIssueResponse(
        results=results,
        successCount=success_count,
        failedCount=failed_count,
    )
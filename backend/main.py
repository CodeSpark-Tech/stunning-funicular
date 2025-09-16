from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from celery import Celery
import os

# Config
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'sentinel')}:{os.getenv('POSTGRES_PASSWORD', 'sentinel123')}@{os.getenv('POSTGRES_HOST', 'postgres-db')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'sentinel_db')}"
REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis-broker')}:{os.getenv('REDIS_PORT', '6379')}/0"

# Database
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Celery
celery_app = Celery('worker', broker=REDIS_URL, backend=REDIS_URL)

# Models
class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")
    verdict = Column(String, nullable=True)
    raw_email = Column(Text)
    ai_summary = Column(Text, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    extracted_urls = Column(JSON, default=list)
    virustotal_results = Column(JSON, default=dict)

Base.metadata.create_all(bind=engine)

# Schemas
class ReportCreate(BaseModel):
    raw_email: str

class ReportResponse(BaseModel):
    id: int
    created_at: datetime
    status: str
    verdict: str | None = None
    ai_summary: str | None = None
    ai_confidence: float | None = None

# FastAPI
app = FastAPI(title="Project Sentinel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/reports", status_code=status.HTTP_202_ACCEPTED)
def create_report(report: ReportCreate):
    db = SessionLocal()
    try:
        db_report = Report(raw_email=report.raw_email)
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        # Queue for analysis
        celery_app.send_task('analyze_email', args=[db_report.id])
        
        return ReportResponse(
            id=db_report.id,
            created_at=db_report.created_at,
            status=db_report.status
        )
    finally:
        db.close()

@app.get("/api/v1/reports")
def get_reports():
    db = SessionLocal()
    try:
        reports = db.query(Report).order_by(Report.created_at.desc()).limit(50).all()
        return [ReportResponse(
            id=r.id,
            created_at=r.created_at,
            status=r.status,
            verdict=r.verdict,
            ai_summary=r.ai_summary,
            ai_confidence=r.ai_confidence
        ) for r in reports]
    finally:
        db.close()

@app.get("/api/v1/reports/{report_id}")
def get_report(report_id: int):
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return {
            "id": report.id,
            "created_at": report.created_at,
            "status": report.status,
            "verdict": report.verdict,
            "raw_email": report.raw_email,
            "ai_summary": report.ai_summary,
            "ai_confidence": report.ai_confidence,
            "extracted_urls": report.extracted_urls,
            "virustotal_results": report.virustotal_results
        }
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "healthy"}

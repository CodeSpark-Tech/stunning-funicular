from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from typing import List, Optional
import os
import json
import random
import asyncio
from celery import Celery

# Database Configuration
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'sentinel')}:{os.getenv('POSTGRES_PASSWORD', 'sentinel123')}@{os.getenv('POSTGRES_HOST', 'postgres-db')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'sentinel_db')}"
REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis-broker')}:{os.getenv('REDIS_PORT', '6379')}/0"

# Database Setup
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Celery Setup
celery_app = Celery('worker', broker=REDIS_URL, backend=REDIS_URL)

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Database Models
class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    difficulty = Column(String, default="medium")
    template = Column(Text)
    status = Column(String, default="draft")
    schedule_type = Column(String, default="immediate")
    schedule_date = Column(DateTime, nullable=True)
    recurring = Column(String, nullable=True)
    target_count = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)
    report_count = Column(Integer, default=0)
    click_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    results = Column(JSON, default=dict)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    department = Column(String)
    risk_score = Column(Float, default=50.0)
    campaigns_received = Column(Integer, default=0)
    campaigns_clicked = Column(Integer, default=0)
    campaigns_reported = Column(Integer, default=0)
    training_completed = Column(Boolean, default=False)
    last_training = Column(DateTime, nullable=True)

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

# Pydantic Models
class CampaignCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    difficulty: str = "medium"
    target_users: List[int] = []
    schedule_type: str = "immediate"
    schedule_date: Optional[datetime] = None
    recurring: Optional[str] = None

class CampaignResponse(BaseModel):
    id: int
    name: str
    status: str
    difficulty: str
    sent_count: int
    click_count: int
    report_count: int
    click_rate: float
    created_at: datetime

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    department: str
    risk_score: float
    training_completed: bool

class ReportCreate(BaseModel):
    raw_email: str

class ReportResponse(BaseModel):
    id: int
    created_at: datetime
    status: str
    verdict: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_confidence: Optional[float] = None

# FastAPI App
app = FastAPI(title="Project Sentinel", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper Functions
def generate_phishing_template(difficulty: str, campaign_name: str) -> str:
    """Generate realistic phishing email templates."""
    templates = {
        "easy": {
            "subject": f"[{campaign_name}] Please Review Your Account",
            "body": """Dear User,

We noticed unusual activity on your account. Please review your recent transactions.

Click here to verify your account: [LINK]

Best regards,
Security Team"""
        },
        "medium": {
            "subject": f"[URGENT] Action Required - {campaign_name}",
            "body": """IMPORTANT SECURITY NOTICE

Your account access will be suspended in 24 hours due to unverified activity.

Immediate action required: [VERIFY NOW]

This is an automated message. Do not reply.
IT Security Department"""
        },
        "hard": {
            "subject": f"Re: {campaign_name} - Document Shared",
            "body": """Hi,

John from HR shared a document with you: "Q4_Salary_Review.xlsx"

View Document: [SECURE LINK]

Note: This link expires in 2 hours for security reasons.

Microsoft Office 365"""
        }
    }
    
    template = templates.get(difficulty, templates["medium"])
    return json.dumps(template)

def calculate_risk_score(user_data):
    """Calculate user risk score based on behavior."""
    if user_data.campaigns_received == 0:
        return 50.0
    
    click_rate = user_data.campaigns_clicked / user_data.campaigns_received
    report_rate = user_data.campaigns_reported / user_data.campaigns_received
    
    risk = (click_rate * 100) - (report_rate * 50)
    risk = max(0, min(100, risk))
    
    if user_data.training_completed:
        risk *= 0.7
    
    return round(risk, 1)

# Initialize Sample Data
def init_sample_data():
    """Create sample data for demonstration."""
    db = SessionLocal()
    
    # Check if data exists
    if db.query(User).count() > 0:
        db.close()
        return
    
    # Create sample users
    departments = ["Sales", "Engineering", "Marketing", "HR", "Finance"]
    users = []
    
    for i in range(50):
        user = User(
            name=f"User {i+1}",
            email=f"user{i+1}@company.com",
            department=random.choice(departments),
            risk_score=random.uniform(10, 90),
            campaigns_received=random.randint(0, 10),
            campaigns_clicked=random.randint(0, 5),
            campaigns_reported=random.randint(0, 3),
            training_completed=random.choice([True, False])
        )
        users.append(user)
        db.add(user)
    
    # Create sample campaigns
    campaigns = [
        Campaign(
            name="Q1 Security Assessment",
            description="Quarterly phishing simulation",
            difficulty="medium",
            template=generate_phishing_template("medium", "Q1 Security Assessment"),
            status="completed",
            sent_count=45,
            click_count=12,
            report_count=20,
            click_rate=26.7,
            created_at=datetime.utcnow() - timedelta(days=30)
        ),
        Campaign(
            name="Password Reset Test",
            description="Testing password reset awareness",
            difficulty="easy",
            template=generate_phishing_template("easy", "Password Reset Test"),
            status="active",
            sent_count=50,
            click_count=8,
            report_count=25,
            click_rate=16.0,
            created_at=datetime.utcnow() - timedelta(days=7)
        ),
        Campaign(
            name="Executive Impersonation",
            description="Advanced spear phishing simulation",
            difficulty="hard",
            template=generate_phishing_template("hard", "Executive Impersonation"),
            status="scheduled",
            schedule_date=datetime.utcnow() + timedelta(days=3),
            target_count=20,
            created_at=datetime.utcnow() - timedelta(days=1)
        )
    ]
    
    for campaign in campaigns:
        db.add(campaign)
    
    db.commit()
    db.close()

# API Endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize sample data on startup."""
    init_sample_data()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/api/campaigns", response_model=List[CampaignResponse])
def get_campaigns(db: Session = SessionLocal()):
    """Get all campaigns."""
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).all()
    return campaigns

@app.post("/api/campaigns", response_model=CampaignResponse)
async def create_campaign(campaign: CampaignCreate, db: Session = SessionLocal()):
    """Create new campaign."""
    db_campaign = Campaign(
        name=campaign.name,
        description=campaign.description,
        difficulty=campaign.difficulty,
        template=generate_phishing_template(campaign.difficulty, campaign.name),
        schedule_type=campaign.schedule_type,
        schedule_date=campaign.schedule_date,
        recurring=campaign.recurring,
        target_count=len(campaign.target_users) if campaign.target_users else 50,
        status="scheduled" if campaign.schedule_type != "immediate" else "active"
    )
    
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    
    # Broadcast update via WebSocket
    await manager.broadcast(json.dumps({
        "event": "campaign_created",
        "data": {"id": db_campaign.id, "name": db_campaign.name}
    }))
    
    # Queue for processing
    if campaign.schedule_type == "immediate":
        celery_app.send_task('process_campaign', args=[db_campaign.id])
    
    return db_campaign

@app.get("/api/campaigns/{campaign_id}")
def get_campaign(campaign_id: int, db: Session = SessionLocal()):
    """Get campaign details."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@app.put("/api/campaigns/{campaign_id}/launch")
async def launch_campaign(campaign_id: int, db: Session = SessionLocal()):
    """Launch a campaign."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign.status = "active"
    campaign.sent_count = campaign.target_count
    db.commit()
    
    # Simulate sending emails
    celery_app.send_task('send_campaign_emails', args=[campaign_id])
    
    await manager.broadcast(json.dumps({
        "event": "campaign_launched",
        "data": {"id": campaign_id, "name": campaign.name}
    }))
    
    return {"message": "Campaign launched successfully"}

@app.get("/api/users", response_model=List[UserResponse])
def get_users(db: Session = SessionLocal()):
    """Get all users."""
    users = db.query(User).all()
    for user in users:
        user.risk_score = calculate_risk_score(user)
    db.commit()
    return users

@app.get("/api/users/{user_id}")
def get_user(user_id: int, db: Session = SessionLocal()):
    """Get user details."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.risk_score = calculate_risk_score(user)
    return user

@app.get("/api/stats")
def get_statistics(db: Session = SessionLocal()):
    """Get platform statistics."""
    total_campaigns = db.query(Campaign).count()
    active_campaigns = db.query(Campaign).filter(Campaign.status == "active").count()
    total_users = db.query(User).count()
    high_risk_users = db.query(User).filter(User.risk_score > 70).count()
    
    # Calculate average metrics
    campaigns = db.query(Campaign).filter(Campaign.status == "completed").all()
    avg_click_rate = sum(c.click_rate for c in campaigns) / len(campaigns) if campaigns else 0
    
    return {
        "total_campaigns": total_campaigns,
        "active_campaigns": active_campaigns,
        "total_users": total_users,
        "high_risk_users": high_risk_users,
        "avg_click_rate": round(avg_click_rate, 1),
        "training_completion_rate": db.query(User).filter(User.training_completed == True).count() / total_users * 100 if total_users > 0 else 0
    }

@app.post("/api/simulate-click/{campaign_id}")
async def simulate_click(campaign_id: int, user_id: int = 1, db: Session = SessionLocal()):
    """Simulate a user clicking on a phishing link."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if campaign:
        campaign.click_count += 1
        campaign.click_rate = (campaign.click_count / campaign.sent_count * 100) if campaign.sent_count > 0 else 0
        db.commit()
        
        await manager.broadcast(json.dumps({
            "event": "user_clicked",
            "data": {"campaign_id": campaign_id, "user_id": user_id}
        }))
    
    return {"message": "Click recorded"}

# Legacy endpoints for backwards compatibility
@app.post("/api/v1/reports", status_code=status.HTTP_202_ACCEPTED)
def create_report(report: ReportCreate):
    db = SessionLocal()
    try:
        db_report = Report(raw_email=report.raw_email)
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

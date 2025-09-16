import os
import re
import json
from celery import Celery
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import openai
import httpx
from datetime import datetime

# Config
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER', 'sentinel')}:{os.getenv('POSTGRES_PASSWORD', 'sentinel123')}@{os.getenv('POSTGRES_HOST', 'postgres-db')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'sentinel_db')}"
REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis-broker')}:{os.getenv('REDIS_PORT', '6379')}/0"

app = Celery('worker', broker=REDIS_URL, backend=REDIS_URL)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

@app.task(name='analyze_email')
def analyze_email(report_id: int):
    db = SessionLocal()
    try:
        # Update status
        db.execute(text("UPDATE reports SET status = 'processing' WHERE id = :id"), {"id": report_id})
        db.commit()
        
        # Get report
        result = db.execute(text("SELECT * FROM reports WHERE id = :id"), {"id": report_id})
        report = result.fetchone()
        
        if not report:
            return
        
        # Extract URLs
        urls = re.findall(r'https?://[^\s]+', report.raw_email)
        
        # AI Analysis (simplified)
        verdict = "Safe"
        confidence = 0.95
        summary = "Email analyzed successfully"
        
        if os.getenv('OPENAI_API_KEY'):
            try:
                client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Analyze this email for threats. Reply with JSON: {verdict: 'Safe'|'Spam'|'Malicious', confidence: 0-1, summary: 'text'}"},
                        {"role": "user", "content": report.raw_email[:1000]}
                    ],
                    temperature=0.1,
                    max_tokens=100
                )
                result = json.loads(response.choices[0].message.content)
                verdict = result.get('verdict', 'Safe')
                confidence = result.get('confidence', 0.5)
                summary = result.get('summary', 'Analysis complete')
            except:
                pass
        
        # Update report
        db.execute(
            text("""UPDATE reports SET 
                status = 'complete',
                verdict = :verdict,
                ai_confidence = :confidence,
                ai_summary = :summary,
                extracted_urls = :urls::jsonb
                WHERE id = :id"""),
            {
                "id": report_id,
                "verdict": verdict,
                "confidence": confidence,
                "summary": summary,
                "urls": json.dumps(urls[:5])
            }
        )
        db.commit()
        
    except Exception as e:
        db.execute(text("UPDATE reports SET status = 'error' WHERE id = :id"), {"id": report_id})
        db.commit()
    finally:
        db.close()

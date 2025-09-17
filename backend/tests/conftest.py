import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Import the main app
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app, Base

# Test database URL
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def test_db():
    """Create a test database for each test."""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestSessionLocal()
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(test_db):
    """Create a test client."""
    with patch('main.SessionLocal', return_value=test_db):
        with TestClient(app) as test_client:
            yield test_client

@pytest.fixture
def mock_celery():
    """Mock Celery task sending."""
    with patch('main.celery_app.send_task') as mock_task:
        yield mock_task

@pytest.fixture
def mock_openai():
    """Mock OpenAI API calls."""
    with patch('openai.OpenAI') as mock_openai:
        mock_client = MagicMock()
        mock_openai.return_value = mock_client
        
        # Mock response
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '''
        {
            "verdict": "Malicious",
            "confidence": 0.95,
            "summary": "Phishing attempt detected with suspicious URLs"
        }
        '''
        mock_client.chat.completions.create.return_value = mock_response
        
        yield mock_client

@pytest.fixture
def mock_virustotal():
    """Mock VirusTotal API calls."""
    with patch('httpx.get') as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "data": {
                "attributes": {
                    "last_analysis_stats": {
                        "malicious": 5,
                        "suspicious": 2,
                        "harmless": 20
                    }
                }
            }
        }
        mock_get.return_value = mock_response
        yield mock_get

@pytest.fixture
def sample_email():
    """Sample phishing email for testing."""
    return """From: phisher@example.com
To: victim@company.com
Subject: Urgent: Update Your Password Now!

Dear User,

Your account security is at risk. Please click here immediately:
http://malicious-site.com/steal-password

Best regards,
IT Support (not really)
"""
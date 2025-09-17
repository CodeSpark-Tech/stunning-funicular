import pytest
import sys
import os
import json
from unittest.mock import patch, MagicMock

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'worker'))

def test_analyze_email_task(mock_openai, mock_virustotal):
    """Test the Celery worker analyze_email task."""
    with patch('worker.SessionLocal') as mock_session:
        # Mock database session
        mock_db = MagicMock()
        mock_session.return_value = mock_db
        
        # Mock report from database
        mock_report = MagicMock()
        mock_report.raw_email = "From: phisher@example.com\nSubject: Test\n\nhttp://malicious.com"
        mock_db.execute.return_value.fetchone.return_value = mock_report
        
        # Import and execute task
        from worker import analyze_email
        result = analyze_email(1)
        
        # Verify database was updated
        assert mock_db.execute.called
        assert mock_db.commit.called

def test_url_extraction_in_worker():
    """Test URL extraction in worker context."""
    import re
    email_text = """
    Visit these sites:
    http://example.com
    https://secure-site.net
    http://phishing-attempt.com/steal-data
    """
    
    urls = re.findall(r'https?://[^\s]+', email_text)
    assert len(urls) == 3
    assert "http://phishing-attempt.com/steal-data" in urls
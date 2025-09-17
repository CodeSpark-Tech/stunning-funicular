import pytest
import re
import json
from unittest.mock import Mock, patch

def test_extract_urls():
    """Test URL extraction regex."""
    text = """
    Visit http://example.com and https://secure.site.com
    Also check http://malicious-site.com/phishing
    """
    url_pattern = re.compile(r'https?://[^\s]+')
    urls = url_pattern.findall(text)
    
    assert len(urls) == 3
    assert "http://example.com" in urls
    assert "https://secure.site.com" in urls
    assert "http://malicious-site.com/phishing" in urls

def test_extract_urls_no_urls():
    """Test URL extraction with no URLs."""
    text = "This is plain text with no URLs"
    url_pattern = re.compile(r'https?://[^\s]+')
    urls = url_pattern.findall(text)
    
    assert len(urls) == 0

def test_json_parsing():
    """Test JSON parsing for AI response."""
    valid_json = '''
    {
        "verdict": "Safe",
        "confidence": 0.98,
        "summary": "No threats detected"
    }
    '''
    parsed = json.loads(valid_json)
    
    assert parsed["verdict"] == "Safe"
    assert parsed["confidence"] == 0.98
    assert parsed["summary"] == "No threats detected"

def test_json_parsing_invalid():
    """Test handling of invalid JSON."""
    invalid_json = "Not a JSON string"
    
    with pytest.raises(json.JSONDecodeError):
        json.loads(invalid_json)
import pytest
from fastapi import status
import json

def test_create_report(client, mock_celery, sample_email):
    """Test POST /api/v1/reports endpoint."""
    response = client.post(
        "/api/v1/reports",
        json={"raw_email": sample_email}
    )
    
    assert response.status_code == status.HTTP_202_ACCEPTED
    data = response.json()
    assert "id" in data
    assert data["status"] == "pending"
    mock_celery.assert_called_once()

def test_get_reports(client, test_db):
    """Test GET /api/v1/reports endpoint."""
    # Create test reports
    for i in range(3):
        response = client.post(
            "/api/v1/reports",
            json={"raw_email": f"Test email {i}"}
        )
        assert response.status_code == status.HTTP_202_ACCEPTED
    
    # Get reports
    response = client.get("/api/v1/reports")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 3

def test_get_report_by_id(client, mock_celery):
    """Test GET /api/v1/reports/{id} endpoint."""
    # Create a report
    create_response = client.post(
        "/api/v1/reports",
        json={"raw_email": "Test email"}
    )
    report_id = create_response.json()["id"]
    
    # Get report by ID
    response = client.get(f"/api/v1/reports/{report_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == report_id
    assert data["raw_email"] == "Test email"

def test_get_report_not_found(client):
    """Test GET /api/v1/reports/{id} with invalid ID."""
    response = client.get("/api/v1/reports/999999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "healthy"
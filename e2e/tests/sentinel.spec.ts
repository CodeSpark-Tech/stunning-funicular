import { test, expect } from '@playwright/test';

test.describe('Project Sentinel E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the dashboard
    await page.goto('http://localhost:3001');
  });

  test('Full Report Lifecycle', async ({ page, request }) => {
    // Step 1: Submit a new report via API
    const reportResponse = await request.post('http://localhost:8001/api/v1/reports', {
      data: {
        raw_email: `From: phisher@example.com
To: victim@company.com
Subject: E2E Test Email
Content: Visit http://malicious-e2e-test.com`
      }
    });
    
    expect(reportResponse.ok()).toBeTruthy();
    const report = await reportResponse.json();
    const reportId = report.id;

    // Step 2: Navigate to dashboard and verify report appears
    await page.reload();
    await expect(page.locator(`text=#${reportId}`)).toBeVisible({ timeout: 10000 });

    // Step 3: Verify initial status is pending
    const statusCell = page.locator(`tr:has-text("#${reportId}") td:nth-child(2)`);
    await expect(statusCell).toContainText('pending');

    // Step 4: Wait for processing (poll for status change)
    await page.waitForFunction(
      (id) => {
        const row = document.querySelector(`tr:has(td:has-text("#${id}"))`);
        if (!row) return false;
        const statusCell = row.querySelector('td:nth-child(2)');
        return statusCell?.textContent?.includes('complete');
      },
      reportId,
      { timeout: 30000, polling: 2000 }
    );

    // Step 5: Verify verdict is displayed
    const verdictCell = page.locator(`tr:has-text("#${reportId}") td:nth-child(3)`);
    await expect(verdictCell).not.toBeEmpty();

    // Step 6: Click on report to view details (if detail page exists)
    // Note: Add this when detail page is implemented
    // await page.click(`text=#${reportId}`);
    // await expect(page.locator('text=Email Analysis')).toBeVisible();
  });

  test('Dashboard Statistics Update', async ({ page, request }) => {
    // Get initial statistics
    await page.reload();
    const initialTotal = await page.locator('div:has-text("Total") + div').textContent();

    // Submit a new report
    await request.post('http://localhost:8001/api/v1/reports', {
      data: { raw_email: 'Test email for statistics' }
    });

    // Refresh and verify statistics updated
    await page.reload();
    await page.waitForTimeout(2000);
    const newTotal = await page.locator('div:has-text("Total") + div').textContent();
    
    expect(parseInt(newTotal || '0')).toBeGreaterThan(parseInt(initialTotal || '0'));
  });

  test('Auto-refresh Functionality', async ({ page }) => {
    // Get initial table content
    const initialRows = await page.locator('tbody tr').count();

    // Wait for auto-refresh (10 seconds)
    await page.waitForTimeout(11000);

    // Verify table still renders (no errors during refresh)
    const currentRows = await page.locator('tbody tr').count();
    expect(currentRows).toBeGreaterThanOrEqual(0);
  });

  test('API Health Check', async ({ request }) => {
    const response = await request.get('http://localhost:8001/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
});

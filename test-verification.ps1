#!/usr/bin/env pwsh
# Multi-Tenant Backend Verification Test Script

$baseUrl = "http://localhost:3000"
$results = @()

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "MULTI-TENANT BACKEND VERIFICATION" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test A: Create PRO Tenant
Write-Host "`n[Test A] Creating PRO tenant..." -ForegroundColor Yellow
try {
    $body = @{ name = "Acme PRO"; plan = "PRO" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/tenants" -Method POST -Body $body -ContentType "application/json"
    $tenantId = $response.data.id
    Write-Host "✓ PASS: Tenant created with ID: $tenantId" -ForegroundColor Green
    Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
    $results += @{ test = "Create PRO Tenant"; status = "PASS"; tenantId = $tenantId }
} catch {
    Write-Host "✗ FAIL: $_" -ForegroundColor Red
    $results += @{ test = "Create PRO Tenant"; status = "FAIL"; error = $_.Exception.Message }
    exit 1
}

# Test B: Create Material (ADMIN)
Write-Host "`n[Test B] Creating material as ADMIN..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-tenant-id" = $tenantId
        "x-user-role" = "ADMIN"
    }
    $body = @{ name = "Steel Rods"; unit = "kg"; currentStock = 100 } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/materials" -Method POST -Headers $headers -Body $body
    $materialId = $response.data.id
    Write-Host "✓ PASS: Material created with ID: $materialId" -ForegroundColor Green
    Write-Host "  Stock: $($response.data.currentStock)" -ForegroundColor Gray
    $results += @{ test = "Create Material (ADMIN)"; status = "PASS"; materialId = $materialId }
} catch {
    Write-Host "✗ FAIL: $_" -ForegroundColor Red
    $results += @{ test = "Create Material (ADMIN)"; status = "FAIL"; error = $_.Exception.Message }
}

# Test C: List Materials with Case-Insensitive Search and Pagination
Write-Host "`n[Test C] Searching materials (case-insensitive) with pagination..." -ForegroundColor Yellow
try {
    $headers = @{
        "x-tenant-id" = $tenantId
        "x-user-role" = "USER"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/materials?name=STEEL&page=1&limit=10" -Method GET -Headers $headers
    $found = $response.data.Count -gt 0
    if ($found) {
        Write-Host "✓ PASS: Found $($response.data.Count) material(s)" -ForegroundColor Green
        Write-Host "  Pagination: Page $($response.pagination.page) of $($response.pagination.totalPages) (Total: $($response.pagination.total))" -ForegroundColor Gray
        $results += @{ test = "Case-Insensitive Search"; status = "PASS"; found = $response.data.Count }
    } else {
        Write-Host "✗ FAIL: No materials found" -ForegroundColor Red
        $results += @{ test = "Case-Insensitive Search"; status = "FAIL" }
    }
} catch {
    Write-Host "✗ FAIL: $_" -ForegroundColor Red
    $results += @{ test = "Case-Insensitive Search"; status = "FAIL"; error = $_.Exception.Message }
}

# Test D: Create IN Transaction
Write-Host "`n[Test D] Creating IN transaction..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-tenant-id" = $tenantId
        "x-user-role" = "USER"
    }
    $body = @{ type = "IN"; quantity = 50 } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/materials/$materialId/transactions" -Method POST -Headers $headers -Body $body
    Write-Host "✓ PASS: IN transaction created" -ForegroundColor Green
    Write-Host "  Quantity: +$($response.data.quantity)" -ForegroundColor Gray
    $results += @{ test = "Create IN Transaction"; status = "PASS" }
} catch {
    Write-Host "✗ FAIL: $_" -ForegroundColor Red
    $results += @{ test = "Create IN Transaction"; status = "FAIL"; error = $_.Exception.Message }
}

# Test E: Create OUT Transaction (Should Fail - Insufficient Stock)
Write-Host "`n[Test E] Attempting OUT transaction with excessive quantity..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-tenant-id" = $tenantId
        "x-user-role" = "USER"
    }
    $body = @{ type = "OUT"; quantity = 999999 } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/materials/$materialId/transactions" -Method POST -Headers $headers -Body $body
    Write-Host "✗ FAIL: Transaction should have been rejected" -ForegroundColor Red
    $results += @{ test = "Prevent Negative Stock"; status = "FAIL"; reason = "Transaction was allowed" }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message -like "*Insufficient stock*") {
        Write-Host "✓ PASS: Transaction correctly rejected" -ForegroundColor Green
        Write-Host "  Error: $($errorResponse.message)" -ForegroundColor Gray
        $results += @{ test = "Prevent Negative Stock"; status = "PASS" }
    } else {
        Write-Host "✗ FAIL: Unexpected error: $($errorResponse.message)" -ForegroundColor Red
        $results += @{ test = "Prevent Negative Stock"; status = "FAIL"; error = $errorResponse.message }
    }
}

# Test F: FREE Plan Enforcement
Write-Host "`n[Test F] Testing FREE plan limit (max 5 materials)..." -ForegroundColor Yellow
try {
    # Create FREE tenant
    $body = @{ name = "Free User"; plan = "FREE" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/tenants" -Method POST -Body $body -ContentType "application/json"
    $freeTenantId = $response.data.id
    Write-Host "  Created FREE tenant: $freeTenantId" -ForegroundColor Gray
    
    # Create 5 materials
    $headers = @{
        "Content-Type" = "application/json"
        "x-tenant-id" = $freeTenantId
        "x-user-role" = "ADMIN"
    }
    
    for ($i = 1; $i -le 5; $i++) {
        $body = @{ name = "Material $i"; unit = "pcs" } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri "$baseUrl/materials" -Method POST -Headers $headers -Body $body
    }
    Write-Host "  Created 5 materials successfully" -ForegroundColor Gray
    
    # Try to create 6th material (should fail)
    try {
        $body = @{ name = "Material 6"; unit = "pcs" } | ConvertTo-Json
        $null = Invoke-RestMethod -Uri "$baseUrl/materials" -Method POST -Headers $headers -Body $body
        Write-Host "✗ FAIL: 6th material creation should have been rejected" -ForegroundColor Red
        $results += @{ test = "FREE Plan Limit"; status = "FAIL"; reason = "Allowed more than 5 materials" }
    } catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($errorResponse.message -like "*FREE plan allows maximum 5 materials*") {
            Write-Host "✓ PASS: FREE plan limit enforced" -ForegroundColor Green
            Write-Host "  Error: $($errorResponse.message)" -ForegroundColor Gray
            $results += @{ test = "FREE Plan Limit"; status = "PASS" }
        } else {
            Write-Host "✗ FAIL: Unexpected error" -ForegroundColor Red
            $results += @{ test = "FREE Plan Limit"; status = "FAIL"; error = $errorResponse.message }
        }
    }
} catch {
    Write-Host "✗ FAIL: $_" -ForegroundColor Red
    $results += @{ test = "FREE Plan Limit"; status = "FAIL"; error = $_.Exception.Message }
}

# Summary
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.status -eq "FAIL" }).Count
$total = $results.Count

Write-Host "`nTotal Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

foreach ($result in $results) {
    $color = if ($result.status -eq "PASS") { "Green" } else { "Red" }
    $symbol = if ($result.status -eq "PASS") { "[PASS]" } else { "[FAIL]" }
    Write-Host "$symbol $($result.test): $($result.status)" -ForegroundColor $color
}

Write-Host ""

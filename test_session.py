#!/usr/bin/env python3
"""Test script to check session persistence"""

import requests
import sys

def test_session_persistence():
    base_url = "http://localhost:5000"
    
    # Create a session
    session = requests.Session()
    
    print("1. Testing Step 1 - Transport Mode Selection")
    # Get step 1 page
    response = session.get(f"{base_url}/step1")
    print(f"   GET /step1: {response.status_code}")
    
    # Post transport mode selection (Air Transport = 3)
    response = session.post(f"{base_url}/step1", data={'transport_mode': '3'})
    print(f"   POST /step1 with transport_mode=3: {response.status_code}")
    print(f"   Redirected to: {response.url}")
    
    print("\n2. Testing Step 4 - Direct Access")
    # Try to access step 4 directly to see if session data is preserved
    response = session.get(f"{base_url}/step4")
    print(f"   GET /step4: {response.status_code}")
    print(f"   Final URL: {response.url}")
    
    # Check if the response contains the transport mode
    if "Air Transport" in response.text:
        print("   ✅ SUCCESS: Air Transport found in step 4")
    elif "Not selected" in response.text:
        print("   ❌ FAILURE: 'Not selected' found - session data lost")
    else:
        print("   ⚠️  UNKNOWN: Could not determine transport mode status")
    
    # Print relevant HTML snippet
    if '<span class="summary-value" id="reviewTransportMode">' in response.text:
        start = response.text.find('<span class="summary-value" id="reviewTransportMode">')
        end = response.text.find('</span>', start) + 7
        snippet = response.text[start:end]
        print(f"   HTML snippet: {snippet}")

if __name__ == "__main__":
    try:
        test_session_persistence()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to server. Make sure it's running on localhost:5000")
        sys.exit(1)

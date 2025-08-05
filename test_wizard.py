#!/usr/bin/env python3
"""
Test script for the new multi-step wizard functionality.
This will test that all routes are accessible and templates exist.
"""
import requests
import sys
import os

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_wizard_routes():
    """Test the new wizard routes"""
    base_url = "http://localhost:5000"
    
    # Test routes
    routes_to_test = [
        "/step1_transport",
        "/step2_upload", 
        "/step3_settings",
        "/step4_review"
    ]
    
    print("Testing wizard routes...")
    
    for route in routes_to_test:
        try:
            response = requests.get(f"{base_url}{route}")
            if response.status_code == 200:
                print(f"✅ {route} - OK")
            else:
                print(f"❌ {route} - Status: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {route} - Server not running")
        except Exception as e:
            print(f"❌ {route} - Error: {e}")

def test_templates_exist():
    """Test that all template files exist"""
    templates_dir = "templates"
    
    template_files = [
        "step1_transport.html",
        "step2_upload.html", 
        "step3_settings.html",
        "step4_review.html"
    ]
    
    print("\nTesting template files...")
    
    for template in template_files:
        template_path = os.path.join(templates_dir, template)
        if os.path.exists(template_path):
            print(f"✅ {template} - Exists")
        else:
            print(f"❌ {template} - Missing")

def test_static_files():
    """Test that JavaScript files exist"""
    static_js_dir = "static/js"
    
    js_files = [
        "step1-transport.js",
        "step2-upload.js",
        "step3-settings.js", 
        "step4-review.js"
    ]
    
    print("\nTesting JavaScript files...")
    
    for js_file in js_files:
        js_path = os.path.join(static_js_dir, js_file)
        if os.path.exists(js_path):
            print(f"✅ {js_file} - Exists")
        else:
            print(f"❌ {js_file} - Missing")

if __name__ == "__main__":
    print("=== Multi-Step Wizard Test ===")
    test_templates_exist()
    test_static_files()
    
    print("\n=== Starting Flask App Test ===")
    print("Note: Make sure to start the Flask app with 'python app_modular.py' in another terminal")
    print("Then run this test again to test the routes.")
    
    # For now, just test file existence
    # test_wizard_routes()  # Uncomment when server is running

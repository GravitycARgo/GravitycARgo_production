#!/usr/bin/env python3
"""
Test runner script for all volume utilization test cases
"""

import os
import sys
import subprocess
import time
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def run_test_case(test_file):
    """Run a single test case and return results"""
    print(f"\n{'='*80}")
    print(f"🧪 RUNNING TEST CASE: {test_file}")
    print(f"{'='*80}")
    
    start_time = time.time()
    
    try:
        # Run the test
        result = subprocess.run(
            [sys.executable, test_file],
            cwd=project_root,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        duration = time.time() - start_time
        
        print(f"📊 Test completed in {duration:.1f} seconds")
        print(f"📊 Return code: {result.returncode}")
        
        if result.stdout:
            print("\n📋 STDOUT:")
            print(result.stdout)
        
        if result.stderr:
            print("\n❌ STDERR:")
            print(result.stderr)
        
        return {
            'file': test_file,
            'success': result.returncode == 0,
            'duration': duration,
            'stdout': result.stdout,
            'stderr': result.stderr
        }
        
    except subprocess.TimeoutExpired:
        print(f"⏰ Test timed out after 5 minutes")
        return {
            'file': test_file,
            'success': False,
            'duration': 300,
            'error': 'Timeout'
        }
    except Exception as e:
        print(f"❌ Error running test: {e}")
        return {
            'file': test_file,
            'success': False,
            'duration': 0,
            'error': str(e)
        }

def main():
    """Run all test cases"""
    test_dir = Path(__file__).parent
    
    # Find all test files
    test_files = list(test_dir.glob("test_*.py"))
    
    if not test_files:
        print("❌ No test files found!")
        return 1
    
    print(f"🚀 VOLUME UTILIZATION TEST SUITE")
    print(f"Found {len(test_files)} test case(s)")
    
    results = []
    
    for test_file in test_files:
        result = run_test_case(str(test_file))
        results.append(result)
    
    # Summary
    print(f"\n{'='*80}")
    print(f"📊 TEST SUITE SUMMARY")
    print(f"{'='*80}")
    
    passed = sum(1 for r in results if r['success'])
    failed = len(results) - passed
    total_duration = sum(r['duration'] for r in results)
    
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⏱️  Total duration: {total_duration:.1f} seconds")
    
    for result in results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"   {status} {os.path.basename(result['file'])} ({result['duration']:.1f}s)")
    
    if failed > 0:
        print(f"\n⚠️  {failed} test(s) failed. Review output above for details.")
        return 1
    else:
        print(f"\n🎉 All tests passed!")
        return 0

if __name__ == '__main__':
    sys.exit(main())

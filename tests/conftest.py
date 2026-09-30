import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import pytest
from backend.services.cache_service import delete_pattern, _in_memory_cache

@pytest.fixture(autouse=True)
def clean_redis_cache_between_tests():
    """Ensures test cases have isolated cache state so mocks do not conflict."""
    _in_memory_cache.clear()
    delete_pattern("user:subscription:*")
    delete_pattern("technews:v1:*")
    delete_pattern("events:v1:*")
    yield
    _in_memory_cache.clear()
    delete_pattern("user:subscription:*")
    delete_pattern("technews:v1:*")
    delete_pattern("events:v1:*")


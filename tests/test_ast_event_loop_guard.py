import ast
import json
import os
from pathlib import Path
import pytest


def test_ast_guard_no_unblocked_sync_execute_or_groq_in_async_def():
    """
    GAP 8: AST-based regression guard ensuring no async def functions without await
    can introduce synchronous blocking calls (.execute() or chat_with_groq()) on the event loop.
    Any new route or service function violating this pattern fails the suite immediately.
    Known legacy P0-1b routes are pinned in tests/p0_1b_allowlist.json with follow-up tracking.
    """
    repo_root = Path(__file__).resolve().parent.parent
    allowlist_path = repo_root / "tests" / "p0_1b_allowlist.json"
    assert allowlist_path.exists(), f"Allowlist missing at {allowlist_path}"

    with open(allowlist_path, "r", encoding="utf-8") as f:
        allowlist_data = json.load(f)

    # Keyed by (normalized_relative_path, function_name)
    allowlist = {
        (item["file"].replace("\\", "/"), item["function"]): item
        for item in allowlist_data
    }

    scan_dirs = [repo_root / "backend" / "routers", repo_root / "backend" / "services"]
    violations = []

    for scan_dir in scan_dirs:
        for py_file in scan_dir.rglob("*.py"):
            rel_path = py_file.relative_to(repo_root).as_posix()
            try:
                with open(py_file, "r", encoding="utf-8") as src:
                    tree = ast.parse(src.read(), filename=str(py_file))
            except Exception as e:
                pytest.fail(f"Failed to parse AST for {rel_path}: {e}")

            for node in ast.walk(tree):
                if isinstance(node, ast.AsyncFunctionDef):
                    # Check if function contains any await statement
                    has_await = any(isinstance(n, ast.Await) for n in ast.walk(node))

                    # Scan for blocking target calls
                    blocking_calls = []
                    for n in ast.walk(node):
                        if isinstance(n, ast.Call):
                            # Check for .execute()
                            if isinstance(n.func, ast.Attribute) and n.func.attr == "execute":
                                blocking_calls.append(".execute()")
                            # Check for chat_with_groq()
                            elif isinstance(n.func, ast.Name) and n.func.id == "chat_with_groq":
                                blocking_calls.append("chat_with_groq()")
                            elif isinstance(n.func, ast.Attribute) and n.func.attr == "chat_with_groq":
                                blocking_calls.append("chat_with_groq()")

                    if blocking_calls and not has_await:
                        unique_calls = sorted(list(set(blocking_calls)))
                        key = (rel_path, node.name)
                        if key not in allowlist:
                            violations.append({
                                "file": rel_path,
                                "function": node.name,
                                "line": node.lineno,
                                "calls": unique_calls,
                            })

    if violations:
        msg = (
            f"Found {len(violations)} NEW unblocked async def functions with synchronous I/O "
            f"(.execute() or chat_with_groq()) on the event loop:\n"
        )
        for v in violations:
            msg += f"  - {v['file']}:{v['line']} in `{v['function']}()`: called {v['calls']}\n"
        msg += "\nFix by converting to `def` (if route) or offloading to threadpool via `to_thread`/`run_bounded_ai_call`."
        pytest.fail(msg)

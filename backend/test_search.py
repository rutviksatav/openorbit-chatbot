"""
OpenOrbit Research Mode — End-to-End Test Suite
Tests the full search pipeline: DuckDuckGoProvider → SearchService → context building.

Makes a single SearchService call and validates everything from the results.
The SearchService internally calls DuckDuckGoProvider, so the full stack is tested.
"""
import asyncio
import sys
import os
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.search.duckduckgo_provider import DuckDuckGoProvider
from app.search.search_service import SearchService

# ─── colour helpers ────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"

passed = 0
failed = 0

def report(name: str, ok: bool, detail: str = ""):
    global passed, failed
    if ok:
        passed += 1
        print(f"  {GREEN}✅ PASS{RESET}  {name}")
    else:
        failed += 1
        print(f"  {RED}❌ FAIL{RESET}  {name}  —  {detail}")


async def main():
    print(f"\n{BOLD}{CYAN}{'='*60}")
    print(f"  OpenOrbit — DuckDuckGo Search Test Suite")
    print(f"{'='*60}{RESET}\n")

    service  = SearchService()
    provider = DuckDuckGoProvider()

    # ─── Single HTTP call through the full pipeline ───────────────
    print(f"  {DIM}[Fetching] SearchService full pipeline...{RESET}")
    t0 = time.time()
    service_data = await service.search("how does photosynthesis work")
    elapsed = time.time() - t0

    results = service_data.get("results", [])
    context = service_data.get("context", "")

    print(f"  {DIM}  → {len(results)} results, context={len(context)} chars, {elapsed:.1f}s{RESET}")

    if len(results) == 0:
        print(f"\n  {RED}⚠ Rate-limited. Retrying in 15s...{RESET}")
        await asyncio.sleep(15)
        service_data = await service.search("what is artificial intelligence")
        results = service_data.get("results", [])
        context = service_data.get("context", "")
        print(f"  {DIM}  → Retry: {len(results)} results{RESET}")

    # ─── Empty query test (no HTTP, just validation) ──────────────
    empty_ok = True
    try:
        empty_res = await provider.search("", max_results=5)
        empty_ok = isinstance(empty_res, list) and len(empty_res) == 0
    except Exception:
        empty_ok = False

    # ─── Assertions ───────────────────────────────────────────────
    print(f"\n  {DIM}[Running 11 assertions]{RESET}\n")

    # TC-1: Pipeline returns results
    report("TC-1  Pipeline returns results",
           len(results) > 0,
           f"got {len(results)}")

    # TC-2: Each result has title, url, snippet
    fields_ok, fields_detail = True, ""
    if not results:
        fields_ok, fields_detail = False, "no results"
    else:
        for i, r in enumerate(results):
            for key in ("title", "url", "snippet"):
                if key not in r:
                    fields_ok, fields_detail = False, f"result[{i}] missing '{key}'"
                    break
            if not fields_ok:
                break
    report("TC-2  Results have title/url/snippet", fields_ok, fields_detail)

    # TC-3: URLs start with http and aren't DDG redirects
    urls_ok, urls_detail = True, ""
    if not results:
        urls_ok, urls_detail = False, "no results"
    else:
        for r in results:
            url = r.get("url", "")
            if not url.startswith("http"):
                urls_ok, urls_detail = False, f"bad url: {url[:80]}"
                break
            if "duckduckgo.com" in url:
                urls_ok, urls_detail = False, f"DDG redirect: {url[:80]}"
                break
    report("TC-3  URLs are real (not DDG redirects)", urls_ok, urls_detail)

    # TC-4: Titles are non-empty strings
    titles_ok, titles_detail = True, ""
    if not results:
        titles_ok, titles_detail = False, "no results"
    else:
        for i, r in enumerate(results):
            if not r.get("title", "").strip():
                titles_ok, titles_detail = False, f"result[{i}] empty title"
                break
    report("TC-4  Titles are non-empty", titles_ok, titles_detail)

    # TC-5: Results capped at ≤5 (SearchService dedup cap)
    report("TC-5  Results capped at ≤5",
           len(results) <= 5,
           f"got {len(results)}")

    # TC-6: No duplicate URLs
    urls_list = [r["url"] for r in results]
    report("TC-6  No duplicate URLs",
           len(urls_list) == len(set(urls_list)),
           f"{len(urls_list)} total, {len(set(urls_list))} unique")

    # TC-7: Context string is non-empty
    report("TC-7  Context string is non-empty",
           len(context) > 50,
           f"length={len(context)}")

    # TC-8: Context contains structured Source/Title labels
    has_s1 = "Source 1" in context
    has_title = "Title:" in context
    report("TC-8  Context has Source labels and Title",
           has_s1 and has_title,
           f"Source1={has_s1}, Title={has_title}")

    # TC-9: At least one snippet has content
    snip_ok, snip_detail = True, ""
    if not results:
        snip_ok, snip_detail = False, "no results"
    else:
        non_empty = [r for r in results if r.get("snippet", "").strip()]
        if not non_empty:
            snip_ok, snip_detail = False, "all snippets empty"
    report("TC-9  Snippets contain text", snip_ok, snip_detail)

    # TC-10: Empty query returns [] without crashing
    report("TC-10 Empty query returns []", empty_ok)

    # TC-11: Response completes under 20 seconds
    report("TC-11 Response time < 20s",
           elapsed < 20,
           f"took {elapsed:.1f}s")

    # ─── Summary ──────────────────────────────────────────────────
    print(f"\n{BOLD}{'─'*60}")
    total = passed + failed
    colour = GREEN if failed == 0 else RED
    print(f"  Results: {colour}{passed}/{total} passed{RESET}")
    if failed:
        print(f"  {RED}{failed} test(s) failed{RESET}")
    else:
        print(f"  {GREEN}All tests passed! 🎉{RESET}")
    print(f"{'─'*60}{RESET}\n")

    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    asyncio.run(main())

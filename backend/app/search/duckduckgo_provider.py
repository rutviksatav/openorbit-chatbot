import warnings

# Suppress rename warning — duckduckgo_search was renamed to ddgs but API is identical
warnings.filterwarnings("ignore", message=".*has been renamed.*")

from duckduckgo_search import DDGS


class DuckDuckGoProvider:
    """
    Web search provider using the `duckduckgo-search` package.
    Handles anti-bot measures, sessions, and retries internally.
    No API keys required.
    """

    async def search(self, query: str, max_results: int = 5) -> list[dict]:
        """Execute search and return normalized results (title, url, snippet)."""
        if not query or not query.strip():
            return []

        try:
            with DDGS() as ddgs:
                raw_results = list(ddgs.text(query, max_results=max_results))

            normalized = []
            for r in raw_results:
                normalized.append({
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                })
            return normalized

        except Exception as exc:
            print(f"[DDG] Search error: {exc}")
            return []

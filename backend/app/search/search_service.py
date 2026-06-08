from app.search.duckduckgo_provider import DuckDuckGoProvider

class SearchService:
    def __init__(self):
        self.provider = DuckDuckGoProvider()

    async def search(self, query: str) -> dict:
        """
        Call DuckDuckGoProvider, deduplicate URLs, keep top 5 results, and build the context.
        """
        # Retrieve a bit more than 5 results to account for deduplication
        raw_results = await self.provider.search(query, max_results=15)
        
        seen_urls = set()
        unique_results = []
        
        for r in raw_results:
            url = r.get("url")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            unique_results.append(r)
            if len(unique_results) >= 5:
                break
                
        # Build LLM context string
        context_parts = []
        for i, r in enumerate(unique_results, 1):
            context_parts.append(
                f"Source {i}\n\n"
                f"Title:\n{r.get('title')}\n\n"
                f"Snippet:\n{r.get('snippet')}\n"
            )
            
        context_str = "\n".join(context_parts)
        
        return {
            "results": unique_results,
            "context": context_str
        }

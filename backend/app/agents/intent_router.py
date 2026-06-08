class IntentRouter:
    def __init__(self):
        self.keywords = [
            "latest",
            "current",
            "today",
            "recent",
            "breaking",
            "news",
            "update",
            "release",
            "launch",
            "weather",
            "stock",
            "price",
            "sports",
            "score",
            "who won",
            "election",
            "2026"
        ]

    async def should_search(self, query: str) -> bool:
        """
        Determine if the query requires web search using keyword matching.
        """
        if not query:
            return False
            
        lower_query = query.lower()
        
        for kw in self.keywords:
            if kw in lower_query:
                return True
                
        return False

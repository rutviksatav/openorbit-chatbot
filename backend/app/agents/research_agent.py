from datetime import datetime
from urllib.parse import urlparse
from app.search.search_service import SearchService
from app.services.provider_factory import get_llm_provider
from app.repositories.message_repository import MessageRepository

class ResearchAgent:
    def __init__(self):
        self.search_service = SearchService()
        self.provider = get_llm_provider()
        self.message_repository = MessageRepository()

    async def generate_stream(self, query: str, session_id: int, sources_out: list):
        """
        Execute search, build context, build history, and stream grounded LLM response.
        Populates sources_out with parsed sources metadata.
        """
        # 1. Execute Search query
        search_data = await self.search_service.search(query)
        context = search_data["context"]
        results = search_data["results"]
        
        # 2. Extract unique source domains, urls, and titles
        for r in results:
            url = r.get("url", "")
            domain = ""
            if url:
                try:
                    domain = urlparse(url).netloc
                    if domain.startswith("www."):
                        domain = domain[4:]
                except Exception:
                    domain = ""
            sources_out.append({
                "title": r.get("title", ""),
                "url": url,
                "domain": domain
            })
            
        # 3. Retrieve conversation history
        db_messages = await self.message_repository.get_messages_by_session(session_id)
        # Match ChatService history window of 20 messages
        db_messages = db_messages[-20:]
        
        history = [
            {
                "role": m.role,
                "content": m.content
            }
            for m in db_messages
        ]
        
        # 4. Formulate the grounding instructions and system prompt
        current_time_str = datetime.now().strftime("%A, %B %d, %Y, %I:%M %p")
        system_content = (
            "You are OpenOrbit Research.\n\n"
            f"Current Date and Time: {current_time_str}\n\n"
            "Answer using the supplied search results.\n\n"
            "If the search results are insufficient, state that clearly.\n\n"
            "Do not fabricate facts.\n\n"
            "Mention source names naturally.\n\n"
            "Be concise but accurate.\n\n"
            f"--- SEARCH RESULTS ---\n{context}\n----------------------"
        )
        
        history.insert(0, {
            "role": "system",
            "content": system_content
        })
        
        # 5. Stream tokens from the active LLM provider
        async for chunk in self.provider.stream_response(history):
            yield chunk

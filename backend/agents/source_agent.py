"""
Recursive Source Gathering Agent.

Uses a Breadth-First Search (BFS) architecture to search Tavily,
scrape with Firecrawl, and autonomously follow valuable citations/links
found in the text.
"""
import os
import json
import asyncio
import re
import structlog
from typing import List, Dict, Set
from collections import deque

from tavily import AsyncTavilyClient
from firecrawl import FirecrawlApp
import litellm

from cognee_layer.chunker import chunk_document

logger = structlog.get_logger()

os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "")

class SourceGatheringAgent:
    def __init__(self):
        self.tavily_client = AsyncTavilyClient(api_key=os.getenv("TAVILY_API_KEY", ""))
        self.firecrawl = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY", ""))

    def extract_links(self, markdown_content: str) -> List[str]:
        """Extract all absolute http/https links from markdown content."""
        links = re.findall(r'\[.*?\]\((https?://[^\)]+)\)', markdown_content)
        # Filter out obvious junk
        valid_links = []
        for link in links:
            if any(junk in link.lower() for junk in ['facebook.com', 'twitter.com', 'instagram.com', 'login', 'signup']):
                continue
            valid_links.append(link)
        return list(set(valid_links))

    async def _process_document_locally(self, url: str) -> str:
        """Download and parse a document (PDF, TXT, EPUB, etc.) locally using unstructured."""
        import httpx
        import tempfile
        from unstructured.partition.auto import partition
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            
        # Write to temporary file
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(response.content)
            tmp_path = tmp_file.name
            
        try:
            # Parse locally using unstructured
            elements = await asyncio.to_thread(partition, filename=tmp_path)
            # Combine elements into a single markdown-like string
            text_content = "\n\n".join([str(el) for el in elements if str(el).strip()])
            return text_content
        finally:
            # Cleanup temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    async def gather_sources(self, person_name: str, query: str, max_sources: int = 3):
        logger.info(f"Starting RECURSIVE source gathering for {person_name}")
        
        # 1. Initial Search
        logger.info(f"Searching Tavily with query: {query}")
        
        try:
            search_result = await self.tavily_client.search(query, search_depth="advanced", max_results=10)
        except Exception as e:
            logger.error(f"Tavily search failed: {e}")
            return
            
        initial_urls = [result["url"] for result in search_result.get("results", [])]
        
        # 2. Setup BFS Queue
        queue = deque(initial_urls)
        visited: Set[str] = set()
        sources_found = 0
        
        logger.info(f"Initialized queue with {len(queue)} URLs.")
        
        while queue and sources_found < max_sources:
            url = queue.popleft()
            if url in visited:
                continue
                
            visited.add(url)
            logger.info(f"Scraping (Queue: {len(queue)}): {url}")
            
            try:
                # Document routing check
                parsed_url = url.split("?")[0].lower()
                if parsed_url.endswith(('.pdf', '.txt', '.epub', '.docx', '.csv')):
                    logger.info(f"📄 Detected document URL, parsing locally (Zero Credits): {url}")
                    markdown_content = await self._process_document_locally(url)
                else:
                    logger.info(f"🌐 Detected Webpage, sending to Firecrawl: {url}")
                    # Firecrawl is synchronous, run in thread
                    result = await asyncio.to_thread(
                        self.firecrawl.scrape_url, 
                        url, 
                        formats=['markdown']
                    )
                    if isinstance(result, dict):
                        markdown_content = result.get('markdown', '')
                    else:
                        markdown_content = getattr(result, 'markdown', '')
            except Exception as e:
                logger.warning(f"Failed to scrape {url}: {e}")
                continue
                
            if not markdown_content or len(markdown_content) < 500:
                logger.debug(f"Skipping {url}: Too short.")
                continue
                
            # Extract links from the page to pass to LLM
            page_links = self.extract_links(markdown_content)[:30] # Top 30 links
                
            # 3. LLM Evaluator (JSON output)
            prompt = f"""You are a brilliant historical researcher building a Knowledge Graph about {person_name}.
Evaluate the following scraped webpage text. 

1. Does this text contain rich, detailed historical information, original writings, or direct quotes by {person_name}? 
It is OK if it is a high-quality biography, a university archive page, or an article, AS LONG AS it contains substantial, extractable text about their ideas and life.
CRITICAL: DO NOT accept Wikipedia, encyclopedias, or generic summary sites as primary sources. They are strictly secondary and must be rejected.
2. Look at the provided list of hyperlinks found on this page. Are there any links that likely point to original PDFs, archives, or primary sources?

Respond ONLY with a valid JSON object in this exact format:
{{
    "is_valuable": true or false,
    "reason": "short explanation",
    "links_to_follow": ["url1", "url2"]
}}

Links found on page:
{page_links}

Text snippet (first 4000 chars):
{markdown_content[:4000]}
"""
            try:
                response = litellm.completion(
                    model="gemini/gemini-3.1-flash-lite",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={ "type": "json_object" }
                )
                raw_json = response.choices[0].message.content.strip()
                # Clean up if model wrapped in markdown code blocks
                if raw_json.startswith("```json"):
                    raw_json = raw_json[7:-3].strip()
                elif raw_json.startswith("```"):
                    raw_json = raw_json[3:-3].strip()
                    
                decision = json.loads(raw_json)
            except Exception as e:
                logger.warning(f"LLM JSON verification failed for {url}: {e}")
                # Sleep and continue
                await asyncio.sleep(4)
                continue
                
            if decision.get("is_valuable"):
                logger.info(f"✅ LLM ACCEPTED {url}: {decision.get('reason')}")
                sources_found += 1
                yield {
                    "title": url.split("/")[-1] or url,
                    "content": markdown_content,
                    "url": url,
                    "source_type": "web_article"
                }
            else:
                logger.info(f"❌ LLM REJECTED {url}: {decision.get('reason')}")
                
            # Append new links to queue
            new_links = decision.get("links_to_follow", [])
            added_count = 0
            for link in new_links:
                if link not in visited and link not in queue:
                    queue.append(link)
                    added_count += 1
            if added_count > 0:
                logger.info(f"➕ Added {added_count} new citation links to queue.")
                
            # Sleep to avoid LLM rate limits
            await asyncio.sleep(4)

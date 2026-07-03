"""
Source Gathering Agent.

Orchestrates web search and scraping to find primary sources for a person.
Uses Tavily API for search and Crawl4AI for clean markdown extraction.
"""
import os
import asyncio
import structlog
from typing import List, Dict

from tavily import AsyncTavilyClient
from crawl4ai import AsyncWebCrawler
import litellm

from cognee_layer.chunker import chunk_document

logger = structlog.get_logger()

# Configure litellm to use Gemini
# Ensure GEMINI_API_KEY is available in the environment
os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "")

class SourceGatheringAgent:
    def __init__(self):
        self.tavily_client = AsyncTavilyClient(api_key=os.getenv("TAVILY_API_KEY", ""))

    async def gather_sources(self, person_name: str, max_sources: int = 3) -> List[Dict[str, str]]:
        """
        1. Search Tavily for primary sources.
        2. Scrape the URLs with Crawl4AI.
        3. Use LLM to verify it is a primary source.
        Returns a list of dicts: {"title": str, "content": str, "url": str, "source_type": str}
        """
        logger.info(f"Starting source gathering for {person_name}")
        
        # 1. Search Web
        query = f"{person_name} original papers letters primary sources text"
        logger.info(f"Searching Tavily with query: {query}")
        
        try:
            search_result = await self.tavily_client.search(query, search_depth="advanced", max_results=10)
        except Exception as e:
            logger.error(f"Tavily search failed: {e}")
            return []
            
        urls_to_scrape = [result["url"] for result in search_result.get("results", [])]
        logger.info(f"Found {len(urls_to_scrape)} potential URLs.")
        
        valid_sources = []
        
        # 2. Scrape and Evaluate
        async with AsyncWebCrawler(verbose=True) as crawler:
            for url in urls_to_scrape:
                if len(valid_sources) >= max_sources:
                    break
                    
                logger.info(f"Scraping {url}...")
                try:
                    result = await crawler.arun(url=url)
                    markdown_content = result.markdown
                except Exception as e:
                    logger.warning(f"Failed to scrape {url}: {e}")
                    continue
                    
                if not markdown_content or len(markdown_content) < 500:
                    logger.debug(f"Skipping {url}: Too short.")
                    continue
                    
                # 3. Verify primary source using LLM
                prompt = f"""You are an expert archivist. 
We are looking for primary sources written BY {person_name}. 
Evaluate the following text and determine if it is a primary source (e.g. an original letter, patent, book, or paper written by them).
If it is a secondary source (like a Wikipedia article, a biography written by someone else, or a blog post about them), reject it.

Respond with ONLY the word "YES" if it is a primary source, or "NO" if it is a secondary source.

Text snippet (first 2000 chars):
{markdown_content[:2000]}
"""
                try:
                    response = litellm.completion(
                        model="gemini/gemini-2.5-flash",
                        messages=[{"role": "user", "content": prompt}]
                    )
                    decision = response.choices[0].message.content.strip().upper()
                except Exception as e:
                    logger.warning(f"LLM verification failed for {url}: {e}")
                    continue
                    
                if "YES" in decision:
                    logger.info(f"✅ LLM accepted {url} as primary source.")
                    valid_sources.append({
                        "title": url.split("/")[-1] or url,
                        "content": markdown_content,
                        "url": url,
                        "source_type": "web_article"
                    })
                else:
                    logger.info(f"❌ LLM rejected {url} (Secondary source).")
                    
        return valid_sources

    async def gather_and_chunk(self, person_name: str, max_sources: int = 3) -> List[Dict]:
        """Full pipeline: gather -> chunk"""
        sources = await self.gather_sources(person_name, max_sources)
        
        all_chunks = []
        for source in sources:
            chunks = chunk_document(
                text=source["content"],
                title=source["title"],
                source_type=source["source_type"],
                person_name=person_name
            )
            all_chunks.extend(chunks)
            
        logger.info(f"Produced {len(all_chunks)} chunks for {person_name}")
        return all_chunks

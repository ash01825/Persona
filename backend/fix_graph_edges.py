import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from neo4j import AsyncGraphDatabase
from config import settings

async def main():
    driver = AsyncGraphDatabase.driver(
        settings.graph_database_url,
        auth=(settings.graph_database_username, settings.graph_database_password),
    )
    
    print("Fixing missing Theme edges in Neo4j...")
    try:
        async with driver.session() as session:
            # 1. Connect Theme nodes to their community members
            result = await session.run("""
                MATCH (t:Theme), (n)
                WHERE t.community_id = n.communityId AND id(t) <> id(n)
                MERGE (n)-[:belongs_to_theme]->(t)
                RETURN count(n) as edges_created
            """)
            record = await result.single()
            print(f"Created {record['edges_created']} belongs_to_theme edges!")
            
            # 2. Check for remaining floating nodes
            result_floating = await session.run("""
                MATCH (n)
                WHERE NOT (n)--()
                RETURN count(n) as floating_count
            """)
            floating_record = await result_floating.single()
            print(f"Remaining floating nodes: {floating_record['floating_count']}")

    except Exception as e:
        print("Error fixing graph:", e)
    finally:
        await driver.close()

if __name__ == "__main__":
    asyncio.run(main())

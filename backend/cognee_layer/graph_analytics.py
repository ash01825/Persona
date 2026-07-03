"""
Graph analytics for Persona.

Theme generation: Louvain community detection on Neo4j after all extraction is done.
Themes are generated ONCE per mind build, not during extraction.
"""
import structlog
from neo4j import AsyncGraphDatabase

from cognee_layer.ontology import Theme
from cognee.tasks.storage import add_data_points
from config import settings

logger = structlog.get_logger()

MIN_COMMUNITY_SIZE = 3


async def run_theme_clustering(mind_id: str) -> list[Theme]:
    """
    Run Louvain community detection on Neo4j for a specific mind's dataset.
    Creates Theme DataPoints for each significant community.

    Args:
        mind_id: The mind identifier (e.g. "tesla")

    Returns:
        List of Theme DataPoints created.
    """
    logger.info("Starting theme clustering", mind_id=mind_id)

    driver = AsyncGraphDatabase.driver(
        settings.graph_database_url,
        auth=(settings.graph_database_username, settings.graph_database_password),
    )

    themes: list[Theme] = []

    try:
        async with driver.session() as session:
            graph_name = f"persona_{mind_id}"

            await session.run("""
                CALL gds.graph.project(
                    $graph_name,
                    ['Concept', 'Belief', 'Creation', 'Finding', 'Person'],
                    {
                        supports: {orientation: 'UNDIRECTED'},
                        contradicts: {orientation: 'UNDIRECTED'},
                        influenced_by: {orientation: 'UNDIRECTED'},
                        evolved_from: {orientation: 'UNDIRECTED'},
                        created: {orientation: 'UNDIRECTED'}
                    }
                )
            """, graph_name=graph_name)

            result = await session.run("""
                CALL gds.louvain.write(
                    $graph_name,
                    {writeProperty: 'communityId'}
                )
                YIELD communityCount, modularity
                RETURN communityCount, modularity
            """, graph_name=graph_name)
            stats = await result.single()
            logger.info(
                "Louvain complete",
                communities=stats["communityCount"],
                modularity=stats["modularity"],
            )

            members_result = await session.run("""
                MATCH (n)
                WHERE n.communityId IS NOT NULL
                RETURN n.communityId AS community_id,
                       collect(n.name)[0..5] AS sample_names,
                       count(n) AS size
                ORDER BY size DESC
            """)
            communities = await members_result.data()

            for community in communities:
                if community["size"] < MIN_COMMUNITY_SIZE:
                    continue

                sample = [n for n in community["sample_names"] if n][:3]
                theme_name = " / ".join(sample) if sample else f"Theme {community['community_id']}"

                theme = Theme(
                    name=theme_name,
                    description=f"Cluster of {community['size']} related concepts",
                    community_id=community["community_id"],
                )
                themes.append(theme)

            if themes:
                await add_data_points(themes, ctx=None)
                logger.info("Themes created", count=len(themes))

            await session.run(
                "CALL gds.graph.drop($graph_name)",
                graph_name=graph_name,
            )

    except Exception as e:
        logger.error("Theme clustering failed", mind_id=mind_id, error=str(e))
    finally:
        await driver.close()

    return themes

// Q1: Count all nodes and relationships in the database
MATCH (n)
OPTIONAL MATCH (n)-[r]->()
RETURN labels(n)[0] AS label, count(DISTINCT n) AS nodes, count(r) AS outgoing_rels
ORDER BY nodes DESC;

// Q2: Find Luke Skywalker's homeworld and species
MATCH (c:Character {name: 'Luke Skywalker'})-[:LIVES_ON]->(p:Planet),
      (c)-[:IS_SPECIES]->(s:Species)
RETURN c.name AS character, p.name AS homeworld, s.name AS species,
       c.height AS height, c.year_born AS born_bby;

// Q3: Which planet has the most residents?
MATCH (c:Character)-[:LIVES_ON]->(p:Planet)
RETURN p.name AS planet, count(c) AS residents
ORDER BY residents DESC
LIMIT 5;

// Q4: Find all characters of a given species and where they live
MATCH (c:Character)-[:IS_SPECIES]->(s:Species {name: 'Wookiee'})
OPTIONAL MATCH (c)-[:LIVES_ON]->(p:Planet)
RETURN c.name AS character, p.name AS homeworld;

// Q5: Multi-hop — find all characters who share a homeworld with Darth Vader
MATCH (vader:Character {name: 'Darth Vader'})-[:LIVES_ON]->(p:Planet)<-[:LIVES_ON]-(neighbor:Character)
WHERE neighbor.name <> 'Darth Vader'
RETURN p.name AS shared_planet, collect(neighbor.name) AS neighbors;

// Q6: Which species originate from the same planet where characters live?
MATCH (s:Species)-[:HOMEWORLD]->(p:Planet)<-[:LIVES_ON]-(c:Character)
RETURN p.name AS planet, s.name AS native_species, collect(c.name) AS residents
ORDER BY planet;

// Q7: Find characters with no homeworld relationship (orphan check)
MATCH (c:Character)
WHERE NOT (c)-[:LIVES_ON]->()
RETURN c.name AS character, c.homeworld AS listed_homeworld
ORDER BY c.name;

// Q8: Shortest path between two characters through shared planets/species
MATCH path = shortestPath(
  (a:Character {name: 'Yoda'})-[*]-(b:Character {name: 'Han Solo'})
)
RETURN [n IN nodes(path) | coalesce(n.name, 'unknown')] AS path_nodes,
       [r IN relationships(path) | type(r)] AS path_rels,
       length(path) AS hops;

// Q9: Planet statistics — average character height per planet (min 2 residents)
MATCH (c:Character)-[:LIVES_ON]->(p:Planet)
WITH p, collect(c.height) AS heights, count(c) AS pop
WHERE pop >= 2
RETURN p.name AS planet, pop AS characters,
       round(reduce(s = 0.0, h IN [x IN heights WHERE x IS NOT NULL] | s + h) / size([x IN heights WHERE x IS NOT NULL]), 2) AS avg_height
ORDER BY avg_height DESC;

// Q10: Full graph pattern — characters, their species, species homeworld, character homeworld
MATCH (c:Character)-[:IS_SPECIES]->(s:Species)-[:HOMEWORLD]->(sp:Planet),
      (c)-[:LIVES_ON]->(cp:Planet)
WHERE sp <> cp
RETURN c.name AS character, s.name AS species, sp.name AS species_origin, cp.name AS lives_on
ORDER BY character;

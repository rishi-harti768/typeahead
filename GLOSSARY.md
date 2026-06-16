# Typeahead System Glossary

The canonical language and core vocabulary of our scalable typeahead system workspace.

## Data Structures

**Trie (Prefix Tree)**:
An ordered, search-tree data structure where each node represents a character path, used to store and retrieve string keys by prefix.
_Avoid_: Binary search tree, lookup tree

**Node**:
An individual record block within a **Trie** representing a single character step, containing links to children character branches and terminal indicators.
_Avoid_: Point, vertex

## Client Optimization

**Debouncing**:
An optimization pattern that delay-executes a client-side function until a designated "silent period" of user inactivity has passed.
_Avoid_: Throttling, delay wrapper

**Throttling**:
A rate-limiting pattern that restricts a function's execution to a fixed maximum frequency over time, regardless of user typing pauses.
_Avoid_: Debouncing, pacing rate

## Write Path Scale

**Write Buffering**:
An architectural pattern that intercepts raw search submissions in temporary memory, aggregating popularity counts before flushing them in batches to the database.
_Avoid_: Direct writing, transactional logs

**Write-Ahead Log (WAL)**:
A high-performance sequential append log stored on disk to record state modifications before they are stored in the volatile **Write Buffering** RAM.
_Avoid_: Database indexes, transaction journals

## Horizontal Partitioning

**Consistent Hashing**:
A horizontal routing algorithm where both cache servers and query keys map onto a shared circular ring to minimize key migration when node counts scale.
_Avoid_: Modulo hashing, round-robin hashing

**Hash Ring**:
The mathematical circular space mapping hash ranges (0 to $2^{32}-1$) used in **Consistent Hashing** to distribute nodes and key mappings clockwise.
_Avoid_: Modulo map, server array

**Virtual Node**:
A virtual representation of a physical cache server mapped at multiple distinct positions on a **Hash Ring** to balance key distribution and eliminate hotspots.
_Avoid_: Server clone, shadow node

## Ranking & Freshness

**Exponential Time Decay**:
A mathematical formulation that exponentially decreases the ranking weight of temporary viral spikes over elapsed windows of time.
_Avoid_: Linear cooling, time drop

**Half-Life**:
The duration window in which a temporary viral search spike's count halves in value under **Exponential Time Decay** scoring.
_Avoid_: Decay rate, half-time

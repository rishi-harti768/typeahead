# Consistent Hashing for Distributed Cache Routing

To support low-latency reads and ensure a scalable, partitioned cache layer, we decided to route autocomplete prefix requests across multiple simulated cache nodes using Consistent Hashing. We place both physical cache servers (as Virtual Nodes to ensure balanced, uniform key distribution) and prefix keys on a 32-bit Hash Ring using a fast Prefix Key Hashing algorithm. This ensures that adding or removing cache nodes minimizes key migration (only a fraction of keys are remapped) and avoids cache routing hotspots.

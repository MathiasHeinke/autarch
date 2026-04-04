import asyncio
from typing import Dict, Any

async def load_mcp_tools():
    # Load config and mcp logic mimicking hermes-agent
    import sys
    sys.path.append("/Users/mathiasheinke/Developer/autarch/workers/hermes-cloud")
    try:
        from hermes_agent.tools.mcp_tool import load_mcp_servers_from_config
    except ImportError:
        # pip install hermes-agent locally to introspect
        print("Install hermes-agent locally to test: pip install hermes-agent==0.7.0")
        return

asyncio.run(load_mcp_tools())

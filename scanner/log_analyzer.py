import json, os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

def analyze_logs(log_file: str) -> dict:
    """Read a log file and return traffic counts per endpoint."""
    path = os.path.join(DATA_DIR, log_file)
    try:
        with open(path) as f:
            data = json.load(f)
        print(f"[LogAnalyzer] Loaded {log_file}: {len(data)} entries")
        return data
    except Exception as e:
        print(f"[LogAnalyzer] Error reading {log_file}: {e}")
        return {}

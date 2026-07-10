#!/usr/bin/env python3
"""
Google Search Console Data Fetcher (Python)

Usage:
  python3 scripts/fetch-gsc.py <siteUrl> <startDate> <endDate> [dimensions...]

Example:
  python3 scripts/fetch-gsc.py "sc-domain:presusimple.com" "2026-06-01" "2026-06-30" query page

Environment Variables:
  GSC_CREDENTIALS_PATH: Path to the service account credentials JSON file.
                        Defaults to secrets/gsc-service-account.json in the project root.
"""

import os
import sys
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def main():
    # 1. Parse arguments
    args = sys.argv[1:]
    if len(args) < 3:
        print("Usage: python3 scripts/fetch-gsc.py <siteUrl> <startDate> <endDate> [dimensions...]", file=sys.stderr)
        print("Example: python3 scripts/fetch-gsc.py \"sc-domain:presusimple.com\" \"2026-06-01\" \"2026-06-30\" query page", file=sys.stderr)
        sys.exit(1)

    site_url = args[0]
    start_date = args[1]
    end_date = args[2]
    dimensions = args[3:] if len(args) > 3 else ['query']

    # 2. Resolve credentials path
    creds_path = os.environ.get(
        "GSC_CREDENTIALS_PATH",
        os.path.join(os.path.dirname(__file__), "..", "secrets", "gsc-service-account.json"),
    )

    if not os.path.exists(creds_path):
        print(f"Error: Credentials file not found at {creds_path}", file=sys.stderr)
        print("Please set GSC_CREDENTIALS_PATH environment variable to the correct path.", file=sys.stderr)
        sys.exit(1)

    # 3. Authenticate and query Search Console API
    try:
        scopes = ['https://www.googleapis.com/auth/webmasters.readonly']
        credentials = service_account.Credentials.from_service_account_file(
            creds_path, 
            scopes=scopes
        )
        
        service = build('webmasters', 'v3', credentials=credentials)
        
        print(f"Fetching GSC data for {site_url} ({start_date} to {end_date}) with dimensions: {dimensions}...", file=sys.stderr)
        
        request_body = {
            'startDate': start_date,
            'endDate': end_date,
            'dimensions': dimensions,
            'rowLimit': 5000
        }
        
        response = service.searchanalytics().query(
            siteUrl=site_url, 
            body=request_body
        ).execute()
        
        # Print JSON response to stdout
        print(json.dumps(response, indent=2))

    except HttpError as error:
        print(f"GSC HTTP Error: {error.resp.status} - {error.content.decode('utf-8')}", file=sys.stderr)
        sys.exit(1)
    except Exception as error:
        print(f"GSC Error: {error}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

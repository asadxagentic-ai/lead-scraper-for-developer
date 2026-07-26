## Overview
This n8n workflow, named 'Abdullah Lead Scraper', is designed to automate the process of scraping business leads from Google based on specific search criteria and saving them into a Google Sheet. It uses various n8n nodes to handle webhooks, HTTP requests, data manipulation, and integration with Google Sheets.

## How It Works
1. The workflow starts with a webhook trigger that accepts incoming POST requests.
2. The input data is normalized and prepared for the API request.
3. An HTTP request is made to the Apify API to scrape Google Business Listings.
4. The results are limited to 25 and aggregated.
5. The leads are checked and split into valid, invalid, and low-rated categories.
6. If there are any valid leads, they are processed further.
7. Each lead's fields are mapped and formatted.
8. Another API call is made to find social media profiles for each lead.
9. Valid social URLs are filtered and summarized.
10. The lead data and social media information are merged.
11. The final data is saved into a Google Sheet.
12. A response is sent back to the webhook caller with a summary of the operation.

## Nodes & Tools Used
- **Webhook**: Triggers the workflow.
- **Set**: Normalizes and prepares input data.
- **HTTP Request**: Makes API calls to scrape data and find social profiles.
- **Google Sheets**: Saves the scraped data.
- **Respond to Webhook**: Sends a response back to the caller.
- **Limit**: Caps the number of raw results.
- **Aggregate**: Combines all item data.
- **Code**: Processes and splits the leads.
- **If**: Checks if there are any valid leads.
- **Filter**: Filters valid social URLs.
- **Summarize**: Groups socials per lead.
- **Merge**: Combines lead and social data.

## Prerequisites
- n8n installed and running.
- Apify account and API token.
- Google account and Google Sheets API credentials.
- A Google Sheet to store the leads.

## Setup & Usage
1. Import the provided JSON into your n8n instance.
2. Configure the `Apify - Scrape Google Business Listings` and `Apify - Find Social Profile by Name` nodes with your Apify API token.
3. Set up the `Save Lead to Google Sheet` node with your Google Sheets credentials and the ID of the target sheet.
4. Test the workflow by sending a POST request to the webhook URL with the required parameters (`WHAT BUSINESS YOU WANT TO SEARCH` and `WHERE YOU WANT TO SEARCH`).

## Use Cases
- Marketing teams looking to gather business leads for targeted campaigns.
- Sales teams needing to build a list of potential clients in specific locations.
- Data analysts who need to collect and process business data for market research.
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Get the bearer token from the environment variable
bearer_token = os.getenv('BEARER_TOKEN')

# The URL of your API endpoint
url = 'http://localhost:3000/api/getFormData'

# Set up the headers with the bearer token
headers = {
    'Authorization': f'Bearer {bearer_token}'
}

# Make the GET request
response = requests.get(url, headers=headers)

# Check the response
if response.status_code == 200:
    data = response.json()
    print("Successfully retrieved data:")
    print(f"Completed Sessions: {len(data['completedSessions'])}")
    print(f"Incomplete Sessions: {len(data['incompleteSessions'])}")
    
    # Print the first item of each category if available
    if data['completedSessions']:
        print("\nSample Completed Session:")
        print(data['completedSessions'][0])
    if data['incompleteSessions']:
        print("\nSample Incomplete Session:")
        print(data['incompleteSessions'][0])
elif response.status_code == 401:
    print("Authentication failed. Check your bearer token.")
else:
    print(f"Request failed with status code: {response.status_code}")
    print(f"Response: {response.text}")
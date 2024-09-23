import requests
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

bearer_token = os.getenv('BEARER_TOKEN')

url = 'http://localhost:3000/api/getFormData'

headers = {
    'Authorization': f'Bearer {bearer_token}'
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    print("Successfully retrieved data:")
    print(f"Completed Sessions: {len(data['completedSessions'])}")
    print(f"Incomplete Sessions: {len(data['incompleteSessions'])}")
    
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
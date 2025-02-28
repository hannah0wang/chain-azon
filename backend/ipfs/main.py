import requests
import json
import os

# Environment variables for security
PINATA_API_KEY = os.getenv("PINATA_API_KEY", "7824585a98fe36414d68")  # Replace with actual API Key
PINATA_SECRET_API_KEY = os.getenv("PINATA_SECRET_API_KEY", "41a53a837879721969e73008d91180df30dbc66097c7f75f08cd5489176b43ea")  # Replace with actual Secret API Key
PINATA_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"

# Data to be uploaded to IPFS
data = [
    {"product_id": "B0016NHH56", "quantity": 1},
    {"product_id": "B002QYW8LW", "quantity": 2},
    {"product_id": "B003TULUI4", "quantity": 1},
    {"product_id": "B0046UR4F4", "quantity": 3},
    {"product_id": "B0058BDF38", "quantity": 1}
]

# Convert data to JSON format
json_data = json.dumps(data)

# Headers
headers = {
    "Content-Type": "application/json",
    "pinata_api_key": PINATA_API_KEY,
    "pinata_secret_api_key": PINATA_SECRET_API_KEY
}

# Sending the request
response = requests.post(PINATA_URL, headers=headers, data=json_data)

# Handling the response
if response.status_code == 200:
    print("Upload successful!")
    print("IPFS Hash:", response.json()["IpfsHash"])
else:
    print("Failed to upload:", response.text)

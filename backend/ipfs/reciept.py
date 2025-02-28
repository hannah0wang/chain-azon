import requests
import json
import os

# Environment variables for security (replace with actual API keys or set them in the system)
PINATA_API_KEY = os.getenv("PINATA_API_KEY", "7824585a98fe36414d68")
PINATA_SECRET_API_KEY = os.getenv("PINATA_SECRET_API_KEY", "41a53a837879721969e73008d91180df30dbc66097c7f75f08cd5489176b43ea")
PINATA_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
IPFS_GATEWAY = "https://othentic.mypinata.cloud/ipfs/"

# Original product data with quantities
original_products = [
    {"product_id": "B0016NHH56", "quantity": 1},
    {"product_id": "B002QYW8LW", "quantity": 2},
    {"product_id": "B003TULUI4", "quantity": 1},
    {"product_id": "B0046UR4F4", "quantity": 3},  # This should be expanded 3 times
    {"product_id": "B0058BDF38", "quantity": 1}
]

# Expand products based on quantity (e.g., 3 => 3 separate entries)
expanded_products = []
for product in original_products:
    expanded_products.extend([{"product_id": product["product_id"]}] * product["quantity"])

# Order response data with expanded product IDs
order_response = {
    "_type": "order_response",
    "price_components": {
        "converted_payment_total": 1999,
        "currency": "USD",
        "payment_currency": "USD",
        "shipping": 0,
        "subtotal": 1999,
        "tax": 0,
        "total": 1999
    },
    "merchant_order_ids": [
        {
            "merchant_order_id": "112-1234567-7272727",
            "merchant": "amazon",
            "account": "timbeaver@gmail.com",
            "placed_at": "2014-07-02T23:51:08.366Z"
        }
    ],
    "tracking": [],
    "request": {}  # Placeholder for additional request data
}

# Assign unique tracking numbers to each expanded product
for index, product in enumerate(expanded_products):
    order_response["tracking"].append({
        "product_id": product["product_id"],
        "merchant_order_id": "112-1234567-7272727",
        "carrier": "Fedex",
        "tracking_number": f"926129010012979089{index:04d}",  # Unique tracking numbers
        "obtained_at": "2014-07-03T23:22:48.165Z"
    })

# Convert data to JSON format
json_data = json.dumps(order_response)

# Headers for the request
headers = {
    "Content-Type": "application/json",
    "pinata_api_key": PINATA_API_KEY,
    "pinata_secret_api_key": PINATA_SECRET_API_KEY
}

# Sending the request to Pinata
response = requests.post(PINATA_URL, headers=headers, data=json_data)

# Handling the response
if response.status_code == 200:
    ipfs_hash = response.json()["IpfsHash"]
    custom_ipfs_url = f"{IPFS_GATEWAY}{ipfs_hash}"
    print("✅ Upload successful!")
    print("🔗 Custom Pinata Gateway URL:", custom_ipfs_url)
else:
    print("❌ Failed to upload:", response.text)

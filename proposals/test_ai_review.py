import requests

BASE_URL = "http://127.0.0.1:8000/api"

# Step 1: Login
login_response = requests.post(
    f"{BASE_URL}/auth/login/",
    json={"email": "abc123@gmail.com", "password": "palani@12345"}
)
print("Login status:", login_response.status_code)
login_data = login_response.json()
print("Login response:", login_data)

access_token = login_data.get("access")
if not access_token:
    print("ERROR: No access token received. Stopping.")
    exit()

# Step 2: Call the AI review endpoint
proposal_id = "ad856d20-4746-4481-a15a-5b9adc899fee"
review_response = requests.post(
    f"{BASE_URL}/proposals/submissions/{proposal_id}/ai_review/",
    headers={"Authorization": f"Bearer {access_token}"}
)
print("AI review status:", review_response.status_code)
print("AI review response:", review_response.json())
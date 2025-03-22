#!/usr/bin/env python3

import requests
import json

# --- Configuration ---
GITEA_URL = "http://www.xiaokang00010.top:4001"  # e.g., "https://gitea.example.com"
API_USERNAME = "xiaokang00010" # Your Gitea admin username
API_PASSWORD = "Azhouby123" # Your Gitea admin password
EXCLUDE_USER = "xiaokang00010"

# --- API Endpoints ---
USERS_API_ENDPOINT = f"{GITEA_URL}/api/v1/admin/users"
REPOS_API_ENDPOINT = f"{GITEA_URL}/api/v1/users/%s/repos" # %s will be replaced with username
DELETE_USER_API_ENDPOINT = f"{GITEA_URL}/api/v1/admin/users/%s" # %s will be replaced with username
DELETE_REPO_API_ENDPOINT = f"{GITEA_URL}/api/v1/repos/%s/%s" # %s will be replaced with username and repo name

# --- Functions ---

def get_users():
    """
    Retrieves a list of all users from Gitea.
    """
    try:
        response = requests.get(
            USERS_API_ENDPOINT,
            auth=(API_USERNAME, API_PASSWORD),
            headers={'Accept': 'application/json'}
        )
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting users: {e}")
        return None

def get_user_repos(username):
    """
    Retrieves a list of repositories owned by a specific user.
    """
    try:
        response = requests.get(
            REPOS_API_ENDPOINT % username,
            auth=(API_USERNAME, API_PASSWORD),
            headers={'Accept': 'application/json'}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error getting repos for user {username}: {e}")
        return None

def delete_repo(username, repo_name):
    """
    Deletes a specific repository.
    """
    try:
        response = requests.delete(
            DELETE_REPO_API_ENDPOINT % (username, repo_name),
            auth=(API_USERNAME, API_PASSWORD),
            headers={'Accept': 'application/json'}
        )
        response.raise_for_status()
        if response.status_code == 204:
            print(f"  Deleted repo: {username}/{repo_name}")
        else:
            print(f"  Failed to delete repo: {username}/{repo_name} - Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"  Error deleting repo {username}/{repo_name}: {e}")

def delete_user(username):
    """
    Deletes a specific user.
    """
    try:
        response = requests.delete(
            DELETE_USER_API_ENDPOINT % username,
            auth=(API_USERNAME, API_PASSWORD),
            headers={'Accept': 'application/json'}
        )
        response.raise_for_status()
        if response.status_code == 204:
            print(f"Deleted user: {username}")
        else:
            print(f"Failed to delete user: {username} - Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error deleting user {username}: {e}")

def main():
    """
    Main function to retrieve users, delete their repos, and then delete the users.
    """
    users = get_users()
    if not users:
        print("Failed to retrieve user list. Exiting.")
        return

    users_to_delete = [user for user in users if user['username'] != EXCLUDE_USER]
    
    assert EXCLUDE_USER not in users_to_delete, "Failed to find user to exclude."
    
    print(f"Found {len(users)} users in Gitea, ", EXCLUDE_USER in users_to_delete, "excluding xiaokang00010.")
    input("Press Enter to continue...")

    if not users_to_delete:
        print("No users to delete (excluding xiaokang00010).")
        return

    print("Users to be deleted (excluding xiaokang00010):")
    for user in users_to_delete:
        print(f"- {user['username']}")

    confirmation = input("\nAre you sure you want to delete these users and their repositories? (yes/no): ").lower()
    if confirmation != 'yes':
        print("Deletion cancelled.")
        return

    print("\nStarting deletion process...")

    for user in users_to_delete:
        username = user['username']
        print(f"\nProcessing user: {username}")

        repos = get_user_repos(username)
        if repos:
            print(f"  Deleting repos for user {username}:")
            for repo in repos:
                delete_repo(username, repo['name'])
        else:
            print(f"  No repos found for user {username}.")

        delete_user(username)
        print("-" * 30) # Separator for clarity

    print("\nDeletion process completed.")

if __name__ == "__main__":
    main()
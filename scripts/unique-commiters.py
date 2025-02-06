
import requests
import os
from datetime import datetime

# Organization and GitHub Token
org = 'excaliburjs'
token = os.getenv('GH_TOKEN')
# repo: Provides necessary acess to repositories (including private ones) for fetching commits, issues, and discussions.
# read:org: Essential for listing repositories in the organization.
# read:discussion (if applicable): For accessing discussions.
start_date = '2024-01-01T00:00:00Z'  # Start of the last year
end_date = '2024-12-31T23:59:59Z'    # End of the last year
headers = {'Authorization': f'token {token}'}

# Get all repositories in the organization
repo_url = f'https://api.github.com/orgs/{org}/repos'
repos = requests.get(repo_url, headers=headers).json()

unique_committers = set()

# Iterate over all repositories
for repo in repos:
    repo_name = repo['name']

    # Get commits for the repository within the specified date range
    commits_url = f'https://api.github.com/repos/{org}/{repo_name}/commits?since={start_date}&until={end_date}'
    
    # Handling pagination to get all commits
    while commits_url:
        commits_response = requests.get(commits_url, headers=headers)
        commit_json = commits_response.json()

        # Add each committer to the set (ensuring uniqueness)
        for commit in commit_json:
            if 'author' in commit and commit['author'] is not None:
                unique_committers.add(commit['author']['login'])

        # Check for pagination (if there is more data)
        if 'next' in commits_response.links:
            commits_url = commits_response.links['next']['url']
        else:
            commits_url = None

# Print unique committers
for committer in unique_committers:
    print(committer)

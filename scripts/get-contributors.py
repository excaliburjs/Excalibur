import os
import requests

org = 'excaliburjs'
token = os.getenv('GH_TOKEN')

start_date = '2024-01-01'
end_date = '2024-12-31'
headers = {'Authorization': f'token {token}'}

# Get all repositories in the organization
repo_url = f'https://api.github.com/orgs/{org}/repos'
repos = requests.get(repo_url, headers=headers).json()

unique_users = set()

# Iterate over all repositories
for repo in repos:
    repo_name = repo['name']
    
    # Get issues for the repository
    issues_url = f'https://api.github.com/repos/{org}/{repo_name}/issues?since={start_date}&state=all'
    issues = requests.get(issues_url, headers=headers).json()

    # Extract users from issues (creator, assignees, commenters)
    for issue in issues:
        unique_users.add(issue['user']['login'])  # Creator
        for assignee in issue.get('assignees', []):
            unique_users.add(assignee['login'])
        # Fetch comments
        comments_url = issue['comments_url']
        comments = requests.get(comments_url, headers=headers).json()
        for comment in comments:
            unique_users.add(comment['user']['login'])

    # Get discussions for the repository (if available)
    discussions_url = f'https://api.github.com/repos/{org}/{repo_name}/discussions?since={start_date}'
    discussions = requests.get(discussions_url, headers=headers).json()

    # Extract users from discussions (creator, commenters)
    try:
        for discussion in discussions:
            unique_users.add(discussion['user']['login'])
    except:
        pass

# Print all unique users
for user in unique_users:
    print(user)

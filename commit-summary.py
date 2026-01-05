#!/usr/bin/env python3
"""
Git Semantic Commit Summary
Analyzes git commits from the last year and organizes them by semantic commit type.
"""

import subprocess
import re
from datetime import datetime, timedelta
from collections import defaultdict
import sys

# Semantic commit types based on Conventional Commits
COMMIT_TYPES = {
    'feat': 'Features',
    'fix': 'Bug Fixes',
    'docs': 'Documentation',
    'style': 'Code Style',
    'refactor': 'Code Refactoring',
    'perf': 'Performance Improvements',
    'test': 'Tests',
    'build': 'Build System',
    'ci': 'Continuous Integration',
    'chore': 'Chores',
    'revert': 'Reverts',
    'other': 'Other Changes'
}

def get_commits_last_year(repo_path='.'):
    """Get all commits from the last year."""
    one_year_ago = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    try:
        result = subprocess.run(
            ['git', '-C', repo_path, 'log', f'--since={one_year_ago}', 
             '--pretty=format:%H|%s|%an|%ad', '--date=short'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip().split('\n') if result.stdout else []
    except subprocess.CalledProcessError as e:
        print(f"Error: Could not read git log. {e}", file=sys.stderr)
        sys.exit(1)

def parse_semantic_commit(commit_message):
    """Parse semantic commit message and extract type and scope."""
    # Pattern: type(scope): description or type: description
    pattern = r'^(\w+)(?:\(([^)]+)\))?:\s*(.+)$'
    match = re.match(pattern, commit_message)
    
    if match:
        commit_type = match.group(1).lower()
        scope = match.group(2) or ''
        description = match.group(3)
        
        # Validate commit type
        if commit_type not in COMMIT_TYPES:
            commit_type = 'other'
        
        return commit_type, scope, description
    
    return 'other', '', commit_message

def categorize_commits(commits):
    """Categorize commits by semantic type."""
    categorized = defaultdict(list)
    
    for commit in commits:
        if not commit:
            continue
            
        parts = commit.split('|')
        if len(parts) != 4:
            continue
            
        commit_hash, message, author, date = parts
        commit_type, scope, description = parse_semantic_commit(message)
        
        categorized[commit_type].append({
            'hash': commit_hash[:7],
            'scope': scope,
            'description': description,
            'author': author,
            'date': date,
            'full_message': message
        })
    
    return categorized

def generate_summary(categorized_commits, show_authors=False, show_dates=False):
    """Generate a formatted summary of commits."""
    summary = []
    summary.append("=" * 80)
    summary.append("GIT COMMIT SUMMARY - LAST 12 MONTHS")
    summary.append("=" * 80)
    summary.append("")
    
    total_commits = sum(len(commits) for commits in categorized_commits.values())
    summary.append(f"Total Commits: {total_commits}")
    summary.append("")
    
    # Sort by commit type order
    type_order = list(COMMIT_TYPES.keys())
    
    for commit_type in type_order:
        if commit_type not in categorized_commits:
            continue
            
        commits = categorized_commits[commit_type]
        type_name = COMMIT_TYPES[commit_type]
        
        summary.append("-" * 80)
        summary.append(f"{type_name.upper()} ({len(commits)} commits)")
        summary.append("-" * 80)
        
        # Group by scope if present
        scoped = defaultdict(list)
        for commit in commits:
            scope = commit['scope'] or 'general'
            scoped[scope].append(commit)
        
        for scope in sorted(scoped.keys()):
            if scope != 'general' and len(scoped) > 1:
                summary.append(f"\n  [{scope}]")
            
            for commit in scoped[scope]:
                line = f"  • {commit['description']} ({commit['hash']})"
                
                if show_authors:
                    line += f" - {commit['author']}"
                if show_dates:
                    line += f" [{commit['date']}]"
                
                summary.append(line)
        
        summary.append("")
    
    return '\n'.join(summary)

def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Summarize git commits from the last year by semantic type'
    )
    parser.add_argument(
        'repo_path',
        nargs='?',
        default='.',
        help='Path to git repository (default: current directory)'
    )
    parser.add_argument(
        '-a', '--authors',
        action='store_true',
        help='Show commit authors'
    )
    parser.add_argument(
        '-d', '--dates',
        action='store_true',
        help='Show commit dates'
    )
    parser.add_argument(
        '-o', '--output',
        help='Output file (default: print to stdout)'
    )
    
    args = parser.parse_args()
    
    # Get commits
    print("Analyzing commits...", file=sys.stderr)
    commits = get_commits_last_year(args.repo_path)
    
    if not commits or (len(commits) == 1 and not commits[0]):
        print("No commits found in the last year.", file=sys.stderr)
        sys.exit(0)
    
    # Categorize commits
    categorized = categorize_commits(commits)
    
    # Generate summary
    summary = generate_summary(categorized, args.authors, args.dates)
    
    # Output
    if args.output:
        with open(args.output, 'w') as f:
            f.write(summary)
        print(f"Summary written to {args.output}", file=sys.stderr)
    else:
        print(summary)

if __name__ == '__main__':
    main()

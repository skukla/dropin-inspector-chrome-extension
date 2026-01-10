# Step 1: Repository Setup

## Purpose
Initialize version control and create a private GitHub repository for the Dropin Inspector Chrome extension, establishing a proper project foundation with descriptive naming.

## Prerequisites
- [ ] GitHub CLI (`gh`) installed and authenticated
- [ ] Current folder is `dropin-inspector`

## Tests to Write First (RED Phase)
N/A - Infrastructure step, no code tests required.

## Tasks
- [ ] Rename folder from `dropin-inspector` to `dropin-inspector-chrome-extension`
- [ ] Navigate to renamed folder
- [ ] Initialize git repository if not already initialized
- [ ] Create private GitHub repository with initial push
- [ ] Verify repository creation and remote connection

## Implementation Details

### Commands to Execute
```bash
# From parent directory
cd /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system
mv dropin-inspector dropin-inspector-chrome-extension
cd dropin-inspector-chrome-extension

# Initialize git if needed
git init

# Create private repo and push
gh repo create skukla/dropin-inspector-chrome-extension --private --source=. --push

# Verify
git remote -v
```

## Expected Outcome
- Folder renamed to `dropin-inspector-chrome-extension`
- Private GitHub repository created at `github.com/skukla/dropin-inspector-chrome-extension`
- Initial commit pushed to main branch
- Remote origin configured

## Acceptance Criteria
- [ ] Folder renamed successfully
- [ ] GitHub repository exists and is private
- [ ] Code is pushed to remote
- [ ] `git remote -v` shows correct origin URL

## Dependencies from Other Steps
- None - this is the first step

## Estimated Time
5 minutes

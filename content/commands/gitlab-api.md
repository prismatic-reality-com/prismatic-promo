+++
title = "/gitlab-api"
weight = 1540
[extra]
category = "GitLab"
description = "GitLab API operations for project and repository management"
syntax = "/gitlab-api [options]"
authority = "L2+"
agent = "gitlab-api-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1041
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["gitlab-api", "GitLab", "commands", "Prismatic Platform", "Create", "GitLab API"]
tags = ["commands", "gitlab", "gitlab-api", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/gitlab-api - Prismatic Platform"
+++

## Overview

**/gitlab-api** is a production command in the **GitLab** category of the Prismatic Platform that provides direct access to GitLab REST API operations for project management, repository operations, issue tracking, merge request handling, and CI/CD pipeline control. Rather than requiring operators to construct raw HTTP requests or navigate the GitLab web interface, this command wraps the most frequently used API endpoints behind a clean command-line interface with built-in authentication, pagination, error handling, and output formatting.

This command operates under the **L2+** authority level and is executed by the `gitlab-api-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The GitLab API integration is foundational to the platform's development workflow, as GitLab serves as the primary source code host, CI/CD pipeline runner, issue tracker, and artifact repository.

The Prismatic Platform's mandatory session discipline protocol requires GitLab issue tracking for every development session. The `/gitlab-api` command facilitates this requirement by providing rapid issue creation, status updates, and progress tracking without leaving the command-line environment.

## Architecture

The command is built on a typed HTTP client that handles authentication, rate limiting, pagination, and response parsing for all GitLab API v4 endpoints.

### Client Architecture

```
/gitlab-api -> Request Builder -> HTTP Client -> Response Parser -> Formatter
                    |                 |               |                |
                    v                 v               v                v
             Endpoint Routing   Auth Headers    JSON Parsing      Text/JSON/Table
             Parameter Validation  Rate Limiter  Error Detection   Pagination
             Query Construction    Retry Logic   Type Mapping      Filtering
```

### Supported API Domains

| Domain | Endpoints | Key Operations |
|--------|-----------|---------------|
| **Projects** | `/projects/:id` | List, get, create, update, archive |
| **Issues** | `/projects/:id/issues` | Create, update, close, list, search |
| **Merge Requests** | `/projects/:id/merge_requests` | Create, review, approve, merge, list |
| **Pipelines** | `/projects/:id/pipelines` | Trigger, status, cancel, retry, logs |
| **Milestones** | `/projects/:id/milestones` | Create, update, list, close |
| **Branches** | `/projects/:id/repository/branches` | Create, delete, protect, list |
| **Tags** | `/projects/:id/repository/tags` | Create, delete, list |
| **Releases** | `/projects/:id/releases` | Create, update, list |
| **Labels** | `/projects/:id/labels` | Create, update, delete, list |

### Authentication

The command authenticates using the `GITLAB_TOKEN` environment variable, which should contain a GitLab Personal Access Token with appropriate scopes. The token is validated at command startup and cached for the session duration.

| Scope | Required For |
|-------|-------------|
| `api` | Full API access (recommended) |
| `read_api` | Read-only operations |
| `read_repository` | Repository browsing |
| `write_repository` | Push operations |

## Usage

```bash
# List project issues
/gitlab-api issues list --state=opened

# Create a new issue
/gitlab-api issues create --title="Feature: New Dashboard" --labels="feature,P2"

# Update issue status
/gitlab-api issues update 1234 --state=closed

# List merge requests
/gitlab-api mrs list --state=opened --assignee=me

# Get pipeline status
/gitlab-api pipelines status --ref=main

# Trigger a new pipeline
/gitlab-api pipelines trigger --ref=main

# List milestones
/gitlab-api milestones list --state=active

# Create a release
/gitlab-api releases create --tag=v1.0.0 --name="Release 1.0.0"

# Search across project
/gitlab-api search "bug fix" --scope=issues

# Get project statistics
/gitlab-api project stats
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `domain` | string | required | API domain: issues, mrs, pipelines, milestones, branches, tags, releases, project |
| `action` | string | list | Action: list, create, update, delete, status, trigger, search, stats |
| `id` | integer | none | Resource ID for update/delete operations |
| `--state` | string | all | Filter by state: opened, closed, merged, all |
| `--labels` | string | none | Comma-separated labels for filtering or assignment |
| `--assignee` | string | none | Filter by assignee (username or "me") |
| `--ref` | string | main | Git reference for pipeline operations |
| `--title` | string | none | Title for create operations |
| `--description` | string | none | Description/body for create operations |
| `--scope` | string | issues | Search scope: issues, mrs, milestones, notes |
| `--format` | string | text | Output format: text, json, table |
| `--limit` | integer | 20 | Maximum results per page |
| `--page` | integer | 1 | Page number for paginated results |
| `--all-pages` | flag | false | Fetch all pages automatically |

## Execution Flow

1. **Authentication**: The `GITLAB_TOKEN` environment variable is read and validated. The project ID is resolved from `GITLAB_PROJECT_ID` or detected from the git remote URL.

2. **Request Construction**: The requested domain and action are mapped to the appropriate API endpoint. Parameters are validated and formatted according to the GitLab API v4 specification.

3. **Rate Limit Check**: The client checks remaining rate limit quota before sending the request. If the quota is exhausted, the command waits for the reset window.

4. **HTTP Execution**: The request is sent with appropriate headers (authentication, content type, accept). The client supports retry with exponential backoff for transient failures (5xx errors, network timeouts).

5. **Response Parsing**: The JSON response is parsed and validated. Error responses are detected and translated into actionable error messages with GitLab documentation links.

6. **Pagination Handling**: For list operations, pagination headers are parsed. If `--all-pages` is specified, subsequent pages are fetched automatically and results are concatenated.

7. **Output Formatting**: Results are formatted according to the `--format` option. Text format provides human-readable tables, JSON format provides raw API responses, and table format provides aligned columnar output.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `gitlab-api-specialist` | Manages all GitLab API interactions |
| [/gitlab-auto-sync](/commands/gitlab-auto-sync/) | Automated sync | Uses API for automatic workflow synchronization |
| [/gitlab-ci](/commands/gitlab-ci/) | Pipeline management | API provides pipeline control capabilities |
| [/gitlab-enforce](/commands/gitlab-enforce/) | Compliance enforcement | API validates compliance requirements |
| [/cicd-unified](/commands/cicd-unified/) | CI/CD operations | API backend for pipeline operations |
| [Session Lifecycle](/glossary/session-discipline/) | Issue tracking | Mandatory session-to-issue correlation |
| [Telemetry](/glossary/telemetry/) | API [metrics](/glossary/metrics/) | Request timing and error rates |
| [AIAD Registry](/glossary/aiad/) | Command specification | API command configuration |

## Best Practices

**Use environment variables for configuration.** Store `GITLAB_TOKEN` and `GITLAB_PROJECT_ID` in your shell profile or `.env` file. Never hardcode tokens in scripts or command histories.

**Prefer specific queries over broad listings.** Use `--state`, `--labels`, and `--assignee` filters to reduce API calls and response sizes. Listing all issues across a large project is slower and harder to parse than targeted queries.

**Use JSON format for automation.** When integrating GitLab API output with other tools or scripts, use `--format=json` for reliable machine-readable output. Pipe through `jq` for field extraction.

**Create issues for every session.** The platform's mandatory session discipline protocol requires GitLab issue tracking. Use `/gitlab-api issues create` at the start of every development session to establish traceability.

**Monitor rate limits.** GitLab enforces rate limits on API requests. Use `--limit` to control page sizes and avoid excessive pagination. The command displays remaining quota in verbose mode.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `authentication_failed` | Invalid or expired `GITLAB_TOKEN` | Regenerate token in GitLab settings |
| `project_not_found` | Invalid `GITLAB_PROJECT_ID` or insufficient permissions | Verify project ID and token scopes |
| `rate_limit_exceeded` | API rate limit exhausted | Wait for reset (shown in error message) or reduce request frequency |
| `resource_not_found` | Referenced issue/MR/pipeline does not exist | Verify resource ID |
| `validation_error` | Required fields missing for create/update | Check required parameters for the operation |
| `network_timeout` | GitLab server unreachable | Check network connectivity and GitLab status |
| `permission_denied` | Token lacks required scope | Add necessary scopes to the personal access token |

## Advanced Usage

### Bulk Operations

Perform operations across multiple resources efficiently.

```bash
# Close all issues with a specific label
/gitlab-api issues list --labels="wont-fix" --format=json | \
  jq '.[].iid' | xargs -I {} /gitlab-api issues update {} --state=closed

# Add labels to all open issues in a milestone
/gitlab-api issues list --milestone="M47" --format=json | \
  jq '.[].iid' | xargs -I {} /gitlab-api issues update {} --labels="milestone-47"
```

### Webhook Configuration

Configure project webhooks for automated notifications.

```bash
/gitlab-api webhooks create --url="https://hooks.example.com/gitlab" \
  --events="push,merge_request,pipeline"
```

### CI/CD Variable Management

Manage CI/CD variables through the API.

```bash
# List CI/CD variables
/gitlab-api variables list

# Create a new variable
/gitlab-api variables create --key=DEPLOY_KEY --value="secret" --protected
```

### Milestone Strategic Analysis

Query milestones for strategic planning purposes.

```bash
# Get all milestones with issue counts
/gitlab-api milestones list --state=active --format=json | \
  jq '.[] | {title, due_date, open_issues: .open_issues_count, closed_issues: .closed_issues_count}'
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every API operation is validated, retried on transient failures, and fully logged for audit purposes.
- **NO DOUBTS**: Full investigation before action, evidence-based results. API responses are parsed and validated before presentation. Error conditions are detected and reported with actionable remediation guidance.

## Related Commands

- [/gitlab-auto-sync](/commands/gitlab-auto-sync/) - Automatic GitLab integration for all AIAD workflows
- [/gitlab-ci](/commands/gitlab-ci/) - [GitLab CI](/glossary/gitlab-ci/)/CD pipeline management and configuration
- [/gitlab-enforce](/commands/gitlab-enforce/) - GitLab enforcement for compliance and workflow standards
- [/cicd-unified](/commands/cicd-unified/) - Unified CI/CD workflow actions for pipeline management
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
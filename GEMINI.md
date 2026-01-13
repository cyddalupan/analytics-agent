# Project: Analytics Agent (Angular SPA)

This document provides an overview of the Analytics Agent project, an Angular Single Page Application (SPA) designed to interact with a simplified PHP backend for database queries and OpenAI API calls.

## High-Level Overview

This Git repository (`analytics-agent`) contains the following:
- **Angular Frontend (`./`)**: The root of this repository is the Angular application (`analytics-agent-app` contents).
- **Built Output (`./live/`)**: The compiled Angular application, ready for deployment.

A separate PHP backend, `dynamic_api/`, handles database and AI interactions externally and is not part of this repository.

## `dynamic_api/` Backend (External to this repository)

This backend is a simple collection of PHP files providing two API endpoints: `db.php` and `ai.php`. It resides outside this Git repository.
The Angular application interacts with this backend via the URL: `https://thegrandmidoriortigas.info/agent/api`.

### Security

Access to both API endpoints is secured by a simple token-based authentication. The Angular frontend must send a specific security token in the `X-Security-Token` HTTP header with every request.

**API Security Token:** `8F3L8Mj91AIoqSH6pXhMIfYGd2lCGg4t90QQjKoSV7byOvUCXU8m3J1s4TqxRtlY`

### `dynamic_api/config.php`

This file contains sensitive configuration details such as database credentials, the OpenAI API key, and the security token. It should **not** be committed to version control in a production environment.

**Example Content:**
```php
<?php
// dynamic_api/config.php

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'your_db_name');

// OpenAI API Key
define('OPENAI_API_KEY', 'YOUR_OPENAI_API_KEY_HERE'); // Generic placeholder
// IMPORTANT: Replace 'YOUR_OPENAI_API_KEY_HERE' with your actual OpenAI API key.

// Security Token for API access
define('API_SECURITY_TOKEN', '8F3L8Mj91AIoqSH6pXhMIfYGd2lCGg4t90QQjKoSV7byOvUCXU8m3J1s4TqxRtlY');

// Allow Cross-Origin Resource Sharing (CORS) for development.
// IMPORTANT: Restrict to specific origins in production for security.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Security-Token");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
```

### `dynamic_api/db.php`

This endpoint handles secure `SELECT` queries to the database. It enforces that only `SELECT` queries are executed and uses prepared statements to prevent SQL injection.

**Request Format (JSON):**
```json
{
    "query": "SELECT * FROM applicant WHERE applicantNumber = ?",
    "params": ["12345"]
}
```
**Headers:** `X-Security-Token: 8F3L8Mj91AIoqSH6pXhMIfYGd2lCGg4t90QQjKoSV7byOvUCXU8m3J1s4TqxRtlY`

**Sample Query (for testing):**
`Table: applicant`, `Columns: applicantNumber, sub_employer, applicant_first, applicant_middle, applicant_last`

### `dynamic_api/ai.php`

This endpoint acts as a proxy to the OpenAI API, allowing the Angular frontend to make AI calls.

**Request Format (JSON):**
```json
{
    "system_prompt": "You are a helpful assistant.",
    "history": [
        {"role": "user", "content": "Hello!"},
        {"role": "assistant", "content": "Hi there!"}
    ],
    "last_message": "Tell me a joke."
}
```
**Headers:** `X-Security-Token: 8F3L8Mj91AIoqSH6pXhMIfYGd2lCGg4t90QQjKoSV7byOvUCXU8m3J1s4TqxRtlY`

## Angular Frontend (Current Repository)

The frontend is an Angular application responsible for all business logic, UI rendering, and interaction with the external `dynamic_api` backend.

### Core Components

- **`ApiService` (`src/app/api.ts`)**: This service is responsible for all HTTP communication with the `dynamic_api` backend. It automatically adds the `X-Security-Token` header to all requests.
- **`HomeComponent` (`src/app/home/home.ts`)**: A basic component demonstrating calls to both `db.php` (fetching applicant data) and `ai.php` (getting an AI response).
- **`app.config.ts`**: Configured to provide `HttpClient` for the application.

### Development Guidelines

- **Strict Typing**: Strict TypeScript checking is enforced. All contributions must adhere to this policy, avoiding the use of `any` and defining explicit types.
- **No Unit Tests**: For now, unit tests are not a requirement. Testing will be performed manually.
- **SCHEMA.md**: A `SCHEMA.md` file will be created later to document the database schema.

### Troubleshooting UI Updates (Angular)

**Problem**: API calls return data successfully, but the Angular UI (template) does not update to reflect the new data, remaining stuck in a loading state.

**Common Causes & Resolution**:
Angular's change detection system usually handles UI updates automatically, especially for asynchronous operations like HTTP requests. However, issues can arise due to:
1.  **Change Detection Context**: In rare or specific scenarios, the change detection might not be triggered.
2.  **Data Assignment Timing**: Rapid state changes or incorrect data flow can lead to the UI not re-rendering at the opportune moment.
3.  **Component State Management**: If component properties are not correctly initialized or cleared, they might hold stale data.

**Debugging & Solution Approach**:
*   **Explicit State Management**: Ensure that loading flags (`loadingDb`, `loadingAi`) are correctly set to `true` before a fetch and `false` after success or error. Also, explicitly clear previous data (`dbResponse = null`, `aiResponse = null`) before initiating new requests.
*   **Manual Change Detection (`ChangeDetectorRef`)**: If automatic change detection fails, `ChangeDetectorRef` can be injected into the component, and `this.cdr.detectChanges()` can be called after significant state updates (e.g., after `dbResponse` is assigned) to force a UI refresh.
*   **Console Logging**: Extensive `console.log()` statements (e.g., logging loading states, received data, and error messages) are invaluable for tracing the execution flow and confirming variable values at different stages of the component lifecycle.

**Resolution in `HomeComponent`**:
The issue was resolved by:
*   Initializing `dbResponse` and `aiResponse` to `null`.
*   Explicitly setting `dbResponse = null` and `aiResponse = null` before each API call to ensure a clean state.
*   Injecting `ChangeDetectorRef` and calling `this.cdr.detectChanges()` after data assignment and error handling to ensure UI updates are triggered reliably.

## Deployment

The Angular application is built into the `./live/` directory within this repository. This `live/` directory's contents are what should be deployed to a web server.

### `build_and_stage.sh`

This script automates the build, staging, commit, and push process for the Angular application. It should be run from the root of this repository.

```bash
#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Building Angular application ---"
npm run build

echo "--- Staging all changes ---"
git add .

echo "--- Committing changes ---"
git commit -m "feat: Automated build and stage for Angular application changes"

echo "--- Pushing changes to remote ---"
git push origin main

echo "--- Build, staging, commit, and push complete. ---"
```

**How to deploy:**
1.  After making changes to the Angular code, run `./build_and_stage.sh` from the root of this repository.
2.  The script will build the Angular app into `./live/`, commit the changes (including the new build), and push them to `origin main`.
3.  On the server, clone this repository (or trigger `gitpull.php`), and then ensure your web server points to the `./live/` directory.

### Troubleshooting Deployment Paths

During deployment, it's critical that the Angular `base-href` and the web server's `RewriteBase` (for Apache's `.htaccess`) precisely match the actual URL path where the application's `live/` content is served. Mismatches lead to `404 Not Found` errors for assets like `styles-*.css` and `main-*.js`.

**Scenario:** Initial errors showed assets missing when the application was expected at `/analytics-agent/`, but the server was configured for `/agent/analytics/live/`.

**Resolution:**
1.  **Update `package.json`**: The `build` script's `base-href` was updated to `ng build --base-href /agent/analytics/live/`.
2.  **Update `.htaccess`**: The `RewriteBase` directive in `./live/.htaccess` was updated to `RewriteBase /agent/analytics/live/`.

This ensures that Angular generates asset paths correctly and the web server knows how to map those paths to the `index.html` for client-side routing. Always verify these paths when the deployment URL changes.

### `gitpull.php`

This PHP script, located in the root of this repository, allows for server-side pulling of the latest code from the Git repository.

```php
<?php
// gitpull.php - Pulls latest changes from the Git repository (for analytics-agent repo)

// You might want to secure this endpoint with some authentication in a real application.

// Set the path to your repository
$repositoryPath = __DIR__;

// Execute the git pull command
// Using `2>&1` to redirect stderr to stdout so we can capture all output
$command = "cd " . escapeshellarg($repositoryPath) . " && git pull 2>&1";

$output = shell_exec($command);

// Set header for plain text output for easier debugging
header('Content-Type: text/plain');

echo "Git Pull Output:\n";
echo $output;

// You might want to log the output or send a notification in a real application
?>
```
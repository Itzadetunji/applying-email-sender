# Email Sender Server

This is a backend server built with Express, Bun, and Node.js for sending automated emails using Nodemailer and Gmail SMTP. It also logs sent emails to an SQLite database.

## Features

- **Send Emails**: Send emails to a list of recipients one by one.
- **Dynamic Templates**: Supports different email types with dynamic content (name, company).
- **Logging**: Logs email sending status (success/failure) to an SQLite database.
- **Request Logging**: Uses `morgan` for HTTP request logging.
- **CORS Support**: Enabled for cross-origin requests.

## Prerequisites

- [Bun](https://bun.sh/) (v1.0 or later)
- Node.js (compatible with Bun)

## Installation

1.  Navigate to the server directory:

    ```bash
    cd server
    ```

2.  Install dependencies:

    ```bash
    bun install
    ```

## Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-google-app-password
```

- `PORT`: The port the server will run on (default: 3000).
- `EMAIL_USER`: Your Gmail address.
- `EMAIL_PASS`: Your Google App Password (not your regular password).

## Running the Server

To start the server:

```bash
bun run index.ts
```

The server will start on `http://localhost:3000`.

## API Endpoints

### 1. Check Server Status

- **URL**: `/`
- **Method**: `GET`
- **Response**:
  ```json
  {
  	"status": "Server is running"
  }
  ```

### 2. Send Email

- **URL**: `/send-email`
- **Method**: `POST`
- **Body**:

  ```json
  {
  	"name": "Recipient Name",
  	"emails": ["email1@example.com", "email2@example.com"],
  	"company": "Company Name",
  	"type": "opportunity_saw"
  }
  ```

  - `name`: Name of the recipient (used in the greeting).
  - `emails`: Array of email addresses to send to.
  - `company`: Name of the company.
  - `type`: Type of email message. Valid values:
    - `opportunity_saw`
    - `love_their_work`
    - `ways_to_add_to_team`

- **Response**:

  ```json
  {
  	"message": "Email processing complete",
  	"results": [
  		{
  			"email": "email1@example.com",
  			"status": "sent",
  			"messageId": "<...>"
  		},
  		{
  			"email": "email2@example.com",
  			"status": "failed",
  			"error": "Error message"
  		}
  	]
  }
  ```

## Database

The server uses an SQLite database (`emails.db`) to store logs.

### Table: `sent_emails`

| Column            | Type     | Description                               |
| ----------------- | -------- | ----------------------------------------- |
| `id`              | INTEGER  | Primary Key, Auto-increment               |
| `recipient_email` | TEXT     | Email address of the recipient            |
| `recipient_name`  | TEXT     | Name of the recipient                     |
| `company`         | TEXT     | Company name                              |
| `email_type`      | TEXT     | Type of email sent                        |
| `sent_at`         | DATETIME | Timestamp of when the email was processed |
| `status`          | TEXT     | Status of the email (`SENT` or `FAILED`)  |
| `error_message`   | TEXT     | Error message if the email failed to send |

## License

[MIT](LICENSE)

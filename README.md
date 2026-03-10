# 22yard Backend

This is a Node.js backend used to check **Shopify Gift Card balance and expiry** for the 22Yard website.

## Tech Stack

* Node.js
* Express.js
* Shopify Admin API
* Axios
* Dotenv
* CORS

## Project Structure

```
project
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Installation

Clone the repository:

```
git clone https://github.com/codewithragul/22yard-backend.git
```

Go to the project folder:

```
cd 22yard-backend
```

Install dependencies:

```
npm install
```

## Environment Variables

Create a `.env` file in the root folder.

Example:

```
SHOPIFY_STORE=your-store-name.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_admin_api_token
PORT=3000
```

⚠️ Never commit `.env` to GitHub.

## Run the Server

```
npm start
```

Server will run at:

```
http://localhost:3000
```

## API Endpoint

### Check Gift Card Balance

```
POST /check-balance
```

Example request body:

```
{
  "code": "GIFT-CARD-CODE"
}
```

Example response:

```
{
  "success": true,
  "balance": "100.00",
  "currency": "USD",
  "expires_on": "2026-12-31"
}
```

## Security Notes

* `.env` is ignored using `.gitignore`
* Shopify access tokens are stored securely
* Do not expose API keys in the frontend

## License

ISC

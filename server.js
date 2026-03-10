require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(express.json());

/* CORS for Shopify storefront */
app.use(cors({
  origin: [
    "https://twenty2yard.myshopify.com",
    "https://two2yard-backend.onrender.com"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

const SHOP = process.env.SHOP;
const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 3000;

/* Debug logs */
console.log("ENV CHECK");
console.log("SHOP =", SHOP);
console.log("TOKEN exists =", !!TOKEN);

/* Stop server if env missing */
if (!SHOP || !TOKEN) {
  console.error("❌ Missing SHOP or TOKEN environment variables");
  process.exit(1);
}

/* Health check */
app.get("/", (req, res) => {
  res.send("Gift Card API running 🚀");
});

/* Gift card balance endpoint */
app.post("/check-balance", async (req, res) => {

  try {

    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Gift card code is required"
      });
    }

    const last4 = code.slice(-4).toLowerCase();

    console.log("Checking gift card ending with:", last4);

    const response = await axios.get(
      `https://${SHOP}/admin/api/2024-01/gift_cards/search.json`,
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json"
        },
        params: {
          query: `last_characters:${last4}`
        }
      }
    );

    const giftCards = response.data.gift_cards || [];
    const matchedCard = giftCards[0];

    if (!matchedCard) {
      return res.status(404).json({
        success: false,
        message: "Invalid gift card"
      });
    }

    /* Check disabled card */
    if (matchedCard.disabled_at) {

      const disabledDate = new Date(matchedCard.disabled_at);

      return res.json({
        success: false,
        message: `This gift card was disabled on ${disabledDate.toLocaleDateString()}`
      });

    }

    /* Check expiry */
    if (matchedCard.expires_on) {

      const expiryDate = new Date(matchedCard.expires_on);

      if (expiryDate < new Date()) {

        return res.json({
          success: false,
          message: `Your gift card expired on ${expiryDate.toLocaleDateString()}`
        });

      }

    }

    /* Active card */
    let expiry = null;

    if (matchedCard.expires_on) {

      const expiryDate = new Date(matchedCard.expires_on);

      expiry = expiryDate.toLocaleDateString();

    }

    return res.json({
      success: true,
      balance: matchedCard.balance,
      currency: matchedCard.currency,
      expiry: expiry
    });

  } catch (error) {

    console.error(
      "Shopify API error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to check gift card balance"
    });

  }

});

/* Start server */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
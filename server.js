require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const SHOP = process.env.SHOP;
const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 3000;

app.post("/check-balance", async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Gift card code is required"
      });
    }

    const last4 = code.slice(-4).toLowerCase();

    const response = await axios.get(
      `https://${SHOP}/admin/api/2024-01/gift_cards.json`,
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    const giftCards = response.data.gift_cards;

    const matchedCard = giftCards.find(
      (card) => card.last_characters?.toLowerCase() === last4
    );

    if (!matchedCard) {
      return res.status(404).json({
        success: false,
        error: "Invalid gift card"
      });
    }

    // 🔴 Check if card is deactivated
    if (matchedCard.disabled_at) {
      const disabledDate = new Date(matchedCard.disabled_at);

      return res.json({
        success: false,
        message: `This gift card was Expiry on ${disabledDate.toLocaleString()}`
      });
    }

    // 🟠 Check expiry
    if (matchedCard.expires_on) {
      const expiryDate = new Date(matchedCard.expires_on);
      const now = new Date();

      if (expiryDate < now) {
        return res.json({
          success: false,
          message: `Your gift card expired on ${expiryDate.toLocaleString()}`
        });
      }
    }

    // 🟢 Active card
    return res.json({
      success: true,
      balance: matchedCard.balance,
      currency: matchedCard.currency,
      message: `Active gift card. Balance: ${matchedCard.balance} ${matchedCard.currency}`
    });

  } catch (error) {
    console.log("FULL ERROR:");
    console.log(error.response?.data);
    console.log(error.message);

    return res.status(500).json({
      success: false,
      error: "Server error while checking gift card balance"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
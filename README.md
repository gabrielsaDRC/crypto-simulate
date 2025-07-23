# Binance Futures Trading Application

A comprehensive web application for trading on Binance Futures with real-time market data, order management, and portfolio tracking.

## 🚀 Live Demo

Visit the live application: [https://yourusername.github.io/binance-futures-trading-app/](https://yourusername.github.io/binance-futures-trading-app/)

> **Note**: Replace `yourusername` with your actual GitHub username after deployment.

## Features

### 🔐 Secure Authentication
- API Key and Secret authentication
- Testnet/Mainnet environment switching
- Secure backend proxy for API credentials

### 📊 Real-time Dashboard
- Live portfolio balance and P&L tracking
- Active positions monitoring
- Open orders management
- Real-time market data updates

### 📈 Trading Interface
- Market and Limit order placement
- Popular trading pairs (BTC, ETH, ADA, DOGE, SOL)
- Live order book visualization
- Buy/Long and Sell/Short operations

### 📋 Order Management
- Complete order history
- Order status tracking
- Position monitoring with leverage
- Real-time updates

## Security Features

- ✅ API keys never stored in browser
- ✅ HTTPS-only credential transmission
- ✅ Backend API proxy for security
- ✅ HMAC SHA256 signatures for all requests
- ✅ Environment separation (testnet/production)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Binance account with Futures API access
- API Key and Secret from Binance

### Setup Instructions

1. **Get Binance API Credentials**
   - Log in to [Binance](https://binance.com)
   - Go to API Management
   - Create new API Key with Futures trading permissions
   - Copy your API Key and Secret Key

2. **For Testing (Recommended)**
   - Create testnet account at [Binance Futures Testnet](https://testnet.binancefuture.com)
   - Generate testnet API credentials
   - Use testnet environment in the application

3. **Start the Application**
   ```bash
   npm run dev
   ```
   This starts both the frontend and backend servers.

### Deployment to GitHub Pages

1. **Build and Deploy**
   ```bash
   npm run deploy
   ```
   This will build the application and deploy it to GitHub Pages.

2. **Automatic Deployment**
   - The application is configured with GitHub Actions for automatic deployment
   - Every push to the `main` branch will trigger a new deployment
   - The site will be available at `https://yourusername.github.io/binance-futures-trading-app/`

4. **Login**
   - Enter your API Key and Secret Key
   - Select Testnet or Production environment
   - Click "Connect to Binance"

## API Permissions Required

Your Binance API key must have the following permissions:
- ✅ Enable Futures
- ✅ Enable Reading
- ✅ Enable Spot & Margin Trading (for Futures)
- ❌ Enable Withdrawals (NOT recommended)

## Environment Configuration

The application supports both testnet and production environments:

- **Testnet**: Safe for testing with virtual funds
- **Production**: Real trading with actual funds

⚠️ **Always test thoroughly on testnet before using production!**

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- TanStack Query for data fetching
- Lucide React for icons

### Backend
- Node.js with Express
- CORS enabled for frontend communication
- Crypto module for HMAC signatures
- Axios for Binance API communication

## API Endpoints

The backend proxy provides these endpoints:
- `GET /api/account` - Account information
- `GET /api/openOrders` - Open orders
- `GET /api/allOrders` - Order history
- `POST /api/order` - Create new order
- `DELETE /api/order` - Cancel order
- `GET /api/depth` - Order book data
- `GET /api/ticker/price` - Current prices

## Disclaimer

⚠️ **IMPORTANT DISCLAIMERS**

- This is educational software for learning purposes
- Trading cryptocurrencies involves substantial risk
- Past performance does not guarantee future results
- Only trade with funds you can afford to lose
- Always test on testnet before live trading
- The developers are not responsible for any trading losses

## Security Best Practices

1. **Never share your API credentials**
2. **Use IP restrictions on your API keys**
3. **Regularly monitor your account activity**
4. **Use minimal required permissions**
5. **Keep your secret key secure and private**

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your API credentials and permissions
3. Ensure you're using the correct environment (testnet/production)
4. Check Binance API status

---

**Remember: This software is for educational purposes. Trade responsibly!**
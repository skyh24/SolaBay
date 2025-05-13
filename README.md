# SolaBay - Solana Marketplace

SolaBay is a decentralized marketplace built on the Solana blockchain, designed for trading limited edition digital goods. The platform offers a seamless user experience with integrated wallet functionality, product management, and transaction tracking.

## Project Overview

SolaBay combines modern web technologies with blockchain capabilities to create a responsive, user-friendly marketplace. The application features:

- **Responsive UI**: Mobile-first design with a phone frame layout
- **Wallet Integration**: Connect with Phantom wallet for Solana transactions
- **Product Management**: Create, list, and manage digital products
- **User Accounts**: Track purchases, sales, and manage profile information
- **Transaction History**: View past transactions and their statuses

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Solana (Web3.js)
- **Wallet**: Phantom Wallet integration
- **Styling**: Tailwind CSS, Remix Icon
- **Routing**: React Router

## Project Structure

```
solabay/
├── frontend/                 # Frontend application
│   ├── client/               # React client application
│   │   ├── public/           # Public assets
│   │   └── src/              # Source code
│   │       ├── assets/       # Static assets
│   │       ├── context/      # React context providers
│   │       ├── pages/        # Page components
│   │       │   ├── index.tsx             # Homepage
│   │       │   ├── product-list.tsx      # Product listing page
│   │       │   ├── product-details.tsx   # Product details page
│   │       │   ├── add-product.tsx       # Add/edit product page
│   │       │   └── my-account.tsx        # User account management
│   │       ├── App.tsx       # Main application component
│   │       └── main.tsx      # Application entry point
├── programs/                 # Solana programs (smart contracts)
├── tests/                    # Test files
├── Anchor.toml               # Anchor configuration
└── Cargo.toml                # Rust package configuration
```

## Key Features

### Homepage
The homepage provides quick access to the main sections of the application:
- Product Market: Browse and purchase products
- My Account: Manage profile and view transaction history
- Merchant Management: Create and manage products

### Product Listing
- Browse all available products
- View product prices and availability
- Filter and search functionality
- Quick access to product details

### Product Details
- Comprehensive product information
- Price history and trends
- Purchase functionality with wallet integration
- Stock availability indicators

### Add Product
- Form for creating new products
- Image upload capability
- Product management interface
- Local storage integration for product data

### My Account
- User profile management
- Transaction history with status indicators
- Wallet integration with balance display
- Account settings

## Wallet Integration

SolaBay integrates with Phantom wallet to enable Solana transactions:
- Connect wallet functionality
- View SOL balance
- Execute purchases on the Solana devnet
- Track transaction history

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Phantom wallet browser extension

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/solabay.git
cd solabay
```

2. Install dependencies:
```bash
# Install root dependencies
yarn install

# Install frontend client dependencies
cd frontend/client
yarn install
```

3. Start the development server:
```bash
cd frontend/client
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Development

The application uses Vite for fast development and building. Key commands:

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

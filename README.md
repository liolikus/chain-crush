
# Chain Crush ⛓️⛓️⛓️

A blockchain-powered Candy Crush styled game built with React and Linera protocol technology.

## Features

- 🎮 Classic match-3 gameplay
- ⛓️ Integration with Linera
- 🎉 Score-to-token conversion
- 🏆 Decentralized leaderboard
- 💾 Offline mode fallback

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Linera CLI (for blockchain features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/liolikus/chain-crush.git
cd chain-crush
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Blockchain Integration

This game integrates with the Linera protocol to:
- Convert game scores to tokens
- Maintain a decentralized leaderboard
- Provide verifiable game sessions

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_LINERA_FAUCET=https://faucet.testnet-babbage.linera.net
REACT_APP_APPLICATION_ID=your_application_id_here
```

## Game Rules

- Match 3 or more chains in a row or column
- Score points for each match (3 chains = 3 points, 4 chains = 4 points)
- 60-second time limit
- Scores are converted to tokens when connected

## Technology Stack

- **Frontend**: React 17, JavaScript ES6+
- **Blockchain**: Linera Protocol
- **Smart Contract**: Rust (Fungible Token)
- **Styling**: CSS3 with animations
- **Build Tool**: Create React App

## Project Structure

```
chain-crush/
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Linera services
│   ├── images/             # Game assets
│   └── App.js              # Main application
├── contract/               # Linera smart contract
│   ├── src/               # Rust contract code
└── public/                # Static assets
```


## Acknowledgments

- Original Candy Crush concept
- Linera Protocol team
- @kubowania

---

**Play Chain Crush and earn tokens while having fun!** 🎮🎉





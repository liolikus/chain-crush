
# Chain Crush ⛓️⛓️⛓️

A blockchain-powered Candy Crush styled game built with React and Linera protocol technology.

## Features

- 🎮 Classic match-3 gameplay
- ⛓️ Integration with Linera
- 🎉 Score-to-token conversion
- 🏆 Decentralized leaderboard
- 💾 Offline mode fallback

## Blockchain Integration

This game integrates with the Linera protocol to:
- Convert game scores to tokens
- Maintain a decentralized leaderboard
- Provide verifiable game sessions

## Game Rules

- Match 3 or more chains in a row or column
- Score points for each match (3 chains = 3 points, 4 chains = 4 points)
- 60-second time limit
- Scores are converted to tokens when connected

## TO DO

### 🔐 Authentication & User Management
- [ ] **User Authentication System**
  - [ ] Login with wallet connection
  - [ ] Discord OAuth integration
  - [ ] User preferences and settings

### 🎨 UI/UX Improvements
- [ ] **Smooth Animations**
  - [ ] Falling animations
  - [ ] Match explosion effects
  - [ ] Score popup animations
  - [ ] Smooth transitions between game states
  - [ ] Particle effects for special matches

### 🏆 Leaderboard & Competition
- [ ] **Advanced Leaderboard System**
  - [ ] Separate smart contract for leaderboard management
  - [ ] Multiple leaderboard categories (daily, weekly, all-time)
  - [ ] Player ranking system with tiers
  - [ ] Historical performance tracking
  - [ ] Seasonal competitions with rewards

### ⛓️ Special Game Mechanics
- [ ] **Special Chains & Power-ups**
  - [ ] Lightning chains (clear entire row/column)
  - [ ] Bomb chains (clear surrounding area)
  - [ ] Rainbow chains (match any color)
  - [ ] Multiplier chains (2x, 3x score bonuses)
  - [ ] Time freeze power-ups
  - [ ] Chain shuffle abilities

### 🎮 Game Modes
- [ ] **Multiple Game Modes**
  - [ ] **Free Mode**: Unlimited time, practice mode
  - [ ] **Fast Mode**: 30-second quick games
  - [ ] **Endurance Mode**: Progressively harder levels
  - [ ] **Puzzle Mode**: Specific objectives to complete
  - [ ] **Daily Challenge**: Special objectives with bonus rewards

### 👥 Multiplayer Features
- [ ] **Multiplayer Modes**
  - [ ] **Turn-based Mode**: Players take turns, highest score wins
  - [ ] **Parallel Playing**: Real-time simultaneous gameplay
  - [ ] **Tournament Mode**: Bracket-style competitions

### 🏅 Achievement System
- [ ] **On-chain Achievements**
  - [ ] Smart contract for achievement tracking
  - [ ] NFT badges for major milestones
  - [ ] Achievement categories:
    - [ ] Score-based achievements (reach X points)
    - [ ] Combo achievements (X matches in a row)
    - [ ] Speed achievements (complete game in X seconds)
    - [ ] Consistency achievements (play X days in a row)
    - [ ] Special move achievements (use power-ups X times)
    - [ ] Social achievements (invite friends, win tournaments)

### 🔧 Technical Improvements
- [ ] **Performance & Scalability**
  - [ ] Game state optimization
  - [ ] Blockchain transaction batching
  - [ ] Offline game state synchronization
  - [ ] Progressive Web App (PWA) features

### 🎵 Audio & Visual Enhancements
- [ ] **Sound Design**
  - [ ] Match sound effects
  - [ ] Background music
  - [ ] Power-up activation sounds
  - [ ] Victory/defeat audio feedback

### 📊 Analytics & Insights
- [ ] **Player Analytics**
  - [ ] Game performance metrics
  - [ ] Player behavior tracking
  - [ ] Blockchain transaction analytics
  - [ ] Leaderboard statistics dashboard

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


### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_LINERA_FAUCET=https://faucet.testnet-babbage.linera.net
REACT_APP_APPLICATION_ID=your_application_id_here
```

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





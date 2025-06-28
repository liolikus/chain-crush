# Chain Crush ⛓️⛓️⛓️

A blockchain-powered Candy Crush-style game built with React and Linera Protocol.

## Features

- **🎮 Classic Match-3 Gameplay**: Drag and drop to create matches
- **⛓️ Blockchain Integration**: Scores are converted to test-tokens on Linera Microchains
- **🏆 Real-time Leaderboard**: Compete with other players
- **👤 User Authentication**: Simple login system with persistent sessions
- **📱 Responsive Design**: Works on desktop and mobile devices
- **💾 Offline Mode**: Play even when blockchain is unavailable
- **🔧 Admin Panel**: Administrative controls for game management

## Blockchain Integration

This game integrates with the Linera protocol to:
- Convert game scores to testnet tokens
- Provide verifiable game sessions

## Game Rules

- Match 3 or more chains in a row or column
- Score points for each match (3 chains = 3 points, 4 chains = 4 points)
- 60-second time limit
- Scores are converted to tokens when connected

## TO DO

### 🔐 Authentication & User Management
- [x] **User Authentication System**
  - [x] Login with username
  - [ ] Discord OAuth integration
  - [ ] User preferences and settings
  - [x] Secure password hashing
  - [x] Session management with 24-hour timeout
  - [x] Persistent login state

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
  - [x] Historical performance tracking
  - [ ] Seasonal competitions with rewards
  - [x] Tournament system with admin controls
  - [x] Tournament timers and countdowns
  - [x] Tournament leaderboards (top 25 results)
  - [x] Tournament status management with grace periods

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
- [x] **Performance & Scalability**
  - [x] Game state optimization
  - [x] Blockchain transaction batching
  - [x] Offline game state synchronization
  - [ ] Progressive Web App (PWA) features

### 🎵 Audio & Visual Enhancements
- [x] **Sound Design**
  - [ ] Match sound effects
  - [x] Background music (Jay Someday - Strawberry.mp3)
  - [ ] Power-up activation sounds
  - [ ] Victory/defeat audio feedback
  - [x] Music controls with mute button
  - [x] Audio autoplay handling for browser compatibility

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
│   │   ├── GameBoard.js     # Game board component
│   │   ├── GameControls.js  # Game control buttons
│   │   ├── LoginModal.js    # User authentication
│   │   ├── UserBar.js       # User information display
│   │   ├── Leaderboard.js   # Score leaderboard
│   │   ├── BlockchainInfo.js # Blockchain status
│   │   └── LoadingScreen.js # Loading screen
│   ├── hooks/               # Custom React hooks
│   │   ├── useLinera.js     # Blockchain integration
│   │   ├── useAuth.js       # Authentication logic
│   │   ├── useGameLogic.js  # Game mechanics
│   │   └── useGameTimer.js  # Timer functionality
│   ├── utils/               # Utility functions
│   │   ├── authUtils.js     # Authentication helpers
│   │   ├── adminUtils.js    # Admin functionality
│   │   └── leaderboardUtils.js # Leaderboard management
│   ├── services/            # External services
│   │   └── lineraService.js # Linera blockchain service
│   ├── constants/           # Game configuration
│   │   └── gameConstants.js # Game settings and constants
│   ├── images/              # Game assets
│   └── App.js               # Main application
├── contract/                # Linera smart contract (Rust)
│   ├── src/                 # Contract source code
│   └── Cargo.toml           # Rust dependencies
└── public/                  # Static assets
```

## Acknowledgments

- Original Candy Crush concept
- Linera Protocol team
- @kubowania

---

**🎮 Start playing Chain Crush and earn tokens while having fun! 🎉**

*Built with ❤️ using React and Linera Protocol*





# Scheduler Service

> A robust microservice for managing and scheduling AI trading agents with real-time MongoDB synchronization.

**Creator:** Goutam Sharma ([GitHub](https://github.com/Goutam-11))

## Overview

The Scheduler Service is a core component of the MongoDB trading system that orchestrates the execution of AI-powered trading agents. It continuously monitors agent states, manages job queues, and ensures agents execute their trading strategies at optimal intervals.

## Key Features

- **Real-Time Change Monitoring**: Watches MongoDB collections for agent updates using change streams
- **Job Queue Management**: Integrates BullMQ for reliable asynchronous job processing
- **In-Memory State Management**: Maintains efficient agent state caching for performance
- **Agent Lifecycle Management**: Handles agent creation, updates, and deletion
- **Multi-Exchange Support**: Supports trading across multiple exchanges via CCXT
- **AI-Powered Strategies**: Integrates with OpenAI and OpenRouter for intelligent trading decisions

## Architecture

### Core Components

1. **Watchers** (`src/watchers/`)
   - Monitors MongoDB Agent collection for changes
   - Syncs database state with in-memory agent state
   - Handles insert, update, and delete operations

2. **Schedulers** (`src/schedulers/`)
   - Runs on configurable tick intervals
   - Checks if agents are ready for execution
   - Queues jobs when `nextRunAt` timestamp is reached

3. **Queue** (`src/queue/`)
   - BullMQ-based job queue system
   - Manages agent execution jobs
   - Prevents duplicate job submissions

4. **State** (`src/state/`)
   - In-memory cache of active agents
   - Fast agent lookup during scheduling cycles
   - Synchronized with MongoDB via watchers

5. **Workers** (`src/workers/`)
   - Processes queued agent jobs
   - Executes trading strategies
   - Handles credential and exchange connections

6. **Agent Functions** (`src/agentFunctions/`)
   - Business logic for agent operations
   - Strategy execution and market analysis

## Technology Stack

- **Runtime**: [Bun](https://bun.com) - Fast all-in-one JavaScript runtime
- **Database**: MongoDB 7.0+
- **Job Queue**: BullMQ 5.66+
- **Exchange Integration**: CCXT 4.5+
- **AI Models**: OpenAI, OpenRouter
- **Language**: TypeScript 5+

## Installation

```bash
bun install
```

## Running the Service

```bash
bun run index.ts
```

### Docker

Build and run with Docker Compose:

```bash
docker-compose up --build
```

## Configuration

Configuration is managed in `src/config/config.ts`. Key settings include:

- `TICK_MS`: Scheduler check interval (default: 1000ms)
- Database connection parameters
- Exchange and AI model credentials

## How It Works

1. **Startup**: 
   - Connects to MongoDB
   - Fetches all agents with `RUNNING` status
   - Bootstraps agents into memory state

2. **Monitoring**:
   - Change stream watches Agent collection
   - Updates in-memory state when agents change
   - Removes agents from state when deleted

3. **Scheduling**:
   - Scheduler runs at regular intervals
   - Checks each agent's `nextRunAt` timestamp
   - Queues agent job if ready to execute
   - Updates `nextRunAt` for next execution cycle

4. **Execution**:
   - Workers process queued jobs
   - Execute agent strategies
   - Fetch market data and make trades
   - Update agent performance metrics

## Project Structure

```
schedulerService/
├── src/
│   ├── agent/              # Agent management logic
│   ├── agentFunctions/     # Agent operation functions
│   ├── algorithmFunctions/ # Trading algorithms
│   ├── cache/              # Caching utilities
│   ├── config/             # Configuration settings
│   ├── db/                 # Database connection
│   ├── queue/              # BullMQ queue setup
│   ├── schedulers/         # Scheduling logic
│   ├── state/              # Agent state management
│   ├── watchers/           # MongoDB watchers
│   ├── workers/            # Job workers
│   └── tests/              # Unit tests
├── index.ts                # Application entry point
├── package.json            # Dependencies
├── Dockerfile              # Docker configuration
└── tsconfig.json          # TypeScript configuration
```

## Environment Variables

Create a `.env` file with:

```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=trading_db
OPENAI_API_KEY=your_api_key
OPENROUTER_API_KEY=your_api_key
```

## Development

- All code is written in TypeScript
- Uses strict type checking
- Follows async/await patterns
- Implements error handling for production reliability

## License

Created by Goutam Sharma
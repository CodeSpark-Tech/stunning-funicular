# 🛡️ Project Sentinel - Modern Phishing Simulation Platform

<div align="center">

![Project Sentinel](https://img.shields.io/badge/Project-Sentinel-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)

A complete, production-ready phishing simulation platform with modern UI/UX, real-time analytics, and AI-powered campaign generation.

</div>

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Phishing Templates** - Generates realistic, personalized phishing emails
- **Multi-Channel Campaigns** - Email, SMS, and collaboration tool simulations
- **Real-Time Analytics** - Live WebSocket updates for campaign performance
- **Risk Scoring** - Dynamic user risk assessment based on behavior
- **Automated Scheduling** - One-time, scheduled, and recurring campaigns

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Beautiful, modern interface with blur effects
- **Onboarding Tutorial** - First-time user guided tour
- **Dark Mode** - Eye-friendly dark theme by default
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Micro-Interactions** - Smooth animations and transitions

### 📊 Analytics & Reporting
- **Live Dashboard** - Real-time campaign statistics
- **User Risk Matrix** - Visual representation of organizational risk
- **Click Heat Maps** - Time-based click analysis
- **Department Analytics** - Risk breakdown by department
- **Training Progress** - Track user education completion

## 🚀 Quick Start (2 Minutes)

### Prerequisites
- Docker & Docker Compose installed
- 4GB RAM minimum
- Ports 3001, 8001, 5433, 6380 available

### One-Command Setup

```bash
# Make setup script executable
chmod +x setup.sh

# Run the complete setup
./setup.sh
```

That's it! The platform will be running at:
- 🌐 **Dashboard**: http://localhost:3001
- 📚 **API Docs**: http://localhost:8001/docs

## 📱 First Time Usage

1. **Onboarding**: First-time visitors see a 4-step interactive tutorial
2. **Dashboard**: View pre-loaded sample campaigns and statistics
3. **Create Campaign**: Click the floating "+" button to create your first campaign
4. **Launch Campaign**: Use the "Launch" button on scheduled campaigns
5. **Simulate Clicks**: Test the system with "Simulate Click" button
6. **View Analytics**: Real-time updates show campaign performance

## 🏗️ Architecture

```
project_sentinel/
├── frontend/          # Next.js 14 + TypeScript + Tailwind
├── backend/           # FastAPI + SQLAlchemy + WebSocket
├── worker/            # Celery + Redis for async tasks
├── docker-compose.yml # Container orchestration
└── setup.sh          # One-click setup script
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- WebSocket Client

**Backend:**
- FastAPI
- PostgreSQL
- Redis
- SQLAlchemy ORM
- WebSocket Server
- Celery

## 📖 User Guide

### Creating a Campaign

1. Click the **"+"** floating action button
2. **Step 1**: Enter campaign name and select target users
3. **Step 2**: Choose difficulty level (Easy/Medium/Hard)
4. **Step 3**: Set schedule (Immediate/Scheduled/Recurring)
5. Click **"Create Campaign"**

### Understanding Risk Scores

- **0-40**: Low Risk (Green) - User is security aware
- **41-70**: Medium Risk (Yellow) - Needs additional training
- **71-100**: High Risk (Red) - Immediate training required

## 🛠️ Troubleshooting

### Port Conflicts

```bash
# Use the clean start script
./start-clean.sh
```

### View Logs

```bash
docker-compose logs -f
```

### Reset Everything

```bash
docker-compose down -v
./setup.sh
```

---

<div align="center">

**Built with ❤️ for Security Awareness Training**

Ready in 2 minutes • Modern UI • Real-time Analytics • AI-Powered

</div>

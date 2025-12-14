# 🚀 STEM Mentor Platform

> **An AI-powered educational platform for STEM students to create, manage, and execute hands-on projects with guided mentorship.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**STEM Mentor Platform** is a comprehensive learning management system designed to help students undertake real-world STEM projects with AI-powered guidance and expert mentorship. The platform bridges the gap between theoretical knowledge and practical application by providing:

- **AI-Generated Project Plans** using Google Gemini 2.5 Flash
- **Real-time Chat Support** with mentors and teachers
- **Progress Tracking** with interactive dashboards
- **IBR (Invention-Based Research) Program** for advanced students
- **Certificate Generation** upon project completion
- **Admin Dashboard** for managing students and reviewing projects

### 🎯 Target Audience

- STEM students (Beginner to Advanced levels)
- Educational institutions and makerspaces
- Teachers and project mentors
- Innovation centers and research labs

---

## ✨ Key Features

### For Students

- 📝 **Project Creation Wizard** - Step-by-step project proposal system
- 🤖 **AI-Powered Planning** - Automatic generation of:
  - Component lists with cost estimates (in ₹)
  - Step-by-step build instructions
  - Safety guidelines and supervision requirements
  - Location tags (Home vs. Center)
- 📊 **Project Dashboard** - Track progress, steps, and milestones
- 💬 **Real-Time Chat** - Get help from teachers and AI assistant
- 🎓 **IBR Application** - Apply for advanced research programs
- 📜 **Certificates** - Download completion certificates

### For Admins/Teachers

- 👥 **Student Management** - Create, manage, and monitor student accounts
- 📋 **Project Review System** - Review and approve project proposals
- ✏️ **Plan Editor** - Edit AI-generated plans before publishing
- 📈 **Analytics Dashboard** - View platform statistics and insights
- 💬 **Chat Management** - Respond to student queries with unread counters
- 🔐 **Access Control** - Manage student expiry dates and permissions

### AI Integration

- 🧠 **Google Gemini 2.5 Flash** for intelligent project planning
- 📚 **Context-Aware Suggestions** based on:
  - Project type (Robot, IoT, Electronics, etc.)
  - Student experience level
  - Available budget and tools
  - Safety requirements
- 🔄 **Fallback System** - Smart mock plans when AI is unavailable

---

## 🛠️ Tech Stack

### Frontend

- **React** 18.2 - UI framework
- **React Router DOM** 6.20 - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Markdown** - Markdown rendering for chat
- **Recharts** - Data visualization
- **React Syntax Highlighter** - Code highlighting

### Backend

- **Node.js** 18+ with Express.js
- **PostgreSQL** 14+ - Relational database
- **Sequelize ORM** - Database modeling and migrations
- **Socket.io** - WebSocket server for real-time features
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Google Generative AI** - Gemini 2.5 Flash integration

### DevOps & Tools

- **Git** - Version control
- **Nodemon** - Development server with hot reload
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│  Express Backend │◄───────►│   PostgreSQL    │
│  (Port 3000)    │         │   (Port 5000)    │         │    Database     │
│                 │         │                  │         │                 │
└────────┬────────┘         └────────┬─────────┘         └─────────────────┘
         │                           │
         │                           │
         │        Socket.io          │
         └───────────────────────────┘
                 Real-time Chat

         ┌──────────────────────────┐
         │  Google Gemini API       │
         │  (AI Plan Generation)    │
         └──────────────────────────┘
                      ▲
                      │
              Backend Integration
```

### Database Schema Overview

- **users** - Student and admin accounts
- **projects** - Project proposals and details
- **project_plans** - AI-generated and finalized plans
- **project_progress** - Step completion tracking
- **chat_messages** - Real-time messaging
- **certificates** - Generated completion certificates
- **ibr_applications** - Research program applications

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **npm** or **yarn**
- **Git**
- **Google Gemini API Key** (optional, for AI features)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Lottie128/stem-mentor-platform.git
cd stem-mentor-platform
```

#### 2. Setup PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stem_mentor;

# Exit
\q
```

#### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration:
# - Database credentials
# - JWT secret
# - Gemini API key (optional)
nano .env

# Run database migrations
npx sequelize-cli db:migrate

# Create admin user (optional)
node scripts/create-admin.js

# Start development server
npm run dev
```

The backend will start on **http://localhost:5000**

#### 4. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on **http://localhost:3000**

### Environment Variables

#### Backend `.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stem_mentor_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Google Gemini API (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# CORS
CLIENT_URL=http://localhost:3000
```

#### Frontend Configuration

Update `frontend/src/config/api.config.js` if backend runs on different port:

```javascript
export const API_BASE_URL = 'http://localhost:5000';
```

### 🔑 Getting Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add to backend `.env` file
4. API key is **optional** - system uses intelligent mock plans as fallback

---

## 📁 Project Structure

```
stem-mentor-platform/
│
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize configuration
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   └── chat.controller.js   # Chat functionality
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT verification
│   ├── migrations/              # Database migrations
│   ├── models/                  # Sequelize models
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── ProjectPlan.js
│   │   ├── ChatMessage.js
│   │   ├── Certificate.js
│   │   └── IBRApplication.js
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── admin.routes.js      # Admin endpoints
│   │   ├── student.routes.js    # Student endpoints
│   │   └── chat.routes.js       # Chat endpoints
│   ├── scripts/
│   │   └── create-admin.js      # Admin creation script
│   ├── services/
│   │   └── ai.service.js        # Gemini AI integration
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── MarkdownRenderer.js
│   │   ├── config/
│   │   │   └── api.config.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   └── Login.js
│   │   │   ├── student/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── NewProject.js
│   │   │   │   ├── ProjectView.js
│   │   │   │   ├── IBRApplication.js
│   │   │   │   └── Chat.js
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.js
│   │   │       ├── ProjectReview.js
│   │   │       ├── StudentManagement.js
│   │   │       └── AdminChat.js
│   │   ├── services/
│   │   │   ├── socket.js        # Socket.io client
│   │   │   └── auth.service.js
│   │   ├── styles/              # CSS modules
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
└── README.md                    # This file
```

---

## 📡 API Documentation

### Authentication Endpoints

#### `POST /api/auth/login`
Login with email and password

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "role": "STUDENT",
    "full_name": "John Doe"
  }
}
```

#### `GET /api/auth/me`
Get current user profile (requires JWT)

### Student Endpoints

#### `POST /api/student/projects`
Create new project proposal

#### `GET /api/student/projects`
Get all projects for current student

#### `GET /api/student/projects/:id`
Get specific project details

#### `PATCH /api/student/projects/:id/progress`
Update project progress

### Admin Endpoints

#### `GET /api/admin/students`
Get all students

#### `POST /api/admin/students`
Create new student account

#### `POST /api/admin/projects/:id/generate-plan`
Generate AI project plan

#### `PUT /api/admin/projects/:id/plan`
Update/approve project plan

#### `PATCH /api/admin/projects/:id/status`
Update project status

### Chat Endpoints

#### `GET /api/chat/student/messages`
Get chat messages for student

#### `POST /api/chat/student/send`
Send message to teacher

#### `GET /api/chat/admin/unread-count`
Get unread message count

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'STUDENT',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  age INTEGER,
  school VARCHAR(255),
  country VARCHAR(100),
  profile_picture TEXT,
  bio TEXT,
  skills JSONB,
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Projects Table

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  purpose TEXT,
  experience_level VARCHAR(50),
  available_tools TEXT,
  budget_range VARCHAR(100),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'PENDING_REVIEW',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Project Plans Table

```sql
CREATE TABLE project_plans (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  components JSONB NOT NULL,
  steps JSONB NOT NULL,
  safety_notes TEXT,
  generated_by_ai BOOLEAN DEFAULT true,
  finalized_by_admin_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📸 Screenshots

### Student Dashboard
![Student Dashboard](docs/screenshots/student-dashboard.png)
*View active projects, progress tracking, and quick actions*

### AI Plan Generation
![AI Plan Generation](docs/screenshots/ai-plan.png)
*Intelligent project plans with components, steps, and safety notes*

### Admin Project Review
![Admin Review](docs/screenshots/admin-review.png)
*Review and edit AI-generated plans before publishing*

### Real-time Chat
![Chat Interface](docs/screenshots/chat.png)
*Markdown-supported messaging with teachers*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation if needed

---

## 🐛 Known Issues & Roadmap

### Current Issues

- [ ] Certificate generation needs PDF library integration
- [ ] File upload for project photos not fully implemented
- [ ] Email notifications for chat messages pending

### Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Video call integration for mentorship
- [ ] Marketplace for project kits
- [ ] Leaderboard and gamification
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Integration with Arduino/Raspberry Pi IDE

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Lottie Mukuka**
- GitHub: [@Lottie128](https://github.com/Lottie128)
- LinkedIn: [Lottie Mukuka](https://linkedin.com/in/lottiemukuka)

---

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent project planning
- **PostgreSQL** for robust data management
- **React** community for excellent documentation
- **Socket.io** for real-time capabilities
- All contributors and testers

---

## 📞 Support

For questions, issues, or feature requests:

- 🐛 [Open an issue](https://github.com/Lottie128/stem-mentor-platform/issues)
- 💬 [Start a discussion](https://github.com/Lottie128/stem-mentor-platform/discussions)
- 📧 Email: support@stemmentor.com

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ for STEM Education

</div>
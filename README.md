# STEM Mentor Platform 🚀

A comprehensive STEM project mentoring platform where students submit project ideas and mentors generate safe, step-by-step plans using AI and expertise.

## 🎯 Product Overview

Students submit their project ideas through an intuitive form, and administrators (mentors) review and transform these ideas into realistic, safe, step-by-step project plans. The platform features:

- **AI-Powered Plan Generation**: Initial project plans generated using AI
- **Manual Admin Review**: Mentors refine and approve all plans
- **Safety-First Approach**: Steps marked for home vs. center supervision
- **Progress Tracking**: Students track completion of each step
- **Offline Payment Model**: Manual account activation after payment

## 🎨 Features

### For Students
- Submit project requests with detailed information
- View approved step-by-step project plans
- Track progress (Not Started / In Progress / Done)
- See components list and safety notes
- Add comments/questions on steps

### For Admins
- Create student accounts manually
- Activate/deactivate student access
- Review submitted project requests
- Generate AI draft plans
- Edit and finalize project plans
- Mark steps as "Home" or "Needs Supervision"
- Add safety notes

## 🛠 Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - API calls
- **CSS3** - Styling with animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Google Gemini API** - AI plan generation

## 📁 Project Structure

```
stem-mentor-platform/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnimatedLogo.js
│   │   │   ├── Loader.js
│   │   │   ├── Header.js
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── StudentManagement.js
│   │   │   │   └── ProjectReview.js
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.js
│   │   │   │   ├── ProjectSubmit.js
│   │   │   │   └── ProjectView.js
│   │   │   ├── Login.js
│   │   │   └── NotActive.js
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Lottie128/stem-mentor-platform.git
cd stem-mentor-platform
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with backend URL

# Start frontend
npm start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Admin Account
```
Email: admin@stemmentor.com
Password: admin123
(Change immediately after first login)
```

## 📊 Database Schema

### Users Table
```sql
id, full_name, email, password_hash, role (ADMIN/STUDENT),
is_active, expires_at, created_at, updated_at
```

### Projects Table
```sql
id, student_id, title, type, purpose, experience_level,
available_tools, budget_range, deadline, status, created_at, updated_at
```

### Project Plans Table
```sql
id, project_id, components (JSON), steps (JSON),
safety_notes, generated_by_ai, finalized_by_admin_id
```

## 🎨 Animated Logo

The platform features a custom animated logo with:
- SVG-based letter drawing animation
- Orbiting dots effect
- Smooth transitions and pulses
- Used in loader and header
- Responsive sizing

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS configuration
- SQL injection prevention
- XSS protection

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Admin
- `GET /api/admin/students` - List students
- `POST /api/admin/students` - Create student
- `PATCH /api/admin/students/:id/status` - Toggle active status
- `GET /api/admin/projects` - List all projects
- `POST /api/admin/projects/:id/generate-plan` - Generate AI plan
- `PUT /api/admin/projects/:id/plan` - Update/approve plan

### Student
- `GET /api/student/projects` - Get my projects
- `POST /api/student/projects` - Submit new project
- `GET /api/student/projects/:id` - Get project details
- `PATCH /api/student/projects/:id/steps/:stepId` - Update step status

## 🎯 Roadmap

- [ ] Phase 1: MVP (Current)
  - [x] User authentication
  - [x] Student account management
  - [x] Project submission
  - [x] AI plan generation
  - [x] Admin review workflow
  - [x] Progress tracking

- [ ] Phase 2: Enhanced Features
  - [ ] Parent login/dashboard
  - [ ] Email notifications
  - [ ] File uploads (project photos)
  - [ ] Chat/messaging system
  - [ ] Video tutorials integration

- [ ] Phase 3: Advanced
  - [ ] Online payment gateway
  - [ ] Subscription management
  - [ ] Analytics dashboard
  - [ ] Mobile app
  - [ ] Community features

## 🤝 Contributing

This is a private project for STEM education. For collaboration inquiries, contact the administrator.

## 📄 License

Proprietory - All rights reserved

## 👨‍💻 Developed By

**Lottie Mukuka**
- GitHub: [@Lottie128](https://github.com/Lottie128)
- Company: ZeroAI Technologies Inc.

## 📞 Support

For support, please contact: support@stemmentor.com

---

**Built with ❤️ for STEM Education**
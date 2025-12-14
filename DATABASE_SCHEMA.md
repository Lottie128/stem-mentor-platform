# 🗄️ STEM Mentor Platform - Database Schema

> **Complete reference for all database tables, fields, relationships, and constraints**

## 📋 Table of Contents

1. [Users](#users)
2. [Projects](#projects)
3. [Project Plans](#project-plans)
4. [IBR Applications](#ibr-applications)
5. [Certificates](#certificates)
6. [Awards](#awards)
7. [Achievements](#achievements)
8. [Submissions](#submissions)
9. [Step Submissions](#step-submissions)
10. [Portfolios](#portfolios)
11. [Chat Messages](#chat-messages)
12. [Relationships](#relationships)

---

## Users

**Table:** `users`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `full_name` | VARCHAR(255) | No | - | Student/admin full name |
| `email` | VARCHAR(255) | No | UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | No | - | Bcrypt hashed password |
| `role` | VARCHAR(50) | No | 'STUDENT' | STUDENT or ADMIN |
| `is_active` | BOOLEAN | No | true | Account active status |
| `expires_at` | TIMESTAMP | Yes | null | Account expiration date |
| `age` | INTEGER | Yes | null | Student age |
| `school` | VARCHAR(255) | Yes | null | School name |
| `country` | VARCHAR(100) | Yes | null | Country |
| `profile_picture` | TEXT | Yes | null | Profile image URL/base64 |
| `bio` | TEXT | Yes | null | Profile bio |
| `skills` | JSONB | Yes | null | Array of skills |
| `social_links` | JSONB | Yes | null | Social media links object |
| `created_at` | TIMESTAMP | No | NOW() | Account creation date |
| `updated_at` | TIMESTAMP | No | NOW() | Last update date |

### Indexes
- PRIMARY KEY: `id`
- UNIQUE: `email`

### Notes
- **Empty strings converted to NULL**: age, school, country, bio, profile_picture
- **skills** format: `["Arduino", "Python", "3D Printing"]`
- **social_links** format: `{"github": "url", "linkedin": "url", "youtube": "url"}`

---

## Projects

**Table:** `projects`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `student_id` | INTEGER | No | - | Foreign key to users |
| `title` | VARCHAR(255) | No | - | Project title |
| `type` | VARCHAR(100) | Yes | null | Robot, IoT, Electronics, etc. |
| `purpose` | TEXT | Yes | null | Project purpose/goal |
| `experience_level` | VARCHAR(50) | Yes | null | Beginner, Intermediate, Advanced |
| `available_tools` | TEXT | Yes | null | Tools student has access to |
| `budget_range` | VARCHAR(100) | Yes | null | Budget in ₹ |
| `deadline` | DATE | Yes | null | Project deadline |
| `status` | VARCHAR(50) | No | 'PENDING_REVIEW' | Current status |
| `is_public` | BOOLEAN | No | false | Show in portfolio |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |
| `updated_at` | TIMESTAMP | No | NOW() | Last update |

### Status Values
- `PENDING_REVIEW` - Waiting for admin review
- `PLAN_READY` - AI plan generated and approved
- `IN_PROGRESS` - Student working on project
- `COMPLETED` - Project finished
- `CANCELLED` - Project cancelled

### Indexes
- PRIMARY KEY: `id`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`
- INDEX: `student_id`, `status`

---

## Project Plans

**Table:** `project_plans`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `project_id` | INTEGER | No | UNIQUE | Foreign key to projects |
| `components` | JSONB | No | - | Array of components needed |
| `steps` | JSONB | No | - | Array of build steps |
| `safety_notes` | TEXT | Yes | null | Safety guidelines |
| `generated_by_ai` | BOOLEAN | No | true | AI or manual creation |
| `finalized_by_admin_id` | INTEGER | Yes | null | Admin who approved |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |
| `updated_at` | TIMESTAMP | No | NOW() | Last update |

### Components Format
```json
[
  {
    "name": "Arduino Uno",
    "description": "Main microcontroller board",
    "quantity": 1,
    "estimated_cost": "₹400"
  }
]
```

### Steps Format
```json
[
  {
    "step": 1,
    "title": "Research Phase",
    "description": "Study similar projects",
    "tag": "home",
    "status": "not_started"
  }
]
```

### Tag Values
- `home` - Can do at home safely
- `center` - Requires supervision at center

### Step Status Values
- `not_started`
- `in_progress`
- `completed`

### Indexes
- PRIMARY KEY: `id`
- UNIQUE: `project_id`
- FOREIGN KEY: `project_id` REFERENCES `projects(id)`

---

## IBR Applications

**Table:** `ibr_applications`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `student_id` | INTEGER | No | - | Foreign key to users |
| `project_id` | INTEGER | No | - | Foreign key to projects |
| `category` | VARCHAR(100) | Yes | null | Application category |
| `description` | TEXT | Yes | null | Application description |
| `google_drive_link` | TEXT | Yes | null | Documents link |
| `status` | VARCHAR(50) | No | 'SUBMITTED' | Application status |
| `progress_percentage` | INTEGER | No | 10 | Progress 0-100 |
| `admin_notes` | TEXT | Yes | null | Notes for student |
| `required_documents` | TEXT | Yes | null | Documents needed |
| `applied_date` | TIMESTAMP | No | NOW() | Application date |
| `approved_date` | TIMESTAMP | Yes | null | Approval date |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |
| `updated_at` | TIMESTAMP | No | NOW() | Last update |

### Status Values & Progress
- `SUBMITTED` - 10%
- `REVIEWING` - 30%
- `DOCUMENTS_REQUIRED` - 40%
- `IN_PROGRESS` - 60%
- `APPROVED` - 100%
- `REJECTED` - 0%

### Indexes
- PRIMARY KEY: `id`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`
- FOREIGN KEY: `project_id` REFERENCES `projects(id)`
- INDEX: `student_id`, `status`

---

## Certificates

**Table:** `certificates`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `student_id` | INTEGER | No | - | Foreign key to users |
| `project_id` | INTEGER | No | - | Foreign key to projects |
| `certificate_number` | VARCHAR(100) | No | UNIQUE | Cert number |
| `issue_date` | TIMESTAMP | No | NOW() | Issue date |
| `certificate_url` | TEXT | Yes | null | Certificate file URL |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |

### Certificate Number Format
- Example: `STEM-2025-001234`

### Indexes
- PRIMARY KEY: `id`
- UNIQUE: `certificate_number`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`
- FOREIGN KEY: `project_id` REFERENCES `projects(id)`

---

## Awards

**Table:** `awards`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `student_id` | INTEGER | No | - | Foreign key to users |
| `title` | VARCHAR(255) | No | - | Award title |
| `description` | TEXT | Yes | null | Award description |
| `badge_icon` | VARCHAR(100) | Yes | null | Icon/emoji |
| `awarded_at` | TIMESTAMP | No | NOW() | Award date |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |

### Badge Icons
- Examples: 🏆, 🥇, 🥈, 🥉, ⭐, 🎖️

### Indexes
- PRIMARY KEY: `id`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`
- INDEX: `student_id`

---

## Achievements

**Table:** `achievements`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `student_id` | INTEGER | No | - | Foreign key to users |
| `title` | VARCHAR(255) | No | - | Achievement title |
| `description` | TEXT | Yes | null | Description |
| `icon` | VARCHAR(100) | Yes | null | Icon/emoji |
| `earned_at` | TIMESTAMP | No | NOW() | Earned date |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |

### Indexes
- PRIMARY KEY: `id`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`
- INDEX: `student_id`

---

## Submissions

**Table:** `submissions`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `project_id` | INTEGER | No | - | Foreign key to projects |
| `student_id` | INTEGER | No | - | Foreign key to users |
| `submission_type` | VARCHAR(50) | No | - | Type of submission |
| `content` | TEXT | Yes | null | Submission content |
| `files_url` | TEXT | Yes | null | File URLs |
| `status` | VARCHAR(50) | No | 'PENDING' | Review status |
| `submitted_at` | TIMESTAMP | No | NOW() | Submission date |
| `reviewed_at` | TIMESTAMP | Yes | null | Review date |
| `feedback` | TEXT | Yes | null | Admin feedback |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |

### Submission Types
- `FINAL_PROJECT`
- `STEP_UPDATE`
- `DOCUMENT`

### Status Values
- `PENDING`
- `APPROVED`
- `REJECTED`

### Indexes
- PRIMARY KEY: `id`
- FOREIGN KEY: `project_id` REFERENCES `projects(id)`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`

---

## Step Submissions

**Table:** `step_submissions`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `project_id` | INTEGER | No | - | Foreign key to projects |
| `student_id` | INTEGER | No | - | Foreign key to users |
| `step_number` | INTEGER | No | - | Step index |
| `description` | TEXT | Yes | null | Work description |
| `photos_url` | TEXT | Yes | null | Photo URLs |
| `status` | VARCHAR(50) | No | 'PENDING' | Review status |
| `submitted_at` | TIMESTAMP | No | NOW() | Submission date |
| `reviewed_at` | TIMESTAMP | Yes | null | Review date |
| `feedback` | TEXT | Yes | null | Admin feedback |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |

### Indexes
- PRIMARY KEY: `id`
- FOREIGN KEY: `project_id` REFERENCES `projects(id)`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`
- INDEX: `project_id`, `step_number`

---

## Portfolios

**Table:** `portfolios`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `student_id` | INTEGER | No | UNIQUE | Foreign key to users |
| `is_public` | BOOLEAN | No | false | Portfolio visibility |
| `theme_color` | VARCHAR(50) | Yes | null | Theme color code |
| `custom_domain` | VARCHAR(255) | Yes | null | Custom domain |
| `created_at` | TIMESTAMP | No | NOW() | Creation date |
| `updated_at` | TIMESTAMP | No | NOW() | Last update |

### Indexes
- PRIMARY KEY: `id`
- UNIQUE: `student_id`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`

---

## Chat Messages

**Table:** `chat_messages`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INTEGER | No | AUTO_INCREMENT | Primary key |
| `student_id` | INTEGER | No | - | Foreign key to users |
| `chat_type` | VARCHAR(50) | No | - | teacher or ai |
| `role` | VARCHAR(50) | No | - | student or admin |
| `message` | TEXT | No | - | Message content |
| `created_at` | TIMESTAMP | No | NOW() | Message date |

### Chat Types
- `teacher` - Student to teacher chat
- `ai` - Student to AI assistant

### Roles
- `student` - Message from student
- `admin` - Message from admin/teacher

### Indexes
- PRIMARY KEY: `id`
- FOREIGN KEY: `student_id` REFERENCES `users(id)`
- INDEX: `student_id`, `chat_type`, `created_at`

---

## Relationships

### One-to-Many

```
users (1) ──→ (N) projects
users (1) ──→ (N) ibr_applications
users (1) ──→ (N) certificates
users (1) ──→ (N) awards
users (1) ──→ (N) achievements
users (1) ──→ (N) submissions
users (1) ──→ (N) step_submissions
users (1) ──→ (N) chat_messages

projects (1) ──→ (N) ibr_applications
projects (1) ──→ (N) certificates
projects (1) ──→ (N) submissions
projects (1) ──→ (N) step_submissions
```

### One-to-One

```
projects (1) ──→ (1) project_plans
users (1) ──→ (1) portfolios
```

---

## Important Constraints

### Data Type Rules

1. **Empty String to NULL conversion**
   - Fields: `age`, `school`, `country`, `bio`, `profile_picture`
   - Empty strings (`""`) are converted to `NULL` before saving
   - Prevents PostgreSQL type errors for INTEGER fields

2. **Integer Fields**
   - `age`: Must be NULL or valid integer
   - `progress_percentage`: 0-100
   - `step_number`: Positive integer

3. **JSONB Fields**
   - `components`: Array of objects
   - `steps`: Array of objects
   - `skills`: Array of strings
   - `social_links`: Object with key-value pairs

4. **TEXT Fields with Size Limits**
   - Body parser limit: 50MB for large profile pictures
   - Base64 images supported in `profile_picture`

### Cascading Rules

- **ON DELETE CASCADE**: Deleting a user deletes all related records
- **ON DELETE SET NULL**: Deleting admin sets `finalized_by_admin_id` to NULL

---

## Migration History

Migrations are stored in `backend/migrations/` folder:

1. `create-users.js` - Users table
2. `create-projects.js` - Projects table
3. `create-project-plans.js` - Project plans table
4. `create-ibr-applications.js` - IBR applications table
5. `create-certificates.js` - Certificates table
6. `create-awards.js` - Awards table
7. `create-chat-messages.js` - Chat messages table
8. Additional migrations as needed

---

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stem_mentor_db
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## Common Queries

### Get student with all projects
```sql
SELECT u.*, p.*
FROM users u
LEFT JOIN projects p ON p.student_id = u.id
WHERE u.id = 1;
```

### Get project with plan and student
```sql
SELECT p.*, pp.*, u.full_name, u.email
FROM projects p
LEFT JOIN project_plans pp ON pp.project_id = p.id
LEFT JOIN users u ON u.id = p.student_id
WHERE p.id = 5;
```

### Count unread messages per student
```sql
SELECT COUNT(DISTINCT student_id) as unread_students
FROM chat_messages
WHERE chat_type = 'teacher' 
  AND role = 'student'
  AND created_at > COALESCE(
    (SELECT MAX(created_at) 
     FROM chat_messages cm2 
     WHERE cm2.student_id = chat_messages.student_id 
       AND cm2.role = 'admin'),
    '1970-01-01'
  );
```

---

**Last Updated:** December 14, 2025  
**Database Version:** PostgreSQL 14+  
**ORM:** Sequelize 6.37.5

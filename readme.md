## 📦 Node.js Express GraphQL Authentication Server

This is a Node.js backend application using **Express**, **GraphQL**, **Passport authentication**, **MongoDB**, and **Socket.IO**. It supports local and OAuth-based user authentication, session management, real-time communication, and file uploads.

---

### 🚀 Features

- ✨ GraphQL API with Apollo Server
- 🔐 User authentication using Passport.js (`local`)
- 🛡 Secure session handling with `express-session` and `connect-mongodb-session`
- 🔒 Password hashing via `bcryptjs`
- 🧠 MongoDB database using `mongoose`
- 🧁 EJS templating engine for optional server-rendered pages
- 📁 File uploads via `multer`
- 🧩 GraphQL schema and resolver organization with `graphql-passport`
- 🧃 Real-time communication with `socket.io`
- 🔑 JWT support for token-based APIs
- 🎩 Secure headers with `helmet`
- 🌐 CORS-enabled
- 📄 `.env` support via `dotenv`

---

### 🛠 Tech Stack

- Node.js
- Express.js
- Apollo Server (GraphQL)
- Passport.js + LocalStrategy
- MongoDB + Mongoose
- Socket.IO
- EJS (for views)
- Helmet, CORS, body-parser, multer

---

### 📁 Folder Structure (assumed)

```
├── src/
│   ├── models/              # Mongoose models
│   ├── resolvers/           # GraphQL resolvers
│   ├── schemas/             # GraphQL typeDefs
│   ├── routes/              # Express routes
│   ├── sockets/             # Socket.IO events
│   ├── config/              # DB, passport, environment config
│   └── index.js             # Main server entry
├── views/                   # EJS templates (optional)
├── .env
├── package.json
└── README.md
```

---

### 🧪 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo.git

# Navigate into the directory
cd your-repo

# Install dependencies
npm install
```

---

### ⚙️ Environment Variables

Create a `.env` file in the root with:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/your-db
SESSION_SECRET=your-secret
JWT_SECRET=your-jwt-secret
```

---

### ▶️ Run the Server

```bash
npm run start
```

Or in development mode (if using nodemon):

```bash
npm run dev
```

---

### 🔐 Authentication

- **Local Login:** email + password (via Passport LocalStrategy)
- **Sessions stored** in MongoDB via `connect-mongodb-session`
- **JWT available** for APIs
- Add Google/Facebook OAuth using Passport strategies (optional)

---

### 📡 GraphQL Endpoint

Once running, visit:

```
http://localhost:4000/graphql
```

You can use GraphQL Playground or Apollo Studio to test queries and mutations.

---

### 📤 File Uploads

- Handled using `multer`
- Upload endpoint: `/upload` (if implemented)
- Supports multipart/form-data

---

### 🔌 Socket.IO

Real-time event handling on:

```
http://localhost:4000
```

Use custom events like:

```js
socket.emit("chat-message", { from, to, message });
```

---

### 🧩 Example GraphQL Query

```graphql
query {
  me {
    id
    email
  }
}
```

---

### 📄 License

MIT

---

Would you like me to include example GraphQL schemas or REST route samples too?

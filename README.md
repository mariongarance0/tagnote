
# 📝 TagNote

![React](https://img.shields.io/badge/React-Framework-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Organize your notes the way your brain actually works.**

TagNote is a modern note-taking web app designed to solve one of the biggest frustrations with traditional mobile notes apps: **poor organization**.

Instead of keeping all notes in a flat list, TagNote allows you to structure information using **folders, subfolders, and flexible tag-based search**.

🌐 Live application  
https://tagnote.lovable.app

---

# The Problem

Most note-taking apps on phones are designed for **quick writing**, but not for **long-term organization**.

Typical limitations include:

- No nested folders
- Difficult navigation once you have many notes
- Weak tagging systems
- Poor search filtering

After a few months, your notes become a **long, messy list that is hard to navigate**.

TagNote was created to fix that.

---

# The Idea

TagNote combines two powerful organizational systems:

### 1️⃣ Folder Structure

A hierarchical structure similar to a computer file system.

```

Projects
├── Work
│    ├── Meeting notes
│    └── Ideas
└── Personal
├── Travel
└── Recipes

```

This allows users to structure knowledge clearly.

---

### 2️⃣ Tag-Based Search

Tags add a second layer of organization.

Example:

```

Note: "Trip planning"

Tags:
travel
budget
ideas

```

You can search notes using:

- single tag filtering
- **cumulative filters (AND)**
- **alternative filters (OR)**

This allows much more flexible note discovery.

---

# Features

## 🗂 Folder & Subfolder Navigation

Notes can be organized using **nested directories**, allowing users to browse them just like files on a computer.

This solves the common problem of **flat note lists becoming unmanageable**.

---

## 🏷 Custom Tags

Users can create their own tags and attach them to notes.

Tags provide flexible categorization across folders.

Examples:

- `work`
- `ideas`
- `recipes`
- `travel`
- `research`

---

## 🔍 Smart Search

Notes can be filtered by tag combinations.

Examples:

Find notes tagged with:

```

work + meeting

```

Or notes tagged with:

```

travel OR planning

````

This makes retrieving information much faster.

---

## 📱 Multi-Device Access

Users create an account using their email.

This allows notes to be synchronized and accessed across multiple devices:

- phone
- tablet
- computer

---

## ✅ Integrated To-Do Lists

TagNote also includes a simple **task management system**.

Users can:

- create tasks
- check them off when completed
- track progress over time

---

# Mobile Experience

TagNote is optimized to behave like a **mobile application**.

For the best experience on iPhone:

1. Open the website in Safari
2. Tap **Share**
3. Select **Add to Home Screen**

This installs TagNote as a **progressive web app**, making it feel like a native application.

---

# Technology Stack

The application is built using modern frontend technologies:

- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn-ui

These tools allow fast development and a responsive user interface.

---

# Installation

To run the project locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate into the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
````

---

# Potential Future Features

Planned improvements include:

* note pinning
* markdown support
* drag-and-drop folder organization
* reminders and notifications
* note sharing
* offline mode
* advanced search filters

---

# License

MIT License

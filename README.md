# ✨ GitHub Gist Tracker

![GitHub Gist Tracker Banner]()

> A beautiful, intuitive application that helps you manage your GitHub Gists in one place.

## 🚀 Overview

GitHub Gist Tracker is a modern web application that allows GitHub users to effortlessly manage their code snippets (Gists) through an elegant interface. Whether you're a developer looking to organize your code snippets or a team wanting to share useful code fragments, this app provides a seamless experience for creating, viewing, and managing Gists without leaving your workflow.

**[Live Demo](https://github-gist-tracker.vercel.app)** | **[Report Bug](https://github.com/akamrannicole/github-gist-tracker/issues)** | **[Request Feature](https://github.com/akamrannicole/github-gist-tracker/issues)**

![App Screenshot](/placeholder.svg?height=400&width=800)

## ✨ Features

### 🔐 User Authentication

- **Simple Sign Up**: Create an account using your email and password
- **Secure Login**: Safely access your personal dashboard
- **Protected Content**: Your Gists and profile information remain private and secure

![Authentication Flow]()
![Authentication Flow]()

### 👤 Profile Management

- **Personalized Profiles**: Add your name, bio, and avatar
- **Account Settings**: Update your information anytime
- **GitHub Integration**: Connect with your GitHub account to sync your Gists
- **Account Control**: Option to delete your account if needed

![Profile Management]()

### 📝 Gist Management

- **Create Gists**: Easily add new code snippets with titles, descriptions, and syntax highlighting
- **Organize**: View all your Gists in one dashboard
- **Edit On-the-fly**: Update your Gists whenever inspiration strikes
- **Search & Filter**: Quickly find the code snippets you need
- **Detailed View**: Examine individual Gists with full formatting and syntax highlighting

![Gist Management]()
![Gist Management]()

### ⭐ Bonus Features

- **Favorites**: Star Gists you use frequently for quick access
- **Responsive Design**: Perfect experience on any device - mobile, tablet, or desktop
- **Dark Mode**: Easy on the eyes during those late-night coding sessions

## 🛠️ Technology Stack

### For Non-Technical Readers:

This app is built using modern web technologies that make it fast, secure, and easy to use:

- **Next.js 15**: Creates a smooth, app-like experience when you navigate between pages
- **Tailwind CSS V4**: Makes the app beautiful and responsive on any device
- **MongoDB**: Safely stores your profile information
- **GitHub API**: Connects directly with GitHub to manage your Gists

### For Developers:

- **Frontend**: Next.js 15 with App Router, Tailwind CSS V4
- **Backend**: Next.js API Routes and Server Actions
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom auth system with secure password hashing
- **Form Handling**: React Hook Form with Zod validation
- **API Integration**: GitHub Gist API
- **Deployment**: Vercel (recommended) or any platform of your choice

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- GitHub account (for Gist API access)
- MongoDB database (local or Atlas)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/akamrannicole/github-gist-tracker.git
   cd github-gist-tracker
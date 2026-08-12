# Remix of SVS English Spark

You are an expert full-stack software architect and senior UI/UX designer.

Build a production-ready web application called "SVS English Coach".

This application is built exclusively for Sri Vijaya Sai High School to help teachers and school staff improve their English speaking skills using AI.

This is NOT a generic chatbot.

It is a structured English learning platform.

--------------------------------------------------

PRIMARY GOALS

--------------------------------------------------

The application must be:

• Clean

• Professional

• Modern

• Fast

• Easy for non-technical users

• Responsive

• Scalable

• Production-ready

Every screen should feel polished and consistent.

--------------------------------------------------

TECH STACK

--------------------------------------------------

Use:

• React

• TypeScript

• Vite

• Tailwind CSS

• shadcn/ui

• Supabase

• React Router

• React Query

Organize the project using reusable components.

Do not generate duplicate code.

Use best practices.

--------------------------------------------------

PROJECT STRUCTURE

--------------------------------------------------

Create a scalable folder structure.

Separate:

components

pages

layouts

hooks

services

lib

types

contexts

utils

assets

Create reusable layouts.

--------------------------------------------------

APPLICATION LAYOUTS

--------------------------------------------------

There are TWO completely different applications inside one project.

1.

User Portal

2.

Admin Portal

Never mix them.

Each should have its own layout.

Each should have separate navigation.

--------------------------------------------------

ROUTES

--------------------------------------------------

Create routing only.

Do NOT implement page functionality yet.

Routes:

/

/login

/dashboard

/profile

/practice

/progress

/vocabulary

/achievements

/settings

/admin/login

/admin/dashboard

/admin/users

/admin/challenges

/admin/analytics

/admin/announcements

/admin/settings

If users are not logged in, redirect them to login.

--------------------------------------------------

AUTHENTICATION

--------------------------------------------------

Configure Supabase authentication.

Create protected routes.

Do not implement login UI yet.

Only prepare authentication architecture.

--------------------------------------------------

DESIGN SYSTEM

--------------------------------------------------

Create a professional design system.

Theme:

Primary Color:

Blue (#2563EB)

Secondary:

White

Accent:

Emerald Green

Background:

Light Gray

Cards:

Rounded

Soft Shadows

Large spacing

Modern appearance

Buttons:

Rounded

Icons:

Lucide Icons

Animations:

Subtle only.

Professional.

--------------------------------------------------

TYPOGRAPHY

--------------------------------------------------

Use a clean professional font.

Headings

Bold

Body

Highly readable.

--------------------------------------------------

COMPONENTS

--------------------------------------------------

Prepare reusable components only.

Examples:

Sidebar

Navbar

Header

Page Container

Dashboard Card

Stat Card

Chart Card

Loading Screen

Empty State

Search Box

Modal

Confirmation Dialog

Notification Toast

Breadcrumb

Avatar

Profile Card

These should be reusable.

--------------------------------------------------

NAVIGATION

--------------------------------------------------

User Navigation

Dashboard

Practice

Progress

Vocabulary

Achievements

Profile

Settings

--------------------------------------------------

Admin Navigation

Dashboard

Users

Challenges

Analytics

Announcements

Settings

--------------------------------------------------

DATABASE

--------------------------------------------------

Connect Supabase.

Prepare database connection.

Do NOT create tables yet.

--------------------------------------------------

PLACEHOLDERS

--------------------------------------------------

Use professional placeholders.

Do not leave blank pages.

Every page should contain:

Title

Description

Coming Soon message

Consistent layout

--------------------------------------------------

CODE QUALITY

--------------------------------------------------

Follow clean architecture.

Keep components reusable.

Avoid unnecessary complexity.

Avoid duplicated code.

Write maintainable code.

--------------------------------------------------

IMPORTANT

--------------------------------------------------

Do NOT build dashboards.

Do NOT build AI.

Do NOT create database tables.

Do NOT create business logic.

Only create the application foundation and architecture.

The goal is to create a strong base that future features can build upon.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://svs-english-spark.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5253ef75-502f-4a29-ab45-819ed2883386).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

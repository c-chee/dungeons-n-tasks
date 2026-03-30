# Dungeons and Tasks (Productivity App)

## Overview
This is a application designed to help parents and children manage tasks in a more engaging and interactive way. Instead of traditional chore lists, this app turns tasks into a game-like experience where children complete "quests", earn rewards, and stay motivated.

The goal is to make task management fun, encourage consistency, and strengthen collaboration between parents and children. Future enhancements will include a customizable shop system where users can unlock characters and personalize their experience.

---

## Cause
This application is built to support families by improving task management between parents and children. Many traditional systems feel repetitive and unmotivating for kids. By gamifying tasks, this app encourages participation, accountability, and consistency in a way that feels rewarding rather than forced.

---

## Core Concept
- **Tasks = Quests**
- **Parents = Guild Masters**
- **Children = Members**
- **Teams = Parties**
- **Quest Board = Billboard where available quests are posted**

This structure creates a game-like ecosystem where families collaborate, assign objectives, and track progress in a more engaging way.

---

## Tech Stack

### Frontend
- React
- Next.js 15 (App Router)
- Tailwind CSS

### Backend / Database
- MySQL
- AWS-hosted database
- Relational database structure with multiple tables

### Authentication
- Role-based authentication:
  - Parent (Guild Master)
  - Child (Member)

### Hosting
- Frontend hosted on Vercel
- Database hosted on AWS

### Testing
- Cypress for end-to-end (E2E) testing

### AI Integration
- Hugging Face Inference API (Qwen/Qwen2.5-7B-Instruct model)
- Integrated into the "blocked task" system via "Ask the Wizard" feature
- Provides AI-generated suggestions when a user is stuck on a task

---

## Features

### Quest System

#### Quest Board
- Guild members can browse available quests posted by their guild
- Quests display with title, description, rewards (coins/XP), and status badges
- Quests can be assigned to individual members or entire parties
- Guild Masters can edit/delete quests from the Quest Board
- Completed quests are grayed out and visible for reference

#### Quest Pickup Requests
- Members can request to pick up available quests
- Guild Masters approve or decline pickup requests
- Members can cancel their pending requests
- Maximum 3 pending pickup requests per user

#### Quest Assignment
- Guild Masters can assign quests directly to members
- Guild Masters can assign quests to parties (all party members share the quest)
- Party quests are visible only to party members and guild masters
- When a party member completes a quest, XP is added to the party total

#### Quest Status Workflow
```
Available → Assigned → In Progress → Pending Review → Completed
                                    ↓
                               (if revision) → In Progress
                                    ↓
                               (if blocked) → Blocked → In Progress
```
- **Available**: Quest posted, no one assigned
- **Assigned**: Quest assigned to member or party
- **In Progress**: Member started working on quest
- **Blocked**: Member encountered an issue and reported it
- **Pending Review**: Member submitted quest for completion
- **Completed**: Guild Master approved, rewards distributed

---

### Role-Based System

#### Guild Master (Parent)
Parents have full control over task and group management:
- Create and edit quests (assign rewards, descriptions)
- Create quests for specific members or parties
- Approve or reject guild join requests
- Approve or reject quest pickup requests
- Review blocked messages from members
- Perform final confirmation that a task is completed before rewards are distributed
- Send revision requests when submissions are incomplete or need improvement
- Create and manage parties within the guild
- Remove members from parties
- Delete completed quests from the board
- Generate guild join code when account is created

#### Member (Child)
Children participate in quests and progression:
- View assigned quests
- Request to pick up available quests from the Quest Board
- Start, work on, and submit completed tasks
- Send "blocked" messages when stuck (with optional AI wizard assistance)
- Resubmit tasks after receiving revision feedback
- Cancel pending pickup requests

---

### Guild System
- Guilds represent family units (managed by parents)
- Each guild has a unique join code for members to request to join
- Guild Masters can approve or reject join requests
- Guild Masters can remove members from the guild
- Guild Masters can regenerate join codes

### Party System
- Parties represent teams within a guild
- Guild Masters create parties with a name and optional leader
- Maximum 15 members per party
- Guild Masters can add or remove members from parties
- Parties share XP progress (party XP accumulates when members complete quests)
- Party quests are visible only to party members and guild masters
- Members can belong to one party at a time
- Collapsible party view in the guild dashboard

---

### Block & Revision System

#### Block Flow
1. Member encounters an issue with a quest
2. Member clicks "Block" and enters a reason
3. Guild Master is notified and can review the block
4. Member can resume the quest when ready

#### AI Wizard (Ask the Wizard)
When a member marks a quest as blocked, they can use the "Ask the Wizard" feature:
1. Member clicks "Ask the Wizard" in the block modal
2. Member describes their block in the text area
3. AI provides suggestions for overcoming the block
4. Member indicates if the suggestion was helpful
5. If not helpful, member submits their own block reason

#### Revision Flow
1. Guild Master reviews submitted quest
2. Guild Master clicks "Revise" with feedback
3. Member receives revision notes with feedback
4. Member works on revisions and resubmits

---

### AI-Powered Assistance
The "Ask the Wizard" feature helps users overcome obstacles:
- Uses Hugging Face Inference API with Qwen model
- Provides context-aware suggestions based on quest details
- Includes injection protection and input sanitization
- Fallback message if AI is unavailable

---

### Task Review Flow
1. Member completes a quest and submits it
2. Quest status changes to "Pending Review"
3. Guild Master reviews submission
4. Guild Master can:
   - **Approve**: Quest marked complete, rewards distributed
   - **Revise**: Quest returns to "In Progress" with feedback
   - **Block**: (if needed) Quest marked blocked with reason
5. Member resubmits after revision if needed

---

### Responsive Design
- Fully responsive across:
  - Mobile
  - Tablet
  - Desktop

---

## Pages

### Landing Page
- Introduces the application
- Explains gamified task system and purpose

---

### Dashboard (Home)
- Central hub of the application
- Displays:
  - User stats (level, coins, XP progress)
  - Active quests with status tracking
  - Guild/Party information (if in a guild)
  - Quest Board for browsing available quests
  - Guild management (for guild masters)

---

## Database Schema

### Key Tables
- **users**: User accounts with level, coins, XP
- **guilds**: Family units with join codes
- **guild_members**: Membership with roles (guild_master/member)
- **parties**: Teams within guilds
- **party_members**: Party membership
- **quests**: Tasks with rewards and status
- **quest_assignments**: Individual quest assignments
- **quest_pickup_requests**: Requests to pick up quests
- **user_progress**: XP tracking per party

---

## Future Improvements

- Shop system for unlocking and customizing characters
- Expanded reward economy system
- Notifications and reminders system
- Enhanced party/guild social features
- Leaderboards and achievements
- Mobile app version

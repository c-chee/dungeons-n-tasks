-- =====================================================
-- DUNGEONS & TASKS - DATABASE SCHEMA
-- =====================================================

-- Users
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,

    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    coins INT DEFAULT 0,
    level INT DEFAULT 1,
    level_xp INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Guilds
CREATE TABLE Guilds (
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,
    join_code VARCHAR(10) UNIQUE,

    owner_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES Users(id)
);


-- Guild Members (handles joining, approval, and roles)
CREATE TABLE GuildMembers (
    guild_id INT,
    user_id INT,

    role ENUM('guild_master', 'member') DEFAULT 'member',
    status ENUM('pending', 'approved') DEFAULT 'pending',

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (guild_id, user_id),

    FOREIGN KEY (guild_id) REFERENCES Guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);


-- Parties (can belong to a guild or be personal)
CREATE TABLE Parties (
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,
    join_code VARCHAR(10) UNIQUE,

    guild_id INT NULL,
    owner_id INT NOT NULL,
    leader_id INT NULL,

    visibility ENUM('private', 'guild') DEFAULT 'private',

    xp_goal INT DEFAULT 100,
    xp_current INT DEFAULT 0,

    status ENUM('active', 'completed', 'failed') DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (guild_id) REFERENCES Guilds(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES Users(id),
    FOREIGN KEY (leader_id) REFERENCES Users(id) ON DELETE SET NULL
);


-- Party Members
CREATE TABLE PartyMembers (
    party_id INT,
    user_id INT,

    role ENUM('leader', 'member') DEFAULT 'member',
    status ENUM('pending', 'approved') DEFAULT 'pending',

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (party_id, user_id),

    FOREIGN KEY (party_id) REFERENCES Parties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);


-- Quests (can belong to guild or party)
CREATE TABLE Quests (
    id INT PRIMARY KEY AUTO_INCREMENT,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    created_by INT NOT NULL,
    assigned_to INT NULL,

    context_type ENUM('guild', 'party') NOT NULL,

    party_id INT NULL,
    guild_id INT NULL,

    reward_coins INT DEFAULT 10,
    reward_xp INT DEFAULT 10,

    status ENUM('available', 'assigned', 'completed') DEFAULT 'available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    FOREIGN KEY (created_by) REFERENCES Users(id),
    FOREIGN KEY (assigned_to) REFERENCES Users(id),
    FOREIGN KEY (party_id) REFERENCES Parties(id) ON DELETE CASCADE,
    FOREIGN KEY (guild_id) REFERENCES Guilds(id) ON DELETE CASCADE,

    CHECK (
        (context_type = 'guild' AND guild_id IS NOT NULL AND party_id IS NULL) OR
        (context_type = 'party' AND party_id IS NOT NULL AND guild_id IS NULL)
    )
);


-- Quest Completions
CREATE TABLE QuestCompletions (
    id INT PRIMARY KEY AUTO_INCREMENT,

    quest_id INT NOT NULL,
    user_id INT NOT NULL,

    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (quest_id, user_id),

    FOREIGN KEY (quest_id) REFERENCES Quests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);


-- Shop Items
CREATE TABLE ShopItems (
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,
    description TEXT,

    cost_coins INT NOT NULL,

    type ENUM('cosmetic', 'functional') DEFAULT 'cosmetic',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- User Inventory
CREATE TABLE UserInventory (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,
    item_id INT NOT NULL,

    quantity INT DEFAULT 1,

    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, item_id),

    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES ShopItems(id) ON DELETE CASCADE
);

CREATE TABLE QuestPickupRequests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quest_id INT NOT NULL,
    user_id INT NOT NULL,
    guild_id INT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quest_id) REFERENCES Quests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (guild_id) REFERENCES Guilds(id) ON DELETE SET NULL
);
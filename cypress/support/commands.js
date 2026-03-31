// Custom Cypress commands for Dungeons & Tasks E2E tests

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/account');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('button').contains('Logout').click({ force: true });
  cy.url().should('include', '/login');
});

// Register as Guild Master
Cypress.Commands.add('registerGuildMaster', (userData) => {
  cy.visit('/register');
  cy.get('input[value="guild_master"]').check();
  cy.get('input[placeholder="First Name"]').type(userData.firstName);
  cy.get('input[placeholder="Last Name"]').type(userData.lastName);
  cy.get('input[type="email"]').type(userData.email);
  cy.get('input[type="password"]').type(userData.password);
  cy.get('input[placeholder="Guild Name"]').type(userData.guildName);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/login');
});

// Register as Member
Cypress.Commands.add('registerMember', (userData) => {
  cy.visit('/register');
  cy.get('input[value="member"]').check();
  cy.get('input[placeholder="First Name"]').type(userData.firstName);
  cy.get('input[placeholder="Last Name"]').type(userData.lastName);
  cy.get('input[type="email"]').type(userData.email);
  cy.get('input[type="password"]').type(userData.password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/login');
});

// Join guild with code
Cypress.Commands.add('joinGuild', (guildCode) => {
  cy.get('input[placeholder="Enter guild code"]').type(guildCode);
  cy.get('button').contains('Join').click();
});

// Create quest
Cypress.Commands.add('createQuest', (questData) => {
  cy.get('button').contains('+ Add').click();
  cy.wait(500);
  
  cy.get('input[placeholder="Title"]').type(questData.title);
  cy.get('textarea[placeholder="Description"]').type(questData.description);
  
  // Set reward coins
  cy.get('input[type="number"]').first().clear().type(questData.rewardCoins);
  // Set reward XP
  cy.get('input[type="number"]').last().clear().type(questData.rewardXp);
  
  cy.get('button').contains('Create Quest').click();
});

// Get guild code from UI
Cypress.Commands.add('getGuildCode', () => {
  return cy.get('.font-mono.text-lg').invoke('text').then((text) => {
    return text.trim();
  });
});

// Approve guild join request
Cypress.Commands.add('approveGuildRequest', (memberName) => {
  cy.get('.space-y-3').contains(memberName).parent().find('button').contains('Accept').click();
});

// Approve quest pickup request
Cypress.Commands.add('approvePickupRequest', (questTitle) => {
  cy.get('div').contains('Pickup Requests').parent().within(() => {
    cy.get('.border').contains(questTitle).parent().find('button').contains('Accept').click();
  });
});

// Pick up quest
Cypress.Commands.add('pickupQuest', (questTitle) => {
  cy.get('.border').contains(questTitle).parent().find('button').contains('Pick-up').click();
});

// Start quest
Cypress.Commands.add('startQuest', (questTitle) => {
  cy.get('.border').contains(questTitle).parent().find('button').contains('Start').click();
});

// Submit quest for review
Cypress.Commands.add('submitQuest', (questTitle) => {
  cy.get('.border').contains(questTitle).parent().find('button').contains('Submit').click();
});

// Approve quest completion
Cypress.Commands.add('approveQuestCompletion', (questTitle) => {
  cy.get('div').contains('Pending Review').parent().within(() => {
    cy.get('.border').contains(questTitle).find('button').contains('Approve').click();
  });
});

// Cancel pickup request
Cypress.Commands.add('cancelPickupRequest', () => {
  cy.get('button').contains('Cancel').click();
});

// Clear database (call API or use direct MySQL)
Cypress.Commands.add('clearDatabase', () => {
  // This will be handled by npm script that runs before tests
  // For now, we'll use the API if available or skip
});

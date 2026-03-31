/// <reference types="cypress" />

describe('Guild Master Flow', () => {
  const timestamp = Date.now();
  const gmUser = {
    firstName: 'GM',
    lastName: `Test${timestamp}`,
    email: `gm${timestamp}@test.com`,
    password: 'testpassword123',
    guildName: `Test Guild ${timestamp}`
  };

  const questData = {
    title: `Test Quest ${timestamp}`,
    description: 'This is a test quest for E2E testing',
    rewardCoins: 10,
    rewardXp: 15
  };

  before(() => {
    // Visit the app first
    cy.visit('/');
  });

  it('registers as Guild Master and creates a quest', () => {
    // Step 1: Register as Guild Master
    cy.registerGuildMaster(gmUser);
    
    // Should redirect to login after successful registration
    cy.url().should('include', '/login');
    
    // Step 2: Login as Guild Master
    cy.login(gmUser.email, gmUser.password);
    
    // Should be on account page
    cy.url().should('include', '/account');
    
    // Step 3: Verify guild was created with a join code
    cy.get('.font-mono.text-lg').should('not.be.empty');
    cy.get('.font-mono.text-lg').invoke('text').should('match', /^[A-Z0-9]{8}$/);
    
    // Save guild code for member flow
    cy.get('.font-mono.text-lg').invoke('text').then((code) => {
      Cypress.env('guildCode', code.trim());
      cy.log(`Guild code saved: ${code.trim()}`);
    });
    
    // Step 4: Create a quest
    cy.createQuest(questData);
    
    // Verify quest appears in the list
    cy.get('.border').contains(questData.title).should('be.visible');
    
    // Save quest ID for verification later
    cy.get('.border').contains(questData.title).invoke('attr', 'key').then((id) => {
      Cypress.env('questId', id);
    });
  });

  it('approves member join request and quest pickup request', () => {
    // Login again to check for pending requests
    cy.login(gmUser.email, gmUser.password);
    cy.url().should('include', '/account');
    
    // Wait for member to join (member flow will run after this)
    // For sequential testing, we need to wait or poll
    cy.wait(2000);
    
    // Refresh the page to get latest data
    cy.reload();
    
    // Step 5: Approve member join request if present
    cy.get('body').then(($body) => {
      if ($body.text().includes('Pending Requests')) {
        cy.get('button').contains('Accept').first().click();
        cy.wait(500);
      }
    });
    
    // Step 6: Approve quest pickup request if present
    cy.get('body').then(($body) => {
      if ($body.text().includes('Pickup Requests')) {
        cy.get('.border').contains(questData.title).parent().find('button').contains('Accept').click();
        cy.wait(500);
      }
    });
  });

  it('approves quest completion', () => {
    // Login again to check for pending review
    cy.login(gmUser.email, gmUser.password);
    cy.url().should('include', '/account');
    
    // Wait for member to complete quest
    cy.wait(2000);
    
    // Refresh to get latest data
    cy.reload();
    
    // Step 7: Approve quest completion if in pending review
    cy.get('body').then(($body) => {
      if ($body.text().includes('Pending Review')) {
        cy.get('.border').contains(questData.title).find('button').contains('Approve').click();
        cy.wait(500);
        
        // Verify quest is no longer in pending review
        cy.get('div').contains('Pending Review').should('not.exist');
      }
    });
    
    // Step 8: Verify the quest is marked as completed
    cy.visit('/account');
    cy.reload();
    cy.get('body').should('not.contain', 'Pickup Requests');
  });

  after(() => {
    // Logout
    cy.logout();
  });
});

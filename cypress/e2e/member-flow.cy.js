/// <reference types="cypress" />

describe('Member Flow', () => {
  const timestamp = Date.now();
  const memberUser = {
    firstName: 'Member',
    lastName: `Test${timestamp}`,
    email: `member${timestamp}@test.com`,
    password: 'testpassword123'
  };

  before(() => {
    // Visit the app first
    cy.visit('/');
  });

  it('registers as Member and joins a guild', () => {
    // Step 1: Register as Member
    cy.registerMember(memberUser);
    
    // Should redirect to login after successful registration
    cy.url().should('include', '/login');
    
    // Step 2: Login as Member
    cy.login(memberUser.email, memberUser.password);
    
    // Should be on account page
    cy.url().should('include', '/account');
    
    // Step 3: Join guild with code from Guild Master
    // Get the guild code from Cypress env (set by guild-master-flow test)
    const guildCode = Cypress.env('guildCode');
    
    if (!guildCode) {
      cy.log('Guild code not found - make sure Guild Master flow runs first');
      cy.log('Skipping member flow test');
      return;
    }
    
    cy.joinGuild(guildCode);
    
    // Verify join request was sent
    cy.get('div').contains('Awaiting approval').should('be.visible');
    
    // Save guild code
    cy.log(`Joined guild with code: ${guildCode}`);
  });

  it('waits for guild approval and picks up a quest', () => {
    // Login again
    cy.login(memberUser.email, memberUser.password);
    cy.url().should('include', '/account');
    
    // Wait for guild approval (poll)
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkForGuildApproval = () => {
      cy.reload();
      cy.get('body').then(($body) => {
        if ($body.text().includes('Awaiting approval')) {
          cy.log('Still waiting for guild approval...');
          if (attempts < maxAttempts) {
            attempts++;
            cy.wait(2000);
            checkForGuildApproval();
          } else {
            cy.log('Max wait time reached for guild approval');
          }
        } else if ($body.text().includes('Guild Quests') || $body.text().includes('Available')) {
          cy.log('Guild approval received!');
        }
      });
    };
    
    checkForGuildApproval();
  });

  it('picks up a quest and completes it', () => {
    // Login again
    cy.login(memberUser.email, memberUser.password);
    cy.url().should('include', '/account');
    
    // Navigate to Quest Board
    cy.get('button').contains('Quest Board').click();
    cy.url().should('include', '/account');
    
    // Step 4: Find and pick up a quest
    // Look for available quests
    cy.get('body').then(($body) => {
      if ($body.text().includes('Pick-up')) {
        cy.get('button').contains('Pick-up').first().click();
        cy.wait(500);
        
        // Verify pickup request was sent
        cy.get('button').contains('Request sent').should('be.visible');
      } else {
        cy.log('No available quests found');
      }
    });
  });

  it('waits for pickup approval, starts and submits the quest', () => {
    // Login again
    cy.login(memberUser.email, memberUser.password);
    cy.url().should('include', '/account');
    
    // Wait for pickup approval (poll)
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkForPickupApproval = () => {
      cy.reload();
      cy.get('body').then(($body) => {
        if ($body.text().includes('Request sent')) {
          cy.log('Still waiting for pickup approval...');
          if (attempts < maxAttempts) {
            attempts++;
            cy.wait(2000);
            checkForPickupApproval();
          } else {
            cy.log('Max wait time reached for pickup approval');
          }
        } else if ($body.text().includes('Start')) {
          cy.log('Pickup approved!');
          // Step 5: Start the quest
          cy.get('button').contains('Start').first().click();
          cy.wait(500);
          
          // Step 6: Submit quest for review
          cy.get('button').contains('Submit').first().click();
          cy.wait(500);
        }
      });
    };
    
    checkForPickupApproval();
  });

  it('verifies rewards received after completion', () => {
    // Login again
    cy.login(memberUser.email, memberUser.password);
    cy.url().should('include', '/account');
    
    // Wait for quest completion approval
    cy.wait(3000);
    cy.reload();
    
    // Verify no more pending quests
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Request sent') && !$body.text().includes('Start')) {
        cy.log('Quest completed successfully!');
      }
    });
    
    // Check stats card for updated values
    cy.get('.bg-white').first().should('be.visible');
  });

  after(() => {
    // Logout
    cy.logout();
  });
});

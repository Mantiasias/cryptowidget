describe('Crypto Widget Is Opening', () => {
  it('App is opened!', () => {
    cy.visit('/');
    cy.contains('Market')
  })
})

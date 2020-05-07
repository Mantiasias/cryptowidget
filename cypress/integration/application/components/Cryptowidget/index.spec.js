describe('Crypto Widget Test Suite', () => {
  it('App is opened!', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Market')
  })
})

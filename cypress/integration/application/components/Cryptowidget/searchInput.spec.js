import { API_URL } from '../../../../../src/config'

describe('Search Input Testing', () => {
  beforeEach(() => {
    cy.server();
    cy.route(API_URL, 'fixture:productList')
    cy.visit('/');
  })

  it('App is filtering with Search Input!', () => {
    cy.get('.search-input')
      .type('BNB/BTC');

    cy.get('.ag-center-cols-container').find('.ag-row').should('have.length', 1)
  })

  it('App is showing empty list when Search input is Strange!', () => {
    cy.get('input[data-cy="search-input"]')
      .type('AVADA CEDAVRA')

    cy.get('.ag-center-cols-container').find('.ag-row').should('have.length', 0)
  })

})

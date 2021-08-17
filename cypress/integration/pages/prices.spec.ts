context('/prices', () => {
  before(function () {
    cy.visit('/prices?network=MainNet')
  })

  it('should have section: Price Feeds', () => {
    cy.get('main').should('contain.text', "Price Feeds")
  })

  it('should have section: Pricing feeds by', () => {
    cy.get('main section').should('contain.text', "Pricing feeds by")
  })

  it('should contain at least 20 price feed', function () {
    cy.get('[data-testid="PriceFeed"]').should('have.length.above', 20)
  })

  it('should have common PriceFeed texts', () => {
    cy.get('[data-testid="PriceFeed"]').first()
      .should('contain.text','View')
      .should('contain.text','USD')
  })

  it('should be able to click on a PriceFeed', () => {
    cy.get('[data-testid="PriceFeed"]').first().click()
    cy.wait(5000)

    cy.location().should((loc) => {
      expect(loc.pathname).to.contains('/prices/')
    })
  })
})

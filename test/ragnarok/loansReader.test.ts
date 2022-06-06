import { LoansReader__factory } from 'contracts'
import { BigNumber, Wallet } from 'ethers'
import { expect } from 'chai'
import { setupFixtureLoader } from 'test/setup'
import { BulletLoanStatus, managedPortfolioFixture } from './fixtures'
import { extractArgFromTx, getTxTimestamp, parseUSDC } from 'utils'

describe('LoansReader', () => {
  async function fixture(wallets: Wallet[]) {
    const portfolio = await managedPortfolioFixture(wallets)
    const reader = await new LoansReader__factory(wallets[0]).deploy()
    return { reader, ...portfolio }
  }

  const loadFixture = setupFixtureLoader()

  it('returns loans', async () => {
    async function createAndGetLoan(duration: number, principalAmount: number, repaymentAmount: number, recipient: string) {
      const tx = portfolio.createBulletLoan(duration, recipient, parseUSDC(principalAmount), parseUSDC(repaymentAmount))
      const loanId = await extractArgFromTx(tx, [portfolio.address, 'BulletLoanCreated', 'id'])
      const loanCreationTimestamp = await getTxTimestamp(await tx, provider)
      return [
        token.address,
        BulletLoanStatus.Issued,
        parseUSDC(principalAmount),
        parseUSDC(repaymentAmount),
        BigNumber.from(0),
        BigNumber.from(duration),
        BigNumber.from(loanCreationTimestamp + duration),
        recipient,
        loanId,
      ]
    }

    const { reader, portfolio, depositIntoPortfolio, wallet, other, bulletLoans, token, provider } = await loadFixture(fixture)
    await depositIntoPortfolio(1_000)

    const loan0 = await createAndGetLoan(10, 100, 110, other.address)
    const loan1 = await createAndGetLoan(10, 300, 330, wallet.address)

    const [readLoan0, readLoan1] = await reader.getLoans(bulletLoans.address, portfolio.address)

    assertLoanEquals(loan0, readLoan0)
    assertLoanEquals(loan1, readLoan1)
  })
})

function assertLoanEquals(loan, expected) {
  for (let i = 0; i < loan.length; i++) {
    expect(expected[i]).to.eq(loan[i])
  }
}

import { task } from 'hardhat/config.js'
import { ceth } from '../ceth'

task('accounts', 'Prints the list of accounts', async (_, hre) => {
  const accounts = await hre.viem.getWalletClients({ chain: ceth })

  for (const { account } of accounts) {
    console.log(account.address)
  }
})

import { IWallet } from './IWallet';
import { GenericTxProposal } from '../fees/GenericTxProposal';
import { IWalletConfig } from "./IWalletConfig";
import { CONFIG } from '../utils/config';
import { GenericBalance } from '../balances/GenericBalance';

/**
 * Don't use the generic wallet, for a new coin write an implementation
 */
export class GenericWallet implements IWallet {
  config: IWalletConfig;
  address: any = null;

  TRANSACTION_DRIVER_NAMESPACE: {
    [key: string]: any
  } = {}

  FEES_DRIVER_NAMESPACE: {
    [key: string]: any
  } = {}

  BALANCE_DRIVER_NAMESPACE: {
    [key: string]: any
  } = {}

  //
  constructor(config: IWalletConfig) {
    this.address = config.walletAddress;
    this.config = config;
  }
  //
  getAddress = () => {
    if (!this.address) {
      throw new Error('Wallet address not set!')
    }
    return this.address
  }
  getPrivateKey = () => {
    if (!this.config.privKey) {
      throw new Error('Wallet private key not set!')
    }
    return this.config.privKey
  }
  getCurrencySymbol = () => {
    if (!this.config.symbol) {
      throw new Error('Wallet currency not set!')
    }
    return this.config.symbol
  }
  getBlockchainSymbol = () => {
    if (!this.config.chain) {
      throw new Error('Wallet blockchain not set!')
    }
    return this.config.chain
  }
  // End of common functions
  getBalance = async () => {
    // Loop through the drivers to get the balance
    let drivers = CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.balance ?? [];
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.BALANCE_DRIVER_NAMESPACE[driverDescription.driver](driverDescription.config);
        let balance = await driver.getBalance(this.getAddress());
        if (balance) {
          return balance;
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }
    return new GenericBalance(this.getCurrencySymbol(), 0, 0);
  }
  // This is a send currency transaction
  getTxSendProposals = async (destination: string, valueToSend: any) => {
    // Loop through the drivers to get the fees
    let drivers = CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.fee ?? [];
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.FEES_DRIVER_NAMESPACE[driverDescription.driver](driverDescription.config);
        if(typeof driver.getTxSendProposals !== 'function') {
          continue;
        }
        let fees = await driver.getTxSendProposals(
          this.getAddress(), this.getPrivateKey(), destination, valueToSend
        );
        if (fees) {
          return fees;
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }
        continue;
      }
    }
    return null;
  }

  postTxSend = async (transactionProposal: GenericTxProposal): Promise<any> => {
    // Loop through the drivers to get the fees
    let drivers = CONFIG.CHAIN_ENDPOINTS[this.getBlockchainSymbol()]?.transaction ?? [];
    for (let i = 0; i < drivers.length; i++) {
      // Try all drivers in case one of them fails
      const driverDescription: any = drivers[i];
      try {
        var driver = new this.TRANSACTION_DRIVER_NAMESPACE[driverDescription.driver](driverDescription.config);
        let tx = await driver.send(transactionProposal);
        return tx;
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(e);
        }        
        continue;
      }
    }
    return null;
  }
}

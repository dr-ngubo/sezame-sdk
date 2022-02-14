import { Chains } from './chains';
import { IWalletConfig } from './wallets/IWalletConfig';
import { BitcoinWallet } from './wallets/types/BitcoinWallet';
import { EthereumWallet } from './wallets/types/EthereumWallet';
import { BscWallet } from './wallets/types/BscWallet';
import { PolygonWallet } from './wallets/types/PolygonWallet';
import { AvnWallet } from './wallets/types/AvnWallet';
import { AlephiumWallet } from './wallets/types/AlephiumWallet';

/**
 * Implements the Factory pattern to help generate easily wallets
 * for the supported blockchains.
 *
 * @export
 * @class WalletFactory
 */
export class WalletFactory {
  /**
   * Instantiates a wallet for the specified blockchain configuration options
   * Currently supports only BTC and ETH.
   *
   * @static
   * @param {IWalletConfig} config
   * @throws {Error} If config specifies an unsupported blockchain
   * @memberof WalletFactory
   */
  static getWallet = (config: IWalletConfig) => {
    let chain = config.chain;
    let wallet = null;
    switch (chain) {
      case Chains.BTC:
        wallet = new BitcoinWallet(config);
        break;
      case Chains.ETH:
        wallet = new EthereumWallet(config);
        break;
      case Chains.BSC:
        wallet = new BscWallet(config);
        break;
      case Chains.POLYGON:
        wallet = new PolygonWallet(config);
        break;
      case Chains.AVN:
        wallet = new AvnWallet(config);
        break;
      case Chains.ALPH:
        wallet = new AlephiumWallet(config);
        break;
      default:
        throw new Error('Unsupported wallet blockchain');
    }
    return wallet;
  };
}

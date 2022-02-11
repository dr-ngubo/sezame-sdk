// @ts-ignore
import hdkey from 'hdkey';
import { fromBase58, fromSeed } from 'bip32';
import { networks, payments } from 'bitcoinjs-lib';
import { mnemonicToSeed } from 'bip39';

import { BTC_DERIVATION_PATH, TESTNET_DERIVATION_PATH } from '../../constants';
import { CONFIG } from '../../utils/config';
import { GenericGenerator } from '../GenericGenerator';
import { WalletDescription } from '../../utils/types/WalletDescription';

/**
 *
 *
 * @export
 * @class BitcoinGenerator
 * @extends {GenericGenerator}
 */
export class BitcoinGenerator extends GenericGenerator {
  static async generateWalletXpub(mnemonic: any, config: any = CONFIG) {
    const hdwallet = hdkey.fromMasterSeed(
      await mnemonicToSeed(mnemonic),
      config.TESTNET ? networks.testnet.bip32 : networks.bitcoin.bip32
    );
    return hdwallet
      .derive(config.TESTNET ? TESTNET_DERIVATION_PATH : BTC_DERIVATION_PATH)
      .toJSON().xpub;
  }
  static async generatePrivateKeyFromMnemonic(
    mnemonic: any,
    derivation: any,
    config: any = CONFIG
  ) {
    const network = config.TESTNET ? networks.testnet : networks.bitcoin;
    return fromSeed(await mnemonicToSeed(mnemonic), network)
      .derivePath(
        config.TESTNET ? TESTNET_DERIVATION_PATH : BTC_DERIVATION_PATH
      )
      .derive(derivation)
      .toWIF();
  }
  static async generateAddressFromXPub(
    xpub: any,
    derivation: any,
    config: any = CONFIG
  ) {
    const network = config.TESTNET ? networks.testnet : networks.bitcoin;
    const w = fromBase58(xpub, network).derivePath(String(derivation));
    // p2wpkh | p2pkh
    const address = payments.p2wpkh({ pubkey: w.publicKey, network })
      .address as string;
    return address;
  }

  /**
   * Generate the public key / private key and wallet address
   *
   * @param {string} mnemonic Mnemoninc string
   * @param {number} derivation Derivation key
   * @param {*} config
   * @returns
   */
  static async generateWalletFromMnemonic(
    mnemonic: string,
    derivation: number,
    config: any = CONFIG
  ): Promise<WalletDescription> {
    const privateKey = await this.generatePrivateKeyFromMnemonic(
      mnemonic,
      derivation,
      config
    );
    const publicKey = await this.generateWalletXpub(mnemonic, config);
    const address = await this.generateAddressFromXPub(
      publicKey,
      derivation,
      config
    );

    return { privateKey, publicKey, address };
  }
}

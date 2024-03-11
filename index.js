const bs58 = require("bs58")
const bip39 = require('bip39');
const nacl = require("tweetnacl") // nacl
const ed25519 = require('ed25519-hd-key');
const web3 = require('@solana/web3.js');

// 这里就直接取第一个地址，solana的network_path_code为501
// 举例，我们这边取的派生地址使用“m/44'/501'/0'/0'”，你也可以使用其他的派生路径
// phantom 默认就是使用的“m/44'/501'/0'/0'”
const derivePath = "m/44'/501'/0'/0'"

const connection = new web3.Connection(
    "https://broken-stylish-friday.solana-devnet.quiknode.pro/a4d359d255ec88c9c952255bf9d0f3ba1f5fb33c/",
    'confirmed',
);

class Wallet {
    constructor(mnemonic, privateKey, publicKey) {
        this.mnemonic = mnemonic;
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }
}

// 创建钱包
function create_wallet(){
    let mnemonic =bip39.generateMnemonic()
    console.log("mnemonic: ", mnemonic)

    return import_wallet_from_mnemonic(mnemonic)
}

// 通过助记词导入钱包
function import_wallet_from_mnemonic(mnemonic) {
    // 先根据助记词获取seed
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const derivedSeed = ed25519.derivePath(derivePath, seed.toString('hex')).key
    // 得到私钥和地址
    let privateKey = bs58.encode(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey)
    let publicKey = bs58.encode(nacl.sign.keyPair.fromSeed(derivedSeed).publicKey)
    console.log("privateKey: ", privateKey)
    console.log("publicKey: ", publicKey)
    return new Wallet(mnemonic, privateKey, publicKey)
}

// 通过私钥导入钱包
function import_wallet_from_privateKey(privateKey) {
    let secretKey = bs58.decode(privateKey);
    let publicKey = bs58.encode(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey)
    console.log("privateKey: ", privateKey)
    console.log("publicKey: ", publicKey)
    return new Wallet("", privateKey, publicKey)
}

// 发送sol交易
function sendTx(fromWallet, toPublicKey, amount){
    (async () => {
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
              fromPubkey: new web3.PublicKey(fromWallet.publicKey),
              toPubkey: new web3.PublicKey(toPublicKey),
              lamports: amount * web3.LAMPORTS_PER_SOL,
            }),
        );

        // Sign transaction, broadcast, and confirm
        const secretKey = bs58.decode(fromWallet.privateKey);
        const signature = await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [web3.Keypair.fromSecretKey(new Uint8Array(secretKey))],
        );

        console.log('SIGNATURE', signature);
    })()
}

// create_wallet()
mnemonic = "demand renew useless will good glory steel arena illegal horn width horror"
privateKey = "5PjHnpUoEJQhka7VX8YwYz7AmxkQTzJXCpvYYEEZwQNFcARxshr4QVjQtEKFh41B8dAx5j6b98mEfxkUCcgmZjag"
// publicKey = "FPDxr4GqiaeLdnfdnQEsTT2x5QwnJ6gWV8UbuTXd6Bvx"
wallet = import_wallet_from_mnemonic(mnemonic)
sendTx(wallet, "4eY1fadZ6SqkRhDFfJCLuaTHrA6qbNq49aimrk5cibJf", 0.0001)

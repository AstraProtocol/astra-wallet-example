import { SigningCosmosClient } from '@cosmjs/launchpad'
import {
    DirectSecp256k1HdWallet
} from '@cosmjs/proto-signing'

import {
    assertIsBroadcastTxSuccess,
    SigningStargateClient,
} from '@cosmjs/stargate'

window.onload = async () => {
    // Keplr extension injects the offline signer that is compatible with cosmJS.
    // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
    // And it also injects the helper function to `window.keplr`.
    // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install Astra Wallet extension");
    }

    const chainId = "dev-sentry-1";

    // You should request Keplr to enable the wallet.
    // This method will ask the user whether or not to allow access if they haven't visited this website.
    // Also, it will request user to unlock the wallet if the wallet is locked.
    // If you don't request enabling before usage, there is no guarantee that other methods will work.
    await window.keplr.enable(chainId);

    const offlineSigner = window.getOfflineSigner(chainId);

    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    const accounts = await offlineSigner.getAccounts();

    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    const cosmJS = new SigningCosmosClient(
        "https://node.astra.bar",
        accounts[0].address,
        offlineSigner,
    );

    //document.getElementById("address").append(accounts[0].address);
};

document.sendForm.onsubmit = () => {
    let recipient = document.sendForm.recipient.value;
    let amount = document.sendForm.amount.value;
    // let memo = document.sendForm.memo.value;

    amount = parseFloat(amount);
    if (isNaN(amount)) {
        alert("Invalid amount");
        return false;
    }

    amount *= 1000000;
    amount = Math.floor(amount);

    (async () => {
        // See above.
        const chainId = "dev-sentry-1";
        await window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();

        const client = await SigningStargateClient.connectWithSigner(
            "https://node.astra.bar",
            offlineSigner
        )

        const amountFinal = {
            denom: 'stake',
            amount: amount.toString(),
        }
        const fee = {
            amount: [{
                denom: 'stake',
                amount: '5000',
            }, ],
            gas: '200000',
        }
        const result = await client.sendTokens(accounts[0].address, recipient, [amountFinal], fee, "")
        assertIsBroadcastTxSuccess(result)

        if (result.code !== undefined &&
            result.code !== 0) {
            alert("Failed to send tx: " + result.log || result.rawLog);
        } else {
            alert("Succeed to send tx:" + result.transactionHash);
        }
    })();

    return false;
};

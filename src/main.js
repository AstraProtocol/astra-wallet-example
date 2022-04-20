import { getAccounts, getAccountBalance, sendTx, subscribeAccountsChangeEvent } from "astra-wallet-sdk";

subscribeAccountsChangeEvent(async (updatedAccounts) => {
  const balance = await getAccountBalance(updatedAccounts[0].address);
  document.getElementById("address").innerHTML = updatedAccounts[0].address;
  document.getElementById("balance").innerHTML = balance;
});

window.onload = async () => {
  try {
    const accounts = await getAccounts();
    const balance = await getAccountBalance(accounts[0].address);
    document.getElementById("address").innerHTML = accounts[0].address;
    document.getElementById("balance").innerHTML = balance;
  } catch (error) {
    alert(error);
  }
};

document.sendForm.onsubmit = () => {
  let recipientAddress = document.sendForm.recipient.value;
  let amount = document.sendForm.amount.value;

  amount = parseFloat(amount);
  if (isNaN(amount)) {
    alert("Invalid amount");
    return false;
  }

  (async () => {
    try {
      const accounts = await getAccounts();
      const result = await sendTx({
        amount,
        recipientAddress,
        senderAddress: accounts[0].address,
        amount,
      });
      alert("Succeed to send tx:" + Buffer.from(result.transactionHash).toString("hex").toUpperCase());
    } catch (error) {
      alert("Failed to send tx: " + error);
    }
  })();

  return false;
};

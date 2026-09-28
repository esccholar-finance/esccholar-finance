import { db } from "../db/database";

function getDateCode(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}${month}${year}`;
}

export async function generateTransactionNumber(date = new Date()) {
  const dateCode = getDateCode(date);

  const [payments, transactions] = await Promise.all([
    db.payments.toArray(),
    db.transactions.toArray(),
  ]);

  const existingNumbers = [
    ...payments.map((payment) => payment.transactionNumber),
    ...transactions.map(
      (transaction) => transaction.transactionNumber,
    ),
  ];

  const sequenceNumbers = existingNumbers
    .map((number) => {
      if (typeof number !== "string") {
        return 0;
      }

      const match = number.match(/^EF(\d+)(\d{6})$/);

      if (!match || match[2] !== dateCode) {
        return 0;
      }

      return Number(match[1]);
    })
    .filter((number) => Number.isFinite(number));

  const nextSequence =
    sequenceNumbers.length > 0
      ? Math.max(...sequenceNumbers) + 1
      : 1;

  return `EF${nextSequence}${dateCode}`;
}

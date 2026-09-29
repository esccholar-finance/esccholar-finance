export function money(value: number) {
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

export function todayString() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

export function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export function dueStatus(
  payment: {
    amount: number;
    paidAmount?: number;
    dueDate: string;
  },
) {
  const paid = payment.paidAmount ?? 0;

  if (paid >= payment.amount) {
    return "Completed";
  }

  const today = todayString();

  if (payment.dueDate < today) {
    return "Overdue";
  }

  if (payment.dueDate === today) {
    return "Due";
  }

  return "Upcoming";
}

export function daysOverdue(date: string) {
  const today = new Date(`${todayString()}T00:00:00`);
  const due = new Date(`${date}T00:00:00`);

  return Math.max(
    0,
    Math.floor(
      (today.getTime() - due.getTime()) / 86400000,
    ),
  );
}

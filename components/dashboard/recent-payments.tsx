import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { linkCopy } from "@/lib/constants/copy";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

type RecentPaymentItem = {
  id: string;
  payer_email: string | null;
  amount_paid: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paid_at: string | null;
};

export function RecentPayments({ payments }: { payments: RecentPaymentItem[] }) {
  return (
    <Card className="border-white/10 bg-[#1a1a1a] text-white">
      <CardHeader>
        <CardTitle>{linkCopy.analytics.recentPaymentsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-400">{linkCopy.analytics.noPayments}</p>
        ) : (
          <Table>
            <TableHeader className="[&_tr]:border-white/10">
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-white/5 hover:bg-white/5">
                  <TableCell>{payment.payer_email ?? "—"}</TableCell>
                  <TableCell>{formatCurrency(payment.amount_paid, payment.currency)}</TableCell>
                  <TableCell className="capitalize">{payment.status}</TableCell>
                  <TableCell>{formatDateTime(payment.paid_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
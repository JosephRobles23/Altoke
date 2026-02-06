import { SendMoneyForm } from '@/components/dashboard/SendMoneyForm';

export default function SendPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enviar Dinero</h1>
        <p className="text-muted-foreground">
          Envía USDC a otro usuario de forma rápida y segura
        </p>
      </div>

      <SendMoneyForm />
    </div>
  );
}

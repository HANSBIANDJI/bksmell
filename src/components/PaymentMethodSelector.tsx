import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
};

export interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod: string | null;
  onSelect: (methodId: string) => void;
}

export function PaymentMethodSelector({
  methods,
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mode de paiement</h3>
      <RadioGroup
        value={selectedMethod || undefined}
        onValueChange={onSelect}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {methods.map((method) => (
          <div key={method.id} className="relative">
            <RadioGroupItem
              value={method.id}
              id={method.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={method.id}
              className="flex items-center justify-between rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-8 w-8">
                  <Image
                    src={method.icon}
                    alt={method.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="font-medium">{method.name}</div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
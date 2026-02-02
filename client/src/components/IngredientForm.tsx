import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIngredientSchema } from "@shared/schema";
import { type CreateIngredientRequest } from "@shared/routes";
import { useCreateIngredient } from "@/hooks/use-inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// Create a coerced schema for form validation
const formSchema = insertIngredientSchema.extend({
  quantity: z.coerce.number().min(0),
  packageSize: z.coerce.number().min(1),
  minStockLevel: z.coerce.number().min(0),
});

export function IngredientForm() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateIngredient();
  
  const form = useForm<CreateIngredientRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      unit: "g",
      quantity: 0,
      packageSize: 1000,
      minStockLevel: 10,
    },
  });

  function onSubmit(data: CreateIngredientRequest) {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-gradient gap-2">
          <Plus className="h-4 w-4" />
          Novo Ingrediente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Ingrediente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Farinha de Trigo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Inicial</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="packageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho do Pacote</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="kg, g, l, un" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo (Alerta)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full btn-gradient" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Ingrediente"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

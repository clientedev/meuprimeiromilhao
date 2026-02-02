import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIngredientSchema } from "@shared/schema";
import { type CreateIngredientRequest } from "@shared/routes";
import { useCreateIngredient, useUpdateIngredient } from "@/hooks/use-inventory";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { type Ingredient } from "@shared/schema";

// Create a coerced schema for form validation
const formSchema = insertIngredientSchema.extend({
  quantity: z.coerce.number().min(0),
  packageSize: z.coerce.number().min(1),
  minStockLevel: z.coerce.number().min(0),
});

interface IngredientFormProps {
  ingredient?: Ingredient;
  trigger?: React.ReactNode;
}

export function IngredientForm({ ingredient, trigger }: IngredientFormProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  
  const isEditing = !!ingredient;

  const form = useForm<CreateIngredientRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      unit: "g",
      quantity: 0,
      packageSize: 1000,
      packageLabel: "pacote",
      minStockLevel: 10,
    },
  });

  useEffect(() => {
    if (ingredient && open) {
      form.reset({
        name: ingredient.name,
        unit: ingredient.unit,
        quantity: ingredient.quantity,
        packageSize: ingredient.packageSize,
        packageLabel: ingredient.packageLabel,
        minStockLevel: ingredient.minStockLevel ?? 10,
      });
    }
  }, [ingredient, open, form]);

  function onSubmit(data: CreateIngredientRequest) {
    if (isEditing && ingredient) {
      updateMutation.mutate(
        { id: ingredient.id, ...data },
        {
          onSuccess: () => {
            setOpen(false);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="btn-gradient gap-2">
            <Plus className="h-4 w-4" />
            Novo Ingrediente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Ingrediente" : "Adicionar Ingrediente"}</DialogTitle>
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

            <FormField
              control={form.control}
              name="packageLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Embalagem</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pacote">Pacote</SelectItem>
                      <SelectItem value="caixa">Caixa</SelectItem>
                      <SelectItem value="garrafa">Garrafa</SelectItem>
                      <SelectItem value="pote">Pote</SelectItem>
                      <SelectItem value="unidade">Unidade</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

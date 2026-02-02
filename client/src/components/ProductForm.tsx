import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { useIngredients, useCreateProduct } from "@/hooks/use-inventory";
import { cn } from "@/lib/utils";
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
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// Complex schema handling the relations
const productFormSchema = insertProductSchema.extend({
  price: z.coerce.number().min(0),
  ingredients: z.array(z.object({
    ingredientId: z.coerce.number(),
    quantityRequired: z.coerce.number().min(1)
  })).optional()
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductForm() {
  const [open, setOpen] = useState(false);
  const { data: ingredients } = useIngredients();
  const { mutate, isPending } = useCreateProduct();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      ingredients: []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients"
  });

  const selectedIngredients = form.watch("ingredients") || [];
  const totalCost = selectedIngredients.reduce((sum, item) => {
    const ingredient = ingredients?.find(i => i.id === Number(item.ingredientId));
    if (!ingredient || !ingredient.packagePrice || !ingredient.packageSize) return sum;
    const pricePerUnit = ingredient.packagePrice / ingredient.packageSize;
    return sum + (pricePerUnit * item.quantityRequired);
  }, 0);

  const salePrice = form.watch("price") || 0;
  const profit = salePrice - totalCost;
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  function onSubmit(data: ProductFormValues) {
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
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Produto</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informações Básicas</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pizza Calabresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value) * 100) || 0)}
                          value={field.value / 100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Curta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingredientes principais..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 bg-muted rounded-xl space-y-2 border shadow-inner">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Custo de Produção:</span>
                  <span className="font-semibold text-foreground">R$ {(totalCost / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border/50 pt-2">
                  <span className="text-muted-foreground">Lucro por Unidade:</span>
                  <span className={cn("font-bold", profit > 0 ? "text-green-600" : "text-destructive")}>
                    R$ {(profit / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Margem:</span>
                  <span className={cn("px-1.5 py-0.5 rounded-md font-medium", profit > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300")}>
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Composição (Receita)</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ ingredientId: 0, quantityRequired: 1 })}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Ingrediente
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end p-3 bg-muted/30 rounded-lg border border-border/50">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.ingredientId`}
                    render={({ field: selectField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Ingrediente</FormLabel>
                        <Select 
                          onValueChange={selectField.onChange} 
                          defaultValue={String(selectField.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ingredients?.map((i) => (
                              <SelectItem key={i.id} value={String(i.id)}>
                                {i.name} ({i.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantityRequired`}
                    render={({ field: numberField }) => (
                      <FormItem className="w-24">
                        <FormLabel className="text-xs">Qtd.</FormLabel>
                        <FormControl>
                          <Input type="number" {...numberField} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed">
                  Nenhum ingrediente adicionado à receita.
                </div>
              )}
            </div>

            <Button type="submit" className="w-full btn-gradient mt-4" disabled={isPending}>
              {isPending ? "Criando..." : "Criar Produto"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

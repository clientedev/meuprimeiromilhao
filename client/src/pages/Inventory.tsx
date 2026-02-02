import { useIngredients, useUpdateIngredient, useDeleteIngredient } from "@/hooks/use-inventory";
import { IngredientForm } from "@/components/IngredientForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, PackageOpen, AlertTriangle, RefreshCcw, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const { data: ingredients, isLoading } = useIngredients();
  const [searchTerm, setSearchTerm] = useState("");
  const deleteMutation = useDeleteIngredient();

  const formatQuantity = (qty: number, unit: string) => {
    if (unit === "g" && qty >= 1000) return `${(qty / 1000).toFixed(2)}kg`;
    if (unit === "ml" && qty >= 1000) return `${(qty / 1000).toFixed(2)}L`;
    return `${qty}${unit}`;
  };

  const getPackageInfo = (ingredient: any) => {
    if (ingredient.unit === "un") return null;
    const fullPackages = Math.floor(ingredient.quantity / ingredient.packageSize);
    const remaining = ingredient.quantity % ingredient.packageSize;
    const label = ingredient.packageLabel || "pacote";
    const pluralLabel = label === "unidade" ? "unidades" : label + "s";
    
    const packageText = fullPackages === 1 ? `1 ${label}` : `${fullPackages} ${pluralLabel}`;
    
    if (fullPackages === 0) return `${formatQuantity(remaining, ingredient.unit)} no aberto`;
    return `${packageText} fechados e ${formatQuantity(remaining, ingredient.unit)} no aberto`;
  };

  const filteredIngredients = ingredients?.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground">Estoque de Ingredientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus insumos e níveis de estoque.</p>
        </div>
        <IngredientForm />
      </div>

      <div className="flex items-center gap-4 bg-card p-2 rounded-xl border shadow-sm max-w-md">
        <Search className="w-5 h-5 text-muted-foreground ml-2" />
        <Input 
          placeholder="Buscar ingrediente..." 
          className="border-none shadow-none focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[30%]">Nome</TableHead>
              <TableHead>Quantidade Atual</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <PackageOpen className="h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhum ingrediente encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredIngredients?.map((ingredient) => {
              const isLowStock = ingredient.quantity <= (ingredient.minStockLevel || 0);
              const packageInfo = getPackageInfo(ingredient);
              return (
                <TableRow key={ingredient.id} className="group">
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-lg font-semibold text-foreground">{ingredient.name}</div>
                      {packageInfo && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary font-medium text-xs border border-primary/20 shadow-sm">
                            {packageInfo}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-bold font-mono text-lg",
                      isLowStock ? "text-destructive" : "text-green-600"
                    )}>
                      {formatQuantity(ingredient.quantity, ingredient.unit)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ingredient.unit}</TableCell>
                  <TableCell>
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <AlertTriangle className="w-3 h-3" /> Baixo Estoque
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Normal
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <RestockDialog ingredient={ingredient} />
                      <IngredientForm 
                        ingredient={ingredient} 
                        trigger={
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir?')) {
                            deleteMutation.mutate(ingredient.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RestockDialog({ ingredient }: { ingredient: any }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const updateMutation = useUpdateIngredient();

  const handleUpdate = () => {
    const value = parseFloat(amount);
    if (isNaN(value)) return;
    
    updateMutation.mutate(
      { id: ingredient.id, quantity: ingredient.quantity + value },
      { onSuccess: () => { setOpen(false); setAmount(""); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <RefreshCcw className="h-3 w-3 mr-2" /> Repor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Repor {ingredient.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">Atual:</span>
             <span className="font-bold">{ingredient.quantity} {ingredient.unit}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Adicionar Quantidade</label>
            <Input 
              type="number" 
              placeholder="0" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              autoFocus
            />
          </div>
          <Button onClick={handleUpdate} className="w-full btn-gradient" disabled={updateMutation.isPending}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

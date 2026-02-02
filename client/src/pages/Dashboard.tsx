import { useIngredients, useProducts } from "@/hooks/use-inventory";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, AlertTriangle, TrendingUp, Pizza } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: ingredients } = useIngredients();
  const { data: products } = useProducts();

  const lowStockItems = ingredients?.filter(i => i.quantity <= (i.minStockLevel || 0)) || [];
  
  // Prepare chart data: Top 10 ingredients by quantity
  const chartData = ingredients
    ?.sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map(i => ({
      name: i.name,
      quantity: i.quantity,
      min: i.minStockLevel
    }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao Estoque Vivo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Produtos" 
          value={products?.length || 0} 
          icon={Pizza} 
          className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
        />
        <StatCard 
          title="Total Ingredientes" 
          value={ingredients?.length || 0} 
          icon={Package} 
          className="bg-white dark:bg-slate-800 border-border"
        />
        <StatCard 
          title="Baixo Estoque" 
          value={lowStockItems.length} 
          icon={AlertTriangle} 
          className={cn(
            "border-border",
            lowStockItems.length > 0 
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200" 
              : "bg-white dark:bg-slate-800 text-green-600"
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-lg mb-6">Níveis de Estoque (Top 10)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderRadius: '8px', 
                    border: '1px solid hsl(var(--border))',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                <Bar 
                  dataKey="quantity" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-lg">Alertas de Reposição</h3>
          </div>
          
          <div className="space-y-4">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <TrendingUp className="h-10 w-10 mx-auto mb-2 text-green-500 opacity-50" />
                <p>Tudo certo! Estoque saudável.</p>
              </div>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">{item.name}</p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Mínimo: {item.minStockLevel} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-lg text-red-600 dark:text-red-400">
                      {item.quantity}
                    </span>
                    <span className="text-[10px] text-red-600/70 uppercase font-bold">Atual</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className }: any) {
  return (
    <div className={cn("p-6 rounded-2xl shadow-sm border flex items-center gap-4", className)}>
      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <p className="text-3xl font-display font-bold">{value}</p>
      </div>
    </div>
  );
}

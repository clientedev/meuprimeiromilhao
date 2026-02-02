import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Users, 
  Store, 
  TrendingUp, 
  LogOut,
  Pizza,
  Utensils,
  ChefHat
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tenant } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
    fetchTenants();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await apiRequest("GET", "/api/admin/me");
      const data = await response.json();
      if (!data.isAdmin) {
        setLocation("/admin");
      }
      setAdmin(data);
    } catch {
      setLocation("/admin");
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await apiRequest("GET", "/api/admin/tenants");
      const data = await response.json();
      setTenants(data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setLocation("/admin");
    } catch (error) {
      toast({
        title: "Erro ao sair",
        variant: "destructive",
      });
    }
  };

  const getCompanyTypeIcon = (type: string) => {
    switch (type) {
      case "pizza": return <Pizza className="h-4 w-4" />;
      case "hamburger": return <ChefHat className="h-4 w-4" />;
      default: return <Utensils className="h-4 w-4" />;
    }
  };

  const getCompanyTypeLabel = (type: string) => {
    switch (type) {
      case "pizza": return "Pizzaria";
      case "hamburger": return "Hamburgueria";
      default: return "Restaurante";
    }
  };

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.subscriptionActive).length,
    pizzarias: tenants.filter(t => t.companyType === "pizza").length,
    hamburguerias: tenants.filter(t => t.companyType === "hamburger").length,
    restaurantes: tenants.filter(t => t.companyType === "restaurant").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-white">Painel Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              Olá, {admin?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-white mb-8">Dashboard Administrativo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Assinaturas Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.active}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Pizzarias</CardTitle>
              <Pizza className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.pizzarias}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Hamburguerias</CardTitle>
              <ChefHat className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.hamburguerias}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Store className="h-5 w-5" />
              Clientes Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Empresa</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Tipo</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Responsável</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-white font-medium">{tenant.companyName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          {getCompanyTypeIcon(tenant.companyType)}
                          {getCompanyTypeLabel(tenant.companyType)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{tenant.name}</td>
                      <td className="py-3 px-4 text-slate-400">{tenant.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={tenant.subscriptionActive ? "default" : "secondary"}>
                          {tenant.subscriptionActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhum cliente cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

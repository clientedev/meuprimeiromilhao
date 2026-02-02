import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/admin/login", data);
      const admin = await response.json();
      if (admin && admin.isAdmin) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao painel administrativo.",
        });
        setLocation("/admin/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas ou sem permissão de administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-primary p-3 rounded-xl">
            <ShieldCheck className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-slate-400">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Email</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400" 
                          placeholder="admin@estoquevivo.com"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          className="bg-slate-700/50 border-slate-600 text-white" 
                          placeholder="••••••••"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full btn-gradient mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? "Verificando..." : "Acessar Painel Admin"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          Área restrita para administradores do sistema
        </p>
      </div>
    </div>
  );
}

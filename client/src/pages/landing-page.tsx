import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChefHat, BarChart3, Palette, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">Estoque Vivo</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button className="btn-gradient">Começar Agora</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6">
            O coração do seu <span className="text-primary">Restaurante</span> em um só lugar.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Controle de estoque inteligente, cálculo de lucro real e gestão de receitas para pizzarias, hamburguerias e restaurantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=register">
              <Button size="lg" className="btn-gradient h-14 px-8 text-lg rounded-xl">
                Criar minha conta grátis
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BarChart3}
              title="Lucro Real"
              description="Saiba exatamente quanto custa cada prato e qual sua margem de lucro em tempo real."
            />
            <FeatureCard 
              icon={Zap}
              title="Estoque Automático"
              description="Vendeu? O sistema abate os ingredientes automaticamente com base na sua receita."
            />
            <FeatureCard 
              icon={Palette}
              title="Sua Marca"
              description="Personalize o painel com as cores e o logo da sua empresa."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-12">Planos Simples para Crescer</h2>
          <div className="max-w-md mx-auto bg-card border rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-bl-xl">
              Mais Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Plano Pro</h3>
            <div className="text-4xl font-display font-bold mb-6">R$ 49,90<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            <ul className="text-left space-y-4 mb-8">
              <PricingItem text="Produtos ilimitados" />
              <PricingItem text="Controle de estoque avançado" />
              <PricingItem text="Cálculo de margem de lucro" />
              <PricingItem text="Personalização de marca" />
              <PricingItem text="Suporte prioritário" />
            </ul>
            <Link href="/auth?tab=register">
              <Button className="w-full btn-gradient h-12 text-lg">Assinar Agora</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="bg-card p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-muted-foreground">
      <ShieldCheck className="h-5 w-5 text-green-500" />
      {text}
    </li>
  );
}

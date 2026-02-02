import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ChefHat, 
  BarChart3, 
  Palette, 
  ShieldCheck, 
  Zap, 
  Pizza, 
  Beef, 
  Utensils, 
  TrendingUp,
  Package,
  Calculator,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
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

      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 text-center max-w-5xl relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            Sistema completo de gestão para food service
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6">
            O coração do seu <span className="text-primary">Negócio Gastronômico</span> em um só lugar.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Controle de estoque inteligente, cálculo de lucro real e gestão de receitas para 
            <span className="text-primary font-semibold"> pizzarias</span>, 
            <span className="text-primary font-semibold"> hamburguerias</span> e 
            <span className="text-primary font-semibold"> restaurantes</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=register">
              <Button size="lg" className="btn-gradient h-14 px-8 text-lg rounded-xl">
                Criar minha conta grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl">
              Ver Demonstração
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Configuração em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Suporte em português</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Perfeito para o seu tipo de negócio
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              O Estoque Vivo se adapta às necessidades específicas de cada segmento gastronômico
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BusinessTypeCard
              icon={Pizza}
              title="Pizzarias"
              description="Controle massas, molhos, queijos e todos os ingredientes das suas pizzas. Calcule o custo real de cada sabor."
              examples={[
                "Gestão de bordas e recheios especiais",
                "Custo por pizza (tradicional, média, grande)",
                "Controle de queijos (mussarela, parmesão, cheddar)",
                "Estoque de massas pré-prontas",
                "Acompanhamento de delivery por sabor"
              ]}
              color="from-orange-500 to-red-500"
            />
            
            <BusinessTypeCard
              icon={Beef}
              title="Hamburguerias"
              description="Gerencie cortes de carne, pães artesanais, molhos especiais e todos os ingredientes dos seus burgers."
              examples={[
                "Custo por tipo de blend de carne",
                "Controle de pães (brioche, australiano, etc)",
                "Gestão de molhos da casa",
                "Acompanhamentos (batata, onion rings)",
                "Margem por tamanho do burger"
              ]}
              color="from-amber-500 to-yellow-600"
            />
            
            <BusinessTypeCard
              icon={Utensils}
              title="Restaurantes"
              description="Administre o estoque completo do seu restaurante, desde entradas até sobremesas."
              examples={[
                "Custo por prato do cardápio",
                "Gestão de proteínas e carnes",
                "Controle de guarnições",
                "Estoque de bebidas",
                "Ficha técnica completa de cada receita"
              ]}
              color="from-emerald-500 to-teal-500"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Funcionalidades que fazem a diferença
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tudo que você precisa para ter controle total do seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BarChart3}
              title="Lucro Real por Produto"
              description="Saiba exatamente quanto custa cada prato e qual sua margem de lucro em tempo real. Tome decisões baseadas em dados."
            />
            <FeatureCard 
              icon={Zap}
              title="Estoque Automático"
              description="Vendeu? O sistema abate os ingredientes automaticamente com base na sua receita cadastrada."
            />
            <FeatureCard 
              icon={Calculator}
              title="Ficha Técnica Completa"
              description="Cadastre suas receitas com todos os ingredientes e quantidades exatas. O custo é calculado automaticamente."
            />
            <FeatureCard 
              icon={Package}
              title="Alertas de Estoque Baixo"
              description="Receba notificações quando algum ingrediente estiver acabando. Nunca mais perca uma venda por falta de produto."
            />
            <FeatureCard 
              icon={Palette}
              title="Sua Marca, Seu Sistema"
              description="Personalize o painel com as cores e o logo da sua empresa. Tenha uma experiência única."
            />
            <FeatureCard 
              icon={TrendingUp}
              title="Relatórios Inteligentes"
              description="Acompanhe vendas, custos e lucros com gráficos e relatórios que facilitam a gestão do dia a dia."
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Exemplos Práticos de Uso
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Veja como o Estoque Vivo resolve problemas reais do seu dia a dia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <ExampleCard
              title="Pizza Margherita"
              type="Pizzaria"
              icon={Pizza}
              items={[
                { name: "Massa (300g)", cost: "R$ 2,50" },
                { name: "Molho de tomate (100g)", cost: "R$ 1,20" },
                { name: "Mussarela (200g)", cost: "R$ 6,00" },
                { name: "Manjericão (10g)", cost: "R$ 0,30" },
                { name: "Azeite (10ml)", cost: "R$ 0,50" },
              ]}
              totalCost="R$ 10,50"
              salePrice="R$ 45,00"
              profit="R$ 34,50"
              margin="76%"
            />
            
            <ExampleCard
              title="Smash Burger Duplo"
              type="Hamburgueria"
              icon={Beef}
              items={[
                { name: "Pão brioche", cost: "R$ 2,00" },
                { name: "2x Blend 80g", cost: "R$ 8,00" },
                { name: "2x Queijo cheddar", cost: "R$ 2,50" },
                { name: "Bacon (30g)", cost: "R$ 2,00" },
                { name: "Molho especial", cost: "R$ 0,80" },
              ]}
              totalCost="R$ 15,30"
              salePrice="R$ 38,00"
              profit="R$ 22,70"
              margin="60%"
            />

            <ExampleCard
              title="Filé à Parmegiana"
              type="Restaurante"
              icon={Utensils}
              items={[
                { name: "Filé mignon (200g)", cost: "R$ 18,00" },
                { name: "Empanamento", cost: "R$ 1,50" },
                { name: "Molho e queijo", cost: "R$ 4,00" },
                { name: "Arroz e fritas", cost: "R$ 3,00" },
                { name: "Salada", cost: "R$ 2,00" },
              ]}
              totalCost="R$ 28,50"
              salePrice="R$ 65,00"
              profit="R$ 36,50"
              margin="56%"
            />

            <ExampleCard
              title="Combo Família"
              type="Pizzaria"
              icon={Pizza}
              items={[
                { name: "Pizza Grande", cost: "R$ 14,00" },
                { name: "Pizza Média", cost: "R$ 10,00" },
                { name: "Refrigerante 2L", cost: "R$ 4,50" },
                { name: "Borda recheada", cost: "R$ 3,00" },
                { name: "Embalagem", cost: "R$ 1,50" },
              ]}
              totalCost="R$ 33,00"
              salePrice="R$ 89,90"
              profit="R$ 56,90"
              margin="63%"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Por que escolher o Estoque Vivo?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard icon={Clock} value="5 min" label="para configurar" />
            <StatCard icon={Package} value="100%" label="controle do estoque" />
            <StatCard icon={Calculator} value="Lucro" label="calculado automaticamente" />
            <StatCard icon={Users} value="24/7" label="suporte dedicado" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Planos Simples para Crescer</h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho do seu negócio
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-card border rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-2">Plano Starter</h3>
              <div className="text-3xl font-display font-bold mb-6">
                Grátis
                <span className="text-sm font-normal text-muted-foreground"> para sempre</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <PricingItem text="Até 20 produtos" />
                <PricingItem text="Até 50 ingredientes" />
                <PricingItem text="Controle de estoque básico" />
                <PricingItem text="Cálculo de custo" />
              </ul>
              <Link href="/auth?tab=register">
                <Button variant="outline" className="w-full h-12 text-lg">Começar Grátis</Button>
              </Link>
            </div>

            <div className="bg-card border rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-bl-xl">
                Mais Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Plano Pro</h3>
              <div className="text-3xl font-display font-bold mb-6">
                R$ 49,90
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <PricingItem text="Produtos ilimitados" />
                <PricingItem text="Ingredientes ilimitados" />
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
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Pronto para revolucionar a gestão do seu negócio?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de estabelecimentos que já controlam seus custos e maximizam seus lucros.
          </p>
          <Link href="/auth?tab=register">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-xl">
              Criar conta grátis agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary p-1 rounded-lg">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Estoque Vivo</span>
          </div>
          <p className="text-sm">
            © 2024 Estoque Vivo. Todos os direitos reservados.
          </p>
        </div>
      </footer>
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

function BusinessTypeCard({ icon: Icon, title, description, examples, color }: any) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      <CardContent className="p-8">
        <div className={`bg-gradient-to-r ${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white`}>
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-2">
          {examples.map((example: string, index: number) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              {example}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ExampleCard({ title, type, icon: Icon, items, totalCost, salePrice, profit, margin }: any) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-lg">{title}</h4>
            <span className="text-xs text-muted-foreground">{type}</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-4 border-b pb-4">
          {items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.name}</span>
              <span>{item.cost}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Custo Total:</span>
            <span className="text-red-500 font-medium">{totalCost}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Preço de Venda:</span>
            <span className="font-medium">{salePrice}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="font-bold text-green-600">Lucro:</span>
            <span className="font-bold text-green-600">{profit} ({margin})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, value, label }: any) {
  return (
    <div className="text-center p-6">
      <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
        <Icon className="h-8 w-8" />
      </div>
      <div className="text-3xl font-display font-bold mb-1">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-muted-foreground">
      <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
      {text}
    </li>
  );
}

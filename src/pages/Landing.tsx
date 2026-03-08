import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Brain, AlertTriangle, Calculator, FileText, ArrowRight, BarChart3, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`font-mono text-3xl font-bold text-primary transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {visible ? target : '0'}{suffix}
    </div>
  );
}

const features = [
  { icon: BookOpen, title: 'Trade Logging', desc: 'Capture every trade with precision — entry, exit, quantity, and sentiment.' },
  { icon: Brain, title: 'Sentiment Tracking', desc: 'Tag each trade with market mood to find your edge.' },
  { icon: AlertTriangle, title: 'Violation Tracker', desc: 'Track discipline breaches and build better habits.' },
  { icon: TrendingUp, title: 'P&L Analytics', desc: 'Visualize your performance with rich charts and insights.' },
  { icon: Calculator, title: 'Brokerage Calculator', desc: 'Track hidden costs eating into your profits.' },
  { icon: FileText, title: 'Daily Notes', desc: 'Journal your observations and lessons learned.' },
];

const stats = [
  { value: '10,000+', label: 'Trades Logged' },
  { value: '500+', label: 'Active Traders' },
  { value: '₹0', label: 'Data Sold' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">Digital Trade Book</span>
          </div>
          <Link to="/auth">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(37_90%_55%_/_0.06),transparent_70%)]" />
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-2">
              Your Trades. Your Story.
              <br />
              <span className="text-primary relative">
                Your Edge.
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/60 rounded-full" />
              </span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Digital Trade Book — The professional trading diary built for serious traders.
            </p>
            <div className="mt-10">
              <Link to="/auth">
                <Button size="lg" className="text-base px-8 py-6 gap-2 glow-amber">
                  Start Trading Smarter <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            Built by traders, for traders. Every feature designed to sharpen your edge.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass-card p-6 hover:glow-border transition-all duration-300 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <AnimatedCounter target={s.value} />
                <p className="text-muted-foreground mt-2 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-heading font-semibold">Digital Trade Book</span>
          </div>
          <p className="text-muted-foreground text-sm">Trade with memory. Grow with clarity.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/auth" className="hover:text-primary transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

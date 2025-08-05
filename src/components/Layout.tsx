import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationProvider } from "@/components/notificacoes/NotificationProvider";
import { Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const navigationItems = [
  { title: "Dashboard", href: "/" },
  { title: "Agendamentos", href: "/agendamentos" },
  { title: "Clientes", href: "/clientes" },
  { title: "Serviços", href: "/servicos" },
  { title: "Cronogramas", href: "/cronogramas" },
  { title: "Financeiro", href: "/financeiro" },
  { title: "Auditoria", href: "/auditoria" },
  { title: "Configurações", href: "/configuracoes" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <NotificationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-lilac-lighter to-background">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-2 sm:gap-4 bg-card/80 backdrop-blur-xl border-b border-border/50 p-responsive-sm">
              <SidebarTrigger className="flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <h1 className="text-responsive-lg font-semibold text-foreground truncate">
                  {navigationItems.find(item => item.href === location.pathname)?.title || "Dashboard"}
                </h1>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1 sm:gap-2 border-primary/20 text-primary hover:bg-primary/5 btn-touch flex-shrink-0 text-xs sm:text-sm"
              >
                <Link to="/agendamento-online" target="_blank">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Agendamento Online</span>
                  <span className="sm:hidden">Online</span>
                  <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3" />
                </Link>
              </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-responsive overflow-auto">
              <div className="container-responsive max-w-none">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  );
}
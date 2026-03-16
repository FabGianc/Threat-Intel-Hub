import { ReactNode } from "react";

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function Layout({ sidebar, children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden bg-grid">
      {/* Mobile sidebar placeholder - in a real app might use a Drawer, but stacking or hiding is fine for desktop-first tools */}
      <aside className="hidden lg:block w-80 shrink-0 z-20 shadow-2xl print-hidden">
        {sidebar}
      </aside>
      
      <main className="flex-1 h-full overflow-y-auto relative print:overflow-visible print:w-full print:bg-white">
        {/* Decorative ambient light */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none print-hidden" />
        
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10 print:max-w-none print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}

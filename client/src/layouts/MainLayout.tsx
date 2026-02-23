import type { ReactNode } from "react";
import Header from "@/components/Header";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-slate-100 py-4 sm:py-6 pb-20 sm:pb-12">
        <div className="container mx-auto max-w-7xl px-2 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

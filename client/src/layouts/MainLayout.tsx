import type { ReactNode } from "react";
import Header from "@/components/Header";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-slate-100 py-6 pb-12">
        <div className="container mx-auto max-w-7xl px-4">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;

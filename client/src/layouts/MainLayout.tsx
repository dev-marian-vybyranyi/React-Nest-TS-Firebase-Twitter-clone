import type { ReactNode } from "react";
import Header from "@/components/Header";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <Header />
      <main className="h-screen bg-slate-100 py-6">
        <div className="container mx-48">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;

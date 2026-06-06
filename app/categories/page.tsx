import type { Metadata } from "next";
import { SearchBar } from "@/components/layout/SearchBar";
import { CategoryBrowser } from "@/components/layout/CategoryBrowser";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse everything on AfroSmart — food & agriculture, services, retail, transportation, business and community across Liberia.",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Browse all categories</h1>
      <p className="mt-1 text-sm text-muted">From local food to services, retail and community — find it near you.</p>

      <div className="mt-4 md:hidden">
        <SearchBar />
      </div>

      <div className="mt-6">
        <CategoryBrowser />
      </div>
    </div>
  );
}

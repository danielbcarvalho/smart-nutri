import { api } from "../lib/axios";
import { SearchResult } from "../types/search";

interface SearchResponseItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  email?: string;
  phone?: string;
  patientName?: string;
  type: "patient" | "mealPlan";
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const response = await api.get<SearchResponseItem[]>(
      `/search?q=${encodeURIComponent(query)}`
    );
    return response.data.map((item: SearchResponseItem) => ({
      id: item.id,
      title: item.name || item.title || "",
      description:
        item.description ||
        (item.type === "patient"
          ? `${item.email || "Sem email"} • ${item.phone || "Sem telefone"}`
          : `Plano para ${item.patientName || "paciente"}`),
      link:
        item.type === "patient"
          ? `/patient/${item.id}`
          : `/meal-plans/${item.id}`,
      type: item.type,
    }));
  } catch (error) {
    console.error("Erro ao buscar:", error);
    return [];
  }
}

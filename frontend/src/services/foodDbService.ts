const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = "alimentos"; // ajuste se necessário
const FILE_PATH = "alimentos.json";

export async function fetchFoodDb() {
  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FILE_PATH}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erro ao baixar base de alimentos");
  const data = await response.json();
  // Se for objeto, converte para array
  if (data && !Array.isArray(data)) {
    return Object.values(data);
  }
  return data;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export async function supabaseSelect<T>(table: string, query = "select=*") {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabaseの接続情報が設定されていません。");
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}?${query}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabaseからの取得に失敗しました。（${response.status}）`);
  }

  return (await response.json()) as T;
}

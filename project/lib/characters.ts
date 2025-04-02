import { supabase } from "./supabase";

export type Character = {
  id: string;
  name: string;
  image: string;
  description: string;
  age: number;
  interests: string[];
  personality: string;
  createdAt: string;
  updatedAt: string;
};

// Get all characters
export async function getCharacters(): Promise<Character[]> {
  const { data, error } = await supabase.from("character").select("*");
  if (error) throw error;
  console.log("data", data);
  return data as Character[];
}

// Get character by ID
export async function getCharacter(id: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from("character")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Character;
}

// Create character
export async function createCharacter(
  character: Omit<Character, "id">
): Promise<Character> {
  const { data, error } = await supabase
    .from("character")
    .insert(character)
    .select()
    .single();
  if (error) throw error;
  return data as Character;
}

// Update character
export async function updateCharacter(
  id: string,
  updates: Partial<Character>
): Promise<Character> {
  const { data, error } = await supabase
    .from("character")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Character;
}

// Delete character
export async function deleteCharacter(id: string): Promise<void> {
  const { error } = await supabase.from("character").delete().eq("id", id);
  if (error) throw error;
}

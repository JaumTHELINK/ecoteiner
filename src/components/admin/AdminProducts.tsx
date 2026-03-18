import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductForm {
  name: string;
  description: string;
  price_fc: string;
  category: string;
  featured: boolean;
  image_url: string;
}

const emptyForm: ProductForm = { name: "", description: "", price_fc: "", category: "geral", featured: false, image_url: "" };

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(f => ({ ...f, image_url: url }));
      setPreviewUrl(url);
      toast({ title: "Imagem enviada!" });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        price_fc: Number(form.price_fc),
        category: form.category,
        featured: form.featured,
        image_url: form.image_url || null,
      };
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setPreviewUrl(null);
      toast({ title: editing ? "Produto atualizado!" : "Produto criado!" });
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").update({ active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Produto removido!" });
    },
  });

  const startEdit = (p: any) => {
    setForm({ name: p.name, description: p.description || "", price_fc: String(p.price_fc), category: p.category, featured: p.featured, image_url: p.image_url || "" });
    setPreviewUrl(p.image_url || null);
    setEditing(p.id);
    setShowForm(true);
  };

  const clearImage = () => {
    setForm(f => ({ ...f, image_url: "" }));
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(emptyForm); setEditing(null); setPreviewUrl(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-card p-6 shadow-card space-y-3">
          <h3 className="font-semibold text-foreground">{editing ? "Editar Produto" : "Novo Produto"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Preço (FC)" type="number" value={form.price_fc} onChange={e => setForm(f => ({ ...f, price_fc: e.target.value }))} />
            <Input placeholder="Categoria" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded" />
              Destaque
            </label>
          </div>
          <textarea
            placeholder="Descrição"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />

          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Imagem do produto</label>
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Enviando..." : "Enviar imagem"}
              </Button>
              {previewUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                  <X className="mr-1 h-3 w-3" /> Remover
                </Button>
              )}
            </div>
            {previewUrl && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setPreviewUrl(null); }}>Cancelar</Button>
            <Button onClick={() => upsert.mutate()} disabled={!form.name || !form.price_fc}>Salvar</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Imagem</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Preço (FC)</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Destaque</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{Number(p.price_fc)} FC</td>
                  <td className="px-4 py-3 text-center">{p.featured ? "✅" : "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(p.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

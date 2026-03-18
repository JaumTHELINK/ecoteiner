import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductForm {
  name: string;
  description: string;
  price_fc: string;
  category: string;
  featured: boolean;
}

const emptyForm: ProductForm = { name: "", description: "", price_fc: "", category: "geral", featured: false };

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        price_fc: Number(form.price_fc),
        category: form.category,
        featured: form.featured,
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
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
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
    setForm({ name: p.name, description: p.description || "", price_fc: String(p.price_fc), category: p.category, featured: p.featured });
    setEditing(p.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</Button>
            <Button onClick={() => upsert.mutate()} disabled={!form.name || !form.price_fc}>Salvar</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
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

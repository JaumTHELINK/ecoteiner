import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PointForm {
  name: string;
  address: string;
  phone: string;
  hours: string;
}

const emptyForm: PointForm = { name: "", address: "", phone: "", hours: "" };

const AdminCollectionPoints = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PointForm>(emptyForm);
  const [showInactive, setShowInactive] = useState(false);

  const { data: allPoints = [] } = useQuery({
    queryKey: ["admin-points-all"],
    queryFn: async () => {
      const { data } = await supabase.from("collection_points").select("*").order("name");
      return data ?? [];
    },
  });

  const points = showInactive ? allPoints : allPoints.filter(p => p.active);

  const upsert = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("collection_points").update(form).eq("id", editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("collection_points").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-points-all"] });
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      toast({ title: editing ? "Ponto atualizado!" : "Ponto criado!" });
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("collection_points").update({ active: !active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-points-all"] });
      toast({ title: "Status atualizado!" });
    },
  });

  const startEdit = (p: any) => {
    setForm({ name: p.name, address: p.address, phone: p.phone || "", hours: p.hours || "" });
    setEditing(p.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setShowInactive(!showInactive)}>
          {showInactive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {showInactive ? "Ocultar inativos" : "Mostrar inativos"}
        </Button>
        <Button onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Ponto
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-card p-6 shadow-card space-y-3">
          <h3 className="font-semibold text-foreground">{editing ? "Editar Ponto" : "Novo Ponto de Coleta"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Endereço" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <Input placeholder="Telefone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input placeholder="Horário" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</Button>
            <Button onClick={() => upsert.mutate()} disabled={!form.name || !form.address}>Salvar</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Endereço</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Horário</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {points.map(p => (
                <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/30 ${!p.active ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.address}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.hours || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={p.active ? "default" : "destructive"} className="text-xs">
                      {p.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-3 w-3" /></Button>
                      {p.active ? (
                        <Button size="sm" variant="ghost" onClick={() => {
                          if (!confirm("Desativar este ponto de coleta?")) return;
                          toggleActive.mutate({ id: p.id, active: p.active });
                        }}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => toggleActive.mutate({ id: p.id, active: p.active })}>
                          <RotateCcw className="h-3 w-3 text-primary" />
                        </Button>
                      )}
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

export default AdminCollectionPoints;

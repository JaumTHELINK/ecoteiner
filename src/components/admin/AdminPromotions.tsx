import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Megaphone, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const AdminPromotions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", link_url: "", end_date: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Promotion[];
    },
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("promotion-images").upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("promotion-images").getPublicUrl(fileName);
      setForm(f => ({ ...f, image_url: urlData.publicUrl }));
      toast({ title: "Imagem enviada!" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar imagem", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description,
        image_url: form.image_url,
        link_url: form.link_url,
        end_date: form.end_date || null,
      };
      if (editing) {
        const { error } = await supabase.from("promotions").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promotions").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      setDialogOpen(false);
      toast({ title: editing ? "Promoção atualizada!" : "Promoção criada!" });
    },
    onError: () => toast({ title: "Erro ao salvar promoção", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("promotions").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-promotions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: "Promoção excluída!" });
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", description: "", image_url: "", link_url: "", end_date: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      image_url: p.image_url ?? "",
      link_url: p.link_url ?? "",
      end_date: p.end_date ? p.end_date.slice(0, 10) : "",
    });
    setDialogOpen(true);
  };

  const filtered = showInactive ? promotions : promotions.filter(p => p.active);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Megaphone className="h-5 w-5 text-muted-foreground" /> Promoções e Banners
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} /> Mostrar inativas
          </label>
          <Button onClick={openNew} size="sm"><Plus className="mr-2 h-4 w-4" /> Nova Promoção</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">Nenhuma promoção encontrada.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
              {p.image_url && (
                <img src={p.image_url} alt={p.title} className="h-32 w-full rounded-lg object-cover" />
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{p.title}</h3>
                <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Ativa" : "Inativa"}</Badge>
              </div>
              {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
              {p.end_date && (
                <p className="text-xs text-muted-foreground">
                  Expira em: {new Date(p.end_date).toLocaleDateString("pt-BR")}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="mr-1 h-3 w-3" /> Editar</Button>
                <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate({ id: p.id, active: !p.active })}>
                  {p.active ? "Desativar" : "Ativar"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { if (confirm("Excluir esta promoção?")) deleteMutation.mutate(p.id); }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Promoção" : "Nova Promoção"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Imagem</Label>
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="h-28 w-full rounded-lg object-cover" />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {uploading ? "Enviando..." : "Fazer upload"}
                </Button>
                {form.image_url && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm(f => ({ ...f, image_url: "" }))}>
                    Remover
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>URL do Link</Label>
              <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Data de Expiração</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPromotions;

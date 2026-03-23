import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Eye } from "lucide-react";

const AdminContacts = () => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Mail className="h-5 w-5 text-muted-foreground" /> Mensagens de Contato
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : messages.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">Nenhuma mensagem recebida.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg: any) => (
            <div key={msg.id} className={`rounded-xl border p-5 shadow-card ${msg.read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{msg.name}</span>
                    <span className="text-sm text-muted-foreground">&lt;{msg.email}&gt;</span>
                    {!msg.read && <Badge variant="default" className="text-xs">Nova</Badge>}
                  </div>
                  {msg.subject && <p className="text-sm font-medium text-foreground mt-1">{msg.subject}</p>}
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(msg.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                {!msg.read && (
                  <Button variant="outline" size="sm" onClick={() => markRead.mutate(msg.id)}>
                    <Eye className="mr-1 h-3 w-3" /> Marcar lida
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContacts;

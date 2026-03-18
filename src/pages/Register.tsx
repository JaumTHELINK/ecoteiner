import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, CreditCard, Lock, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", cpf: "", password: "", confirmPassword: "",
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    if (form.password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          phone: form.phone,
          cpf: form.cpf,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar o cadastro.",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const fields = [
    { id: "name", label: "Nome completo *", icon: User, placeholder: "Seu nome completo", type: "text" },
    { id: "email", label: "Email *", icon: Mail, placeholder: "seu@email.com", type: "email" },
    { id: "phone", label: "Telefone", icon: Phone, placeholder: "(11) 99999-9999", type: "tel" },
    { id: "cpf", label: "CPF", icon: CreditCard, placeholder: "000.000.000-00", type: "text" },
    { id: "password", label: "Senha *", icon: Lock, placeholder: "••••••", type: "password" },
    { id: "confirmPassword", label: "Confirmar senha *", icon: Lock, placeholder: "••••••••", type: "password" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Recycle className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ecoteiner</h1>
          <p className="text-sm text-muted-foreground">Crie sua conta</p>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold text-foreground">Cadastro</h2>
          <p className="text-sm text-muted-foreground">Preencha os dados para criar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ id, label, icon: Icon, placeholder, type }) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{label}</Label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  className="pl-10"
                  value={form[id as keyof typeof form]}
                  onChange={update(id)}
                  required={label.includes("*")}
                />
              </div>
            </div>
          ))}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

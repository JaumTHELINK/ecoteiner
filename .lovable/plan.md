

## Plano: Correções da Onda 1 -- Bloqueantes do Relatório de Riscos

Baseado no relatório de riscos enviado, estas sao as correções criticas que impedem o lançamento.

---

### 1. Validação obrigatória de CPF e Telefone no cadastro (Risco Critico #1)

**Problema:** CPF e Telefone nao sao obrigatórios e aceitam qualquer texto.

**Solução:**
- Tornar CPF e Telefone campos obrigatórios no formulário de cadastro
- Adicionar máscara de CPF (###.###.###-##) com validação de dígitos verificadores
- Adicionar máscara de telefone ((##) #####-####)
- Validar antes de submeter o formulário
- Mensagens de erro claras em português

**Arquivo:** `src/pages/Register.tsx`

---

### 2. Transações com tipo crédito/débito + verificação de saldo (Riscos Criticos #2 e #3)

**Problema:** O formulário de transações só faz crédito (reciclagem). Nao existe fluxo de débito/resgate. A aba Usuários permite ajuste sem rastreio adequado.

**Solução:**
- Adicionar seletor de tipo no formulário de transações: **Crédito (earn)**, **Débito (redeem)**, **Ajuste admin**
- Para débito: verificar saldo >= valor antes de confirmar, exibir erro claro se insuficiente
- Para crédito de reciclagem: manter fluxo atual com material + peso
- Para débito/resgate: campos de produto ou descrição + valor FC
- Remover botões de crédito/débito soltos da aba Usuários (toda operação financeira passa por Transações)
- Toda transação gera registro auditável

**Arquivos:** `src/components/admin/AdminTransactions.tsx`, `src/components/admin/AdminUsers.tsx`

---

### 3. Corrigir exclusão/desativação de Produtos e Pontos de Coleta (Risco Critico #4)

**Problema:** Botões de excluir "nao funcionam" — na verdade fazem `active: false` mas a listagem nao filtra por `active`.

**Solução:**
- Filtrar listagens para mostrar apenas itens ativos por padrao
- Adicionar toggle "Mostrar inativos" para o admin
- Exibir badge de status (Ativo/Inativo) na tabela
- Botao de reativar para itens inativos
- Confirmação antes de desativar

**Arquivos:** `src/components/admin/AdminProducts.tsx`, `src/components/admin/AdminCollectionPoints.tsx`

---

### 4. CRUD de Usuários no admin (Risco Critico #5)

**Problema:** Nao existe edição nem desativação de usuários.

**Solução:**
- Adicionar botao **Editar** que abre modal para alterar nome, telefone, CPF
- Adicionar botao **Desativar/Ativar** usuario (campo `is_active` na tabela profiles)
- Migração para adicionar coluna `is_active` (boolean, default true) na tabela `profiles`
- Verificar `is_active` no login (bloquear acesso se false)

**Arquivos:** `src/components/admin/AdminUsers.tsx`, `src/contexts/AuthContext.tsx`
**Migração:** Adicionar coluna `is_active` a `profiles`

---

### 5. Mensagens de erro claras em português (Risco Alto #1)

**Problema:** Erros genéricos no cadastro/login.

**Solução:**
- Mapear códigos de erro comuns para mensagens em português
- "User already registered" → "Este e-mail já está cadastrado. Tente fazer login."
- "Invalid login credentials" → "Email ou senha incorretos." (já parcialmente feito)
- "Password should be at least 6 characters" → mensagem clara

**Arquivos:** `src/pages/Login.tsx`, `src/pages/Register.tsx`

---

### 6. Filtro por data no extrato do usuário (Risco Alto #4)

**Problema:** Usuário nao consegue filtrar extrato por período.

**Solução:**
- Adicionar seletor de data início/fim no extrato do usuário (mesmo padrão já usado no admin)

**Arquivo:** `src/pages/Extrato.tsx`

---

### Resumo de alterações

| Item | Arquivos | Migração |
|------|----------|----------|
| Validação CPF/Telefone | Register.tsx | Nao |
| Tipo crédito/débito + verificação saldo | AdminTransactions.tsx, AdminUsers.tsx | Nao |
| Exclusão/desativação funcional | AdminProducts.tsx, AdminCollectionPoints.tsx | Nao |
| CRUD de usuários | AdminUsers.tsx, AuthContext.tsx | Sim (is_active) |
| Mensagens de erro PT-BR | Login.tsx, Register.tsx | Nao |
| Filtro por data no extrato | Extrato.tsx | Nao |


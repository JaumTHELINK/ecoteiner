

## Situacao Atual

Atualmente, o sistema tem duas formas limitadas de adicionar transacoes:

1. **Credito/Debito manual na aba "Usuarios"** -- o admin pode ajustar saldo de um usuario, mas sem campos para material, peso (weight_kg), ou ponto de coleta. Sao apenas ajustes genericos de saldo.

2. **Aba "Transacoes"** -- apenas visualiza transacoes existentes, sem botao para criar novas.

Nao existe uma forma completa de registrar uma entrega de material reciclavel (com material, peso, ponto de coleta, calculo automatico de FC baseado nas taxas de material).

## Plano: Criar formulario de registro de reciclagem no Admin

### 1. Adicionar botao "Nova Transacao" na aba AdminTransactions

- Botao abre um modal/formulario com campos:
  - **Usuario** (select/busca entre profiles)
  - **Material** (select populado da tabela `material_rates`)
  - **Quantidade** (numero, com unidade dinamica baseada no material selecionado)
  - **Ponto de Coleta** (select opcional, populado da tabela `collection_points`)
  - **Descricao** (texto opcional)

### 2. Calculo automatico de FC

- Ao selecionar material e quantidade, calcular automaticamente os Fenix Coins usando `fenix_per_unit` e `quantity_per_fenix` da tabela `material_rates`
- Formula: `FC = (quantidade / quantity_per_fenix) * fenix_per_unit`
- Exibir o valor calculado antes de confirmar

### 3. Ao confirmar

- Inserir transacao na tabela `transactions` com type="credit", category="reciclagem", material, weight_kg, collection_point_id, amount calculado
- Atualizar saldo do usuario na tabela `profiles` (incrementar balance)
- Invalidar queries para atualizar a lista

### Arquivo alterado

- `src/components/admin/AdminTransactions.tsx` -- adicionar botao + modal de nova transacao com toda a logica


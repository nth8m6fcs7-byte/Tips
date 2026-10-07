# Alterações para conferência financeira

Melhorias da interface: conferência do saldo anterior + gorjeta = entregue + saldo final, indicação explícita da retenção/devolução por pessoa, pagamentos confirmados iguais aos valores revistos, folha de distribuição para imprimir/guardar PDF e cópia completa dos dados JSON. Não alteram pagamentos históricos nem os saldos guardados. Validação do limite monetário, datas e linhas duplicadas igual à do servidor.

## Alteração do servidor aprovada e aplicada

`sql/tips-reconciliation.sql` substitui apenas `hours_private.tip_command(text,jsonb,integer)`:

- Permite guardar rascunhos com dias em falta, ainda sem equipa e sem a nota de contagem final.
- Continua a rejeitar a confirmação desses rascunhos enquanto faltarem os sete dias, a equipa ou a explicação de uma diferença na contagem.
- Acrescenta a conferência matemática dos resultados antes de gravar.
- Acrescenta uma referência UUID e o número da revisão aos pagamentos futuros.
- Mantém as mesmas fórmulas de distribuição, pagamento efetivo, saldo, fecho mensal e saída; mantém a RLS, a revisão concorrente e os pagamentos históricos.

A alteração foi aprovada pelo proprietário e aplicada em 7 de outubro de 2026. Os testes no Supabase usam uma transação terminada com ROLLBACK, com utilizador e pagamentos fictícios. A interface permite guardar rascunhos incompletos; a confirmação continua a exigir os dados completos.

Verificações: 1.000 distribuições conservam os cêntimos; pagar mais um cêntimo reduz a retenção num cêntimo; duplicados, limites, datas impossíveis, diferenças sem nota, saldo negativo, liquidação incompleta e revisões antigas são bloqueados. Fluxo móvel, relatório e exportação verificados com dados fictícios.

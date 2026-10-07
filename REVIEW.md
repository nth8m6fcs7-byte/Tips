# Alterações para conferência financeira

Melhorias da interface: conferência do saldo anterior + gorjeta = entregue + saldo final, indicação explícita da retenção/devolução por pessoa, pagamentos confirmados iguais aos valores revistos, folha de distribuição para imprimir/guardar PDF e cópia completa dos dados JSON. Não alteram pagamentos históricos nem os saldos guardados. Validação do limite monetário, datas e linhas duplicadas igual à do servidor.

## Alteração do servidor pendente de aprovação

`sql/tips-reconciliation.sql` substitui apenas `hours_private.tip_command(text,jsonb,integer)`:

- Permite guardar rascunhos com dias em falta, ainda sem equipa e sem a nota de contagem final.
- Continua a rejeitar a confirmação desses rascunhos enquanto faltarem os sete dias, a equipa ou a explicação de uma diferença na contagem.
- Acrescenta a conferência matemática dos resultados antes de gravar.
- Acrescenta uma referência UUID e o número da revisão aos pagamentos futuros.
- Mantém as mesmas fórmulas de distribuição, pagamento efetivo, saldo, fecho mensal e saída; mantém a RLS, a revisão concorrente e os pagamentos históricos.

A revisão automática rejeitou a aplicação persistente por exigir aprovação explícita para modificar a função financeira. A versão proposta passou os testes no Supabase dentro de uma transação terminada com ROLLBACK, com utilizador e pagamentos fictícios. Não foi aplicada em produção. A interface publicada mantém o comportamento atual dos rascunhos até essa aprovação.

Verificações: 1.000 distribuições conservam os cêntimos; pagar mais um cêntimo reduz a retenção num cêntimo; duplicados, limites, datas impossíveis, diferenças sem nota, saldo negativo, liquidação incompleta e revisões antigas são bloqueados. Fluxo móvel, relatório e exportação verificados com dados fictícios.

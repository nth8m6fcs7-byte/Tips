# Tips

App independente de gorjetas: https://nth8m6fcs7-byte.github.io/Tips/.
Publicação pelo GitHub Pages a partir da branch main.
Pré-visualização local: `node dev-server.cjs`, em http://127.0.0.1:4070/.
A Hours mantém o registo pessoal de horas; a distribuição da equipa está nesta app separada.

Usa a mesma conta Supabase da app Hours e o ledger personal_tip_ledgers existente. Separar a interface não copia nem apaga dados. O schema sql/tips-ledger.sql já está aplicado no Bacalhau; não o reaplicar para esta separação.

Três passos: valores dos sete fechos e contagem real, horas da equipa, pagamentos. Valores em cêntimos, rateio por minutos com maior resto, sugestão de 95% arredondada ao euro e ajuste manual. Saldo real = saldo anterior + quota - pago. Extras, saídas e a semana final do mês liquidam integralmente. Pagamentos confirmados são imutáveis; rascunhos usam controlo de revisão. Histórico e exportação CSV incluídos.

A importação das próprias horas da Hours é opcional e apenas leitura. A recuperação da password abre a Hours, que já é um endereço autorizado; a password atualizada serve ambas as apps. A integração Kitchen Manager fica para uma fase posterior.

## Histórico do Excel

O histórico privado do BACALHAU 26.xlsx está em `state.excel_archive` do ledger do proprietário, sujeito à mesma RLS. Contém 34 semanas de 5 de janeiro a 30 de agosto de 2026, fechos diários, pessoas/horas, valores e fórmulas por célula, retenções/devoluções e células dos oito meses preenchidos. Setembro a dezembro estão vazios neste ficheiro. A interface permite filtrar por mês e exportar CSV, preservando a precisão de origem. A tabela mostra até duas casas decimais e os detalhes mostram os valores completos.

A importação preserva o Excel como histórico de origem, sem converter automaticamente cálculos antigos em novos pagamentos ou saldos correntes. Não preenche a equipa atual a partir de nomes históricos, para preservar entradas/saídas e variantes de nomes. O checksum impede duplicar a mesma importação; a escrita é atómica, preserva rascunhos, pagamentos e equipa existentes e incrementa a revisão. Os dados financeiros e o Excel não são incluídos no repositório público. `tests/archive.cjs` verifica filtros, referências, escape de texto, layout móvel e limpeza ao sair da conta usando um ficheiro fictício.

Testes: node --test tests/tips-core.test.mjs; node tests/tips-browser.cjs; node tests/tips-live.cjs. Os testes de browser usam PLAYWRIGHT_PATH e BROWSER_CHANNEL=msedge neste computador. O teste local simula transporte; o teste público não cria pagamentos.

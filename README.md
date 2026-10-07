# Tips

App independente de gorjetas: https://nth8m6fcs7-byte.github.io/Tips/

Usa a mesma conta Supabase da app Hours e o ledger personal_tip_ledgers existente. Separar a interface não copia nem apaga dados. O schema sql/tips-ledger.sql já está aplicado no Bacalhau; não o reaplicar para esta separação.

Três passos: valores dos sete fechos e contagem real, horas da equipa, pagamentos. Valores em cêntimos, rateio por minutos com maior resto, sugestão de 95% arredondada ao euro e ajuste manual. Saldo real = saldo anterior + quota - pago. Extras, saídas e a semana final do mês liquidam integralmente. Pagamentos confirmados são imutáveis; rascunhos usam controlo de revisão. Histórico e exportação CSV incluídos.

A importação das próprias horas da Hours é opcional e apenas leitura. A recuperação da password abre a Hours, que já é um endereço autorizado; a password atualizada serve ambas as apps. A integração Kitchen Manager fica para uma fase posterior.

Testes: node --test tests/tips-core.test.mjs; node tests/tips-browser.cjs; node tests/tips-live.cjs. Os testes de browser usam PLAYWRIGHT_PATH e BROWSER_CHANNEL=msedge neste computador. O teste local simula transporte; o teste público não cria pagamentos.

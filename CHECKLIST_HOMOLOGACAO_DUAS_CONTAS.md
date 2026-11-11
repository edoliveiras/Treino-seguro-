# Checklist manual de homologação — duas contas reais

Use duas contas de teste (A e B), com caixas de e-mail que o responsável controla. Não use dados de saúde reais nem compartilhe senhas.

## 1. Cadastro e autenticação
- [ ] Criar A e B com e-mails diferentes e confirmar cada endereço pelo link recebido.
- [ ] Em A, aceitar consentimento de saúde e de fotos; em B, recusar pelo menos um deles.
- [ ] Confirmar que a recusa não impede o uso básico do aplicativo.
- [ ] Testar login, sair, reenviar confirmação, recuperação de senha, redefinição e troca de e-mail.
- [ ] Confirmar mensagens claras e bloqueio de 60 segundos após envio/reenvio; testar espera após cinco falhas de login.
- [ ] Conferir que todos os links retornam ao domínio de produção, sem localhost.

## 2. Fotos e isolamento entre contas
- [ ] Em A, enviar JPEG, PNG e WebP válidos, cada um abaixo de 5 MB.
- [ ] Confirmar rejeição de SVG/outros formatos e de arquivo acima de 5 MB.
- [ ] Conferir que a imagem enviada foi redimensionada para no máximo 1600 px e que EXIF/GPS não permanece no arquivo regravado.
- [ ] Confirmar que A vê a própria foto por URL assinada e que o link expira em aproximadamente 60 segundos.
- [ ] Em B, tentar abrir a URL assinada de A, listar a pasta de A e ler o registro alimentar de A. Todas as tentativas devem ser negadas ou retornar vazio.
- [ ] Confirmar que B só consegue ler/gravar/excluir dentro da própria pasta.
- [ ] Confirmar que a foto é apenas anexo e que as calorias dependem da seleção manual do alimento e da quantidade.

## 3. Revogação e exclusão
- [ ] Em A, revogar o consentimento de fotos e confirmar a ação na tela.
- [ ] Confirmar que novas fotos deixam de sincronizar, links antigos deixam de abrir e os arquivos da pasta de A são removidos.
- [ ] Se a tela indicar limpeza pendente, usar a opção de concluir exclusão e confirmar que a pasta fica vazia.
- [ ] Revogar o consentimento de saúde e confirmar que a sincronização para e as fotos também são removidas.
- [ ] Exportar os dados de A e conferir o arquivo JSON, incluindo os links temporários das fotos autorizadas (validade de 5 minutos).
- [ ] Solicitar exclusão da conta A; confirmar que perfil, dados de saúde, treinos, conclusões, consentimentos e fotos foram removidos.
- [ ] Confirmar que B continua acessando apenas os próprios dados e que a conta administrativa permanece intacta.

## 4. Triagem e avisos
- [ ] Antes do primeiro treino, marcar uma resposta de risco e confirmar que aparece “consulte um médico antes de treinar”.
- [ ] Confirmar que o treino não começa até a pessoa marcar que leu o aviso.
- [ ] Conferir o aviso permanente de que o app não substitui orientação médica ou de profissional de Educação Física.
- [ ] Conferir a marcação “PENDENTE DE REVISÃO CLÍNICA” nas telas de treino e alimentação.

## 5. Limites de integração
- [ ] Confirmar que telefone é apenas contato e que não há fluxo de OTP por telefone, SMS, WhatsApp, Facebook ou Meta.
- [ ] Registrar separadamente qualquer falha de entrega de e-mail; não considerar o envio comprovado apenas porque a tela aceitou a solicitação.

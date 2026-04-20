# BRQ-Mobile (Android)

Implementação nativa do protocolo de fricção **BRQ-01** para Android.

## Como funciona
1.  O app utiliza um **Serviço de Acessibilidade** para monitorar eventos de scroll em aplicativos sociais (Instagram, TikTok, X, etc.).
2.  Após **50 eventos de scroll**, o motor nativo dispara um alerta.
3.  O app entra em modo **Brake (Interrupção)** por 10 segundos (ou 5 minutos em reincidência).

## Como Instalar e Testar
1.  Certifique-se de ter o Celular Android conectado via USB (com Depuração USB ativa).
2.  Rode o comando:
    ```bash
    npm install
    npx react-native run-android
    ```
3.  No celular, vá em **Configurações > Acessibilidade > Apps Instalados > BRQMobile** e **ATIVE** o serviço.
4.  Abra o Instagram ou TikTok e comece a scrolar.
5.  A barreira BRQ aparecerá automaticamente.

## Estrutura Técnica
- **Native**: `BRQAccessibilityService.kt` monitora o sistema.
- **JS**: `App.tsx` gerencia a interface brutalista e o escalonamento de tempo.

---
*BRQ-01 // ORGANIZAÇÃO BRQ*

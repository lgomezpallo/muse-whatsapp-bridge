# Muse WhatsApp Bridge - 2 celus, 1 Muse

Deploy en Render para usar tu WhatsApp laboral (numero comun, no Business) con tu Muse.

### Deploy
1. Push a GitHub
2. Render > New > Blueprint > conecta este repo (usa render.yaml)
3. Entra a tu URL de Render /qr -> escanea con tu celu LABORAL (WhatsApp > Dispositivos vinculados)
4. Listo. Ahora cualquier mensaje que empiece con `MUSE:` o `TRABAJO:` en ese WhatsApp se va a tu Muse.

### Como usar desde los 2 celus
- **Celu laboral:** escribí `MUSE: agendá reunión con cliente X mañana 10am`
- **Celu personal:** seguís usando el WhatsApp vinculado nativo a Muse

### Conectar a Muse real
Poné en Render env var MUSE_WEBHOOK_URL:
- Si tenés Muse API: tu endpoint
- Si no: crea un webhook en n8n/Zapier/Make que reenvíe a tu Muse via email o su inbox. Muse puede leer ese mail y responder.

Cuando Meta libere el email propio de Muse, cambias el webhook por ese mail y queda 100% nativo.
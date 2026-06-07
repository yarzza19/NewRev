/**
 * Servidor local simple para NewRev
 * Sirve los archivos del proyecto Y los frames desde el Desktop
 * Incluye endpoint /send-pieza para envío de formularios por email
 *
 * Uso: node server.js
 * Luego abre: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = 3000;
const PROJECT_DIR = __dirname;
const FRAMES_DIR = 'C:\\Users\\pablo\\Desktop\\addicar\\video\\ImageToStl.com_-video-to-webp-converter';
const DB_FILE = path.join(__dirname, 'comunidad_piezas.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const VAULT_DIR = path.join(__dirname, 'boveda_segura_newrev');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR);

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([
        {
            id: 1,
            nombre_pieza: 'Clips Soporte Paragolpes',
            coche_marca: 'BMW', coche_modelo: 'E46', coche_anio: 2002,
            medidas_exteriores: '30x15x15 mm', material_recomendado: 'Nylon Fuerte',
            funcion: 'Sustituto impreso en 3D para los clips frágiles laterales del paragolpes M3.',
            url_archivo_3d: '#',
            estado: 'verificada'
        },
        {
            id: 2,
            nombre_pieza: 'Adaptador de Filtro Cónico',
            coche_marca: 'Honda', coche_modelo: 'Civic', coche_anio: 1998,
            medidas_exteriores: '120x120x80 mm', material_recomendado: 'ABS / ASA',
            funcion: 'Adaptador MAF a filtro cónico de 3 pulgadas.',
            url_archivo_3d: '#',
            estado: 'no_revisada'
        }
    ], null, 2));
}

// ── Email config ────────────────────────────────────────────────────────────
// Para Gmail necesitas una "Contraseña de aplicación":
// https://myaccount.google.com/apppasswords  (activa 2FA primero)
const GMAIL_USER = 'pabloyarza19@gmail.com';
const GMAIL_PASS = process.env.GMAIL_APP_PASS || 'lnphojbekgfrgndg';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// ── MIME types ──────────────────────────────────────────────────────────────
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// ── Multipart parser (sin dependencias externas) ────────────────────────────
function parseMultipart(buffer, boundary) {
    const parts = [];
    const sep = Buffer.from('\r\n--' + boundary);
    let start = buffer.indexOf('--' + boundary) + boundary.length + 4; // skip first boundary + \r\n

    while (true) {
        let end = buffer.indexOf(sep, start);
        if (end === -1) break;
        const part = buffer.slice(start, end);
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) { start = end + sep.length + 2; continue; }

        const headerStr = part.slice(0, headerEnd).toString();
        const body = part.slice(headerEnd + 4);

        const nameMatch = headerStr.match(/name="([^"]+)"/);
        const filenameMatch = headerStr.match(/filename="([^"]+)"/);
        const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

        parts.push({
            name: nameMatch ? nameMatch[1] : '',
            filename: filenameMatch ? filenameMatch[1] : null,
            contentType: ctMatch ? ctMatch[1].trim() : 'text/plain',
            data: body,
        });
        start = end + sep.length + 2;
    }
    return parts;
}

// ── In-memory session store for scan chat ────────────────────────────────────
const scanSessions = {};
// Cleanup old scan sessions (older than 1 hour)
setInterval(() => {
    const now = Date.now();
    for (const id in scanSessions) {
        if (now - scanSessions[id].created > 3600000) delete scanSessions[id];
    }
}, 300000);

// ── HTTP server ─────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);

    // ── POST /send-pieza ────────────────────────────────────────────────────
    if (req.method === 'POST' && urlPath === '/send-pieza') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => {
            const body = Buffer.concat(chunks);
            const contentType = req.headers['content-type'] || '';
            const boundaryMatch = contentType.match(/boundary=(.+)$/);

            if (!boundaryMatch) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: false, error: 'Bad request' }));
            }

            const parts = parseMultipart(body, boundaryMatch[1]);
            const description = parts.find(p => p.name === 'description')?.data.toString().trim() || '(sin descripción)';
            const attachments = parts
                .filter(p => p.filename && p.data.length > 0)
                .map(p => ({
                    filename: p.filename,
                    content: p.data,
                    contentType: p.contentType,
                }));

            const mailOptions = {
                from: `"NewRev Web" <${GMAIL_USER}>`,
                to: GMAIL_USER,
                subject: '🔩 Nueva solicitud de pieza — NewRev',
                html: `
                    <h2 style="color:#1a1a2e;">Nueva solicitud de pieza</h2>
                    <hr/>
                    <h3>Descripción:</h3>
                    <p style="white-space:pre-wrap;font-family:sans-serif;">${description.replace(/</g, '&lt;')}</p>
                    <hr/>
                    <p style="color:#888;font-size:12px;">Enviado desde <strong>newrev.local</strong></p>
                `,
                attachments,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                if (err) {
                    console.error('Email error:', err.message);
                    res.writeHead(500);
                    return res.end(JSON.stringify({ ok: false, error: err.message }));
                }
                console.log('Email enviado:', info.messageId);
                res.writeHead(200);
                res.end(JSON.stringify({ ok: true }));
            });
        });
        return;
    }

    // ── POST /send-contact ──────────────────────────────────────────────────
    if (req.method === 'POST' && urlPath === '/send-contact') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => {
            let body;
            try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: false, error: 'Bad request' }));
            }
            const { name, email, subject, message } = body;
            const mailOptions = {
                from: `"NewRev Web" <${GMAIL_USER}>`,
                to: GMAIL_USER,
                replyTo: email,
                subject: `✉️ Contacto NewRev: ${subject || 'Sin asunto'}`,
                html: `
                    <h2 style="color:#1a1a2e;">Nuevo mensaje de contacto</h2>
                    <hr/>
                    <p><strong>Nombre:</strong> ${String(name).replace(/</g,'&lt;')}</p>
                    <p><strong>Email:</strong> ${String(email).replace(/</g,'&lt;')}</p>
                    <p><strong>Asunto:</strong> ${String(subject).replace(/</g,'&lt;')}</p>
                    <hr/>
                    <h3>Mensaje:</h3>
                    <p style="white-space:pre-wrap;font-family:sans-serif;">${String(message).replace(/</g,'&lt;')}</p>
                    <hr/>
                    <p style="color:#888;font-size:12px;">Enviado desde <strong>newrev.local</strong></p>
                `,
            };
            transporter.sendMail(mailOptions, (err, info) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Content-Type', 'application/json');
                if (err) { res.writeHead(500); return res.end(JSON.stringify({ ok: false, error: err.message })); }
                res.writeHead(200);
                res.end(JSON.stringify({ ok: true }));
            });
        });
        return;
    }

    // ── GET /api/comunidad ──────────────────────────────────────────────────
    if (req.method === 'GET' && urlPath === '/api/comunidad') {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(data);
    }

    // ── POST /api/comunidad ──────────────────────────────────────────────────
    if (req.method === 'POST' && urlPath === '/api/comunidad') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => {
            const body = Buffer.concat(chunks);
            const contentType = req.headers['content-type'] || '';
            const boundaryMatch = contentType.match(/boundary=(.+)$/);

            if (!boundaryMatch) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: false, error: 'Bad request' }));
            }

            const parts = parseMultipart(body, boundaryMatch[1]);
            const getText = (name) => parts.find(p => p.name === name)?.data.toString().trim() || '';
            const filePart = parts.find(p => p.filename && p.data.length > 0);

            let uploadedFileUrl = '#';
            if (filePart) {
                // Nuevo formato: Bóveda Secreta
                const creatorId = getText('nombre_pieza').replace(/\s+/g, '').substring(0, 10) || 'comunidad';
                const uniqueName = `creator_${creatorId}_${Date.now()}_${filePart.filename.replace(/[^a-z0-9.]/gi, '_')}`;

                // GUARDAR EN LA BÓVEDA
                fs.writeFileSync(path.join(VAULT_DIR, uniqueName), filePart.data);

                // URL FIJA y MENTIROSA (No expone el verdadero archivo)
                uploadedFileUrl = '[ARCHIVO_PROTEGIDO_EN_BOVEDA]';
                console.log(`🔒 ¡Pieza de la comunidad protegida en la BÓVEDA!: ${uniqueName}`);
            }

            const newPieza = {
                id: Date.now(),
                nombre_pieza: getText('nombre_pieza'),
                coche_marca: getText('coche_marca'),
                coche_modelo: getText('coche_modelo'),
                coche_anio: parseInt(getText('coche_anio')) || 2000,
                medidas_exteriores: getText('medidas_exteriores'),
                material_recomendado: getText('material_recomendado'),
                funcion: getText('funcion'),
                url_archivo_3d: uploadedFileUrl,
                estado: 'no_revisada'
            };

            const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            dbData.push(newPieza);
            fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true, pieza: newPieza }));
        });
        return;
    }

    // ── Novedad: POST /api/subir-boveda (Subir a la caja fuerte local) ───────
    if (req.method === 'POST' && urlPath === '/api/subir-boveda') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', () => {
            const body = Buffer.concat(chunks);
            const contentType = req.headers['content-type'] || '';
            const boundaryMatch = contentType.match(/boundary=(.+)$/);

            if (!boundaryMatch) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: false, error: 'Bad request' }));
            }

            const parts = parseMultipart(body, boundaryMatch[1]);
            const filePart = parts.find(p => p.filename && p.data.length > 0);
            const getText = (name) => parts.find(p => p.name === name)?.data.toString().trim() || '';
            const creatorId = getText('creator_id') || 'anonimo';

            if (filePart) {
                // Generar nombre seguro: creator_ID_timestamp_nombreoriginal
                const safeName = `creator_${creatorId}_${Date.now()}_${filePart.filename.replace(/[^a-z0-9.]/gi, '_')}`;
                const securePath = path.join(VAULT_DIR, safeName);

                // Guardar en la carpeta secreta (boveda_segura_newrev)
                fs.writeFileSync(securePath, filePart.data);

                console.log(`🔒 ¡Pieza protegida y guardada en la bóveda!: ${safeName}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    success: true,
                    message: "Archivo guardado exitosamente en la bóveda secreta.",
                    filename: safeName
                }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: "No se subió ningún archivo." }));
            }
        });
        return;
    }

    // ── Novedad: GET /admin/lista-piezas (Listar contenido de la bóveda) ─────
    if (req.method === 'GET' && urlPath === '/admin/lista-piezas') {
        fs.readdir(VAULT_DIR, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'No se pudo leer la bóveda.' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ modelos: files }));
        });
        return;
    }

    // ── Novedad: POST /admin/cambiar-estado (Cambiar estado de pieza desde admin) ─────
    if (req.method === 'POST' && urlPath === '/admin/cambiar-estado') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const targetId = parseInt(data.id, 10);
                const newStatus = data.estado;

                const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
                const index = dbData.findIndex(p => p.id === targetId);

                if (index !== -1) {
                    dbData[index].estado = newStatus;
                    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ ok: true }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ ok: false, error: 'Pieza no encontrada.' }));
                }
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ ok: false, error: 'Error del servidor.' }));
            }
        });
        return;
    }

    // ── Novedad: GET /admin/descargar/:archivo (Descarga para tu Impresora 3D) 
    if (req.method === 'GET' && urlPath.startsWith('/admin/descargar/')) {
        const fileName = path.basename(urlPath);
        const filePath = path.join(VAULT_DIR, fileName);

        if (fs.existsSync(filePath)) {
            console.log(`📦 Enviando archivo para impresión: ${fileName}`);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${fileName}"`
            });
            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'El archivo no existe en la bóveda.' }));
        }
        return;
    }

    // ── Serve uploads ────────────────────────────────────────────────────────
    if (urlPath.startsWith('/uploads/')) {
        const filename = path.basename(urlPath);
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); return res.end('File not found'); }
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
            res.end(data);
        });
        return;
    }

    // ── SCAN CHAT — Conversational AI Part Identification ─────────────────────
    // POST /api/scan-chat  { session_id?, message?, image (multipart file) }
    if (req.method === 'POST' && urlPath === '/api/scan-chat') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', async () => {
            try {
                const body = Buffer.concat(chunks);
                const contentType = req.headers['content-type'] || '';
                const boundaryMatch = contentType.match(/boundary=(.+)$/);

                if (!boundaryMatch) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ ok: false, error: 'Bad request' }));
                }

                const parts = parseMultipart(body, boundaryMatch[1]);
                const getText = (name) => parts.find(p => p.name === name)?.data.toString().trim() || '';
                const filePart = parts.find(p => p.filename && p.data.length > 0);

                let sessionId = getText('session_id');
                const userMessage = getText('message');

                // Create new session if needed
                if (!sessionId || !scanSessions[sessionId]) {
                    sessionId = 'scan_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                    scanSessions[sessionId] = {
                        history: [],
                        created: Date.now()
                    };
                }

                const session = scanSessions[sessionId];

                // Build user message for this turn
                let userMessageContent = userMessage;
                const images = [];

                if (filePart) {
                    const base64Image = filePart.data.toString('base64');
                    images.push(base64Image);
                }

                if (!userMessageContent && filePart) {
                    userMessageContent = 'Aquí tienes la foto de mi pieza. ¿Puedes ayudarme a identificarla?';
                }

                if (!userMessageContent && !filePart) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ ok: false, error: 'No message or image provided' }));
                }

                // Add user message to history
                const userMessageObj = { role: 'user', content: userMessageContent };
                if (images.length > 0) {
                    userMessageObj.images = images;
                }
                session.history.push(userMessageObj);

                const systemInstruction = `Eres un experto mecánico automotriz y asesor de piezas de repuesto para NewRev/Addicar, una tienda online de piezas de coches y motocicletas clásicas e impresas en 3D.

OBJETIVO: Identificar la pieza que el usuario te muestra o describe de forma conversacional.

REGLAS DE COMPORTAMIENTO MUY IMPORTANTES (SÍGUELAS ESTRICTAMENTE):
1. NUNCA ADIVINES NI TE INVENTES EL NOMBRE DE UNA PIEZA. Si recibes una foto de una pieza genérica (un trozo de plástico, un tornillo común, un soporte simple roto) o una foto borrosa, ES OBLIGATORIO que declares que no estás seguro.
2. Evalúa detenidamente la imagen. Si no puedes reconocer la función y el vehículo específico con un 95% de confianza visual inmediata, NO REVELES que sabes lo que es.
3. En lugar de adivinar, HAZ PREGUNTAS obligatorias al usuario para contextualizar:
   - ¿A qué marca, modelo y año de vehículo pertenece?
   - ¿En qué parte exacta del vehículo estaba instalada? (interior, motor, carrocería, debajo)
   - ¿Dicha pieza sirve de soporte a otra?
4. Si el usuario responde a las preguntas y, con esa información, ahora SÍ estás completamente seguro, entonces devuelves la identificación final.
5. SÓLO cuando estés completamente seguro de la identificación, responde con esta línea especial al FINAL de tu mensaje EXACTAMENTE con este formato:
   [IDENTIFIED]{"part_name":"Nombre de la pieza corregido","vehicle":"Marca Modelo Año","confidence":"99%","material":"Material recomendado (PETG, ABS, resina...)"}[/IDENTIFIED]
6. Sé conciso, 2 o 3 frases como máximo antes de hacer las preguntas adicionales. No aburras al usuario.
7. Comunícate de forma amigable usando algún emoji (🔧, 🔍, 🚗).
8. SIEMPRE en español.`;

                const ollamaMessages = [
                    { role: 'system', content: systemInstruction },
                    ...session.history
                ];

                const payload = {
                    model: 'llama3.2-vision',
                    messages: ollamaMessages,
                    stream: false
                };

                const response = await fetch('http://localhost:11434/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`Ollama Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                const aiText = data.message?.content || 'Lo siento, ocurrió un problema conectando con el asistente. ¿Podrías volver a intentarlo?';

                // Add AI response to history
                session.history.push({ role: 'assistant', content: aiText });

                // Check if part was identified
                const identifiedMatch = aiText.match(/\[IDENTIFIED\]([\s\S]*?)\[\/IDENTIFIED\]/);
                let identified = null;
                let cleanMessage = aiText;
                if (identifiedMatch) {
                    try {
                        identified = JSON.parse(identifiedMatch[1]);
                        cleanMessage = aiText.replace(/\[IDENTIFIED\][\s\S]*?\[\/IDENTIFIED\]/, '').trim();
                    } catch (e) { /* ignore parse errors */ }
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    ok: true,
                    session_id: sessionId,
                    message: cleanMessage,
                    identified: identified,
                    turn: session.history.length
                }));
            } catch (error) {
                console.error("Scan chat error:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: 'Internal server error' }));
            }
        });
        return;
    }

    // ── Novedad: POST /api/scan-comfy (Integración con ComfyUI) ──────────────────
    if (req.method === 'POST' && urlPath === '/api/scan-comfy') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', async () => {
            try {
                const body = Buffer.concat(chunks);
                const contentType = req.headers['content-type'] || '';
                const boundaryMatch = contentType.match(/boundary=(.+)$/);

                if (!boundaryMatch) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ ok: false, error: 'Petición incorrecta' }));
                }

                const parts = parseMultipart(body, boundaryMatch[1]);
                const filePart = parts.find(p => p.filename && p.data.length > 0);
                const descText = parts.find(p => p.name === 'message')?.data.toString().trim() || 'Describe esta pieza con detalle.';

                if (!filePart) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ ok: false, error: 'Se requiere una imagen para ComfyUI' }));
                }

                // 1. Subir la imagen a ComfyUI
                const uploadFormData = new FormData();
                const imageBlob = new Blob([filePart.data], { type: filePart.contentType });
                uploadFormData.append('image', imageBlob, filePart.filename);

                const uploadRes = await fetch('http://localhost:8188/upload/image', {
                    method: 'POST',
                    body: uploadFormData
                });
                const uploadData = await uploadRes.json();
                const comfyImageName = uploadData.name;

                // 2. Cargar el fichero JSON de tu Workflow
                const workflowPath = path.join(__dirname, 'comfyui_text_workflow.json');
                let workflowStr = fs.readFileSync(workflowPath, 'utf8');

                // 3. Reemplazar los nodos de (Imagen) y (Texto) con los dinámicos
                // (Debes sustituir 'LoadImage' y 'CLIPTextEncode' por los IDs de Nodo correctos en tu JSON exportado)
                const workflowJson = JSON.parse(workflowStr);

                // NOTA: Ajustar IDs ("5" y "3") según tu propio archivo de ComfyUI "Save (API Format)"
                if (workflowJson["5"] && workflowJson["5"].class_type === "LoadImage") {
                    workflowJson["5"].inputs.image = comfyImageName;
                }
                if (workflowJson["3"] && workflowJson["3"].class_type === "CLIPTextEncode") {
                    workflowJson["3"].inputs.text = descText;
                }

                // 4. Crear el Prompt a ejecutar
                const promptPayload = {
                    prompt: workflowJson,
                    client_id: 'newrev_client_' + Date.now()
                };

                // 5. Iniciar la generación en ComfyUI
                const promptRes = await fetch('http://localhost:8188/prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(promptPayload)
                });
                const promptData = await promptRes.json();

                // Aquí ComfyUI comienza a procesar. La respuesta te da un prompt_id.
                // Lo normal es conectarse por WebSockets a ws://localhost:8188 para recibir el resultado texto,
                // o usar la ruta de history: http://localhost:8188/history/PROMPT_ID

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    ok: true,
                    prompt_id: promptData.prompt_id,
                    message: "Generación enviada a ComfyUI. Debes hacer polling al /history o usar WebSockets cliente para recoger la respuesta de texto (ver código)."
                }));

            } catch (error) {
                console.error("ComfyUI error:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: 'Error conectando con ComfyUI (¿Está encendido en el puerto 8188?)' }));
            }
        });
        return;
    }

    // ── Serve frames ────────────────────────────────────────────────────────
    if (urlPath.startsWith('/frames/')) {
        const filename = path.basename(urlPath);
        const filePath = path.join(FRAMES_DIR, filename);
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); return res.end('Frame not found: ' + filename); }
            res.writeHead(200, { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000' });
            res.end(data);
        });
        return;
    }

    // ── Serve project files ─────────────────────────────────────────────────
    const servePath = urlPath === '/' ? '/index.html' : urlPath;
    const filePath = path.join(PROJECT_DIR, servePath);
    const ext = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); return res.end('Not found: ' + servePath); }
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': 'no-cache',
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n✅  Servidor NewRev corriendo en http://localhost:${PORT}\n`);
    console.log(`   Frames servidos desde: ${FRAMES_DIR}`);
    console.log(`   Pulsa Ctrl+C para detener.\n`);
    if (GMAIL_PASS === 'TU_CONTRASEÑA_DE_APP_AQUI') {
        console.warn('⚠️   AVISO: configura GMAIL_APP_PASS para enviar emails.');
        console.warn('    Guía: https://myaccount.google.com/apppasswords\n');
    }
});

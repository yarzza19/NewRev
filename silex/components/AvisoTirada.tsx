'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { IconoFlecha } from './Iconos';
import estilos from './AvisoTirada.module.css';

/**
 * La llamada a la acción como campo de formulario, no como caja de
 * color. Sin backend conectado: lo dice en voz alta en lugar de
 * fingir que ha guardado algo.
 */

export default function AvisoTirada() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className={estilos.forma}
      onSubmit={(evento) => {
        evento.preventDefault();
        if (!correo.includes('@') || correo.length < 5) {
          setError('Falta un correo con arroba para poder avisarte.');
          return;
        }
        setError(null);
        setCorreo('');
        toast('Aquí falta conectar tu lista de correo', {
          description: 'La plantilla no envía nada todavía: enchufa tu proveedor en AvisoTirada.tsx.',
        });
      }}
      noValidate
    >
      <label className={`accion ${estilos.etiqueta}`} htmlFor="correo-tirada">
        Avísame de la próxima tirada
      </label>
      <div className={estilos.linea}>
        <input
          id="correo-tirada"
          className={estilos.campo}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@correo.es"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'error-tirada' : undefined}
        />
        <button type="submit" className={estilos.enviar} aria-label="Apuntarme al aviso">
          <IconoFlecha />
        </button>
      </div>
      {error && (
        <p id="error-tirada" role="alert" className={estilos.error}>
          {error}
        </p>
      )}
    </form>
  );
}

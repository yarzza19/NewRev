import { cortes } from '@/lib/catalogo';
import Probador from '@/components/Probador';
import Cascada from '@/components/Cascada';
import PliegoCorte from '@/components/PliegoCorte';
import SetDePiezas from '@/components/SetDePiezas';
import NotaTaller from '@/components/NotaTaller';
import estilos from './page.module.css';

export default function Portada() {
  const [primero, ...resto] = cortes;
  // El corte desplegado es el segundo del catálogo: el primero ya
  // sale en la banda del primer pliego y repetirlo sería relleno.
  const desplegado = resto[0] ?? primero;

  if (!primero) {
    return (
      <section className={estilos.sinCatalogo}>
        <h1 className="titular">El catálogo está vacío</h1>
        <p className="parrafo">
          Añade tu primer corte en <code>data/products.json</code>, dentro de la lista{' '}
          <code>cortes</code>. La página se compone sola desde ahí.
        </p>
      </section>
    );
  }

  return (
    <>
      <Probador primero={primero} />

      <Cascada cortes={cortes} />

      {desplegado && (
        <section className={estilos.desplegado} aria-labelledby="titulo-desplegado">
          <div className={estilos.encabezadoDesplegado}>
            <h2 id="titulo-desplegado" className="seccion">
              Un corte desplegado
            </h2>
            <p className={`margenNota ${estilos.aclaracion}`}>
              La misma ficha que verás en cada pieza
            </p>
          </div>
          <PliegoCorte corte={desplegado} />
        </section>
      )}

      <SetDePiezas cortes={cortes} />

      <NotaTaller />
    </>
  );
}

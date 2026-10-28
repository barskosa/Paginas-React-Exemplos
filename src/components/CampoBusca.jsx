// Hook do React que cria um identificador único para cada instância do campo.
import { useId } from 'react';

// Componente controlado: o pai guarda o estado em "valor" e recebe alterações
// por "aoMudar(novoTexto)". Assim, busca e filtros podem compartilhar o mesmo estado.
export default function CampoBusca({
  valor,
  aoMudar,
  label = 'Buscar',
  placeholder = 'Buscar por nome ou ID',
}) {
  // Liga label e input sem repetir IDs quando houver duas buscas na mesma tela.
  const id = useId();

  return (
    <div className="field search-field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="search-input-wrap">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" />
        </svg>
        {/* onChange envia só o texto digitado; filtrar a lista é responsabilidade do pai. */}
        <input id={id} type="search" value={valor} onChange={(event) => aoMudar(event.target.value)} placeholder={placeholder} />
      </div>
    </div>
  );
}

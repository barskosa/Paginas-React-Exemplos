// O identificador conecta o rótulo ao select para clique e leitura acessível.
import { useId } from 'react';

// Contrato: opcoes é [{ valor, label }]; valor vem do estado do pai.
// aoMudar recebe a opção escolhida como string, inclusive para IDs numéricos.
export default function FiltroSelect({ label, valor, aoMudar, opcoes }) {
  const id = useId();

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} value={valor} onChange={(event) => aoMudar(event.target.value)}>
        {/* map transforma cada opção em JSX; key identifica cada opção entre as irmãs. */}
        {opcoes.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.label}</option>)}
      </select>
    </div>
  );
}

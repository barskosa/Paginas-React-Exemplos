// useState mantém o valor em memória; useEffect sincroniza com o navegador.
import { useEffect, useState } from 'react';

// Opcional: copie este hook somente se o enunciado pedir persistência local.
// Armazenar no navegador não modifica o JSON do projeto nem cria um backend.
// Os dados pertencem a este navegador/origem e não são compartilhados entre dispositivos.
function lerValor(chave, valorInicial) {
  // Evita acessar window caso este código seja executado fora de um navegador.
  if (typeof window === 'undefined') return { valor: valorInicial, aviso: '' };

  try {
    // localStorage só guarda strings. null indica que a chave ainda não foi salva.
    const texto = window.localStorage.getItem(chave);
    if (texto === null) return { valor: valorInicial, aviso: '' };
    const valor = JSON.parse(texto);
    // Esta validação confere apenas se é um array, não a estrutura de cada elemento.
    // Adapte a validação se a atividade exigir um formato mais específico.
    if (Array.isArray(valorInicial) && !Array.isArray(valor)) {
      return { valor: valorInicial, aviso: 'Os dados salvos eram inválidos. Foi usado o valor inicial.' };
    }
    return { valor, aviso: '' };
  } catch {
    // JSON inválido ou leitura bloqueada não devem impedir o uso do estado em memória.
    return {
      valor: valorInicial,
      aviso: 'Não foi possível ler os dados salvos. Você pode continuar usando a página.',
    };
  }
}

// Uso: const [favoritos, setFavoritos, aviso] = useLocalStorage('meus-favoritos', []);
// Mantenha a chave estável durante a montagem: trocar a chave não relê seu valor salvo.
// Use valores serializáveis em JSON, como arrays de IDs, objetos simples e números.
export default function useLocalStorage(chave, valorInicial) {
  // Inicialização preguiçosa: a leitura acontece na montagem, não a cada renderização.
  const [inicial] = useState(() => lerValor(chave, valorInicial));
  const [valor, setValor] = useState(inicial.valor);
  const [aviso, setAviso] = useState(inicial.aviso);

  useEffect(() => {
    try {
      // O efeito roda quando chave ou valor mudam. setValor pode receber uma função,
      // como em useState: setFavoritos((atuais) => [...atuais, novoId]).
      window.localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // Falta de espaço ou bloqueio mantém a interação disponível e informa o limite.
      setAviso('O navegador não permitiu salvar. As alterações ficam apenas nesta sessão.');
    }
  }, [chave, valor]);

  // Tupla: valor para renderizar, função para atualizar e mensagem opcional de aviso.
  return [valor, setValor, aviso];
}

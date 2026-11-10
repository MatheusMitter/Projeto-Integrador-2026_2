// Encerramento de sessão por contexto, não por prop.
//
// As pilhas de navegação são componentes de módulo, declarados fora do
// Navegacao para não remontar a cada render, e por isso não recebem props
// dele. O botão de sair fica dentro da pilha de Ajustes; o contexto leva a
// função até lá sem recriar componente.

import React from "react";

export const ContextoSessao = React.createContext<{ sair: () => void }>({
  sair: () => {},
});

export function useSessao() {
  return React.useContext(ContextoSessao);
}

// Fundo das telas de acesso: a tela inteira vira o ícone do StockEasy.
// Azul em cima, azul-noite embaixo e a linha em S separando os dois,
// como em docs/identidade-visual/icone.svg. Por cima vai um card claro
// com o formulário, para o fundo ficar só como ambiente. Aprovado em
// 02/11/2026 (opção 2E-a).

import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { cores } from "../theme/tema";

// Os dois desenhos do ícone, nas coordenadas 0–100 do arquivo oficial.
const METADE_DE_CIMA =
  "M-4 -4 H104 V22 H40 A14 14 0 0 0 40 50 H60 A14 14 0 0 1 60 78 H-4 Z";
const LINHA_S = "M108 22 H40 A14 14 0 0 0 40 50 H60 A14 14 0 0 1 60 78 H-8";

// Posição da forma na tela, em unidades do ícone (o desenho aprovado foi
// feito numa tela de 360 x 780 com o ícone ampliado 3,6 vezes e deslocado
// 70 para a direita e 70 para baixo).
const ESCALA = 3.6;
const DESLOCA_X = 70;
const DESLOCA_Y = 70;

export function FundoMarca({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  // O desenho aprovado tem 360 de largura; k leva as medidas dele para a
  // largura real da tela. Tudo é desenhado já em pixels, sem viewBox, para
  // o resultado não depender de como o SVG nativo trata o recorte.
  const k = width / 360;
  const forma = `translate(${DESLOCA_X * k} ${DESLOCA_Y * k}) scale(${ESCALA * k})`;

  return (
    <View style={e.fundo}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Rect width={width} height={height} fill={cores.marcaNoite} />
        <Path d={METADE_DE_CIMA} fill={cores.marcaAzul} transform={forma} />
        <Path
          d={LINHA_S}
          fill="none"
          stroke={cores.whiteLilac}
          strokeWidth={9}
          transform={forma}
        />
        {/* faixas que fecham o azul no topo e na borda esquerda, como no desenho */}
        <Rect x={-4} y={-4} width={width + 8} height={90 * k + 4} fill={cores.marcaAzul} />
        <Rect x={-4} y={-4} width={80 * k + 4} height={height + 8} fill={cores.marcaAzul} />
      </Svg>
      {children}
    </View>
  );
}

const e = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.marcaNoite },
});

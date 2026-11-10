// Leitor de código de barras pela câmera (RF43, recurso nativo R8).
//
// Abre em tela cheia, lê uma vez e devolve o código. Permissão negada ou
// cancelamento não alteram nada: o campo continua aceitando digitação.

import React, { useState } from "react";
import { Modal, StyleSheet, Text, Vibration, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Aviso, Botao } from "./base";
import { cores, espaco, fonte, raio } from "../theme/tema";

interface Props {
  aberto: boolean;
  onLer: (codigo: string) => void;
  onCancelar: () => void;
}

export function LeitorCodigo({ aberto, onLer, onCancelar }: Props) {
  const [permissao, pedirPermissao] = useCameraPermissions();
  // trava: a câmera dispara o evento várias vezes por segundo
  const [lido, setLido] = useState(false);

  React.useEffect(() => {
    if (aberto) {
      setLido(false);
      if (permissao && !permissao.granted && permissao.canAskAgain) {
        pedirPermissao();
      }
    }
  }, [aberto, permissao, pedirPermissao]);

  function aoLer(dados: string) {
    if (lido) return;
    setLido(true);
    Vibration.vibrate(60);
    onLer(dados.trim());
  }

  const negada = permissao !== null && !permissao.granted && !permissao.canAskAgain;

  return (
    <Modal visible={aberto} animationType="slide" onRequestClose={onCancelar}>
      <View style={e.tela}>
        {permissao?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a", "code128"],
            }}
            onBarcodeScanned={lido ? undefined : (r) => aoLer(r.data)}
          />
        ) : (
          <View style={e.semCamera}>
            {negada ? (
              <Aviso
                tipo="atencao"
                texto="A câmera está bloqueada para o StockEasy. Libere em Configurações do aparelho, Aplicativos, StockEasy, Permissões."
              />
            ) : (
              <Text style={e.texto}>Aguardando a permissão da câmera...</Text>
            )}
          </View>
        )}

        {/* moldura: muda de cor quando lê */}
        {permissao?.granted && (
          <View style={e.centro} pointerEvents="none">
            <View style={[e.moldura, lido && e.molduraLida]} />
            <Text style={e.dica}>
              {lido ? "Código lido" : "Aponte para o código de barras"}
            </Text>
          </View>
        )}

        <View style={e.rodape}>
          <Botao titulo="Cancelar" variante="contorno" onPress={onCancelar} />
        </View>
      </View>
    </Modal>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.texto },
  semCamera: { flex: 1, justifyContent: "center", padding: espaco.lg },
  texto: { color: cores.fundo, fontSize: fonte.corpo, textAlign: "center" },
  centro: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: espaco.md,
  },
  moldura: {
    width: "78%",
    aspectRatio: 1.6,
    borderWidth: 3,
    borderColor: cores.fundo,
    borderRadius: raio.grande,
  },
  molduraLida: { borderColor: cores.sucesso, borderWidth: 5 },
  dica: {
    color: cores.fundo,
    fontSize: fonte.corpo,
    fontWeight: "700",
    backgroundColor: "rgba(17, 26, 46, 0.6)",
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.xs,
    borderRadius: raio.padrao,
  },
  rodape: {
    position: "absolute",
    left: espaco.md,
    right: espaco.md,
    bottom: espaco.xl,
  },
});

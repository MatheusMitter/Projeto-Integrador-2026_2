// Cor de destaque do tema Android.
//
// O Android pinta com a cor de destaque (colorAccent) o que o app não desenha
// sozinho: os botões das janelas de confirmação (Alert), o cursor e as alças
// de seleção de texto. Sem ela, o tema AppCompat usa o verde-azulado padrão,
// fora da identidade do StockEasy. O app.json só tem opção para a cor
// primária (primaryColor), então este plugin grava a de destaque do mesmo
// jeito que o Expo grava a primária: em colors.xml e no AppTheme. A cor é a
// própria primaryColor, para as duas não se separarem.

const {
  AndroidConfig,
  withAndroidColors,
  withAndroidStyles,
} = require("expo/config-plugins");

const NOME = "colorAccent";

module.exports = function corDeDestaque(config) {
  const cor = config.primaryColor;
  if (!cor) {
    throw new Error("cor-de-destaque: defina primaryColor no app.json.");
  }

  config = withAndroidColors(config, (mod) => {
    mod.modResults = AndroidConfig.Colors.assignColorValue(mod.modResults, {
      name: NOME,
      value: cor,
    });
    return mod;
  });

  return withAndroidStyles(config, (mod) => {
    mod.modResults = AndroidConfig.Styles.assignStylesValue(mod.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: NOME,
      value: `@color/${NOME}`,
    });
    return mod;
  });
};

// Assinatura do APK de release.
//
// A pasta android/ é gerada pelo `npx expo prebuild` e fica fora do Git, então
// o que fosse editado à mão nela se perderia na próxima geração. Este plugin
// reaplica a assinatura toda vez. As senhas não ficam no projeto: vêm das
// propriedades STOCKEASY_RELEASE_* do Gradle, em ~/.gradle/gradle.properties
// (ver app/README.md). Sem elas, o release sai com a chave de debug, como no
// modelo do Expo.

const { withAppBuildGradle } = require("expo/config-plugins");

const PROPRIEDADE = "STOCKEASY_RELEASE_STORE_FILE";

const RELEASE = `        release {
            if (project.hasProperty('${PROPRIEDADE}')) {
                storeFile file(${PROPRIEDADE})
                storePassword STOCKEASY_RELEASE_STORE_PASSWORD
                keyAlias STOCKEASY_RELEASE_KEY_ALIAS
                keyPassword STOCKEASY_RELEASE_KEY_PASSWORD
            }
        }
`;

function aplicar(gradle) {
  if (gradle.includes(PROPRIEDADE)) return gradle;

  // 1. assinatura de release logo depois da de debug
  const comAssinatura = gradle.replace(
    /(signingConfigs \{\s*\n\s*debug \{[^}]*\}\n)/,
    `$1${RELEASE}`,
  );

  // 2. o tipo de build release passa a usá-la quando as senhas existem
  const comBuildType = comAssinatura.replace(
    /(buildTypes \{[\s\S]*?release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
    `$1signingConfig project.hasProperty('${PROPRIEDADE}') ? signingConfigs.release : signingConfigs.debug`,
  );

  // falhar alto é melhor que gerar um APK assinado com a chave errada
  if (comAssinatura === gradle || comBuildType === comAssinatura) {
    throw new Error(
      "assinatura-release: o modelo do android/app/build.gradle mudou; ajuste o plugin.",
    );
  }
  return comBuildType;
}

module.exports = function assinaturaRelease(config) {
  return withAppBuildGradle(config, (mod) => {
    mod.modResults.contents = aplicar(mod.modResults.contents);
    return mod;
  });
};

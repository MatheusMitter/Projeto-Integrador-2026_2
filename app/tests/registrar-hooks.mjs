// Registra o hook de resolução antes dos testes rodarem.
// Usado pelo script "test" do package.json, via --import.

import { register } from "node:module";

register("./resolucao-ts.mjs", import.meta.url);

# Imagem da retaguarda para o Render, que não tem Java nativo e roda contêiner.
# Etapa 1 compila com o Maven do próprio projeto; etapa 2 leva só o Java de
# execução e o .jar, sem código-fonte nem ferramentas de compilação.

FROM eclipse-temurin:21-jdk AS compilacao
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/
RUN chmod +x mvnw && ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --no-create-home stockeasy
COPY --from=compilacao /app/target/stockeasy-api-*.jar app.jar
USER stockeasy
# O plano gratuito do Render tem 512 MB. O heap fica com 60% e o resto
# sobra para a própria JVM. A porta vem da variável PORT, definida pelo Render.
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=60", "-jar", "app.jar"]

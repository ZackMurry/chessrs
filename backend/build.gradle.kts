import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.gradle.jvm.tasks.Jar

plugins {
	id("org.springframework.boot") version "2.5.1"
	id("io.spring.dependency-management") version "1.0.11.RELEASE"
	kotlin("jvm") version "1.5.10"
	kotlin("plugin.spring") version "1.5.10"
}

group = "com.zackmurry"
version = "0.1.2"
java.sourceCompatibility = JavaVersion.VERSION_11

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
	implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
	implementation("org.springframework:spring-webflux")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("io.projectreactor.netty:reactor-netty")
	implementation("org.flywaydb:flyway-core")
	compileOnly("io.jsonwebtoken:jjwt-api:0.11.2")
	implementation("io.jsonwebtoken:jjwt-impl:0.11.2")
	implementation("io.jsonwebtoken:jjwt-jackson:0.11.2")

	annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
	runtimeOnly("org.postgresql:postgresql")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testImplementation("org.springframework.security:spring-security-test")
	testImplementation("org.apache.commons:commons-lang3:3.11")
	implementation("com.graphql-java-kickstart:graphql-spring-boot-starter:11.1.0")
	implementation("com.graphql-java-kickstart:graphiql-spring-boot-starter:11.1.0")
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		freeCompilerArgs = listOf("-Xjsr305=strict")
		jvmTarget = "11"
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}


val fatJar = task("fatJar", type = Jar::class) {
	baseName = "${project.name}-fat"
	manifest {
		attributes["Implementation-Title"] = "ChesSRS Backend"
		attributes["Implementation-Version"] = version
		attributes["Main-Class"] = "com.zackmurry.chessrs.ChesSRSApplicationKt"
	}
	duplicatesStrategy = DuplicatesStrategy.EXCLUDE
	from(configurations.runtimeClasspath.get().map { if (it.isDirectory) it else zipTree(it) })
	with(tasks.jar.get() as CopySpec)
}

tasks {
	"build" {
		dependsOn(fatJar)
	}
}


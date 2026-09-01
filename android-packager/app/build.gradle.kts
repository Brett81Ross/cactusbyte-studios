plugins {
    id("com.android.application")
}

val permanentSigningEnabled = providers.environmentVariable("CACTUSBYTE_PERMANENT_SIGNING").orNull == "1"
val migrationDebuggable = providers.gradleProperty("cactusbyteMigrationDebuggable").orNull == "true"
if (migrationDebuggable && !permanentSigningEnabled) {
    error("cactusbyteMigrationDebuggable requires CACTUSBYTE_PERMANENT_SIGNING=1")
}

val permanentSigningFlavors = listOf(
    "cactusbyte",
    "noproblem",
    "machzero",
    "rapidtakeoff",
    "acelynnpro",
    "pocketstomp",
    "ghostlane",
    "firstbearing",
    "fantasy",
    "scouttrace",
    "shadownex",
    "terraflow",
    "orbitgather",
)

fun requiredSigningEnv(name: String): String =
    providers.environmentVariable(name).orNull
        ?: error("Missing required permanent-signing environment variable: $name")

android {
    namespace = "com.cactusbyte.wrapper"
    compileSdk = 36

    defaultConfig {
        minSdk = 26
        targetSdk = 36
        versionCode = 2
        versionName = "1.0.1"
    }

    signingConfigs {
        if (permanentSigningEnabled) {
            permanentSigningFlavors.forEach { flavor ->
                val suffix = flavor.uppercase()
                create("permanent-$flavor") {
                    storeFile = file(requiredSigningEnv("KEYSTORE_PATH_$suffix"))
                    storePassword = requiredSigningEnv("KEYSTORE_PASSWORD_$suffix")
                    keyAlias = requiredSigningEnv("KEY_ALIAS_$suffix")
                    keyPassword = requiredSigningEnv("KEY_PASSWORD_$suffix")
                    storeType = "JKS"
                }
            }
        }
    }

    flavorDimensions += listOf("brand", "distribution")
    productFlavors {
        create("cactusbyte") {
            dimension = "brand"
            applicationId = "com.cactusbyte.studios"
            resValue("string", "app_name", "CactusByte")
            buildConfigField("String", "START_URL", "\"https://cactusbyte-studios.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-cactusbyte")
        }
        create("noproblem") {
            dimension = "brand"
            applicationId = "com.cactusbyte.noproblem"
            resValue("string", "app_name", "No Problem Pressure Washing Matrix")
            buildConfigField("String", "START_URL", "\"https://noproblem-pws.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-noproblem")
        }
        create("machzero") {
            dimension = "brand"
            applicationId = "com.cactusbyte.machzero"
            resValue("string", "app_name", "MachZero")
            buildConfigField("String", "START_URL", "\"https://machzero-beta.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-machzero")
        }
        create("rapidtakeoff") {
            dimension = "brand"
            applicationId = "com.cactusbyte.rapidtakeoff"
            resValue("string", "app_name", "Rapid Takeoff")
            buildConfigField("String", "START_URL", "\"https://blueprint-estimator.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-rapidtakeoff")
        }
        create("acelynnpro") {
            dimension = "brand"
            applicationId = "com.cactusbyte.acelynnpro"
            resValue("string", "app_name", "Acelynn Pro")
            buildConfigField("String", "START_URL", "\"https://acelynn.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-acelynnpro")
        }
        create("pocketstomp") {
            dimension = "brand"
            applicationId = "com.cactusbyte.pocketstomp"
            resValue("string", "app_name", "PocketStomp")
            buildConfigField("String", "START_URL", "\"https://pocketstomp-v2-brett81ross.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-pocketstomp")
        }
        create("ghostlane") {
            dimension = "brand"
            applicationId = "com.cactusbyte.ghostlane"
            resValue("string", "app_name", "GhostLane")
            buildConfigField("String", "START_URL", "\"https://ghostlane-app.vercel.app/radar.html\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-ghostlane")
        }
        create("firstbearing") {
            dimension = "brand"
            applicationId = "com.cactusbyte.firstbearing"
            resValue("string", "app_name", "First Bearing")
            buildConfigField("String", "START_URL", "\"https://first-bearing.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-firstbearing")
        }
        create("fantasy") {
            dimension = "brand"
            applicationId = "com.cactusbyte.fantasyfootballmatrix"
            resValue("string", "app_name", "Fantasy Football Matrix")
            buildConfigField("String", "START_URL", "\"https://fantasy-football-selector-matrix.vercel.app/?v=1.5.5\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-fantasy")
        }
        create("scouttrace") {
            dimension = "brand"
            applicationId = "com.cactusbyte.scouttrace"
            resValue("string", "app_name", "Acelynn’s ScoutTrace")
            buildConfigField("String", "START_URL", "\"https://acelynn-scoutrace.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-scouttrace")
        }
        create("shadownex") {
            dimension = "brand"
            applicationId = "com.cactusbyte.shadownexprime"
            resValue("string", "app_name", "ShadowNex Prime")
            buildConfigField("String", "START_URL", "\"https://shadownex-prime.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-shadownex")
        }
        create("terraflow") {
            dimension = "brand"
            applicationId = "com.cactusbyte.terraflow"
            resValue("string", "app_name", "TerraFlow Matrix")
            buildConfigField("String", "START_URL", "\"https://terraflow-matrix.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-terraflow")
        }
        create("orbitgather") {
            dimension = "brand"
            applicationId = "com.cactusbyte.orbitgather"
            resValue("string", "app_name", "OrbitGather")
            buildConfigField("String", "START_URL", "\"https://orbitgather-wahh.vercel.app/\"")
            if (permanentSigningEnabled) signingConfig = signingConfigs.getByName("permanent-orbitgather")
        }

        create("direct") {
            dimension = "distribution"
            buildConfigField("String", "CHANNEL", "\"direct\"")
        }
        create("play") {
            dimension = "distribution"
            buildConfigField("String", "CHANNEL", "\"play\"")
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = false
            isDebuggable = migrationDebuggable
            if (!permanentSigningEnabled) {
                signingConfig = signingConfigs.getByName("debug")
            }
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.core:core:1.15.0")
}

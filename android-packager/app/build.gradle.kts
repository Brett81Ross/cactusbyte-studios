import com.android.build.api.variant.BuildConfigField
import com.android.build.api.variant.ResValue

plugins {
    id("com.android.application")
}

val permanentSigningEnabled = providers.environmentVariable("CACTUSBYTE_PERMANENT_SIGNING").orNull == "1"
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
        create("qa") {
            dimension = "distribution"
            applicationIdSuffix = ".qa"
            buildConfigField("String", "CHANNEL", "\"qa\"")
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
        release {
            isMinifyEnabled = false
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

androidComponents {
    beforeVariants(selector().withFlavor("distribution" to "qa")) { variantBuilder ->
        val isAcelynnPro = variantBuilder.productFlavors.contains("brand" to "acelynnpro")
        variantBuilder.enable = isAcelynnPro && variantBuilder.buildType == "debug"
    }

    onVariants(selector().withFlavor("distribution" to "qa")) { variant ->
        variant.buildConfigFields.put(
            "START_URL",
            BuildConfigField(
                "String",
                "\"https://appassets.androidplatform.net/assets/acelynnqa/index.html\"",
                "Pinned local Acelynn Pro recovery QA entry point",
            ),
        )
        variant.resValues.put(
            variant.makeResValueKey("string", "app_name"),
            ResValue("Acelynn Pro QA", "QA-only application label"),
        )
    }
}

dependencies {
    implementation("androidx.core:core:1.15.0")
    implementation("androidx.webkit:webkit:1.17.0")
}

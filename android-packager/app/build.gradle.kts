plugins {
    id("com.android.application")
}

val fantasyReleaseSigning = System.getenv("FANTASY_RELEASE_SIGNING") == "1"
val fantasyKeystorePath = System.getenv("FANTASY_ANDROID_KEYSTORE_PATH")
val fantasyKeystorePassword = System.getenv("FANTASY_ANDROID_KEYSTORE_PASSWORD")
val fantasyKeyAlias = System.getenv("FANTASY_ANDROID_KEY_ALIAS")
val fantasyKeyPassword = System.getenv("FANTASY_ANDROID_KEY_PASSWORD")

android {
    namespace = "com.cactusbyte.wrapper"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "1.0.1"
    }

    signingConfigs {
        if (fantasyReleaseSigning) {
            create("fantasyRelease") {
                val path = fantasyKeystorePath ?: error("FANTASY_ANDROID_KEYSTORE_PATH is required")
                storeFile = file(path)
                storePassword = fantasyKeystorePassword ?: error("FANTASY_ANDROID_KEYSTORE_PASSWORD is required")
                keyAlias = fantasyKeyAlias ?: error("FANTASY_ANDROID_KEY_ALIAS is required")
                keyPassword = fantasyKeyPassword ?: error("FANTASY_ANDROID_KEY_PASSWORD is required")
                storeType = "PKCS12"
            }
        }
    }

    flavorDimensions += "brand"
    productFlavors {
        create("cactusbyte") {
            dimension = "brand"
            applicationId = "com.cactusbyte.studios"
            resValue("string", "app_name", "CactusByte")
            buildConfigField("String", "START_URL", "\"https://cactusbyte-studios.vercel.app/\"")
        }
        create("noproblem") {
            dimension = "brand"
            applicationId = "com.cactusbyte.noproblem"
            resValue("string", "app_name", "No Problem Pressure Washing Matrix")
            buildConfigField("String", "START_URL", "\"https://noproblem-pws.vercel.app/\"")
        }
        create("machzero") {
            dimension = "brand"
            applicationId = "com.cactusbyte.machzero"
            resValue("string", "app_name", "MachZero")
            buildConfigField("String", "START_URL", "\"https://machzero-beta.vercel.app/\"")
        }
        create("rapidtakeoff") {
            dimension = "brand"
            applicationId = "com.cactusbyte.rapidtakeoff"
            resValue("string", "app_name", "Rapid Takeoff")
            buildConfigField("String", "START_URL", "\"https://blueprint-estimator.vercel.app/\"")
        }
        create("acelynnpro") {
            dimension = "brand"
            applicationId = "com.cactusbyte.acelynnpro"
            resValue("string", "app_name", "Acelynn Pro")
            buildConfigField("String", "START_URL", "\"https://acelynn.vercel.app/acelynnpro.png\"")
        }
        create("pocketstomp") {
            dimension = "brand"
            applicationId = "com.cactusbyte.pocketstomp"
            resValue("string", "app_name", "PocketStomp")
            buildConfigField("String", "START_URL", "\"https://pocketstomp-v2-brett81ross.vercel.app/\"")
        }
        create("ghostlane") {
            dimension = "brand"
            applicationId = "com.cactusbyte.ghostlane"
            resValue("string", "app_name", "GhostLane")
            buildConfigField("String", "START_URL", "\"https://ghostlane-app.vercel.app/radar.html\"")
        }
        create("firstbearing") {
            dimension = "brand"
            applicationId = "com.cactusbyte.firstbearing"
            resValue("string", "app_name", "First Bearing")
            buildConfigField("String", "START_URL", "\"https://first-bearing.vercel.app/\"")
        }
        create("fantasy") {
            dimension = "brand"
            applicationId = "com.cactusbyte.fantasyfootballmatrix"
            versionCode = 3
            versionName = "1.0.2"
            resValue("string", "app_name", "Fantasy Football Matrix")
            buildConfigField("String", "START_URL", "\"https://fantasy-football-selector-matrix.vercel.app/?v=1.5.4\"")
        }
        create("scouttrace") {
            dimension = "brand"
            applicationId = "com.cactusbyte.scouttrace"
            resValue("string", "app_name", "Acelynn’s ScoutTrace")
            buildConfigField("String", "START_URL", "\"https://acelynn-scoutrace.vercel.app/\"")
        }
        create("shadownex") {
            dimension = "brand"
            applicationId = "com.cactusbyte.shadownexprime"
            resValue("string", "app_name", "ShadowNex Prime")
            buildConfigField("String", "START_URL", "\"https://shadownex-prime.vercel.app/\"")
        }
        create("terraflow") {
            dimension = "brand"
            applicationId = "com.cactusbyte.terraflow"
            resValue("string", "app_name", "TerraFlow Matrix")
            buildConfigField("String", "START_URL", "\"https://terraflow-matrix.vercel.app/\"")
        }
        create("orbitgather") {
            dimension = "brand"
            applicationId = "com.cactusbyte.orbitgather"
            resValue("string", "app_name", "OrbitGather")
            buildConfigField("String", "START_URL", "\"https://orbitgather-wahh.vercel.app/\"")
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = false
            signingConfig = if (fantasyReleaseSigning) {
                signingConfigs.getByName("fantasyRelease")
            } else {
                signingConfigs.getByName("debug")
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

import { Alert } from "react-native";
import RNFetchBlob from 'react-native-fetch-blob'
import RNSync from "react-native-sync";

var settings = {
    syncServerUrl: "",//"http://localhost:8080/pervasync/server", // required
    syncUserName: "", //"user_1", // required
    syncUserPassword: ""//"welcome1", // required
};
var settingsLoaded = false;
var configSuccess = false;

async function loadSettings() {
    if (settingsLoaded) {
        return;
    }
    console.log("begin loadSettings");
    let path = RNFetchBlob.fs.dirs.DocumentDir + "/sync-settings.json";
    if (await RNFetchBlob.fs.exists(path)) {
        let str = await RNFetchBlob.fs.readFile(path, "utf8");
        if (str) {
            Object.assign(settings, JSON.parse(str));
        }
    } else {
        //settings["syncServerUrl"] = "http://localhost:8080/pervasync/server";
        settings["syncServerUrl"] = "http://203.195.233.31:8080/pervasync/server";
    }
    settingsLoaded = true;
    console.log("end loadSettings");
}

async function saveSettings() {
    let path = RNFetchBlob.fs.dirs.DocumentDir + "/sync-settings.json";
    await RNFetchBlob.fs.writeFile(path, JSON.stringify(settings), "utf8");
}

async function config() {
    try {
        if (!settingsLoaded) {
            await loadSettings();
        }
        if (!configSuccess) {
            await RNSync.config(settings);
            configSuccess = true;
            console.log("configSuccess=true");
        }
    } catch (error) {
        console.log("sync.js, config error=" + error);
        console.log("sync.js, config error.stack=" + error.stack);
    }
    return configSuccess;
}

async function sync() {
    if (!configSuccess) {
        configSuccess = await config();
    }
    if (configSuccess) {
        let syncSummary = await RNSync.sync();
        console.log("syncSummary:\r\n" +
            JSON.stringify(syncSummary, null, 4));
        if (syncSummary.syncErrorMessages) {
            Alert.alert("Sync Error", syncSummary.syncErrorMessages);
        }

        return syncSummary;
    }
}

async function getRealm(syncSchemaName) {
    if (!configSuccess) {
        configSuccess = await config();
    }
    if (configSuccess) {
        let syncRealm = await RNSync.getRealm(syncSchemaName);
        return syncRealm;
    }
}

async function getPath(syncFolderName) {
    if (!configSuccess) {
        configSuccess = await config();
    }
    if (configSuccess) {
        let path = await RNSync.getPath(syncFolderName);
        return path;
    }
}

async function reset() {
    try {
        configSuccess = false;
        await RNSync.config(settings, true);
        configSuccess = true;
        console.log("sync.js, reset success");
    } catch (error) {
        console.log("sync.js, reset error=" + error);
        console.log("sync.js, reset error.stack=" + error.stack);
    }
    return configSuccess;
}

export default {
    settings,
    loadSettings,
    saveSettings,
    config,
    sync,
    getRealm,
    getPath,
    reset
}

import React from 'react';
import { Text, View, StyleSheet, FlatList, Alert, Platform, NativeEventEmitter, NativeModules } from 'react-native';
import { List, ListItem } from "react-native-elements";
import t from 'tcomb-form-native';
import OpenFile from 'react-native-doc-viewer';
import sync from "./sync";
import RNSync from "react-native-sync";

var Form = t.form.Form;

var formOptions = {
  fields: {
    folderPicker: {
      label: 'Sync Folder'
    },
    order: ["folderPicker"]
  }
};

class FilesScreen extends React.Component {

  // constructor
  constructor(props) {
    super(props);
    this.state = {
      formType: t.struct({}),
      formValue: {},
      clientFolderPath: "",
      listData: [],
      refreshing: false
    };

    this.eventEmitter = new NativeEventEmitter(NativeModules.RNReactNativeDocViewer);
    this.eventEmitter.addListener('DoneButtonEvent', (data) => {
      console.log("Received DoneButtonEvent with data:" + JSON.stringify(data, null, 4));
    })
  }

  async componentDidMount() {
    try {
      let formType = await this.getFormType();
      this.setState({
        formType
      });
    } catch (error) {
      Alert.alert("Error", "" + error);
    }
  }

  // form

  async getFormType() {
    let folderIdNameMap = {};
    let configSuccess = await sync.config();
    console.log("getFormType, configSuccess=" + configSuccess);
    if (configSuccess) {
      for (let syncFolder of RNSync.clientFolderList) {
        console.log("RNSync.clientFolderList, syncFolder=" + syncFolder);
        folderIdNameMap[syncFolder.id] = syncFolder.name;
      }
    }

    let formFields = {
      folderPicker: t.enums(folderIdNameMap)
    }
    let formType = t.struct(formFields);
    return formType;
  }

  onChange = async (formValue) => {
    try {
      if (formValue) {

        if (formValue.folderPicker && formValue.folderPicker != this.state.formValue.folderPicker) {
          // listData
          console.log("formValue.folderPicker=" + formValue.folderPicker);
          this.syncFolder = RNSync.clientFolderMap[formValue.folderPicker];
          let listData = this.syncFolder.fileList;
          this.setState({
            clientFolderPath: this.syncFolder.clientFolderPath,
            listData
          });
        }

        this.setState({
          formValue
        });

        let formType = await this.getFormType();
        this.setState({
          formType
        });

      }
    } catch (error) {
      Alert.alert("Error", "" + error);
    }
  }

  // list

  keyExtractor = (item, index) => {
    return "" + index;
  }

  onPress = async (item) => {
    let path = await sync.getPath(this.syncFolder.name) + "/" + item.fileName;
    if (Platform.OS === 'ios') {
      OpenFile.openDoc([{
        url: path,
        fileNameOptional: item.fileName
      }], (error, url) => {
        if (error) {
          Alert.alert("Error", "" + error);
        } else {
          console.log(url)
        }
      })
    } else {
      //Android
      OpenFile.openDoc([{
        url: path,
        fileName: item.fileName,
        cache: true /*Use Cache Folder Android*/
      }], (error, url) => {
        if (error) {
          Alert.alert("Error", "" + error);
        } else {
          console.log(url)
        }
      })
    }

  }

  forceUpdate = async () => {
    let formType = await this.getFormType();
    this.setState({
      formType
    });

    if (this.state.formValue.folderPicker) {
      this.syncFolder = RNSync.clientFolderMap[this.state.formValue.folderPicker];
    }
    if (this.syncFolder) {
      let listData = this.syncFolder.fileList;
      this.setState({
        clientFolderPath: this.syncFolder.clientFolderPath,
        listData
      });
    }

    console.log("Calling super.forceUpdate");
    super.forceUpdate();
  }

  onRefresh = async () => {
    try {
      this.setState({ refreshing: true });
      await sync.sync();
      this.forceUpdate();
      this.setState({ refreshing: false });
    } catch (error) {
      Alert.alert("Error", "" + error);
    }
  }

  renderItem = ({ item, index }) => {
    let fileName = item.fileName;
    let length = item.length;
    let lastModified = item.lastModified;


    let listItem = (
      <ListItem
        title={`${fileName}`}
        titleNumberOfLines={2}
        subtitle={`${new Date(lastModified).toLocaleString()}`}
        badge={{ value: length }}
        onPress={() => this.onPress(item, index)}
      />
    );

    return listItem;
  }

  renderHeader() {
    return (
      <View>
        <Form
          ref={(formRef) => this.formRef = formRef}
          type={this.state.formType}
          options={formOptions}
          value={this.state.formValue}
          onChange={this.onChange}
        />
        <Text> {this.state.clientFolderPath}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
          <FlatList
            ListHeaderComponent={() => this.renderHeader()}
            data={this.state.listData}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderItem}
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
        </List>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 0,
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#ffffff',
  }

});

export default FilesScreen;
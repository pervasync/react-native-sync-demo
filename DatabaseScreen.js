import React from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { List, ListItem, Avatar } from "react-native-elements";
import t from 'tcomb-form-native';
import sync from "./sync";
import RNSync from "react-native-sync";

var Form = t.form.Form;

var formOptions = {
  fields: {
    schemaPicker: {
      label: 'Sync Schema'
    },
    tablePicker: {
      label: 'Table Name'
    },
    order: ["schemaPicker", "tablePicker"]
  }
};

class DatabaseScreen extends React.Component {

  // constructor
  constructor(props) {
    super(props);
    this.state = {
      formType: t.struct({}),
      formValue: {},
      listData: [],
      refreshing: false
    };
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
    let schemaIdNameMap = {};
    let tableIdNameMap = {};
    let configSuccess = await sync.config();
    console.log("getFormType, configSuccess=" + configSuccess);
    if (configSuccess) {

      for (let syncSchema of RNSync.clientSchemaList) {
        console.log("RNSync.clientSchemaList, syncSchema=" + syncSchema);
        schemaIdNameMap[syncSchema.id] = syncSchema.name;
      }

      if (this.state.formValue.schemaPicker) {
        let syncSchema = RNSync.clientSchemaMap[this.state.formValue.schemaPicker];
        console.log("syncSchema=" + syncSchema);
        for (let syncTable of syncSchema.tableList) {
          tableIdNameMap[syncTable.id] = syncTable.name;
        }
      }
    }

    let formFields = {
      schemaPicker: t.enums(schemaIdNameMap),
      tablePicker: t.enums(tableIdNameMap)
    }
    let formType = t.struct(formFields);
    return formType;
  }

  onChange = async (formValue) => {
    try {
      if (formValue) {
        //console.log("onFormChange, formValue=" + JSON.stringify(formValue, null, 4));
        if (!formValue.schemaPicker || formValue.schemaPicker != this.state.formValue.schemaPicker) {
          formValue.tablePicker = null;
          this.setState({
            listData: []
          });
        }
        //console.log("onFormChange, new formValue=" + JSON.stringify(formValue, null, 4));

        if (formValue.tablePicker && formValue.tablePicker != this.state.formValue.tablePicker) {
          // listData
          console.log("formValue.schemaPicker=" + formValue.schemaPicker);
          this.syncSchema = RNSync.clientSchemaMap[formValue.schemaPicker];
          this.syncTable = this.syncSchema.tableMap[formValue.tablePicker];
          this.realm = await sync.getRealm(this.syncSchema.name);
          let listData = this.realm.objects(this.syncTable.name);
          this.setState({
            listData
          });
        }

        this.setState({
          formValue
        });

        this.getFormType().then((formType) => {
          this.setState({
            formType
          });
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

  // update listData when force update
  forceUpdate = async () => {
    this.getFormType().then((formType) => {
      this.setState({
        formType
      });
    });

    if (this.syncSchema) {
      this.realm = await sync.getRealm(this.syncSchema.name);
    }
    let listData = [];
    if (this.syncTable && this.realm) {
      listData = this.realm.objects(this.syncTable.name);
    }
    this.setState({
      listData
    });
    console.log("Calling super.forceUpdate");
    super.forceUpdate();
  }

  onPress = (item, index) => {
    this.props.navigation.navigate('RecordScreen', {
      item, index, realm: this.realm, syncTable: this.syncTable,
      refresh: async () => { await this.forceUpdate() }
    });
  }

  onRefresh = async () => {
    try {
      this.setState({ refreshing: true });
      await sync.sync();
      console.log("Calling forceUpdate");
      await this.forceUpdate();
      this.setState({ refreshing: false });
    } catch (error) {
      Alert.alert("Error", "" + error);
    }
  }

  renderItem = ({ item, index }) => {
    let col0 = item[this.syncTable.columnsPkRegLob[0].columnName];
    let col1 = "";
    if (this.syncTable.columnsPkRegLob.length > 1) {
      col1 = item[this.syncTable.columnsPkRegLob[1].columnName];
    }

    let listItem = (
      <ListItem
        avatar={<Avatar
          rounded
          title={"" + index}
        />}
        title={`${col0}`}
        subtitle={`${col1}`}
        onPress={() => this.onPress(item, index)}
      />
    );

    return listItem;
  }

  renderHeader() {
    return (
      <Form
        ref={(formRef) => this.formRef = formRef}
        type={this.state.formType}
        options={formOptions}
        value={this.state.formValue}
        onChange={this.onChange}
      />
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

export default DatabaseScreen;
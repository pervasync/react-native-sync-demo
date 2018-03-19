import React from 'react';
import { Button, View, ScrollView, StyleSheet, Alert } from 'react-native';
import t from 'tcomb-form-native';
import sync from "./sync"

var Form = t.form.Form;

class RecordScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formType: t.struct({}),
      formOptions: { fields: {} },
      formValue: {},
      buttonDisabled: true
    };
  }

  async componentDidMount() {
    try {
      let params = this.props.navigation.state.params;
      let syncTable = params.syncTable;
      let item = params.item;

      let types = {};
      let options = {};
      let formValue = {};

      for (let column of syncTable.columnsPkRegLob) {
        let name = column.columnName;
        let type = column.deviceColDef.type;
        let nullable = column.nullable;
        let label = name + " (" + type + ")";
        let editable = true;

        // Realm supports the following basic types: bool, int, float, double, string, data, and date.
        // tcomb: Boolean, String, Number, Date
        if (type == "bool") {
          types[name] = t.Boolean;
        } else if (type == "int" || type == "float" || type == "double") {
          types[name] = t.Number;
        } else if (type == "date") {
          types[name] = t.Date;
        } else if (type == "string") {
          types[name] = t.String;
        } else {
          types[name] = t.String;
          editable = false;
        }
        if (nullable) {
          types[name] = t.maybe(types[name]);
        }

        options[name] = {
          label: label,
          editable: editable,
          autoCorrect: false,
          autoCapitalize: "none"
        }

        if (editable) {
          formValue[name] = item[name];
        }
      }


      this.setState({
        formType: t.struct(types),
        formOptions: { fields: options },
        formValue
      });
    } catch (error) {
      Alert.alert("Error", "" + error);
    }
  }

  onFormChange(value) {
    this.setState({
      formValue: value,
      buttonDisabled: false
    });
  }

  onPressDelete() {
    Alert.alert(
      "Confirmation",
      "Are you sure to delete the record?",
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: 'OK', 
          onPress: () => {
            console.log('OK Pressed');
            let params = this.props.navigation.state.params;
            let realm = params.realm;
            let item = params.item;
            realm.write(() => {
              realm.delete(item);
            });
            this.props.navigation.goBack();
            params.refresh();// force update parent
            sync.sync();
          }
        },
      ],
      { cancelable: false }
    );
  }

  async onPressSave() {
    // value will be null if validation didn't pass. this.state.formValue may not be null
    const value = this.formRef.getValue();
    this.setState({
      buttonDisabled: true
    });
    if (value) {
      let params = this.props.navigation.state.params;
      let realm = params.realm;
      let syncTable = params.syncTable;

      try {
        realm.write(() => {
          let itemToSave = {};
          for (let column of syncTable.columnsPkRegLob) {
            let name = column.columnName;
            itemToSave[name] = value[name];
          }
          realm.create(syncTable.name, itemToSave, true);
        });
        Alert.alert("Success", "Record saved.", [{
          text: "OK",
          onPress: ()=>{
            this.props.navigation.goBack();
            params.refresh();// force update parent
            sync.sync();
          }
        }]);
      } catch (error) {
        Alert.alert("Error", "" + error);
      }
    } else {
      Alert.alert("Error", "Correct the form errors and try again.");
    }
  }

  render() {
    return (
      <ScrollView style={{
        flex: 1
      }}>
        <View style={styles.container}>
          <Form
            ref={(formRef) => this.formRef = formRef}
            type={this.state.formType}
            options={this.state.formOptions}
            value={this.state.formValue}
            onChange={(value) => this.onFormChange(value)}
          />
          <View style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <View style={{ flex: 1 }}>
              <Button
                title="Delete"
                onPress={() => this.onPressDelete()}
                color="red"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                disabled={this.state.buttonDisabled}
                title="Save"
                onPress={() => this.onPressSave()}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 0,
    padding: 20,
    backgroundColor: '#ffffff',
  }
});

export default RecordScreen;
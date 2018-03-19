import React from 'react';
import { StyleSheet, Button, View, Alert } from 'react-native';
import t from 'tcomb-form-native';
import sync from "./sync"

var Form = t.form.Form;

let formFields = {
  syncServerUrl: t.String,
  syncUserName: t.String,
  syncUserPassword: t.String
}
var formType = t.struct(formFields);

var formOptions = {
  fields: {
    syncServerUrl: {
      label: 'Sync Server URL',
      //help: "http://localhost:8080/pervasync/server",
      autoCorrect: false,
      autoFocus: true,
      autoCapitalize: "none"
    },
    syncUserName: {
      label: 'Username',
      autoCorrect: false,
      autoCapitalize: "none"
    },
    syncUserPassword: {
      label: 'Password',
      secureTextEntry: true,
      autoCorrect: false,
      autoCapitalize: "none"
    },
    order: ["syncServerUrl", "syncUserName", "syncUserPassword"]
  }
};


class SettingsScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      formValue: {},
      buttonDisabled: true
    };
  }

  async componentDidMount() {
    try{
    await sync.loadSettings();
      let formValue = sync.settings;
      this.setState({
        formValue
      });
    } catch(error){
      Alert.alert("Error", "" + error);
    }
  }

  onFormChange(value) {
    this.setState({
      formValue: value,
      buttonDisabled: false
    });
  }

  async onPressSave() {
    // value will be null if validation didn't pass. this.state.formValue may not be null
    const value = this.formRef.getValue();
     this.setState({
      buttonDisabled: true
    });
    if (value) {
      Object.assign(sync.settings, value);
      try {
        await sync.saveSettings();
        Alert.alert("Success", "Settings saved. Navigate to Database or Files tab and pull to start a sync session.");
      } catch (error) {
        Alert.alert("Error", "" + error);
      }
    } else {
      Alert.alert("Error", "Correct the form errors and try again.");
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Form
          ref={(formRef) => this.formRef = formRef}
          type={formType}
          options={formOptions}
          value={this.state.formValue}
          onChange={(value) => this.onFormChange(value)}
        />
        <Button
          disabled={this.state.buttonDisabled}
          title="Save"
          onPress={() => this.onPressSave()}
        />
      </View>
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

export default SettingsScreen;
import React from 'react';
import Editor from "@monaco-editor/react";
import './App.css'; 

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editorRef : {},
      value : "function hello() {\n\talert('Hello world!');\n}"
    }
  }

  handleEditorDidMount(editor, monaco) {
    this.setState({editorRef : editor});
  }


  render() {
    return (
      <div id="outer">
        <div id="display-outer">
          <div id="display-spacing">
            <div id="display">
              <Editor
                defaultLanguage="javascript"
                defaultValue={this.state.value}
                onMount={this.handleEditorDidMount.bind(this)}
                options={{ minimap : {enabled: false} }}
              />
            </div>
          </div>
        </div>
        <div id="input-outer">
          <div id="input-spacing">
            <div id="input">
              <Editor
                defaultLanguage="javascript"
                defaultValue={this.state.value}
                onMount={this.handleEditorDidMount.bind(this)}
                options={{ minimap : {enabled: false} }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

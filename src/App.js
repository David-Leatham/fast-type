import React from 'react';
import Editor from "@monaco-editor/react";
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      codeToType: "",
      // codeToType: "function hello() {\r\n    alert('Hello world!');\r\nasdöfj\nasdöjflaskjdf\n}",
      typedCode: "",
      // value: "function hello() {\n\talert('Hello world!');\nasdöfj\nasdöjflaskjdf\n}"
    }
    this.manState = {
      viewEditorRef: null,
      writeEditorRef: null,
      monacoRef: null,
      decorations: [],
      editorDecoratoins: null,
    }
    
    this.ViewEditorOptions = { 
      minimap: {enabled: false}, 
      readOnly: true,
      hover: {enabled: false},
      lineNumbers: "off",
      renderLineHighlight: "none",
      scrollBeyondLastLine: false
    }
    this.WriteEditorOptions = { 
      minimap: {enabled: false}, 
      readOnly: false,
      hover: {enabled: false},
      lineNumbers: "off",
      renderLineHighlight: "none",
      scrollBeyondLastLine: false,
      autoClosingBrackets: "never",
      autoClosingDelete: "never",
      autoClosingOvertype: "never",
      autoClosingQuotes: "never",
      renderValidationDecorations: "off",
      ////// Stop Sugstions
      quickSuggestions: {
        "other": false,
       "comments": false,
       "strings": false
      },
      parameterHints: {
          enabled: false
      },
      ordBasedSuggestions: false,
      suggestOnTriggerCharacters: false,
      acceptSuggestionOnEnter: "off",
      tabCompletion: "off",
      wordBasedSuggestions: false
    }
  }

  handleViewEditorMount(editor, monaco) {
    // this.setState({
    //   editorRef: editor,
    //   monacoRef: monaco
    // });
    this.manState.viewEditorRef = editor;
    this.manState.monacoRef = monaco;
    fetch('/files/javascript-algorithms-master/src/algorithms/cryptography/caesar-cipher/caesarCipher.js')
    .then((r) => {
      // console.log(r);
      return r.text()})
    .then(text  => {
      // console.log(text);
      // console.log(this)
      this.manState.viewEditorRef.setValue(text);
      this.setState({codeToType: text}, () => this.markEditors(text));
    })
    // this.markEditors();
  }

  handleWriteEditorMount(editor, monaco) {
    // this.setState({
    //   editorRef: editor,
    //   monacoRef: monaco
    // });
    this.manState.writeEditorRef = editor;
    this.manState.monacoRef = monaco;
  }

  handleEditorChange(editorValue, event) {
    this.setState({typedCode: editorValue}, () => this.markEditors(editorValue, event));
  }

  markEditors(editorValue, event) {
    let typedCode=this.state.typedCode;
    let codeToType=this.state.codeToType;
    let monaco=this.manState.monacoRef;

    if (!codeToType) { return }

    let gen = this.getStringComparisonGenerator(typedCode, codeToType, monaco);
    let decorationsList = [];

    let result = gen.next();
    if (result.done) {return []}

    let sectionStart = [1, 1];
    let sectionTruth = result.value[0];
    let lastResult = null;
    while (!result.done) {
      if (result.value[0] !== sectionTruth) {
        decorationsList.push({
          range: new monaco.Range(
            sectionStart[0],
            sectionStart[1],
            result.value[1][0],
            result.value[1][1]),
          options: { inlineClassName: sectionTruth ? 'inlineCorrect' : 'inlineFalse' }
        })

        sectionTruth = !sectionTruth;
        sectionStart = [...result.value[1]];
      }
      lastResult = result;
      result = gen.next();
    }
    
    decorationsList.push({
      range: new monaco.Range(
        sectionStart[0],
        sectionStart[1],
        lastResult.value[1][0],
        lastResult.value[1][1]),
      options: { inlineClassName: sectionTruth ? 'inlineCorrect' : 'inlineFalse' }
    })

    this.manState.decorations = this.manState.viewEditorRef.deltaDecorations(this.manState.decorations, decorationsList);
  }

  getStringComparisonGenerator(typedCode, codeToType, monaco) {
    function* makeRangeIterator(typedCode, codeToType) {
      let tablegth = 4;
      // let positionTypedCode  = [1, 1];
      let positionCodeToType = [1, 1];
      let indexTypedCode  = 0;
      let indexCodeToType = 0;
      yield [typedCode.charAt(0) === codeToType.charAt(0), positionCodeToType];
      
      let typedCodeChar  = null;
      let codeToTypeChar = null;
      while (indexTypedCode < typedCode.length && indexCodeToType < codeToType.length) {
        // Get Characters
        // for (const code of [[indexTypedCode, typedCodeChar, typedCode, null], [indexCodeToType, codeToTypeChar, codeToType, positionCodeToType]]) {
        
        // Get typed Characters
        if (typedCode.charAt(indexTypedCode) === '\n' || typedCode.charAt(indexTypedCode) === '\r') {
          if (indexTypedCode + 1 < typedCode.length && (typedCode.charAt(indexTypedCode + 1) === '\n' || typedCode.charAt(indexTypedCode + 1) === '\r')) {
            indexTypedCode += 2;
          } else {
            indexTypedCode += 1;
          }
          typedCodeChar = '\r\n';
        } else if (typedCode.charAt(indexTypedCode) === ' ' && indexTypedCode + tablegth - 1 < typedCode.length && typedCode.slice(indexTypedCode, tablegth) === " ".repeat(tablegth)) {
          indexTypedCode += 4;
          typedCodeChar = '\t';
        } else {
          indexTypedCode += 1;
          typedCodeChar = typedCode.charAt(indexTypedCode);
        }

        // Get typed Characters
        if (codeToType.charAt(indexCodeToType) === '\n' || codeToType.charAt(indexCodeToType) === '\r') {
          if (indexCodeToType + 1 < codeToType.length && (codeToType.charAt(indexCodeToType + 1) === '\n' || codeToType.charAt(indexCodeToType + 1) === '\r')) {
            indexCodeToType += 2;
          } else {
            indexCodeToType += 1;
          }
          codeToTypeChar = '\r\n';
          positionCodeToType[0] += 1;
          positionCodeToType[1] = 1;
        } else if (codeToType.charAt(indexCodeToType) === ' ' && indexCodeToType + tablegth - 1 < codeToType.length && codeToType.slice(indexCodeToType, tablegth) === " ".repeat(tablegth)) {
          indexCodeToType += 4;
          codeToTypeChar = '\t';
          positionCodeToType[1] += 4;
        } else {
          indexCodeToType += 1;
          codeToTypeChar = codeToType.charAt(indexCodeToType);
          positionCodeToType[1] += 1;
        }

        yield [typedCodeChar === codeToTypeChar, positionCodeToType];
      }
    }

    const gen = makeRangeIterator(typedCode, codeToType, monaco);
    return gen
  }


  render() {
    return (
      <div id="outer">
        <div id="display-outer">
          <div id="display-spacing">
            <div id="display">
              <Editor
                defaultLanguage="javascript"
                defaultValue={this.state.codeToType}
                onMount={this.handleViewEditorMount.bind(this)}
                // onChange={this.handleEditorChange.bind(this)}
                options={this.ViewEditorOptions}
              />
            </div>
          </div>
        </div>
        <div id="input-outer">
          <div id="input-spacing">
            <div id="input">
              <Editor
                defaultLanguage="javascript"
                defaultValue={this.state.typedCode}
                onMount={this.handleWriteEditorMount.bind(this)}
                onChange={this.handleEditorChange.bind(this)}
                options={this.WriteEditorOptions}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

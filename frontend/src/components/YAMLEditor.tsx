import React, { useState, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Editor from '@monaco-editor/react';
import { ValidationResult } from '../types/api';

interface YAMLEditorProps {
  content: string;
  onChange: (value: string) => void;
  onValidation?: (result: ValidationResult | null) => void;
  isLoading?: boolean;
  filename?: string;
}

const YAMLEditor: React.FC<YAMLEditorProps> = ({
  content,
  onChange,
  onValidation,
  isLoading = false,
  filename,
}) => {
  const editorRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setEditorLoaded(true);

    // Set editor options
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineHeight: 22,
      padding: { top: 16, bottom: 16 },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      rulers: [80, 120],
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Emit save event (handled by parent component)
      window.dispatchEvent(new CustomEvent('editor-save'));
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction('actions.find').run();
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Box sx={{ color: 'text.secondary' }}>Loading editor...</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Editor
        height="100%"
        language="yaml"
        value={content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="light"
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          glyphMargin: false,
          folding: true,
          showFoldingControls: 'always',
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all',
          contextmenu: true,
          mouseWheelZoom: true,
          smoothScrolling: true,
        }}
        loading={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <CircularProgress size={24} />
          </Box>
        }
      />
    </Box>
  );
};

export default YAMLEditor;

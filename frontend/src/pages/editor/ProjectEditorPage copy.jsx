import { useState } from "react";
import AppShell from "../../components/layout/AppShell";
import EditorHeader from "../../components/editor/EditorHeader.jsx";
import EditorLeftPanel from "../../components/editor/EditorLeftPanel.jsx/index.js";
import EditorCanvas from "../../components/editor/EditorCanvas";
import EditorRightPanel from "../../components/editor/EditorRightPanel.jsx/index.js";
import "../../styles/editor.css";

export default function ProjectEditorPage() {
    const [mode, setMode] = useState("module"); // module | drawing
    const [view, setView] = useState("2D");

    return (
        <AppShell>
            <div className="editor-page">
                <EditorHeader view={view} onChangeView={setView} />

                <div className="editor-workspace">
                    <EditorLeftPanel mode={mode} onChangeMode={setMode} />

                    <EditorCanvas view={view} />

                    <EditorRightPanel />
                </div>
            </div>
        </AppShell>
    );
}
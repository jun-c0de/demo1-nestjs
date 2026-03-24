export default function EditorCanvas({ view }) {
    return (
        <div className="editor-canvas">
            <div className="canvas-toolbar">
                <button>입면</button>
                <button>평면</button>
                <button>측면</button>
            </div>

            <div className="canvas-area">
                {view === "2D" ? "2D 캔버스 영역" : "3D 영역"}
            </div>
        </div>
    );
}
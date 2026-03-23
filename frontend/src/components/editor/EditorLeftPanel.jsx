export default function EditorLeftPanel({ mode, onChangeMode }) {
    return (
        <div className="editor-left">
            <div className="editor-tabs">
                <button
                    className={mode === "module" ? "active" : ""}
                    onClick={() => onChangeMode("module")}
                >
                    모듈
                </button>

                <button
                    className={mode === "drawing" ? "active" : ""}
                    onClick={() => onChangeMode("drawing")}
                >
                    도면 업로드
                </button>
            </div>

            <div className="editor-left-content">
                {mode === "module" && <div>모듈 목록 영역</div>}
                {mode === "drawing" && (
                    <div>
                        <input type="file" />
                        <p>도면 업로드</p>
                    </div>
                )}
            </div>
        </div>
    );
}
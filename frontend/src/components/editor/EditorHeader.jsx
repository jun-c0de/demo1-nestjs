export default function EditorHeader({
    breadcrumbs = [],
    workspaceView,
    onChangeWorkspaceView,
    cameraView,
    onChangeCameraView,
    onGoDashboard,
    onSave,
    onExit,
}) {
    return (
        <header className="editor-header">
            <div className="editor-header-left">
                <button type="button" className="editor-brand" onClick={onGoDashboard}>
                    CRAFT
                </button>

                <div className="editor-header-actions">
                    <button type="button" className="editor-header-btn">
                        파일
                    </button>
                    <button type="button" className="editor-header-btn" onClick={onSave}>
                        저장
                    </button>
                    <button
                        type="button"
                        className="editor-header-btn primary"
                        onClick={onExit}
                    >
                        저장 후 나가기
                    </button>
                </div>
            </div>

            <div className="editor-header-center">
                <div className="editor-breadcrumbs">
                    {breadcrumbs.map((item, index) => (
                        <span key={item.key} className="editor-breadcrumb-item">
                            {index > 0 && <span className="editor-breadcrumb-sep">&gt;</span>}
                            <span>{item.label}</span>
                        </span>
                    ))}
                </div>
            </div>

            <div className="editor-header-right">
                <div className="editor-segmented">
                    <button
                        type="button"
                        className={workspaceView === "2D" ? "active" : ""}
                        onClick={() => onChangeWorkspaceView("2D")}
                    >
                        2D
                    </button>
                    <button
                        type="button"
                        className={workspaceView === "3D" ? "active" : ""}
                        onClick={() => onChangeWorkspaceView("3D")}
                    >
                        3D
                    </button>
                </div>

                <div className="editor-segmented">
                    {["입면", "평면", "측면"].map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={cameraView === item ? "active" : ""}
                            onClick={() => onChangeCameraView(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}
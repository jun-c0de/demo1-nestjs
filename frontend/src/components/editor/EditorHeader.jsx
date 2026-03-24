export default function EditorHeader({ view, onChangeView }) {
    return (
        <div className="editor-header">
            <div className="editor-header-left">
                <span className="logo">CRAFT</span>

                <button>파일</button>
                <button>저장</button>
                <button className="primary">저장 후 나가기</button>
            </div>

            <div className="editor-header-center">
                내 프로젝트 &gt; 테스트 프로젝트 &gt; 디자인
            </div>

            <div className="editor-header-right">
                <button
                    className={view === "2D" ? "active" : ""}
                    onClick={() => onChangeView("2D")}
                >
                    2D
                </button>
                <button
                    className={view === "3D" ? "active" : ""}
                    onClick={() => onChangeView("3D")}
                >
                    3D
                </button>
            </div>
        </div>
    );
}
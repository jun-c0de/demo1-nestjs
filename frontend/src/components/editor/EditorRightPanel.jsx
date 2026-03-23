export default function EditorRightPanel() {
    return (
        <div className="editor-right">
            <h3>공간 설정</h3>

            <div className="panel-section">
                <label>가로</label>
                <input type="number" />
            </div>

            <div className="panel-section">
                <label>세로</label>
                <input type="number" />
            </div>

            <div className="panel-section">
                <h4>자동 견적</h4>
                <p>총 금액: 0원</p>
            </div>
        </div>
    );
}
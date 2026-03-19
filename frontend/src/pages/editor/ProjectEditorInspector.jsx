import { useProjectEditorStore } from "../stores/projectEditorStore";

export default function ProjectEditorInspector() {
    const room = useProjectEditorStore((state) => state.room);
    const setRoomField = useProjectEditorStore((state) => state.setRoomField);

    return (
        <aside className="project-inspector-panel">
            <div className="inspector-header-row">
                <span className="inspector-title">2D 미리보기</span>
                <button type="button" className="inspector-expand-btn">↗</button>
            </div>

            <div className="inspector-block">
                <div className="inspector-label">공간 설정</div>
                <div className="inspector-dimension-row">
                    <label>W</label>
                    <input
                        type="number"
                        value={room.width}
                        onChange={(e) => setRoomField("width", Number(e.target.value))}
                    />
                    <span>mm</span>
                </div>
                <div className="inspector-dimension-row">
                    <label>H</label>
                    <input
                        type="number"
                        value={room.height}
                        onChange={(e) => setRoomField("height", Number(e.target.value))}
                    />
                    <span>mm</span>
                </div>
            </div>

            <div className="inspector-block">
                <div className="inspector-label">공간 유형</div>
                <div className="inspector-chip-row">
                    <button type="button" className="inspector-chip active">양쪽벽</button>
                    <button type="button" className="inspector-chip">좌측벽</button>
                    <button type="button" className="inspector-chip">우측벽</button>
                    <button type="button" className="inspector-chip">벽없음</button>
                </div>
            </div>

            <div className="inspector-block">
                <div className="inspector-label">단내림</div>
                <div className="inspector-chip-row">
                    <button type="button" className="inspector-chip active">없음</button>
                    <button type="button" className="inspector-chip">좌단내림</button>
                    <button type="button" className="inspector-chip">우단내림</button>
                </div>
            </div>

            <div className="inspector-block">
                <div className="inspector-label">컬럼수</div>
                <div className="inspector-chip-row">
                    {[6, 7, 8].map((count) => (
                        <button
                            key={count}
                            type="button"
                            className={`inspector-chip ${room.columnCount === count ? "active" : ""}`}
                            onClick={() => setRoomField("columnCount", count)}
                        >
                            {count}
                        </button>
                    ))}
                </div>
            </div>

            <div className="inspector-block">
                <div className="inspector-label">프레임 설정</div>
                <div className="inspector-chip-row">
                    <button type="button" className="inspector-chip active">전체서라운드</button>
                    <button type="button" className="inspector-chip">양쪽서라운드</button>
                    <button type="button" className="inspector-chip">노서라운드</button>
                </div>

                <div className="inspector-frame-grid">
                    <div className="inspector-frame-input">
                        <span>좌측</span>
                        <input
                            type="number"
                            value={room.leftFrame}
                            onChange={(e) => setRoomField("leftFrame", Number(e.target.value))}
                        />
                    </div>
                    <div className="inspector-frame-input">
                        <span>우측</span>
                        <input
                            type="number"
                            value={room.rightFrame}
                            onChange={(e) => setRoomField("rightFrame", Number(e.target.value))}
                        />
                    </div>
                    <div className="inspector-frame-input">
                        <span>상부</span>
                        <input
                            type="number"
                            value={room.topFrame}
                            onChange={(e) => setRoomField("topFrame", Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="inspector-block">
                <div className="inspector-label">배치방식</div>
                <div className="inspector-chip-row">
                    <button type="button" className="inspector-chip active">바닥 배치</button>
                    <button type="button" className="inspector-chip">띄워서 배치</button>
                </div>

                <div className="inspector-frame-grid">
                    <div className="inspector-frame-input">
                        <span>높이</span>
                        <input
                            type="number"
                            value={room.baseHeight}
                            onChange={(e) => setRoomField("baseHeight", Number(e.target.value))}
                        />
                    </div>
                    <div className="inspector-frame-input">
                        <span>깊이</span>
                        <input
                            type="number"
                            value={room.depth}
                            onChange={(e) => setRoomField("depth", Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
}
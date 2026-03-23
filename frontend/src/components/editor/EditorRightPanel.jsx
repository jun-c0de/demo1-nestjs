export default function EditorRightPanel({
    drawingFile,
    drawingLocked,
    drawingOpacity,
    workspaceView,
    cameraView,
    mmPerPixel,
    pixelDistance,
    realDistanceMm,
    walls = [],
    totalWallLengthMm = 0,
    onRemoveWall,
    onClearWalls,
}) {
    return (
        <aside className="editor-right-panel">
            <div className="editor-panel-card">
                <h3 className="editor-panel-title">3D 프리뷰 설정</h3>
                <div className="editor-summary-list">
                    <div className="editor-summary-item">
                        <span>벽 높이</span>
                        <strong>2400 mm</strong>
                    </div>
                    <div className="editor-summary-item">
                        <span>벽 두께</span>
                        <strong>120 mm</strong>
                    </div>
                    <div className="editor-summary-item">
                        <span>생성 벽 수</span>
                        <strong>{walls.length}개</strong>
                    </div>
                </div>
            </div>

            <div className="editor-panel-card">
                <h3 className="editor-panel-title">스케일 정보</h3>
                <div className="editor-summary-list">
                    <div className="editor-summary-item">
                        <span>기준 픽셀 길이</span>
                        <strong>{pixelDistance ? pixelDistance.toFixed(2) : "0.00"} px</strong>
                    </div>
                    <div className="editor-summary-item">
                        <span>실제 길이</span>
                        <strong>{realDistanceMm || "0"} mm</strong>
                    </div>
                    <div className="editor-summary-item">
                        <span>변환 스케일</span>
                        <strong>{mmPerPixel ? `${mmPerPixel.toFixed(4)} mm/px` : "미설정"}</strong>
                    </div>
                </div>
            </div>

            <div className="editor-panel-card">
                <div className="editor-panel-header-row">
                    <h3 className="editor-panel-title">벽선 목록</h3>
                    <button
                        type="button"
                        className="editor-mini-btn"
                        onClick={onClearWalls}
                        disabled={walls.length === 0}
                    >
                        전체 삭제
                    </button>
                </div>

                {walls.length === 0 ? (
                    <p className="editor-panel-desc">
                        아직 그린 벽선이 없습니다. 기준 길이를 설정한 뒤 벽선을 그려보세요.
                    </p>
                ) : (
                    <>
                        <div className="editor-wall-list">
                            {walls.map((wall) => (
                                <div key={wall.id} className="editor-wall-item">
                                    <div className="editor-wall-item-main">
                                        <strong>벽 {wall.index}</strong>
                                        <span>
                                            {wall.lengthMm
                                                ? `${wall.lengthMm.toFixed(0)} mm`
                                                : `${wall.lengthPx.toFixed(1)} px`}
                                        </span>
                                    </div>
                                    <div className="editor-wall-item-sub">
                                        <span>
                                            ({wall.start.x.toFixed(1)}, {wall.start.y.toFixed(1)})
                                        </span>
                                        <span>
                                            ({wall.end.x.toFixed(1)}, {wall.end.y.toFixed(1)})
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="editor-mini-btn danger"
                                        onClick={() => onRemoveWall(wall.id)}
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="editor-estimate-box">
                            <div className="editor-summary-item">
                                <span>총 벽 길이</span>
                                <strong>
                                    {mmPerPixel
                                        ? `${totalWallLengthMm.toFixed(0)} mm`
                                        : "스케일 미설정"}
                                </strong>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="editor-panel-card">
                <h3 className="editor-panel-title">자동 견적 준비</h3>
                <p className="editor-panel-desc">
                    이제 벽 길이 합산까지 되었으니, 다음 단계에서 벽 타입/높이/자재 단가를 붙이면 자동 견적 계산으로 바로 연결할 수 있습니다.
                </p>

                <div className="editor-estimate-box">
                    <div className="editor-summary-item">
                        <span>총 자재비</span>
                        <strong>0원</strong>
                    </div>
                    <div className="editor-summary-item">
                        <span>총 시공비</span>
                        <strong>0원</strong>
                    </div>
                    <div className="editor-summary-item">
                        <span>예상 합계</span>
                        <strong>0원</strong>
                    </div>
                </div>
            </div>
        </aside>
    );
}
export default function EditorLeftPanel({
    activeTab,
    onChangeTab,
    drawingFile,
    drawingImageUrl,
    drawingLocked,
    drawingOpacity,
    onUploadDrawing,
    onClearDrawing,
    onToggleLocked,
    onChangeOpacity,
    isScaleMode,
    onToggleScaleMode,
    scalePoints,
    pixelDistance,
    realDistanceMm,
    onChangeRealDistanceMm,
    onApplyScale,
    onResetScalePoints,
    mmPerPixel,
    isDrawMode,
    onToggleDrawMode,
    onFinishWallDrawing,
    draftWallStart,
    wallCount,
    onClearWalls,
}) {
    function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        onUploadDrawing(file);
        event.target.value = "";
    }

    return (
        <aside className="editor-left-panel">
            <div className="editor-left-tabs">
                <button
                    type="button"
                    className={activeTab === "drawing" ? "active" : ""}
                    onClick={() => onChangeTab("drawing")}
                >
                    도면 업로드
                </button>
                <button
                    type="button"
                    className={activeTab === "module" ? "active" : ""}
                    onClick={() => onChangeTab("module")}
                >
                    모듈
                </button>
            </div>

            {activeTab === "drawing" ? (
                <>
                    <div className="editor-panel-card">
                        <h3 className="editor-panel-title">도면 업로드</h3>
                        <p className="editor-panel-desc">
                            PNG, JPG 파일을 업로드해서 배경 도면으로 사용할 수 있습니다.
                        </p>

                        <label className="editor-upload-box">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleFileChange}
                                hidden
                            />
                            <span>파일 선택</span>
                        </label>

                        <div className="editor-file-meta">
                            <div>
                                <strong>현재 파일</strong>
                                <p>{drawingFile ? drawingFile.name : "업로드된 파일 없음"}</p>
                            </div>
                        </div>

                        <div className="editor-form-row">
                            <label htmlFor="drawing-opacity">도면 투명도</label>
                            <input
                                id="drawing-opacity"
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={drawingOpacity}
                                onChange={(event) => onChangeOpacity(Number(event.target.value))}
                            />
                            <span>{Math.round(drawingOpacity * 100)}%</span>
                        </div>

                        <div className="editor-inline-actions">
                            <button
                                type="button"
                                className="editor-panel-btn"
                                onClick={onToggleLocked}
                                disabled={!drawingImageUrl}
                            >
                                {drawingLocked ? "배경 잠금 해제" : "배경 잠금"}
                            </button>

                            <button
                                type="button"
                                className="editor-panel-btn danger"
                                onClick={onClearDrawing}
                                disabled={!drawingImageUrl}
                            >
                                도면 제거
                            </button>
                        </div>
                    </div>

                    <div className="editor-panel-card">
                        <h3 className="editor-panel-title">기준 길이 설정</h3>
                        <p className="editor-panel-desc">
                            캔버스에서 기준점 2개를 찍고 실제 길이(mm)를 입력하세요.
                        </p>

                        <div className="editor-inline-actions">
                            <button
                                type="button"
                                className={`editor-panel-btn ${isScaleMode ? "active-mode" : ""}`}
                                onClick={onToggleScaleMode}
                                disabled={!drawingImageUrl}
                            >
                                {isScaleMode ? "기준점 찍는 중" : "기준점 찍기 시작"}
                            </button>

                            <button
                                type="button"
                                className="editor-panel-btn"
                                onClick={onResetScalePoints}
                                disabled={scalePoints.length === 0}
                            >
                                점 초기화
                            </button>
                        </div>

                        <div className="editor-scale-status">
                            <div className="editor-summary-item">
                                <span>찍은 점</span>
                                <strong>{scalePoints.length}/2</strong>
                            </div>
                            <div className="editor-summary-item">
                                <span>픽셀 길이</span>
                                <strong>{pixelDistance ? pixelDistance.toFixed(2) : "0.00"} px</strong>
                            </div>
                            <div className="editor-summary-item">
                                <span>현재 스케일</span>
                                <strong>{mmPerPixel ? `${mmPerPixel.toFixed(4)} mm/px` : "미설정"}</strong>
                            </div>
                        </div>

                        <div className="editor-form-row">
                            <label htmlFor="real-distance-mm">실제 길이(mm)</label>
                            <input
                                id="real-distance-mm"
                                type="number"
                                min="1"
                                placeholder="예: 3600"
                                value={realDistanceMm}
                                onChange={(event) => onChangeRealDistanceMm(event.target.value)}
                                className="editor-text-input"
                            />
                        </div>

                        <button
                            type="button"
                            className="editor-panel-btn primary-btn"
                            onClick={onApplyScale}
                            disabled={scalePoints.length !== 2}
                        >
                            스케일 적용
                        </button>
                    </div>

                    <div className="editor-panel-card">
                        <h3 className="editor-panel-title">벽선 그리기</h3>
                        <p className="editor-panel-desc">
                            기준 길이 설정 후 캔버스에서 점을 찍어 벽선을 계속 이어서 그릴 수 있습니다.
                        </p>

                        <div className="editor-inline-actions">
                            <button
                                type="button"
                                className={`editor-panel-btn ${isDrawMode ? "active-mode" : ""}`}
                                onClick={onToggleDrawMode}
                                disabled={!drawingImageUrl || !mmPerPixel}
                            >
                                {isDrawMode ? "그리는 중" : "벽선 그리기 시작"}
                            </button>

                            <button
                                type="button"
                                className="editor-panel-btn"
                                onClick={onFinishWallDrawing}
                                disabled={!draftWallStart}
                            >
                                현재 선 종료
                            </button>
                        </div>

                        <div className="editor-scale-status">
                            <div className="editor-summary-item">
                                <span>벽 개수</span>
                                <strong>{wallCount}개</strong>
                            </div>
                            <div className="editor-summary-item">
                                <span>그리기 상태</span>
                                <strong>{draftWallStart ? "다음 점 대기 중" : "대기"}</strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="editor-panel-btn"
                            onClick={onClearWalls}
                            disabled={wallCount === 0}
                        >
                            전체 벽선 초기화
                        </button>
                    </div>
                </>
            ) : (
                <div className="editor-panel-card">
                    <h3 className="editor-panel-title">모듈 라이브러리</h3>
                    <div className="editor-module-list">
                        <button type="button" className="editor-module-item">기본장</button>
                        <button type="button" className="editor-module-item">상부장</button>
                        <button type="button" className="editor-module-item">하부장</button>
                        <button type="button" className="editor-module-item">키큰장</button>
                    </div>
                </div>
            )}
        </aside>
    );
}
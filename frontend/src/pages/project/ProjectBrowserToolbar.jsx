export default function ProjectBrowserToolbar({
    breadcrumbs,
    searchKeyword,
    onChangeSearchKeyword,
    viewMode,
    onChangeViewMode,
    sortMode,
    onChangeSortMode,
    onCreateDesign,
    onCreateFolder,
    onNavigateBreadcrumb,
    onGoBack,
    onGoForward,
    onGoUp,
    canGoBack,
    canGoForward,
    canGoUp,
}) {
    return (
        <div className="project-browser-toolbar">
            <div className="project-browser-toolbar-left">
                <div className="project-browser-nav-controls">
                    <button
                        type="button"
                        className="project-browser-icon-btn"
                        onClick={onGoBack}
                        disabled={!canGoBack}
                        aria-label="뒤로"
                        title="뒤로"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        className="project-browser-icon-btn"
                        onClick={onGoForward}
                        disabled={!canGoForward}
                        aria-label="앞으로"
                        title="앞으로"
                    >
                        ›
                    </button>
                    <button
                        type="button"
                        className="project-browser-icon-btn"
                        onClick={onGoUp}
                        disabled={!canGoUp}
                        aria-label="상위 폴더"
                        title="상위 폴더"
                    >
                        ↑
                    </button>
                </div>

                <div className="project-browser-actions">
                    <button
                        type="button"
                        className="project-browser-btn primary"
                        onClick={onCreateDesign}
                    >
                        + 새 디자인
                    </button>
                    <button
                        type="button"
                        className="project-browser-btn"
                        onClick={onCreateFolder}
                    >
                        + 새 폴더
                    </button>
                </div>

                <div className="project-browser-breadcrumbs">
                    {breadcrumbs.map((item, index) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`project-browser-breadcrumb ${index === breadcrumbs.length - 1 ? "current" : ""
                                }`}
                            onClick={() => onNavigateBreadcrumb(item.key)}
                        >
                            {index > 0 && <span className="sep">&gt;</span>}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="project-browser-toolbar-right">
                <input
                    type="text"
                    className="project-browser-search"
                    value={searchKeyword}
                    onChange={(event) => onChangeSearchKeyword(event.target.value)}
                    placeholder="프로젝트 내부 검색"
                />

                <select
                    className="project-browser-select"
                    value={viewMode}
                    onChange={(event) => onChangeViewMode(event.target.value)}
                >
                    <option value="보통 아이콘">보통 아이콘</option>
                    <option value="큰 아이콘">큰 아이콘</option>
                    <option value="목록">목록</option>
                </select>

                <select
                    className="project-browser-select"
                    value={sortMode}
                    onChange={(event) => onChangeSortMode(event.target.value)}
                >
                    <option value="수정일순">수정일순</option>
                    <option value="이름순">이름순</option>
                </select>
            </div>
        </div>
    );
}
export default function ProjectBrowserToolbar({
    title,
    searchKeyword,
    onChangeSearchKeyword,
    viewMode,
    onChangeViewMode,
    sortMode,
    onChangeSortMode,
    onCreateDesign,
    onCreateFolder,
}) {
    return (
        <div className="project-browser-toolbar">
            <div className="project-browser-toolbar__left">
                <button type="button" className="project-browser-toolbar__primary-btn" onClick={onCreateDesign}>
                    + 새 디자인
                </button>

                <button type="button" className="project-browser-toolbar__secondary-btn" onClick={onCreateFolder}>
                    + 새 폴더
                </button>

                <div className="project-browser-toolbar__breadcrumb">
                    <span>내 프로젝트</span>
                    <span>›</span>
                    <span className="is-current">{title}</span>
                </div>
            </div>

            <div className="project-browser-toolbar__controls">
                <input
                    type="text"
                    className="project-browser-toolbar__search"
                    placeholder="검색"
                    value={searchKeyword}
                    onChange={(e) => onChangeSearchKeyword(e.target.value)}
                />

                <select
                    className="project-browser-toolbar__select"
                    value={viewMode}
                    onChange={(e) => onChangeViewMode(e.target.value)}
                >
                    <option value="보통 아이콘">보통 아이콘</option>
                    <option value="목록">목록</option>
                    <option value="자세히">자세히</option>
                </select>

                <select
                    className="project-browser-toolbar__select"
                    value={sortMode}
                    onChange={(e) => onChangeSortMode(e.target.value)}
                >
                    <option value="수정일순">수정일순</option>
                    <option value="이름순">이름순</option>
                </select>
            </div>
        </div>
    );
}
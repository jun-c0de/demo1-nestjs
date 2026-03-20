import React, { useState } from "react";

export default function DashboardToolbar({
    currentSectionTitle,
    searchKeyword,
    onSearchChange,
    viewMode,
    onViewModeChange,
    sortMode,
    onSortModeChange,
    isBrowserMode = false,
    projectTitle = "",
    onCreateDesign,
    onCreateFolder,
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const subProjects = [
        { name: "ㅇㅇ", date: "2026.03.19" },
        { name: "새 프로젝트 1", date: "2026.03.18" },
        { name: "디자인 시안", date: "2026.03.15" },
    ];

    return (
        <div className="dashboard-toolbar">
            <div className="toolbar-left">
                {isBrowserMode && (
                    <div className="browser-action-group">
                        <button type="button" className="new-design-btn" onClick={onCreateDesign}>
                            + 새 디자인
                        </button>

                        <button type="button" className="new-folder-btn" onClick={onCreateFolder}>
                            + 새 폴더
                        </button>
                    </div>
                )}

                <div className="nav-controls">
                    <button type="button" className="nav-btn" title="뒤로">‹</button>
                    <button type="button" className="nav-btn" title="앞으로">›</button>
                    <button type="button" className="nav-btn" title="상위 폴더">↑</button>
                </div>

                <div className="address-bar-container">
                    <div className="address-bar" onClick={() => !isBrowserMode && setIsDropdownOpen(!isDropdownOpen)}>
                        <div className="address-path">
                            <span className="address-icon">📁</span>

                            {!isBrowserMode ? (
                                <>
                                    <span className="path-segment">내 프로젝트</span>
                                    <span className="path-separator">›</span>
                                    <span className="path-segment active">{currentSectionTitle}</span>
                                </>
                            ) : (
                                <>
                                    <span className="path-segment">진행중 프로젝트</span>
                                    <span className="path-separator">›</span>
                                    <span className="path-segment active">{projectTitle}</span>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            className="address-arrow-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isBrowserMode) {
                                    setIsDropdownOpen((prev) => !prev);
                                }
                            }}
                        >
                            <span className={`arrow-icon ${isDropdownOpen ? "open" : ""}`}>⌵</span>
                        </button>
                    </div>

                    {!isBrowserMode && isDropdownOpen && (
                        <div className="address-dropdown">
                            {subProjects.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    <div className="dropdown-item-content">
                                        <span className="item-icon">📄</span>
                                        <span className="item-name">{item.name}</span>
                                    </div>
                                    <span className="item-date">{item.date}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="toolbar-right">
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        className="search-input"
                        placeholder="검색..."
                        value={searchKeyword}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <select
                    className="toolbar-select"
                    value={viewMode}
                    onChange={(e) => onViewModeChange(e.target.value)}
                >
                    <option>보통 아이콘</option>
                    <option>목록</option>
                    <option>자세히</option>
                </select>

                <select
                    className="toolbar-select"
                    value={sortMode}
                    onChange={(e) => onSortModeChange(e.target.value)}
                >
                    <option>수정일순</option>
                    <option>이름순</option>
                </select>
            </div>
        </div>
    );
}
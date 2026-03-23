import { useState } from "react";

export default function DashboardToolbar({
    title,
    searchKeyword,
    onChangeSearchKeyword,
    viewMode,
    onChangeViewMode,
    sortMode,
    onChangeSortMode,
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const subProjects = [
        { name: "ㅇㅇ", date: "2026.03.19" },
        { name: "새 프로젝트 1", date: "2026.03.18" },
        { name: "디자인 시안", date: "2026.03.15" },
    ];

    return (
        <div className="dashboard-toolbar">
            <div className="dashboard-toolbar__left">
                <button type="button" className="dashboard-toolbar__nav-btn" aria-label="뒤로">
                    ‹
                </button>
                <button type="button" className="dashboard-toolbar__nav-btn" aria-label="앞으로">
                    ›
                </button>
                <button type="button" className="dashboard-toolbar__nav-btn" aria-label="위로">
                    ↑
                </button>

                <div className="dashboard-toolbar__breadcrumb-wrap">
                    <button
                        type="button"
                        className="dashboard-toolbar__breadcrumb"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <span className="dashboard-toolbar__title">내 프로젝트</span>
                        <span className="dashboard-toolbar__breadcrumb-sep">›</span>
                        <span className="dashboard-toolbar__title is-current">{title}</span>
                        <span className="dashboard-toolbar__caret">⌵</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="dashboard-toolbar__dropdown">
                            {subProjects.map((item, idx) => (
                                <button
                                    key={`${item.name}-${idx}`}
                                    type="button"
                                    className="dashboard-toolbar__dropdown-item"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <span className="dashboard-toolbar__dropdown-name">
                                        {item.name}
                                    </span>
                                    <span className="dashboard-toolbar__dropdown-date">
                                        {item.date}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-toolbar__controls">
                <input
                    type="text"
                    className="dashboard-toolbar__search"
                    placeholder="검색"
                    value={searchKeyword}
                    onChange={(e) => onChangeSearchKeyword(e.target.value)}
                />

                <select
                    className="dashboard-toolbar__select"
                    value={viewMode}
                    onChange={(e) => onChangeViewMode(e.target.value)}
                >
                    <option value="보통 아이콘">보통 아이콘</option>
                    <option value="목록">목록</option>
                    <option value="자세히">자세히</option>
                </select>

                <select
                    className="dashboard-toolbar__select"
                    value={sortMode}
                    onChange={(e) => onChangeSortMode(e.target.value)}
                >
                    <option value="수정일순">수정일순</option>
                    <option value="이름순">이름순</option>
                    <option value="종류순">종류순</option>
                </select>
            </div>
        </div>
    );
}
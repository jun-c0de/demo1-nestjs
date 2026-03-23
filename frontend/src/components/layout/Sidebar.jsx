const MENU_ITEMS = [
    { key: "active", label: "진행중", countKey: "active" },
    { key: "completed", label: "완료됨", countKey: "completed" },
    { key: "trash", label: "휴지통", countKey: "trash" },
    { key: "sharedWithMe", label: "공유받은 파일", countKey: "sharedWithMe" },
    { key: "sharedByMe", label: "공유한 파일", countKey: "sharedByMe" },
];

export default function Sidebar({ activeMenu, counts, onChangeMenu }) {
    return (
        <aside className="sidebar">
            <nav className="sidebar__nav" aria-label="프로젝트 메뉴">
                {MENU_ITEMS.map((item) => {
                    const isActive = activeMenu === item.key;
                    const count = counts?.[item.countKey] ?? 0;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            className={`sidebar__item ${isActive ? "is-active" : ""}`}
                            onClick={() => onChangeMenu(item.key)}
                        >
                            <span className="sidebar__label">{item.label}</span>
                            <span className="sidebar__count">{count}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
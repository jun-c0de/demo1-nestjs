export default function ProjectContextMenu({
    project,
    activeMenu,
    onRenameClick,
    onShareClick,
    onMoveStatus,
    onMoveToTrash,
    onDuplicate,
    onPermanentDelete,
}) {
    return (
        <div className="project-context-menu">
            {activeMenu !== "trash" && (
                <>
                    <button
                        type="button"
                        className="project-menu-item"
                        onClick={() => onRenameClick(project)}
                    >
                        이름 바꾸기
                    </button>

                    <button
                        type="button"
                        className="project-menu-item"
                        onClick={() => onShareClick(project)}
                    >
                        공유
                    </button>

                    {activeMenu !== "completed" && (
                        <button
                            type="button"
                            className="project-menu-item"
                            onClick={() => onMoveStatus(project.id, "completed")}
                        >
                            완료된 프로젝트로 이동
                        </button>
                    )}

                    {activeMenu !== "active" && (
                        <button
                            type="button"
                            className="project-menu-item"
                            onClick={() => onMoveStatus(project.id, "active")}
                        >
                            진행중 프로젝트로 이동
                        </button>
                    )}

                    <button
                        type="button"
                        className="project-menu-item"
                        onClick={() => onDuplicate(project.id)}
                    >
                        복제
                    </button>

                    <button
                        type="button"
                        className="project-menu-item project-menu-item-danger"
                        onClick={() => onMoveToTrash(project.id)}
                    >
                        삭제
                    </button>
                </>
            )}

            {activeMenu === "trash" && (
                <>
                    <button
                        type="button"
                        className="project-menu-item"
                        onClick={() => onMoveStatus(project.id, "active")}
                    >
                        복구
                    </button>

                    <button
                        type="button"
                        className="project-menu-item project-menu-item-danger"
                        onClick={() => onPermanentDelete(project.id)}
                    >
                        삭제
                    </button>
                </>
            )}
        </div>
    );
}
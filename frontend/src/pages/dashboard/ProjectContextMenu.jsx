export default function ProjectContextMenu({
    project,
    activeMenu,
    onRenameClick,
    onShareClick,
    onMoveStatus,
    onMoveToTrash,
    onDuplicate,
    onPermanentDelete,
    onClose,
}) {
    const projectId = project.id || project._id;
    const isSharedMenu =
        activeMenu === "sharedWithMe" || activeMenu === "sharedByMe";

    function handleAction(action) {
        action?.();
        onClose?.();
    }

    return (
        <div
            className="project-context-menu"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {activeMenu !== "trash" && (
                <>
                    <button
                        type="button"
                        className="project-menu-item"
                        onClick={() => handleAction(() => onRenameClick(project))}
                    >
                        이름 바꾸기
                    </button>

                    {!isSharedMenu && (
                        <button
                            type="button"
                            className="project-menu-item"
                            onClick={() => handleAction(() => onShareClick(project))}
                        >
                            공유
                        </button>
                    )}

                    {activeMenu !== "completed" && !isSharedMenu && (
                        <button
                            type="button"
                            className="project-menu-item"
                            onClick={() =>
                                handleAction(() => onMoveStatus(projectId, "completed"))
                            }
                        >
                            완료된 프로젝트로 이동
                        </button>
                    )}

                    {activeMenu !== "active" && activeMenu !== "sharedWithMe" && (
                        <button
                            type="button"
                            className="project-menu-item"
                            onClick={() =>
                                handleAction(() => onMoveStatus(projectId, "active"))
                            }
                        >
                            진행중 프로젝트로 이동
                        </button>
                    )}

                    {!isSharedMenu && (
                        <button
                            type="button"
                            className="project-menu-item"
                            onClick={() => handleAction(() => onDuplicate(projectId))}
                        >
                            복제
                        </button>
                    )}

                    {activeMenu !== "sharedWithMe" && (
                        <button
                            type="button"
                            className="project-menu-item project-menu-item-danger"
                            onClick={() => handleAction(() => onMoveToTrash(projectId))}
                        >
                            삭제
                        </button>
                    )}
                </>
            )}

            {activeMenu === "trash" && (
                <>
                    <button
                        type="button"
                        className="project-menu-item"
                        onClick={() => handleAction(() => onMoveStatus(projectId, "active"))}
                    >
                        복구
                    </button>

                    <button
                        type="button"
                        className="project-menu-item project-menu-item-danger"
                        onClick={() => handleAction(() => onPermanentDelete(projectId))}
                    >
                        영구 삭제
                    </button>
                </>
            )}
        </div>
    );
}
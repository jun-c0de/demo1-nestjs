import { useEffect, useState } from "react";
import { getProjectShares, shareProject, unshareProject } from "../../api/shares";

function permissionLabel(permission) {
    return permission === "editor" ? "편집 가능" : "조회 가능";
}

export default function ShareProjectModal({
    project,
    onClose,
    onShared,
}) {
    const [email, setEmail] = useState("");
    const [permission, setPermission] = useState("viewer");
    const [shares, setShares] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchShares() {
        try {
            setIsLoading(true);
            const data = await getProjectShares(project.id);
            setShares(Array.isArray(data) ? data : []);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchShares();
    }, [project.id]);

    async function handleShare() {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            alert("이메일을 입력해주세요.");
            return;
        }

        try {
            await shareProject(project.id, {
                email: trimmedEmail,
                permission,
            });

            setEmail("");
            setPermission("viewer");
            await fetchShares();
            onShared();
        } catch (error) {
            alert(error.message);
        }
    }

    async function handleUnshare(shareId) {
        const confirmed = window.confirm("이 사용자의 공유를 해제할까요?");
        if (!confirmed) return;

        try {
            await unshareProject(shareId);
            await fetchShares();
            onShared();
        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal-header">
                    <h2 className="share-modal-title">프로젝트 공유</h2>
                    <button type="button" className="share-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <p className="share-modal-subtitle">
                    <strong>{project.title}</strong> 프로젝트를 다른 사용자와 공유할 수 있습니다.
                </p>

                <div className="share-form-row">
                    <input
                        type="email"
                        className="share-email-input"
                        placeholder="공유할 사용자 이메일을 입력하세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <select
                        className="share-permission-select"
                        value={permission}
                        onChange={(e) => setPermission(e.target.value)}
                    >
                        <option value="viewer">조회 가능</option>
                        <option value="editor">편집 가능</option>
                    </select>

                    <button type="button" className="share-submit-btn" onClick={handleShare}>
                        공유하기
                    </button>
                </div>

                <div className="share-list-section">
                    <div className="share-list-title">현재 공유 중인 사용자</div>

                    {isLoading ? (
                        <div className="share-empty-text">불러오는 중...</div>
                    ) : shares.length === 0 ? (
                        <div className="share-empty-text">아직 공유된 사용자가 없습니다.</div>
                    ) : (
                        <div className="share-list">
                            {shares.map((share) => (
                                <div key={share.id} className="share-list-item">
                                    <div className="share-user-info">
                                        <div className="share-user-name">
                                            {share.sharedWith?.name || "사용자"}
                                        </div>
                                        <div className="share-user-email">
                                            {share.sharedWith?.email || "-"}
                                        </div>
                                    </div>

                                    <div className="share-user-actions">
                                        <span className="share-permission-badge">
                                            {permissionLabel(share.permission)}
                                        </span>

                                        <button
                                            type="button"
                                            className="share-remove-btn"
                                            onClick={() => handleUnshare(share.id)}
                                        >
                                            해제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
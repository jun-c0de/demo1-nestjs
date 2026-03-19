export default function CreateDesignModal({
    value,
    onChange,
    onClose,
    onSubmit,
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="project-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="project-modal-title">새 디자인</h2>

                <input
                    type="text"
                    className="project-modal-input"
                    placeholder="디자인 이름을 입력하세요"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSubmit();
                        }
                    }}
                    autoFocus
                />

                <div className="project-modal-actions">
                    <button
                        type="button"
                        className="project-modal-cancel-btn"
                        onClick={onClose}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        className="project-modal-create-btn"
                        onClick={onSubmit}
                    >
                        생성
                    </button>
                </div>
            </div>
        </div>
    );
}
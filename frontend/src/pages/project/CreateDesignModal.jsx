export default function CreateDesignModal({
    value,
    onChange,
    onClose,
    onSubmit,
}) {
    function handleSubmit(event) {
        event.preventDefault();
        onSubmit();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>새 디자인</h2>
                    </div>

                    <div className="modal-body">
                        <input
                            type="text"
                            className="modal-input"
                            placeholder="디자인 이름을 입력하세요"
                            value={value}
                            onChange={(event) => onChange(event.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="button button-ghost" onClick={onClose}>
                            취소
                        </button>
                        <button type="submit" className="button button-primary">
                            생성
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
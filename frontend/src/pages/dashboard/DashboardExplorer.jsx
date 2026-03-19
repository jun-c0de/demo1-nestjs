import React from 'react';

/**
 * @param {number} totalCount - 전체 프로젝트 개수
 * @param {number} selectedCount - 현재 체크박스로 선택된 항목 개수
 */
export default function DashboardExplorer({ totalCount = 0, selectedCount = 0 }) {
    return (
        <footer className="dashboard-footer">
            <div className="footer-left-info">
                <span className="footer-item">
                    {totalCount}개 항목
                </span>

                {/* 선택된 항목이 있을 때만 구분선과 함께 표시 */}
                {selectedCount > 0 && (
                    <>
                        <div className="footer-divider" />
                        <span className="footer-item">
                            {selectedCount}개 선택됨
                        </span>
                    </>
                )}
            </div>
        </footer>
    );
}
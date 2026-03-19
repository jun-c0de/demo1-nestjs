import { useEffect } from "react";
import { useSearchParams } from "react-router";

export default function OAuthSuccessPage() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const error = searchParams.get("error");

        // 부모 창(AuthPage)이 있는지 확인
        if (!window.opener) {
            console.error("부모 창을 찾을 수 없습니다.");
            return;
        }

        if (error) {
            // 부모 창에 에러 알림
            window.opener.postMessage(
                { type: "GOOGLE_AUTH_ERROR", message: error },
                window.location.origin
            );
            window.close();
            return;
        }

        if (accessToken) {
            // 부모 창에 성공 알림 및 토큰 전달
            window.opener.postMessage(
                { type: "GOOGLE_AUTH_SUCCESS", accessToken },
                window.location.origin
            );
            // 메시지 보낸 후 팝업 닫기
            window.close();
        }
    }, [searchParams]);

    return (
        <div className="center-message-screen">
            <div className="center-message-box">
                <p>인증 완료! 잠시 후 창이 닫힙니다...</p>
            </div>
        </div>
    );
}
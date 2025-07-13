<?php
/**
 * 一時ユーザー作成API
 * POST /api/v1/user/temporary
 */

// エラー表示を制御
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../../includes/TemporaryUserManager.php';

// OPTIONS リクエスト（CORS preflight）への対応
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    http_response_code(200);
    exit;
}

try {
    // HTTPメソッドを検証
    ApiHelper::validateMethod(['POST']);
    
    // リクエストボディを取得
    $input = ApiHelper::getJsonInput();
    
    // 表示名のバリデーション
    $displayName = null;
    if (isset($input['display_name'])) {
        $displayName = trim($input['display_name']);
        if (mb_strlen($displayName) > 100) {
            ApiHelper::errorResponse(
                'VALIDATION_ERROR',
                '表示名は100文字以内で入力してください',
                ['display_name' => ['表示名は100文字以内で入力してください']],
                422
            );
        }
        if (empty($displayName)) {
            $displayName = null;
        }
    }
    
    // 一時ユーザーを作成
    $userManager = new TemporaryUserManager();
    $user = $userManager->createTemporaryUser($displayName);
    
    // 成功レスポンス
    ApiHelper::successResponse($user, 201);
    
} catch (Exception $e) {
    // エラーログに記録
    error_log("Temporary user creation API error: " . $e->getMessage());
    
    // エラーレスポンス
    ApiHelper::errorResponse(
        'INTERNAL_ERROR',
        'システムエラーが発生しました。しばらく時間をおいてから再度お試しください。',
        null,
        500
    );
}

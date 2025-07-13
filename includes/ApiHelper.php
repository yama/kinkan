<?php
/**
 * API共通ユーティリティクラス
 */

class ApiHelper {
    
    /**
     * JSON レスポンスを出力して終了
     */
    public static function jsonResponse($data, $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    /**
     * 成功レスポンス
     */
    public static function successResponse($data, $statusCode = 200): void {
        self::jsonResponse([
            'success' => true,
            'data' => $data
        ], $statusCode);
    }
    
    /**
     * エラーレスポンス
     */
    public static function errorResponse($code, $message, $details = null, $statusCode = 400): void {
        $response = [
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message
            ]
        ];
        
        if ($details !== null) {
            $response['error']['details'] = $details;
        }
        
        self::jsonResponse($response, $statusCode);
    }
    
    /**
     * リクエストボディのJSONを取得
     */
    public static function getJsonInput(): array {
        $input = file_get_contents('php://input');
        if (empty($input)) {
            return [];
        }
        
        $data = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(
                'INVALID_JSON',
                'リクエストボディのJSON形式が不正です',
                ['json_error' => json_last_error_msg()],
                400
            );
        }
        
        return $data ?? [];
    }
    
    /**
     * HTTPメソッドを検証
     */
    public static function validateMethod($allowedMethods): void {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if (!in_array($method, $allowedMethods)) {
            self::errorResponse(
                'METHOD_NOT_ALLOWED',
                '許可されていないHTTPメソッドです',
                ['allowed_methods' => $allowedMethods],
                405
            );
        }
    }
    
    /**
     * 一意識別子を生成
     */
    public static function generateIdentifier($prefix = 'tmp_user'): string {
        return $prefix . '_' . bin2hex(random_bytes(16));
    }
    
    /**
     * 文字列をサニタイズ
     */
    public static function sanitizeString($input, $maxLength = null): string {
        $sanitized = trim(strip_tags($input));
        if ($maxLength && mb_strlen($sanitized) > $maxLength) {
            $sanitized = mb_substr($sanitized, 0, $maxLength);
        }
        return $sanitized;
    }
    
    /**
     * 日時形式を検証
     */
    public static function validateDateTime($dateTime): bool {
        $format = 'Y-m-d\TH:i:s';
        $d = DateTime::createFromFormat($format, $dateTime);
        return $d && $d->format($format) === $dateTime;
    }
}

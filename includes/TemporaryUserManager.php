<?php
/**
 * 一時ユーザー管理クラス
 */

require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/ApiHelper.php';

class TemporaryUserManager {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * 一時ユーザーを作成
     */
    public function createTemporaryUser($displayName = null): array {
        try {
            $this->db->beginTransaction();
            
            // 表示名のサニタイズ
            $sanitizedDisplayName = $displayName ? 
                ApiHelper::sanitizeString($displayName, 100) : 
                'ゲストユーザー';
            
            // 一意識別子の生成
            $identifier = ApiHelper::generateIdentifier('tmp_user');
            
            // usersテーブルに一時ユーザーを登録
            $userSql = "INSERT INTO users (display_name, is_temporary, created_at, updated_at) VALUES (?, TRUE, NOW(), NOW())";
            $userStmt = $this->db->prepare($userSql);
            $userStmt->execute([$sanitizedDisplayName]);
            
            $userId = $this->db->lastInsertId();
            
            // temporary_usersテーブルにクッキー識別子を登録
            $tempSql = "INSERT INTO temporary_users (user_id, identifier, created_at, updated_at) VALUES (?, ?, NOW(), NOW())";
            $tempStmt = $this->db->prepare($tempSql);
            $tempStmt->execute([$userId, $identifier]);
            
            $this->db->commit();
            
            // クッキーを設定
            $this->setUserCookie($identifier);
            
            return [
                'user_id' => (int)$userId,
                'identifier' => $identifier,
                'display_name' => $sanitizedDisplayName,
                'is_temporary' => true
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Temporary user creation failed: " . $e->getMessage());
            throw new Exception("一時ユーザーの作成に失敗しました");
        }
    }
    
    /**
     * 識別子からユーザー情報を取得
     */
    public function getUserByIdentifier($identifier): ?array {
        try {
            $sql = "
                SELECT u.id, u.display_name, u.is_temporary, tu.identifier
                FROM users u
                INNER JOIN temporary_users tu ON u.id = tu.user_id
                WHERE tu.identifier = ? AND u.is_temporary = TRUE
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$identifier]);
            
            $user = $stmt->fetch();
            if (!$user) {
                return null;
            }
            
            return [
                'user_id' => (int)$user['id'],
                'identifier' => $user['identifier'],
                'display_name' => $user['display_name'],
                'is_temporary' => (bool)$user['is_temporary']
            ];
            
        } catch (Exception $e) {
            error_log("Get user by identifier failed: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * 現在のリクエストからユーザーを取得
     */
    public function getCurrentUser(): ?array {
        $identifier = $_COOKIE['temp_user_id'] ?? null;
        if (!$identifier) {
            return null;
        }
        
        return $this->getUserByIdentifier($identifier);
    }
    
    /**
     * ユーザークッキーを設定
     */
    private function setUserCookie($identifier): void {
        $cookieOptions = [
            'expires' => time() + (30 * 24 * 60 * 60), // 30日
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Strict'
        ];
        
        setcookie('temp_user_id', $identifier, $cookieOptions);
    }
    
    /**
     * 識別子の形式を検証
     */
    public function validateIdentifier($identifier): bool {
        return preg_match('/^tmp_user_[a-f0-9]{32}$/', $identifier);
    }
}

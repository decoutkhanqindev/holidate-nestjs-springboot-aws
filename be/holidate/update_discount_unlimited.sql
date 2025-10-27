-- Cập nhật discount FIRSTBOOK10 thành vô hạn lần sử dụng
UPDATE discounts 
SET usage_limit = 999999, 
    updated_at = NOW()
WHERE code = 'FIRSTBOOK10';

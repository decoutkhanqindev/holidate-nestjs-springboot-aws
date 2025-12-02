# 🔀 Hướng dẫn Merge code từ nhánh develop vào feature/fe

## Các bước thực hiện

### Bước 1: Kiểm tra trạng thái hiện tại

```bash
cd fe
git status
git branch --show-current
```

### Bước 2: Commit các thay đổi hiện tại (nếu có)

Nếu có thay đổi chưa commit:

```bash
git add .
git commit -m "chore: update API config and remove console logs"
```

Hoặc nếu muốn tạm thời lưu lại:

```bash
git stash
```

### Bước 3: Chuyển sang nhánh feature/fe

```bash
git checkout feature/fe
```

Nếu nhánh chưa tồn tại, tạo mới:

```bash
git checkout -b feature/fe
```

### Bước 4: Fetch code mới nhất từ remote

```bash
git fetch origin
```

### Bước 5: Merge code từ nhánh develop

```bash
git merge origin/develop
```

Hoặc nếu develop là local branch:

```bash
git merge develop
```

### Bước 6: Xử lý conflicts (nếu có)

Nếu có conflicts, Git sẽ báo. Mở file có conflict và sửa:

```bash
# Xem file có conflict
git status

# Mở file và sửa conflicts
# Sau đó:
git add <file-đã-sửa>
git commit
```

### Bước 7: Push code lên remote (nếu cần)

```bash
git push origin feature/fe
```

## ⚠️ Lưu ý

1. **Backup trước**: Đảm bảo đã commit hoặc stash tất cả thay đổi trước khi merge
2. **Conflict resolution**: Nếu có conflict, cần resolve thủ công
3. **Test sau merge**: Sau khi merge, nên test lại ứng dụng

## 🔄 Cách nhanh (nếu đang ở nhánh feature/fe)

```bash
cd fe
git fetch origin
git merge origin/develop
```

## 📋 Checklist

- [ ] Đã commit/stash các thay đổi hiện tại
- [ ] Đã checkout sang nhánh feature/fe
- [ ] Đã fetch code mới nhất
- [ ] Đã merge từ develop
- [ ] Đã resolve conflicts (nếu có)
- [ ] Đã test lại ứng dụng
- [ ] Đã push lên remote (nếu cần)

## 🆘 Nếu gặp lỗi

### Lỗi: "Your local changes would be overwritten"
```bash
git stash
git merge origin/develop
git stash pop  # Restore các thay đổi đã stash
```

### Lỗi: "Merge conflict"
```bash
# Xem file có conflict
git status

# Sửa conflicts trong file, sau đó:
git add .
git commit -m "resolve merge conflicts"
```

### Hủy merge đang dở
```bash
git merge --abort
```


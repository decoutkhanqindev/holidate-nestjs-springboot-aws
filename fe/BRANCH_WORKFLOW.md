# 🌿 Hướng dẫn: Bạn phải đứng ở nhánh nào?

## 📌 Câu trả lời ngắn gọn

**Bạn phải đứng ở nhánh `feature/fe`** trước khi merge code từ `develop`.

## 🔄 Workflow đúng

```
develop (nhánh nguồn - chứa code cần merge)
    ↓
    ↓ merge vào
    ↓
feature/fe (nhánh đích - nhánh bạn đang đứng)
```

## ✅ Các bước thực hiện

### Bước 1: Kiểm tra nhánh hiện tại

```powershell
cd fe
git branch --show-current
```

### Bước 2: Chuyển sang nhánh feature/fe

**Nếu đã có nhánh feature/fe:**
```powershell
git checkout feature/fe
```

**Nếu chưa có nhánh feature/fe (tạo mới):**
```powershell
git checkout -b feature/fe
```

### Bước 3: Merge từ develop

```powershell
git fetch origin
git merge origin/develop
```

## 🎯 Quy tắc quan trọng

**Quy tắc:** Bạn đứng ở nhánh **ĐÍCH** (nhánh muốn nhận code), sau đó merge từ nhánh **NGUỒN**.

- ✅ **Đứng ở:** `feature/fe` (nhánh đích)
- ✅ **Merge từ:** `develop` (nhánh nguồn)

## 📋 Ví dụ minh họa

### ✅ ĐÚNG:

```powershell
# Bước 1: Đứng ở nhánh feature/fe
git checkout feature/fe

# Bước 2: Merge code từ develop vào
git merge origin/develop
```

Kết quả: Code từ `develop` sẽ được merge vào `feature/fe`

### ❌ SAI:

```powershell
# Đứng ở nhánh develop
git checkout develop

# Merge feature/fe vào develop (SAI!)
git merge origin/feature/fe
```

Kết quả: Code từ `feature/fe` sẽ vào `develop` (ngược lại mục đích!)

## 🔍 Tóm tắt

| Nhánh bạn đứng | Nhánh merge vào | Kết quả |
|----------------|-----------------|---------|
| `feature/fe` | `develop` | ✅ ĐÚNG - Code từ develop vào feature/fe |
| `develop` | `feature/fe` | ❌ SAI - Code từ feature/fe vào develop |

## 💡 Lưu ý

1. **Luôn đứng ở nhánh đích** (nhánh muốn nhận code)
2. **Merge từ nhánh nguồn** (nhánh chứa code cần lấy)
3. **Commit/stash** các thay đổi trước khi merge

## 🚀 Cách nhanh

```powershell
cd fe
git checkout feature/fe          # Đứng ở nhánh đích
git fetch origin                 # Lấy code mới nhất
git merge origin/develop         # Merge từ nhánh nguồn
```


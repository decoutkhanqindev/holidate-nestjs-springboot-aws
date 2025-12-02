# Script merge code từ nhánh develop vào feature/fe
# Chạy script này trong thư mục fe

Write-Host "🔀 Bắt đầu merge code từ develop vào feature/fe..." -ForegroundColor Cyan

# Bước 1: Kiểm tra trạng thái
Write-Host "`n📋 Bước 1: Kiểm tra trạng thái git..." -ForegroundColor Yellow
$status = git status
Write-Host $status

$hasChanges = git diff --quiet
if (-not $hasChanges) {
    $unstagedChanges = git diff --name-only
    if ($unstagedChanges) {
        Write-Host "`n⚠️  Có thay đổi chưa được staged!" -ForegroundColor Yellow
        $response = Read-Host "Bạn có muốn commit các thay đổi này? (y/n)"
        if ($response -eq "y") {
            git add .
            $commitMsg = Read-Host "Nhập commit message (hoặc Enter để dùng mặc định)"
            if ([string]::IsNullOrWhiteSpace($commitMsg)) {
                $commitMsg = "chore: update before merge from develop"
            }
            git commit -m $commitMsg
        } else {
            Write-Host "💾 Stashing changes..." -ForegroundColor Yellow
            git stash
            $shouldStash = $true
        }
    }
}

$stagedChanges = git diff --cached --name-only
if ($stagedChanges) {
    Write-Host "`n📦 Có file đã được staged nhưng chưa commit!" -ForegroundColor Yellow
    $response = Read-Host "Bạn có muốn commit? (y/n)"
    if ($response -eq "y") {
        $commitMsg = Read-Host "Nhập commit message"
        git commit -m $commitMsg
    }
}

# Bước 2: Kiểm tra nhánh hiện tại
Write-Host "`n📋 Bước 2: Kiểm tra nhánh hiện tại..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Nhánh hiện tại: $currentBranch" -ForegroundColor Green

# Bước 3: Fetch code mới nhất
Write-Host "`n📋 Bước 3: Fetch code mới nhất từ remote..." -ForegroundColor Yellow
git fetch origin
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lỗi khi fetch!" -ForegroundColor Red
    exit 1
}

# Bước 4: Kiểm tra và checkout nhánh feature/fe
Write-Host "`n📋 Bước 4: Chuyển sang nhánh feature/fe..." -ForegroundColor Yellow
$branches = git branch -a | Select-String "feature/fe"
if (-not $branches) {
    Write-Host "⚠️  Nhánh feature/fe chưa tồn tại. Tạo nhánh mới..." -ForegroundColor Yellow
    git checkout -b feature/fe
} else {
    if ($currentBranch -ne "feature/fe") {
        git checkout feature/fe
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Không thể checkout nhánh feature/fe!" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Đã chuyển sang nhánh feature/fe" -ForegroundColor Green
    } else {
        Write-Host "✅ Đã ở nhánh feature/fe" -ForegroundColor Green
    }
}

# Bước 5: Merge từ develop
Write-Host "`n📋 Bước 5: Merge code từ nhánh develop..." -ForegroundColor Yellow
Write-Host "Đang merge origin/develop vào feature/fe..." -ForegroundColor Cyan

git merge origin/develop

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Merge thành công!" -ForegroundColor Green
    
    # Restore stash nếu có
    if ($shouldStash) {
        Write-Host "`n📦 Restore các thay đổi đã stash..." -ForegroundColor Yellow
        git stash pop
    }
    
    Write-Host "`n✨ Hoàn tất! Code đã được merge từ develop vào feature/fe" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Có conflicts cần xử lý!" -ForegroundColor Yellow
    Write-Host "Vui lòng mở các file có conflict và sửa, sau đó:" -ForegroundColor Yellow
    Write-Host "  git add <file-đã-sửa>" -ForegroundColor Cyan
    Write-Host "  git commit" -ForegroundColor Cyan
    
    # Restore stash nếu có
    if ($shouldStash) {
        Write-Host "`n💾 Các thay đổi đã được stash. Sau khi resolve conflict, chạy:" -ForegroundColor Yellow
        Write-Host "  git stash pop" -ForegroundColor Cyan
    }
}

Write-Host "`n📋 Trạng thái hiện tại:" -ForegroundColor Yellow
git status


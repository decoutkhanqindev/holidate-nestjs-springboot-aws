# Null Pointer Exception Fix

## Problem

The application was throwing `NullPointerException` when trying to upload photos:

```
java.lang.NullPointerException: Cannot invoke "org.springframework.web.multipart.MultipartFile.getOriginalFilename()" because "file" is null
	at com.webapp.holidate.service.storage.FileService.upload(FileService.java:36)
	at com.webapp.holidate.service.accommodation.HotelService.updatePhotos(HotelService.java:298)
```

## Root Cause

The code was not checking for null or empty files before attempting to process them. This could happen when:

1. The `files` list in `PhotoCreationRequest` is null
2. Individual `MultipartFile` objects in the list are null
3. Individual `MultipartFile` objects are empty

## Solution Applied

### 1. Added null checks in HotelService.create() method

```java
List<MultipartFile> files = photoRequest.getFiles();
if (files != null && !files.isEmpty()) {
  for (MultipartFile file : files) {
    if (file != null && !file.isEmpty()) {
      // Process file safely
    }
  }
}
```

### 2. Added null checks in HotelService.updatePhotos() method

```java
List<MultipartFile> files = photoToAdd.getFiles();
if (files != null && !files.isEmpty()) {
  for (MultipartFile file : files) {
    if (file != null && !file.isEmpty()) {
      // Process file safely
    }
  }
}
```

### 3. Added defensive programming in FileService.upload() method

```java
public void upload(MultipartFile file) throws IOException {
  if (file == null || file.isEmpty()) {
    throw new IllegalArgumentException("File cannot be null or empty");
  }

  String fileName = file.getOriginalFilename();
  if (fileName == null) {
    throw new IllegalArgumentException("File name cannot be null");
  }

  // Continue with file processing
}
```

## Benefits

1. **Prevents NullPointerException**: Application will no longer crash due to null files
2. **Better Error Handling**: Clear error messages when invalid files are provided
3. **Graceful Degradation**: Empty or null file lists are simply skipped instead of causing errors
4. **Defensive Programming**: Multiple layers of validation ensure robustness

## Testing Recommendations

To verify the fix works correctly, test these scenarios:

1. Update hotel with valid photo files - should work normally
2. Update hotel with empty files list - should skip photo processing
3. Update hotel with null files list - should skip photo processing
4. Update hotel with list containing null files - should skip null files, process valid ones
5. Update hotel with empty MultipartFile objects - should skip empty files

## Impact

This fix ensures the photo upload functionality is robust and handles edge cases gracefully without breaking the entire hotel update operation.

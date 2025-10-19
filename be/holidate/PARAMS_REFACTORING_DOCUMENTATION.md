# API Parameters Refactoring Documentation

## Overview

This document describes the refactoring of API parameter constants to improve reusability and maintainability across the Holidate application.

## Problem Statement

Previously, parameter constants were scattered across multiple classes with significant duplication:

- `PaginationParams` contained both pagination and sorting constants
- Sorting constants were duplicated in `HotelParams`, `RoomParams`, and `RoomInventoryParams`
- No clear separation of concerns between pagination and sorting functionality

## Solution

### New Structure

#### 1. `PaginationParams` - Pure Pagination

```java
public class PaginationParams {
  // Pagination parameter names
  public static final String PAGE = "page";
  public static final String SIZE = "size";

  // Default pagination values
  public static final String DEFAULT_PAGE = "0";
  public static final String DEFAULT_SIZE = "10";
}
```

#### 2. `SortingParams` - Unified Sorting Constants

```java
public class SortingParams {
  // Sorting parameter names
  public static final String SORT_BY = "sort-by";
  public static final String SORT_DIR = "sort-dir";

  // Sorting direction values
  public static final String SORT_DIR_ASC = "asc";
  public static final String SORT_DIR_DESC = "desc";

  // Common sorting field values - used across multiple entities
  public static final String SORT_BY_PRICE = "price";
  public static final String SORT_BY_NAME = "name";
  public static final String SORT_BY_CREATED_AT = "created-at";
  public static final String SORT_BY_DATE = "date";

  // Hotel-specific sorting fields
  public static final String SORT_BY_STAR_RATING = "star-rating";

  // Room inventory-specific sorting fields
  public static final String SORT_BY_AVAILABLE_ROOMS = "available-rooms";
  public static final String SORT_BY_STATUS = "status";
}
```

#### 3. Entity-Specific Param Classes - Clean Focused Constants

- `HotelParams`: Only hotel-specific parameters (hotel-id, amenity-ids, star-rating)
- `RoomParams`: Only room-specific parameters (room-id, dates, requirements, price ranges)
- `CommonParams`: Shared parameters (name, status)
- `LocationParams`: Location-related parameters

## Migration Changes

### Controllers Updated

1. **HotelController**: Updated sorting parameter imports and usage
2. **RoomController**: Updated sorting parameter imports and usage
3. **RoomInventoryController**: Updated sorting parameter imports and usage

### Services Updated

1. **HotelService**: Replaced `PaginationParams.SORT_DIR_*` with `SortingParams.SORT_DIR_*` and `HotelParams.SORT_BY_*` with `SortingParams.SORT_BY_*`
2. **RoomService**: Replaced `PaginationParams.SORT_DIR_*` with `SortingParams.SORT_DIR_*` and `RoomParams.SORT_BY_*` with `SortingParams.SORT_BY_*`
3. **RoomInventoryService**: Replaced `PaginationParams.SORT_DIR_*` with `SortingParams.SORT_DIR_*` and `RoomInventoryParams.SORT_BY_*` with `SortingParams.SORT_BY_*`

## Benefits Achieved

### 1. Single Source of Truth

- All sorting constants centralized in `SortingParams`
- No more duplication across entity-specific param classes
- Consistent naming and values across the application

### 2. Clear Separation of Concerns

- `PaginationParams`: Pure pagination functionality (page, size)
- `SortingParams`: Pure sorting functionality (sort-by, sort-dir, field values)
- Entity-specific params: Only entity-specific parameters

### 3. Enhanced Reusability

- Common sorting fields (price, name, created-at) available for all entities
- Easy to add new sorting fields that can be shared
- Reduced code duplication in controller and service layers

### 4. Improved Maintainability

- Changes to sorting constants only need to be made in one place
- Easier to add new sorting functionality
- Clear import structure showing dependencies

### 5. Better API Consistency

- Consistent parameter names across all endpoints
- Uniform sorting behavior across different entities
- Predictable API interface for frontend consumers

## Usage Examples

### Before Refactoring

```java
// In HotelController
@RequestParam(name = PaginationParams.SORT_BY, required = false) String sortBy,
@RequestParam(name = PaginationParams.SORT_DIR, defaultValue = PaginationParams.SORT_DIR_ASC) String sortDir

// In HotelService
if (HotelParams.SORT_BY_PRICE.equals(sortBy)) {
    // sorting logic
}
```

### After Refactoring

```java
// In HotelController
@RequestParam(name = SortingParams.SORT_BY, required = false) String sortBy,
@RequestParam(name = SortingParams.SORT_DIR, defaultValue = SortingParams.SORT_DIR_ASC) String sortDir

// In HotelService
if (SortingParams.SORT_BY_PRICE.equals(sortBy)) {
    // sorting logic
}
```

## Backward Compatibility

- All API endpoints maintain the same parameter names and values
- No breaking changes for frontend consumers
- Internal refactoring only affects constant organization

## Future Enhancements

1. **Validation Utilities**: Create utility classes for parameter validation using the centralized constants
2. **Annotation-Based Sorting**: Consider creating custom annotations that use these constants
3. **OpenAPI Documentation**: Leverage constants for consistent API documentation generation
4. **Dynamic Sorting**: Build dynamic sorting capabilities using the centralized field constants

## Testing

- ✅ All controllers compile successfully
- ✅ All services compile successfully
- ✅ Gradle build passes without errors
- ✅ No API contract changes
- ✅ Existing functionality preserved

## Conclusion

This refactoring successfully centralizes parameter constants while maintaining backward compatibility and improving code organization. The new structure provides a solid foundation for future enhancements and makes the codebase more maintainable and consistent.

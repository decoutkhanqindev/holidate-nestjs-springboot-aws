# API Documentation

Base URL: `http://localhost:8080`

## Table of Contents

1. [Authentication](#authentication)
2. [Email/OTP](#emailotp)
3. [Users](#users)
4. [Roles](#roles)
5. [Bookings](#bookings)
6. [Reviews](#reviews)
7. [Payment](#payment)
8. [Accommodation - Hotels](#accommodation---hotels)
9. [Accommodation - Rooms](#accommodation---rooms)
10. [Accommodation - Room Inventories](#accommodation---room-inventories)
11. [Amenities](#amenities)
12. [Amenity Categories](#amenity-categories)
13. [Photo Categories](#photo-categories)
14. [Locations](#locations)
15. [Discounts](#discounts)
16. [Policies](#policies)
17. [Documents](#documents)
18. [Special Days](#special-days)
19. [Partner Reports](#partner-reports)
20. [Admin Reports](#admin-reports)
21. [Partner Dashboard](#partner-dashboard)
22. [Admin Dashboard](#admin-dashboard)
23. [Status Types Reference](#status-types-reference)

---

## Authentication

### 1. Register

**POST** `/auth/register`

- **Role Required**: Public
- **Request Body**:

```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 characters)",
  "fullName": "string (required, 3-100 characters)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "phoneNumber": "string",
    "address": "string",
    "country": { "id": "string", "name": "string" },
    "province": { "id": "string", "name": "string" },
    "city": { "id": "string", "name": "string" },
    "district": { "id": "string", "name": "string" },
    "ward": { "id": "string", "name": "string" },
    "street": { "id": "string", "name": "string" },
    "gender": "string",
    "dateOfBirth": "datetime",
    "avatarUrl": "string",
    "role": { "id": "string", "name": "string", "description": "string" },
    "authInfo": { "provider": "string", "verified": boolean },
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Login

**POST** `/auth/login`

- **Role Required**: Public
- **Request Body**:

```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 characters)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "role": { "id": "string", "name": "string", "description": "string" },
    "accessToken": "string",
    "expiresAt": "datetime",
    "refreshToken": "string"
  }
}
```

### 3. Verify Token

**POST** `/auth/verify-token`

- **Role Required**: Public
- **Request Body**:

```json
{
  "token": "string (required)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "valid": boolean,
    "expired": boolean
  }
}
```

### 4. Refresh Token

**POST** `/auth/refresh-token`

- **Role Required**: Public
- **Request Body**:

```json
{
  "token": "string (required)"
}
```

- **Response**: Same as Login response

### 5. Logout

**POST** `/auth/logout`

- **Role Required**: Public
- **Request Body**:

```json
{
  "token": "string (required)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "success": boolean
  }
}
```

### 6. Get Me (Current User Info)

**GET** `/auth/me`

- **Role Required**: Authenticated
- **Response**: Same as Login response

---

## Email/OTP

### 1. Send Email Verification OTP

**POST** `/auth/email/send-email-verification-otp`

- **Role Required**: Public
- **Request Body**:

```json
{
  "email": "string (required, valid email)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "success": boolean,
    "message": "string"
  }
}
```

### 2. Verify Email Verification OTP

**POST** `/auth/email/verify-email-verification-otp`

- **Role Required**: Public
- **Request Body**:

```json
{
  "email": "string (required, valid email)",
  "otp": "string (required, 6 characters)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "verified": boolean
  }
}
```

### 3. Send Password Reset OTP

**POST** `/auth/email/send-password-reset-otp`

- **Role Required**: Public
- **Request Body**:

```json
{
  "email": "string (required, valid email)"
}
```

- **Response**: Same as Send Email Verification OTP

### 4. Verify Password Reset OTP

**POST** `/auth/email/verify-password-reset-otp`

- **Role Required**: Public
- **Request Body**:

```json
{
  "email": "string (required, valid email)",
  "otp": "string (required, 6 characters)",
  "newPassword": "string (required, min 8 characters)"
}
```

- **Response**: Same as Verify Email Verification OTP

---

## Users

### 1. Create User

**POST** `/users`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 characters)",
  "fullName": "string (required, 3-100 characters)",
  "phoneNumber": "string (valid phone pattern)",
  "address": "string",
  "countryId": "string",
  "provinceId": "string",
  "cityId": "string",
  "districtId": "string",
  "wardId": "string",
  "streetId": "string",
  "gender": "string (MALE/FEMALE/OTHER)",
  "dateOfBirth": "datetime",
  "avatarUrl": "string",
  "roleId": "string (required)",
  "authProvider": "string (required, LOCAL/GOOGLE)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "phoneNumber": "string",
    "address": "string",
    "country": { "id": "string", "name": "string" },
    "province": { "id": "string", "name": "string" },
    "city": { "id": "string", "name": "string" },
    "district": { "id": "string", "name": "string" },
    "ward": { "id": "string", "name": "string" },
    "street": { "id": "string", "name": "string" },
    "gender": "string",
    "dateOfBirth": "datetime",
    "avatarUrl": "string",
    "role": { "id": "string", "name": "string", "description": "string" },
    "authInfo": { "provider": "string", "verified": boolean },
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Users

**GET** `/users`

- **Role Required**: ADMIN
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "email": "string",
      "fullName": "string"
      // ... (same structure as Create User response)
    }
  ]
}
```

### 3. Get User By ID

**GET** `/users/{id}`

- **Role Required**: USER, PARTNER, ADMIN (USER and PARTNER can only access their own profile)
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create User response

### 4. Update User

**PUT** `/users/{id}`

- **Content-Type**: `multipart/form-data`
- **Role Required**: USER, PARTNER, ADMIN (USER and PARTNER can only update their own profile)
- **Path Parameters**:
  - `id`: string (UUID format)
- **Request Body** (form-data):
  - All fields from Create User (optional)
  - `avatar`: File (image file)
- **Response**: Same as Create User response

### 5. Delete User

**DELETE** `/users/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create User response

---

## Roles

### 1. Create Role

**POST** `/roles`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "description": "string (required)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Roles

**GET** `/roles`

- **Role Required**: ADMIN
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

### 3. Delete Role

**DELETE** `/roles/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Role response

---

## Bookings

### 1. Create Booking

**POST** `/bookings`

- **Role Required**: USER, PARTNER, ADMIN
- **Request Body**:

```json
{
  "userId": "string (required)",
  "roomId": "string (required)",
  "hotelId": "string (required)",
  "checkInDate": "date (required, ISO format: YYYY-MM-DD)",
  "checkOutDate": "date (required, ISO format: YYYY-MM-DD)",
  "numberOfRooms": "integer (required, positive)",
  "numberOfAdults": "integer (required, positive)",
  "numberOfChildren": "integer (required, min 0, default: 0)",
  "discountCode": "string (optional)",
  "contactFullName": "string (required)",
  "contactEmail": "string (valid email)",
  "contactPhone": "string (valid phone pattern)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "user": { "id": "string", "email": "string", "fullName": "string" },
    "room": { "id": "string", "name": "string", "hotelId": "string" },
    "hotel": { "id": "string", "name": "string" },
    "checkInDate": "date",
    "checkOutDate": "date",
    "numberOfNights": "integer",
    "numberOfRooms": "integer",
    "numberOfAdults": "integer",
    "numberOfChildren": "integer",
    "priceDetails": {
      "basePrice": "number",
      "discountAmount": "number",
      "totalPrice": "number",
      "fees": []
    },
    "contactFullName": "string",
    "contactEmail": "string",
    "contactPhone": "string",
    "status": "string (see [Booking Status Types](#booking-status-types))",
    "paymentUrl": "string",
    "createdAt": "datetime",
    "expiresAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get Booking Price Preview

**POST** `/bookings/price-preview`

- **Role Required**: USER, PARTNER, ADMIN
- **Request Body**:

```json
{
  "roomId": "string (required)",
  "startDate": "date (required, ISO format: YYYY-MM-DD)",
  "endDate": "date (required, ISO format: YYYY-MM-DD)",
  "numberOfRooms": "integer (required, positive)",
  "numberOfAdults": "integer (required, positive)",
  "numberOfChildren": "integer (required, min 0, default: 0)",
  "discountCode": "string (optional)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "basePrice": "number",
    "discountAmount": "number",
    "totalPrice": "number",
    "fees": [
      {
        "name": "string",
        "amount": "number"
      }
    ],
    "breakdown": {}
  }
}
```

### 3. Get All Bookings

**GET** `/bookings`

- **Role Required**: USER, PARTNER, ADMIN
- **Query Parameters**:
  - `userId`: string (optional)
  - `roomId`: string (optional)
  - `hotelId`: string (optional)
  - `status`: string (optional, see [Booking Status Types](#booking-status-types))
  - `checkInDate`: date (optional, ISO format)
  - `checkOutDate`: date (optional, ISO format)
  - `createdFrom`: datetime (optional, ISO format)
  - `createdTo`: datetime (optional, ISO format)
  - `minPrice`: number (optional)
  - `maxPrice`: number (optional)
  - `contactEmail`: string (optional)
  - `contactPhone`: string (optional)
  - `contactFullName`: string (optional)
  - `page`: integer (default: 0)
  - `size`: integer (default: 10)
  - `sortBy`: string (default: "createdAt")
  - `sortDir`: string (default: "DESC")
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string",
        // ... (same structure as Create Booking response)
      }
    ],
    "page": "integer",
    "size": "integer",
    "totalItems": "long",
    "totalPages": "integer",
    "first": boolean,
    "last": boolean,
    "hasNext": boolean,
    "hasPrevious": boolean
  }
}
```

### 4. Get Booking By ID

**GET** `/bookings/{id}`

- **Role Required**: USER, PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Booking response

### 5. Cancel Booking

**POST** `/bookings/{id}/cancel`

- **Role Required**: USER, PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Booking response

### 6. Reschedule Booking

**POST** `/bookings/{id}/reschedule`

- **Role Required**: USER, PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Request Body**:

```json
{
  "newCheckInDate": "date (required, ISO format: YYYY-MM-DD)",
  "newCheckOutDate": "date (required, ISO format: YYYY-MM-DD)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "booking": {
      // ... (same structure as Create Booking response with status field)
    },
    "oldCheckInDate": "date",
    "oldCheckOutDate": "date",
    "newCheckInDate": "date",
    "newCheckOutDate": "date",
    "status": "string (see [Booking Status Types](#booking-status-types))",
    "originalPrice": "number",
    "newPrice": "number",
    "priceDifference": "number",
    "rescheduleFee": "number"
  }
}
```

### 7. Check In

**POST** `/bookings/{id}/check-in`

- **Role Required**: USER, PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Booking response

### 8. Check Out

**POST** `/bookings/{id}/check-out`

- **Role Required**: USER, PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Booking response

### 9. Update Booking

**PUT** `/bookings/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Request Body**: Same as Create Booking (all fields optional)
- **Response**: Same as Create Booking response

### 10. Delete Booking

**DELETE** `/bookings/{id}`

- **Role Required**: PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Booking response

---

## Reviews

### 1. Create Review

**POST** `/reviews`

- **Content-Type**: `multipart/form-data`
- **Role Required**: USER, PARTNER, ADMIN
- **Request Body** (form-data):
  - `bookingId`: string (required)
  - `score`: integer (required, 1-10)
  - `comment`: string (optional)
  - `photos`: File[] (optional, image files)
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "booking": { "id": "string", "hotel": {}, "room": {} },
    "user": { "id": "string", "fullName": "string", "avatarUrl": "string" },
    "score": "integer",
    "comment": "string",
    "photos": [{ "id": "string", "url": "string", "category": "string" }],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Reviews

**GET** `/reviews`

- **Role Required**: Public
- **Query Parameters**:
  - `hotelId`: string (optional)
  - `userId`: string (optional)
  - `bookingId`: string (optional)
  - `minScore`: integer (optional)
  - `maxScore`: integer (optional)
  - `page`: integer (default: 0)
  - `size`: integer (default: 10)
  - `sortBy`: string (default: "createdAt")
  - `sortDir`: string (default: "DESC")
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string",
        "user": { "id": "string", "fullName": "string" },
        "score": "integer",
        "comment": "string",
        "createdAt": "datetime"
      }
    ],
    "page": "integer",
    "size": "integer",
    "totalItems": "long",
    "totalPages": "integer",
    "first": boolean,
    "last": boolean,
    "hasNext": boolean,
    "hasPrevious": boolean
  }
}
```

### 3. Get Review By ID

**GET** `/reviews/{id}`

- **Role Required**: Public
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Review response

### 4. Update Review

**PUT** `/reviews/{id}`

- **Content-Type**: `multipart/form-data`
- **Role Required**: USER, PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Request Body** (form-data):
  - `score`: integer (optional, 1-10)
  - `comment`: string (optional)
  - `photosToAdd`: File[] (optional, image files)
  - `photoIdsToDelete`: string[] (optional, array of photo IDs)
- **Response**: Same as Create Review response

### 5. Delete Review

**DELETE** `/reviews/{id}`

- **Role Required**: USER, PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Review response

---

## Payment

### 1. VNPay Callback

**GET** `/payment/callback`

- **Role Required**: Public
- **Query Parameters**: All VNPay callback parameters (handled automatically)
- **Response**: Redirects to frontend URL

---

## Accommodation - Hotels

### 1. Create Hotel

**POST** `/accommodation/hotels`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "description": "string (required)",
  "address": "string (required)",
  "countryId": "string (required)",
  "provinceId": "string (required)",
  "cityId": "string (required)",
  "districtId": "string (required)",
  "wardId": "string (required)",
  "streetId": "string (required)",
  "partnerId": "string (required)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "address": "string",
    "location": {
      "country": {},
      "province": {},
      "city": {},
      "district": {},
      "ward": {},
      "street": {}
    },
    "starRating": "integer",
    "status": "string (see [Accommodation Status Types](#accommodation-status-types))",
    "amenities": [],
    "photos": [],
    "partner": {},
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Hotels

**GET** `/accommodation/hotels`

- **Role Required**: Public
- **Query Parameters**:
  - `name`: string (optional)
  - `countryId`: string (optional)
  - `provinceId`: string (optional)
  - `cityId`: string (optional)
  - `districtId`: string (optional)
  - `wardId`: string (optional)
  - `streetId`: string (optional)
  - `starRating`: integer (optional)
  - `amenityIds`: string[] (optional, array of amenity IDs)
  - `status`: string (optional, see [Accommodation Status Types](#accommodation-status-types))
  - `partnerId`: string (optional, filter hotels by partner/owner ID)
  - `checkinDate`: date (optional, ISO format)
  - `checkoutDate`: date (optional, ISO format)
  - `requiredAdults`: integer (optional)
  - `requiredChildren`: integer (optional)
  - `requiredRooms`: integer (optional)
  - `minPrice`: number (optional)
  - `maxPrice`: number (optional)
  - `page`: integer (default: 0)
  - `size`: integer (default: 10)
  - `sortBy`: string (default: "createdAt")
  - `sortDir`: string (default: "ASC")
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "address": "string",
        "starRating": "integer",
        "status": "string (see [Accommodation Status Types](#accommodation-status-types))",
        "photos": [],
        "location": {}
      }
    ],
    "page": "integer",
    "size": "integer",
    "totalItems": "long",
    "totalPages": "integer",
    "first": boolean,
    "last": boolean,
    "hasNext": boolean,
    "hasPrevious": boolean
  }
}
```

### 3. Get Hotel By ID

**GET** `/accommodation/hotels/{id}`

- **Role Required**: Public
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Hotel response

### 4. Update Hotel

**PUT** `/accommodation/hotels/{id}`

- **Content-Type**: `multipart/form-data`
- **Role Required**: PARTNER, ADMIN (PARTNER can only update hotels they own)
- **Path Parameters**:
  - `id`: string (UUID format)
- **Request Body** (form-data): All fields from Create Hotel (optional) + files
- **Response**: Same as Create Hotel response

### 5. Delete Hotel

**DELETE** `/accommodation/hotels/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Hotel response

---

## Accommodation - Rooms

### 1. Create Room

**POST** `/accommodation/rooms`

- **Content-Type**: `multipart/form-data`
- **Role Required**: PARTNER, ADMIN
- **Request Body** (form-data):
  - `hotelId`: string (required)
  - `name`: string (required)
  - `view`: string (required)
  - `area`: number (required, positive)
  - `photos`: File[] (required, at least 1 image)
  - `maxAdults`: integer (required, positive)
  - `maxChildren`: integer (required, min 0)
  - `basePricePerNight`: number (required, positive)
  - `bedTypeId`: string (required)
  - `smokingAllowed`: boolean (optional)
  - `wifiAvailable`: boolean (optional)
  - `breakfastIncluded`: boolean (optional)
  - `quantity`: integer (required, positive)
  - `amenityIds`: string[] (required, array of amenity IDs)
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "hotelId": "string",
    "name": "string",
    "view": "string",
    "area": "number",
    "photos": [],
    "maxAdults": "integer",
    "maxChildren": "integer",
    "basePricePerNight": "number",
    "bedType": {},
    "smokingAllowed": boolean,
    "wifiAvailable": boolean,
    "breakfastIncluded": boolean,
    "quantity": "integer",
    "amenities": [],
    "status": "string (see [Accommodation Status Types](#accommodation-status-types))",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Rooms By Hotel

**GET** `/accommodation/rooms`

- **Role Required**: Public (GET without hotelId), PARTNER, ADMIN (GET with hotelId)
- **Query Parameters**:
  - `hotelId`: string (required for PARTNER/ADMIN, optional for public)
  - `status`: string (optional, see [Accommodation Status Types](#accommodation-status-types))
  - `page`: integer (default: 0)
  - `size`: integer (default: 10)
  - `sortBy`: string (optional)
  - `sortDir`: string (default: "ASC")
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string",
        "hotelId": "string",
        "name": "string",
        "view": "string",
        "area": "number",
        "basePricePerNight": "number",
        "photos": [],
        "status": "string (see [Accommodation Status Types](#accommodation-status-types))"
      }
    ],
    "page": "integer",
    "size": "integer",
    "totalItems": "long",
    "totalPages": "integer",
    "first": boolean,
    "last": boolean,
    "hasNext": boolean,
    "hasPrevious": boolean
  }
}
```

### 3. Get Room By ID

**GET** `/accommodation/rooms/{id}`

- **Role Required**: Public
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Room response

### 4. Update Room

**PUT** `/accommodation/rooms/{id}`

- **Content-Type**: `multipart/form-data`
- **Role Required**: PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Request Body** (form-data): All fields from Create Room (optional) + files
- **Response**: Same as Create Room response

### 5. Delete Room

**DELETE** `/accommodation/rooms/{id}`

- **Role Required**: PARTNER, ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Room response

---

## Accommodation - Room Inventories

### 1. Get Room Inventories

**GET** `/accommodation/rooms/inventories`

- **Role Required**: ADMIN, PARTNER
- **Query Parameters**:
  - `roomId`: string (required)
  - `startDate`: date (required, ISO format)
  - `endDate`: date (required, ISO format)
  - `status`: string (optional, see [Room Inventory Status Types](#room-inventory-status-types))
  - `page`: integer (default: 0)
  - `size`: integer (default: 10)
  - `sortBy`: string (optional)
  - `sortDir`: string (default: "ASC")
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string",
        "roomId": "string",
        "date": "date",
        "price": "number",
        "availableQuantity": "integer",
        "status": "string (see [Room Inventory Status Types](#room-inventory-status-types))"
      }
    ],
    "page": "integer",
    "size": "integer",
    "totalItems": "long",
    "totalPages": "integer",
    "first": boolean,
    "last": boolean,
    "hasNext": boolean,
    "hasPrevious": boolean
  }
}
```

### 2. Create Room Inventory

**POST** `/accommodation/rooms/inventories`

- **Role Required**: PARTNER, ADMIN
- **Request Body**:

```json
{
  "roomId": "string (required)",
  "days": "integer (required, positive)"
}
```

- **Response**: Same as Get Room Inventories (but wrapped in RoomWithInventoriesResponse)

**Note**: According to SecurityConfig, PUT and DELETE endpoints for room inventories are configured for ADMIN and
PARTNER roles, but controller endpoints may not be fully implemented yet. If they exist, they would be:

- **PUT** `/accommodation/rooms/inventories` - Update room inventory prices (requires RoomInventoryPriceUpdateRequest)
- **DELETE** `/accommodation/rooms/inventories/{id}` - Delete room inventory

---

## Amenities

### 1. Create Amenity

**POST** `/amenity/amenities`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "free": "boolean (required)",
  "categoryId": "string (required)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "name": "string",
    "free": boolean,
    "category": {
      "id": "string",
      "name": "string",
      "description": "string"
    },
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Amenities

**GET** `/amenity/amenities`

- **Role Required**: Public
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string",
      "free": boolean,
      "category": {}
    }
  ]
}
```

### 3. Get Amenities By Category

**GET** `/amenity/amenities/category/{categoryId}`

- **Role Required**: Public
- **Path Parameters**:
  - `categoryId`: string (UUID format)
- **Response**: Same as Get All Amenities

### 4. Delete Amenity

**DELETE** `/amenity/amenities/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Amenity response

---

## Amenity Categories

### 1. Create Amenity Category

**POST** `/amenity/categories`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Amenity Categories

**GET** `/amenity/categories`

- **Role Required**: Public
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string"
    }
  ]
}
```

### 3. Delete Amenity Category

**DELETE** `/amenity/categories/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Amenity Category response

---

## Photo Categories

### 1. Get All Photo Categories

**GET** `/image/photo-categories`

- **Role Required**: Public
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string"
    }
  ]
}
```

---

## Locations

### Countries

#### 1. Create Country

**POST** `/location/countries`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "code": "string (required)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "name": "string",
    "code": "string"
  }
}
```

#### 2. Get All Countries

**GET** `/location/countries`

- **Role Required**: Public
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string",
      "code": "string"
    }
  ]
}
```

#### 3. Delete Country

**DELETE** `/location/countries/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Country response

---

### Provinces

#### 1. Create Province

**POST** `/location/provinces`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "code": "string (required)",
  "countryId": "string (required)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "name": "string",
    "code": "string",
    "country": { "id": "string", "name": "string" }
  }
}
```

#### 2. Get All Provinces

**GET** `/location/provinces`

- **Role Required**: Public
- **Query Parameters**:
  - `name`: string (optional)
  - `countryId`: string (optional)
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string",
      "code": "string"
    }
  ]
}
```

#### 3. Delete Province

**DELETE** `/location/provinces/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Province response

---

### Cities

#### 1. Create City

**POST** `/location/cities`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "code": "string (required)",
  "provinceId": "string (required)"
}
```

- **Response**: Similar to Province response

#### 2. Get All Cities

**GET** `/location/cities`

- **Role Required**: Public
- **Query Parameters**:
  - `name`: string (optional)
  - `provinceId`: string (optional)
- **Response**: Array of location objects

#### 3. Delete City

**DELETE** `/location/cities/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create City response

---

### Districts

#### 1. Create District

**POST** `/location/districts`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "code": "string (required)",
  "cityId": "string (required)"
}
```

- **Response**: Similar structure to other locations

#### 2. Get All Districts

**GET** `/location/districts`

- **Role Required**: Public
- **Query Parameters**:
  - `name`: string (optional)
  - `cityId`: string (optional)
- **Response**: Array of location objects

#### 3. Delete District

**DELETE** `/location/districts/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create District response

---

### Wards

#### 1. Create Ward

**POST** `/location/wards`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "code": "string (required)",
  "districtId": "string (required)"
}
```

- **Response**: Similar structure to other locations

#### 2. Get All Wards

**GET** `/location/wards`

- **Role Required**: Public
- **Query Parameters**:
  - `name`: string (optional)
  - `districtId`: string (optional)
- **Response**: Array of location objects

#### 3. Delete Ward

**DELETE** `/location/wards/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Ward response

---

### Streets

#### 1. Create Street

**POST** `/location/streets`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "name": "string (required)",
  "code": "string (required)",
  "wardId": "string (required)"
}
```

- **Response**: Similar structure to other locations

#### 2. Get All Streets

**GET** `/location/streets`

- **Role Required**: Public
- **Query Parameters**:
  - `name`: string (optional)
  - `wardId`: string (optional)
- **Response**: Array of location objects

#### 3. Delete Street

**DELETE** `/location/streets/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Street response

---

### Entertainment Venues

#### 1. Get Entertainment Venues By City

**GET** `/location/entertainment-venues/city/{cityId}`

- **Role Required**: Public
- **Path Parameters**:
  - `cityId`: string (UUID format)
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "category": {
        "id": "string",
        "name": "string"
      },
      "venues": [
        {
          "id": "string",
          "name": "string",
          "address": "string",
          "description": "string"
        }
      ]
    }
  ]
}
```

---

## Discounts

### 1. Create Discount

**POST** `/discounts?hotelId={hotelId}&specialDayId={specialDayId}`

- **Role Required**: ADMIN
- **Query Parameters**:
  - `hotelId`: string (optional)
  - `specialDayId`: string (optional)
- **Request Body**:

```json
{
  "code": "string (required, max 50 characters)",
  "description": "string (required)",
  "percentage": "number (required, 0-100)",
  "usageLimit": "integer (required, positive)",
  "timesUsed": "integer (required, min 0)",
  "minBookingPrice": "integer (optional, min 0)",
  "minBookingCount": "integer (optional, positive)",
  "validFrom": "date (required, ISO format)",
  "validTo": "date (required, ISO format)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "code": "string",
    "description": "string",
    "percentage": "number",
    "usageLimit": "integer",
    "timesUsed": "integer",
    "minBookingPrice": "integer",
    "minBookingCount": "integer",
    "validFrom": "date",
    "validTo": "date",
    "active": boolean,
    "hotel": {},
    "specialDay": {},
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Discounts

**GET** `/discounts`

- **Role Required**: Public
- **Query Parameters**:
  - `code`: string (optional)
  - `active`: boolean (optional)
  - `currentlyValid`: boolean (optional)
  - `validFrom`: date (optional, ISO format)
  - `validTo`: date (optional, ISO format)
  - `minPercentage`: number (optional)
  - `maxPercentage`: number (optional)
  - `minBookingPrice`: integer (optional)
  - `maxBookingPrice`: integer (optional)
  - `minBookingCount`: integer (optional)
  - `maxBookingCount`: integer (optional)
  - `available`: boolean (optional)
  - `exhausted`: boolean (optional)
  - `minTimesUsed`: integer (optional)
  - `maxTimesUsed`: integer (optional)
  - `hotelId`: string (optional)
  - `specialDayId`: string (optional)
  - `page`: integer (default: 0)
  - `size`: integer (default: 10)
  - `sortBy`: string (default: "createdAt")
  - `sortDir`: string (default: "ASC")
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string",
        "code": "string",
        "description": "string",
        "percentage": "number",
        "usageLimit": "integer",
        "timesUsed": "integer",
        "active": boolean
      }
    ],
    "page": "integer",
    "size": "integer",
    "totalItems": "long",
    "totalPages": "integer",
    "first": boolean,
    "last": boolean,
    "hasNext": boolean,
    "hasPrevious": boolean
  }
}
```

### 3. Get Discount By ID

**GET** `/discounts/{id}`

- **Role Required**: Public
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Discount response

### 4. Update Discount

**PUT** `/discounts/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Request Body**: Same as Create Discount (all fields optional)
- **Response**: Same as Create Discount response

### 5. Delete Discount

**DELETE** `/discounts/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Discount response

---

## Policies

### Cancellation Policies

#### 1. Get All Cancellation Policies

**GET** `/policy/cancellation-policies`

- **Role Required**: PARTNER, ADMIN
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "rules": [
        {
          "id": "string",
          "daysBeforeCheckIn": "integer",
          "penaltyPercentage": "integer (0-100)"
        }
      ]
    }
  ]
}
```

### Cancellation Rules

#### 1. Get All Cancellation Rules

**GET** `/policy/cancellation-rules`

- **Role Required**: PARTNER, ADMIN
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "daysBeforeCheckIn": "integer",
      "penaltyPercentage": "integer (0-100)"
    }
  ]
}
```

### Reschedule Policies

#### 1. Get All Reschedule Policies

**GET** `/policy/reschedule-policies`

- **Role Required**: PARTNER, ADMIN
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "rules": [
        {
          "id": "string",
          "daysBeforeCheckin": "integer",
          "feePercentage": "integer (0-100)"
        }
      ]
    }
  ]
}
```

### Reschedule Rules

#### 1. Get All Reschedule Rules

**GET** `/policy/reschedule-rules`

- **Role Required**: PARTNER, ADMIN
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "daysBeforeCheckin": "integer",
      "feePercentage": "integer (0-100)"
    }
  ]
}
```

---

## Documents

### Identification Documents

#### 1. Get All Identification Documents

**GET** `/document/identification-documents`

- **Role Required**: PARTNER, ADMIN
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "name": "string"
    }
  ]
}
```

---

## Special Days

### 1. Create Special Day

**POST** `/special-days`

- **Role Required**: ADMIN
- **Request Body**:

```json
{
  "date": "date (required, ISO format: YYYY-MM-DD)",
  "name": "string (required)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string",
    "date": "date",
    "name": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 2. Get All Special Days

**GET** `/special-days`

- **Role Required**: Public
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string",
      "date": "date",
      "name": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

### 3. Update Special Day

**PUT** `/special-days/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Request Body**:

```json
{
  "date": "date (optional, ISO format)",
  "name": "string (optional)"
}
```

- **Response**: Same as Create Special Day response

### 4. Delete Special Day

**DELETE** `/special-days/{id}`

- **Role Required**: ADMIN
- **Path Parameters**:
  - `id`: string (UUID format)
- **Response**: Same as Create Special Day response

---

## Partner Reports

All partner report endpoints support period comparison. When `compare-from` and `compare-to` parameters are provided, the response will include comparison data showing differences and percentage changes between the current period and the comparison period.

---

## Admin Reports

All admin report endpoints support period comparison. When `compare-from` and `compare-to` parameters are provided, the response will include comparison data showing differences and percentage changes between the current period and the comparison period.

**Role Required**: ADMIN

### 1. Revenue Report

**GET** `/admin/reports/revenue`

- **Role Required**: ADMIN
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `group-by`: string (optional, enum: `day`, `week`, `month`, default: `day`)
  - `filter-by`: string (optional, enum: `hotel`, `city`, `province`)
  - `page`: integer (optional, default: 0)
  - `size`: integer (optional, default: 10)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "period": "date",
        "revenue": "number"
      }
    ],
    "summary": {
      "totalRevenue": "number"
    },
    "breakdown": [
      {
        "id": "string",
        "name": "string",
        "revenue": "number"
      }
    ]
  }
}
```

- **Response** (with comparison): Similar structure with `currentPeriod`, `previousPeriod`, and `comparison` objects.

### 2. Hotel Performance Report

**GET** `/admin/reports/hotel-performance`

- **Role Required**: ADMIN
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `sort-by`: string (optional, enum: `revenue`, `occupancy`, `bookings`, `cancellationRate`, default: `revenue`)
  - `sort-dir`: string (optional, enum: `asc`, `desc`, default: `desc`)
  - `city-id`: string (optional, UUID format)
  - `province-id`: string (optional, UUID format)
  - `page`: integer (optional, default: 0)
  - `size`: integer (optional, default: 20)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "hotelId": "string",
        "hotelName": "string",
        "totalRevenue": "number",
        "totalCompletedBookings": "integer",
        "totalCreatedBookings": "integer",
        "totalCancelledBookings": "integer",
        "averageOccupancyRate": "number",
        "cancellationRate": "number"
      }
    ],
    "page": "integer",
    "size": "integer",
    "totalItems": "long",
    "totalPages": "integer",
    "first": boolean,
    "last": boolean,
    "hasNext": boolean,
    "hasPrevious": boolean
  }
}
```

- **Response** (with comparison): Includes `currentPeriod`, `previousPeriod`, and `comparison` array with detailed comparison metrics including rank changes for each hotel.

### 3. Users Summary Report

**GET** `/admin/reports/users/summary`

- **Role Required**: ADMIN
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "growth": {
      "newCustomers": "integer",
      "newPartners": "integer"
    },
    "platformTotals": {
      "totalCustomers": "integer",
      "totalPartners": "integer"
    }
  }
}
```

- **Response** (with comparison): Similar structure with `currentPeriod`, `previousPeriod`, and `comparison` objects containing differences and percentage changes.

### 4. Seasonality Report

**GET** `/admin/reports/trends/seasonality`

- **Role Required**: ADMIN
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `metric`: string (optional, enum: `revenue`, `bookings`, default: `bookings`)
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "month": "date",
        "totalRevenue": "number",
        "totalBookings": "integer"
      }
    ]
  }
}
```

### 5. Popular Locations Report

**GET** `/admin/reports/trends/popular-locations`

- **Role Required**: ADMIN
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `level`: string (optional, enum: `city`, `province`, default: `city`)
  - `metric`: string (optional, enum: `revenue`, `bookings`, default: `revenue`)
  - `limit`: integer (optional, default: 10, max: 100)
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "locationId": "string",
        "locationName": "string",
        "totalRevenue": "number",
        "totalBookings": "integer"
      }
    ]
  }
}
```

### 6. Popular Room Types Report

**GET** `/admin/reports/trends/popular-room-types`

- **Role Required**: ADMIN
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `group-by`: string (optional, enum: `view`, `bedType`, `occupancy`, default: `occupancy`)
  - `limit`: integer (optional, default: 10, max: 100)
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "roomCategory": "string",
        "totalBookedNights": "integer"
      }
    ]
  }
}
```

### 7. Financials Report

**GET** `/admin/reports/financials`

- **Role Required**: ADMIN
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `group-by`: string (optional, enum: `day`, `week`, `month`, default: `day`)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "period": "date",
        "grossRevenue": "number",
        "netRevenue": "number",
        "partnerPayout": "number",
        "grossMargin": "number"
      }
    ],
    "summary": {
      "totalGrossRevenue": "number",
      "totalNetRevenue": "number",
      "totalPartnerPayout": "number",
      "averageGrossMargin": "number"
    }
  }
}
```

- **Response** (with comparison): Similar structure with `currentPeriod`, `previousPeriod`, and `comparison` objects containing differences and percentage changes for all financial metrics.

### 8. Generate All System Daily Reports

**POST** `/admin/reports/generate-all`

- **Role Required**: ADMIN
- **Description**: Manually triggers the system daily report generation process for all historical data in the system. This endpoint processes all dates from the earliest booking/user creation date to the latest, similar to the background job but for the entire system instead of just one day.
- **Request Body**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalDates": "integer",
    "successCount": "integer",
    "failureCount": "integer",
    "minDate": "date (ISO format: YYYY-MM-DD)",
    "maxDate": "date (ISO format: YYYY-MM-DD)",
    "errors": [
      "string (error messages, max 10 errors)"
    ]
  }
}
```

- **Notes**:
  - This endpoint processes all dates from the earliest to the latest date found in the Booking and User tables
  - Each date is processed in a separate transaction. If one date fails, others continue processing
  - The response includes a summary of total dates processed, success/failure counts, and up to 10 error messages
  - This operation may take a long time depending on the amount of historical data
  - Should be run after `POST /partner/reports/generate-all` to ensure HotelDailyReport data is available

### Notes on Admin Reports

- **Period Comparison**: Revenue, Hotel Performance, Users Summary, and Financials reports support optional period comparison. When both `compare-from` and `compare-to` are provided, the response includes comparison data. If only one is provided, it is ignored and the endpoint returns normal response.
- **Data Source**: Reports use pre-aggregated data from `SystemDailyReport`, `HotelDailyReport`, and `RoomDailyPerformance` tables for optimal performance. Data is typically up-to-date until the end of the previous day.
- **Date Range Validation**: `from` must be less than or equal to `to`. Similarly, `compare-from` must be less than or equal to `compare-to` when provided.
- **Pagination**: Hotel Performance report supports pagination. Other reports may return all data or use in-memory pagination for breakdown items.
- **Empty Data**: If no data exists for the requested period, endpoints return `200 OK` with zero values or empty arrays, not `404 Not Found`.
- **Currency Rounding**: All financial values are rounded to 2 decimal places.
- **Rank Change**: Hotel Performance comparison includes rank change tracking, showing how hotel rankings changed between periods.

### 8. Generate All System Daily Reports

**POST** `/admin/reports/generate-all`

- **Role Required**: ADMIN
- **Description**: Manually triggers the system daily report generation process for all historical data in the system. This endpoint processes all dates from the earliest booking/user creation date to the latest, similar to the background job but for the entire system instead of just one day.
- **Request Body**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalDates": "integer",
    "successCount": "integer",
    "failureCount": "integer",
    "minDate": "date (ISO format: YYYY-MM-DD)",
    "maxDate": "date (ISO format: YYYY-MM-DD)",
    "errors": [
      "string (error messages, max 10 errors)"
    ]
  }
}
```

- **Notes**:
  - This endpoint processes all dates from the earliest to the latest date found in the Booking and User tables
  - Each date is processed in a separate transaction. If one date fails, others continue processing
  - The response includes a summary of total dates processed, success/failure counts, and up to 10 error messages
  - This operation may take a long time depending on the amount of historical data
  - Should be run after `POST /partner/reports/generate-all` to ensure HotelDailyReport data is available

### 1. Revenue Report

**GET** `/partner/reports/revenue`

- **Role Required**: PARTNER
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format)
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `group-by`: string (optional, enum: `day`, `week`, `month`, default: `day`)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "period": "date",
        "revenue": "number"
      }
    ],
    "summary": {
      "totalRevenue": "number"
    }
  }
}
```

- **Response** (with comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "currentPeriod": {
      "data": [...],
      "summary": {
        "totalRevenue": "number"
      }
    },
    "previousPeriod": {
      "data": [...],
      "summary": {
        "totalRevenue": "number"
      }
    },
    "comparison": {
      "totalRevenueDifference": "number",
      "totalRevenuePercentageChange": "number"
    }
  }
}
```

### 2. Bookings Summary

**GET** `/partner/reports/bookings/summary`

- **Role Required**: PARTNER
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format)
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalCreated": "integer",
    "totalPending": "integer",
    "totalConfirmed": "integer",
    "totalCheckedIn": "integer",
    "totalCompleted": "integer",
    "totalCancelled": "integer",
    "totalRescheduled": "integer",
    "cancellationRate": "number"
  }
}
```

- **Response** (with comparison): Similar structure with `currentPeriod`, `previousPeriod`, and `comparison` objects containing differences and percentage changes for each metric.

### 3. Occupancy Report

**GET** `/partner/reports/occupancy`

- **Role Required**: PARTNER
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format)
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "date": "date",
        "occupancyRate": "number"
      }
    ],
    "summary": {
      "averageRate": "number",
      "totalOccupied": "integer",
      "totalAvailable": "integer"
    }
  }
}
```

- **Response** (with comparison): Similar structure with `currentPeriod`, `previousPeriod`, and `comparison` objects.

### 4. Room Performance

**GET** `/partner/reports/rooms/performance`

- **Role Required**: PARTNER
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format)
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `sort-by`: string (optional, enum: `revenue`, `bookedRoomNights`, default: `revenue`)
  - `sort-dir`: string (optional, enum: `asc`, `desc`, default: `desc`)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "roomId": "string",
        "roomName": "string",
        "roomView": "string",
        "totalRevenue": "number",
        "totalBookedNights": "integer"
      }
    ]
  }
}
```

- **Response** (with comparison): Each room item in the merged list includes current period data, previous period data, and comparison metrics (differences and percentage changes).

### 5. Customer Summary

**GET** `/partner/reports/customers/summary`

- **Role Required**: PARTNER
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format)
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalNewCustomerBookings": "integer",
    "totalReturningCustomerBookings": "integer",
    "totalCompletedBookings": "integer",
    "newCustomerPercentage": "number",
    "returningCustomerPercentage": "number"
  }
}
```

- **Response** (with comparison): Similar structure with `currentPeriod`, `previousPeriod`, and `comparison` objects.

### 6. Reviews Summary

**GET** `/partner/reports/reviews/summary`

- **Role Required**: PARTNER
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format)
  - `from`: date (required, ISO format: YYYY-MM-DD)
  - `to`: date (required, ISO format: YYYY-MM-DD)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD)
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD)
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalReviews": "integer",
    "averageScore": "number",
    "scoreDistribution": [
      {
        "scoreBucket": "string (9-10, 7-8, 5-6, 3-4, 1-2)",
        "reviewCount": "integer"
      }
    ]
  }
}
```

- **Response** (with comparison): Similar structure with `currentPeriod`, `previousPeriod`, and `comparison` objects containing differences and percentage changes for `totalReviews` and `averageScore`.

### 7. Generate All Daily Reports

**POST** `/partner/reports/generate-all`

- **Role Required**: ADMIN
- **Description**: Manually triggers the daily report generation process for all historical data in the system. This endpoint processes all dates from the earliest booking date to the latest, similar to the background job but for the entire system instead of just one day.
- **Request Body**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalDates": "integer",
    "successCount": "integer",
    "failureCount": "integer",
    "minDate": "date (ISO format: YYYY-MM-DD)",
    "maxDate": "date (ISO format: YYYY-MM-DD)",
    "errors": [
      "string (error messages, max 10 errors)"
    ]
  }
}
```

- **Notes**:
  - This endpoint processes all dates from the earliest to the latest date found in the Booking table
  - Each date is processed in a separate transaction. If one date fails, others continue processing
  - The response includes a summary of total dates processed, success/failure counts, and up to 10 error messages
  - This operation may take a long time depending on the amount of historical data
  - Generates `HotelDailyReport` and `RoomDailyPerformance` data for all dates
  - Should be run before `POST /admin/reports/generate-all` to ensure hotel data is available for system reports

### Notes on Partner Reports

- **Period Comparison**: All report endpoints support optional period comparison. When both `compare-from` and `compare-to` are provided, the response includes comparison data. If only one is provided, it is ignored and the endpoint returns normal response.
- **Data Source**: Reports use pre-aggregated data from `HotelDailyReport` and `RoomDailyPerformance` tables for optimal performance. Data is typically up-to-date until the end of the previous day.
- **Date Range Validation**: `from` must be less than or equal to `to`. Similarly, `compare-from` must be less than or equal to `compare-to` when provided.
- **Authorization**: Partners can only access reports for hotels they own. The system validates hotel ownership automatically.
- **Empty Data**: If no data exists for the requested period, endpoints return `200 OK` with zero values or empty arrays, not `404 Not Found`.

---

## Partner Dashboard

### 1. Get Partner Dashboard Summary

**GET** `/partner/dashboard/summary`

- **Role Required**: PARTNER
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format) - ID of the hotel to get dashboard data for
  - `forecast-days`: integer (optional, default: 7, min: 1, max: 30) - Number of days to forecast occupancy
- **Description**: Provides near real-time operational dashboard data for a partner's hotel, including today's activity, live booking/room statuses, and occupancy forecast.
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "todaysActivity": {
      "checkInsToday": "integer",
      "checkOutsToday": "integer",
      "inHouseGuests": "integer"
    },
    "bookingStatusCounts": [
      {
        "status": "string (e.g., confirmed, checked_in, etc.)",
        "count": "integer"
      }
    ],
    "roomStatusCounts": [
      {
        "status": "string (e.g., available, booked, maintenance)",
        "count": "integer"
      }
    ],
    "occupancyForecast": [
      {
        "date": "date (ISO format: YYYY-MM-DD)",
        "roomsBooked": "integer",
        "occupancyPercentage": "number"
      }
    ],
    "totalRoomCapacity": "integer"
  }
}
```

- **Notes**:
  - This endpoint queries live data from Booking and Room tables for real-time accuracy
  - Check-ins are bookings with `checkInDate = today` and status `confirmed`
  - Check-outs are bookings with `checkOutDate = today` and status `checked_in`
  - In-house guests are bookings with status `checked_in`
  - Occupancy forecast includes only active booking statuses: `confirmed`, `checked_in`
  - Room status counts include all room statuses in the system
  - Occupancy percentage is calculated as: (roomsBooked / totalRoomCapacity) × 100
  - Uses parallel execution for optimal performance

---

## Admin Dashboard

### 1. Get Admin Dashboard Summary

**GET** `/admin/dashboard/summary`

- **Role Required**: ADMIN
- **Query Parameters**: None (returns predefined data for fixed time periods)
- **Description**: Provides a system health snapshot including real-time financials, booking activity, ecosystem growth, and top performing hotels. Uses a hybrid data architecture combining real-time transactional data (for "today" metrics) with pre-aggregated daily reports (for historical trends).
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "realtimeFinancials": {
      "todayRevenue": "number",
      "mtdRevenue": "number"
    },
    "aggregatedFinancials": {
      "mtdGrossRevenue": "number",
      "mtdNetRevenue": "number"
    },
    "bookingActivity": {
      "bookingsCreatedToday": "integer"
    },
    "ecosystemGrowth": {
      "newUsersToday": "integer",
      "newPartnersToday": "integer",
      "totalActiveHotels": "integer"
    },
    "topPerformingHotels": [
      {
        "hotelId": "string",
        "hotelName": "string",
        "totalRevenue": "number",
        "totalBookings": "integer"
      }
    ]
  }
}
```

- **Notes**:
  - **Hybrid Data Architecture**:
    - Real-time data: `todayRevenue` (completed bookings checked out today), `bookingsCreatedToday`, `newUsersToday`, `newPartnersToday`
    - Aggregated data: `mtdGrossRevenue`, `mtdNetRevenue` (from SystemDailyReport), `topPerformingHotels` (from HotelDailyReport for last 7 days)
  - **Fixed Time Periods**:
    - Today: Current date (real-time queries on transactional tables)
    - Month-to-date (MTD): From 1st day of current month to yesterday (aggregated from daily reports)
    - Last 7 days: For top hotels ranking (aggregated from HotelDailyReport)
  - **Performance Optimization**: Uses parallel execution with `CompletableFuture` for all data fetches
  - **Top Hotels**: Limited to top 5 hotels by revenue in the last 7 days
  - **Total Active Hotels**: Count of hotels with status `active`
  - **Revenue Calculation**: 
    - Real-time: Sum of `finalPrice` from Booking table where status = `completed` and checkOutDate = today
    - Aggregated: Sum from daily report tables for historical data
  - MTD data excludes today to avoid inconsistency between real-time and aggregated sources

---

## Notes

### Authentication

- All protected endpoints require JWT token in Authorization header: `Authorization: Bearer {token}`
- Token is also sent as HTTP-only cookie by default

### Role Hierarchy

- **ADMIN** > **PARTNER**
- **ADMIN** > **USER**
- ADMIN can access all endpoints that PARTNER and USER can access
- PARTNER and USER roles are independent (no hierarchy between them)

### Common Response Structure

All responses follow this structure:

```json
{
  "statusCode": 200,
  "message": "",
  "data": { ... }
}
```

### Pagination

Paginated responses include:

- `page`: Current page (0-indexed)
- `size`: Page size
- `totalItems`: Total number of items
- `totalPages`: Total number of pages
- `first`: Is first page
- `last`: Is last page
- `hasNext`: Has next page
- `hasPrevious`: Has previous page

### Date/Time Formats

- Date: `YYYY-MM-DD` (ISO 8601)
- DateTime: `YYYY-MM-DDTHH:mm:ss` (ISO 8601)

### UUID Format

All ID path parameters must be in UUID format: `{id:[a-fA-F0-9\\-]{36}}`

### File Uploads

Endpoints that accept file uploads use `multipart/form-data` content type.

---

## Status Types Reference

This section provides reference for all status types used in the API. These values can be used in filter parameters and are returned in API responses.

### Accommodation Status Types

Used for hotels and other accommodations:

- `active` - Accommodation is active and available for bookings
- `inactive` - Accommodation is inactive (not available for new bookings)
- `maintenance` - Accommodation is under maintenance
- `closed` - Accommodation is closed

**Used in**:

- `GET /accommodation/hotels` - `status` query parameter
- `GET /accommodation/rooms` - `status` query parameter
- Hotel response objects
- Room response objects

### Booking Status Types

Used for booking status tracking:

- `pending_payment` - Booking is waiting for payment
- `confirmed` - Booking is confirmed after payment
- `checked_in` - Guest has checked in
- `cancelled` - Booking has been cancelled
- `completed` - Booking is completed (guest has checked out)
- `rescheduled` - Booking has been rescheduled

**Used in**:

- `GET /bookings` - `status` query parameter
- Booking response objects

### Payment Status Types

Used for payment tracking:

- `pending` - Payment is pending
- `success` - Payment was successful
- `failed` - Payment failed

**Used in**:

- Payment-related response objects

### Room Inventory Status Types

Used for room inventory availability:

- `available` - Room is available for booking
- `unavailable` - Room is not available
- `maintenance` - Room is under maintenance
- `booked` - Room is booked

**Used in**:

- `GET /accommodation/rooms/inventories` - `status` query parameter
- Room inventory response objects

### User Role Types

User roles in the system:

- `user` - Regular user (can make bookings)
- `partner` - Partner/owner (can manage hotels and rooms)
- `admin` - Administrator (full system access)

**Used in**:

- User response objects
- Authorization checks

### Auth Provider Types

Authentication providers:

- `local` - Local email/password authentication
- `google` - Google OAuth authentication

**Used in**:

- User creation/registration
- User response objects

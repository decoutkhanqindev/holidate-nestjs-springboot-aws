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
16. [Special Days](#special-days)
17. [Status Types Reference](#status-types-reference)

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

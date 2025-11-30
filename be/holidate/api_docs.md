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

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required)
- **Description**: Registers a new user account in the system. Creates a user with LOCAL authentication provider and assigns the default USER role. The password is hashed before storage. After registration, the user can log in using the email and password.
- **Request Body**:

```json
{
  "email": "string (required, not blank, valid email format) - User's email address (must be unique)",
  "password": "string (required, not blank, min 8 characters) - User's password (will be hashed before storage)",
  "fullName": "string (required, not blank, 3-100 characters) - User's full name"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "email": "string",
    "fullName": "string",
    "phoneNumber": "string (nullable)",
    "address": "string (nullable)",
    "country": {
      "id": "string (UUID)",
      "name": "string",
      "code": "string"
    },
    "province": {
      "id": "string (UUID)",
      "name": "string",
      "code": "string"
    },
    "city": {
      "id": "string (UUID)",
      "name": "string",
      "code": "string"
    },
    "district": {
      "id": "string (UUID)",
      "name": "string",
      "code": "string"
    },
    "ward": {
      "id": "string (UUID)",
      "name": "string",
      "code": "string"
    },
    "street": {
      "id": "string (UUID)",
      "name": "string",
      "code": "string"
    },
    "gender": "string (nullable, MALE/FEMALE/OTHER)",
    "dateOfBirth": "datetime (nullable, ISO 8601 format)",
    "avatarUrl": "string (nullable)",
    "role": {
      "id": "string (UUID)",
      "name": "string (default: 'user')",
      "description": "string"
    },
    "authInfo": {
      "id": "string (UUID)",
      "authProvider": "string (default: 'LOCAL')",
      "active": boolean (default: true)
    },
    "createdAt": "datetime (ISO 8601 format)",
    "updatedAt": "datetime (ISO 8601 format)"
  }
}
```

- **Notes**:
  - The email must be unique. If an account with the same email already exists, registration will fail
  - The password must be at least 8 characters long
  - New users are automatically assigned the default USER role
  - The authentication provider is set to LOCAL (for email/password authentication)
  - Location fields (country, province, city, etc.) are initially null and can be updated later
  - After registration, users should verify their email using the email verification OTP endpoints
  - The password is securely hashed using BCrypt before being stored in the database

### 2. Login

**POST** `/auth/login`

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required)
- **Description**: Authenticates a user with email and password. Returns JWT access token and refresh token. The access token should be included in the Authorization header for protected endpoints. The refresh token can be used to obtain a new access token when it expires. The access token is also set as an HTTP-only cookie for browser-based applications.
- **Request Body**:

```json
{
  "email": "string (required, not blank, valid email format) - User's email address",
  "password": "string (required, not blank, min 8 characters) - User's password"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "email": "string",
    "fullName": "string",
    "role": {
      "id": "string (UUID)",
      "name": "string (user/partner/admin)",
      "description": "string"
    },
    "accessToken": "string (JWT token) - Use in Authorization header: 'Bearer {accessToken}'",
    "expiresAt": "datetime (ISO 8601 format) - Access token expiration time",
    "refreshToken": "string (JWT token) - Use to refresh access token when it expires"
  }
}
```

- **Error Responses**:
  - **401 Unauthorized**: Invalid email or password, user not found, user account is inactive, or user registered with a different auth provider (e.g., Google OAuth)

- **Notes**:
  - Only users registered with LOCAL authentication provider can log in with email/password
  - Users registered via Google OAuth cannot use this endpoint (they must use OAuth flow)
  - The user account must be active to log in
  - The access token is also set as an HTTP-only cookie (name configured in `JWT_TOKEN_COOKIE_NAME`) for automatic inclusion in subsequent requests
  - Access tokens have a shorter expiration time (typically 15 minutes to 1 hour)
  - Refresh tokens have a longer expiration time (typically 7-30 days)
  - Store the refresh token securely and use it to obtain new access tokens when needed
  - Include the access token in the Authorization header for all protected endpoints: `Authorization: Bearer {accessToken}`

### 3. Verify Token

**POST** `/auth/verify-token`

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required)
- **Description**: Verifies if a JWT token is valid and properly signed. This endpoint checks the token's signature and structure but does not check expiration. Useful for client-side token validation before making API calls.
- **Request Body**:

```json
{
  "token": "string (required, not blank) - JWT token to verify (can be access token or refresh token)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "verified": boolean (true if token is valid and properly signed, false otherwise)
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid token format or malformed token
  - **401 Unauthorized**: Token signature verification failed

- **Notes**:
  - This endpoint only verifies the token's signature and structure, not its expiration
  - A token can be verified even if it's expired (use this to check if a token needs refreshing)
  - Use this endpoint to validate tokens before making API calls to avoid unnecessary requests
  - Both access tokens and refresh tokens can be verified with this endpoint

### 4. Refresh Token

**POST** `/auth/refresh-token`

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required)
- **Description**: Generates a new access token and refresh token using a valid refresh token. This endpoint should be called when the access token expires. The old refresh token is invalidated and replaced with a new one.
- **Request Body**:

```json
{
  "token": "string (required, not blank) - Valid refresh token"
}
```

- **Response**: Same structure as Login response - returns new access token, refresh token, and user information

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "email": "string",
    "fullName": "string",
    "role": {
      "id": "string (UUID)",
      "name": "string",
      "description": "string"
    },
    "accessToken": "string (new JWT access token)",
    "expiresAt": "datetime (ISO 8601 format)",
    "refreshToken": "string (new JWT refresh token)"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid or malformed refresh token
  - **401 Unauthorized**: Refresh token is expired, invalid, or signature verification failed

- **Notes**:
  - The provided refresh token must be valid and not expired
  - After refreshing, the old refresh token is invalidated and cannot be used again
  - A new refresh token is issued along with the new access token
  - The new access token is also set as an HTTP-only cookie
  - Store the new refresh token and discard the old one
  - If the refresh token is expired, the user must log in again

### 5. Logout

**POST** `/auth/logout`

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required, but token must be valid)
- **Description**: Logs out a user by invalidating the refresh token. The access token cookie is also cleared from the response. After logout, the refresh token cannot be used to obtain new access tokens.
- **Request Body**:

```json
{
  "token": "string (required, not blank) - Refresh token to invalidate"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "loggedOut": boolean (true if logout was successful)
  }
}
```

- **Notes**:
  - The refresh token provided in the request is invalidated and cannot be used again
  - The access token cookie is cleared from the HTTP response (set to expire immediately)
  - After logout, the user must log in again to obtain new tokens
  - Access tokens remain valid until they expire (they are not immediately invalidated on logout)
  - For enhanced security, consider implementing token blacklisting if immediate access token invalidation is required

### 6. Get Me (Current User Info)

**GET** `/auth/me`

- **Role Required**: Authenticated (requires valid JWT access token)
- **Description**: Retrieves the current authenticated user's information including user details, role, and token information. This endpoint uses the JWT token from the Authorization header or cookie to identify the user.
- **Headers**:
  - `Authorization`: `Bearer {accessToken}` (required) - JWT access token
  - OR: Access token cookie (if using cookie-based authentication)
- **Response**: Same structure as Login response - returns current user information and token details

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "email": "string",
    "fullName": "string",
    "role": {
      "id": "string (UUID)",
      "name": "string",
      "description": "string"
    },
    "accessToken": "string (same token from request, or new token if refreshed)",
    "expiresAt": "datetime (ISO 8601 format)",
    "refreshToken": "string (refresh token associated with the user)"
  }
}
```

- **Error Responses**:
  - **401 Unauthorized**: Missing, invalid, or expired access token

- **Notes**:
  - This endpoint requires a valid JWT access token
  - The token can be provided in the Authorization header or as an HTTP-only cookie
  - Use this endpoint to check if the current session is still valid
  - Returns the same token information that was provided during login
  - Useful for frontend applications to get current user context after page refresh

---

## Email/OTP

### 1. Send Email Verification OTP

**POST** `/auth/email/send-email-verification-otp`

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required)
- **Description**: Sends a 6-digit OTP (One-Time Password) to the user's email address for email verification. The OTP is valid for a limited time (typically 5-15 minutes). This endpoint is typically used after user registration to verify the email address.
- **Request Body**:

```json
{
  "email": "string (required, not blank, valid email format) - Email address to send verification OTP to"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "sent": boolean (true if OTP was successfully sent, false otherwise)
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid email format
  - **404 Not Found**: Email address not found in the system

- **Notes**:
  - The OTP is sent to the specified email address
  - OTP is typically valid for 5-15 minutes (exact expiration time depends on system configuration)
  - Each OTP can only be used once
  - There may be rate limiting to prevent abuse (e.g., max 3-5 OTP requests per email per hour)
  - The OTP is a 6-digit numeric code
  - After receiving the OTP, use the Verify Email Verification OTP endpoint to complete verification
  - Email verification is typically required before users can access certain features

### 2. Verify Email Verification OTP

**POST** `/auth/email/verify-email-verification-otp`

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required)
- **Description**: Verifies the email verification OTP sent to the user's email. If the OTP is correct and not expired, the user's email is marked as verified. This completes the email verification process.
- **Request Body**:

```json
{
  "email": "string (required, not blank, valid email format) - Email address that received the OTP",
  "otp": "string (required, not blank, exactly 6 characters) - The 6-digit OTP code received via email"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "verified": boolean (true if OTP is correct and email is verified, false otherwise)
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid email format, invalid OTP format (must be exactly 6 characters), or OTP expired
  - **401 Unauthorized**: Invalid or incorrect OTP
  - **404 Not Found**: Email address not found or no OTP request found for this email

- **Notes**:
  - The OTP must match the one sent to the email address
  - The OTP must be used within its expiration time (typically 5-15 minutes)
  - Each OTP can only be used once - after successful verification, it cannot be reused
  - After successful verification, the user's email is marked as verified in the system
  - If verification fails, the user can request a new OTP using the Send Email Verification OTP endpoint
  - The email and OTP must match the most recent OTP sent to that email

### 3. Send Password Reset OTP

**POST** `/auth/email/send-password-reset-otp`

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required)
- **Description**: Sends a 6-digit OTP to the user's email address for password reset. This is the first step in the password reset process. The OTP is valid for a limited time and can only be used once.
- **Request Body**:

```json
{
  "email": "string (required, not blank, valid email format) - Email address of the account to reset password for"
}
```

- **Response**: Same structure as Send Email Verification OTP

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "sent": boolean (true if OTP was successfully sent, false otherwise)
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid email format
  - **404 Not Found**: Email address not found in the system

- **Notes**:
  - The OTP is sent to the specified email address
  - OTP is typically valid for 5-15 minutes (exact expiration time depends on system configuration)
  - Each OTP can only be used once
  - There may be rate limiting to prevent abuse (e.g., max 3-5 OTP requests per email per hour)
  - The OTP is a 6-digit numeric code
  - After receiving the OTP, use the Verify Password Reset OTP endpoint to reset the password
  - For security reasons, the system does not indicate whether an email exists in the system (to prevent email enumeration attacks)

### 4. Verify Password Reset OTP

**POST** `/auth/email/verify-password-reset-otp`

- **Content-Type**: `application/json`
- **Role Required**: Public (no authentication required)
- **Description**: Verifies the password reset OTP and updates the user's password. This is the second and final step in the password reset process. If the OTP is correct and not expired, the user's password is updated to the new password provided.
- **Request Body**:

```json
{
  "email": "string (required, not blank, valid email format) - Email address that received the OTP",
  "otp": "string (required, not blank, exactly 6 characters) - The 6-digit OTP code received via email",
  "newPassword": "string (required, not blank, min 8 characters) - New password to set for the account"
}
```

- **Response**: Same structure as Verify Email Verification OTP

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "verified": boolean (true if OTP is correct and password was reset, false otherwise)
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid email format, invalid OTP format (must be exactly 6 characters), invalid password format (must be at least 8 characters), or OTP expired
  - **401 Unauthorized**: Invalid or incorrect OTP
  - **404 Not Found**: Email address not found or no OTP request found for this email

- **Notes**:
  - The OTP must match the one sent to the email address
  - The OTP must be used within its expiration time (typically 5-15 minutes)
  - Each OTP can only be used once - after successful verification, it cannot be reused
  - The new password must be at least 8 characters long
  - After successful verification, the user's password is updated and they can log in with the new password
  - The old password is immediately invalidated
  - If verification fails, the user can request a new OTP using the Send Password Reset OTP endpoint
  - The email and OTP must match the most recent OTP sent to that email
  - For security, the user should be logged out of all sessions after password reset (this may require additional implementation)

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
  - `active`: boolean (optional) - User active status
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

- **Content-Type**: `application/json`
- **Role Required**: USER, PARTNER, ADMIN
- **Description**: Creates a new booking for a hotel room. The booking is created with status `pending_payment` and a payment URL is generated for VNPay payment gateway. The booking will expire if payment is not completed within the expiration time. The system validates room availability, capacity, and calculates pricing including discounts, taxes, and service fees.
- **Request Body**:

```json
{
  "userId": "string (required, not blank, UUID format) - ID of the user making the booking",
  "roomId": "string (required, not blank, UUID format) - ID of the room to book",
  "hotelId": "string (required, not blank, UUID format) - ID of the hotel",
  "checkInDate": "date (required, ISO format: YYYY-MM-DD) - Check-in date (must be today or future date)",
  "checkOutDate": "date (required, ISO format: YYYY-MM-DD) - Check-out date (must be after checkInDate)",
  "numberOfRooms": "integer (required, positive) - Number of rooms to book",
  "numberOfAdults": "integer (required, positive) - Number of adults",
  "numberOfChildren": "integer (required, min: 0, default: 0) - Number of children",
  "discountCode": "string (optional) - Discount code to apply (if valid and applicable)",
  "contactFullName": "string (required, not blank) - Contact person's full name",
  "contactEmail": "string (required, not blank, valid email format) - Contact email address",
  "contactPhone": "string (required, not blank, valid phone pattern) - Contact phone number"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "user": {
      "id": "string (UUID)",
      "email": "string",
      "fullName": "string"
    },
    "room": {
      "id": "string (UUID)",
      "name": "string",
      "view": "string",
      "area": "number",
      "maxAdults": "integer",
      "maxChildren": "integer",
      "basePricePerNight": "number",
      "bedType": {
        "id": "string",
        "name": "string"
      },
      "pricesByDateRange": [
        {
          "date": "date (ISO format: YYYY-MM-DD)",
          "price": "number"
        }
      ]
    },
    "hotel": {
      "id": "string (UUID)",
      "name": "string",
      "address": "string",
      "country": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "province": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "city": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "latitude": "number",
      "longitude": "number",
      "starRating": "integer",
      "status": "string"
    },
    "checkInDate": "date (ISO format: YYYY-MM-DD)",
    "checkOutDate": "date (ISO format: YYYY-MM-DD)",
    "numberOfNights": "integer (calculated from checkInDate and checkOutDate)",
    "numberOfRooms": "integer",
    "numberOfAdults": "integer",
    "numberOfChildren": "integer",
    "priceDetails": {
      "originalPrice": "number (total base price for all nights and rooms)",
      "discountAmount": "number (discount amount if discount code is applied)",
      "appliedDiscount": {
        "id": "string (UUID)",
        "code": "string",
        "percentage": "number",
        "description": "string"
      },
      "netPriceAfterDiscount": "number (originalPrice - discountAmount)",
      "tax": {
        "name": "string (e.g., 'VAT')",
        "percentage": "number",
        "amount": "number"
      },
      "serviceFee": {
        "name": "string (e.g., 'Service Fee')",
        "percentage": "number",
        "amount": "number"
      },
      "finalPrice": "number (total price including all fees and discounts)"
    },
    "contactFullName": "string",
    "contactEmail": "string",
    "contactPhone": "string",
    "status": "string (default: 'pending_payment', see [Booking Status Types](#booking-status-types))",
    "paymentUrl": "string (VNPay payment gateway URL - redirect user to this URL to complete payment)",
    "createdAt": "datetime (ISO 8601 format)",
    "expiresAt": "datetime (ISO 8601 format) - Booking expiration time if payment is not completed",
    "updatedAt": "datetime (ISO 8601 format)"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid date range (checkOutDate must be after checkInDate), invalid guest capacity (exceeds room capacity), insufficient room availability, invalid discount code, or validation errors
  - **404 Not Found**: User, room, or hotel not found
  - **409 Conflict**: Room not available for the specified dates

- **Notes**:
  - The booking is created with status `pending_payment` and must be paid within the expiration time
  - Room availability is checked for each date in the date range
  - The system validates that the number of adults and children does not exceed the room's capacity
  - Pricing is calculated based on room inventory prices for each date (dynamic pricing)
  - Discount codes are validated for validity, expiration, usage limits, and applicability to the booking
  - Taxes and service fees are calculated as percentages of the net price after discount
  - The `paymentUrl` should be used to redirect the user to VNPay payment gateway
  - After successful payment, VNPay will call the payment callback endpoint to update the booking status
  - If payment is not completed before `expiresAt`, the booking may be automatically cancelled
  - The booking reserves the rooms for the specified dates until payment is completed or the booking expires

### 2. Get Booking Price Preview

**POST** `/bookings/price-preview`

- **Content-Type**: `application/json`
- **Role Required**: USER, PARTNER, ADMIN
- **Description**: Calculates and returns a price preview for a potential booking without creating the booking. This endpoint is useful for displaying pricing information to users before they confirm their booking. It shows the breakdown of costs including base price, discounts, taxes, and service fees.
- **Request Body**:

```json
{
  "roomId": "string (required, not blank, UUID format) - ID of the room to preview pricing for",
  "startDate": "date (required, ISO format: YYYY-MM-DD) - Check-in date",
  "endDate": "date (required, ISO format: YYYY-MM-DD) - Check-out date (must be after startDate)",
  "numberOfRooms": "integer (required, positive) - Number of rooms",
  "numberOfAdults": "integer (required, positive) - Number of adults",
  "numberOfChildren": "integer (required, min: 0, default: 0) - Number of children",
  "discountCode": "string (optional) - Discount code to preview (will be validated)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "originalPrice": "number (total base price for all nights and rooms based on room inventory prices)",
    "discountAmount": "number (discount amount if discount code is valid and applicable)",
    "appliedDiscount": {
      "id": "string (UUID)",
      "code": "string",
      "percentage": "number",
      "description": "string"
    },
    "netPriceAfterDiscount": "number (originalPrice - discountAmount)",
    "tax": {
      "name": "string (e.g., 'VAT')",
      "percentage": "number",
      "amount": "number"
    },
    "serviceFee": {
      "name": "string (e.g., 'Service Fee')",
      "percentage": "number",
      "amount": "number"
    },
    "finalPrice": "number (total price including all fees and discounts)"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid date range, invalid discount code, or validation errors
  - **404 Not Found**: Room not found

- **Notes**:
  - This endpoint does not create a booking - it only calculates and returns pricing information
  - Room availability is not checked in this preview (use it only for pricing display)
  - Discount codes are validated but not applied to any actual booking
  - Pricing is calculated based on room inventory prices for each date in the range
  - The preview shows the same pricing structure that would be used if a booking is created
  - Use this endpoint to show users the total cost before they proceed to create a booking

### 3. Get All Bookings

**GET** `/bookings`

- **Role Required**: USER, PARTNER, ADMIN
  - **USER**: Can only access their own bookings (filtered by authenticated user's ID)
  - **PARTNER**: Can access bookings for hotels they own (filtered by hotel ownership)
  - **ADMIN**: Can access all bookings
- **Description**: Retrieves a paginated list of bookings with advanced filtering options. The system automatically filters results based on the user's role to ensure users can only access bookings they are authorized to view.
- **Query Parameters**:
  - `user-id`: string (optional, UUID format) - Filter by user ID. For USER role, this is automatically set to the authenticated user's ID
  - `room-id`: string (optional, UUID format) - Filter by room ID
  - `hotel-id`: string (optional, UUID format) - Filter by hotel ID. For PARTNER role, only hotels they own are accessible
  - `status`: string (optional) - Filter by booking status. Valid values: `pending_payment`, `confirmed`, `checked_in`, `cancelled`, `completed`, `rescheduled` (see [Booking Status Types](#booking-status-types))
  - `check-in-date`: date (optional, ISO format: YYYY-MM-DD) - Filter by check-in date
  - `check-out-date`: date (optional, ISO format: YYYY-MM-DD) - Filter by check-out date
  - `created-from`: datetime (optional, ISO format: YYYY-MM-DDTHH:mm:ss) - Filter bookings created from this datetime (inclusive)
  - `created-to`: datetime (optional, ISO format: YYYY-MM-DDTHH:mm:ss) - Filter bookings created until this datetime (inclusive)
  - `min-price`: number (optional, positive) - Filter by minimum final price
  - `max-price`: number (optional, positive) - Filter by maximum final price
  - `contact-email`: string (optional) - Filter by contact email (partial match)
  - `contact-phone`: string (optional) - Filter by contact phone (partial match)
  - `contact-full-name`: string (optional) - Filter by contact full name (partial match)
  - `page`: integer (optional, default: 0, min: 0) - Page number (0-indexed)
  - `size`: integer (optional, default: 10, min: 1) - Number of items per page
  - `sort-by`: string (optional, default: "created-at") - Field to sort by. Valid values: `created-at`, `check-in-date`, `check-out-date`, `final-price`, `status`
  - `sort-dir`: string (optional, default: "desc") - Sort direction. Valid values: `asc`, `desc`
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string (UUID)",
        "user": {
          "id": "string (UUID)",
          "email": "string",
          "fullName": "string"
        },
        "room": {
          "id": "string (UUID)",
          "name": "string",
          "view": "string",
          "area": "number",
          "maxAdults": "integer",
          "maxChildren": "integer",
          "basePricePerNight": "number",
          "bedType": {
            "id": "string",
            "name": "string"
          }
        },
        "hotel": {
          "id": "string (UUID)",
          "name": "string",
          "address": "string",
          "country": {
            "id": "string",
            "name": "string",
            "code": "string"
          },
          "province": {
            "id": "string",
            "name": "string",
            "code": "string"
          },
          "city": {
            "id": "string",
            "name": "string",
            "code": "string"
          },
          "latitude": "number",
          "longitude": "number",
          "starRating": "integer",
          "status": "string"
        },
        "checkInDate": "date (ISO format: YYYY-MM-DD)",
        "checkOutDate": "date (ISO format: YYYY-MM-DD)",
        "numberOfNights": "integer",
        "numberOfRooms": "integer",
        "numberOfAdults": "integer",
        "numberOfChildren": "integer",
        "priceDetails": {
          "originalPrice": "number",
          "discountAmount": "number",
          "appliedDiscount": {
            "id": "string (UUID)",
            "code": "string",
            "percentage": "number",
            "description": "string"
          },
          "netPriceAfterDiscount": "number",
          "tax": {
            "name": "string",
            "percentage": "number",
            "amount": "number"
          },
          "serviceFee": {
            "name": "string",
            "percentage": "number",
            "amount": "number"
          },
          "finalPrice": "number"
        },
        "contactFullName": "string",
        "contactEmail": "string",
        "contactPhone": "string",
        "status": "string (see [Booking Status Types](#booking-status-types))",
        "paymentUrl": "string (nullable, only present for pending_payment status)",
        "createdAt": "datetime (ISO 8601 format)",
        "expiresAt": "datetime (ISO 8601 format, nullable, only for pending_payment status)",
        "updatedAt": "datetime (ISO 8601 format)"
      }
    ],
    "page": "integer (0-indexed)",
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

- **Notes**:
  - Authorization is enforced at the service layer - users can only see bookings they are authorized to view
  - Multiple filters can be combined for advanced search
  - Date filters support both date and datetime formats
  - Price filters apply to the final price (after discounts and fees)
  - Contact information filters use partial matching (case-insensitive)
  - Results are paginated to handle large datasets efficiently

### 4. Get Booking By ID

**GET** `/bookings/{id}`

- **Role Required**: USER, PARTNER, ADMIN
  - **USER**: Can only access their own bookings
  - **PARTNER**: Can access bookings for hotels they own
  - **ADMIN**: Can access any booking
- **Description**: Retrieves detailed information about a specific booking including user, room, hotel, pricing details, and current status. Authorization is enforced to ensure users can only access bookings they are authorized to view.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Booking ID
- **Response**: Same structure as Create Booking response (BookingResponse) - includes all booking details

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    // ... (same structure as Create Booking response)
  }
}
```

- **Error Responses**:
  - **403 Forbidden**: User does not have permission to access this booking
  - **404 Not Found**: Booking not found

- **Notes**:
  - Authorization is enforced at the service layer
  - Returns complete booking information including pricing breakdown
  - Payment URL is included if booking status is `pending_payment`
  - Expiration time is included for `pending_payment` bookings

### 5. Cancel Booking

**POST** `/bookings/{id}/cancel`

- **Role Required**: USER, PARTNER, ADMIN
  - **USER**: Can only cancel their own bookings
  - **PARTNER**: Can cancel bookings for hotels they own
  - **ADMIN**: Can cancel any booking
- **Description**: Cancels a booking. Cancellation fees are calculated based on the hotel's cancellation policy and the number of days before check-in. Refunds are processed according to the cancellation rules. The booking status is updated to `cancelled`.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Booking ID to cancel
- **Response**: Same structure as Create Booking response - returns the cancelled booking with updated status

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    // ... (same structure as Create Booking response)
    "status": "string (updated to 'cancelled')",
    "priceDetails": {
      // ... (includes cancellation fee information if applicable)
    }
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Booking cannot be cancelled (e.g., already checked in, already cancelled, or too close to check-in date)
  - **404 Not Found**: Booking not found

- **Notes**:
  - Only bookings with status `pending_payment`, `confirmed`, or `rescheduled` can be cancelled
  - Cancellation fees are calculated based on the hotel's cancellation policy
  - The cancellation fee percentage depends on how many days before check-in the cancellation occurs
  - Refunds are processed automatically (refund amount = original price - cancellation fee)
  - Room inventories are released back to available status
  - The booking status is updated to `cancelled` after successful cancellation

### 6. Reschedule Booking

**POST** `/bookings/{id}/reschedule`

- **Content-Type**: `application/json`
- **Role Required**: USER, PARTNER, ADMIN
  - **USER**: Can only reschedule their own bookings
  - **PARTNER**: Can reschedule bookings for hotels they own
  - **ADMIN**: Can reschedule any booking
- **Description**: Reschedules a booking to new check-in and check-out dates. The system calculates price differences, applies reschedule fees based on the hotel's reschedule policy, and generates a new payment URL if additional payment is required. The booking status is updated to `rescheduled` and may require payment if the new price is higher.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Booking ID to reschedule
- **Request Body**:

```json
{
  "newCheckInDate": "date (required, ISO format: YYYY-MM-DD) - New check-in date (must be today or future date)",
  "newCheckOutDate": "date (required, ISO format: YYYY-MM-DD) - New check-out date (must be after newCheckInDate)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "user": {
      "id": "string (UUID)",
      "email": "string",
      "fullName": "string"
    },
    "room": {
      "id": "string (UUID)",
      "name": "string",
      "view": "string",
      "area": "number",
      "maxAdults": "integer",
      "maxChildren": "integer",
      "basePricePerNight": "number",
      "bedType": {
        "id": "string",
        "name": "string"
      },
      "pricesByDateRange": [
        {
          "date": "date (ISO format: YYYY-MM-DD)",
          "price": "number"
        }
      ]
    },
    "hotel": {
      "id": "string (UUID)",
      "name": "string",
      "address": "string",
      "country": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "province": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "city": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "latitude": "number",
      "longitude": "number",
      "starRating": "integer",
      "status": "string"
    },
    "oldCheckInDate": "date (ISO format: YYYY-MM-DD) - Original check-in date",
    "oldCheckOutDate": "date (ISO format: YYYY-MM-DD) - Original check-out date",
    "oldNumberOfNights": "integer - Original number of nights",
    "oldPriceDetails": {
      "originalPrice": "number",
      "discountAmount": "number",
      "appliedDiscount": {
        "id": "string (UUID)",
        "code": "string",
        "percentage": "number",
        "description": "string"
      },
      "netPriceAfterDiscount": "number",
      "tax": {
        "name": "string",
        "percentage": "number",
        "amount": "number"
      },
      "serviceFee": {
        "name": "string",
        "percentage": "number",
        "amount": "number"
      },
      "finalPrice": "number"
    },
    "newCheckInDate": "date (ISO format: YYYY-MM-DD) - New check-in date",
    "newCheckOutDate": "date (ISO format: YYYY-MM-DD) - New check-out date",
    "newNumberOfNights": "integer - New number of nights",
    "newPriceDetails": {
      "originalPrice": "number",
      "discountAmount": "number",
      "appliedDiscount": {
        "id": "string (UUID)",
        "code": "string",
        "percentage": "number",
        "description": "string"
      },
      "netPriceAfterDiscount": "number",
      "tax": {
        "name": "string",
        "percentage": "number",
        "amount": "number"
      },
      "serviceFee": {
        "name": "string",
        "percentage": "number",
        "amount": "number"
      },
      "finalPrice": "number"
    },
    "numberOfRooms": "integer",
    "numberOfAdults": "integer",
    "numberOfChildren": "integer",
    "contactFullName": "string",
    "contactEmail": "string",
    "contactPhone": "string",
    "status": "string (updated to 'rescheduled', see [Booking Status Types](#booking-status-types))",
    "rescheduleFee": "number (fee charged for rescheduling, calculated based on reschedule policy)",
    "priceDifference": "number (positive = customer pays more, negative = refund, zero = no change)",
    "paymentUrl": "string (nullable, VNPay payment URL if additional payment is required, null if refund or no change)",
    "createdAt": "datetime (ISO 8601 format)",
    "updatedAt": "datetime (ISO 8601 format)"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid date range, booking cannot be rescheduled (e.g., already checked in, cancelled, or too close to check-in), insufficient room availability for new dates, or validation errors
  - **404 Not Found**: Booking not found
  - **409 Conflict**: Room not available for the new dates

- **Notes**:
  - Only bookings with status `confirmed` can be rescheduled
  - The reschedule fee is calculated based on the hotel's reschedule policy and the number of days before the original check-in date
  - If the new price is higher than the old price plus reschedule fee, a payment URL is generated
  - If the new price is lower, a refund may be processed (implementation depends on payment gateway)
  - Room availability is checked for the new dates
  - The original booking dates and prices are preserved in the response for reference
  - The booking status is updated to `rescheduled` after successful rescheduling
  - Reschedule policies may have restrictions (e.g., cannot reschedule within X days of check-in)

### 7. Check In

**POST** `/bookings/{id}/check-in`

- **Role Required**: USER, PARTNER, ADMIN
  - **USER**: Can check in their own bookings
  - **PARTNER**: Can check in bookings for hotels they own
  - **ADMIN**: Can check in any booking
- **Description**: Marks a booking as checked in. The booking status is updated from `confirmed` to `checked_in`. This endpoint is typically called when guests arrive at the hotel.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Booking ID to check in
- **Response**: Same structure as Create Booking response - returns the booking with updated status

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    // ... (same structure as Create Booking response)
    "status": "string (updated to 'checked_in')"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Booking cannot be checked in (e.g., not confirmed, already checked in, check-in date has not arrived, or booking is cancelled)
  - **404 Not Found**: Booking not found

- **Notes**:
  - Only bookings with status `confirmed` can be checked in
  - The check-in date should typically match or be before the current date
  - After check-in, the booking status changes to `checked_in`
  - Room inventories remain marked as booked during the stay

### 8. Check Out

**POST** `/bookings/{id}/check-out`

- **Role Required**: USER, PARTNER, ADMIN
  - **USER**: Can check out their own bookings
  - **PARTNER**: Can check out bookings for hotels they own
  - **ADMIN**: Can check out any booking
- **Description**: Marks a booking as checked out and completed. The booking status is updated from `checked_in` to `completed`. Room inventories are released for future dates. This endpoint is typically called when guests leave the hotel.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Booking ID to check out
- **Response**: Same structure as Create Booking response - returns the booking with updated status

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    // ... (same structure as Create Booking response)
    "status": "string (updated to 'completed')"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Booking cannot be checked out (e.g., not checked in, already completed, or booking is cancelled)
  - **404 Not Found**: Booking not found

- **Notes**:
  - Only bookings with status `checked_in` can be checked out
  - The check-out date should typically match or be after the current date
  - After check-out, the booking status changes to `completed`
  - Room inventories are released for dates after the check-out date
  - Completed bookings can be reviewed by users

### 9. Delete Booking

**DELETE** `/bookings/{id}`

- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can delete bookings for hotels they own
  - **ADMIN**: Can delete any booking
- **Description**: Permanently deletes a booking from the system. This is a destructive operation that should only be used for administrative purposes. The booking and all associated data are removed. This operation is irreversible.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Booking ID to delete
- **Response**: Same structure as Create Booking response - returns the deleted booking data

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    // ... (same structure as Create Booking response)
  }
}
```

- **Error Responses**:
  - **404 Not Found**: Booking not found
  - **403 Forbidden**: User does not have permission to delete this booking (for PARTNER role, must own the hotel)

- **Notes**:
  - This is a destructive operation and cannot be undone
  - Consider using Cancel Booking instead if you want to cancel a booking while preserving the record
  - Deletion may cascade to related entities (reviews, payments, etc.) depending on database constraints
  - Room inventories are released when a booking is deleted
  - This endpoint should be used sparingly and only for administrative purposes

---

## Reviews

### 1. Create Review

**POST** `/reviews`

- **Content-Type**: `multipart/form-data`
- **Role Required**: USER, PARTNER, ADMIN
- **Description**: Creates a review for a completed booking. Users can only review bookings they made and that have been completed. Reviews include a score (1-10), optional comment, and optional photos. Each booking can only have one review.
- **Request Body** (form-data):
  - `bookingId`: string (required, not blank, UUID format) - ID of the completed booking to review
  - `score`: integer (required, 1-10) - Rating score (1 = worst, 10 = best)
  - `comment`: string (optional) - Review comment/feedback
  - `photos`: File[] (optional) - Image files to attach to the review. Each photo requires a `categoryId`. Format: `photos[0].files=file1&photos[0].categoryId=cat1&photos[1].files=file2&photos[1].categoryId=cat2`
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "user": {
      "id": "string (UUID)",
      "email": "string",
      "fullName": "string",
      "avatarUrl": "string (nullable)"
    },
    "hotel": {
      "id": "string (UUID)",
      "name": "string",
      "address": "string",
      "country": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "province": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "city": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "latitude": "number",
      "longitude": "number",
      "starRating": "integer",
      "status": "string"
    },
    "booking": {
      "id": "string (UUID)",
      "checkInDate": "date (ISO format: YYYY-MM-DD)",
      "checkOutDate": "date (ISO format: YYYY-MM-DD)",
      "numberOfNights": "integer",
      "numberOfRooms": "integer",
      "numberOfAdults": "integer",
      "numberOfChildren": "integer"
    },
    "score": "integer (1-10)",
    "comment": "string (nullable)",
    "photos": [
      {
        "id": "string (UUID)",
        "url": "string"
      }
    ],
    "createdAt": "datetime (ISO 8601 format)",
    "updatedAt": "datetime (ISO 8601 format)"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Booking not completed, booking already has a review, invalid score, or validation errors
  - **403 Forbidden**: User cannot review this booking (not the booking owner)
  - **404 Not Found**: Booking not found

- **Notes**:
  - Only completed bookings can be reviewed
  - Users can only review bookings they made
  - Each booking can only have one review
  - The score must be between 1 and 10
  - Photos are optional but can enhance the review
  - Photo uploads require specifying the photo category ID for each file
  - Reviews are publicly visible and help other users make booking decisions

### 2. Get All Reviews

**GET** `/reviews`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a paginated list of reviews with filtering options. Reviews are publicly visible to help users make informed booking decisions. Results can be filtered by hotel, user, booking, or score range.
- **Query Parameters**:
  - `hotel-id`: string (optional, UUID format) - Filter reviews by hotel ID
  - `user-id`: string (optional, UUID format) - Filter reviews by user ID (to see all reviews by a specific user)
  - `booking-id`: string (optional, UUID format) - Filter by booking ID (each booking has at most one review)
  - `min-score`: integer (optional, 1-10) - Filter by minimum score
  - `max-score`: integer (optional, 1-10) - Filter by maximum score
  - `page`: integer (optional, default: 0, min: 0) - Page number (0-indexed)
  - `size`: integer (optional, default: 10, min: 1) - Number of items per page
  - `sort-by`: string (optional, default: "created-at") - Field to sort by. Valid values: `created-at`, `score`
  - `sort-dir`: string (optional, default: "desc") - Sort direction. Valid values: `asc`, `desc`
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string (UUID)",
        "score": "integer (1-10)",
        "comment": "string (nullable)",
        "photos": [
          {
            "id": "string (UUID)",
            "url": "string"
          }
        ],
        "createdAt": "datetime (ISO 8601 format)",
        "updatedAt": "datetime (ISO 8601 format)"
      }
    ],
    "page": "integer (0-indexed)",
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

- **Notes**:
  - Reviews are publicly visible to help users make booking decisions
  - Filtering by hotel-id is useful for displaying reviews on hotel detail pages
  - Score filters allow users to see only positive or negative reviews
  - Results are paginated to handle large datasets efficiently
  - The response does not include user information in the list view (only in detail view)

### 3. Get Review By ID

**GET** `/reviews/{id}`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves detailed information about a specific review including user information, hotel details, booking information, and all photos.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Review ID
- **Response**: Same structure as Create Review response (ReviewDetailsResponse) - includes full user, hotel, and booking information

### 4. Update Review

**PUT** `/reviews/{id}`

- **Content-Type**: `multipart/form-data`
- **Role Required**: USER, PARTNER, ADMIN
  - **USER**: Can only update their own reviews
  - **PARTNER**: Can update reviews for hotels they own
  - **ADMIN**: Can update any review
- **Description**: Updates an existing review. Supports partial updates - only provided fields will be updated. Can add or remove photos. Users can modify their review score, comment, or photos.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Review ID to update
- **Request Body** (form-data, all fields optional):
  - `score`: integer (optional, 1-10) - Updated rating score
  - `comment`: string (optional) - Updated review comment
  - `photosToAdd`: File[] (optional) - Image files to add. Each photo requires a `categoryId`. Format: `photosToAdd[0].files=file1&photosToAdd[0].categoryId=cat1`
  - `photoIdsToDelete`: JSON array (optional) - Array of photo IDs to remove. Format: `["id1", "id2"]`
- **Response**: Same structure as Create Review response (ReviewDetailsResponse)
- **Error Responses**:
  - **403 Forbidden**: User does not have permission to update this review
  - **404 Not Found**: Review not found

- **Notes**:
  - Only the review owner can update their review (unless ADMIN or PARTNER)
  - All fields are optional - only provided fields will be updated
  - Photo uploads require specifying the photo category ID for each file
  - Removed photos are permanently deleted from storage

### 5. Delete Review

**DELETE** `/reviews/{id}`

- **Role Required**: USER, PARTNER, ADMIN
  - **USER**: Can only delete their own reviews
  - **PARTNER**: Can delete reviews for hotels they own
  - **ADMIN**: Can delete any review
- **Description**: Permanently deletes a review from the system. This operation is irreversible. All associated photos are also deleted.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Review ID to delete
- **Response**: Same structure as Create Review response (ReviewDetailsResponse) - returns the deleted review data
- **Error Responses**:
  - **403 Forbidden**: User does not have permission to delete this review
  - **404 Not Found**: Review not found

- **Notes**:
  - This is a destructive operation and cannot be undone
  - All photos associated with the review are also deleted
  - The review is removed from hotel statistics and ratings calculations
  - Consider using Update Review to modify content instead of deleting

---

## Payment

### 1. VNPay Callback

**GET** `/payment/callback`

- **Role Required**: Public (no authentication required)
- **Description**: Handles the callback from VNPay payment gateway after a payment transaction. This endpoint processes the payment result, updates the booking status accordingly, and redirects the user to the frontend with payment status information. VNPay calls this endpoint automatically after payment processing.
- **Query Parameters**: All VNPay callback parameters (handled automatically by VNPay):
  - `vnp_Amount`: string - Payment amount
  - `vnp_BankCode`: string - Bank code used for payment
  - `vnp_BankTranNo`: string - Bank transaction number
  - `vnp_CardType`: string - Card type
  - `vnp_OrderInfo`: string - Order information (contains booking ID)
  - `vnp_PayDate`: string - Payment date
  - `vnp_ResponseCode`: string - Response code (00 = success, other = failure)
  - `vnp_TmnCode`: string - VNPay terminal code
  - `vnp_TransactionNo`: string - VNPay transaction number
  - `vnp_TransactionStatus`: string - Transaction status
  - `vnp_TxnRef`: string - Transaction reference (booking ID)
  - `vnp_SecureHash`: string - Secure hash for verification
- **Response**: HTTP 302 Redirect to frontend URL with payment status

**Redirect URLs**:
- **Success**: `{frontendUrl}/payment/success?bookingId={bookingId}&transactionNo={transactionNo}`
- **Failure**: `{frontendUrl}/payment/failure?bookingId={bookingId}&error={errorMessage}`

- **Notes**:
  - This endpoint is called automatically by VNPay after payment processing
  - The system verifies the payment signature using the secure hash
  - If payment is successful (response code = 00), the booking status is updated to `confirmed`
  - If payment fails, the booking remains in `pending_payment` status
  - The user is redirected to the frontend with payment status information
  - The frontend URL is configured in application properties
  - This endpoint does not require authentication as it's called by VNPay's servers
  - Payment verification includes checking the transaction amount matches the booking amount
  - Duplicate payment callbacks are handled to prevent double processing

---

## Accommodation - Hotels

### 1. Create Hotel

**POST** `/accommodation/hotels`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new hotel. Only administrators can create hotels. Partners cannot create hotels directly; they must be assigned by administrators.
- **Request Body**:

```json
{
  "name": "string (required, not blank)",
  "description": "string (required, not blank)",
  "address": "string (required, not blank)",
  "countryId": "string (required, not blank, UUID format)",
  "provinceId": "string (required, not blank, UUID format)",
  "cityId": "string (required, not blank, UUID format)",
  "districtId": "string (required, not blank, UUID format)",
  "wardId": "string (required, not blank, UUID format)",
  "streetId": "string (required, not blank, UUID format)",
  "partnerId": "string (required, not blank, UUID format)",
  "commissionRate": "number (optional, 0.0-100.0)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "description": "string",
    "address": "string",
    "country": {
      "id": "string",
      "name": "string",
      "code": "string"
    },
    "province": {
      "id": "string",
      "name": "string",
      "code": "string"
    },
    "city": {
      "id": "string",
      "name": "string",
      "code": "string"
    },
    "district": {
      "id": "string",
      "name": "string",
      "code": "string"
    },
    "ward": {
      "id": "string",
      "name": "string",
      "code": "string"
    },
    "street": {
      "id": "string",
      "name": "string",
      "code": "string"
    },
    "entertainmentVenues": [
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
            "description": "string",
            "distance": "number"
          }
        ]
      }
    ],
    "photos": [
      {
        "category": {
          "id": "string",
          "name": "string"
        },
        "photos": [
          {
            "id": "string",
            "url": "string"
          }
        ]
      }
    ],
    "amenities": [
      {
        "category": {
          "id": "string",
          "name": "string",
          "description": "string"
        },
        "amenities": [
          {
            "id": "string",
            "name": "string",
            "free": boolean
          }
        ]
      }
    ],
    "policy": {
      "cancellationPolicyId": "string",
      "reschedulePolicyId": "string"
    },
    "partner": {
      "id": "string",
      "email": "string",
      "fullName": "string"
    },
    "latitude": "number",
    "longitude": "number",
    "starRating": "integer (0-5)",
    "status": "string (see [Accommodation Status Types](#accommodation-status-types))",
    "commissionRate": "number",
    "createdAt": "datetime (ISO 8601)",
    "updatedAt": "datetime (ISO 8601)"
  }
}
```

### 2. Get All Hotels

**GET** `/accommodation/hotels`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a paginated list of hotels with filtering and sorting options. Supports advanced filtering by location, amenities, availability dates, guest requirements, and price range. When `checkin-date` and `checkout-date` are provided along with guest requirements, the system filters hotels that have available rooms matching the criteria.
- **Query Parameters**:
  - `name`: string (optional) - Filter by hotel name (partial match)
  - `country-id`: string (optional, UUID format) - Filter by country ID
  - `province-id`: string (optional, UUID format) - Filter by province ID
  - `city-id`: string (optional, UUID format) - Filter by city ID
  - `district-id`: string (optional, UUID format) - Filter by district ID
  - `ward-id`: string (optional, UUID format) - Filter by ward ID
  - `street-id`: string (optional, UUID format) - Filter by street ID
  - `star-rating`: integer (optional, 0-5) - Filter by star rating
  - `amenity-ids`: string[] (optional, array of UUIDs) - Filter hotels that have ALL specified amenities. Multiple amenity IDs can be provided as separate query parameters: `amenity-ids=id1&amenity-ids=id2`
  - `status`: string (optional) - Filter by status. Valid values: `active`, `inactive`, `maintenance`, `closed` (see [Accommodation Status Types](#accommodation-status-types))
  - `partner-id`: string (optional, UUID format) - Filter hotels by partner/owner ID
  - `checkin-date`: date (optional, ISO format: YYYY-MM-DD) - Check-in date for availability filtering. Must be used with `checkout-date`
  - `checkout-date`: date (optional, ISO format: YYYY-MM-DD) - Check-out date for availability filtering. Must be used with `checkin-date`
  - `required-adults`: integer (optional, positive) - Number of adults required. Used with `checkin-date` and `checkout-date` to filter hotels with available rooms that can accommodate this number of adults
  - `required-children`: integer (optional, min: 0) - Number of children required. Used with `checkin-date` and `checkout-date` to filter hotels with available rooms that can accommodate this number of children
  - `required-rooms`: integer (optional, positive) - Number of rooms required. Used with `checkin-date` and `checkout-date` to filter hotels with sufficient available rooms
  - `min-price`: number (optional, positive) - Minimum price per night filter
  - `max-price`: number (optional, positive) - Maximum price per night filter
  - `page`: integer (optional, default: 0, min: 0) - Page number (0-indexed)
  - `size`: integer (optional, default: 10, min: 1) - Number of items per page
  - `sort-by`: string (optional, default: "created-at") - Field to sort by. Valid values: `created-at`, `name`, `star-rating`, `status`
  - `sort-dir`: string (optional, default: "asc") - Sort direction. Valid values: `asc`, `desc`
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string (UUID)",
        "name": "string",
        "description": "string",
        "address": "string",
        "country": {
          "id": "string",
          "name": "string",
          "code": "string"
        },
        "province": {
          "id": "string",
          "name": "string",
          "code": "string"
        },
        "city": {
          "id": "string",
          "name": "string",
          "code": "string"
        },
        "district": {
          "id": "string",
          "name": "string",
          "code": "string"
        },
        "ward": {
          "id": "string",
          "name": "string",
          "code": "string"
        },
        "street": {
          "id": "string",
          "name": "string",
          "code": "string"
        },
        "photos": [
          {
            "category": {
              "id": "string",
              "name": "string"
            },
            "photos": [
              {
                "id": "string",
                "url": "string"
              }
            ]
          }
        ],
        "latitude": "number",
        "longitude": "number",
        "starRating": "integer (0-5)",
        "policy": {
          "cancellationPolicyId": "string",
          "reschedulePolicyId": "string"
        },
        "status": "string (see [Accommodation Status Types](#accommodation-status-types))",
        "commissionRate": "number",
        "rawPricePerNight": "number (lowest base price from all rooms)",
        "currentPricePerNight": "number (lowest current price from available room inventories)",
        "availableRooms": "integer (number of available rooms today)",
        "createdAt": "datetime (ISO 8601)",
        "updatedAt": "datetime (ISO 8601)"
      }
    ],
    "page": "integer (0-indexed)",
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

- **Notes**:
  - When filtering by availability dates (`checkin-date`, `checkout-date`), the system checks room inventories to ensure hotels have available rooms for the specified dates
  - Price filters (`min-price`, `max-price`) apply to the current price per night (from room inventories), not the base price
  - The `rawPricePerNight` field shows the lowest base price from all rooms in the hotel
  - The `currentPricePerNight` field shows the lowest current price from available room inventories (may differ from base price due to dynamic pricing)
  - The `availableRooms` field shows the number of available rooms for today's date

### 3. Get Hotel By ID

**GET** `/accommodation/hotels/{id}`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves detailed information about a specific hotel including all amenities, photos, entertainment venues, policies, and partner information.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Hotel ID
- **Response**: Same structure as Create Hotel response (HotelDetailsResponse)

### 4. Update Hotel

**PUT** `/accommodation/hotels/{id}`

- **Content-Type**: `multipart/form-data`
- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can only update hotels they own (ownership is validated in service layer)
  - **ADMIN**: Can update any hotel
- **Description**: Updates hotel information. Supports partial updates - only provided fields will be updated. Can add/remove photos, amenities, and entertainment venues. Can update location, coordinates, and policies.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Hotel ID
- **Request Body** (form-data, all fields optional):
  - `name`: string (optional) - Hotel name
  - `description`: string (optional) - Hotel description
  - `address`: string (optional) - Hotel address
  - `countryId`: string (optional, UUID format) - Country ID
  - `provinceId`: string (optional, UUID format) - Province ID
  - `cityId`: string (optional, UUID format) - City ID
  - `districtId`: string (optional, UUID format) - District ID
  - `wardId`: string (optional, UUID format) - Ward ID
  - `streetId`: string (optional, UUID format) - Street ID
  - `latitude`: number (optional, -90.0 to 90.0) - Latitude coordinate
  - `longitude`: number (optional, -180.0 to 180.0) - Longitude coordinate
  - `status`: string (optional) - Hotel status. Valid values: `active`, `inactive`, `maintenance`, `closed` (see [Accommodation Status Types](#accommodation-status-types))
  - `commissionRate`: number (optional, 0.0-100.0) - Commission rate percentage
  - `entertainmentVenuesToAdd`: JSON array (optional) - Array of entertainment venue objects to add. Format: `[{"name": "string", "address": "string", "description": "string", "categoryId": "string"}]`
  - `entertainmentVenuesWithDistanceToAdd`: JSON array (optional) - Array of entertainment venues with distance to add. Format: `[{"entertainmentVenueId": "string", "distance": "number"}]`
  - `entertainmentVenuesWithDistanceToUpdate`: JSON array (optional) - Array of entertainment venues with distance to update. Format: `[{"entertainmentVenueId": "string", "distance": "number"}]`
  - `entertainmentVenueIdsToRemove`: JSON array (optional) - Array of entertainment venue IDs to remove. Format: `["id1", "id2"]`
  - `photosToAdd`: File[] (optional) - Image files to add. Each file requires a `categoryId` field. Format: `photosToAdd[0].files=file1&photosToAdd[0].categoryId=cat1&photosToAdd[1].files=file2&photosToAdd[1].categoryId=cat2`
  - `photoIdsToDelete`: JSON array (optional) - Array of photo IDs to delete. Format: `["id1", "id2"]`
  - `amenityIdsToAdd`: JSON array (optional) - Array of amenity IDs to add. Format: `["id1", "id2"]`
  - `amenityIdsToRemove`: JSON array (optional) - Array of amenity IDs to remove. Format: `["id1", "id2"]`
  - `policy`: JSON object (optional) - Policy object. Format: `{"cancellationPolicyId": "string", "reschedulePolicyId": "string"}`
- **Response**: Same structure as Create Hotel response (HotelDetailsResponse)
- **Notes**:
  - When updating location fields (countryId, provinceId, etc.), all location fields should typically be updated together to maintain consistency
  - Photo uploads require specifying the photo category ID for each file
  - Entertainment venues can be added as new venues or linked to existing venues with distance information
  - The system validates hotel ownership for PARTNER role before allowing updates

### 5. Delete Hotel

**DELETE** `/accommodation/hotels/{id}`

- **Role Required**: ADMIN (only administrators can delete hotels)
- **Description**: Permanently deletes a hotel and all associated data (rooms, inventories, bookings, etc.). This operation is irreversible.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Hotel ID
- **Response**: Same structure as Create Hotel response (HotelDetailsResponse) - returns the deleted hotel data
- **Notes**:
  - This is a destructive operation. Consider setting hotel status to `inactive` or `closed` instead of deleting
  - Deletion may cascade to related entities depending on database constraints

---

## Accommodation - Rooms

### 1. Create Room

**POST** `/accommodation/rooms`

- **Content-Type**: `multipart/form-data`
- **Role Required**: PARTNER, ADMIN
- **Description**: Creates a new room for a hotel. Partners can only create rooms for hotels they own. The room will be created with the specified quantity, and room inventories should be created separately using the room inventory endpoints.
- **Request Body** (form-data):
  - `hotelId`: string (required, UUID format) - ID of the hotel this room belongs to
  - `name`: string (required, not blank) - Room name (e.g., "Deluxe Double Room")
  - `view`: string (required, not blank) - Room view description (e.g., "Ocean View", "City View", "Garden View")
  - `area`: number (required, positive) - Room area in square meters
  - `photos`: File[] (required, at least 1 image file) - Room photos. Each photo requires a `categoryId`. Format: `photos[0].files=file1&photos[0].categoryId=cat1&photos[1].files=file2&photos[1].categoryId=cat2`
  - `maxAdults`: integer (required, positive) - Maximum number of adults the room can accommodate
  - `maxChildren`: integer (required, min: 0) - Maximum number of children the room can accommodate
  - `basePricePerNight`: number (required, positive) - Base price per night for this room
  - `bedTypeId`: string (required, UUID format) - Bed type ID (e.g., "King", "Queen", "Twin")
  - `smokingAllowed`: boolean (optional, default: false) - Whether smoking is allowed in the room
  - `wifiAvailable`: boolean (optional, default: false) - Whether WiFi is available in the room
  - `breakfastIncluded`: boolean (optional, default: false) - Whether breakfast is included
  - `quantity`: integer (required, positive) - Total number of rooms of this type available in the hotel
  - `amenityIds`: string[] (required, array of UUIDs, at least 1) - Array of amenity IDs associated with this room. Format: `amenityIds=id1&amenityIds=id2`
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "hotel": {
      "id": "string",
      "name": "string",
      "address": "string",
      "country": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "province": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "city": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "district": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "ward": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "street": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "latitude": "number",
      "longitude": "number",
      "starRating": "integer",
      "status": "string"
    },
    "view": "string",
    "area": "number",
    "photos": [
      {
        "category": {
          "id": "string",
          "name": "string"
        },
        "photos": [
          {
            "id": "string",
            "url": "string"
          }
        ]
      }
    ],
    "maxAdults": "integer",
    "maxChildren": "integer",
    "basePricePerNight": "number",
    "currentPricePerNight": "number (current price from room inventory, or base price if no inventory)",
    "availableRooms": "integer (number of available rooms today)",
    "totalRooms": "integer (same as quantity)",
    "bedType": {
      "id": "string",
      "name": "string"
    },
    "cancellationPolicy": {
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
    },
    "reschedulePolicy": {
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
    },
    "smokingAllowed": boolean,
    "wifiAvailable": boolean,
    "breakfastIncluded": boolean,
    "status": "string (see [Accommodation Status Types](#accommodation-status-types))",
    "amenities": [
      {
        "category": {
          "id": "string",
          "name": "string",
          "description": "string"
        },
        "amenities": [
          {
            "id": "string",
            "name": "string",
            "free": boolean
          }
        ]
      }
    ],
    "createdAt": "datetime (ISO 8601)",
    "updatedAt": "datetime (ISO 8601)"
  }
}
```

- **Notes**:
  - After creating a room, you should create room inventories for specific dates using the room inventory endpoints
  - The `quantity` field determines how many physical rooms of this type exist in the hotel
  - Room photos must include a category ID for proper organization
  - The room will be created with default status (typically `active`)

### 2. Get All Rooms By Hotel

**GET** `/accommodation/rooms`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a paginated list of rooms for a specific hotel. Returns room information including photos, pricing, availability, and amenities.
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format) - Hotel ID to filter rooms
  - `status`: string (optional) - Filter by room status. Valid values: `active`, `inactive`, `maintenance`, `closed` (see [Accommodation Status Types](#accommodation-status-types))
  - `page`: integer (optional, default: 0, min: 0) - Page number (0-indexed)
  - `size`: integer (optional, default: 10, min: 1) - Number of items per page
  - `sort-by`: string (optional) - Field to sort by. If not specified, uses default sorting
  - `sort-dir`: string (optional, default: "asc") - Sort direction. Valid values: `asc`, `desc`
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string (UUID)",
        "name": "string",
        "view": "string",
        "area": "number",
        "photos": [
          {
            "category": {
              "id": "string",
              "name": "string"
            },
            "photos": [
              {
                "id": "string",
                "url": "string"
              }
            ]
          }
        ],
        "maxAdults": "integer",
        "maxChildren": "integer",
        "basePricePerNight": "number",
        "currentPricePerNight": "number (current price from room inventory, or base price if no inventory)",
        "availableRooms": "integer (number of available rooms today)",
        "totalRooms": "integer",
        "bedType": {
          "id": "string",
          "name": "string"
        },
        "cancellationPolicy": {
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
        },
        "reschedulePolicy": {
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
        },
        "smokingAllowed": boolean,
        "wifiAvailable": boolean,
        "breakfastIncluded": boolean,
        "status": "string (see [Accommodation Status Types](#accommodation-status-types))",
        "amenities": [
          {
            "category": {
              "id": "string",
              "name": "string",
              "description": "string"
            },
            "amenities": [
              {
                "id": "string",
                "name": "string",
                "free": boolean
              }
            ]
          }
        ],
        "createdAt": "datetime (ISO 8601)",
        "updatedAt": "datetime (ISO 8601)"
      }
    ],
    "page": "integer (0-indexed)",
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

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves detailed information about a specific room including all photos, amenities, policies, and hotel information.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Room ID
- **Response**: Same structure as Create Room response (RoomDetailsResponse)

### 4. Update Room

**PUT** `/accommodation/rooms/{id}`

- **Content-Type**: `multipart/form-data`
- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can only update rooms in hotels they own (ownership is validated in service layer)
  - **ADMIN**: Can update any room
- **Description**: Updates room information. Supports partial updates - only provided fields will be updated. Can add/remove photos and amenities. Can update pricing, capacity, and policies.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Room ID
- **Request Body** (form-data, all fields optional):
  - `name`: string (optional) - Room name
  - `view`: string (optional) - Room view description
  - `area`: number (optional, positive) - Room area in square meters
  - `photosToAdd`: File[] (optional) - Image files to add. Each file requires a `categoryId`. Format: `photosToAdd[0].files=file1&photosToAdd[0].categoryId=cat1`
  - `photoIdsToDelete`: JSON array (optional) - Array of photo IDs to delete. Format: `["id1", "id2"]`
  - `maxAdults`: integer (optional, positive) - Maximum number of adults
  - `maxChildren`: integer (optional, min: 0) - Maximum number of children
  - `basePricePerNight`: number (optional, positive) - Base price per night
  - `bedTypeId`: string (optional, UUID format) - Bed type ID
  - `smokingAllowed`: boolean (optional) - Whether smoking is allowed
  - `wifiAvailable`: boolean (optional) - Whether WiFi is available
  - `breakfastIncluded`: boolean (optional) - Whether breakfast is included
  - `quantity`: integer (optional, positive) - Total number of rooms of this type
  - `amenityIdsToAdd`: JSON array (optional) - Array of amenity IDs to add. Format: `["id1", "id2"]`
  - `amenityIdsToRemove`: JSON array (optional) - Array of amenity IDs to remove. Format: `["id1", "id2"]`
  - `cancellationPolicyId`: string (optional, UUID format) - Cancellation policy ID
  - `reschedulePolicyId`: string (optional, UUID format) - Reschedule policy ID
  - `status`: string (optional) - Room status. Valid values: `active`, `inactive`, `maintenance`, `closed` (see [Accommodation Status Types](#accommodation-status-types))
- **Response**: Same structure as Create Room response (RoomDetailsResponse)
- **Notes**:
  - Updating `basePricePerNight` does not automatically update existing room inventories. Room inventories maintain their own prices
  - Updating `quantity` affects the total number of rooms but does not automatically create or delete room inventories
  - Photo uploads require specifying the photo category ID for each file

### 5. Delete Room

**DELETE** `/accommodation/rooms/{id}`

- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can only delete rooms in hotels they own (ownership is validated in service layer)
  - **ADMIN**: Can delete any room
- **Description**: Permanently deletes a room and all associated data (room inventories, etc.). This operation is irreversible.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Room ID
- **Response**: Same structure as Create Room response (RoomDetailsResponse) - returns the deleted room data
- **Notes**:
  - This is a destructive operation. Consider setting room status to `inactive` or `maintenance` instead of deleting
  - Deletion may affect existing bookings if the room has active bookings
  - All room inventories for this room will also be deleted

---

## Accommodation - Room Inventories

### 1. Get Room Inventories

**GET** `/accommodation/rooms/inventories`

- **Role Required**: ADMIN, PARTNER
  - **PARTNER**: Can only access inventories for rooms in hotels they own (ownership is validated in service layer)
  - **ADMIN**: Can access inventories for any room
- **Description**: Retrieves a paginated list of room inventories for a specific room within a date range. Room inventories represent the availability, pricing, and status of rooms for specific dates. This is used to manage dynamic pricing and availability.
- **Query Parameters**:
  - `room-id`: string (required, UUID format) - Room ID to get inventories for
  - `start-date`: date (required, ISO format: YYYY-MM-DD) - Start date of the date range (inclusive)
  - `end-date`: date (required, ISO format: YYYY-MM-DD) - End date of the date range (inclusive). Must be greater than or equal to `start-date`
  - `status`: string (optional) - Filter by inventory status. Valid values: `available`, `unavailable`, `maintenance`, `booked` (see [Room Inventory Status Types](#room-inventory-status-types))
  - `page`: integer (optional, default: 0, min: 0) - Page number (0-indexed)
  - `size`: integer (optional, default: 10, min: 1) - Number of items per page
  - `sort-by`: string (optional) - Field to sort by. If not specified, defaults to sorting by date in ascending order. Valid values: `date`, `price`, `availableRooms`, `status`
  - `sort-dir`: string (optional, default: "asc") - Sort direction. Valid values: `asc`, `desc`
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "roomId": "string (UUID)",
        "date": "date (ISO format: YYYY-MM-DD)",
        "price": "number (price per night for this date)",
        "availableRooms": "integer (number of available rooms for this date)",
        "status": "string (see [Room Inventory Status Types](#room-inventory-status-types))"
      }
    ],
    "page": "integer (0-indexed)",
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

- **Notes**:
  - Each inventory entry represents one day's availability and pricing for the room
  - The `price` field can differ from the room's `basePricePerNight` to support dynamic pricing
  - The `availableRooms` field shows how many rooms are available for booking on that specific date
  - If no inventory exists for a date within the range, that date will not appear in the results
  - The date range should typically be limited to a reasonable period (e.g., 1-3 months) for performance

### 2. Create Room Inventory

**POST** `/accommodation/rooms/inventories`

- **Content-Type**: `application/json`
- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can only create inventories for rooms in hotels they own (ownership is validated in service layer)
  - **ADMIN**: Can create inventories for any room
- **Description**: Creates room inventories for a specified number of days starting from today. For each day, an inventory entry is created with the room's base price and full quantity as available. This is useful for bulk inventory creation.
- **Request Body**:

```json
{
  "roomId": "string (required, UUID format)",
  "days": "integer (required, positive, number of days to create inventories for)"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "view": "string",
    "area": "number",
    "maxAdults": "integer",
    "maxChildren": "integer",
    "basePricePerNight": "number",
    "bedType": {
      "id": "string",
      "name": "string"
    },
    "smokingAllowed": boolean,
    "wifiAvailable": boolean,
    "breakfastIncluded": boolean,
    "quantity": "integer",
    "status": "string (see [Accommodation Status Types](#accommodation-status-types))",
    "inventories": [
      {
        "roomId": "string (UUID)",
        "date": "date (ISO format: YYYY-MM-DD)",
        "price": "number (initialized with room's basePricePerNight)",
        "availableRooms": "integer (initialized with room's quantity)",
        "status": "string (initialized as 'available')"
      }
    ]
  }
}
```

- **Notes**:
  - Creates inventories for `days` number of consecutive days starting from today
  - Each inventory is initialized with:
    - `price`: Room's `basePricePerNight`
    - `availableRooms`: Room's `quantity`
    - `status`: `available`
  - If an inventory already exists for a date, it will not be overwritten (the system will skip that date)
  - This endpoint is useful for initial setup or bulk inventory creation
  - After creation, you can update individual inventory entries to adjust prices or availability

---

## Amenities

### 1. Create Amenity

**POST** `/amenity/amenities`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN (only administrators can create amenities)
- **Description**: Creates a new amenity (tiện ích) that can be associated with hotels or rooms. Amenities represent features or services available at accommodations (e.g., "WiFi", "Swimming Pool", "Parking", "Air Conditioning"). Each amenity must belong to a category and can be marked as free or paid.
- **Request Body**:

```json
{
  "name": "string (required, not blank) - Name of the amenity (e.g., 'WiFi', 'Swimming Pool', 'Parking')",
  "free": "boolean (required, not null) - Whether the amenity is free (true) or paid (false)",
  "categoryId": "string (required, not blank, UUID format) - ID of the amenity category this amenity belongs to"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "free": boolean,
    "categoryId": "string (UUID)"
  }
}
```

- **Notes**:
  - The amenity name must be unique across the system. If an amenity with the same name already exists, the request will fail with an error
  - The `categoryId` must reference an existing amenity category
  - After creation, the amenity can be associated with hotels or rooms through the hotel/room update endpoints
  - The `free` field indicates whether guests need to pay extra for this amenity or if it's included in the base price

### 2. Get All Amenities

**GET** `/amenity/amenities`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of all amenities in the system with their category information. This endpoint is useful for displaying available amenities when creating or updating hotels/rooms, or for filtering hotels by amenities.
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID)",
      "name": "string",
      "free": boolean,
      "categoryId": "string (UUID)"
    }
  ]
}
```

- **Notes**:
  - Returns all amenities regardless of category
  - The response includes the category ID for each amenity, which can be used to group amenities by category on the frontend
  - Amenities are returned with their category information loaded from the database
  - This endpoint does not support pagination as it typically returns a manageable number of amenities

### 3. Get Amenities By Category

**GET** `/amenity/amenities/category/{categoryId}`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves all amenities that belong to a specific category. Useful for filtering amenities by category (e.g., "Room Amenities", "Hotel Facilities", "Services").
- **Path Parameters**:
  - `categoryId`: string (required, UUID format) - ID of the amenity category to filter by
- **Response**: Same structure as Get All Amenities - returns an array of amenities filtered by the specified category

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID)",
      "name": "string",
      "free": boolean,
      "categoryId": "string (UUID)"
    }
  ]
}
```

- **Notes**:
  - Returns an empty array if the category has no amenities or if the category doesn't exist
  - The `categoryId` in the response will match the `categoryId` path parameter
  - This endpoint is useful for displaying amenities grouped by category in the UI

### 4. Delete Amenity

**DELETE** `/amenity/amenities/{id}`

- **Role Required**: ADMIN (only administrators can delete amenities)
- **Description**: Permanently deletes an amenity from the system. The amenity can only be deleted if it is not currently associated with any hotels or rooms. This is a safety measure to prevent breaking existing hotel/room configurations.
- **Path Parameters**:
  - `id`: string (required, UUID format) - ID of the amenity to delete
- **Response**: Same structure as Create Amenity response - returns the deleted amenity data

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "free": boolean,
    "categoryId": "string (UUID)"
  }
}
```

- **Error Response** (if amenity is referenced by hotels or rooms):

```json
{
  "statusCode": 400,
  "message": "Cannot delete amenity: it is currently associated with hotels or rooms",
  "data": null
}
```

- **Notes**:
  - Before deletion, the system checks if the amenity is referenced by any hotels (through `HotelAmenity` table) or rooms (through `RoomAmenity` table)
  - If the amenity is referenced, the deletion will fail with an error message indicating that the amenity cannot be deleted because it has references
  - To delete an amenity that is in use, you must first remove it from all hotels and rooms that reference it
  - This is a destructive operation and cannot be undone

---

## Amenity Categories

### 1. Create Amenity Category

**POST** `/amenity/categories`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN (only administrators can create amenity categories)
- **Description**: Creates a new amenity category. Categories are used to group related amenities together (e.g., "Room Amenities", "Hotel Facilities", "Services", "Entertainment"). Categories help organize amenities for better user experience when displaying or filtering amenities.
- **Request Body**:

```json
{
  "name": "string (required, not blank) - Name of the category (e.g., 'Room Amenities', 'Hotel Facilities', 'Services')"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "amenities": [
      {
        "id": "string (UUID)",
        "name": "string",
        "free": boolean
      }
    ]
  }
}
```

- **Notes**:
  - The category name must be unique across the system. If a category with the same name already exists, the request will fail with an error
  - When a category is created, the `amenities` array will be empty initially
  - After creation, amenities can be added to this category using the Create Amenity endpoint with the category's ID
  - Categories are used to organize amenities in the UI and for filtering purposes

### 2. Get All Amenity Categories

**GET** `/amenity/categories`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of all amenity categories in the system. This endpoint returns basic category information (ID and name) without the full list of amenities in each category. Use this endpoint to get the list of available categories for filtering or display purposes.
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID)",
      "name": "string"
    }
  ]
}
```

- **Notes**:
  - Returns all categories in the system
  - The response does not include the list of amenities in each category (use Get Amenities By Category endpoint to get amenities for a specific category)
  - This endpoint is useful for displaying category filters or dropdowns in the UI
  - Categories are returned in the order they are stored in the database

### 3. Delete Amenity Category

**DELETE** `/amenity/categories/{id}`

- **Role Required**: ADMIN (only administrators can delete amenity categories)
- **Description**: Permanently deletes an amenity category from the system. The category can only be deleted if it has no amenities associated with it. This is a safety measure to prevent orphaned amenities or breaking existing configurations.
- **Path Parameters**:
  - `id`: string (required, UUID format) - ID of the category to delete
- **Response**: Same structure as Create Amenity Category response - returns the deleted category data with its amenities

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "amenities": [
      {
        "id": "string (UUID)",
        "name": "string",
        "free": boolean
      }
    ]
  }
}
```

- **Error Response** (if category has amenities):

```json
{
  "statusCode": 400,
  "message": "Cannot delete amenity category: it contains amenities",
  "data": null
}
```

- **Notes**:
  - Before deletion, the system checks if the category has any amenities associated with it
  - If the category contains amenities, the deletion will fail with an error message
  - To delete a category that has amenities, you must first:
    1. Delete all amenities in the category, OR
    2. Move all amenities to a different category (by updating each amenity's `categoryId`)
  - This is a destructive operation and cannot be undone
  - Deleting a category does not automatically delete the amenities it contains - they must be handled separately

---

## Photo Categories

### 1. Get All Photo Categories

**GET** `/image/photo-categories`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of all photo categories in the system. Photo categories are used to organize and classify photos (e.g., "Hotel Exterior", "Room Interior", "Amenity", "Review Photo"). This endpoint returns a simple list of all available photo categories with their IDs and names. The list is not paginated as it typically contains a small number of reference data items.
- **Query Parameters**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Photo category ID",
      "name": "string (required, unique) - Photo category name (e.g., 'Hotel Exterior', 'Room Interior', 'Amenity', 'Review Photo')"
    }
  ]
}
```

- **Notes**:
  - **Reference Data**: Photo categories are reference data used throughout the system to categorize photos for hotels, rooms, amenities, and reviews
  - **No Pagination**: This endpoint returns all photo categories without pagination as the dataset is typically small (reference data)
  - **Ordering**: The order of results is not guaranteed and may vary between requests. If a specific order is needed, the client should sort the results
  - **Usage**: Photo categories are used when uploading photos for hotels and rooms to specify the type/category of each photo
  - **Uniqueness**: Photo category names must be unique across the system
  - **Read-Only**: This endpoint is read-only. Photo categories are typically managed by administrators through separate administrative endpoints (not exposed in this public API)
  - **Performance**: This endpoint uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance

---

## Locations

### Countries

#### 1. Create Country

**POST** `/location/countries`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new country in the location hierarchy. Countries are the top-level location entities in the system. Both the country name and code must be unique across the system. The country code is typically an ISO country code (e.g., "VN" for Vietnam, "US" for United States).
- **Request Body**:

```json
{
  "name": "string (required, not blank) - Country name (e.g., 'Vietnam', 'United States'). Must be unique across the system",
  "code": "string (required, not blank) - Country code (e.g., 'VN', 'US'). Must be unique across the system. Typically follows ISO country code standards"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Country ID",
    "name": "string - Country name",
    "code": "string - Country code"
  }
}
```

- **Notes**:
  - **Uniqueness**: Both `name` and `code` must be unique across all countries. If a country with the same name or code already exists, returns `COUNTRY_EXISTS` error (409)
  - **Validation**: Both `name` and `code` are required and cannot be blank. Returns `NAME_NOT_BLANK` or `CODE_NOT_BLANK` error (400) if missing
  - **Hierarchy**: Countries are the root level of the location hierarchy. Provinces belong to countries, cities belong to provinces, and so on
  - **Usage**: Countries are used throughout the system for hotel addresses, user addresses, and location-based filtering

#### 2. Get All Countries

**GET** `/location/countries`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of all countries in the system. This endpoint returns all countries without any filtering or pagination, as it typically contains a manageable number of reference data items. The list is not sorted in any particular order.
- **Query Parameters**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Country ID",
      "name": "string - Country name",
      "code": "string - Country code"
    }
  ]
}
```

- **Notes**:
  - **No Pagination**: This endpoint returns all countries without pagination as the dataset is typically small (reference data)
  - **Ordering**: The order of results is not guaranteed and may vary between requests. If a specific order is needed, the client should sort the results
  - **Performance**: Uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance
  - **Usage**: Commonly used in dropdown lists and location selection interfaces

#### 3. Delete Country

**DELETE** `/location/countries/{id}`

- **Role Required**: ADMIN
- **Description**: Deletes a country from the system. A country can only be deleted if it has no associated provinces and no hotels. If the country has any provinces or hotels, the deletion will fail with an error.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Country ID
- **Response**: Same as Create Country response (returns the deleted country details)

- **Notes**:
  - **Deletion Constraints**: A country cannot be deleted if:
    - It has any associated provinces (child locations)
    - It has any hotels located in it
  - **Error Handling**: 
    - Returns `COUNTRY_NOT_FOUND` error (404) if the country with the specified ID does not exist
    - Returns `CANNOT_DELETE_COUNTRY_HAS_PROVINCES` error (400) if the country has provinces
    - Returns `CANNOT_DELETE_COUNTRY_HAS_HOTELS` error (400) if the country has hotels
  - **Response**: Returns the deleted country details before deletion, allowing the client to confirm what was deleted
  - **Cascade Behavior**: The deletion does not cascade - all provinces and hotels must be removed or reassigned first

---

### Provinces

#### 1. Create Province

**POST** `/location/provinces`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new province in the location hierarchy. Provinces belong to countries and are the second level in the location hierarchy. The province name and code must be unique within the specified country. The country must exist, otherwise the creation will fail.
- **Request Body**:

```json
{
  "name": "string (required, not blank) - Province name (e.g., 'Ho Chi Minh City', 'Hanoi'). Must be unique within the country",
  "code": "string (required, not blank) - Province code (e.g., 'HCM', 'HN'). Must be unique within the country",
  "countryId": "string (required, not blank, UUID format) - ID of the country this province belongs to. The country must exist"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Province ID",
    "name": "string - Province name",
    "code": "string - Province code",
    "country": {
      "id": "string (UUID) - Country ID",
      "name": "string - Country name",
      "code": "string - Country code"
    }
  }
}
```

- **Notes**:
  - **Uniqueness**: The province `name` and `code` must be unique within the specified country. If a province with the same name or code already exists in that country, returns `PROVINCE_EXISTS` error (409)
  - **Validation**: All fields are required and cannot be blank. Returns `NAME_NOT_BLANK`, `CODE_NOT_BLANK`, or `COUNTRY_ID_NOT_BLANK` error (400) if missing
  - **Country Validation**: The `countryId` must reference an existing country. If the country does not exist, returns `COUNTRY_NOT_FOUND` error (404)
  - **Hierarchy**: Provinces are the second level in the location hierarchy (Country → Province → City → District → Ward → Street)
  - **Usage**: Provinces are used throughout the system for hotel addresses, user addresses, and location-based filtering

#### 2. Get All Provinces

**GET** `/location/provinces`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of provinces with optional filtering by name and country. This endpoint supports filtering to help users find specific provinces. When filters are provided, only provinces matching the criteria are returned. When no filters are provided, all provinces are returned.
- **Query Parameters**:
  - `name`: string (optional) - Filter provinces by name (partial match, case-insensitive). If provided, returns only provinces whose name contains this value
  - `country-id`: string (optional, UUID format) - Filter provinces by country ID. If provided, returns only provinces belonging to the specified country
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Province ID",
      "name": "string - Province name",
      "code": "string - Province code"
    }
  ]
}
```

- **Notes**:
  - **Filtering Logic**: 
    - When both `name` and `country-id` are provided, both conditions must be met (AND logic)
    - When only one filter is provided, only that condition is applied
    - When no filters are provided, all provinces are returned
  - **Name Filter**: The name filter uses partial matching (contains) and is case-insensitive
  - **No Pagination**: This endpoint returns all matching provinces without pagination
  - **Ordering**: The order of results is not guaranteed and may vary between requests
  - **Performance**: Uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance

#### 3. Delete Province

**DELETE** `/location/provinces/{id}`

- **Role Required**: ADMIN
- **Description**: Deletes a province from the system. A province can only be deleted if it has no associated cities and no hotels. If the province has any cities or hotels, the deletion will fail with an error.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Province ID
- **Response**: Same as Create Province response (returns the deleted province details)

- **Notes**:
  - **Deletion Constraints**: A province cannot be deleted if:
    - It has any associated cities (child locations)
    - It has any hotels located in it
  - **Error Handling**: 
    - Returns `PROVINCE_NOT_FOUND` error (404) if the province with the specified ID does not exist
    - Returns `CANNOT_DELETE_PROVINCE_HAS_CITIES` error (400) if the province has cities
    - Returns `CANNOT_DELETE_PROVINCE_HAS_HOTELS` error (400) if the province has hotels
  - **Response**: Returns the deleted province details before deletion, allowing the client to confirm what was deleted
  - **Cascade Behavior**: The deletion does not cascade - all cities and hotels must be removed or reassigned first

---

### Cities

#### 1. Create City

**POST** `/location/cities`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new city in the location hierarchy. Cities belong to provinces and are the third level in the location hierarchy. The city name and code must be unique within the specified province. The province must exist, otherwise the creation will fail.
- **Request Body**:

```json
{
  "name": "string (required, not blank) - City name (e.g., 'District 1', 'Ba Dinh District'). Must be unique within the province",
  "code": "string (required, not blank) - City code (e.g., 'D1', 'BD'). Must be unique within the province",
  "provinceId": "string (required, not blank, UUID format) - ID of the province this city belongs to. The province must exist"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - City ID",
    "name": "string - City name",
    "code": "string - City code",
    "province": {
      "id": "string (UUID) - Province ID",
      "name": "string - Province name",
      "code": "string - Province code",
      "country": {
        "id": "string (UUID) - Country ID",
        "name": "string - Country name",
        "code": "string - Country code"
      }
    }
  }
}
```

- **Notes**:
  - **Uniqueness**: The city `name` and `code` must be unique within the specified province. If a city with the same name or code already exists in that province, returns `CITY_EXISTS` error (409)
  - **Validation**: All fields are required and cannot be blank. Returns `NAME_NOT_BLANK`, `CODE_NOT_BLANK`, or `PROVINCE_ID_NOT_BLANK` error (400) if missing
  - **Province Validation**: The `provinceId` must reference an existing province. If the province does not exist, returns `PROVINCE_NOT_FOUND` error (404)
  - **Hierarchy**: Cities are the third level in the location hierarchy (Country → Province → City → District → Ward → Street)
  - **Usage**: Cities are used throughout the system for hotel addresses, user addresses, and location-based filtering

#### 2. Get All Cities

**GET** `/location/cities`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of cities with optional filtering by name and province. This endpoint supports filtering to help users find specific cities. When filters are provided, only cities matching the criteria are returned. When no filters are provided, all cities are returned.
- **Query Parameters**:
  - `name`: string (optional) - Filter cities by name (partial match, case-insensitive). If provided, returns only cities whose name contains this value
  - `province-id`: string (optional, UUID format) - Filter cities by province ID. If provided, returns only cities belonging to the specified province
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - City ID",
      "name": "string - City name",
      "code": "string - City code"
    }
  ]
}
```

- **Notes**:
  - **Filtering Logic**: 
    - When both `name` and `province-id` are provided, both conditions must be met (AND logic)
    - When only one filter is provided, only that condition is applied
    - When no filters are provided, all cities are returned
  - **Name Filter**: The name filter uses partial matching (contains) and is case-insensitive
  - **No Pagination**: This endpoint returns all matching cities without pagination
  - **Ordering**: The order of results is not guaranteed and may vary between requests
  - **Performance**: Uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance

#### 3. Delete City

**DELETE** `/location/cities/{id}`

- **Role Required**: ADMIN
- **Description**: Deletes a city from the system. A city can only be deleted if it has no associated districts and no hotels. If the city has any districts or hotels, the deletion will fail with an error.
- **Path Parameters**:
  - `id`: string (required, UUID format) - City ID
- **Response**: Same as Create City response (returns the deleted city details)

- **Notes**:
  - **Deletion Constraints**: A city cannot be deleted if:
    - It has any associated districts (child locations)
    - It has any hotels located in it
  - **Error Handling**: 
    - Returns `CITY_NOT_FOUND` error (404) if the city with the specified ID does not exist
    - Returns `CANNOT_DELETE_CITY_HAS_DISTRICTS` error (400) if the city has districts
    - Returns `CANNOT_DELETE_CITY_HAS_HOTELS` error (400) if the city has hotels
  - **Response**: Returns the deleted city details before deletion, allowing the client to confirm what was deleted
  - **Cascade Behavior**: The deletion does not cascade - all districts and hotels must be removed or reassigned first

---

### Districts

#### 1. Create District

**POST** `/location/districts`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new district in the location hierarchy. Districts belong to cities and are the fourth level in the location hierarchy. The district name and code must be unique within the specified city. The city must exist, otherwise the creation will fail.
- **Request Body**:

```json
{
  "name": "string (required, not blank) - District name (e.g., 'Ward 1', 'Ward 2'). Must be unique within the city",
  "code": "string (required, not blank) - District code (e.g., 'W1', 'W2'). Must be unique within the city",
  "cityId": "string (required, not blank, UUID format) - ID of the city this district belongs to. The city must exist"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - District ID",
    "name": "string - District name",
    "code": "string - District code",
    "city": {
      "id": "string (UUID) - City ID",
      "name": "string - City name",
      "code": "string - City code",
      "province": {
        "id": "string (UUID) - Province ID",
        "name": "string - Province name",
        "code": "string - Province code",
        "country": {
          "id": "string (UUID) - Country ID",
          "name": "string - Country name",
          "code": "string - Country code"
        }
      }
    }
  }
}
```

- **Notes**:
  - **Uniqueness**: The district `name` and `code` must be unique within the specified city. If a district with the same name or code already exists in that city, returns `DISTRICT_EXISTS` error (409)
  - **Validation**: All fields are required and cannot be blank. Returns `NAME_NOT_BLANK`, `CODE_NOT_BLANK`, or `CITY_ID_NOT_BLANK` error (400) if missing
  - **City Validation**: The `cityId` must reference an existing city. If the city does not exist, returns `CITY_NOT_FOUND` error (404)
  - **Hierarchy**: Districts are the fourth level in the location hierarchy (Country → Province → City → District → Ward → Street)
  - **Usage**: Districts are used throughout the system for hotel addresses, user addresses, and location-based filtering

#### 2. Get All Districts

**GET** `/location/districts`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of districts with optional filtering by name and city. This endpoint supports filtering to help users find specific districts. When filters are provided, only districts matching the criteria are returned. When no filters are provided, all districts are returned.
- **Query Parameters**:
  - `name`: string (optional) - Filter districts by name (partial match, case-insensitive). If provided, returns only districts whose name contains this value
  - `city-id`: string (optional, UUID format) - Filter districts by city ID. If provided, returns only districts belonging to the specified city
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - District ID",
      "name": "string - District name",
      "code": "string - District code"
    }
  ]
}
```

- **Notes**:
  - **Filtering Logic**: 
    - When both `name` and `city-id` are provided, both conditions must be met (AND logic)
    - When only one filter is provided, only that condition is applied
    - When no filters are provided, all districts are returned
  - **Name Filter**: The name filter uses partial matching (contains) and is case-insensitive
  - **No Pagination**: This endpoint returns all matching districts without pagination
  - **Ordering**: The order of results is not guaranteed and may vary between requests
  - **Performance**: Uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance

#### 3. Delete District

**DELETE** `/location/districts/{id}`

- **Role Required**: ADMIN
- **Description**: Deletes a district from the system. A district can only be deleted if it has no associated wards and no hotels. If the district has any wards or hotels, the deletion will fail with an error.
- **Path Parameters**:
  - `id`: string (required, UUID format) - District ID
- **Response**: Same as Create District response (returns the deleted district details)

- **Notes**:
  - **Deletion Constraints**: A district cannot be deleted if:
    - It has any associated wards (child locations)
    - It has any hotels located in it
  - **Error Handling**: 
    - Returns `DISTRICT_NOT_FOUND` error (404) if the district with the specified ID does not exist
    - Returns `CANNOT_DELETE_DISTRICT_HAS_WARDS` error (400) if the district has wards
    - Returns `CANNOT_DELETE_DISTRICT_HAS_HOTELS` error (400) if the district has hotels
  - **Response**: Returns the deleted district details before deletion, allowing the client to confirm what was deleted
  - **Cascade Behavior**: The deletion does not cascade - all wards and hotels must be removed or reassigned first

---

### Wards

#### 1. Create Ward

**POST** `/location/wards`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new ward in the location hierarchy. Wards belong to districts and are the fifth level in the location hierarchy. The ward name and code must be unique within the specified district. The district must exist, otherwise the creation will fail.
- **Request Body**:

```json
{
  "name": "string (required, not blank) - Ward name (e.g., 'Street 1', 'Street 2'). Must be unique within the district",
  "code": "string (required, not blank) - Ward code (e.g., 'S1', 'S2'). Must be unique within the district",
  "districtId": "string (required, not blank, UUID format) - ID of the district this ward belongs to. The district must exist"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Ward ID",
    "name": "string - Ward name",
    "code": "string - Ward code",
    "district": {
      "id": "string (UUID) - District ID",
      "name": "string - District name",
      "code": "string - District code",
      "city": {
        "id": "string (UUID) - City ID",
        "name": "string - City name",
        "code": "string - City code",
        "province": {
          "id": "string (UUID) - Province ID",
          "name": "string - Province name",
          "code": "string - Province code",
          "country": {
            "id": "string (UUID) - Country ID",
            "name": "string - Country name",
            "code": "string - Country code"
          }
        }
      }
    }
  }
}
```

- **Notes**:
  - **Uniqueness**: The ward `name` and `code` must be unique within the specified district. If a ward with the same name or code already exists in that district, returns `WARD_EXISTS` error (409)
  - **Validation**: All fields are required and cannot be blank. Returns `NAME_NOT_BLANK`, `CODE_NOT_BLANK`, or `DISTRICT_ID_NOT_BLANK` error (400) if missing
  - **District Validation**: The `districtId` must reference an existing district. If the district does not exist, returns `DISTRICT_NOT_FOUND` error (404)
  - **Hierarchy**: Wards are the fifth level in the location hierarchy (Country → Province → City → District → Ward → Street)
  - **Usage**: Wards are used throughout the system for hotel addresses, user addresses, and location-based filtering

#### 2. Get All Wards

**GET** `/location/wards`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of wards with optional filtering by name and district. This endpoint supports filtering to help users find specific wards. When filters are provided, only wards matching the criteria are returned. When no filters are provided, all wards are returned.
- **Query Parameters**:
  - `name`: string (optional) - Filter wards by name (partial match, case-insensitive). If provided, returns only wards whose name contains this value
  - `district-id`: string (optional, UUID format) - Filter wards by district ID. If provided, returns only wards belonging to the specified district
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Ward ID",
      "name": "string - Ward name",
      "code": "string - Ward code"
    }
  ]
}
```

- **Notes**:
  - **Filtering Logic**: 
    - When both `name` and `district-id` are provided, both conditions must be met (AND logic)
    - When only one filter is provided, only that condition is applied
    - When no filters are provided, all wards are returned
  - **Name Filter**: The name filter uses partial matching (contains) and is case-insensitive
  - **No Pagination**: This endpoint returns all matching wards without pagination
  - **Ordering**: The order of results is not guaranteed and may vary between requests
  - **Performance**: Uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance

#### 3. Delete Ward

**DELETE** `/location/wards/{id}`

- **Role Required**: ADMIN
- **Description**: Deletes a ward from the system. A ward can only be deleted if it has no associated streets and no hotels. If the ward has any streets or hotels, the deletion will fail with an error.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Ward ID
- **Response**: Same as Create Ward response (returns the deleted ward details)

- **Notes**:
  - **Deletion Constraints**: A ward cannot be deleted if:
    - It has any associated streets (child locations)
    - It has any hotels located in it
  - **Error Handling**: 
    - Returns `WARD_NOT_FOUND` error (404) if the ward with the specified ID does not exist
    - Returns `CANNOT_DELETE_WARD_HAS_STREETS` error (400) if the ward has streets
    - Returns `CANNOT_DELETE_WARD_HAS_HOTELS` error (400) if the ward has hotels
  - **Response**: Returns the deleted ward details before deletion, allowing the client to confirm what was deleted
  - **Cascade Behavior**: The deletion does not cascade - all streets and hotels must be removed or reassigned first

---

### Streets

#### 1. Create Street

**POST** `/location/streets`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new street in the location hierarchy. Streets belong to wards and are the sixth and final level in the location hierarchy. The street name and code must be unique within the specified ward. The ward must exist, otherwise the creation will fail.
- **Request Body**:

```json
{
  "name": "string (required, not blank) - Street name (e.g., 'Nguyen Hue Street', 'Le Loi Street'). Must be unique within the ward",
  "code": "string (required, not blank) - Street code (e.g., 'NH', 'LL'). Must be unique within the ward",
  "wardId": "string (required, not blank, UUID format) - ID of the ward this street belongs to. The ward must exist"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Street ID",
    "name": "string - Street name",
    "code": "string - Street code",
    "ward": {
      "id": "string (UUID) - Ward ID",
      "name": "string - Ward name",
      "code": "string - Ward code",
      "district": {
        "id": "string (UUID) - District ID",
        "name": "string - District name",
        "code": "string - District code",
        "city": {
          "id": "string (UUID) - City ID",
          "name": "string - City name",
          "code": "string - City code",
          "province": {
            "id": "string (UUID) - Province ID",
            "name": "string - Province name",
            "code": "string - Province code",
            "country": {
              "id": "string (UUID) - Country ID",
              "name": "string - Country name",
              "code": "string - Country code"
            }
          }
        }
      }
    }
  }
}
```

- **Notes**:
  - **Uniqueness**: The street `name` and `code` must be unique within the specified ward. If a street with the same name or code already exists in that ward, returns `STREET_EXISTS` error (409)
  - **Validation**: All fields are required and cannot be blank. Returns `NAME_NOT_BLANK`, `CODE_NOT_BLANK`, or `WARD_ID_NOT_BLANK` error (400) if missing
  - **Ward Validation**: The `wardId` must reference an existing ward. If the ward does not exist, returns `WARD_NOT_FOUND` error (404)
  - **Hierarchy**: Streets are the sixth and final level in the location hierarchy (Country → Province → City → District → Ward → Street)
  - **Usage**: Streets are used throughout the system for hotel addresses, user addresses, and location-based filtering

#### 2. Get All Streets

**GET** `/location/streets`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of streets with optional filtering by name and ward. This endpoint supports filtering to help users find specific streets. When filters are provided, only streets matching the criteria are returned. When no filters are provided, all streets are returned.
- **Query Parameters**:
  - `name`: string (optional) - Filter streets by name (partial match, case-insensitive). If provided, returns only streets whose name contains this value
  - `ward-id`: string (optional, UUID format) - Filter streets by ward ID. If provided, returns only streets belonging to the specified ward
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Street ID",
      "name": "string - Street name",
      "code": "string - Street code"
    }
  ]
}
```

- **Notes**:
  - **Filtering Logic**: 
    - When both `name` and `ward-id` are provided, both conditions must be met (AND logic)
    - When only one filter is provided, only that condition is applied
    - When no filters are provided, all streets are returned
  - **Name Filter**: The name filter uses partial matching (contains) and is case-insensitive
  - **No Pagination**: This endpoint returns all matching streets without pagination
  - **Ordering**: The order of results is not guaranteed and may vary between requests
  - **Performance**: Uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance

#### 3. Delete Street

**DELETE** `/location/streets/{id}`

- **Role Required**: ADMIN
- **Description**: Deletes a street from the system. A street can only be deleted if it has no associated hotels. If the street has any hotels, the deletion will fail with an error.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Street ID
- **Response**: Same as Create Street response (returns the deleted street details)

- **Notes**:
  - **Deletion Constraints**: A street cannot be deleted if:
    - It has any hotels located in it
  - **Error Handling**: 
    - Returns `STREET_NOT_FOUND` error (404) if the street with the specified ID does not exist
    - Returns `CANNOT_DELETE_STREET_HAS_HOTELS` error (400) if the street has hotels
  - **Response**: Returns the deleted street details before deletion, allowing the client to confirm what was deleted
  - **Cascade Behavior**: The deletion does not cascade - all hotels must be removed or reassigned first

---

### Entertainment Venues

#### 1. Get Entertainment Venues By City

**GET** `/location/entertainment-venues/city/{cityId}`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves entertainment venues grouped by category for a specific city. Entertainment venues are points of interest near hotels (e.g., restaurants, museums, parks, shopping malls). This endpoint returns venues organized by their category, making it easy to display different types of attractions. Each venue includes its distance from hotels in the city (if associated with hotels).
- **Path Parameters**:
  - `cityId`: string (required, UUID format) - City ID to get entertainment venues for. The city must exist, otherwise returns `CITY_NOT_FOUND` error (404)
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Entertainment venue category ID",
      "name": "string - Category name (e.g., 'Restaurant', 'Museum', 'Park', 'Shopping Mall')",
      "entertainmentVenues": [
        {
          "id": "string (UUID) - Entertainment venue ID",
          "name": "string - Venue name",
          "distance": "number - Distance from associated hotel in meters (if venue is associated with a hotel in this city)"
        }
      ]
    }
  ]
}
```

- **Notes**:
  - **City Validation**: The `cityId` must reference an existing city. If the city does not exist, returns `CITY_NOT_FOUND` error (404)
  - **Grouping**: Entertainment venues are grouped by their category. Each category object contains a list of venues in that category
  - **Distance**: The `distance` field represents the distance from the venue to an associated hotel in the city (in meters). This is only populated if the venue is associated with a hotel through the `HotelEntertainmentVenue` relationship
  - **Empty Categories**: Categories with no venues in the specified city are not included in the response
  - **Usage**: This endpoint is commonly used to display nearby attractions and points of interest for hotels in a specific city
  - **Performance**: Uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance
  - **Hotel Association**: Entertainment venues are associated with hotels through the `HotelEntertainmentVenue` relationship table, which stores the distance between the hotel and the venue

---

## Discounts

### 1. Create Discount

**POST** `/discounts?hotel-id={hotel-id}&special-day-id={special-day-id}`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new discount code. Only administrators can create discounts. A discount can be associated with a specific hotel (via `hotel-id`) or a special day (via `special-day-id`), or it can be a general discount not tied to any hotel or special day. The discount code must be unique across the system. When a discount is created, it is automatically set to active (`active = true`).
- **Query Parameters**:
  - `hotel-id`: string (optional, UUID format) - ID of the hotel to associate this discount with. If provided, the discount will only be applicable to bookings for this specific hotel. If not provided, the discount will be a general discount applicable to any hotel.
  - `special-day-id`: string (optional, UUID format) - ID of the special day to associate this discount with. If provided, the discount will only be applicable on this special day. If not provided, the discount can be used on any day within the valid date range.
- **Request Body**:

```json
{
  "code": "string (required, not blank, max 50 characters) - Unique discount code (e.g., 'SUMMER2024', 'FIRSTBOOK10'). Must be unique across the system",
  "description": "string (required, not blank) - Description of the discount (e.g., 'Summer promotion discount', 'First booking discount')",
  "percentage": "number (required, 0.0-100.0) - Discount percentage (e.g., 10.0 for 10% discount, 25.5 for 25.5% discount)",
  "usageLimit": "integer (required, positive, min: 1) - Maximum number of times this discount can be used across all users",
  "timesUsed": "integer (required, min: 0) - Current number of times this discount has been used. Typically set to 0 for new discounts",
  "minBookingPrice": "integer (optional, min: 0) - Minimum booking price required to use this discount. If not provided, defaults to 0 (no minimum)",
  "minBookingCount": "integer (optional, positive, min: 1) - Minimum number of rooms required to use this discount. If not provided, no minimum room count is required",
  "validFrom": "date (required, ISO format: YYYY-MM-DD) - Start date when the discount becomes valid (inclusive)",
  "validTo": "date (required, ISO format: YYYY-MM-DD) - End date when the discount expires (inclusive). Must be greater than or equal to validFrom"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Discount ID",
    "code": "string - Discount code",
    "description": "string - Discount description",
    "percentage": "number - Discount percentage (0.0-100.0)",
    "usageLimit": "integer - Maximum usage limit",
    "timesUsed": "integer - Current usage count",
    "minBookingPrice": "integer - Minimum booking price required",
    "minBookingCount": "integer - Minimum booking count required",
    "validFrom": "date (ISO format: YYYY-MM-DD) - Valid from date",
    "validTo": "date (ISO format: YYYY-MM-DD) - Valid to date",
    "active": "boolean (default: true) - Whether the discount is currently active",
    "hotel": {
      "id": "string (UUID, nullable) - Hotel ID if discount is associated with a hotel",
      "name": "string (nullable) - Hotel name",
      "address": "string (nullable) - Hotel address",
      "country": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "province": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "city": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "district": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "ward": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "street": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "latitude": "number",
      "longitude": "number",
      "starRating": "integer (0-5)",
      "status": "string"
    },
    "specialDay": {
      "id": "string (UUID, nullable) - Special day ID if discount is associated with a special day",
      "date": "date (nullable, ISO format: YYYY-MM-DD) - Special day date",
      "name": "string (nullable) - Special day name"
    },
    "createdAt": "datetime (ISO 8601) - Creation timestamp",
    "updatedAt": "datetime (ISO 8601, nullable) - Last update timestamp"
  }
}
```

- **Notes**:
  - **Discount Code Uniqueness**: The discount code must be unique across the system. If a discount with the same code already exists, returns `DISCOUNT_EXISTS` error (409).
  - **Hotel Association**: If `hotel-id` is provided, the discount will be associated with that specific hotel. The hotel must exist, otherwise returns `HOTEL_NOT_FOUND` error (404).
  - **Special Day Association**: If `special-day-id` is provided, the discount will be associated with that special day. The special day must exist, otherwise returns `SPECIAL_DAY_NOT_FOUND` error (404).
  - **Date Validation**: `validTo` must be greater than or equal to `validFrom`. The system validates this at the application level.
  - **Default Values**: 
    - `active` defaults to `true` for new discounts
    - `minBookingPrice` defaults to 0 if not provided
    - `minBookingCount` is optional and has no default (null means no minimum requirement)
  - **Usage Tracking**: The `timesUsed` field is typically set to 0 for new discounts and is incremented automatically when the discount is applied to bookings.

### 2. Get All Discounts

**GET** `/discounts`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a paginated list of discounts with comprehensive filtering and sorting options. Supports filtering by code, active status, validity dates, percentage range, booking requirements, usage status, and associations with hotels or special days. When no filters are provided, returns all discounts with simple pagination. When filters are applied, uses database-level filtering for optimal performance.
- **Query Parameters**:
  - `code`: string (optional) - Filter by discount code (exact match)
  - `active`: boolean (optional) - Filter by active status. `true` returns only active discounts, `false` returns only inactive discounts
  - `currently-valid`: boolean (optional) - Filter by current validity. `true` returns discounts that are currently valid (today is between `validFrom` and `validTo`), `false` returns discounts that are not currently valid
  - `valid-from`: date (optional, ISO format: YYYY-MM-DD) - Filter discounts where `validFrom` is greater than or equal to this date
  - `valid-to`: date (optional, ISO format: YYYY-MM-DD) - Filter discounts where `validTo` is less than or equal to this date
  - `min-percentage`: number (optional) - Filter discounts with percentage greater than or equal to this value
  - `max-percentage`: number (optional) - Filter discounts with percentage less than or equal to this value
  - `min-booking-price`: integer (optional, min: 0) - Filter discounts with `minBookingPrice` greater than or equal to this value
  - `max-booking-price`: integer (optional, min: 0) - Filter discounts with `minBookingPrice` less than or equal to this value
  - `min-booking-count`: integer (optional, positive) - Filter discounts with `minBookingCount` greater than or equal to this value
  - `max-booking-count`: integer (optional, positive) - Filter discounts with `minBookingCount` less than or equal to this value
  - `available`: boolean (optional) - Filter discounts that are still available (not exhausted). `true` returns discounts where `timesUsed < usageLimit`, `false` returns discounts where `timesUsed >= usageLimit`
  - `exhausted`: boolean (optional) - Filter discounts that are exhausted. `true` returns discounts where `timesUsed >= usageLimit`, `false` returns discounts where `timesUsed < usageLimit`
  - `min-times-used`: integer (optional, min: 0) - Filter discounts with `timesUsed` greater than or equal to this value
  - `max-times-used`: integer (optional, min: 0) - Filter discounts with `timesUsed` less than or equal to this value
  - `hotel-id`: string (optional, UUID format) - Filter discounts associated with a specific hotel
  - `special-day-id`: string (optional, UUID format) - Filter discounts associated with a specific special day
  - `page`: integer (optional, default: 0, min: 0) - Page number (0-indexed)
  - `size`: integer (optional, default: 10, min: 1, max: 100) - Number of items per page. Maximum value is 100
  - `sort-by`: string (optional, default: "created-at") - Field to sort by. Valid values: `code`, `percentage`, `valid-from`, `valid-to`, `usage-limit`, `times-used`, `min-booking-price`, `created-at`. If invalid value is provided, defaults to sorting by `id`
  - `sort-dir`: string (optional, default: "asc") - Sort direction. Valid values: `asc`, `desc`. If invalid value is provided, defaults to `asc`
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string (UUID)",
        "code": "string - Discount code",
        "description": "string - Discount description",
        "percentage": "number - Discount percentage (0.0-100.0)",
        "usageLimit": "integer - Maximum usage limit",
        "timesUsed": "integer - Current usage count",
        "minBookingPrice": "integer - Minimum booking price required",
        "minBookingCount": "integer - Minimum booking count required",
        "validFrom": "date (ISO format: YYYY-MM-DD) - Valid from date",
        "validTo": "date (ISO format: YYYY-MM-DD) - Valid to date",
        "active": "boolean - Whether the discount is currently active",
        "createdAt": "datetime (ISO 8601) - Creation timestamp",
        "updatedAt": "datetime (ISO 8601, nullable) - Last update timestamp"
      }
    ],
    "page": "integer (0-indexed) - Current page number",
    "size": "integer - Number of items per page",
    "totalItems": "long - Total number of items matching the filters",
    "totalPages": "integer - Total number of pages",
    "first": "boolean - Whether this is the first page",
    "last": "boolean - Whether this is the last page",
    "hasNext": "boolean - Whether there is a next page",
    "hasPrevious": "boolean - Whether there is a previous page"
  }
}
```

- **Notes**:
  - **Filtering Logic**: 
    - When no filters are provided, uses simple pagination with database-level sorting
    - When filters are provided, uses database-level filtering with pagination for optimal performance
    - Multiple filters can be combined using AND logic (all conditions must be met)
  - **Available vs Exhausted**: 
    - `available=true`: Returns discounts where `timesUsed < usageLimit` (still has remaining uses)
    - `exhausted=true`: Returns discounts where `timesUsed >= usageLimit` (no remaining uses)
    - These filters are mutually exclusive in practice
  - **Currently Valid**: The `currently-valid` filter checks if today's date falls between `validFrom` and `validTo` (inclusive) and the discount is active
  - **Pagination**: 
    - Page numbers are 0-indexed (first page is 0)
    - Page size is automatically clamped between 1 and 100
    - Page number is automatically clamped to be non-negative
  - **Sorting**: 
    - Default sort is by `created-at` in ascending order
    - Invalid sort fields default to sorting by `id`
    - Invalid sort directions default to `asc`
  - **Performance**: Uses database-level filtering and pagination for optimal performance, especially when dealing with large datasets

### 3. Get Discount By ID

**GET** `/discounts/{id}`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves detailed information about a specific discount by its ID. Returns full discount details including associated hotel and special day information (if any).
- **Path Parameters**:
  - `id`: string (required, UUID format) - Discount ID
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Discount ID",
    "code": "string - Discount code",
    "description": "string - Discount description",
    "percentage": "number - Discount percentage (0.0-100.0)",
    "usageLimit": "integer - Maximum usage limit",
    "timesUsed": "integer - Current usage count",
    "minBookingPrice": "integer - Minimum booking price required",
    "minBookingCount": "integer - Minimum booking count required",
    "validFrom": "date (ISO format: YYYY-MM-DD) - Valid from date",
    "validTo": "date (ISO format: YYYY-MM-DD) - Valid to date",
    "active": "boolean - Whether the discount is currently active",
    "hotel": {
      "id": "string (UUID, nullable) - Hotel ID if discount is associated with a hotel",
      "name": "string (nullable) - Hotel name",
      "address": "string (nullable) - Hotel address",
      "country": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "province": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "city": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "district": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "ward": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "street": {
        "id": "string",
        "name": "string",
        "code": "string"
      },
      "latitude": "number",
      "longitude": "number",
      "starRating": "integer (0-5)",
      "status": "string"
    },
    "specialDay": {
      "id": "string (UUID, nullable) - Special day ID if discount is associated with a special day",
      "date": "date (nullable, ISO format: YYYY-MM-DD) - Special day date",
      "name": "string (nullable) - Special day name"
    },
    "createdAt": "datetime (ISO 8601) - Creation timestamp",
    "updatedAt": "datetime (ISO 8601, nullable) - Last update timestamp"
  }
}
```

- **Notes**:
  - Returns `DISCOUNT_NOT_FOUND` error (404) if the discount with the specified ID does not exist
  - The `hotel` field will be `null` if the discount is not associated with any hotel
  - The `specialDay` field will be `null` if the discount is not associated with any special day
  - This endpoint returns the same detailed response structure as the Create Discount endpoint

### 4. Update Discount

**PUT** `/discounts/{id}`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Updates an existing discount. All fields in the request body are optional - only provided fields will be updated. The discount code can be changed, but the new code must be unique. Hotel and special day associations can be updated or removed by providing new values or setting them to null.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Discount ID
- **Request Body** (all fields optional):

```json
{
  "code": "string (optional, max 50 characters) - New discount code. Must be unique if changed",
  "description": "string (optional, max 500 characters) - New discount description",
  "percentage": "number (optional, 0.0-100.0) - New discount percentage",
  "usageLimit": "integer (optional, positive, min: 1) - New usage limit",
  "timesUsed": "integer (optional, min: 0) - New times used count",
  "minBookingPrice": "integer (optional, min: 0) - New minimum booking price",
  "minBookingCount": "integer (optional, positive, min: 1) - New minimum booking count",
  "validFrom": "date (optional, ISO format: YYYY-MM-DD) - New valid from date",
  "validTo": "date (optional, ISO format: YYYY-MM-DD) - New valid to date",
  "active": "boolean (optional) - New active status",
  "hotelId": "string (optional, UUID format) - New hotel ID to associate with. Set to null or empty string to remove hotel association",
  "specialDayId": "string (optional, UUID format) - New special day ID to associate with. Set to null or empty string to remove special day association"
}
```

- **Response**: Same as Get Discount By ID response

- **Notes**:
  - **Partial Updates**: Only fields provided in the request body will be updated. Fields not provided will remain unchanged
  - **Code Uniqueness**: If the `code` is being changed, the new code must be unique. If a discount with the new code already exists, returns `DISCOUNT_EXISTS` error (409)
  - **Hotel Association**: 
    - If `hotelId` is provided and different from current association, the old hotel association is removed and a new one is created
    - If `hotelId` is set to null or empty string, the hotel association is removed
    - If `hotelId` is provided, the hotel must exist, otherwise returns `HOTEL_NOT_FOUND` error (404)
  - **Special Day Association**: 
    - If `specialDayId` is provided and different from current association, the old special day association is removed and a new one is created
    - If `specialDayId` is set to null or empty string, the special day association is removed
    - If `specialDayId` is provided, the special day must exist, otherwise returns `SPECIAL_DAY_NOT_FOUND` error (404)
  - **Date Validation**: If both `validFrom` and `validTo` are provided, `validTo` must be greater than or equal to `validFrom`
  - **Validation Rules**: Same validation rules apply as in Create Discount (percentage range, positive values, etc.)
  - Returns `DISCOUNT_NOT_FOUND` error (404) if the discount with the specified ID does not exist

### 5. Delete Discount

**DELETE** `/discounts/{id}`

- **Role Required**: ADMIN
- **Description**: Deletes a discount. A discount can only be deleted if it is not referenced by any hotels, special days, or bookings. If the discount has been used in any bookings or is associated with any hotels or special days, the deletion will fail with an error.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Discount ID
- **Response**: Same as Get Discount By ID response (returns the deleted discount details)

- **Notes**:
  - **Deletion Constraints**: A discount cannot be deleted if:
    - It is associated with any hotel (via HotelDiscount relationship)
    - It is associated with any special day (via SpecialDayDiscount relationship)
    - It has been used in any bookings (referenced in Booking table)
  - **Error Handling**: 
    - Returns `DISCOUNT_NOT_FOUND` error (404) if the discount with the specified ID does not exist
    - Returns `CANNOT_DELETE_DISCOUNT_HAS_REFERENCES` error (400) if the discount has any references (hotels, special days, or bookings)
  - **Response**: Returns the deleted discount details before deletion, allowing the client to confirm what was deleted
  - **Cascade Behavior**: The deletion does not cascade - associated HotelDiscount and SpecialDayDiscount records must be removed first (or the discount must be disassociated from hotels/special days via Update endpoint)

---

## Policies

### Cancellation Policies

#### 1. Get All Cancellation Policies

**GET** `/policy/cancellation-policies`

- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can view all cancellation policies to select appropriate policies when configuring hotel settings
  - **ADMIN**: Can view all cancellation policies for management and configuration purposes
- **Description**: Retrieves a list of all cancellation policies available in the system. Cancellation policies define the rules and penalties that apply when a booking is cancelled. Each policy contains a name, description, and a collection of rules that specify penalty percentages based on how many days before check-in the cancellation occurs. Partners use this endpoint to view available cancellation policies when configuring their hotels, while administrators use it for policy management. The list is not paginated as it typically contains a small number of reference data items.
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Unique identifier of the cancellation policy",
      "name": "string - Name of the cancellation policy (e.g., 'Flexible', 'Moderate', 'Strict', 'Non-refundable')",
      "description": "string - Detailed description of the cancellation policy, explaining the general terms and conditions",
      "rules": [
        {
          "id": "string (UUID) - Unique identifier of the cancellation rule",
          "daysBeforeCheckIn": "integer (non-negative) - Number of days before the check-in date that this rule applies to. For example, if this value is 7, the rule applies to cancellations made 7 or more days before check-in",
          "penaltyPercentage": "integer (0-100) - Percentage of the total booking amount that will be charged as a penalty if cancellation occurs within the specified number of days before check-in. For example, a value of 50 means 50% of the booking amount will be charged as penalty"
        }
      ]
    }
  ]
}
```

- **Notes**:
  - Cancellation policies are reference data that define standard cancellation terms
  - Each policy can contain multiple rules, allowing for tiered penalty structures (e.g., 0% penalty if cancelled 30+ days before, 50% penalty if cancelled 7-29 days before, 100% penalty if cancelled less than 7 days before)
  - The `rules` array is ordered by `daysBeforeCheckIn` in descending order (most restrictive rules first)
  - When a cancellation occurs, the system matches the cancellation date against the policy's rules to determine the applicable penalty
  - Partners assign cancellation policies to their hotels during hotel configuration
  - Policies cannot be created, updated, or deleted through the API - they are managed by administrators through the database

---

### Cancellation Rules

#### 1. Get All Cancellation Rules

**GET** `/policy/cancellation-rules`

- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can view all cancellation rules to understand penalty structures when configuring hotel settings
  - **ADMIN**: Can view all cancellation rules for management and reference purposes
- **Description**: Retrieves a list of all cancellation rules available in the system. Cancellation rules define individual penalty conditions based on the number of days before check-in. Each rule specifies how many days before check-in it applies to and the corresponding penalty percentage. Rules can be associated with one or more cancellation policies. This endpoint returns all rules independently, which is useful for understanding the available penalty structures. The list is not paginated as it typically contains a small number of reference data items.
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Unique identifier of the cancellation rule",
      "daysBeforeCheckIn": "integer (non-negative) - Number of days before the check-in date that this rule applies to. For example, a value of 7 means this rule applies to cancellations made 7 or more days before check-in. The system matches cancellations to rules by finding the rule with the largest daysBeforeCheckIn value that is less than or equal to the actual days before check-in",
      "penaltyPercentage": "integer (0-100) - Percentage of the total booking amount that will be charged as a penalty if cancellation occurs within the specified number of days before check-in. A value of 0 means no penalty (free cancellation), while a value of 100 means full penalty (non-refundable). For example, a value of 50 means 50% of the booking amount will be charged as penalty"
    }
  ]
}
```

- **Notes**:
  - Cancellation rules are individual penalty conditions that can be grouped into cancellation policies
  - The same rule can be used in multiple cancellation policies
  - When evaluating a cancellation, the system finds the applicable rule by matching the days before check-in to the rule with the highest `daysBeforeCheckIn` value that is less than or equal to the actual cancellation timing
  - Rules are typically returned sorted by `daysBeforeCheckIn` in descending order
  - Rules cannot be created, updated, or deleted through the API - they are managed by administrators through the database

---

### Reschedule Policies

#### 1. Get All Reschedule Policies

**GET** `/policy/reschedule-policies`

- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can view all reschedule policies to select appropriate policies when configuring hotel settings
  - **ADMIN**: Can view all reschedule policies for management and configuration purposes
- **Description**: Retrieves a list of all reschedule policies available in the system. Reschedule policies define the rules and fees that apply when a booking is rescheduled (changed to different dates). Each policy contains a name, description, and a collection of rules that specify fee percentages based on how many days before check-in the reschedule request occurs. Partners use this endpoint to view available reschedule policies when configuring their hotels, while administrators use it for policy management. The list is not paginated as it typically contains a small number of reference data items.
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Unique identifier of the reschedule policy",
      "name": "string - Name of the reschedule policy (e.g., 'Flexible Reschedule', 'Moderate Reschedule', 'Strict Reschedule', 'No Reschedule Allowed')",
      "description": "string - Detailed description of the reschedule policy, explaining the general terms and conditions for changing booking dates",
      "rules": [
        {
          "id": "string (UUID) - Unique identifier of the reschedule rule",
          "daysBeforeCheckIn": "integer (non-negative) - Number of days before the original check-in date that this rule applies to. For example, if this value is 7, the rule applies to reschedule requests made 7 or more days before the original check-in date",
          "feePercentage": "integer (0-100) - Percentage of the total booking amount that will be charged as a reschedule fee if the request occurs within the specified number of days before the original check-in date. For example, a value of 25 means 25% of the booking amount will be charged as a reschedule fee. A value of 100 typically means reschedule is not allowed within that timeframe"
        }
      ]
    }
  ]
}
```

- **Notes**:
  - Reschedule policies are reference data that define standard reschedule terms
  - Each policy can contain multiple rules, allowing for tiered fee structures (e.g., 0% fee if rescheduled 30+ days before, 25% fee if rescheduled 7-29 days before, 100% fee if rescheduled less than 7 days before)
  - The `rules` array is ordered by `daysBeforeCheckIn` in descending order (most restrictive rules first)
  - When a reschedule request occurs, the system matches the request date against the policy's rules to determine the applicable fee
  - Partners assign reschedule policies to their hotels during hotel configuration
  - Reschedule fees are typically lower than cancellation penalties, as rescheduling maintains the booking while cancellation voids it
  - Policies cannot be created, updated, or deleted through the API - they are managed by administrators through the database

---

### Reschedule Rules

#### 1. Get All Reschedule Rules

**GET** `/policy/reschedule-rules`

- **Role Required**: PARTNER, ADMIN
  - **PARTNER**: Can view all reschedule rules to understand fee structures when configuring hotel settings
  - **ADMIN**: Can view all reschedule rules for management and reference purposes
- **Description**: Retrieves a list of all reschedule rules available in the system. Reschedule rules define individual fee conditions based on the number of days before the original check-in date. Each rule specifies how many days before check-in it applies to and the corresponding fee percentage. Rules can be associated with one or more reschedule policies. This endpoint returns all rules independently, which is useful for understanding the available fee structures. The list is not paginated as it typically contains a small number of reference data items.
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Unique identifier of the reschedule rule",
      "daysBeforeCheckIn": "integer (non-negative) - Number of days before the original check-in date that this rule applies to. For example, a value of 7 means this rule applies to reschedule requests made 7 or more days before the original check-in date. The system matches reschedule requests to rules by finding the rule with the largest daysBeforeCheckIn value that is less than or equal to the actual days before the original check-in date",
      "feePercentage": "integer (0-100) - Percentage of the total booking amount that will be charged as a reschedule fee if the request occurs within the specified number of days before the original check-in date. A value of 0 means no fee (free reschedule), while a value of 100 typically means reschedule is not allowed within that timeframe. For example, a value of 25 means 25% of the booking amount will be charged as a reschedule fee"
    }
  ]
}
```

- **Notes**:
  - Reschedule rules are individual fee conditions that can be grouped into reschedule policies
  - The same rule can be used in multiple reschedule policies
  - When evaluating a reschedule request, the system finds the applicable rule by matching the days before the original check-in date to the rule with the highest `daysBeforeCheckIn` value that is less than or equal to the actual reschedule request timing
  - Rules are typically returned sorted by `daysBeforeCheckIn` in descending order
  - Reschedule fees are generally lower than cancellation penalties to incentivize maintaining bookings rather than cancelling them
  - A `feePercentage` of 100 typically indicates that rescheduling is not allowed within that timeframe, effectively making it equivalent to a cancellation with full penalty
  - Rules cannot be created, updated, or deleted through the API - they are managed by administrators through the database

---

## Documents

### Identification Documents

#### 1. Get All Identification Documents

**GET** `/document/identification-documents`

- **Role Required**: PARTNER, ADMIN
- **Description**: Retrieves a list of all identification document types in the system. Identification documents are reference data used to specify what types of identification documents are required or accepted for hotel policies (e.g., "Passport", "National ID", "Driver's License", "Visa"). This endpoint returns a simple list of all available identification document types with their IDs and names. The list is not paginated as it typically contains a small number of reference data items. Only partners and administrators can access this endpoint as it is used in hotel policy configuration.
- **Query Parameters**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Identification document type ID",
      "name": "string (required, unique) - Identification document type name (e.g., 'Passport', 'National ID', 'Driver's License', 'Visa')"
    }
  ]
}
```

- **Notes**:
  - **Reference Data**: Identification document types are reference data used in hotel policies to specify what types of identification documents guests must provide
  - **Role Restriction**: Only PARTNER and ADMIN roles can access this endpoint. Regular users (USER role) cannot access this endpoint
  - **No Pagination**: This endpoint returns all identification document types without pagination as the dataset is typically small (reference data)
  - **Ordering**: The order of results is not guaranteed and may vary between requests. If a specific order is needed, the client should sort the results
  - **Usage**: Identification document types are used when configuring hotel policies to specify which identification documents are required for check-in
  - **Uniqueness**: Identification document type names must be unique across the system
  - **Read-Only**: This endpoint is read-only. Identification document types are typically managed by administrators through separate administrative endpoints (not exposed in this API)
  - **Performance**: This endpoint uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance
  - **Hotel Policy Integration**: These document types are referenced in hotel policies through the `HotelPolicyIdentificationDocument` relationship table

---

## Special Days

Special days are calendar events that can be associated with discounts and used for promotional campaigns (e.g., "New Year's Day", "Valentine's Day", "National Day", "Holiday Season"). Special days can be linked to discounts, allowing administrators to create time-limited promotions. Each date can only have one special day assigned to it.

### 1. Create Special Day

**POST** `/special-days`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Creates a new special day in the system. Special days are calendar events that can be associated with discounts for promotional campaigns. The date must be unique - each date can only have one special day assigned. After creation, the special day can be associated with discounts using the discount creation/update endpoints. Special days are useful for creating time-limited promotional campaigns around holidays, events, or special occasions.
- **Request Body**:

```json
{
  "date": "date (required, not null, ISO format: YYYY-MM-DD) - The calendar date for this special day. Must be unique across all special days",
  "name": "string (required, not blank) - Name of the special day (e.g., 'New Year's Day', 'Valentine's Day', 'Summer Sale', 'Black Friday')"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Unique identifier of the special day",
    "date": "date (ISO format: YYYY-MM-DD) - The calendar date for this special day",
    "name": "string - Name of the special day"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid date format, missing required fields, or validation errors
  - **409 Conflict**: A special day with the same date already exists (`SPECIAL_DAY_EXISTS` error)

- **Notes**:
  - The `date` field must be unique across all special days. If a special day with the same date already exists, the creation will fail with a conflict error
  - Both `date` and `name` are required fields and cannot be null or blank
  - After creation, you can associate discounts with this special day using the discount creation/update endpoints with the `special-day-id` query parameter
  - Special days are typically used for promotional campaigns and time-limited offers
  - The date format must follow ISO 8601 standard (YYYY-MM-DD)

### 2. Get All Special Days

**GET** `/special-days`

- **Role Required**: Public (no authentication required)
- **Description**: Retrieves a list of all special days in the system. This endpoint returns all special days without any filtering or pagination, as it typically contains a manageable number of reference data items. Special days are publicly visible so that users can see what special dates have associated promotions. The list is not sorted in any particular order, but results are typically returned in the order they are stored in the database.
- **Query Parameters**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "id": "string (UUID) - Unique identifier of the special day",
      "date": "date (ISO format: YYYY-MM-DD) - The calendar date for this special day",
      "name": "string - Name of the special day (e.g., 'New Year's Day', 'Valentine's Day', 'Summer Sale')"
    }
  ]
}
```

- **Notes**:
  - **No Pagination**: This endpoint returns all special days without pagination as the dataset is typically small (reference data)
  - **No Filtering**: This endpoint does not support filtering by date range or name. All special days are returned
  - **Public Access**: This endpoint is publicly accessible (no authentication required) to allow users to see available special days and associated promotions
  - **Ordering**: The order of results is not guaranteed and may vary between requests. If a specific order is needed (e.g., by date), the client should sort the results
  - **Performance**: Uses read-only transaction (`@Transactional(readOnly = true)`) for optimal database performance
  - **Usage**: Commonly used to display special days in calendars, promotional pages, or when creating discounts that are associated with special days
  - **Empty Result**: If no special days exist, returns an empty array `[]`

### 3. Update Special Day

**PUT** `/special-days/{id}`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Updates an existing special day. Supports partial updates - only provided fields will be updated. The date can be changed, but the new date must be unique (not already assigned to another special day). If the date is changed, any associated discounts will continue to reference the special day by its ID, so the relationship is maintained.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Unique identifier of the special day to update
- **Request Body** (all fields optional):

```json
{
  "date": "date (optional, ISO format: YYYY-MM-DD) - New calendar date for this special day. If changed, must be unique (not already assigned to another special day)",
  "name": "string (optional, not blank if provided) - New name for the special day"
}
```

- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Unique identifier of the special day (unchanged)",
    "date": "date (ISO format: YYYY-MM-DD) - Updated date if provided, otherwise original date",
    "name": "string - Updated name if provided, otherwise original name"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid date format, validation errors, or new date conflicts with existing special day
  - **404 Not Found**: Special day with the specified ID does not exist (`SPECIAL_DAY_NOT_FOUND` error)
  - **409 Conflict**: If updating the date and a special day with the new date already exists (`SPECIAL_DAY_EXISTS` error)

- **Notes**:
  - **Partial Updates**: Only fields provided in the request body will be updated. Fields not provided will remain unchanged
  - **Date Uniqueness**: If the `date` is being changed, the new date must be unique. If another special day with the same date already exists, the update will fail with a conflict error
  - **Validation**: If `name` is provided, it cannot be blank (empty string). If you want to keep the existing name, simply omit the field from the request
  - **Associated Discounts**: Updating a special day does not affect associated discounts. Discounts are linked by special day ID, so they will continue to reference the updated special day
  - **Empty Request Body**: If an empty request body is sent, no fields will be updated and the original special day data will be returned unchanged

### 4. Delete Special Day

**DELETE** `/special-days/{id}`

- **Role Required**: ADMIN
- **Description**: Permanently deletes a special day from the system. A special day can only be deleted if it is not associated with any discounts. This is a safety measure to prevent breaking existing discount configurations. If the special day has associated discounts, the deletion will fail with an error indicating that discounts must be removed first.
- **Path Parameters**:
  - `id`: string (required, UUID format) - Unique identifier of the special day to delete
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "id": "string (UUID) - Unique identifier of the deleted special day",
    "date": "date (ISO format: YYYY-MM-DD) - Date of the deleted special day",
    "name": "string - Name of the deleted special day"
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Cannot delete special day because it has associated discounts (`CANNOT_DELETE_SPECIAL_DAY_HAS_DISCOUNTS` error)
  - **404 Not Found**: Special day with the specified ID does not exist (`SPECIAL_DAY_NOT_FOUND` error)

- **Notes**:
  - **Deletion Constraints**: A special day cannot be deleted if it has any associated discounts. Before deletion, you must either:
    - Remove all discounts associated with this special day (by updating or deleting the discounts), OR
    - Disassociate discounts from this special day (by updating the discounts to remove the special day association)
  - **Cascade Behavior**: The deletion does not cascade to associated discounts. All discounts must be handled separately before the special day can be deleted
  - **Response**: Returns the deleted special day data before deletion, allowing the client to confirm what was deleted
  - **Destructive Operation**: This is a destructive operation and cannot be undone. Once deleted, the special day and its associations are permanently removed
  - **Check Before Deletion**: The system automatically checks if the special day has associated discounts and prevents deletion if any exist
  - **Use Case**: Consider setting associated discounts to inactive or updating them to remove the special day association instead of deleting the special day if you want to preserve historical data

### Notes on Special Days

- **Uniqueness**: Each date can only have one special day assigned. The `date` field must be unique across all special days
- **Discount Association**: Special days can be associated with discounts using the discount creation/update endpoints with the `special-day-id` query parameter
- **Reference Data**: Special days are reference data used throughout the system for promotional campaigns and time-limited offers
- **Public Visibility**: Special days are publicly visible (GET endpoint is public) so users can see available special dates and associated promotions
- **Administrative Management**: Only administrators can create, update, or delete special days. Regular users and partners can only view them
- **Date Format**: All dates use ISO 8601 format (YYYY-MM-DD)
- **Validation**: Special day names cannot be blank and dates must be valid calendar dates

---

## Partner Reports

All partner report endpoints support optional period comparison. When both `compare-from` and `compare-to` query parameters are provided, the response will include comparison data showing differences and percentage changes between the current period and the comparison period.

**Role Required**: PARTNER

Partners can only access reports for hotels they own. Hotel ownership is validated in the service layer based on the authenticated partner's ID.

**Data Source**: Reports use pre-aggregated data from `HotelDailyReport` and `RoomDailyPerformance` tables for optimal performance. Data is typically up-to-date until the end of the previous day.

**Date Range Validation**: `from` must be less than or equal to `to`. Similarly, `compare-from` must be less than or equal to `compare-to` when provided. If only one comparison parameter is provided, it is ignored.

### 1. Revenue Report

**GET** `/partner/reports/revenue`

- **Role Required**: PARTNER
  - **PARTNER**: Can only access revenue reports for hotels they own (ownership is validated in service layer)
- **Description**: Retrieves revenue data for a specific hotel over a specified date range. This endpoint provides detailed revenue insights grouped by day, week, or month, allowing partners to analyze revenue trends, identify peak periods, and compare performance across different time periods. Revenue is calculated from completed bookings only (bookings with status `completed`). The data is grouped according to the `group-by` parameter, and optionally supports period comparison to track revenue growth or decline.
- **Query Parameters**:
  - `hotel-id`: string (required, not blank, UUID format) - ID of the hotel to get revenue report for. The hotel must be owned by the authenticated partner
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `group-by`: string (optional, default: "day") - How to group the revenue data. Valid values: `day`, `week`, `month`
    - `day`: Groups revenue by individual days
    - `week`: Groups revenue by weeks (Monday to Sunday)
    - `month`: Groups revenue by calendar months
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "period": "date (ISO format: YYYY-MM-DD) - The date, week start date, or month start date depending on group-by",
        "revenue": "number (non-negative, rounded to 2 decimal places) - Total revenue for this period from completed bookings"
      }
    ],
    "summary": {
      "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Sum of all revenue data points in the report period"
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
      "data": [
        {
          "period": "date (ISO format: YYYY-MM-DD)",
          "revenue": "number (non-negative, rounded to 2 decimal places)"
        }
      ],
      "summary": {
        "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue for the current period"
      }
    },
    "previousPeriod": {
      "data": [
        {
          "period": "date (ISO format: YYYY-MM-DD)",
          "revenue": "number (non-negative, rounded to 2 decimal places)"
        }
      ],
      "summary": {
        "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue for the comparison period"
      }
    },
    "comparison": {
      "totalRevenueDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.totalRevenue - previousPeriod.totalRevenue",
      "totalRevenuePercentageChange": "number (rounded to 2 decimal places) - Percentage change: ((currentPeriod.totalRevenue - previousPeriod.totalRevenue) / previousPeriod.totalRevenue) * 100. Can be positive (growth) or negative (decline)"
    }
  }
}
```

- **Notes**:
  - Revenue is calculated only from bookings with status `completed`
  - The `period` field in data points represents the start of the grouping period (e.g., for `group-by=week`, it shows the Monday of that week)
  - When comparison parameters are provided, both periods should ideally have the same length for meaningful comparisons
  - If no revenue data exists for the period, the response will contain empty arrays and zero totals
  - Percentage change is calculated relative to the previous period. If previous period revenue is zero, percentage change will be 0 or undefined

### 2. Bookings Summary Report

**GET** `/partner/reports/bookings/summary`

- **Role Required**: PARTNER
  - **PARTNER**: Can only access booking summaries for hotels they own (ownership is validated in service layer)
- **Description**: Retrieves a summary of booking statistics for a specific hotel over a specified date range. This endpoint provides key booking metrics including total bookings created, completed bookings, cancelled bookings, and cancellation rate. It helps partners understand booking volume, completion rates, and identify potential issues with cancellations. The endpoint optionally supports period comparison to track booking trends over time.
- **Query Parameters**:
  - `hotel-id`: string (required, not blank, UUID format) - ID of the hotel to get booking summary for. The hotel must be owned by the authenticated partner
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalCreated": "integer (non-negative) - Total number of bookings created in the period (all statuses)",
    "totalCompleted": "integer (non-negative) - Total number of bookings that were completed (status: completed)",
    "totalCancelled": "integer (non-negative) - Total number of bookings that were cancelled (status: cancelled)",
    "cancellationRate": "number (0-100, rounded to 2 decimal places) - Percentage of bookings that were cancelled: (totalCancelled / totalCreated) * 100"
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
      "totalCreated": "integer (non-negative)",
      "totalCompleted": "integer (non-negative)",
      "totalCancelled": "integer (non-negative)",
      "cancellationRate": "number (0-100, rounded to 2 decimal places)"
    },
    "previousPeriod": {
      "totalCreated": "integer (non-negative)",
      "totalCompleted": "integer (non-negative)",
      "totalCancelled": "integer (non-negative)",
      "cancellationRate": "number (0-100, rounded to 2 decimal places)"
    },
    "comparison": {
      "totalCreatedDifference": "integer - Absolute difference: currentPeriod.totalCreated - previousPeriod.totalCreated",
      "totalCreatedPercentageChange": "number (rounded to 2 decimal places) - Percentage change for totalCreated",
      "totalCompletedDifference": "integer - Absolute difference: currentPeriod.totalCompleted - previousPeriod.totalCompleted",
      "totalCompletedPercentageChange": "number (rounded to 2 decimal places) - Percentage change for totalCompleted",
      "totalCancelledDifference": "integer - Absolute difference: currentPeriod.totalCancelled - previousPeriod.totalCancelled",
      "totalCancelledPercentageChange": "number (rounded to 2 decimal places) - Percentage change for totalCancelled",
      "cancellationRateDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.cancellationRate - previousPeriod.cancellationRate",
      "cancellationRatePercentageChange": "number (rounded to 2 decimal places) - Percentage change for cancellationRate"
    }
  }
}
```

- **Notes**:
  - Bookings are counted based on their creation date within the specified period
  - `totalCreated` includes all bookings regardless of their final status
  - `totalCompleted` counts only bookings that reached `completed` status
  - `totalCancelled` counts only bookings that reached `cancelled` status
  - Cancellation rate is calculated as a percentage of total created bookings
  - If `totalCreated` is 0 in a period, the cancellation rate will be 0

### 3. Occupancy Report

**GET** `/partner/reports/occupancy`

- **Role Required**: PARTNER
  - **PARTNER**: Can only access occupancy reports for hotels they own (ownership is validated in service layer)
- **Description**: Retrieves occupancy rate data for a specific hotel over a specified date range. This endpoint provides daily occupancy rates, showing the percentage of available rooms that were occupied on each day. Occupancy rate is a critical metric for hotels as it directly impacts revenue potential. The report includes both daily data points and summary statistics including average occupancy rate and total occupied/available room nights.
- **Query Parameters**:
  - `hotel-id`: string (required, not blank, UUID format) - ID of the hotel to get occupancy report for. The hotel must be owned by the authenticated partner
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "date": "date (ISO format: YYYY-MM-DD) - The specific date",
        "occupancyRate": "number (0-100, rounded to 2 decimal places) - Occupancy rate for this date: (occupiedRooms / availableRooms) * 100"
      }
    ],
    "summary": {
      "averageRate": "number (0-100, rounded to 2 decimal places) - Average occupancy rate across all dates in the period",
      "totalOccupied": "integer (non-negative) - Total number of room nights occupied across all dates",
      "totalAvailable": "integer (non-negative) - Total number of room nights available across all dates"
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
      "data": [
        {
          "date": "date (ISO format: YYYY-MM-DD)",
          "occupancyRate": "number (0-100, rounded to 2 decimal places)"
        }
      ],
      "summary": {
        "averageRate": "number (0-100, rounded to 2 decimal places)",
        "totalOccupied": "integer (non-negative)",
        "totalAvailable": "integer (non-negative)"
      }
    },
    "previousPeriod": {
      "data": [
        {
          "date": "date (ISO format: YYYY-MM-DD)",
          "occupancyRate": "number (0-100, rounded to 2 decimal places)"
        }
      ],
      "summary": {
        "averageRate": "number (0-100, rounded to 2 decimal places)",
        "totalOccupied": "integer (non-negative)",
        "totalAvailable": "integer (non-negative)"
      }
    },
    "comparison": {
      "averageRateDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.summary.averageRate - previousPeriod.summary.averageRate",
      "averageRatePercentageChange": "number (rounded to 2 decimal places) - Percentage change for average occupancy rate",
      "totalOccupiedDifference": "integer - Absolute difference: currentPeriod.summary.totalOccupied - previousPeriod.summary.totalOccupied",
      "totalOccupiedPercentageChange": "number (rounded to 2 decimal places) - Percentage change for total occupied room nights"
    }
  }
}
```

- **Notes**:
  - Occupancy rate is calculated daily based on room inventory availability and bookings
  - Occupied rooms are calculated from bookings with check-in dates matching the date
  - Available rooms are calculated from room inventory for that date
  - If no rooms are available on a date, occupancy rate will be 0
  - The average rate in summary is calculated across all dates in the period, not as a simple average of daily rates

### 4. Room Performance Report

**GET** `/partner/reports/rooms/performance`

- **Role Required**: PARTNER
  - **PARTNER**: Can only access room performance reports for hotels they own (ownership is validated in service layer)
- **Description**: Retrieves performance metrics for individual rooms in a specific hotel over a specified date range. This endpoint helps partners identify which rooms are generating the most revenue and have the highest booking activity. Performance is measured by total revenue generated and total booked nights. Results can be sorted by revenue or booked nights to identify top-performing rooms.
- **Query Parameters**:
  - `hotel-id`: string (required, not blank, UUID format) - ID of the hotel to get room performance report for. The hotel must be owned by the authenticated partner
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `sort-by`: string (optional, default: "revenue") - Field to sort rooms by. Valid values: `revenue`, `bookedNights`
    - `revenue`: Sort by total revenue (descending by default)
    - `bookedNights`: Sort by total booked nights (descending by default)
  - `sort-dir`: string (optional, default: "desc") - Sort direction. Valid values: `asc`, `desc`
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "roomId": "string (UUID) - Unique identifier of the room",
      "roomName": "string - Name of the room (e.g., 'Deluxe Double Room')",
      "roomView": "string - View description of the room (e.g., 'Ocean View', 'City View')",
      "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue generated by this room from completed bookings in the period",
      "totalBookedNights": "integer (non-negative) - Total number of nights this room was booked for in the period"
    }
  ]
}
```

- **Response** (with comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": [
    {
      "roomId": "string (UUID)",
      "roomName": "string",
      "roomView": "string",
      "currentTotalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue in current period",
      "currentTotalBookedNights": "integer (non-negative) - Total booked nights in current period",
      "previousTotalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue in comparison period",
      "previousTotalBookedNights": "integer (non-negative) - Total booked nights in comparison period",
      "totalRevenueDifference": "number (rounded to 2 decimal places) - Absolute difference: currentTotalRevenue - previousTotalRevenue",
      "totalRevenuePercentageChange": "number (rounded to 2 decimal places) - Percentage change for revenue",
      "totalBookedNightsDifference": "integer - Absolute difference: currentTotalBookedNights - previousTotalBookedNights",
      "totalBookedNightsPercentageChange": "number (rounded to 2 decimal places) - Percentage change for booked nights"
    }
  ]
}
```

- **Notes**:
  - Only rooms with bookings in the period are included in the results
  - Revenue is calculated only from completed bookings
  - Booked nights are counted from all booking statuses (including cancelled, as they represent potential occupancy)
  - Rooms are sorted by the specified `sort-by` field in the specified direction
  - If a room exists in one period but not the other during comparison, missing values will be 0

### 5. Customer Summary Report

**GET** `/partner/reports/customers/summary`

- **Role Required**: PARTNER
  - **PARTNER**: Can only access customer summaries for hotels they own (ownership is validated in service layer)
- **Description**: Retrieves customer segmentation statistics for a specific hotel over a specified date range. This endpoint helps partners understand their customer base by distinguishing between new customers (first-time bookers) and returning customers (repeat bookers). Understanding customer loyalty and repeat business is crucial for marketing strategies and identifying opportunities for customer retention programs.
- **Query Parameters**:
  - `hotel-id`: string (required, not blank, UUID format) - ID of the hotel to get customer summary for. The hotel must be owned by the authenticated partner
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalNewCustomerBookings": "integer (non-negative) - Total number of bookings made by customers who have never booked this hotel before",
    "totalReturningCustomerBookings": "integer (non-negative) - Total number of bookings made by customers who have booked this hotel at least once before",
    "totalCompletedBookings": "integer (non-negative) - Total number of completed bookings in the period",
    "newCustomerPercentage": "number (0-100, rounded to 2 decimal places) - Percentage of new customer bookings: (totalNewCustomerBookings / totalCompletedBookings) * 100",
    "returningCustomerPercentage": "number (0-100, rounded to 2 decimal places) - Percentage of returning customer bookings: (totalReturningCustomerBookings / totalCompletedBookings) * 100"
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
      "totalNewCustomerBookings": "integer (non-negative)",
      "totalReturningCustomerBookings": "integer (non-negative)",
      "totalCompletedBookings": "integer (non-negative)",
      "newCustomerPercentage": "number (0-100, rounded to 2 decimal places)",
      "returningCustomerPercentage": "number (0-100, rounded to 2 decimal places)"
    },
    "previousPeriod": {
      "totalNewCustomerBookings": "integer (non-negative)",
      "totalReturningCustomerBookings": "integer (non-negative)",
      "totalCompletedBookings": "integer (non-negative)",
      "newCustomerPercentage": "number (0-100, rounded to 2 decimal places)",
      "returningCustomerPercentage": "number (0-100, rounded to 2 decimal places)"
    },
    "comparison": {
      "totalNewCustomerBookingsDifference": "integer - Absolute difference for new customer bookings",
      "totalNewCustomerBookingsPercentageChange": "number (rounded to 2 decimal places) - Percentage change for new customer bookings",
      "totalReturningCustomerBookingsDifference": "integer - Absolute difference for returning customer bookings",
      "totalReturningCustomerBookingsPercentageChange": "number (rounded to 2 decimal places) - Percentage change for returning customer bookings",
      "totalCompletedBookingsDifference": "integer - Absolute difference for total completed bookings",
      "totalCompletedBookingsPercentageChange": "number (rounded to 2 decimal places) - Percentage change for total completed bookings"
    }
  }
}
```

- **Notes**:
  - Customer classification is based on booking history with the specific hotel, not across all hotels in the system
  - A customer is considered "returning" if they have at least one completed booking with this hotel before the current period
  - Only completed bookings are counted in this report
  - Percentages are calculated based on total completed bookings and should sum to 100% (within rounding)
  - If `totalCompletedBookings` is 0, percentages will be 0

### 6. Review Summary Report

**GET** `/partner/reports/reviews/summary`

- **Role Required**: PARTNER
  - **PARTNER**: Can only access review summaries for hotels they own (ownership is validated in service layer)
- **Description**: Retrieves review and rating statistics for a specific hotel over a specified date range. This endpoint provides insights into customer satisfaction by showing average review scores and the distribution of ratings. Understanding review patterns helps partners identify areas for improvement and track satisfaction trends over time.
- **Query Parameters**:
  - `hotel-id`: string (required, not blank, UUID format) - ID of the hotel to get review summary for. The hotel must be owned by the authenticated partner
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalReviews": "integer (non-negative) - Total number of reviews submitted in the period",
    "averageScore": "number (1-10, rounded to 2 decimal places) - Average review score across all reviews in the period",
    "scoreDistribution": [
      {
        "scoreBucket": "string - Score range bucket (e.g., '9-10', '7-8', '5-6', '3-4', '1-2')",
        "reviewCount": "integer (non-negative) - Number of reviews falling within this score range"
      }
    ]
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
      "totalReviews": "integer (non-negative)",
      "averageScore": "number (1-10, rounded to 2 decimal places)",
      "scoreDistribution": [
        {
          "scoreBucket": "string",
          "reviewCount": "integer (non-negative)"
        }
      ]
    },
    "previousPeriod": {
      "totalReviews": "integer (non-negative)",
      "averageScore": "number (1-10, rounded to 2 decimal places)",
      "scoreDistribution": [
        {
          "scoreBucket": "string",
          "reviewCount": "integer (non-negative)"
        }
      ]
    },
    "comparison": {
      "totalReviewsDifference": "integer - Absolute difference for total reviews",
      "totalReviewsPercentageChange": "number (rounded to 2 decimal places) - Percentage change for total reviews",
      "averageScoreDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.averageScore - previousPeriod.averageScore",
      "averageScorePercentageChange": "number (rounded to 2 decimal places) - Percentage change for average score"
    }
  }
}
```

- **Notes**:
  - Reviews are counted based on their submission date within the specified period
  - Score distribution buckets are: "9-10" (excellent), "7-8" (good), "5-6" (average), "3-4" (poor), "1-2" (very poor)
  - Average score is calculated from all reviews in the period, regardless of score bucket
  - If no reviews exist for the period, `totalReviews` will be 0 and `averageScore` will be 0
  - Score distribution will always include all buckets, even if count is 0

### 7. Generate All Daily Reports

**POST** `/partner/reports/generate-all`

- **Role Required**: PARTNER
  - **PARTNER**: Can generate daily reports for all hotels they own
- **Description**: Manually triggers the daily report generation process for all historical data in the system, but only for hotels owned by the authenticated partner. This endpoint processes all dates from the earliest booking date to the latest, generating `HotelDailyReport` and `RoomDailyPerformance` records for each date. This is useful for initial system setup or when regenerating reports after data corrections. Note: This operation may take a significant amount of time depending on the volume of historical data.
- **Request Body**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalDates": "integer - Total number of dates processed",
    "successCount": "integer - Number of dates successfully processed",
    "failureCount": "integer - Number of dates that failed to process",
    "minDate": "date (ISO format: YYYY-MM-DD) - Earliest date processed",
    "maxDate": "date (ISO format: YYYY-MM-DD) - Latest date processed",
    "errors": [
      "string (error messages, max 10 errors) - Array of error messages from failed date processing"
    ]
  }
}
```

- **Notes**:
  - This endpoint processes all dates from the earliest to the latest date found in bookings for hotels owned by the partner
  - Each date is processed in a separate transaction. If one date fails, others continue processing
  - The response includes a summary of total dates processed, success/failure counts, and up to 10 error messages
  - This operation may take a long time depending on the amount of historical data
  - Should be run before `POST /admin/reports/generate-all` to ensure HotelDailyReport data is available for system-wide reports

### Notes on Partner Reports

- **Period Comparison**: All partner report endpoints support optional period comparison. When both `compare-from` and `compare-to` are provided, the response includes comparison data. If only one is provided, it is ignored and the endpoint returns normal response.
- **Data Source**: Reports use pre-aggregated data from `HotelDailyReport` and `RoomDailyPerformance` tables for optimal performance. Data is typically up-to-date until the end of the previous day.
- **Date Range Validation**: `from` must be less than or equal to `to`. Similarly, `compare-from` must be less than or equal to `compare-to` when provided.
- **Empty Data**: If no data exists for the requested period, endpoints return `200 OK` with zero values or empty arrays, not `404 Not Found`.
- **Currency Rounding**: All financial values are rounded to 2 decimal places.
- **Hotel Ownership**: Partners can only access reports for hotels they own. Attempting to access reports for other hotels will result in an authorization error.

---

## Admin Reports

All admin report endpoints support period comparison. When `compare-from` and `compare-to` parameters are provided, the response will include comparison data showing differences and percentage changes between the current period and the comparison period.

**Role Required**: ADMIN

### 1. Revenue Report

**GET** `/admin/reports/revenue`

- **Role Required**: ADMIN
  - **ADMIN**: Can access revenue reports for all hotels in the system
- **Description**: Retrieves aggregated revenue data for the entire system over a specified date range. This endpoint provides comprehensive revenue insights at the platform level, allowing admins to analyze system-wide revenue trends, identify peak periods, and compare performance across different time periods. Revenue is calculated from completed bookings only (bookings with status `completed`). The data can be grouped by day, week, or month according to the `group-by` parameter. Additionally, the endpoint supports filtering and breakdown by hotel, city, or province to provide detailed revenue analysis by different dimensions. When `filter-by` is provided, the response includes a paginated breakdown showing revenue for each item in the selected dimension. The endpoint optionally supports period comparison to track revenue growth or decline between two time periods.
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `group-by`: string (optional, default: "day") - How to group the revenue data. Valid values: `day`, `week`, `month`
    - `day`: Groups revenue by individual days
    - `week`: Groups revenue by weeks (Monday to Sunday)
    - `month`: Groups revenue by calendar months
  - `filter-by`: string (optional) - Dimension to filter and breakdown revenue by. Valid values: `hotel`, `city`, `province`
    - `hotel`: Provides revenue breakdown by individual hotels
    - `city`: Provides revenue breakdown by cities
    - `province`: Provides revenue breakdown by provinces
    - When provided, the `breakdown` array in the response will be populated with paginated results
    - When not provided, the `breakdown` array will be `null`
  - `page`: integer (optional, default: 0, minimum: 0) - Page number for pagination (0-indexed). Only used when `filter-by` is provided. Determines which page of the breakdown results to return
  - `size`: integer (optional, default: 10, minimum: 1) - Page size for pagination. Only used when `filter-by` is provided. Determines how many items to return per page in the breakdown
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`. If only one comparison parameter is provided, the request will fail with a validation error
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`. If only one comparison parameter is provided, the request will fail with a validation error
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "period": "date (ISO format: YYYY-MM-DD) - The date, week start date, or month start date depending on group-by",
        "revenue": "number (non-negative, rounded to 2 decimal places) - Total revenue for this period from completed bookings across all hotels"
      }
    ],
    "summary": {
      "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Sum of all revenue data points in the report period (total system revenue)"
    },
    "breakdown": [
      {
        "filterId": "string (UUID) - Unique identifier of the filter dimension item (hotel ID, city ID, or province ID)",
        "filterName": "string - Name of the filter dimension item (hotel name, city name, or province name)",
        "revenue": "number (non-negative, rounded to 2 decimal places) - Total revenue for this item from completed bookings in the period"
      }
    ]
  }
}
```

**Note**: The `breakdown` array is only populated when `filter-by` parameter is provided. When `filter-by` is not provided, `breakdown` will be `null`. The breakdown results are paginated when `filter-by` is provided, using the `page` and `size` parameters.

- **Response** (with comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "currentPeriod": {
      "data": [
        {
          "period": "date (ISO format: YYYY-MM-DD)",
          "revenue": "number (non-negative, rounded to 2 decimal places)"
        }
      ],
      "summary": {
        "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue for the current period"
      },
      "breakdown": [
        {
          "filterId": "string (UUID)",
          "filterName": "string",
          "revenue": "number (non-negative, rounded to 2 decimal places)"
        }
      ]
    },
    "previousPeriod": {
      "data": [
        {
          "period": "date (ISO format: YYYY-MM-DD)",
          "revenue": "number (non-negative, rounded to 2 decimal places)"
        }
      ],
      "summary": {
        "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue for the comparison period"
      },
      "breakdown": [
        {
          "filterId": "string (UUID)",
          "filterName": "string",
          "revenue": "number (non-negative, rounded to 2 decimal places)"
        }
      ]
    },
    "comparison": {
      "totalRevenueDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.summary.totalRevenue - previousPeriod.summary.totalRevenue",
      "totalRevenuePercentageChange": "number (rounded to 2 decimal places) - Percentage change: ((currentPeriod.summary.totalRevenue - previousPeriod.summary.totalRevenue) / previousPeriod.summary.totalRevenue) * 100. Can be positive (growth) or negative (decline)"
    }
  }
}
```

- **Notes**:
  - Revenue is calculated only from bookings with status `completed`
  - The `period` field in data points represents the start of the grouping period (e.g., for `group-by=week`, it shows the Monday of that week)
  - When `filter-by` is provided, the `breakdown` array contains paginated results. Use `page` and `size` parameters to navigate through pages
  - The `breakdown` array is sorted by revenue in descending order (highest revenue first)
  - When comparison parameters are provided, both periods should ideally have the same length for meaningful comparisons
  - If no revenue data exists for the period, the response will contain empty arrays and zero totals
  - Percentage change is calculated relative to the previous period. If previous period revenue is zero, percentage change will be 0 or undefined
  - Both `compare-from` and `compare-to` must be provided together, or both must be omitted. Providing only one will result in a validation error (INVALID_DATE_RANGE)
  - The `breakdown` array in comparison responses will contain the same items for both periods, allowing for direct comparison of revenue by dimension

### 2. Hotel Performance Report

**GET** `/admin/reports/hotel-performance`

- **Role Required**: ADMIN
  - **ADMIN**: Can access hotel performance reports for all hotels in the system
- **Description**: Retrieves performance metrics for all hotels in the system over a specified date range. This endpoint provides comprehensive hotel performance analysis, allowing admins to identify top-performing hotels, analyze booking patterns, occupancy rates, and cancellation trends across the platform. The report includes key metrics such as total revenue, completed bookings, created bookings, cancelled bookings, average occupancy rate, and cancellation rate for each hotel. Results can be sorted by different criteria (revenue, occupancy, bookings, or cancellation rate) and filtered by city or province to focus on specific geographic regions. The endpoint supports pagination for efficient data retrieval and optionally supports period comparison to track performance changes over time, including rank changes for hotels.
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `sort-by`: string (optional, default: "revenue") - Field to sort hotels by. Valid values: `revenue`, `occupancy`, `bookings`, `cancellationRate`
    - `revenue`: Sort by total revenue from completed bookings (descending by default)
    - `occupancy`: Sort by average occupancy rate (descending by default)
    - `bookings`: Sort by total completed bookings (descending by default)
    - `cancellationRate`: Sort by cancellation rate (descending by default)
  - `sort-dir`: string (optional, default: "desc") - Sort direction. Valid values: `asc`, `desc`
    - `asc`: Sort in ascending order (lowest values first)
    - `desc`: Sort in descending order (highest values first)
  - `city-id`: string (optional, UUID format) - Filter hotels by city ID. When provided, only hotels in the specified city will be included in the results. Can be used together with `province-id` for more specific filtering
  - `province-id`: string (optional, UUID format) - Filter hotels by province ID. When provided, only hotels in the specified province will be included in the results. Can be used together with `city-id` for more specific filtering
  - `page`: integer (optional, default: 0, minimum: 0) - Page number for pagination (0-indexed). Determines which page of results to return
  - `size`: integer (optional, default: 20, minimum: 1) - Page size for pagination. Determines how many hotels to return per page
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`. If only one comparison parameter is provided, the request will fail with a validation error
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`. If only one comparison parameter is provided, the request will fail with a validation error
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "hotelId": "string (UUID) - Unique identifier of the hotel",
        "hotelName": "string - Name of the hotel",
        "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue from completed bookings for this hotel in the period",
        "totalCompletedBookings": "integer (non-negative) - Total number of completed bookings for this hotel in the period",
        "totalCreatedBookings": "integer (non-negative) - Total number of bookings created for this hotel in the period (all statuses)",
        "totalCancelledBookings": "integer (non-negative) - Total number of cancelled bookings for this hotel in the period",
        "averageOccupancyRate": "number (0-100, rounded to 2 decimal places) - Average occupancy rate for this hotel across all dates in the period",
        "cancellationRate": "number (0-100, rounded to 2 decimal places) - Cancellation rate for this hotel: (totalCancelledBookings / totalCreatedBookings) * 100"
      }
    ],
    "page": "integer (non-negative) - Current page number (0-indexed)",
    "size": "integer (positive) - Number of items per page",
    "totalItems": "long (non-negative) - Total number of hotels matching the criteria",
    "totalPages": "integer (non-negative) - Total number of pages available",
    "first": "boolean - True if this is the first page",
    "last": "boolean - True if this is the last page",
    "hasNext": "boolean - True if there is a next page",
    "hasPrevious": "boolean - True if there is a previous page"
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
      "data": [
        {
          "hotelId": "string (UUID)",
          "hotelName": "string",
          "totalRevenue": "number (non-negative, rounded to 2 decimal places)",
          "totalCompletedBookings": "integer (non-negative)",
          "totalCreatedBookings": "integer (non-negative)",
          "totalCancelledBookings": "integer (non-negative)",
          "averageOccupancyRate": "number (0-100, rounded to 2 decimal places)",
          "cancellationRate": "number (0-100, rounded to 2 decimal places)"
        }
      ],
      "page": "integer (non-negative)",
      "size": "integer (positive)",
      "totalItems": "long (non-negative)",
      "totalPages": "integer (non-negative)",
      "first": "boolean",
      "last": "boolean",
      "hasNext": "boolean",
      "hasPrevious": "boolean"
    },
    "previousPeriod": {
      "data": [
        {
          "hotelId": "string (UUID)",
          "hotelName": "string",
          "totalRevenue": "number (non-negative, rounded to 2 decimal places)",
          "totalCompletedBookings": "integer (non-negative)",
          "totalCreatedBookings": "integer (non-negative)",
          "totalCancelledBookings": "integer (non-negative)",
          "averageOccupancyRate": "number (0-100, rounded to 2 decimal places)",
          "cancellationRate": "number (0-100, rounded to 2 decimal places)"
        }
      ],
      "page": "integer (non-negative)",
      "size": "integer (positive)",
      "totalItems": "long (non-negative)",
      "totalPages": "integer (non-negative)",
      "first": "boolean",
      "last": "boolean",
      "hasNext": "boolean",
      "hasPrevious": "boolean"
    },
    "comparison": [
      {
        "hotelId": "string (UUID) - Unique identifier of the hotel",
        "hotelName": "string - Name of the hotel",
        "currentTotalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue in current period",
        "currentTotalCompletedBookings": "integer (non-negative) - Total completed bookings in current period",
        "currentTotalCreatedBookings": "integer (non-negative) - Total created bookings in current period",
        "currentTotalCancelledBookings": "integer (non-negative) - Total cancelled bookings in current period",
        "currentAverageOccupancyRate": "number (0-100, rounded to 2 decimal places) - Average occupancy rate in current period",
        "currentCancellationRate": "number (0-100, rounded to 2 decimal places) - Cancellation rate in current period",
        "previousTotalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue in comparison period",
        "previousTotalCompletedBookings": "integer (non-negative) - Total completed bookings in comparison period",
        "previousTotalCreatedBookings": "integer (non-negative) - Total created bookings in comparison period",
        "previousTotalCancelledBookings": "integer (non-negative) - Total cancelled bookings in comparison period",
        "previousAverageOccupancyRate": "number (0-100, rounded to 2 decimal places) - Average occupancy rate in comparison period",
        "previousCancellationRate": "number (0-100, rounded to 2 decimal places) - Cancellation rate in comparison period",
        "revenueDifference": "number (rounded to 2 decimal places) - Absolute difference: currentTotalRevenue - previousTotalRevenue",
        "revenuePercentageChange": "number (rounded to 2 decimal places) - Percentage change for revenue",
        "completedBookingsDifference": "integer - Absolute difference: currentTotalCompletedBookings - previousTotalCompletedBookings",
        "completedBookingsPercentageChange": "number (rounded to 2 decimal places) - Percentage change for completed bookings",
        "createdBookingsDifference": "integer - Absolute difference: currentTotalCreatedBookings - previousTotalCreatedBookings",
        "createdBookingsPercentageChange": "number (rounded to 2 decimal places) - Percentage change for created bookings",
        "cancelledBookingsDifference": "integer - Absolute difference: currentTotalCancelledBookings - previousTotalCancelledBookings",
        "cancelledBookingsPercentageChange": "number (rounded to 2 decimal places) - Percentage change for cancelled bookings",
        "occupancyRateDifference": "number (rounded to 2 decimal places) - Absolute difference: currentAverageOccupancyRate - previousAverageOccupancyRate",
        "occupancyRatePercentageChange": "number (rounded to 2 decimal places) - Percentage change for occupancy rate",
        "cancellationRateDifference": "number (rounded to 2 decimal places) - Absolute difference: currentCancellationRate - previousCancellationRate",
        "cancellationRatePercentageChange": "number (rounded to 2 decimal places) - Percentage change for cancellation rate",
        "rankChange": "integer (nullable) - Change in rank position. Positive value means moved up in ranking, negative value means moved down. Null if hotel didn't exist in previous period or current period",
        "currentRank": "integer (nullable) - Rank position in current period based on sort-by criteria. Null if hotel doesn't exist in current period",
        "previousRank": "integer (nullable) - Rank position in previous period based on sort-by criteria. Null if hotel doesn't exist in previous period"
      }
    ]
  }
}
```

- **Notes**:
  - Revenue is calculated only from bookings with status `completed`
  - `totalCreatedBookings` includes all bookings regardless of their final status
  - `totalCompletedBookings` counts only bookings that reached `completed` status
  - `totalCancelledBookings` counts only bookings that reached `cancelled` status
  - Cancellation rate is calculated as: `(totalCancelledBookings / totalCreatedBookings) * 100`. If `totalCreatedBookings` is 0, cancellation rate will be 0
  - Average occupancy rate is calculated across all dates in the period for each hotel
  - Hotels are sorted by the specified `sort-by` field in the specified direction (`sort-dir`)
  - When `city-id` or `province-id` filters are provided, only hotels matching those criteria are included
  - Both `city-id` and `province-id` can be provided together for more specific filtering
  - When comparison parameters are provided, both periods should ideally have the same length for meaningful comparisons
  - In comparison mode, hotels are sorted by the current period's `sort-by` criteria
  - Rank is calculated based on the `sort-by` field for each period separately
  - `rankChange` is calculated as `previousRank - currentRank`, so positive values indicate improvement (moved up) and negative values indicate decline (moved down)
  - Hotels that exist in one period but not the other will have null values for missing period metrics
  - The comparison array includes all hotels from both periods, sorted by current period ranking
  - Both `compare-from` and `compare-to` must be provided together, or both must be omitted. Providing only one will result in a validation error (INVALID_DATE_RANGE)
  - Pagination metadata in comparison response reflects the pagination of the comparison array, not the individual periods

### 3. Users Summary Report

**GET** `/admin/reports/users/summary`

- **Role Required**: ADMIN
  - **ADMIN**: Can access user summary reports for the entire platform
- **Description**: Retrieves a comprehensive summary of user growth and platform totals over a specified date range. This endpoint provides insights into platform growth by showing the number of new customers and new partners registered during the period, as well as current platform totals including total customers, total partners, and total hotels as of the report generation time. The endpoint helps admins track platform growth trends, understand user acquisition patterns, and monitor the overall scale of the platform. The endpoint optionally supports period comparison to track growth changes over time, showing differences and percentage changes in new user registrations between two periods.
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`. Used to calculate growth metrics (new customers and new partners registered during this period)
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`. Used to calculate growth metrics (new customers and new partners registered during this period)
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`. If only one comparison parameter is provided, the request will fail with a validation error
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`. If only one comparison parameter is provided, the request will fail with a validation error
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "growthInPeriod": {
      "from": "date (ISO format: YYYY-MM-DD) - Start date of the growth period",
      "to": "date (ISO format: YYYY-MM-DD) - End date of the growth period",
      "newCustomers": "integer (non-negative) - Number of new customers (users with role USER) registered during the period",
      "newPartners": "integer (non-negative) - Number of new partners (users with role PARTNER) registered during the period"
    },
    "platformTotals": {
      "asOf": "datetime (ISO format: YYYY-MM-DDTHH:mm:ss) - Timestamp when the platform totals were calculated",
      "totalCustomers": "integer (non-negative) - Total number of customers (users with role USER) in the platform as of the report generation time",
      "totalPartners": "integer (non-negative) - Total number of partners (users with role PARTNER) in the platform as of the report generation time",
      "totalHotels": "integer (non-negative) - Total number of hotels in the platform as of the report generation time"
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
      "growthInPeriod": {
        "from": "date (ISO format: YYYY-MM-DD)",
        "to": "date (ISO format: YYYY-MM-DD)",
        "newCustomers": "integer (non-negative)",
        "newPartners": "integer (non-negative)"
      },
      "platformTotals": {
        "asOf": "datetime (ISO format: YYYY-MM-DDTHH:mm:ss)",
        "totalCustomers": "integer (non-negative)",
        "totalPartners": "integer (non-negative)",
        "totalHotels": "integer (non-negative)"
      }
    },
    "previousPeriod": {
      "growthInPeriod": {
        "from": "date (ISO format: YYYY-MM-DD)",
        "to": "date (ISO format: YYYY-MM-DD)",
        "newCustomers": "integer (non-negative)",
        "newPartners": "integer (non-negative)"
      },
      "platformTotals": {
        "asOf": "datetime (ISO format: YYYY-MM-DDTHH:mm:ss)",
        "totalCustomers": "integer (non-negative)",
        "totalPartners": "integer (non-negative)",
        "totalHotels": "integer (non-negative)"
      }
    },
    "comparison": {
      "newCustomersDifference": "integer - Absolute difference: currentPeriod.growthInPeriod.newCustomers - previousPeriod.growthInPeriod.newCustomers",
      "newCustomersPercentageChange": "number (rounded to 2 decimal places) - Percentage change for new customers: ((currentPeriod.growthInPeriod.newCustomers - previousPeriod.growthInPeriod.newCustomers) / previousPeriod.growthInPeriod.newCustomers) * 100. Can be positive (growth) or negative (decline)",
      "newPartnersDifference": "integer - Absolute difference: currentPeriod.growthInPeriod.newPartners - previousPeriod.growthInPeriod.newPartners",
      "newPartnersPercentageChange": "number (rounded to 2 decimal places) - Percentage change for new partners: ((currentPeriod.growthInPeriod.newPartners - previousPeriod.growthInPeriod.newPartners) / previousPeriod.growthInPeriod.newPartners) * 100. Can be positive (growth) or negative (decline)"
    }
  }
}
```

- **Notes**:
  - New customers and new partners are counted based on their registration date (createdAt) within the specified period
  - `growthInPeriod` shows user registrations during the specified date range only
  - `platformTotals` shows current totals across the entire platform, not limited to the report period
  - `platformTotals.asOf` represents the timestamp when the totals were calculated (typically the current time when the report is generated)
  - `totalHotels` is the count of all hotels in the platform, regardless of their status
  - Customers are users with role `USER` (RoleType.USER)
  - Partners are users with role `PARTNER` (RoleType.PARTNER)
  - When comparison parameters are provided, both periods should ideally have the same length for meaningful comparisons
  - Percentage change is calculated relative to the previous period. If previous period value is zero, percentage change will be 0 or undefined
  - Both `compare-from` and `compare-to` must be provided together, or both must be omitted. Providing only one will result in a validation error (INVALID_DATE_RANGE)
  - The comparison only includes growth metrics (newCustomers and newPartners), not platform totals, as platform totals represent current state rather than period-specific metrics
  - Platform totals in both periods may differ slightly due to the timestamp difference, but the comparison focuses on growth metrics which are period-specific

### 4. Seasonality Report

**GET** `/admin/reports/trends/seasonality`

- **Role Required**: ADMIN
  - **ADMIN**: Can access seasonality reports for the entire platform
- **Description**: Retrieves seasonality analysis data showing monthly trends for revenue and bookings across the entire platform over a specified date range. This endpoint helps admins identify seasonal patterns, peak months, and low seasons by providing aggregated monthly data. The report groups data by calendar month, showing total revenue and total bookings for each month in the specified period. This analysis is useful for understanding business cycles, planning marketing campaigns, and making strategic decisions based on seasonal trends. The `metric` parameter allows clients to specify which metric to focus on for display purposes, though the response always includes both revenue and bookings data for comprehensive analysis.
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`. Data will be grouped by month starting from the month containing this date
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`. Data will be grouped by month up to the month containing this date
  - `metric`: string (optional, default: "bookings") - Primary metric to focus on for analysis. Valid values: `revenue`, `bookings`
    - `revenue`: Focus on revenue trends for seasonality analysis
    - `bookings`: Focus on booking volume trends for seasonality analysis
    - **Note**: The response always includes both `totalRevenue` and `totalBookings` for each month, regardless of the `metric` parameter value. This parameter is primarily for client-side display purposes
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "month": "date (ISO format: YYYY-MM-DD) - The first day of the month (always YYYY-MM-01). Represents the calendar month for which the data is aggregated",
        "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue from completed bookings for this month across all hotels in the platform",
        "totalBookings": "integer (non-negative) - Total number of completed bookings for this month across all hotels in the platform"
      }
    ]
  }
}
```

- **Notes**:
  - Data is grouped by calendar month (January, February, etc.) regardless of the date range specified
  - The `month` field always represents the first day of the month (YYYY-MM-01) for consistency
  - Revenue is calculated only from bookings with status `completed`
  - Bookings are counted only if they have status `completed`
  - If a month has no data (no completed bookings), it will still appear in the response with zero values for both `totalRevenue` and `totalBookings`
  - Months are returned in chronological order (earliest month first)
  - The `metric` parameter is validated but does not affect the response structure - both revenue and bookings are always included
  - This endpoint does not support period comparison (no `compare-from` or `compare-to` parameters)
  - The report provides a comprehensive view of seasonal patterns, helping identify peak seasons, low seasons, and trends over time
  - Data is aggregated from `SystemDailyReport` table, ensuring efficient query performance

### 5. Popular Locations Report

**GET** `/admin/reports/trends/popular-locations`

- **Role Required**: ADMIN
  - **ADMIN**: Can access popular locations reports for the entire platform
- **Description**: Retrieves a ranked list of the most popular locations (cities or provinces) based on revenue or booking volume over a specified date range. This endpoint helps admins identify top-performing destinations, understand geographic trends, and make strategic decisions about marketing focus, expansion opportunities, and resource allocation. Locations are ranked by the specified metric (revenue or bookings) in descending order, showing the top N locations. The report provides both revenue and booking data for each location, allowing for comprehensive analysis of location performance. This analysis is useful for understanding which destinations are driving the most business and identifying potential growth markets.
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`. Used to filter bookings and revenue data
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`. Used to filter bookings and revenue data
  - `level`: string (optional, default: "city") - Geographic level to analyze. Valid values: `city`, `province`
    - `city`: Groups and ranks locations by city
    - `province`: Groups and ranks locations by province
  - `metric`: string (optional, default: "revenue") - Metric used to rank locations. Valid values: `revenue`, `bookings`
    - `revenue`: Rank locations by total revenue from completed bookings (highest revenue first)
    - `bookings`: Rank locations by total number of completed bookings (highest bookings first)
    - **Note**: The response always includes both `totalRevenue` and `totalBookings` for each location, regardless of the `metric` parameter value. The `metric` parameter only determines the ranking order
  - `limit`: integer (optional, default: 10, minimum: 1, maximum: 100) - Number of top locations to return. Results are limited to the top N locations based on the specified metric. If a value less than 1 is provided, it defaults to 10. If a value greater than 100 is provided, it is capped at 100 for performance reasons
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "locationId": "string (UUID) - Unique identifier of the location (city ID or province ID depending on level parameter)",
        "locationName": "string - Name of the location (city name or province name depending on level parameter)",
        "totalRevenue": "number (non-negative, rounded to 2 decimal places) - Total revenue from completed bookings for this location in the period",
        "totalBookings": "integer (non-negative) - Total number of completed bookings for this location in the period"
      }
    ]
  }
}
```

- **Notes**:
  - Revenue is calculated only from bookings with status `completed`
  - Bookings are counted only if they have status `completed`
  - Locations are sorted by the specified `metric` in descending order (highest values first)
  - The response always includes both `totalRevenue` and `totalBookings` for each location, allowing for comprehensive analysis
  - If `level=city`, locations are grouped by city and city names are returned
  - If `level=province`, locations are grouped by province and province names are returned
  - The `limit` parameter controls how many top locations are returned. For example, `limit=10` returns the top 10 locations
  - If there are fewer locations than the specified limit, all available locations are returned
  - Locations with zero revenue and zero bookings may still appear in results if they have hotels in the system
  - The ranking is based on the specified metric, but both metrics are always included in the response for comparison
  - This endpoint does not support period comparison (no `compare-from` or `compare-to` parameters)
  - Data is aggregated from booking and hotel location data, ensuring accurate geographic analysis
  - The maximum limit of 100 is enforced to maintain query performance

### 6. Popular Room Types Report

**GET** `/admin/reports/trends/popular-room-types`

- **Role Required**: ADMIN
  - **ADMIN**: Can access popular room types reports for the entire platform
- **Description**: Retrieves a ranked list of the most popular room categories based on total booked nights over a specified date range. This endpoint helps admins understand customer preferences by analyzing which room characteristics (view, bed type, or occupancy capacity) are most in demand. The report groups rooms by the specified attribute and ranks them by total booked nights in descending order, showing the top N categories. This analysis is useful for understanding market trends, identifying popular room features, and making strategic decisions about inventory management, pricing strategies, and marketing focus. The grouping can be done by room view (e.g., "Ocean View", "City View"), bed type (e.g., "Single", "Double", "Queen"), or occupancy capacity (e.g., "1 Guest", "2 Guests", "4 Guests").
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`. Used to filter booking data
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`. Used to filter booking data
  - `group-by`: string (optional, default: "occupancy") - Attribute to group and analyze rooms by. Valid values: `view`, `bedType`, `occupancy`
    - `view`: Groups rooms by their view type (e.g., "Ocean View", "City View", "Garden View", "Mountain View"). The `roomCategory` field will contain view names
    - `bedType`: Groups rooms by their bed type (e.g., "Single", "Double", "Queen", "King", "Twin"). The `roomCategory` field will contain bed type names
    - `occupancy`: Groups rooms by their maximum occupancy capacity (e.g., "1 Guest", "2 Guests", "3 Guests", "4 Guests"). The `roomCategory` field will contain occupancy descriptions
  - `limit`: integer (optional, default: 10, minimum: 1, maximum: 100) - Number of top room categories to return. Results are limited to the top N categories based on total booked nights. If a value less than 1 is provided, it defaults to 10. If a value greater than 100 is provided, it is capped at 100 for performance reasons
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "roomCategory": "string - Name of the room category. The content depends on the group-by parameter: view name (e.g., 'Ocean View'), bed type (e.g., 'Double'), or occupancy description (e.g., '2 Guests')",
        "totalBookedNights": "integer (non-negative) - Total number of room nights booked for this category in the period. This represents the sum of all booked nights across all rooms matching this category"
      }
    ]
  }
}
```

- **Notes**:
  - Booked nights are counted from all bookings regardless of their final status (including cancelled bookings, as they represent potential occupancy)
  - Room categories are sorted by `totalBookedNights` in descending order (highest values first)
  - The `roomCategory` field content depends on the `group-by` parameter:
    - If `group-by=view`: Contains room view names (e.g., "Ocean View", "City View")
    - If `group-by=bedType`: Contains bed type names (e.g., "Single", "Double", "Queen", "King")
    - If `group-by=occupancy`: Contains occupancy descriptions (e.g., "1 Guest", "2 Guests", "3 Guests")
  - The `limit` parameter controls how many top categories are returned. For example, `limit=10` returns the top 10 categories
  - If there are fewer categories than the specified limit, all available categories are returned
  - Categories with zero booked nights may still appear in results if they exist in the system
  - The ranking is based on total booked nights, which represents the total demand for each category
  - This endpoint does not support period comparison (no `compare-from` or `compare-to` parameters)
  - Data is aggregated from `RoomDailyPerformance` table, ensuring efficient query performance
  - The maximum limit of 100 is enforced to maintain query performance
  - Results are aggregated across all hotels in the platform, providing a system-wide view of room preferences

### 7. Financials Report

**GET** `/admin/reports/financials`

- **Role Required**: ADMIN
  - **ADMIN**: Can access financial reports for the entire platform
- **Description**: Retrieves comprehensive financial data for the entire platform over a specified date range. This endpoint provides detailed financial insights including gross revenue, net revenue, partner payouts, and gross margin. The data can be grouped by day, week, or month according to the `group-by` parameter, allowing admins to analyze financial trends at different time granularities. This report is essential for understanding the platform's financial health, tracking revenue streams, monitoring partner payouts, and analyzing profitability margins. The endpoint optionally supports period comparison to track financial performance changes over time, showing differences and percentage changes for all financial metrics.
- **Query Parameters**:
  - `from`: date (required, ISO format: YYYY-MM-DD) - Start date of the report period (inclusive). Must be less than or equal to `to`
  - `to`: date (required, ISO format: YYYY-MM-DD) - End date of the report period (inclusive). Must be greater than or equal to `from`
  - `group-by`: string (optional, default: "day") - How to group the financial data. Valid values: `day`, `week`, `month`
    - `day`: Groups financial data by individual days
    - `week`: Groups financial data by weeks (Monday to Sunday)
    - `month`: Groups financial data by calendar months
  - `compare-from`: date (optional, ISO format: YYYY-MM-DD) - Start date of the comparison period. Must be provided together with `compare-to`. If only one comparison parameter is provided, the request will fail with a validation error
  - `compare-to`: date (optional, ISO format: YYYY-MM-DD) - End date of the comparison period. Must be provided together with `compare-from`. If only one comparison parameter is provided, the request will fail with a validation error
- **Response** (without comparison):

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "data": [
      {
        "period": "date (ISO format: YYYY-MM-DD) - The date, week start date, or month start date depending on group-by",
        "grossRevenue": "number (non-negative, rounded to 2 decimal places) - Total gross revenue from completed bookings for this period. This is the total amount customers paid",
        "netRevenue": "number (non-negative, rounded to 2 decimal places) - Net revenue for this period. This is the platform's revenue after partner payouts (grossRevenue - partnerPayout)",
        "partnerPayout": "number (non-negative, rounded to 2 decimal places) - Total amount paid to partners for this period. Calculated as grossRevenue - netRevenue",
        "grossMargin": "number (0-100, rounded to 2 decimal places) - Gross margin percentage for this period. Calculated as (netRevenue / grossRevenue) * 100. Represents the platform's profit margin"
      }
    ],
    "summary": {
      "totalGrossRevenue": "number (non-negative, rounded to 2 decimal places) - Sum of all gross revenue data points in the report period",
      "totalNetRevenue": "number (non-negative, rounded to 2 decimal places) - Sum of all net revenue data points in the report period",
      "totalPartnerPayout": "number (non-negative, rounded to 2 decimal places) - Total partner payouts for the entire period. Calculated as totalGrossRevenue - totalNetRevenue",
      "averageGrossMargin": "number (0-100, rounded to 2 decimal places) - Average gross margin percentage for the entire period. Calculated as (totalNetRevenue / totalGrossRevenue) * 100"
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
      "data": [
        {
          "period": "date (ISO format: YYYY-MM-DD)",
          "grossRevenue": "number (non-negative, rounded to 2 decimal places)",
          "netRevenue": "number (non-negative, rounded to 2 decimal places)",
          "partnerPayout": "number (non-negative, rounded to 2 decimal places)",
          "grossMargin": "number (0-100, rounded to 2 decimal places)"
        }
      ],
      "summary": {
        "totalGrossRevenue": "number (non-negative, rounded to 2 decimal places)",
        "totalNetRevenue": "number (non-negative, rounded to 2 decimal places)",
        "totalPartnerPayout": "number (non-negative, rounded to 2 decimal places)",
        "averageGrossMargin": "number (0-100, rounded to 2 decimal places)"
      }
    },
    "previousPeriod": {
      "data": [
        {
          "period": "date (ISO format: YYYY-MM-DD)",
          "grossRevenue": "number (non-negative, rounded to 2 decimal places)",
          "netRevenue": "number (non-negative, rounded to 2 decimal places)",
          "partnerPayout": "number (non-negative, rounded to 2 decimal places)",
          "grossMargin": "number (0-100, rounded to 2 decimal places)"
        }
      ],
      "summary": {
        "totalGrossRevenue": "number (non-negative, rounded to 2 decimal places)",
        "totalNetRevenue": "number (non-negative, rounded to 2 decimal places)",
        "totalPartnerPayout": "number (non-negative, rounded to 2 decimal places)",
        "averageGrossMargin": "number (0-100, rounded to 2 decimal places)"
      }
    },
    "comparison": {
      "grossRevenueDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.summary.totalGrossRevenue - previousPeriod.summary.totalGrossRevenue",
      "grossRevenuePercentageChange": "number (rounded to 2 decimal places) - Percentage change for gross revenue",
      "netRevenueDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.summary.totalNetRevenue - previousPeriod.summary.totalNetRevenue",
      "netRevenuePercentageChange": "number (rounded to 2 decimal places) - Percentage change for net revenue",
      "partnerPayoutDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.summary.totalPartnerPayout - previousPeriod.summary.totalPartnerPayout",
      "partnerPayoutPercentageChange": "number (rounded to 2 decimal places) - Percentage change for partner payout",
      "grossMarginDifference": "number (rounded to 2 decimal places) - Absolute difference: currentPeriod.summary.averageGrossMargin - previousPeriod.summary.averageGrossMargin",
      "grossMarginPercentageChange": "number (rounded to 2 decimal places) - Percentage change for gross margin"
    }
  }
}
```

- **Notes**:
  - All financial metrics are calculated only from bookings with status `completed`
  - **Gross Revenue**: Total amount customers paid for completed bookings. This is the revenue before any deductions
  - **Net Revenue**: Platform's revenue after partner payouts. Calculated as `grossRevenue - partnerPayout`
  - **Partner Payout**: Amount paid to partners. Calculated as `grossRevenue - netRevenue`. This represents the commission or revenue share paid to hotel partners
  - **Gross Margin**: Profitability metric calculated as `(netRevenue / grossRevenue) * 100`. Represents the platform's profit margin percentage. If grossRevenue is 0, grossMargin will be 0
  - The `period` field in data points represents the start of the grouping period (e.g., for `group-by=week`, it shows the Monday of that week; for `group-by=month`, it shows the first day of the month)
  - All currency values are rounded to 2 decimal places
  - Summary totals are calculated by summing all data points in the period
  - Average gross margin in summary is calculated from totals: `(totalNetRevenue / totalGrossRevenue) * 100`, not as an average of individual period margins
  - When comparison parameters are provided, both periods should ideally have the same length for meaningful comparisons
  - If no financial data exists for the period, the response will contain empty arrays and zero totals
  - Percentage change is calculated relative to the previous period. If previous period value is zero, percentage change will be 0 or undefined
  - Both `compare-from` and `compare-to` must be provided together, or both must be omitted. Providing only one will result in a validation error (INVALID_DATE_RANGE)
  - Data is aggregated from `SystemDailyReport` table, ensuring efficient query performance
  - This report provides a comprehensive view of the platform's financial performance, essential for strategic decision-making and financial planning

### 8. Generate All System Daily Reports

**POST** `/admin/reports/generate-all`

- **Role Required**: ADMIN
  - **ADMIN**: Only administrators can trigger bulk report generation
- **Description**: Manually triggers the system daily report generation process for all historical data in the system. This endpoint processes all dates from the earliest booking/user creation date to the latest date found in the system, generating `SystemDailyReport` records for each date. This is similar to the background job that runs daily, but processes the entire historical dataset instead of just one day. This endpoint is useful for initial system setup, data migration, or rebuilding reports after schema changes. The endpoint processes each date in a separate transaction, ensuring that failures for one date do not affect others. The operation returns a summary including total dates processed, success/failure counts, date range, and error messages (if any).
- **Query Parameters**: None
- **Request Body**: None
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "totalDates": "integer (non-negative) - Total number of dates processed (from minDate to maxDate, inclusive)",
    "successCount": "integer (non-negative) - Number of dates successfully processed",
    "failureCount": "integer (non-negative) - Number of dates that failed to process",
    "minDate": "date (ISO format: YYYY-MM-DD) - Earliest date found in the system (from Booking or User tables)",
    "maxDate": "date (ISO format: YYYY-MM-DD) - Latest date found in the system (from Booking or User tables)",
    "errors": [
      "string - Error messages for failed dates (optional, limited to first 10 errors for performance)"
    ]
  }
}
```

- **Notes**:
  - **Prerequisites**: This endpoint should be run **after** `POST /partner/reports/generate-all` to ensure that `HotelDailyReport` data is available. System daily reports depend on hotel daily reports for aggregation
  - **Date Range Detection**: The endpoint automatically determines the date range by finding:
    - The earliest and latest dates from the `Booking` table (based on booking creation dates)
    - The earliest and latest dates from the `User` table (based on user registration dates)
    - The overall min and max dates across both sources
  - **Processing Logic**: 
    - Each date is processed sequentially from `minDate` to `maxDate` (inclusive)
    - Each date is processed in a separate transaction (`REQUIRES_NEW` propagation)
    - If processing fails for one date, the error is logged and the process continues with the next date
    - Failed dates are counted in `failureCount` and error messages are added to the `errors` array
  - **Report Generation Process**: For each date, the endpoint:
    1. Aggregates data from `HotelDailyReport` (gross revenue, bookings, reviews)
    2. Calculates net revenue (gross revenue minus partner payouts)
    3. Aggregates new user registrations (customers and partners)
    4. Calculates weighted average review score
    5. Upserts the aggregated data into `SystemDailyReport` table
  - **Error Handling**:
    - Errors for individual dates are caught and logged, but do not stop the overall process
    - Up to 10 error messages are included in the response (to prevent response size issues)
    - Error messages include the date and the error description
  - **Performance Considerations**:
    - This operation may take a **very long time** depending on the amount of historical data
    - For systems with years of data, this could take hours to complete
    - The endpoint processes dates sequentially (one at a time) to avoid database overload
    - Each date is processed in its own transaction to ensure data consistency
  - **Response Validation**:
    - `totalDates` = `successCount` + `failureCount`
    - `totalDates` = number of days between `minDate` and `maxDate` (inclusive)
    - `errors` array is only included if there are failures (`failureCount > 0`)
    - `errors` array is limited to the first 10 errors for performance reasons
  - **Use Cases**:
    - Initial system setup and data migration
    - Rebuilding reports after schema changes or data corrections
    - Backfilling missing report data
    - System maintenance and data integrity checks
  - **Important**: This is a **long-running operation**. Consider running it during off-peak hours or as a background job. The client should be prepared for a potentially long response time
  - **Idempotency**: Running this endpoint multiple times is safe - existing reports will be updated (upserted) rather than duplicated

### Notes on Admin Reports

- **Period Comparison**: Revenue, Hotel Performance, Users Summary, and Financials reports support optional period comparison. When both `compare-from` and `compare-to` are provided, the response includes comparison data. If only one is provided, it is ignored and the endpoint returns normal response.
- **Data Source**: Reports use pre-aggregated data from `SystemDailyReport`, `HotelDailyReport`, and `RoomDailyPerformance` tables for optimal performance. Data is typically up-to-date until the end of the previous day.
- **Date Range Validation**: `from` must be less than or equal to `to`. Similarly, `compare-from` must be less than or equal to `compare-to` when provided.
- **Pagination**: Hotel Performance report supports pagination. Other reports may return all data or use in-memory pagination for breakdown items.
- **Empty Data**: If no data exists for the requested period, endpoints return `200 OK` with zero values or empty arrays, not `404 Not Found`.
- **Currency Rounding**: All financial values are rounded to 2 decimal places.
- **Rank Change**: Hotel Performance comparison includes rank change tracking, showing how hotel rankings changed between periods.

---

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
- **Description**: Provides near real-time operational dashboard data for a partner's hotel. This endpoint executes multiple queries in parallel for optimal performance and returns comprehensive operational metrics including today's activity (check-ins, check-outs, in-house guests), live booking status counts, live room status counts, and occupancy forecast for upcoming days. All data is queried directly from transactional tables (Booking and Room) to ensure real-time accuracy.
- **Query Parameters**:
  - `hotel-id`: string (required, UUID format) - ID of the hotel to get dashboard data for. Must be a valid hotel UUID. The hotel must belong to the authenticated partner (ownership is validated in service layer). If not provided or blank, returns `HOTEL_NOT_FOUND` error.
  - `forecast-days`: integer (optional, default: 7, min: 1, max: 30) - Number of days to forecast occupancy. Determines how many upcoming days are included in the occupancy forecast. Defaults to 7 days if not specified. Must be between 1 and 30 (inclusive). If outside this range, returns `INVALID_DATE_RANGE` error.
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "todaysActivity": {
      "checkInsToday": "long (default: 0) - Number of guests expected to check in today. Counts bookings with checkInDate = today and status = CONFIRMED",
      "checkOutsToday": "long (default: 0) - Number of guests expected to check out today. Counts bookings with checkOutDate = today and status = CHECKED_IN",
      "inHouseGuests": "long (default: 0) - Number of guests currently in-house. Counts bookings with status = CHECKED_IN"
    },
    "bookingStatusCounts": [
      {
        "status": "string (required) - Booking status name (e.g., 'pending_payment', 'confirmed', 'checked_in', 'completed', 'cancelled')",
        "count": "long (default: 0) - Number of bookings with this status for the hotel"
      }
    ],
    "roomStatusCounts": [
      {
        "status": "string (required) - Room status name (e.g., 'active', 'inactive', 'maintenance', 'closed')",
        "count": "long (default: 0) - Total number of rooms with this status in the hotel"
      }
    ],
    "occupancyForecast": [
      {
        "date": "date (required, ISO format: YYYY-MM-DD) - Date for this forecast item",
        "roomsBooked": "long (default: 0) - Number of rooms booked for this date. Includes bookings with status CONFIRMED and CHECKED_IN",
        "totalCapacity": "long (default: 0) - Total room capacity for the hotel (sum of all room quantities)",
        "occupancyRate": "number (default: 0.0) - Occupancy rate as percentage (0-100). Calculated as: (roomsBooked / totalCapacity) × 100"
      }
    ],
    "forecastDays": "integer (default: 7) - Number of days included in the forecast (same as forecast-days parameter)"
  }
}
```

- **Notes**:
  - **Real-time Data**: This endpoint queries live data directly from Booking and Room tables for real-time accuracy. No cached or aggregated data is used.
  - **Check-in Calculation**: Check-ins are bookings where `checkInDate = today` and `status = CONFIRMED`. These represent guests who are expected to arrive today.
  - **Check-out Calculation**: Check-outs are bookings where `checkOutDate = today` and `status = CHECKED_IN`. These represent guests who are expected to depart today.
  - **In-house Guests**: In-house guests are all bookings with `status = CHECKED_IN`, regardless of check-in/check-out dates. This represents guests currently staying at the hotel.
  - **Booking Status Counts**: Returns a breakdown of all bookings for the hotel grouped by status. Includes all booking statuses present in the system (see [Booking Status Types](#booking-status-types)).
  - **Room Status Counts**: Returns a breakdown of all rooms in the hotel grouped by status. Includes all room statuses present in the system (see [Room Status Types](#room-status-types)).
  - **Occupancy Forecast**: 
    - Only includes bookings with active statuses: `CONFIRMED` and `CHECKED_IN`
    - Each item represents one day in the forecast period
    - Forecast starts from tomorrow (today + 1 day) and extends for `forecast-days` days
    - `totalCapacity` is the sum of all room quantities in the hotel
    - `occupancyRate` is calculated as a percentage: (roomsBooked / totalCapacity) × 100
    - If `totalCapacity` is 0, `occupancyRate` will be 0.0
  - **Performance Optimization**: Uses parallel execution with `CompletableFuture` to execute all queries simultaneously, significantly reducing response time.
  - **Validation**: 
    - `hotel-id` is required and must not be blank. Returns `HOTEL_NOT_FOUND` error if invalid.
    - `forecast-days` must be between 1 and 30 (inclusive). Returns `INVALID_DATE_RANGE` error if outside range.
  - **Partner Authorization**: Partners can only access dashboard data for hotels they own. Ownership is validated in the service layer.

---

## Admin Dashboard

### 1. Get Admin Dashboard Summary

**GET** `/admin/dashboard/summary`

- **Role Required**: ADMIN
- **Description**: Provides a comprehensive system health snapshot for administrators. This endpoint returns real-time financial metrics, booking activity, ecosystem growth indicators, and top performing hotels. Uses a hybrid data architecture that combines real-time transactional data (for "today" metrics) with pre-aggregated daily reports (for historical trends and month-to-date metrics). All queries are executed in parallel using `CompletableFuture` for optimal performance. No parameters are required as the endpoint returns predefined data for fixed time periods (today, month-to-date, last 7 days) to ensure fast response times.
- **Query Parameters**: None - Returns predefined data for fixed time periods (today, month-to-date, last 7 days) for fast response
- **Response**:

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "realtimeFinancials": {
      "totalRevenueToday": "number (default: 0.0) - Total revenue from COMPLETED bookings today. Sum of finalPrice from Booking table where status = COMPLETED and checkOutDate = today"
    },
    "aggregatedFinancials": {
      "grossRevenueMonthToDate": "number (default: 0.0) - Gross revenue for month-to-date (from SystemDailyReport). Sum of grossRevenue from SystemDailyReport for dates from 1st day of current month to yesterday (excludes today)",
      "netRevenueMonthToDate": "number (default: 0.0) - Net revenue for month-to-date (from SystemDailyReport). Sum of netRevenue from SystemDailyReport for dates from 1st day of current month to yesterday (excludes today)",
      "totalGrossRevenueThisMonth": "number (default: 0.0) - Total gross revenue including today's realtime data. Calculated as: grossRevenueMonthToDate + totalRevenueToday",
      "totalNetRevenueThisMonth": "number (default: 0.0) - Total net revenue including today's realtime data. Note: Net revenue for today might be estimated or same as gross if commission not yet calculated. Calculated as: netRevenueMonthToDate + (today's net revenue estimate)"
    },
    "bookingActivity": {
      "bookingsCreatedToday": "long (default: 0) - Number of new bookings created today. Counts all bookings where createdAt date = today, regardless of status"
    },
    "ecosystemGrowth": {
      "newCustomersToday": "long (default: 0) - Number of new customers (users) registered today. Counts all users with role = USER where createdAt date = today",
      "newPartnersToday": "long (default: 0) - Number of new partners registered today. Counts all users with role = PARTNER where createdAt date = today",
      "totalActiveHotels": "long (default: 0) - Total number of active hotels in the system. Counts all hotels with status = ACTIVE"
    },
    "topPerformingHotels": [
      {
        "hotelId": "string (required, UUID) - Hotel ID",
        "hotelName": "string (required) - Hotel name",
        "totalRevenue": "number (default: 0.0) - Total revenue in the last 7 days. Sum of revenue from HotelDailyReport for the last 7 days (excluding today)",
        "totalBookings": "long (default: 0) - Total completed bookings in the last 7 days. Sum of completed bookings from HotelDailyReport for the last 7 days (excluding today)"
      }
    ],
    "topPerformingHotelsDays": "integer (default: 7) - Number of days used for top performing hotels calculation (fixed at 7 days)"
  }
}
```

- **Notes**:
  - **Hybrid Data Architecture**: 
    - **Real-time Data Sources** (queried directly from transactional tables):
      - `totalRevenueToday`: Sum of `finalPrice` from Booking table where `status = COMPLETED` and `checkOutDate = today`
      - `bookingsCreatedToday`: Count of bookings where `createdAt` date = today
      - `newCustomersToday`: Count of users with `role = USER` where `createdAt` date = today
      - `newPartnersToday`: Count of users with `role = PARTNER` where `createdAt` date = today
      - `totalActiveHotels`: Count of hotels with `status = ACTIVE` (current snapshot)
    - **Aggregated Data Sources** (from daily report tables):
      - `grossRevenueMonthToDate`: Sum of `grossRevenue` from SystemDailyReport for dates from 1st day of current month to yesterday
      - `netRevenueMonthToDate`: Sum of `netRevenue` from SystemDailyReport for dates from 1st day of current month to yesterday
      - `topPerformingHotels`: Aggregated from HotelDailyReport for the last 7 days (excluding today)
  - **Fixed Time Periods**:
    - **Today**: Current date (real-time queries on transactional tables)
    - **Month-to-date (MTD)**: From 1st day of current month to yesterday (aggregated from daily reports, excludes today to avoid inconsistency)
    - **Last 7 days**: For top hotels ranking (aggregated from HotelDailyReport, excludes today)
  - **Revenue Calculations**:
    - **Real-time Revenue**: Sum of `finalPrice` from Booking table where `status = COMPLETED` and `checkOutDate = today`. This represents revenue from bookings that completed today.
    - **Aggregated Revenue**: Sum from SystemDailyReport and HotelDailyReport tables for historical data. These reports are typically generated daily and contain pre-aggregated metrics.
    - **Total Revenue This Month**: Combines aggregated month-to-date data with today's real-time data for a complete picture of the current month's performance.
  - **Top Performing Hotels**:
    - Limited to top hotels by revenue in the last 7 days (excluding today)
    - Data is aggregated from HotelDailyReport for performance
    - Includes both `totalRevenue` and `totalBookings` (completed bookings only)
    - Hotels are ranked by revenue in descending order
    - The exact number of hotels returned may vary (typically top 5-10, but depends on implementation)
  - **Ecosystem Growth Metrics**:
    - `newCustomersToday`: New user registrations today (users with role = USER)
    - `newPartnersToday`: New partner registrations today (users with role = PARTNER)
    - `totalActiveHotels`: Current count of active hotels (real-time snapshot)
  - **Performance Optimization**: 
    - Uses parallel execution with `CompletableFuture` to execute all queries simultaneously
    - All data fetches happen in parallel, significantly reducing total response time
    - Queries are read-only (`@Transactional(readOnly = true)`) for optimal database performance
  - **Data Consistency**:
    - Month-to-date data excludes today to avoid inconsistency between real-time and aggregated sources
    - Today's data is always queried in real-time for accuracy
    - Historical data uses pre-aggregated reports for performance
  - **No Parameters Required**: This endpoint is designed for fast dashboard loading with predefined time periods. For custom date ranges, use the Report endpoints instead.

---

## Knowledge Base

Knowledge Base synchronization endpoints allow administrators to manually trigger synchronization of hotel data for Knowledge Base generation. The Knowledge Base is used to generate structured Markdown files containing comprehensive hotel information for AI processing and search optimization.

**Role Required**: ADMIN

All endpoints require ADMIN role authentication. The endpoints are secured by Spring Security configuration.

### 1. Trigger Full Sync

**POST** `/admin/kb/sync/full`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Triggers full synchronization of all active hotels for Knowledge Base generation. This endpoint initiates a background job that processes every active hotel in the system, regardless of when it was last modified. The operation runs asynchronously using Spring's `@Async` annotation to avoid blocking the HTTP request. This is useful for initial Knowledge Base setup or when you need to regenerate all hotel data.

- **Request Body**: None (no request body required)

- **Query Parameters**: None

- **Response**:

```json
{
  "statusCode": 200,
  "message": "Full sync started",
  "data": "string - Confirmation message: 'Full sync triggered successfully. Processing in background.'"
}
```

- **Error Responses**:
  - **401 Unauthorized**: Missing or invalid JWT token
  - **403 Forbidden**: User does not have ADMIN role
  - **500 Internal Server Error**: Server error during sync trigger (rare, as trigger is non-blocking)

- **Notes**:
  - **Asynchronous Execution**: The endpoint returns immediately after triggering the sync. The actual processing happens in the background using Spring's `@Async` mechanism. The HTTP response does not wait for the sync to complete.
  - **Data Fetching Strategy**: The full sync uses the following query strategy:
    - **Primary Query**: `findAllActiveHotelsForKnowledgeBase(status)` - Fetches all hotels with status = "active" (or "ACTIVE") using optimized JPQL query with LEFT JOIN FETCH to eagerly load:
      - Hotel basic information (id, name, slug, description, starRating, status)
      - Complete location hierarchy (country, province, city, district, ward, street)
      - Hotel policy with cancellation and reschedule policies (including all policy rules)
      - Required identification documents
    - **Collection Queries**: After fetching base hotel data, separate queries are executed to avoid cartesian product issues:
      - `findHotelsWithAmenities(hotelIds)` - Fetches hotel amenities with category information
      - `findHotelsWithEntertainmentVenues(hotelIds)` - Fetches nearby entertainment venues with category information
      - `findRoomsByHotelIds(hotelIds, activeStatus)` - Fetches all active rooms with bed types, room amenities, and room policies
      - `findHotelsWithPhotos(hotelIds)` - Fetches hotel photos
      - `findRoomsWithPhotos(hotelIds, activeStatus)` - Fetches room photos
  - **Processing Logic**: 
    - Only hotels with status = "active" (or "ACTIVE") are processed
    - Hotels are processed in batches with error isolation (one hotel failure doesn't stop the batch)
    - Each hotel is converted to `HotelKnowledgeBaseDto` which includes:
      - Basic hotel information
      - Location hierarchy
      - Amenities (grouped by category)
      - Rooms with pricing, amenities, and policies
      - Entertainment venues
      - Review statistics
      - Active discounts
      - Detailed policies with rules
    - The DTO is then used to generate Markdown files for the Knowledge Base
  - **Error Handling**: If a hotel fails during processing, the error is logged at ERROR level, the hotel ID is added to `failedHotelIds` in the result, and processing continues with the next hotel. This ensures that one problematic hotel doesn't prevent other hotels from being synced.
  - **Logging**: Check application logs for detailed processing status:
    - INFO level: Sync start, number of hotels found, completion summary with success/failure counts and duration
    - ERROR level: Individual hotel processing failures with error details
  - **Performance**: The operation can take significant time depending on the number of active hotels. Typical processing time ranges from seconds to minutes for large hotel databases. Progress is logged every 50 hotels processed.
  - **Use Cases**: 
    - Initial Knowledge Base setup
    - Complete regeneration after schema changes
    - Recovery from data corruption
    - After bulk hotel data updates

### 2. Trigger Incremental Sync

**POST** `/admin/kb/sync/incremental`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Triggers incremental synchronization of modified hotels for Knowledge Base generation. This endpoint processes only hotels that have been modified since the last incremental sync run. The system automatically tracks the last incremental run time using `KnowledgeBaseScheduler.getLastIncrementalRunTime()`. This is more efficient than full sync as it only processes changed data. The operation runs asynchronously to avoid blocking the HTTP request.

- **Request Body**: None (no request body required)

- **Query Parameters**: None

- **Response**:

```json
{
  "statusCode": 200,
  "message": "Incremental sync started",
  "data": "string - Confirmation message: 'Incremental sync triggered successfully. Processing in background.'"
}
```

- **Error Responses**:
  - **401 Unauthorized**: Missing or invalid JWT token
  - **403 Forbidden**: User does not have ADMIN role
  - **500 Internal Server Error**: Server error during sync trigger (rare, as trigger is non-blocking)

- **Notes**:
  - **Asynchronous Execution**: The endpoint returns immediately after triggering the sync. The actual processing happens in the background using Spring's `@Async` mechanism.
  - **Last Run Time Tracking**: The system maintains the timestamp of the last incremental sync run. This timestamp is retrieved using `scheduler.getLastIncrementalRunTime()` and used to filter hotels that have been modified since then.
  - **Data Fetching Strategy**: The incremental sync uses the following query strategy:
    - **Primary Query**: `findByUpdatedAtAfter(status, lastRunTime)` - Fetches hotels with:
      - Status = "active" (or "ACTIVE")
      - `updatedAt IS NOT NULL`
      - `updatedAt > lastRunTime` (hotels modified after the last sync)
    - The query uses the same LEFT JOIN FETCH optimizations as full sync to eagerly load:
      - Hotel basic information
      - Complete location hierarchy
      - Hotel policy with cancellation and reschedule policies (including all policy rules)
      - Required identification documents
    - **Collection Queries**: Same as full sync - separate queries for amenities, entertainment venues, rooms, and photos to avoid cartesian product issues.
  - **Processing Logic**:
    - If no hotels are found (no modifications since last run), the sync is skipped and `lastRunTime` is still updated to the current time
    - If hotels are found, they are processed using the same batch processing logic as full sync
    - After successful processing, `lastRunTime` is updated to the current timestamp using `scheduler.setLastIncrementalRunTime(LocalDateTime.now())`
  - **Error Handling**: Same error isolation strategy as full sync - individual hotel failures don't stop the batch
  - **Logging**: Check application logs for:
    - INFO level: Last run time used, number of modified hotels found, completion summary
    - WARN level: If no hotels were modified since last run
    - ERROR level: Individual hotel processing failures
  - **Performance**: Typically much faster than full sync as it only processes changed hotels. Processing time depends on the number of modified hotels.
  - **State Management**: The `lastRunTime` is updated after successful processing, even if no hotels were modified. This ensures the next incremental sync will use the correct baseline timestamp.
  - **Use Cases**:
    - Regular updates after hotel data changes
    - After hotel information updates (name, description, amenities, etc.)
    - After room additions or modifications
    - After policy changes
    - After location updates

### 3. Sync Specific Hotel

**POST** `/admin/kb/sync/hotel/{id}`

- **Content-Type**: `application/json`
- **Role Required**: ADMIN
- **Description**: Syncs a specific hotel by ID for Knowledge Base generation. Unlike full and incremental sync endpoints, this endpoint processes the hotel synchronously and returns the detailed batch result immediately. This is useful for debugging, testing, and verifying Knowledge Base generation for a specific hotel. The endpoint validates the hotel ID and handles the case where the hotel is not found gracefully.

- **Path Parameters**:
  - `id`: string (required, UUID format, pattern: `{id:[a-fA-F0-9\\-]{36}}`) - Unique identifier of the hotel to sync

- **Request Body**: None (no request body required)

- **Query Parameters**: None

- **Response** (Success):

```json
{
  "statusCode": 200,
  "message": "Hotel sync completed",
  "data": {
    "totalCount": "integer (non-negative) - Total number of hotels in the batch (always 1 for single hotel sync)",
    "successCount": "integer (non-negative) - Number of hotels successfully processed (0 or 1)",
    "failureCount": "integer (non-negative) - Number of hotels that failed during processing (0 or 1)",
    "failedHotelIds": "array of strings (UUIDs) - List of hotel IDs that failed during processing. Empty array if successful",
    "startTime": "datetime (ISO 8601 format: YYYY-MM-DDTHH:mm:ss) - Timestamp when batch processing started",
    "endTime": "datetime (ISO 8601 format: YYYY-MM-DDTHH:mm:ss) - Timestamp when batch processing completed",
    "durationMillis": "long (non-negative) - Duration of batch processing in milliseconds. Calculated as (endTime - startTime) in milliseconds"
  }
}
```

- **Response** (Hotel not found):

```json
{
  "statusCode": 200,
  "message": "Hotel not found",
  "data": {
    "totalCount": 0,
    "successCount": 0,
    "failureCount": 1,
    "failedHotelIds": ["string (UUID) - The hotel ID that was not found"],
    "startTime": "datetime (ISO 8601 format) or null - May be null if hotel not found before processing starts",
    "endTime": "datetime (ISO 8601 format) or null - May be null if hotel not found before processing starts",
    "durationMillis": 0
  }
}
```

- **Error Responses**:
  - **400 Bad Request**: Invalid hotel ID format (not a valid UUID) or hotel ID is null/blank (`IllegalArgumentException`)
  - **401 Unauthorized**: Missing or invalid JWT token
  - **403 Forbidden**: User does not have ADMIN role
  - **500 Internal Server Error**: Server error during hotel processing

- **Notes**:
  - **Synchronous Execution**: Unlike full and incremental sync, this endpoint processes the hotel synchronously and waits for completion before returning the response. This allows immediate feedback on the sync result.
  - **Hotel ID Validation**: The endpoint validates that the hotel ID is not null or blank. If invalid, it throws `IllegalArgumentException` with message "Hotel ID cannot be null or empty".
  - **Data Fetching Strategy**: Uses specialized queries optimized for single hotel processing:
    - **Primary Query**: `findByIdForKnowledgeBase(id)` - Fetches the hotel by ID with the same LEFT JOIN FETCH optimizations as other sync methods:
      - Hotel basic information
      - Complete location hierarchy
      - Hotel policy with cancellation and reschedule policies (including all policy rules)
      - Required identification documents
    - **Collection Queries**: After fetching base hotel data, the following queries are executed with the single hotel ID:
      - `findHotelsWithAmenities([id])` - Fetches hotel amenities
      - `findHotelsWithEntertainmentVenues([id])` - Fetches entertainment venues
      - `findRoomsByHotelIds([id], activeStatus)` - Fetches all active rooms with complete relationships
      - `findHotelsWithPhotos([id])` - Fetches hotel photos
      - `findRoomsWithPhotos([id], activeStatus)` - Fetches room photos
    - The fetched collections are then manually merged into the hotel entity to ensure all relationships are properly loaded
  - **Processing Logic**:
    - If hotel is not found, returns a BatchResult with `failureCount = 1` and the hotel ID in `failedHotelIds`
    - If hotel is found, processes it using the same batch processing logic as full/incremental sync
    - The hotel is wrapped in a list and passed to `batchService.processBatch()`
    - Returns the BatchResult with detailed processing statistics
  - **Response Details**:
    - `totalCount`: Always 1 for single hotel sync (or 0 if hotel not found)
    - `successCount`: 1 if hotel was successfully processed, 0 otherwise
    - `failureCount`: 1 if hotel failed or was not found, 0 otherwise
    - `failedHotelIds`: Contains the hotel ID if processing failed or hotel was not found, empty array if successful
    - `startTime` and `endTime`: Timestamps for batch processing (may be null if hotel not found before processing starts)
    - `durationMillis`: Processing duration in milliseconds (0 if hotel not found)
  - **Error Handling**: If the hotel is found but processing fails (e.g., DTO generation error, file upload error), the error is logged and the BatchResult reflects the failure with `failureCount = 1` and the hotel ID in `failedHotelIds`.
  - **Logging**: Check application logs for:
    - INFO level: Hotel sync triggered, completion with success/failure counts
    - WARN level: Hotel not found
    - ERROR level: Processing failures
  - **Use Cases**:
    - Testing Knowledge Base generation for a specific hotel
    - Debugging issues with a particular hotel's data
    - Verifying sync functionality after code changes
    - Manual sync for hotels that failed in batch processing
    - Validating hotel data structure before full sync

### Notes on Knowledge Base Sync

- **Scheduled Jobs**: The system automatically runs scheduled sync jobs:
  - **Full Sync**: Every Sunday at 2:00 AM (configured in `KnowledgeBaseScheduler`) - Processes all active hotels to ensure complete data freshness
  - **Incremental Sync**: Every hour at minute 0 (configured in `KnowledgeBaseScheduler`) - Processes only modified hotels for efficient updates
- **Query Optimization**: All sync operations use optimized JPQL queries with LEFT JOIN FETCH to:
  - Avoid N+1 query problems by eagerly loading relationships
  - Prevent LazyInitializationException during batch processing
  - Separate collection fetches to avoid cartesian product issues (when one hotel has many rooms, amenities, etc., joining all collections would create a massive result set)
- **Error Isolation**: Each hotel is processed in a try-catch block. If one hotel fails:
  - The error is logged at ERROR level with full stack trace
  - The hotel ID is added to `failedHotelIds` in the BatchResult
  - Processing continues with the next hotel
  - The batch does not stop due to individual hotel failures
- **Asynchronous Processing**: Full and incremental sync endpoints use Spring's `@Async` annotation for asynchronous execution:
  - The HTTP request returns immediately with a confirmation message
  - Actual processing happens in a separate thread
  - Uses ApplicationContext proxy pattern to enable `@Async` on self-invoked methods
  - Check application logs for actual processing results
- **Synchronous Processing**: Single hotel sync endpoint processes synchronously:
  - HTTP request waits for processing to complete
  - Returns detailed BatchResult immediately
  - Useful for debugging and testing
- **State Management**: 
  - The system tracks the last incremental sync run time using `KnowledgeBaseScheduler`
  - This timestamp is used to determine which hotels have been modified
  - The timestamp is updated after successful incremental sync completion
  - Even if no hotels were modified, the timestamp is updated to prevent re-processing
- **Data Completeness**: All sync operations fetch complete hotel data including:
  - Basic hotel information (name, description, star rating, status, slug)
  - Complete location hierarchy (country → province → city → district → ward → street)
  - Hotel policies (check-in/check-out times, payment options, required documents)
  - Cancellation and reschedule policies with all rules
  - Amenities grouped by category
  - Entertainment venues with categories
  - All active rooms with pricing, amenities, and policies
  - Hotel and room photos
  - Review statistics
  - Active discounts
- **Knowledge Base Output**: The synced data is used to generate:
  - Structured Markdown files for each hotel
  - AI-friendly data format for search and recommendation systems
  - Comprehensive hotel metadata for external integrations
- **Performance Considerations**:
  - Full sync can take significant time for large hotel databases (minutes to hours depending on hotel count)
  - Incremental sync is typically much faster as it only processes changed hotels
  - Single hotel sync is very fast (typically under a second)
  - Progress is logged every 50 hotels during batch processing
  - Database queries are optimized with proper indexing on `status` and `updatedAt` fields
- **Monitoring**: Monitor sync operations through:
  - Application logs (INFO, WARN, ERROR levels)
  - BatchResult statistics (success/failure counts, duration)
  - Failed hotel IDs for troubleshooting
  - Scheduled job execution logs

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

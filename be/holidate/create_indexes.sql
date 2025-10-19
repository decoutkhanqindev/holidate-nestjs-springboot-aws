-- ===================================================================
-- HOLIDATE DATABASE PERFORMANCE OPTIMIZATION INDEXES
-- Script tạo các indexes cần thiết để tối ưu performance
-- ===================================================================

-- ===================================================================
-- USER RELATED INDEXES
-- ===================================================================

-- Index cho email lookup (authentication)
CREATE INDEX idx_users_email ON users (email);

-- Index cho phone number lookup
CREATE INDEX idx_users_phone_number ON users (phone_number);

-- Index cho user status và role filtering
CREATE INDEX idx_users_role_id ON users (role_id);

-- Index cho user location queries
CREATE INDEX idx_users_country_province_city ON users (country_id, province_id, city_id);

-- Index cho user auth info queries
CREATE INDEX idx_user_auth_info_user_id ON user_auth_info (user_id);
CREATE INDEX idx_user_auth_info_auth_provider ON user_auth_info (auth_provider, auth_provider_id);
CREATE INDEX idx_user_auth_info_active ON user_auth_info (active);

-- Index cho invalid tokens cleanup
CREATE INDEX idx_invalid_tokens_user_id ON invalid_tokens (user_id);

-- ===================================================================
-- HOTEL RELATED INDEXES
-- ===================================================================

-- Index cho hotel name search
CREATE INDEX idx_hotels_name ON hotels (name);

-- Index cho hotel location filtering (quan trọng cho search by location)
CREATE INDEX idx_hotels_country_province_city ON hotels (country_id, province_id, city_id);
CREATE INDEX idx_hotels_district_ward ON hotels (district_id, ward_id);

-- Index cho hotel geo-location queries
CREATE INDEX idx_hotels_lat_lng ON hotels (latitude, longitude);

-- Index cho hotel status filtering
CREATE INDEX idx_hotels_status ON hotels (status);

-- Index cho partner hotels lookup
CREATE INDEX idx_hotels_partner_id ON hotels (partner_id);

-- Index cho hotel star rating filtering
CREATE INDEX idx_hotels_star_rating ON hotels (star_rating);

-- Composite index cho hotel search queries (reduced columns to avoid key length limit)
CREATE INDEX idx_hotels_status_country ON hotels (status, country_id);
CREATE INDEX idx_hotels_status_province ON hotels (status, province_id);
CREATE INDEX idx_hotels_country_city ON hotels (country_id, city_id);

-- ===================================================================
-- ROOM RELATED INDEXES
-- ===================================================================

-- Index cho rooms by hotel
CREATE INDEX idx_rooms_hotel_id ON rooms (hotel_id);

-- Index cho room filtering by capacity
CREATE INDEX idx_rooms_max_adults_children ON rooms (max_adults, max_children);

-- Index cho room price filtering
CREATE INDEX idx_rooms_base_price ON rooms (base_price_per_night);

-- Index cho room status filtering
CREATE INDEX idx_rooms_status ON rooms (status);

-- Index cho room amenities filtering
CREATE INDEX idx_rooms_wifi_breakfast_smoking ON rooms (wifi_available, breakfast_included, smoking_allowed);

-- Composite index cho room availability queries
CREATE INDEX idx_rooms_hotel_status ON rooms (hotel_id, status);
CREATE INDEX idx_rooms_hotel_price ON rooms (hotel_id, base_price_per_night);

-- ===================================================================
-- ROOM INVENTORY INDEXES (Critical for availability checking)
-- ===================================================================

-- Index cho room inventory by date range (quan trọng nhất cho booking system)
CREATE INDEX idx_room_inventories_room_date ON room_inventories (room_id, date);

-- Index cho available rooms filtering
CREATE INDEX idx_room_inventories_available_status ON room_inventories (available_rooms, status);

-- Index cho price filtering by date
CREATE INDEX idx_room_inventories_date_price ON room_inventories (date, price);

-- Composite index cho availability queries
CREATE INDEX idx_room_inventories_status_date ON room_inventories (status, date);
CREATE INDEX idx_room_inventories_date_available ON room_inventories (date, available_rooms);

-- ===================================================================
-- BOOKING RELATED INDEXES
-- ===================================================================

-- Index cho user bookings lookup
CREATE INDEX idx_bookings_user_id ON bookings (user_id);

-- Index cho hotel bookings lookup
CREATE INDEX idx_bookings_hotel_id ON bookings (hotel_id);

-- Index cho room bookings lookup
CREATE INDEX idx_bookings_room_id ON bookings (room_id);

-- Index cho booking date range queries
CREATE INDEX idx_bookings_checkin_checkout ON bookings (check_in_date, check_out_date);

-- Index cho booking status filtering
CREATE INDEX idx_bookings_status ON bookings (status);

-- Index cho booking created date (for recent bookings)
CREATE INDEX idx_bookings_created_at ON bookings (created_at);

-- Composite index cho booking conflicts checking
CREATE INDEX idx_bookings_room_status ON bookings (room_id, status);
CREATE INDEX idx_bookings_room_checkin ON bookings (room_id, check_in_date);
CREATE INDEX idx_bookings_room_checkout ON bookings (room_id, check_out_date);

-- ===================================================================
-- PAYMENT RELATED INDEXES
-- ===================================================================

-- Index cho payment by booking
CREATE INDEX idx_payments_booking_id ON payments (booking_id);

-- Index cho payment status filtering
CREATE INDEX idx_payments_status ON payments (status);

-- Index cho transaction ID lookup
CREATE INDEX idx_payments_transaction_id ON payments (transaction_id);

-- Index cho payment method filtering
CREATE INDEX idx_payments_payment_method ON payments (payment_method);

-- Index cho payment completion date
CREATE INDEX idx_payments_completed_at ON payments (completed_at);

-- ===================================================================
-- REVIEW RELATED INDEXES
-- ===================================================================

-- Index cho hotel reviews lookup
CREATE INDEX idx_reviews_hotel_id ON reviews (hotel_id);

-- Index cho user reviews lookup
CREATE INDEX idx_reviews_user_id ON reviews (user_id);

-- Index cho booking reviews lookup
CREATE INDEX idx_reviews_booking_id ON reviews (booking_id);

-- Index cho review score filtering
CREATE INDEX idx_reviews_score ON reviews (score);

-- Index cho recent reviews
CREATE INDEX idx_reviews_created_at ON reviews (created_at);

-- Composite index cho hotel review statistics
CREATE INDEX idx_reviews_hotel_score_date ON reviews (hotel_id, score, created_at);

-- ===================================================================
-- LOCATION HIERARCHY INDEXES
-- ===================================================================

-- Index cho province by country
CREATE INDEX idx_provinces_country_id ON provinces (country_id);

-- Index cho city by province
CREATE INDEX idx_cities_province_id ON cities (province_id);

-- Index cho district by city
CREATE INDEX idx_districts_city_id ON districts (city_id);

-- Index cho ward by district
CREATE INDEX idx_wards_district_id ON wards (district_id);

-- Index cho street by ward
CREATE INDEX idx_streets_ward_id ON streets (ward_id);

-- Index cho location names (for search)
CREATE INDEX idx_countries_name ON countries (name);
CREATE INDEX idx_provinces_name ON provinces (name);
CREATE INDEX idx_cities_name ON cities (name);
CREATE INDEX idx_districts_name ON districts (name);
CREATE INDEX idx_wards_name ON wards (name);

-- ===================================================================
-- AMENITY RELATED INDEXES
-- ===================================================================

-- Index cho amenity by category
CREATE INDEX idx_amenities_category_id ON amenities (amenity_category_id);

-- Index cho free amenities filtering
CREATE INDEX idx_amenities_free ON amenities (free);

-- Index cho hotel amenities
CREATE INDEX idx_hotel_amenities_hotel_id ON hotel_amenities (hotel_id);
CREATE INDEX idx_hotel_amenities_amenity_id ON hotel_amenities (amenity_id);

-- Index cho room amenities
CREATE INDEX idx_room_amenities_room_id ON room_amenities (room_id);
CREATE INDEX idx_room_amenities_amenity_id ON room_amenities (amenity_id);

-- ===================================================================
-- DISCOUNT RELATED INDEXES
-- ===================================================================

-- Index cho discount code lookup
CREATE INDEX idx_discounts_code ON discounts (code);

-- Index cho active discounts
CREATE INDEX idx_discounts_active ON discounts (active);

-- Index cho discount validity period
CREATE INDEX idx_discounts_valid_from_to ON discounts (valid_from, valid_to);

-- Index cho discount usage tracking
CREATE INDEX idx_discounts_usage_limit_used ON discounts (usage_limit, times_used);

-- Index cho hotel discounts
CREATE INDEX idx_hotel_discounts_hotel_id ON hotel_discounts (hotel_id);
CREATE INDEX idx_hotel_discounts_discount_id ON hotel_discounts (discount_id);

-- ===================================================================
-- PHOTO RELATED INDEXES
-- ===================================================================

-- Index cho hotel photos
CREATE INDEX idx_hotel_photos_hotel_id ON hotel_photos (hotel_id);
CREATE INDEX idx_hotel_photos_photo_id ON hotel_photos (photo_id);

-- Index cho room photos  
CREATE INDEX idx_room_photos_room_id ON room_photos (room_id);
CREATE INDEX idx_room_photos_photo_id ON room_photos (photo_id);

-- Index cho review photos
CREATE INDEX idx_review_photos_review_id ON review_photos (review_id);
CREATE INDEX idx_review_photos_photo_id ON review_photos (photo_id);

-- Index cho photo categories
CREATE INDEX idx_photos_category_id ON photos (photo_category_id);

-- ===================================================================
-- POLICY RELATED INDEXES
-- ===================================================================

-- Index cho hotel policies
CREATE INDEX idx_hotel_policies_hotel_id ON hotel_policies (hotel_id);

-- Index cho cancellation policies on rooms
CREATE INDEX idx_rooms_cancellation_policy_id ON rooms (cancellation_policy_id);

-- Index cho reschedule policies on rooms
CREATE INDEX idx_rooms_reschedule_policy_id ON rooms (reschedule_policy_id);

-- ===================================================================
-- SPECIAL DAY & ENTERTAINMENT VENUE INDEXES
-- ===================================================================

-- Index cho special days by date
CREATE INDEX idx_special_days_date ON special_days (date);

-- Index cho entertainment venues by category
CREATE INDEX idx_entertainment_venues_category_id ON entertainment_venues (entertainment_venue_category_id);

-- Index cho hotel entertainment venues
CREATE INDEX idx_hotel_entertainment_venues_hotel_id ON hotel_entertainment_venues (hotel_id);
CREATE INDEX idx_hotel_entertainment_venues_venue_id ON hotel_entertainment_venues (entertainment_venue_id);

-- ===================================================================
-- PERFORMANCE CRITICAL COMPOSITE INDEXES
-- ===================================================================

-- Hotel search với multiple criteria (split to avoid key length limit)
CREATE INDEX idx_hotel_search_status_country ON hotels (status, country_id, star_rating);
CREATE INDEX idx_hotel_search_location_rating ON hotels (province_id, city_id, star_rating);

-- Room availability search composite (optimized for key length)
CREATE INDEX idx_room_availability_date_status ON room_inventories (date, status, available_rooms);

-- Booking conflict detection composite (split for better performance)
CREATE INDEX idx_booking_conflict_room_dates ON bookings (room_id, check_in_date, check_out_date);

-- User activity tracking composite
CREATE INDEX idx_user_activity_composite ON bookings (user_id, status, created_at);

-- Hotel performance metrics composite
CREATE INDEX idx_hotel_metrics_composite ON reviews (hotel_id, created_at, score);

-- Revenue tracking composite
CREATE INDEX idx_revenue_tracking_composite ON payments (status, completed_at, amount);

COMMIT;
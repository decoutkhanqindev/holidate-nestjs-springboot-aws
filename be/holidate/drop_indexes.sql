-- ===================================================================
-- HOLIDATE DATABASE INDEXES ROLLBACK SCRIPT
-- Script để xóa tất cả indexes đã tạo (rollback)
-- ===================================================================

-- ===================================================================
-- DROP USER RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_users_email ON users;
DROP INDEX IF EXISTS idx_users_phone_number ON users;
DROP INDEX IF EXISTS idx_users_role_id ON users;
DROP INDEX IF EXISTS idx_users_country_province_city ON users;
DROP INDEX IF EXISTS idx_user_auth_info_user_id ON user_auth_info;
DROP INDEX IF EXISTS idx_user_auth_info_auth_provider ON user_auth_info;
DROP INDEX IF EXISTS idx_user_auth_info_active ON user_auth_info;
DROP INDEX IF EXISTS idx_invalid_tokens_user_id ON invalid_tokens;

-- ===================================================================
-- DROP HOTEL RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_hotels_name ON hotels;
DROP INDEX IF EXISTS idx_hotels_country_province_city ON hotels;
DROP INDEX IF EXISTS idx_hotels_district_ward ON hotels;
DROP INDEX IF EXISTS idx_hotels_lat_lng ON hotels;
DROP INDEX IF EXISTS idx_hotels_status ON hotels;
DROP INDEX IF EXISTS idx_hotels_partner_id ON hotels;
DROP INDEX IF EXISTS idx_hotels_star_rating ON hotels;
DROP INDEX IF EXISTS idx_hotels_status_country ON hotels;
DROP INDEX IF EXISTS idx_hotels_status_province ON hotels;
DROP INDEX IF EXISTS idx_hotels_country_city ON hotels;

-- ===================================================================
-- DROP ROOM RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_rooms_hotel_id ON rooms;
DROP INDEX IF EXISTS idx_rooms_max_adults_children ON rooms;
DROP INDEX IF EXISTS idx_rooms_base_price ON rooms;
DROP INDEX IF EXISTS idx_rooms_status ON rooms;
DROP INDEX IF EXISTS idx_rooms_wifi_breakfast_smoking ON rooms;
DROP INDEX IF EXISTS idx_rooms_hotel_status ON rooms;
DROP INDEX IF EXISTS idx_rooms_hotel_price ON rooms;

-- ===================================================================
-- DROP ROOM INVENTORY INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_room_inventories_room_date ON room_inventories;
DROP INDEX IF EXISTS idx_room_inventories_available_status ON room_inventories;
DROP INDEX IF EXISTS idx_room_inventories_date_price ON room_inventories;
DROP INDEX IF EXISTS idx_room_inventories_status_date ON room_inventories;
DROP INDEX IF EXISTS idx_room_inventories_date_available ON room_inventories;

-- ===================================================================
-- DROP BOOKING RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_bookings_user_id ON bookings;
DROP INDEX IF EXISTS idx_bookings_hotel_id ON bookings;
DROP INDEX IF EXISTS idx_bookings_room_id ON bookings;
DROP INDEX IF EXISTS idx_bookings_checkin_checkout ON bookings;
DROP INDEX IF EXISTS idx_bookings_status ON bookings;
DROP INDEX IF EXISTS idx_bookings_created_at ON bookings;
DROP INDEX IF EXISTS idx_bookings_room_status ON bookings;
DROP INDEX IF EXISTS idx_bookings_room_checkin ON bookings;
DROP INDEX IF EXISTS idx_bookings_room_checkout ON bookings;

-- ===================================================================
-- DROP PAYMENT RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_payments_booking_id ON payments;
DROP INDEX IF EXISTS idx_payments_status ON payments;
DROP INDEX IF EXISTS idx_payments_transaction_id ON payments;
DROP INDEX IF EXISTS idx_payments_payment_method ON payments;
DROP INDEX IF EXISTS idx_payments_completed_at ON payments;

-- ===================================================================
-- DROP REVIEW RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_reviews_hotel_id ON reviews;
DROP INDEX IF EXISTS idx_reviews_user_id ON reviews;
DROP INDEX IF EXISTS idx_reviews_booking_id ON reviews;
DROP INDEX IF EXISTS idx_reviews_score ON reviews;
DROP INDEX IF EXISTS idx_reviews_created_at ON reviews;
DROP INDEX IF EXISTS idx_reviews_hotel_score_date ON reviews;

-- ===================================================================
-- DROP LOCATION HIERARCHY INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_provinces_country_id ON provinces;
DROP INDEX IF EXISTS idx_cities_province_id ON cities;
DROP INDEX IF EXISTS idx_districts_city_id ON districts;
DROP INDEX IF EXISTS idx_wards_district_id ON wards;
DROP INDEX IF EXISTS idx_streets_ward_id ON streets;
DROP INDEX IF EXISTS idx_countries_name ON countries;
DROP INDEX IF EXISTS idx_provinces_name ON provinces;
DROP INDEX IF EXISTS idx_cities_name ON cities;
DROP INDEX IF EXISTS idx_districts_name ON districts;
DROP INDEX IF EXISTS idx_wards_name ON wards;

-- ===================================================================
-- DROP AMENITY RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_amenities_category_id ON amenities;
DROP INDEX IF EXISTS idx_amenities_free ON amenities;
DROP INDEX IF EXISTS idx_hotel_amenities_hotel_id ON hotel_amenities;
DROP INDEX IF EXISTS idx_hotel_amenities_amenity_id ON hotel_amenities;
DROP INDEX IF EXISTS idx_room_amenities_room_id ON room_amenities;
DROP INDEX IF EXISTS idx_room_amenities_amenity_id ON room_amenities;

-- ===================================================================
-- DROP DISCOUNT RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_discounts_code ON discounts;
DROP INDEX IF EXISTS idx_discounts_active ON discounts;
DROP INDEX IF EXISTS idx_discounts_valid_from_to ON discounts;
DROP INDEX IF EXISTS idx_discounts_usage_limit_used ON discounts;
DROP INDEX IF EXISTS idx_hotel_discounts_hotel_id ON hotel_discounts;
DROP INDEX IF EXISTS idx_hotel_discounts_discount_id ON hotel_discounts;

-- ===================================================================
-- DROP PHOTO RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_hotel_photos_hotel_id ON hotel_photos;
DROP INDEX IF EXISTS idx_hotel_photos_photo_id ON hotel_photos;
DROP INDEX IF EXISTS idx_room_photos_room_id ON room_photos;
DROP INDEX IF EXISTS idx_room_photos_photo_id ON room_photos;
DROP INDEX IF EXISTS idx_review_photos_review_id ON review_photos;
DROP INDEX IF EXISTS idx_review_photos_photo_id ON review_photos;
DROP INDEX IF EXISTS idx_photos_category_id ON photos;

-- ===================================================================
-- DROP POLICY RELATED INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_hotel_policies_hotel_id ON hotel_policies;
DROP INDEX IF EXISTS idx_rooms_cancellation_policy_id ON rooms;
DROP INDEX IF EXISTS idx_rooms_reschedule_policy_id ON rooms;

-- ===================================================================
-- DROP SPECIAL DAY & ENTERTAINMENT VENUE INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_special_days_date ON special_days;
DROP INDEX IF EXISTS idx_entertainment_venues_category_id ON entertainment_venues;
DROP INDEX IF EXISTS idx_hotel_entertainment_venues_hotel_id ON hotel_entertainment_venues;
DROP INDEX IF EXISTS idx_hotel_entertainment_venues_venue_id ON hotel_entertainment_venues;

-- ===================================================================
-- DROP PERFORMANCE CRITICAL COMPOSITE INDEXES
-- ===================================================================

DROP INDEX IF EXISTS idx_hotel_search_status_country ON hotels;
DROP INDEX IF EXISTS idx_hotel_search_location_rating ON hotels;
DROP INDEX IF EXISTS idx_room_availability_date_status ON room_inventories;
DROP INDEX IF EXISTS idx_booking_conflict_room_dates ON bookings;
DROP INDEX IF EXISTS idx_user_activity_composite ON bookings;
DROP INDEX IF EXISTS idx_hotel_metrics_composite ON reviews;
DROP INDEX IF EXISTS idx_revenue_tracking_composite ON payments;

COMMIT;
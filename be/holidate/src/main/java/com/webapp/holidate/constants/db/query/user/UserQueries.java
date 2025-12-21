package com.webapp.holidate.constants.db.query.user;

public class UserQueries {

  // Base query for finding users with all relations
  public static final String FIND_ALL_WITH_DETAILS_BASE = "SELECT DISTINCT u FROM User u " +
    "LEFT JOIN FETCH u.role " +
    "LEFT JOIN FETCH u.country " +
    "LEFT JOIN FETCH u.province " +
    "LEFT JOIN FETCH u.city " +
    "LEFT JOIN FETCH u.district " +
    "LEFT JOIN FETCH u.ward " +
    "LEFT JOIN FETCH u.street " +
    "LEFT JOIN FETCH u.authInfo ";

  // Find all users with filters and pagination
  public static final String FIND_ALL_WITH_FILTERS_PAGED = FIND_ALL_WITH_DETAILS_BASE +
    "WHERE " +
    "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) " +
    "AND (:fullName IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) " +
    "AND (:phoneNumber IS NULL OR u.phoneNumber LIKE CONCAT('%', :phoneNumber, '%')) " +
    "AND (:roleId IS NULL OR u.role.id = :roleId) " +
    "AND (:gender IS NULL OR u.gender = :gender) " +
    "AND (:countryId IS NULL OR u.country.id = :countryId) " +
    "AND (:provinceId IS NULL OR u.province.id = :provinceId) " +
    "AND (:cityId IS NULL OR u.city.id = :cityId) " +
    "AND (:districtId IS NULL OR u.district.id = :districtId) " +
    "AND (:wardId IS NULL OR u.ward.id = :wardId) " +
    "AND (:streetId IS NULL OR u.street.id = :streetId) " +
    "AND (:active IS NULL OR u.authInfo.active = :active) " +
    "AND (:authProvider IS NULL OR u.authInfo.authProvider = :authProvider) " +
    "AND (:createdFrom IS NULL OR u.createdAt >= :createdFrom) " +
    "AND (:createdTo IS NULL OR u.createdAt <= :createdTo)";

  // Find user by ID with all relations
  public static final String FIND_BY_ID_WITH_DETAILS = FIND_ALL_WITH_DETAILS_BASE +
    "WHERE u.id = :id";
}


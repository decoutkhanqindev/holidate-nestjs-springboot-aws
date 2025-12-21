package com.webapp.holidate.repository.user;

import com.webapp.holidate.constants.db.query.DashboardQueries;
import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.constants.db.query.user.UserQueries;
import com.webapp.holidate.entity.user.User;
import io.micrometer.common.lang.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
  boolean existsByFullName(String fullName);

  Optional<User> findByEmail(String email);

  long countByRoleId(String roleId);

  // Get total user counts by role
  @Query(value = ReportQueries.GET_TOTAL_USER_COUNTS, nativeQuery = true)
  List<Object[]> getTotalUserCounts(String customerRoleName, String partnerRoleName);
  
  // ============ ADMIN DASHBOARD QUERIES ============
  
  /**
   * Count new users (customers) registered today
   */
  @Query(DashboardQueries.COUNT_NEW_USERS_TODAY)
  long countNewUsersToday(String roleName);
  
  /**
   * Count new partners registered today
   */
  @Query(DashboardQueries.COUNT_NEW_PARTNERS_TODAY)
  long countNewPartnersToday(String roleName);

  // ============ USER FILTERING AND PAGINATION ============

  /**
   * Find all users with filters and pagination
   */
  @Query(UserQueries.FIND_ALL_WITH_FILTERS_PAGED)
  Page<User> findAllWithFiltersPaged(
    @Nullable String email,
    @Nullable String fullName,
    @Nullable String phoneNumber,
    @Nullable String roleId,
    @Nullable String gender,
    @Nullable String countryId,
    @Nullable String provinceId,
    @Nullable String cityId,
    @Nullable String districtId,
    @Nullable String wardId,
    @Nullable String streetId,
    @Nullable Boolean active,
    @Nullable String authProvider,
    @Nullable LocalDateTime createdFrom,
    @Nullable LocalDateTime createdTo,
    Pageable pageable);

  /**
   * Find user by ID with all relations
   */
  @Query(UserQueries.FIND_BY_ID_WITH_DETAILS)
  Optional<User> findByIdWithDetails(String id);
}

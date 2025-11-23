package com.webapp.holidate.repository.user;

import com.webapp.holidate.constants.db.query.DashboardQueries;
import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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
}

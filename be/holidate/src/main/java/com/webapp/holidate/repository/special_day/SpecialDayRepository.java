package com.webapp.holidate.repository.special_day;

import com.webapp.holidate.constants.db.query.booking.HolidayQueries;
import com.webapp.holidate.entity.special_day.SpecialDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SpecialDayRepository extends JpaRepository<SpecialDay, String> {
  @Query(HolidayQueries.FIND_ALL_BY_DATE_BETWEEN)
  List<SpecialDay> findAllByDateBetween(LocalDate startDate, LocalDate endDate);
}
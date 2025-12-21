package com.webapp.holidate.repository.policy.resechedule;

import com.webapp.holidate.entity.policy.reschedule.RescheduleRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RescheduleRuleRepository extends JpaRepository<RescheduleRule, String> {
}

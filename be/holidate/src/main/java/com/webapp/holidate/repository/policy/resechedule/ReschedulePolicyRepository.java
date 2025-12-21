package com.webapp.holidate.repository.policy.resechedule;

import com.webapp.holidate.entity.policy.reschedule.ReschedulePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReschedulePolicyRepository extends JpaRepository<ReschedulePolicy, String> {
}

package com.webapp.holidate.repository.policy.cancellation;

import com.webapp.holidate.entity.policy.cancelation.CancellationRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CancellationRuleRepository extends JpaRepository<CancellationRule, String> {
}
